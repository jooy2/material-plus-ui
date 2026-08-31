import * as React from 'react';
import { MPDrawer } from '../drawer/MPDrawer';
import { pixelsIn } from '../../internal/length';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { LAYOUT } from '../../internal/messages/layout';
import {
  BAR_SURFACE,
  drawerSide,
  EXPANDED_ONLY,
  MPPageLayoutContext,
  MPSidebarSideContext,
  useMPCollapsed,
  type MPPageCollapse,
  type MPSidebarSide
} from '../../internal/page-layout';
import { SHEET_PAD_X, SHEET_PAD_Y } from '../../internal/scale';
import { useMPSize } from '../../internal/config';
import type { MPSize, MPVariant } from '../../types';

export type { MPPageCollapse, MPSidebarSide } from '../../internal/page-layout';

export interface MPSidebarProps extends Omit<React.ComponentPropsWithoutRef<'aside'>, 'title'> {
  /**
   * Which end of the band it takes. Logical rather than physical — `start` is
   * the left of an English page and the right of an Arabic one — because
   * navigation sits beside the text it belongs to in every writing direction.
   *
   * Inside an [MPPageLayout](./page-layout) this is already decided by which
   * slot the sidebar was handed to, and setting it again is only a way of
   * disagreeing with the layout.
   * @default 'start'
   */
  side?: MPSidebarSide;
  /**
   * How wide the column is — a number in pixels or any CSS length. Left out, it
   * is the width `size` implies.
   *
   * With `resizable` this is only the width the column *starts* at: a drag
   * writes over it, and the caller hears about it through `onResizeEnd`.
   */
  width?: number | string;
  /**
   * How narrow it may be dragged.
   * @default 160
   */
  minWidth?: number | string;
  /**
   * And how wide.
   * @default 480
   */
  maxWidth?: number | string;
  /**
   * Lets the reader drag the inner edge to change the column's width.
   *
   * Off by default. A sidebar that can be resized is a sidebar whose width is
   * the reader's to remember, so a caller who turns this on usually also wants
   * to store what `onResizeEnd` reports.
   * @default false
   */
  resizable?: boolean;
  /** Fires with the width in pixels while the edge is being dragged. */
  onResize?: (width: number) => void;
  /** Fires once, with the same number, when it is let go. */
  onResizeEnd?: (width: number) => void;
  /**
   * The window size class below which the column becomes a drawer, opened by an
   * [MPSidebarTrigger](#mpsidebartrigger). `none` keeps it a column at every
   * width.
   *
   * Defaults to the [MPPageLayout](./page-layout)'s own `collapseBelow`, and to
   * `none` outside one: a sidebar that collapsed with nothing on the page able
   * to bring it back would be a sidebar the reader has lost.
   */
  collapseBelow?: MPPageCollapse;
  /**
   * Whether the drawer is open. Only meaningful once the sidebar has collapsed;
   * a column is not opened, it is there.
   *
   * Inside an [MPPageLayout](./page-layout) the layout owns this — it is what a
   * trigger anywhere on the page talks to — so control it there rather than
   * here. `onOpenChange` still fires either way.
   */
  open?: boolean;
  /**
   * Which state it starts in, for an uncontrolled standalone sidebar.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the column holds its place while the page scrolls past it.
   *
   * On by default, and it costs nothing when it is not needed: with the page
   * scrolling it becomes a `sticky` column as tall as what is left of the window
   * under the header, and with only the content scrolling it is already as tall
   * as the layout and this changes nothing.
   * @default true
   */
  sticky?: boolean;
  /**
   * The heading, drawn only while the sidebar is a drawer.
   *
   * A column has the page around it to say what it is. A panel that has covered
   * the page does not, and a dialog with no heading has no accessible name — so
   * without one the drawer falls back to `label`, and then to the word for
   * "sidebar" in `locale`.
   */
  title?: React.ReactNode;
  /**
   * How much surface the column paints, on the **container** ladder — a sidebar
   * is never dyed, because what sits on it arrives with colours of its own.
   *
   * `outlined` is the default: the page's own surface, with a hairline down the
   * edge that faces the content. That is the column *in the layout*. Once it has
   * collapsed it is an [MPDrawer](./drawer), which paints MD3's own navigation
   * drawer surface and takes no weight from here.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The column's default width and the air around its content. `md` is 360px,
   * which is MD3's own navigation drawer and the same rung
   * [MPDrawer](./drawer) is drawn at.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * The gutter, and the air above and below the content.
   * @default true
   */
  padded?: boolean;
  /**
   * The name the region is announced by.
   *
   * Every `<aside>` on a page should have one, and a page with two sidebars
   * *must*, or a screen reader offers two regions called "complementary".
   * Defaults to the word for "sidebar" in `locale`.
   */
  label?: string;
  /**
   * Which language the sidebar's own words are in. Falls back to the
   * [MPPageLayout](./page-layout)'s, then to the nearest `MPLocaleProvider`,
   * then to English.
   */
  locale?: string;
  /** Everything in it: a nav, a filter panel, a table of contents. */
  children?: React.ReactNode;
}

