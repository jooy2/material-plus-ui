import * as React from 'react';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { cssLength } from '../../internal/length';
import { useMPSize } from '../../internal/config';
import type { MPOrientation, MPSize } from '../../types';

/** Which way the content is allowed to scroll. */
export type MPScrollAxis = MPOrientation | 'both';

/**
 * The scrollbar's thickness, and the only thing `size` sets here.
 *
 * A scrollbar is not a control and has no height on the ladder — what it has is
 * a width, and these are the useful range: 6px is a hairline that says "there is
 * more" without taking room from the content, and 12px is a target a pointer can
 * catch without aiming.
 *
 * `md` is 10, which is close to what macOS draws and narrower than Windows'
 * classic 17. The library is not trying to match either; a scrollbar drawn by
 * this component is the same width on every machine, which is the whole point.
 */
const TRACK: Record<MPSize, string> = {
  xs: 'w-1.5',
  sm: 'w-2',
  md: 'w-2.5',
  lg: 'w-3',
  xl: 'w-3.5'
};

const TRACK_X: Record<MPSize, string> = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3',
  xl: 'h-3.5'
};

export interface MPScrollAreaProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /**
   * The scrollbar's thickness.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which way the content may scroll.
   *
   * `vertical` is the common case and the default. `both` is for content with a
   * width of its own — a wide table, a diagram — where neither axis should be
   * the one that wraps.
   * @default 'vertical'
   */
  axis?: MPScrollAxis;
  /**
   * How tall the box is allowed to get before it starts scrolling. A number is
   * pixels, a string is any CSS length.
   *
   * Something has to bound the box or there is nothing to scroll: a scroll area
   * whose height is its content's height never overflows. This is the usual way
   * to say that, and a `className` with a `max-h-*` or a flex parent that
   * constrains it are the others.
   */
  maxHeight?: number | string;
  /** A fixed height, for the box that should be its size whatever is in it. */
  height?: number | string;
  /**
   * Keeps the scrollbar drawn instead of fading it out when the pointer leaves.
   *
   * Off, it behaves the way an overlay scrollbar does — visible while scrolling
   * or hovered, gone otherwise. On is right for a panel whose scrollability is
   * not obvious from its content, where a bar that appears only on hover is a
   * bar a reader has to discover.
   * @default false
   */
  persistent?: boolean;
  children?: React.ReactNode;
}

/**
 * A box with a scrollbar of its own.
 *
 * The browser's is drawn by the operating system: a different width on every
 * machine, a different colour from the sheet it is cut into, and on Windows a
 * 17px band of grey that no design accounts for. This one is an element, so it
 * is the same everywhere and made of the library's own tokens.
 *
 * ```tsx
 * <MPScrollArea maxHeight={320}>
 *   <MPList>…</MPList>
 * </MPScrollArea>
 * ```
 *
 * ## Something has to bound the box
 *
 * A scroll area whose height is its content's height never overflows and never
 * shows a bar. `maxHeight` is the usual way to say what bounds it; a `className`
 * carrying a `max-h-*`, or a flex parent that constrains it, are the others.
 *
 * ## The scrollbar overlays the content
 *
 * It takes no room in the layout, which is what makes it swappable for the
 * browser's own on a page that has already been designed: adding one does not
 * reflow anything. The trade is that content can pass underneath it, so a box
 * whose content reaches the edge wants a little inline padding of its own.
 *
 * ## It is still a real scroll container
 *
 * The wheel, the trackpad, a touch drag, Page Up, Home and End, and a keyboard
 * focus moving into something below the fold all work, because the viewport
 * underneath is an ordinary `overflow: auto` element. This replaces how the bar
 * is *drawn* and nothing about how scrolling behaves — including the browser's
 * own scroll anchoring and its overscroll handling.
 *
 * The native bar is hidden rather than the scrolling being reimplemented, which
 * is the difference between this and a library that listens for `wheel` events.
 */
export const MPScrollArea = React.forwardRef<HTMLDivElement, MPScrollAreaProps>(
  function MPScrollArea(
    {
      size: sizeProp,
      axis = 'vertical',
      maxHeight,
      height,
      persistent = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const vertical = axis !== 'horizontal';
    const horizontal = axis !== 'vertical';

    return (
      <ScrollArea.Root
        ref={ref}
        data-mp-size={size}
        className={['mp-scroll-area relative overflow-hidden', className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={style}
        {...props}
      >
        {/*
         * The bound goes on the **viewport**, not on the root.
         *
         * A `max-height` on the root leaves its own height `auto`, and a child
         * asking for `height: 100%` of an `auto` parent gets its content's
         * height instead — so the viewport came out as tall as what was in it
         * and never overflowed. The root then takes the viewport's height, which
         * is the same box either way; the difference is that this one scrolls.
         */}
        <ScrollArea.Viewport
          className="mp-scroll-area__viewport size-full overscroll-contain"
          style={{ maxHeight: cssLength(maxHeight), height: cssLength(height) }}
        >
          {/*
           * Base UI's Content wrapper, which is what makes a horizontal bar
           * measure the content rather than the viewport. Without it a child
           * that is wider than the box stretches the wrapper instead of
           * overflowing it, and the bar never appears.
           */}
          <ScrollArea.Content className="mp-scroll-area__content">{children}</ScrollArea.Content>
        </ScrollArea.Viewport>

        {vertical ? <Bar orientation="vertical" size={size} persistent={persistent} /> : null}
        {horizontal ? <Bar orientation="horizontal" size={size} persistent={persistent} /> : null}

        {/*
         * The square where two bars meet. Drawn only when both exist — on one
         * axis there is no corner, and an element there would be a grey square
         * in the corner of a box that scrolls one way.
         */}
        {vertical && horizontal ? (
          <ScrollArea.Corner className="mp-scroll-area__corner bg-mp-surface-container" />
        ) : null}
      </ScrollArea.Root>
    );
  }
);

function Bar({
  orientation,
  size,
  persistent
}: {
  orientation: MPOrientation;
  size: MPSize;
  persistent: boolean;
}) {
  return (
    <ScrollArea.Scrollbar
      orientation={orientation}
      className={[
        'mp-scroll-area__bar flex touch-none select-none p-0.5',
        orientation === 'vertical' ? TRACK[size] : TRACK_X[size],
        // Opacity rather than `display`, so the bar fades instead of appearing.
        // A bar that pops in on hover reads as a jolt at the edge of the eye.
        'transition-opacity duration-(--mp-sys-motion-duration-short4)',
        persistent
          ? 'opacity-100'
          : 'opacity-0 data-hovering:opacity-100 data-scrolling:opacity-100'
      ].join(' ')}
    >
      <ScrollArea.Thumb
        className={[
          'mp-scroll-area__thumb rounded-mp-full flex-1',
          // `on-surface` at 38% is MD3's own disabled-content wash, and it is
          // the right weight for a thumb: legible on every surface role in both
          // schemes, and quieter than anything the content is made of.
          'bg-mp-on-surface/38 hover:bg-mp-on-surface/56 active:bg-mp-on-surface/56',
          'transition-[background-color] duration-(--mp-sys-motion-duration-short4)'
        ].join(' ')}
      />
    </ScrollArea.Scrollbar>
  );
}
