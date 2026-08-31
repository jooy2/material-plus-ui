import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { accentSlots } from '../../internal/accent';
import { linkRel } from '../../internal/link';
import { CONTROL_GAP, hasContent, PROSE_TEXT, SHEET_PAD_X } from '../../internal/scale';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTAINER_SURFACE } from '../../internal/surface';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * What an `MPListItem` inherits from the `MPList` around it.
 *
 * A row is meaningless on its own — it is a row *of* something — so `size`,
 * `color` and whether the rows are separated by hairlines belong to the list,
 * not to the member. Passing them on every item would be three chances per row
 * to get one of them wrong, and the failure is silent: a list where item four is
 * a size bigger than the rest.
 *
 * A context rather than `React.Children.map` with `cloneElement`, for the same
 * reason `MPButtonGroup` uses one: the moment a caller `.map()`s their data or
 * wraps a row in a tooltip, cloning stops reaching the item.
 */
interface MPListContextValue {
  size: MPSize;
  color: MPColor;
  dividers: boolean;
}

const MPListContext = React.createContext<MPListContextValue>({
  size: 'md',
  color: 'primary',
  dividers: false
});

export interface MPListProps extends Omit<React.ComponentPropsWithoutRef<'ul'>, 'color'> {
  /**
   * How much surface the sheet paints behind the rows.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The row height and type scale. Each rung lands a one-line row on exactly the
   * control height of the same name — see `PAD_Y`.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family a selected or hovered row reads. The sheet itself stays
   * neutral whatever this is.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Separates the rows with a hairline instead of with space.
   *
   * It changes more than it sounds like: with dividers the rules have to reach
   * both edges of the sheet, so the list gives up its inner padding and the rows
   * give up their rounded corners. A row cannot be a floating tile and a ruled
   * line at the same time.
   * @default false
   */
  dividers?: boolean;
  /**
   * Renders something other than a `<ul>` — `render={<ol />}` for a list where
   * the order is the point. Base UI's own escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

export interface MPListItemProps extends Omit<
  React.ComponentPropsWithoutRef<'li'>,
  'color' | 'onClick'
> {
  /**
   * Passing it is what turns the row into a real `<button>`. It lands on that
   * button rather than on the `<li>`, which is why the type is loosened from the
   * list item the shell actually is.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Content before the label — an icon, an avatar, a status dot. */
  startIcon?: React.ReactNode;
  /** Content after the label, inside the pressable area. */
  endIcon?: React.ReactNode;
  /**
   * A second line under the label. MD3 calls this the supporting text, and it is
   * one step down the type scale in `on-surface-variant`.
   */
  description?: React.ReactNode;
  /**
   * A control pinned to the end of the row — a switch, a menu button.
   *
   * Deliberately outside the pressable area: a row that both navigates and holds
   * a toggle has two things to press, and nesting one button inside another is
   * markup the browser rewrites on parse.
   */
  action?: React.ReactNode;
  /** Renders the row as a link. Mutually exclusive with `onClick` in practice. */
  href?: string;
  /**
   * Where that link opens. `rel` follows on its own for `_blank` — see `rel`.
   */
  target?: string;
  /**
   * Overrides the `rel` a `_blank` row would otherwise get, which is
   * `noopener noreferrer`. Writing one **replaces** it rather than adding to it,
   * so a row that also needs `nofollow` spells all three out.
   */
  rel?: string;
  /**
   * Renders the row's pressable element as something else — a router's `Link`,
   * most of the time. `href`, `target` and the row's classes still go through,
   * so `render={<NextLink />}` needs the URL written once, on the `MPListItem`.
   *
   * **This is the one `render` in the library that is not the outermost
   * element.** A row's shell is an `<li>` because it is inside a `<ul>`, and
   * swapping that for anything else makes the list stop being a list; what a
   * caller actually wants to replace is the `<a>` *inside* it, which is the
   * thing App Router has to own for a client-side navigation and a prefetch to
   * happen at all. So that is what this replaces. Without `href` or `onClick`
   * the row is not pressable and there is nothing here to render — this is
   * ignored rather than wrapping inert content in a link.
   */
  render?: useRender.RenderProp;
  /** Marks the row as the chosen one — the open page, the current filter. */
  selected?: boolean;
  /** Unavailable. Drops the accent family, as everywhere else in the library. */
  disabled?: boolean;
  /** The label. */
  children?: React.ReactNode;
}

