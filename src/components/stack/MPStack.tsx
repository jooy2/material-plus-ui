import * as React from 'react';
import {
  ANIMATION_CLASS,
  ANIM_BASE,
  animationSlots,
  useAnimationRun
} from '../../internal/animate';
import { lengthValue } from '../../internal/animate';
import { useMPSize } from '../../internal/config';
import type {
  MPAnimateTimeline,
  MPAnimateTrigger,
  MPAnimation,
  MPEasing,
  MPSize
} from '../../types';

/**
 * Which way the pile grows.
 *
 * `diagonal` is a **horizontal** flow with a per-item vertical offset, not a
 * flow of its own: see the note on `drop` for why the second axis cannot be
 * left to the layout.
 */
export type MPStackDirection = 'horizontal' | 'vertical' | 'diagonal';

/** Which end of the pile is nearest the reader. */
export type MPStackFront = 'first' | 'last';

export interface MPStackProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Which way the pile grows.
   * @default 'horizontal'
   */
  direction?: MPStackDirection;
  /**
   * How far each item sits under the one before it, along the axis the pile
   * flows on — a number in pixels, or any CSS length. Left out it is a fraction
   * of `size`.
   */
  overlap?: number | string;
  /**
   * How far each item sits below the one before it on `diagonal`, which is the
   * axis the flow is **not** on. Defaults to `overlap`, which is a shallow fan.
   *
   * It is a prop rather than an angle because a true 45° would need the items'
   * own width, and a library does not have it: the horizontal advance is
   * `width − overlap`, and `width` is whatever the caller put in. Nothing here
   * pretends otherwise.
   */
  drop?: number | string;
  /**
   * Sets the default `overlap`, and nothing else. It is not passed to the
   * items — a `Stack` does not know what they are.
   * @default 'md'
   */
  size?: MPSize;
  /** How many items are drawn before the rest become an `overflow`. */
  max?: number;
  /**
   * How many there are altogether, when the stack was handed only the first few.
   * Without it the count is worked out from the children, which is right only
   * when all of them were passed.
   */
  total?: number;
  /**
   * The last item in the pile, built from the number that did not fit.
   *
   * A **function** rather than a node, because the count is the whole of what
   * that item has to say: `(hidden) => <MPAvatar initials={`+${hidden}`} />`.
   * Left out, nothing is drawn for the remainder.
   */
  overflow?: (hidden: number) => React.ReactNode;
  /**
   * Which end of the pile is nearest the reader.
   * @default 'first'
   */
  front?: MPStackFront;
  /**
   * What each item is scaled by relative to the one in front of it. `1` is no
   * change; `0.94` puts the fifth card at about three quarters.
   *
   * It changes what is drawn and not what is measured, so the spacing of the
   * pile is the same either way — a scaled card does not pull the ones behind
   * it closer.
   * @default 1
   */
  scaleStep?: number;
  /**
   * The same, for opacity. `0.85` fades a deck into the page behind it.
   * @default 1
   */
  opacityStep?: number;
  /**
   * Draws a hairline of the page's own `surface` around each item, so two
   * shapes of similar tone have an edge between them.
   *
   * On the **item** rather than on the wrapper around it, because a ring has to
   * follow the shape it is tracing and a square ring around a circular avatar
   * is worse than none. That is a fixed-depth selector, so it reaches a child
   * this stack put there and not one wrapped in something else — see the
   * component's documentation.
   * @default false
   */
  ring?: boolean;
  /**
   * An entrance for each item, from the same six the `MPAnimate*` components
   * run. Left out, nothing is animated.
   */
  transition?: MPAnimation;
  /** How long one item's entrance takes, in milliseconds. */
  duration?: number;
  /** How long before the first one starts, in milliseconds. */
  delay?: number;
  /** Which Material easing curve the entrance runs on. */
  easing?: MPEasing;
  /**
   * How long after one item the next one starts, in milliseconds.
   * @default 60
   */
  stagger?: number;
  /** How much longer each item takes than the one before it, in milliseconds. */
  durationStep?: number;
  /** Deals the pile from the back. */
  reverse?: boolean;
  /**
   * What starts the entrance.
   * @default 'mount'
   */
  trigger?: MPAnimateTrigger;
  /** Runs it, when `trigger` is `manual`. */
  play?: boolean;
  /**
   * With `trigger="visible"`, whether it runs only the first time.
   * @default true
   */
  once?: boolean;
  /**
   * With `trigger="visible"`, how much has to be on screen to count.
   * @default 0.2
   */
  threshold?: number;
  /** Holds the entrance where it is. */
  paused?: boolean;
  /** Hands the entrance to the reader's scrolling. */
  timeline?: MPAnimateTimeline;
  /** Which part of the travel through the scrollport the entrance covers. */
  range?: string;
  /** The things in the pile. */
  children?: React.ReactNode;
}

