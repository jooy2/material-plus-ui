import * as React from 'react';
import { MPButton } from '../components/button/MPButton';
import { MPIcon } from '../components/icon/MPIcon';
import { MPIconButton } from '../components/icon-button/MPIconButton';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants/icons';
import { MPStateLayer } from './StateLayer';
import { CONTROL_ICON, META_TEXT, PROSE_TEXT } from './scale';
import { VISUALLY_HIDDEN } from './visually-hidden';
import {
  addDays,
  addMonths,
  addYears,
  calendarWeeks,
  compareDay,
  dateFormatter,
  daysInMonth,
  isDayOutside,
  isMonthBeforeYear,
  isSameDay,
  isSameMonth,
  isValidDate,
  makeDate,
  meridiemLabels,
  monthLabels,
  startOfDay,
  startOfMonth,
  today,
  weekdayLabels,
  withTime,
  YEAR_PAGE_SIZE,
  yearPageStart,
  type MPCalendarView,
  type MPTimeUnit
} from './date';
import type { MPMessages } from './i18n';
import type { MPColor, MPSize, MPWeekday } from '../types';

/**
 * The calendar grid and the clock columns, written once for the four pickers.
 *
 * They live in `internal/` for the reason `menu.ts` does: a date-time picker is a
 * date picker and a time picker in one popup, and a range picker is two
 * calendars, so three components need this and none of them should have to
 * import another. The two things it reaches *up* for are `MPButton` and
 * `MPIconButton` — the header's steppers are buttons, they are not a new kind of
 * control. Nothing here is exported from `src/index.ts`.
 *
 * The day cells are deliberately *not* buttons in that sense. A cell has states
 * a button has no vocabulary for — inside a range, at the end of a range, today,
 * belonging to the month next door — and four of them have to be told apart at a
 * glance in a grid of forty-two.
 */

/** The strings a picker says that `Intl` has no opinion about. */
export type MPPickerLabels = MPMessages['picker'];

/* ---------------------------------------------------------------------------
 * Scale
 * ------------------------------------------------------------------------- */

/**
 * The width of one day cell, as a length rather than as a class.
 *
 * It goes in an inline `--_mp-cell` slot for the reason every per-instance value
 * in this library does: Tailwind only sees class names written out literally,
 * and the grid needs this number in places that are not a `size-*` utility — the
 * panel's own width (`7 × cell`), the height the three views share so switching
 * between them does not resize the popup, and the clock's columns.
 *
 * `md` is 40px, which is MD3's own date-picker cell to the pixel. The rest of
 * the ladder is this library's, and it is *not* `CONTROL_HEIGHT`: a control's
 * `md` is 56px, and a calendar drawn at 56 a cell is 392px wide before it has a
 * popup around it, which is wider than the field that opened it.
 */
const CELL: Record<MPSize, string> = {
  xs: '1.75rem',
  sm: '2rem',
  md: '2.5rem',
  lg: '2.75rem',
  xl: '3rem'
};

/**
 * What the header's buttons are drawn at.
 *
 * One rung down from the picker's own, and for the same reason the cell ladder
 * is not the control ladder: at `md` this lands the steppers on `h-10`, which is
 * the 40px the cells beneath them are, so the header row and a row of days are
 * the same height and the panel reads as a grid rather than as a toolbar with a
 * calendar under it.
 */
const HEADER_SIZE: Record<MPSize, MPSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
  xl: 'md'
};

/**
 * What every pressable cell in every one of the three views is drawn on.
 *
 * The focus ring is pulled *inside* the cell rather than sitting 2px outside it,
 * which is the one place this library's focus rule is bent. The grid is gapless:
 * a ring drawn outside a cell is a ring drawn on the two cells either side of
 * it, and in a month view that is a ring that appears to belong to the wrong
 * day.
 */
const CELL_BASE = [
  'group relative flex cursor-pointer items-center justify-center overflow-hidden',
  // `box-border` explicitly, for the reason `MPButton` gives: this library ships
  // no page reset, so today's 1px outline would otherwise be added *outside* the
  // cell's 40px and today would come out two pixels wider than every other day.
  'box-border appearance-none bg-transparent font-[inherit] tabular-nums select-none',
  'transition-[background-color,border-color,color]',
  'duration-(--mp-sys-motion-duration-short4)',
  'outline-mp-secondary focus-visible:z-10 focus-visible:outline-2',
  'focus-visible:outline-offset-[-2px] focus-visible:outline-solid outline-none'
].join(' ');

