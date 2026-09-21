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
import { VISUALLY_HIDDEN } from './visually-hidden';
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
  formatShare,
  formatStatistic,
  seriesColor,
  seriesExtent,
  showsTick,
  textWidth,
  tickStride,
  tickTurn,
  toNumber,
  toValues,
  truncate,
  turnedBand,
  turnedRoom,
  turnedStep,
  valueScale,
  withReferences
} from './chart';
import type {
  MPChartAxis,
  MPChartCategory,
  MPChartLegend,
  MPChartReference,
  MPChartSeries,
  MPChartStack,
  MPChartTooltip,
  MPChartTooltipItem,
  MPChartTooltipMode,
  MPChartZoom,
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
  /**
   * Lets a reader drag a range out of the category axis and redraws to it.
   *
   * For the chart with ninety points on it, where the shape of one week is
   * inside a picture of a quarter. Everything follows the window — the scale,
   * the panel, the readout and the table — so what is drawn is a chart of that
   * range rather than a magnified picture of the whole one.
   */
  zoom?: boolean | MPChartZoom;
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
  /**
   * How far the labels along the **bottom** are turned, in degrees. `0` leaves
   * them flat, which is every axis that has room to be.
   */
  turn: number;
  /** How deep the band those labels take is, so the axis' name clears them. */
  tickBand: number;
}

/**
 * One label along the bottom of the plot.
 *
 * Flat, it is centred on its tick and sits a line below the axis. Turned, it is
 * anchored at its **end** and rotated anticlockwise about that point, so it
 * runs up towards the tick it belongs to and a reader follows it in the
 * direction they already read. The alternative — turning it the other way —
 * leaves the label starting at the tick and descending away from it, which
 * reads as the label of the tick to its left.
 */
