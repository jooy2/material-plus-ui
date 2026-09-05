import * as React from 'react';
import { useMPElementSize } from '../../hooks/useMPElementSize';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { useMPSize } from '../../internal/config';
import { CHART } from '../../internal/messages/chart';
import { TABLE } from '../../internal/messages/table';
import {
  ChartShell,
  ChartTable,
  ChartTooltipPanel,
  type ChartBaseProps
} from '../../internal/ChartChrome';
import {
  CHART_FONT_SIZE,
  MARK_GAP,
  PLOT_HEIGHT,
  RAMP_STEPS,
  formatCategory,
  formatStatistic,
  rampFill,
  rampInk,
  rampStep,
  textWidth,
  toValues,
  truncate,
  type ChartValue
} from '../../internal/chart';
import type { MPChartAxis, MPChartCategory, MPChartSeries, MPChartTooltip } from '../../types';

export interface MPHeatmapChartProps extends ChartBaseProps {
  /**
   * The rows. Each series is one row and its `data` are that row's cells, in
   * the order `categories` names the columns.
   */
  series: readonly MPChartSeries[];
  /** The column headings. */
  categories?: readonly MPChartCategory[];
  /** The column axis. Only `label`, `hidden` and `tickFormat` mean anything here. */
  xAxis?: MPChartAxis;
  /** The row axis, same three. */
  yAxis?: MPChartAxis;
  /**
   * Where the colour scale starts and ends. Taken from the data otherwise.
   *
   * Worth pinning when two heatmaps are meant to be compared: without it each
   * one scales to its own range, and the darkest cell of a quiet week looks
   * exactly like the darkest cell of a bad one.
   */
  min?: number;
  max?: number;
  /**
   * Writes each cell's value in it, where the cell is big enough to hold the
   * text. One that does not fit is dropped rather than clipped.
   * @default false
   */
  valueLabels?: boolean;
}

/**
 * A grid of cells, coloured by how much.
 *
 * ```tsx
 * <MPHeatmapChart
 *   categories={['Mon', 'Tue', 'Wed']}
 *   series={[
 *     { name: '09:00', data: [4, 9, 2] },
 *     { name: '10:00', data: [7, 12, 5] }
 *   ]}
 * />
 * ```
 *
 * Two categorical axes and a magnitude in the cells. It is the shape for a
 * pattern across two dimensions — a week by hour, a cohort by month — where
 * what a reader is looking for is *where* the dense part is rather than what
 * any one cell holds.
 *
 * ## Its colour is a ramp, not the palette
 *
 * The eight chart slots are an **identity** channel: they say which series, and
 * nobody can tell whether slot 6 is more than slot 3. A cell's colour here has
 * to say how much, so it comes from a sequential ramp instead — one hue, five
 * steps, running pale to deep on a light page and deep to bright on a dark one,
 * because "more" has to be further from the page in both.
 *
 * That also sidesteps the cap the palette runs into: every cell touches its
 * neighbours, and colour separates only three touching series. A ramp is not
 * being asked to separate anything — it is being asked to be ordered.
 *
 * ## Steps rather than a gradient
 *
 * A smooth fill looks better and reads worse. Given a gradient a reader can say
 * "darker" and nothing else; given five steps they can match a cell to a band
 * in the legend and come away with a number.
 *
 * ## Pin the scale to compare two of them
 *
 * By default each heatmap scales to its own range, so two side by side say
 * nothing to each other — the darkest cell of a quiet week looks exactly like
 * the darkest cell of a bad one. Give both the same `min` and `max` when the
 * comparison is the point.
 */
