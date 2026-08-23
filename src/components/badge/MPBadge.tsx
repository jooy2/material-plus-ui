import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { hasContent } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPCorner, MPSize, MPVariant } from '../../types';

export interface MPBadgeProps extends Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'color' | 'content'
> {
  /**
   * What the badge says — usually a count, sometimes a word.
   *
   * Omit it and the badge draws a dot instead, which is the honest thing when
   * there is something to report but nothing to count. MD3 calls those two the
   * large and the small badge, and they are the only two it has.
   */
  content?: React.ReactNode;
  /**
   * Caps a numeric `content` and adds a `+`. Only applies when the content is
   * actually a number: a badge cannot know how to truncate a word.
   * @default 99
   */
  max?: number;
  /**
   * Draws the marker as a dot even when there is content, keeping the content
   * for screen readers only. For the corner that has to stay quiet.
   * @default false
   */
  dot?: boolean;
  /**
   * Whether a `content` of `0` is shown. Off by default — zero unread messages
   * is not news, and a badge that never goes away stops meaning anything.
   * @default false
   */
  showZero?: boolean;
  /**
   * Hides the marker without unmounting the anchor. The badge keeps its place in
   * the DOM, so showing it again does not relayout what it sits on.
   * @default false
   */
  invisible?: boolean;
  /**
   * Which corner of the anchor it sits on.
   * @default 'top-end'
   */
  placement?: MPCorner;
  /**
   * The shape of the thing underneath, which is what decides how far the marker
   * tucks in: a circle's corner is further from its centre than a square's, so a
   * badge that looks right on an avatar hangs off an icon button.
   * @default 'square'
   */
  overlap?: 'square' | 'circle';
  /**
   * How much surface the marker paints.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the marker reads.
   *
   * **`error`, not `primary`**, and it is the one component in the library that
   * defaults there. MD3 gives the badge exactly one colour pair — `error` under
   * `on-error` — because a badge exists to be noticed, and the error palette is
   * the one palette in the system that is guaranteed to be loud whatever the
   * source colour is. A count in the brand colour on a brand-coloured app bar is
   * a count nobody sees.
   * @default 'error'
   */
  color?: MPColor;
  /**
   * What a screen reader hears instead of the raw content. `content={3}` on a
   * bell is "3" to a reader and means nothing; `label="3 unread notifications"`
   * is the sentence.
   */
  label?: string;
  /**
   * What the badge is pinned to. Without it the badge is a standalone marker
   * that lays out inline, which is what a status pill in a table cell is.
   */
  children?: React.ReactNode;
}

/**
 * A badge is smaller than anything else in the library, so it has a ladder of
 * its own rather than a step off `CONTROL_HEIGHT`.
 *
 * A control's height is the number a *row* lines up on; a badge lines up on
 * nothing — it hangs off the corner of something else. `md` is 16px, which is
 * MD3's large badge to the pixel, and the two rungs below it are for a badge on
 * something already small.
 */
const HEIGHT: Record<MPSize, string> = {
  xs: 'h-3 min-w-3',
  sm: 'h-3.5 min-w-3.5',
  md: 'h-4 min-w-4',
  lg: 'h-5 min-w-5',
  xl: 'h-6 min-w-6'
};

/**
 * The dot: the same ladder with the digits taken out, so it goes square. `md` is
 * 6px, which is MD3's small badge.
 */
const DOT: Record<MPSize, string> = {
  xs: 'size-1',
  sm: 'size-1.5',
  md: 'size-1.5',
  lg: 'size-2',
  xl: 'size-2.5'
};

/**
 * `label-small` is the smallest role in the Material type scale — 11px at
 * weight 500 — and MD3 sets a badge's own count in it. Two of the five rungs go
 * up from there; none goes below, because there is nothing below.
 */
const TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-small',
  sm: 'text-mp-label-small',
  md: 'text-mp-label-small',
  lg: 'text-mp-label-medium',
  xl: 'text-mp-label-medium'
};

/** Horizontal breathing room around the digits. */
const PAD_X: Record<MPSize, string> = {
  xs: 'px-1',
  sm: 'px-1',
  md: 'px-1.5',
  lg: 'px-1.5',
  xl: 'px-2'
};

