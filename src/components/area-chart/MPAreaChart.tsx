import * as React from 'react';
import { CartesianFrame, type CartesianChartProps } from '../../internal/ChartFrame';
import {
  LINE_WIDTH,
  MARKER_RADIUS,
  MARK_GAP,
  bandPath,
  linePath,
  type PlotPoint
} from '../../internal/chart';
import type { MPChartCurve, MPChartValueLabels } from '../../types';

export interface MPAreaChartProps extends CartesianChartProps {
  /**
   * How the edge of the band gets from one point to the next.
   * @default 'linear'
   */
  curve?: MPChartCurve;
  /**
   * Stacks the series on each other, so the top edge is the total and each
   * band is one part's share of it.
   *
   * The value axis then measures totals, and the question the chart answers
   * changes with it: unstacked areas are read against the axis one at a time,
   * and a stack is read as a composition. Only the bottom band and the total
   * are easy to read in a stack, which is the trade it makes.
   * @default false
   */
  stacked?: boolean;
  /**
   * The dots on the joins. `auto` draws them on an unstacked chart with room
   * for them and never on a stack, where a vertex belongs to a boundary rather
   * than to a line.
   * @default 'auto'
   */
  markers?: boolean | 'auto';
  /**
   * Which values are written onto the top edge.
   * @default 'none'
   */
  valueLabels?: MPChartValueLabels;
}

/** How much room a marker needs before `auto` will draw it. */
const MARKER_ROOM = 6;

/**
 * How much of its colour a band keeps.
 *
 * Faint where the bands overlap, because three of them read as three only if
 * the ones behind show through. Nearly solid in a stack, where nothing is
 * behind anything and a faint fill would only make the boundaries harder to
 * follow.
 */
const OVERLAPPING_FILL = 0.18;
const STACKED_FILL = 0.85;

/**
 * A quantity over an ordered axis, with the room under it filled in.
 *
 * ```tsx
 * <MPAreaChart
 *   categories={['Jan', 'Feb', 'Mar', 'Apr']}
 *   series={[{ name: 'Storage', data: [12, 19, 24, 31] }]}
 * />
 * ```
 *
 * It is a line chart that has been asked a second question. A line says where a
 * number was; filling underneath says how much there is of it — so this is the
 * shape for a volume, a total, a stock of something, and `stacked` is the shape
 * for how that total is made up.
 *
 * ## The axis starts at zero, and on a line chart it does not
 *
 * That is the whole difference between the two, and it is not a preference. A
 * filled area's **size** encodes the quantity, so the fill is only proportional
 * to the value from a zero baseline; cropping the scale makes a band twice the
 * height of another that is nowhere near twice its value.
 *
 * A line encodes **position** and claims nothing about proportion, which is why
 * [MPLineChart](line-chart) is free to crop and this is not. If your data wants
 * a cropped axis, it wants a line.
 *
 * ## Stacked bands are separated by surface, and the gap comes from above
 *
 * Two touching fills read as one shape, so a stack leaves two pixels of the
 * page between neighbours. That gap is taken entirely from the band **above**
 * the boundary: every band's top edge stays exactly where its cumulative total
 * puts it, because that edge is the data and moving it to make room would be
 * reporting a number the series does not have.
 *
 * Positives stack up and negatives stack down, so a category holding both is
 * drawn as two runs from the baseline rather than as one band that has crossed
 * itself.
 *
 * ## Only visible series are in the stack
 *
 * Turning a series off with the legend re-stacks the survivors rather than
 * leaving a hole where it was. The colours do not move with them: a slot comes
 * from a series' place in the `series` array, so what changes is the height of
 * the stack and never which band is which.
 */
