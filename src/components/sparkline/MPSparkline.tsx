import * as React from 'react';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { useMPSize } from '../../internal/config';
import { fillMessage } from '../../internal/i18n';
import { SPARKLINE } from '../../internal/messages/sparkline';
import { TABLE } from '../../internal/messages/table';
import { cssLength } from '../../internal/length';
import {
  areaPath,
  barPath,
  extentOf,
  linePath,
  seriesColor,
  type PlotPoint
} from '../../internal/chart';
import type { MPChartCurve, MPColor, MPSize } from '../../types';

/** What the series is drawn as. */
export type MPSparklineShape = 'line' | 'area' | 'bar';

export interface MPSparklineProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /**
   * The series, oldest first. A `null` is a gap — a point nothing was measured
   * at — and it breaks the line rather than being joined across.
   */
  data: readonly (number | null)[];
  /** @default 'line' */
  shape?: MPSparklineShape;
  /** How the line between two points is drawn. @default 'linear' */
  curve?: MPChartCurve;
  /**
   * Marks the newest point.
   *
   * On by default, and it is most of what makes a sparkline readable: the whole
   * shape is context for the last value, and without the dot a reader has to
   * work out which end is now.
   * @default true
   */
  endDot?: boolean;
  /** The value the area or the bars are measured from. @default the series' floor */
  baseline?: number;
  /** Pins the bottom of the scale, so two sparklines can be compared. */
  min?: number;
  /** And the top. */
  max?: number;
  /** How wide. A number is pixels; a string is any CSS length. @default '100%' */
  width?: number | string;
  /** How tall. Defaults to the `size` ladder. */
  height?: number;
  /**
   * Which accent family the mark reads, or any CSS colour. Left out, it takes
   * the first slot of the chart palette.
   */
  color?: MPColor | (string & {});
  /**
   * What the shape says, for a reader who cannot see it.
   *
   * Left out, the component writes one from the numbers — how many points, the
   * range they cover, and which way it ended. See the note on the component for
   * why that is the whole of its accessibility rather than a hover layer.
   */
  label?: string;
  /** Which language the generated label is written in. */
  locale?: string;
  /** @default 'md' */
  size?: MPSize;
}

/**
 * How tall, when nothing says otherwise.
 *
 * A sparkline is a glyph in a line of text or a strip under a figure, so the
 * ladder is set against the type it sits with rather than against the control
 * ladder. `md` at 32 is a little over two lines of `body-medium`, which is the
 * most a shape can take before it stops being a mark and starts being a chart.
 */
const HEIGHT: Record<MPSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 44,
  xl: 56
};

/** How heavy the stroke is. Two pixels at `md`, which is the chart line weight. */
const STROKE: Record<MPSize, number> = {
  xs: 1.25,
  sm: 1.5,
  md: 2,
  lg: 2.5,
  xl: 3
};

/** The gap the surface shows through between two touching bars. */
const BAR_GAP = 2;

/**
 * A series as a mark, with no axes and nothing to read a value against.
 *
 * ```tsx
 * <MPSparkline data={[12, 15, 14, 19, 22, 21, 27]} />
 * ```
 *
 * It answers one question — which way has this been going — and it answers it in
 * the space of a word. That is the whole of its job: put it beside the number it
 * is the history of, in a table cell, in a list row, in an
 * [MPStatistic](statistic)'s `trend`.
 *
 * ## It has no hover layer, on purpose
 *
 * Every other chart in this library ships one, because a chart is something a
 * reader interrogates. A sparkline is not. It is thirty pixels tall, it has no
 * axis to read a value against, and a floating card over a mark that size covers
 * the mark. A reader who needs the numbers needs [MPLineChart](line-chart), and
 * a reader who needs one number has it in the figure this is sitting under.
 *
 * What it does have is a **sentence**. The accessible name says the shape in
 * words — how many points, the range, and which way it ended — so the thing a
 * sighted reader gets from the outline is a thing every reader gets. That is the
 * relief channel, and it is a better one than a tooltip nobody can hover on a
 * phone.
 *
 * ## The line is quiet and the end is not
 *
 * The stroke takes a faded step of its colour and the end dot takes the whole
 * of it. The history is context; the last value is the point. Drawn at one
 * weight throughout, a sparkline is a shape with no emphasis in it, and the eye
 * has to find the end for itself.
 */
