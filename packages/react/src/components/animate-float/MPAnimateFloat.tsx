import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, lengthValue, useAnimateElement } from '../../internal/animate';
import type { MPAnimateProps, MPAnimateStaggerProps } from '../../types';

export interface MPAnimateFloatProps
  extends
    Omit<MPAnimateProps, 'alternate'>,
    MPAnimateStaggerProps,
    React.ComponentPropsWithoutRef<'div'> {
  /**
   * How far it rises at the top of the drift — a number in pixels, or any CSS
   * length. Small on purpose: this says *not fixed down*, and anything a reader
   * can measure says *moving* instead.
   * @default '0.625rem'
   */
  distance?: number | string;
  /**
   * How far it wanders to either side. Less than `distance`, so the path reads
   * as a drift rather than as a circle.
   * @default '0.375rem'
   */
  sway?: number | string;
  /**
   * How far it leans at the extremes, in degrees. `0` by default — a tilt is
   * the difference between something floating and something *tumbling*, and
   * anything with text on it wants none of it.
   * @default 0
   */
  tilt?: number;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * An endless, slow drift.
 *
 * The only thing in this set that says **not fixed to the page**. A card that
 * drifts is a card that is above the sheet rather than printed on it, and no
 * amount of shadow says that as plainly as half a centimetre of unhurried
 * travel — a shadow is a claim about depth, and this is depth behaving.
 *
 * It has no arrival, which is what keeps it out of the shared effect table: the
 * six entrances go from a state to the element's own, and this one goes nowhere
 * and comes back. Its keyframe is its own.
 *
 * ## Never on a control
 *
 * A button that drifts cannot be pointed at. The pointer arrives where the
 * button was, the button has moved four pixels, and the reader has to track a
 * target that is running away from them — which is precisely the failure the
 * library's rule against transforming controls exists to prevent. This is for
 * decoration: an illustration, a hero graphic, a badge on a marketing page.
 *
 * It is also for one at a time. Six things drifting on their own cycles is a
 * page that will not sit still to be read, and there is no way to look at any
 * one of them.
 */
export const MPAnimateFloat = React.forwardRef<HTMLDivElement, MPAnimateFloatProps>(
  function MPAnimateFloat(
    {
      // Six seconds, and not a Material token. The motion ladder runs to a
      // second: it is for things that arrive, and a period is not a duration.
      duration = 6000,
      delay = 0,
      // `standard` rather than a decelerate. Five of the six entrances ease into
      // their destination because they have one; a drift eased that way pauses
      // at each corner of its path and reads as four separate movements.
      easing = 'standard',
      repeat = 'infinite',
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      stagger = 0,
      durationStep,
      reverse,
      distance = '0.625rem',
      sway = '0.375rem',
      tilt = 0,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'float',
      effectClass: 'mp-anim-float',
      duration,
      delay,
      easing,
      repeat,
      x: lengthValue(sway),
      y: lengthValue(distance),
      angle: `${tilt}deg`,
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
