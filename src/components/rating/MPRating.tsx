import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { StarIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { fillMessage, type MPMessages } from '../../internal/i18n';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { RATING } from '../../internal/messages/rating';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize } from '../../types';

/** The words the control says on its own behalf. */
export type MPRatingLabels = MPMessages['rating'];

/**
 * One star's height, in CSS pixels.
 *
 * A glyph ladder rather than the control-height one: a star has no label beside
 * it and no container around it, so the thing being sized *is* the drawing —
 * the same reason [MPIcon](../display/icon) takes a length rather than a rung.
 * `md` is 24, which is what every other icon in the library draws at.
 */
const STAR: Record<MPSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 30,
  xl: 36
};

/** Between the stars. Close enough to read as one row, not as five glyphs. */
const ROW_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5'
};

export interface MPRatingProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /** The score. Use with `onValueChange` for a controlled rating. */
  value?: number;
  /**
   * Where an uncontrolled rating starts.
   * @default 0
   */
  defaultValue?: number;
  /** Called with the new score. `0` is what a cleared rating reports. */
  onValueChange?: (value: number) => void;
  /**
   * How many stars there are, and therefore the highest score.
   * @default 5
   */
  count?: number;
  /**
   * The smallest step that can be *chosen*, as a fraction of one star — `0.5`
   * gives half stars, `1` whole ones. Anything outside `0 < precision <= 1`
   * falls back to `1`.
   *
   * It bounds what a reader can pick and nothing else. A `value` of `4.3` is
   * drawn as four stars and a third at every precision, because an average is
   * not a choice and rounding it to the nearest half would be reporting a
   * different number from the one the component was handed.
   * @default 1
   */
  precision?: number;
  /** The glyph a filled star is drawn with. */
  icon?: React.ReactNode;
  /** And the one an empty star is drawn with. It has to be the same shape. */
  emptyIcon?: React.ReactNode;
  /**
   * Choosing the score that is already chosen clears it back to `0`.
   * @default true
   */
  clearable?: boolean;
  /**
   * Shows the score without letting it be changed — a product's average, a
   * rating somebody else left.
   *
   * **This is the one `readOnly` in the library that does not drain the
   * saturation.** It is not a control being held still: there are no inputs at
   * all, and what is left is a picture of a number. A row of grey stars would
   * say the score itself was unavailable.
   * @default false
   */
  readOnly?: boolean;
  /** Unavailable. Drops the accent for the specification's disabled ink. */
  disabled?: boolean;
  /** Identifies the value when a form is submitted. */
  name?: string;
  /** A form will not submit until a star has been chosen. */
  required?: boolean;
  /**
   * One star's height, on the glyph ladder. `md` is 24dp.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the filled stars read.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Which language the spoken names are written in — a BCP 47 tag such as `ko`,
   * `pt-BR` or `zh-Hant`. Unsupported tags fall back to English.
   */
  locale?: string;
  /** Overrides for the words themselves. They win over the translation. */
  labels?: Partial<MPRatingLabels>;
  /**
   * Publishes the score as schema.org `Rating` microdata, which is what a search
   * engine reads to draw stars beside a result.
   *
   * `readOnly` only, and that is the whole of the rule: a score somebody is
   * still choosing is not a fact about anything, and marking up an empty control
   * as a rating of nought is telling a crawler something untrue about the page.
   *
   * ## It has to be placed inside what it rates
   *
   * Microdata is nesting, and this component cannot know what it is nested in —
   * only the page does. So it emits the `Rating` and its three values, and the
   * `itemProp` naming the relationship is yours to pass:
   *
   * ```tsx
   * <div itemScope itemType="https://schema.org/Product">
   *   <h2 itemProp="name">A kettle</h2>
   *   <MPRating readOnly value={4.3} structuredData itemProp="aggregateRating" />
   * </div>
   * ```
   *
   * `aggregateRating` also wants a `ratingCount` or a `reviewCount` beside it
   * before a search engine will draw anything, and that number is the page's
   * rather than this control's.
   * @default false
   */
  structuredData?: boolean;
}