/**
 * The default width, as raw lengths rather than as `w-*` classes.
 *
 * A width that can be dragged has to live in a custom property, because a drag
 * writes a number no class name could have been generated for — the same split
 * `MPGrid` makes for a column count, and for the same reason.
 *
 * The numbers are [MPDrawer](./drawer)'s ladder to the pixel, so a sidebar is
 * exactly as wide as the drawer it becomes: `md` is MD3's own 360dp navigation
 * drawer, and the rest of the rungs follow it.
 */
const WIDTH: Record<MPSize, string> = {
  xs: '15rem',
  sm: '18rem',
  md: '22.5rem',
  lg: '26rem',
  xl: '30rem'
};

/** How far one arrow key press moves the edge. */
const KEYBOARD_STEP = 16;

/**
 * A bound in pixels, or the default when it was written in something this cannot
 * read.
 *
 * A bare number is pixels here, which is the library's rule everywhere — and is
 * the one thing that differs from `MPPanes`, where a bare number is a
 * *percentage* because that is how a split is described. The units they share
 * are parsed by `pixelsIn`.
 *
 * A percentage is measured against the window, which is what a sidebar's width
 * is a share of.
 */
function toPixels(value: number | string | undefined, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'number') {
    return value;
  }

  return pixelsIn(value, typeof window === 'undefined' ? undefined : window.innerWidth) ?? fallback;
}

/**
 * A column beside the page's content, and a drawer once the window is too narrow
 * to hold one.
 *
 * Two presentations of one panel, which is exactly the distinction MD3 draws:
 * the **standard** navigation drawer is part of the layout and the content is
 * laid out around it, and below an expanded window the same destinations arrive
 * as a **modal** drawer over a scrim. They are one component here because they
 * are one thing — a caller should not have to swap components at a breakpoint —
 * and because the children exist once either way, so nothing inside is put into
 * the document twice for a screen reader to read twice.
 *
 * A real `<aside>`, which is the `complementary` landmark: the region a screen
 * reader offers as "related to the page but not the page", and what a crawler
 * reads as navigation chrome rather than as the article.
 *
 * ## Which of the two is showing is answered twice, on purpose
 *
 * In CSS for the first paint, and in JavaScript from then on.
 *
 * The markup a server sends is the **column**, because a collapsed sidebar is a
 * drawer, a modal drawer is a portal into `document.body`, and there is no body
 * to portal into while the markup is being rendered. So a narrow screen would
 * draw a full-width sidebar and throw it away a moment later — the class that
 * hides the column below the breakpoint is what stops that, and `matchMedia` is
 * what decides, once there is a window to ask, that the drawer should exist at
 * all.
 */
