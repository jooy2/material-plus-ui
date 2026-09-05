import type * as React from 'react';
import type {
  MPChartCategory,
  MPChartCurve,
  MPChartDatum,
  MPChartSeries,
  MPColor,
  MPSize
} from '../types';

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

/**
 * A point in **plot pixels**, or `null` where the series has a gap.
 *
 * Deliberately not `MPChartPoint`, which is the caller's datum. Everything past
 * this line works in pixels: a builder that could still see a value would be a
 * builder that has to know which way round the axes are.
 */
export type PlotPoint = { x: number; y: number } | null;

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
function runsOf(points: readonly PlotPoint[]): { x: number; y: number }[][] {
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
export function linePath(points: readonly PlotPoint[], curve: MPChartCurve): string {
  return runsOf(points)
    .map((run) => runPath(run, curve))
    .join('');
}

/**
 * The ribbon between two runs of points.
 *
 * Built run by run, so a gap is a gap in the fill as well — and a gap in
 * *either* edge is a gap in the band, because a ribbon with only one side is
 * not a shape. An area that closed across a missing month would fill in a value
 * that was never measured: the same lie the bridged line tells, painted over a
 * larger part of the chart.
 *
 * The underside is drawn with the **same** curve and its opening `M` turned
 * into an `L`. Both halves matter: a smoothed top over a straight bottom
 * disagrees with itself about where the band is between two points, and a
 * second `moveto` inside the path lifts the pen and leaves the fill with no
 * side.
 */
export function bandPath(
  top: readonly PlotPoint[],
  bottom: readonly PlotPoint[],
  curve: MPChartCurve
): string {
  const out: string[] = [];
  let upper: { x: number; y: number }[] = [];
  let lower: { x: number; y: number }[] = [];

  const close = () => {
    if (upper.length > 0) {
      out.push(
        `${runPath(upper, curve)}${runPath([...lower].reverse(), curve).replace(/^M/, 'L')}Z`
      );
    }

    upper = [];
    lower = [];
  };

  top.forEach((point, at) => {
    const under = bottom[at];

    if (point === null || under === null || under === undefined) {
      close();

      return;
    }

    upper.push(point);
    lower.push(under);
  });

  close();

  return out.join('');
}

/**
 * The same path closed down to a flat baseline, for an area standing on the
 * axis rather than on another band.
 */
export function areaPath(
  points: readonly PlotPoint[],
  baseline: number,
  curve: MPChartCurve
): string {
  return bandPath(
    points,
    points.map((point) => (point === null ? null : { x: point.x, y: baseline })),
    curve
  );
}

/**
 * Which edge of a bar is its data end — the one the value is at.
 *
 * `none` is the inner segment of a stack, whose two faces are both boundaries
 * between shares rather than the end of anything, and so are both left square.
 */
export type BarEnd = 'top' | 'bottom' | 'left' | 'right' | 'none';

/**
 * A rectangle with the two corners at its **data end** cut off.
 *
 * Rounded at the end and square at the baseline, and that is not a stylistic
 * split. A bar rounded where it meets the axis has lost the exact point it
 * starts from, and a row of them turns the baseline into a scalloped edge. The
 * end is where the value is, and that is the end worth softening.
 *
 * Which end that is comes from the caller rather than from the geometry,
 * because it is the *sign* and the orientation together that decide: a negative
 * bar hangs below the axis and a horizontal one grows sideways, and in both the
 * corners to soften are the ones furthest from zero.
 *
 * The radius shrinks to fit rather than clipping, so a bar two pixels tall is a
 * bar and not a dome.
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  end: BarEnd
): string {
  const w = Math.abs(width);
  const h = Math.abs(height);

  if (w === 0 || h === 0) {
    return '';
  }

  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const round = {
    tl: end === 'top' || end === 'left' ? r : 0,
    tr: end === 'top' || end === 'right' ? r : 0,
    br: end === 'bottom' || end === 'right' ? r : 0,
    bl: end === 'bottom' || end === 'left' ? r : 0
  };

  // Clockwise from the top-left corner, in relative commands, with an arc
  // emitted only where there is one — so the number of arcs in the `d` is the
  // number of corners actually softened.
  const arc = (size: number, dx: number, dy: number) =>
    size > 0 ? `a${size} ${size} 0 0 1 ${dx} ${dy}` : '';

  return (
    `M${x + round.tl} ${y}` +
    `h${w - round.tl - round.tr}` +
    arc(round.tr, round.tr, round.tr) +
    `v${h - round.tr - round.br}` +
    arc(round.br, -round.br, round.br) +
    `h${-(w - round.bl - round.br)}` +
    arc(round.bl, -round.bl, -round.bl) +
    `v${-(h - round.tl - round.bl)}` +
    arc(round.tl, round.tl, -round.tl) +
    'Z'
  );
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

/**
 * The lowest and highest a set of series reaches.
 *
 * Stacked is a different question rather than a variation on the same one: what
 * a stacked chart's axis has to hold is the tallest *column*, and the tallest
 * column is not made of the largest values. Positives and negatives accumulate
 * separately, because a column of +8 and −3 is eleven units tall and reaches
 * from −3 to 8, not from 0 to 5.
 *
 * `null` when nothing was measured at all, which is a different answer from
 * `{ min: 0, max: 0 }` — one is an empty chart and the other is a chart of
 * zeroes.
 */
export function seriesExtent(
  values: readonly (readonly ChartValue[])[],
  stacked: boolean
): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  let seen = false;

  if (stacked) {
    const length = values.reduce((most, one) => Math.max(most, one.length), 0);

    for (let index = 0; index < length; index += 1) {
      let up = 0;
      let down = 0;

      for (const one of values) {
        const value = one[index]?.value;

        if (value === null || value === undefined) {
          continue;
        }

        seen = true;

        if (value >= 0) {
          up += value;
        } else {
          down += value;
        }
      }

      min = Math.min(min, down);
      max = Math.max(max, up);
    }
  } else {
    for (const one of values) {
      for (const { value } of one) {
        if (value === null) {
          continue;
        }

        seen = true;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }

  return seen ? { min, max } : null;
}

/* -------------------------------------------------------------------- ticks */

/**
 * 1, 2, 5, 10 — the steps a reader can do arithmetic on without stopping.
 *
 * An axis exists to be measured against, and measuring against it means adding
 * the step up in your head. A gridline every 3,000 is a gridline nobody counts
 * from.
 */
function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;

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

/**
 * A step that lands on **both** ends of a range the caller pinned.
 *
 * When a scale is free to move, rounding its ends outward to a nice step is
 * what produces clean ticks. Where `min` and `max` are both given the ends
 * cannot move, so the step is what has to give — and a step that does not
 * divide the range leaves the top tick missing. On an axis pinned to 99.5 and
 * 100, the one number the reader came for is then the one not written down.
 *
 * So the family is widened by a half step — 2.5, 25, 250, the divisor every
 * quarter-scale needs — and searched for whichever divides the range exactly
 * and lands nearest the tick count asked for.
 */
function dividingStep(range: number, tickCount: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(range / Math.max(1, tickCount)));
  let best = niceStep(range / Math.max(1, tickCount));
  let closest = Infinity;

  for (const scale of [0.1, 1, 10]) {
    for (const unit of [1, 2, 2.5, 5]) {
      const step = unit * scale * magnitude;
      const count = range / step;
      const whole = Math.round(count);

      // The tolerance is a floating-point guard and not a fudge: `0.5 / 0.1` is
      // 4.999999999999999, and an exact test rejects the step that divides.
      if (whole < 1 || Math.abs(count - whole) > 1e-9) {
        continue;
      }

      const distance = Math.abs(whole - tickCount);

      if (distance < closest) {
        closest = distance;
        best = step;
      }
    }
  }

  return best;
}

/** A value axis: where it starts, where it ends, and what it ticks at. */
export interface ValueScale {
  min: number;
  max: number;
  ticks: number[];
  /** A value as a fraction of the plot — `0` at `min`, `1` at `max`. */
  fraction: (value: number) => number;
}

/**
 * The scale a value axis runs on, rounded out to numbers.
 *
 * Rounding **outward** is the part that matters. A maximum of 4,830 becomes
 * 5,000, so the top tick is a round number and the tallest mark stops short of
 * the ceiling; a scale whose last bar touches the frame reads as clipped even
 * when it is exactly right.
 *
 * Zero stays in range unless the caller says otherwise, because a bar's length
 * is proportional to its value only from a zero baseline. A line chart of a
 * quantity that never goes near zero is the case for passing `min` — and it is
 * a case the caller makes, not one the chart makes for them.
 */
export function valueScale(
  extent: { min: number; max: number } | null,
  options: {
    min?: number;
    max?: number;
    tickCount?: number;
    /** Keeps zero in range. Off for an axis the caller pinned. */
    includeZero?: boolean;
  } = {}
): ValueScale {
  const { tickCount = 5, includeZero = true } = options;

  let low = options.min ?? extent?.min ?? 0;
  let high = options.max ?? extent?.max ?? 1;

  if (includeZero && options.min === undefined) {
    low = Math.min(low, 0);
  }

  if (includeZero && options.max === undefined) {
    high = Math.max(high, 0);
  }

  // A flat series has no extent to divide by. Open a band around it rather than
  // dividing by zero and drawing every mark off the top of the plot.
  if (high === low) {
    const pad = Math.abs(high) > 0 ? Math.abs(high) * 0.5 : 1;

    low -= pad;
    high += pad;
  }

  const pinned = options.min !== undefined && options.max !== undefined;
  const step = pinned
    ? dividingStep(high - low, tickCount)
    : niceStep((high - low) / Math.max(1, tickCount));

  const start = options.min !== undefined ? low : Math.floor(low / step) * step;
  const end = options.max !== undefined ? high : Math.ceil(high / step) * step;
  const span = end - start || 1;

  const ticks: number[] = [];

  // The epsilon is the same floating-point guard: `0.1 * 3` is
  // 0.30000000000000004, and without room for it the last tick falls off every
  // scale whose step is not a power of two.
  for (let tick = start; tick <= end + step * 1e-9; tick += step) {
    // And the rounding is its other half. A tick printed as
    // `0.30000000000000004` is worse than a tick that is missing.
    ticks.push(Number(tick.toFixed(12)));
  }

  return { min: start, max: end, ticks, fraction: (value) => (value - start) / span };
}

/* ------------------------------------------------------------------ geometry */

/** The plot's box inside the chart, once the axes have taken their bands. */
export interface PlotBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A band scale: one slot per category, with the marks centred in it. */
export interface BandScale {
  /** The centre of category `index`, in pixels along the axis. */
  centre: (index: number) => number;
  /** How wide one slot is. */
  step: number;
  /** How much of a slot the marks in it may take, together. */
  band: number;
}

export function bandScale(count: number, length: number, ratio: number): BandScale {
  const step = count > 0 ? length / count : length;

  return { step, band: step * ratio, centre: (index) => step * (index + 0.5) };
}

/* -------------------------------------------------------------------- labels */

/**
 * Roughly how wide a string renders at a given font size.
 *
 * An estimate on purpose. The exact answer is a canvas measurement per label
 * per render, on a path that runs again on every resize — and what the number
 * is used for is deciding how much room to reserve, where a few pixels of
 * generosity cost nothing and a reflow costs a frame.
 *
 * 0.6em is about the advance of a digit in the sans-serifs a UI runs in.
 * Anything CJK is close to a full em, so the wider characters are counted as
 * one: a Korean axis reserving 60% of the room it needs is an axis that
 * overlaps itself.
 */
export function textWidth(text: string, fontSize: number): number {
  let width = 0;

  for (const character of text) {
    width += /[ᄀ-ᇿ⺀-꓏가-퟿豈-﫿︰-﹏]/.test(character) ? 1 : 0.6;
  }

  return width * fontSize;
}

/**
 * A label cut to the room it has.
 *
 * The alternative, when a category name is wider than its slot, is to drop
 * labels until the survivors fit — and on five categories called things like
 * "Onboarding flow" that leaves exactly one. An axis with one label is not a
 * shorter axis, it is an unlabelled one. So cut instead: the first few
 * characters tell five words apart, and the hover layer and the table both
 * still carry the whole of it.
 */
export function truncate(text: string, maxWidth: number, fontSize: number): string {
  if (maxWidth <= 0 || textWidth(text, fontSize) <= maxWidth) {
    return text;
  }

  const room = maxWidth - textWidth('…', fontSize);
  let cut = '';
  // A running total rather than re-measuring `cut + character` each time, which
  // would make this quadratic in the label's length for no gain.
  let width = 0;

  for (const character of text) {
    const next = width + textWidth(character, fontSize);

    if (next > room) {
      break;
    }

    width = next;
    cut += character;
  }

  return cut.length > 0 ? `${cut.trimEnd()}…` : '…';
}

/**
 * How many labels an axis can show before they collide — every nth.
 *
 * Every nth rather than rotating them. A rotated axis is unreadable at a
 * glance, and it takes a band of the plot to be unreadable in.
 */
export function tickStride(count: number, available: number, labelWidth: number): number {
  if (count <= 1 || available <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.ceil(count / Math.max(1, Math.floor(available / Math.max(1, labelWidth))))
  );
}

/**
 * Whether the label at `index` survives the stride.
 *
 * Every nth, and — where it fits — the last one, which is the part a plain
 * modulo gets wrong: a fourteen-day axis at a stride of two ends at day
 * thirteen, and a percentage axis ends at 80%. The end of a scale is the number
 * a reader looks for first, and dropping it to keep the arithmetic tidy is the
 * wrong trade.
 *
 * `roomForLast` is measured rather than assumed — see `fitsLast`. Forcing a
 * label that does not fit turns a missing "Jun" into an overlapping "MayJun".
 */
export function showsTick(
  index: number,
  count: number,
  stride: number,
  roomForLast: boolean
): boolean {
  return index % stride === 0 || (roomForLast && index === count - 1);
}

/**
 * Whether the last label clears the last one the stride kept.
 *
 * The two sit `(count - 1) % stride` steps apart, and they need half of each
 * label plus a little air: labels are centred on their tick, so only the inner
 * halves can meet.
 */
export function fitsLast(count: number, stride: number, step: number, labelWidth: number): boolean {
  const over = (count - 1) % stride;

  return over > 0 && over * step >= labelWidth + 8;
}

/* --------------------------------------------------------------------- data */

/** One datum, unpacked into the parts the frame reads. */
export interface ChartValue {
  value: number | null;
  x?: MPChartCategory;
  z?: number;
  color?: string;
  label?: React.ReactNode;
}

/**
 * A datum in the one shape everything downstream reads.
 *
 * Every way of being absent collapses to `value: null` here — `null` itself, a
 * missing entry, a `NaN`, an `Infinity`. They mean the same thing to a reader
 * and they must mean the same thing to the path builder, because a `NaN` that
 * survives this far reaches the scale and leaves the letters `NaN` in the `d`
 * attribute, where it silently draws nothing at all.
 */
export function toValue(datum: MPChartDatum): ChartValue {
  if (datum === null || datum === undefined) {
    return { value: null };
  }

  if (typeof datum === 'number') {
    return { value: Number.isFinite(datum) ? datum : null };
  }

  if (typeof datum !== 'object' || !('y' in datum)) {
    return { value: null };
  }

  return {
    value: datum.y === null || !Number.isFinite(datum.y) ? null : datum.y,
    x: datum.x,
    z: datum.z,
    color: datum.color ? seriesColor(0, datum.color) : undefined,
    label: datum.label
  };
}

/** Every series unpacked, in the order it was given. */
export function toValues(series: readonly MPChartSeries[]): ChartValue[][] {
  return series.map((one) => one.data.map(toValue));
}

/**
 * A category as a number, for an axis that is really a second value axis.
 *
 * A `Date` is its epoch milliseconds, which is what makes a scatter of
 * timestamps work at all. A string is not a place on a number line, so it comes
 * back `null` rather than `NaN` — the same rule `toValue` follows, for the same
 * reason.
 */
export function toNumber(value: MPChartCategory | undefined): number | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

/** How many categories there are: the longest series decides. */
export function categoryCount(series: readonly MPChartSeries[]): number {
  return series.reduce((most, one) => Math.max(most, one.data.length), 0);
}

/**
 * What category `index` is called, from the three places it can come from.
 *
 * The chart's own `categories` first, then whatever a point said its `x` was,
 * then the index. A chart given neither still has an axis — it is numbered, and
 * a numbered axis is a great deal better than a blank one.
 */
export function categoryAt(
  index: number,
  categories: readonly MPChartCategory[] | undefined,
  values: readonly (readonly ChartValue[])[]
): MPChartCategory {
  if (categories && index < categories.length) {
    return categories[index];
  }

  for (const one of values) {
    const x = one[index]?.x;

    if (x !== undefined) {
      return x;
    }
  }

  return index;
}

/**
 * A category as the axis writes it.
 *
 * A `Date` gets a short day rather than a full one: an axis is a row of labels
 * that have to fit beside each other, and "Mar 4" carries what "March 4, 2026"
 * carries in a third of the room. The year is the caller's to add with
 * `tickFormat` when a chart spans one.
 */
export function formatCategory(value: MPChartCategory, locale: string | undefined): string {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(value);
  }

  return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value;
}

