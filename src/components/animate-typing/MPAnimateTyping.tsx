import * as React from 'react';
import { isInfinite, useAnimationRun, usePrefersReducedMotion } from '../../internal/animate';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPAnimateProps } from '../../types';

export interface MPAnimateTypingProps
  extends
    Omit<MPAnimateProps, 'alternate' | 'easing'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The text, when it is easier to pass than to nest. Overrides `children`. */
  text?: string;
  /**
   * How fast it is typed, in characters per second.
   * @default 24
   */
  speed?: number;
  /**
   * How long the finished text is held before it repeats, in milliseconds.
   * @default 1400
   */
  hold?: number;
  /**
   * Deletes the text again before repeating, rather than clearing it in one
   * frame. Only means anything when `repeat` is more than once.
   * @default false
   */
  erase?: boolean;
  /**
   * How fast it is deleted, in characters per second. Deleting is usually about
   * twice as fast as typing, which is what a person actually does.
   * @default twice `speed`
   */
  eraseSpeed?: number;
  /**
   * The block after the text.
   * @default true
   */
  caret?: boolean;
  /**
   * What the caret is drawn as.
   * @default '|'
   */
  caretChar?: React.ReactNode;
  /** The text to type. Only text is typed — see below. */
  children?: React.ReactNode;
}

/**
 * Everything typeable in a node, flattened.
 *
 * Elements are deliberately not walked into. A typewriter reveals a string one
 * grapheme at a time, and there is no honest way to reveal half of a
 * `<strong>` — the effect is over text, so its input is text.
 */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textOf).join('');
  }

  return '';
}

/**
 * The text split the way a reader would split it.
 *
 * Not `[...text]`, and not `text.split('')`. A code point is not a character:
 * `👩‍👩‍👧` is seven of them, `한` typed on a Korean keyboard can be three, and a
 * typewriter that advances by code points spends four frames assembling an
 * emoji out of parts that mean nothing on their own. `Intl.Segmenter` knows
 * where the boundaries actually are; the spread is the fallback for a runtime
 * that does not have it.
 */
function graphemesOf(text: string, locale?: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });

    return [...segmenter.segment(text)].map((segment) => segment.segment);
  }

  return [...text];
}

/**
 * Text appearing one character at a time.
 *
 * The whole string is in the document from the first frame — in a clipped box
 * for a screen reader, which reads it once and is not made to sit through the
 * performance — and what animates is a visible copy that is `aria-hidden`. So
 * the effect costs a reader who cannot see it nothing, and costs a reader who
 * can nothing either: the box is not laid out from the characters that have
 * arrived, so the text around it does not reflow on every frame.
 *
 * `repeat`, `hold` and `erase` are what make it a loop: type, hold, delete,
 * type again. Without `erase` a repeat clears in one frame, which is right for
 * a line that is being replaced rather than rewritten.
 *
 * Only **text** is typed. Pass a string, or strings; an element among the
 * children contributes its text and nothing about its markup, because there is
 * no honest way to reveal half of a link.
 */
export const MPAnimateTyping = React.forwardRef<HTMLDivElement, MPAnimateTypingProps>(
  function MPAnimateTyping(
    {
      text,
      speed = 24,
      hold = 1400,
      erase = false,
      eraseSpeed,
      caret = true,
      caretChar = '|',
      duration,
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
    const run = useAnimationRun({
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat)
    });
    const reduced = usePrefersReducedMotion();

    const source = text ?? textOf(children);
    const graphemes = React.useMemo(() => graphemesOf(source), [source]);
    const total = graphemes.length;

    const [shown, setShown] = React.useState(0);

    /**
     * How far along it is, outside React's state.
     *
     * The typing loop is a chain of timeouts rather than a render, so pausing
     * tears it down and resuming builds a new one — and a new one has to know
     * where the old one stopped. Reading `shown` would put the effect in a loop
     * with its own output.
     */
    const progress = React.useRef(0);

    /**
     * `duration` is honoured as the time for the whole string, because a caller
     * who has set a duration on every other `MPAnimate*` will reach for it here
     * too. `speed` is the natural unit for a typewriter — a long paragraph and
     * a short one should be typed at the same pace, not in the same time — so
     * it is the default and the duration overrides it.
     */
    const typeDelay = duration && total > 0 ? duration / total : 1000 / Math.max(speed, 1);
    const deleteDelay = 1000 / Math.max(eraseSpeed ?? speed * 2, 1);

    // A new string starts a new performance rather than continuing the last.
    React.useEffect(() => {
      progress.current = 0;
    }, [total]);

    React.useEffect(() => {
      if (reduced || total === 0) {
        // Not "nothing happens" — the text is simply there, which is the only
        // outcome that still delivers what the component was carrying.
        setShown(total);

        return;
      }

      if (!run.started) {
        // Waiting is empty, not finished: a typewriter that showed its whole
        // string until it scrolled into view and then blanked would be worse
        // than no effect at all.
        progress.current = 0;
        setShown(0);

        return;
      }

      if (paused) {
        return;
      }

      let cancelled = false;
      let timer: ReturnType<typeof setTimeout>;
      let count = progress.current;
      let pass = 1;
      let deleting = false;

      const passes = repeat === 'infinite' ? Infinity : Math.max(1, repeat);

      if (count >= total && passes === 1) {
        return;
      }

      const step = () => {
        if (cancelled) {
          return;
        }

        if (deleting) {
          count -= 1;
          progress.current = count;
          setShown(count);

          if (count <= 0) {
            deleting = false;
            pass += 1;
          }

          timer = setTimeout(step, deleting ? deleteDelay : typeDelay);

          return;
        }

        count += 1;
        progress.current = count;
        setShown(count);

        if (count < total) {
          timer = setTimeout(step, typeDelay);

          return;
        }

        if (pass >= passes) {
          return;
        }

        if (erase) {
          deleting = true;
          timer = setTimeout(step, hold);

          return;
        }

        pass += 1;
        timer = setTimeout(() => {
          if (cancelled) {
            return;
          }

          count = 0;
          progress.current = 0;
          setShown(0);
          timer = setTimeout(step, typeDelay);
        }, hold);
      };

      setShown(count);
      // Resuming picks up at the next character; starting waits out the delay.
      timer = setTimeout(step, count === 0 ? delay : typeDelay);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, [run.started, paused, reduced, total, typeDelay, deleteDelay, delay, hold, erase, repeat]);

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
        data-mp-animation="typing"
        data-mp-state={run.state}
        {...run.handlers}
        {...props}
      >
        <span className={VISUALLY_HIDDEN}>{source}</span>
        <span aria-hidden="true" className="whitespace-pre-wrap">
          {graphemes.slice(0, shown).join('')}
          {caret ? <span className="mp-typing-caret">{caretChar}</span> : null}
        </span>
      </div>
    );
  }
);
