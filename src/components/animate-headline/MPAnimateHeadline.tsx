import * as React from 'react';
import {
  easingValue,
  isInfinite,
  lengthValue,
  useAnimationRun,
  usePrefersReducedMotion
} from '../../internal/animate';
import type { MPAnimateProps } from '../../types';

export interface MPAnimateHeadlineProps
  extends Omit<MPAnimateProps, 'alternate'>, React.ComponentPropsWithoutRef<'div'> {
  /**
   * How long each line is held before the next one comes up, in milliseconds.
   * Counted from the moment a line arrives, so it is reading time rather than a
   * cycle length.
   * @default 2600
   */
  interval?: number;
  /**
   * Which line is showing. Pass it to drive the reel yourself — from a step in
   * a form, a tab, or a timer of your own.
   */
  index?: number;
  /**
   * Where an uncontrolled reel starts.
   * @default 0
   */
  defaultIndex?: number;
  /** Called with the line that has just come up. */
  onIndexChange?: (index: number) => void;
  /**
   * Starts again after the last line. Off, the reel stops on the last one and
   * stays there.
   * @default true
   */
  loop?: boolean;
  /**
   * How far a line travels as it comes up or leaves — a CSS length, or a number
   * in pixels. `'100%'` is one line's own height.
   * @default '100%'
   */
  rise?: number | string;
  /** The lines, in the order they should be read. */
  children?: React.ReactNode;
}

/**
 * One line replacing the one above it, on a timer.
 *
 * Every line sits in the same grid cell, so the box is as tall as the longest
 * of them from the first frame and never resizes as the reel turns — which is
 * the whole difficulty with this effect, and the reason the lines that are not
 * showing keep their space with `visibility` rather than being taken out of the
 * layout.
 *
 * It is deliberately **not a ticker**. A line comes up, it stops, and it is
 * held long enough to read; `interval` is counted from the moment it arrives
 * rather than from the start of the cycle, so raising `duration` does not
 * quietly eat the reading time.
 *
 * The swap is the one place in this library where both halves of MD3's
 * emphasized curve are written out: the line arriving decelerates into place
 * while the line leaving accelerates away. Everywhere else an exit is a
 * reversed entrance, but here the two genuinely are two animations on two
 * elements at the same moment.
 *
 * Use it for a set of phrases where any one of them would have done — three
 * ways of saying what a product is, a rotating set of customer names. What it
 * is not for is content a reader has to see, because there is no guarantee they
 * are looking during the two seconds it is up.
 */
export const MPAnimateHeadline = React.forwardRef<HTMLDivElement, MPAnimateHeadlineProps>(
  function MPAnimateHeadline(
    {
      duration,
      delay = 0,
      easing,
      repeat = 'infinite',
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      interval = 2600,
      index,
      defaultIndex = 0,
      onIndexChange,
      loop = true,
      rise = '100%',
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
    const reduced = usePrefersReducedMotion();

    const items = React.Children.toArray(children);
    const count = items.length;

    const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
    const active = Math.min(index ?? uncontrolled, Math.max(count - 1, 0));

    /** The line on its way out. Cleared once its animation has had its time. */
    const [leaving, setLeaving] = React.useState<number | null>(null);
    const previous = React.useRef(active);

    React.useEffect(() => {
      if (previous.current !== active) {
        setLeaving(previous.current);
        previous.current = active;
      }
    }, [active]);

    // The line on the way out has to be cleared on a timer rather than on
    // `animationend`, because a line that is never drawn — the reel is off
    // screen, the tab is in the background — never fires one.
    const swapDuration = duration ?? 500;

    React.useEffect(() => {
      if (leaving === null) {
        return;
      }

      const timer = setTimeout(() => setLeaving(null), swapDuration);

      return () => clearTimeout(timer);
    }, [leaving, swapDuration]);

    const advance = React.useCallback(() => {
      const next = active + 1;

      if (next >= count) {
        if (!loop) {
          return;
        }

        if (index === undefined) {
          setUncontrolled(0);
        }

        onIndexChange?.(0);

        return;
      }

      if (index === undefined) {
        setUncontrolled(next);
      }

      onIndexChange?.(next);
    }, [active, count, loop, index, onIndexChange]);

    /**
     * The reel only turns on its own when it was not handed an `index`. A
     * controlled Headline is somebody else's timer, and a second one running
     * underneath it would fight for the same state.
     */
    const turned = React.useRef(false);

    React.useEffect(() => {
      if (index !== undefined || count < 2 || run.state !== 'running') {
        return;
      }

      if (!loop && active === count - 1) {
        return;
      }

      // `delay` is what happens before the reel starts turning at all, so it is
      // added once rather than to every line — which is what an `interval` is.
      const timer = setTimeout(
        () => {
          turned.current = true;
          advance();
        },
        interval + (turned.current ? 0 : delay)
      );

      return () => clearTimeout(timer);
    }, [index, count, run.state, interval, delay, advance, loop, active]);

    return (
      <div
        ref={(node) => {
          run.ref(node);

          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={['mp-headline', className ?? ''].filter(Boolean).join(' ')}
        style={
          {
            ...(duration === undefined ? {} : { '--_mp-anim-duration': `${duration}ms` }),
            '--_mp-anim-rise': lengthValue(rise),
            ...(easing ? { '--_mp-anim-ease': easingValue(easing) } : {}),
            '--_mp-anim-state': run.state,
            ...style
          } as React.CSSProperties
        }
        data-mp-animation="headline"
        data-mp-state={run.state}
        {...run.handlers}
        {...props}
      >
        {items.map((child, position) => {
          const state =
            position === active
              ? 'active'
              : position === leaving && !reduced
                ? 'leaving'
                : undefined;

          if (!React.isValidElement(child)) {
            return (
              <span key={position} className="mp-headline-item" data-mp-state={state}>
                {child}
              </span>
            );
          }

          const childProps = child.props as { className?: string };

          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            key: position,
            className: ['mp-headline-item', childProps.className].filter(Boolean).join(' '),
            'data-mp-state': state
          });
        })}
      </div>
    );
  }
);
