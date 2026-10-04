/**
 * The `<head>` script that draws a remembered colour scheme before the first
 * paint, in a module of its own.
 *
 * Its own module so that it can be called from a server component. The hook it
 * belongs with imports React, which makes its module a client module, and a
 * function exported from a client module is a reference a server component can
 * pass along but not call — so `mpColorSchemeScript()` in a Next.js root layout,
 * which is exactly where the documentation puts it, failed the render. Nothing
 * here imports React.
 */
import { DEFAULT_STORAGE_KEY, SCHEME_ATTRIBUTE } from '../internal/color-scheme-keys';

export interface MPColorSchemeOptions {
  /**
   * Where the choice is remembered, in `localStorage`.
   *
   * Change it to keep two applications on one origin from sharing a theme, or
   * to namespace it under a product. It has to match the key given to
   * `mpColorSchemeScript`, or the page paints one scheme and then corrects
   * itself to the other.
   * @default 'mp-color-scheme'
   */
  storageKey?: string;
}

/**
 * The two lines that stop the first paint flashing, as a string to inline.
 *
 * A hook runs after the browser has already painted, so a reader who chose dark
 * gets a white page for a frame and then the right one. The only thing that can
 * run earlier is a **synchronous script in the `<head>`**, before the body is
 * parsed, and this is that script.
 *
 * ```tsx
 * // app/layout.tsx
 * <head>
 *   <script dangerouslySetInnerHTML={{ __html: mpColorSchemeScript() }} />
 * </head>
 * ```
 *
 * It reads the same key the hook does, writes the same attribute, and does
 * nothing at all when the stored value is absent or `system` — leaving the media
 * query to answer, which it does before the first paint anyway.
 *
 * Pass the same `storageKey` you pass the hook. Two different keys is a page
 * that paints one scheme and then corrects itself to the other, which is the
 * flash this exists to remove.
 *
 * The output is a JavaScript source string and contains no interpolated markup:
 * the key is JSON-encoded, so a key with a quote in it cannot end the script
 * early.
 *
 * ## It has to be inline
 *
 * A `<script src>` is fetched, and a fetch is exactly the delay being avoided.
 * If the page has a Content Security Policy without `unsafe-inline`, give the
 * tag a nonce — this returns the source, not the tag, so the tag is yours.
 */
export function mpColorSchemeScript(options: MPColorSchemeOptions = {}): string {
  const { storageKey = DEFAULT_STORAGE_KEY } = options;

  // Written on one line and wrapped in try/catch for the reason the hook's reads
  // are: storage throws in a private window, and a `<head>` script that throws
  // takes the rest of itself with it.
  return (
    `try{var s=localStorage.getItem(${JSON.stringify(storageKey)});` +
    `if(s==="dark"||s==="light")document.documentElement.setAttribute(${JSON.stringify(SCHEME_ATTRIBUTE)},s)}catch(e){}`
  );
}
