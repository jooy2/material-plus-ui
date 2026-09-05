import type { ValueScale } from './chart';

/**
 * A scale for an axis of instants.
 *
 * `valueScale`'s 1-2-5-10 family is the right one for a count and exactly the
 * wrong one for a moment: run on epoch milliseconds it produces a tick every
 * 200,000,000 ms, which lands at 14:53:20 on an arbitrary Tuesday. Nobody reads
 * that. Time is not decimal below the year — sixty, sixty, twenty-four, seven,
 * twelve — so its steps are written down rather than derived.
 *
 * A file of its own because only the timeline needs it. The other seven charts
 * would carry a calendar for nothing.
 */

/** The units a time axis is allowed to step in. */
export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The steps a clock and a calendar actually have, smallest first.
 *
 * `size` is nominal — a month is not 30 days and a year is not 365 — and it is
 * only used to choose the step. Once chosen, the ticks are walked with real
 * calendar arithmetic, so a month step lands on the first of the month whatever
 * its length and a day step survives the clocks going back.
 */
const STEPS: readonly { unit: TimeUnit; count: number; size: number }[] = [
  { unit: 'second', count: 1, size: SECOND },
  { unit: 'second', count: 5, size: 5 * SECOND },
  { unit: 'second', count: 15, size: 15 * SECOND },
  { unit: 'second', count: 30, size: 30 * SECOND },
  { unit: 'minute', count: 1, size: MINUTE },
  { unit: 'minute', count: 5, size: 5 * MINUTE },
  { unit: 'minute', count: 15, size: 15 * MINUTE },
  { unit: 'minute', count: 30, size: 30 * MINUTE },
  { unit: 'hour', count: 1, size: HOUR },
  { unit: 'hour', count: 3, size: 3 * HOUR },
  { unit: 'hour', count: 6, size: 6 * HOUR },
  { unit: 'hour', count: 12, size: 12 * HOUR },
  { unit: 'day', count: 1, size: DAY },
  { unit: 'day', count: 2, size: 2 * DAY },
  { unit: 'week', count: 1, size: 7 * DAY },
  { unit: 'month', count: 1, size: 30 * DAY },
  { unit: 'month', count: 3, size: 91 * DAY },
  { unit: 'year', count: 1, size: 365 * DAY }
];

/** The start of the unit `time` falls in. */
function floorTime(time: number, unit: TimeUnit): number {
  const date = new Date(time);

  switch (unit) {
    case 'second':
      date.setMilliseconds(0);
      break;
    case 'minute':
      date.setSeconds(0, 0);
      break;
    case 'hour':
      date.setMinutes(0, 0, 0);
      break;
    case 'day':
      date.setHours(0, 0, 0, 0);
      break;
    case 'week':
      date.setHours(0, 0, 0, 0);
      // Back to the Monday, which is what a week on a chart means even where
      // the calendar starts it on Sunday: a week of work is Monday to Friday.
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      break;
    case 'month':
      date.setHours(0, 0, 0, 0);
      date.setDate(1);
      break;
    default:
      date.setHours(0, 0, 0, 0);
      date.setMonth(0, 1);
      break;
  }

  return date.getTime();
}

/** `count` units after `time`, by the calendar rather than by arithmetic. */
function addTime(time: number, unit: TimeUnit, count: number): number {
  const date = new Date(time);

  switch (unit) {
    case 'second':
      date.setSeconds(date.getSeconds() + count);
      break;
    case 'minute':
      date.setMinutes(date.getMinutes() + count);
      break;
    case 'hour':
      date.setHours(date.getHours() + count);
      break;
    case 'day':
      date.setDate(date.getDate() + count);
      break;
    case 'week':
      date.setDate(date.getDate() + count * 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + count);
      break;
    default:
      date.setFullYear(date.getFullYear() + count);
      break;
  }

  return date.getTime();
}

/**
 * The first tick: floored to the unit, then back to a multiple of the count.
 *
 * The second half is what makes a three-hour axis tick at 00:00, 03:00, 06:00
 * rather than at 01:00, 04:00, 07:00. Without it the ticks are evenly spaced
 * and land on nothing a reader recognises, which is most of the value of using
 * a calendar step at all.
 */
