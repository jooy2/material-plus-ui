import * as React from 'react';
import { CartesianFrame } from '../../internal/ChartFrame';
import { ChartTable, type ChartBaseProps } from '../../internal/ChartChrome';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { CHART } from '../../internal/messages/chart';
import { TABLE } from '../../internal/messages/table';
import { formatTimeTick, timeScale } from '../../internal/time-scale';
import {
  BAR_RADIUS,
  CHART_FONT_SIZE,
  MARK_GAP,
  barPath,
  seriesColor,
  textWidth,
  toNumber,
  type ChartValue
} from '../../internal/chart';
import type { MPChartAxis, MPTimelineSeries } from '../../types';

/** No `legend`: the rows are the axis, so there is nothing for one to identify. */
export interface MPTimelineChartProps extends Omit<ChartBaseProps, 'legend'> {
  /** The rows, top to bottom. Each carries its own spans. */
  series: readonly MPTimelineSeries[];
  /** The row axis. */
  yAxis?: MPChartAxis;
  /** The time axis. */
  xAxis?: MPChartAxis;
  /**
   * Writes each span's label inside it, where the span is wide enough to hold
   * the text. One that does not fit is dropped rather than clipped.
   * @default true
   */
  spanLabels?: boolean;
}

/** How much of a row's band a span takes. */
const ROW_FILL = 0.62;

/**
 * Whether a span's label has room inside its own bar.
 *
 * Measured and dropped rather than clipped. The first version clipped with a
 * `clip-path: inset()`, which on an SVG `<text>` resolves against the *text's*
 * bounding box rather than the bar's — so every inset wider than the label
 * removed it entirely, and the two that survived showed two letters each.
 *
 * Markup is drawn without asking. A caller who passed an element has taken
 * responsibility for its width, and there is nothing here to measure.
 */
function fits(label: React.ReactNode, width: number, font: number): boolean {
  if (label === undefined || label === null || label === false || label === '') {
    return false;
  }

  if (typeof label !== 'string' && typeof label !== 'number') {
    return true;
  }

  return width >= textWidth(String(label), font) + 16;
}

/**
 * What ran when, one row per thing.
 *
 * ```tsx
 * <MPTimelineChart
 *   series={[
 *     { name: 'Build', data: [{ start: new Date('2026-03-02'), end: new Date('2026-03-05') }] },
 *     { name: 'Test', data: [{ start: new Date('2026-03-05'), end: new Date('2026-03-09') }] }
 *   ]}
 * />
 * ```
 *
 * A Gantt: rows down the side, time along the bottom, and a bar for every
 * stretch. What it encodes is a **duration and its place**, which is the one
 * question the other charts cannot be asked — every one of them has a mark at a
 * single point on the value axis, and a span has two ends.
 *
 * ## The axis is a calendar, not a number line
 *
 * The 1-2-5-10 steps every other chart's value axis uses are exactly wrong for
 * an instant. Run on epoch milliseconds they put a tick every 200,000,000 ms,
 * which lands at 14:53:20 on an arbitrary Tuesday. Time is not decimal below
 * the year — sixty, sixty, twenty-four, seven, twelve — so this axis steps in
 * seconds, minutes, hours, days, weeks, months and years, and the ticks are
 * walked with real calendar arithmetic: a month step lands on the first of the
 * month whatever its length, and a day step survives the clocks going back.
 *
 * Ticks are also **aligned**, so a three-hour axis reads 00:00, 03:00, 06:00
 * rather than 01:00, 04:00, 07:00. Evenly spaced ticks that land on nothing a
 * reader recognises give up most of the value of using a calendar at all.
 *
 * ## There is no legend
 *
 * The rows **are** the category axis and they are already named down the side.
 * A legend restating twenty row names is not a filter anybody wants, and it
 * would be the only legend here that identified nothing new.
 *
 * ## The pointer is tested against the whole bar
 *
 * A span can be two hundred pixels of bar whose centre a pointer never goes
 * near, so hit-testing to the centre would hand a short bar on the next row a
 * hover the reader is plainly not making. The frame measures to the mark's
 * **body** instead.
 */
