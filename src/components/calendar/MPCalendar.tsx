import * as React from 'react';
import { Calendar } from '../../internal/Calendar';
import { accentSlots } from '../../internal/accent';
import { POPUP_PAD } from '../../internal/Picker';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { PICKER } from '../../internal/messages/picker';
import { CONTAINER_SURFACE } from '../../internal/surface';
import {
  isValidDate,
  localeWeekStart,
  mergeDateAndTime,
  startOfMonth,
  startOfUnit,
  toISODate,
  toISOMonth,
  toISOYear,
  today,
  type MPDatePrecision
} from '../../internal/date';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPPickerLabels } from '../../internal/Calendar';
import type { MPColor, MPSize, MPVariant, MPWeekday } from '../../types';

export type { MPDatePrecision };

/**
 * What the hidden input submits, at the precision that was asked for. The same
 * three as `MPDatePicker`'s, and the same table, because a calendar and a picker
 * that submitted the same day two different ways would be two answers to one
 * question.
 */
const TO_ISO: Record<MPDatePrecision, (date: Date) => string> = {
  day: toISODate,
  month: toISOMonth,
  year: toISOYear
};

export interface MPCalendarProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'onSelect' | 'defaultValue' | 'color'
> {
  /** The chosen day. Use with `onValueChange` for a controlled calendar. */
  value?: Date | null;
  /** The day the calendar starts on, for an uncontrolled one. */
  defaultValue?: Date | null;
  /**
   * Called with the newly chosen day — a `Date`, not an event.
   *
   * Never `null`, unlike `MPDatePicker`'s: there is no × on a calendar and
   * pressing the chosen day again does not unchoose it. A control that emptied
   * itself on a second press would lose a value to a double-click.
   */
  onValueChange?: (value: Date) => void;
  /**
   * The month on screen. Use with `onMonthChange` to drive the header yourself —
   * two calendars kept a month apart, a "jump to December" button of your own.
   */
  month?: Date;
  /**
   * Which month it opens on.
   * @default the month of `value`, or this month
   */
  defaultMonth?: Date;
  /** Called when the header steps, or when choosing a month or a year moves it. */
  onMonthChange?: (month: Date) => void;
  /**
   * Which unit the calendar stops at, and therefore what a press answers with.
   *
   * `'month'` never draws a day grid and answers with the 1st of the month
   * pressed; `'year'` stops at the grid of years and answers with 1 January. The
   * finer views are absent rather than refused — there is no way through a month
   * calendar to a day.
   * @default 'day'
   */
  precision?: MPDatePrecision;
  /** The earliest day that may be chosen. Day-granular — the time is ignored. */
  minDate?: Date | null;
  /** The latest day that may be chosen. */
  maxDate?: Date | null;
  /**
   * Blocks individual days that are inside the range but still not available —
   * weekends, holidays, a room already booked. A blocked day is still drawn.
   *
   * Asked about days and only about days, so a calendar whose `precision` is a
   * month or a year never consults it.
   */
  shouldDisableDate?: (date: Date) => boolean;
  /**
   * A BCP 47 tag deciding the month and weekday names, the order of the header's
   * two buttons, and which day the week starts on. Falls back to the nearest
   * `MPLocaleProvider`, then to the platform's own.
   */
  locale?: string;
  /** Which day the week starts on. Defaults to whatever the locale says. */
  weekStartsOn?: MPWeekday;
  /**
   * Draws the leading and trailing days belonging to the neighbouring months.
   * @default true
   */
  showOutsideDays?: boolean;
  /**
   * Whether the header offers its two steppers.
   * @default true
   */
  showPreviousButton?: boolean;
  /** @default true */
  showNextButton?: boolean;
  /**
   * Takes the focus on mount.
   *
   * `false` here and `true` inside a picker, which is the whole difference
   * between the two: a popup that has just opened is the reader's current
   * business, and a calendar sitting in a page is not. One that grabbed the
   * focus on mount would move the caret out of whatever was being typed above
   * it.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * How much surface the calendar paints under itself.
   *
   * `'text'` — nothing — is the default, and it is the one that makes the
   * component droppable. A standalone calendar almost always lands somewhere
   * that is already a surface: an `MPCard`, a panel, a popover of your own. A
   * default that painted a second one would be a box inside a box in the common
   * case, and the only way out of a painted surface is an override.
   * @default 'text'
   */
  variant?: MPVariant;
  /**
   * The cell size and the type scale. The same ladder every control is on, so a
   * calendar beside a `size="sm"` form is drawn at the same weight.
   * @default 'md'
   */
  size?: MPSize;
  /** Which accent family the chosen day is painted in. @default 'primary' */
  color?: MPColor;
  /**
   * Overrides for the words the calendar says on its own behalf — "Previous
   * month", "Choose a year". Whatever is not given falls back to the translation
   * for `locale`, and then to English.
   */
  labels?: Partial<MPPickerLabels>;
  /**
   * Identifies the value when a form is submitted, as `YYYY-MM-DD` — or as
   * `YYYY-MM` or `YYYY` when `precision` asks for less.
   */
  name?: string;
}

