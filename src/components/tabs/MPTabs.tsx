import * as React from 'react';
import { Tabs } from '@base-ui/react/tabs';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_GAP, hasContent, SHEET_GAP } from '../../internal/scale';
import type { MPColor, MPSize, MPStyleProps } from '../../types';

/**
 * MD3's two kinds of tab.
 *
 * They are not two levels of emphasis, they are two *depths*: primary tabs are
 * the top level of a screen, and secondary tabs divide the content inside one of
 * them. The specification draws that difference three ways — the indicator is
 * 3dp and rounded against 2dp and square, it hugs the label rather than filling
 * the tab, and the chosen label takes the accent rather than the plain ink — and
 * all three are here.
 *
 * There is deliberately no third value. A `variant` ladder like the buttons' one
 * would be an emphasis axis, and a tab bar has nothing to be emphatic about: it
 * is the map of a screen, not an action on it.
 */
export type MPTabsVariant = 'primary' | 'secondary';

/** Where the glyph sits relative to the label. */
export type MPTabIconPosition = 'top' | 'start';

/**
 * A tab's value. The same restraint `MPSelect` puts on its own — an identifier,
 * not an arbitrary object, because it is also what picks out the panel.
 */
export type MPTabValue = string | number;

/** What an `MPTab` inherits from the `MPTabs` around it. */
interface MPTabsContextValue {
  variant: MPTabsVariant;
  size: MPSize;
  iconPosition: MPTabIconPosition;
  fullWidth: boolean;
}

const MPTabsContext = React.createContext<MPTabsContextValue>({
  variant: 'primary',
  size: 'md',
  iconPosition: 'top',
  fullWidth: false
});

/**
 * A tab's height, without a glyph above the label.
 *
 * `md` is MD3's own 48dp. The ladder around it is this library's, for the reason
 * `MPSize` gives — a tab bar in a dense toolbar and one at the top of a page are
 * not the same object, and a consumer who cannot get the second from the library
 * builds it out of `!important`.
 */
const TAB_HEIGHT: Record<MPSize, string> = {
  xs: 'h-8',
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
  xl: 'h-16'
};

/**
 * And with one above it, where MD3's own is 64dp.
 *
 * A separate table rather than a padding added to the one above: the two heights
 * are 48 and 64, which is not 48 plus the glyph — the specification gives the
 * stacked tab proportionally less air, because the glyph is already doing the
 * work the space would have done.
 */
const TAB_HEIGHT_STACKED: Record<MPSize, string> = {
  xs: 'h-11',
  sm: 'h-13',
  md: 'h-16',
  lg: 'h-18',
  xl: 'h-20'
};

/**
 * What a tab's label is set in.
 *
 * `title-small` at `md` — 14px at weight 500 — which is MD3's own tab label, and
 * not the `title-medium` a button of the same rung takes. A tab is a place
 * rather than an action, and the specification sets it one step quieter.
 */
const TAB_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-large',
  md: 'text-mp-title-small',
  lg: 'text-mp-title-small',
  xl: 'text-mp-title-medium'
};

/** MD3's tab is 16dp of inline padding at `md`; the ladder keeps the ratio. */
const TAB_PAD_X: Record<MPSize, string> = {
  xs: 'px-3',
  sm: 'px-3.5',
  md: 'px-4',
  lg: 'px-5',
  xl: 'px-6'
};

/**
 * The same numbers again, as lengths, because the indicator has to inset itself
 * by exactly the tab's own padding to end up under the label. Written as a
 * second table rather than parsed back out of the first: a class name is not a
 * number, and the two are read by different things.
 */
const TAB_INSET: Record<MPSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
};

/**
 * The glyph, in CSS pixels.
 *
 * 24 at `md`, which is MD3's tab icon and one step up from what a button of the
 * same rung draws. A stacked tab is mostly its glyph.
 */
const TAB_ICON: Record<MPSize, number> = {
  xs: 18,
  sm: 20,
  md: 24,
  lg: 24,
  xl: 28
};

export interface MPTabsProps
  extends
    MPStyleProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /**
   * Which of MD3's two kinds of tab bar this is: `primary` for the top level of
   * a screen, `secondary` for a division inside one of its panels.
   * @default 'primary'
   */
  variant?: MPTabsVariant;
  /**
   * Which accent family the chosen tab and the indicator read.
   * @default 'primary'
   */
  color?: MPColor;
  /** The chosen tab. Use with `onValueChange` for a controlled set. */
  value?: MPTabValue | null;
  /** Which starts chosen, for an uncontrolled set. */
  defaultValue?: MPTabValue | null;
  /** Called with the chosen tab's value. */
  onValueChange?: (value: MPTabValue | null) => void;
  /**
   * Where a tab's glyph sits. Defaults to what the variant does in the
   * specification: above the label on a primary tab, before it on a secondary
   * one.
   */
  iconPosition?: MPTabIconPosition;
  /**
   * Whether moving the arrow keys also chooses the tab they land on.
   *
   * `false` by default. Automatic activation is only kind when every panel is
   * already on the page; the moment one of them fetches, walking past four tabs
   * fires four requests.
   * @default false
   */
  activateOnFocus?: boolean;
  /**
   * Whether the arrow keys wrap from the last tab back to the first.
   * @default true
   */
  loopFocus?: boolean;
  /**
   * The hairline under the bar, which is MD3's own divider between a tab bar and
   * the content it is about. Turn it off inside a card that already has an edge.
   * @default true
   */
  divider?: boolean;
  /** The tabs share the bar's full width, each taking an equal part of it. */
  fullWidth?: boolean;
  /** The accessible name of the bar. */
  'aria-label'?: string;
  /** The `MPTab`s and the `MPTabPanel`s. */
  children?: React.ReactNode;
}

