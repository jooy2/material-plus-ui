import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { sheetPadX, sheetPadY } from '../../internal/density';
import { containerSurface } from '../../internal/elevation';
import { SHEET_GAP, hasContent } from '../../internal/scale';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPDensity, MPElevation, MPPosition, MPSize, MPVariant } from '../../types';

/** Which edge a pinned bar is held against. */
export type MPToolbarSide = 'top' | 'bottom';

export interface MPToolbarProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * How much surface the bar paints.
   *
   * A container's ladder, so the bar is never dyed — exactly as on `MPBox`. A
   * toolbar holds other people's controls, and those controls arrive with
   * colours of their own.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * How far off the page it is lifted, on MD3's five levels.
   *
   * Left unset the bar is flat even when it is pinned, and that is deliberate: a
   * shadow under a header is a way of saying "there is content beneath this",
   * which is only true once the page has been scrolled. Raise it yourself, or
   * leave it flat and turn on `divider`.
   */
  elevation?: MPElevation;
  /**
   * The room inside. As on `MPBox`, `size` sets padding here and neither a
   * height nor a type scale: a toolbar is as tall as the controls in it.
   * @default 'md'
   */
  size?: MPSize;
  /** Takes room out of that padding, two pixels a face per step. @default 0 */
  density?: MPDensity;
  /**
   * How the bar sits in the page's scroll.
   *
   * - `static` — in the flow, scrolling away with the content.
   * - `sticky` — in the flow until it reaches the edge, then held there. What an
   *   application header usually wants: it takes up its own room, so nothing
   *   underneath has to be padded around it.
   * - `fixed` — out of the flow entirely. The page needs padding of its own, or
   *   the first screenful sits behind the bar.
   * - `absolute` — pinned to the nearest positioned ancestor rather than to the
   *   window. For a bar along the edge of a panel.
   * @default 'static'
   */
  position?: MPPosition;
  /** Which edge it is held against when `position` is not `static`. @default 'top' */
  side?: MPToolbarSide;
  /**
   * Draws a hairline along the edge that faces the content — under a `top` bar,
   * over a `bottom` one.
   * @default false
   */
  divider?: boolean;
  /** Pinned to the start of the bar: a logo, a title, a back button. */
  start?: React.ReactNode;
  /** Pinned to the end: the actions. */
  end?: React.ReactNode;
  /**
   * Renders something other than a `<div>`. Worth reaching for here more than
   * anywhere else: a page's header should be a `<header>`.
   */
  render?: useRender.RenderProp;
  /** The middle. Takes whatever width `start` and `end` leave. */
  children?: React.ReactNode;
}

/** Where a pinned bar sits, and how high it stacks. */
const POSITION: Record<MPPosition, Record<MPToolbarSide, string>> = {
  static: { top: '', bottom: '' },
  absolute: { top: 'absolute inset-x-0 top-0 z-20', bottom: 'absolute inset-x-0 bottom-0 z-20' },
  sticky: { top: 'sticky top-0 z-20', bottom: 'sticky bottom-0 z-20' },
  fixed: { top: 'fixed inset-x-0 top-0 z-30', bottom: 'fixed inset-x-0 bottom-0 z-30' }
};

/** The rule faces the content, so it moves to the other edge on a bottom bar. */
const DIVIDER: Record<MPToolbarSide, string> = {
  top: 'border-mp-outline-variant border-b',
  bottom: 'border-mp-outline-variant border-t'
};

/**
 * A bar of controls: an application header, a page's action row, the strip along
 * the bottom of an editor.
 *
 * ```tsx
 * <MPToolbar render={<header />} position="sticky" divider start={<MPAppLogo name="Acme" />}>
 *   <MPTextField placeholder="Search" />
 * </MPToolbar>
 * ```
 *
 * Three slots and a row. `start` and `end` are pinned to their ends and
 * `children` takes what is left, which is the arrangement every toolbar has ever
 * had — so it is laid out here rather than left to a caller and the spacer
 * `<div>` they have to remember.
 *
 * ## It takes no height
 *
 * A toolbar is as tall as the controls in it plus its padding, and that padding
 * is the `size`/`density` pair every other surface uses. So `density={-2}` gives
 * the dense bar without a second prop that means the same thing, and without the
 * type scale moving.
 *
 * ## It has no `role="toolbar"`, deliberately
 *
 * That role is a promise about keyboard behaviour — one tab stop for the whole
 * bar, arrow keys between the controls inside it — and a bar that claims it
 * without implementing it is worse for a keyboard reader than one that claimed
 * nothing at all.
 *
 * What a page header wants is `render={<header />}`, which is a landmark and is
 * true. What a genuine roving-focus toolbar wants is `MPButtonGroup`, which is
 * one.
 *
 * ## What it is not
 *
 * Not `MPHeader`, which is `MPPageLayout`'s own slot and knows about the
 * sidebar, the skip link and the drawer. This is a bar you can put anywhere,
 * including inside a card.
 */
export const MPToolbar = React.forwardRef<HTMLDivElement, MPToolbarProps>(function MPToolbar(
  {
    variant = 'outlined',
    elevation,
    size: sizeProp,
    density: densityProp,
    position = 'static',
    side = 'top',
    divider = false,
    start,
    end,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);

  return useRender({
    render,
    ref,
    props: {
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        'mp-toolbar box-border flex w-full min-w-0 items-center',
        sheetPadX(size, density),
        sheetPadY(size, density),
        SHEET_GAP[size],
        // A pinned bar spans an edge of the window, and a rounded corner against
        // the edge of the screen is a gap with nothing behind it. Only a bar
        // sitting in the flow is a sheet with corners.
        position === 'static' ? 'rounded-mp-md' : '',
        containerSurface(variant, elevation),
        'text-mp-on-surface',
        divider ? DIVIDER[side] : '',
        POSITION[position][side],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      style,
      children: (
        <React.Fragment>
          {hasContent(start) ? (
            <div className="mp-toolbar__start flex min-w-0 shrink-0 items-center gap-2">
              {start}
            </div>
          ) : null}

          {/* `flex-1` even when there is nothing in it, so `start` and `end`
              stay at their own ends rather than collapsing together in the
              middle of the bar. */}
          <div className="mp-toolbar__main flex min-w-0 flex-1 items-center gap-2">{children}</div>

          {hasContent(end) ? (
            <div className="mp-toolbar__end flex min-w-0 shrink-0 items-center gap-2">{end}</div>
          ) : null}
        </React.Fragment>
      ),
      ...props
    }
  });
});
