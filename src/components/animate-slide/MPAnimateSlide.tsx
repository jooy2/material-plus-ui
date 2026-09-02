import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, slideOffsets, useAnimateElement } from '../../internal/animate';
import type { MPAnimateMode, MPAnimateProps, MPAnimateStaggerProps, MPSide } from '../../types';

export interface MPAnimateSlideProps
  extends MPAnimateProps, MPAnimateStaggerProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content slides in or slides away. `out` leaves by the same edge
   * it would have come from, and is quicker — MD3's `short4` against `medium4`.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * Which edge it travels from. Physical, as `MPSide` is everywhere in this
   * library: a panel sliding down from the top comes from the top in every
   * writing direction.
   * @default 'bottom'
   */
  from?: MPSide;
  /**
   * How far it travels — a CSS length, or a number in pixels. `'100%'` is the
   * element's own width or height, which is what makes it appear from behind
   * its own edge.
   * @default '100%'
   */
  distance?: number | string;
  /**
   * Fades in as it slides.
   * @default true
   */
  fade?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content travelling in from one edge.
 *
 * This is MD3's **shared axis** transition, at the scale one wrapper can offer
 * it: things that are related move along the same line, so a reader reads the
 * direction as a relationship. A step forward comes from the end edge and a
 * step back from the start one; a panel belonging to the bar above it comes
 * down from the top.
 *
 * The default distance is the element's own size, so it starts exactly out of
 * frame and is never half drawn somewhere it does not belong. Put it in a box
 * with `overflow: hidden` and the effect is a panel appearing from behind that
 * box's edge.
 *
 * A slide moves the element and not the layout: this is a `translate`, so
 * nothing on the page reflows while it runs. For a much shorter travel over a
 * list of things, one after another, use
 * [MPAnimateAppear](../motion/animate-appear).
 */
export const MPAnimateSlide = React.forwardRef<HTMLDivElement, MPAnimateSlideProps>(
  function MPAnimateSlide(
    {
      duration,
      delay = 0,
      easing,
      repeat = 1,
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      stagger = 0,
      durationStep,
      reverse,
      mode = 'in',
      from = 'bottom',
      distance = '100%',
      fade = true,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const { x, y } = slideOffsets(from, distance);

    const animate = useAnimateElement({
      effect: 'slide',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      x,
      y,
      opacity: fade ? 0 : 1,
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat),
      stagger,
      durationStep,
      reverse,
      children
    });

    return useRender({
      render,
      ref: [ref, animate.ref],
      props: {
        ...props,
        className: [animate.className, className].filter(Boolean).join(' '),
        style: { ...animate.style, ...style },
        ...animate.props,
        children: animate.children
      }
    });
  }
);
