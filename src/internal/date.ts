/**
 * The arithmetic and the naming the four pickers share.
 *
 * No date library under it, deliberately. This package has one runtime
 * dependency and it is an icon set; a component library that quietly adds
 * `date-fns` — or worse, picks a side in the dayjs/luxon/Temporal argument on
 * its consumer's behalf — has made a decision that was not its to make.
 * Everything here is either `Date` arithmetic, which is a dozen lines, or
 * `Intl`, which the platform already ships and which knows more about month
 * names in more languages than any bundled table ever will.
 *
 * Two rules hold everywhere below:
 *
 * - **Local time, always.** A calendar day is a thing a person is looking at on
 *   a wall, not an instant on a line. `new Date(2026, 6, 27)` is midnight local
 *   and every comparison here is made on the local Y/M/D triple, so a picker in
 *   Seoul and a picker in São Paulo both light up the cell that says 27.
 * - **Nothing is mutated.** `Date` is mutable and every method on it that sounds
 *   like a question is actually a command. Each function here copies first, so a
 *   `value` handed in by a caller is never the object that comes back out.
 *
 * Nothing here is exported from `src/index.ts`. It is the library talking to
 * itself, in the sense `internal/` always means.
 */

import type { MPWeekday } from '../types';

/** Which unit the calendar is currently letting you pick. */
export type MPCalendarView = 'day' | 'month' | 'year';

/** How many years one page of the year grid holds. Four columns of three. */
export const YEAR_PAGE_SIZE = 12;

/* ---------------------------------------------------------------------------
 * Construction
 * ------------------------------------------------------------------------- */

/**
 * A local midnight on the given Y/M/D, with out-of-range parts normalised —
 * month `12` rolls into January, day `0` into the last day of the month before.
 *
 * Built through `setFullYear` rather than `new Date(year, month, day)` because
 * the two-argument constructor maps years 0–99 onto 1900–1999. Nobody is going
 * to pick a date in the year 47, but a component that silently rewrites the year
 * it was handed is a component that will eventually be blamed for something
 * else.
 */
export function makeDate(year: number, month: number, day: number): Date {
  const date = new Date(0);

  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);

  return date;
}

/** Is this a `Date` that stands for a real instant? `new Date('nope')` is not. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** The same day with the clock wound back to midnight. */
export function startOfDay(date: Date): Date {
  const next = new Date(date.getTime());

  next.setHours(0, 0, 0, 0);

  return next;
}

/** The first day of the month this date is in, at midnight. */
export function startOfMonth(date: Date): Date {
  return makeDate(date.getFullYear(), date.getMonth(), 1);
}

/** How many days a month has, leap years included. */
export function daysInMonth(year: number, month: number): number {
  return makeDate(year, month + 1, 0).getDate();
}

/** Today, at midnight. The one place the pickers read the clock for a *date*. */
export function today(): Date {
  return startOfDay(new Date());
}

/* ---------------------------------------------------------------------------
 * Arithmetic
 * ------------------------------------------------------------------------- */

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getTime());

  next.setDate(next.getDate() + amount);

  return next;
}

/**
 * Months, with the day of the month clamped rather than allowed to overflow.
 *
 * 31 January plus one month is 28 February, not 3 March. The naive
 * `setMonth(getMonth() + 1)` gives the second answer, which is why stepping a
 * calendar forward from a 31st with it skips February entirely.
 */
export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  // Normalised through a first-of-month, so the day never carries the overflow.
  const target = makeDate(date.getFullYear(), date.getMonth() + amount, 1);

  next.setFullYear(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
  );

  return next;
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/* ---------------------------------------------------------------------------
 * Comparison
 *
 * All of it on the local Y/M/D triple, never on `getTime()`. Two `Date`s that
 * are the same calendar day differ by milliseconds far more often than not — a
 * value carrying a time of day, a `minDate` built at noon — and every one of
 * those comparisons has to come out `true`.
 * ------------------------------------------------------------------------- */