/**
 * How far one item sits under the last, per rung.
 *
 * Roughly a third of a control of the same rung: enough that the pile reads as
 * a pile, and not so much that an item is hidden behind the next one. Its own
 * ladder rather than a fraction computed at runtime, because the value is a
 * length in a custom property and a third of 56 is not a number anybody would
 * have written down.
 */
const OVERLAP: Record<MPSize, string> = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '1.125rem',
  lg: '1.25rem',
  xl: '1.5rem'
};

/**
 * Things laid over each other in a pile.
 *
 * A stack of avatars, a deck of cards, a heap of documents, a run of overlapped
 * thumbnails: one component, because "several of these, overlapping" is one
 * idea and the things being overlapped are not this component's business.
 *
 * ## Why the overlap is a margin and not a `translate`
 *
 * This is the detail nearly every implementation of this gets wrong. Move the
 * items with `translate` and each one still **occupies its full width**: the
 * box stays the size of one item plus the full width of all the others, the
 * pile is drawn outside it, and everything after the stack on the page is laid
 * out against a measurement that is wrong. It cannot go in a sentence.
 *
 * A negative margin takes the space back, so the box is exactly the size of
 * what is drawn. At 32px items with a 10px overlap, five of them come to
 * 120×32 horizontally, 32×120 vertically and 120×72 on the diagonal — the box
 * fits the content in all three.
 *
 * The margin is **logical**, so a horizontal pile overlaps the other way under
 * RTL without being asked to.
 *
 * ## Why `diagonal` is a horizontal flow
 *
 * Because a flow only overlaps items on the axis it flows along. The other axis
 * has to be written per item, as a margin multiplied by the item's index — a
 * fixed `margin-block-start` in a row does not accumulate, it puts every item
 * at the same offset and the fan does not happen.
 *
 * ## What it does not do
 *
 * It does not know what the items **are**, which is the price of being general.
 * There is no `variant`, no `color` and no `shape` to set once for the pile:
 * `size` here picks the default overlap and is not passed on. Set the ones your
 * items share on [MPConfigProvider](../../guide/config), and the rest per item.
 *
 * ## Two layers per item, and why
 *
 * Each item is wrapped twice. The outer span carries the offset, the `z-index`
 * and the entrance; the inner one carries the static `scale` and `opacity` that
 * make depth. They are separate because the `grow` and `zoom` keyframes
 * animate the individual `scale` property — an animation and a resting depth on
 * the same element means the keyframe wins and the depth is gone the moment
 * something is animated.
 *
 * The wrappers are also what keeps this off the children. Cloning them to add a
 * `className` would require every child to accept one, and a face wrapped in a
 * router's link or a tooltip trigger has no obligation to.
 *
 * `ring` is the one exception, and it is honest about the cost: it is a
 * fixed-depth descendant selector, so it lands on the element this stack
 * wrapped. A child that is itself a wrapper gets the ring on the wrapper.
 *
 * ## What `transition` costs
 *
 * 2.1 kB gzipped against the 0.9 kB the layout alone would come to, because it
 * reads the same effect tables `MPAnimateFade` does. It is here rather than
 * composed from outside because the items are inside wrappers this component
 * builds and nothing outside can reach them — but a stack of four faces with no
 * `transition` is paying for six effects it will never run, and that is written
 * into the documentation rather than left to be found.
 */
