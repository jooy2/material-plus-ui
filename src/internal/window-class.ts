/**
 * Material's window size classes, as numbers rather than as class names.
 *
 * `MPWindowClass` in `src/types.ts` says what the five are and why they are the
 * specification's ladder rather than Tailwind's. This is where the boundaries
 * live for everything written in JavaScript — the hook, the sidebar's collapse,
 * the measure `MPContainer` holds content to — and they are asked for rather
 * than written out, because a second spelling of a boundary is a second place it
 * can be wrong.
 *
 * The numbers are MD3's own: 600, 840, 1200 and 1600dp, with `compact` running
 * from zero up to the first of them. An `MPConfigProvider` can move them; see
 * `useWindowMins`.
 *
 * ## The other half
 *
 * The stylesheet cannot read these. A media query resolves before any of this
 * runs and cannot name a custom property, so the same four widths are declared a
 * second time in `src/styles.css` — as the `@custom-variant mp-*` block, which
 * is what every `@variant` in that file is written against.
 *
 * That is one duplication the library cannot remove, so it is checked instead:
 * `test/styles/breakpoints.test.tsx` reads both ladders and fails if they ever
 * stop agreeing. A page whose stylesheet reflows at 600 and whose hook says
 * `compact` until 640 is wrong at exactly one range of widths, which is the
 * hardest kind of wrong to be shown.
 */
import * as React from 'react';
import { MPConfigContext } from './config';
import type { MPWindowClass } from '../types';

/** Smallest first, which is also the order the media queries have to be in. */
export const WINDOW_CLASSES: readonly MPWindowClass[] = [
  'compact',
  'medium',
  'expanded',
  'large',
  'extra-large'
];

/**
 * The width each class starts at, in CSS pixels.
 *
 * A class runs from its own entry up to the next one's, so the test is `>=` and
 * the widest matching class wins. `compact` starts at zero because there is no
 * window narrower than no window.
 */
export const WINDOW_MIN: Record<MPWindowClass, number> = {
  compact: 0,
  medium: 600,
  expanded: 840,
  large: 1200,
  'extra-large': 1600
};

/**
 * The media query a floor is, and the one below it.
 *
 * A width rather than a class name, because the floors are no longer constants:
 * whose ladder is being asked about is the caller's business and this only
 * knows how to say one. Nought has no query — every window is at least that
 * wide — and both return `null` there, which a caller reads as "there is nothing
 * to watch".
 */
export function atLeast(min: number): string | null {
  return min > 0 ? `(width >= ${min}px)` : null;
}

export function below(min: number): string | null {
  return min > 0 ? `(width < ${min}px)` : null;
}

/**
 * The floors in force at this point in the tree.
 *
 * MD3's, with whatever an `MPConfigProvider` moved written over them. `compact`
 * is forced back to nought whatever it was given: a class whose floor is above
 * zero leaves a band of windows in no class at all.
 *
 * The object is rebuilt on every call rather than memoised, and deliberately —
 * every caller turns it into a number or a string before doing anything with it,
 * so its identity is never a dependency of anything. Memoising it would be a
 * `useMemo` whose own dependency is the identity of a prop callers write inline.
 */
export function useWindowMins(): Record<MPWindowClass, number> {
  const { breakpoints } = React.useContext(MPConfigContext);

  return breakpoints ? { ...WINDOW_MIN, ...breakpoints, compact: 0 } : WINDOW_MIN;
}

/** A ladder as one primitive, which is what makes it usable as a hook's dependency. */
function keyOf(mins: Record<MPWindowClass, number>): string {
  return WINDOW_CLASSES.map((name) => mins[name]).join(',');
}

interface Ladder {
  /** The classes that have a floor to watch, smallest first. */
  classes: MPWindowClass[];
  /** One `matchMedia` list each, in the same order. */
  lists: MediaQueryList[];
}

const NOTHING: Ladder = { classes: [], lists: [] };

/**
 * One `matchMedia` list per boundary, made once and kept.
 *
 * Four lists rather than a `resize` listener, which is the difference between
 * being told when the *answer* changes and being told about every pixel of a
 * drag. A window dragged from 500 to 1900 fires four times here and several
 * hundred times there, and the four are the only ones that could change what
 * this hook returns.
 *
 * Keyed by the ladder rather than held in one variable, because a page can now
 * have more than one — an `MPConfigProvider` that moved a boundary, around a
 * part of a page that has not. The common case is still one entry that every
 * caller shares: a page with the hook in six components subscribes six times to
 * four lists rather than making twenty-four of them.
 *
 * The no-`matchMedia` case caches nothing. There is nothing to cache, and an
 * entry written then would outlive the environment that could not answer.
 */
const ladders = new Map<string, Ladder>();

function ladderFor(key: string): Ladder {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return NOTHING;
  }

  let found = ladders.get(key);

  if (!found) {
    const mins = key.split(',').map(Number);
    const rungs = WINDOW_CLASSES.map((name, index) => [name, mins[index]] as const).filter(
      ([, min]) => min > 0
    );

    found = {
      classes: rungs.map(([name]) => name),
      lists: rungs.map(([, min]) => window.matchMedia(atLeast(min) as string))
    };
    ladders.set(key, found);
  }

  return found;
}

function subscribe(key: string, onChange: () => void): () => void {
  const { lists } = ladderFor(key);

  for (const list of lists) {
    list.addEventListener('change', onChange);
  }

  return () => {
    for (const list of lists) {
      list.removeEventListener('change', onChange);
    }
  };
}

/**
 * The class the window is in right now.
 *
 * Read off the media queries rather than off `innerWidth`, so the answer agrees
 * with the one the stylesheet is using. `innerWidth` includes a classic
 * scrollbar and a media query does not, and a 615px window with a 15px scrollbar
 * is `medium` to CSS and `compact` to arithmetic — which is a layout whose
 * JavaScript and whose stylesheet disagree at exactly one width.
 */
function snapshot(key: string, fallback: MPWindowClass): MPWindowClass {
  const { classes, lists } = ladderFor(key);

  // No `matchMedia` at all — a server, or a browser old enough that there is no
  // way to ask. The caller's own answer rather than a guess of ours, and the
  // same answer in both cases: "there is no window to measure" is one situation,
  // and giving it two different replies would be a hook that quietly changed its
  // mind depending on *why* it could not measure.
  if (lists.length === 0) {
    return fallback;
  }

  let match: MPWindowClass = WINDOW_CLASSES[0];

  classes.forEach((name, index) => {
    if (lists[index]?.matches) {
      match = name;
    }
  });

  return match;
}

/**
 * `useSyncExternalStore` rather than an effect and a `useState`, for the reason
 * `useMPCollapsed` gives: the hook needs a **server snapshot**, and this is the
 * one API that tells React the server's answer and the client's are meant to
 * differ. An effect would render the wrong layout once and then correct it,
 * which React would not know to expect.
 *
 * The ladder reaches the store as a string. Everything `useSyncExternalStore`
 * is given has to be stable between renders or it resubscribes on each one, and
 * a `breakpoints` prop written inline — which is how anybody would write it — is
 * a new object every time its provider renders.
 */
export function useWindowClass(onServer: MPWindowClass): MPWindowClass {
  const key = keyOf(useWindowMins());

  const listen = React.useCallback((onChange: () => void) => subscribe(key, onChange), [key]);
  const read = React.useCallback(() => snapshot(key, onServer), [key, onServer]);

  return React.useSyncExternalStore(listen, read, read);
}
