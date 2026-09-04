/**
 * The values an animation comes to, and nothing that runs one.
 *
 * Split from `animate.ts` for the reason `density.ts` is split from `scale.ts`,
 * with a sharper edge: the split stylesheet is cut along the import graph a file
 * at a time, and `animate.ts` names the marquee's own class in a query selector.
 * A component reaching in here for a single entrance was coming out with the
 * marquee's rules and its two keyframes attached.
 *
 * Which is also a rule about writing in this file. A hand-written rule is
 * attributed by looking for its class names in a component's files, and a
 * comment is one of those files — so naming another component's class here, even
 * in prose, would put that component's CSS into every sheet this module reaches.
 *
 * So this half is the tables and the arithmetic — what a duration, a curve, a
 * repeat and an offset resolve to — and the other half is the machinery that
 * watches a trigger and drives them. `transition.ts` reads this one; the
 * `MPAnimate*` components read both, through the re-export next door.
 */
import * as React from 'react';
import type {
  MPAnimateMode,
  MPAnimateRepeat,
  MPAnimateTimeline,
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
  blink: 'mp-anim-blink',
  reveal: 'mp-anim-reveal'
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
  blink: { in: 'extra-long4', out: 'extra-long4' },
  reveal: { in: 'medium4', out: 'short4' }
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
  blink: 'standard',
  reveal: 'emphasized-decelerate'
};

/**
 * How much of an element's travel through the scrollport a `view()` animation
 * is spread over, when nobody said.
 *
 * From the moment its leading edge appears to a little under halfway across, so
 * it has finished arriving by the time it is somewhere a reader would be
 * looking at it. A range ending at the far edge would leave everything on the
 * page permanently mid-animation, which is the failure mode of most
 * scroll-driven effects: nothing on screen is ever finished.
 */
const VIEW_RANGE = 'entry 0% cover 45%';

/**
 * The name an effect goes by, which is wider than the shared union.
 *
 * `float` and `shake` are not entrances and are not in `MPAnimation` — see
 * `effectClass` below for why a shared lookup table is a thing to keep small.
 * They still need a *name*, because `data-mp-animation` is how a test and a
 * page's own CSS find one, and because the tables above are read by name.
 *
 * Neither of them reads those tables: an effect that brings its own keyframe
 * brings its own duration and curve with it, since a six-second drift and a
 * four-hundred-millisecond refusal are not on any Material ladder. The
 * fallbacks in the two lookups below exist so the types do not have to lie
 * about that, not because anything relies on them.
 */
export type AnimationEffect = MPAnimation | 'float' | 'shake' | 'count';

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
  effect: AnimationEffect,
  mode: MPAnimateMode = 'in',
  offset = 0
): string {
  const ladder = DURATION_TOKEN[effect as MPAnimation] ?? DURATION_TOKEN.fade;
  const base =
    duration !== undefined ? `${duration}ms` : `var(--mp-sys-motion-duration-${ladder[mode]})`;

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
  effect: AnimationEffect;
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
  /** `view` hands the animation to the reader's scrolling instead of a clock. */
  timeline?: MPAnimateTimeline;
  /** Any CSS `animation-range`. Only read on `timeline: 'view'`. */
  range?: string;
  /** Where the animated properties start. Only the ones an effect reads. */
  opacity?: number;
  scale?: number;
  x?: string;
  y?: string;
  angle?: string;
  angleTo?: string;
  clip?: string;
  /** The two ends of a counted value. Only `MPAnimateCounter` fills these. */
  from?: number;
  to?: number;
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
    '--_mp-anim-ease': easingValue(
      options.easing ?? EASING_TOKEN[options.effect as MPAnimation] ?? EASING_TOKEN.fade
    ),
    '--_mp-anim-repeat': repeatValue(options.repeat),
    '--_mp-anim-direction': directionValue(mode, options.alternate)
  };

  /*
   * Only on `view`, and the omission is the point. `auto` is what the
   * stylesheet's own fallback already says, and writing it out would be the
   * same two declarations on every animated element on the page — a hundred and
   * thirty components each carrying the answer nobody changed.
   */
  if (options.timeline === 'view') {
    slots['--_mp-anim-timeline'] = 'view()';
    slots['--_mp-anim-range'] = options.range ?? VIEW_RANGE;
  }

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

  if (options.clip !== undefined) {
    slots['--_mp-anim-clip'] = options.clip;
  }

  if (options.from !== undefined) {
    slots['--_mp-anim-from'] = String(options.from);
  }

  if (options.to !== undefined) {
    slots['--_mp-anim-to'] = String(options.to);
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

/**
 * The `inset()` a wipe starts from, given the edge it opens at.
 *
 * A reveal is one rectangle shrinking to nothing: `inset(0 100% 0 0)` is the
 * whole element clipped away from the right, so the content is disclosed
 * left-to-right as the inset returns to `inset(0)`. Naming the *edge it opens
 * at* rather than the direction it travels is the same choice `MPAnimateSlide`
 * makes, and for the same reason — a caller is pointing at a place.
 *
 * `inset(0)` is the to-state and needs no slot, which is the argument for a
 * clip-path over a mask: "nothing is clipped" already has a spelling, where a
 * gradient mask would need a second gradient per direction to say it.
 *
 * Physical, like `MPSide` everywhere else here. A title disclosed from the left
 * of its box is disclosed from the left in every writing direction; what changes
 * under RTL is which edge a caller names, and that is theirs to decide.
 */
export function revealClip(from: MPSide): string {
  switch (from) {
    case 'top':
      return 'inset(0 0 100% 0)';
    case 'bottom':
      return 'inset(100% 0 0 0)';
    case 'right':
      return 'inset(0 0 0 100%)';
    default:
      return 'inset(0 100% 0 0)';
  }
}

/* ---------------------------------------------------------------------------
 * One effect, spread across the children
 * ------------------------------------------------------------------------- */
