import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { ANCHOR } from '../../internal/messages/anchor';
import { CONTROL_TEXT } from '../../internal/scale';
import { useMPColor, useMPDensity, useMPSize } from '../../internal/config';
import type { MPColor, MPDensity, MPSize } from '../../types';

/** One heading in the list. */
export interface MPAnchorItem {
  /**
   * The fragment it points at — `#getting-started`. The `id` it names is what
   * the list watches, so a heading with no `id` cannot be tracked.
   */
  href: string;
  /** What the row says. */
  label: React.ReactNode;
  /**
   * How deep the heading sits, counted from `0`.
   *
   * Only the indent depends on it. The list itself stays flat, because a nested
   * `<ul>` inside a table of contents is announced as a list inside a list, and
   * a reader who has just been told there are twelve headings does not need to
   * be told again that four of them are their own list.
   * @default 0
   */
  depth?: number;
}

export interface MPAnchorProps extends Omit<
  React.ComponentPropsWithoutRef<'nav'>,
  'color' | 'children'
> {
  /** The headings, in the order they appear on the page. */
  items: readonly MPAnchorItem[];
  /**
   * Which row is marked, by its `href`. Given, the list stops watching the
   * scroll and says what it is told.
   */
  activeHref?: string | null;
  /** Called whenever the row the reader is in changes. */
  onActiveChange?: (href: string | null) => void;
  /**
   * How far below the top of the scrollport a heading counts as reached, in
   * pixels.
   *
   * Set it to the height of a sticky header, or the heading under the bar is
   * never the one marked: it has scrolled past the top of the page and is still
   * behind the header, so the reader is looking at the section before it.
   * @default 0
   */
  offset?: number;
  /**
   * What scrolls, when it is not the document. The element an `MPPageLayout`
   * with `scroll="content"` puts the page inside, for instance.
   */
  container?: React.RefObject<HTMLElement | null>;
  /**
   * Draws the rail down the leading edge, with the row the reader is in lit.
   * @default true
   */
  rail?: boolean;
  /** The size of a row's text, and how far one level of heading is set in. */
  size?: MPSize;
  /** Which accent family the marked row reads. @default 'primary' */
  color?: MPColor;
  /** Tightens the rows and nothing else. @default 0 */
  density?: MPDensity;
  /**
   * Which language the `<nav>` is named in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** The accessible name of the `<nav>`. Defaults to the wording in `locale`. */
  label?: string;
}

/**
 * A row's vertical padding, which is the only thing `density` moves here.
 *
 * Smaller than a list's, and deliberately: a table of contents is read down
 * rather than pointed at, so the rows want to sit close enough to be taken in as
 * one block. They still clear 24px at `md`, which is the smallest a row that
 * can be tapped is allowed to be.
 */
const PAD_Y: Record<MPSize, string> = {
  xs: 'py-1',
  sm: 'py-1',
  md: 'py-1.5',
  lg: 'py-2',
  xl: 'py-2.5'
};

/** The same track with the density steps taken out of it, 2px a face. */
const PAD_Y_DENSE: Record<MPSize, readonly [string, string, string]> = {
  xs: ['py-0.5', 'py-0.5', 'py-0.5'],
  sm: ['py-0.5', 'py-0.5', 'py-0.5'],
  md: ['py-1', 'py-0.5', 'py-0.5'],
  lg: ['py-1.5', 'py-1', 'py-0.5'],
  xl: ['py-2', 'py-1.5', 'py-1']
};

function padY(size: MPSize, density: MPDensity): string {
  return density === 0 ? PAD_Y[size] : PAD_Y_DENSE[size][-density - 1];
}

/** How far one level of heading is set in from the last, in pixels. */
const INDENT: Record<MPSize, number> = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16
};

/**
 * Which heading the reader is in.
 *
 * The last one whose top has passed the line, which is the only rule that reads
 * correctly while scrolling *up* as well as down. The bottom of the scroll is a
 * special case and has to be: the last heading on a page often has less content
 * under it than a viewport, so its top never reaches the line and it would
 * otherwise be the one section that can never be marked.
 */
