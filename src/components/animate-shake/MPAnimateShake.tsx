import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { lengthValue, useAnimateElement } from '../../internal/animate';
import type { MPAnimateProps } from '../../types';

export interface MPAnimateShakeProps
  extends
    Omit<MPAnimateProps, 'alternate' | 'repeat' | 'once' | 'threshold'>,
    React.ComponentPropsWithoutRef<'div'> {
  /**
   * How far it travels at the widest point of the first swing — a number in
   * pixels, or any CSS length.
   * @default '0.5rem'
   */
  distance?: number | string;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * The answer to something that did not work.
 *
 * A wrong code, a rejected card, a form submitted with a field still empty. It
 * is over in four hundred milliseconds and it says *that was refused* more
 * plainly than any colour does — a red border is a **state** the field is now
 * in, and this is a reply to what the reader just did.
 *
 * ## Why this is allowed, when a control never moves
 *
 * The library's rule is that controls do not transform, and it holds without
 * exception — but the rule is about a control's **resting states**: hover,
 * press, on, off. Movement there is a stand-in for something colour says
 * better, and it makes a target that the pointer has to chase.
 *
 * A shake is not a state. It is not a thing the control *is*, it is a thing
 * that just happened, and it is finished before a reader could try to point at
 * it. That is the whole of the exception, and it is the only one.
 *
 * ## What keeps it from becoming decoration
 *
 * `trigger` defaults to **`manual`**, so nothing shakes on mount. A shake that
 * runs when a page loads is decoration, and readers learn to ignore moving
 * decoration — which costs the effect exactly the meaning it is here for.
 *
 * There is no `repeat`. A refusal is said once.
 *
 * The keyframe is home at both ends, so an interrupted shake leaves the element
 * where the page put it, and its second half is smaller than its first — a
 * shake that ends as hard as it starts reads as a loop that was cut off.
 *
 * ## Shaking again
 *
 * Set `play` back to `false` and then to `true`. The animation is rewound
 * without unmounting anything, so the field keeps its value and its focus and
 * the second wrong answer moves exactly as much as the first did.
 *
 * ```tsx
 * const [wrong, setWrong] = React.useState(false);
 *
 * function reject() {
 *   setWrong(false);
 *   requestAnimationFrame(() => setWrong(true));
 * }
 *
 * <MPAnimateShake play={wrong}>
 *   <MPOtpField />
 * </MPAnimateShake>;
 * ```
 */
export const MPAnimateShake = React.forwardRef<HTMLDivElement, MPAnimateShakeProps>(
  function MPAnimateShake(
    {
      // Long enough to be read as a movement and short enough to be over before
      // the reader has decided to look at it. Not a Material token: the motion
      // ladder is for arrivals, and this arrives nowhere.
      duration = 400,
      delay = 0,
      // No destination to decelerate into — it ends where it began.
      easing = 'standard',
      paused,
      trigger = 'manual',
      play,
      distance = '0.5rem',
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'shake',
      effectClass: 'mp-anim-shake',
      duration,
      delay,
      easing,
      repeat: 1,
      x: lengthValue(distance),
      trigger,
      play,
      // Neither is reachable: `once` and `threshold` belong to `trigger="visible"`,
      // and a refusal is not something a reader scrolls to.
      once: true,
      threshold: 0.2,
      paused,
      infinite: false,
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
