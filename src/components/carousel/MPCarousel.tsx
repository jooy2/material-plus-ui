import * as React from 'react';
import { MPIconButton } from '../icon-button/MPIconButton';
import { MPIcon } from '../icon/MPIcon';
import { ChevronLeftIcon, ChevronRightIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { CONTROL_ICON } from '../../internal/scale';
import { CONTAINER_SURFACE } from '../../internal/surface';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPSize, MPVariant } from '../../types';

export interface MPCarouselProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /** Which slide is showing, counted from 0. Use with `onValueChange`. */
  value?: number;
  /**
   * Which starts showing, for an uncontrolled carousel.
   * @default 0
   */
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /**
   * Whether the arrows wrap from the last slide back to the first.
   *
   * With it off they go `disabled` at the ends instead, which is the honest
   * thing for a set that has a beginning and an end — a gallery of three
   * photographs does, a rotating banner does not.
   * @default true
   */
  loop?: boolean;
  /**
   * Advances on its own.
   *
   * Off by default and deliberately so: a carousel that moves while it is being
   * read is the most complained-about pattern on the web. It pauses on hover, on
   * focus anywhere inside it, while the tab is in the background, and it does not
   * start at all for a reader who has asked for reduced motion.
   * @default false
   */
  autoPlay?: boolean;
  /**
   * How long each slide is held, in milliseconds.
   * @default 5000
   */
  interval?: number;
  /**
   * The previous/next buttons.
   * @default true
   */
  arrows?: boolean;
  /**
   * The row of position marks under the frame.
   * @default true
   */
  indicators?: boolean;
  /**
   * How much surface the frame paints behind the slides.
   *
   * `text` is the one to reach for when the pictures already have edges of their
   * own — it draws no frame at all, and the slides are the whole component.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The size of the arrows and the marks, and how far the arrows sit in from the
   * frame's edge. Not the size of a slide, which is whatever the frame is.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the current mark and the arrows read.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * The carousel's accessible name.
   * @default 'Carousel'
   */
  label?: string;
  /** @default 'Previous slide' */
  previousLabel?: string;
  /** @default 'Next slide' */
  nextLabel?: string;
  /**
   * How one slide is named to a screen reader, and how its mark is labelled.
   * @default (index, count) => `Slide ${index} of ${count}`
   */
  slideLabel?: (index: number, count: number) => string;
  /** The slides. Every top-level child becomes one. */
  children?: React.ReactNode;
}

/** How far the arrows sit in from the frame's edge. */
const ARROW_INSET: Record<MPSize, string> = {
  xs: 'start-1 end-1',
  sm: 'start-1.5 end-1.5',
  md: 'start-2 end-2',
  lg: 'start-3 end-3',
  xl: 'start-4 end-4'
};

/**
 * The position marks.
 *
 * The current one is a short **bar** rather than a bigger circle, which is MD3's
 * own treatment for a selected indicator and is also the only one that does not
 * move its neighbours: it grows along the row it is in, so the row's height
 * never changes and the marks either side of it stay put.
 */
const DOT: Record<MPSize, { rest: string; current: string; gap: string }> = {
  xs: { rest: 'h-1 w-1', current: 'h-1 w-3', gap: 'gap-1' },
  sm: { rest: 'h-1 w-1', current: 'h-1 w-3.5', gap: 'gap-1' },
  md: { rest: 'h-1.5 w-1.5', current: 'h-1.5 w-4', gap: 'gap-1.5' },
  lg: { rest: 'h-1.5 w-1.5', current: 'h-1.5 w-5', gap: 'gap-2' },
  xl: { rest: 'h-2 w-2', current: 'h-2 w-6', gap: 'gap-2' }
};

/** How long a smooth scroll of our own is given to arrive, in milliseconds. */
const SETTLE_MS = 700;

const defaultSlideLabel = (index: number, count: number) => `Slide ${index} of ${count}`;

/**
 * A strip of slides, one of which is in view.
 *
 * The mechanism is a scroll container with CSS scroll snapping, and nearly
 * everything good about this component follows from that one choice. Swiping on
 * a phone and two-finger dragging on a trackpad both work, because they are the
 * browser's own scrolling rather than a gesture handler pretending to be it. The
 * strip runs the other way under RTL without being told, because scrolling is
 * directional and `translate` is not. And nothing is transformed, so the house
 * rule against moving a surface holds here for free — a translated track would
 * have had to argue for an exception.
 *
 * The motion is `scroll-behavior: smooth`, which means a reader who has asked for
 * reduced motion gets an instant cut out of the same code path rather than out of
 * a second one written to remember them.
 *
 * ## Why every child is a slide
 *
 * There is no `MPCarouselSlide`. `<MPCarousel><img /><img /></MPCarousel>` is the
 * whole API, and the wrapper this component puts around each child is what
 * carries the snap point, the width and the `role="group"` /
 * `aria-roledescription="slide"` pair a screen reader needs — none of which a
 * caller should have to remember to put on a photograph.
 *
 * ## What this is, in MD3's terms
 *
 * The specification describes four carousel layouts, three of which — hero,
 * multi-browse and uncontained — resize their items as they travel past the
 * frame's edge. This is the fourth: one item to a view, snapping. The other three
 * are a per-item transform driven by scroll position, which is a different
 * component and not one this library ships yet; what is here is drawn out of the
 * specification's own parts — a filled icon button either side, a selected
 * indicator that is a bar rather than a bigger dot.
 */
