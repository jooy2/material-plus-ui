import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { ClockIcon } from '../../constants/icons';
import { MPTimeGrid, type MPPickerLabels } from '../../internal/Calendar';
import {
  FOOTER_SIZE,
  MPPickerFooter,
  MPPickerShell,
  useDisplaySamples,
  type MPPickerShellProps
} from '../../internal/Picker';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { PICKER } from '../../internal/messages/picker';
import { CONTROL_ICON } from '../../internal/scale';
import {
  formatDate,
  isHour12,
  isValidDate,
  secondsOfDay,
  timeUnitSpan,
  toISOTime,
  withPlaceholder,
  withTime,
  type MPTimeUnit
} from '../../internal/date';

/**
 * Which column of the clock a row belongs to.
 *
 * Re-exported so a caller writing a `shouldDisableTime` rule can name the
 * argument it is handed.
 */
export type { MPTimeUnit };

export interface MPTimePickerProps extends MPPickerShellProps {
  /**
   * The chosen time. A `Date`, so it carries a day as well — see
   * `referenceDate`.
   */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The day a chosen time is written onto while there is no value yet.
   * @default today
   */
  referenceDate?: Date;
  /** The earliest time of day that may be chosen. Only the clock is read. */
  minTime?: Date | null;
  /** The latest time of day that may be chosen. */
  maxTime?: Date | null;
  /**
   * Blocks individual rows. Called once per row per column with the instant that
   * row would produce and the column it is in, so a rule may be as coarse as
   * "no afternoons" or as fine as one minute.
   */
  shouldDisableTime?: (value: Date, unit: MPTimeUnit) => boolean;
  /** A 12-hour dial with an AM/PM column. Defaults to whatever the locale does. */
  hour12?: boolean;
  /**
   * Adds the seconds column.
   * @default false
   */
  showSeconds?: boolean;
  /**
   * How far apart the rows of each column are.
   *
   * Rounded, and held between 1 and the column's own span: a step of nought has
   * no number of rows at all, and one wider than the column leaves the single
   * row it can offer.
   * @default 1
   */
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  /**
   * A BCP 47 tag deciding whether the clock is 12- or 24-hour, what AM and PM
   * are called, and how the trigger writes the time. Falls back to the nearest
   * `MPLocaleProvider`, then to the platform's own.
   */
  locale?: string;
  /**
   * How the trigger writes the chosen time. Passed straight to `Intl`.
   * @default { hour: 'numeric', minute: '2-digit' }, plus seconds when shown
   */
  format?: Intl.DateTimeFormatOptions;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  /**
   * Offers the shortcut to the current time in the footer.
   * @default true
   */
  showNowButton?: boolean;
  /**
   * Closes the popup as soon as any column is touched.
   *
   * `false` by default, and unlike `MPDatePicker`: a time is two answers, and
   * closing after the first one would make choosing 9:30 a matter of opening the
   * popup twice.
   * @default false
   */
  closeOnSelect?: boolean;
  labels?: Partial<MPPickerLabels>;
  /** Identifies the field when a form is submitted, as `HH:MM` (`HH:MM:SS`). */
  name?: string;
}

/**
 * A time of day, chosen from columns.
 *
 * The bounds are checked at the granularity of the column being drawn, which is
 * the detail that separates a working time picker from a frustrating one. With a
 * `minTime` of 09:30, the hour `9` stays available — the hour *contains* allowed
 * minutes — and it is the minute column that greys out `00` through `25`. The
 * naive check compares the whole candidate instant, hides the 9 entirely, and
 * makes half past nine unreachable.
 *
 * The value is a `Date` rather than a string or a number of minutes, because
 * everything else in this library that carries a moment is one, and because a
 * time on its own has nowhere to record which day it is on — which is what
 * decides whether it crossed a daylight-saving boundary. `referenceDate` is the
 * day a bare time is written onto.
 *
 * ## Columns, not MD3's dial
 *
 * This is the one place the library knowingly draws something the specification
 * draws differently, and the reason is in `internal/Calendar.tsx` next to the
 * grid itself: a dial is a pointer control, MD3 ships a second "time input" mode
 * precisely because a dial cannot serve a keyboard, and a component with two
 * implementations of one question has the accessible one hidden behind a toggle.
 * Columns answer both readers at once, in the library's own shapes.
 */