/**
 * A row's vertical padding, and the number that makes the whole ladder line up.
 *
 * Each rung is the leading of that rung's `PROSE_TEXT` subtracted from the
 * control height of the same name: `body-large` is a 24px line box, and 24 plus
 * `py-4` is 56 — MD3's own one-line list item, and `CONTROL_HEIGHT.md` to the
 * pixel. The same arithmetic holds at every step, so a one-line row and the
 * button beside it are the same height without either knowing about the other.
 */
const PAD_Y: Record<MPSize, string> = {
  xs: 'py-1.5',
  sm: 'py-2.5',
  md: 'py-4',
  lg: 'py-5',
  xl: 'py-6'
};

/**
 * The supporting line under a row's label. MD3 sets it in `body-medium`, one step
 * below the headline, and the two smallest rungs go one further because
 * `body-medium` under `body-medium` is not a step at all.
 */
const SUPPORT_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-medium',
  lg: 'text-mp-body-medium',
  xl: 'text-mp-body-medium'
};

/**
 * A row sits one step down the corner ladder from the sheet it is inside — a
 * tile cut out of a sheet cannot have the same corner as the sheet, or the two
 * curves fight along the edge.
 */
const ROW_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-xs',
  md: 'rounded-mp-sm',
  lg: 'rounded-mp-sm',
  xl: 'rounded-mp-md'
};

/**
 * The rule between two rows, written as `>li+li` rather than as a class on each
 * item, so it holds however the caller composed the rows — through a `.map()`,
 * through fragments, through a component of their own that renders a row.
 */
const DIVIDERS = '[&>li+li]:border-mp-outline-variant [&>li+li]:border-t';

/**
 * A stack of rows.
 *
 * The list is a sheet and the rows are what is on it, which is the whole reason
 * the two are separate components: `size` and `color` are properties of the
 * stack, not of any one line in it, and a context is what carries them down.
 *
 * There is no Base UI primitive under this on purpose. A list is not a composite
 * widget — it has no roving focus, no selection model, no keyboard contract of
 * its own. Reaching for a menu or a listbox primitive to get one would hand
 * every consumer's plain list of links the semantics of a menu, which is the
 * most common way a component library breaks a screen reader.
 */
