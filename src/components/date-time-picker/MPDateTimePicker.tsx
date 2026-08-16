import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { CalendarIcon } from '../../constants/icons';
import { MPCalendar, MPTimeGrid, type MPPickerLabels } from '../../internal/Calendar';
import {
  FOOTER_SIZE,
  MPPickerDivider,
  MPPickerFooter,
  MPPickerShell,
  useDisplaySamples,
  type MPPickerShellProps
} from '../../internal/Picker';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { CONTROL_ICON } from '../../internal/scale';
import {
  formatDate,
  isDayOutside,
  isHour12,
  isValidDate,
  localeWeekStart,
  mergeDateAndTime,
  startOfDay,
  startOfMonth,
  timeUnitSpan,
  toISODateTime,
  today,
  withPlaceholder,
  withTime,
  type MPTimeUnit
} from '../../internal/date';
import type { MPWeekday } from '../../types';

export interface MPDateTimePickerProps extends MPPickerShellProps {
  /** The chosen moment. Use with `onValueChange` for a controlled picker. */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which month the calendar opens on when there is no value. */
  defaultMonth?: Date;
  /**
   * The earliest moment that may be chosen.
   *
   * Unlike `MPDatePicker`'s, this one is read at **full precision**: the day it
   * falls on stays available in the calendar and the clock's columns block the
   * hours before it. That is what a "not before now" rule needs, and it is what
   * a day-granular check cannot give.
   */
  minDate?: Date | null;
  /** The latest moment that may be chosen, likewise at full precision. */
  maxDate?: Date | null;
  shouldDisableDate?: (date: Date) => boolean;
  shouldDisableTime?: (value: Date, unit: MPTimeUnit) => boolean;
  /**
   * A BCP 47 tag deciding every name and number the picker draws. Falls back to
   * the nearest `MPLocaleProvider`, then to the platform's own.
   */
  locale?: string;
  weekStartsOn?: MPWeekday;
  /**
   * How the trigger writes the chosen moment. Passed straight to `Intl`.
   * @default { dateStyle: 'medium', timeStyle: 'short' }
   */
  format?: Intl.DateTimeFormatOptions;
  /** A 12-hour dial with an AM/PM column. Defaults to whatever the locale does. */
  hour12?: boolean;
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  /**
   * Offers the shortcut to this moment in the footer.
   * @default true
   */
  showNowButton?: boolean;
  /**
   * Closes the popup as soon as a day is chosen.
   *
   * `false` here and `true` on `MPDatePicker`, because a moment is a day *and* a
   * time and closing on the first of the two would leave the second unanswered.
   * @default false
   */
  closeOnSelect?: boolean;
  labels?: Partial<MPPickerLabels>;
  /** Identifies the field when a form is submitted, as `YYYY-MM-DDTHH:MM`. */
  name?: string;
}

/**
 * A day and a time, in one popup.
 *
 * Not a date picker that grew a clock and not a time picker that grew a
 * calendar: the two panels sit side by side at exactly the same height — seven
 * rows of cells each, which is why the calendar's grid and the clock's columns
 * share the `--_mp-cell` ladder — so the popup is one rectangle rather than two
 * of different sizes pushed together.
 *
 * The bounds do more work here than anywhere else. `minDate` is read at full
 * precision, so a minimum of 09:30 on the 27th leaves the 27th selectable in the
 * calendar and greys out the morning in the clock.
 */
