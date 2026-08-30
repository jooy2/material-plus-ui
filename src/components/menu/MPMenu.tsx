import * as React from 'react';
import { Menu } from '@base-ui/react/menu';
import { ContextMenu } from '@base-ui/react/context-menu';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, ChevronRightIcon } from '../../constants/icons';
import { MPMenuContext } from '../../internal/menu';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_ICON, META_TEXT, hasContent } from '../../internal/scale';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import type { MPAlign, MPColor, MPSide, MPSize } from '../../types';

/**
 * A menu takes `size` and `color` and stops there.
 *
 * There is no `variant`, for the reason `MPDialog` has none: the five weights
 * answer "how much of a surface does this paint", and a popup that has taken the
 * pointer has already answered it. There is no `elevation` either — MD3 puts a
 * menu at level 2 and nowhere else, and a menu that could be told to sit flat
 * would be a list.
 */
interface MPMenuSurfaceProps {
  /**
   * The row height and type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family a ticked or chosen row reads. The popup itself stays
   * neutral, as MD3's does.
   * @default 'primary'
   */
  color?: MPColor;
  className?: string;
  style?: React.CSSProperties;
}

export interface MPMenuProps extends MPMenuSurfaceProps {
  /**
   * The element that opens the menu, wired up by Base UI. Optional — a controlled
   * menu opened from elsewhere needs no trigger of its own.
   */
  trigger?: React.ReactElement;
  /** Whether the menu is open. Use with `onOpenChange` for a controlled menu. */
  open?: boolean;
  /** Whether it starts open, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which edge of the trigger it hangs off. @default 'bottom' */
  side?: MPSide;
  /** Where it sits along that edge. @default 'start' */
  align?: MPAlign;
  /** Distance from the trigger, in pixels. @default 4 */
  sideOffset?: number;
  /** Whether the page behind is taken away while the menu is open. @default true */
  modal?: boolean;
  /**
   * Opens on hover as well as on click. For a menu bar, where crossing the row
   * with one menu open should walk through the others rather than close them.
   * @default false
   */
  openOnHover?: boolean;
  /** Whether the arrow keys wrap from the last row back to the first. @default true */
  loopFocus?: boolean;
  /** Unavailable. The trigger stops opening anything. */
  disabled?: boolean;
  /** The rows. */
  children?: React.ReactNode;
}

export interface MPContextMenuProps extends MPMenuSurfaceProps {
  /** The rows, exactly as they are written inside an `MPMenu`. */
  content: React.ReactNode;
  /**
   * The area that answers a right-click or a long press. Rendered inside a
   * `<div>` of Base UI's, which is what listens for the gesture.
   */
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default true */
  loopFocus?: boolean;
  disabled?: boolean;
}

export interface MPMenuItemProps {
  /** What the row does. Not given, and not a link, the row is a label. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Renders the row as a real `<a>`. A menu of links has to be links. */
  href?: string;
  /** Where the link opens — `_blank` and the rest. Ignored without `href`. */
  target?: string;
  /**
   * The link's relationship to the page. Ignored without `href`.
   *
   * Left unset, a `target="_blank"` row gets `noopener noreferrer` — the pair
   * that stops the opened page reaching back through `window.opener`. Setting
   * it replaces that rather than adding to it, so a row that needs `nofollow`
   * should say `rel="noopener noreferrer nofollow"`.
   */
  rel?: string;
  /** Content before the label — an icon, a swatch, an avatar. */
  startIcon?: React.ReactNode;
  /** Content after the label, before any `shortcut`. */
  endIcon?: React.ReactNode;
  /**
   * The keystroke that does the same thing, set at the end of the row and muted.
   * Text only — the row does not bind it, the application does.
   */
  shortcut?: React.ReactNode;
  /** A second line under the label, one step down the type scale and muted. */
  description?: React.ReactNode;
  /**
   * Re-points the row's family — `error` for the one that deletes. Defaults to
   * the menu's own.
   */
  color?: MPColor;
  /** Whether picking the row closes the menu. @default true */
  closeOnClick?: boolean;
  /** Unavailable. Still listed, and still found by typeahead. */
  disabled?: boolean;
  /** What typeahead matches against, when the label is not a plain string. */
  label?: string;
  /** The label. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface MPMenuSubmenuProps {
  /** The label on the row that opens it. */
  label?: React.ReactNode;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  /** Which edge of the parent row it opens against. @default 'right' */
  side?: MPSide;
  /** Distance from the parent menu, in pixels. @default 0 */
  sideOffset?: number;
  /** The nested rows. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface MPMenuGroupProps {
  /** The heading over the group. Wired to it by Base UI. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export interface MPMenuCheckboxItemProps extends Omit<
  MPMenuItemProps,
  'href' | 'target' | 'startIcon' | 'onClick'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Whether ticking the row closes the menu. `false` here rather than the `true`
   * a plain row takes: a list of things to tick is a list you tick more than one
   * of.
   * @default false
   */
  closeOnClick?: boolean;
}

