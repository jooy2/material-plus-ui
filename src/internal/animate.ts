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

import * as React from 'react';
import type {
  MPAnimateMode,
  MPAnimateRepeat,
  MPAnimateTrigger,
  MPAnimation,
  MPEasing,
  MPSide
} from '../types';

/* ---------------------------------------------------------------------------
 * Slots
 * ------------------------------------------------------------------------- */

/** The class that reads the slots. Always paired with one of the below. */
export const ANIM_BASE = 'mp-anim';

/**
 * Which keyframe an effect runs.
 *
 * `grow` and `zoom` share one: they are the same arithmetic at two strengths,
 * and a second identical `@keyframes` would only be a second place to fix a
 * bug. What separates them is their defaults and their origin, which is a
 * property rather than a keyframe.
 */
export const ANIMATION_CLASS: Record<MPAnimation, string> = {
  fade: 'mp-anim-fade',
  grow: 'mp-anim-scale',
  slide: 'mp-anim-slide',
  zoom: 'mp-anim-scale',
  rotate: 'mp-anim-rotate',
  blink: 'mp-anim-blink'
};

/**
 * Which Material duration token each effect takes when nobody said.
 *
 * They are not one token because the effects do not travel the same distance. A
 * fade crosses one axis of opacity and is done at `medium2`; a rotate crosses
 * half a turn and reads as rushed at anything under `long2`.
 *
 * The two columns are the specification's asymmetry, and the whole reason this
 * table has two of them: **an entrance is slower than an exit.** Something
 * arriving is being introduced and is given time to be read as an arrival;
 * something leaving has already said what it had to say and should get out of
 * the way. MD3 puts entrances around 400ms and exits around 200ms, which is the
 * ladder below.
 *
 * `blink` is the odd one out — it is a cycle rather than an arrival, so its
 * number is a *period*, and a period does not have a direction.
 */
const DURATION_TOKEN: Record<MPAnimation, Record<MPAnimateMode, string>> = {
  fade: { in: 'medium2', out: 'short4' },
  grow: { in: 'medium4', out: 'short4' },
  slide: { in: 'medium4', out: 'short4' },
  zoom: { in: 'medium4', out: 'short4' },
  rotate: { in: 'long2', out: 'medium2' },
  blink: { in: 'extra-long4', out: 'extra-long4' }
};

/**
 * Which Material easing curve each effect takes when nobody said.
 *
 * Five of the six decelerate, because five of the six are arrivals and that is
 * what the specification asks an arrival to do. `blink` is `standard`: it is a
 * pulse with no destination, and a curve that eases into a frame it immediately
 * leaves reads as a stutter rather than as a breath.
 *
 * Nothing here needs an accelerating column. `mode="out"` reverses the whole
 * animation, curve included, so the exit half of the pair is what a reversed
 * decelerate already *is*.
 */
const EASING_TOKEN: Record<MPAnimation, MPEasing> = {
  fade: 'emphasized-decelerate',
  grow: 'emphasized-decelerate',
  slide: 'emphasized-decelerate',
  zoom: 'emphasized-decelerate',
  rotate: 'emphasized-decelerate',
  blink: 'standard'
};

/** A curve, as the stylesheet spells it. */
export function easingValue(easing: MPEasing): string {
  return `var(--mp-sys-motion-easing-${easing})`;
}

/**
 * A duration, as the stylesheet spells it.
 *
 * A number is milliseconds and lands as milliseconds. Nothing at all lands as
 * the effect's own Material token, so a page that retunes its motion moves this
 * animation with it.
 */
function durationValue(
  duration: number | undefined,
  effect: MPAnimation,
  mode: MPAnimateMode = 'in',
  offset = 0
): string {
  const base =
    duration !== undefined
      ? `${duration}ms`
      : `var(--mp-sys-motion-duration-${DURATION_TOKEN[effect][mode]})`;

  if (offset === 0) {
    return base;
  }

  /*
   * `durationStep`, arrived at through a `calc()` when the base is a token.
   *
   * A number and a number could be added here, and are. A token cannot be —
   * resolving it would mean reading a computed style off an element that does
   * not exist yet — so the arithmetic goes into the stylesheet instead, which
   * is the same division of labour the rest of this module makes.
   *
   * `max(0ms, …)` is the clamp a negative step needs. Far enough down a list a
   * step of −40ms asks for a negative duration, which is invalid: the browser
   * drops the declaration and the child runs at the `.mp-anim` default instead
   * — one item in a set of eight, at a length nobody chose.
   */
  return duration !== undefined
    ? `${Math.max(0, duration + offset)}ms`
    : `max(0ms, calc(${base} + ${offset}ms))`;
}