export const MPDateTimePicker = React.forwardRef<HTMLButtonElement, MPDateTimePickerProps>(
  function MPDateTimePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      defaultMonth,
      minDate,
      maxDate,
      shouldDisableDate,
      shouldDisableTime,
      locale: localeProp,
      weekStartsOn,
      format,
      hour12: hour12Prop,
      showSeconds = false,
      hourStep = 1,
      minuteStep = 1,
      secondStep = 1,
      placeholder,
      clearable = false,
      showNowButton = true,
      closeOnSelect = false,
      labels: labelOverrides,
      name,
      size = 'md',
      color = 'primary',
      readOnly = false,
      disabled = false,
      startIcon,
      ...shell
    },
    ref
  ) {
    const locale = useMPLocale(localeProp);
    const labels = useMPMessages('picker', locale, labelOverrides);
    const firstDay = weekStartsOn ?? localeWeekStart(locale);
    const hour12 = hour12Prop ?? isHour12(locale);

    const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | null>(
      defaultValue ?? null
    );
    const value = valueProp !== undefined ? valueProp : uncontrolledValue;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const open = openProp ?? uncontrolledOpen;

    const [month, setMonth] = React.useState(() =>
      startOfMonth(isValidDate(value) ? value : (defaultMonth ?? today()))
    );

    React.useEffect(() => {
      if (open) {
        setMonth(startOfMonth(isValidDate(value) ? value : (defaultMonth ?? today())));
      }
    }, [open]);

    const setOpen = (next: boolean) => {
      if (next && (readOnly || disabled)) {
        return;
      }

      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    };

    const commit = (next: Date | null) => {
      if (valueProp === undefined) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    };

    /**
     * Blocks a clock row whose whole span falls outside the bounds — the same
     * span test the time picker makes, moved onto the absolute timeline so the
     * check knows which day the columns are writing into.
     */
    const isTimeBlocked = React.useCallback(
      (candidate: Date, unit: MPTimeUnit) => {
        const [from, to] = timeUnitSpan(unit, candidate);
        const midnight = startOfDay(candidate).getTime();

        if (isValidDate(minDate) && midnight + to * 1000 < minDate.getTime()) {
          return true;
        }

        if (isValidDate(maxDate) && midnight + from * 1000 > maxDate.getTime()) {
          return true;
        }

        return shouldDisableTime?.(candidate, unit) ?? false;
      },
      [minDate, maxDate, shouldDisableTime]
    );

    const selectDay = (date: Date) => {
      // The day changes, the clock does not. A picker that reset the time to
      // midnight every time the date was corrected would make choosing a moment
      // an ordered task, and nobody reads a popup in the order it was written.
      const next = isValidDate(value) ? mergeDateAndTime(date, value) : startOfDay(date);

      commit(next);
      setMonth(startOfMonth(next));

      if (closeOnSelect) {
        setOpen(false);
      }
    };

    // `hour12` reaches the trigger as well as the clock, for the reason
    // `MPTimePicker` gives: a picker whose columns are 24-hour and whose trigger
    // still says "9:05 AM" is a control disagreeing with itself. `hour12` is one
    // of the few options `Intl` allows beside `dateStyle`/`timeStyle`.
    const displayFormat: Intl.DateTimeFormatOptions = format ?? {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12
    };

    const moment = new Date();
    const nowValue = withTime(moment, { seconds: showSeconds ? moment.getSeconds() : 0 });
    const nowBlocked =
      isDayOutside(nowValue, minDate, maxDate) ||
      (shouldDisableDate?.(nowValue) ?? false) ||
      isTimeBlocked(nowValue, 'second');

    // Holds the trigger open at the width of the longest moment it could show.
    const samples = withPlaceholder(useDisplaySamples(locale, displayFormat), placeholder);

    return (
      <MPPickerShell
        {...shell}
        slug="date-time-picker"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        triggerRef={ref}
        // The calendar glyph alone, not both: a control cannot say two things at
        // once, and the date is the part a reader scans for.
        startIcon={
          startIcon === undefined ? (
            <MPIcon icon={CalendarIcon} size={CONTROL_ICON[size]} />
          ) : (
            startIcon
          )
        }
        display={
          isValidDate(value) ? formatDate(value, locale, displayFormat) : (placeholder ?? '')
        }
        samples={samples}
        empty={!isValidDate(value)}
        clearable={clearable}
        onClear={() => commit(null)}
        open={open}
        onOpenChange={setOpen}
        labels={labels}
        hiddenValues={
          name
            ? [{ name, value: isValidDate(value) ? toISODateTime(value, showSeconds) : '' }]
            : undefined
        }
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-stretch gap-2">
            <MPCalendar
              size={size}
              color={color}
              locale={locale}
              weekStartsOn={firstDay}
              month={month}
              onMonthChange={setMonth}
              selected={[value]}
              onSelect={selectDay}
              minDate={minDate}
              maxDate={maxDate}
              shouldDisableDate={shouldDisableDate}
              labels={labels}
              autoFocus
            />

            <MPPickerDivider />

            <MPTimeGrid
              size={size}
              locale={locale}
              value={isValidDate(value) ? value : null}
              // With no day chosen yet the clock writes onto today, and picking a
              // day afterwards keeps whatever time was set.
              referenceDate={isValidDate(value) ? value : today()}
              onChange={commit}
              hour12={hour12}
              showSeconds={showSeconds}
              hourStep={hourStep}
              minuteStep={minuteStep}
              secondStep={secondStep}
              shouldDisableTime={isTimeBlocked}
              labels={labels}
            />
          </div>

          <MPPickerFooter>
            {clearable ? (
              <MPButton
                variant="text"
                size={FOOTER_SIZE[size]}
                color={color}
                onClick={() => {
                  commit(null);
                  setOpen(false);
                }}
              >
                {labels.clear}
              </MPButton>
            ) : null}
            {showNowButton ? (
              <MPButton
                variant="text"
                size={FOOTER_SIZE[size]}
                color={color}
                disabled={nowBlocked}
                onClick={() => {
                  commit(nowValue);
                  setMonth(startOfMonth(nowValue));
                }}
              >
                {labels.now}
              </MPButton>
            ) : null}
            <MPButton
              variant="filled"
              size={FOOTER_SIZE[size]}
              color={color}
              onClick={() => setOpen(false)}
            >
              {labels.done}
            </MPButton>
          </MPPickerFooter>
        </div>
      </MPPickerShell>
    );
  }
);
