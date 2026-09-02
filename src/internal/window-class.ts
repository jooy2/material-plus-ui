/**
 * Material's window size classes, as numbers rather than as class names.
 *
 * `MPWindowClass` in `src/types.ts` says what the five are and why they are the
 * specification's ladder rather than Tailwind's. This is where the boundaries
 * live for everything written in JavaScript — the hook, the sidebar's collapse,
 * the classes a visibility rule is chosen from — and they are asked for rather
 * than written out, because a second spelling of a boundary is a second place it
 * can be wrong.
 *
 * The numbers are MD3's own: 600, 840, 1200 and 1600dp, with `compact` running
 * from zero up to the first of them.
 *
 * ## The other half
 *
 * The stylesheet cannot read these. A media query resolves before any of this
 * runs and cannot name a custom property, so the same four widths are declared a
 * second time in `src/styles.css` — as `--breakpoint-mp-*` in its `@theme`,
 * which is what every `@variant` in that file is written against.
 *
 * That is one duplication the library cannot remove, so it is checked instead:
 * `test/styles/breakpoints.test.tsx` reads both ladders and fails if they ever
 * stop agreeing. A page whose stylesheet reflows at 600 and whose hook says
 * `compact` until 640 is wrong at exactly one range of widths, which is the
 * hardest kind of wrong to be shown.
 */
import * as React from 'react';
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
 * The media query a class's floor is, and the one below it.
 *
 * Written here rather than at the two call sites that used to spell them out,
 * for the reason the numbers themselves are: a query is the boundary said in
 * another vocabulary, and a second spelling of a boundary is a second place it
 * can be wrong. `compact` has no floor to ask about — every window is at least
 * nought wide — so both return `null` for it and a caller reads that as "there
 * is nothing to watch".
 */
export function atLeast(windowClass: MPWindowClass): string | null {
  const min = WINDOW_MIN[windowClass];

  return min > 0 ? `(width >= ${min}px)` : null;
}

export function below(windowClass: MPWindowClass): string | null {
  const min = WINDOW_MIN[windowClass];

  return min > 0 ? `(width < ${min}px)` : null;
}

/** Which class a width falls in. Widest match wins. */
export function windowClassFor(width: number): MPWindowClass {
  let match: MPWindowClass = 'compact';

  for (const name of WINDOW_CLASSES) {
    if (width >= WINDOW_MIN[name]) {
      match = name;
    }
  }

  return match;
}

/**
 * One `matchMedia` list per boundary, made once and kept.
 *
 * Four lists rather than a `resize` listener, which is the difference between
 * being told when the *answer* changes and being told about every pixel of a
 * drag. A window dragged from 500 to 1900 fires four times here and several
 * hundred times there, and the four are the only ones that could change what
 * this hook returns.
 *
 * They are module-level because they are the same four queries for every caller.
 * A page with a hook in six components subscribes six times to four lists rather
 * than making twenty-four of them.
 */
let lists: MediaQueryList[] | null = null;

function queryLists(): MediaQueryList[] {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return [];
  }

  lists ??= WINDOW_CLASSES.map(atLeast)
    .filter((query): query is string => query !== null)
    .map((query) => window.matchMedia(query));

  return lists;
}

function subscribe(onChange: () => void): () => void {
  const all = queryLists();

  for (const list of all) {
    list.addEventListener('change', onChange);
  }

  return () => {
    for (const list of all) {
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
function snapshot(fallback: MPWindowClass): MPWindowClass {
  const all = queryLists();

  // No `matchMedia` at all — a server, or a browser old enough that there is no
  // way to ask. The caller's own answer rather than a guess of ours, and the
  // same answer in both cases: "there is no window to measure" is one situation,
  // and giving it two different replies would be a hook that quietly changed its
  // mind depending on *why* it could not measure.
  if (all.length === 0) {
    return fallback;
  }

  let match: MPWindowClass = 'compact';
  let index = 0;

  for (const name of WINDOW_CLASSES) {
    if (WINDOW_MIN[name] === 0) {
      continue;
    }

    if (all[index]?.matches) {
      match = name;
    }

    index += 1;
  }

  return match;
}

/**
 * `useSyncExternalStore` rather than an effect and a `useState`, for the reason
 * `useMPCollapsed` gives: the hook needs a **server snapshot**, and this is the
 * one API that tells React the server's answer and the client's are meant to
 * differ. An effect would render the wrong layout once and then correct it,
 * which React would not know to expect.
 */
export function useWindowClass(onServer: MPWindowClass): MPWindowClass {
  const read = React.useCallback(() => snapshot(onServer), [onServer]);

  return React.useSyncExternalStore(subscribe, read, read);
}
