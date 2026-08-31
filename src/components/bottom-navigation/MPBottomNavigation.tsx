import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { linkRel } from '../../internal/link';
import { MPStateLayer } from '../../internal/StateLayer';
import { hasContent } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPPosition, MPSize } from '../../types';

/** A destination's value. The same restraint `MPTabs` puts on a tab's. */
export type MPBottomNavigationValue = string | number;

/**
 * Which names are drawn.
 *
 * MD3's three label behaviours, and the order they lose information in:
 *
 * - `all` — every destination is named. The default, and the only one that works
 *   for a reader who has not used the application before.
 * - `selected` — only the destination the reader is on. The bar keeps its height
 *   either way.
 * - `none` — glyphs only.
 *
 * Undrawn is never unsaid: in both of the last two the names stay in the
 * document for a screen reader, because a glyph on its own has no accessible
 * name at all.
 */
export type MPBottomNavigationLabels = 'all' | 'selected' | 'none';

/** What an `MPBottomNavigationItem` inherits from the bar around it. */
interface MPBottomNavigationContextValue {
  value: MPBottomNavigationValue | null;
  change: (value: MPBottomNavigationValue) => void;
  size: MPSize;
  labels: MPBottomNavigationLabels;
  disabled: boolean;
}

const MPBottomNavigationContext = React.createContext<MPBottomNavigationContextValue>({
  value: null,
  change: () => {},
  size: 'md',
  labels: 'all',
  disabled: false
});

/**
 * The bar's height.
 *
 * `md` is MD3's own 80dp — tall enough for a glyph in its indicator with a word
 * under it, and short enough not to compete with the screen it is at the bottom
 * of. The rest of the ladder keeps that proportion.
 */
const BAR_HEIGHT: Record<MPSize, string> = {
  xs: 'h-14',
  sm: 'h-16',
  md: 'h-20',
  lg: 'h-22',
  xl: 'h-24'
};

/**
 * The active indicator: MD3's 64×32dp pill behind the glyph of the destination
 * the reader is on.
 *
 * It is the whole of the selected treatment, and it is why a navigation bar
 * needs no underline, no bold and no second colour to say where you are.
 *
 * Three lengths rather than one, because the pill both *is* a size and
 * *travels* between two of them.
 *
 * `box` is the slot the glyph sits in. It never changes: it is what holds the
 * destination in place, so a row of five would shuffle every time the reader
 * moved between them if it did.
 *
 * `open` and `shut` are the fill's own width, on a layer inside that slot. MD3
 * expands the indicator horizontally, so the pill grows out of `shut` — a
 * circle exactly as wide as the slot is tall — into `open`, which is the slot's
 * full width.
 *
 * `width` rather than `scale-x`, because the pill is `corner-full` and a scaled
 * corner is not a corner: a circle stretched horizontally is an ellipse. A
 * circle that *widens*, at a radius clamped to half its height, is the pill the
 * specification draws at every frame in between.
 */
const INDICATOR: Record<MPSize, { box: string; open: string; shut: string }> = {
  xs: { box: 'h-6 w-12', open: 'w-12', shut: 'w-6' },
  sm: { box: 'h-7 w-14', open: 'w-14', shut: 'w-7' },
  md: { box: 'h-8 w-16', open: 'w-16', shut: 'w-8' },
  lg: { box: 'h-9 w-18', open: 'w-18', shut: 'w-9' },
  xl: { box: 'h-10 w-20', open: 'w-20', shut: 'w-10' }
};

/** The glyph, in CSS pixels. MD3's is 24dp. */
const ITEM_ICON: Record<MPSize, number> = {
  xs: 20,
  sm: 22,
  md: 24,
  lg: 26,
  xl: 28
};

/**
 * A destination's name.
 *
 * `label-medium` at `md`, which is MD3's own — 12px at weight 500. A destination
 * is named rather than described, and the label scale is the one Material sets
 * names in.
 */
