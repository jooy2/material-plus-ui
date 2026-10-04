/**
 * The size a chart lays itself out against: its box's own layout size, read
 * before the browser paints.
 *
 * `useMPElementSize` answers the question a caller asks of it — how big the box
 * looks — and two things about that answer are wrong for a chart:
 *
 * - **It is read in an effect**, which runs after the browser has painted. A
 *   chart mounted in the browser drew one frame with no width, an empty box,
 *   and then its picture. Read in a layout effect the first paint already has
 *   the picture, and a server-rendered chart draws in the frame it hydrates in.
 * - **It includes transforms.** A chart mounted inside a surface that enters
 *   from `scale(0.95)` — `MPDialog` does — measured the shrunken box, drew its
 *   paths to fit that, and was never told otherwise: a transform finishing is
 *   not a resize, so the observer stays silent and the plot stays five per cent
 *   narrower than the room it has. The layout size is the room.
 *
 * Rounded, and the rounding is what makes the bail-out meaningful.
 */
import * as React from 'react';
import type { MPElementSize } from '../hooks/useMPElementSize';
import { useBrowserLayoutEffect } from './layout-effect';

const NOTHING: MPElementSize = { width: 0, height: 0 };

function layoutSize(element: Element, entry?: ResizeObserverEntry): MPElementSize {
  const border = entry?.borderBoxSize?.[0];

  if (border) {
    // `inlineSize` follows the writing mode; a chart's box is horizontal text.
    return { width: Math.round(border.inlineSize), height: Math.round(border.blockSize) };
  }

  if (element instanceof HTMLElement) {
    return { width: element.offsetWidth, height: element.offsetHeight };
  }

  const box = element.getBoundingClientRect();

  return { width: Math.round(box.width), height: Math.round(box.height) };
}

export function useBoxSize(ref: React.RefObject<Element | null>): MPElementSize {
  const [size, setSize] = React.useState<MPElementSize>(NOTHING);

  useBrowserLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const apply = (next: MPElementSize) =>
      setSize((now) => (now.width === next.width && now.height === next.height ? now : next));

    apply(layoutSize(element));

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(([entry]) => apply(layoutSize(element, entry)));

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