/* --------------------------------------------------------------------- size */

/**
 * How tall the drawing is, before the caller says otherwise.
 *
 * Not the control ladder. A chart is a figure on a page rather than a control
 * in a row, so the rungs are set against what a plot needs to be readable: `md`
 * at 220 gives five gridlines about forty pixels apart, which is roughly where
 * a reader stops being able to place a value between two of them.
 */
export const PLOT_HEIGHT: Record<MPSize, number> = {
  xs: 120,
  sm: 160,
  md: 220,
  lg: 280,
  xl: 360
};

/**
 * What the axis labels are set in, in pixels.
 *
 * Pixels and not a type role, because these are drawn inside an `<svg>` where a
 * class does not reach and the number is needed for the arithmetic anyway —
 * every band an axis reserves is measured from its own font size.
 */
export const CHART_FONT_SIZE: Record<MPSize, number> = {
  xs: 10,
  sm: 11,
  md: 12,
  lg: 13,
  xl: 14
};

/** How heavy a line is. Two pixels at `md`, which is the chart line weight. */
export const LINE_WIDTH: Record<MPSize, number> = {
  xs: 1.5,
  sm: 1.75,
  md: 2,
  lg: 2.5,
  xl: 3
};

/**
 * How big a marker is.
 *
 * `md` at 4 makes an 8px dot, which is the floor for a mark a pointer is
 * expected to land on. Below that the hit target is doing all the work and the
 * mark is only telling the reader where to aim.
 */
