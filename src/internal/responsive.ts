/**
 * The one shape a value that changes with the window is written in.
 *
 * `MPResponsive<T>` in `src/types.ts` is the type — a value, or a map keyed by
 * window size class, each entry applying from its own class upward. This is what
 * turns one of those into something the stylesheet can read, and it is a module
 * rather than three functions inside `MPGrid` because the grid stopped being the
 * only component with a responsive prop.
 *
 * ## Why a custom property and not a class
 *
 * Because the values are arithmetic a caller picks at runtime. A column is
 * `(100% + gutter) * span / columns - gutter` and a measure is whatever length
 * was asked for; Tailwind finds classes by scanning source text, so an
 * interpolated `w-[${n}]` generates no rule at all. The rules are therefore
 * written once in `src/styles.css` and the per-instance numbers arrive as inline
 * `--_mp-{name}-{class}` slots, exactly as a `color` reaches a background.
 *
 * The other half of that decision is what a media query can do that React
 * cannot: an inherited custom property changes at a boundary without anything
 * re-rendering, so the value a component lays itself out against is always the
 * one that is actually on screen. A responsive prop resolved in JavaScript would
 * be a subtree re-rendering at every window class to say the same thing, and a
 * first paint on the server that has to be corrected afterwards.
 *
 * ## Why only the classes that were named
 *
 * `span={{ expanded: 6 }}` writes one custom property and not five. The gaps are
 * filled in by the stylesheet, which falls each class back to the one below it —
 * see the rungs in `src/styles.css`. That keeps the `style` attribute down to
 * what was asked for, which is the difference between a list of two hundred rows
 * carrying one declaration each and carrying five.
 */
import type * as React from 'react';
import { WINDOW_CLASSES } from './window-class';
import type { MPResponsive, MPWindowClass } from '../types';

/** A bare value means "from `compact` up"; a map is already per class. */
export function classMap<T>(value: MPResponsive<T> | undefined): Partial<Record<MPWindowClass, T>> {
  if (value === undefined || value === null) {
    return {};
  }

  if (typeof value === 'object') {
    return value as Partial<Record<MPWindowClass, T>>;
  }

  return { compact: value };
}

/**
 * Turns a responsive value into the `--_mp-{name}-{class}` slots the stylesheet
 * reads, writing only the classes the caller actually named.
 *
 * `toCss` is the component's own, because what a number means is the component's
 * business: a span is a count, a gutter is a length on Tailwind's spacing scale,
 * a measure is either a rung of the size ladder or a length said outright.
 */
export function responsiveSlots<T>(
  name: string,
  value: MPResponsive<T> | undefined,
  toCss: (value: T) => string
): React.CSSProperties {
  const map = classMap(value);
  const slots: Record<string, string> = {};

  for (const windowClass of WINDOW_CLASSES) {
    const entry = map[windowClass];

    if (entry !== undefined) {
      slots[`--_mp-${name}-${windowClass}`] = toCss(entry);
    }
  }

  return slots as React.CSSProperties;
}

/**
 * Fills the `compact` entry of a partial map in with the prop's own default.
 *
 * Without this, `spacing={{ expanded: 8 }}` would be a grid with no gutter at all
 * below 840dp — the stylesheet's `0px` fallback rather than the documented 4 —
 * and a caller who widened one class would silently lose every class under it. A
 * map says "from here up, this instead"; it does not say "and nothing below".
 */
export function withBaseline<T>(value: MPResponsive<T> | undefined, baseline: T): MPResponsive<T> {
  if (value === undefined || value === null) {
    return baseline;
  }

  if (typeof value === 'object') {
    return { compact: baseline, ...(value as Partial<Record<MPWindowClass, T>>) };
  }

  return value;
}