/** Negative, zero or positive, the way a sort comparator wants it. */
export function compareDay(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return isValidDate(a) && isValidDate(b) && compareDay(a, b) === 0;
}

export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    isValidDate(a) &&
    isValidDate(b) &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

/**
 * Is this calendar *day* outside the allowed span?
 *
 * Day-granular on purpose. A `maxDate` of 27 July at 09:00 still leaves the 27th
 * pickable — the bound is about which days exist, and the time of day is the
 * clock's problem. `MPDateTimePicker` re-checks at full precision once an hour
 * has been chosen.
 */
export function isDayOutside(date: Date, min?: Date | null, max?: Date | null): boolean {
  if (isValidDate(min) && compareDay(date, min) < 0) {
    return true;
  }

  return isValidDate(max) && compareDay(date, max) > 0;
}

/* ---------------------------------------------------------------------------
 * Time of day
 * ------------------------------------------------------------------------- */

/** Seconds since local midnight — what `minTime`/`maxTime` are compared on. */
export function secondsOfDay(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

/** Which column of a clock a candidate time is being offered for. */
export type MPTimeUnit = 'hour' | 'minute' | 'second' | 'meridiem';

/**
 * The span of the day one row of one column covers, in seconds since midnight.
 *
 * This is the detail that separates a working time picker from a frustrating
 * one. A bound has to be checked against the *span* a row stands for, not
 * against one instant inside it: with a `minTime` of 09:30, the hour `9` covers
 * 09:00:00–09:59:59, which overlaps what is allowed, so it stays available and
 * the minute column is where `00` through `25` grey out. Comparing the whole
 * candidate instead hides the 9 and makes half past nine unreachable.
 */
export function timeUnitSpan(unit: MPTimeUnit, at: Date): [number, number] {
  const seconds = secondsOfDay(at);

  if (unit === 'hour') {
    const start = Math.floor(seconds / 3600) * 3600;

    return [start, start + 3599];
  }

  if (unit === 'minute') {
    const start = Math.floor(seconds / 60) * 60;

    return [start, start + 59];
  }

  if (unit === 'second') {
    return [seconds, seconds];
  }

  const start = at.getHours() < 12 ? 0 : 12 * 3600;

  return [start, start + 12 * 3600 - 1];
}

/** The same instant with one or more clock fields replaced. */
export function withTime(
  date: Date,
  parts: { hours?: number; minutes?: number; seconds?: number }
): Date {
  const next = new Date(date.getTime());

  next.setHours(
    parts.hours ?? next.getHours(),
    parts.minutes ?? next.getMinutes(),
    parts.seconds ?? next.getSeconds(),
    0
  );

  return next;
}

/** `date`'s calendar day wearing `time`'s clock. */
export function mergeDateAndTime(date: Date, time: Date): Date {
  return withTime(startOfDay(date), {
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds()
  });
}

/* ---------------------------------------------------------------------------
 * The grid
 * ------------------------------------------------------------------------- */

/**
 * Six weeks of seven days, always — including the leading and trailing days that
 * belong to the neighbouring months.
 *
 * Six rows whatever the month, and that is the whole point. A February that
 * starts on a Sunday needs four rows and a 31-day month starting on a Saturday
 * needs six; a grid that renders only the rows it needs is a grid that changes
 * height when you step a month forward, moving every cell out from under the
 * pointer that just pressed one.
 */
export function calendarWeeks(month: Date, weekStartsOn: MPWeekday): Date[][] {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const origin = addDays(first, -lead);

  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(origin, week * 7 + day))
  );
}

/** The first year on the page a given year falls on. 2026 → 2016 at 12 a page. */
export function yearPageStart(year: number): number {
  return year - (((year % YEAR_PAGE_SIZE) + YEAR_PAGE_SIZE) % YEAR_PAGE_SIZE);
}

