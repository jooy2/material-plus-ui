/**
 * The machinery every `MPAnimate*` component runs on.
 *
 * It lives in `internal/` for the reason `menu.ts` and `button-group.ts` do:
 * eleven components need it and none of them should have to import another.
 *
 * ## The shape of it
 *
 * Every effect is one `@keyframes` in `styles.css` running from a state written
 * entirely in `--_mp-anim-*` custom properties to the element's natural one.
 * Nothing here generates CSS: it fills slots, and the stylesheet decides what
 * they mean. That is the same split `accentSlots()` makes for colour, for the
 * same reason — Tailwind only ever sees class names that appear literally in
 * the source, so a per-value class would not survive the first prop.
 *
 * Because the from-state is the *keyframe* rather than a second class, running
 * an effect backwards is `animation-direction: reverse` and nothing else. That
 * is what makes `mode="out"` free on all five of the effects that take one —
 * the fade, the grow, the zoom, the slide and the rotate — and, as it happens,
 * correct:
 * CSS mirrors the timing function along with the keyframes, so an entrance
 * eased on `emphasized-decelerate` comes out accelerating on the way back. The
 * specification asks for exactly that pair, and the browser supplies it.
 *
 * ## Why the defaults are `var()` rather than numbers
 *
 * A duration nobody set resolves to `var(--mp-sys-motion-duration-medium4)`,
 * not to `400ms`. Both would draw the same animation today; only one of them
 * moves when a page retunes its motion tokens. Same rule as everywhere else in
 * this library: the value a caller does not name is the *token*, so a theme can
 * still reach it.
 *
 * ## One effect, or one effect per child
 *
 * `stagger` is the same six effects written onto the children instead of onto
 * the box, and it is three props rather than an `MPAnimateStagger` component:
 * a list settling in is not a different effect from a fade, it is the same fade
 * told when to start. The per-child half is `staggerChildren`, which
 * `MPAnimateAppear` was built out of first and now shares — two copies would be
 * two answers to which child is the third one.
 *
 * ## What is deliberately not here
 *
 * An animation that has to know what its children *are* — a marquee that
 * duplicates them, a headline that swaps between them, a typewriter that counts
 * characters — cannot be a class name and a few numbers. Those are components,
 * and their logic stays in their own files. They are also the ones that cannot
 * take a `stagger`, and for the same reason.
 */

import {
  ANIM_BASE,
  ANIMATION_CLASS,
  animationSlots,
  easingValue,
  isInfinite,
  lengthValue,
  repeatValue,
  revealClip,
  slideOffsets,
  type AnimationEffect,
  type AnimationSlotOptions
} from './animate-core';

/*
 * Re-exported rather than moved out of reach: the components have always
 * imported these from `internal/animate`, and a component that reads both halves
 * should not have to name two modules to say so.
 */
export {
  ANIM_BASE,
  ANIMATION_CLASS,
  animationSlots,
  easingValue,
  isInfinite,
  lengthValue,
  repeatValue,
  revealClip,
  slideOffsets
};
export type { AnimationEffect, AnimationSlotOptions };

import * as React from 'react';
import type { MPAnimateTimeline, MPAnimateTrigger, MPAnimation } from '../types';

/** What differs between one child and the next. */
export interface StaggerOptions {
  /**
   * Milliseconds added to each child's delay. The whole of the effect: at 0
   * there is nothing per-child to do and the box animates instead.
   */
  stagger: number;
  /** Milliseconds added to each child's duration. Negative is allowed. */
  durationStep?: number;
  /** Runs the set from the last child to the first. */
  reverse?: boolean;
}

/**
 * The same animation on every child, held back by its position.
 *
 * One implementation for all of it. `MPAnimateAppear` had this and the six
 * single-keyframe effects did not, and writing it a second time would have left
 * the library with two answers to "which child is the third one" — which is the
 * kind of disagreement nobody finds until a list is reversed inside a fragment.
 *
 * ## The animation goes on the children, not on wrappers
 *
 * A row of `<li>`s stays a row of `<li>`s and a grid's cells stay its direct
 * children, so nothing about the layout changes because the set is being
 * animated. The cost is real and worth naming: a child has to accept
 * `className` and `style`, which every host element and every component in this
 * library does, and a caller's own component need not. Only a bare string has
 * no element to write onto, and that one is wrapped in a `<span>`.
 *
 * ## The step is per child, which makes the grouping the caller's dial
 *
 * Eight children are eight steps and one child holding eight things is one
 * step. That is also how to opt part of a set out of the sequence — group it.
 *
 * The caller's own `style` wins over the slots, deliberately: the slots are
 * this library's answer and the attribute is the caller's.
 */
