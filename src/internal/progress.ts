/**
 * What the three progress indicators share.
 *
 * `MPProgressLinear`, `MPProgressCircular` and `MPProgressBox` are three shapes
 * answering one question — how far along is this, and is it moving at all — so
 * everything that is *not* the shape lives here: the props, the ladders and the
 * arithmetic that turns `value`/`min`/`max` into a fraction.
 *
 * The shapes themselves are all that is left in each component, which is the
 * point: they are the only thing that genuinely differs. A `value` of `null` has
 * to mean the same thing on a bar, a ring and a row of segments, or the trio is
 * three components that happen to share a prefix.
 *
 * Every class string here is a literal, for the reason `scale.ts` gives:
 * Tailwind finds classes by scanning source text, so an interpolated `h-${n}`
 * generates no rule at all.
 */
import type * as React from 'react';
import type { MPSize } from '../types';

/**
 * The props all three indicators take.
 *
 * Declared once and extended rather than copied three times. `color` and `size`
 * are deliberately *not* here — they are on `MPStyleProps` for every other
 * component and each indicator documents what its own `size` means, which is a
 * different quantity on a bar (thickness), a ring (diameter) and a row of
 * segments (one segment).
 */
export interface MPProgressProps {
  /**
   * How far along, between `min` and `max`.
   *
   * `null` — the default — is the indeterminate case: something is happening and
   * nobody knows how much of it is left. That is the default on purpose. An
   * indicator that has not been told a value should say so rather than draw an
   * empty track, which is a claim that no progress has been made.
   * @default null
   */
  value?: number | null;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** A name for what is loading. Read out with the value by a screen reader. */
  label?: React.ReactNode;
  /**
   * Shows the value as text beside the shape. A percentage of the range unless
   * `format` says otherwise.
   * @default false
   */
  showValue?: boolean;
  /**
   * How the value is written when it is shown — `Intl.NumberFormat` options, so
   * bytes and currencies work as well as plain numbers. Without it the value is
   * a percentage of `min`…`max`, which is the only formatting that holds for a
   * range nobody described.
   */
  format?: Intl.NumberFormatOptions;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * How thick the linear track is.
 *
 * Its own ladder rather than a step off `CONTROL_HEIGHT`: a bar is not a control
 * with a label inside it. `md` is MD3's own 4dp, and the ladder is centred on it
 * the same way every other one is centred on its spec value.
 */
export const BAR_THICKNESS: Record<MPSize, string> = {
  xs: 'h-0.5',
  sm: 'h-[3px]',
  md: 'h-1',
  lg: 'h-1.5',
  xl: 'h-2'
};

/**
 * The diameter of the ring, in CSS pixels.
 *
 * Numbers rather than classes because the same value has to reach the SVG's
 * `viewBox` arithmetic, and a ring is one of the few things in this library that
 * a Tailwind class cannot describe on its own.
 *
 * `md` is MD3's own 48dp, and every rung sits inside the control height at the
 * same step — a 48px ring inside a 56px field — so a spinner dropped into a
 * button, a field or a table row never makes the row taller than it was.
 */
export const RING_DIAMETER: Record<MPSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 56,
  xl: 64
};

/** The ring's stroke, MD3's 4dp at `md`, thickening so the hole stays in proportion. */
export const RING_STROKE: Record<MPSize, number> = {
  xs: 2.5,
  sm: 3,
  md: 4,
  lg: 4.5,
  xl: 5
};

/** One segment of an `MPProgressBox`. An indicator, so its own ladder again. */
export const SEGMENT_SIZE: Record<MPSize, string> = {
  xs: 'size-2',
  sm: 'size-2.5',
  md: 'size-3',
  lg: 'size-4',
  xl: 'size-5'
};

/**
 * The corner cut off a segment.
 *
 * `corner-extra-small` from `md` up, which is the spec's smallest corner and the
 * right one for a tile this size. The two rungs below it take a literal, because
 * 4px on an 8px box is not a cut corner — it is a circle.
 */
export const SEGMENT_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-[3px]',
  sm: 'rounded-[3px]',
  md: 'rounded-mp-xs',
  lg: 'rounded-mp-xs',
  xl: 'rounded-mp-sm'
};

/** Between the segments. Tight — they are one object, not a row of squares. */
export const SEGMENT_GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
  xl: 'gap-2'
};

/**
 * `value` as a fraction of the range, or `null` when there is nothing to say.
 *
 * The clamp is not defensive programming for its own sake — `value` usually
 * arrives from a division somewhere, and a bar that renders 140% wide because
 * one request finished twice is a worse bug than a bar that sits full.
 */
export function progressFraction(
  value: number | null | undefined,
  min: number,
  max: number
): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  if (max <= min) {
    return null;
  }

  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * What the value reads as, both on screen and to a screen reader.
 *
 * Base UI's own default is `${value}%`, which is right only when the range
 * happens to be 0–100 — "3%" for step 3 of 4 is worse than saying nothing. So
 * the percentage is computed from the fraction, and a caller who passed `format`
 * gets Base UI's formatted string instead, because at that point they have said
 * what the number means.
 */
export function progressText(
  fraction: number | null,
  formatted: string | null,
  hasFormat: boolean
): string | null {
  if (fraction === null) {
    return null;
  }

  return hasFormat ? formatted : `${Math.round(fraction * 100)}%`;
}

/**
 * The same string, shaped for Base UI's `getAriaValueText`.
 *
 * `undefined` when there is no value, which hands the indeterminate case back to
 * Base UI — it already announces indeterminate progress, and re-inventing that
 * here would be one more English string the library has to own.
 */
export function progressAriaText(
  fraction: number | null,
  hasFormat: boolean
): ((formatted: string | null) => string) | undefined {
  if (fraction === null) {
    return undefined;
  }

  return (formatted) => progressText(fraction, formatted, hasFormat) ?? '';
}
