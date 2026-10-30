/**
 * One `IntersectionObserver` per set of options, shared by everything here that
 * asks whether it is on screen.
 *
 * An observer is not free. Each one is checked by the browser on every frame
 * the page scrolls, and every `MPAnimate*` with `trigger="visible"`, every
 * `useMPOnScreen` and every indeterminate progress indicator used to bring its
 * own — so a landing page of forty fading cards was forty observers asking the
 * same question at the same threshold. One observer watching forty elements
 * answers it once per frame, and delivers exactly the entries the forty would
 * have: observing an element always queues a first entry for that element,
 * shared observer or not.
 *
 * The one case sharing changes is a second question about an element that is
 * already observed. Observing it again queues nothing, so the latest entry for
 * each element is kept and handed to a listener that joins after the first one
 * was delivered.
 *
 * Keyed on what changes the answer, the threshold and the root margin, so two
 * callers that asked different questions still get different observers.
 */
import * as React from 'react';

type Listener = (entry: IntersectionObserverEntry) => void;

interface Shared {
  observer: IntersectionObserver;
  listeners: Map<Element, Set<Listener>>;
  /** The last entry delivered for each element, for a listener that joins later. */
  latest: Map<Element, IntersectionObserverEntry>;
}

const shared = new Map<string, Shared>();

export interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Calls `listener` with every intersection entry for `element`, starting with
 * the first one the browser reports. Returns the function that stops it.
 *
 * Callers check for `IntersectionObserver` themselves first, because each has
 * its own answer for a browser without one.
 */
export function watchIntersection(
  element: Element,
  listener: Listener,
  { threshold = 0, rootMargin = '0px' }: IntersectionOptions = {}
): () => void {
  const key = `${threshold} ${rootMargin}`;
  let entry = shared.get(key);

  if (!entry) {
    const listeners = new Map<Element, Set<Listener>>();
    const latest = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          latest.set(record.target, record);

          for (const call of listeners.get(record.target) ?? []) {
            call(record);
          }
        }
      },
      { threshold, rootMargin }
    );

    entry = { observer, listeners, latest };
    shared.set(key, entry);
  }

  const { observer, listeners, latest } = entry;
  let calls = listeners.get(element);
  let stopped = false;

  if (!calls) {
    calls = new Set();
    listeners.set(element, calls);
    observer.observe(element);
  } else {
    const known = latest.get(element);

    // Asynchronously, as the observer would have answered. With no entry yet,
    // the first one is still queued and reaches this listener too.
    if (known) {
      queueMicrotask(() => {
        if (!stopped) {
          listener(known);
        }
      });
    }
  }

  calls.add(listener);

  return () => {
    if (stopped) {
      return;
    }

    stopped = true;
    calls.delete(listener);

    if (calls.size > 0) {
      return;
    }

    listeners.delete(element);
    latest.delete(element);
    observer.unobserve(element);

    if (listeners.size === 0) {
      observer.disconnect();
      shared.delete(key);
    }
  };
}

/** The attribute the stylesheet pauses an endless animation on. */
const OFFSCREEN = 'data-mp-offscreen';

/**
 * Holds an endless CSS animation while its element is off screen.
 *
 * A loop nobody can see is still a loop the browser runs: a style pass every
 * frame for the glow's custom property, and a layout pass for the linear
 * indicator's bars, which move by `inset`. Marking the element lets the
 * stylesheet set `animation-play-state: paused` on whatever part of it moves,
 * and taking the mark off lets it carry on from where it stopped — which, for
 * a loop, is indistinguishable from never having stopped.
 *
 * Written as an attribute straight onto the element rather than as state, so
 * scrolling past one is not a render.
 */
export function useOffscreenPause(enabled: boolean): React.RefObject<Element | null> {
  const ref = React.useRef<Element | null>(null);

  React.useEffect(() => {
    const element = ref.current;

    if (!element || !enabled || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const stop = watchIntersection(element, (entry) => {
      element.toggleAttribute(OFFSCREEN, !entry.isIntersecting);
    });

    return () => {
      stop();
      element.removeAttribute(OFFSCREEN);
    };
  }, [enabled]);

  return ref;
}
