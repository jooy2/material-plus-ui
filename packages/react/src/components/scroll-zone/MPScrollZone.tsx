import * as React from 'react';
import { MPIconButton } from '../icon-button/MPIconButton';
import { MPIcon } from '../icon/MPIcon';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { cssLength } from '../../internal/length';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { SCROLL } from '../../internal/messages/scroll';
import { CONTROL_ICON } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPOrientation, MPSize, MPVariant } from '../../types';

/**
 * When the two scroll buttons are drawn.
 *
 * - `auto` — neither while everything fits, and at an end whichever costs less.
 *   An `overlay` button with nowhere to go is removed, an `inline` one is drawn
 *   `disabled`. The default.
 * - `always` — both, from the first paint, `disabled` rather than gone at an
 *   end. What a strip whose content arrives from a fetch wants, so the buttons
 *   are not appearing under the pointer half a second in.
 * - `none` — none at all. The wheel, a finger, a drag and the arrow keys are
 *   all still there; this is the strip that scrolls the way a phone scrolls.
 */
export type MPScrollZoneButtons = 'auto' | 'always' | 'none';

/**
 * Where those buttons sit, which is also where the strip ends.
 *
 * - `inline` — beside the strip, in the layout. The default. The scroller stops
 *   where the button starts, so an item is cut off at the button's edge rather
 *   than sliding under it: nothing is ever half-hidden behind a control.
 * - `overlay` — over the ends of the strip, which keeps every pixel of the box
 *   for content. What a shelf of pictures wants, where the thing under the
 *   button is a picture that carries on.
 *
 * The lane an `inline` button sits in is held open even while that button has
 * nowhere to go, or the strip would resize under the pointer each time it
 * reached an end. That is also what decides what `buttons="auto"` does there:
 * the lane is paid for either way, so an inline button stays and goes
 * `disabled`, while an overlay one — whose absence is free — is removed.
 */
export type MPScrollZoneButtonPlacement = 'inline' | 'overlay';

/**
 * What pressing one does.
 *
 * - `item` — moves to the next child along, `step` of them at a time. The
 *   default, and the only one that lands on something rather than between two
 *   things.
 * - `page` — moves by everything currently in view, the way Page Down does.
 * - `hold` — travels for as long as the button is held, at `speed` pixels a
 *   second. A press too short to be a hold moves one item instead, so the
 *   button is never dead to a quick tap.
 */
export type MPScrollZoneMode = 'item' | 'page' | 'hold';

/** How far an overlay button sits in from the edge it is held against. */
const BUTTON_INSET: Record<MPSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
  xl: 'p-4'
};

/** And the air between an inline button and the strip it flanks. */
const BUTTON_GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
  xl: 'gap-4'
};

/** How far a press has to travel before it stops being a click. */
const DRAG_THRESHOLD = 4;

/** Under this, a press in `hold` mode was a tap, and moves one item instead. */
const TAP_MS = 140;

/**
 * What one wheel notch is worth when the browser counts it in lines.
 *
 * Firefox reports a mouse wheel that way, three lines to a notch, and a line is
 * whatever the reader's text is. Sixteen pixels is the browser's own default
 * and near enough for a gesture that gets repeated until it looks right.
 */
const WHEEL_LINE = 16;

