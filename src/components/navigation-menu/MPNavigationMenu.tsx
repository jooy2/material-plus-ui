import * as React from 'react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { MPIcon } from '../icon/MPIcon';
import { ChevronDownIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_HEIGHT,
  CONTROL_ICON,
  CONTROL_PAD_X,
  CONTROL_TEXT,
  hasContent,
  META_TEXT
} from '../../internal/scale';
import { PORTAL_LAYER } from '../../internal/surface';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/**
 * What every part of a navigation menu inherits from the root.
 *
 * The same arrangement `internal/menu.ts` makes, kept in this file rather than
 * beside it because only this component's own parts read it: an item, its
 * trigger and the links in its panel are three things that exist nowhere else.
 */
interface MPNavigationMenuContextValue {
  size: MPSize;
}

const MPNavigationMenuContext = React.createContext<MPNavigationMenuContextValue>({ size: 'md' });

export interface MPNavigationMenuProps extends Omit<
  React.ComponentPropsWithoutRef<'nav'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /**
   * Which way the row runs. `vertical` is a rail whose panels open beside it
   * rather than under it; the arrow keys follow either way.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /** Which item's panel is open, by its `value`. Nullish is closed. */
  value?: string | null;
  /** Which starts open, for an uncontrolled menu. */
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /**
   * How long the pointer rests on an item before its panel opens, in
   * milliseconds.
   */
  delay?: number;
  /** And how long a panel stays after the pointer leaves. */
  closeDelay?: number;
  /**
   * Distance from the row, in pixels.
   * @default 8
   */
  sideOffset?: number;
  /**
   * The row's height and type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family an open item's label reads. The panel itself stays
   * neutral, as MD3's menu surface does.
   * @default 'primary'
   */
  color?: MPColor;
  /** The items. */
  children?: React.ReactNode;
}

export interface MPNavigationMenuItemProps {
  /** The word in the row. */
  label: React.ReactNode;
  /**
   * Makes the item a plain link rather than something that opens a panel.
   *
   * An item with an `href` and no children is a **destination**, and it is
   * announced as one — which is the whole reason a site's navigation is not an
   * [MPMenu](../inputs/menu).
   */
  href?: string;
  /** Where the link opens. Ignored without `href`. */
  target?: string;
  /** A glyph before the label. */
  startIcon?: React.ReactNode;
  /**
   * Identifies the item, for a controlled menu. Base UI gives each item an
   * identity of its own, so an uncontrolled menu needs none.
   */
  value?: string;
  /** Unavailable. The word stays in the row and opens nothing. */
  disabled?: boolean;
  /**
   * How many columns the panel lays its links out in.
   * @default 1
   */
  columns?: number;
  /** The panel's contents — usually `MPNavigationMenuLink`s. */
  children?: React.ReactNode;
}

export interface MPNavigationMenuLinkProps extends Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'color' | 'title'
> {
  /** Where it goes. */
  href: string;
  /** The row's name. */
  title: React.ReactNode;
  /** A second line under it, one step down the scale and muted. */
  description?: React.ReactNode;
  /** A glyph before the title. */
  startIcon?: React.ReactNode;
}

/**
 * The panel, and it is MD3's menu surface: `surface-container` at elevation 2
 * under `corner-extra-small` — the same three decisions [MPMenu](../inputs/menu)
 * and [MPSelect](../inputs/select) make. Three floating sheets on one page that
 * did not match would be three surfaces the eye has to learn separately.
 *
 * The transition is opacity **and the viewport's own size**, which is the one
 * place this differs from `FADE`. Base UI resizes one open panel into the next
 * rather than closing and reopening it, and animating that size is what makes
 * crossing the row read as one surface rather than as three.
 */
const POPUP = [
  'mp-navigation-menu__popup rounded-mp-xs shadow-mp-2',
  'bg-mp-surface-container text-mp-on-surface box-border overflow-hidden outline-none',
  'transition-[opacity,width,height] duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard data-starting-style:opacity-0 data-ending-style:opacity-0'
].join(' ');

/** The room the panel keeps around its links. */
const PANEL_PAD: Record<MPSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-3'
};

/**
 * One row inside a panel: where it goes, what it is called, and a line saying
 * what is there.
 *
 * A real `<a>`, which is the point of the whole component — a site's navigation
 * is a list of destinations, and a destination that is a `<div>` with a click
 * handler is not in the link list, not on the status bar and not in a crawler's
 * index.
 */