/* ---------------------------------------------------------------------------
 * The cell
 * ------------------------------------------------------------------------- */

/**
 * Where a cell sits in a run of banded days, so the band knows where to stop.
 * `null` is the ordinary case: not in a band at all, so a full circle.
 */
type RangeEdge = 'start' | 'end' | 'both' | 'middle' | null;

interface CellProps {
  children: React.ReactNode;
  /** What a screen reader hears. Always the full date, never the bare number. */
  label: string;
  selected: boolean;
  /** Between the two ends of a range, or between one end and the pointer. */
  inRange?: boolean;
  rangeEdge?: RangeEdge;
  /** Today, this month, this year — whichever unit the grid is showing. */
  current?: boolean;
  /** Belongs to the month next door. */
  muted?: boolean;
  disabled?: boolean;
  /** The grid's single tab stop. */
  focused?: boolean;
  className?: string;
  onClick: () => void;
  onPointerEnter?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

/**
 * One pressable cell in a grid.
 *
 * The state branch is an `if`/`else` chain rather than a stack of Tailwind
 * variants, which the [prop conventions](../../docs/en/design/prop-conventions.md)
 * ask for by name: two utilities of equal specificity resolve by their order in
 * the generated stylesheet, and "chosen" beating "inside the range" is not
 * something a component may leave to that.
 *
 * The order is the order of importance. Unavailable first — a blocked day still
 * wearing the range's tint would be advertising membership of a range it cannot
 * join. Then chosen, then inside the range, then today, then the days belonging
 * to the month next door.
 *
 * Today is drawn as an **outlined** circle, which is MD3's own mark for it, and
 * the outline is a `border` rather than an `outline` so it cannot collide with
 * the focus ring: a cell that is both today and focused has to be able to show
 * both, and two rings of the same kind in one 40px circle is a cell that says
 * nothing.
 */
function Cell({
  children,
  label,
  selected,
  inRange = false,
  rangeEdge = null,
  current = false,
  muted = false,
  disabled = false,
  focused = false,
  className,
  onClick,
  onPointerEnter,
  onKeyDown
}: CellProps) {
  const state = disabled
    ? 'cursor-default text-mp-on-surface/38'
    : selected
      ? 'bg-(--_mp-accent) text-(--_mp-on-accent)'
      : inRange
        ? 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)'
        : current
          ? 'border border-(--_mp-accent) text-(--_mp-accent)'
          : muted
            ? 'text-mp-on-surface-variant'
            : 'text-mp-on-surface';

