import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { SHEET_PAD_X } from '../../internal/scale';
import type { MPSize } from '../../types';

/**
 * The measure ladder, in `rem` and pinned to MD3's window size class
 * boundaries: 600, 840, 1200 and 1600dp, with one rung below them.
 *
 * So `maxWidth="md"` is "never wider than a medium window", which is a sentence
 * about the specification rather than a number somebody liked. Tailwind's own
 * `max-w-*` scale is a different set of numbers — `max-w-lg` is 32rem — and
 * having two ladders called `lg` on one page is how a layout drifts by a few
 * pixels for no reason anybody can find later.
 *
 * Written out as literal class strings because Tailwind finds classes by
 * scanning source text: an interpolated `max-w-[${n}rem]` generates no rule at
 * all.
 */
const MEASURE: Record<MPSize, string> = {
  xs: 'max-w-[30rem]',
  sm: 'max-w-[37.5rem]',
  md: 'max-w-[52.5rem]',
  lg: 'max-w-[75rem]',
  xl: 'max-w-[100rem]'
};

export interface MPContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * How wide the content is allowed to get, on a ladder pinned to MD3's window
   * size classes — `sm` 600dp, `md` 840dp, `lg` 1200dp, `xl` 1600dp, `xs` 480dp.
   *
   * `none`, the default, is no limit: a container's job is the margin, and a
   * measure is a second decision that a page should have to ask for.
   * @default 'none'
   */
  maxWidth?: MPSize | 'none';
  /**
   * The page margin. Turn it off to keep the centring and the measure without
   * the gutter — a full-bleed hero, a section that pads itself.
   * @default true
   */
  padded?: boolean;
  /**
   * The margin's rung. `md` is 16dp, which is MD3's own compact margin; the
   * specification widens it to 24dp from a medium window up, which here is
   * `size="lg"`.
   *
   * As on [MPBox](./box) this is the size of the *sheet* — it never touches a
   * height or the type scale — and it is independent of `maxWidth`, which is how
   * wide the content gets rather than how far it sits from the edge.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Centres the content once `maxWidth` is narrower than the page. No effect
   * while `maxWidth` is `none`, because there is nothing left over to centre in.
   * @default true
   */
  centered?: boolean;
  /**
   * Renders something other than a `<div>`: `render={<main />}`,
   * `render={<section />}`. Base UI's own escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * The page margin, and optionally a measure.
 *
 * Material describes a layout as content held off the edge of the window by a
 * margin — 16dp in a compact window, 24dp from medium up — and this is that
 * margin, said once, at the top of a page rather than on each of the things
 * inside it.
 *
 * Nothing to do with the grid. A container holds an [MPGrid](./grid) as happily
 * as it holds a single paragraph, and a grid needs no container around it: the
 * two are separate because the questions are separate — how far the content sits
 * from the edge of the window, and how the content divides itself up.
 *
 * ## Why it draws no surface
 *
 * No `variant`, no `color`, no shadow, for the same reason a grid draws none:
 * the outermost element on a page is the one thing that must not decide what the
 * page looks like. A container that painted `surface-container` would put a
 * second background behind an application that already has one, and every sheet
 * inside it would then be a sheet on a sheet.
 *
 * When the page genuinely is a card on a background, that is an
 * [MPBox](./box) or an [MPCard](./card) *inside* the container.
 *
 * ## Why the measure is off by default
 *
 * Because the two decisions arrive at different times. Nearly every page wants
 * the margin, and a good number of them — a dashboard, a table, an editor —
 * deliberately want the full width. A container that capped the width on its own
 * would be a component whose most common use is undoing something it did.
 */
export const MPContainer = React.forwardRef<HTMLDivElement, MPContainerProps>(function MPContainer(
  {
    maxWidth = 'none',
    padded = true,
    size = 'md',
    centered = true,
    render,
    className,
    children,
    ...props
  },
  ref
) {
  return useRender({
    render,
    ref,
    props: {
      'data-mp-size': size,
      className: [
        'mp-container block w-full',
        // `box-border` explicitly, for the reason `MPBox` gives: with no page
        // reset, a container whose `maxWidth` was set would have its margin
        // added *outside* that width and come out wider than it asked to be.
        'box-border',
        maxWidth === 'none' ? '' : MEASURE[maxWidth],
        centered ? 'mx-auto' : '',
        padded ? SHEET_PAD_X[size] : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      children,
      ...props
    }
  });
});
