import * as React from 'react';
import {
  ANIMATION_CLASS,
  ANIM_BASE,
  animationSlots,
  isInfinite,
  slideOffsets,
  useAnimationRun
} from '../../internal/animate';
import { graphemesOf, textOf, wordsOf } from '../../internal/text';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPAnimateProps, MPAnimateTimelineProps, MPSide } from '../../types';

/** What a line is cut into before it is animated. */
export type MPAnimateSplitBy = 'word' | 'character';

export interface MPAnimateSplitProps
  extends
    MPAnimateProps,
    MPAnimateTimelineProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The text, when it is easier to pass than to nest. Overrides `children`. */
  text?: string;
  /**
   * Whether each piece is a word or a character.
   * @default 'word'
   */
  by?: MPAnimateSplitBy;
  /**
   * How long after one piece the next one starts, in milliseconds. This is the
   * whole effect.
   *
   * The default is right for words. Characters want a good deal less — there
   * are five or six times as many of them, and the same step turns a sentence
   * into something that takes four seconds to finish arriving.
   * @default 40
   */
  stagger?: number;
  /**
   * How much longer each piece takes than the one before it, in milliseconds.
   * Negative shortens instead, clamped at zero.
   * @default 0
   */
  durationStep?: number;
  /** Runs the line from the last piece to the first. */
  reverse?: boolean;
  /**
   * Which edge each piece drifts in from.
   * @default 'bottom'
   */
  from?: MPSide;
  /**
   * How far each piece travels. Short on purpose — a long travel over forty
   * pieces is a paragraph that is moving rather than a paragraph arriving.
   * @default '0.5rem'
   */
  distance?: number | string;
  /**
   * Fades each piece in as it settles.
   * @default true
   */
  fade?: boolean;
  /**
   * Which language the text is in, for deciding where a word ends. Only worth
   * setting where the answer is genuinely ambiguous; `Intl.Segmenter` reads the
   * script itself for most of them.
   */
  locale?: string;
  /** The text to split. Only text is split — see below. */
  children?: React.ReactNode;
}

export const MPAnimateSplit = React.forwardRef<HTMLDivElement, MPAnimateSplitProps>(
  /**
   * A line arriving a word or a character at a time.
   *
   * `MPAnimateAppear` for a string: the same settling, the same stagger, the
   * same shared helper underneath — over the pieces of a sentence rather than
   * over children a caller wrote out.
   *
   * What it adds beyond splitting is the part that is easy to get wrong and
   * invisible when you do.
   *
   * ## The pieces are cut where a reader would cut them
   *
   * Not `split(' ')`, and not `[...text]`. A word boundary is not a space
   * anywhere east of Myanmar — Japanese, Chinese and Thai write without them,
   * so splitting on whitespace hands back the whole sentence as one piece and
   * the effect silently does nothing, in exactly the languages where nobody
   * testing it would notice. And a code point is not a character: `👩‍👩‍👧` is
   * seven of them. `internal/text.ts` has the one answer to both.
   *
   * ## What a screen reader gets
   *
   * The whole line, once, out of a clipped box — and the animated copy is
   * `aria-hidden`. Without that, a line split into characters is announced as a
   * **list of letters**, and a reader who cannot see the effect is made to sit
   * through the performance to find out what the sentence said. Find-on-page
   * still matches the sentence, too.
   *
   * ## Characters stay inside their words
   *
   * A piece has to be `inline-block` for it to move at all — a transform does
   * nothing to a non-replaced inline box. That also makes it a break
   * opportunity, so a line split into characters would wrap mid-word. Each word
   * is therefore its own inline-block with the characters inside it, and the
   * line breaks where it always would.
   */
  function MPAnimateSplit(
    {
      text,
      by = 'word',
      duration,
      delay = 0,
      easing,
      repeat = 1,
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      timeline,
      range,
      stagger = 40,
      durationStep = 0,
      reverse = false,
      from = 'bottom',
      distance = '0.5rem',
      fade = true,
      locale,
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

    const state = timeline === 'view' ? (paused ? 'paused' : 'running') : run.state;
    const source = text ?? textOf(children);
    const { x, y } = slideOffsets(from, distance);

    /*
     * Cut into words first either way, so the line breaks where it always did.
     * In `character` mode each word is then cut again, and the word keeps its
     * role as the thing that does not break.
     */
    const words = wordsOf(source, locale);
    const pieces =
      by === 'character'
        ? words.map((word) => graphemesOf(word, locale))
        : words.map((word) => [word]);

    /*
     * `inline-block` is not cosmetic: a transform does nothing to a
     * non-replaced inline box, so a piece left inline would simply not move.
     * The word around it is the other half — an inline-block is a break
     * opportunity, so characters left loose would let a line wrap mid-word.
     */
    const itemClassName = `${ANIM_BASE} ${ANIMATION_CLASS.slide} inline-block`;
    const total = pieces.reduce((sum, word) => sum + word.length, 0);
    let index = -1;

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
        style={{ '--_mp-anim-state': state, ...style } as React.CSSProperties}
        data-mp-animation="split"
        data-mp-state={state}
        {...run.handlers}
        {...props}
      >
        <span className={VISUALLY_HIDDEN}>{source}</span>

        <span aria-hidden="true">
          {pieces.map((word, wordIndex) => (
            // `whitespace-pre` because `wordsOf` keeps the space that followed
            // each word *on* it, which is what lets the pieces still join back
            // to the original string.
            <span key={wordIndex} className="inline-block whitespace-pre">
              {word.map((piece, pieceIndex) => {
                index += 1;

                const step = reverse ? total - 1 - index : index;

                return (
                  <span
                    key={pieceIndex}
                    className={itemClassName}
                    style={animationSlots({
                      effect: 'slide',
                      duration,
                      delay: delay + step * stagger,
                      easing,
                      repeat,
                      alternate,
                      durationOffset: step * durationStep,
                      timeline,
                      range,
                      x,
                      y,
                      opacity: fade ? 0 : 1
                    })}
                  >
                    {piece}
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </div>
    );
  }
);