export function staggerChildren(
  children: React.ReactNode,
  className: string,
  slots: AnimationSlotOptions,
  { stagger, durationStep = 0, reverse = false }: StaggerOptions
): React.ReactNode[] {
  const items = React.Children.toArray(children);

  return items.map((child, index) => {
    // Only the *order* is reversed. Each child still runs forwards, which is
    // what separates this from `mode="out"`.
    const step = reverse ? items.length - 1 - index : index;
    const style = animationSlots({
      ...slots,
      delay: slots.delay + step * stagger,
      durationOffset: (slots.durationOffset ?? 0) + step * durationStep
    });

    if (!React.isValidElement(child)) {
      return React.createElement('span', { key: index, className, style }, child);
    }

    const childProps = child.props as { className?: string; style?: React.CSSProperties };

    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      className: [className, childProps.className].filter(Boolean).join(' '),
      style: { ...style, ...childProps.style }
    });
  });
}

/* ---------------------------------------------------------------------------
 * Running one
 * ------------------------------------------------------------------------- */

/**
 * Whether the reader has asked for less motion.
 *
 * The CSS side of this is handled in the stylesheet, where every keyframe is
 * switched off at once. This is for the effects whose motion is written in
 * JavaScript — a typewriter, a headline reel — where there is no rule to switch
 * off and the component has to decide for itself what "still" means.
 *
 * `useSyncExternalStore` rather than state plus an effect: a media query is an
 * external store, and reading it in an effect means every animated element on
 * the page renders once with the wrong answer and then again with the right
 * one. Here that first render is the one that would start a typewriter a reader
 * asked not to see.
 */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const query = window.matchMedia(REDUCED_MOTION);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
}

function readMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(REDUCED_MOTION).matches
    : false;
}

/** A server has no reader, and so no preference. */
function motionOnServer(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(subscribeToMotion, readMotion, motionOnServer);
}

export interface AnimationRunOptions {
  trigger: MPAnimateTrigger;
  play?: boolean;
  once: boolean;
  threshold: number;
  paused?: boolean;
  /** An infinite effect stops when the pointer leaves; a finite one finishes. */
  infinite: boolean;
}

export interface AnimationRun {
  /** Goes on the animated element. */
  ref: React.RefCallback<HTMLElement>;
  /** `running` or `paused`, for `--_mp-anim-state`. */
  state: 'running' | 'paused';
  /** Whether the animation has been let go at all. */
  started: boolean;
  /** Spread onto the element when `trigger` is `hover`; empty otherwise. */
  handlers: React.HTMLAttributes<HTMLElement>;
}

/**
 * Starts, restarts and holds an animation.
 *
 * Two things here are less obvious than they look.
 *
 * **Waiting is `animation-play-state: paused`, not a second class.** An element
 * that has not been triggered yet has to already look like its own first frame,
 * or a `visible` fade would be fully drawn until it scrolled into view and then
 * blink out to start. With `fill-mode: both` a paused animation shows exactly
 * that frame, so waiting and running are one animation in two states rather
 * than two states to keep in step.
 *
 * **Restarting reaches for the DOM.** There is no way to rewind a CSS animation
 * from React: re-rendering with the same class changes nothing, and a `key`
 * would restart the animation by unmounting the children, taking their state
 * with it. Clearing `animation-name`, reading a layout property to force the
 * style to settle, and putting it back is the one move that rewinds the element
 * and leaves everything inside it alone.
 */