/**
 * How far the marker is pulled out of the corner, per size.
 *
 * A negative margin rather than the `translate(50%,-50%)` most libraries reach
 * for: a transform takes the element out of the flow it is being positioned
 * against and resamples the digits in it at fractional pixel offsets, which is
 * what makes a badge's `9` look softer than the text around it. The offsets are
 * half the marker's own height, so the vertical overhang is exactly half — and
 * horizontally a wide `99+` tucks in a little further than half, which is what
 * you want anyway.
 */
const CORNER_OFFSET: Record<MPSize, { badge: string; dot: string }> = {
  xs: { badge: '-mt-1.5 -mb-1.5 -ms-1.5 -me-1.5', dot: '-mt-0.5 -mb-0.5 -ms-0.5 -me-0.5' },
  sm: { badge: '-mt-1.5 -mb-1.5 -ms-1.5 -me-1.5', dot: '-mt-0.5 -mb-0.5 -ms-0.5 -me-0.5' },
  md: { badge: '-mt-2 -mb-2 -ms-2 -me-2', dot: '-mt-1 -mb-1 -ms-1 -me-1' },
  lg: { badge: '-mt-2.5 -mb-2.5 -ms-2.5 -me-2.5', dot: '-mt-1 -mb-1 -ms-1 -me-1' },
  xl: { badge: '-mt-3 -mb-3 -ms-3 -me-3', dot: '-mt-1.5 -mb-1.5 -ms-1.5 -me-1.5' }
};

/**
 * Which two edges the marker is pinned to. Logical properties throughout, so the
 * corner flips with the writing direction rather than staying stuck on the
 * right.
 */
const PLACEMENT: Record<MPCorner, string> = {
  'top-start': 'top-0 start-0',
  'top-end': 'top-0 end-0',
  'bottom-start': 'bottom-0 start-0',
  'bottom-end': 'bottom-0 end-0'
};

/**
 * The extra inset a round anchor needs. A circle's corner is `r·(1 − 1/√2)` —
 * about 15% of its diameter — inside the bounding box the badge is positioned
 * against, so without this the marker floats off an avatar with a gap under it.
 */
const CIRCLE_INSET: Record<MPCorner, string> = {
  'top-start': 'mt-[7%] ms-[7%]',
  'top-end': 'mt-[7%] me-[7%]',
  'bottom-start': 'mb-[7%] ms-[7%]',
  'bottom-end': 'mb-[7%] me-[7%]'
};

/**
 * The five weights, said the way a *control* says them: the marker is the thing
 * being coloured, so it takes the tint.
 *
 * `filled` is the default and is the Material badge. `tonal` is the one to reach
 * for on a busy surface — a soft mark that reports without shouting.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-(--_mp-accent)',
  outlined: 'border-mp-outline border bg-mp-surface-container text-(--_mp-accent)',
  text: 'text-(--_mp-accent) bg-transparent'
};

/** `99+`, but only for a value a `+` means anything on. */
function capContent(content: React.ReactNode, max: number): React.ReactNode {
  return typeof content === 'number' && content > max ? `${max}+` : content;
}

/**
 * A small mark in the corner of something else: unread mail on an inbox icon, a
 * status dot on an avatar, a count on a tab.
 *
 * The shell is a `<span>` that wraps the anchor and does nothing but establish a
 * positioning context — no width, no padding, `align-middle` — so a badged icon
 * button still measures and lines up exactly like a bare one. With no children
 * the marker lays out inline instead, which is what a standalone status pill is.
 *
 * There is no Base UI primitive under this, and there should not be: a badge has
 * no interaction, no state and no keyboard contract. It is a mark. Wiring it to
 * a widget primitive would hand every decorative dot a role it cannot honour.
 *
 * What it does owe a screen reader is a sentence rather than a number, which is
 * what `label` is for — `content={3}` beside a bell reads out as "3".
 *
 * ## The one place the library draws a pill that is not a button
 *
 * `corner-full`, at every size. MD3 shapes a badge as a full circle or a stadium
 * because it is a *mark laid on* a surface rather than a surface of its own, and
 * a mark has no edge to cut. It is also the only component that overlaps its
 * neighbour, for the same reason.
 */