export function MPHeatmapChart({
  series,
  categories,
  xAxis,
  yAxis,
  min,
  max,
  valueLabels = false,
  height,
  format,
  locale: localeProp,
  label,
  legend,
  tooltip,
  empty,
  size: sizeProp,
  className,
  style,
  ...rest
}: MPHeatmapChartProps) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const words = useMPMessages(CHART, locale);
  const table = useMPMessages(TABLE, locale);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const measured = useMPElementSize(hostRef);
  const tableId = React.useId();

  const [active, setActive] = React.useState<{ row: number; column: number } | null>(null);

  const rows = React.useMemo(() => toValues(series), [series]);
  const columns = rows.reduce((most, one) => Math.max(most, one.length), 0);

  const formatValue = React.useCallback(
    (value: number) => formatStatistic(value, locale, format, true),
    [format, locale]
  );

  const rowNames = series.map((one, index) => one.name ?? String(index + 1));
  const columnNames = Array.from({ length: columns }, (_, index) =>
    xAxis?.tickFormat
      ? String(xAxis.tickFormat(categories?.[index] ?? index, index))
      : formatCategory(categories?.[index] ?? index, locale)
  );

  /* The extent of the values, which is what the ramp is stretched across. */
  const numbers = rows.flat().filter((cell) => cell.value !== null);
  const low = min ?? (numbers.length > 0 ? Math.min(...numbers.map((c) => c.value as number)) : 0);
  const high = max ?? (numbers.length > 0 ? Math.max(...numbers.map((c) => c.value as number)) : 0);
  const span = high - low || 1;

  const font = CHART_FONT_SIZE[size];
  const boxWidth = measured.width;
  const boxHeight =
    typeof height === 'number'
      ? height
      : height === undefined
        ? PLOT_HEIGHT[size]
        : measured.height;

  /* The two bands the axes take. Both are category axes here, so both are as
     wide as their widest label rather than as their widest number. */
  const widestRow = rowNames.reduce((most, name) => Math.max(most, textWidth(name, font)), 0);
  const left = yAxis?.hidden ? 0 : (yAxis?.thickness ?? Math.min(140, widestRow + 10));
  const bottom = xAxis?.hidden ? 0 : (xAxis?.thickness ?? font + 12);

  const plot = {
    left,
    top: 0,
    width: Math.max(0, boxWidth - left),
    height: Math.max(0, boxHeight - bottom)
  };

  const cellWidth = columns > 0 ? plot.width / columns : 0;
  const cellHeight = rows.length > 0 ? plot.height / rows.length : 0;

  const cellAt = (clientX: number, clientY: number) => {
    const host = hostRef.current;

    if (!host || cellWidth <= 0 || cellHeight <= 0) {
      return null;
    }

    const box = host.getBoundingClientRect();
    const column = Math.floor((clientX - box.left - plot.left) / cellWidth);
    const row = Math.floor((clientY - box.top - plot.top) / cellHeight);

    if (column < 0 || column >= columns || row < 0 || row >= rows.length) {
      return null;
    }

    return { row, column };
  };

  const walk = (dRow: number, dColumn: number) => {
    setActive((now) => {
      const from = now ?? { row: 0, column: 0 };

      return {
        row: Math.min(rows.length - 1, Math.max(0, from.row + (now ? dRow : 0))),
        column: Math.min(columns - 1, Math.max(0, from.column + (now ? dColumn : 0)))
      };
    });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      walk(0, 1);
    } else if (event.key === 'ArrowLeft') {
      walk(0, -1);
    } else if (event.key === 'ArrowDown') {
      walk(1, 0);
    } else if (event.key === 'ArrowUp') {
      walk(-1, 0);
    } else if (event.key === 'Escape') {
      setActive(null);
    } else {
      return;
    }

    event.preventDefault();
  };

  const activeCell = active ? (rows[active.row]?.[active.column] ?? null) : null;
  const items =
    active && activeCell && activeCell.value !== null
      ? [
          {
            seriesIndex: active.row,
            name: rowNames[active.row],
            color: rampFill(rampStep((activeCell.value - low) / span)),
            value: activeCell.value,
            formatted: formatValue(activeCell.value),
            label: activeCell.label
          }
        ]
      : [];

  const options: MPChartTooltip =
    tooltip === false ? { mode: 'none' } : tooltip === true || tooltip === undefined ? {} : tooltip;
  const showLegend = legend !== false && numbers.length > 0;

  const nothing = columns === 0 || rows.length === 0 || numbers.length === 0;

  /* The table is the transpose of the drawing: a column per category and a row
     per series, which is the way a reader would write the grid down. */
  const columnValues: ChartValue[][] = Array.from({ length: columns }, (_, column) =>
    rows.map((one) => one[column] ?? { value: null })
  );

  return (
    <ChartShell
      {...rest}
      size={size}
      className={['mp-heatmap-chart', className ?? ''].filter(Boolean).join(' ')}
      style={style}
      plotRef={hostRef}
      name={label ?? words.label}
      describedBy={nothing ? undefined : tableId}
      interactive={!nothing}
      height={height}
      legendSide="bottom"
      plotProps={{
        onPointerMove:
          nothing || options.mode === 'none'
            ? undefined
            : (event) => setActive(cellAt(event.clientX, event.clientY)),
        onPointerLeave: () => setActive(null),
        onKeyDown: nothing || options.mode === 'none' ? undefined : onKeyDown,
        onBlur: () => setActive(null)
      }}
      tooltip={
        active && items.length > 0 && options.mode !== 'none' ? (
          <ChartTooltipPanel
            heading={`${rowNames[active.row]} · ${columnNames[active.column]}`}
            items={items}
            x={plot.left + (active.column + 0.5) * cellWidth}
            y={plot.top + (active.row + 0.5) * cellHeight}
            flip={active.column > columns / 2}
            size={size}
          />
        ) : null
      }
      legend={
        showLegend ? (
          <div className="mp-chart__legend flex items-center justify-center gap-2">
            <span className="text-mp-on-surface-variant text-mp-label-small tabular-nums">
              {formatValue(low)}
            </span>
            {/*
              The legend for a ramp is the ramp itself: five swatches in order,
              with the two ends written. A list of names would be a list of five
              numbers nobody asked for — what a reader needs here is to match a
              cell against a band, which is a picture rather than a key.
            */}
            <span className="flex" aria-hidden="true">
              {Array.from({ length: RAMP_STEPS }, (_, step) => (
                <span
                  key={step}
                  className="block h-3 w-6 first:rounded-s-mp-xs last:rounded-e-mp-xs"
                  style={{ background: rampFill(step) }}
                />
              ))}
            </span>
            <span className="text-mp-on-surface-variant text-mp-label-small tabular-nums">
              {formatValue(high)}
            </span>
          </div>
        ) : null
      }
      status={{
        heading: active ? `${rowNames[active.row]} · ${columnNames[active.column]}` : undefined,
        items
      }}
      table={
        nothing ? null : (
          <ChartTable
            id={tableId}
            caption={label ?? words.table}
            corner={yAxis?.label ?? words.category}
            categories={rowNames}
            names={columnNames}
            values={columnValues}
            format={formatValue}
            locale={locale}
            empty={table.empty}
          />
        )
      }
    >
      {nothing ? (
        <div className="text-mp-on-surface-variant text-mp-body-small flex h-full items-center justify-center">
          {empty ?? table.empty}
        </div>
      ) : boxWidth > 0 && boxHeight > 0 ? (
        <svg
          width={boxWidth}
          height={boxHeight}
          viewBox={`0 0 ${boxWidth} ${boxHeight}`}
          aria-hidden="true"
          className="block overflow-visible"
        >
          <g className="mp-heatmap-chart__cells">
            {rows.map((one, row) =>
              Array.from({ length: columns }, (_, column) => {
                const cell = one[column];
                const on = active?.row === row && active?.column === column;
                const x = plot.left + column * cellWidth;
                const y = plot.top + row * cellHeight;
                const w = Math.max(0, cellWidth - MARK_GAP);
                const h = Math.max(0, cellHeight - MARK_GAP);

                if (!cell || cell.value === null) {
                  // A cell with nothing in it is left as a hole rather than
                  // being painted the lowest step. The bottom of a ramp is a
                  // reading, and drawing "no data" as "the least" is the same
                  // mistake a bridged line makes.
                  return (
                    <rect
                      key={column}
                      x={x + MARK_GAP / 2}
                      y={y + MARK_GAP / 2}
                      width={w}
                      height={h}
                      fill="none"
                      stroke="var(--_mp-color-outline-variant)"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      rx={2}
                    />
                  );
                }

                const step = rampStep((cell.value - low) / span);

                return (
                  <g key={column}>
                    <rect
                      x={x + MARK_GAP / 2}
                      y={y + MARK_GAP / 2}
                      width={w}
                      height={h}
                      fill={cell.color ?? rampFill(step)}
                      rx={2}
                      // The cell under the pointer is ringed rather than
                      // recoloured: a cell that changed colour on hover would be
                      // a cell reporting a different number while it is read.
                      stroke={on ? 'var(--_mp-color-on-surface)' : 'none'}
                      strokeWidth={on ? 2 : 0}
                    />

                    {valueLabels &&
                    w > textWidth(formatValue(cell.value), font) + 8 &&
                    h > font + 4 ? (
                      <text
                        x={x + cellWidth / 2}
                        y={y + cellHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={rampInk(step)}
                        fontSize={font}
                      >
                        {formatValue(cell.value)}
                      </text>
                    ) : null}
                  </g>
                );
              })
            )}
          </g>

          {/* The two axes: names down the side and along the bottom, with no
              ticks and no grid. Both axes here are categorical, so there is
              nothing to measure against and a rule would be decoration. */}
          {yAxis?.hidden
            ? null
            : rowNames.map((name, row) => (
                <text
                  key={`r${row}`}
                  x={plot.left - 8}
                  y={plot.top + (row + 0.5) * cellHeight}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill="var(--_mp-color-on-surface-variant)"
                  fontSize={font}
                >
                  {truncate(name, left - 10, font)}
                </text>
              ))}

          {xAxis?.hidden
            ? null
            : columnNames.map((name, column) => (
                <text
                  key={`c${column}`}
                  x={plot.left + (column + 0.5) * cellWidth}
                  y={plot.top + plot.height + font + 4}
                  textAnchor="middle"
                  fill="var(--_mp-color-on-surface-variant)"
                  fontSize={font}
                >
                  {truncate(name, cellWidth - 2, font)}
                </text>
              ))}
        </svg>
      ) : null}
    </ChartShell>
  );
}