export function MPAreaChart({
  curve = 'linear',
  stacked = false,
  markers = 'auto',
  valueLabels = 'none',
  ...frame
}: MPAreaChartProps) {
  return (
    <CartesianFrame
      {...frame}
      // The band's points sit *on* the category ticks, exactly as a line's do.
      inset
      stacked={stacked}
      // A fill measures from zero or it measures nothing. See the note above.
      includeZero
      headroom={valueLabels === 'none' ? 0 : 14}
    >
      {({ plot, values, visible, colors, point, zeroPx, size, hovered, activeIndex, format }) => {
        const stroke = LINE_WIDTH[size];
        const radius = MARKER_RADIUS[size];
        const count = values.reduce((most, one) => Math.max(most, one.length), 0);
        const step = count > 1 ? plot.width / (count - 1) : plot.width;
        const showMarkers = markers === 'auto' ? !stacked && step >= radius * MARKER_ROOM : markers;

        /*
         * Where each band's two edges are.
         *
         * Unstacked, every band stands on the baseline and they overlap, which
         * is why the fill is faint: three bands read as three only if the ones
         * behind show through.
         *
         * Stacked, a band stands on whatever the visible series before it add
         * up to. The two signs accumulate apart — a category holding +8 and −3
         * is two runs from the baseline and not one band that crossed itself —
         * and a `null` contributes nothing rather than resetting the total,
         * because a month nothing was measured in is not a month of zero.
         */
        const edges = values.map(() => ({ top: [] as PlotPoint[], base: [] as PlotPoint[] }));

        for (let at = 0; at < count; at += 1) {
          let up = 0;
          let down = 0;

          values.forEach((one, series) => {
            const value = one[at]?.value ?? null;

            if (!visible[series] || value === null) {
              edges[series].top.push(null);
              edges[series].base.push(null);

              return;
            }

            if (!stacked) {
              const top = point(at, value);

              edges[series].top.push(top);
              edges[series].base.push({ x: top.x, y: zeroPx });

              return;
            }

            const from = value >= 0 ? up : down;
            const to = from + value;

            if (value >= 0) {
              up = to;
            } else {
              down = to;
            }

            const top = point(at, to);
            const base = point(at, from);

            edges[series].top.push(top);
            // The gap between two bands comes out of the one above the
            // boundary, so the band below keeps its top edge exactly where its
            // total puts it. `from === 0` is the axis itself, which has nothing
            // to be held off.
            edges[series].base.push({
              x: base.x,
              y: from === 0 ? base.y : base.y - Math.sign(value || 1) * MARK_GAP
            });
          });
        }

        return (
          <g className="mp-area-chart__marks">
            {values.map((one, index) => {
              if (!visible[index]) {
                return null;
              }

              const { top, base } = edges[index];
              const paint = colors[index];
              const dimmed = hovered !== null && hovered !== index;

              return (
                <g key={index} opacity={dimmed ? 0.25 : 1}>
                  <path
                    d={bandPath(top, base, curve)}
                    fill={paint}
                    fillOpacity={stacked ? STACKED_FILL : OVERLAPPING_FILL}
                    stroke="none"
                  />

                  {/* The top edge in full colour. On a stack it is the boundary
                      between two shares; on an overlap it is the one part of a
                      faint band a reader can actually follow. */}
                  <path
                    d={linePath(top, curve)}
                    fill="none"
                    stroke={paint}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {top.map((at, i) => {
                    if (!at) {
                      return null;
                    }

                    const active = activeIndex === i;

                    if (!showMarkers && !active) {
                      return null;
                    }

                    return (
                      <circle
                        key={i}
                        cx={at.x}
                        cy={at.y}
                        r={active ? radius + 1 : radius}
                        fill={paint}
                        stroke="var(--_mp-color-surface)"
                        strokeWidth={2}
                      />
                    );
                  })}

                  {valueLabels === 'none'
                    ? null
                    : one.map((value, i) => {
                        const at = top[i];

                        if (!at || value.value === null) {
                          return null;
                        }

                        const real = one.filter((v) => v.value !== null);
                        const numbers = real.map((v) => v.value as number);
                        const written =
                          valueLabels === 'all' ||
                          (valueLabels === 'last' && value === real[real.length - 1]) ||
                          (valueLabels === 'extremes' &&
                            (value.value === Math.min(...numbers) ||
                              value.value === Math.max(...numbers)));

                        if (!written) {
                          return null;
                        }

                        const anchor =
                          at.x > plot.left + plot.width - 24
                            ? 'end'
                            : at.x < plot.left + 24
                              ? 'start'
                              : 'middle';

                        return (
                          <text
                            key={i}
                            x={at.x}
                            y={at.y - radius - 5}
                            textAnchor={anchor}
                            fill="var(--_mp-color-on-surface)"
                            fontSize={size === 'xs' || size === 'sm' ? 10 : 11}
                          >
                            {value.label ?? format(value.value)}
                          </text>
                        );
                      })}
                </g>
              );
            })}
          </g>
        );
      }}
    </CartesianFrame>
  );
}
