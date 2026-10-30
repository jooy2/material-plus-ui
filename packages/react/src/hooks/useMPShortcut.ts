import * as React from 'react';
import { matchesShortcut, useDetectedOS, type MPResolvedOS } from '../internal/keys';

/** The three platforms a shortcut is spelled for. */
export type { MPResolvedOS };

/** Where the keystroke is listened for, and what happens to it. */
export interface MPShortcutOptions {
  /**
   * Turns the binding off without unmounting whatever holds it. A shortcut
   * behind a feature flag, or one that belongs to a panel that is closed.
   * @default true
   */
  enabled?: boolean;
  /**
   * Calls `preventDefault()` on the matching keystroke.
   *
   * On by default, and it is the honest default: some browsers put their own
   * search bar on `Mod+K`, and a page binding that combination has said the key
   * is theirs. Switch it off for a shortcut that means to run *alongside* the
   * browser's, which is rare enough to be worth writing down.
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Ignores the keystroke while the focus is in a text input, a textarea or
   * anything `contenteditable`.
   *
   * Off by default, because the shortcut most pages bind has a modifier and
   * `Mod+K` typed into a search field still means "open the palette". Switch it
   * on for a **bare** key — `/` to focus search, `?` for help — which would
   * otherwise be swallowed out of the middle of somebody's sentence.
   * @default false
   */
  ignoreInputs?: boolean;
  /**
   * What the listener is attached to.
   * @default the window
   */
  target?: EventTarget | null;
}

const EDITABLE = /^(input|textarea|select)$/i;

/** Whether the keystroke landed somewhere a person is writing. */
function isEditing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return EDITABLE.test(target.tagName) || target.isContentEditable;
}

/**
 * Runs something when a keystroke arrives, spelled the way this library spells
 * shortcuts everywhere else.
 *
 * `MPShortcut` **writes** a shortcut down, `MPCommandPalette` **reads** one off
 * a real keyboard, and both have always gone through one matcher so that a label
 * on the screen and the binding under it cannot disagree — see `internal/keys.ts`
 * for the day they did. This is that matcher, for the shortcuts an application
 * binds itself.
 *
 * ```tsx
 * useMPShortcut('Mod+K', () => setOpen(true));
 * useMPShortcut('/', focusSearch, { ignoreInputs: true });
 * ```
 *
 * ## `Mod` is the whole point
 *
 * It resolves to Command on a Mac and Control everywhere else, which is what
 * lets one string be both the binding and the label:
 *
 * ```tsx
 * <MPShortcut keys="Mod+K" />;
 * useMPShortcut('Mod+K', open);
 * ```
 *
 * Two lines, one spelling, and no way for the page to draw `⌘K` while listening
 * for `Ctrl+K`.
 *
 * Modifiers are matched in **both** directions: `Mod+K` does not fire when Shift
 * is also held, because that combination may belong to something else. A
 * shortcut that ignored extra modifiers would be quietly taking keystrokes it
 * was not given.
 *
 * ## The handler is not a dependency
 *
 * It is kept in a ref and read at the moment the key arrives, so an inline arrow
 * function is fine and does not rebind the listener on every render. What *does*
 * rebind is the shortcut itself, `enabled`, and `target` — the things that change
 * what is being listened for.
 *
 * ## Sharp edges
 *
 * - **It listens on the window**, so it fires wherever the focus is unless
 *   `ignoreInputs` says otherwise. That is what a page-wide shortcut wants and
 *   not what a shortcut belonging to one panel wants — pass that panel's element
 *   as `target`.
 * - **It does not stop propagation.** A page with two hooks bound to one
 *   combination runs both, which is a collision the page has to resolve rather
 *   than something the hook can guess at.
 * - **The platform is detected once.** It cannot change under a running page.
 */
export function useMPShortcut(
  keys: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: MPShortcutOptions = {}
): void {
  const { enabled = true, preventDefault = true, ignoreInputs = false, target } = options;
  const os = useDetectedOS();

  // Read at the moment the key arrives rather than closed over, so a caller's
  // inline arrow does not tear the listener down and put it back every render.
  const latest = React.useRef(handler);
  latest.current = handler;

  // An array written inline is a new array every render and would rebind on each
  // one. The joined spelling is what actually decides the binding, so that is
  // what the effect depends on.
  const spelling = Array.isArray(keys) ? keys.join('+') : keys;

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const node = target === undefined ? (typeof window === 'undefined' ? null : window) : target;

    if (!node) {
      return;
    }

    const onKeyDown = (event: Event) => {
      const keyboard = event as KeyboardEvent;

      if (ignoreInputs && isEditing(keyboard.target)) {
        return;
      }

      if (!matchesShortcut(keyboard, spelling, os)) {
        return;
      }

      if (preventDefault) {
        keyboard.preventDefault();
      }

      latest.current(keyboard);
    };

    node.addEventListener('keydown', onKeyDown);

    return () => node.removeEventListener('keydown', onKeyDown);
  }, [spelling, os, enabled, preventDefault, ignoreInputs, target]);
}

/**
 * Which keyboard the reader is on — `'mac'`, `'windows'` or `'linux'`.
 *
 * The same detection `MPShortcut` prints its key caps from, exported so an
 * application writing a key cap of its own cannot end up on a different answer
 * from the component beside it. Three sources are matched at once —
 * `userAgentData.platform`, `navigator.platform` and the user agent string —
 * because the question is coarse and browsers freeze or lie about each of them
 * separately.
 *
 * `'windows'` on a server, and corrected on hydration through
 * `useSyncExternalStore` — which is the one API that tells React the two renders
 * are *meant* to differ, and is exactly the sequence a Mac reader sees.
 */
export function useMPPlatform(): MPResolvedOS {
  return useDetectedOS();
}
