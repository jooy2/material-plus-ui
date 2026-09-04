import * as React from 'react';

/** What an element measures, in CSS pixels. */
export interface MPElementSize {
  width: number;
  height: number;
}

/**
 * How big an element is, kept up to date as it changes.
 *
 * The library measures elements in five places — a tab bar deciding whether it
 * overflows, a field sizing its outline's notch, panes tracking a drag — and an
 * application that wants the same answer had to write the `ResizeObserver`
 * out again, including the two parts of it that are easy to get wrong.
 *
 * ```tsx
 * const ref = React.useRef<HTMLDivElement>(null);
 * const { width } = useMPElementSize(ref);
 *
 * <div ref={ref}>{width > 480 ? <Chart /> : <Figure />}</div>;
 * ```
 *
 * This is the answer for **a component's own width**, which is what a container
 * query asks and a media query cannot: a card in a sidebar and the same card in
 * a main column are the same window and two different widths.
 * [useMPMediaQuery](#usempmediaquery) is the other question.
 *
 * ## Zero until it has measured
 *
 * The first render has no element yet — a ref is filled in during the commit —
 * so the first answer is `{ width: 0, height: 0 }` and the real one arrives on
 * the render after it. Branch on a threshold rather than on the number itself,
 * or a chart will mount, be told it is zero wide, and mount again.
 *
 * ## The two parts that are easy to get wrong
 *
 * It reads `getBoundingClientRect`, not the observer entry's `contentRect`.
 * Those differ by the padding and the border — `contentRect` is the content box
 * — and a caller comparing a measurement against a breakpoint means the box the
 * element actually occupies.
 *
 * And it re-renders only when a number changes. A `ResizeObserver` fires for a
 * subpixel reflow that rounds to the same integer, and a hook that set state on
 * every callback would re-render a chart on every scroll of a page with a
 * sticky header.
 *
 * ## Where there is no observer
 *
 * A browser without `ResizeObserver` measures once on mount and stays there,
 * which is right more often than it is wrong: an element that never resizes is
 * the common case, and the alternative is a `resize` listener that misses every
 * change the window did not cause.
 *
 * @param ref a ref to the element to measure.
 */
export function useMPElementSize(ref: React.RefObject<Element | null>): MPElementSize {
  const [size, setSize] = React.useState<MPElementSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    // Rounded, and the rounding is what makes the bail-out below meaningful: a
    // box laid out at 480.0001px is 480 to anything a caller will do with it.
    const measure = () => {
      const box = element.getBoundingClientRect();
      const next = { width: Math.round(box.width), height: Math.round(box.height) };

      setSize((now) => (now.width === next.width && now.height === next.height ? now : next));
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
