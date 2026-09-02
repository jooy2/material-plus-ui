import * as React from 'react';
import { useAnimateElement } from '../../internal/animate';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPAnimateProps, MPAnimateTimelineProps } from '../../types';

export interface MPAnimateCounterProps
  extends
    Omit<MPAnimateProps, 'alternate' | 'repeat'>,
    MPAnimateTimelineProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  /** The number it settles on. */
  value: number;
  /**
   * Where it starts.
   * @default 0
   */
  from?: number;
  /**
   * How the number is written — anything `Intl.NumberFormat` takes, so a
   * currency, a percentage or a compact notation is a prop rather than a
   * template.
   *
   * Formatted rather than concatenated because the pieces of a number are not
   * in the same order everywhere: `1 234,56 €` and `$1,234.56` are the same
   * value, and a `prefix`/`suffix` pair can only write one of them.
   */
  options?: Intl.NumberFormatOptions;
  /**
   * Which language it is written in. Falls back to the browser's own, which is
   * what `Intl` does when nobody says.
   */
  locale?: string;
  /**
   * The whole formatter, for the numbers `Intl` has no option for — an ordinal,
   * a score out of ten, a duration. Overrides `options` and `locale`.
   */
  format?: (value: number) => string;
}

/**
 * A number counting up to its value.
 *
 * The one effect in this set that **cannot** be a keyframe on its own, because
 * text is not an animatable property: every frame needs a fresh interpolation
 * put through a formatter.
 *
 * ## It is still a CSS animation
 *
 * The obvious implementation is a `requestAnimationFrame` loop with its own
 * clock, its own easing and its own idea of what *paused* means — three things
 * that have to be kept in step with the rest of the library and will not be.
 *
 * So the animation here is a real one, over a registered custom property, and
 * the frame loop does nothing but **read** it. `duration`, `delay`, the easing
 * token, `trigger`, `paused`, `timeline="view"` and `prefers-reduced-motion`
 * are then the same machinery every other effect uses rather than a second
 * implementation of each. A counter waiting to be scrolled to shows `from`
 * rather than the answer, for free: a paused animation with `fill-mode: both`
 * is sitting on its own first frame.
 *
 * ## What a screen reader gets
 *
 * The final number, once, out of a clipped box — the counting copy is
 * `aria-hidden`. A live count would be announced sixty times a second, and the
 * one thing a reader wants from a statistic is the statistic.
 *
 * ## In a background tab
 *
 * `requestAnimationFrame` does not run in a tab nobody is looking at, so a
 * counter left in the background sits at `from` and jumps to its value on
 * return, having been "running" the whole time. That is correct — the reader
 * sees the number they came back for — and it is worth knowing before it is
 * reported as a bug.
 */
export const MPAnimateCounter = React.forwardRef<HTMLSpanElement, MPAnimateCounterProps>(
  function MPAnimateCounter(
    {
      value,
      from = 0,
      options,
      locale,
      format,
      // `long2` at 800ms: long enough for the digits to be read as counting and
      // short enough that a tile of four of them is not a wait.
      duration,
      delay = 0,
      easing,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      timeline,
      range,
      className,
      style,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'count',
      effectClass: 'mp-anim-count',
      duration,
      delay,
      easing,
      repeat: 1,
      from,
      to: value,
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: false,
      timeline,
      range
    });

    const formatter = React.useMemo(() => {
      if (format) {
        return format;
      }

      const intl = new Intl.NumberFormat(locale, options);

      return (next: number) => intl.format(next);
    }, [format, locale, options]);

    const node = React.useRef<HTMLSpanElement | null>(null);
    const [shown, setShown] = React.useState(from);

    /*
     * Read, do not drive. The value is whatever the animation has interpolated
     * `--mp-count` to this frame, so scrolling a `view()` timeline backwards
     * counts back down and a `paused` counter holds — neither of which this
     * loop knows anything about.
     */
    React.useEffect(() => {
      const element = node.current;

      if (!element || typeof requestAnimationFrame === 'undefined') {
        return;
      }

      let frame = 0;
      let live = true;

      const read = () => {
        if (!live) {
          return;
        }

        const raw = getComputedStyle(element).getPropertyValue('--mp-count');
        const next = Number.parseFloat(raw);

        if (Number.isFinite(next)) {
          setShown(next);
        }

        /*
         * Stop when the animation has, so a page of finished counters is not a
         * page of frame loops. A scroll-driven one never finishes — its
         * progress is the reader's position and can go back — so that one keeps
         * reading.
         */
        const running =
          timeline === 'view' ||
          element.getAnimations().some((animation) => animation.playState !== 'finished');

        if (running) {
          frame = requestAnimationFrame(read);
        }
      };

      frame = requestAnimationFrame(read);

      return () => {
        live = false;
        cancelAnimationFrame(frame);
      };
      // `animate.style` rather than its parts: a new run writes new slots, and a
      // finished loop has to be restarted when it does.
    }, [animate.style, animate.props['data-mp-state'], timeline]);

    return (
      <span
        ref={(element) => {
          node.current = element;
          animate.ref(element);

          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        className={[animate.className, className].filter(Boolean).join(' ')}
        style={{ ...animate.style, ...style }}
        {...animate.props}
        {...props}
      >
        <span className={VISUALLY_HIDDEN}>{formatter(value)}</span>
        {/*
         * `tabular-nums`, or the tile jumps sideways on every frame that swaps a
         * `1` for an `8`. A statistic that shivers while it counts is worse than
         * one that does not count at all.
         */}
        <span aria-hidden="true" className="tabular-nums">
          {formatter(shown)}
        </span>
      </span>
    );
  }
);
