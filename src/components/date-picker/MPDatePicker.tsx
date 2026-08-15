import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { CalendarIcon } from '../../constants/icons';
import { MPCalendar, type MPPickerLabels } from '../../internal/Calendar';
import {
  FOOTER_SIZE,
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
  isValidDate,
  localeWeekStart,
  mergeDateAndTime,
  startOfDay,
  startOfMonth,
  toISODate,
  today,
  withPlaceholder
} from '../../internal/date';
import type { MPWeekday } from '../../types';

export interface MPDatePickerProps extends MPPickerShellProps {
  /** The chosen day. Use with `onValueChange` for a controlled picker. */
  value?: Date | null;
  /** The day the picker starts on, for an uncontrolled one. */
  defaultValue?: Date | null;
  /** Called with the newly chosen day — a `Date`, not an event. `null` when cleared. */
  onValueChange?: (value: Date | null) => void;
  /** Whether the calendar is open. Use with `onOpenChange` to control it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Which month the calendar opens on when there is no value.
   * @default this month
   */
  defaultMonth?: Date;
  /** The earliest day that may be chosen. Day-granular — the time is ignored. */
  minDate?: Date | null;
  /** The latest day that may be chosen. */
  maxDate?: Date | null;
  /**
   * Blocks individual days that are inside the range but still not available —
   * weekends, holidays, a room that is already booked.
   */
  shouldDisableDate?: (date: Date) => boolean;
  /**
   * A BCP 47 tag deciding the month and weekday names, the order of the header's
   * two buttons, which day the week starts on, and how the trigger writes the
   * date. Falls back to the nearest `MPLocaleProvider`, then to the platform's
   * own.
   */
  locale?: string;
  /** Which day the week starts on. Defaults to whatever the locale says. */
  weekStartsOn?: MPWeekday;
  /**
   * How the trigger writes the chosen date. Passed straight to `Intl`, so
   * `{ dateStyle: 'full' }` and `{ year: '2-digit', month: 'narrow' }` both work.
   *
   * An object written inline is fine: what the picker keeps between renders is
   * keyed on what the format *says*, not on the object that says it.
   * @default { dateStyle: 'medium' }
   */
  format?: Intl.DateTimeFormatOptions;
  /** Shown in the trigger while nothing is chosen. */
  placeholder?: React.ReactNode;
  /**
   * Offers the × that empties the control.
   * @default false
   */
  clearable?: boolean;
  /**
   * Offers the shortcut to today in the footer.
   * @default true
   */
  showTodayButton?: boolean;
  /**
   * Closes the popup as soon as a day is chosen.
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * Overrides for the words the picker says on its own behalf. Whatever is not
   * given falls back to the translation for `locale`, and then to English.
   */
  labels?: Partial<MPPickerLabels>;
  /** Identifies the field when a form is submitted, as `YYYY-MM-DD`. */
  name?: string;
}

/**
 * One day, chosen from a calendar.
 *
 * The trigger is a text field's shell wearing a calendar glyph, on purpose and
 * for the reason `MPSelect`'s is: a form where the date field is a different
 * height, radius or outline weight from the fields around it is a form that
 * looks assembled rather than designed.
 *
 * What the calendar is actually for is its header. A picker that only steps a
 * month at a time puts a birthday thirty years back a hundred and eighty clicks
 * away, so the month name and the year are each a button that opens a grid of
 * its own — twelve months, then twelve years at a time. Any month of the year on
 * screen is two clicks; any year at all is three. That is MD3's own docked date
 * picker, and this is drawn on MD3's own numbers: a 40dp cell, a filled circle
 * for the chosen day, an outlined one for today.
 *
 * ## Every string comes from the platform
 *
 * The month names, the weekday initials, the order of the header's two buttons
 * and the way the trigger writes the date are all `Intl`'s answers for `locale`
 * — not a bundled table. Which day the week starts on is `Intl`'s too. The only
 * words this library supplies are the ones `Intl` has no opinion about
 * ("Previous month", "Today"), and those are translated for eighteen languages
 * and overridable with `labels`.
 */
export const MPDatePicker = React.forwardRef<HTMLButtonElement, MPDatePickerProps>(
  function MPDatePicker(
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
      locale: localeProp,
      weekStartsOn,
      format = { dateStyle: 'medium' },
      placeholder,
      clearable = false,
      showTodayButton = true,
      closeOnSelect = true,
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

    const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | null>(
      defaultValue ?? null
    );
    // `null` is a value a controlled picker legitimately holds — an emptied one —
    // so the test is against `undefined` and never against falsiness.
    const value = valueProp !== undefined ? valueProp : uncontrolledValue;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const open = openProp ?? uncontrolledOpen;

    const [month, setMonth] = React.useState(() =>
      startOfMonth(isValidDate(value) ? value : (defaultMonth ?? today()))
    );

    // Opening puts the calendar back on the chosen day. Without this, a picker
    // left on 2019 while browsing stays there the next time it is opened, which
    // reads as the control having forgotten its own value.
    React.useEffect(() => {
      if (open) {
        setMonth(startOfMonth(isValidDate(value) ? value : (defaultMonth ?? today())));
      }
      // Only when the popup opens — following `value` here would drag the
      // calendar out from under someone typing into a form elsewhere on the page.
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

    const select = (date: Date) => {
      // The day changes; the time of day, if the value had one, does not. A date
      // picker bound to a field that also carries a time should not silently
      // reset it to midnight every time the day is corrected.
      const next = isValidDate(value) ? mergeDateAndTime(date, value) : startOfDay(date);

      commit(next);
      setMonth(startOfMonth(next));

      if (closeOnSelect) {
        setOpen(false);
      }
    };

    const now = today();
    const todayBlocked = isDayOutside(now, minDate, maxDate) || (shouldDisableDate?.(now) ?? false);
    const hasFooter = showTodayButton || clearable;

    // Holds the trigger open at the width of the longest date it could show, so
    // choosing the 1st after the 28th does not shrink the field.
    const samples = withPlaceholder(useDisplaySamples(locale, format), placeholder);

    return (
      <MPPickerShell
        {...shell}
        slug="date-picker"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        name={name}
        triggerRef={ref}
        startIcon={startIcon ?? <MPIcon icon={CalendarIcon} size={CONTROL_ICON[size]} />}
        display={isValidDate(value) ? formatDate(value, locale, format) : (placeholder ?? '')}
        samples={samples}
        empty={!isValidDate(value)}
        clearable={clearable}
        onClear={() => commit(null)}
        open={open}
        onOpenChange={setOpen}
        labels={labels}
        hiddenValues={
          name ? [{ name, value: isValidDate(value) ? toISODate(value) : '' }] : undefined
        }
      >
        <div className={`flex flex-col ${hasFooter ? 'gap-1.5' : ''}`}>
          <MPCalendar
            size={size}
            color={color}
            locale={locale}
            weekStartsOn={firstDay}
            month={month}
            onMonthChange={setMonth}
            selected={[value]}
            onSelect={select}
            minDate={minDate}
            maxDate={maxDate}
            shouldDisableDate={shouldDisableDate}
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
              {showTodayButton ? (
                <MPButton
                  variant="text"
                  size={FOOTER_SIZE[size]}
                  color={color}
                  disabled={todayBlocked}
                  onClick={() => select(now)}
                >
                  {labels.today}
                </MPButton>
              ) : null}
            </MPPickerFooter>
          ) : null}
        </div>
      </MPPickerShell>
    );
  }
);
