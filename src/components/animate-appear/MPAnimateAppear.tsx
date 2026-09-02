import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import {
  ANIMATION_CLASS,
  ANIM_BASE,
  isInfinite,
  slideOffsets,
  staggerChildren,
  useAnimationRun
} from '../../internal/animate';
import type { MPAnimateProps, MPAnimateTimelineProps, MPSide } from '../../types';

export interface MPAnimateAppearProps
  extends MPAnimateProps, MPAnimateTimelineProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * How long after one child the next one starts, in milliseconds. This is the
   * whole effect — everything else is what a single child does.
   * @default 80
   */
  stagger?: number;
  /**
   * Which edge each child drifts in from.
   * @default 'bottom'
   */
  from?: MPSide;
  /**
   * How far each child travels. Short on purpose: this is a settling, not an
   * entrance from off screen, and a long travel over a list of eight turns the
   * whole block into something moving.
   * @default '0.75rem'
   */
  distance?: number | string;
  /**
   * Fades each child in as it settles.
   * @default true
   */
  fade?: boolean;
  /**
   * Runs the list from the last child to the first.
   * @default false
   */
  reverse?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  /** The things that appear, one after another. */
  children?: React.ReactNode;
}

/**
 * A list of things settling into place one after another.
 *
 * Each child gets the same short fade and drift, held back by its position — so
 * the effect belongs to the **set** rather than to any one item, and a reader's
 * eye is walked down the list in the order it should be read. That is what MD3
 * means by a list being introduced rather than merely drawn.
 *
 * The animation is written onto the children themselves rather than onto
 * wrappers around them. A row of `<li>`s stays a row of `<li>`s, a grid's cells
 * stay its direct children, and nothing about the layout changes because the
 * list is being animated. Only a bare string has no element to write onto, so
 * that one is wrapped in a `<span>`.
 *
 * The stagger is per **child**, which means what you pass matters: eight
 * children are eight steps, and one child holding eight things is one step.
 * That is also how to opt part of a list out — group it.
 */
export const MPAnimateAppear = React.forwardRef<HTMLDivElement, MPAnimateAppearProps>(
  function MPAnimateAppear(
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
      stagger = 80,
      from = 'bottom',
      distance = '0.75rem',
      fade = true,
      reverse = false,
      timeline,
      range,
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

    /*
     * A scroll-driven set is held running, for the reason `useAnimateElement`
     * gives: with a `view()` timeline the trigger machinery is about a clock the
     * animation no longer has, and an untriggered element paused on its own
     * first frame is not waiting, it is blank. An explicit `paused` still stops
     * it.
     */
    const state = timeline === 'view' ? (paused ? 'paused' : 'running') : run.state;

    const { x, y } = slideOffsets(from, distance);

    /*
     * The same helper the six single-keyframe effects reach for through
     * `useAnimateElement`. It was written here first and lifted into
     * `internal/animate.ts` when they gained a `stagger` of their own: two
     * copies would be two answers to which child is the third one, and the
     * disagreement would only surface on a set reversed inside a fragment.
     *
     * What is not shared is the *decision*. There, a `stagger` of 0 means the
     * box animates and the children are left alone; here there is no box
     * animation to fall back to — this component is the per-child effect — so a
     * `stagger` of 0 is a set that arrives all at once, which is a real thing to
     * ask for and is why the call is direct rather than through the hook.
     */
    const animated = staggerChildren(
      children,
      `${ANIM_BASE} ${ANIMATION_CLASS.slide}`,
      {
        effect: 'slide',
        duration,
        delay,
        easing,
        repeat,
        alternate,
        x,
        y,
        opacity: fade ? 0 : 1,
        timeline,
        range
      },
      { stagger, reverse }
    );

    return useRender({
      render,
      ref: [ref, run.ref],
      props: {
        ...props,
        className,
        // Only the play state lives on the root. Every other slot is per child,
        // because the delay is what the whole effect is made of.
        style: { '--_mp-anim-state': state, ...style } as React.CSSProperties,
        ...run.handlers,
        'data-mp-animation': 'appear',
        'data-mp-state': state,
        children: animated
      }
    });
  }
);
