import * as React from 'react';
import { useMPElementSize } from '../hooks/useMPElementSize';
import { useMPLocale, useMPMessages } from './locale';
import { useMPSize } from './config';
import { CHART } from './messages/chart';
import { TABLE } from './messages/table';
import {
  ChartLegend,
  ChartShell,
  ChartTable,
  ChartTooltipPanel,
  useVisibility,
  type ChartBaseProps
} from './ChartChrome';
import {
  BandScale,
  CHART_FONT_SIZE,
  ChartValue,
  MARKER_RADIUS,
  PLOT_HEIGHT,
  PlotBox,
  ValueScale,
  bandScale,
  categoryAt,
  categoryCount,
  categoryExtent,
  fitsLast,
  formatCategory,
  formatStatistic,
  seriesColor,
  seriesExtent,
  showsTick,
  textWidth,
  tickStride,
  toValues,
  truncate,
  valueScale
} from './chart';
import type {
  MPChartAxis,
  MPChartCategory,
  MPChartLegend,
  MPChartSeries,
  MPChartTooltip,
  MPChartTooltipItem,
  MPChartTooltipMode,
  MPSize
} from '../types';

/**
 * The frame a chart with two axes is drawn in.
 *
 * The plot box once the axes have taken their bands, the value scale, the band
 * scale, the grid and the crosshair — everything that is identical on a line
 * chart and a bar chart. What is left for a chart to do is its marks, and it is
 * handed **pixels** to draw them at: a component that had to know which way
 * round the axes run is a component that gets it wrong when somebody turns it
 * sideways.
 *
 * The parts a chart with no axes also needs — the legend, the hover panel, the
 * spoken readout, the table and the arrangement holding them — are in
 * `ChartChrome.tsx`, so a pie chart can have them without carrying any of this.
 */

/** What a chart with two axes adds. */
export interface CartesianChartProps extends ChartBaseProps {
  /** The series, in the order their colours are handed out. */
  series: readonly MPChartSeries[];
  /** The category axis' labels. Points may carry their own `x` instead. */
  categories?: readonly MPChartCategory[];
  /** The category axis. */
  xAxis?: MPChartAxis;
  /** The value axis. */
  yAxis?: MPChartAxis;
}

/** One array rather than a fresh `[]` per render, for the charts with no marks. */
const NO_MARKS: readonly ChartMark[] = [];

/* -------------------------------------------------------------------- axes */

interface AxesProps {
  plot: PlotBox;
  scale: ValueScale;
  horizontal: boolean;
  categoryPx: (index: number) => number;
  categoryScale: ValueScale | null;
  categoryValuePx: (value: number) => number;
  valuePx: (value: number) => number;
  tickTexts: readonly string[];
  /** Either the category labels or, with `categoryScale`, that scale's ticks. */
  categoryTexts: readonly string[];
  valueAxis?: MPChartAxis;
  categoryAxis?: MPChartAxis;
  fontSize: number;
  zeroPx: number;
}

/** The ink the chrome is drawn in. One step off the surface, and no darker. */
const GRID_INK = 'var(--_mp-color-outline-variant)';
const RULE_INK = 'var(--_mp-color-outline)';
const LABEL_INK = 'var(--_mp-color-on-surface-variant)';

/**
 * The grid, the rules and the labels.
 *
 * Gridlines run from the **value** axis only, as solid hairlines one step off
 * the surface. The category axis casts none: a grid in both directions is graph
 * paper, and on a chart of columns the vertical rules would be doing the job
 * the crosshair already does under the pointer.
 */
