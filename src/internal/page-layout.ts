/**
 * The vocabulary a page's skeleton is written in, and the context the parts of
 * one share.
 *
 * Five components read this — `MPPageLayout`, `MPHeader`, `MPFooter`,
 * `MPSidebar` and `MPSidebarTrigger` — and every one of them also works on its
 * own. That is the whole reason it is a module in `internal/` rather than
 * something `MPPageLayout` exports: a header that imported the layout would pull
 * a skeleton into the bundle of every page that only wanted a bar.
 *
 * Nothing here draws. The arrangement itself is flexbox and media queries,
 * which CSS states better than JavaScript can and states in the first frame the
 * browser paints; what needs a context is the handful of facts a slot cannot
 * work out from where it sits — how wide the window has to be before a sidebar
 * stops being a column, whether a drawer is open, and how tall the bars are.
 */
import * as React from 'react';
import { below } from './window-class';
import type { MPSide, MPVariant, MPWindowClass } from '../types';

/**
 * Which end of the band a sidebar takes.
 *
 * Logical, for the reason `MPAlign` gives: the navigation of an Arabic page is
 * down its right-hand side, and a column pinned `left` would cross the text to
 * get there.
 */
export type MPSidebarSide = 'start' | 'end';

/** The two slots a layout measures, because a sidebar has to start below them. */
export type MPPageSlot = 'header' | 'footer';

/**
 * How far across the top and the bottom bars reach.
 *
 * - `full` — the whole width, with the sidebars beginning underneath. The
 *   arrangement of a website: one bar across the top, and the page below it.
 * - `content` — only the column between the sidebars, which run the full height
 *   of the window beside it. The arrangement of an application, and MD3's own
 *   drawing of a standard navigation drawer: the drawer is the outermost thing
 *   on the screen and the app bar belongs to the pane it is over.
 *
 * There is no third value because there is no third arrangement — what is being
 * decided is which of the two takes the corner.
 */
export type MPPageSpan = 'full' | 'content';

/**
 * What scrolls.
 *
 * - `page` — the document does, the way a website does. The bars hold their
 *   place with `position: sticky`, a phone's address bar still hides on the way
 *   down, and the browser restores the scroll position on a back navigation.
 *   The default, and what almost every page wants.
 * - `content` — the layout is exactly the height of the window and only the
 *   region between the bars scrolls, the way an application does. Reach for it
 *   when the page is a workspace rather than a document.
 */
export type MPPageScroll = 'page' | 'content';

/**
 * The window size class below which a sidebar stops being a column.
 *
 * **MD3's own ladder, and MD3's own answer.** The specification does not offer
 * a standard navigation drawer at every width: a drawer that is part of the
 * layout is what an *expanded* window gets, and a compact one gets the same
 * destinations behind a modal drawer. So this is `MPWindowClass` rather than a
 * set of pixel widths — see `src/types.ts` for why the library measures windows
 * in the specification's classes rather than in Tailwind's breakpoints.
 *
 * `compact` is accepted and means the same as `none`: its floor is zero, so
 * there is no window below it and a sidebar that collapsed there would never
 * collapse.
 */
export type MPPageCollapse = MPWindowClass | 'none';

export interface MPPageLayoutContextValue {
  /**
   * Whether there is an `MPPageLayout` above at all.
   *
   * A header, a footer and a sidebar each render perfectly well without one —
   * they are a bar, a bar and a panel. What they cannot do alone is agree with
   * each other about where they sit, which is the whole of what the layout adds
   * and the reason a part has to be able to tell.
   */
  present: boolean;
  /**
   * Hands the layout the element filling one of its slots.
   *
   * The layout measures it and writes the height onto its own root as a custom
   * property, because a column that holds its place has to start below a bar
   * whose height only the bar knows. A callback rather than a `querySelector`,
   * so a header rendered through `render={<MyBar />}` is found as reliably as
   * one that is not.
   */
  register: (slot: MPPageSlot, node: HTMLElement | null) => void;
  /** Where the sidebars stop being columns. */
  collapseBelow: MPPageCollapse;
  /** Whether each sidebar's drawer is open. Only meaningful once it collapsed. */
  open: Record<MPSidebarSide, boolean>;
  setOpen: (side: MPSidebarSide, open: boolean) => void;
  /** How the page scrolls, which decides how a column holds its place. */
  scroll: MPPageScroll;
  /** The language the layout's own words are in. */
  locale?: string;
}

export const MPPageLayoutContext = React.createContext<MPPageLayoutContextValue>({
  present: false,
  register: () => {},
  collapseBelow: 'none',
  open: { start: false, end: false },
  setOpen: () => {},
  scroll: 'page'
});

/**
 * Which end of the band the sidebar being rendered right now takes.
 *
 * A second, one-value context rather than a field on the one above, because it
 * is the one fact that differs *between* two sidebars in the same layout: the
 * layout wraps each slot in its own provider, so a sidebar handed to the
 * trailing slot needs no `side` prop of its own. `null` is "nobody said", which
 * a standalone sidebar reads as `start`.
 */
export const MPSidebarSideContext = React.createContext<MPSidebarSide | null>(null);