/**
 * A month on the page, rather than in a popup.
 *
 * The same grid `MPDatePicker` opens, and it was always the larger half of that
 * component: three views on one footprint, a roving tab stop, arrow keys that
 * step the month when they run off an edge, and a header where the month name
 * and the year are each a button into a grid of their own. What it did not have
 * was a way to be used without a trigger in front of it.
 *
 * Which is a real shape. A booking page shows the month it is talking about
 * rather than asking the reader to open something to see it; a dashboard puts
 * the calendar beside the list it filters; a form with room for it has no reason
 * to hide it behind a field. In every one of those the popup is the part that is
 * in the way.
 *
 * ```tsx
 * const [day, setDay] = useState(new Date());
 *
 * <MPCalendar value={day} onValueChange={setDay} />;
 * ```
 *
 * ## It paints nothing by default
 *
 * `variant` is `'text'`, so what arrives is the grid and the header and no
 * surface under them — see the prop for why. Give it `'outlined'` or
 * `'elevated'` to have it stand on its own.
 *
 * ## The month on screen is its own state
 *
 * And it stays where the reader left it. `MPDatePicker` puts the calendar back
 * on the chosen day every time the popup opens, because opening is an event that
 * says "start again"; a calendar that is always on screen has no such moment,
 * and one that snapped back to July while somebody was reading September would
 * be undoing a navigation they meant.
 *
 * `month` and `onMonthChange` are there for the cases that do want to drive it.
 *
 * ## What it is not
 *
 * Not a range calendar — two ends is `MPDateRangePicker`'s question, and the
 * band it draws between them needs a preview of the half-chosen range that a
 * single value has no room for. Not an event calendar either: there is no
 * per-cell rendering hook, because a cell that could hold arbitrary content
 * stops being a 40dp target and starts being a layout.
 */
export const MPCalendar = React.forwardRef<HTMLDivElement, MPCalendarProps>(function MPCalendar(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    precision = 'day',
    minDate,
    maxDate,
    shouldDisableDate,
    locale: localeProp,
    weekStartsOn,
    showOutsideDays = true,
    showPreviousButton = true,
    showNextButton = true,
    autoFocus = false,
    variant = 'text',
    size: sizeProp,
    color: colorProp,
    labels: labelOverrides,
    name,
    className,
    style,
    ...rest
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const locale = useMPLocale(localeProp);
  const labels = useMPMessages(PICKER, locale, labelOverrides);
  const firstDay = weekStartsOn ?? localeWeekStart(locale);

  const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | null>(
    defaultValue ?? null
  );
  // `null` is a value a controlled calendar legitimately holds — an emptied form
  // — so the test is against `undefined` and never against falsiness.
  const value = valueProp !== undefined ? valueProp : uncontrolledValue;

  const [uncontrolledMonth, setUncontrolledMonth] = React.useState(() => {
    const start = valueProp ?? defaultValue;

    return startOfMonth(isValidDate(start) ? start : (defaultMonth ?? today()));
  });
  const month = monthProp !== undefined ? startOfMonth(monthProp) : uncontrolledMonth;

  const changeMonth = (next: Date) => {
    if (monthProp === undefined) {
      setUncontrolledMonth(next);
    }

    onMonthChange?.(next);
  };

  const select = (date: Date) => {
    // Trimmed to the unit that was asked for, so a month calendar's value is the
    // month rather than whichever day the grid handed over.
    const at = startOfUnit(date, precision);
    // The unit changes; the time of day, if the value had one, does not. A
    // calendar bound to a field that also carries a time should not silently
    // reset it to midnight every time the day is corrected.
    const next = isValidDate(value) ? mergeDateAndTime(at, value) : at;

    if (valueProp === undefined) {
      setUncontrolledValue(next);
    }

    onValueChange?.(next);
    changeMonth(startOfMonth(next));
  };

  return (
    <div
      {...rest}
      ref={ref}
      data-mp-size={size}
      // The four accent slots the cells read. They are declared here rather than
      // inside the grid for the reason `accent.ts` gives: a custom property's
      // `var()` is substituted at the element that declares it, so this is what
      // lets a family set on a wrapper reach the chosen day. Inside a picker the
      // shell declares them; standing alone there is no shell, and a calendar
      // that inherited nothing drew its selected cell in `transparent`.
      style={{ ...accentSlots(color), ...style }}
      className={[
        'mp-calendar-root inline-flex flex-col',
        // The room only exists once there is a surface to hold it. A `text`
        // calendar is the bare grid, and padding it would push it off the
        // alignment of whatever it was dropped beside.
        variant === 'text' ? '' : `rounded-mp-md ${POPUP_PAD[size]}`,
        CONTAINER_SURFACE[variant],
        variant === 'text' ? '' : 'text-mp-on-surface',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Calendar
        size={size}
        color={color}
        locale={locale}
        weekStartsOn={firstDay}
        month={month}
        onMonthChange={changeMonth}
        selected={[value]}
        onSelect={select}
        minDate={minDate}
        maxDate={maxDate}
        shouldDisableDate={shouldDisableDate}
        showOutsideDays={showOutsideDays}
        showPreviousButton={showPreviousButton}
        showNextButton={showNextButton}
        precision={precision}
        labels={labels}
        autoFocus={autoFocus}
      />

      {name ? (
        <input
          type="hidden"
          name={name}
          value={isValidDate(value) ? TO_ISO[precision](value) : ''}
        />
      ) : null}
    </div>
  );
});
