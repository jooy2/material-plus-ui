import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon
} from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { fillMessage, type MPMessages } from '../../internal/i18n';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_ICON, CONTROL_TEXT } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPSize, MPStyleProps } from '../../types';

/** The words the row says on its own behalf. */
export type MPPaginationLabels = MPMessages['pagination'];

/**
 * One place in the row: a page, or one of the two kinds of gap.
 *
 * Two flavours of ellipsis rather than one, so a caller reading the range back
 * can tell which end of the row was folded.
 */
type MPPaginationSlot = number | 'start-ellipsis' | 'end-ellipsis';

/**
 * A cell.
 *
 * `min-w` rather than a fixed width, which is the one way this differs from
 * every other square control in the library: a page number is between one and
 * four digits, and a cell that was exactly as wide as it is tall would clip
 * `1024`. So it is square until the number needs more, and the inline padding is
 * what it grows by.
 */
const CELL: Record<MPSize, string> = {
  xs: 'h-8 min-w-8 px-1.5',
  sm: 'h-10 min-w-10 px-2',
  md: 'h-14 min-w-14 px-2.5',
  lg: 'h-16 min-w-16 px-3',
  xl: 'h-18 min-w-18 px-3.5'
};

/** Between the cells. Tighter than a button group's: this is one control. */
const ROW_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-1',
  md: 'gap-1',
  lg: 'gap-1.5',
  xl: 'gap-2'
};