const ITEM_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-small',
  sm: 'text-mp-label-small',
  md: 'text-mp-label-medium',
  lg: 'text-mp-label-medium',
  xl: 'text-mp-label-large'
};

/** Between the indicator and the name under it. */
const ITEM_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5'
};

const POSITION: Record<MPPosition, string> = {
  static: '',
  absolute: 'absolute inset-x-0 bottom-0 z-30',
  sticky: 'sticky bottom-0 z-30',
  fixed: 'fixed inset-x-0 bottom-0 z-40'
};

export interface MPBottomNavigationProps extends Omit<
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
   * How the bar sits in the page's scroll. `fixed` — the default, against the
   * `static` everything else in this library defaults to — is what a bottom
   * navigation bar is: held against the bottom edge of the window whatever the
   * page under it does.
   * @default 'fixed'
   */
  position?: MPPosition;
  /**
   * Which names are drawn.
   * @default 'all'
   */
  labels?: MPBottomNavigationLabels;
  /**
   * The bar's height and type scale. `md` is MD3's own 80dp.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * A hairline along the top edge.
   *
   * Off by default, because MD3 separates the bar from the page by *tone* — the
   * container is `surface-container` against the page's `surface` — rather than
   * by a rule. Turn it on when the page behind it is the same tone, which is
   * where the tonal difference stops being visible.
   * @default false
   */
  divider?: boolean;
  /**
   * Keeps the destinations clear of a phone's home indicator by adding
   * `env(safe-area-inset-bottom)` under them. The container still reaches the
   * bottom of the screen — only the row moves up, so the surface runs under the
   * indicator rather than stopping in a stripe above it.
   * @default true
   */
  safeArea?: boolean;
  /** Every destination stops answering. */
  disabled?: boolean;
  /**
   * The name the bar is announced by — "Main", "Sections". A landmark with no
   * name is a landmark a screen reader lists as "navigation".
   */
  label?: string;
  /**
   * Renders something other than a `<nav>`. Base UI's own escape hatch, and
   * rarely what you want here: a row of destinations is navigation.
   */
  render?: useRender.RenderProp;
  /** The `MPBottomNavigationItem`s — three to five of them. */
  children?: React.ReactNode;
}

export interface MPBottomNavigationItemProps extends Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'value'
> {
  /** Identifies the destination. What `onValueChange` reports. */
  value: MPBottomNavigationValue;
  /** The glyph, drawn inside the active indicator. */
  icon?: React.ReactNode;
  /**
   * A second glyph for while this is the destination the reader is on — MD3
   * fills the selected icon and outlines the rest, which is a signal that
   * survives being seen out of the corner of an eye. Falls back to `icon`.
   */
  activeIcon?: React.ReactNode;
  /**
   * Renders the destination as a real link.
   *
   * Worth reaching for: a long press then offers "open in a new tab", the
   * address shows in the status bar, and a crawler can follow it — none of which
   * a `<button>` that calls `router.push` can do. `onValueChange` still fires.
   */
  href?: string;
  /** Where that link opens. `rel` follows on its own for `_blank` — see `rel`. */
  target?: string;
  /**
   * Overrides the `rel` a `_blank` destination would otherwise get, which is
   * `noopener noreferrer`. Writing one **replaces** it rather than adding to it.
   */
  rel?: string;
  /**
   * Renders the destination as something else — a router's `Link`, so tapping it
   * is a client-side navigation rather than a full page load. `href`, `target`
   * and everything the bar decides still go through, so `render={<NextLink />}`
   * needs the URL written once, here.
   *
   * With no `href` this replaces the `<button>` instead, which is the same
   * element in the same place — the bar's own `onValueChange` fires either way.
   */
  render?: useRender.RenderProp;
  /** Unavailable, but still part of the set. */
  disabled?: boolean;
  /** The destination's name. Read out even when `labels` keeps it undrawn. */
  children?: React.ReactNode;
}