export const MPSidebar = React.forwardRef<HTMLElement, MPSidebarProps>(function MPSidebar(
  {
    side: sideProp,
    width: widthProp,
    minWidth = 160,
    maxWidth = 480,
    resizable = false,
    onResize,
    onResizeEnd,
    collapseBelow: collapseBelowProp,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    sticky = true,
    title,
    variant = 'outlined',
    size: sizeProp,
    padded = true,
    label,
    locale: localeProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const layout = React.useContext(MPPageLayoutContext);
  const slotSide = React.useContext(MPSidebarSideContext);
  const side = sideProp ?? slotSide ?? 'start';
  const locale = useMPLocale(localeProp ?? layout.locale);
  const messages = useMPMessages(LAYOUT, locale);

  const collapseBelow = collapseBelowProp ?? (layout.present ? layout.collapseBelow : 'none');
  const collapsed = useMPCollapsed(collapseBelow);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : layout.present ? layout.open[side] : uncontrolledOpen;

  const changeOpen = (next: boolean) => {
    if (!controlled) {
      if (layout.present) {
        layout.setOpen(side, next);
      } else {
        setUncontrolledOpen(next);
      }
    }

    onOpenChange?.(next);
  };

  const declared =
    widthProp === undefined
      ? WIDTH[size]
      : typeof widthProp === 'number'
        ? `${widthProp}px`
        : widthProp;

  /*
   * What a drag has put in force, and why React has to be told about it.
   *
   * `applyWidth` writes the custom property straight onto the element, which is
   * the whole reason a drag costs no renders. The same property is also declared
   * in the `style` below, and the two disagreed the moment a drag happened: what
   * kept the column from snapping back was only that React skips a style key
   * whose *virtual* value has not changed, so it never looked at the one the
   * drag had rewritten. That is a real guarantee and an accidental one to be
   * resting a gesture on — the declaration React makes should say what is on the
   * element.
   *
   * Writing it down also settles the case the accident got wrong: a caller who
   * changes `width` mid-session used to be at the mercy of whether anything else
   * in the object had moved.
   *
   * A ref rather than state, because a render per pointer move is exactly what
   * this was avoiding. It is read during render, which is safe here for a narrow
   * reason: it holds what is already on the element, so the write React makes
   * from it is a write of the value that is there.
   */
  const dragged = React.useRef<string | null>(null);
  const lastDeclared = React.useRef(declared);
  const handleRef = React.useRef<HTMLDivElement | null>(null);
  const bodyId = React.useId();

  /*
   * A `width` the caller changed is an instruction, and it outranks a drag: a
   * sidebar told to be 320px is 320px, whatever it was last dragged to. Compared
   * during render rather than in an effect, so the answer is right in the paint
   * the new prop arrives in rather than one frame later.
   */
  if (lastDeclared.current !== declared) {
    lastDeclared.current = declared;
    dragged.current = null;
  }

  const width = dragged.current ?? declared;

  const rootRef = React.useRef<HTMLElement | null>(null);
  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  /**
   * A drag writes the width straight onto the element rather than into state.
   *
   * Nothing in the tree depends on the number except one CSS declaration, and a
   * `setState` per pointer move would re-render every row in the sidebar to
   * change it. The caller still hears every step through `onResize`.
   */
  const teardownRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => teardownRef.current?.(), []);

  const applyWidth = (pixels: number) => {
    const node = rootRef.current;

    if (!node) {
      return pixels;
    }

    const sized = Math.min(
      toPixels(maxWidth, 480),
      Math.max(toPixels(minWidth, 160), Math.round(pixels))
    );

    dragged.current = `${sized}px`;
    node.style.setProperty('--_mp-sidebar-width', dragged.current);
    // Beside the width and for the same reason: what a screen reader reads back
    // has to be what the column is, and a state update per pointer move is what
    // this path exists to avoid.
    handleRef.current?.setAttribute('aria-valuenow', String(sized));

    return sized;
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = rootRef.current;

    if (!node || event.button !== 0) {
      return;
    }

    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    handle.dataset.dragging = 'true';

    // The prefixed property, for `MPPanes`' reason: WebKit has no `userSelect`
    // on a style declaration, so the unprefixed form changes nothing and Safari
    // selects text through the whole drag.
    const selection = document.body.style.getPropertyValue('-webkit-user-select');
    document.body.style.setProperty('-webkit-user-select', 'none');

    const origin = event.clientX;
    const start = node.getBoundingClientRect().width;
    // Positive is always "wider", so a drag under RTL — where the leading edge
    // is on the right — moves the edge the way the pointer went rather than the
    // way the axis is numbered.
    const rtl = getComputedStyle(node).direction === 'rtl';
    const outwards = (side === 'start') === rtl ? -1 : 1;

    let latest = start;

    const move = (moveEvent: PointerEvent) => {
      latest = applyWidth(start + (moveEvent.clientX - origin) * outwards);
      onResize?.(latest);
    };

    const release = () => {
      teardownRef.current = null;
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      delete handle.dataset.dragging;

      if (selection) {
        document.body.style.setProperty('-webkit-user-select', selection);
      } else {
        document.body.style.removeProperty('-webkit-user-select');
      }
    };

    const end = () => {
      release();
      onResizeEnd?.(latest);
    };

    teardownRef.current = release;
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  const nudge = (pixels: number) => {
    const node = rootRef.current;

    if (!node) {
      return;
    }

    const next = applyWidth(node.getBoundingClientRect().width + pixels);
    onResize?.(next);
    // A key press is a whole gesture on its own — there is no "let go" to wait
    // for, so the settled callback fires with it.
    onResizeEnd?.(next);
  };

  if (collapsed) {
    return (
      <MPDrawer
        side={drawerSide(side)}
        mode="modal"
        open={open}
        onOpenChange={changeOpen}
        // A dialog with no heading has no accessible name, and this one has
        // covered the page — so it always has one, even when the column it was
        // did not need to say what it is.
        title={title ?? label ?? messages.sidebar}
        size={size}
        locale={locale}
        // An explicit width is the caller's decision and survives the change of
        // shape; the default one does not, because a column sized against the
        // article beside it and a panel sized against a phone are two different
        // numbers — and the drawer's own ladder already knows the second.
        extent={widthProp === undefined ? undefined : width}
        className={className}
        style={style}
      >
        {children}
      </MPDrawer>
    );
  }

  return (
    <aside
      ref={setRootRef}
      aria-label={label ?? messages.sidebar}
      data-mp-size={size}
      data-mp-variant={variant}
      data-mp-side={side}
      className={[
        'mp-sidebar text-mp-on-surface relative box-border flex min-w-0 shrink-0 flex-col',
        'w-(--_mp-sidebar-width)',
        BAR_SURFACE[variant],
        // The inner edge only. The outer one is against the window, where there
        // is nothing on the other side of it to be separated from — the same
        // single-edge rule `MPHeader` and `MPDrawer` draw.
        variant === 'outlined'
          ? `border-mp-outline-variant ${side === 'start' ? 'border-e' : 'border-s'}`
          : '',
        layout.scroll === 'content'
          ? 'h-full'
          : sticky
            ? [
                'self-start sticky [top:var(--_mp-layout-header,0px)]',
                /*
                 * The spaces around the minus signs are written out as `_`, and
                 * they are load-bearing. Tailwind normalises the operators in a
                 * `calc()` it has to space itself, and doing that to
                 * `100dvh-var(--_mp-…)` puts a space after the leading `--` as
                 * well — so the property becomes `-- mp-layout-header`, the
                 * declaration is invalid, and the column silently keeps its
                 * whole-window height. Spacing it here leaves nothing to
                 * normalise.
                 */
                '[height:calc(100dvh_-_var(--_mp-layout-header,0px)_-_var(--_mp-layout-footer,0px))]'
              ].join(' ')
            : '',
        // What holds the first paint together: the server has no window to
        // measure, so it sends the column, and this is what keeps that column
        // off a screen too narrow for it until `matchMedia` says the same thing.
        EXPANDED_ONLY[collapseBelow],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--_mp-sidebar-width': width, ...style } as React.CSSProperties}
      {...props}
    >
      <div
        id={bodyId}
        className={[
          'mp-sidebar__body min-h-0 flex-1 overflow-y-auto overscroll-contain',
          padded ? `${SHEET_PAD_X[size]} ${SHEET_PAD_Y[size]}` : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>

      {resizable ? (
        <div
          ref={handleRef}
          role="separator"
          aria-orientation="vertical"
          aria-label={messages.resizeSidebar}
          /*
           * The three numbers a focusable `separator` is the window-splitter
           * pattern rather than a decoration, and the region they are about.
           *
           * Without them a screen reader announces a separator with nothing to
           * say — the reader can move it and cannot hear where it went, which is
           * the one thing the control is for. `MPPanes` publishes all four on its
           * own handles; this had none, on the same gesture.
           *
           * Pixels rather than a percentage, because pixels are what the bounds
           * are written in and what a drag is clamped to. `applyWidth` keeps
           * `aria-valuenow` in step as the handle moves, for the reason it writes
           * the width straight to the element: a render per pointer move is what
           * this whole path avoids.
           */
          aria-valuemin={Math.round(toPixels(minWidth, 160))}
          aria-valuemax={Math.round(toPixels(maxWidth, 480))}
          aria-valuenow={Math.round(toPixels(width, toPixels(WIDTH[size], 360)))}
          aria-controls={bodyId}
          tabIndex={0}
          className={[
            // Straddling the edge rather than sitting inside it: a hairline one
            // pixel wide is a target one pixel wide, which is not a target. The
            // same split between what is drawn and what can be grabbed that
            // `MPPanes` makes.
            'mp-sidebar__handle absolute inset-y-0 z-1 w-2 cursor-col-resize bg-transparent',
            side === 'start' ? '-me-1 end-0' : '-ms-1 start-0',
            'hover:bg-mp-outline-variant data-dragging:bg-mp-outline-variant',
            'transition-colors duration-(--mp-sys-motion-duration-short4)',
            'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-0',
            'focus-visible:outline-solid outline-none'
          ].join(' ')}
          onPointerDown={beginDrag}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
              return;
            }

            event.preventDefault();

            const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
            const outwards = (side === 'start') === rtl ? -1 : 1;

            nudge((event.key === 'ArrowRight' ? KEYBOARD_STEP : -KEYBOARD_STEP) * outwards);
          }}
        />
      ) : null}
    </aside>
  );
});