export const MPList = React.forwardRef<HTMLUListElement, MPListProps>(function MPList(
  {
    variant = 'outlined',
    size = 'md',
    color = 'primary',
    dividers = false,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const context = React.useMemo(() => ({ size, color, dividers }), [size, color, dividers]);

  const classNames = [
    'mp-list rounded-mp-md flex flex-col',
    // The sheet is never dyed: a list holds other people's content, and tinting
    // the sheet under it puts every colour in it on a background it was not
    // chosen against. `text` is the one to reach for inside a card, where a
    // second bordered rectangle is a second rectangle.
    CONTAINER_SURFACE[variant],
    'text-mp-on-surface',
    // Without dividers the rows are tiles and the sheet keeps a hair of padding
    // so a hovered row does not run into the edge. With them the rules have to
    // reach the edge, so the padding goes and the rows square off.
    dividers ? `overflow-hidden ${DIVIDERS}` : 'p-1',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const element = useRender({
    // `<ul />` written out rather than left to Base UI's default, which is a
    // `<div>`: a list of rows that is not a list element is a list only the
    // `role` below knows about.
    render: render ?? <ul />,
    ref,
    props: {
      // A host page's reset may take the bullets off every `<ul>`, and Safari
      // takes the list semantics off with them. Saying `role="list"` out loud is
      // the one-line fix, and it costs nothing when there is no reset.
      role: 'list',
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: classNames,
      style: { ...accentSlots(color), ...style },
      children,
      ...props
    }
  });

  return <MPListContext.Provider value={context}>{element}</MPListContext.Provider>;
});

/**
 * The pressable element inside a row, which is where `render` lands.
 *
 * A component rather than a `useRender` call in the branch that needs it,
 * because `useRender` is a hook and the branches are a ternary: a row that is
 * not pressable has no control to build, and a hook cannot be the thing that
 * decides that.
 */
function RowControl({
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

/**
 * One row.
 *
 * The shell is always an `<li>`. What changes is what is inside it: a plain run
 * of content, or — when `onClick` or `href` is given — a real `<button>` or
 * `<a>` wrapping that content, with `action` sitting outside it as a separate
 * control. This is the same shape `MPChip` uses, for the same two reasons: a
 * `<span>` carrying a click handler is invisible to a keyboard, and a `<button>`
 * inside a `<button>` is markup Chrome silently un-nests.
 *
 * That inner element is what `render` replaces — a router's `Link`, so a row in
 * a navigation list is a client-side navigation rather than a full page load.
 */
export const MPListItem = React.forwardRef<HTMLLIElement, MPListItemProps>(function MPListItem(
  {
    startIcon,
    endIcon,
    description,
    action,
    href,
    target,
    rel,
    render,
    selected = false,
    disabled = false,
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const { size, dividers } = React.useContext(MPListContext);
  const interactive = Boolean(onClick || href) && !disabled;

  const padX = SHEET_PAD_X[size];

  const bodyClassNames = [
    'group relative flex min-w-0 flex-1 items-center overflow-hidden text-start',
    'font-[inherit] no-underline',
    padX,
    PAD_Y[size],
    CONTROL_GAP[size],
    PROSE_TEXT[size],
    'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
    // Squared off when the rows are ruled, for the reason `DIVIDERS` exists: a
    // tile and a line are two different ideas about what a row is.
    dividers ? '' : ROW_RADIUS[size],
    // An if/else rather than stacked variants: two Tailwind classes of equal
    // specificity resolve by their order in the generated stylesheet.
    disabled
      ? 'text-mp-on-surface/38 cursor-default'
      : selected
        ? // MD3's selected list item: the family's container tone under its own
          // ink. Not a second colour and not a bolder weight — the same row,
          // filled in.
          'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)'
        : '',
    interactive
      ? [
          'cursor-pointer appearance-none border-0',
          // A `<button>` arrives with the browser's own grey, and this library
          // ships no page reset — but a *selected* row has a fill of its own,
          // and two backgrounds of equal specificity resolve by their order in
          // the generated stylesheet rather than by the order they were written
          // in. So only one of the two is ever emitted.
          selected ? '' : 'bg-transparent',
          'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
          'focus-visible:outline-solid outline-none'
        ]
          .filter(Boolean)
          .join(' ')
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      {interactive ? <MPStateLayer /> : null}

      {hasContent(startIcon) ? (
        <span className="flex h-[1lh] shrink-0 items-center">{startIcon}</span>
      ) : null}

      <span className="mp-list-item__text flex min-w-0 flex-1 flex-col">
        {hasContent(children) ? (
          <span className="mp-list-item__label truncate">{children}</span>
        ) : null}
        {hasContent(description) ? (
          <span
            className={[
              'mp-list-item__description truncate',
              SUPPORT_TEXT[size],
              // On a selected row the supporting line stays inside the container
              // ink at reduced strength rather than switching role, or it would
              // be the one word on the row painted in a colour from a different
              // surface.
              selected ? 'opacity-80' : 'text-mp-on-surface-variant'
            ].join(' ')}
          >
            {description}
          </span>
        ) : null}
      </span>

      {hasContent(endIcon) ? (
        <span className="flex h-[1lh] shrink-0 items-center">{endIcon}</span>
      ) : null}
    </>
  );

  return (
    <li
      ref={ref}
      data-selected={selected || undefined}
      className={['flex w-full items-center', className ?? ''].filter(Boolean).join(' ')}
      {...props}
    >
      {interactive && href ? (
        // `aria-current="page"` on a link and `"true"` on a button: the first is
        // "this is the page you are on", the second is "this is the chosen one
        // of these". `aria-pressed` would be a third thing — a toggle — and a
        // selected row is not a toggle.
        <RowControl
          render={render}
          props={{
            href,
            target,
            rel: linkRel(target, rel),
            className: bodyClassNames,
            'aria-current': selected ? 'page' : undefined,
            onClick,
            children: body
          }}
        />
      ) : interactive ? (
        <RowControl
          render={render}
          props={{
            // Only when the element is this component's own. A caller's
            // `render` decides what it is, and `type` on anything that is not a
            // button is an attribute the browser ignores and a validator does
            // not.
            type: render ? undefined : 'button',
            className: bodyClassNames,
            'aria-current': selected ? true : undefined,
            onClick,
            children: body
          }}
        />
      ) : (
        <div className={bodyClassNames} aria-disabled={disabled || undefined}>
          {body}
        </div>
      )}

      {hasContent(action) ? (
        <div className={`flex shrink-0 items-center ${padX}`}>{action}</div>
      ) : null}
    </li>
  );
});