export function useAnimationRun({
  trigger,
  play,
  once,
  threshold,
  paused,
  infinite
}: AnimationRunOptions): AnimationRun {
  const node = React.useRef<HTMLElement | null>(null);
  const [started, setStarted] = React.useState(trigger === 'mount');
  const [run, setRun] = React.useState(0);

  const start = React.useCallback(() => {
    setStarted(true);
    setRun((previous) => previous + 1);
  }, []);

  // Nothing to rewind on the first pass — the element has only just been drawn.
  React.useLayoutEffect(() => {
    const element = node.current;

    if (!element || run === 0) {
      return;
    }

    // The element itself for the effects that animate their own root, and its
    // descendants for the ones that animate their children instead — a
    // staggered Appear has nothing to rewind on its own root.
    const targets: HTMLElement[] = [
      element,
      ...element.querySelectorAll<HTMLElement>('.mp-anim, .mp-marquee-track')
    ];

    for (const target of targets) {
      target.style.animationName = 'none';
    }

    void element.offsetWidth;

    for (const target of targets) {
      target.style.animationName = '';
    }
  }, [run]);

  React.useEffect(() => {
    if (trigger !== 'visible') {
      return;
    }

    const element = node.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      // No observer means no way to know: show it rather than hide it forever.
      setStarted(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setStarted(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [trigger, once, threshold, start]);

  React.useEffect(() => {
    if (trigger !== 'manual') {
      return;
    }

    // `play` is a caller pressing go, and what it starts is a CSS animation.
    // There is no external system to push to: the run counter *is* the rewind.
    if (play) {
      start();
    } else {
      setStarted(false);
    }
  }, [trigger, play, start]);

  const stop = React.useCallback(() => {
    if (infinite) {
      setStarted(false);
    }
  }, [infinite]);

  const handlers: React.HTMLAttributes<HTMLElement> =
    trigger === 'hover'
      ? {
          onPointerEnter: start,
          // Focus counts, or an effect on something keyboard-reachable would
          // never run for a reader who is not holding a mouse.
          onFocus: start,
          onPointerLeave: stop,
          onBlur: stop
        }
      : {};

  return {
    ref: React.useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []),
    state: started && !paused ? 'running' : 'paused',
    started,
    handlers
  };
}

/* ---------------------------------------------------------------------------
 * The six, assembled
 * ------------------------------------------------------------------------- */

/**
 * Whether the animation is let go, once the timeline has had its say.
 *
 * A scroll-driven animation is *held* running, because the whole trigger
 * apparatus above is about a clock it no longer has: `trigger="visible"` waits
 * for an intersection the scroll position has already made the point of, and
 * `trigger="manual"` with nothing pressing go leaves the element paused on its
 * own first frame for ever — which for a `view()` animation is not "waiting", it
 * is blank.
 *
 * An explicit `paused` is still honoured. It is the one of the four that is a
 * caller saying stop rather than a default that happened to land here.
 */
function playState(
  state: 'running' | 'paused',
  timeline: MPAnimateTimeline | undefined,
  paused: boolean | undefined
): 'running' | 'paused' {
  if (timeline !== 'view') {
    return state;
  }

  return paused ? 'paused' : 'running';
}

export interface AnimateElementParams
  extends AnimationSlotOptions, AnimationRunOptions, Partial<StaggerOptions> {
  /**
   * A keyframe class the effect brings itself, instead of the one its `effect`
   * names.
   *
   * `MPAnimation` and the three tables behind it are what everything with an
   * entrance shares, and a shared lookup table is a tax on everything that
   * imports it: a `Record<Effect, string>` is not tree-shaken key by key, so
   * every component reading one pays for the rows it will never use. The
   * question to ask before adding a value is whether a component that will
   * never use it has any business paying for it.
   *
   * `float` and `shake` do not: neither is an arrival. A drift with no
   * destination and a four-hundred-millisecond answer to a rejection have
   * nothing in common with a fade beyond the machinery below, so they keep
   * their keyframes in their own files and borrow everything else — the
   * trigger, the rewind, the slots, the stagger.
   *
   * `effect` is still named, because the durations and the curves are per
   * effect and the data attribute is how a test finds one. What this replaces
   * is only which `@keyframes` runs.
   */
  effectClass?: string;
  /** Only read when the effect is being spread across them. */
  children?: React.ReactNode;
}

export interface AnimateElement {
  ref: React.RefCallback<HTMLElement>;
  className: string;
  style: React.CSSProperties;
  /** The hover handlers and the two data attributes, ready to be spread. */
  props: React.HTMLAttributes<HTMLElement> & Record<string, unknown>;
  /** The children, wrapped when there is a `stagger` and untouched otherwise. */
  children: React.ReactNode;
}

/**
 * Everything an `MPAnimate*` root needs, in one call.
 *
 * The six effect components differ only in their defaults and in which slots
 * they fill, so this is where the identical two-thirds of each of them lives.
 * The ones that have to understand their children — Typing, Marquee, Headline,
 * Appear — call `useAnimationRun` directly and put the classes where their own
 * structure needs them.
 *
 * `data-mp-animation` and `data-mp-state` are here rather than in each
 * component because they are the same two facts every time, and because a test
 * that has to assert on a class name is a test that breaks when a class name
 * changes.
 */
export function useAnimateElement(params: AnimateElementParams): AnimateElement {
  const {
    trigger,
    play,
    once,
    threshold,
    paused,
    infinite,
    stagger = 0,
    durationStep,
    reverse,
    effectClass: ownClass,
    children,
    ...slots
  } = params;

  const run = useAnimationRun({ trigger, play, once, threshold, paused, infinite });
  const effectClass = `${ANIM_BASE} ${ownClass ?? ANIMATION_CLASS[slots.effect as MPAnimation]}`;
  const state = playState(run.state, slots.timeline, paused);

  /*
   * With a stagger the root takes **no animation class and no slots**, and that
   * is the rule rather than an optimisation. Eight children fading in under a
   * box that is also fading in is the same content faded twice: the set arrives
   * at the box's opacity multiplied by its own, which is neither of the two
   * curves anybody asked for and is visibly wrong at the ends.
   *
   * The play state stays, and it is the one slot that has to: custom properties
   * inherit, so `--_mp-anim-state` on the root reaches every child and one
   * `paused` holds the whole set. The rest are written per child, because a
   * delay that was the same for all of them would not be a stagger.
   */
  if (stagger > 0) {
    return {
      ref: run.ref,
      className: '',
      style: { '--_mp-anim-state': state } as React.CSSProperties,
      props: {
        ...run.handlers,
        'data-mp-animation': slots.effect,
        'data-mp-state': state
      },
      children: staggerChildren(children, effectClass, slots, { stagger, durationStep, reverse })
    };
  }

  return {
    ref: run.ref,
    className: effectClass,
    style: { ...animationSlots(slots), '--_mp-anim-state': state } as React.CSSProperties,
    props: {
      ...run.handlers,
      'data-mp-animation': slots.effect,
      'data-mp-state': state
    },
    children
  };
}
