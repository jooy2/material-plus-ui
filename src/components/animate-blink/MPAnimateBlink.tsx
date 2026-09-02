import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, useAnimateElement } from '../../internal/animate';
import type { MPAnimateProps, MPAnimateStaggerProps, MPAnimateTimelineProps } from '../../types';

export interface MPAnimateBlinkProps
  extends
    MPAnimateProps,
    MPAnimateStaggerProps,
    MPAnimateTimelineProps,
    React.ComponentPropsWithoutRef<'div'> {
  /**
   * How faint it gets at the bottom of the cycle, between `0` and `1`. Raise it
   * for something that has to stay readable while it pulses.
   * @default 0
   */
  min?: number;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content pulsing between full opacity and a floor.
 *
 * The cycle is symmetric — full, faint, full — so however many times it runs it
 * ends where it started. A blink that finished halfway would leave the element
 * permanently half drawn, which reads as a rendering fault rather than as an
 * effect that has ended.
 *
 * It repeats forever unless told otherwise, because a single blink is a flicker
 * and nobody asks for a flicker. `standard` rather than the emphasized curve
 * every other effect takes, for the same reason: a pulse has no destination to
 * decelerate into, and easing into a frame it immediately leaves reads as a
 * stutter.
 *
 * ## Two things worth saying before using it
 *
 * Something that never stops moving in the corner of a page being read is the
 * one kind of motion this library otherwise refuses, and a reader with a
 * reduced-motion preference will see none of it. So `min` is a **dimming**,
 * never the only thing carrying the message: if it is urgent, say so in words
 * as well.
 *
 * For a placeholder that pulses because content has not arrived yet, this is
 * the wrong component — [MPSkeleton](../feedback/skeleton) reserves the space
 * the real thing will take, which is the part that was doing the work.
 */
export const MPAnimateBlink = React.forwardRef<HTMLDivElement, MPAnimateBlinkProps>(
  function MPAnimateBlink(
    {
      duration,
      delay = 0,
      easing,
      repeat = 'infinite',
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      stagger = 0,
      durationStep,
      reverse,
      timeline,
      range,
      min = 0,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'blink',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      opacity: min,
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat),
      stagger,
      durationStep,
      reverse,
      timeline,
      range,
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
