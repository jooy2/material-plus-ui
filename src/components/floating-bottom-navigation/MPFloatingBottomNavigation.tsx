import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import {
  MPBottomNavigationContext,
  type MPBottomNavigationLabels,
  type MPBottomNavigationValue
} from '../../internal/bottom-navigation';
import { containerSurface } from '../../internal/elevation';
import { cssLength } from '../../internal/length';
import { useMPSize } from '../../internal/config';
import type { MPElevation, MPPosition, MPSize, MPVariant } from '../../types';

export interface MPFloatingBottomNavigationProps extends Omit<
  React.ComponentPropsWithoutRef<'nav'>,
  'defaultValue' | 'onChange'
> {
  /** The destination the reader is on. Use with `onValueChange` for a controlled bar. */
  value?: MPBottomNavigationValue | null;
  /** Which starts current, for an uncontrolled bar. */
  defaultValue?: MPBottomNavigationValue | null;
  /** Called with the value of the destination that was pressed. */
  onValueChange?: (value: MPBottomNavigationValue) => void;
  /**
   * How the bar sits in the page's scroll.
   *
   * `fixed` — the default — holds it against the bottom of the window.
   * `sticky` holds it against the bottom of whatever is scrolling, `absolute`
   * against the bottom of the nearest positioned ancestor — which is what a bar
   * inside a phone screen of its own wants — and `static` puts it back in the
   * flow, centred.
   * @default 'fixed'
   */
  position?: MPPosition;
  /**
   * How far the bar floats above the bottom edge. A number is pixels, a string
   * is any CSS length.
   *
   * This is the whole difference between this component and
   * `MPBottomNavigation`: the gap under it is what makes the page keep going
   * underneath rather than stop at a bar.
   * @default 16
   */
  offset?: number | string;
  /**
   * Which names are drawn. `selected` here, against the `all` a full-width bar
   * defaults to: this one is only as wide as what is in it, so five drawn names
   * would stretch it across the screen and it would stop being a lozenge.
   * @default 'selected'
   */
  labels?: MPBottomNavigationLabels;
  /**
   * How much surface the lozenge paints.
   *
   * A container's ladder, so the sheet is never dyed — what carries the accent
   * is the one destination that is current.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * How far off the page it is lifted.
   *
   * `3` here, against the nothing every other surface defaults to, because this
   * bar is *defined* by not being part of the page: a lozenge lying flat over
   * the content it is floating above reads as a mistake rather than as a
   * decision.
   * @default 3
   */
  elevation?: MPElevation;
  /**
   * The height of the row and its type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Adds `env(safe-area-inset-bottom)` to `offset`, so the bar clears a phone's
   * home indicator rather than sitting on it.
   *
   * Unlike on `MPBottomNavigation` this moves the whole sheet rather than the
   * row inside it: there is nothing under a floating bar that has to stay
   * covered.
   * @default true
   */
  safeArea?: boolean;
  /** Every destination stops answering. */
  disabled?: boolean;
  /**
   * The name the bar is announced by — "Main", "Sections". A landmark with no
   * name is one a screen reader lists as "navigation".
   */
  label?: string;
  /**
   * Renders something other than a `<nav>`. Rarely what you want here: a row of
   * destinations is navigation.
   */
  render?: useRender.RenderProp;
  /** The `MPBottomNavigationItem`s — the same item the full-width bar takes. */
  children?: React.ReactNode;
}

/**
 * The lozenge's height.
 *
 * Shorter than the full-width bar at every rung, and that is the shape rather
 * than a different opinion about spacing. A bar against the bottom edge is 80dp
 * because it has a whole screen edge to hold; a lozenge floating over the page
 * is a control, and one as tall as the specification's bar would read as a
 * misplaced bar rather than as something lifted off the page.
 */
const BAR_HEIGHT: Record<MPSize, string> = {
  xs: 'h-12',
  sm: 'h-14',
  md: 'h-16',
  lg: 'h-18',
  xl: 'h-20'
};

/**
 * The air inside the sheet, around the row.
 *
 * Tight, and that is what the shape needs: a destination in this bar carries a
 * rounded indicator of its own, and this padding is the gap between that
 * indicator and the lozenge's own edge. Any more and there are two concentric
 * stadiums with a stripe of nothing between them.
 */
const ROW_PAD: Record<MPSize, string> = {
  xs: 'px-1',
  sm: 'px-1.5',
  md: 'px-2',
  lg: 'px-2.5',
  xl: 'px-3'
};

/** Between one destination and the next. */
const ROW_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
  xl: 'gap-2.5'
};

