import * as React from 'react';

/**
 * Whether a media query matches, and it re-renders when that changes.
 *
 * The general form of what this library already does four times over for the
 * window size classes, and once each for `prefers-reduced-motion` and the
 * colour scheme. A page has questions of its own — is this a coarse pointer, is
 * the window tall enough for a two-row bar, is the reader in a high-contrast
 * mode — and had to write the subscription out again to ask one.
 *
 * ```tsx
 * const coarse = useMPMediaQuery('(pointer: coarse)');
 *
 * <MPTooltip disabled={coarse}>…</MPTooltip>;
 * ```
 *
 * ## Reach for `useMPWindowClass` for a width
 *
 * A width query written here is a copy of a number the library also holds, and
 * the two drift the moment an `MPConfigProvider` moves a boundary. Ask
 * [useMPWindowClass](#usempwindowclass) instead — it reads the same ladder the
 * grid and the sidebar do.
 *
 * ## On a server, and before hydration
 *
 * `onServer`, which defaults to `false`. There is no window to ask, and a
 * default of "matches" would mean every server-rendered page claiming every
 * preference at once.
 *
 * `useSyncExternalStore` is what makes the correction on hydration legitimate
 * rather than a mismatch React warns about — but it is a second render, so
 * anything that swaps a whole layout on this does so visibly on a first load.
 * Where that matters the answer is CSS, which has no first render to be wrong.
 *
 * A browser without `matchMedia` gets the same `onServer` answer, for the same
 * reason: there is no way to ask, and a guess is worse than the caller's own.
 *
 * @param query any CSS media query, without the `@media`.
 * @param onServer what to answer where there is nothing to ask. @default false
 */
export function useMPMediaQuery(query: string, onServer = false): boolean {
  /*
   * One list per query string, made once and shared.
   *
   * The same trade `internal/window-class.ts` makes for its four boundaries: a
   * page asking `(pointer: coarse)` in six components subscribes six times to
   * one list rather than making six of them. The map is keyed by the query
   * because that is what identifies a list — two callers writing the same string
   * are asking the same question.
   *
   * `useSyncExternalStore` needs `subscribe` and `getSnapshot` to be stable
   * across renders or it resubscribes on every one, which is why both are
   * memoised on the query rather than written inline.
   */
  const list = React.useMemo(() => listFor(query), [query]);

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!list) {
        return () => {};
      }

      list.addEventListener('change', onChange);

      return () => list.removeEventListener('change', onChange);
    },
    [list]
  );

  const getSnapshot = React.useCallback(() => (list ? list.matches : onServer), [list, onServer]);
  const getServerSnapshot = React.useCallback(() => onServer, [onServer]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const lists = new Map<string, MediaQueryList>();

/**
 * `null` where there is nothing to ask — a server, or a browser old enough to
 * have no `matchMedia`. Nothing is cached in that case: an entry written then
 * would outlive the environment that could not answer.
 */
function listFor(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  let found = lists.get(query);

  if (!found) {
    found = window.matchMedia(query);
    lists.set(query, found);
  }

  return found;
}
