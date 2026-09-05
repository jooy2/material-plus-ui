import * as React from 'react';
import { useMPElementSize } from '../../hooks/useMPElementSize';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { useMPSize } from '../../internal/config';
import { CHART } from '../../internal/messages/chart';
import { TABLE } from '../../internal/messages/table';
import {
  ChartLegend,
  ChartShell,
  ChartTable,
  ChartTooltipPanel,
  useVisibility,
  type ChartBaseProps
} from '../../internal/ChartChrome';
import {
  CHART_FONT_SIZE,
  MARK_GAP,
  PLOT_HEIGHT,
  arcPath,
  categoryAt,
  formatCategory,
  formatStatistic,
  polarPoint,
  seriesColor,
  toValues,
  type ChartValue
} from '../../internal/chart';
import type { MPChartCategory, MPChartDatum, MPChartLegend, MPChartTooltip } from '../../types';

/** How the ring is drawn. */
export type MPPieChartShape = 'pie' | 'donut' | 'semi';

export interface MPPieChartProps extends ChartBaseProps {
  /**
   * The slices. Numbers, or points carrying their own name and colour.
   *
   * One series and not an array of them, because that is what a pie **is**: the
   * slices are the entities here, so each takes a palette slot of its own and
   * the legend lists them rather than listing series.
   */
  data: readonly MPChartDatum[];
  /** What each slice is called. Points may carry their own `x` instead. */
  categories?: readonly MPChartCategory[];
  /**
   * - `pie` — a filled disc.
   * - `donut` — a ring, with room in the middle for the total.
   * - `semi` — half a ring, opened along the bottom, for a tile wider than it
   *   is tall.
   * @default 'pie'
   */
  shape?: MPPieChartShape;
  /**
   * Where the first slice starts, in degrees clockwise from twelve o'clock.
   * Ignored by `semi`, which is defined by where it opens.
   * @default 0
   */
  startAngle?: number;
  /**
   * What goes in the hole. A ring with nothing in the middle is a pie with a
   * bite taken out of it — the total, or the one figure the chart is about, is
   * what the ring was drawn around.
   */
  center?: React.ReactNode;
  /**
   * Writes each slice's **share** on it, where the slice is wide enough to hold
   * the text with room either side. One that does not fit is dropped rather
   * than clipped; the hover panel and the table still have it.
   *
   * The share and not the value, because a share is what a pie is a picture of
   * and the value is one hover away.
   * @default 'none'
   */
  valueLabels?: 'none' | 'all';
}

/** How much of the radius a donut's hole takes. */
const HOLE = 0.62;

/** How far off the outer edge the pointer still counts as on a slice. */
const REACH = 8;

/**
 * Parts of a whole, at a glance.
 *
 * ```tsx
 * <MPPieChart
 *   categories={['Search', 'Direct', 'Social']}
 *   data={[52, 31, 17]}
 * />
 * ```
 *
 * The narrowest chart here and the easiest one to misuse. An angle is a poor
 * thing to compare: two slices within a few percent of each other are
 * indistinguishable, and nobody can rank six of them by eye. So a pie answers
 * exactly one question — **is one of these most of it?** Anything finer, and
 * anything past about six slices, is [MPBarChart](bar-chart), where the reader
 * is judging length instead.
 *
 * ## What it does with a negative
 *
 * Leaves it out, and says so in the table. A negative has no share of a whole,
 * and every way of drawing one is a lie: as an absolute it claims the opposite
 * of what it means, and as a signed sweep it overlaps the slice beside it.
 *
 * ## Colour follows the slice
 *
 * A slice takes its palette slot from its place in `data`, never from its size.
 * A chart that is refiltered or resorted keeps every category the colour it had
 * — which is the whole reason a legend is worth reading twice.
 */