export interface MPTabProps extends Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'value' | 'color'
> {
  /** Identifies the tab, and picks out the panel with the same value. */
  value: MPTabValue;
  /**
   * The glyph. Drawn above or before the label depending on the bar's
   * `iconPosition`, and sized by the bar's rung.
   */
  icon?: React.ReactNode;
  /** Unavailable, but still listed. */
  disabled?: boolean;
  /** The tab's label. */
  children?: React.ReactNode;
}

export interface MPTabPanelProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Which tab shows this panel. */
  value: MPTabValue;
  /**
   * Keeps the panel in the DOM while it is hidden — for a panel that is
   * expensive to build, or that holds form state which should survive being
   * switched away from.
   * @default false
   */
  keepMounted?: boolean;
  children?: React.ReactNode;
}

/**
 * One set of panels, one of which is shown.
 *
 * Base UI owns everything that makes a tab bar a tab bar rather than a row of
 * buttons: roving focus so the whole bar is one tab stop, the arrow keys, Home
 * and End, the `tab`/`tabpanel` roles and the `aria-controls` wiring between
 * them, and the measurement that puts the indicator under the chosen tab. What
 * is here is the Material surface and the ladders.
 *
 * The tabs and the panels are composed rather than passed as data, unlike
 * [MPSelect](../inputs/select) — a panel is a subtree, and there is no useful
 * shape for "an array of arbitrary React trees" that is not just children. They
 * are sorted into the bar and the body here rather than made the caller's
 * problem with a wrapper element they have to remember.
 *
 * ## Horizontal only
 *
 * There is no `orientation`, and the omission is the specification's. MD3 has no
 * vertical tabs: a column of destinations down the side of a screen is a
 * **navigation rail**, which is a different component with different behaviour —
 * it switches what the *screen* is rather than which panel of one is showing,
 * and it is not one tab stop with arrow keys inside it. A tab bar turned on its
 * side would claim the tab contract while looking like the other thing.
 *
 * A bar with more tabs than room scrolls rather than wrapping, which is MD3's
 * scrollable tabs: a tab bar on two lines has stopped being a bar, and the
 * indicator has nowhere sensible to sit.
 */
