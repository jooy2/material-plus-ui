import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { CONTROL_SQUARE } from '../../internal/scale';
import type { MPColor, MPSize } from '../../types';

/**
 * What the placeholder is standing in for.
 *
 * - `line` — a run of text. Sized off the type scale, so a `md` line is exactly
 *   as tall as the `md` type it will be replaced by.
 * - `rect` — a block: an image, a chart, a card, a map.
 * - `circle` — an avatar, or anything else round.
 */
export type MPSkeletonShape = 'line' | 'rect' | 'circle';

export interface MPSkeletonProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /** @default 'line' */
  shape?: MPSkeletonShape;
  /**
   * How many lines to draw, for `shape="line"`. The last one is drawn short, the
   * way the last line of a paragraph is, so a block of them reads as prose
   * rather than as a barcode. Ignored by the other two shapes.
   * @default 1
   */
  lines?: number;
  /**
   * The scale of the thing being stood in for: the type scale for a `line`, the
   * diameter for a `circle`, the default block height for a `rect`.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family tints the placeholder.
   *
   * Like `MPDivider` this has **no default**, and for a related reason: a
   * placeholder is not a thing yet, so it has no meaning to carry. Left unset it
   * is `surface-container-highest` — MD3's role for a container with nothing in
   * it, which is precisely what this is. Setting it swaps in the family's
   * container tone, for the rare page where the wait itself is branded.
   */
  color?: MPColor;
  /** An explicit width. Numbers are pixels. */
  width?: number | string;
  /** An explicit height. Numbers are pixels. */
  height?: number | string;
  /**
   * The pulse. Turn it off for a page holding dozens of them, or where the wait
   * is expected to be long enough that motion becomes noise.
   *
   * This is not the accessibility switch — a reduced-motion preference stops the
   * animation without being asked, below.
   * @default true
   */
  animated?: boolean;
  /**
   * What a screen reader is told, if anything.
   *
   * Unset — the default — the placeholder is `aria-hidden`, because a dozen
   * boxes each announcing themselves is worse than silence. Give the *one*
   * skeleton that stands for the whole region a label and it becomes a live
   * `status` instead.
   */
  label?: string;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
}

/**
 * A line's height is the em box of the type it replaces — the sizes out of the
 * Material body roles, as heights: 12, 14, 16, 16, 22.
 *
 * Not the line box. A placeholder as tall as the leading would be a bar with no
 * air between it and the next one, and a paragraph of those is a barcode.
 */
const LINE_HEIGHT: Record<MPSize, string> = {
  xs: 'h-3',
  sm: 'h-3.5',
  md: 'h-4',
  lg: 'h-4',
  xl: 'h-5.5'
};

/** The leading: what is left of the line box once the bar is drawn in it. */
const LINE_GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
  xl: 'gap-1.5'
};

/**
 * What a `rect` is as tall as when nothing says otherwise: a thumbnail. Anything
 * else wants `height`, and most uses of this shape pass one.
 */
const BLOCK_HEIGHT: Record<MPSize, string> = {
  xs: 'h-12',
  sm: 'h-16',
  md: 'h-20',
  lg: 'h-28',
  xl: 'h-36'
};

/**
 * The surface, and it is deliberately flat.
 *
 * Every other container in the library reads a `surface-container` role and may
 * cast a shadow. A skeleton is the shape of something that is not there yet, so
 * it is a tint and nothing else — no elevation, no edge. It also keeps a page of
 * thirty placeholders from asking for thirty shadows.
 *
 * `motion-reduce:animate-none` rather than a media query of our own: a reader
 * who has asked the system for less motion gets a still box, and the box is
 * still the right size, which is the part that was doing the work.
 */
const FILL = 'overflow-hidden bg-(--_mp-placeholder)';
const PULSE = 'animate-pulse motion-reduce:animate-none';

/** Pixels for a bare number, and whatever was written for a string. */
function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * The shape of something that has not loaded yet.
 *
 * It reserves the space the real thing will take, which is the whole job: a card
 * that grows by 200px when its image arrives has moved everything below it while
 * somebody was reading it. A spinner cannot do that.
 *
 * The three shapes are the three things a layout is made of — a run of text, a
 * block and a circle — and each is sized off the ladder the real component uses,
 * so a `md` line is as tall as `md` type and a `md` circle is exactly an
 * `MPAvatar` at `md`.
 */
export const MPSkeleton = React.forwardRef<HTMLDivElement, MPSkeletonProps>(function MPSkeleton(
  {
    shape = 'line',
    lines = 1,
    size = 'md',
    color,
    width,
    height,
    animated = true,
    label,
    render,
    className,
    style,
    ...props
  },
  ref
) {
  const pulse = animated ? PULSE : '';

  const shapeClasses =
    shape === 'circle'
      ? `rounded-mp-full shrink-0 ${CONTROL_SQUARE[size]}`
      : shape === 'rect'
        ? `rounded-mp-md w-full ${height === undefined ? BLOCK_HEIGHT[size] : ''}`
        : `rounded-mp-xs w-full ${LINE_HEIGHT[size]}`;

  // Unlabelled it is scenery and says nothing; labelled it is the one element
  // that reports the wait for the region around it.
  const announce = label
    ? ({ role: 'status', 'aria-busy': true, 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);

  // A run of lines is a stack of bars rather than one box, so the gaps between
  // them are real gaps: text has leading, and a striped gradient would not
  // survive a caller putting the block in a flex row. The root then holds only
  // the stacking, which is why it drops the fill and the pulse.
  const stacked = shape === 'line' && lines > 1;

  return useRender({
    render,
    ref,
    props: {
      'data-mp-size': size,
      className: (stacked
        ? ['mp-skeleton flex w-full flex-col', LINE_GAP[size], className ?? '']
        : ['mp-skeleton', FILL, pulse, shapeClasses, className ?? '']
      )
        .filter(Boolean)
        .join(' '),
      style: {
        '--_mp-placeholder': color
          ? `var(--_mp-color-${color}-container)`
          : 'var(--_mp-color-surface-container-highest)',
        width: toLength(width),
        // Not on a stack of lines. There the root is the column that holds them
        // and each bar has the type scale's own height, so a `height` here would
        // squeeze the column rather than set a line — and `overflow` is hidden,
        // so the lines that did not fit would simply be gone.
        height: stacked ? undefined : toLength(height),
        ...style
      } as React.CSSProperties,
      ...announce,
      ...(stacked
        ? {
            children: Array.from({ length: lines }, (_, index) => (
              <div
                key={index}
                className={[
                  FILL,
                  pulse,
                  'rounded-mp-xs',
                  LINE_HEIGHT[size],
                  // The last line of a paragraph does not reach the margin.
                  index === lines - 1 ? 'w-3/5' : 'w-full'
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))
          }
        : null),
      ...props
    }
  });
});
