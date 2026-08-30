/**
 * What a component has to ask about a link it did not write.
 *
 * Four components render an `<a>` whose `target` a caller can set, and three of
 * them had worked out the same `rel` independently — which is three chances for
 * the fourth to forget, and the fourth did.
 *
 * Nothing here is exported from `src/index.ts`. It is the library talking to
 * itself, in the sense `internal/` always means.
 */

/**
 * The `rel` a link opening in a new tab needs, unless the caller named one.
 *
 * `target="_blank"` hands the opened page a `window.opener` back into this one
 * unless it is told not to. Modern browsers imply `noopener` and older ones do
 * not; `noreferrer` is never implied by anything, and is what stops the address
 * of the page the reader was on travelling to wherever they just went.
 *
 * A caller's own `rel` **replaces** this rather than extending it, which is the
 * bargain these components already documented: a row that also needs `nofollow`
 * says `rel="noopener noreferrer nofollow"` and means it. The alternative —
 * merging — is a component quietly adding tokens to an attribute the caller
 * wrote out in full.
 */
export function linkRel(target: string | undefined, rel: string | undefined): string | undefined {
  if (rel !== undefined) {
    return rel;
  }

  return target === '_blank' ? 'noopener noreferrer' : undefined;
}