export const MPTabs = React.forwardRef<HTMLDivElement, MPTabsProps>(function MPTabs(
  {
    variant = 'primary',
    color = 'primary',
    size = 'md',
    value,
    defaultValue,
    onValueChange,
    iconPosition,
    activateOnFocus = false,
    loopFocus = true,
    divider = true,
    fullWidth = false,
    className,
    style,
    children,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  // The specification's own pairing: a primary tab stacks its glyph, a secondary
  // one keeps it inline. Read from the variant rather than defaulted to one of
  // them, so a bar that changes kind changes shape with it.
  const glyphPosition = iconPosition ?? (variant === 'primary' ? 'top' : 'start');

  const context = React.useMemo(
    () => ({ variant, size, iconPosition: glyphPosition, fullWidth }),
    [variant, size, glyphPosition, fullWidth]
  );

  /*
   * Everything between the tags is either a tab or a panel, and the two go in
   * different boxes. Sorting by component identity rather than by asking the
   * caller for a `<MPTabList>`: the wrapper would be one more thing to get
   * wrong, and its only job would be to say what the elements already say.
   */
  const tabs: React.ReactNode[] = [];
  const panels: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === MPTabPanel) {
      panels.push(child);
    } else if (hasContent(child)) {
      tabs.push(child);
    }
  });

  return (
    <MPTabsContext.Provider value={context}>
      <Tabs.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next as MPTabValue | null)}
        data-mp-size={size}
        data-mp-variant={variant}
        className={['mp-tabs flex min-w-0 flex-col', SHEET_GAP[size], className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={
          {
            ...accentSlots(color),
            // The indicator insets itself by exactly this to land under the label
            // rather than under the tab. One declaration on the root, read by the
            // indicator, so the two can never disagree about the padding.
            '--_mp-tab-inset': `${TAB_INSET[size]}px`,
            ...style
          } as React.CSSProperties
        }
        {...props}
      >
        <Tabs.List
          aria-label={ariaLabel}
          activateOnFocus={activateOnFocus}
          loopFocus={loopFocus}
          className={[
            'mp-tabs__list relative flex shrink-0',
            // MD3's divider under the bar. It is on the list rather than on the
            // root so that it runs the width of the bar and the indicator sits
            // on it, which is the whole picture the specification draws.
            divider ? 'border-mp-outline-variant border-b' : '',
            fullWidth ? 'w-full' : '',
            'overflow-x-auto overflow-y-hidden'
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {tabs}

          <Tabs.Indicator
            className={[
              'mp-tabs__indicator pointer-events-none absolute bottom-0',
              'bg-(--_mp-accent)',
              variant === 'primary'
                ? // 3dp with a rounded top, inset by the tab's own padding so it
                  // is under the label. MD3 draws it that way on a primary tab
                  // and square across the whole tab on a secondary one, which is
                  // the clearest of the three signals telling the two apart.
                  [
                    'h-0.75 rounded-t-full',
                    // The underscores are Tailwind's escape for a space, and they
                    // are not optional: `calc(a+b)` with no whitespace around the
                    // operator is invalid CSS, and an invalid `width` on an
                    // absolutely positioned box is a box 0px wide.
                    'left-[calc(var(--active-tab-left)_+_var(--_mp-tab-inset))]',
                    'w-[calc(var(--active-tab-width)_-_2_*_var(--_mp-tab-inset))]'
                  ].join(' ')
                : 'left-(--active-tab-left) h-0.5 w-(--active-tab-width)',
              // `left` and `width`, not `inset-inline-start`: `--active-tab-left`
              // is a *measurement* — the distance from the list's left edge — and
              // it stays a distance from the left under RTL. Pairing a physical
              // measurement with a logical property is what would break the
              // direction, not what would fix it.
              '[transition-property:left,width]',
              'duration-(--mp-sys-motion-duration-short4) ease-mp-standard'
            ].join(' ')}
          />
        </Tabs.List>

        {panels}
      </Tabs.Root>
    </MPTabsContext.Provider>
  );
});

/**
 * One tab.
 *
 * It has no `size`, no `color` and no `variant` of its own: all three belong to
 * the bar, which is the only place they can be set once and mean the same thing
 * for every tab. A bar whose third tab is a rung out is not a bar.
 */
export const MPTab = React.forwardRef<HTMLButtonElement, MPTabProps>(function MPTab(
  { value, icon, disabled = false, className, children, ...props },
  ref
) {
  const { variant, size, iconPosition, fullWidth } = React.useContext(MPTabsContext);
  const stacked = iconPosition === 'top' && hasContent(icon);

  return (
    <Tabs.Tab
      ref={ref}
      value={value}
      disabled={disabled}
      className={[
        'mp-tabs__tab group relative flex shrink-0 items-center justify-center',
        'box-border appearance-none bg-transparent font-[inherit] whitespace-nowrap select-none',
        // `overflow-hidden` is load-bearing beyond clipping the state layer: it
        // is what takes a flex item's automatic minimum size to zero, and
        // without it `fullWidth` cannot divide the bar evenly — the tab with the
        // longest label refuses to shrink below its text.
        'overflow-hidden outline-none',
        'transition-[color] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
        stacked ? `flex-col gap-1 ${TAB_HEIGHT_STACKED[size]}` : `flex-row ${TAB_HEIGHT[size]}`,
        stacked ? '' : CONTROL_GAP[size],
        TAB_TEXT[size],
        TAB_PAD_X[size],
        // An if/else rather than stacked variants: two Tailwind classes of equal
        // specificity resolve by their order in the generated stylesheet.
        disabled
          ? 'text-mp-on-surface/38 cursor-default'
          : [
              'text-mp-on-surface-variant cursor-pointer',
              // Where the two kinds part company for the second time: a primary
              // tab's chosen label takes the accent, a secondary one's takes the
              // plain ink. The indicator carries the colour either way.
              variant === 'primary'
                ? 'data-active:text-(--_mp-accent)'
                : 'data-active:text-mp-on-surface'
            ].join(' '),
        // The ring is inset rather than offset: an offset ring on a tab in a row
        // of them is drawn on top of its neighbours.
        'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
        'focus-visible:outline-solid',
        fullWidth ? 'flex-1' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {disabled ? null : <MPStateLayer />}

      {hasContent(icon) ? (
        <span
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: TAB_ICON[size], height: TAB_ICON[size] }}
        >
          {icon}
        </span>
      ) : null}

      {hasContent(children) ? <span className="relative truncate">{children}</span> : null}
    </Tabs.Tab>
  );
});

/**
 * The content behind one tab.
 *
 * Unmounted while it is hidden unless `keepMounted` says otherwise, which is the
 * right default for the common case — four panels of which one is on screen —
 * and the wrong one for a panel holding a half-filled form.
 */
export const MPTabPanel = React.forwardRef<HTMLDivElement, MPTabPanelProps>(function MPTabPanel(
  { value, keepMounted = false, className, children, ...props },
  ref
) {
  return (
    <Tabs.Panel
      ref={ref}
      value={value}
      keepMounted={keepMounted}
      className={[
        'mp-tabs__panel text-mp-on-surface min-w-0 flex-1',
        // The panel takes focus when it holds nothing focusable of its own, so
        // it is reachable by keyboard — and it gets the library's ring rather
        // than the browser's.
        'rounded-mp-xs outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-solid outline-none',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tabs.Panel>
  );
});