function BottomTick({
  text,
  along,
  top,
  turn,
  fontSize
}: {
  text: string;
  along: number;
  top: number;
  turn: number;
  fontSize: number;
}) {
  if (turn <= 0) {
    return (
      <text
        x={along}
        y={top + fontSize + 6}
        textAnchor="middle"
        fill={LABEL_INK}
        fontSize={fontSize}
      >
        {text}
      </text>
    );
  }

  return (
    <text
      x={along}
      y={top + 8}
      textAnchor="end"
      dominantBaseline="central"
      transform={`rotate(${-turn} ${along} ${top + 8})`}
      fill={LABEL_INK}
      fontSize={fontSize}
    >
      {text}
    </text>
  );
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
  zeroPx,
  turn,
  tickBand
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
   * How much room one label of each axis needs along the axis it sits on.
   *
   * The three cases are genuinely different measurements. Labels stacked up the
   * left collide top to bottom, so only the line height counts. Flat labels
   * along the bottom collide across their own width, so the widest one decides.
   * **Turned** labels along the bottom collide across their line box instead,
   * opened out by the angle — which does not grow with the label, and is the
   * whole reason turning one buys an axis anything.
   */
  const bottomRoom = (texts: readonly string[], air: number) =>
    turn > 0
      ? turnedStep(turn, fontSize)
      : Math.max(...texts.map((text) => textWidth(text, fontSize)), 1) + air;

  const categoryStride = tickStride(
    categoryTexts.length,
    horizontal ? plot.height : plot.width,
    horizontal ? fontSize * 1.8 : bottomRoom(categoryTexts, 12)
  );

  const valueStride = tickStride(
    scale.ticks.length,
    horizontal ? plot.width : plot.height,
    horizontal ? bottomRoom(tickTexts, 16) : fontSize * 2
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
    horizontal
      ? fontSize * 1.8
      : turn > 0
        ? turnedStep(turn, fontSize)
        : textWidth(categoryTexts[categoryTexts.length - 1] ?? '', fontSize)
  );
  const lastValue = fitsLast(
    scale.ticks.length,
    valueStride,
    valueStep,
    horizontal
      ? turn > 0
        ? turnedStep(turn, fontSize)
        : textWidth(tickTexts[tickTexts.length - 1] ?? '', fontSize)
      : fontSize * 1.6
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
              horizontal ? (
                <BottomTick
                  text={tickTexts[index]}
                  along={along}
                  top={plot.top + plot.height}
                  turn={turn}
                  fontSize={fontSize}
                />
              ) : (
                <text
                  x={plot.left - 8}
                  y={along}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={LABEL_INK}
                  fontSize={fontSize}
                >
                  {tickTexts[index]}
                </text>
              )
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
              horizontal ? (
                <text
                  x={plot.left - 8}
                  y={along}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={LABEL_INK}
                  fontSize={fontSize}
                >
                  {text}
                </text>
              ) : (
                <BottomTick
                  text={text}
                  along={along}
                  top={plot.top + plot.height}
                  turn={turn}
                  fontSize={fontSize}
                />
              )
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
          y={horizontal ? plot.top + plot.height + tickBand + fontSize : plot.top + plot.height / 2}
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
          y={horizontal ? plot.top + plot.height / 2 : plot.top + plot.height + tickBand + fontSize}
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

/**
 * Takes or gives back the pointer, and survives a browser that refuses.
 *
 * Both calls throw on a pointer id the browser has no record of — a synthetic
 * event, a pointer already gone — and neither is load-bearing: the drag is
 * driven by the events themselves, and capture only keeps them coming while
 * the pointer is off the plot.
 */
function capture(event: React.PointerEvent, take: boolean): void {
  try {
    if (take) {
      event.currentTarget.setPointerCapture(event.pointerId);
    } else {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  } catch {
    // The drag is no worse off for it.
  }
}

/* -------------------------------------------------------------- references */

/** One reference, already in pixels and already pointed the right way. */
interface ReferenceMark {
  /** Where the line crosses, in pixels from the chart's edge. */
  at: number;
  /** And the far edge of a band. `null` for a line. */
  to: number | null;
  /** Whether the line itself runs top to bottom. */
  upright: boolean;
  label?: React.ReactNode;
  color: string;
  dashed: boolean;
}

/**
 * Every reference on one axis, as pixels.
 *
 * `px` is that axis' own projection, so the caller's number is read on the
 * scale it was given to and nowhere else — the value axis' 80 and the category
 * axis' 80 are two different places and must never be confused for one.
 */
function referenceMarks(
  references: readonly MPChartReference[] | undefined,
  px: (value: number) => number,
  upright: boolean
): ReferenceMark[] {
  return (references ?? [])
    .map((one) => ({
      ...one,
      at: toNumber(one.value),
      end: one.to === undefined ? null : toNumber(one.to)
    }))
    .filter((one) => one.at !== null)
    .map((one) => ({
      at: px(one.at as number),
      to: one.end === null ? null : px(one.end),
      upright,
      label: one.label,
      // Never a palette slot, which is what `seriesColor` falls back to with
      // nothing named: a reference is not a series and must not look like one.
      color: one.color ? seriesColor(0, one.color) : 'var(--_mp-color-outline)',
      dashed: one.dashed !== false
    }));
}

/**
 * The lines and bands a reader brought with them, drawn across the plot.
 *
 * In two passes, and the split is the whole of the design. A **band** is a
 * region the marks stand in, so it goes under them — a fill over a bar is a
 * bar the reader has to look through. A **line** is a level the marks are
 * measured against, so it goes over them, because the one thing a target must
 * not be is hidden behind the series that crossed it.
 */
function ChartReferences({
  marks,
  plot,
  pass,
  fontSize
}: {
  marks: readonly ReferenceMark[];
  plot: PlotBox;
  pass: 'band' | 'line';
  fontSize: number;
}) {
  if (marks.length === 0) {
    return null;
  }

  return (
    <g className={`mp-chart__references mp-chart__references--${pass}`} aria-hidden="true">
      {marks.map((mark, index) => {
        const box = (from: number, to: number) =>
          mark.upright
            ? {
                x: Math.min(from, to),
                y: plot.top,
                width: Math.abs(to - from),
                height: plot.height
              }
            : {
                x: plot.left,
                y: Math.min(from, to),
                width: plot.width,
                height: Math.abs(to - from)
              };

        if (pass === 'band') {
          if (mark.to === null) {
            return null;
          }

          return <rect key={index} {...box(mark.at, mark.to)} fill={mark.color} opacity={0.12} />;
        }

        /* A band is bounded by both of its edges, and a reader who can only see
           one of them has been shown a line. */
        const edges = mark.to === null ? [mark.at] : [mark.at, mark.to];

        return (
          <g key={index}>
            {edges.map((edge) => (
              <line
                key={edge}
                x1={mark.upright ? edge : plot.left}
                x2={mark.upright ? edge : plot.left + plot.width}
                y1={mark.upright ? plot.top : edge}
                y2={mark.upright ? plot.top + plot.height : edge}
                stroke={mark.color}
                strokeWidth={1}
                // Dashed unless the caller says otherwise, so a reference is
                // never mistaken for a gridline or for the baseline.
                strokeDasharray={mark.dashed ? '4 3' : undefined}
              />
            ))}

            {/* The name, at the end of the line rather than at its middle:
                the middle is where the data is. An upright line hangs it from
                the top, and a level one writes it above the right-hand end. */}
            {mark.label === undefined || mark.label === null || mark.label === '' ? null : (
              <text
                x={mark.upright ? mark.at + 4 : plot.left + plot.width}
                y={mark.upright ? plot.top + fontSize : mark.at - 4}
                textAnchor={mark.upright ? 'start' : 'end'}
                fill={mark.color}
                fontSize={fontSize}
              >
                {mark.label}
              </text>
            )}
          </g>
        );
      })}
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
  /**
   * What ink a value written onto one of series `index`' marks wears.
   *
   * Ordinary ink unless the caller asked for `labelColor="series"`. A chart
   * whose labels sit **on** a fill rather than beside a mark ignores it: there
   * the question is what reads against the colour underneath, which is not a
   * question about identity at all.
   */
  labelInk: (series: number) => string;
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
  /** A fraction as the chart writes a share — whole percentages. */
  share: (fraction: number) => string;
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
  /** The value axis measures totals rather than parts, or shares of one. */
  stacked?: MPChartStack;
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
  zoom,
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
  labelColor = 'ink',
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
  const notesId = React.useId();

  const visibility = useVisibility(series);
  const [columnIndex, setColumnIndex] = React.useState<number | null>(null);
  /** Which entry of the mark list the pointer is on — the other way to be active. */
  const [markIndex, setMarkIndex] = React.useState<number | null>(null);
  /** Where the pointer sits along the value axis. `null` when it arrived by key. */
  const [pointer, setPointer] = React.useState<number | null>(null);
  /**
   * The range being dragged out of the axis, in window indices.
   *
   * Held twice on purpose. The state is what draws the selection, and the ref
   * is what the release reads: both handlers come from the same render, so a
   * pointer that is lifted before React has painted the move would otherwise
   * commit the range as it stood one event ago.
   */
  const [dragging, setDragging] = React.useState<{ start: number; to: number } | null>(null);
  const dragRef = React.useRef<{ start: number; to: number } | null>(null);

  const drag = (next: { start: number; to: number } | null) => {
    dragRef.current = next;
    setDragging(next);
  };

  const formatValue = React.useCallback(
    (value: number) => formatStatistic(value, locale, format, true),
    [format, locale]
  );

  const allValues = React.useMemo(() => toValues(series), [series]);
  const colors = React.useMemo(
    () => series.map((one, index) => seriesColor(index, one.color)),
    [series]
  );
  const seriesNames = React.useMemo(() => series.map((one) => one.name), [series]);

  const categoryTotal = categoryCount(series);
  const allLabels = React.useMemo(
    () =>
      Array.from({ length: categoryTotal }, (_, index) => categoryAt(index, categories, allValues)),
    [categoryTotal, categories, allValues]
  );

  /*
   * The window, and everything downstream reading it rather than the data.
   *
   * Slicing here rather than at the drawing is what makes the window a *chart
   * of that range*: the scale re-fits, the panel narrows, the readout follows
   * and so does the table — which is the copy of the data a reader who cannot
   * see the plot is given instead of it, so a table still listing the whole
   * series would be describing a chart that is not on the page.
   */
  const zoomOptions: MPChartZoom = zoom === true || zoom === false || !zoom ? {} : zoom;
  /* Only a row of slots can be cut. A scatter has two value axes and no row,
     which is why this is read off `xScale` rather than off the chart. */
  const zoomable = zoom !== undefined && zoom !== false && xScale === 'band';
  const [ownRange, setOwnRange] = React.useState<readonly [number, number] | null>(
    () => zoomOptions.defaultRange ?? null
  );
  const asked = (zoomOptions.range !== undefined ? zoomOptions.range : ownRange) ?? null;

  /* Clamped rather than trusted: a range outlives the data it was picked from,
     and a window past the end of a shorter series is an empty chart with no way
     back to the full one. */
  const windowed =
    !zoomable || asked === null || categoryTotal === 0
      ? null
      : ([
          Math.max(0, Math.min(categoryTotal - 1, Math.min(asked[0], asked[1]))),
          Math.max(0, Math.min(categoryTotal - 1, Math.max(asked[0], asked[1])))
        ] as const);

  const from = windowed ? windowed[0] : 0;
  const count = windowed ? windowed[1] - windowed[0] + 1 : categoryTotal;
  const values = windowed ? allValues.map((one) => one.slice(from, from + count)) : allValues;
  const labels = windowed ? allLabels.slice(from, from + count) : allLabels;

  const setRange = (next: readonly [number, number] | null) => {
    if (zoomOptions.range === undefined) {
      setOwnRange(next);
    }

    zoomOptions.onRangeChange?.(next);
  };

  const shown = values.filter((_, index) => visibility.visible[index]);
  /*
   * A percent stack has no extent to find: every column is full, so the axis
   * runs 0 to 1 whatever the numbers are. That is the whole of what the setting
   * does to the frame — the arithmetic that turns a value into its share
   * belongs to the chart drawing the marks, which is the only thing that knows
   * what a column of them is.
   */
  const percent = stacked === 'percent';
  const extent = percent ? { min: 0, max: 1 } : seriesExtent(shown, Boolean(stacked));
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
    valueScale(percent ? extent : withReferences(extent, valueAxis?.references), {
      min: percent ? 0 : valueAxis?.min,
      max: percent ? 1 : valueAxis?.max,
      tickCount: valueAxis?.tickCount ?? (percent ? 4 : undefined),
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
      ? valueScale(withReferences(spread, categoryAxis?.references), {
          min: categoryAxis?.min,
          max: categoryAxis?.max,
          tickCount: categoryAxis?.tickCount,
          includeZero: false
        })
      : null;

  const tickTexts = scale.ticks.map((tick, index) =>
    valueAxis?.tickFormat
      ? String(valueAxis.tickFormat(tick, index))
      : percent
        ? formatShare(tick, locale)
        : formatValue(tick)
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

  /*
   * How tall the box is. A number is pixels and `undefined` is the ladder;
   * a *string* is a CSS length the element resolves for itself, which is the
   * one case the number has to be read back off the DOM — a `viewBox` of
   * `0 0 w 0` draws a chart with no height at all.
   *
   * Settled before the axes are, because a turned label's band is capped
   * against it: how much of a chart may be spent on its own labels is a
   * question about the box.
   */
  const boxHeight =
    typeof height === 'number'
      ? height
      : height === undefined
        ? PLOT_HEIGHT[size]
        : measured.height;

  /* How much room one category label has, worked out before the plot is laid
     out. A horizontal chart gives each label a row of its own down the left, so
     the limit is a column width; a vertical one gives it a slot along the
     bottom, so the limit is that slot. */
  const slot = (width - (horizontal ? 0 : valueBand) - 16) / Math.max(1, count);

  /*
   * The axis along the bottom, which is the only one a turn is any use to.
   *
   * Upright that is the categories, and turned on its side it is the values:
   * the option belongs to the edge rather than to the data, because what it
   * fixes is labels colliding side to side and that is a property of the edge.
   */
  const bottomAxis = horizontal ? valueAxis : categoryAxis;
  const bottomTexts = horizontal ? tickTexts : rawCategoryTexts;

  /* What the band down the left will take, settled before the turn is. A turn
     never moves it — it only ever reaches the labels along the bottom — so the
     two can be worked out in this order and not the other one. */
  const leftEstimate = horizontal
    ? categoryAxis?.hidden
      ? 0
      : rawCategoryTexts.reduce(
          (most, text) => Math.max(most, Math.min(150, textWidth(text, fontSize))),
          0
        ) +
        10 +
        (categoryAxis?.label ? axisNameBand : 0)
    : valueBand;

  /* And what the far end will take. A flat label is centred on its tick, so
     half of the last one hangs past the plot and has to be reserved for; a
     turned one leans the other way and needs nothing there. Measured flat,
     because that is the arrangement being tested against. */
  const widestBottom = bottomTexts.reduce(
    (most, text) => Math.max(most, textWidth(text, fontSize)),
    0
  );
  const rightEstimate = horizontal ? 12 + headroom : Math.max(8, widestBottom / 2);

  const bottomSlot =
    (width - leftEstimate - rightEstimate - markInset * 2) / Math.max(1, bottomTexts.length);

  /*
   * `auto` turns **names** and leaves ticks alone.
   *
   * A value axis is a ruler: its labels are samples of a continuum, and a
   * reader who is shown every second one interpolates the rest without noticing
   * — which is why showing every nth has always been the right answer there. A
   * category axis' labels are names, and every nth loses half of them outright.
   * So the axis that turns is the one holding names, and the two cases where
   * the bottom is a ruler instead — a chart on its side, and a plot with two
   * value axes — keep the stride unless the caller asks for a turn by name.
   */
  const ruler = horizontal || categoryScale !== null;
  const turn = bottomAxis?.hidden
    ? 0
    : tickTurn(
        bottomAxis?.tickLabels ?? (ruler ? 'truncate' : 'auto'),
        bottomTexts,
        fontSize,
        bottomSlot
      );

  /*
   * How deep a band of turned labels may get.
   *
   * Half the box, and never more than 120px. A turned axis is what stops a name
   * being cut, and a name is worth a band — but an axis that took the whole
   * picture to spell "Onboarding flow" out in full would have solved the wrong
   * problem. Past the cap the labels are cut again, and a cut turned label
   * still carries three times what a cut flat one does; a chart whose names
   * genuinely need more room wants a taller `height`, or a `thickness` of its
   * own on the axis.
   */
  const turnCap = Math.min(120, boxHeight * 0.5);

  /*
   * And how wide the label at `index` may print.
   *
   * The depth is one limit and it is the same for all of them. The other is the
   * chart's own left edge: a label anchored at its end runs down and to the
   * left of its tick, so it reaches back across whatever is to its left — the
   * value axis' band, and the ticks before it — all of which is empty below the
   * plot and is exactly the room it should be using. What is past the edge of
   * the chart is not.
   *
   * Per label rather than one figure for the row, because the limit is a
   * distance from the left edge and the first tick is the only one anywhere
   * near it. Cutting every name to what the first one can afford throws away
   * room the other nine had.
   */
  const turnRoom = (index: number) =>
    Math.min(
      turnedRoom(turn, turnCap, fontSize),
      turn >= 90
        ? Infinity
        : (leftEstimate + bottomSlot * (index + (inset ? 0 : 0.5))) /
            Math.cos((turn * Math.PI) / 180)
    );

  /* Cut a long name to the room it has rather than dropping labels until the
     rest fit. Below about four characters cutting stops helping and the stride
     takes over instead. A tick is never cut while it is flat: it was already
     rounded to be short, and half of `12.4K` is not a smaller number, it is a
     wrong one. */
  const categoryTexts =
    turn > 0 && !horizontal
      ? rawCategoryTexts.map((text, index) => truncate(text, turnRoom(index), fontSize))
      : categoryScale
        ? rawCategoryTexts
        : horizontal || slot - 6 >= fontSize * 2.4
          ? rawCategoryTexts.map((text) => truncate(text, horizontal ? 150 : slot - 6, fontSize))
          : rawCategoryTexts;

  const widestCategory = categoryTexts.reduce(
    (most, text) => Math.max(most, textWidth(text, fontSize)),
    0
  );

  /* How deep the labels along the bottom sit, before the axis' name is added
     under them. Flat, that is one line; turned, it is the widest label's own
     width projected onto the turn, and never past the cap — a name was already
     cut to fit that, but a tick is never cut and a caller's `tickFormat` can
     make one as long as it likes. */
  const bottomTickBand = bottomAxis?.hidden
    ? 0
    : turn > 0
      ? 8 +
        Math.min(turnCap, turnedBand(turn, horizontal ? widestTick : widestCategory, fontSize)) +
        4
      : fontSize + 12;

  /* The two bands the axes take out of the box. `hidden` gives the room back to
     the plot, which is why a chart with both axes off is the same component
     rather than a different one. */
  const leftBand = horizontal
    ? categoryAxis?.hidden
      ? 0
      : widestCategory + 10 + (categoryAxis?.label ? axisNameBand : 0)
    : valueBand;

  const bottomBand = bottomTickBand + (bottomAxis?.hidden || !bottomAxis?.label ? 0 : axisNameBand);

  // `thickness` belongs to whichever axis is actually on that edge, and which
  // one that is swaps with `horizontal`. Read off the wrong one, a bar chart
  // turned on its side takes its left margin from the axis along the bottom.
  const left = (horizontal ? categoryAxis : valueAxis)?.thickness ?? leftBand;
  const bottom = bottomAxis?.thickness ?? bottomBand;

  // The last category's label is centred on the last tick, so half of it hangs
  // past the plot. Reserving that half is what stops a chart clipping the one
  // label a reader looks for first — and the value axis needs none of it,
  // because it anchors its labels inward instead. A turned label hangs the
  // other way, to the left, so there is nothing on the right to reserve for.
  const rightPad =
    (horizontal || turn > 0 ? 12 + (horizontal ? headroom : 0) : Math.max(8, widestCategory / 2)) +
    markInset;
  const topPad = MARKER_RADIUS[size] + 4 + (horizontal ? 0 : headroom) + markInset;

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

  /*
   * The references, in pixels.
   *
   * A reference is drawn perpendicular to the axis it was given to, so which
   * way round it runs is the orientation's business and not the caller's: the
   * value axis' own line is upright exactly when the chart is turned on its
   * side. The category axis is only asked when it has a scale — a row of names
   * has no place between two of them for a line to be at.
   */
  const references = [
    ...referenceMarks(valueAxis?.references, valuePx, horizontal),
    ...(categoryScale ? referenceMarks(categoryAxis?.references, categoryValuePx, !horizontal) : [])
  ];

  /* A reference as the readout says it. A `Date` is written as a date rather
     than as the epoch milliseconds it is on the scale, which is the number and
     not the fact. */
  const spokenReference = (value: number | Date) =>
    value instanceof Date ? formatCategory(value, locale) : formatValue(value);

  /* The same references as words. Only the named ones: a line with no label is
     one there is nothing to say about, and "80" on its own is not a fact. */
  const spokenReferences = [
    ...(valueAxis?.references ?? []),
    ...(categoryScale ? (categoryAxis?.references ?? []) : [])
  ].filter((one) => one.label !== undefined && one.label !== null && one.label !== '');

  const layout: CartesianLayout = {
    plot,
    values,
    visible: visibility.visible,
    colors,
    labelInk: (series) =>
      labelColor === 'series' ? (colors[series] ?? LABEL_INK) : 'var(--_mp-color-on-surface)',
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
    share: (fraction) => formatShare(fraction, locale),
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

  /*
   * The drag, in **window** indices: what the reader picked is measured in the
   * chart they are looking at, and turned into the caller's own numbering only
   * when it is committed. Zooming twice is what needs that — the second drag
   * happens inside the first, and adding `from` is the whole of the arithmetic.
   */
  const startDrag = (event: React.PointerEvent) => {
    const at = indexAt(event.clientX, event.clientY);

    if (at === null) {
      return;
    }

    // Captured, so a drag that runs off the plot keeps reporting rather than
    // stopping wherever the pointer crossed the edge. Capture is a nicety and
    // not the feature: a pointer id the browser has no record of throws, and a
    // drag that works without capture is better than one that never starts.
    capture(event, true);
    clearActive();
    drag({ start: at, to: at });
  };

  const endDrag = (event: React.PointerEvent) => {
    const picked = dragRef.current;

    if (picked === null) {
      return;
    }

    capture(event, false);

    const low = Math.min(picked.start, picked.to);
    const high = Math.max(picked.start, picked.to);

    drag(null);

    // A click is a drag of no width, and a window of one category is not a
    // chart of anything: there is no distance left in it for a line to have
    // travelled. Both are left alone rather than acted on.
    if (high - low + 1 >= Math.max(2, zoomOptions.min ?? 2)) {
      setRange([from + low, from + high]);
    }
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
      // The reading first and the window second: `Escape` undoes the last
      // thing the reader did, and a pointer resting on a column is more recent
      // than the drag that opened it.
      if (activeIndex === null && windowed !== null) {
        setRange(null);
      } else {
        clearActive();
      }
    } else {
      return;
    }

    event.preventDefault();
  };

  /*
   * What the column under the pointer adds up to, for a chart whose marks are
   * shares of it.
   *
   * Only the positives, and only the visible ones — the same whole the marks
   * were drawn against. A panel that divided by a different total would print a
   * percentage the picture does not show.
   */
  const columnTotal =
    activeIndex === null || !percent
      ? 0
      : values.reduce((sum, one, index) => {
          const value = visibility.visible[index] ? one[activeIndex]?.value : null;

          return sum + (value !== null && value !== undefined && value > 0 ? value : 0);
        }, 0);

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
              // On a percent stack, both: the share is what the picture shows
              // and the value is what the reader came for, and neither answers
              // for the other.
              formatted:
                percent && columnTotal > 0 && value.value > 0
                  ? `${formatValue(value.value)} · ${formatShare(value.value / columnTotal, locale)}`
                  : formatValue(value.value),
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
   * The rows as the panel shows them, and the anchor still measured from the
   * order they were built in.
   *
   * Sorting must not move the panel. A column's rows are the same numbers
   * whichever order they are read in, and a card that jumped to a different
   * corner because one series overtook another would be a card the reader has
   * to find again every time the pointer moves.
   */
  const shownItems =
    options.sort === 'value'
      ? [...items].sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity))
      : items;

  /*
   * What the column adds up to, where the chart is a picture of that sum.
   *
   * A stack and nothing else: its whole point is the height of the column, and
   * a panel that listed the parts without it would leave the reader adding them
   * up. A percent stack is left out because its answer is 100% every time, and
   * an unstacked chart because its series are not parts of anything — adding
   * them would be the panel inventing a quantity.
   */
  const showTotal = options.total ?? stacked === true;
  const total =
    !showTotal || supplied || items.length < 2
      ? undefined
      : formatValue(items.reduce((sum, item) => sum + (item.value ?? 0), 0));

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
      // Two ids where there is a second thing to read. A reference is a fact
      // the reader brought with them and the table has no column for it, so a
      // reader who cannot see the line has to be told about it some other way.
      describedBy={
        nothing ? undefined : spokenReferences.length > 0 ? `${tableId} ${notesId}` : tableId
      }
      interactive={!nothing}
      height={height}
      legendSide={legendSide}
      plotProps={{
        onPointerDown: zoomable && !nothing ? startDrag : undefined,
        onPointerMove: nothing
          ? undefined
          : (event) => {
              if (dragRef.current !== null) {
                drag({
                  ...dragRef.current,
                  to: indexAt(event.clientX, event.clientY) ?? dragRef.current.to
                });

                return;
              }

              if (mode === 'none') {
                return;
              }

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
        onPointerUp: zoomable && !nothing ? endDrag : undefined,
        onPointerCancel: zoomable && !nothing ? () => drag(null) : undefined,
        onPointerLeave: (event) => {
          // A drag that ends off the plot is committed rather than dropped.
          // Capture normally keeps `pointerleave` from arriving at all until
          // the pointer is up — this is for the browser that refused it, where
          // the alternative is a selection left drawn over the chart with no
          // way to let go of it.
          if (zoomable && !nothing) {
            endDrag(event);
          }

          clearActive();
        },
        // A key press moves the crosshair with no pointer to measure against,
        // so `item` mode falls back to the whole column.
        onKeyDown: nothing || (mode === 'none' && !zoomable) ? undefined : onKeyDown,
        onBlur: clearActive
      }}
      overlay={
        windowed === null || nothing ? null : (
          <button
            type="button"
            onClick={() => setRange(null)}
            className={[
              'mp-chart__reset absolute end-0 top-0 z-10 cursor-pointer',
              'text-mp-primary text-mp-label-medium rounded-mp-xs px-2 py-1',
              'appearance-none border-0 bg-transparent [font:inherit]',
              'focus-visible:outline-mp-primary focus-visible:outline-2 focus-visible:outline-offset-2'
            ].join(' ')}
          >
            {words.showAll}
          </button>
        )
      }
      tooltip={
        // Never while a range is being picked: a card following the pointer
        // across the very thing it is covering is a card in the way.
        activeIndex !== null && items.length > 0 && mode !== 'none' && dragging === null ? (
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
                items: shownItems,
                total
              })}
            </div>
          ) : (
            <ChartTooltipPanel
              heading={heading}
              items={shownItems}
              total={total}
              totalLabel={words.total}
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
            colorNames={labelColor === 'series'}
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
      status={{ heading, items: shownItems, total, totalLabel: words.total }}
      table={
        nothing ? null : (
          <>
            {givenTable?.(tableId) ?? (
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
            )}

            {spokenReferences.length === 0 ? null : (
              <ul id={notesId} className={VISUALLY_HIDDEN}>
                {spokenReferences.map((one, index) => (
                  <li key={index}>
                    {one.label}:{' '}
                    {one.to === undefined
                      ? spokenReference(one.value)
                      : `${spokenReference(one.value)}–${spokenReference(one.to)}`}
                  </li>
                ))}
              </ul>
            )}
          </>
        )
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
            turn={turn}
            tickBand={bottomTickBand}
          />

          <ChartReferences marks={references} plot={plot} pass="band" fontSize={fontSize} />

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

          {/* Over the marks, and the bands under them. See `ChartReferences`. */}
          <ChartReferences marks={references} plot={plot} pass="line" fontSize={fontSize} />

          {/* What the reader is picking, over everything, so the edges of the
              selection are readable against whatever it happens to cover. */}
          {dragging === null
            ? null
            : (() => {
                const edges = [dragging.start, dragging.to]
                  .map((at) => (horizontal ? plot.top : plot.left) + categoryPx(at))
                  .sort((a, b) => a - b);
                const thickness = Math.max(band.step, 1);
                const low = edges[0] - thickness / 2;
                const size_ = edges[1] - edges[0] + thickness;

                return (
                  <rect
                    x={horizontal ? plot.left : low}
                    y={horizontal ? low : plot.top}
                    width={horizontal ? plot.width : size_}
                    height={horizontal ? size_ : plot.height}
                    fill="var(--_mp-color-primary)"
                    fillOpacity={0.12}
                    stroke="var(--_mp-color-primary)"
                    strokeWidth={1}
                  />
                );
              })()}
        </svg>
      ) : null}
    </ChartShell>
  );
}
