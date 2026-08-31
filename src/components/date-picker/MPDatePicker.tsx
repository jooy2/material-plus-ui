import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { CalendarIcon } from '../../constants/icons';
import { Calendar, type MPPickerLabels } from '../../internal/Calendar';
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
  isUnitOutside,
  isValidDate,
  localeWeekStart,
  mergeDateAndTime,
  startOfMonth,
  startOfUnit,
  toISODate,
  toISOMonth,
  toISOYear,
  today,
  withPlaceholder,
  type MPDatePrecision
} from '../../internal/date';
import type { MPWeekday } from '../../types';

/**
 * Which unit a picker asks for.
 *
 * Re-exported so a caller storing the answer can name what they are holding —
 * a `'month'` picker's value is a month, and the day inside it is an artefact.
 */
export type { MPDatePrecision };

/**
 * How the trigger writes its value when the caller has not said.
 *
 * One per precision rather than one for all three, because a default that did
 * not follow it would print a part the picker never asked about: `medium` on a
 * month picker reads *Jul 1, 2026*, and that 1 is how a month is stored rather
 * than anything the reader chose. A `format` of your own still wins over all
 * three.
 */
const TRIGGER_FORMAT: Record<MPDatePrecision, Intl.DateTimeFormatOptions> = {
  day: { dateStyle: 'medium' },
  month: { year: 'numeric', month: 'long' },
  year: { year: 'numeric' }
};

/**
 * What the hidden input submits, at the precision that was asked for.
 *
 * `YYYY-MM-DD` and `YYYY-MM` are what `<input type="date">` and
 * `<input type="month">` submit. A year on its own has no input type behind it
 * and is simply `YYYY` — the same string with the parts nobody chose taken off,
 * rather than a day the server would have to know to ignore.
 */
const TO_ISO: Record<MPDatePrecision, (date: Date) => string> = {
  day: toISODate,
  month: toISOMonth,
  year: toISOYear
};

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
   * Which unit the picker asks for.
   *
   * `'month'` stops the calendar at its grid of twelve months and answers with
   * the 1st of the one that is pressed; `'year'` stops at the grid of years and
   * answers with the 1st of January. A card's expiry, a fiscal year, the month a
   * report covers — the questions where a day is not something the reader has to
   * give and the value should not pretend they did.
   *
   * The finer views are not hidden so much as absent: a month picker never draws
   * a day grid, so there is no way through it to a day. What follows the
   * precision with it is the trigger's default `format`, what the hidden input
   * submits, and the word on the footer's shortcut.
   * @default 'day'
   */
  precision?: MPDatePrecision;
  /**
   * Which month the calendar opens on when there is no value.
   * @default this month
   */
  defaultMonth?: Date;
  /**
   * The earliest day that may be chosen. Day-granular — the time is ignored.
   *
   * Read at whatever `precision` asks for: a minimum of 10 July still leaves
   * July pickable on a month picker, because there the bound is about which
   * months exist.
   */
  minDate?: Date | null;
  /** The latest day that may be chosen. */
  maxDate?: Date | null;
  /**
   * Blocks individual days that are inside the range but still not available —
   * weekends, holidays, a room that is already booked.
   *
   * Asked about days and only about days, so a picker whose `precision` is a
   * month or a year never consults it: a rule written about weekends has no
   * answer for "is July available", and inventing one out of the 1st would block
   * whichever months happened to start on a Sunday.
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
   *
   * Left out, it follows `precision`: a medium date, `July 2026`, or `2026`.
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
   *
   * It lands on whatever unit is being asked for, and says so: *Today*, *This
   * month* or *This year*.
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
  /**
   * Identifies the field when a form is submitted, as `YYYY-MM-DD` — or as
   * `YYYY-MM` or `YYYY` when `precision` asks for less.
   */
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
 * ## A day, a month, or a year
 *
 * `precision` decides which of the three the calendar stops at, and it stops by
 * leaving the finer views out rather than by refusing them: a month picker opens
 * on the twelve months and has no day grid to reach, a year picker opens on the
 * years. Everything downstream follows — how the trigger writes the value, what
 * a form submits, and whether the footer's shortcut says *Today* or *This year*.
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
      precision = 'day',
      defaultMonth,
      minDate,
      maxDate,
      shouldDisableDate,
      locale: localeProp,
      weekStartsOn,
      format,
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
    const labels = useMPMessages(PICKER, locale, labelOverrides);
    const firstDay = weekStartsOn ?? localeWeekStart(locale);
    const display = format ?? TRIGGER_FORMAT[precision];

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
      // Trimmed to the unit that was asked for, so a month picker's value is the
      // month rather than whichever day the shortcut happened to arrive on. The
      // grids already hand over the 1st; `Today` does not.
      const at = startOfUnit(date, precision);
      // The unit changes; the time of day, if the value had one, does not. A date
      // picker bound to a field that also carries a time should not silently
      // reset it to midnight every time the day is corrected.
      const next = isValidDate(value) ? mergeDateAndTime(at, value) : at;

      commit(next);
      setMonth(startOfMonth(next));

      if (closeOnSelect) {
        setOpen(false);
      }
    };

    const now = today();
    // The bounds at the precision being asked for, and `shouldDisableDate` only
    // where there are days for it to have an opinion about.
    const nowBlocked =
      isUnitOutside(now, precision, minDate, maxDate) ||
      (precision === 'day' && (shouldDisableDate?.(now) ?? false));
    const nowLabel =
      precision === 'year'
        ? labels.thisYear
        : precision === 'month'
          ? labels.thisMonth
          : labels.today;
    const hasFooter = showTodayButton || clearable;

    // Holds the trigger open at the width of the longest date it could show, so
    // choosing the 1st after the 28th does not shrink the field.
    const samples = withPlaceholder(useDisplaySamples(locale, display), placeholder);

    return (
      <MPPickerShell
        {...shell}
        slug="date-picker"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        triggerRef={ref}
        startIcon={
          startIcon === undefined ? (
            <MPIcon icon={CalendarIcon} size={CONTROL_ICON[size]} />
          ) : (
            startIcon
          )
        }
        display={isValidDate(value) ? formatDate(value, locale, display) : (placeholder ?? '')}
        samples={samples}
        empty={!isValidDate(value)}
        clearable={clearable}
        onClear={() => commit(null)}
        open={open}
        onOpenChange={setOpen}
        labels={labels}
        hiddenValues={
          name ? [{ name, value: isValidDate(value) ? TO_ISO[precision](value) : '' }] : undefined
        }
      >
        <div className={`flex flex-col ${hasFooter ? 'gap-1.5' : ''}`}>
          <Calendar
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
            precision={precision}
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
                  disabled={nowBlocked}
                  onClick={() => select(now)}
                >
                  {nowLabel}
                </MPButton>
              ) : null}
            </MPPickerFooter>
          ) : null}
        </div>
      </MPPickerShell>
    );
  }
);