export interface MPMenuRadioGroupProps {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string | number) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface MPMenuRadioItemProps extends Omit<
  MPMenuItemProps,
  'href' | 'target' | 'startIcon' | 'onClick'
> {
  /** What this row sets the group to. */
  value: string | number;
  /** @default false */
  closeOnClick?: boolean;
}

export type MPMenuSeparatorProps = React.ComponentPropsWithoutRef<'div'>;

/* ---------------------------------------------------------------------------
 * The surface
 * ------------------------------------------------------------------------- */

/**
 * The popup: `surface-container` at elevation 2 and `corner-extra-small`, which
 * is MD3's own three choices — and deliberately the same three `MPSelect`'s list
 * takes. A select *is* a menu that remembers what you picked, and two floating
 * lists of rows that do not match are two lists the eye has to learn separately.
 */
const POPUP = [
  'mp-menu__popup rounded-mp-xs shadow-mp-2 bg-mp-surface-container text-mp-on-surface',
  'max-h-[min(24rem,var(--available-height))] min-w-[112px] max-w-[280px]',
  'overflow-y-auto overscroll-contain py-2 outline-none',
  FADE
].join(' ');

/**
 * A row's height, and MD3's own 48dp at `md`.
 *
 * `min-h-*` rather than `h-*`, because a row with a `description` under its label
 * is two lines tall and a fixed height would clip the second one.
 */
const ROW_HEIGHT: Record<MPSize, string> = {
  xs: 'min-h-8',
  sm: 'min-h-10',
  md: 'min-h-12',
  lg: 'min-h-14',
  xl: 'min-h-16'
};

/** MD3 insets a menu row by 12dp. Its own ladder, not the control one: a row is
    as wide as the popup, so a button's 24dp at `md` would put a five-item menu at
    the width of a dialog. */
const ROW_PAD_X: Record<MPSize, string> = {
  xs: 'px-2',
  sm: 'px-2.5',
  md: 'px-3',
  lg: 'px-4',
  xl: 'px-5'
};

const ROW_GAP: Record<MPSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2.5',
  md: 'gap-3',
  lg: 'gap-3',
  xl: 'gap-4'
};

/**
 * `label-large` at `md`, which is MD3's own menu-item role — and one step either
 * side of it at the ends of the ladder.
 */
const ROW_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-large',
  md: 'text-mp-label-large',
  lg: 'text-mp-title-medium',
  xl: 'text-mp-title-medium'
};

/**
 * The row, in every one of its shapes — plain, link, submenu trigger, checkbox,
 * radio. They differ in which Base UI part renders them and in nothing else.
 *
 * Rows are full-bleed rather than inset tiles: MD3 gives a menu item no corner of
 * its own, so the state layer runs to both edges of the popup and the popup's own
 * 4px corner is the only curve in the object.
 *
 * `accented` is a parameter rather than a class the caller appends, and that is
 * not a style preference. Appending `text-(--_mp-accent)` next to the default
 * `text-mp-on-surface` puts two utilities of equal specificity on one element,
 * and which of them wins is decided by their order in the generated stylesheet
 * rather than by the order they were written in — so `color="error"` on a row
 * would silently do nothing. Branching here is what makes only one of the two
 * exist.
 */