export const MPStack = React.forwardRef<HTMLDivElement, MPStackProps>(function MPStack(
  {
    direction = 'horizontal',
    overlap,
    drop,
    size: sizeProp,
    max,
    total,
    overflow,
    front = 'first',
    scaleStep = 1,
    opacityStep = 1,
    ring = false,
    transition,
    duration,
    delay = 0,
    easing,
    stagger = 60,
    durationStep = 0,
    reverse = false,
    trigger = 'mount',
    play,
    once = true,
    threshold = 0.2,
    paused,
    timeline,
    range,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const run = useAnimationRun({ trigger, play, once, threshold, paused, infinite: false });
  const state = timeline === 'view' ? (paused ? 'paused' : 'running') : run.state;

  const items = React.Children.toArray(children);
  const shown = max === undefined ? items : items.slice(0, Math.max(0, max));
  const counted = total ?? items.length;
  const hidden = Math.max(0, counted - shown.length);
  const tail = overflow && hidden > 0 ? overflow(hidden) : null;
  const cards: React.ReactNode[] = tail === null ? shown : [...shown, tail];

  const gap = overlap === undefined ? OVERLAP[size] : lengthValue(overlap);
  const fall = drop === undefined ? gap : lengthValue(drop);
  const flows = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const itemClassName = transition ? `${ANIM_BASE} ${ANIMATION_CLASS[transition]}` : '';

  return (
    <div
      ref={(node) => {
        run.ref(node);

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-mp-size={size}
      data-mp-direction={direction}
      className={[
        // `isolate` so the pile's stacking context is the stack rather than
        // whatever the page happens to have above it — without it the z-indexes
        // below are competing with the rest of the document.
        'mp-stack isolate inline-flex align-middle',
        flows,
        // A fanned pile hangs its items at different heights, so they line up at
        // the top rather than in the middle of a box the tallest one decides.
        direction === 'diagonal' ? 'items-start' : 'items-center',
        ring ? 'ring-mp-surface [&>*>*>*]:ring-2' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--_mp-anim-state': state, ...style } as React.CSSProperties}
      {...run.handlers}
      {...props}
    >
      {cards.map((card, index) => {
        const step = reverse ? cards.length - 1 - index : index;
        // Counting from the front, so the item nearest the reader is never
        // scaled or faded whichever end the front is.
        const depth = front === 'first' ? index : cards.length - 1 - index;

        return (
          <span
            key={React.isValidElement(card) ? (card.key ?? index) : index}
            className={itemClassName}
            style={{
              /*
               * Said rather than left to the document, which paints later
               * siblings on top. A pile read from the start has to be the other
               * way round, and an implicit order would hold only until
               * something in the pile acquired a `z-index` of its own.
               */
              zIndex: front === 'first' ? cards.length - index : index + 1,
              /*
               * The flow overlaps on the axis it flows along; the other one is
               * this, multiplied by the index. A fixed `margin-block-start` in
               * a row does not accumulate — it puts every item at the same
               * offset and there is no fan.
               */
              ...(index > 0 && direction === 'vertical'
                ? { marginBlockStart: `calc(${gap} * -1)` }
                : {}),
              ...(index > 0 && direction !== 'vertical'
                ? { marginInlineStart: `calc(${gap} * -1)` }
                : {}),
              ...(direction === 'diagonal' ? { marginBlockStart: `calc(${fall} * ${index})` } : {}),
              ...(transition
                ? animationSlots({
                    effect: transition,
                    duration,
                    delay: delay + step * stagger,
                    easing,
                    repeat: 1,
                    durationOffset: step * durationStep,
                    timeline,
                    range
                  })
                : {})
            }}
          >
            {/*
             * The second layer, and it is not decoration. `grow` and `zoom`
             * animate the individual `scale` property, so a resting depth on
             * the same element as the entrance is overwritten by the keyframe
             * the moment anything is animated. Two elements compose instead.
             *
             * `scale` and not `transform: scale()` for the neighbouring reason:
             * the individual properties are applied before the shorthand, so a
             * caller's own `transform` on the item survives.
             */}
            <span
              className="mp-stack__item block"
              style={{
                scale: scaleStep === 1 ? undefined : String(scaleStep ** depth),
                opacity: opacityStep === 1 ? undefined : opacityStep ** depth
              }}
            >
              {card}
            </span>
          </span>
        );
      })}
    </div>
  );
});
