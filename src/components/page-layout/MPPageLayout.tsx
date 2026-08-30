import * as React from 'react';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { LAYOUT } from '../../internal/messages/layout';
import {
  MPPageLayoutContext,
  MPSidebarSideContext,
  type MPPageCollapse,
  type MPPageScroll,
  type MPPageSlot,
  type MPPageSpan,
  type MPSidebarSide
} from '../../internal/page-layout';
import { hasContent } from '../../internal/scale';

export type {
  MPPageCollapse,
  MPPageScroll,
  MPPageSpan,
  MPSidebarSide
} from '../../internal/page-layout';

export interface MPPageLayoutProps extends React.ComponentPropsWithoutRef<'div'> {
  /** The bar across the top. An [MPHeader](./header), usually. */
  header?: React.ReactNode;
  /** The sheet at the end. An [MPFooter](./footer), usually. */
  footer?: React.ReactNode;
  /**
   * The leading column — the left of an English page, the right of an Arabic
   * one. An [MPSidebar](./sidebar), which is told which end it is on and needs
   * no `side` of its own here.
   */
  sidebar?: React.ReactNode;
  /**
   * The trailing column, for the layouts that have two: navigation down one
   * side and a table of contents, an inspector or a filter panel down the
   * other. Each is a sidebar with its own width, its own drawer and its own
   * trigger.
   */
  endSidebar?: React.ReactNode;
  /**
   * Which of the header and the sidebars takes the top corner.
   * @default 'full'
   */
  headerSpan?: MPPageSpan;
  /**
   * The same question for the footer, and worth answering separately: a
   * dashboard with a full-height navigation drawer still usually wants its
   * copyright line under the content rather than under the drawer.
   * @default 'full'
   */
  footerSpan?: MPPageSpan;
  /**
   * What scrolls: the document, or only the region between the bars.
   * @default 'page'
   */
  scroll?: MPPageScroll;
  /**
   * How tall the layout is.
   *
   * - `viewport` — the window's, which is what a page wants: a short page still
   *   pushes its footer to the bottom of the screen, and with `scroll="content"`
   *   the layout is exactly one screen tall. The default.
   * - `auto` — its parent's, for a layout that is not the page: a shell inside a
   *   preview, a pane of a larger tool.
   * - a length — a number in pixels, or any CSS length.
   *
   * It sets a floor while the page scrolls and an exact height while only the
   * content does, which is the same difference `scroll` makes everywhere else.
   * @default 'viewport'
   */
  height?: 'viewport' | 'auto' | number | string;
  /**
   * The window size class below which the sidebars stop being columns and
   * become drawers, opened by an [MPSidebarTrigger](./sidebar#mpsidebartrigger).
   * `none` keeps them columns at every width.
   *
   * `expanded` is the default because it is MD3's own answer: the specification
   * gives a standard navigation drawer to an expanded window and puts the same
   * destinations behind a modal drawer below one.
   * @default 'expanded'
   */
  collapseBelow?: MPPageCollapse;
  /**
   * Whether the leading sidebar's drawer is open. Use with
   * `onSidebarOpenChange` for a controlled layout — a route change that should
   * close the drawer behind it, a state the application already holds.
   */
  sidebarOpen?: boolean;
  /**
   * Which state it starts in.
   * @default false
   */
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /** The same three for the trailing sidebar. */
  endSidebarOpen?: boolean;
  /** @default false */
  defaultEndSidebarOpen?: boolean;
  onEndSidebarOpenChange?: (open: boolean) => void;
  /**
   * Puts a "Skip to content" link first in the document, drawn only while it
   * holds the focus.
   *
   * On by default, and the one thing here that is not a style decision. A
   * keyboard reader arriving on a page whose navigation holds forty links has to
   * walk past all forty on every page before reaching the article; this is the
   * one link that spares them, and it costs a sighted reader nothing because it
   * is invisible until it is tabbed to.
   * @default true
   */
  skipLink?: boolean;
  /** What that link says. Defaults to the word for it in `locale`. */
  skipLabel?: string;
  /**
   * The `id` the skip link jumps to, put on the `<main>`.
   * @default 'main'
   */
  mainId?: string;
  /** Anything else the `<main>` needs — a `className`, an `aria-label`. */
  mainProps?: Omit<React.ComponentPropsWithoutRef<'main'>, 'id' | 'children'>;
  /**
   * Which language the layout's own words are in. Falls back to the nearest
   * `MPLocaleProvider`, then to English. Inherited by every sidebar and trigger
   * inside it, so it is written once per page.
   */
  locale?: string;
  /** The page. Rendered inside the `<main>`. */
  children?: React.ReactNode;
}

/** The two slots whose height something else has to start below. */
const SLOTS: readonly MPPageSlot[] = ['header', 'footer'];

/**
 * A length, or `undefined` for the two named heights that are classes instead.
 * A number is pixels, the way every length in this library is.
 */
