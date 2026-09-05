import type { MPColor } from '../types';

/**
 * The arithmetic and the vocabulary the charts share.
 *
 * Nothing in here draws anything and nothing in here is a class name. It is the
 * palette a series is handed, the numbers a value is written as, and — as the
 * plotted charts arrive — the scales and the ticks under them. Kept apart for
 * the reason `internal/data-table.ts` is: a component whose interesting fifty
 * lines are buried in machinery is a component nobody can read.
 */

/**
 * How many colours a chart can hand out before it starts repeating.
 *
 * Eight, and a chart that reaches the ninth should not have: a ninth hue is
 * indistinguishable from one of the first eight under colour-vision deficiency
 * whichever one is chosen. Fold the tail into one "other" series, or draw a
 * second chart.
 */
export const CHART_SLOTS = 8;

/**
 * How many series may be told apart when **any two marks can touch** — a
 * scatter, a bubble chart, a heatmap.
 *
 * Three. The eight slots are separable pair-by-pair only that far, and no
 * ordering of eight does better; it is a property of the colour space rather
 * than of this palette. The stylesheet's note on `--_mp-chart-1` has the
 * measurements.
 */
export const CHART_TOUCHING_SLOTS = 3;

const ACCENTS = new Set<string>(['primary', 'secondary', 'tertiary', 'error']);

/**
 * What colour a mark is, in the fixed order the palette is handed out in.
 *
 * `index` is the series' place in the array it was passed in, **not** its place
 * among the ones currently visible. That is the whole point: filtering a legend
 * must not repaint the survivors, because a reader who learned that Europe is
 * blue has learned something a re-render is not allowed to take back.
 *
 * A series that names its own colour gets it. An `MPColor` resolves to that
 * accent role; anything else is passed through as CSS, so a brand hex or a
 * custom property of the caller's both work.
 */
export function seriesColor(index: number, explicit?: string): string {
  if (explicit) {
    return ACCENTS.has(explicit) ? `var(--_mp-color-${explicit as MPColor})` : explicit;
  }

  return `var(--_mp-chart-${(index % CHART_SLOTS) + 1})`;
}

/** Where a figure stops being read and starts being counted. */
export const COMPACT_FROM = 10_000;

/**
 * A number as the reader should see it, compacted once it stops being readable
 * in full.
 *
 * Four digits stay and five do not. `1,284` is a figure anybody takes in at a
 * glance, and `1.3K` has thrown away two of them to save two characters; at
 * `12,900` the digits have stopped being read and started being counted, so
 * `12.9K` loses nothing. Past that it is the only honest picture: nobody
 * compares `1,284,003` with `1,911,220` by reading them, and `1.3M` against
 * `1.9M` is what they were going to conclude anyway.
 *
 * `format` overrides all of it, because a caller who has said
 * `{ style: 'currency', currency: 'USD' }` has said what they want and a
 * component that compacted it anyway would be arguing.
 */
export function formatStatistic(
  value: number,
  locale: string | undefined,
  format: Intl.NumberFormatOptions | undefined,
  compact: boolean
): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (format) {
    return new Intl.NumberFormat(locale, format).format(value);
  }

  if (compact && Math.abs(value) >= COMPACT_FROM) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  return new Intl.NumberFormat(locale).format(value);
}

/** Which way a figure has moved, and whether that is the good direction. */
export interface MPStatisticDelta {
  /** The change, in the value's own units. */
  absolute: number;
  /** And as a share of where it started. `null` when it started at nothing. */
  percent: number | null;
  /** `0` when it has not moved at all, which is a third state rather than "up". */
  direction: -1 | 0 | 1;
  /** Whether the direction is the one the caller says is good. */
  good: boolean;
}

/**
 * The move from one figure to another.
 *
 * A percentage of zero is `null` rather than `Infinity` or `100%`. Something
 * that was nothing and is now something has not grown by an amount — it has
 * started — and every one of the numbers that could be printed there is a lie a
 * reader would take at face value.
 */
export function deltaOf(
  value: number,
  previous: number,
  betterWhen: 'up' | 'down'
): MPStatisticDelta {
  const absolute = value - previous;
  const direction = absolute > 0 ? 1 : absolute < 0 ? -1 : 0;

  return {
    absolute,
    percent: previous === 0 ? null : (absolute / Math.abs(previous)) * 100,
    direction,
    // Flat is neither good nor bad, and painting it green would be a claim.
    good: direction === 0 ? false : (direction === 1) === (betterWhen === 'up')
  };
}