/** A reader who asked for less motion gets the cut rather than the travel. */
function scrollBehavior(): ScrollBehavior {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

export interface MPScrollZoneProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which way the children run, and so which way the zone scrolls.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * How many rows a horizontal zone lays its children out in before it starts a
   * new column, and how many columns a vertical one uses. `2` is the shelf that
   * holds twice as much in the same width.
   * @default 1
   */
  lines?: number;
  /**
   * The space between children. A number is pixels, a string is any CSS length.
   * @default 8
   */
  gap?: number | string;
  /** When the scroll buttons are drawn. @default 'auto' */
  buttons?: MPScrollZoneButtons;
  /**
   * Whether they sit beside the strip or over it.
   * @default 'inline'
   */
  buttonPlacement?: MPScrollZoneButtonPlacement;
  /** What pressing one does. @default 'item' */
  mode?: MPScrollZoneMode;
  /** How many children one press moves, in `item` mode. @default 1 */
  step?: number;
  /** How fast a held button travels, in pixels a second. @default 900 */
  speed?: number;
  /**
   * Snaps the nearest child to the leading edge when the scrolling stops. The
   * wheel and a drag included, not only the buttons.
   * @default false
   */
  snap?: boolean;
  /**
   * Lets a mouse or a pen drag the strip along, the way a finger already can.
   *
   * Touch is left to the browser, whose own scrolling beats anything a handler
   * can imitate: momentum, rubber-banding and the scrollbar all come with it.
   * @default true
   */
  drag?: boolean;
  /**
   * Turns a wheel rolled over the strip into travel along it — the one axis a
   * mouse has, on a strip that does not run along it.
   *
   * Off by default, because a wheel taken from the page is the page's: a reader
   * who meant to scroll past the shelf is held by it instead. What it does take
   * it gives back at the ends, so a strip with nothing left ahead of it is
   * something to scroll past rather than something to be caught in. A trackpad
   * swiping sideways is left alone, and a vertical zone ignores the prop —
   * there the wheel already points the way the strip runs.
   * @default false
   */
  wheel?: boolean;
  /** Shows the browser's own scrollbar under the strip. @default false */
  scrollbar?: boolean;
  /**
   * How the scroll buttons are drawn.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * The size of those buttons, and how far they sit from the strip. Not the
   * size of a child, which is whatever the caller made it.
   * @default 'md'
   */
  size?: MPSize;
  /** Which accent family they read. @default 'primary' */
  color?: MPColor;
  /** What the strip is called: "Categories", "Recent files". */
  label?: string;
  /** Defaults to the wording in `locale`. */
  previousLabel?: string;
  /** The same. */
  nextLabel?: string;
  /**
   * Which language the buttons name themselves in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** The strip. Every top-level child is one item of it. */
  children?: React.ReactNode;
}

/**
 * A strip of anything, laid out in one direction and scrolled in it.
 *
 * The mechanism is an ordinary scroll container, and everything the component
 * offers is a way of driving one. Swiping on a phone, two-finger dragging on a
 * trackpad, the arrow keys and the scrollbar are the browser's own and are never
 * intercepted. What is added on top is a pair of buttons for the pointer that
 * has neither a wheel nor a finger, a mouse drag for the strip that reads as
 * something to pull, and — only where it is asked for — the wheel turned onto
 * the axis the strip runs along.
 *
 * ```tsx
 * <MPScrollZone label="Categories">
 *   <MPChip>Coffee</MPChip>
 *   <MPChip>Tea</MPChip>
 * </MPScrollZone>
 * ```
 *
 * ## Nothing is transformed
 *
 * A translated track would have to argue for an exception to the rule the rest
 * of the library keeps; a scroll offset does not. It is also what makes the
 * strip run the other way under RTL without being told, keeps the scrollbar
 * honest, and lets the browser scroll a focused child into view on its own.
 *
 * ## What separates it from `MPCarousel`
 *
 * `lines`, and what it implies. A carousel is one thing at a time and knows
 * which one — it has a `value`, an index, and a row of marks saying where the
 * reader is. A scroll zone has none of those, because it is a shelf that
 * happens to be longer than the room it is in: there is no current item to
 * report, and two rows of thumbnails is a shape a carousel cannot hold.
 */