export const MARKER_RADIUS: Record<MPSize, number> = {
  xs: 3,
  sm: 3.5,
  md: 4,
  lg: 4.5,
  xl: 5
};

/**
 * The gap of surface between two marks that would otherwise touch.
 *
 * Two pixels, and it is structural rather than decorative: where two fills meet
 * with no gap the eye reads one shape, and the boundary between them is exactly
 * the thing the chart is drawing.
 */
export const MARK_GAP = 2;

/** How much a bar's data end is rounded. */
export const BAR_RADIUS = 4;

/**
 * How thick a bar is allowed to get.
 *
 * A cap rather than a size: bars are sized by their band, and two categories in
 * a wide chart would otherwise be two slabs half the plot across. Past about
 * this width a bar stops reading as a measured length and starts reading as a
 * block of colour, and the axis it is measured against gets no easier to use.
 */
export const BAR_MAX_THICKNESS: Record<MPSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56
};

/**
 * How much of its slot a band of bars takes, leaving the rest as air.
 *
 * Bars need the gap and lines do not, which is the whole reason the frame takes
 * a ratio at all: a row of bars with no space between them is a histogram, and
 * a histogram means something else — that the categories are contiguous
 * intervals rather than separate things.
 */
export const BAR_BAND_RATIO = 0.72;

