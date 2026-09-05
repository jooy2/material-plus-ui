import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { ArrowDownIcon, ArrowUpIcon, RemoveIcon } from '../../constants/icons';
import { useMPLocale } from '../../internal/locale';
import { useMPSize } from '../../internal/config';
import { COMPACT_FROM, deltaOf, formatStatistic } from '../../internal/chart';
import { META_TEXT, hasContent } from '../../internal/scale';
import type { MPAlign, MPSize, MPSlots } from '../../types';

/** How the move from `previousValue` is written. */
export type MPStatisticDeltaFormat = 'percent' | 'absolute' | 'both' | 'none';

/** The parts an `MPStatistic` draws that a `className` cannot reach. */
export type MPStatisticSlot = 'label' | 'value' | 'delta' | 'caption' | 'trend';

export interface MPStatisticProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'prefix' | 'color'
> {
  /** What the figure is. Sentence case, and no trailing colon. */
  label?: React.ReactNode;
  /**
   * The figure.
   *
   * A number is written by `locale` and `format`; anything else is drawn as it
   * is, for a value that is already a string — `"2h 14m"`, `"A+"` — or a piece
   * of markup.
   */
  value: React.ReactNode;
  /**
   * How a numeric `value` is written. An `Intl.NumberFormat` options object, and
   * giving one turns `compact` off: a caller who has asked for a currency has
   * said what they want.
   */
  format?: Intl.NumberFormatOptions;
  /**
   * Shortens a number of five digits or more — `12.9K`, `4.2M`.
   *
   * Four digits stay: `1,284` is a figure anybody takes in at a glance, and
   * `1.3K` has thrown away two of them to save two characters.
   * @default true
   */
  compact?: boolean;
  /** Which language the figure and the move are written in. */
  locale?: string;
  /** Placed before the figure, on the same line — a currency mark, an icon. */
  prefix?: React.ReactNode;
  /** Placed after it, one step smaller — a unit, a denominator. */
  unit?: React.ReactNode;
  /** What the figure was, so the move from it can be drawn. */
  previousValue?: number;
  /**
   * How that move is written.
   * @default 'percent'
   */
  delta?: MPStatisticDeltaFormat;
  /**
   * Which direction is the good one.
   *
   * It is a prop and not an assumption because half the figures on a dashboard
   * are the other way round: churn, latency, cost and error rate are all better
   * when they fall, and a component that painted every fall red would be lying
   * about four tiles in eight.
   * @default 'up'
   */
  betterWhen?: 'up' | 'down';
  /** What the move is measured against — "vs last week". Read out with it. */
  period?: React.ReactNode;
  /** A line under the figure, for the thing that does not fit anywhere else. */
  caption?: React.ReactNode;
  /**
   * Room under the figure for a picture of it — a sparkline, usually.
   *
   * A slot rather than a chart of its own: a statistic that owned a sparkline
   * would be a statistic that had opinions about a second component's data
   * shape, and the two are separable.
   */
  trend?: React.ReactNode;
  /** @default 'start' */
  align?: MPAlign;
  /** @default 'md' */
  size?: MPSize;
  classNames?: MPSlots<MPStatisticSlot>;
}

/**
 * What the figure is set in.
 *
 * MD3's title, headline and display scales, because this is the one number on
 * the tile and the whole point of it is to be read from across a desk. A
 * dashboard's single leading figure wants `xl` — `display-small` is 36px, and
 * the rungs below it are tile-sized rather than hero-sized.
 */
const VALUE_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-title-medium',
  sm: 'text-mp-title-large',
  md: 'text-mp-headline-small',
  lg: 'text-mp-headline-medium',
  xl: 'text-mp-display-small'
};

/** The label above it, and the caption under. */
const LABEL_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-small',
  sm: 'text-mp-label-medium',
  md: 'text-mp-label-large',
  lg: 'text-mp-title-small',
  xl: 'text-mp-title-medium'
};

const ALIGN: Record<MPAlign, string> = {
  start: 'items-start text-start',
  center: 'items-center text-center',
  end: 'items-end text-end'
};

/**
 * One figure, said once and read from across a desk.
 *
 * ```tsx
 * <MPStatistic label="Active installs" value={128400} previousValue={119200} />
 * ```
 *
 * It is the chart you draw when there is nothing to plot. A single number has no
 * shape, no order and no second dimension, and putting it on a pair of axes to
 * make it look like data is the most common way a dashboard wastes a panel. What
 * a reader wants from one figure is the figure, what it is, and whether it is
 * going the right way.
 *
 * ## The direction is the caller's to say
 *
 * `betterWhen` exists because half the figures on any dashboard are the other
 * way round — churn, latency, cost and error rate are all better when they fall.
 * A component that painted every fall red would be wrong about four tiles in
 * eight, and it would be wrong *confidently*, in the one colour a reader trusts
 * without checking.
 *
 * Flat is a third state rather than a quiet "up". It takes the muted ink and a
 * dash, because a figure that has not moved has not done anything good either.
 *
 * ## The figure does not wear the direction's colour
 *
 * Only the move does. The number itself is `on-surface` at every size, in every
 * state: it is the thing being reported, and a reported value that changes
 * colour with its own trend is a value the reader has to decode before they can
 * read it.
 */