export function MPTimelineChart({
  series,
  yAxis,
  xAxis,
  spanLabels = true,
  ...frame
}: MPTimelineChartProps) {
  const locale = useMPLocale(frame.locale);
  const words = useMPMessages(CHART, locale);
  const table = useMPMessages(TABLE, locale);

  const rows = React.useMemo(
    () =>
      series.map((row) =>
        row.data
          .map((span) => {
            const from = toNumber(span.start);
            const to = toNumber(span.end);

            // A span with an end that is not a place on a number line is not a
            // span. Dropped here rather than reaching the scale as a `NaN`,
            // which draws nothing and says nothing about why.
            return from === null || to === null
              ? null
              : { from: Math.min(from, to), to: Math.max(from, to), span };
          })
          .filter((one): one is NonNullable<typeof one> => one !== null)
      ),
    [series]
  );

  const flat = rows.flat();
  const extent =
    flat.length > 0
      ? {
          min: Math.min(...flat.map((one) => one.from)),
          max: Math.max(...flat.map((one) => one.to))
        }
      : null;

  const scale = timeScale(extent, {
    min: xAxis?.min,
    max: xAxis?.max,
    tickCount: xAxis?.tickCount
  });

  const written = React.useCallback(
    (value: number) => formatTimeTick(value, scale.unit, locale),
    [scale.unit, locale]
  );

  /*
   * The frame's `series` is one placeholder row per timeline row, and
   * `categories` are the row names.
   *
   * That looks roundabout and is the honest mapping: what the frame calls a
   * category is a slot on the band axis, and a timeline's rows are exactly
   * that. The value axis gets its extent from `scale` rather than from this
   * data, which is why the placeholder can be a zero.
   */
  const placeholder = React.useMemo(() => [{ data: series.map(() => 0) }], [series]);
  const names = series.map((row, index) => row.name ?? String(index + 1));
  const colors = series.map((row, index) => seriesColor(index, row.color));

  return (
    <CartesianFrame
      {...frame}
      series={placeholder}
      categories={names}
      // Rows down the side and time along the bottom, which is a horizontal
      // chart in the frame's terms.
      horizontal
      inset={false}
      bandRatio={ROW_FILL}
      scale={scale}
      // A calendar axis is never dragged to zero: the epoch is not a baseline
      // anybody measures a Tuesday against.
      includeZero={false}
      // The rows are the axis, so a legend would restate it.
      legend={false}
      xAxis={yAxis}
      yAxis={{
        ...xAxis,
        tickFormat: xAxis?.tickFormat ?? ((value) => written(Number(value)))
      }}
      marks={({ plot, band, valuePx, categoryPx }) =>
        rows.flatMap((spans, row) =>
          spans.map((one, index) => {
            const from = valuePx(one.from);
            const to = valuePx(one.to);
            const centre = plot.top + categoryPx(row);

            return {
              series: row,
              index,
              x: (from + to) / 2,
              y: centre,
              r: band.band / 2,
              // The half-width and half-height the frame tests the pointer
              // against, so a long bar is hit anywhere along it rather than
              // only near its middle.
              rx: Math.max(1, Math.abs(to - from) / 2),
              ry: band.band / 2
            };
          })
        )
      }
      markTooltip={(mark) => {
        const one = rows[mark.series]?.[mark.index];

        if (!one) {
          return null;
        }

        return {
          /*
           * The row and the span's own name together, with the dates below.
           *
           * The span's label deliberately does *not* go in the row's `label`
           * slot: the chrome reads that as "say this instead of the value", and
           * a span whose panel said "Wireframes" and never said when it ran
           * would be withholding the one thing a timeline is drawn for.
           */
          heading:
            one.span.label === undefined || one.span.label === null
              ? names[mark.series]
              : `${names[mark.series]} · ${String(one.span.label)}`,
          items: [
            {
              seriesIndex: mark.series,
              color: one.span.color ? seriesColor(0, one.span.color) : colors[mark.series],
              value: one.to - one.from,
              // The two ends rather than the length: what a reader wants from a
              // span is when it ran, and the duration is the subtraction they
              // can do themselves.
              formatted: `${written(one.from)} – ${written(one.to)}`
            }
          ]
        };
      }}
      table={(id) => (
        <ChartTable
          id={id}
          caption={frame.label ?? words.table}
          corner={yAxis?.label ?? words.category}
          categories={names}
          names={[words.table]}
          // One row per timeline row, and its cell says every span on it. A
          // grid cannot hold a variable number of spans, and a table with a
          // column per span would have as many columns as the busiest row.
          values={[
            rows.map((spans) => ({
              value: spans.length,
              label: spans.map((one) => `${written(one.from)} – ${written(one.to)}`).join('; ')
            })) as ChartValue[]
          ]}
          format={(value) => String(value)}
          locale={locale}
          empty={table.empty}
        />
      )}
    >
      {({ plot, band, valuePx, categoryPx, activeMark, size }) => {
        const font = CHART_FONT_SIZE[size] - 1;

        return (
          <g className="mp-timeline-chart__spans">
            {rows.map((spans, row) =>
              spans.map((one, index) => {
                const from = valuePx(one.from);
                const to = valuePx(one.to);
                const height = Math.max(2, band.band - MARK_GAP);
                const y = plot.top + categoryPx(row) - height / 2;
                const width = Math.max(1, to - from);
                const on = activeMark?.series === row && activeMark?.index === index;
                const paint = one.span.color ? seriesColor(0, one.span.color) : colors[row];

                return (
                  <g key={`${row}-${index}`}>
                    <path
                      // Rounded at both ends, and that is the one place a span
                      // parts company with a bar: a bar grows from a baseline and
                      // has one data end, where a span *is* two ends and neither
                      // is more the value than the other.
                      d={barPath(from, y, width, height, BAR_RADIUS, 'both')}
                      fill={paint}
                      opacity={on ? 1 : 0.85}
                      stroke={on ? 'var(--_mp-color-on-surface)' : 'none'}
                      strokeWidth={on ? 1.5 : 0}
                    />

                    {spanLabels && fits(one.span.label, width, font) ? (
                      <text
                        x={from + 8}
                        y={plot.top + categoryPx(row)}
                        dominantBaseline="central"
                        // The page's own colour on the bar's fill. Every slot of
                        // the palette was measured to carry it, which is what
                        // makes one ink right for all eight rather than a
                        // per-row calculation.
                        fill="var(--_mp-color-surface)"
                        fontSize={font}
                      >
                        {one.span.label}
                      </text>
                    ) : null}
                  </g>
                );
              })
            )}
          </g>
        );
      }}
    </CartesianFrame>
  );
}
