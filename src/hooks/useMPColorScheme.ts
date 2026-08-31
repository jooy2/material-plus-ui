import * as React from 'react';
import {
  DEFAULT_STORAGE_KEY,
  SCHEME_ATTRIBUTE,
  setScheme,
  useChosenScheme,
  useSystemScheme,
  type MPColorScheme,
  type MPResolvedColorScheme
} from '../internal/color-scheme';

export type { MPColorScheme, MPResolvedColorScheme };

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

export interface MPColorSchemeResult {
  /**
   * What has been **chosen** — including `'system'`, which is the absence of a
   * choice rather than a third scheme. This is what a settings control should be
   * bound to: a three-way radio group is honest about the state, and a two-way
   * toggle bound to this cannot show "follow the system" at all.
   */
  scheme: MPColorScheme;
  /**
   * What is actually **painted**, with `'system'` resolved against the operating
   * system. This is what a page reads to draw a sun or a moon, or to pick an
   * image.
   */
  resolved: MPResolvedColorScheme;
  /** Whether the choice is `'system'`, spelled out because it reads better. */
  isSystem: boolean;
  /** Chooses a scheme. `'system'` gives the choice back to the operating system. */
  setScheme: (scheme: MPColorScheme) => void;
  /**
   * The other one of the two.
   *
   * From `'system'` it goes to the opposite of whatever is currently painted,
   * which is what a reader pressing a single button means by it — never back to
   * the scheme they are already looking at.
   */
  toggle: () => void;
}

/**
 * The page's colour scheme: what it is, and how to change it.
 *
 * The stylesheet has always had the switch — `prefers-color-scheme`, and
 * `data-mp-scheme` for a page that drives it itself. What it did not have was
 * anything to drive it *with*, so every application wrote the same three things:
 * a piece of state, a `localStorage` round trip, and a script in the `<head>` to
 * stop the first paint flashing.
 *
 * ```tsx
 * const { resolved, toggle } = useMPColorScheme();
 *
 * <MPIconButton
 *   icon={<MPIcon icon={resolved === 'dark' ? SunIcon : MoonIcon} />}
 *   label="Switch theme"
 *   onClick={toggle}
 * />;
 * ```
 *
 * ## Three states, not two
 *
 * `'system'` is the absence of a choice rather than a third scheme, and keeping
 * it is the point. A reader who has never touched the toggle should follow their
 * operating system *as it changes* — including at sunset, which is when a
 * two-state hook stops tracking and a page goes light in a dark room.
 *
 * `scheme` is what was chosen and `resolved` is what is painted. Bind a settings
 * control to the first and draw with the second.
 *
 * ## One page, one answer
 *
 * The choice lives in a module-level store rather than in each caller's state,
 * so a header's toggle and a settings screen's radio group are looking at the
 * same thing. Two components holding `useState` would each show what they last
 * set and neither would hear about the other.
 *
 * ## What it writes
 *
 * `data-mp-scheme` on `<html>`, and `'system'` **removes** it rather than
 * writing the word — that is how the media query gets its say back.
 *
 * It deliberately does not touch `.dark`. That class is what a project's own
 * Tailwind keys on, and a library reaching in to toggle a class it did not put
 * there is a library editing somebody else's markup. A page that wants both is
 * one line of its own in an effect.
 *
 * ## Storage can fail, and that is fine
 *
 * Reading and writing `localStorage` throws in a private window in some browsers
 * and behind some cookie policies. Both are caught: the toggle still works for
 * the visit and the choice is simply not remembered, which is much better than a
 * theme button that crashes the render.
 *
 * ## The first paint
 *
 * A hook cannot run before the page paints, so a remembered `dark` arrives one
 * frame late and the reader sees white. That is what `mpColorSchemeScript` is
 * for — see it for the two lines that go in the `<head>`.
 */
export function useMPColorScheme(options: MPColorSchemeOptions = {}): MPColorSchemeResult {
  const { storageKey = DEFAULT_STORAGE_KEY } = options;

  const scheme = useChosenScheme(storageKey);
  const system = useSystemScheme();
  const resolved = scheme === 'system' ? system : scheme;

  const choose = React.useCallback(
    (next: MPColorScheme) => setScheme(storageKey, next),
    [storageKey]
  );

  const toggle = React.useCallback(
    // From `system`, the opposite of what is on the screen — a reader pressing
    // one button never means "give me the scheme I am already looking at".
    () => setScheme(storageKey, resolved === 'dark' ? 'light' : 'dark'),
    [storageKey, resolved]
  );

  return React.useMemo(
    () => ({
      scheme,
      resolved,
      isSystem: scheme === 'system',
      setScheme: choose,
      toggle
    }),
    [scheme, resolved, choose, toggle]
  );
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