function rowClasses(size: MPSize, accented: boolean, className?: string): string {
  return [
    'group relative flex w-full cursor-pointer items-center select-none',
    accented ? 'text-(--_mp-accent)' : 'text-mp-on-surface',
    ROW_HEIGHT[size],
    ROW_PAD_X[size],
    ROW_GAP[size],
    ROW_TEXT[size],
    'data-disabled:text-mp-on-surface/38 data-disabled:cursor-default',
    // Base UI moves focus onto the highlighted row itself, so a focus ring here
    // would draw a rectangle inside the popup on every arrow press. The state
    // layer is the indicator, which is what makes it the same one the mouse gets.
    'outline-none',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The wash under a highlighted row.
 *
 * `data-highlighted` rather than `:hover`, exactly as on a select option: it is
 * also what the arrow keys move, so the mouse and the keyboard light the same
 * row instead of the keyboard lighting nothing. `data-popup-open` is the submenu
 * trigger whose child menu is showing.
 */
function RowLayer() {
  return (
    <MPStateLayer
      layer="inset-0 bg-current"
      className="group-data-highlighted:opacity-8 group-data-popup-open:opacity-8 group-data-disabled:opacity-0"
    />
  );
}

/** The fixed-width column a tick, a dot or a `startIcon` lands in. */
const SLOT = 'relative flex shrink-0 items-center justify-center';

/**
 * The label, and the description under it when there is one.
 *
 * `min-w-0` so a long label truncates rather than pushing the shortcut off the
 * end of a popup that has already been positioned.
 */
function RowBody({
  children,
  description
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
}) {
  if (!hasContent(description)) {
    return <span className="relative min-w-0 flex-1 truncate text-start">{children}</span>;
  }

  return (
    <span className="relative flex min-w-0 flex-1 flex-col py-1.5 text-start">
      <span className="truncate">{children}</span>
      <span className={`text-mp-on-surface-variant truncate ${META_TEXT}`}>{description}</span>
    </span>
  );
}

/** The trailing text: MD3's own trailing supporting text, in `on-surface-variant`. */
function RowMeta({ shortcut }: { shortcut: React.ReactNode }) {
  if (!hasContent(shortcut)) {
    return null;
  }

  return (
    <span className={`text-mp-on-surface-variant relative ms-2 shrink-0 ${META_TEXT}`}>
      {shortcut}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * The parts
 * ------------------------------------------------------------------------- */

/**
 * One row of a menu.
 *
 * Renders a real `<a>` when it is given an `href` and Base UI's own item
 * otherwise. A menu of links that are not links cannot be opened in a new tab,
 * cannot be copied, and tells a screen reader the wrong thing about every one of
 * them.
 */
export function MPMenuItem({
  onClick,
  href,
  target,
  rel,
  startIcon,
  endIcon,
  shortcut,
  description,
  color,
  closeOnClick = true,
  disabled = false,
  label,
  children,
  className,
  style
}: MPMenuItemProps) {
  const { size } = React.useContext(MPMenuContext);

  const body = (
    <React.Fragment>
      <RowLayer />
      {hasContent(startIcon) ? (
        <span className={`${SLOT} text-mp-on-surface-variant`}>{startIcon}</span>
      ) : null}
      <RowBody description={description}>{children}</RowBody>
      {hasContent(endIcon) ? (
        <span className={`${SLOT} text-mp-on-surface-variant`}>{endIcon}</span>
      ) : null}
      <RowMeta shortcut={shortcut} />
    </React.Fragment>
  );

  // A row can name its own family — `color="error"` on the one that deletes — and
  // the slots are re-declared on the row so its ink and anything it draws turn
  // over together rather than one of them staying the menu's colour.
  const slots = color ? { '--_mp-accent': `var(--_mp-color-${color})` } : undefined;
  const rowStyle = slots || style ? ({ ...slots, ...style } as React.CSSProperties) : undefined;

  /*
   * A disabled row is never a link, whatever `href` says.
   *
   * Base UI's `LinkItem` has no `disabled` of its own — it renders an `<a>`,
   * and `disabled` is not something an `<a>` can be — so a row that kept its
   * `href` while unavailable would be a row a keyboard still lands on and a
   * crawler still follows. It falls back to the plain item instead, which is
   * the same call `MPBottomNavigationItem` and `MPPagination` make: a link
   * with nowhere to go is not a link.
   */
  if (href !== undefined && !disabled) {
    return (
      <Menu.LinkItem
        href={href}
        target={target}
        // `target="_blank"` hands the opened page a `window.opener` back into
        // this one unless it is told not to. Modern browsers imply `noopener`,
        // but `noreferrer` is never implied and older ones imply neither — and
        // the same pair is written out on `MPTextLink` and `MPChatBubble`.
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        label={label}
        closeOnClick={closeOnClick}
        onClick={onClick}
        className={rowClasses(size, Boolean(color), className)}
        style={rowStyle}
      >
        {body}
      </Menu.LinkItem>
    );
  }

  return (
    <Menu.Item
      disabled={disabled}
      label={label}
      closeOnClick={closeOnClick}
      onClick={onClick}
      className={rowClasses(size, Boolean(color), className)}
      style={rowStyle}
    >
      {body}
    </Menu.Item>
  );
}

/** A row that ticks. The tick lands in the column a `startIcon` would. */
export function MPMenuCheckboxItem({
  checked,
  defaultChecked,
  onCheckedChange,
  endIcon,
  shortcut,
  description,
  color,
  closeOnClick = false,
  disabled = false,
  label,
  children,
  className,
  style
}: MPMenuCheckboxItemProps) {
  const { size } = React.useContext(MPMenuContext);
  const slots = color ? { '--_mp-accent': `var(--_mp-color-${color})` } : undefined;

  return (
    <Menu.CheckboxItem
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => onCheckedChange?.(next)}
      disabled={disabled}
      label={label}
      closeOnClick={closeOnClick}
      className={rowClasses(size, Boolean(color), className)}
      style={slots || style ? ({ ...slots, ...style } as React.CSSProperties) : undefined}
    >
      <RowLayer />
      {/* The column is always there and only the tick comes and goes: an
          indicator that is not rendered at all takes its column with it, and
          every label in the menu shifts sideways as rows are ticked. */}
      <span className={`${SLOT} text-(--_mp-accent)`} style={{ width: CONTROL_ICON[size] }}>
        <Menu.CheckboxItemIndicator className="flex items-center justify-center">
          <MPIcon icon={CheckIcon} size={CONTROL_ICON[size]} />
        </Menu.CheckboxItemIndicator>
      </span>
      <RowBody description={description}>{children}</RowBody>
      {hasContent(endIcon) ? (
        <span className={`${SLOT} text-mp-on-surface-variant`}>{endIcon}</span>
      ) : null}
      <RowMeta shortcut={shortcut} />
    </Menu.CheckboxItem>
  );
}

/** One choice out of a set. Wraps the rows that make up the set. */
export function MPMenuRadioGroup({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  className
}: MPMenuRadioGroupProps) {
  return (
    <Menu.RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as string | number)}
      disabled={disabled}
      className={className}
    >
      {children}
    </Menu.RadioGroup>
  );
}

/**
 * A row inside an `MPMenuRadioGroup`.
 *
 * Marked with a filled dot rather than a tick, which is the same distinction
 * `MPCheckbox` and `MPRadio` make everywhere else: a tick says "and", a dot says
 * "instead of".
 */
export function MPMenuRadioItem({
  value,
  endIcon,
  shortcut,
  description,
  color,
  closeOnClick = false,
  disabled = false,
  label,
  children,
  className,
  style
}: MPMenuRadioItemProps) {
  const { size } = React.useContext(MPMenuContext);
  const slots = color ? { '--_mp-accent': `var(--_mp-color-${color})` } : undefined;

  return (
    <Menu.RadioItem
      value={value}
      disabled={disabled}
      label={label}
      closeOnClick={closeOnClick}
      className={rowClasses(size, Boolean(color), className)}
      style={slots || style ? ({ ...slots, ...style } as React.CSSProperties) : undefined}
    >
      <RowLayer />
      <span className={`${SLOT} text-(--_mp-accent)`} style={{ width: CONTROL_ICON[size] }}>
        <Menu.RadioItemIndicator className="flex items-center justify-center">
          <span className="block size-2.5 rounded-full bg-current" />
        </Menu.RadioItemIndicator>
      </span>
      <RowBody description={description}>{children}</RowBody>
      {hasContent(endIcon) ? (
        <span className={`${SLOT} text-mp-on-surface-variant`}>{endIcon}</span>
      ) : null}
      <RowMeta shortcut={shortcut} />
    </Menu.RadioItem>
  );
}

/** A named run of rows. The label is a heading, not a row — it cannot be picked. */
export function MPMenuGroup({ label, children, className }: MPMenuGroupProps) {
  const { size } = React.useContext(MPMenuContext);

  return (
    <Menu.Group className={className}>
      {hasContent(label) ? (
        <Menu.GroupLabel
          className={`text-mp-on-surface-variant pt-2 pb-1 ${ROW_PAD_X[size]} ${META_TEXT}`}
        >
          {label}
        </Menu.GroupLabel>
      ) : null}
      {children}
    </Menu.Group>
  );
}

/** The hairline between two runs of rows. `outline-variant`, as MD3 draws it. */
export function MPMenuSeparator({ className, ...props }: MPMenuSeparatorProps) {
  return (
    <Menu.Separator
      className={['bg-mp-outline-variant my-2 h-px', className ?? ''].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

/**
 * A menu inside a menu.
 *
 * The row that opens it is the same row every other item is, wearing a chevron —
 * and it opens on hover, on Enter and on the arrow key that points at it, all of
 * which is Base UI's. What is here is the surface and the glyph.
 *
 * Nesting is unlimited: a submenu renders its children inside a popup that is
 * itself a menu, so a submenu of a submenu needs no different component.
 */
export function MPMenuSubmenu({
  label,
  startIcon,
  disabled = false,
  side = 'right',
  sideOffset = 0,
  children,
  className,
  style
}: MPMenuSubmenuProps) {
  const { size, color } = React.useContext(MPMenuContext);

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger disabled={disabled} className={rowClasses(size, false)}>
        <RowLayer />
        {hasContent(startIcon) ? (
          <span className={`${SLOT} text-mp-on-surface-variant`}>{startIcon}</span>
        ) : null}
        <span className="relative min-w-0 flex-1 truncate text-start">{label}</span>
        {/* Pointing at the reading end rather than at the right, so the glyph
            turns round with the popup under RTL. */}
        <span className={`${SLOT} text-mp-on-surface-variant rtl:rotate-180`}>
          <MPIcon icon={ChevronRightIcon} size={CONTROL_ICON[size]} />
        </span>
      </Menu.SubmenuTrigger>

      <Menu.Portal>
        <Menu.Positioner className={PORTAL_LAYER} side={side} sideOffset={sideOffset} align="start">
          {/* The slots are declared on the popup and not on the menu above it,
              exactly as `MPSelect` declares its own: a portalled popup renders
              at the end of `<body>`, so nothing set further up the tree reaches
              it and every `var()` in here would resolve to nothing. */}
          <Menu.Popup
            className={[POPUP, className ?? ''].filter(Boolean).join(' ')}
            style={{ ...accentSlots(color), ...style }}
          >
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}

/**
 * A list of actions that appears when something is pressed.
 *
 * Everything that makes a menu a menu rather than a floating list of divs is Base
 * UI's: roving focus with the arrow keys, Home and End, typeahead, Escape,
 * closing on an outside click, restoring focus to the trigger, submenus opening
 * on hover with the safe triangle so a diagonal reach does not close them, and
 * the `menu` / `menuitem` roles that make any of it mean something to a screen
 * reader. What is here is the surface, the ladders and the row layout.
 *
 * ## Why the rows are composed and a select's options are data
 *
 * The opposite of `MPSelect`, and deliberately. A select's options are values out
 * of a list a caller already has, and its trigger has to be able to name the
 * chosen one before the popup has ever been mounted. A menu's rows are *code* —
 * each one a different handler, a different icon, sometimes a submenu — and
 * nothing has to know about them until the menu opens. Data would mean an `items`
 * type with a variant for every shape a row can take, which is a component tree
 * spelled as a discriminated union.
 */
export function MPMenu({
  size = 'md',
  color = 'primary',
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  /*
   * Passed through rather than defaulted here, and Base UI's own default is the
   * same `true`. The difference shows up inside an `MPMenubar`: a menu on a bar
   * is a *nested* menu, where the prop has no meaning — and Base UI warns about
   * a `modal` it was handed and cannot honour, on every menu of every bar.
   */
  modal,
  openOnHover = false,
  loopFocus = true,
  disabled = false,
  className,
  style,
  children
}: MPMenuProps) {
  const context = React.useMemo(() => ({ size, color }), [size, color]);

  return (
    <MPMenuContext.Provider value={context}>
      <Menu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        modal={modal}
        loopFocus={loopFocus}
        disabled={disabled}
      >
        {trigger ? (
          <Menu.Trigger render={trigger} openOnHover={openOnHover} disabled={disabled} />
        ) : null}

        <Menu.Portal>
          <Menu.Positioner
            className={PORTAL_LAYER}
            side={side}
            align={align}
            sideOffset={sideOffset}
          >
            <Menu.Popup
              data-mp-size={size}
              className={[POPUP, className ?? ''].filter(Boolean).join(' ')}
              style={{ ...accentSlots(color), ...style }}
            >
              {children}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </MPMenuContext.Provider>
  );
}

/**
 * The same menu, opened by a right-click or a long press instead of by a button.
 *
 * It takes the rows as `content` and the area as `children`, which is
 * `MPTooltip`'s shape rather than `MPMenu`'s — because here the trigger is not
 * one element handed over, it is a region of the page, and the region is the
 * thing being wrapped. Base UI positions the popup at the pointer rather than
 * against an anchor, and the long press is what makes it reachable on a touch
 * screen at all.
 */
export function MPContextMenu({
  size = 'md',
  color = 'primary',
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  loopFocus = true,
  disabled = false,
  className,
  style
}: MPContextMenuProps) {
  const context = React.useMemo(() => ({ size, color }), [size, color]);

  return (
    <MPMenuContext.Provider value={context}>
      <ContextMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        loopFocus={loopFocus}
        disabled={disabled}
      >
        <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Positioner className={PORTAL_LAYER}>
            <ContextMenu.Popup
              data-mp-size={size}
              className={[POPUP, className ?? ''].filter(Boolean).join(' ')}
              style={{ ...accentSlots(color), ...style }}
            >
              {content}
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </MPMenuContext.Provider>
  );
}