function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * The skeleton a page is hung on: a header, a footer, one sidebar or two, and
 * the content between them.
 *
 * What it is really for is the **landmarks**. A page assembled out of divs is a
 * page a screen reader offers as one undifferentiated region and a crawler reads
 * as one undifferentiated blob; the same page built out of `<header>`, `<nav>`,
 * `<aside>`, `<main>` and `<footer>` has a table of contents. Those tags come
 * from the components this one arranges — it contributes exactly one element of
 * its own, plus the `<main>` and the link that jumps to it.
 *
 * ## The arrangement is CSS, and that is the design
 *
 * Everything that decides where a column goes is flexbox and a media query, so
 * the layout is right in the first frame the browser paints and right on a page
 * whose JavaScript never arrives. The only things measured are the header's and
 * the footer's heights, and only because a column that holds its place has to
 * start below a bar whose height nobody but the bar knows.
 *
 * ## Why it draws no gutter and no measure
 *
 * That is [MPContainer](./container)'s job, and a layout that also did it would
 * be a second spelling of one idea. Put a container inside the `<main>`, where a
 * page can hold a full-width dashboard on one route and a 600dp article on the
 * next.
 *
 * ## Why it takes no surface
 *
 * No `variant`, no `color`, no shadow, for [MPContainer](./container)'s reason:
 * the outermost element on a page is the one thing that must not decide what the
 * page looks like. The bars and the columns paint themselves; between them is
 * whatever the application's own background is.
 */