/**
 * A row of destinations held against the bottom edge of the window.
 *
 * **MD3 calls this the navigation bar**; the name here is the one the pattern is
 * still known by, and the two are the same component. What is drawn is the
 * specification's: a `surface-container` bar 80dp tall, with the destination the
 * reader is on marked by a 64×32dp `secondary-container` pill behind its glyph.
 *
 * ## Why it is a `<nav>` and not a tab list
 *
 * It is a deliberate choice about what is being promised. A tab list owes a
 * keyboard reader one tab stop for the whole set and arrow keys within it, and
 * owes a screen reader a panel per tab; a navigation bar switches what the
 * *page* is, not which panel of one is showing. Claiming the role without the
 * behaviour is worse for a keyboard reader than never claiming it.
 *
 * What is claimed instead is `aria-current="page"`, which is the honest
 * statement: this is the destination you are on. Every item is an ordinary
 * button or link, in the tab order, doing what buttons and links do.
 *
 * For dividing one screen into panels, that genuinely is [MPTabs](./tabs).
 *
 * ## Why it takes no `color`
 *
 * The active indicator is `secondary-container` because MD3 says it is, and for
 * the reason [MPSegmentedButton](../inputs/segmented-button) gives: a mark
 * saying *where you are* is not an accent statement. `primary` is what a screen
 * reserves for the action it is about, and a navigation bar does nothing.
 */
export const MPBottomNavigation = React.forwardRef<HTMLElement, MPBottomNavigationProps>(
  function MPBottomNavigation(
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      position = 'fixed',
      labels = 'all',
      size = 'md',
      divider = false,
      safeArea = true,
      disabled = false,
      label,
      render,
      className,
      children,
      ...props
    },
    ref
  ) {
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
      () => ({ value: value ?? null, change, size, labels, disabled }),
      [value, change, size, labels, disabled]
    );

    return useRender({
      render: render ?? <nav />,
      ref,
      props: {
        'aria-label': label,
        'data-mp-size': size,
        className: [
          'mp-bottom-navigation bg-mp-surface-container text-mp-on-surface box-border w-full',
          divider ? 'border-mp-outline-variant border-t' : '',
          POSITION[position],
          // The container keeps reaching the bottom of the screen; what the
          // inset moves is the row inside it. A bar that stopped above the home
          // indicator would leave a stripe of page showing under it.
          safeArea ? 'pb-[env(safe-area-inset-bottom)]' : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' '),
        children: (
          <MPBottomNavigationContext.Provider value={context}>
            <div className={`flex w-full items-stretch ${BAR_HEIGHT[size]}`}>{children}</div>
          </MPBottomNavigationContext.Provider>
        ),
        ...props
      }
    });
  }
);

/**
 * One destination.
 *
 * It has no `size` and no colour of its own: both belong to the bar, which is
 * the only place they can be set once and mean the same thing for every item. A
 * bar whose third destination is a rung out is not a bar.
 *
 * With an `href` it is a real `<a>`; without one it is a `<button>`, because a
 * `<div>` carrying a click handler is invisible to a keyboard.
 */