export const MPTimePicker = React.forwardRef<HTMLButtonElement, MPTimePickerProps>(
  function MPTimePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      referenceDate,
      minTime,
      maxTime,
      shouldDisableTime,
      hour12: hour12Prop,
      showSeconds = false,
      hourStep = 1,
      minuteStep = 1,
      secondStep = 1,
      locale: localeProp,
      format,
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
    const labels = useMPMessages(PICKER, locale, labelOverrides);
    const hour12 = hour12Prop ?? isHour12(locale);

    const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | null>(
      defaultValue ?? null
    );
    const value = valueProp !== undefined ? valueProp : uncontrolledValue;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const open = openProp ?? uncontrolledOpen;

    // Held still for as long as the picker is mounted, so a popup left open
    // across midnight does not quietly move the value it is writing onto a new
    // day.
    const [fallbackDay] = React.useState(() => referenceDate ?? new Date());

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

    const isBlocked = React.useCallback(
      (candidate: Date, unit: MPTimeUnit) => {
        const [from, to] = timeUnitSpan(unit, candidate);

        if (isValidDate(minTime) && to < secondsOfDay(minTime)) {
          return true;
        }

        if (isValidDate(maxTime) && from > secondsOfDay(maxTime)) {
          return true;
        }

        return shouldDisableTime?.(candidate, unit) ?? false;
      },
      [minTime, maxTime, shouldDisableTime]
    );

    // `hour12` reaches the trigger as well as the columns. A picker whose dial
    // is 24-hour and whose trigger still says "9:05 AM" is a control disagreeing
    // with itself, and the caller who set `hour12` has already said which they
    // meant. An explicit `format` still wins over both.
    const displayFormat: Intl.DateTimeFormatOptions = format ?? {
      hour: 'numeric',
      minute: '2-digit',
      hour12,
      ...(showSeconds ? { second: '2-digit' as const } : {})
    };

    const now = new Date();
    const nowValue = withTime(referenceDate ?? fallbackDay, {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: showSeconds ? now.getSeconds() : 0
    });
    const hasFooter = showNowButton || clearable || !closeOnSelect;

    // Holds the trigger open at the width of the longest time it could show.
    const samples = withPlaceholder(useDisplaySamples(locale, displayFormat), placeholder);

    return (
      <MPPickerShell
        {...shell}
        slug="time-picker"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        triggerRef={ref}
        startIcon={
          startIcon === undefined ? (
            <MPIcon icon={ClockIcon} size={CONTROL_ICON[size]} />
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
            ? [{ name, value: isValidDate(value) ? toISOTime(value, showSeconds) : '' }]
            : undefined
        }
      >
        <div className={`flex flex-col ${hasFooter ? 'gap-1.5' : ''}`}>
          <MPTimeGrid
            size={size}
            locale={locale}
            value={isValidDate(value) ? value : null}
            referenceDate={referenceDate ?? fallbackDay}
            onChange={(next) => {
              commit(next);

              if (closeOnSelect) {
                setOpen(false);
              }
            }}
            hour12={hour12}
            showSeconds={showSeconds}
            hourStep={hourStep}
            minuteStep={minuteStep}
            secondStep={secondStep}
            shouldDisableTime={isBlocked}
            labels={labels}
            autoFocus
          />

          {hasFooter ? (
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
                  disabled={isBlocked(nowValue, 'second')}
                  onClick={() => {
                    commit(nowValue);
                    setOpen(false);
                  }}
                >
                  {labels.now}
                </MPButton>
              ) : null}
              {/* The popup stays open while the columns are being read, so there
                  has to be something to press that means "that is the one". */}
              {!closeOnSelect ? (
                <MPButton
                  variant="filled"
                  size={FOOTER_SIZE[size]}
                  color={color}
                  onClick={() => setOpen(false)}
                >
                  {labels.done}
                </MPButton>
              ) : null}
            </MPPickerFooter>
          ) : null}
        </div>
      </MPPickerShell>
    );
  }
);
