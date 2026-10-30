/**
 * An entrance on a component that is not an `MPAnimate*`.
 *
 * The `MPAnimate*` components are the general answer: a wrapper round anything,
 * with a trigger, a stagger, a scroll timeline and everything else. This is the
 * narrow one — a card, a chip or an avatar arriving as it mounts — and it exists
 * because the wrapper is the wrong shape for two situations.
 *
 * The first is a component that builds boxes of its own. `MPStack` lays each
 * child into a wrapper it constructs, and nothing outside can reach those, so an
 * entrance per item is only expressible from inside. The second is composition
 * that costs an element: wrapping every card of a grid in an `MPAnimateFade` is
 * a second div per card, and a `display: contents` wrapper cannot carry an
 * animation because it generates no box to animate.
 *
 * ## What it deliberately does not do
 *
 * It runs on mount, once. There is no trigger, no repeat, no `play`, and no
 * scroll timeline — those are what the `MPAnimate*` components are, and a prop
 * that offered half of them would be a second, worse spelling of the same
 * machinery. Reach for the wrapper the moment the answer is "when it scrolls
 * into view".
 *
 * ## What it costs
 *
 * It reads the same effect tables `MPAnimateFade` does, and those are object
 * literals rather than modules — a bundler cannot tree-shake a key. And it
 * cannot: the effect is a runtime prop value, so a component that accepts one
 * carries all seven whether or not a caller ever passes any.
 *
 * Measured on `MPBox`, which is the cheapest component that takes it and so the
 * worst case: **1.0 kB gzipped and 2.1 kB of stylesheet**, taking it from 0.7 kB
 * to 1.7 kB and its sheet from 8.2 kB to 10.3 kB.
 *
 * **It is paid once, not per component.** The five-component, ten-component and
 * whole-library bundles measure the same byte for byte with the prop and
 * without it, because the machinery is shared the moment a second display
 * component is in the bundle. Only an application importing `MPBox` — or one of
 * the other six — entirely alone pays anything at all.
 *
 * That is the answer to the question of whether `MPBox` in particular should
 * keep it, which was open for a while: it should. The prop exists for the case
 * where wrapping costs an element per item, and a grid of cards is exactly
 * that case — `MPBox` is the component it was written for, and dropping it
 * there to save a kilobyte in one narrow scenario would be paying for the
 * measurement with the feature.
 *
 * `animate-core.ts` exists to stop it being more than that. Reaching into
 * `animate.ts` itself brought the marquee's rules and its two keyframes along,
 * because that module names the marquee's own class in a query selector — and
 * the split stylesheet attributes a hand-written rule by looking for its class
 * names in a component's files, comments included.
 *
 * That is why the prop is on the components that *display* something and on none
 * of the controls: a button arriving with a flourish is a page's decision about
 * a region, made with a wrapper, rather than something every button in the
 * library should pay for.
 */
import {
  ANIM_BASE,
  ANIMATION_CLASS,
  animationSlots,
  revealClip,
  slideOffsets
} from './animate-core';
import type * as React from 'react';
import type { MPAnimation, MPEasing, MPSide, MPTransition } from '../types';

/**
 * Where each effect starts, when the caller has not said.
 *
 * The same numbers the matching `MPAnimate*` component defaults to, and they
 * have to be: `transition="zoom"` and `<MPAnimateZoom>` are one effect said two
 * ways, and a card that arrived from a different scale than the wrapper would
 * have used is a difference nobody could explain from the props.
 */
const SCALE_FROM: Partial<Record<MPAnimation, number>> = {
  grow: 0.8,
  zoom: 0.4
};

const SLIDE_FROM: MPSide = 'bottom';
const SLIDE_DISTANCE = '100%';
const ROTATE_FROM = -180;
const REVEAL_FROM: MPSide = 'left';

/**
 * The class and the inline slots one transition comes to.
 *
 * Split from `transitionProps` because `MPStack` needs the *options* rather than
 * the finished style: it has a per-child step to add to the delay before the
 * slots are filled. One table read by both is what keeps `transition="fade"` the
 * same fade on a card and on a stack item.
 */
export function transitionParts(transition: MPTransition | undefined): {
  effect: MPAnimation;
  duration?: number;
  delay: number;
  easing?: MPEasing;
  opacity: number;
  scale?: number;
  x?: string;
  y?: string;
  angle?: string;
  clip?: string;
} | null {
  if (!transition) {
    return null;
  }

  const options = typeof transition === 'string' ? { effect: transition } : transition;
  const { effect } = options;
  const slide =
    effect === 'slide'
      ? slideOffsets(options.from ?? SLIDE_FROM, options.distance ?? SLIDE_DISTANCE)
      : null;

  return {
    effect,
    duration: options.duration,
    delay: options.delay ?? 0,
    easing: options.easing,
    // `1` rather than `0` on the effects that do not fade, because the slot's
    // meaning belongs in one place: every keyframe reads the opacity it was
    // given, and leaving it unset would make "no fade" an absence rather than a
    // value.
    opacity: options.fade === false ? 1 : effect === 'reveal' ? 1 : 0,
    scale: options.scale ?? SCALE_FROM[effect],
    x: slide?.x,
    y: slide?.y,
    angle: effect === 'rotate' ? `${options.angle ?? ROTATE_FROM}deg` : undefined,
    clip: effect === 'reveal' ? revealClip(options.from ?? REVEAL_FROM) : undefined
  };
}

/**
 * The same reading, as the two things a component spreads onto its root.
 *
 * Returns empty strings and an empty object rather than `null` for the common
 * case, so a caller composes them unconditionally instead of branching around
 * them at every call site.
 */
export function transitionProps(transition: MPTransition | undefined): {
  className: string;
  style: React.CSSProperties;
} {
  const parts = transitionParts(transition);

  if (!parts) {
    return { className: '', style: {} };
  }

  return {
    className: `${ANIM_BASE} ${ANIMATION_CLASS[parts.effect]}`,
    style: animationSlots({ ...parts, repeat: 1 })
  };
}