export const MPBottomNavigationItem = React.forwardRef<HTMLElement, MPBottomNavigationItemProps>(
  function MPBottomNavigationItem(
    {
      value,
      icon,
      activeIcon,
      href,
      target,
      rel,
      render,
      disabled: itemDisabled = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) {
    const bar = React.useContext(MPBottomNavigationContext);
    const disabled = itemDisabled || bar.disabled;
    const current = bar.value !== null && bar.value === value;
    const named = bar.labels === 'all' || (bar.labels === 'selected' && current);

    const classNames = [
      'mp-bottom-navigation__item group flex min-w-0 flex-1 flex-col items-center justify-center',
      'box-border appearance-none bg-transparent px-1 font-[inherit] no-underline select-none',
      ITEM_GAP[bar.size],
      'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
      'focus-visible:outline-solid outline-none',
      // An if/else rather than stacked variants: two Tailwind classes of equal
      // specificity resolve by their order in the generated stylesheet.
      disabled
        ? 'text-mp-on-surface/38 cursor-default'
        : current
          ? 'text-mp-on-surface cursor-pointer'
          : 'text-mp-on-surface-variant cursor-pointer',
      className ?? ''
    ]
      .filter(Boolean)
      .join(' ');

    const body = (
      <>
        {hasContent(icon) || hasContent(activeIcon) ? (
          <span
            className={[
              'relative flex shrink-0 items-center justify-center overflow-hidden',
              'rounded-mp-full',
              // The ink only. The pill itself is the layer below, which is what
              // lets it grow without this box — the one holding the glyph in
              // place — changing width and shuffling the row.
              'transition-[color] duration-(--mp-sys-motion-duration-short4)',
              INDICATOR[bar.size].box,
              current && !disabled ? 'text-mp-on-secondary-container' : ''
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* MD3's active indicator, and the whole of the selected treatment:
                it is why a navigation bar needs no underline, no bold and no
                second colour to say where you are.

                It arrives by widening out of a circle the size of the glyph
                slot, which is the motion the specification draws — a treatment
                that only faded would say *that* the destination changed without
                saying anything about the pill travelling to it.

                The opacity goes with the width rather than the fill being
                switched on at full size, so a destination the reader is leaving
                closes rather than blinking out. */}
            {disabled ? null : (
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2',
                  'rounded-mp-full bg-mp-secondary-container',
                  'transition-[width,opacity] duration-(--mp-sys-motion-duration-short4)',
                  'ease-mp-standard',
                  current
                    ? `${INDICATOR[bar.size].open} opacity-100`
                    : `${INDICATOR[bar.size].shut} opacity-0`
                ].join(' ')}
              />
            )}

            {disabled ? null : <MPStateLayer />}

            <span
              className="relative flex items-center justify-center"
              style={{ width: ITEM_ICON[bar.size], height: ITEM_ICON[bar.size] }}
            >
              {current ? (activeIcon ?? icon) : icon}
            </span>
          </span>
        ) : null}

        {hasContent(children) ? (
          // Undrawn is not unsaid. A glyph on its own has no accessible name at
          // all, so the name a hidden label would have carried stays in the
          // document rather than going with the pixels.
          <span className={named ? `max-w-full truncate ${ITEM_TEXT[bar.size]}` : VISUALLY_HIDDEN}>
            {children}
          </span>
        ) : null}
      </>
    );

    const press = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      bar.change(value);
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    };

    if (href) {
      return (
        <Destination
          render={render}
          props={{
            ref,
            // A link with nowhere to go is not a link. `disabled` is not
            // something an `<a>` can be, and one that only looks unavailable is
            // one a keyboard still lands on and a crawler still follows.
            href: disabled ? undefined : href,
            target,
            rel: linkRel(target, rel),
            'aria-current': current ? 'page' : undefined,
            'aria-disabled': disabled || undefined,
            className: classNames,
            onClick: press,
            children: body,
            ...props
          }}
        />
      );
    }

    return (
      <Destination
        render={render}
        props={{
          ref,
          // Only when the element is this component's own — `type` on whatever a
          // caller rendered is an attribute that element may have no use for.
          type: render ? undefined : 'button',
          disabled,
          // `aria-current="page"` rather than `aria-selected`: a navigation bar
          // moves between pages, and the destination you are on is a page. The
          // other spelling would promise a tab list.
          'aria-current': current ? 'page' : undefined,
          className: classNames,
          onClick: press,
          children: body,
          ...props
        }}
      />
    );
  }
);

/**
 * One destination's element, which is where `render` lands.
 *
 * A component rather than a `useRender` call in each branch, for the reason
 * `MPList`'s `RowControl` is one: `useRender` is a hook and the branches are an
 * early return.
 */
function Destination({
  render,
  props
}: {
  render: useRender.RenderProp | undefined;
  props: Record<string, unknown>;
}) {
  return useRender({
    render: render ?? (props.href ? <a /> : <button />),
    props
  });
}
