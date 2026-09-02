import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, revealClip, useAnimateElement } from '../../internal/animate';
import type {
  MPAnimateMode,
  MPAnimateProps,
  MPAnimateStaggerProps,
  MPAnimateTimelineProps,
  MPSide
} from '../../types';

export interface MPAnimateRevealProps
  extends
    MPAnimateProps,
    MPAnimateStaggerProps,
    MPAnimateTimelineProps,
    React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content is uncovered or covered again. An exit is quicker than
   * an entrance — MD3's `short4` against `medium4` — unless `duration` says
   * otherwise.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * Which edge the wipe opens at. `left` discloses the content from its left
   * edge rightwards, which is the reading direction of most of the world and
   * the right default for a line of text.
   *
   * Physical, as `MPSide` is everywhere in this library: a title disclosed from
   * the left of its box is disclosed from the left in every writing direction.
   * Which edge to name under RTL is a caller's decision, not a translation.
   * @default 'left'
   */
  from?: MPSide;
  /**
   * Fades the content in as it is uncovered.
   *
   * **Off** by default, and that is the one setting here worth arguing about. A
   * reveal is not a fade: the whole point is that the ink is final from the
   * first frame and only the extent of it changes. Doing both gives a weaker
   * version of each — a wipe that is also translucent reads as neither.
   * @default false
   */
  fade?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content uncovered where it already is.
 *
 * The only entrance in this set where **nothing moves and no colour changes**.
 * The element is at its final position from the first frame and at the ink it
 * will end at; what changes is how much of it has been disclosed.
 *
 * That is what makes it the effect for anything whose *position* is part of
 * what it is saying. A page title, a rule under a heading, the plot area of a
 * chart, a table's first row: all of those mean something by being exactly
 * where they are, and an entrance that travels tells the reader they arrived
 * from somewhere. [MPAnimateFade](./animate-fade) is the other effect that
 * leaves position alone, and the two differ in what they are willing to give
 * up — a fade spends the colour, a reveal spends the extent.
 *
 * ## Why `clip-path` and not a mask or an `overflow` box
 *
 * A mask needs a gradient per direction and a second one to undo itself, and it
 * is a second thing that has to agree with the side. A wrapper with
 * `overflow: hidden` puts an element into the layout that was not there before,
 * which for something inside a grid or a flex row changes what it is a child of
 * — the very thing this effect exists to leave alone.
 *
 * `inset(0)` is already the spelling of "nothing is clipped", so the to-state
 * needs no custom property and the resting appearance is the element's own.
 * Nothing here reflows, so a reveal around a paragraph costs the page nothing.
 */
export const MPAnimateReveal = React.forwardRef<HTMLDivElement, MPAnimateRevealProps>(
  function MPAnimateReveal(
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
      timeline,
      range,
      mode = 'in',
      from = 'left',
      fade = false,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'reveal',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      clip: revealClip(from),
      // 1 rather than 0: the keyframe's own default is "no fade", and passing
      // the number either way keeps the slot's meaning in one place.
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
