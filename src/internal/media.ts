/**
 * One `MediaQueryList` per query, for every part of the library that asks one.
 *
 * `window.matchMedia(query)` builds a new list each time it is called, and the
 * stores here read it in `getSnapshot` — which React calls on every render of
 * every component subscribed, and again to check nothing changed. A page of
 * animated cards asked for a fresh reduced-motion list per card per render. A
 * list answers for as long as the page is open, so one per query is kept.
 *
 * `null` where there is nothing to ask — a server, or a browser old enough to
 * have no `matchMedia`. Nothing is kept in that case: an entry written then
 * would outlive the environment that could not answer.
 */
const lists = new Map<string, MediaQueryList>();

export function mediaList(query: string): MediaQueryList | null {
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
