import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, useAnimateElement } from '../../internal/animate';
import type { MPAnimateMode, MPAnimateProps, MPAnimateStaggerProps } from '../../types';

export interface MPAnimateRotateProps
  extends MPAnimateProps, MPAnimateStaggerProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content turns into place or out of it.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * The angle it starts at, in degrees. Negative is anticlockwise.
   * @default -180
   */
  from?: number;
  /**
   * The angle it ends at, in degrees. Together with `from` this is what makes
   * one component cover both a quarter turn into place and an endless spin:
   * `from={0} to={360} repeat="infinite" easing="linear"`.
   * @default 0
   */
  to?: number;
  /**
   * Which point it turns about — any CSS `transform-origin`.
   * @default 'center'
   */
  origin?: string;
  /**
   * Fades in as it turns. Turn it off for a continuous spin, where a repeating
   * fade would read as flickering.
   * @default true
   */
  fade?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content turning about a point.
 *
 * Two angles rather than one, which is what lets this be both of the effects a
 * rotation is ever used for. `from` alone is an **arrival** — something
 * swinging into place and stopping. `from` and `to` together with
 * `repeat="infinite"` and `easing="linear"` is a **spin** that never lands,
 * which is what a decorative mark or a badge wants.
 *
 * Rotation is the one movement this library allows on a glyph without argument:
 * a chevron is turned rather than redrawn all over the components, because a
 * turned arrow is still the same arrow. What it is emphatically not for is
 * text. A rotated word is resampled along its whole length, and at any angle
 * that is not a multiple of 90° every stem in it lands between pixels.
 *
 * If what you want is a spinner, this is not it — an indeterminate indicator
 * has to say what it is waiting on, which is
 * [MPProgressCircular](../feedback/progress-circular).
 */
export const MPAnimateRotate = React.forwardRef<HTMLDivElement, MPAnimateRotateProps>(
  function MPAnimateRotate(
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
      from = -180,
      to = 0,
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
      effect: 'rotate',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      angle: `${from}deg`,
      angleTo: `${to}deg`,
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
