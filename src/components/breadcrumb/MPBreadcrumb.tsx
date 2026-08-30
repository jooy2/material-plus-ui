import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { ArrowRightIcon, ChevronRightIcon, MoreIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { BREADCRUMB } from '../../internal/messages/breadcrumb';
import { CONTROL_GAP, hasContent, PROSE_TEXT } from '../../internal/scale';
import type { MPColor, MPSize } from '../../types';

/**
 * What is drawn between two steps of the trail.
 *
 * Four named marks rather than a free-for-all, because a separator is read
 * hundreds of times a day and the difference between them is meaning, not
 * decoration: a `chevron` and an `arrow` say "and then", a `slash` says "path",
 * a `dot` says "these are peers of one thing". Anything else can still be passed
 * as a node.
 */
export type MPBreadcrumbSeparator = 'chevron' | 'arrow' | 'slash' | 'dot';

/** What an `MPBreadcrumbItem` inherits from the trail around it. */
interface MPBreadcrumbContextValue {
  size: MPSize;
  /** Whether this is the step the trail ends on. */
  last: boolean;
  /**
   * Where this step sits in the trail, 1-based, or `null` when the trail is not
   * publishing itself.
   *
   * Counted against the *whole* trail rather than against what is drawn, so a
   * folded trail does not renumber the steps either side of the fold — see
   * `structuredData`.
   */
  position: number | null;
}

const MPBreadcrumbContext = React.createContext<MPBreadcrumbContextValue>({
  size: 'md',
  last: false,
  position: null
});

export interface MPBreadcrumbProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'color'> {
  /** @default 'md' */
  size?: MPSize;
  /**
   * The accent family a step picks up when it is hovered.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * The mark between two steps. One of the four names, or any node.
   * @default 'chevron'
   */
  separator?: MPBreadcrumbSeparator | React.ReactNode;
  /**
   * How many steps to show before the middle is folded away behind a `…`. Left
   * out, the whole trail is shown however long it gets.
   */
  maxItems?: number;
  /**
   * How many steps stay at the front of a folded trail.
   * @default 1
   */
  itemsBeforeCollapse?: number;
  /**
   * How many stay at the end.
   * @default 1
   */
  itemsAfterCollapse?: number;
  /**
   * Whether pressing the `…` unfolds the trail in place. Turn it off to leave
   * the fold as a plain mark.
   * @default true
   */
  expandable?: boolean;
  /**
   * The name the trail is announced by. Defaults to the word for it in `locale`.
   */
  label?: string;
  /**
   * What the `…` is announced as. Defaults to the wording in `locale`.
   */
  expandLabel?: string;
  /**
   * Which language those two are written in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   *
   * Neither is ever drawn — the steps are the caller's own words — so without it
   * a Korean page announces its trail in English.
   */
  locale?: string;
  /**
   * Publishes the trail as schema.org `BreadcrumbList` microdata, which is what
   * a search engine reads to draw the trail under a result instead of the bare
   * URL.
   *
   * Off by default, and that is not timidity: a page may only claim one
   * breadcrumb trail, so a component that emitted this unasked would collide
   * with the JSON-LD a site already has in its `<head>` — and two trails is
   * worse than none. Turn it on when this component *is* the page's trail.
   *
   * What it adds is attributes and `<meta>`; nothing about the drawing, the
   * layout or the accessibility tree changes.
   *
   * ## It does not survive a fold
   *
   * `BreadcrumbList` positions have to run 1, 2, 3 with nothing missing, and a
   * folded trail does not render the steps behind its `…` — so publishing one
   * would describe a trail that skips from 2 to 6. Turning this on therefore
   * turns `maxItems` off. A trail worth publishing is a trail worth showing.
   * @default false
   */
  structuredData?: boolean;
  /** The `MPBreadcrumbItem`s. */
  children?: React.ReactNode;
}

export interface MPBreadcrumbItemProps extends Omit<
  React.ComponentPropsWithoutRef<'li'>,
  'color' | 'onClick'
> {
  /** Renders the step as a link. */
  href?: string;
  /** Fires when the step is pressed. Renders it as a button when there is no `href`. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Content before the label — a home glyph, a repository avatar. */
  startIcon?: React.ReactNode;
  /** Content after the label. */
  endIcon?: React.ReactNode;
  /**
   * Marks this step as the page you are on, which stops it being a link.
   *
   * The last step is the current one on its own, so this is only needed for a
   * trail that ends somewhere the reader is not — and setting it anywhere takes
   * the mark off the last step, because only one step in a trail can be it.
   */
  current?: boolean;
  /** Unavailable. Stops answering, keeps its place in the trail. */
  disabled?: boolean;
  /** The step's label. */
  children?: React.ReactNode;
}

/** Between the steps. */
const TRAIL_GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
  xl: 'gap-3'
};

