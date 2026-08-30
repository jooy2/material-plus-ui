import * as React from 'react';

/**
 * What keyboard the reader is on, and how a shortcut is spelled.
 *
 * Two components speak this vocabulary and they speak it in opposite
 * directions: [MPShortcut](../components/shortcut/MPShortcut.tsx) *writes* a
 * shortcut down, and [MPCommandPalette](../components/command-palette/MPCommandPalette.tsx)
 * *reads* one off a real keyboard event. Both files already said that the two
 * had to agree — "a shortcut a component displays and one it binds have to be
 * spelled the same way, or the label on the screen is a claim nobody checked" —
 * and both then answered the question separately.
 *
 * They disagreed. The palette tested `navigator.userAgent` alone, which is the
 * one of the three sources a browser is most willing to freeze or lie about, so
 * a page could draw `⌘K` and bind Ctrl+K. Written once, they cannot.
 *
 * Nothing here is exported from `src/index.ts`. It is the library talking to
 * itself, in the sense `internal/` always means.
 */

/** The three real platforms a shortcut is spelled for. */
export type MPResolvedOS = 'mac' | 'windows' | 'linux';

/**
 * What the browser says it is running on.
 *
 * `userAgentData.platform` is the modern spelling and `navigator.platform` the
 * deprecated one that every browser still answers; the user agent string is the
 * last resort. All three are matched at once because the question is coarse —
 * which of three key caps to print — and getting it slightly wrong is a label,
 * not a bug.
 */
export function detectOS(): MPResolvedOS {
  if (typeof navigator === 'undefined') {
    return 'windows';
  }

  const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const haystack = `${data?.platform ?? ''} ${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`;

  if (/mac|iphone|ipad|ipod/i.test(haystack)) {
    return 'mac';
  }

  if (/win/i.test(haystack)) {
    return 'windows';
  }

  return 'linux';
}

/** The platform never changes under a running page, so there is nothing to subscribe to. */
function subscribe() {
  return () => {};
}

function serverOS(): MPResolvedOS {
  return 'windows';
}

/**
 * `useSyncExternalStore` rather than `useEffect` plus state, and rather than
 * reading `navigator` during render.
 *
 * Reading it during render is a hydration mismatch waiting to happen: the server
 * has no `navigator`, so it would render `Ctrl` and the client would render `⌘`
 * into the same markup. This hook is the one API that tells React the two are
 * *meant* to differ — it hydrates with the server's answer and re-renders with
 * the browser's, which is exactly the sequence a Mac reader sees.
 */
export function useDetectedOS(): MPResolvedOS {
  return React.useSyncExternalStore(subscribe, detectOS, serverOS);
}

/**
 * Splits the string form. Empty segments are what `'Ctrl++'` leaves behind, and
 * dropping them is why the array form exists for that case.
 */
export function tokenizeShortcut(keys: string | string[]): string[] {
  if (Array.isArray(keys)) {
    return keys.map((key) => key.trim()).filter(Boolean);
  }

  return keys
    .split('+')
    .map((key) => key.trim())
    .filter(Boolean);
}

/**
 * Whether a keyboard event is the shortcut this string names.
 *
 * The same vocabulary `MPShortcut` draws, read rather than written — and the
 * same tokenizer, so a shortcut that can be displayed is a shortcut that can be
 * matched.
 *
 * ## `Mod` is a name for a key, not a fifth modifier
 *
 * It resolves to Command on a Mac and Control everywhere else, so `Mod+K` and
 * `Ctrl+K` are the *same combination* on Windows — and the check has to say so.
 * Tested as a modifier of its own, they contradicted each other: `Ctrl+K` on
 * Windows held Control, `Mod` was not named, and "is Control down without Mod
 * being asked for" answered no. `Ctrl+K` simply never matched anywhere except a
 * Mac, on the component whose whole job is to answer a shortcut.
 *
 * So `Mod` is folded into whichever real key it stands for, and the four
 * modifiers are then compared as themselves.
 *
 * Each is checked in **both** directions. A shortcut that fired with extra
 * modifiers held would take a combination the page had given to something else.
 *
 * The platform is passed rather than sniffed, so a caller reads it through the
 * same hook the label does and the two cannot end up on different answers.
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string | string[],
  os: MPResolvedOS
): boolean {
  const parts = tokenizeShortcut(shortcut).map((part) => part.toLowerCase());
  const key = parts[parts.length - 1];

  if (key === undefined) {
    return false;
  }

  const wanted = new Set(parts.slice(0, -1));
  const mod = wanted.has('mod');

  const ctrl = wanted.has('ctrl') || (mod && os !== 'mac');
  const meta = wanted.has('meta') || (mod && os === 'mac');

  if (ctrl !== event.ctrlKey || meta !== event.metaKey) {
    return false;
  }

  if (wanted.has('shift') !== event.shiftKey || wanted.has('alt') !== event.altKey) {
    return false;
  }

  return event.key.toLowerCase() === key;
}
