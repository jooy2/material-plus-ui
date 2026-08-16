import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { accentSlots } from '../../internal/accent';
import { isInfinite, repeatValue, useAnimationRun } from '../../internal/animate';
import type { MPAnimateProps, MPColor, MPSize } from '../../types';

export interface MPAnimateLightingProps
  // No `easing`. The revolution is linear and stays linear: a loop with no
  // beginning has nothing to decelerate into, and an eased one reads as the
  // light hesitating at an arbitrary point on a circle that has no arbitrary
  // points. A prop offering a choice that has only one right answer is a prop
  // that invites the wrong one.
  extends Omit<MPAnimateProps, 'easing'>, Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which accent family the light is drawn in. Not an arbitrary colour, for the
   * reason no component in this library takes one: to change what `primary`
   * *is*, set the token.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * The radius the light follows, on the shared corner ladder. It has to match
   * what is inside, or the glow will cut a corner the content has rounded off.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * How far past the content the light reaches, in pixels.
   * @default 3
   */
  spread?: number;
  /**
   * How much of the outline is lit at once, in degrees. Small is a travelling
   * spark; large is a sweep.
   * @default 50
   */
  arc?: number;
  /**
   * How soft the light is, in pixels. At `0` it is a hard-edged wedge, which
   * reads as a graphic rather than as light.
   * @default 4
   */
  blur?: number;
  /**
   * Runs the light the other way round.
   * @default false
   */
  reverse?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * The corner ladder, as classes.
 *
 * Written out rather than interpolated, for the reason every table in
 * `internal/scale.ts` is: Tailwind finds classes by scanning source text, so a
 * `rounded-mp-${size}` generates no rule at all.
 */
const GLOW_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-sm',
  md: 'rounded-mp-md',
  lg: 'rounded-mp-lg',
  xl: 'rounded-mp-xl'
};

/**
 * A light travelling around the outside of something.
 *
 * The light is **behind** the content rather than on it, so what a reader sees
 * is a glow escaping from under the edges — which is why it works around a
 * [card](../layout/card) or a [button](../inputs/button) without touching
 * anything about how they are drawn. Nothing inside is altered, nothing is
 * overlaid, and the content stays exactly as legible as it was.
 *
 * Use it to mark the one thing on a screen that is currently live: the row that
 * is processing, the field being checked, the plan being recommended. It draws
 * attention with light rather than by moving anything, which is the only way
 * this library has of saying "here" without also saying "and it moved".
 *
 * ## Two things it needs from the caller
 *
 * `size` has to agree with the radius of what is inside it. The glow follows
 * the wrapper's own corners, so an `xl` card in an `md` Lighting will show
 * light poking out of four corners the card has already rounded away.
 *
 * And the arc is decoration. Under `prefers-reduced-motion` it stops travelling
 * and becomes an even glow — still a mark, no longer a motion — so whatever it
 * was pointing at has to be sayable without it.
 */
export const MPAnimateLighting = React.forwardRef<HTMLDivElement, MPAnimateLightingProps>(
  function MPAnimateLighting(
    {
      duration = 3000,
      delay = 0,
      repeat = 'infinite',
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      color = 'primary',
      size = 'md',
      spread = 3,
      arc = 50,
      blur = 4,
      reverse = false,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const run = useAnimationRun({
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat)
    });

    return useRender({
      render,
      ref: [ref, run.ref],
      props: {
        ...props,
        'data-mp-size': size,
        className: ['mp-anim-lighting', GLOW_RADIUS[size], className].filter(Boolean).join(' '),
        style: {
          // The accent family reaches the gradient the way it reaches every
          // other painted surface in the library: as a value on the root, which
          // the stylesheet reads.
          ...accentSlots(color),
          '--_mp-anim-duration': `${duration}ms`,
          '--_mp-anim-delay': `${delay}ms`,
          '--_mp-anim-repeat': repeatValue(repeat),
          '--_mp-anim-direction': reverse
            ? alternate
              ? 'alternate-reverse'
              : 'reverse'
            : alternate
              ? 'alternate'
              : 'normal',
          '--_mp-anim-state': run.state,
          '--_mp-anim-glow-width': `${spread}px`,
          '--_mp-anim-glow-arc': `${arc}deg`,
          '--_mp-anim-glow-blur': `${blur}px`,
          ...style
        } as React.CSSProperties,
        ...run.handlers,
        'data-mp-animation': 'lighting',
        'data-mp-state': run.state,
        children
      }
    });
  }
);