/**
 * A step's corner.
 *
 * `corner-extra-small` at the bottom of the ladder, because what the hover tint
 * needs is a rectangle with the corners taken off. A step is not a chip and must
 * not read as one: `corner-full` on a line of text 20px tall is a pill, and a
 * trail of pills is a row of filter chips.
 */
const STEP_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-xs',
  md: 'rounded-mp-xs',
  lg: 'rounded-mp-sm',
  xl: 'rounded-mp-sm'
};

/**
 * The four marks.
 *
 * The two that point turn back under RTL, because a trail runs the way the
 * language does — the chevron by swapping which glyph is drawn, the arrow by
 * being mirrored. A rotation is the one transform the library allows on a glyph,
 * and it is allowed because nothing with text in it moves.
 */
function separatorMark(separator: MPBreadcrumbSeparator): React.ReactNode {
  switch (separator) {
    case 'chevron':
      return <MPIcon icon={ChevronRightIcon} size="1.1em" className="rtl:rotate-180" />;
    case 'arrow':
      return <MPIcon icon={ArrowRightIcon} size="1em" className="rtl:rotate-180" />;
    case 'slash':
      return <span aria-hidden="true">/</span>;
    case 'dot':
      return <span aria-hidden="true">·</span>;
    default:
      return null;
  }
}

const SEPARATOR_NAMES: MPBreadcrumbSeparator[] = ['chevron', 'arrow', 'slash', 'dot'];

function isSeparatorName(value: unknown): value is MPBreadcrumbSeparator {
  return typeof value === 'string' && SEPARATOR_NAMES.includes(value as MPBreadcrumbSeparator);
}

/**
 * The trail of pages above the one being read.
 *
 * Two things make this more than a row of links. The first is that the last step
 * is where the reader already is, so it is not a link at all — it carries
 * `aria-current="page"` and stops being pressable, and the component works that
 * out rather than asking every caller to remember it. The second is the fold: a
 * trail seven levels deep is a trail nobody reads, so the middle collapses to a
 * `…` that puts it back when pressed.
 *
 * The separators are drawn by the trail rather than by the steps. A step does not
 * know whether anything follows it, and a mark that belonged to a step would have
 * to be taken off the last one by hand.
 */