function activeAt(
  items: readonly MPAnchorItem[],
  offset: number,
  container: HTMLElement | null
): string | null {
  const top = container ? container.getBoundingClientRect().top : 0;
  const line = top + offset + 1;
  let current: string | null = null;

  for (const item of items) {
    const target = document.getElementById(item.href.replace(/^#/, ''));

    if (target && target.getBoundingClientRect().top <= line) {
      current = item.href;
    }
  }

  const atEnd = container
    ? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
    : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  return atEnd && items.length > 0 ? items[items.length - 1].href : current;
}

/**
 * The headings of the page being read, with the one the reader is in marked.
 *
 * ```tsx
 * <MPAnchor
 *   items={[
 *     { href: '#install', label: 'Install' },
 *     { href: '#usage', label: 'Usage' },
 *     { href: '#options', label: 'Options', depth: 1 }
 *   ]}
 * />
 * ```
 *
 * ## It is a `<nav>` of real links
 *
 * Which is what makes it work before any of the tracking runs: the rows jump to
 * their headings with JavaScript turned off, they are in the link list a screen
 * reader can pull up, and a middle-click opens one in a tab. Watching the scroll
 * is added on top rather than being what holds it up.
 *
 * The marked row carries `aria-current="location"` rather than `"true"`. That
 * value means "where the reader is within a set of links", which is exactly what
 * a table of contents reports and is not what `"true"` — the current *page* —
 * says.
 *
 * ## The headings are given, not scraped
 *
 * `items` is a list the caller already has. Whatever produced the page — an MDX
 * pipeline, a CMS, a route's own frontmatter — knows its own headings and their
 * ids, and a component that went looking for `<h2>`s in the document would be
 * guessing at which of them were content and which were chrome.
 *
 * ## Nothing slides
 *
 * The rail's lit segment is a border on the row rather than a marker that
 * travels between rows. A thing moving under a reader who is already moving is
 * the one animation a table of contents should not have, and it is also the one
 * that cannot be got right — the marker and the scroll are answering the same
 * gesture at two different speeds.
 */
export const MPAnchor = React.forwardRef<HTMLElement, MPAnchorProps>(function MPAnchor(
  {
    items,
    activeHref,
    onActiveChange,
    offset = 0,
    container,
    rail = true,
    size: sizeProp,
    color: colorProp,
    density: densityProp,
    locale: localeProp,
    label,
    className,
    style,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const density = useMPDensity(densityProp);
  const messages = useMPMessages(ANCHOR, useMPLocale(localeProp));

  const [tracked, setTracked] = React.useState<string | null>(null);
  const controlled = activeHref !== undefined;
  const active = controlled ? activeHref : tracked;

  const notifyRef = React.useRef(onActiveChange);

  notifyRef.current = onActiveChange;

  /*
   * `items` is almost always an array literal, so it is a new value on every
   * render — depending on it directly would tear the listeners down and put them
   * back as fast as the page re-renders. What the effect actually reads is the
   * list of hrefs, and that is a string.
   */
  const itemsRef = React.useRef(items);

  itemsRef.current = items;

  const keys = items.map((item) => item.href).join(' ');

  React.useEffect(() => {
    if (controlled) {
      return;
    }

    const scroller: HTMLElement | Window = container?.current ?? window;
    let frame = 0;
    let last: string | null = null;

    const read = () => {
      frame = 0;

      const next = activeAt(itemsRef.current, offset, container?.current ?? null);

      if (next === last) {
        return;
      }

      last = next;
      setTracked(next);
      notifyRef.current?.(next);
    };

    // Coalesced to one read per frame. `scroll` fires faster than the screen
    // refreshes and every one of these reads is a layout measurement, so
    // answering each event is asking the browser to flush layout dozens of times
    // between two paints for an answer that can only change once.
    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(read);
      }
    };

    read();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }

      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [keys, offset, container, controlled]);

  return (
    <nav
      ref={ref}
      aria-label={label ?? messages.label}
      data-mp-size={size}
      className={['mp-anchor min-w-0', className ?? ''].filter(Boolean).join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      <ul
        className={[
          'mp-anchor__list m-0 flex list-none flex-col p-0',
          rail ? 'border-mp-outline-variant border-s' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {items.map((item) => (
          // The negative start margin is what puts a row's own border over the
          // rail's rather than beside it. Without it a lit row is two hairlines
          // wide and the whole column shifts by a pixel as the reader moves.
          <li key={item.href} className={rail ? '-ms-px' : undefined}>
            <a
              href={item.href}
              aria-current={active === item.href ? 'location' : undefined}
              className={[
                'mp-anchor__link block min-w-0 truncate no-underline',
                'text-mp-on-surface-variant hover:text-mp-on-surface',
                CONTROL_TEXT[size],
                padY(size, density),
                'transition-[color,border-color] duration-(--mp-sys-motion-duration-short4)',
                'ease-mp-standard motion-reduce:transition-none',
                'aria-[current=location]:text-(--_mp-accent) aria-[current=location]:font-medium',
                rail
                  ? 'border-s border-transparent ps-3 aria-[current=location]:border-(--_mp-accent)'
                  : '',
                'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:rounded-mp-xs focus-visible:outline-solid outline-none'
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                marginInlineStart: item.depth ? item.depth * INDENT[size] : undefined
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