export function MPStatistic({
  label,
  value,
  format,
  compact = true,
  locale: localeProp,
  prefix,
  unit,
  previousValue,
  delta = 'percent',
  betterWhen = 'up',
  period,
  caption,
  trend,
  align = 'start',
  size: sizeProp,
  className,
  classNames,
  ...props
}: MPStatisticProps) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);

  const written =
    typeof value === 'number' ? formatStatistic(value, locale, format, compact) : value;

  const move =
    typeof value === 'number' && typeof previousValue === 'number' && delta !== 'none'
      ? deltaOf(value, previousValue, betterWhen)
      : null;

  const percent =
    move?.percent === null || move === null
      ? null
      : new Intl.NumberFormat(locale, {
          style: 'percent',
          maximumFractionDigits: 1,
          signDisplay: 'exceptZero'
        }).format(move.percent / 100);

  const absolute =
    move === null
      ? null
      : new Intl.NumberFormat(locale, {
          ...(format ?? {}),
          signDisplay: 'exceptZero',
          ...(format
            ? {}
            : compact && Math.abs(move.absolute) >= COMPACT_FROM
              ? { notation: 'compact', maximumFractionDigits: 1 }
              : {})
        }).format(move.absolute);

  /*
   * What the move says, in the order the props ask for it. `percent` falls back
   * to the absolute when there is no percentage to give — a figure that was zero
   * has not grown by an amount, it has started, and every number that could be
   * printed there is one a reader would take at face value.
   */
  const writtenDelta =
    delta === 'absolute'
      ? absolute
      : delta === 'both'
        ? [absolute, percent].filter(Boolean).join(' · ')
        : (percent ?? absolute);

  const join = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');

  return (
    <div
      data-mp-size={size}
      className={join('mp-statistic flex min-w-0 flex-col gap-1', ALIGN[align], className)}
      {...props}
    >
      {hasContent(label) ? (
        <span
          className={join(
            'mp-statistic__label text-mp-on-surface-variant',
            LABEL_TEXT[size],
            classNames?.label
          )}
        >
          {label}
        </span>
      ) : null}

      {/*
        `tabular-nums` is deliberately absent. It gives every digit the width of
        a zero, which lines a column of figures up and makes a single large one
        look loose — and this is the single large one.
      */}
      <span
        className={join(
          'mp-statistic__value text-mp-on-surface flex items-baseline gap-1 font-medium',
          VALUE_TEXT[size],
          classNames?.value
        )}
      >
        {hasContent(prefix) ? <span className="shrink-0">{prefix}</span> : null}
        <span className="min-w-0 truncate">{written}</span>
        {hasContent(unit) ? (
          <span className={`text-mp-on-surface-variant shrink-0 ${LABEL_TEXT[size]}`}>{unit}</span>
        ) : null}
      </span>

      {move && writtenDelta ? (
        <span
          className={join(
            'mp-statistic__delta flex items-center gap-0.5',
            META_TEXT,
            // Flat takes the muted ink: a figure that has not moved has not done
            // anything good either.
            move.direction === 0
              ? 'text-mp-on-surface-variant'
              : move.good
                ? 'text-mp-tertiary'
                : 'text-mp-error',
            classNames?.delta
          )}
          data-mp-direction={move.direction === 0 ? 'flat' : move.direction === 1 ? 'up' : 'down'}
        >
          {/*
            The glyph is the second channel for a reader who can see it, and it
            is why the colour is allowed to carry meaning at all: up, down and
            flat are three shapes as well as three colours, so the tile still
            says which way it went in grayscale and in forced colours.

            It stays `aria-hidden`, and there is no sentence behind it, because
            the number beside it already carries a sign — `signDisplay` is
            `exceptZero`, so a move is always "+7.7%" or "−7.7%" and a flat one
            is a plain zero. A screen reader that also heard "up" would hear the
            direction twice, in two vocabularies, one of them untranslated.
          */}
          <MPIcon
            icon={
              move.direction === 0 ? RemoveIcon : move.direction === 1 ? ArrowUpIcon : ArrowDownIcon
            }
            size={14}
          />
          <span>{writtenDelta}</span>
          {hasContent(period) ? <span className="text-mp-on-surface-variant">{period}</span> : null}
        </span>
      ) : null}

      {hasContent(caption) ? (
        <span
          className={join(
            'mp-statistic__caption text-mp-on-surface-variant',
            META_TEXT,
            classNames?.caption
          )}
        >
          {caption}
        </span>
      ) : null}

      {hasContent(trend) ? (
        <div className={join('mp-statistic__trend w-full', classNames?.trend)}>{trend}</div>
      ) : null}
    </div>
  );
}