  // Square through the middle of a run and rounded where the run stops, so a
  // week of banded days reads as one shape rather than as seven tokens.
  const shape =
    rangeEdge === 'start'
      ? 'rounded-s-mp-full'
      : rangeEdge === 'end'
        ? 'rounded-e-mp-full'
        : rangeEdge === 'middle'
          ? 'rounded-none'
          : 'rounded-mp-full';

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={label}
      aria-selected={selected}
      aria-current={current ? 'date' : undefined}
      aria-disabled={disabled || undefined}
      // Not the `disabled` attribute. A disabled button leaves the tab order and
      // takes the grid's arrow-key path with it, so a reader arrowing across a
      // month would fall into a hole at every blocked day.
      tabIndex={focused ? 0 : -1}
      data-focus-target={focused ? 'true' : undefined}
      className={[CELL_BASE, shape, state, className ?? ''].filter(Boolean).join(' ')}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      onPointerEnter={onPointerEnter}
      onKeyDown={onKeyDown}
    >
      {disabled ? null : <MPStateLayer />}
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * The header
 * ------------------------------------------------------------------------- */

interface HeaderProps {
  size: MPSize;
  color: MPColor;
  view: MPCalendarView;
  month: Date;
  locale: string | undefined;
  labels: MPPickerLabels;
  showPreviousButton: boolean;
  showNextButton: boolean;
  onStep: (direction: -1 | 1) => void;
  onViewChange: (view: MPCalendarView) => void;
}

/**
 * The two steppers and, between them, the way into the other two views.
 *
 * This is what the component is for. A calendar that only steps a month at a
 * time puts a birthday thirty years back a hundred and eighty clicks away, so
 * the month and the year are each a button that opens a grid of its own: two
 * clicks to any month of the year on screen, three to any year at all. It is
 * also what MD3's own date picker does, and for the same reason.
 *
 * The two buttons are printed in the order the locale writes them — `July 2026`
 * in English, `2026년 7월` in Korean. `Intl` is asked which part comes first
 * rather than being guessed at, because a header in the wrong order reads as
 * broken to exactly the readers it is wrong for.
 */
function Header({
  size,
  color,
  view,
  month,
  locale,
  labels,
  showPreviousButton,
  showNextButton,
  onStep,
  onViewChange
}: HeaderProps) {
  const monthName = monthLabels(locale, 'long')[month.getMonth()];
  const yearName = String(month.getFullYear());
  const monthFirst = isMonthBeforeYear(locale);
  const buttonSize = HEADER_SIZE[size];

  const stepNames =
    view === 'day'
      ? [labels.previousMonth, labels.nextMonth]
      : view === 'month'
        ? [labels.previousYear, labels.nextYear]
        : [labels.previousYears, labels.nextYears];

  const stepper = (direction: -1 | 1, shown: boolean) =>
    shown ? (
      <MPIconButton
        size={buttonSize}
        color={color}
        label={stepNames[direction === -1 ? 0 : 1]}
        // The physical chevrons, and they are the right ones: the calendar's
        // reading order flips under RTL along with everything else, so "back"
        // is whichever way the text runs from. `rtl:` swaps them.
        icon={
          <MPIcon
            icon={direction === -1 ? ChevronLeftIcon : ChevronRightIcon}
            size={CONTROL_ICON[buttonSize]}
            className="rtl:rotate-180"
          />
        }
        onClick={() => onStep(direction)}
      />
    ) : (
      // A hole the size of the button that is not there, so two panels side by
      // side keep their headings on the same centre line.
      <span aria-hidden="true" className="size-(--_mp-cell)" />
    );

  const disclosure = (open: boolean) => (
    <MPIcon
      icon={ChevronDownIcon}
      size={CONTROL_ICON[buttonSize]}
      className={[
        'transition-transform duration-(--mp-sys-motion-duration-short4)',
        open ? 'rotate-180' : ''
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );

  const monthButton = (
    <MPButton
      key="month"
      variant="text"
      size={buttonSize}
      color={color}
      aria-label={labels.chooseMonth}
      aria-expanded={view === 'month'}
      endIcon={disclosure(view === 'month')}
      onClick={() => onViewChange(view === 'month' ? 'day' : 'month')}
    >
      {monthName}
    </MPButton>
  );

  const yearButton = (
    <MPButton
      key="year"
      variant="text"
      size={buttonSize}
      color={color}
      className="tabular-nums"
      aria-label={labels.chooseYear}
      aria-expanded={view === 'year'}
      endIcon={disclosure(view === 'year')}
      onClick={() => onViewChange(view === 'year' ? 'day' : 'year')}
    >
      {yearName}
    </MPButton>
  );

  const pageStart = yearPageStart(month.getFullYear());

  return (
    <div className="flex items-center justify-between gap-1">
      {stepper(-1, showPreviousButton)}

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        {view === 'year' ? (
          // A range, not a control: there is nothing above a page of years to
          // open. It keeps the row's height so switching views never moves it.
          <span
            className={`text-mp-on-surface flex h-(--_mp-cell) items-center tabular-nums ${PROSE_TEXT[size]}`}
          >
            {`${pageStart}–${pageStart + YEAR_PAGE_SIZE - 1}`}
          </span>
        ) : view === 'month' ? (
          yearButton
        ) : monthFirst ? (
          <>
            {monthButton}
            {yearButton}
          </>
        ) : (
          <>
            {yearButton}
            {monthButton}
          </>
        )}
      </div>

      {stepper(1, showNextButton)}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * The calendar
 * ------------------------------------------------------------------------- */

export interface MPCalendarProps {
  size: MPSize;
  color: MPColor;
  locale?: string;
  weekStartsOn: MPWeekday;
  /** The month on screen. Controlled, so two panels can be kept a month apart. */
  month: Date;
  onMonthChange: (month: Date) => void;
  /** The days drawn filled — one for a single picker, up to two for a range. */
  selected: readonly (Date | null | undefined)[];
  /** The two ends the band is drawn between. Both `null` outside range mode. */
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onSelect: (date: Date) => void;
  /** The day under the pointer, for a range that is only half chosen. */
  onPreviewChange?: (date: Date | null) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
  shouldDisableDate?: (date: Date) => boolean;
  /**
   * Draws the leading and trailing days that belong to the neighbouring months.
   *
   * On by default, because clicking the 1st of next month from this month's
   * panel is a real shortcut. A two-month range picker turns it *off*, and not
   * as a matter of taste: with both panels showing six full weeks, the 1st of
   * August appears twice — once as a trailing day of July and once as itself —
   * and two cells with the same name in one popup is ambiguous to a pointer and
   * outright broken to a screen reader.
   * @default true
   */
  showOutsideDays?: boolean;
  /** Takes the focus on mount — the popup has just opened. */
  autoFocus?: boolean;
  showPreviousButton?: boolean;
  showNextButton?: boolean;
  labels: MPPickerLabels;
}

/**
 * One month, with a way to reach every other one.
 *
 * Three views on the same footprint: the days of a month, the twelve months of a
 * year, twelve years at a time. They are deliberately the same width *and* the
 * same height — the day view is seven rows counting its header, and the other
 * two stretch four rows and three rows across that same height — so switching
 * view never resizes the popup under the pointer that opened it.
 *
 * Arrow keys move by one cell, `PageUp`/`PageDown` by a month (a year with
 * Shift), `Home`/`End` to the ends of the week, and running off an edge steps
 * the calendar rather than stopping. One roving tab stop, so `Tab` leaves the
 * grid instead of walking forty-two cells — the pattern the ARIA date-picker
 * practice describes, and the reason none of the cells is a `disabled` button.
 */
export function MPCalendar({
  size,
  color,
  locale,
  weekStartsOn,
  month,
  onMonthChange,
  selected,
  rangeStart = null,
  rangeEnd = null,
  onSelect,
  onPreviewChange,
  minDate,
  maxDate,
  shouldDisableDate,
  showOutsideDays = true,
  autoFocus = false,
  showPreviousButton = true,
  showNextButton = true,
  labels
}: MPCalendarProps) {
  const [view, setView] = React.useState<MPCalendarView>('day');
  const chosen = React.useMemo(() => selected.filter(isValidDate), [selected]);

  // The one cell that carries the tab stop. It starts on the chosen day, or on
  // today when today is on screen, or on the 1st — never nowhere, because a grid
  // whose tab stop is nowhere cannot be reached by a keyboard at all.
  const [focusedDate, setFocusedDate] = React.useState<Date>(() => {
    const preferred = chosen.find((date) => isSameMonth(date, month));

    if (preferred) {
      return startOfDay(preferred);
    }

    return isSameMonth(today(), month) ? today() : startOfMonth(month);
  });

  // Set only by the interactions that *move* the focus — an arrow key, a view
  // change — so the effect below never yanks focus out from under a pointer user
  // doing something else on the page.
  const pendingFocus = React.useRef(autoFocus);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Following the month keeps the tab stop inside the grid the reader is looking
  // at: stepping a month and then pressing an arrow lands somewhere sensible
  // instead of scrolling the panel back where it came from.
  React.useEffect(() => {
    setFocusedDate((current) => (isSameMonth(current, month) ? current : startOfMonth(month)));
  }, [month]);

  React.useLayoutEffect(() => {
    if (!pendingFocus.current) {
      return;
    }

    pendingFocus.current = false;
    // `preventScroll`, because on the very first pass this runs before the popup
    // has been positioned — it is still at the top-left of the page, and the
    // browser's own "scroll the focused element into view" would drag the
    // document up there with it. The cell is inside a popup that is about to be
    // placed against the trigger, so there is nothing to scroll to anyway.
    rootRef.current
      ?.querySelector<HTMLElement>('[data-focus-target="true"]')
      ?.focus({ preventScroll: true });
  });

  const isDisabled = React.useCallback(
    (date: Date) => isDayOutside(date, minDate, maxDate) || (shouldDisableDate?.(date) ?? false),
    [minDate, maxDate, shouldDisableDate]
  );

  /** Moves the tab stop, pulling the month along when it lands outside. */
  const moveFocus = (next: Date) => {
    pendingFocus.current = true;
    setFocusedDate(next);

    if (!isSameMonth(next, month)) {
      onMonthChange(startOfMonth(next));
    }
  };

  const step = (direction: -1 | 1) => {
    if (view === 'day') {
      onMonthChange(addMonths(month, direction));
    } else if (view === 'month') {
      onMonthChange(addYears(month, direction));
    } else {
      onMonthChange(addYears(month, direction * YEAR_PAGE_SIZE));
    }
  };

  const changeView = (next: MPCalendarView) => {
    pendingFocus.current = true;
    setView(next);
  };

  /** In month and year view the header's `month` *is* the cursor. */
  const moveCursor = (next: Date) => {
    pendingFocus.current = true;
    onMonthChange(next);
  };

  return (
    <div
      ref={rootRef}
      className="mp-calendar flex flex-col gap-1"
      style={{ '--_mp-cell': CELL[size] } as React.CSSProperties}
      onPointerLeave={() => onPreviewChange?.(null)}
    >
      <Header
        size={size}
        color={color}
        view={view}
        month={month}
        locale={locale}
        labels={labels}
        showPreviousButton={showPreviousButton}
        showNextButton={showNextButton}
        onStep={step}
        onViewChange={changeView}
      />

      {/* Seven rows of cells, whichever view is drawn into it. */}
      <div className="h-[calc(var(--_mp-cell)*7)] w-[calc(var(--_mp-cell)*7)]">
        {view === 'day' ? (
          <DayGrid
            size={size}
            locale={locale}
            weekStartsOn={weekStartsOn}
            month={month}
            chosen={chosen}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            focusedDate={focusedDate}
            showOutsideDays={showOutsideDays}
            isDisabled={isDisabled}
            onSelect={(date) => {
              setFocusedDate(date);
              onSelect(date);
            }}
            onPreviewChange={onPreviewChange}
            onMoveFocus={moveFocus}
          />
        ) : view === 'month' ? (
          <MonthGrid
            size={size}
            locale={locale}
            month={month}
            chosen={chosen}
            minDate={minDate}
            maxDate={maxDate}
            onMoveCursor={moveCursor}
            onPick={(index) => {
              onMonthChange(makeDate(month.getFullYear(), index, 1));
              changeView('day');
            }}
          />
        ) : (
          <YearGrid
            size={size}
            month={month}
            chosen={chosen}
            minDate={minDate}
            maxDate={maxDate}
            onMoveCursor={moveCursor}
            onPick={(year) => {
              onMonthChange(makeDate(year, month.getMonth(), 1));
              changeView('month');
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * The three grids
 * ------------------------------------------------------------------------- */

/** The two ends of a band, smallest first, whichever way round they arrived. */
function orderedRange(a: Date | null, b: Date | null): [Date, Date] | null {
  if (!isValidDate(a) || !isValidDate(b)) {
    return null;
  }

  return compareDay(a, b) <= 0 ? [a, b] : [b, a];
}

interface DayGridProps {
  size: MPSize;
  locale: string | undefined;
  weekStartsOn: MPWeekday;
  month: Date;
  chosen: Date[];
  rangeStart: Date | null;
  rangeEnd: Date | null;
  focusedDate: Date;
  showOutsideDays: boolean;
  isDisabled: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onPreviewChange?: (date: Date | null) => void;
  onMoveFocus: (date: Date) => void;
}

function DayGrid({
  size,
  locale,
  weekStartsOn,
  month,
  chosen,
  rangeStart,
  rangeEnd,
  focusedDate,
  showOutsideDays,
  isDisabled,
  onSelect,
  onPreviewChange,
  onMoveFocus
}: DayGridProps) {
  const weeks = calendarWeeks(month, weekStartsOn);
  const narrow = weekdayLabels(locale, weekStartsOn, 'narrow');
  const long = weekdayLabels(locale, weekStartsOn, 'long');
  const fullDate = dateFormatter(locale, { dateStyle: 'full' });
  const band = orderedRange(rangeStart, rangeEnd);
  const now = today();

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const offsetInWeek = (date.getDay() - weekStartsOn + 7) % 7;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -offsetInWeek),
      End: () => addDays(date, 6 - offsetInWeek),
      PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(date, event.shiftKey ? 12 : 1)
    };

    const move = moves[event.key];

    if (!move) {
      return;
    }

    event.preventDefault();
    onMoveFocus(move());
  };

  return (
    // Named by the month it is showing. A grid with no name is announced as
    // "grid" and nothing else, which for a calendar leaves the reader to work
    // out which month they are in from the cells — and the cells are numbers.
    <div
      role="grid"
      aria-label={dateFormatter(locale, { year: 'numeric', month: 'long' }).format(month)}
      className="flex h-full flex-col"
    >
      <div role="row" className="grid grid-cols-7">
        {narrow.map((label, index) => (
          <span
            key={index}
            role="columnheader"
            aria-label={long[index]}
            className={`text-mp-on-surface-variant flex h-(--_mp-cell) items-center justify-center select-none ${META_TEXT}`}
          >
            {label}
          </span>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div role="row" key={weekIndex} className="grid grid-cols-7">
          {week.map((date) => {
            const outside = !isSameMonth(date, month);

            // A hole the size of a cell rather than a missing one: the grid has
            // to keep its seven columns and six rows whatever month it is on.
            if (outside && !showOutsideDays) {
              return (
                <span
                  key={date.getTime()}
                  role="gridcell"
                  aria-hidden="true"
                  className="size-(--_mp-cell)"
                />
              );
            }

            const isChosen = chosen.some((entry) => isSameDay(entry, date));
            const within =
              band !== null && compareDay(date, band[0]) >= 0 && compareDay(date, band[1]) <= 0;
            const atStart = band !== null && within && isSameDay(date, band[0]);
            const atEnd = band !== null && within && isSameDay(date, band[1]);

            return (
              <Cell
                key={date.getTime()}
                label={fullDate.format(date)}
                selected={isChosen}
                inRange={within && !isChosen}
                rangeEdge={
                  !within
                    ? null
                    : atStart && atEnd
                      ? 'both'
                      : atStart
                        ? 'start'
                        : atEnd
                          ? 'end'
                          : 'middle'
                }
                current={isSameDay(date, now) && !isChosen}
                muted={outside}
                disabled={isDisabled(date)}
                focused={isSameDay(date, focusedDate)}
                className={`size-(--_mp-cell) ${PROSE_TEXT[size]}`}
                onClick={() => onSelect(date)}
                onPointerEnter={() => onPreviewChange?.(date)}
                onKeyDown={(event) => onKeyDown(event, date)}
              >
                {date.getDate()}
              </Cell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface MonthGridProps {
  size: MPSize;
  locale: string | undefined;
  month: Date;
  chosen: Date[];
  minDate?: Date | null;
  maxDate?: Date | null;
  onMoveCursor: (month: Date) => void;
  onPick: (index: number) => void;
}

/**
 * Twelve months, three across.
 *
 * The tab stop is the header's own month, so moving it *is* moving the header —
 * arrowing right off December lands on January of the next year and the year
 * button follows, which is one fewer thing for the reader to keep track of.
 */
function MonthGrid({
  size,
  locale,
  month,
  chosen,
  minDate,
  maxDate,
  onMoveCursor,
  onPick
}: MonthGridProps) {
  const short = monthLabels(locale, 'short');
  const long = monthLabels(locale, 'long');
  const year = month.getFullYear();
  const now = new Date();

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -3,
      ArrowDown: 3,
      PageUp: -12,
      PageDown: 12
    };
    const step = steps[event.key];

    if (step === undefined) {
      return;
    }

    event.preventDefault();
    onMoveCursor(addMonths(startOfMonth(month), step));
  };

  return (
    // The rows are spread over the height the day view occupies rather than
    // stretched to fill it: the popup keeps its size across a view change, and a
    // month cell stays a cell rather than becoming a panel.
    <div role="grid" className="flex h-full flex-col justify-evenly">
      {[0, 1, 2, 3].map((row) => (
        <div role="row" key={row} className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((column) => {
            const index = row * 3 + column;
            // A month is out of bounds only when every day in it is: the month a
            // `minDate` falls in is still reachable, it just starts late.
            const first = makeDate(year, index, 1);
            const last = makeDate(year, index, daysInMonth(year, index));

            return (
              <Cell
                key={index}
                label={`${long[index]} ${year}`}
                selected={chosen.some(
                  (entry) => entry.getFullYear() === year && entry.getMonth() === index
                )}
                current={now.getFullYear() === year && now.getMonth() === index}
                disabled={
                  (isValidDate(minDate) && compareDay(last, minDate) < 0) ||
                  (isValidDate(maxDate) && compareDay(first, maxDate) > 0)
                }
                focused={index === month.getMonth()}
                className={`h-(--_mp-cell) w-full ${PROSE_TEXT[size]}`}
                onClick={() => onPick(index)}
                onKeyDown={onKeyDown}
              >
                {short[index]}
              </Cell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface YearGridProps {
  size: MPSize;
  month: Date;
  chosen: Date[];
  minDate?: Date | null;
  maxDate?: Date | null;
  onMoveCursor: (month: Date) => void;
  onPick: (year: number) => void;
}

/** Twelve years, four across, and the same trick with the cursor. */
function YearGrid({ size, month, chosen, minDate, maxDate, onMoveCursor, onPick }: YearGridProps) {
  const pageStart = yearPageStart(month.getFullYear());
  const now = new Date().getFullYear();

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -4,
      ArrowDown: 4,
      PageUp: -YEAR_PAGE_SIZE,
      PageDown: YEAR_PAGE_SIZE
    };
    const step = steps[event.key];

    if (step === undefined) {
      return;
    }

    event.preventDefault();
    onMoveCursor(addYears(startOfMonth(month), step));
  };

  return (
    <div role="grid" className="flex h-full flex-col justify-evenly">
      {[0, 1, 2].map((row) => (
        <div role="row" key={row} className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((column) => {
            const year = pageStart + row * 4 + column;

            return (
              <Cell
                key={year}
                label={String(year)}
                selected={chosen.some((entry) => entry.getFullYear() === year)}
                current={year === now}
                disabled={
                  (isValidDate(minDate) && year < minDate.getFullYear()) ||
                  (isValidDate(maxDate) && year > maxDate.getFullYear())
                }
                focused={year === month.getFullYear()}
                className={`h-(--_mp-cell) w-full ${PROSE_TEXT[size]}`}
                onClick={() => onPick(year)}
                onKeyDown={onKeyDown}
              >
                {year}
              </Cell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * The clock
 * ------------------------------------------------------------------------- */

export interface MPTimeGridProps {
  size: MPSize;
  locale?: string;
  /** The time on screen, or `null` while nothing has been chosen. */
  value: Date | null;
  /** The day the columns write into while `value` is still `null`. */
  referenceDate: Date;
  onChange: (value: Date) => void;
  /** A 12-hour dial with an AM/PM column. */
  hour12: boolean;
  showSeconds: boolean;
  hourStep: number;
  minuteStep: number;
  secondStep: number;
  shouldDisableTime?: (value: Date, unit: MPTimeUnit) => boolean;
  /** Takes the focus on mount — the popup has just opened. */
  autoFocus?: boolean;
  labels: MPPickerLabels;
}

/**
 * Brings a row into view *inside its own column*, and nowhere else.
 *
 * `scrollIntoView` walks every scrollable ancestor up to the document, and the
 * popup this runs in has not been positioned yet when the effect fires — it is
 * still at the top-left of the page. So the browser dutifully scrolls the whole
 * document to the top to reveal a row that was about to move anyway, which is
 * the "opening a picker jumps the page" bug. Setting `scrollTop` on the column
 * cannot touch anything above it.
 */
function revealInColumn(row: HTMLElement) {
  const column = row.parentElement;

  if (!column) {
    return;
  }

  // Measured rather than read off `offsetTop`, which is relative to whichever
  // ancestor happens to be positioned and not necessarily to the column.
  const rowBox = row.getBoundingClientRect();
  const columnBox = column.getBoundingClientRect();
  const top = rowBox.top - columnBox.top - column.clientTop + column.scrollTop;
  const bottom = top + rowBox.height;

  if (top < column.scrollTop) {
    column.scrollTop = top;
  } else if (bottom > column.scrollTop + column.clientHeight) {
    column.scrollTop = bottom - column.clientHeight;
  }
}

/**
 * Hours, minutes and — when asked for — seconds, as columns you scroll.
 *
 * ## Why this is not MD3's dial
 *
 * The specification's time picker is a clock face, and this is not one. That is
 * a deliberate departure, and the only one of its size in this library, so it is
 * worth stating the reason plainly: a dial is a *pointer* control. Reading it
 * takes a glance at an analogue clock, setting it takes a drag, and the
 * keyboard and screen-reader path is a separate "time input" mode that MD3
 * ships precisely because the dial cannot serve one. That leaves a component
 * with two implementations of the same question, of which the accessible one is
 * the one nobody sees.
 *
 * Columns answer both readers with one control. "Half past nine" is two glances,
 * "any time at all, on the hour" is a column you never touch, and every row is a
 * real option in a real listbox that arrow keys already reach. The library's own
 * ladder, corners and state layers do the rest of the work of looking like
 * Material.
 *
 * The chosen row in each column is scrolled into view once, on open. That is the
 * only imperative work here and it is not optional: a column of sixty minutes
 * that opens at `00` while the value is `45` has hidden its own answer.
 */
export function MPTimeGrid({
  size,
  locale,
  value,
  referenceDate,
  onChange,
  hour12,
  showSeconds,
  hourStep,
  minuteStep,
  secondStep,
  shouldDisableTime,
  autoFocus = false,
  labels
}: MPTimeGridProps) {
  const base = value ?? referenceDate;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [am, pm] = React.useMemo(() => meridiemLabels(locale), [locale]);

  React.useEffect(() => {
    const root = rootRef.current;

    root?.querySelectorAll<HTMLElement>('[data-chosen="true"]').forEach(revealInColumn);

    if (autoFocus) {
      const first = root?.querySelector<HTMLElement>('[role="listbox"]');

      (
        first?.querySelector<HTMLElement>('[data-chosen="true"]') ??
        first?.querySelector<HTMLElement>('[role="option"]')
      )?.focus({ preventScroll: true });
    }
    // Once, on open. Re-running it on every change would drag a column back
    // under the pointer that is scrolling it.
  }, [autoFocus]);

  const hours = React.useMemo(() => {
    const count = Math.ceil((hour12 ? 12 : 24) / hourStep);
    const raw = Array.from({ length: count }, (_, index) => index * hourStep);

    // 12, 1, 2 … 11 — the order a 12-hour dial is read in, not 0…11.
    return hour12 ? raw.map((hour) => (hour === 0 ? 12 : hour)) : raw;
  }, [hour12, hourStep]);

  const minutes = React.useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => index * minuteStep),
    [minuteStep]
  );

  const seconds = React.useMemo(
    () => Array.from({ length: Math.ceil(60 / secondStep) }, (_, index) => index * secondStep),
    [secondStep]
  );

  /** The instant choosing this row would produce. */
  const candidate = (unit: MPTimeUnit, raw: number): Date => {
    if (unit === 'hour') {
      return withTime(base, {
        hours: hour12 ? (raw % 12) + (base.getHours() >= 12 ? 12 : 0) : raw
      });
    }

    if (unit === 'minute') {
      return withTime(base, { minutes: raw });
    }

    if (unit === 'second') {
      return withTime(base, { seconds: raw });
    }

    // `raw` is 0 for the first half of the day and 1 for the second.
    return withTime(base, { hours: (base.getHours() % 12) + raw * 12 });
  };

  const pad = (raw: number) => String(raw).padStart(2, '0');
  const displayHour = hour12 ? base.getHours() % 12 || 12 : base.getHours();

  const column = (
    unit: MPTimeUnit,
    name: string,
    rows: number[],
    isChosen: (raw: number) => boolean,
    render: (raw: number) => string
  ) => (
    <div
      key={unit}
      role="listbox"
      aria-label={name}
      className={[
        'mp-time-grid__column flex flex-col gap-0.5 overflow-y-auto overscroll-contain',
        // The same height as the calendar beside it, so a date-time picker's
        // popup is one rectangle rather than two of different heights.
        'h-[calc(var(--_mp-cell)*7)] w-[calc(var(--_mp-cell)*1.75)]',
        'scroll-py-0.5 [scrollbar-width:thin]'
      ].join(' ')}
    >
      {rows.map((raw) => {
        const at = candidate(unit, raw);
        const chosen = value !== null && isChosen(raw);
        const disabled = shouldDisableTime?.(at, unit) ?? false;

        return (
          <button
            key={raw}
            type="button"
            role="option"
            aria-selected={chosen}
            aria-disabled={disabled || undefined}
            data-chosen={chosen ? 'true' : undefined}
            className={[
              CELL_BASE,
              'rounded-mp-full h-(--_mp-cell) w-full shrink-0',
              PROSE_TEXT[size],
              disabled
                ? 'cursor-default text-mp-on-surface/38'
                : chosen
                  ? 'bg-(--_mp-accent) text-(--_mp-on-accent)'
                  : 'text-mp-on-surface'
            ].join(' ')}
            onClick={() => {
              if (!disabled) {
                onChange(at);
              }
            }}
          >
            {disabled ? null : <MPStateLayer />}
            {render(raw)}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className="mp-time-grid flex gap-1"
      style={{ '--_mp-cell': CELL[size] } as React.CSSProperties}
    >
      {column(
        'hour',
        labels.hour,
        hours,
        (raw) => raw === displayHour,
        (raw) => (hour12 ? String(raw) : pad(raw))
      )}
      {column('minute', labels.minute, minutes, (raw) => raw === base.getMinutes(), pad)}
      {showSeconds
        ? column('second', labels.second, seconds, (raw) => raw === base.getSeconds(), pad)
        : null}
      {hour12
        ? column(
            'meridiem',
            labels.meridiem,
            [0, 1],
            (raw) => (base.getHours() >= 12 ? 1 : 0) === raw,
            (raw) => (raw === 0 ? am : pm)
          )
        : null}

      {/* Three unlabelled lists of numbers, to anyone reading the screen rather
          than looking at it. This is the sentence that says what they add up to. */}
      <span className={VISUALLY_HIDDEN} aria-live="polite">
        {value === null
          ? ''
          : dateFormatter(locale, {
              hour: 'numeric',
              minute: '2-digit',
              ...(showSeconds ? { second: '2-digit' as const } : {})
            }).format(value)}
      </span>
    </div>
  );
}