/**
 * Whether the window is under the class a sidebar collapses at, as a query.
 *
 * Asked of `window-class.ts` rather than written out, which is the whole of the
 * change: these were four literal widths, and four literal widths beside the
 * four in the stylesheet and the four in `WINDOW_MIN` is three chances for a
 * sidebar to collapse at a width the grid does not reflow at.
 *
 * `none` and `compact` have nothing to watch — a sidebar that collapsed below
 * zero would never collapse — so both are `null` and `useMPCollapsed` reads that
 * as "no".
 */
const COLLAPSE_QUERY: Record<MPPageCollapse, string | null> = {
  none: null,
  compact: below('compact'),
  medium: below('medium'),
  expanded: below('expanded'),
  large: below('large'),
  'extra-large': below('extra-large')
};

/**
 * The same four widths as classes, for the part of this that is decided in CSS
 * rather than in JavaScript.
 *
 * `COLLAPSED_ONLY` hides something from the breakpoint *up*, which is what a
 * sidebar's own trigger wants: the button exists exactly while the column does
 * not. `EXPANDED_ONLY` hides it below, which is what the column wants for the
 * one paint between the server's markup arriving and JavaScript finding out how
 * wide the window is — without it a phone draws a full-width sidebar and throws
 * it away a moment later.
 *
 * Written out per class because Tailwind finds classes by scanning source text:
 * an interpolated `max-[${width}px]:hidden` generates no rule at all.
 */
export const COLLAPSED_ONLY: Record<MPPageCollapse, string> = {
  none: 'hidden',
  compact: 'hidden',
  medium: 'min-[600px]:hidden',
  expanded: 'min-[840px]:hidden',
  large: 'min-[1200px]:hidden',
  'extra-large': 'min-[1600px]:hidden'
};

export const EXPANDED_ONLY: Record<MPPageCollapse, string> = {
  none: '',
  compact: '',
  medium: 'max-[600px]:hidden',
  expanded: 'max-[840px]:hidden',
  large: 'max-[1200px]:hidden',
  'extra-large': 'max-[1600px]:hidden'
};

/**
 * Whether the window is currently narrower than the class a sidebar collapses
 * at.
 *
 * `useSyncExternalStore` rather than an effect and a `useState`, for the one
 * reason that decides it: the hook has a *server snapshot*, and the server's
 * answer has to be "not collapsed". A collapsed sidebar is an `MPDrawer`, a
 * modal drawer is a portal into `document.body`, and there is no body to portal
 * into while the markup is being rendered. So what ships is the column, and the
 * classes above are what keep that column off a narrow screen until this can
 * say otherwise.
 */
export function useMPCollapsed(collapseBelow: MPPageCollapse): boolean {
  const query = COLLAPSE_QUERY[collapseBelow];

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!query || typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }

      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);

      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );

  const snapshot = React.useCallback(() => {
    if (!query || typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(query).matches;
  }, [query]);

  return React.useSyncExternalStore(subscribe, snapshot, () => false);
}

/**
 * `start` and `end` translated into the physical edge an `MPDrawer` is attached
 * to.
 *
 * A sidebar names the end of the band it takes, because that is a layout
 * question and a layout flips under RTL on its own. A drawer names an edge of
 * the *window*, which `MPSide` spells physically for the reason it gives: a
 * panel along the top is along the top in every writing direction. So the two
 * have to be translated, and the document's own direction is the translator.
 *
 * Read during render, which is safe here for a narrower reason than it looks:
 * the only caller is a sidebar that has already collapsed, and collapsing is a
 * client-side answer. There is no server render of this to disagree with.
 *
 * The reading is `document.dir` rather than a computed style, and that is the
 * whole of the difference between a lookup and a layout. `getComputedStyle`
 * flushes pending style — during render, on every render of a collapsed sidebar,
 * for one of two answers. `dir` is an attribute, and reading it costs nothing.
 *
 * What it gives up is a direction set in CSS rather than in the markup, which
 * `direction: rtl` on a stylesheet's `:root` would be. That is a real
 * arrangement and a rare one, and the fallback is the right way round for it:
 * the document element's `dir` is what an RTL page sets, and the drawer's own
 * contents flip on their own either way. What is decided here is only which edge
 * the panel is attached to.
 */
export function drawerSide(side: MPSidebarSide): MPSide {
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  if (side === 'start') {
    return rtl ? 'right' : 'left';
  }

  return rtl ? 'left' : 'right';
}

/**
 * The five weights, said the way a **bar** says them.
 *
 * Almost `CONTAINER_SURFACE`, and the one difference is the whole reason this
 * table exists: a box's `outlined` is a hairline all the way round, and a bar
 * has only one edge that anything is on the other side of. So `outlined` here
 * paints the page's own `surface` and leaves the rule to the component, which
 * knows which edge faces the content — the same split `MPDrawer` makes with its
 * per-side `EDGE` table.
 *
 * `outlined` is also MD3's flat top app bar exactly: a `surface` container, with
 * a line rather than a change of tone marking where it ends. `tonal` is the
 * specification's *scrolled* app bar — `surface-container` against the page's
 * `surface` — which is why it is what a bar defaults to.
 */
export const BAR_SURFACE: Record<MPVariant, string> = {
  filled: 'bg-mp-surface-container-highest',
  tonal: 'bg-mp-surface-container',
  elevated: 'shadow-mp-2 bg-mp-surface-container-low',
  outlined: 'bg-mp-surface',
  text: 'bg-transparent'
};