function alignTime(time: number, unit: TimeUnit, count: number): number {
  const floored = floorTime(time, unit);

  if (count <= 1) {
    return floored;
  }

  const date = new Date(floored);

  switch (unit) {
    case 'second':
      date.setSeconds(Math.floor(date.getSeconds() / count) * count);
      break;
    case 'minute':
      date.setMinutes(Math.floor(date.getMinutes() / count) * count);
      break;
    case 'hour':
      date.setHours(Math.floor(date.getHours() / count) * count);
      break;
    case 'month':
      date.setMonth(Math.floor(date.getMonth() / count) * count);
      break;
    case 'year':
      date.setFullYear(Math.floor(date.getFullYear() / count) * count);
      break;
    default:
      // A day step of two has no natural anchor — the second of the month is
      // not more of a landmark than the third — so it starts where the data do.
      break;
  }

  return date.getTime();
}

/** 1, 2, 5 or 10 times a power of ten — the same family a count of anything takes. */
function niceYears(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, rough)));
  const normalised = Math.max(1, rough) / magnitude;

  if (normalised <= 1) {
    return magnitude;
  }

  if (normalised <= 2) {
    return 2 * magnitude;
  }

  if (normalised <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

/** A value scale whose ticks are instants, plus the unit they step in. */
export interface TimeScale extends ValueScale {
  unit: TimeUnit;
  count: number;
}

/**
 * The scale an axis of instants runs on.
 *
 * The ends round outward to the step, exactly as `valueScale`'s do, so an axis
 * of work starting on a Wednesday afternoon begins at midnight on the Wednesday
 * rather than at the first task's start.
 */
export function timeScale(
  extent: { min: number; max: number } | null,
  options: { min?: number; max?: number; tickCount?: number } = {}
): TimeScale {
  const { tickCount = 6 } = options;

  const low = options.min ?? extent?.min ?? Date.now();
  const high = options.max ?? extent?.max ?? low + DAY;
  // A single instant has no range to divide. An hour either side of it is a
  // scale a reader can place it on, where a zero-width one is a division by
  // nothing.
  const range = high - low || HOUR * 2;

  /*
   * The step nearest the one that would give `tickCount` ticks — measured by
   * the ratio rather than the difference, because the table spans nine orders
   * of magnitude and a second is not "close to" an hour on a linear reckoning.
   *
   * Nearest, and not the first that is big enough: over a fortnight, "at least
   * two and a third days" is a week, which puts two ticks on the axis.
   */
  const ideal = range / Math.max(1, tickCount);
  const step = STEPS.reduce((best, one) =>
    Math.abs(Math.log(one.size / ideal)) < Math.abs(Math.log(best.size / ideal)) ? one : best
  );

  /*
   * Past a year the table runs out, so the year *count* is scaled by the
   * 1-2-5-10 family a plain number uses — which is the right family again,
   * years being counted rather than clocked.
   */
  const count = step.unit === 'year' ? niceYears(range / (365 * DAY) / tickCount) : step.count;

  const start = options.min !== undefined ? low : alignTime(low, step.unit, count);
  const end =
    options.max !== undefined
      ? high
      : (() => {
          let tick = start;

          // At least one step, so an axis holding a single instant is a scale
          // rather than a point: a `while` never runs when that one instant is
          // itself a landmark, and the scale comes back with no width at all.
          do {
            tick = addTime(tick, step.unit, count);
          } while (tick < high);

          return tick;
        })();

  const span = end - start || 1;
  const ticks: number[] = [];

  for (let tick = start; tick <= end; tick = addTime(tick, step.unit, count)) {
    ticks.push(tick);

    // A guard against a step that cannot advance, which would otherwise be an
    // infinite loop rather than a wrong chart.
    if (ticks.length > 500) {
      break;
    }
  }

  return {
    min: start,
    max: end,
    ticks,
    unit: step.unit,
    count,
    fraction: (value) => (value - start) / span
  };
}

/**
 * A tick written at the resolution its step implies.
 *
 * An axis stepping in hours writes clock times and one stepping in months
 * writes month names. Writing the whole instant at every step would be an axis
 * of identical strings differing in one field, which is the least readable form
 * of a date there is.
 */
export function formatTimeTick(value: number, unit: TimeUnit, locale: string | undefined): string {
  const parts: Intl.DateTimeFormatOptions =
    unit === 'second'
      ? { minute: '2-digit', second: '2-digit' }
      : unit === 'minute' || unit === 'hour'
        ? { hour: 'numeric', minute: '2-digit' }
        : unit === 'day' || unit === 'week'
          ? { month: 'short', day: 'numeric' }
          : unit === 'month'
            ? { year: 'numeric', month: 'short' }
            : { year: 'numeric' };

  return new Intl.DateTimeFormat(locale, parts).format(value);
}
