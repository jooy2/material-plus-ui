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

/* ------------------------------------------------------------------- shapes */

/** How the line between two points is drawn. */
export type MPChartCurve = 'linear' | 'smooth' | 'step';

/** A point on the plot, or `null` where the series has a gap. */
export type MPChartPoint = { x: number; y: number } | null;

/**
 * The cubic segments of a monotone interpolation.
 *
 * Fritsch–Carlson: the tangent at each point is the harmonic mean of the slopes
 * either side of it, clamped to zero wherever the two disagree in sign. That
 * clamp is the whole of it — it is why a run of rising values never dips on its
 * way up, and why the lowest number in the data is the lowest point on screen.
 * A plain cubic spline through the same points overshoots both, and a chart that
 * invents a dip is a chart that has reported one.
 */
function monotoneSegments(points: readonly { x: number; y: number }[]): string {
  const n = points.length;
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x;

    slopes.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
  }

  const tangents: number[] = [slopes[0] ?? 0];

  for (let i = 1; i < n - 1; i += 1) {
    const before = slopes[i - 1];
    const after = slopes[i];

    tangents.push(before * after <= 0 ? 0 : (2 * before * after) / (before + after));
  }

  tangents.push(slopes[n - 2] ?? 0);

  const out: string[] = [];

  for (let i = 0; i < n - 1; i += 1) {
    const dx = (points[i + 1].x - points[i].x) / 3;

    out.push(
      `C${points[i].x + dx} ${points[i].y + tangents[i] * dx}` +
        ` ${points[i + 1].x - dx} ${points[i + 1].y - tangents[i + 1] * dx}` +
        ` ${points[i + 1].x} ${points[i + 1].y}`
    );
  }

  return out.join('');
}

/** One unbroken run of points, as a path. */
function runPath(run: readonly { x: number; y: number }[], curve: MPChartCurve): string {
  if (run.length === 0) {
    return '';
  }

  if (run.length === 1) {
    // A lone point between two gaps has no line to be part of. A zero-length
    // stroke is what it is, and a round cap draws that as the dot it should be.
    return `M${run[0].x} ${run[0].y}h0`;
  }

  const head = `M${run[0].x} ${run[0].y}`;

  if (curve === 'smooth') {
    return head + monotoneSegments(run);
  }

  const rest: string[] = [];

  for (let i = 1; i < run.length; i += 1) {
    if (curve === 'step') {
      // The step turns halfway between the two, rather than at either — a step
      // that turned at the new point would draw the old value as lasting until
      // the new one, and turning at the old one draws the opposite lie.
      const middle = (run[i - 1].x + run[i].x) / 2;

      rest.push(`H${middle}V${run[i].y}H${run[i].x}`);
    } else {
      rest.push(`L${run[i].x} ${run[i].y}`);
    }
  }

  return head + rest.join('');
}

/** Every unbroken run in a series, split at the gaps. */
function runsOf(points: readonly MPChartPoint[]): { x: number; y: number }[][] {
  const runs: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];

  for (const point of points) {
    if (point === null) {
      if (run.length > 0) {
        runs.push(run);
      }

      run = [];
    } else {
      run.push(point);
    }
  }

  if (run.length > 0) {
    runs.push(run);
  }

  return runs;
}

/**
 * A series as one `d`, broken wherever it has a gap.
 *
 * The break is the point. A `null` is a month nothing was measured in, and a
 * path that joined the two sides of it would draw a straight line through a
 * value nobody has — which is the one thing a reader would never guess was
 * invented, because it looks exactly like data.
 */
export function linePath(points: readonly MPChartPoint[], curve: MPChartCurve): string {
  return runsOf(points)
    .map((run) => runPath(run, curve))
    .join('');
}

/**
 * The same path closed down to a baseline, for an area.
 *
 * Built run by run, so a gap is a gap in the fill as well. An area that closed
 * across a missing month fills in a value that was never measured — the same lie
 * the bridged line tells, painted over a larger part of the chart.
 *
 * The underside is drawn with the *same* curve and its opening `M` turned into
 * an `L`. Both halves matter: a smoothed top over a straight bottom disagrees
 * with itself about where the band is between two points, and a second `moveto`
 * inside the path lifts the pen and leaves the fill with no side.
 */
export function areaPath(
  points: readonly MPChartPoint[],
  baseline: number,
  curve: MPChartCurve
): string {
  return runsOf(points)
    .map((run) => {
      const under = run.map((point) => ({ x: point.x, y: baseline })).reverse();

      return `${runPath(run, curve)}${runPath(under, curve).replace(/^M/, 'L')}Z`;
    })
    .join('');
}

/**
 * A rectangle with the two corners at its **data end** cut off.
 *
 * Rounded at the end and square at the baseline, and that is not a stylistic
 * split. A bar rounded where it meets the axis has lost the exact point it
 * starts from, and a row of them turns the baseline into a scalloped edge. The
 * end is where the value is, and that is the end worth softening.
 *
 * The radius shrinks to fit rather than clipping, so a bar two pixels tall is a
 * bar and not a circle.
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  up: boolean
): string {
  const r = Math.max(0, Math.min(radius, width / 2, Math.abs(height)));
  const h = Math.abs(height);

  if (h === 0) {
    return '';
  }

  return up
    ? `M${x} ${y + h}v${-(h - r)}a${r} ${r} 0 0 1 ${r} ${-r}h${width - r * 2}` +
        `a${r} ${r} 0 0 1 ${r} ${r}v${h - r}Z`
    : `M${x} ${y}v${h - r}a${r} ${r} 0 0 0 ${r} ${r}h${width - r * 2}` +
        `a${r} ${r} 0 0 0 ${r} ${-r}v${-(h - r)}Z`;
}

/* -------------------------------------------------------------------- scale */

/** The lowest and highest a series reaches, with the caller's overrides applied. */
export function extentOf(
  values: readonly (number | null)[],
  min?: number,
  max?: number
): { min: number; max: number } {
  const real = values.filter((value): value is number => value !== null && Number.isFinite(value));
  const low = min ?? (real.length > 0 ? Math.min(...real) : 0);
  const high = max ?? (real.length > 0 ? Math.max(...real) : 0);

  // A flat series has no extent, and dividing by nothing would put every point
  // on the same pixel or on none. One unit of room draws it as the flat line it
  // is, halfway up.
  return low === high ? { min: low - 0.5, max: high + 0.5 } : { min: low, max: high };
}