export const MPSparkline = React.forwardRef<HTMLDivElement, MPSparklineProps>(function MPSparkline(
  {
    data,
    shape = 'line',
    curve = 'linear',
    endDot = true,
    baseline,
    min,
    max,
    width = '100%',
    height: heightProp,
    color,
    label,
    locale: localeProp,
    size: sizeProp,
    className,
    style,
    ...props
  }: MPSparklineProps,
  ref
) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(SPARKLINE, locale);
  const table = useMPMessages(TABLE, locale);
  const height = heightProp ?? HEIGHT[size];
  const stroke = STROKE[size];
  const paint = seriesColor(0, color);

  /*
   * The box the shape is drawn in is the viewBox, not the element: the SVG is
   * `preserveAspectRatio="none"`, so a hundred points and eight both fill
   * whatever room the caller gave. A sparkline is read for its shape rather
   * than its gradient, and one that got narrower as the series grew would be
   * a mark that changed meaning with its own length.
   */
  const boxWidth = 100;
  const boxHeight = height;
  const inset = shape === 'bar' ? 0 : stroke / 2;

  const extent = extentOf(data, min, max);
  const span = extent.max - extent.min;
  const yOf = (value: number) =>
    boxHeight - inset - ((value - extent.min) / span) * (boxHeight - inset * 2);

  const step = data.length > 1 ? boxWidth / (data.length - 1) : 0;
  const points: PlotPoint[] = data.map((value, index) =>
    value === null || !Number.isFinite(value)
      ? null
      : { x: data.length > 1 ? index * step : boxWidth / 2, y: yOf(value) }
  );

  const floor = baseline ?? extent.min;
  const last = [...points].reverse().find((point) => point !== null) ?? null;

  /**
   * The shape in words.
   *
   * Generated rather than required, because a component that says nothing
   * without a prop is a component that says nothing.
   *
   * The two **ends** rather than the two extremes: what a reader wants from a
   * sparkline is the direction, and "120 to 400" says which way it went where
   * "90 to 410" does not. It is the numbers and not a reading of them — a
   * sentence saying "improving" would be a claim this has no way to make.
   */
  const spoken = React.useMemo(() => {
    if (label !== undefined) {
      return label;
    }

    const real = data.filter((v): v is number => v !== null && Number.isFinite(v));

    if (real.length === 0) {
      return table.empty;
    }

    const number = new Intl.NumberFormat(locale);

    return fillMessage(messages.summary, {
      count: number.format(real.length),
      first: number.format(real[0]),
      last: number.format(real[real.length - 1])
    });
  }, [label, data, locale, messages.summary, table.empty]);

  return (
    <div
      ref={ref}
      data-mp-size={size}
      className={['mp-sparkline block', className ?? ''].filter(Boolean).join(' ')}
      style={{ width: cssLength(width), ...style }}
      {...props}
    >
      <svg
        role="img"
        aria-label={spoken}
        viewBox={`0 0 ${boxWidth} ${boxHeight}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {shape === 'bar' ? (
          data.map((value, index) => {
            if (value === null || !Number.isFinite(value)) {
              return null;
            }

            const slot = boxWidth / data.length;
            const thickness = Math.max(0.5, slot - BAR_GAP);
            const base = yOf(floor);
            const top = yOf(value);

            return (
              <path
                key={index}
                d={barPath(
                  index * slot + (slot - thickness) / 2,
                  Math.min(top, base),
                  thickness,
                  Math.abs(base - top),
                  // The corner is a fraction of the slot rather than a fixed
                  // 4px: the viewBox is 100 wide whatever the element is, so a
                  // pixel here is not a pixel on screen.
                  thickness / 3,
                  value >= floor ? 'top' : 'bottom'
                )}
                fill={paint}
                // Only the newest bar is the point; the rest are the history.
                opacity={endDot && index === data.length - 1 ? 1 : 0.55}
              />
            );
          })
        ) : (
          <>
            {shape === 'area' ? (
              <path d={areaPath(points, yOf(floor), curve)} fill={paint} opacity={0.16} />
            ) : null}

            <path
              d={linePath(points, curve)}
              fill="none"
              stroke={paint}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              // The stroke is drawn in the viewBox's units and the box is
              // scaled to fit, so a wide element would stretch the line
              // horizontally and leave it thin. This is what keeps two pixels
              // two pixels.
              vectorEffect="non-scaling-stroke"
              opacity={0.55}
            />
          </>
        )}

        {endDot && last && shape !== 'bar' ? (
          <path
            // Not a `<circle>`: a radius is in viewBox units, and the box is
            // stretched to fit, so the dot would come out an ellipse as wide
            // as the element. A zero-length stroke with a round cap is a
            // circle at any scale, and `non-scaling-stroke` is what fixes its
            // size in pixels.
            d={`M${last.x} ${last.y}h0`}
            stroke={paint}
            strokeWidth={stroke * 2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
    </div>
  );
});