/**
 * A score out of five, as a row of stars.
 *
 * Underneath an interactive rating is a radio group of real `<input>`s, one per
 * choosable score, each visually hidden under the half of a star it stands for.
 * That is the whole accessibility argument: a rating *is* "exactly one of
 * these", so it gets one tab stop for the row, the arrow keys within it,
 * `aria-checked` on the one that is taken and a value in a form submission —
 * none of which a row of `<button>`s or a `<div>` with a click handler would
 * have, and all of which the browser gives for free.
 *
 * The fraction is drawn by laying the filled star over the empty one and
 * clipping it to a percentage of the width. Nothing is transformed and no glyph
 * is scaled, so a half star is the left half of exactly the star beside it. The
 * clip runs from the inline start, so it fills from the right under RTL with
 * nothing being told to.
 *
 * `readOnly` is a different component in the same clothes: no inputs, no radio
 * group, and one `role="img"` carrying the score as a sentence. A star display
 * that kept twenty focusable radios would be twenty tab stops on a page that was
 * only reporting a number.
 *
 * ## Why the stars are not amber
 *
 * Because there is no amber in this library's colour system. MD3 defines four
 * accent families — `primary`, `secondary`, `tertiary` and `error` — and a fifth
 * colour hardcoded here would be one the token sheet has no name for and a theme
 * has no way to change. A product whose stars must be gold sets
 * `--mp-sys-color-tertiary` to gold and asks for `color="tertiary"`, which is the
 * same answer this library gives everywhere else.
 */
