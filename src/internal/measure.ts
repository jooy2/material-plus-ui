/**
 * How wide content is allowed to get, and the ladder it is usually asked for on.
 *
 * A module of its own rather than a third table in `internal/scale.ts`, and the
 * reason is what `scale.ts` is: ladders of literal Tailwind class names, read by
 * nearly every component in the library. The measure stopped being one of those
 * when it started being read off `WINDOW_MIN` — and an `MPBox`, which wants a
 * padding ladder and nothing else, should not carry the window size classes into
 * its bundle to get one.
 *
 * Three components import this: `MPContainer`, `MPHeader` and `MPFooter`. They
 * are the three that hold content to a width while the sheet around it spans the
 * window, and they have to agree about where that edge is or the bar and the
 * article under it line up at every width but one.
 */
import { WINDOW_MIN } from './window-class';
import type { MPMeasure, MPSize } from '../types';

/**
 * The measure — how wide a row of content is allowed to get — as the window size
 * classes themselves.
 *
 * `maxWidth="md"` is "never wider than an expanded window", which is a sentence
 * about the specification rather than a number somebody liked. Tailwind's own
 * `max-w-*` scale is a different set — `max-w-lg` is 32rem — and two ladders
 * called `lg` on one page is how a layout drifts by a few pixels for no reason
 * anybody can find later.
 *
 * Read off `WINDOW_MIN` rather than written out. These were four `rem` values —
 * `37.5rem`, `52.5rem`, `75rem`, `100rem` — which are the four boundaries at a
 * 16px root and only at a 16px root: a reader who had scaled their text up got a
 * container that agreed with the media queries at no width at all. The pinning
 * was in the comment; now it is in the code, and a boundary that moves takes the
 * measure with it.
 *
 * `xs` is the one rung that is not a boundary. 480dp is below `medium`'s floor
 * and is there for the column of a sign-in card or a form, which wants to be
 * narrower than the narrowest window class.
 *
 * It is here rather than in `MPContainer`, which was its first reader, for the
 * reason at the top of this file: a header, a footer and a container that hold
 * their content to "an expanded window" have to agree on where that edge is, or
 * the bar and the article under it line up at every width but one.
 */
export const MEASURE: Record<MPSize, string> = {
  xs: '480px',
  sm: `${WINDOW_MIN.medium}px`,
  md: `${WINDOW_MIN.expanded}px`,
  lg: `${WINDOW_MIN.large}px`,
  xl: `${WINDOW_MIN['extra-large']}px`
};

/**
 * One `maxWidth`, as the length `max-width` is given.
 *
 * A rung of the ladder above, or anything else the caller wrote — which reaches
 * CSS untouched, so `'60ch'` and `'42rem'` are the same kind of answer as `'lg'`
 * rather than a second prop. See `MPMeasure`.
 */
export function measureValue(value: MPMeasure): string {
  return value in MEASURE ? MEASURE[value as MPSize] : value;
}