export const MPBadge = React.forwardRef<HTMLSpanElement, MPBadgeProps>(function MPBadge(
  {
    variant = 'filled',
    size = 'md',
    color = 'error',
    content,
    max = 99,
    dot = false,
    showZero = false,
    invisible = false,
    placement = 'top-end',
    overlap = 'square',
    label,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const anchored = hasContent(children);
  // `0` is content, and `hasContent` would agree — this is the one place the
  // library asks a second question, because a count of nothing is not news.
  const empty = !hasContent(content) || (content === 0 && !showZero);
  const asDot = dot || empty;
  const hidden = invisible || (empty && !dot);

  const markerClasses = [
    'mp-badge pointer-events-none z-10 inline-flex shrink-0 items-center justify-center',
    'rounded-mp-full tabular-nums whitespace-nowrap',
    SURFACE[variant],
    asDot ? DOT[size] : [HEIGHT[size], TEXT[size], PAD_X[size]].join(' '),
    anchored ? `absolute ${PLACEMENT[placement]}` : 'relative align-middle',
    anchored ? (asDot ? CORNER_OFFSET[size].dot : CORNER_OFFSET[size].badge) : '',
    anchored && overlap === 'circle' ? CIRCLE_INSET[placement] : '',
    /*
     * The marker grows in and shrinks back out, which is MD3's own arrival for
     * one — a count that appeared would be a count nobody saw change.
     *
     * `visibility` is still what hides it, and is in the transition list rather
     * than replaced by the opacity beside it. Two reasons, and both of them
     * things opacity alone cannot do.
     *
     * A badge parked at `opacity: 0` is still visible to find-on-page, and a
     * marker that says nothing should not be turning up in a search for "3".
     * `visibility: hidden` takes its subtree out of that, which is what lets the
     * count stay in the DOM at all — and it has to stay, because an element
     * that is not there has no size to shrink from.
     *
     * And `visibility` interpolates in exactly the shape this needs: on the way
     * *in* it flips to `visible` at the first frame, and on the way *out* it
     * holds `visible` until the last one. So the marker is drawn for the whole
     * of both animations and hidden for neither.
     *
     * The marker keeps its box at every size, so nothing around it moves.
     */
    'transition-[opacity,scale,visibility] duration-(--mp-sys-motion-duration-short4)',
    'ease-mp-standard',
    hidden ? 'invisible scale-0 opacity-0' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const capped = capContent(content, max);

  const marker = (
    <span
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      className={markerClasses}
      style={{ ...accentSlots(color), ...style }}
      // A hidden badge says nothing, and a marker whose whole meaning is already
      // in `label` would otherwise be read twice — once as "3", once as the
      // sentence. Everything else is left to speak for itself.
      aria-hidden={hidden ? true : undefined}
      {...props}
    >
      {/* Four cases, one element. A plain badge shows its count. A badge with a
          `label` shows the count and reads the sentence instead. A dot shows
          nothing and reads whichever of the two it was given — the count is
          still in the DOM, just clipped, so a quiet corner is not a silent one.

          An `invisible` badge keeps all of it. It has something to draw and is
          only being asked not to draw it right now, and a marker with nothing
          inside it has no size to shrink from — it would collapse to an empty
          pill in one frame and then animate that. `aria-hidden` and the
          `visibility: hidden` the marker carries are what keep it from being
          read out or found on the page while it is away.

          A marker with nothing to say holds nothing: that is not a badge being
          hidden, it is a badge that was never there. */}
      {empty && !dot ? null : (
        <>
          {asDot || label ? <span className={VISUALLY_HIDDEN}>{label ?? capped}</span> : null}
          {asDot ? null : <span aria-hidden={label ? true : undefined}>{capped}</span>}
        </>
      )}
    </span>
  );

  if (!anchored) {
    return marker;
  }

  // `inline-flex` rather than `inline-block`: the shell has to be exactly as
  // wide and as tall as what it wraps, or a badged icon button stops lining up
  // with the bare one beside it.
  return (
    <span className="relative inline-flex shrink-0 align-middle">
      {children}
      {marker}
    </span>
  );
});