export const MPNavigationMenuLink = React.forwardRef<HTMLAnchorElement, MPNavigationMenuLinkProps>(
  function MPNavigationMenuLink(
    { href, title, description, startIcon, className, children, ...props },
    ref
  ) {
    const { size } = React.useContext(MPNavigationMenuContext);

    return (
      <NavigationMenu.Link
        ref={ref}
        href={href}
        className={[
          'mp-navigation-menu__link group text-mp-on-surface rounded-mp-xs relative flex',
          'min-w-0 cursor-pointer items-start bg-transparent py-2 no-underline outline-none',
          CONTROL_GAP[size],
          CONTROL_PAD_X[size],
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <MPStateLayer />

        {hasContent(startIcon) ? (
          <span className="relative flex h-[1lh] shrink-0 items-center">{startIcon}</span>
        ) : null}

        <span className="relative flex min-w-0 flex-col gap-0.5">
          <span className={`font-medium ${CONTROL_TEXT[size]}`}>{title}</span>
          {hasContent(description) ? (
            <span className={`text-mp-on-surface-variant ${META_TEXT}`}>{description}</span>
          ) : null}
          {children}
        </span>
      </NavigationMenu.Link>
    );
  }
);

/**
 * One word in the row, and what opens under it.
 *
 * With children it is a trigger and a panel; with an `href` and nothing else it
 * is a link — and the difference is not cosmetic. The second is announced as a
 * destination and the first as something that expands.
 */
export function MPNavigationMenuItem({
  label,
  href,
  target,
  startIcon,
  value,
  disabled = false,
  columns = 1,
  children
}: MPNavigationMenuItemProps) {
  const { size } = React.useContext(MPNavigationMenuContext);
  const isLink = href !== undefined && !hasContent(children);

  const chrome = [
    'mp-navigation-menu__item group text-mp-on-surface relative inline-flex shrink-0',
    'rounded-mp-full cursor-pointer items-center justify-center bg-transparent',
    'appearance-none font-[inherit] whitespace-nowrap no-underline select-none',
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-solid outline-none',
    'transition-colors duration-(--mp-sys-motion-duration-short4)',
    // The open item takes the accent, which is the only place a family reaches
    // this component: the panel under it stays neutral, as MD3's menu does.
    'data-popup-open:text-(--_mp-accent)',
    'data-disabled:text-mp-on-surface/38 data-disabled:cursor-default',
    CONTROL_HEIGHT[size],
    CONTROL_TEXT[size],
    CONTROL_GAP[size],
    CONTROL_PAD_X[size]
  ].join(' ');

  return (
    <NavigationMenu.Item value={value}>
      {isLink ? (
        <NavigationMenu.Link href={href} target={target} className={chrome}>
          <MPStateLayer />
          {hasContent(startIcon) ? <span className="relative flex">{startIcon}</span> : null}
          <span className="relative">{label}</span>
        </NavigationMenu.Link>
      ) : (
        <>
          <NavigationMenu.Trigger disabled={disabled} className={chrome}>
            {disabled ? null : <MPStateLayer className="group-data-popup-open:opacity-8" />}
            {hasContent(startIcon) ? <span className="relative flex">{startIcon}</span> : null}
            <span className="relative">{label}</span>
            {/*
             * Drawn pointing down and turned when the panel is open. A glyph
             * rotating is not a control moving, which is the distinction the
             * library draws everywhere it allows a transform at all.
             */}
            <NavigationMenu.Icon
              className={[
                'relative flex items-center transition-transform',
                'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
                'data-popup-open:rotate-180'
              ].join(' ')}
            >
              <MPIcon icon={ChevronDownIcon} size={CONTROL_ICON[size]} />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>

          <NavigationMenu.Content
            className={`mp-navigation-menu__panel grid gap-1 ${PANEL_PAD[size]}`}
            style={
              columns > 1
                ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
                : undefined
            }
          >
            {children}
          </NavigationMenu.Content>
        </>
      )}
    </NavigationMenu.Item>
  );
}

/**
 * A site's navigation: a row of destinations, some of which open a panel of more
 * of them.
 *
 * ## Why this is not an MPMenu
 *
 * Because of what the rows **are**.
 *
 * An [MPMenu](../inputs/menu) holds actions, so its rows are `menuitem`s and the
 * whole thing is a widget that takes the arrow keys. This holds links, so it is
 * a `<nav>` full of real `<a>`s — which is what puts each destination in a
 * screen reader's link list, on the browser's status bar, on the middle-click
 * menu and in a crawler's index.
 *
 * The rule is short: reach for a menu when the row **does** something, and for
 * this when the row **goes** somewhere.
 *
 * ## One panel, resized
 *
 * One panel is open at a time and it resizes between items rather than closing
 * and reopening, which is Base UI's doing. It is also why the popup animates its
 * width and height as well as its opacity: crossing the row should read as one
 * surface following the pointer, not as three sheets flashing.
 *
 * ## Where it goes
 *
 * In an [MPHeader](../layout/header)'s middle slot, which is what that slot is
 * for. Down the side of a page it is `orientation="vertical"`, which is a rail
 * whose panels open beside it.
 */
export const MPNavigationMenu = React.forwardRef<HTMLElement, MPNavigationMenuProps>(
  function MPNavigationMenu(
    {
      orientation = 'horizontal',
      value,
      defaultValue,
      onValueChange,
      delay,
      closeDelay,
      sideOffset = 8,
      size = 'md',
      color = 'primary',
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const context = React.useMemo(() => ({ size }), [size]);

    return (
      <MPNavigationMenuContext.Provider value={context}>
        <NavigationMenu.Root
          ref={ref}
          orientation={orientation}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next) => onValueChange?.(next)}
          delay={delay}
          closeDelay={closeDelay}
          data-mp-size={size}
          className={['mp-navigation-menu', className ?? ''].filter(Boolean).join(' ')}
          style={{ ...accentSlots(color), ...style }}
          {...props}
        >
          <NavigationMenu.List
            className={[
              'flex items-center',
              orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row',
              CONTROL_GAP[size]
            ].join(' ')}
          >
            {children}
          </NavigationMenu.List>

          <NavigationMenu.Portal>
            <NavigationMenu.Positioner
              className={PORTAL_LAYER}
              sideOffset={sideOffset}
              collisionPadding={12}
              // The accent slots are declared on the root, and a portalled panel
              // is not inside the root — so the family has to be declared here
              // too or an open item's own panel would resolve against the page.
              style={accentSlots(color)}
            >
              <NavigationMenu.Popup className={POPUP}>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
      </MPNavigationMenuContext.Provider>
    );
  }
);
