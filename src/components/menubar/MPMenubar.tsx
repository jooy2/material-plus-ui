import * as React from 'react';
import { Menubar } from '@base-ui/react/menubar';
import { MPMenu } from '../menu/MPMenu';
import { accentSlots } from '../../internal/accent';
import { MPMenuContext } from '../../internal/menu';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_GAP, hasContent } from '../../internal/scale';
import type { MPColor, MPOrientation, MPSize } from '../../types';

export interface MPMenubarProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which way the bar runs. `vertical` is the shape a side rail of menus takes;
   * the arrow keys follow it either way.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * Whether an open menu takes the page away.
   * @default true
   */
  modal?: boolean;
  /**
   * Whether the arrow keys wrap around at the ends of the bar.
   * @default true
   */
  loopFocus?: boolean;
  /** Disables every menu on the bar at once. */
  disabled?: boolean;
  /**
   * The row height and type scale, passed to every menu on the bar.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family an open menu's word reads, and which a chosen row inside
   * it reads.
   * @default 'primary'
   */
  color?: MPColor;
  /** The `MPMenubarMenu`s. */
  children?: React.ReactNode;
}

export interface MPMenubarMenuProps {
  /** The word on the bar. */
  label: React.ReactNode;
  /** A glyph before the label. */
  startIcon?: React.ReactNode;
  /** Unavailable. The word stays on the bar and opens nothing. */
  disabled?: boolean;
  /** The rows, written exactly as they are inside an [MPMenu](./menu). */
  children?: React.ReactNode;
  /**
   * Added to the word on the bar — the button that opens the menu — rather than
   * to the menu it opens. That one takes its own `className` on
   * [MPMenu](./menu).
   */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A menu bar's own row height, a rung below the control ladder at every step.
 *
 * A menu bar is **not a row of buttons** — it is a strip of words, and the strip
 * is usually inside something that already has a height of its own: an
 * [MPHeader](../layout/header), a toolbar, a title bar. Drawn at control height,
 * `File Edit View` would be three buttons in a row and the strip would be taller
 * than the thing it is sitting on.
 */
const TRIGGER_HEIGHT: Record<MPSize, string> = {
  xs: 'h-6',
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12'
};

/** And its inline padding, which is a word's rather than a control's. */
const TRIGGER_PAD_X: Record<MPSize, string> = {
  xs: 'px-1.5',
  sm: 'px-2',
  md: 'px-2.5',
  lg: 'px-3',
  xl: 'px-4'
};

/**
 * `label-large` at `md`, which is MD3's own menu-item role — the same one an
 * [MPMenu](./menu)'s rows take. The word on the bar and the rows behind it are
 * one object, and setting the strip in a control's `title-medium` would make the
 * bar read as a row of buttons that happen to open lists.
 */
const TRIGGER_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-large',
  md: 'text-mp-label-large',
  lg: 'text-mp-title-medium',
  xl: 'text-mp-title-medium'
};

/**
 * One menu on the bar: the word, and the rows behind it.
 *
 * It has no `size` and no `color` of its own — both belong to the bar, which is
 * the only place they can be set once and hold for every menu on it. The rows
 * inside are the same [MPMenuItem](./menu), `MPMenuSeparator`, `MPMenuGroup` and
 * `MPMenuSubmenu` an [MPMenu](./menu) takes, because it *is* the same menu.
 */
export function MPMenubarMenu({
  label,
  startIcon,
  disabled = false,
  children,
  className,
  style
}: MPMenubarMenuProps) {
  const { size, color } = React.useContext(MPMenuContext);

  return (
    <MPMenu
      size={size}
      color={color}
      disabled={disabled}
      // The whole reason a menu bar is not a row of separate menus: once one of
      // them is open, crossing the strip walks through the others rather than
      // closing the one you left.
      openOnHover
      sideOffset={4}
      trigger={
        <button
          type="button"
          disabled={disabled}
          className={[
            'mp-menubar__menu group text-mp-on-surface relative inline-flex shrink-0',
            'rounded-mp-xs cursor-pointer items-center justify-center bg-transparent',
            'appearance-none font-[inherit] whitespace-nowrap select-none',
            'transition-colors duration-(--mp-sys-motion-duration-short4)',
            // The one thing a menu bar has to make legible from across the
            // strip: which of the words is open. It is still colour and nothing
            // else — the word does not move and the strip does not change height.
            'data-popup-open:text-(--_mp-accent)',
            'disabled:text-mp-on-surface/38 disabled:cursor-default',
            // Drawn *inside* the word rather than around it, which is the one
            // place this library insets a focus ring: a strip of words has no
            // gaps to draw a ring in, so an outside ring would be painted under
            // the word beside it.
            'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
            'focus-visible:outline-solid outline-none',
            TRIGGER_HEIGHT[size],
            TRIGGER_PAD_X[size],
            TRIGGER_TEXT[size],
            CONTROL_GAP[size],
            className ?? ''
          ]
            .filter(Boolean)
            .join(' ')}
          style={style}
        >
          {disabled ? null : <MPStateLayer className="group-data-popup-open:opacity-8" />}
          {hasContent(startIcon) ? <span className="relative flex">{startIcon}</span> : null}
          <span className="relative">{label}</span>
        </button>
      }
    >
      {children}
    </MPMenu>
  );
}

/**
 * The strip of words at the top of an application — File, Edit, View — each of
 * which opens a menu.
 *
 * ## What makes it a bar rather than a row of menus
 *
 * What happens once one of them is **open**: moving along the strip walks
 * through the others instead of closing the one you left, and the arrow keys
 * move between the menus as well as inside them. Base UI owns all of that, along
 * with the `menubar` role — which is what tells a screen reader that the strip
 * is one widget with one tab stop rather than six unrelated buttons.
 *
 * ## Why it draws no surface
 *
 * A menu bar sits **on** something: an [MPHeader](../layout/header), a title
 * bar, a toolbar. A sheet under a strip that is already on a sheet is two
 * sheets, and the second one has nothing to say. It is the same refusal
 * [MPContainer](../layout/container#why-it-draws-no-surface) makes, one level
 * down.
 *
 * ## When this is the wrong component
 *
 * When there are more actions than a strip can hold. A menu bar's whole
 * advantage is that every heading is visible before you go looking for one, and
 * a bar of twelve words has already lost it — that is an
 * [MPCommandPalette](./command-palette).
 */
export const MPMenubar = React.forwardRef<HTMLDivElement, MPMenubarProps>(function MPMenubar(
  {
    orientation = 'horizontal',
    modal = true,
    loopFocus = true,
    disabled = false,
    size = 'md',
    color = 'primary',
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const context = React.useMemo(() => ({ size, color }), [size, color]);

  return (
    <MPMenuContext.Provider value={context}>
      <Menubar
        ref={ref}
        orientation={orientation}
        modal={modal}
        loopFocus={loopFocus}
        disabled={disabled}
        data-mp-size={size}
        data-mp-orientation={orientation}
        className={[
          'mp-menubar flex items-center',
          orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row',
          CONTROL_GAP[size],
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...accentSlots(color), ...style }}
        {...props}
      >
        {children}
      </Menubar>
    </MPMenuContext.Provider>
  );
});