export const MPScrollZone = React.forwardRef<HTMLDivElement, MPScrollZoneProps>(
  function MPScrollZone(
    {
      orientation = 'horizontal',
      lines = 1,
      gap = 8,
      buttons = 'auto',
      buttonPlacement = 'inline',
      mode = 'item',
      step = 1,
      speed = 900,
      snap = false,
      drag = true,
      wheel = false,
      scrollbar = false,
      variant = 'filled',
      size: sizeProp,
      color: colorProp,
      label,
      previousLabel,
      nextLabel,
      locale: localeProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const color = useMPColor(colorProp);
    const messages = useMPMessages(SCROLL, useMPLocale(localeProp));

    const horizontal = orientation === 'horizontal';
    const rows = Math.max(1, Math.round(lines));
    const items = Math.max(1, Math.round(step));
    const inline = buttonPlacement === 'inline';

    const scrollerRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);

    /*
     * Whether there is anything left in each direction, held as one object so a
     * measurement that changed nothing costs no render.
     */
    const [reach, setReach] = React.useState({ back: false, forward: false });

    const measure = React.useCallback(() => {
      const el = scrollerRef.current;

      if (!el) {
        return;
      }

      const extent = horizontal ? el.clientWidth : el.clientHeight;
      const total = horizontal ? el.scrollWidth : el.scrollHeight;
      // `Math.abs`, because a right-to-left container counts its scroll position
      // backwards from zero. How far along we are is a distance either way.
      const along = Math.abs(horizontal ? el.scrollLeft : el.scrollTop);

      setReach((previous) => {
        // A pixel of slack at each end: both numbers are fractional on a scaled
        // display, and a strip pushed fully to one end reports something like
        // 205.6 against a room of 206 — which as a strict comparison is "there
        // is more this way" for ever, and a button that never goes `disabled`.
        const back = along > 1;
        const forward = total - extent - along > 1;

        return previous.back === back && previous.forward === forward
          ? previous
          : { back, forward };
      });
    }, [horizontal]);

    /*
     * Three things change what the buttons should say and only one of them is an
     * event: the strip being scrolled, the zone being resized, and the content
     * in it changing size. The observers cover the last two, including the case
     * that matters most — a zone that mounts inside a closed accordion or an
     * unselected tab and is zero wide until it is opened.
     */
    React.useEffect(() => {
      const el = scrollerRef.current;
      const track = trackRef.current;

      measure();

      if (!el || typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(measure);

      observer.observe(el);

      if (track) {
        observer.observe(track);
      }

      return () => observer.disconnect();
    }, [measure]);

    /** Which way "forward" points on the physical axis: flipped under RTL. */
    const forwardSign = React.useCallback(() => {
      const el = scrollerRef.current;

      if (!el || !horizontal) {
        return 1;
      }

      return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    }, [horizontal]);

    const travel = React.useCallback(
      (distance: number, smooth: boolean) => {
        const el = scrollerRef.current;

        if (!el) {
          return;
        }

        const behavior = smooth ? scrollBehavior() : 'auto';

        el.scrollBy(horizontal ? { left: distance, behavior } : { top: distance, behavior });
      },
      [horizontal]
    );

    /**
     * Where each child starts, measured from the leading edge of the viewport and
     * signed so that ahead is positive in both writing directions.
     *
     * Distinct offsets rather than one per child, which is what makes `lines`
     * work: four children stacked two by two are two columns, and one press of
     * next should move a whole column rather than half of one.
     */
    const itemStarts = React.useCallback(() => {
      const el = scrollerRef.current;
      const track = trackRef.current;

      if (!el || !track) {
        return [];
      }

      const rtl = horizontal && getComputedStyle(el).direction === 'rtl';
      const edge = horizontal ? (rtl ? 'right' : 'left') : 'top';
      const sign = rtl ? -1 : 1;
      const origin = el.getBoundingClientRect()[edge];
      const starts: number[] = [];

      for (const child of Array.from(track.children)) {
        const start = Math.round((child.getBoundingClientRect()[edge] - origin) * sign);

        if (!starts.includes(start)) {
          starts.push(start);
        }
      }

      return starts.sort((a, b) => a - b);
    }, [horizontal]);

    /** One press, in whichever unit `mode` counts in. */
    const advance = React.useCallback(
      (forward: boolean, unit: MPScrollZoneMode = mode) => {
        const el = scrollerRef.current;

        if (!el) {
          return;
        }

        const sign = forwardSign();
        const extent = horizontal ? el.clientWidth : el.clientHeight;

        if (unit === 'page') {
          travel(extent * (forward ? 1 : -1) * sign, true);

          return;
        }

        // An item, and it is measured rather than assumed: the children of a
        // scroll zone are whatever the caller put there, so no two of them are
        // necessarily the same width.
        const starts = itemStarts();
        const ahead = starts.filter((start) => start > 1);
        const behind = starts.filter((start) => start < -1);
        const target = forward ? ahead[items - 1] : behind[behind.length - items];

        if (target === undefined) {
          // Nothing that far along: go as far as there is. Without this the last
          // half-item of a strip would be unreachable by button.
          travel(extent * (forward ? 1 : -1) * sign, true);

          return;
        }

        travel(target * sign, true);
      },
      [forwardSign, horizontal, itemStarts, items, mode, travel]
    );

    /*
     * `hold` — a frame loop rather than an interval, so the strip travels at
     * `speed` pixels a second whatever the display is doing. The whole gesture is
     * torn down through one ref, because the `pointerup` that would normally end
     * it never arrives if the zone unmounts mid-press.
     */
    const holdRef = React.useRef<(() => void) | null>(null);

    React.useEffect(() => () => holdRef.current?.(), []);

    const beginHold = React.useCallback(
      (forward: boolean, stop: 'pointerup' | 'keyup') => {
        if (holdRef.current) {
          return;
        }

        const sign = forwardSign();
        const started = performance.now();
        let previous = started;
        let frame = 0;

        const tick = (now: number) => {
          const elapsed = now - previous;

          previous = now;
          travel(((speed * elapsed) / 1000) * (forward ? 1 : -1) * sign, false);
          frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        const release = () => {
          cancelAnimationFrame(frame);
          holdRef.current = null;
          window.removeEventListener(stop, release);
          window.removeEventListener('pointercancel', release);
          // A press released outside the browser window throws neither of the
          // two above, and a frame loop nobody can stop is the worst kind.
          window.removeEventListener('blur', release);

          // A press shorter than a hold was a click, and a click that scrolled
          // three pixels reads as a broken button.
          if (performance.now() - started < TAP_MS) {
            advance(forward, 'item');
          }
        };

        holdRef.current = release;
        window.addEventListener(stop, release);
        window.addEventListener('pointercancel', release);
        window.addEventListener('blur', release);
      },
      [advance, forwardSign, travel, speed]
    );

    /*
     * Dragging, for a mouse and a pen only. A finger already scrolls, and the
     * browser's own scrolling has momentum, rubber-banding and a scrollbar that
     * no handler reproduces.
     *
     * Nothing is taken at the press itself — not the pointer, not the selection.
     * A press on this strip is far more often a click on a card inside it, so
     * the capture waits until the pointer has moved past the threshold, which is
     * what keeps a plain click able to select text and focus what it landed on.
     */
    const dragRef = React.useRef<(() => void) | null>(null);

    React.useEffect(() => () => dragRef.current?.(), []);

    function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
      if (!drag || event.pointerType === 'touch' || event.button !== 0) {
        return;
      }

      // A press released outside the page never reaches the listeners below, so
      // the drag before this one is torn down here rather than never.
      dragRef.current?.();

      const el = event.currentTarget;
      const fromX = event.clientX;
      const fromY = event.clientY;
      const fromLeft = el.scrollLeft;
      const fromTop = el.scrollTop;
      let dragging = false;

      // Taken off the document for the length of the drag rather than fixed with
      // `preventDefault`, which would also stop the browser focusing what was
      // pressed. Written prefixed and through `setProperty`, because WebKit
      // implements only `-webkit-user-select`.
      const selection = document.body.style.getPropertyValue('-webkit-user-select');

      const move = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - fromX;
        const dy = moveEvent.clientY - fromY;

        if (!dragging) {
          if (Math.abs(horizontal ? dx : dy) < DRAG_THRESHOLD) {
            return;
          }

          dragging = true;

          /*
           * Capture keeps the strip following a pointer that has left it, since
           * the listeners are on the scroller rather than on the window.
           *
           * It is allowed to fail. `setPointerCapture` throws `NotFoundError`
           * for a `pointerId` that is not an active pointer, and an exception
           * here would abandon everything after it: no `data-dragging`, no
           * scrolling, and the page's own selection taken away with nothing
           * left to give it back. `MPPanes` was bitten by exactly this and
           * carries the same guard.
           */
          try {
            el.setPointerCapture(moveEvent.pointerId);
          } catch {
            // Nothing to do about it, and nothing below depends on it.
          }

          el.dataset.dragging = 'true';
          document.body.style.setProperty('-webkit-user-select', 'none');
        }

        if (horizontal) {
          el.scrollLeft = fromLeft - dx;
        } else {
          el.scrollTop = fromTop - dy;
        }
      };

      const release = () => {
        dragRef.current = null;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', release);
        delete el.dataset.dragging;

        if (selection) {
          document.body.style.setProperty('-webkit-user-select', selection);
        } else {
          document.body.style.removeProperty('-webkit-user-select');
        }
      };

      const end = () => {
        const moved = dragging;

        release();

        if (!moved) {
          return;
        }

        // The `pointerup` that ends a drag is still followed by a click, and that
        // click lands on whatever card the strip happened to stop under. It is
        // swallowed on the way down, and the listener is dropped on the next task
        // in case no click was coming.
        const swallow = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };

        el.addEventListener('click', swallow, { capture: true, once: true });
        window.setTimeout(() => el.removeEventListener('click', swallow, true), 0);
      };

      dragRef.current = release;
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', release);
    }

    /*
     * The wheel, on the axis it is not pointing along. Registered here rather
     * than as `onWheel`, because React attaches its wheel listener passively and
     * a passive listener cannot `preventDefault` — which is the whole gesture:
     * taking the wheel is only right if the page does not answer it as well.
     */
    React.useEffect(() => {
      const el = scrollerRef.current;

      if (!el || !wheel || !horizontal) {
        return;
      }

      const onWheel = (event: WheelEvent) => {
        // A wheel held with Ctrl is a zoom, and a trackpad swiping sideways is
        // already travel along the strip — the browser scrolls it itself, and
        // answering it here would move twice as far as it was asked to.
        if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          return;
        }

        const unit =
          event.deltaMode === 1 ? WHEEL_LINE : event.deltaMode === 2 ? el.clientWidth : 1;
        const distance = event.deltaY * unit;

        if (!distance) {
          return;
        }

        // Only while there is somewhere to go, and measured now rather than read
        // off the last render. At either end the wheel is the page's again.
        const along = Math.abs(el.scrollLeft);
        const room = distance > 0 ? el.scrollWidth - el.clientWidth - along > 1 : along > 1;

        if (!room) {
          return;
        }

        event.preventDefault();
        // Instantly: a wheel is already a stream of small movements, and
        // smoothing each one leaves the strip still arriving after the hand
        // stopped.
        travel(distance * forwardSign(), false);
      };

      el.addEventListener('wheel', onWheel, { passive: false });

      return () => el.removeEventListener('wheel', onWheel);
    }, [forwardSign, horizontal, travel, wheel]);

    function pressHandlers(forward: boolean) {
      if (mode !== 'hold') {
        return { onClick: () => advance(forward) };
      }

      return {
        onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
          if (event.button === 0) {
            beginHold(forward, 'pointerup');
          }
        },
        // The keyboard's own half of a hold. Without it the button is a control
        // a pointer can use and a keyboard cannot, which is the one thing a
        // scroll affordance must never be.
        onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            beginHold(forward, 'keyup');
          }
        }
      };
    }

    const drawn = buttons !== 'none' && (buttons === 'always' || reach.back || reach.forward);

    function scrollButton(forward: boolean) {
      const available = forward ? reach.forward : reach.back;

      // What `auto` does at an end is decided by what the absence would cost. An
      // overlay button takes no room, so the one with nowhere to go is not drawn
      // at all. An inline one sits in a lane that is held open either way — a
      // lane that came and went would resize the strip under the pointer that
      // had just reached the end of it — and an emptied lane is not a lighter
      // row, it is the same row reading as stray padding at the edge every
      // reader meets first.
      if (buttons === 'auto' && !available && !inline) {
        return <span />;
      }

      const button = (
        <MPIconButton
          variant={variant}
          size={size}
          color={color}
          label={forward ? (nextLabel ?? messages.next) : (previousLabel ?? messages.previous)}
          disabled={!available}
          className="pointer-events-auto"
          icon={
            <MPIcon
              icon={horizontal ? (forward ? ChevronRightIcon : ChevronLeftIcon) : ChevronDownIcon}
              size={CONTROL_ICON[size]}
              // The horizontal pair swap sides in a language that runs the other
              // way, the same treatment the calendar's steppers take. The
              // vertical pair are drawn from one chevron and one turn, which is
              // the single allowance made to a rotation here.
              className={horizontal ? 'rtl:rotate-180' : forward ? '' : 'rotate-180'}
            />
          }
          {...pressHandlers(forward)}
        />
      );

      return inline ? (
        <span className="flex shrink-0 items-center justify-center">{button}</span>
      ) : (
        button
      );
    }

    return (
      <div
        ref={ref}
        data-mp-size={size}
        data-mp-variant={variant}
        // A flex column, so a zone that was given a height passes it to the
        // scroller: a vertical strip only scrolls if something bounds it, and
        // the thing a caller sizes is the component rather than the box in it.
        className={[
          'mp-scroll-zone relative flex min-w-0',
          inline && horizontal ? 'flex-row items-stretch' : 'flex-col',
          inline ? BUTTON_GAP[size] : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...accentSlots(color), ...style }}
        {...props}
      >
        {drawn && inline ? scrollButton(false) : null}

        <div
          ref={scrollerRef}
          // Focusable, so the strip can be scrolled with the arrow keys by
          // whoever is not using a pointer. That is the browser's own key
          // handling on a scroll container, which means it is already right
          // under RTL — a handler of ours mapping ArrowRight to "forward" would
          // not have been.
          tabIndex={0}
          // Always a group with a name, never a bare focusable `<div>`. The
          // strip has to be a tab stop or a reader with no pointer cannot move
          // it, and a tab stop that announces nothing is worse than one that
          // says only what kind of thing it is. `label` says what is *in* it;
          // the fallback says what it is.
          role="group"
          aria-label={label ?? messages.label}
          className={[
            'mp-scroll-zone__scroller',
            // `grow` with the basis left at `auto`, never `flex-1`: a zero basis
            // in a column whose own height is `auto` resolves to no height at
            // all, and a horizontal strip would come out flat.
            'min-h-0 min-w-0 grow',
            horizontal ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden',
            snap ? (horizontal ? 'snap-x snap-mandatory' : 'snap-y snap-mandatory') : '',
            scrollbar ? '' : '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            drag && (reach.back || reach.forward)
              ? 'cursor-grab data-dragging:cursor-grabbing'
              : '',
            'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
            'focus-visible:outline-solid outline-none'
          ]
            .filter(Boolean)
            .join(' ')}
          onScroll={measure}
          onPointerDown={beginDrag}
        >
          <div
            ref={trackRef}
            className={['mp-scroll-zone__track', snap ? '[&>*]:snap-start' : '']
              .filter(Boolean)
              .join(' ')}
            // The track is laid out inline rather than in utilities, because
            // `repeat(3, auto)` is a count the caller picked and Tailwind only
            // ever sees class names written out literally. Half the declaration
            // in a class and half of it here would be two places to read one
            // layout.
            //
            // A grid rather than a flex row, because `lines` is exactly the
            // thing flex cannot state: a wrapping row wraps at the box's edge,
            // and what is wanted here is a fixed number of rows and as many
            // columns as it takes.
            style={{
              display: 'grid',
              gap: cssLength(gap),
              gridAutoFlow: horizontal ? 'column' : 'row',
              ...(horizontal
                ? {
                    // `max-content`, or the track is squeezed back to the width
                    // of the box it is supposed to be longer than.
                    width: 'max-content',
                    gridTemplateRows: `repeat(${rows}, auto)`,
                    gridAutoColumns: 'max-content'
                  }
                : {
                    gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))`,
                    gridAutoRows: 'max-content'
                  })
            }}
          >
            {children}
          </div>
        </div>

        {drawn && inline ? scrollButton(true) : null}

        {drawn && !inline ? (
          <div
            className={[
              'pointer-events-none absolute inset-0 flex justify-between',
              horizontal ? 'items-center' : 'flex-col items-center',
              BUTTON_INSET[size]
            ].join(' ')}
          >
            {scrollButton(false)}
            {scrollButton(true)}
          </div>
        ) : null}
      </div>
    );
  }
);