/** A number is pixels; a string is already a CSS length. */
export function lengthValue(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** `'infinite'` reaches CSS as the word; a count reaches it as the number. */
export function repeatValue(repeat: MPAnimateRepeat): string {
  return repeat === 'infinite' ? 'infinite' : String(repeat);
}

export function isInfinite(repeat: MPAnimateRepeat | undefined): boolean {
  return repeat === 'infinite';
}

/**
 * `normal`, `reverse`, `alternate`, `alternate-reverse` — the four CSS already
 * has, assembled from the two props that mean something to a caller.
 *
 * `mode="out"` is a reversed run rather than a keyframe of its own, which is
 * also why a reversed animation ends held on its own first frame: `fill-mode`
 * is `both`, so a faded-out element stays faded out instead of snapping back.
 */
function directionValue(mode: MPAnimateMode, alternate: boolean | undefined): string {
  if (mode === 'out') {
    return alternate ? 'alternate-reverse' : 'reverse';
  }

  return alternate ? 'alternate' : 'normal';
}

export interface AnimationSlotOptions {
  /** Which effect's tokens to fall back to, and which keyframe to run. */
  effect: MPAnimation;
  /** Milliseconds. Unset takes the effect's Material duration token. */
  duration?: number;
  /** Milliseconds. */
  delay: number;
  /** Unset takes the effect's Material easing token. */
  easing?: MPEasing;
  repeat: MPAnimateRepeat;
  alternate?: boolean;
  mode?: MPAnimateMode;
  /** Milliseconds added to the duration, clamped at zero. See `durationValue`. */
  durationOffset?: number;
  /** Where the animated properties start. Only the ones an effect reads. */
  opacity?: number;
  scale?: number;
  x?: string;
  y?: string;
  angle?: string;
  angleTo?: string;
}

/**
 * The `--_mp-anim-*` slots, as an inline style object.
 *
 * Inline rather than utilities for the reason the accent slots are: these are
 * per-instance numbers, and Tailwind cannot generate a class for a duration it
 * has never seen written down.
 */
export function animationSlots(options: AnimationSlotOptions): React.CSSProperties {
  const mode = options.mode ?? 'in';

  const slots: Record<string, string> = {
    '--_mp-anim-duration': durationValue(
      options.duration,
      options.effect,
      mode,
      options.durationOffset
    ),
    '--_mp-anim-delay': `${options.delay}ms`,
    '--_mp-anim-ease': easingValue(options.easing ?? EASING_TOKEN[options.effect]),
    '--_mp-anim-repeat': repeatValue(options.repeat),
    '--_mp-anim-direction': directionValue(mode, options.alternate)
  };

  if (options.opacity !== undefined) {
    slots['--_mp-anim-opacity'] = String(options.opacity);
  }

  if (options.scale !== undefined) {
    slots['--_mp-anim-scale'] = String(options.scale);
  }

  if (options.x !== undefined) {
    slots['--_mp-anim-x'] = options.x;
  }

  if (options.y !== undefined) {
    slots['--_mp-anim-y'] = options.y;
  }

  if (options.angle !== undefined) {
    slots['--_mp-anim-angle'] = options.angle;
  }

  if (options.angleTo !== undefined) {
    slots['--_mp-anim-angle-to'] = options.angleTo;
  }

  return slots as React.CSSProperties;
}

/**
 * Which way a slide starts, given the edge it comes from.
 *
 * `MPSide` is physical everywhere in this library, and it stays physical here:
 * something sliding in from the top of the window comes from the top in every
 * writing direction.
 */
export function slideOffsets(from: MPSide, distance: number | string): { x: string; y: string } {
  const length = lengthValue(distance);
  const negative = typeof distance === 'number' ? `${-distance}px` : `calc(-1 * ${length})`;

  switch (from) {
    case 'top':
      return { x: '0px', y: negative };
    case 'bottom':
      return { x: '0px', y: length };
    case 'left':
      return { x: negative, y: '0px' };
    default:
      return { x: length, y: '0px' };
  }
}

/* ---------------------------------------------------------------------------
 * One effect, spread across the children
 * ------------------------------------------------------------------------- */

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

export interface AnimateElementParams
  extends AnimationSlotOptions, AnimationRunOptions, Partial<StaggerOptions> {
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
    children,
    ...slots
  } = params;

  const run = useAnimationRun({ trigger, play, once, threshold, paused, infinite });
  const effectClass = `${ANIM_BASE} ${ANIMATION_CLASS[slots.effect]}`;

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
      style: { '--_mp-anim-state': run.state } as React.CSSProperties,
      props: {
        ...run.handlers,
        'data-mp-animation': slots.effect,
        'data-mp-state': run.state
      },
      children: staggerChildren(children, effectClass, slots, { stagger, durationStep, reverse })
    };
  }

  return {
    ref: run.ref,
    className: effectClass,
    style: { ...animationSlots(slots), '--_mp-anim-state': run.state } as React.CSSProperties,
    props: {
      ...run.handlers,
      'data-mp-animation': slots.effect,
      'data-mp-state': run.state
    },
    children
  };
}
