import * as React from 'react';
import {
  easingValue,
  isInfinite,
  lengthValue,
  repeatValue,
  useAnimationRun
} from '../../internal/animate';
import type { MPAnimateProps, MPOrientation } from '../../types';

export interface MPAnimateMarqueeProps
  extends MPAnimateProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * Which way the strip runs.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * Runs it the other way — left to right, or bottom to top.
   * @default false
   */
  reverse?: boolean;
  /**
   * How fast the content travels, in pixels per second. A speed rather than a
   * duration, so a strip of four logos and a strip of forty move at the same
   * pace instead of the long one becoming a blur.
   * @default 60
   */
  speed?: number;
  /**
   * The gap between items, and between the last item and the first of the next
   * pass — a CSS length, or a number in pixels.
   * @default '2rem'
   */
  gap?: number | string;
  /**
   * How many copies of the content are laid end to end. Two is enough for
   * anything at least as wide as its container; raise it when the content is
   * short enough to leave a hole behind itself.
   * @default 2
   */
  copies?: number;
  /**
   * Stops while the pointer is on it, so something scrolling past can actually
   * be read or clicked.
   * @default true
   */
  pauseOnHover?: boolean;
  /** The things that scroll past. */
  children?: React.ReactNode;
}

/**
 * Content scrolling steadily past, forever.
 *
 * The content is laid down twice, and each copy travels exactly its own length
 * plus the gap — so the moment the first copy has left, the second is standing
 * precisely where it began. There is no seam, no jump and no frame where the
 * strip is empty, and none of that depends on measuring anything: a percentage
 * `translate` resolves against the element's own box.
 *
 * What **is** measured is only the speed. A duration would mean a strip of four
 * logos and a strip of forty crossing the same box in the same time, with the
 * long one becoming unreadable; `speed` is pixels per second, so both move at
 * the pace of a reader instead. The strip is re-measured whenever it changes
 * size.
 *
 * `pauseOnHover` is on by default and is not decoration: content moving past a
 * pointer cannot be clicked reliably, and a link inside a marquee that never
 * stops is a link nobody can follow.
 *
 * Only the first copy is read out. The rest carry `aria-hidden`, or a screen
 * reader would announce everything on the strip as many times as it was laid
 * down.
 */
export const MPAnimateMarquee = React.forwardRef<HTMLDivElement, MPAnimateMarqueeProps>(
  function MPAnimateMarquee(
    {
      duration,
      delay = 0,
      easing,
      repeat = 'infinite',
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      orientation = 'horizontal',
      reverse = false,
      speed = 60,
      gap = '2rem',
      copies = 2,
      pauseOnHover = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const run = useAnimationRun({
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat)
    });

    const boxRef = React.useRef<HTMLDivElement | null>(null);
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const [travel, setTravel] = React.useState(0);

    const vertical = orientation === 'vertical';

    /**
     * How far one copy has to go, in pixels: its own length plus the gap after
     * it. The gap is read back off the computed style rather than parsed out of
     * the prop, because `'2rem'` is only a number once a font size has been
     * resolved — and the one on the page is the one that matters.
     */
    React.useEffect(() => {
      const box = boxRef.current;
      const track = trackRef.current;

      if (!box || !track) {
        return;
      }

      const measure = () => {
        const styles = getComputedStyle(box);
        const gapPx = parseFloat(vertical ? styles.rowGap : styles.columnGap) || 0;
        const size = vertical ? track.offsetHeight : track.offsetWidth;

        setTravel(size + gapPx);
      };

      measure();

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(measure);

      observer.observe(track);
      observer.observe(box);

      return () => observer.disconnect();
    }, [vertical, children]);

    // An explicit duration wins; otherwise the measurement decides, and until
    // the first measurement lands there is a sane number rather than `0ms`,
    // which browsers read as "finish immediately".
    const runDuration = duration ?? (travel > 0 ? (travel / speed) * 1000 : 12000);

    const track = (index: number) => (
      <div
        key={index}
        ref={index === 0 ? trackRef : undefined}
        className="mp-marquee-track"
        aria-hidden={index === 0 ? undefined : 'true'}
      >
        {children}
      </div>
    );

    return (
      <div
        ref={(node) => {
          boxRef.current = node;
          run.ref(node);

          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={['mp-marquee', vertical ? 'mp-marquee-vertical' : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={
          {
            '--_mp-anim-gap': lengthValue(gap),
            // Linear unless a caller insists otherwise: an eased marquee slows
            // at both ends of a loop that has no ends, which reads as the page
            // stuttering.
            ...(easing ? { '--_mp-anim-ease': easingValue(easing) } : {}),
            '--_mp-anim-duration': `${Math.round(runDuration)}ms`,
            '--_mp-anim-delay': `${delay}ms`,
            '--_mp-anim-repeat': repeatValue(repeat),
            '--_mp-anim-direction': reverse
              ? alternate
                ? 'alternate-reverse'
                : 'reverse'
              : alternate
                ? 'alternate'
                : 'normal',
            '--_mp-anim-state': run.state,
            ...style
          } as React.CSSProperties
        }
        data-mp-animation="marquee"
        data-mp-state={run.state}
        data-mp-pause-on-hover={pauseOnHover ? '' : undefined}
        {...run.handlers}
        {...props}
      >
        {Array.from({ length: Math.max(1, copies) }, (_, index) => track(index))}
      </div>
    );
  }
);