export const MPBreadcrumb = React.forwardRef<HTMLElement, MPBreadcrumbProps>(function MPBreadcrumb(
  {
    size = 'md',
    color = 'primary',
    separator = 'chevron',
    maxItems,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    expandable = true,
    label,
    expandLabel,
    locale: localeProp,
    structuredData = false,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const messages = useMPMessages(BREADCRUMB, useMPLocale(localeProp));
  const [unfolded, setUnfolded] = React.useState(false);

  const steps = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<MPBreadcrumbItemProps>[];
  const total = steps.length;

  /*
   * The last step is the page you are on — unless a step says it is. Exactly one
   * element in a trail may carry `aria-current="page"`, so a caller who marks an
   * earlier step has to take the mark off the last one, and doing that by hand
   * would mean writing `current={false}` on a step that never asked for it.
   */
  const claimed = steps.some((step) => step.props.current === true);

  const folding =
    !unfolded &&
    // A published trail is never folded: `BreadcrumbList` positions have to run
    // 1, 2, 3 with nothing missing, and the steps behind a `…` are not in the
    // document to be numbered.
    !structuredData &&
    maxItems !== undefined &&
    total > Math.max(maxItems, 1) &&
    // A fold has to actually remove something. With `1` before and `1` after on
    // a three-step trail the `…` would stand in for exactly one step, which is
    // longer than the step it replaced.
    total - itemsBeforeCollapse - itemsAfterCollapse > 1;

  const shown = folding
    ? [
        ...steps.slice(0, Math.max(0, itemsBeforeCollapse)),
        null,
        ...steps.slice(total - Math.max(0, itemsAfterCollapse))
      ]
    : steps;

  const mark = isSeparatorName(separator) ? separatorMark(separator) : separator;

  /*
   * One context value per position, built with the list rather than inline.
   *
   * A fresh object per step per render is a fresh context value per step per
   * render, which re-renders a whole trail because something above it moved.
   * `shown.length` is what the last step is decided against, so the list is
   * rebuilt exactly when the fold opens or the trail's length changes.
   */
  const positions = React.useMemo<MPBreadcrumbContextValue[]>(
    () =>
      Array.from({ length: shown.length }, (_, index) => ({
        size,
        last: !claimed && index === shown.length - 1,
        // 1-based, because `BreadcrumbList` counts from one. `null` while the
        // trail is not publishing itself, which is what keeps the attributes off
        // a trail that did not ask for them.
        position: structuredData ? index + 1 : null
      })),
    [size, claimed, shown.length, structuredData]
  );

  const foldClassNames = [
    'rounded-mp-xs text-mp-on-surface-variant inline-flex items-center px-0.5',
    'appearance-none border-0 bg-transparent font-[inherit]',
    'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
    expandable
      ? [
          'cursor-pointer hover:bg-(--_mp-accent-container) hover:text-(--_mp-on-accent-container)',
          'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
          'focus-visible:outline-solid outline-none'
        ].join(' ')
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      ref={ref}
      aria-label={label ?? messages.label}
      data-mp-size={size}
      className={['mp-breadcrumb flex', PROSE_TEXT[size], className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      <ol
        // `role="list"` for the reason `MPList` says it out loud: a host reset
        // may take the markers off every `<ol>`, and Safari takes the list
        // semantics off with them.
        role="list"
        // The list is the `BreadcrumbList`; each step is a `ListItem` inside it.
        // Both are attributes and nothing else — no element, no class, no change
        // to what is drawn or announced.
        itemScope={structuredData || undefined}
        itemType={structuredData ? 'https://schema.org/BreadcrumbList' : undefined}
        className={`flex list-none flex-wrap items-center p-0 ${TRAIL_GAP[size]}`}
      >
        {shown.map((step, index) => (
          <React.Fragment key={step ? (step.key ?? index) : 'fold'}>
            {index > 0 ? (
              <li
                aria-hidden="true"
                className="text-mp-on-surface-variant flex shrink-0 items-center select-none"
              >
                {mark}
              </li>
            ) : null}

            {step ? (
              <MPBreadcrumbContext.Provider value={positions[index]}>
                {step}
              </MPBreadcrumbContext.Provider>
            ) : (
              <li className="flex shrink-0 items-center">
                {expandable ? (
                  <button
                    type="button"
                    className={foldClassNames}
                    aria-label={expandLabel ?? messages.expand}
                    onClick={() => setUnfolded(true)}
                  >
                    <MPIcon icon={MoreIcon} size="1.1em" />
                  </button>
                ) : (
                  <span className={foldClassNames} aria-hidden="true">
                    <MPIcon icon={MoreIcon} size="1.1em" />
                  </span>
                )}
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
});

/**
 * One step of the trail.
 *
 * It renders three different things and the caller picks by what they pass: an
 * `<a>` with an `href`, a `<button>` with an `onClick`, and a plain `<span>` with
 * neither — which is what the last step is, because the page you are already on
 * is not somewhere to go.
 */
export const MPBreadcrumbItem = React.forwardRef<HTMLLIElement, MPBreadcrumbItemProps>(
  function MPBreadcrumbItem(
    { href, onClick, startIcon, endIcon, current, disabled = false, className, children, ...props },
    ref
  ) {
    const { size, last, position } = React.useContext(MPBreadcrumbContext);
    const isCurrent = current ?? last;
    const interactive = Boolean(href || onClick) && !isCurrent && !disabled;
    const published = position !== null;

    const stepClassNames = [
      'inline-flex min-w-0 items-center px-1 no-underline',
      'appearance-none border-0 bg-transparent font-[inherit] text-[inherit]',
      CONTROL_GAP[size],
      STEP_RADIUS[size],
      'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
      // An if/else rather than stacked variants: two Tailwind classes of equal
      // specificity resolve by their order in the generated stylesheet.
      disabled
        ? 'text-mp-on-surface/38 cursor-default'
        : isCurrent
          ? // The page you are on is the one step set in the full ink, one weight
            // up. Everything behind it is supporting text, which is what a trail
            // of places you are not is.
            'text-mp-on-surface font-medium'
          : interactive
            ? [
                'text-mp-on-surface-variant cursor-pointer',
                'hover:bg-(--_mp-accent-container) hover:text-(--_mp-on-accent-container)',
                'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
                'focus-visible:outline-solid outline-none'
              ].join(' ')
            : 'text-mp-on-surface-variant'
    ]
      .filter(Boolean)
      .join(' ');

    const body = (
      <>
        {hasContent(startIcon) ? (
          <span className="flex h-[1lh] shrink-0 items-center">{startIcon}</span>
        ) : null}
        {/* The label is the `ListItem`'s `name`, which is the string a search
            engine draws. It goes on the span around the words rather than on
            the step, so an icon beside them is not read as part of the name. */}
        <span className="truncate" itemProp={published ? 'name' : undefined}>
          {children}
        </span>
        {hasContent(endIcon) ? (
          <span className="flex h-[1lh] shrink-0 items-center">{endIcon}</span>
        ) : null}
      </>
    );

    return (
      <li
        ref={ref}
        itemProp={published ? 'itemListElement' : undefined}
        itemScope={published || undefined}
        itemType={published ? 'https://schema.org/ListItem' : undefined}
        className={['flex min-w-0 items-center', className ?? ''].filter(Boolean).join(' ')}
        {...props}
      >
        {/*
          Where this step sits in the trail. A `<meta>` rather than something
          drawn, because the number is the *order* — the reader can already see
          that, and a screen reader counting "one, Home, two, Docs" would be
          reading the markup rather than the trail.
        */}
        {published ? <meta itemProp="position" content={String(position)} /> : null}

        {interactive && href ? (
          // `item` is the URL the step goes to. It is on the `<a>` rather than
          // on a `<link>` of its own, so the address a search engine reads and
          // the address a reader follows cannot disagree.
          <a
            href={href}
            itemProp={published ? 'item' : undefined}
            className={stepClassNames}
            onClick={onClick}
          >
            {body}
          </a>
        ) : interactive ? (
          <button type="button" className={stepClassNames} onClick={onClick}>
            {body}
          </button>
        ) : (
          // `aria-current="page"` rather than `"true"`: a trail is navigation,
          // and the step the reader is on is a *page*, not the chosen one of a
          // set of options.
          <span
            className={stepClassNames}
            aria-current={isCurrent ? 'page' : undefined}
            aria-disabled={disabled || undefined}
          >
            {body}
          </span>
        )}
      </li>
    );
  }
);