function ChartAxes({
  plot,
  scale,
  horizontal,
  categoryPx,
  categoryScale,
  categoryValuePx,
  valuePx,
  tickTexts,
  categoryTexts,
  valueAxis,
  categoryAxis,
  fontSize,
  zeroPx
}: AxesProps) {
  const grid = valueAxis?.grid !== false && !valueAxis?.hidden;
  /* A grid in both directions is graph paper, and on a chart of columns the
     vertical rules would be doing the job the crosshair already does under the
     pointer. A plot with two value axes is the exception that makes the rule:
     there is no column to be in, and reading a mark's x off the picture is half
     of what the reader came for — so there, graph paper is the point. */
  const categoryGrid = categoryAxis?.hidden
    ? false
    : (categoryAxis?.grid ?? categoryScale !== null);

  /* Where each category label sits. Ticks and names are the same problem: a
     value scale's steps are already evenly spaced, so both paths are a list of
     texts laid along an axis at a stride. */
  const categoryAlong = (index: number) =>
    categoryScale
      ? categoryValuePx(categoryScale.ticks[index])
      : (horizontal ? plot.top : plot.left) + categoryPx(index);

  /*
   * How many labels each axis has room for. The two are measured differently
   * and have to be: labels along the bottom collide side to side, so what
   * matters is the widest of them; labels stacked up the left collide top to
   * bottom, where the only measurement that counts is the line height.
   */
  const categoryStride = tickStride(
    categoryTexts.length,
    horizontal ? plot.height : plot.width,
    horizontal
      ? fontSize * 1.8
      : Math.max(...categoryTexts.map((text) => textWidth(text, fontSize)), 1) + 12
  );

  const valueStride = tickStride(
    scale.ticks.length,
    horizontal ? plot.width : plot.height,
    horizontal
      ? Math.max(...tickTexts.map((text) => textWidth(text, fontSize)), 1) + 16
      : fontSize * 2
  );

  /* Whether each axis' last label still has room to be written down, measured
     from the step it would sit at rather than assumed from the stride. */
  const categoryStep =
    categoryTexts.length > 1 ? Math.abs(categoryAlong(1) - categoryAlong(0)) : plot.width;
  const valueStep =
    scale.ticks.length > 1
      ? Math.abs(valuePx(scale.ticks[1]) - valuePx(scale.ticks[0]))
      : plot.height;

  const lastCategory = fitsLast(
    categoryTexts.length,
    categoryStride,
    categoryStep,
    horizontal ? fontSize * 1.8 : textWidth(categoryTexts[categoryTexts.length - 1] ?? '', fontSize)
  );
  const lastValue = fitsLast(
    scale.ticks.length,
    valueStride,
    valueStep,
    horizontal ? textWidth(tickTexts[tickTexts.length - 1] ?? '', fontSize) : fontSize * 1.6
  );

  return (
    <g className="mp-chart__axes">
      {scale.ticks.map((tick, index) => {
        const along = valuePx(tick);
        // The baseline is a rule rather than a gridline. Zero is where a value's
        // sign changes and where a bar's length is measured from, so it is a
        // different kind of line from the ones that only help with arithmetic.
        const isZero = Math.abs(tick) < 1e-9 && scale.min < 0;
        const written =
          !valueAxis?.hidden && showsTick(index, scale.ticks.length, valueStride, lastValue);

        return (
          <g key={`v${index}`}>
            {grid ? (
              horizontal ? (
                <line
                  x1={along}
                  x2={along}
                  y1={plot.top}
                  y2={plot.top + plot.height}
                  stroke={isZero ? RULE_INK : GRID_INK}
                  strokeWidth={1}
                />
              ) : (
                <line
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={along}
                  y2={along}
                  stroke={isZero ? RULE_INK : GRID_INK}
                  strokeWidth={1}
                />
              )
            ) : null}

            {written ? (
              <text
                x={horizontal ? along : plot.left - 8}
                y={horizontal ? plot.top + plot.height + fontSize + 6 : along}
                textAnchor={horizontal ? 'middle' : 'end'}
                dominantBaseline={horizontal ? 'auto' : 'central'}
                fill={LABEL_INK}
                fontSize={fontSize}
              >
                {tickTexts[index]}
              </text>
            ) : null}
          </g>
        );
      })}

      {categoryTexts.map((text, index) => {
        const along = categoryAlong(index);
        const written =
          !categoryAxis?.hidden &&
          showsTick(index, categoryTexts.length, categoryStride, lastCategory);

        return (
          <g key={`c${index}`}>
            {categoryGrid ? (
              horizontal ? (
                <line
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={along}
                  y2={along}
                  stroke={GRID_INK}
                  strokeWidth={1}
                />
              ) : (
                <line
                  x1={along}
                  x2={along}
                  y1={plot.top}
                  y2={plot.top + plot.height}
                  stroke={GRID_INK}
                  strokeWidth={1}
                />
              )
            ) : null}

            {written ? (
              <text
                x={horizontal ? plot.left - 8 : along}
                y={horizontal ? along : plot.top + plot.height + fontSize + 6}
                textAnchor={horizontal ? 'end' : 'middle'}
                dominantBaseline={horizontal ? 'central' : 'auto'}
                fill={LABEL_INK}
                fontSize={fontSize}
              >
                {text}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* The baseline the marks stand on, drawn whether or not zero is a tick.
          A plot with no rule under it is a plot whose marks float. */}
      {horizontal ? (
        <line
          x1={zeroPx}
          x2={zeroPx}
          y1={plot.top}
          y2={plot.top + plot.height}
          stroke={RULE_INK}
          strokeWidth={1}
        />
      ) : (
        <line
          x1={plot.left}
          x2={plot.left + plot.width}
          y1={zeroPx}
          y2={zeroPx}
          stroke={RULE_INK}
          strokeWidth={1}
        />
      )}

      {/* The axis names. The value axis' is turned on its side and the category
          axis' is not, which is the one rotation a chart is allowed: it reads
          bottom-to-top the way every other vertical axis label in print does,
          and the alternative is a horizontal word eating the plot's width. */}
      {valueAxis?.label && !valueAxis.hidden ? (
        <text
          x={horizontal ? plot.left + plot.width / 2 : fontSize}
          y={horizontal ? plot.top + plot.height + fontSize * 2 + 12 : plot.top + plot.height / 2}
          textAnchor="middle"
          dominantBaseline={horizontal ? 'auto' : 'central'}
          fill={LABEL_INK}
          fontSize={fontSize}
          transform={
            horizontal ? undefined : `rotate(-90 ${fontSize} ${plot.top + plot.height / 2})`
          }
        >
          {valueAxis.label}
        </text>
      ) : null}

      {categoryAxis?.label && !categoryAxis.hidden ? (
        <text
          x={horizontal ? fontSize : plot.left + plot.width / 2}
          y={horizontal ? plot.top + plot.height / 2 : plot.top + plot.height + fontSize * 2 + 12}
          textAnchor="middle"
          dominantBaseline={horizontal ? 'central' : 'auto'}
          fill={LABEL_INK}
          fontSize={fontSize}
          transform={
            horizontal ? `rotate(-90 ${fontSize} ${plot.top + plot.height / 2})` : undefined
          }
        >
          {categoryAxis.label}
        </text>
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------- marks */

/**
 * One mark on a plot whose marks are not arranged in columns.
 *
 * A scatter has no shared categories, so there is no column for a pointer to be
 * inside and nothing for a crosshair to be dropped through — the only question
 * a reader can be asking is "which of these dots". A chart that says so hands
 * the frame its marks and gets the nearest-mark search, the arrow keys and the
 * panel's anchoring for free.
 */
export interface ChartMark {
  /** Its series' place in the array as it was passed — where its colour is from. */
  series: number;
  /** Its own place within that series. */
  index: number;
  /** Its centre, in pixels from the chart's top-left. */
  x: number;
  y: number;
  /** How big it is. Widens the hit target, so a bubble is easier to hit than a dot. */
  r: number;
  /**
   * Its half-width and half-height, where the mark is a box rather than a disc.
   *
   * A span on a timeline is two hundred pixels of bar whose centre a pointer may
   * never go near, so measuring to that centre would hand the row's short bar a
   * hover the reader is plainly not making. Given these, the pointer is tested
   * against the mark's **body**.
   */
  rx?: number;
  ry?: number;
}

/**
 * Where everything goes — the half of the context settled before the pointer is
 * consulted.
 *
 * Split out because the marks are built from it: a chart hands the frame a
 * builder, the frame runs it on the layout, and only then is there a list for
 * the pointer to be nearest to. A builder that could read what is active would
 * be reading a value that does not exist yet.
 */
export interface CartesianLayout {
  plot: PlotBox;
  /** Every series unpacked, in the order it was passed. */
  values: readonly (readonly ChartValue[])[];
  /** Which of them are drawn. */
  visible: readonly boolean[];
  /** And what colour each one is, by its original index. */
  colors: readonly string[];
  scale: ValueScale;
  band: BandScale;
  /** Bars run along the category axis rather than across it. */
  horizontal: boolean;
  /** Where a value sits along the value axis, in pixels from the chart's edge. */
  valuePx: (value: number) => number;
  /** Where a category's centre sits along the category axis, as an offset along it. */
  categoryPx: (index: number) => number;
  /** The two combined, whichever way round the chart runs. */
  point: (index: number, value: number) => { x: number; y: number };
  /**
   * The scale the **category** axis runs on, where `xScale` made it a second
   * value axis. `null` on every chart whose categories are columns.
   */
  categoryScale: ValueScale | null;
  /**
   * Where a value sits along the category axis, in pixels from the chart's
   * edge — the same absolute reckoning `valuePx` uses, and deliberately not
   * `categoryPx`'s offset-along-the-axis. Only meaningful with `xScale="value"`.
   */
  categoryValuePx: (value: number) => number;
  /** Where the baseline sits along the value axis. */
  zeroPx: number;
  categories: readonly MPChartCategory[];
  format: (value: number) => string;
  size: MPSize;
}

/** The layout, plus everything the pointer decides. */
export interface CartesianContext extends CartesianLayout {
  /** The series the legend is being hovered over, if any. */
  hovered: number | null;
  /** The category under the pointer, if any. */
  activeIndex: number | null;
  /** Every mark, where the chart supplied a builder. Empty otherwise. */
  marks: readonly ChartMark[];
  /** The one the pointer is on, or the one the arrow keys walked to. */
  activeMark: ChartMark | null;
}

interface CartesianFrameProps extends CartesianChartProps {
  /**
   * Makes the category axis a second **value** axis instead of a row of
   * columns. What a scatter needs and what nothing else does.
   * @default 'band'
   */
  xScale?: 'band' | 'value';
  /**
   * Builds every mark on the plot, which swaps the frame's column hit-testing
   * for a nearest-mark search and makes the arrow keys walk this list. The
   * result comes back on the context, so the marks are laid out once and drawn
   * from the same array they are tested against.
   */
  marks?: (layout: CartesianLayout) => readonly ChartMark[];
  /**
   * How far off a mark the pointer still counts as on it, in pixels, added to
   * the mark's own radius. An 8px dot is not a hit target.
   * @default 24
   */
  markRadius?: number;
  /** The legend's swatch, where a chart's marks are not all the same shape. */
  swatch?: (index: number, color: string) => React.ReactNode;
  /**
   * The value axis' scale, already worked out.
   *
   * For an axis that is not a count. `valueScale` rounds to 1-2-5-10, which is
   * the family a reader does arithmetic in and exactly the wrong one for an
   * instant — sixty, twenty-four, seven, twelve. A chart whose axis has its own
   * arithmetic builds the scale itself and hands it over.
   */
  scale?: ValueScale;
  /**
   * The table behind the picture, for a chart whose data are not a grid of
   * series against categories.
   *
   * The default one is right wherever the marks *are* that grid, and useless
   * where they are not: a timeline's rows are the category axis and its marks
   * are spans within them, so the frame has no cell to look an answer up in.
   */
  table?: (id: string) => React.ReactNode;
  /** What the panel says about a mark whose value is not a cell of the grid. */
  markTooltip?: (mark: ChartMark) => {
    heading: React.ReactNode;
    items: readonly MPChartTooltipItem[];
  } | null;
  /** Bars, and only bars, run the other way. */
  horizontal?: boolean;
  /** The value axis measures totals rather than parts. */
  stacked?: boolean;
  /** A line chart may leave zero out; a bar chart may not. */
  includeZero?: boolean;
  /** How much of a band the marks take. Bars need room reserved; lines do not. */
  bandRatio?: number;
  /**
   * Lines and areas sit **on** the category ticks; bars sit **between** them.
   * The difference is one half-step, and getting it wrong is what leaves a line
   * chart's first point floating a centimetre off the axis.
   */
  inset?: boolean;
  /**
   * Extra room at the **far end of the value axis**, for labels that ride the
   * marks. The top of the plot on an upright chart and its right-hand edge on a
   * horizontal one — a value label sits past the end of the mark, and which
   * edge that is turns with the chart.
   */
  headroom?: number;
  /**
   * Room on **every** side, for marks drawn from their centre. `headroom` is
   * not enough for those: a dot at the largest x hangs over the right edge and
   * one at the smallest hangs over the value axis' own labels.
   */
  markInset?: number;
  /** Draws the marks. */
  children: (context: CartesianContext) => React.ReactNode;
}

/**
 * The frame: two axes, a grid, a crosshair, a legend, a panel and the table.
 */
export function CartesianFrame({
  series,
  categories,
  xAxis,
  yAxis,
  horizontal = false,
  stacked = false,
  includeZero = true,
  bandRatio = 1,
  inset = false,
  headroom = 0,
  markInset = 0,
  xScale = 'band',
  marks,
  markRadius = 24,
  swatch,
  scale: givenScale,
  table: givenTable,
  markTooltip,
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
  children,
  ...rest
}: CartesianFrameProps) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const words = useMPMessages(CHART, locale);
  const table = useMPMessages(TABLE, locale);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const measured = useMPElementSize(hostRef);
  const width = measured.width;
  const tableId = React.useId();

  const visibility = useVisibility(series);
  const [columnIndex, setColumnIndex] = React.useState<number | null>(null);
  /** Which entry of the mark list the pointer is on — the other way to be active. */
  const [markIndex, setMarkIndex] = React.useState<number | null>(null);
  /** Where the pointer sits along the value axis. `null` when it arrived by key. */
  const [pointer, setPointer] = React.useState<number | null>(null);

  const formatValue = React.useCallback(
    (value: number) => formatStatistic(value, locale, format, true),
    [format, locale]
  );

  const values = React.useMemo(() => toValues(series), [series]);
  const colors = React.useMemo(
    () => series.map((one, index) => seriesColor(index, one.color)),
    [series]
  );
  const seriesNames = React.useMemo(() => series.map((one) => one.name), [series]);

  const count = categoryCount(series);
  const labels = React.useMemo(
    () => Array.from({ length: count }, (_, index) => categoryAt(index, categories, values)),
    [count, categories, values]
  );

  const shown = values.filter((_, index) => visibility.visible[index]);
  const extent = seriesExtent(shown, stacked);
  const fontSize = CHART_FONT_SIZE[size];

  /*
   * `xAxis` is the category axis and `yAxis` is the value axis on every chart
   * and in both orientations. Turning a bar chart on its side is a change to
   * the drawing and not to what the caller's data means, so it must not also
   * move their axis options from one prop to the other. Where the axes are
   * *drawn* is still `horizontal`'s business, below.
   */
  const valueAxis = yAxis;
  const categoryAxis = xAxis;

  /* The value scale is settled before anything is measured, because how much
     room the axis needs depends on how wide its widest tick prints — which is
     not knowable until the ticks exist. */
  const scale =
    givenScale ??
    valueScale(extent, {
      min: valueAxis?.min,
      max: valueAxis?.max,
      tickCount: valueAxis?.tickCount,
      includeZero
    });

  /* And a second scale of the same kind where the categories are numbers rather
     than columns. Zero is deliberately not forced in: what a position along an
     axis encodes is a *place*, so cropping moves every mark by the same amount
     and the picture survives — the argument a line chart already makes, and the
     opposite of the one a bar's length makes. An x running from 100 to 140
     dragged down to zero is a plot with all of its data in one corner. */
  const spread = xScale === 'value' ? categoryExtent(shown, categories) : null;
  const categoryScale =
    xScale === 'value'
      ? valueScale(spread, {
          min: categoryAxis?.min,
          max: categoryAxis?.max,
          tickCount: categoryAxis?.tickCount,
          includeZero: false
        })
      : null;

  const tickTexts = scale.ticks.map((tick, index) =>
    valueAxis?.tickFormat ? String(valueAxis.tickFormat(tick, index)) : formatValue(tick)
  );

  /* `format` belongs to the value axis and is deliberately not borrowed for the
     categories: a currency applied to an axis of years prints `$2,019`. */
  const rawCategoryTexts = categoryScale
    ? categoryScale.ticks.map((tick, index) =>
        categoryAxis?.tickFormat
          ? String(categoryAxis.tickFormat(tick, index))
          : formatStatistic(tick, locale, undefined, true)
      )
    : labels.map((category, index) =>
        categoryAxis?.tickFormat
          ? String(categoryAxis.tickFormat(category, index))
          : formatCategory(category, locale)
      );

  const widestTick = tickTexts.reduce((most, text) => Math.max(most, textWidth(text, fontSize)), 0);
  const axisNameBand = fontSize + 6;

  const valueBand = valueAxis?.hidden ? 0 : widestTick + 10 + (valueAxis?.label ? axisNameBand : 0);

  /* How much room one category label has, worked out before the plot is laid
     out. A horizontal chart gives each label a row of its own down the left, so
     the limit is a column width; a vertical one gives it a slot along the
     bottom, so the limit is that slot. */
  const slot = (width - (horizontal ? 0 : valueBand) - 16) / Math.max(1, count);

  /* Cut a long name to its slot rather than dropping labels until the rest fit.
     Below about four characters cutting stops helping and the stride takes over
     instead. A tick is never cut: it was already rounded to be short, and half
     of `12.4K` is not a smaller number, it is a wrong one. */
  const categoryTexts = categoryScale
    ? rawCategoryTexts
    : horizontal || slot - 6 >= fontSize * 2.4
      ? rawCategoryTexts.map((text) => truncate(text, horizontal ? 150 : slot - 6, fontSize))
      : rawCategoryTexts;

  const widestCategory = categoryTexts.reduce(
    (most, text) => Math.max(most, textWidth(text, fontSize)),
    0
  );

  /* The two bands the axes take out of the box. `hidden` gives the room back to
     the plot, which is why a chart with both axes off is the same component
     rather than a different one. */
  const leftBand = horizontal
    ? categoryAxis?.hidden
      ? 0
      : widestCategory + 10 + (categoryAxis?.label ? axisNameBand : 0)
    : valueBand;

  const bottomBand = horizontal
    ? valueAxis?.hidden
      ? 0
      : fontSize + 12 + (valueAxis?.label ? axisNameBand : 0)
    : categoryAxis?.hidden
      ? 0
      : fontSize + 12 + (categoryAxis?.label ? axisNameBand : 0);

  // `thickness` belongs to whichever axis is actually on that edge, and which
  // one that is swaps with `horizontal`. Read off the wrong one, a bar chart
  // turned on its side takes its left margin from the axis along the bottom.
  const left = (horizontal ? categoryAxis : valueAxis)?.thickness ?? leftBand;
  const bottom = (horizontal ? valueAxis : categoryAxis)?.thickness ?? bottomBand;

  // The last category's label is centred on the last tick, so half of it hangs
  // past the plot. Reserving that half is what stops a chart clipping the one
  // label a reader looks for first — and the value axis needs none of it,
  // because it anchors its labels inward instead.
  const rightPad = (horizontal ? 12 + headroom : Math.max(8, widestCategory / 2)) + markInset;
  const topPad = MARKER_RADIUS[size] + 4 + (horizontal ? 0 : headroom) + markInset;

  /*
   * How tall the box is. A number is pixels and `undefined` is the ladder;
   * a *string* is a CSS length the element resolves for itself, which is the
   * one case the number has to be read back off the DOM — a `viewBox` of
   * `0 0 w 0` draws a chart with no height at all.
   */
  const boxHeight =
    typeof height === 'number'
      ? height
      : height === undefined
        ? PLOT_HEIGHT[size]
        : measured.height;

  const plot: PlotBox = {
    left: left + markInset,
    top: topPad,
    width: Math.max(0, width - left - markInset - rightPad),
    height: Math.max(0, boxHeight - topPad - bottom - markInset)
  };

  const categoryLength = horizontal ? plot.height : plot.width;
  // Bars divide the axis into `count` slots and sit in the middle of one; lines
  // divide it into `count - 1` gaps and sit on the joins. Both need a `step`,
  // because a category's hit target is one step wide either way.
  const band = bandScale(inset ? Math.max(1, count - 1) : count, categoryLength, bandRatio);

  const categoryPx = React.useCallback(
    (index: number) =>
      inset
        ? count <= 1
          ? categoryLength / 2
          : (categoryLength * index) / (count - 1)
        : band.centre(index),
    [inset, count, categoryLength, band]
  );

  const valuePx = React.useCallback(
    (value: number) =>
      horizontal
        ? plot.left + scale.fraction(value) * plot.width
        : plot.top + (1 - scale.fraction(value)) * plot.height,
    [horizontal, plot.left, plot.top, plot.width, plot.height, scale]
  );

  const categoryValuePx = React.useCallback(
    (value: number) =>
      horizontal
        ? plot.top + (1 - (categoryScale?.fraction(value) ?? 0)) * plot.height
        : plot.left + (categoryScale?.fraction(value) ?? 0) * plot.width,
    [horizontal, plot.left, plot.top, plot.width, plot.height, categoryScale]
  );

  const point = React.useCallback(
    (index: number, value: number) =>
      horizontal
        ? { x: valuePx(value), y: plot.top + categoryPx(index) }
        : { x: plot.left + categoryPx(index), y: valuePx(value) },
    [horizontal, valuePx, categoryPx, plot.left, plot.top]
  );

  const zeroPx = valuePx(Math.min(Math.max(0, scale.min), scale.max));

  const layout: CartesianLayout = {
    plot,
    values,
    visible: visibility.visible,
    colors,
    scale,
    band,
    horizontal,
    valuePx,
    categoryPx,
    point,
    categoryScale,
    categoryValuePx,
    zeroPx,
    categories: labels,
    format: formatValue,
    size
  };

  /* The marks, laid out once. They are what the pointer is tested against and
     what `children` draws, and they are the same array both times — a chart
     that placed its dots twice would eventually place them in two places. */
  const markList = marks ? marks(layout) : NO_MARKS;

  const options: MPChartTooltip =
    tooltip === false ? { mode: 'none' } : tooltip === true || tooltip === undefined ? {} : tooltip;
  const mode: MPChartTooltipMode = options.mode ?? (marks ? 'item' : 'index');

  /**
   * The category nearest the pointer, rather than the one it is literally over.
   *
   * A two-pixel line is not something a pointer can be asked to land on, so a
   * category's hit area is its whole column — which is also why a reader can
   * hover a gap and still be told which column they are in.
   */
  const indexAt = (clientX: number, clientY: number) => {
    const host = hostRef.current;

    if (!host || count === 0) {
      return null;
    }

    const rect = host.getBoundingClientRect();
    const along = horizontal ? clientY - rect.top - plot.top : clientX - rect.left - plot.left;

    if (along < -band.step || along > categoryLength + band.step) {
      return null;
    }

    const raw = inset
      ? count <= 1
        ? 0
        : Math.round((along / categoryLength) * (count - 1))
      : Math.floor(along / band.step);

    return Math.min(count - 1, Math.max(0, raw));
  };

  /**
   * The mark nearest the pointer, or `null` when it is not near one.
   *
   * A plain squared-distance sweep over the marks. The textbook answer is a
   * Voronoi layer, and at the sizes a chart in a card is drawn at — a few
   * hundred marks, recomputed only while a pointer is actually moving —
   * building one costs more than it saves.
   */
  const nearestMark = (clientX: number, clientY: number) => {
    const host = hostRef.current;

    if (!host || markList.length === 0) {
      return null;
    }

    const rect = host.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let found: number | null = null;
    let best = Infinity;
    let tie = Infinity;

    markList.forEach((mark, at) => {
      const toCentre = Math.hypot(mark.x - x, mark.y - y);
      // How far the pointer is from the mark's *edge*, which is zero anywhere
      // inside it. Ranking on this rather than on the centre is what stops a
      // small mark next door winning a hover the pointer is making on a big one.
      const body =
        mark.rx === undefined
          ? Math.max(0, toCentre - mark.r)
          : Math.hypot(
              Math.max(0, Math.abs(mark.x - x) - mark.rx),
              Math.max(0, Math.abs(mark.y - y) - (mark.ry ?? mark.rx))
            );

      // Inside two overlapping marks the edge distance is zero for both, and
      // the nearer centre is the one being pointed at.
      if (body <= markRadius && (body < best || (body === best && toCentre < tie))) {
        best = body;
        tie = toCentre;
        found = at;
      }
    });

    return found;
  };

  /** Where the pointer sits along the value axis — `item` mode's other half. */
  const valueAt = (clientX: number, clientY: number) => {
    const host = hostRef.current;

    if (!host) {
      return null;
    }

    const rect = host.getBoundingClientRect();

    return horizontal ? clientX - rect.left : clientY - rect.top;
  };

  const activeMark = markIndex === null ? null : (markList[markIndex] ?? null);
  const activeIndex = marks ? (activeMark ? activeMark.index : null) : columnIndex;
  const walkLength = marks ? markList.length : count;

  const clearActive = () => {
    setColumnIndex(null);
    setMarkIndex(null);
    setPointer(null);
  };

  const goTo = (at: number | null) => {
    const bounded = at === null ? null : Math.min(walkLength - 1, Math.max(0, at));

    if (marks) {
      setMarkIndex(bounded);
    } else {
      setColumnIndex(bounded);
    }
  };

  const stepBy = (delta: number) => {
    setPointer(null);

    const current = marks ? markIndex : columnIndex;

    goTo((current ?? (delta > 0 ? -1 : walkLength)) + delta);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const forward = horizontal ? 'ArrowDown' : 'ArrowRight';
    const back = horizontal ? 'ArrowUp' : 'ArrowLeft';

    if (event.key === forward) {
      stepBy(1);
    } else if (event.key === back) {
      stepBy(-1);
    } else if (event.key === 'Home') {
      goTo(0);
    } else if (event.key === 'End') {
      goTo(walkLength - 1);
    } else if (event.key === 'Escape') {
      clearActive();
    } else {
      return;
    }

    event.preventDefault();
  };

  const column: MPChartTooltipItem[] =
    activeIndex === null
      ? []
      : series.flatMap((one, index) => {
          // A mark names its own series, so there is no column to narrow: two
          // dots at the same index are two unrelated points that happen to be
          // the nth of their series, not two readings of one category.
          if (!visibility.visible[index] || (activeMark && activeMark.series !== index)) {
            return [];
          }

          const value = values[index]?.[activeIndex];

          if (!value || value.value === null) {
            return [];
          }

          return [
            {
              seriesIndex: index,
              name: one.name,
              color: value.color ?? colors[index],
              value: value.value,
              formatted: formatValue(value.value),
              label: value.label
            }
          ];
        });

  /* `item` is the whole column narrowed to the one mark the pointer is nearest,
     measured along the value axis — the category is already settled by where
     the pointer is across the plot, so the only question left is which of the
     series at that category it is closest to. */
  const supplied = activeMark && markTooltip ? markTooltip(activeMark) : null;

  const items = supplied
    ? supplied.items
    : mode === 'item' && column.length > 1 && pointer !== null
      ? [
          column.reduce((nearest, item) =>
            Math.abs(valuePx(item.value ?? 0) - pointer) <
            Math.abs(valuePx(nearest.value ?? 0) - pointer)
              ? item
              : nearest
          )
        ]
      : column;

  /*
   * What the panel is titled.
   *
   * A column is titled with the category every series in it shares. A **mark**
   * is titled with its own x, because on a plot with two value axes the x is
   * data rather than a heading the marks were filed under — and two marks at
   * the same index are two unrelated observations that happen to be the nth of
   * their series, so the shared label would be the wrong number for one of them.
   */
  const heading = supplied
    ? supplied.heading
    : activeMark
      ? formatCategory(
          values[activeMark.series]?.[activeMark.index]?.x ??
            categories?.[activeMark.index] ??
            activeMark.index,
          locale
        )
      : activeIndex === null
        ? undefined
        : formatCategory(labels[activeIndex] ?? activeIndex, locale);

  /* Where the panel hangs. A column is anchored on its own centre and a mark on
     itself, and both flip once they are past the far side of the plot so the
     panel never leaves the picture it belongs to. */
  const anchorX = activeMark
    ? activeMark.x
    : horizontal
      ? valuePx(items[0]?.value ?? 0)
      : plot.left + categoryPx(activeIndex ?? 0);
  const anchorY = activeMark
    ? activeMark.y
    : horizontal
      ? plot.top + categoryPx(activeIndex ?? 0)
      : plot.top + plot.height / 2;
  const anchorFlip = activeMark
    ? (activeMark.x - plot.left) / Math.max(1, plot.width) > 0.6
    : (horizontal
        ? scale.fraction(items[0]?.value ?? 0)
        : categoryPx(activeIndex ?? 0) / Math.max(1, categoryLength)) > 0.6;

  const legendOptions: MPChartLegend =
    legend === false
      ? { interactive: false }
      : legend === true || legend === undefined
        ? {}
        : legend;
  const showLegend = legend === true || (legend !== false && series.length > 1);
  const legendSide = legendOptions.side ?? 'bottom';

  const context: CartesianContext = {
    ...layout,
    hovered: visibility.hovered,
    activeIndex,
    marks: markList,
    activeMark
  };

  const nothing = count === 0 || extent === null || (xScale === 'value' && spread === null);

  return (
    <ChartShell
      {...rest}
      size={size}
      className={className}
      style={style}
      plotRef={hostRef}
      // Never the bare prop: `label` is optional, and a focusable `role="img"`
      // with nothing to be called by is a tab stop that announces silence.
      name={label ?? words.label}
      describedBy={nothing ? undefined : tableId}
      interactive={!nothing}
      height={height}
      legendSide={legendSide}
      plotProps={{
        onPointerMove:
          nothing || mode === 'none'
            ? undefined
            : (event) => {
                if (marks) {
                  setMarkIndex(nearestMark(event.clientX, event.clientY));
                } else {
                  setColumnIndex(indexAt(event.clientX, event.clientY));
                }

                // Only `item` mode reads this, and only it may pay for it. The
                // index above settles to the same value everywhere inside one
                // column, so React bails out of the re-render — but a pointer
                // offset is a fresh pixel on every event, and storing one
                // nothing consults would re-lay the chart out per pixel moved.
                if (mode === 'item') {
                  setPointer(valueAt(event.clientX, event.clientY));
                }
              },
        onPointerLeave: clearActive,
        // A key press moves the crosshair with no pointer to measure against,
        // so `item` mode falls back to the whole column.
        onKeyDown: nothing || mode === 'none' ? undefined : onKeyDown,
        onBlur: clearActive
      }}
      tooltip={
        activeIndex !== null && items.length > 0 && mode !== 'none' ? (
          options.render ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-10"
              style={{
                left: anchorX,
                top: anchorY,
                transform: `translate(${anchorFlip ? 'calc(-100% - 12px)' : '12px'}, -50%)`
              }}
            >
              {options.render({
                index: activeIndex,
                category: labels[activeIndex] ?? activeIndex,
                items
              })}
            </div>
          ) : (
            <ChartTooltipPanel
              heading={heading}
              items={items}
              x={anchorX}
              y={anchorY}
              flip={anchorFlip}
              size={size}
            />
          )
        ) : null
      }
      legend={
        showLegend ? (
          <ChartLegend
            names={seriesNames}
            colors={colors}
            options={legendOptions}
            visibility={visibility}
            size={size}
            swatch={swatch}
            values={
              legendOptions.showValue && activeIndex !== null
                ? series.map((_, index) => {
                    const value = values[index]?.[activeIndex]?.value;

                    return value === null || value === undefined ? undefined : formatValue(value);
                  })
                : undefined
            }
          />
        ) : null
      }
      status={{ heading, items }}
      table={
        nothing
          ? null
          : (givenTable?.(tableId) ?? (
              <ChartTable
                id={tableId}
                caption={label ?? words.table}
                corner={categoryAxis?.label ?? words.category}
                categories={labels}
                names={seriesNames}
                values={values}
                format={formatValue}
                locale={locale}
                empty={table.empty}
              />
            ))
      }
    >
      {nothing ? (
        <div className="text-mp-on-surface-variant text-mp-body-small flex h-full items-center justify-center">
          {empty ?? table.empty}
        </div>
      ) : width > 0 && boxHeight > 0 ? (
        <svg
          width={width}
          height={boxHeight}
          viewBox={`0 0 ${width} ${boxHeight}`}
          aria-hidden="true"
          className="block overflow-visible"
        >
          <ChartAxes
            plot={plot}
            scale={scale}
            horizontal={horizontal}
            categoryPx={categoryPx}
            categoryScale={categoryScale}
            categoryValuePx={categoryValuePx}
            valuePx={valuePx}
            tickTexts={tickTexts}
            categoryTexts={categoryTexts}
            valueAxis={valueAxis}
            categoryAxis={categoryAxis}
            fontSize={fontSize}
            zeroPx={zeroPx}
          />

          {/* No crosshair on a chart with marks, whatever mode was asked for: a
              crosshair says "these numbers all belong to this column", and where
              there is no column it is a line through one dot. */}
          {activeIndex !== null && !marks && mode === 'index' && options.crosshair !== false
            ? (() => {
                const along = categoryPx(activeIndex);

                return horizontal ? (
                  <line
                    x1={plot.left}
                    x2={plot.left + plot.width}
                    y1={plot.top + along}
                    y2={plot.top + along}
                    stroke={RULE_INK}
                    strokeWidth={1}
                  />
                ) : (
                  <line
                    x1={plot.left + along}
                    x2={plot.left + along}
                    y1={plot.top}
                    y2={plot.top + plot.height}
                    stroke={RULE_INK}
                    strokeWidth={1}
                  />
                );
              })()
            : null}

          {children(context)}
        </svg>
      ) : null}
    </ChartShell>
  );
}