export function MPPieChart({
  data,
  categories,
  shape = 'pie',
  startAngle = 0,
  center,
  valueLabels = 'none',
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
}: MPPieChartProps) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const words = useMPMessages(CHART, locale);
  const table = useMPMessages(TABLE, locale);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const measured = useMPElementSize(hostRef);
  const tableId = React.useId();

  const slices = React.useMemo(() => toValues([{ data }])[0], [data]);
  const visibility = useVisibility(React.useMemo(() => slices.map(() => ({})), [slices]));
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const formatValue = React.useCallback(
    (value: number) => formatStatistic(value, locale, format, true),
    [format, locale]
  );

  const names = React.useMemo(
    () => slices.map((_, index) => formatCategory(categoryAt(index, categories, [slices]), locale)),
    [slices, categories, locale]
  );

  const colors = React.useMemo(
    () => slices.map((slice, index) => slice.color ?? seriesColor(index, undefined)),
    [slices]
  );

  /*
   * What each slice is worth, and what the whole is.
   *
   * A negative is left out rather than drawn: it has no share of a whole, and
   * both ways of forcing one in are wrong — as an absolute it claims the
   * opposite of what it means, and as a signed sweep it runs backwards over the
   * slice beside it.
   */
  const shares = slices.map((slice, index) =>
    visibility.visible[index] && slice.value !== null && slice.value > 0 ? slice.value : 0
  );
  const total = shares.reduce((sum, one) => sum + one, 0);

  const boxWidth = measured.width;
  const boxHeight =
    typeof height === 'number'
      ? height
      : height === undefined
        ? PLOT_HEIGHT[size]
        : measured.height;

  const font = CHART_FONT_SIZE[size];
  const semi = shape === 'semi';
  const cx = boxWidth / 2;
  // A semicircle is drawn from its base, so its centre sits low in the box and
  // the radius may take the whole height rather than half of it.
  const cy = semi ? boxHeight - font - 4 : boxHeight / 2;
  const outer = Math.max(
    0,
    semi ? Math.min(boxWidth / 2, boxHeight - font - 8) - 2 : Math.min(boxWidth, boxHeight) / 2 - 2
  );
  const inner = shape === 'pie' ? 0 : outer * HOLE;

  const turn = semi ? Math.PI : Math.PI * 2;
  const first = semi ? -Math.PI / 2 : (startAngle * Math.PI) / 180;

  /*
   * Where each slice begins and ends, in the clock convention.
   *
   * Not memoised: `shares` is a fresh array on every render, so a memo keyed on
   * it would miss every time and cost the comparison for nothing. The work is a
   * running total over a handful of numbers.
   */
  let angle = first;
  const arcs = shares.map((share) => {
    const from = angle;

    angle += total > 0 ? (share / total) * turn : 0;

    return { from, to: angle, share };
  });

  /** The slice under a pointer, by where it is rather than by what it hit. */
  const sliceAt = (clientX: number, clientY: number) => {
    const host = hostRef.current;

    if (!host || total <= 0) {
      return null;
    }

    const rect = host.getBoundingClientRect();
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;
    const radius = Math.hypot(dx, dy);

    if (radius > outer + REACH || radius < inner) {
      return null;
    }

    // Back into the clock convention, and wrapped into the turn the chart
    // actually occupies so a slice crossing twelve o'clock still matches.
    const angle = Math.atan2(dx, -dy);
    const found = arcs.findIndex(({ from, to, share }) => {
      if (share <= 0) {
        return false;
      }

      const offset = (angle - from + Math.PI * 4) % (Math.PI * 2);

      return offset < to - from;
    });

    return found === -1 ? null : found;
  };

  const walk = (delta: number) => {
    const drawn = arcs.map((arc, index) => (arc.share > 0 ? index : -1)).filter((i) => i >= 0);

    if (drawn.length === 0) {
      return;
    }

    const at = activeIndex === null ? (delta > 0 ? -1 : 0) : drawn.indexOf(activeIndex);

    setActiveIndex(drawn[(at + delta + drawn.length) % drawn.length]);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      walk(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      walk(-1);
    } else if (event.key === 'Escape') {
      setActiveIndex(null);
    } else {
      return;
    }

    event.preventDefault();
  };

  const percent = (share: number) =>
    total > 0
      ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
          share / total
        )
      : '';

  const active = activeIndex === null ? null : arcs[activeIndex];
  /*
   * One row, and it carries no name.
   *
   * On a cartesian chart the heading is the category and each row names its
   * series, because a column holds several. A slice *is* the category, so a row
   * that repeated it would print the name twice in a panel two words wide — and
   * the second one is the copy that gets truncated.
   */
  const items =
    active && active.share > 0
      ? [
          {
            seriesIndex: activeIndex as number,
            color: colors[activeIndex as number],
            value: active.share,
            formatted: `${formatValue(active.share)} · ${percent(active.share)}`,
            label: slices[activeIndex as number]?.label
          }
        ]
      : [];
  const heading = active && active.share > 0 ? names[activeIndex as number] : undefined;

  // Anchored on the slice's own middle, pushed out to the edge of the ring.
  const anchor = active ? polarPoint(cx, cy, outer * 0.75, (active.from + active.to) / 2) : null;

  const options: MPChartTooltip =
    tooltip === false ? { mode: 'none' } : tooltip === true || tooltip === undefined ? {} : tooltip;
  const legendOptions: MPChartLegend =
    legend === false
      ? { interactive: false }
      : legend === true || legend === undefined
        ? {}
        : legend;
  const showLegend = legend !== false && slices.length > 1;

  const nothing = total <= 0;
  const values: ChartValue[][] = [slices];

  return (
    <ChartShell
      {...rest}
      size={size}
      className={['mp-pie-chart', className ?? ''].filter(Boolean).join(' ')}
      style={style}
      plotRef={hostRef}
      name={label ?? words.label}
      describedBy={nothing ? undefined : tableId}
      interactive={!nothing}
      height={height}
      legendSide={legendOptions.side ?? 'bottom'}
      plotProps={{
        onPointerMove:
          nothing || options.mode === 'none'
            ? undefined
            : (event) => setActiveIndex(sliceAt(event.clientX, event.clientY)),
        onPointerLeave: () => setActiveIndex(null),
        onKeyDown: nothing || options.mode === 'none' ? undefined : onKeyDown,
        onBlur: () => setActiveIndex(null)
      }}
      tooltip={
        anchor && items.length > 0 && options.mode !== 'none' ? (
          <ChartTooltipPanel
            heading={heading}
            items={items}
            x={anchor.x}
            y={anchor.y}
            flip={anchor.x > cx}
            size={size}
          />
        ) : null
      }
      legend={
        showLegend ? (
          <ChartLegend
            names={names}
            colors={colors}
            options={legendOptions}
            visibility={visibility}
            size={size}
          />
        ) : null
      }
      status={{ heading, items }}
      table={
        nothing ? null : (
          <ChartTable
            id={tableId}
            caption={label ?? words.table}
            corner={words.category}
            categories={names}
            names={[label ?? words.table]}
            values={values}
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
          <g className="mp-pie-chart__slices">
            {arcs.map((arc, index) => {
              if (arc.share <= 0) {
                return null;
              }

              const on = activeIndex === index;
              // The gap between slices is drawn as a stroke in the page's own
              // colour rather than by shrinking the sweep, so every slice keeps
              // the angle its share earned. A slice narrowed to make room would
              // be a slice reporting a smaller number than it has.
              return (
                <path
                  key={index}
                  d={arcPath(cx, cy, on ? outer + 3 : outer, inner, arc.from, arc.to)}
                  fill={colors[index]}
                  stroke="var(--_mp-color-surface)"
                  strokeWidth={MARK_GAP}
                  strokeLinejoin="round"
                  opacity={visibility.hovered === null || visibility.hovered === index ? 1 : 0.35}
                />
              );
            })}

            {valueLabels === 'all'
              ? arcs.map((arc, index) => {
                  const written = percent(arc.share);
                  const sweep = arc.to - arc.from;
                  const at = polarPoint(
                    cx,
                    cy,
                    inner > 0 ? (outer + inner) / 2 : outer * 0.68,
                    (arc.from + arc.to) / 2
                  );
                  // Dropped rather than clipped where the slice cannot hold it:
                  // the arc it sits on has to be longer than the text plus air.
                  const room = sweep * (inner > 0 ? (outer + inner) / 2 : outer * 0.68);

                  if (arc.share <= 0 || room < written.length * font * 0.6 + 8) {
                    return null;
                  }

                  return (
                    <text
                      key={index}
                      x={at.x}
                      y={at.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      // Ordinary ink on the ring rather than a colour picked to
                      // survive each fill: `on-surface` reads on every slot of
                      // the palette, which is a thing the palette was measured
                      // for.
                      fill="var(--_mp-color-on-surface)"
                      fontSize={font}
                    >
                      {written}
                    </text>
                  );
                })
              : null}
          </g>
        </svg>
      ) : null}

      {center !== undefined && center !== null && shape !== 'pie' && !nothing ? (
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center text-center"
          style={{
            left: cx - inner,
            top: cy - inner,
            width: inner * 2,
            height: semi ? inner : inner * 2
          }}
        >
          {center}
        </div>
      ) : null}
    </ChartShell>
  );
}
