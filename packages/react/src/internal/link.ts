/**
 * The two questions a component has to ask about a URL it did not write.
 *
 * Four components render an `<a>` whose `target` a caller can set, and three of
 * them had worked out the same `rel` independently — which is three chances for
 * the fourth to forget, and the fourth did. One of them also renders a URL that
 * arrives from somewhere else entirely, which is a different question with a
 * worse failure.
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

/**
 * The characters a browser throws away before it looks at a scheme.
 *
 * A tab inside the word and a space in front of it are both `javascript:` by the
 * time navigation happens, so a check that reads the string as written is a
 * check that can be walked straight past. Every ASCII control character and
 * every Unicode space separator goes, because the set a URL parser strips is
 * wider than `\s` — and being generous costs nothing here, since no scheme
 * contains any of them.
 */
const IGNORED = /[\u0000-\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g;

/** `scheme:` at the front, in the grammar RFC 3986 gives it. */
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * The schemes a link may carry.
 *
 * An allowlist rather than a list of things to block, because the blocklist is
 * not knowable: `javascript:` is the famous one, `data:` will happily hold a
 * whole HTML document, and `vbscript:` still resolves in enough places to
 * matter. What a link in a message legitimately is, on the other hand, is a
 * short list.
 */
const ALLOWED = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * A URL if it is one a reader can safely be sent to, and nothing if it is not.
 *
 * This is for the URLs that arrive from **somewhere else** — the link preview on
 * a message somebody else sent — rather than for the ones an application writes
 * into its own navigation. React renders a `javascript:` href with a development
 * warning and no more, so on a page built out of user-generated content a
 * hostile preview URL is a one-click script execution.
 *
 * A URL with no scheme at all is relative, and a relative URL cannot escalate to
 * anything: it resolves against the page it is already on. Those pass.
 *
 * Rejected means `undefined`, so the element renders with no `href` — visibly
 * not a link, rather than a link that quietly goes nowhere. Half-sanitising a
 * URL into something that still navigates is how a filter becomes a bypass.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) {
    return undefined;
  }

  const scheme = SCHEME.exec(href.replace(IGNORED, ''));

  if (!scheme) {
    return href;
  }

  return ALLOWED.has(`${scheme[1].toLowerCase()}:`) ? href : undefined;
}
