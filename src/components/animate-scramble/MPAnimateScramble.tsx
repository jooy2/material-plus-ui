import * as React from 'react';
import { isInfinite, useAnimationRun, usePrefersReducedMotion } from '../../internal/animate';
import { graphemesOf, textOf } from '../../internal/text';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPAnimateProps } from '../../types';

/**
 * What an unsettled character is drawn as.
 *
 * Latin upper case, digits and a few marks: one width apart in most faces, and
 * — more to the point — visibly *not words*. A noise alphabet that included
 * lower case would spend half the effect looking like text that had been
 * misspelled rather than like text that has not arrived.
 */
const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$?!';

export interface MPAnimateScrambleProps
  extends
    Omit<MPAnimateProps, 'alternate' | 'easing'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The text, when it is easier to pass than to nest. Overrides `children`. */
  text?: string;
  /**
   * How long the whole line takes to settle, in milliseconds.
   * @default 1200
   */
  duration?: number;
  /**
   * How much of that each character spends unsettled, as a fraction of the
   * whole. At `1` the last character is still noise when the first has been
   * still for the entire run; low values make the line resolve almost at once.
   * @default 0.4
   */
  spread?: number;
  /**
   * How often an unsettled character is replaced, in milliseconds. Below about
   * 30 the noise stops reading as characters and starts reading as flicker.
   * @default 50
   */
  tick?: number;
  /** The alphabet the noise is drawn from. */
  characters?: string;
  /** Which language the text is in, for deciding where a character ends. */
  locale?: string;
  /** The text to settle. Only text is settled — see below. */
  children?: React.ReactNode;
}

/**
 * Text settling out of noise.
 *
 * `MPAnimateTyping`'s sibling, and the difference is what the box does. A
 * typewriter's line grows a character at a time, so everything after it on the
 * page moves while it runs; this one is **its finished length from the first
 * frame** and only the characters inside it change. That is why it is the one
 * to reach for in a heading, a table cell or anything else with something
 * beside it.
 *
 * ## Written in JavaScript, and paused like everything else
 *
 * There is no keyframe for this: replacing a character with a random one is not
 * an interpolation, so the frame loop is real. What it borrows is the trigger,
 * the play state and the rewind — so `trigger="visible"`, `paused` and a
 * `manual` replay behave exactly as they do on the six declared effects.
 *
 * Before it is triggered it shows its own **first frame**, which for this
 * effect is the line fully scrambled. Not the answer: a heading that has
 * already resolved while it waits to be scrolled to has given away the thing it
 * was about to do. The waiting noise is fixed rather than churning, because
 * motion that starts before the trigger is not the effect, it is a distraction
 * beside it.
 *
 * ## What a screen reader gets
 *
 * The finished line, once, out of a clipped box; the settling copy is
 * `aria-hidden`. Noise read out character by character is not text, and
 * find-on-page still matches the real words.
 *
 * Under `prefers-reduced-motion` the line is simply there, finished, from the
 * first frame — the state rather than the animation, because an effect switched
 * off at the wrong end would leave a heading permanently unreadable.
 */
export const MPAnimateScramble = React.forwardRef<HTMLDivElement, MPAnimateScrambleProps>(
  function MPAnimateScramble(
    {
      text,
      duration = 1200,
      spread = 0.4,
      tick = 50,
      characters = NOISE,
      locale,
      delay = 0,
      repeat = 1,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const still = usePrefersReducedMotion();
    const run = useAnimationRun({
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat)
    });

    const source = text ?? textOf(children);
    const graphemes = React.useMemo(() => graphemesOf(source, locale), [source, locale]);

    /*
     * How far through the settling each character is, from 0 to 1. The one
     * number the frame loop keeps: the noise itself is redrawn from it rather
     * than stored, so a re-render never shows a frame the clock did not.
     */
    const [progress, setProgress] = React.useState(0);
    const running = run.state === 'running' && !still;

    React.useEffect(() => {
      if (still) {
        setProgress(1);

        return;
      }

      if (!running) {
        setProgress(0);

        return;
      }

      let frame = 0;
      let start = 0;

      const step = (now: number) => {
        if (start === 0) {
          start = now;
        }

        const elapsed = now - start - delay;
        const next = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1;

        setProgress(next);

        if (next < 1) {
          frame = requestAnimationFrame(step);
        }
      };

      frame = requestAnimationFrame(step);

      return () => cancelAnimationFrame(frame);
      // The run counter is what a replay changes, so a second rejection scrambles
      // as far as the first one did.
    }, [running, still, duration, delay, run.started]);

    /*
     * A character is settled once the line's progress has passed its share of
     * the run. `spread` is how much of the run is spent on the difference
     * between the first character and the last: at 0 they all settle together,
     * at 1 the last one is still noise when the first has been still throughout.
     */
    const settled = (index: number) => {
      const share = graphemes.length > 1 ? index / (graphemes.length - 1) : 0;
      const begins = share * spread;

      return progress >= begins + (1 - spread);
    };

    /*
     * Noise, drawn from the index and the frame rather than from `Math.random`
     * held in state. Two reasons: a paused or untriggered line is *stable*
     * rather than churning, and a re-render for any other reason cannot make the
     * characters jump.
     */
    const noiseAt = (index: number) => {
      const beat = Math.floor((progress * duration) / Math.max(1, tick));
      const pick = (index * 2654435761 + beat * 40503) % characters.length;

      return characters[Math.abs(pick)] ?? characters[0];
    };

    const shown = still
      ? source
      : graphemes.map((grapheme, index) => (settled(index) ? grapheme : noiseAt(index))).join('');

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
        className={className}
        style={style}
        data-mp-animation="scramble"
        data-mp-state={run.state}
        {...run.handlers}
        {...props}
      >
        <span className={VISUALLY_HIDDEN}>{source}</span>
        {/*
         * `tabular-nums` for the same reason the counter takes it: the noise
         * alphabet has digits in it, and a proportional `1` is narrower than the
         * letter it is standing in for.
         */}
        <span aria-hidden="true" className="tabular-nums whitespace-pre-wrap">
          {shown}
        </span>
      </div>
    );
  }
);