export const MPCarousel = React.forwardRef<HTMLDivElement, MPCarouselProps>(function MPCarousel(
  {
    value,
    defaultValue = 0,
    onValueChange,
    loop = true,
    autoPlay = false,
    interval = 5000,
    arrows = true,
    indicators = true,
    variant = 'outlined',
    size = 'md',
    color = 'primary',
    label = 'Carousel',
    previousLabel = 'Previous slide',
    nextLabel = 'Next slide',
    slideLabel = defaultSlideLabel,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  // `toArray` is what drops the `null`s and `false`s a conditional slide leaves
  // behind, and what gives every remaining child a stable key.
  const slides = React.Children.toArray(children);
  const count = slides.length;

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const index = Math.min(Math.max(value ?? uncontrolled, 0), Math.max(count - 1, 0));

  const trackRef = React.useRef<HTMLDivElement>(null);
  const slideRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  // Set while the index is catching up with a scroll the reader performed. The
  // effect below skips those, or every drag would be answered by a scroll back
  // to where the browser had already put us.
  const fromScroll = React.useRef(false);
  const mounted = React.useRef(false);
  // Raised while a smooth scroll of our own is still travelling. Without it the
  // scroll events thrown on the way from slide 0 to slide 2 would each be read as
  // the reader landing on slide 1.
  const settling = React.useRef(false);
  const [paused, setPaused] = React.useState(false);

  /*
   * The two things `go` reads that change on every render, held in refs.
   *
   * `go` used to depend on `index` and on `onValueChange`, and a caller passing
   * an inline arrow — which is nearly all of them — made it a new function every
   * render. The autoplay effect below depends on `go`, so it tore its interval
   * down and set a fresh one up on every render: on a page whose parent
   * re-renders more often than `interval`, the timer never reached the end of
   * its first tick and the carousel simply never advanced.
   *
   * A ref rather than a wider dependency list, because neither of these is
   * something the timer should restart for. What the timer cares about is how
   * long to wait, not which slide is showing when it fires.
   */
  const indexRef = React.useRef(index);
  const notifyRef = React.useRef(onValueChange);

  indexRef.current = index;
  notifyRef.current = onValueChange;

  const go = React.useCallback(
    (next: number, viaScroll = false) => {
      if (count === 0) {
        return;
      }

      const wrapped = loop
        ? ((next % count) + count) % count
        : Math.min(Math.max(next, 0), count - 1);

      fromScroll.current = viaScroll;

      if (value === undefined) {
        setUncontrolled(wrapped);
      }
      if (wrapped !== indexRef.current) {
        notifyRef.current?.(wrapped);
      }
    },
    [count, loop, value]
  );

  React.useEffect(() => {
    if (fromScroll.current) {
      fromScroll.current = false;

      return;
    }

    // The first pass would otherwise scroll the page down to a carousel nobody
    // has looked at yet, just to put slide 0 where the browser already had it.
    if (!mounted.current) {
      mounted.current = true;

      return;
    }

    slideRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'start' });

    settling.current = true;
    const timer = window.setTimeout(() => {
      settling.current = false;
    }, SETTLE_MS);

    return () => window.clearTimeout(timer);
  }, [index]);

  React.useEffect(() => {
    if (!autoPlay || paused || count < 2) {
      return;
    }

    // A reader who has asked for less motion has asked for this in particular.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      // Read at the moment it fires rather than closed over, so the interval
      // does not have to be rebuilt every time the slide changes — which is
      // what kept restarting the wait before it could elapse.
      go(indexRef.current + 1);
    }, interval);

    return () => window.clearInterval(timer);
  }, [autoPlay, paused, count, interval, go]);

  /**
   * Where the strip has settled, read off the scroll offset rather than measured
   * per slide: every slide is exactly the width of the frame, so the offset
   * divided by that width *is* the index. `Math.abs` is what makes it hold under
   * RTL, where a scroll position counts backwards from zero.
   *
   * Coalesced into an animation frame. `scroll` fires far faster than the screen
   * refreshes, and both properties this reads are layout — so answering every
   * event is asking the browser to flush layout dozens of times between two
   * paints, in the middle of a gesture, for an answer that can only change once
   * per frame.
   */
  const scrollFrame = React.useRef(0);

  React.useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);

  const handleScroll = () => {
    if (scrollFrame.current) {
      return;
    }

    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0;

      const track = trackRef.current;

      if (!track || track.clientWidth === 0 || settling.current) {
        return;
      }

      const nearest = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);

      if (nearest !== indexRef.current && nearest >= 0 && nearest < count) {
        go(nearest, true);
      }
    });
  };

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-mp-size={size}
      data-mp-variant={variant}
      className={['mp-carousel flex w-full flex-col', className ?? ''].filter(Boolean).join(' ')}
      style={{ ...accentSlots(color), ...style }}
      // Hover and focus both stop the timer. The second is the important one: a
      // keyboard reader who has tabbed into a slide is reading it.
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        // Only when the focus actually leaves the carousel. Moving between two
        // controls inside it fires a blur before the next focus, and answering
        // that one would restart the timer for the length of a tab press — in
        // the middle of somebody reading their way through the slides.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      {...props}
    >
      <div
        className={[
          'relative min-w-0 overflow-hidden',
          'rounded-mp-md box-border',
          CONTAINER_SURFACE[variant],
          'text-mp-on-surface'
        ].join(' ')}
      >
        <div
          ref={trackRef}
          // Focusable, so the strip can be scrolled with the arrow keys by
          // whoever is not using a pointer. That is the browser's own key
          // handling on a scroll container, which means it is already right under
          // RTL — a handler of ours mapping ArrowRight to "next" would not have
          // been.
          tabIndex={0}
          role="group"
          aria-label={label}
          className={[
            'flex min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth',
            'motion-reduce:scroll-auto',
            // The strip is driven by buttons and by dragging; a scrollbar under
            // it is a third control saying the same thing.
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
            'focus-visible:outline-solid outline-none'
          ].join(' ')}
          onScroll={handleScroll}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              ref={(element) => {
                slideRefs.current[slideIndex] = element;
                // Trimmed to the strip's own length, so a carousel whose slides
                // were narrowed down does not keep the removed ones' elements
                // alive in an array nothing ever shortens.
                slideRefs.current.length = count;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={slideLabel(slideIndex + 1, count)}
              // Deliberately *not* `aria-hidden` when off screen. A slide can hold
              // a link or a button, and an `aria-hidden` subtree that is still in
              // the tab order is the exact shape of the bug where a keyboard
              // reader lands somewhere their screen reader refuses to describe.
              // The strip is scrollable, so everything in it is genuinely
              // reachable — hiding it would be a lie.
              className="w-full shrink-0 grow-0 basis-full snap-start"
            >
              {slide}
            </div>
          ))}
        </div>

        {arrows && count > 1 ? (
          <div
            className={`pointer-events-none absolute inset-y-0 flex items-center ${ARROW_INSET[size]}`}
          >
            <MPIconButton
              variant="filled"
              size={size}
              color={color}
              label={previousLabel}
              disabled={!loop && atStart}
              className="pointer-events-auto"
              // `rtl:rotate-180`, the same treatment the calendar's steppers take:
              // "previous" is on the other side of the frame in a language that
              // runs the other way.
              icon={
                <MPIcon
                  icon={ChevronLeftIcon}
                  size={CONTROL_ICON[size]}
                  className="rtl:rotate-180"
                />
              }
              onClick={() => go(index - 1)}
            />
            <span className="flex-1" />
            <MPIconButton
              variant="filled"
              size={size}
              color={color}
              label={nextLabel}
              disabled={!loop && atEnd}
              className="pointer-events-auto"
              icon={
                <MPIcon
                  icon={ChevronRightIcon}
                  size={CONTROL_ICON[size]}
                  className="rtl:rotate-180"
                />
              }
              onClick={() => go(index + 1)}
            />
          </div>
        ) : null}
      </div>

      {indicators && count > 1 ? (
        <div className={`flex shrink-0 items-center justify-center pt-2 ${DOT[size].gap}`}>
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={slideLabel(dotIndex + 1, count)}
              aria-current={dotIndex === index ? 'true' : undefined}
              className={[
                'rounded-mp-full cursor-pointer appearance-none border-0 p-0',
                // Width and colour, never a transform: the current mark grows
                // along the row instead of scaling, so nothing beside it moves.
                'transition-[width,background-color] duration-(--mp-sys-motion-duration-short4)',
                'ease-mp-standard motion-reduce:transition-none',
                'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-solid outline-none',
                dotIndex === index
                  ? `${DOT[size].current} bg-(--_mp-accent)`
                  : `${DOT[size].rest} bg-mp-outline-variant hover:bg-mp-outline`
              ].join(' ')}
              onClick={() => go(dotIndex)}
            />
          ))}
        </div>
      ) : null}

      {/* Where the reader is, as a sentence rather than as a highlighted mark.
          Silent while the carousel is advancing on its own: a live region that
          says a new slide's name every five seconds is what makes a screen reader
          unusable on a page that has one. */}
      <span className={VISUALLY_HIDDEN} aria-live={autoPlay ? 'off' : 'polite'}>
        {count > 0 ? slideLabel(index + 1, count) : ''}
      </span>
    </div>
  );
});
