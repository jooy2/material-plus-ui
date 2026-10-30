import * as React from 'react';
import {
  DEFAULT_STORAGE_KEY,
  SCHEME_ATTRIBUTE,
  applyScheme,
  setScheme,
  useChosenScheme,
  useSystemScheme,
  type MPColorScheme,
  type MPResolvedColorScheme
} from '../internal/color-scheme';
import type { MPColorSchemeOptions } from './mpColorSchemeScript';

export type { MPColorScheme, MPColorSchemeOptions, MPResolvedColorScheme };

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

  /*
   * A remembered choice is drawn once the page has hydrated, when nothing drew
   * it earlier.
   *
   * The choice is read from storage, but the attribute that draws it was only
   * ever written by `setScheme` — so on a page without `mpColorSchemeScript`
   * in its `<head>` the hook reported the remembered `dark` while the page
   * stayed light for the whole visit. With the script the attribute is already
   * there and this does nothing.
   */
  React.useEffect(() => {
    if (scheme !== 'system' && document.documentElement.getAttribute(SCHEME_ATTRIBUTE) === null) {
      applyScheme(scheme);
    }
  }, [scheme]);

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