/**
 * Where a floating bar hangs.
 *
 * Centred by stretching the box across its container and letting `mx-auto`
 * shrink it back, never by translating it half its own width. The rule against
 * moving a surface holds here too, and `auto` margins stay centred under RTL
 * without being told.
 */
const POSITION: Record<MPPosition, string> = {
  static: 'mx-auto w-fit',
  absolute: 'absolute inset-x-0 bottom-(--_mp-nav-offset) z-30 mx-auto w-fit',
  sticky: 'sticky bottom-(--_mp-nav-offset) z-30 mx-auto w-fit',
  fixed: 'fixed inset-x-0 bottom-(--_mp-nav-offset) z-40 mx-auto w-fit'
};

/**
 * A row of destinations floating clear of the bottom edge of the window.
 *
 * ```tsx
 * <MPFloatingBottomNavigation defaultValue="home" label="Main">
 *   <MPBottomNavigationItem value="home" icon={<HomeIcon />}>Home</MPBottomNavigationItem>
 *   <MPBottomNavigationItem value="search" icon={<SearchIcon />}>Search</MPBottomNavigationItem>
 * </MPFloatingBottomNavigation>
 * ```
 *
 * It is `MPBottomNavigation` lifted off the page. The same `<nav>`, the same
 * `MPBottomNavigationItem` children, the same `aria-current="page"` — and
 * deliberately not a `role="tablist"`, for the same reason: a bottom navigation
 * changes what the page *is*, not which panel of one is showing.
 *
 * ## Everything about the shape follows from `offset`
 *
 * Because the page keeps going underneath, the sheet is a stadium rather than a
 * bar with two corners; it is only as wide as its destinations; it carries a
 * shadow, because a lozenge lying flat over what it is floating above reads as
 * a mistake; and it names only the destination the reader is on, since five
 * drawn names would stretch it back into a bar.
 *
 * ## There is no second highlight
 *
 * The destination the reader is on wears the same active indicator it wears in
 * the full-width bar — MD3's pill, widening out of a circle behind the glyph.
 * A floating bar could instead have one tile that slides between destinations,
 * and this deliberately does not: the specification draws one selected
 * treatment, and a lozenge with both would be saying where the reader is twice,
 * on two different curves.
 *
 * ## Which bar to reach for
 *
 * `MPBottomNavigation` when the bar is the bottom of the screen — the page
 * stops at it, and the tonal step between `surface-container` and `surface` is
 * what separates them. This one when the content is meant to run underneath: a
 * map, a photograph, a feed that should not end in a bar.
 */
export const MPFloatingBottomNavigation = React.forwardRef<
  HTMLElement,
  MPFloatingBottomNavigationProps
>(function MPFloatingBottomNavigation(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    position = 'fixed',
    offset = 16,
    labels = 'selected',
    variant = 'filled',
    elevation = 3,
    size: sizeProp,
    safeArea = true,
    disabled = false,
    label,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const [uncontrolled, setUncontrolled] = React.useState<MPBottomNavigationValue | null>(
    defaultValue
  );
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolled;

  const change = React.useCallback(
    (next: MPBottomNavigationValue) => {
      if (!controlled) {
        setUncontrolled(next);
      }

      onValueChange?.(next);
    },
    [controlled, onValueChange]
  );

  const context = React.useMemo(
    () => ({ value: value ?? null, change, size, labels, disabled, floating: true }),
    [value, change, size, labels, disabled]
  );

  const gap = cssLength(offset);

  return useRender({
    render: render ?? <nav />,
    ref,
    props: {
      'aria-label': label,
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        // `max-w-full` rather than a width: the lozenge is as wide as its
        // destinations until that is wider than the screen, and then it is the
        // screen. The names truncate before the sheet does.
        'mp-floating-bottom-navigation rounded-mp-full box-border flex max-w-full min-w-0',
        'items-stretch',
        BAR_HEIGHT[size],
        ROW_PAD[size],
        ROW_GAP[size],
        containerSurface(variant, elevation),
        'text-mp-on-surface',
        POSITION[position],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      style: {
        // The whole sheet moves up rather than only the row inside it, which is
        // the other half of what `offset` means here: there is no surface below
        // the bar that would be left showing as a stripe.
        '--_mp-nav-offset': safeArea ? `calc(${gap} + env(safe-area-inset-bottom))` : gap,
        ...style
      } as React.CSSProperties,
      children: (
        <MPBottomNavigationContext.Provider value={context}>
          {children}
        </MPBottomNavigationContext.Provider>
      ),
      ...props
    }
  });
});
