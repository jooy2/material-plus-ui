/**
 * Which way the document runs, for the half of the library that asks React.
 *
 * The stylesheet never needs this. Every padding, margin and corner here is a
 * logical property, so a `dir="rtl"` on `<html>` turns the layout over on its
 * own. Base UI is the other half: it reads the direction from a React context
 * and from nowhere else, so with no `DirectionProvider` above it a slider's
 * arrow keys, a menu's arrow navigation and a popup's alignment all run left to
 * right under a right-to-left page.
 *
 * `MPConfigProvider` puts that context in place, and this is where it gets the
 * answer when it was not given a `dir`: off the document, which already says
 * which way it runs. A second place to declare the same thing is a second place
 * for it to be wrong.
 *
 * ## Why a computed style, and why a cache
 *
 * `getComputedStyle` rather than the `dir` attribute, so a page that sets
 * `direction: rtl` in its stylesheet is read the same way as one that wrote the
 * attribute. That reading flushes pending style, which is fine once and wrong on
 * every render, so the answer is kept and only a mutation of `<html>` throws it
 * away. One observer serves every provider on the page.
 */
import * as React from 'react';

/** The two ways a document can run. */
export type MPDirection = 'ltr' | 'rtl';

function readDocument(): MPDirection {
  return getComputedStyle(document.documentElement).direction === 'rtl' ? 'rtl' : 'ltr';
}

let cached: MPDirection | null = null;
let observer: MutationObserver | null = null;
const listeners = new Set<() => void>();

function clientSnapshot(): MPDirection {
  if (cached === null) {
    cached = readDocument();
  }

  return cached;
}

/**
 * `ltr` on the server and during hydration, which is what Base UI says with no
 * provider at all. The client re-renders with the document's answer straight
 * after, and since the context changes behaviour rather than markup, the two
 * renders that have to agree do.
 */
function serverSnapshot(): MPDirection {
  return 'ltr';
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  if (!observer) {
    observer = new MutationObserver(() => {
      const next = readDocument();

      if (next !== cached) {
        cached = next;
        listeners.forEach((listener) => listener());
      }
    });

    // `class` and `style` as well as `dir`, because a direction set in CSS
    // usually arrives as a class written onto the root by a language switch.
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'class', 'style']
    });
  }

  return () => {
    listeners.delete(onChange);

    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
      // Forgotten rather than kept: nothing was watching the document while no
      // provider was mounted, so the next one reads it again.
      cached = null;
    }
  };
}

/** For a provider whose direction is already decided: nothing to watch. */
function subscribeToNothing(): () => void {
  return () => {};
}

/**
 * The document's direction, re-rendering when it turns over.
 *
 * `active: false` answers `ltr` without reading the document or observing it,
 * for a provider that was told its direction or sits under one that was.
 */
export function useDocumentDirection(active: boolean): MPDirection {
  return React.useSyncExternalStore(
    active ? subscribe : subscribeToNothing,
    active ? clientSnapshot : serverSnapshot,
    serverSnapshot
  );
}
