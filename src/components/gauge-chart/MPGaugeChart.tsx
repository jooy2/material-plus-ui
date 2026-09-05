import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { useMPElementSize } from '../../hooks/useMPElementSize';
import { useMPColor, useMPSize } from '../../internal/config';
import { useMPLocale } from '../../internal/locale';
import { accentSlots } from '../../internal/accent';
import { thresholdColor } from '../../internal/threshold';
import { progressFraction } from '../../internal/progress';
import { CHART_FONT_SIZE, PLOT_HEIGHT, arcPath, formatStatistic } from '../../internal/chart';
import { cssLength } from '../../internal/length';
import { META_TEXT } from '../../internal/scale';
import type { MPColor, MPSize, MPThreshold } from '../../types';

export interface MPGaugeChartProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /** The reading. */
  value: number;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /**
   * How far round the dial goes, in degrees, centred on twelve o'clock.
   *
   * `180` is a half dial sitting on its base; `240` is the classic gauge, open
   * at the bottom. Past about 300 the two ends meet and the reader can no
   * longer tell the start from the finish.
   * @default 240
   */
  sweep?: number;
  /** What the reading is called, under the figure. */
  label?: React.ReactNode;
  /**
   * Where the reading changes colour. The last threshold it has reached wins,
   * so they are listed smallest first.
   */
  thresholds?: readonly MPThreshold[];
  /**
   * Paints the **track** in threshold bands as well as the fill, so a reader
   * sees where the trouble starts before the needle gets there.
   * @default false
   */
  bands?: boolean;
  /** The family the dial carries before any threshold is reached. @default 'primary' */
  color?: MPColor;
  /** How the figure in the middle is written. */
  format?: Intl.NumberFormatOptions;
  /** Which language that figure is written in. */
  locale?: string;
  /** How tall the drawing is. Defaults to the `size` ladder. */
  height?: number | string;
  /** @default 'md' */
  size?: MPSize;
}

/** How thick the dial is, as a share of its radius. */
const THICKNESS = 0.22;

/** What the reading is set in. */
const VALUE_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-title-medium',
  sm: 'text-mp-title-large',
  md: 'text-mp-headline-small',
  lg: 'text-mp-headline-medium',
  xl: 'text-mp-display-small'
};

/**
 * One reading on a dial.
 *
 * ```tsx
 * <MPGaugeChart value={72} label="CPU" thresholds={[{ from: 80, color: 'error' }]} />
 * ```
 *
 * ## Consider not using one
 *
 * A gauge spends a whole panel on a single number, and the arc adds nothing a
 * reader could not get from the figure and a bar: an angle is judged less
 * accurately than a length, and a dial's ends are the two places the eye is
 * worst at. [MPStatistic](statistic) with an [MPMeter](../feedback/meter) under
 * it says the same thing in a third of the room and reads better.
 *
 * What a gauge is genuinely good for is a **thresholded** reading somebody
 * watches — a dial where the amber band is drawn on the face, so the question
 * "how close is this to trouble" is answered by where the needle sits rather
 * than by arithmetic. That is what `bands` is for, and it is the case worth
 * reaching for this shape over the other two.
 *
 * ## It is a meter, in the markup
 *
 * `role="meter"` with the value, the minimum and the maximum on it — the same
 * semantics [MPMeter](../feedback/meter) carries, because they are the same
 * quantity in two shapes. There is no table behind it and no hover layer: a
 * chart of one number has nothing a reader could uncover that the figure in the
 * middle is not already saying.
 *
 * ## Thresholds name roles
 *
 * `{ from: 80, color: 'error' }` and never a hex, so a dial and a bar on the
 * same page cannot disagree about where the amber starts. Both read the same
 * resolver.
 */