/* ---------------------------------------------------------------------------
 * Naming
 *
 * Every string a picker draws that is not a number comes from `Intl`. The
 * formatters are cached because constructing one is genuinely expensive — a
 * calendar builds seven weekday names and twelve month names on every render of
 * the month view, and at 42 cells a month that adds up fast.
 * ------------------------------------------------------------------------- */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

/** A memoised `Intl.DateTimeFormat`. `undefined` locale means the runtime's own. */
export function dateFormatter(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale ?? ''} ${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }

  return formatter;
}

/** Formats a date, tolerating the `null` a cleared picker holds. */
export function formatDate(
  date: Date | null | undefined,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): string {
  return isValidDate(date) ? dateFormatter(locale, options).format(date) : '';
}

/**
 * Twenty-four instants that between them exercise everything a picker's display
 * can vary by: all twelve month names, all seven weekday names, a two-digit day,
 * every hour of the clock and a two-digit minute and second.
 *
 * They exist to be measured, not read. A picker's trigger is sized by its
 * content, so `Jul 1, 2026` and `Sep 28, 2026` are different widths and the
 * field jumps every time a date is chosen — with the whole row of controls
 * beside it shuffling along. Rendering all of these invisibly pins the trigger
 * to the widest thing it could ever say.
 *
 * Both cycles are prime to twelve in the right way — `i % 12` walks the months
 * and `i % 7` walks the days 21…27 — so every name appears without the two being
 * multiplied out into eighty-four samples.
 */
const DISPLAY_SAMPLES: Date[] = Array.from(
  { length: 24 },
  (_, index) => new Date(2027, index % 12, 21 + (index % 7), index, 58, 58)
);

/**
 * Every distinct string those instants format to. Deduplicated, because a
 * date-only format collapses twenty-four of them into a handful.
 */
export function displaySamples(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): string[] {
  const formatter = dateFormatter(locale, options);

  return [...new Set(DISPLAY_SAMPLES.map((date) => formatter.format(date)))];
}

/**
 * The samples plus the placeholder, when the placeholder is a string.
 *
 * An empty picker shows the placeholder, which can easily be longer than any
 * date — "Pick a departure date" against "3 Aug 2026" — and a trigger that
 * shrinks the moment the first date is chosen is the same jump from the other
 * direction. A `ReactNode` placeholder is left out: there is nothing to measure
 * without rendering it twice.
 */
export function withPlaceholder(samples: string[], placeholder: unknown): string[] {
  return typeof placeholder === 'string' && placeholder !== ''
    ? [...samples, placeholder]
    : samples;
}

/**
 * The three machine-readable spellings, for the hidden input that makes a picker
 * submit with a form.
 *
 * Local, not UTC, and that is the whole point: `toISOString()` on a `Date`
 * standing for 27 July in Seoul gives `2026-07-26T15:00:00Z`, and a form field
 * that quietly reports the day before the one on screen is the single most
 * expensive bug a date picker can ship. The shapes are the ones the native
 * `<input type="date">`, `type="time"` and `type="datetime-local"` submit, so a
 * server that already parses those needs no new code.
 */
export function toISODate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toISOTime(date: Date, withSeconds = false): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const base = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return withSeconds ? `${base}:${pad(date.getSeconds())}` : base;
}

export function toISODateTime(date: Date, withSeconds = false): string {
  return `${toISODate(date)}T${toISOTime(date, withSeconds)}`;
}

/** A Sunday, used as the origin for every weekday name below. 1 Aug 2021. */
const WEEKDAY_ORIGIN = makeDate(2021, 7, 1);

/**
 * The seven column headers, rotated so the first one is `weekStartsOn`.
 *
 * `narrow` is what MD3's own calendar draws — one character per column, which is
 * what keeps a 40dp cell a cell rather than a word. English narrow names collide
 * (`S`, `M`, `T`, `W`, `T`, `F`, `S`), so the full name goes on the header's
 * `aria-label` and a screen reader hears "Monday" rather than "M".
 */