export const MPRating = React.forwardRef<HTMLDivElement, MPRatingProps>(function MPRating(
  {
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    count = 5,
    precision = 1,
    icon,
    emptyIcon,
    clearable = true,
    readOnly = false,
    disabled = false,
    name: nameProp,
    required = false,
    size: sizeProp,
    color: colorProp,
    locale: localeProp,
    labels,
    structuredData = false,
    className,
    style,
    onPointerLeave,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(RATING, locale, labels);

  const generatedName = React.useId();
  const name = nameProp ?? generatedName;

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolled;

  // What the pointer is currently promising, which is not the value until it is
  // clicked. `null` is "the pointer is not on the row", not "nought stars".
  const [hovered, setHovered] = React.useState<number | null>(null);

  const stars = Math.max(1, Math.floor(count));
  const step = precision > 0 && precision <= 1 ? precision : 1;
  const stepsPerStar = Math.round(1 / step);
  const shown = Math.max(0, Math.min(stars, hovered ?? value));

  const describe = (score: number) =>
    score <= 0
      ? messages.empty
      : // `String` rather than `Intl.NumberFormat`: a score is a small number
        // with at most one decimal, and a format that depends on the runtime's
        // own locale is text that differs between the server that rendered it
        // and the browser that hydrated it.
        fillMessage(messages.value, { value: String(score), max: String(stars) });

  const change = (next: number) => {
    if (!controlled) {
      setUncontrolled(next);
    }

    onValueChange?.(next);
  };

  const glyph = (filled: boolean) => {
    const fallback = (
      <MPIcon
        icon={StarIcon}
        size={STAR[size]}
        // Lucide draws its star `fill="none"`; a CSS `fill` outranks a
        // presentation attribute, so one glyph covers both states and the
        // library ships no second drawing.
        className={filled ? '[&>svg]:fill-current' : ''}
      />
    );

    return (filled ? icon : emptyIcon) ?? fallback;
  };

  const marks = Array.from({ length: stars }, (_, index) => {
    // How much of *this* star is filled, from 0 to 1.
    const fill = Math.max(0, Math.min(1, shown - index));

    return (
      <span
        key={index}
        className={[
          'mp-rating__star relative inline-flex shrink-0',
          'rounded-mp-xs',
          readOnly || disabled
            ? ''
            : [
                'outline-mp-secondary has-[:focus-visible]:outline-2',
                'has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid'
              ].join(' ')
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: STAR[size], height: STAR[size] }}
      >
        <span
          className={[
            'flex items-center justify-center',
            disabled ? 'text-mp-on-surface/38' : 'text-mp-outline'
          ].join(' ')}
          style={{ width: STAR[size], height: STAR[size] }}
        >
          {glyph(false)}
        </span>

        {/*
         * The filled copy, clipped to the fraction.
         *
         * `inset-inline-start` and a width rather than a `clip-path` with a
         * percentage in it, because the inner star has to keep its own full
         * width or the glyph would be squashed into the visible part instead of
         * cropped by it.
         *
         * The clip *travels*. The colour under it has eased since this was
         * written and the width it was clipped to jumped, so the one thing that
         * actually says what the score is arrived in a single frame while the
         * thing that says nothing took 200ms.
         *
         * `short2` rather than the library's usual `short4`, for the reason
         * `MPSlider`'s handle takes it: a rating follows a pointer sweeping
         * across it, and at 200ms per star the fill would be a step behind the
         * cursor for the whole of the sweep. At 100ms it reads as a wipe
         * arriving under the pointer, which is what it is.
         */}
        <span
          aria-hidden="true"
          className={[
            'mp-rating__fill pointer-events-none absolute inset-y-0 start-0 overflow-hidden',
            'transition-[width] duration-(--mp-sys-motion-duration-short2) ease-mp-standard',
            'motion-reduce:transition-none'
          ].join(' ')}
          style={{ width: `${fill * 100}%` }}
        >
          <span
            className={[
              'flex items-center justify-center',
              'transition-colors duration-(--mp-sys-motion-duration-short4)',
              disabled ? 'text-mp-on-surface/38' : 'text-(--_mp-accent)'
            ].join(' ')}
            style={{ width: STAR[size], height: STAR[size] }}
          >
            {glyph(true)}
          </span>
        </span>

        {readOnly
          ? null
          : Array.from({ length: stepsPerStar }, (_, part) => {
              const score = Number((index + (part + 1) * step).toFixed(4));

              return (
                <label
                  key={score}
                  className={['absolute inset-y-0', disabled ? '' : 'cursor-pointer'].join(' ')}
                  style={{
                    insetInlineStart: `${(part * 100) / stepsPerStar}%`,
                    width: `${100 / stepsPerStar}%`
                  }}
                  onPointerEnter={() => {
                    if (!disabled) {
                      setHovered(score);
                    }
                  }}
                >
                  <input
                    type="radio"
                    className={VISUALLY_HIDDEN}
                    name={name}
                    value={score}
                    checked={value === score}
                    disabled={disabled}
                    required={required}
                    aria-label={describe(score)}
                    onChange={() => change(score)}
                    // Clearing cannot ride on `change`: clicking a radio that is
                    // already checked fires a click and no change at all, and
                    // that click is exactly the gesture being listened for.
                    onClick={() => {
                      if (clearable && value === score) {
                        change(0);
                      }
                    }}
                  />
                </label>
              );
            })}
      </span>
    );
  });

  const classNames = [
    'mp-rating inline-flex items-center align-middle',
    ROW_GAP[size],
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const styles = { ...accentSlots(color), ...style };

  if (readOnly) {
    const shownValue = Math.max(0, Math.min(stars, value));

    return (
      <div
        ref={ref}
        // One image with a sentence for a name, rather than five glyphs and
        // twenty inputs. What is left here is a picture of a number.
        role="img"
        data-mp-size={size}
        aria-label={describe(shownValue)}
        // `itemProp` is deliberately not set here: only the page knows whether
        // this is an `aggregateRating`, a `reviewRating` or something else, and
        // it arrives through the rest props below.
        itemScope={structuredData || undefined}
        itemType={structuredData ? 'https://schema.org/Rating' : undefined}
        className={classNames}
        style={styles}
        onPointerLeave={onPointerLeave}
        {...props}
      >
        {/*
          The three numbers, as `<meta>` rather than as anything drawn: the stars
          are already the score for a reader who can see them and the label
          already is for one who cannot, so a fourth telling would be the markup
          reading itself out.

          `worstRating` is written out rather than left to default. It defaults
          to 1, and this control's floor is nought — a rating of 1 out of 5 means
          something different depending on which of the two a reader is assumed
          to have been offered.
        */}
        {structuredData ? (
          <React.Fragment>
            <meta itemProp="ratingValue" content={String(shownValue)} />
            <meta itemProp="bestRating" content={String(stars)} />
            <meta itemProp="worstRating" content="0" />
          </React.Fragment>
        ) : null}

        {marks}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      data-mp-size={size}
      aria-label={messages.label}
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      className={classNames}
      style={styles}
      onPointerLeave={(event) => {
        setHovered(null);
        onPointerLeave?.(event);
      }}
      {...props}
    >
      {marks}
    </div>
  );
});