export function MPGaugeChart({
  value,
  min = 0,
  max = 100,
  sweep = 240,
  label,
  thresholds,
  bands = false,
  color: colorProp,
  format,
  locale: localeProp,
  height,
  size: sizeProp,
  className,
  style,
  ...props
}: MPGaugeChartProps) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const locale = useMPLocale(localeProp);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const measured = useMPElementSize(hostRef);

  const fraction = progressFraction(value, min, max) ?? 0;
  const family = thresholdColor(value, color, thresholds);

  const font = CHART_FONT_SIZE[size];
  const boxWidth = measured.width;
  const boxHeight =
    typeof height === 'number'
      ? height
      : height === undefined
        ? PLOT_HEIGHT[size]
        : measured.height;

  /*
   * Where the dial sits in its box.
   *
   * A sweep of 180 is a half dial standing on its base, so its centre is at the
   * bottom and the radius may take the whole height. Anything wider dips below
   * that line, and the centre rises by however much of the arc hangs under it —
   * measured rather than guessed, because a fixed offset leaves a 240° dial
   * floating and a 300° one clipped.
   */
  const turn = (Math.min(300, Math.max(30, sweep)) * Math.PI) / 180;
  const half = turn / 2;
  // How far the ends of the arc drop below the centre, as a share of the radius.
  const drop = half > Math.PI / 2 ? Math.cos(Math.PI - half) : 0;
  const room = Math.min(boxWidth / 2, boxHeight / (1 + drop));
  const outer = Math.max(0, room - 2);
  const inner = outer * (1 - THICKNESS);
  const cx = boxWidth / 2;
  const cy = outer + 2;

  const from = -half;
  const to = half;
  const at = from + fraction * turn;

  /** The track, cut into the bands the thresholds describe. */
  const segments = React.useMemo(() => {
    if (!bands || !thresholds || thresholds.length === 0) {
      return [{ from: 0, to: 1, color }];
    }

    const stops = [
      ...thresholds
        .map((one) => ({ at: progressFraction(one.from, min, max) ?? 0, color: one.color }))
        .filter((one) => one.at > 0 && one.at < 1)
        .sort((a, b) => a.at - b.at)
    ];

    const out: { from: number; to: number; color: MPColor }[] = [];
    let start = 0;
    let paint = color;

    for (const stop of stops) {
      out.push({ from: start, to: stop.at, color: paint });
      start = stop.at;
      paint = stop.color;
    }

    out.push({ from: start, to: 1, color: paint });

    return out;
  }, [bands, thresholds, color, min, max]);

  const written = formatStatistic(value, locale, format, false);

  return (
    <Meter.Root
      value={value}
      min={min}
      max={max}
      format={format}
      data-mp-size={size}
      className={['mp-gauge-chart flex min-w-0 flex-col items-center', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(family), ...style }}
      {...props}
    >
      <div
        ref={hostRef}
        className="mp-gauge-chart__dial relative w-full"
        style={{ height: cssLength(height) ?? PLOT_HEIGHT[size] }}
      >
        {boxWidth > 0 && outer > 0 ? (
          <svg
            width={boxWidth}
            height={boxHeight}
            viewBox={`0 0 ${boxWidth} ${boxHeight}`}
            aria-hidden="true"
            className="block overflow-visible"
          >
            {/* The track. One arc when there is nothing to band, and one per
                band when there is — the bands are the whole argument for this
                shape over a bar, so they are drawn on the face rather than
                being left for the fill to discover. */}
            {segments.map((band, index) => (
              <path
                key={index}
                d={arcPath(cx, cy, outer, inner, from + band.from * turn, from + band.to * turn)}
                // A wash rather than the family at full strength: the track is
                // where the reading is *not*, and a face as loud as the needle
                // is a face the needle disappears into.
                fill={bands ? `var(--_mp-color-${band.color})` : 'var(--_mp-color-on-surface)'}
                opacity={bands ? 0.22 : 0.12}
              />
            ))}

            {/* The reading. */}
            <path d={arcPath(cx, cy, outer, inner, from, at)} fill="var(--_mp-accent)" />

            {/* The two ends, so a dial that is empty or full still shows where
                its scale runs from and to. */}
            <path
              d={arcPath(cx, cy, outer, inner, from, from + 0.004 * turn)}
              fill="var(--_mp-color-outline)"
            />
            <path
              d={arcPath(cx, cy, outer, inner, to - 0.004 * turn, to)}
              fill="var(--_mp-color-outline)"
            />
          </svg>
        ) : null}

        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
          style={{ top: cy - inner * 0.45 }}
        >
          <Meter.Value
            className={`mp-gauge-chart__value text-mp-on-surface font-medium tabular-nums ${VALUE_TEXT[size]}`}
          >
            {/* Base UI's own default is the raw number, which is only right
                once somebody has said what the units are. */}
            {(formatted) => (format ? formatted : written)}
          </Meter.Value>

          {label ? (
            <Meter.Label
              className={`mp-gauge-chart__label text-mp-on-surface-variant ${META_TEXT}`}
              style={{ maxWidth: inner * 1.8 }}
            >
              {label}
            </Meter.Label>
          ) : null}
        </div>
      </div>

      {/* Room under the dial for whatever hangs below the centre, so the figure
          stays put and the box does not have to be sized by hand. */}
      {drop > 0 ? <span aria-hidden="true" style={{ height: font / 2 }} /> : null}
    </Meter.Root>
  );
}
