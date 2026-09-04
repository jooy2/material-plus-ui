import * as React from 'react';

/** What to watch for. */
export interface MPOnScreenOptions {
  /**
   * How much of the element has to be showing before it counts, from `0` to `1`.
   *
   * The same default the `MPAnimate*` components take, so a page's own answer
   * and the library's arrive at the same scroll position.
   * @default 0.2
   */
  threshold?: number;
  /**
   * Whether it stops watching the first time. Off, it reports every entrance and
   * every exit.
   * @default true
   */
  once?: boolean;
  /**
   * A CSS `margin`-shaped string that grows or shrinks the region the element is
   * tested against — `'200px 0px'` reports something 200px before it arrives.
   * For loading a picture, or starting a request, ahead of the reader.
   */
  rootMargin?: string;
}

/**
 * Whether an element is on screen.
 *
 * The `MPAnimate*` components already ask this — `trigger="visible"` is exactly
 * it — and an application asks it for other reasons: loading an image, starting
 * a request, marking a section read, pausing something expensive that has
 * scrolled away.
 *
 * ```tsx
 * const ref = React.useRef<HTMLDivElement>(null);
 * const seen = useMPOnScreen(ref);
 *
 * <div ref={ref}>{seen ? <Chart data={data} /> : <MPSkeleton height={240} />}</div>;
 * ```
 *
 * ## `once` is on, and that is the common case
 *
 * Most reasons to ask are one-way: something loads, or is marked read, and does
 * not unload when it scrolls off. Turn it off for the ones that are not — a
 * video that should pause, a poll that should stop.
 *
 * ## Where there is no observer
 *
 * `true`. A browser with no `IntersectionObserver` has no way to be asked, and
 * showing content is the answer that fails safe: the alternative is a page
 * whose every deferred section stays a skeleton forever.
 *
 * The same is true before the ref is filled in, which is why this starts at
 * `false` and not at `true` — on the first render there is no element yet, and
 * an element that has not been observed is not the same as one that cannot be.
 *
 * @param ref a ref to the element to watch.
 */
export function useMPOnScreen(
  ref: React.RefObject<Element | null>,
  { threshold = 0.2, once = true, rootMargin }: MPOnScreenOptions = {}
): boolean {
  const [onScreen, setOnScreen] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      // No way to know: show it rather than hide it forever. The same answer
      // `internal/animate.ts` gives a `trigger="visible"` it cannot watch.
      setOnScreen(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOnScreen(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setOnScreen(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, once, rootMargin]);

  return onScreen;
}