export function weekdayLabels(
  locale: string | undefined,
  weekStartsOn: MPWeekday,
  weekday: 'narrow' | 'short' | 'long' = 'narrow'
): string[] {
  const formatter = dateFormatter(locale, { weekday });

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(WEEKDAY_ORIGIN, (weekStartsOn + index) % 7))
  );
}

/** The twelve month names, January first, in the locale's own words. */
export function monthLabels(
  locale: string | undefined,
  month: 'short' | 'long' = 'short'
): string[] {
  const formatter = dateFormatter(locale, { month });

  return Array.from({ length: 12 }, (_, index) => formatter.format(makeDate(2021, index, 1)));
}

/**
 * Does this locale write the month before the year?
 *
 * The calendar's header is two separate buttons — one that opens the month grid
 * and one that opens the year grid — so it cannot just print what `Intl` gives
 * it. Asking `formatToParts` which part came first is how the two buttons end up
 * in the order the reader expects: `July 2026` in English, `2026년 7월` in
 * Korean. Getting this wrong is subtle and reads as broken to exactly the people
 * it is wrong for.
 */
export function isMonthBeforeYear(locale: string | undefined): boolean {
  const parts = dateFormatter(locale, { year: 'numeric', month: 'long' }).formatToParts(
    WEEKDAY_ORIGIN
  );

  return (
    parts.findIndex((part) => part.type === 'month') <
    parts.findIndex((part) => part.type === 'year')
  );
}

/** Does this locale put a clock on a 12-hour dial? */
export function isHour12(locale: string | undefined): boolean {
  const resolved = dateFormatter(locale, { hour: 'numeric' }).resolvedOptions();

  if (resolved.hourCycle) {
    return resolved.hourCycle === 'h11' || resolved.hourCycle === 'h12';
  }

  return resolved.hour12 === true;
}

/** What this locale calls AM and PM. */
export function meridiemLabels(locale: string | undefined): [string, string] {
  const formatter = dateFormatter(locale, { hour: 'numeric', hour12: true });
  const read = (hours: number) => {
    const part = formatter
      .formatToParts(withTime(WEEKDAY_ORIGIN, { hours }))
      .find((entry) => entry.type === 'dayPeriod');

    return part?.value ?? (hours < 12 ? 'AM' : 'PM');
  };

  return [read(9), read(21)];
}

/**
 * The shape `Intl.Locale` has *in the engines that do not have it*.
 *
 * Deliberately not `extends Intl.Locale`. The lib declares `getWeekInfo()` as a
 * method that is always there and always returns a whole `WeekInfo`, which is
 * true of an engine that has it and is the case this code is not written for; an
 * interface cannot widen an inherited member back to optional. So the shape is
 * declared on its own and the locale is cast to it.
 */
interface LocaleWeekInfo {
  weekInfo?: { firstDay?: number };
  getWeekInfo?: () => { firstDay?: number };
}

/**
 * Which day the week starts on here — Sunday in the US and Korea, Monday across
 * most of Europe, Saturday in much of the Middle East.
 *
 * `Intl.Locale`'s week info is the right source and is also the least evenly
 * implemented corner of `Intl`: it is a getter in some engines, a method in
 * others, and absent in the rest. All three are handled, and the fallback is
 * Sunday rather than a throw — a calendar that renders starting on the wrong day
 * is a small annoyance, and a calendar that renders nothing is not.
 */
export function localeWeekStart(locale: string | undefined): MPWeekday {
  try {
    const resolved = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
    const info = new Intl.Locale(resolved) as LocaleWeekInfo;
    const week = typeof info.getWeekInfo === 'function' ? info.getWeekInfo() : info.weekInfo;

    // CLDR counts Monday as 1 through Sunday as 7; `getDay` counts Sunday as 0.
    if (typeof week?.firstDay === 'number') {
      return (week.firstDay % 7) as MPWeekday;
    }
  } catch {
    // An unparseable locale tag. Not worth taking the calendar down over.
  }

  return 0;
}
