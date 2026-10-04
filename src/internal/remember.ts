/**
 * The size limit the library's caches share, kept apart from the caches.
 *
 * `internal/intl.ts` builds its formatter caches as it loads, and a bundler
 * cannot drop that, so importing the limit from there brought every formatter
 * cache along. `internal/i18n.ts` is read by every component with a word to
 * say, which put them in a bundle holding nothing but a button.
 */

/**
 * How many entries a cache in this library holds before it starts forgetting.
 *
 * The caches are keyed on a locale and an options object, and the options are a
 * caller's prop — so how many distinct keys there are is not something this file
 * gets to decide. A table formatting a number per row against a per-row format
 * would add an `Intl.NumberFormat` to a `Map` that never dropped one, for as
 * long as the page was open. Nothing has ever reported that, and a cache with no
 * ceiling is still a leak with a slow fuse.
 *
 * Sixty-four is far above what a page uses. A chart asks for two or three
 * shapes, a statistic for two, and every component on the page shares them; the
 * limit is for the case nobody planned rather than the case everybody has.
 */
export const CACHE_LIMIT = 64;

/**
 * Puts an entry in, and drops the oldest if that took the map over the line.
 *
 * A `Map` iterates in insertion order, so its first key is its oldest — which
 * makes the eviction one delete rather than a data structure.
 *
 * Not a true LRU: reading an entry does not renew it, so a formatter used on
 * every render could in principle be evicted by sixty-four newer ones. It would
 * be rebuilt on the next call, which costs exactly what the miss it already was
 * cost — and tracking use would mean writing to the map on every *read*, which
 * is the hot path this whole thing exists to keep cheap.
 */
export function remember<Value>(cache: Map<string, Value>, key: string, value: Value): Value {
  cache.set(key, value);

  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next();

    if (!oldest.done) {
      cache.delete(oldest.value);
    }
  }

  return value;
}