export interface MPPaginationProps
  extends MPStyleProps, Omit<React.ComponentPropsWithoutRef<'nav'>, 'color' | 'onChange'> {
  /**
   * How many pages there are. Fewer than two and the whole control renders
   * nothing — one page is not a set of pages, and a row holding a lone disabled
   * "1" is a control advertising that it has nothing to do.
   */
  count: number;
  /** The current page, 1-based. Use with `onPageChange` for a controlled row. */
  page?: number;
  /**
   * Which page starts current, for an uncontrolled row.
   * @default 1
   */
  defaultPage?: number;
  /** Called with the page that was chosen. */
  onPageChange?: (page: number) => void;
  /**
   * How many pages are always shown on either side of the current one.
   * @default 1
   */
  siblingCount?: number;
  /**
   * How many pages are always shown at each end, whatever page is current. `0`
   * drops the first and last page from the row, leaving only the window.
   * @default 1
   */
  boundaryCount?: number;
  /**
   * Shows the two steppers that jump to the first and last page.
   * @default false
   */
  showEdges?: boolean;
  /**
   * Shows the two steppers that move by one page.
   * @default true
   */
  showArrows?: boolean;
  /**
   * Which accent family the current page is filled with.
   * @default 'primary'
   */
  color?: MPColor;
  /** Unavailable. Every cell in the row stops answering. */
  disabled?: boolean;
  /**
   * The address of a page, which turns every number in the row into a real link.
   *
   * Without it the row is buttons, and a crawler cannot press one — so a paged
   * list of articles, products or search results exists for a reader and stops
   * at page one for everything else. With it the numbers are `<a href>`, the two
   * steppers carry `rel="prev"` and `rel="next"`, and the browser's own
   * behaviour comes back: open in a new tab, copy the address, see where a press
   * is going before making it.
   *
   * `onPageChange` still fires and the navigation is still cancelled first, so a
   * client-side router keeps the page it already has.
   */
  getPageHref?: (page: number) => string;
  /**
   * Which language the row names itself in — a BCP 47 tag such as `ko`, `pt-BR`
   * or `zh-Hant`. Unsupported tags fall back to English.
   *
   * Nothing here is ever drawn, so without it a Korean page reads its pages out
   * in English.
   */
  locale?: string;
  /** Overrides for the words themselves. They win over the translation. */
  labels?: Partial<MPPaginationLabels>;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

/**
 * Which pages the row actually shows.
 *
 * The shape every pagination converges on — a fixed run at each end, a window
 * around the current page, and an ellipsis wherever those leave a gap — with one
 * detail that is easy to get wrong and matters: a gap of exactly one page is
 * filled with that page rather than with an ellipsis. `1 … 3 … 9` hides a single
 * number behind a symbol wider than the number it replaced.
 *
 * The row is also pinned to a constant number of slots whatever page it is on:
 * the window slides toward whichever end it is near instead of being clipped by
 * it, so page 1 shows `1 2 3 4 5 … 20` and page 10 shows `1 … 9 10 11 … 20`.
 * Which slots are pages and which are ellipses changes; how many there are does
 * not. Without that, stepping from page 1 to page 2 relayouts the row and every
 * cell moves out from under the pointer that just pressed one.
 */
function paginationRange(
  count: number,
  page: number,
  siblingCount: number,
  boundaryCount: number
): MPPaginationSlot[] {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  return [
    ...startPages,

    // An ellipsis when more than one page is hidden, the page itself when
    // exactly one is, and nothing when none is.
    ...(siblingsStart > boundaryCount + 2
      ? (['start-ellipsis'] as MPPaginationSlot[])
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),

    ...range(siblingsStart, siblingsEnd),

    ...(siblingsEnd < count - boundaryCount - 1
      ? (['end-ellipsis'] as MPPaginationSlot[])
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),

    ...endPages
  ];
}

/**
 * A row of pages, one of which is the one being read.
 *
 * Material has no pagination component, so what is Material here is everything
 * *around* the decision: the cells are pills at the library's own control
 * heights, the current one is filled with the accent under its own ink, the rest
 * are the quiet `text` treatment, and every one of them carries the state layer
 * the specification uses in place of a hover colour.
 *
 * The current page is the one thing the row has to say without being read, which
 * is why it is the only cell that is filled. Nine filled cells in a row would say
 * that all nine are the primary action.
 *
 * ## The markup, and why it is that
 *
 * A `<nav>` around a `<ul>`: a named landmark a screen reader can skip, holding
 * a list whose length says how far the pages go, with `aria-current="page"`
 * marking where the reader is. The ellipsis is a `<span>` rather than a disabled
 * button — it is not a control that happens to be unavailable, it is
 * punctuation — and it is `aria-hidden`, because "horizontal ellipsis" read out
 * between two numbers is noise.
 *
 * ## Why it builds its own cells
 *
 * For the reason [MPSegmentedButton](../inputs/segmented-button) does: a page
 * cell is square-ish and grows only for a long number, which is not a shape
 * [MPButton](../inputs/button) has — a button is a pill with inline padding
 * proportional to its height, and nine of those in a row is a very long row. The
 * heights, the type scale and the state layer are the shared ones, so a `sm`
 * pagination still lines up with a `sm` button beside it.
 */
export const MPPagination = React.forwardRef<HTMLElement, MPPaginationProps>(function MPPagination(
  {
    count,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    showEdges = false,
    showArrows = true,
    size = 'md',
    color = 'primary',
    fullWidth = false,
    disabled = false,
    getPageHref,
    locale: localeProp,
    labels,
    className,
    style,
    ...props
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages('pagination', locale, labels);

  const [uncontrolled, setUncontrolled] = React.useState(defaultPage);
  const controlled = pageProp !== undefined;
  const current = Math.min(Math.max(pageProp ?? uncontrolled, 1), Math.max(count, 1));

  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), count);

    if (clamped === current) {
      return;
    }

    if (!controlled) {
      setUncontrolled(clamped);
    }

    onPageChange?.(clamped);
  };

  // One page is not a set of pages, and no pages is not a thing to say out loud.
  if (count < 2) {
    return null;
  }

  const slots = paginationRange(count, current, siblingCount, boundaryCount);
  const atStart = current <= 1;
  const atEnd = current >= count;

  /*
   * Who answers the press.
   *
   * With an `href` and a handler both, the handler wins and the navigation is
   * cancelled: that is a client-side router keeping the page it already has.
   * With an `href` and no handler the link is left to do what a link does, which
   * is also what makes the row work with JavaScript still loading.
   */
  const press = (event: React.MouseEvent<HTMLElement>, to: number) => {
    // A press carrying a modifier is the reader asking the browser for something
    // — a new tab, a new window, a saved copy. Never ours to cancel.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (getPageHref && !onPageChange) {
      return;
    }

    event.preventDefault();
    go(to);
  };

  const cellClassNames = (chosen: boolean, unavailable: boolean) =>
    [
      'mp-pagination__cell group relative inline-flex items-center justify-center',
      'rounded-mp-full box-border appearance-none overflow-hidden align-middle select-none',
      'border-0 font-[inherit] tabular-nums whitespace-nowrap no-underline',
      'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
      'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
      'focus-visible:outline-solid outline-none',
      CELL[size],
      CONTROL_TEXT[size],
      // An if/else rather than stacked variants: two Tailwind classes of equal
      // specificity resolve by their order in the generated stylesheet.
      unavailable
        ? 'text-mp-on-surface/38 cursor-default bg-transparent'
        : chosen
          ? 'bg-(--_mp-accent) text-(--_mp-on-accent) cursor-pointer'
          : 'text-mp-on-surface cursor-pointer bg-transparent'
    ].join(' ');

  /**
   * One cell, as whichever element it should be.
   *
   * A link only where there is somewhere to go.
   *
   * The page being read is not somewhere to go — the same rule
   * [MPBreadcrumb](../display/breadcrumb) applies to the step the reader is
   * standing on — and a stepper at the end of the row is unavailable, which is
   * not something an `<a>` can be. A link that only looks disabled is one a
   * keyboard still lands on and a crawler still follows.
   */
  const cell = (
    key: string,
    to: number,
    unavailable: boolean,
    chosen: boolean,
    name: string,
    body: React.ReactNode,
    rel?: 'prev' | 'next'
  ) => (
    <li key={key} className="flex">
      {getPageHref && !unavailable && !chosen ? (
        // No `aria-current` here: this branch is only reached for a cell that is
        // somewhere to go, and the page being read is not one — it renders as
        // the button below, which is where the mark belongs.
        <a
          href={getPageHref(to)}
          rel={rel}
          aria-label={name}
          className={cellClassNames(false, false)}
          onClick={(event) => press(event, to)}
        >
          <MPStateLayer />
          <span className="relative">{body}</span>
        </a>
      ) : (
        <button
          type="button"
          disabled={unavailable}
          aria-label={name}
          aria-current={chosen ? 'page' : undefined}
          className={cellClassNames(chosen, unavailable)}
          onClick={(event) => press(event, to)}
        >
          {unavailable ? null : <MPStateLayer />}
          <span className="relative">{body}</span>
        </button>
      )}
    </li>
  );

  /**
   * A stepper's glyph.
   *
   * The chevrons are mirrored under RTL rather than swapped for their opposite:
   * "previous" points against the reading direction in every language, and a
   * rotation is the one transform this library allows on a glyph — there is no
   * text in it to resample.
   */
  const stepper = (icon: typeof ChevronLeftIcon) => (
    <MPIcon icon={icon} size={CONTROL_ICON[size]} className="rtl:rotate-180" />
  );

  return (
    <nav
      ref={ref}
      aria-label={messages.label}
      data-mp-size={size}
      className={['mp-pagination flex', fullWidth ? 'w-full justify-center' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      <ul
        // `role="list"` said out loud for the reason `MPList` gives: a host reset
        // may take the markers off every `<ul>`, and Safari takes the list
        // semantics off with them.
        role="list"
        className={`m-0 flex list-none items-center p-0 ${ROW_GAP[size]}`}
      >
        {showEdges
          ? cell('first', 1, disabled || atStart, false, messages.first, stepper(ChevronsLeftIcon))
          : null}

        {showArrows
          ? cell(
              'previous',
              current - 1,
              disabled || atStart,
              false,
              messages.previous,
              stepper(ChevronLeftIcon),
              'prev'
            )
          : null}

        {/*
         * Keyed by *slot*, never by page number.
         *
         * The window recentres on the page that was just chosen, so almost every
         * number moves one place along — and with the number as the key, React
         * moves the DOM nodes to match. The cell under the pointer is then a
         * different element from the one that was pressed: its state layer fades
         * out while a freshly mounted neighbour's fades in, which reads as a
         * flicker. Keying by position keeps every node where it is and changes
         * only its label and its fill, which is what the row is actually doing.
         */}
        {slots.map((slot, index) =>
          typeof slot === 'number' ? (
            cell(
              `slot-${index}`,
              slot,
              disabled,
              slot === current,
              fillMessage(messages.page, { page: String(slot) }),
              slot
            )
          ) : (
            <li
              key={`slot-${index}`}
              aria-hidden="true"
              className={[
                'text-mp-on-surface-variant flex items-center justify-center select-none',
                CELL[size],
                CONTROL_TEXT[size]
              ].join(' ')}
            >
              …
            </li>
          )
        )}

        {showArrows
          ? cell(
              'next',
              current + 1,
              disabled || atEnd,
              false,
              messages.next,
              stepper(ChevronRightIcon),
              'next'
            )
          : null}

        {showEdges
          ? cell('last', count, disabled || atEnd, false, messages.last, stepper(ChevronsRightIcon))
          : null}
      </ul>

      {/*
       * Where the reader is, as a sentence rather than as a filled cell.
       * `aria-current` says which page is chosen; this says how many there are,
       * which the list's length no longer does once an ellipsis is in it.
       */}
      <span className={VISUALLY_HIDDEN} aria-live="polite">
        {fillMessage(messages.status, { page: String(current), total: String(count) })}
      </span>
    </nav>
  );
});