/* --------------------------------------------------------------------- arcs */

/**
 * A point on a circle, in the convention the round charts use: **zero is twelve
 * o'clock and the angle grows clockwise**.
 *
 * Not the mathematical convention, where zero is three o'clock and the angle
 * grows the other way. A chart of parts is read the way a clock is read, and
 * every angle a caller passes — `startAngle`, a gauge's sweep — is easier to
 * reason about in the one they already have.
 */
export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number
): { x: number; y: number } {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

/**
 * A ring segment, or a pie slice when the inner radius is nothing.
 *
 * A full turn is drawn as **two** arcs rather than one, and that is not a
 * flourish: an SVG arc is defined by its two endpoints, so a sweep of exactly
 * 360° starts and ends at the same point and the renderer draws nothing at all.
 * A single-category pie is a real chart, and it would come out blank.
 */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  from: number,
  to: number
): string {
  const sweep = to - from;

  if (Math.abs(sweep) < 1e-9 || outer <= 0) {
    return '';
  }

  const full = Math.abs(sweep) >= Math.PI * 2 - 1e-9;
  const end = full ? from + Math.PI * 2 * Math.sign(sweep || 1) : to;
  const half = from + (end - from) / 2;
  const large = Math.abs(end - from) > Math.PI ? 1 : 0;
  const forward = end > from ? 1 : 0;
  const back = forward ? 0 : 1;

  const outerFrom = polarPoint(cx, cy, outer, from);
  const outerHalf = polarPoint(cx, cy, outer, half);
  const outerTo = polarPoint(cx, cy, outer, end);

  // Split at the halfway angle when the segment is a full turn, so neither arc
  // is the degenerate same-point-to-same-point case.
  const outward = full
    ? `A${outer} ${outer} 0 0 ${forward} ${outerHalf.x} ${outerHalf.y}` +
      `A${outer} ${outer} 0 0 ${forward} ${outerTo.x} ${outerTo.y}`
    : `A${outer} ${outer} 0 ${large} ${forward} ${outerTo.x} ${outerTo.y}`;

  if (inner <= 0) {
    // A slice, not a ring: back to the centre rather than along an inner edge.
    return full
      ? `M${outerFrom.x} ${outerFrom.y}${outward}Z`
      : `M${cx} ${cy}L${outerFrom.x} ${outerFrom.y}${outward}Z`;
  }

  const innerTo = polarPoint(cx, cy, inner, end);
  const innerHalf = polarPoint(cx, cy, inner, half);
  const innerFrom = polarPoint(cx, cy, inner, from);

  const inward = full
    ? `A${inner} ${inner} 0 0 ${back} ${innerHalf.x} ${innerHalf.y}` +
      `A${inner} ${inner} 0 0 ${back} ${innerFrom.x} ${innerFrom.y}`
    : `A${inner} ${inner} 0 ${large} ${back} ${innerFrom.x} ${innerFrom.y}`;

  return `M${outerFrom.x} ${outerFrom.y}${outward}` + `L${innerTo.x} ${innerTo.y}${inward}Z`;
}
