import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, useAnimateElement } from '../../internal/animate';
import type { MPAnimateMode, MPAnimateProps, MPAnimateStaggerProps } from '../../types';

export interface MPAnimateGrowProps
  extends MPAnimateProps, MPAnimateStaggerProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content unfolds or folds away. An exit is quicker than an
   * entrance — MD3's `short4` against `medium4` — unless `duration` says
   * otherwise.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * The scale it starts from, as a multiple of its final size. Above `1` it
   * settles down onto the page instead of up out of it.
   * @default 0.8
   */
  from?: number;
  /**
   * Which point stays put while the rest moves — any CSS `transform-origin`.
   * `'top'` unfolds downwards, `'bottom left'` out of a corner.
   * @default 'center'
   */
  origin?: string;
  /**
   * Fades in as it grows. Turn it off for something already on the page that is
   * only changing size.
   * @default true
   */
  fade?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content unfolding from a point.
 *
 * This is the container transform MD3 describes, at the one scale a component
 * library can offer it: something opens out of the place it belongs to. A panel
 * out of a toolbar, a card out of the row it sits in, a sheet out of the button
 * that summoned it — `origin` is what anchors it to that place, and it is the
 * whole difference between this and [MPAnimateZoom](../motion/animate-zoom).
 *
 * A Grow starts close to its final size, so the travel is short and the content
 * inside is legible for most of the animation. A Zoom starts at less than half
 * and always about the middle: it comes at the reader rather than out of
 * anything.
 *
 * `transform-origin` governs the standalone `scale` property as well as the
 * `transform` shorthand, which is what lets this effect stay off the shorthand
 * entirely — a caller's own transform on the same element survives.
 */
export const MPAnimateGrow = React.forwardRef<HTMLDivElement, MPAnimateGrowProps>(
  function MPAnimateGrow(
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
      from = 0.8,
      origin = 'center',
      fade = true,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'grow',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      scale: from,
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
        style: { transformOrigin: origin, ...animate.style, ...style },
        ...animate.props,
        children: animate.children
      }
    });
  }
);
