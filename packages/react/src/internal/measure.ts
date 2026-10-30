/**
 * How wide content is allowed to get, and the ladder it is usually asked for on.
 *
 * A module of its own rather than a third table in `internal/scale.ts`, and the
 * reason is what `scale.ts` is: ladders of literal Tailwind class names, read by
 * nearly every component in the library. The measure stopped being one of those
 * when it started being read off the window size classes — and an `MPBox`, which
 * wants a padding ladder and nothing else, should not carry those into its
 * bundle to get one.
 *
 * Three components import this: `MPContainer`, `MPHeader` and `MPFooter`. They
 * are the three that hold content to a width while the sheet around it spans the
 * window, and they have to agree about where that edge is or the bar and the
 * article under it line up at every width but one.
 */
import type { MPMeasure, MPSize, MPWindowClass } from '../types';

/**
 * Which window size class each rung of the ladder is the floor of.
 *
 * `maxWidth="md"` is "never wider than an expanded window", which is a sentence
 * about the specification rather than a number somebody liked. Tailwind's own
 * `max-w-*` scale is a different set — `max-w-lg` is 32rem — and two ladders
 * called `lg` on one page is how a layout drifts by a few pixels for no reason
 * anybody can find later.
 *
 * `xs` is the one rung that is not a boundary, which is what the `null` says. It
 * is there for the column of a sign-in card or a form, which wants to be
 * narrower than the narrowest window class is.
 */
const RUNG: Record<MPSize, MPWindowClass | null> = {
  xs: null,
  sm: 'medium',
  md: 'expanded',
  lg: 'large',
  xl: 'extra-large'
};

/** The rung below the ladder, in CSS pixels. */
const NARROWER_THAN_COMPACT = 480;

/**
 * One `maxWidth`, as the length `max-width` is given.
 *
 * A rung of the ladder above, resolved against the boundaries in force where the
 * component is — so a page that moved one with `MPConfigProvider` moves its
 * measures too — or anything else the caller wrote, which reaches CSS untouched.
 * `'60ch'` and `'42rem'` are the same kind of answer as `'lg'` rather than a
 * second prop. See `MPMeasure`.
 *
 * The rungs were once four `rem` values written out — `37.5rem`, `52.5rem`,
 * `75rem`, `100rem` — which are the four boundaries at a 16px root and only at a
 * 16px root. A reader who had scaled their text up got a container that agreed
 * with the media queries at no width at all.
 */
export function measureValue(value: MPMeasure, mins: Record<MPWindowClass, number>): string {
  if (!(value in RUNG)) {
    return value;
  }

  const windowClass = RUNG[value as MPSize];

  return `${windowClass ? mins[windowClass] : NARROWER_THAN_COMPACT}px`;
}
