import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { responsiveSlots } from '../../internal/responsive';
import { cssLength } from '../../internal/length';
import type { MPGridAlign, MPGridJustify } from '../grid/MPGrid';
import type { MPResponsive } from '../../types';

/** Which way the items run. */
export type MPFlexDirection = 'row' | 'column';

export interface MPFlexProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Which way the items run, and the width at which that changes.
   *
   * `direction={{ compact: 'column', medium: 'row' }}` is the whole reason this
   * component exists as something other than a `className`: a stack on a phone
   * and a row from 600dp up is the most common layout decision there is, and
   * writing it as a Tailwind variant means writing the library's boundary out
   * again in a number that has to match.
   * @default 'row'
   */
  direction?: MPResponsive<MPFlexDirection>;
  /**
   * Whether items that do not fit move onto another line.
   * @default false
   */
  wrap?: MPResponsive<boolean>;
  /**
   * How the space the items did not take is divided along the direction.
   * @default 'start'
   */
  justify?: MPResponsive<MPGridJustify>;
  /**
   * How the items sit across it.
   *
   * `stretch` is CSS's own default and is what makes two cards in a row the same
   * height without either being told a height. `center` is what a row of a label
   * and a control wants.
   * @default 'stretch'
   */
  align?: MPResponsive<MPGridAlign>;
  /**
   * The space between items. A number is pixels, a string is any CSS length.
   * @default 0
   */
  gap?: MPResponsive<number | string>;
  /**
   * Lays out as `inline-flex`, so the box is as wide as its contents and sits in
   * a line of text.
   * @default false
   */
  inline?: boolean;
  /**
   * Renders something other than a `<div>`. Base UI's own escape hatch, so it
   * behaves here exactly as it does on every Base UI primitive.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * A row, or a column, and the width at which it changes from one to the other.
 *
 * It draws nothing. No surface, no padding, no corner — only the five properties
 * a flex container has, each of which can be said per window size class.
 *
 * ## Why this and not a `className`
 *
 * For a row that is always a row, a `className` is the better answer and this
 * component is overhead. What it is for is the row that is a column on a phone:
 *
 * ```tsx
 * <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
 * ```
 *
 * Written as Tailwind variants that is `flex-col md:flex-row`, which is the
 * library's boundary said again in Tailwind's numbers — 768px rather than 600 —
 * and a layout that reflows at one width while the `MPGrid` beside it reflows at
 * another. The variants this package ships (`mp-medium:flex-row`) fix the number
 * and are the right answer where a page is already writing Tailwind; this is the
 * answer for a page that would rather say it in props, and it resolves in CSS
 * either way. See [Breakpoints](../../design/breakpoints).
 *
 * ## Its relationship to the other three
 *
 * - [MPGrid](./grid) divides a row into columns and is what a *page* is laid out
 *   on. Reach for it when things have to line up with things in another row.
 * - [MPStack](./stack) lays things **over** each other in a pile, which is a
 *   different idea that shares an unfortunate name across the ecosystem.
 * - [MPBox](./box) is a sheet with padding and a surface. This is neither.
 *
 * ## Every axis is responsive, and resolved in CSS
 *
 * The values reach the stylesheet as `--_mp-flex-*` slots, one per class the
 * caller actually named, and the rules in `styles.css` fall each class back to
 * the one below it. So a window crossing 600dp changes the layout with nothing
 * re-rendering, and a server-rendered first paint is already right — which is
 * the half of this that a hook and a branch cannot do.
 */
export const MPFlex = React.forwardRef<HTMLDivElement, MPFlexProps>(function MPFlex(
  {
    direction,
    wrap,
    justify,
    align,
    gap,
    inline = false,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  return useRender({
    render,
    ref,
    props: {
      className: ['mp-flex', inline ? 'inline-flex' : 'flex', className ?? '']
        .filter(Boolean)
        .join(' '),
      style: {
        ...responsiveSlots('flex-dir', direction, (value) => value),
        // `wrap` is a boolean in the props and two keywords in CSS, and the
        // translation belongs here rather than in the type: `wrap={false}` reads
        // better at a call site than `wrap="nowrap"`, and CSS has no boolean.
        ...responsiveSlots('flex-wrap', wrap, (value) => (value ? 'wrap' : 'nowrap')),
        ...responsiveSlots('flex-justify', justify, toJustify),
        ...responsiveSlots('flex-align', align, toAlign),
        ...responsiveSlots('flex-gap', gap, (value) => cssLength(value) as string),
        ...style
      },
      children,
      ...props
    }
  });
});

/**
 * `start` and `end` reach CSS as `flex-start` and `flex-end`.
 *
 * The bare words are the library's, and they are the ones `MPAlign` already
 * uses — a caller who has written `align="start"` on a divider's label should
 * not have to write a different word here. Everything else is CSS's own and
 * passes through, which is the rule `MPGridJustify` states.
 */
function toJustify(value: MPGridJustify): string {
  return value === 'start' || value === 'end' ? `flex-${value}` : value;
}

function toAlign(value: MPGridAlign): string {
  return value === 'start' || value === 'end' ? `flex-${value}` : value;
}