export const MPPageLayout = React.forwardRef<HTMLDivElement, MPPageLayoutProps>(
  function MPPageLayout(
    {
      header,
      footer,
      sidebar,
      endSidebar,
      headerSpan = 'full',
      footerSpan = 'full',
      scroll = 'page',
      height = 'viewport',
      collapseBelow = 'expanded',
      sidebarOpen,
      defaultSidebarOpen = false,
      onSidebarOpenChange,
      endSidebarOpen,
      defaultEndSidebarOpen = false,
      onEndSidebarOpenChange,
      skipLink = true,
      skipLabel,
      mainId = 'main',
      mainProps,
      locale: localeProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const locale = useMPLocale(localeProp);
    const messages = useMPMessages(LAYOUT, locale);

    const [ownStart, setOwnStart] = React.useState(defaultSidebarOpen);
    const [ownEnd, setOwnEnd] = React.useState(defaultEndSidebarOpen);

    const open = React.useMemo(
      () => ({ start: sidebarOpen ?? ownStart, end: endSidebarOpen ?? ownEnd }),
      [sidebarOpen, ownStart, endSidebarOpen, ownEnd]
    );

    const setOpen = React.useCallback(
      (side: MPSidebarSide, next: boolean) => {
        if (side === 'start') {
          if (sidebarOpen === undefined) {
            setOwnStart(next);
          }

          onSidebarOpenChange?.(next);

          return;
        }

        if (endSidebarOpen === undefined) {
          setOwnEnd(next);
        }

        onEndSidebarOpenChange?.(next);
      },
      [sidebarOpen, endSidebarOpen, onSidebarOpenChange, onEndSidebarOpenChange]
    );

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const slotsRef = React.useRef<Record<MPPageSlot, HTMLElement | null>>({
      header: null,
      footer: null
    });
    const observerRef = React.useRef<ResizeObserver | null>(null);

    /**
     * Writes what the bars take out of the window onto the root, two custom
     * properties each.
     *
     * Two rather than one because a bar takes two different things away
     * depending on how it is positioned, and the page and a column need opposite
     * halves of it. A `sticky` bar is still in the flow, so nothing has to be
     * reserved for it — but it is permanently across the top of the window, so a
     * column that holds its place has to start below it. A `fixed` bar is out of
     * the flow, so the page *does* have to reserve its height, and it is across
     * the top as well.
     *
     * Which of the two a bar is is read off the element rather than plumbed
     * through a prop: the bar already knows, `position` is what it knows it as,
     * and asking is one line.
     *
     * Written straight to the DOM rather than held in state. Nothing in the tree
     * depends on the numbers except a handful of CSS declarations, and a
     * `setState` here would re-render the whole page on every resize.
     */
    const measure = React.useCallback(() => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      for (const slot of SLOTS) {
        const node = slotsRef.current[slot];
        const span = slot === 'header' ? headerSpan : footerSpan;

        if (!node) {
          root.style.setProperty(`--_mp-layout-${slot}`, '0px');
          root.style.setProperty(`--_mp-layout-${slot}-inset`, '0px');
          continue;
        }

        const position = getComputedStyle(node).position;
        const extent = `${node.offsetHeight}px`;
        const pinned = position === 'sticky' || position === 'fixed';

        // A bar that only spans the content column has the sidebars *beside* it
        // rather than under it, so it takes nothing off the top of theirs.
        root.style.setProperty(`--_mp-layout-${slot}`, pinned && span === 'full' ? extent : '0px');
        root.style.setProperty(`--_mp-layout-${slot}-inset`, position === 'fixed' ? extent : '0px');
      }
    }, [headerSpan, footerSpan]);

    const observe = React.useCallback(() => {
      const observer = observerRef.current;

      if (observer) {
        observer.disconnect();

        for (const slot of SLOTS) {
          const node = slotsRef.current[slot];

          if (node) {
            observer.observe(node);
          }
        }
      }

      measure();
    }, [measure]);

    React.useEffect(() => {
      observerRef.current = new ResizeObserver(() => measure());
      observe();

      return () => {
        observerRef.current?.disconnect();
        observerRef.current = null;
      };
    }, [measure, observe]);

    const register = React.useCallback(
      (slot: MPPageSlot, node: HTMLElement | null) => {
        slotsRef.current[slot] = node;
        observe();
      },
      [observe]
    );

    const context = React.useMemo(
      () => ({ present: true, register, collapseBelow, open, setOpen, scroll, locale }),
      [register, collapseBelow, open, setOpen, scroll, locale]
    );

    const fills = scroll === 'content';

    // The two named heights are two class names; anything else is a length
    // nobody could have generated a class for.
    const extent = toLength(height === 'viewport' || height === 'auto' ? undefined : height);
    const extentClasses =
      extent !== undefined
        ? ''
        : height === 'auto'
          ? fills
            ? 'h-full'
            : 'min-h-full'
          : fills
            ? 'h-dvh'
            : 'min-h-dvh';

    const headerSlot = hasContent(header) ? header : null;
    const footerSlot = hasContent(footer) ? footer : null;

    return (
      <MPPageLayoutContext.Provider value={context}>
        <div
          ref={setRootRef}
          data-mp-scroll={scroll}
          className={[
            'mp-page-layout relative flex w-full flex-col',
            // The whole difference between a document and a workspace. A floor
            // lets the page grow and the window scroll it; an exact height with
            // the overflow taken away pins the layout down and hands the
            // scrolling to whichever region below asks for it.
            fills ? 'overflow-hidden' : '',
            extentClasses,
            headerSpan === 'full' ? '[padding-top:var(--_mp-layout-header-inset,0px)]' : '',
            footerSpan === 'full' ? '[padding-bottom:var(--_mp-layout-footer-inset,0px)]' : '',
            className ?? ''
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            extent === undefined
              ? style
              : { ...(fills ? { height: extent } : { minHeight: extent }), ...style }
          }
          {...props}
        >
          {skipLink ? (
            <a
              href={`#${mainId}`}
              // Clipped to a pixel until it is tabbed to, and a real button from
              // then on. Not `hidden`, which would take it off the accessibility
              // tree along with the screen and leave nothing for Tab to find in
              // the first place — the same trade `VISUALLY_HIDDEN` makes.
              className={[
                'mp-page-layout__skip absolute start-3 top-3 z-50 size-px overflow-hidden',
                'whitespace-nowrap [clip-path:inset(50%)]',
                'focus:size-auto focus:overflow-visible focus:[clip-path:none]',
                'focus:bg-mp-primary focus:text-mp-on-primary focus:rounded-mp-full',
                'focus:shadow-mp-2 focus:text-mp-label-large focus:px-4 focus:py-2.5',
                'focus:no-underline focus:outline-none'
              ].join(' ')}
            >
              {skipLabel ?? messages.skipToContent}
            </a>
          ) : null}

          {headerSpan === 'full' ? headerSlot : null}

          <div className={['flex w-full flex-1', fills ? 'min-h-0' : ''].filter(Boolean).join(' ')}>
            {hasContent(sidebar) ? (
              <MPSidebarSideContext.Provider value="start">{sidebar}</MPSidebarSideContext.Provider>
            ) : null}

            <div
              className={[
                'flex min-w-0 flex-1 flex-col',
                fills ? 'min-h-0' : '',
                headerSpan === 'content' ? '[padding-top:var(--_mp-layout-header-inset,0px)]' : '',
                footerSpan === 'content'
                  ? '[padding-bottom:var(--_mp-layout-footer-inset,0px)]'
                  : ''
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {headerSpan === 'content' ? headerSlot : null}

              <main
                {...mainProps}
                id={mainId}
                className={[
                  'mp-page-layout__main min-w-0 flex-1',
                  fills ? 'min-h-0 overflow-y-auto' : '',
                  mainProps?.className ?? ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {children}
              </main>

              {footerSpan === 'content' ? footerSlot : null}
            </div>

            {hasContent(endSidebar) ? (
              <MPSidebarSideContext.Provider value="end">
                {endSidebar}
              </MPSidebarSideContext.Provider>
            ) : null}
          </div>

          {footerSpan === 'full' ? footerSlot : null}
        </div>
      </MPPageLayoutContext.Provider>
    );
  }
);
