/**
 * The scheme switch, as a store rather than as a piece of component state.
 *
 * A page has **one** colour scheme, and a hook holding it in `useState` would
 * give every caller a scheme of its own: a header's toggle and a settings
 * screen's radio group would each show what they last set and neither would
 * hear about the other. So the choice lives here, next to the attribute it
 * writes, and every hook subscribes to it.
 *
 * What is written is `data-mp-scheme` on the document element, which is one of
 * the two ways into the dark block in `styles.css` — see the note there. The
 * class form is left alone: `.dark` is what a project's *own* Tailwind is
 * keying on, and a library that reached in and toggled it would be moving a
 * class it did not put there.
 */
import * as React from 'react';

/** What a page can be set to. `'system'` is the absence of a choice. */
export type MPColorScheme = 'light' | 'dark' | 'system';

/** What is actually painted, once `'system'` has been resolved. */
export type MPResolvedColorScheme = 'light' | 'dark';

export const SCHEME_ATTRIBUTE = 'data-mp-scheme';
export const DEFAULT_STORAGE_KEY = 'mp-color-scheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isScheme(value: unknown): value is MPColorScheme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * The chosen scheme, and the listeners waiting on it.
 *
 * Module-level for the reason at the top: one page, one answer. `undefined`
 * means nothing has read storage yet, which is distinct from `'system'` — the
 * first read is deferred to the browser so that a server render and the markup
 * it produces do not depend on a `localStorage` there is none of.
 */
let current: MPColorScheme | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function readStored(storageKey: string): MPColorScheme {
  try {
    // The `typeof` guard is *inside* the try, which is not tidiness. Where a
    // policy blocks storage the global is a throwing getter rather than a
    // missing binding, and `typeof` does not protect a caller from that — it
    // evaluates the getter like anything else. A guard outside the try threw
    // before the try could catch it.
    if (typeof localStorage === 'undefined') {
      return 'system';
    }

    const stored = localStorage.getItem(storageKey);

    return isScheme(stored) ? stored : 'system';
  } catch {
    // Reading storage throws in a private window in some browsers, and behind a
    // cookie policy that blocks it. A page whose theme toggle crashed the render
    // would be worse than a page that forgets the choice.
    return 'system';
  }
}

function write(storageKey: string, scheme: MPColorScheme) {
  try {
    if (scheme === 'system') {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, scheme);
    }
  } catch {
    // Same as above: remembering is a convenience, and failing to is not a
    // reason to stop the toggle working for this visit.
  }
}

/**
 * Puts the choice on the document element, or takes it off.
 *
 * `'system'` **removes** the attribute rather than writing it, which is the
 * whole of how the media query gets its say back: the dark block is reached
 * either by `prefers-color-scheme` on a root that is not forced light, or by the
 * attribute. An attribute spelling out `system` would match neither.
 */
export function applyScheme(scheme: MPColorScheme) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (scheme === 'system') {
    root.removeAttribute(SCHEME_ATTRIBUTE);
  } else {
    root.setAttribute(SCHEME_ATTRIBUTE, scheme);
  }
}

export function setScheme(storageKey: string, scheme: MPColorScheme) {
  current = scheme;
  write(storageKey, scheme);
  applyScheme(scheme);
  emit();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
}

/**
 * The chosen scheme, worked out the first time anybody asks.
 *
 * The **attribute wins over storage**, and the order matters. A page that ran
 * `mpColorSchemeScript` in its `<head>`, or that rendered the attribute from a
 * cookie on the server, is already painting a scheme — so that is what the page
 * is in, and a hook that reported storage instead would disagree with what is on
 * the screen. The two normally say the same thing; where they do not, the one
 * that is drawn is the true one.
 */
function snapshot(storageKey: string): MPColorScheme {
  current ??= adoptDocumentScheme() ?? readStored(storageKey);

  return current;
}

export function useChosenScheme(storageKey: string): MPColorScheme {
  const read = React.useCallback(() => snapshot(storageKey), [storageKey]);

  // The server has no storage and no attribute to have written, so it renders
  // the absence of a choice. `useSyncExternalStore` is what makes the client's
  // different answer a correction rather than a mismatch.
  return React.useSyncExternalStore(subscribe, read, () => 'system' as MPColorScheme);
}

function subscribeToSystem(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const query = window.matchMedia(DARK_QUERY);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
}

function systemSnapshot(): MPResolvedColorScheme {
  return typeof window !== 'undefined' && window.matchMedia?.(DARK_QUERY).matches
    ? 'dark'
    : 'light';
}

/**
 * What the operating system is asking for, followed live.
 *
 * Subscribed to even while a page has chosen `'light'` or `'dark'`, which costs
 * one listener and buys the thing a toggle is usually for: switching back to
 * `'system'` reports the right answer immediately rather than on the next
 * change.
 */
export function useSystemScheme(): MPResolvedColorScheme {
  return React.useSyncExternalStore(subscribeToSystem, systemSnapshot, () => 'light' as const);
}

/**
 * What the document element already says, if it says anything.
 *
 * `'system'` is not a value the attribute can carry — the absence of the
 * attribute *is* system — so only the two real schemes come back.
 */
function adoptDocumentScheme(): MPColorScheme | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const value = document.documentElement.getAttribute(SCHEME_ATTRIBUTE);

  return isScheme(value) && value !== 'system' ? value : undefined;
}

/** Test seam: forgets the page's choice so a suite can start from nothing. */
export function resetScheme() {
  current = undefined;
  emit();
}
