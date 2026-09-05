import * as React from 'react';
import { CartesianFrame, type CartesianChartProps } from '../../internal/ChartFrame';
import { useMPLocale } from '../../internal/locale';
import { useMPSize } from '../../internal/config';
import {
  BAR_BAND_RATIO,
  BAR_MAX_THICKNESS,
  BAR_RADIUS,
  CHART_FONT_SIZE,
  MARK_GAP,
  barPath,
  formatStatistic,
  textWidth,
  toValues,
  type BarEnd
} from '../../internal/chart';
import type { MPChartValueLabels } from '../../types';

export interface MPBarChartProps extends CartesianChartProps {
  /**
   * Stacks the series into one bar per category instead of standing them side
   * by side.
   *
   * Grouped compares the parts with each other; stacked compares the totals and
   * shows what makes them up. Both cannot be true at once, and picking the
   * wrong one is the most common way a bar chart answers a question nobody
   * asked.
   * @default false
   */
  stacked?: boolean;
  /**
   * Turns the chart on its side, so the bars run left to right.
   *
   * The prop that long category names want: a horizontal bar gives each name a
   * whole row rather than a slot the width of one bar, so nothing has to be cut
   * or turned on its side to fit. `xAxis` is still the category axis and
   * `yAxis` is still the value axis — the orientation changes the drawing, not
   * what the data means.
   * @default false
   */
  horizontal?: boolean;
  /**
   * Which values are written onto the bars.
   * @default 'none'
   */
  valueLabels?: MPChartValueLabels;
}

/**
 * A measured length per category — how much, next to how much else.
 *
 * ```tsx
 * <MPBarChart
 *   categories={['Search', 'Direct', 'Social', 'Mail']}
 *   series={[{ name: 'Sessions', data: [4820, 3110, 1940, 860] }]}
 * />
 * ```
 *
 * It is the shape for a magnitude compared across a handful of named things.
 * What a bar encodes is **length**, and length is the one visual channel a
 * reader judges accurately, which is why a bar chart beats a pie for almost
 * every comparison somebody actually has to make.
 *
 * ## The axis starts at zero and there is no prop to stop it
 *
 * A bar's length is proportional to its value only from a zero baseline. Crop
 * the axis and a bar twice the height of its neighbour stands for a value five
 * percent larger — which is not a smaller lie for being a common one, and it is
 * told in the shape a reader trusts most.
 *
 * `yAxis={{ min }}` still moves the scale, because a caller who has said so has
 * said so. It is the wrong tool for a set of values that are close together;
 * the right one is [MPLineChart](line-chart), whose marks claim nothing about
 * proportion.
 *
 * ## Grouped or stacked, never both
 *
 * Side by side compares the parts with each other. Stacked compares the totals
 * and shows what makes them up. A stack's inner segments sit on a wobbly floor
 * and cannot be compared by eye, so reach for it when the total is the point
 * and for grouping when it is not.
 *
 * ## Turn it sideways for long names
 *
 * `horizontal` gives every category a row of its own, which is what a set of
 * names like "Onboarding flow" needs. The alternative is labels cut to a slot
 * the width of one bar, or an axis of words rotated forty-five degrees, which
 * is unreadable at a glance and takes a band of the plot to be unreadable in.
 */
export function MPBarChart({
  stacked = false,
  horizontal = false,
  valueLabels = 'none',
  ...frame
}: MPBarChartProps) {
  const size = useMPSize(frame.size);
  const locale = useMPLocale(frame.locale);

  /*
   * How much room the written values need past the end of the longest bar.
   *
   * Measured here rather than in the frame because only the chart knows what it
   * is about to draw. On an upright chart that is one line of type; turned
   * sideways it is the width of the widest number, which is why a fixed
   * reservation would be too much room in one orientation and too little in the
   * other — the first version of this drew "4,820" seven pixels off the plot.
   */
  const headroom = React.useMemo(() => {
    const font = CHART_FONT_SIZE[size];

    if (valueLabels === 'none' || stacked) {
      return 0;
    }

    if (!horizontal) {
      return font + 8;
    }

    const widest = toValues(frame.series)
      .flat()
      .reduce(
        (most, value) =>
          value.value === null
            ? most
            : Math.max(
                most,
                textWidth(
                  String(value.label ?? formatStatistic(value.value, locale, frame.format, true)),
                  font
                )
              ),
        0
      );

    return widest + 10;
  }, [valueLabels, stacked, horizontal, size, locale, frame.series, frame.format]);

  return (
    <CartesianFrame
      {...frame}
      // Bars sit *between* the category ticks, in the middle of a slot. Lines
      // sit on the ticks. That half-step is the difference between a bar
      // standing in its category and one straddling the boundary.
      inset={false}
      stacked={stacked}
      horizontal={horizontal}
      bandRatio={BAR_BAND_RATIO}
      // Not a prop. See the note on the component.
      includeZero
      headroom={headroom}
    >
      {({
        plot,
        values,
        visible,
        colors,
        band,
        valuePx,
        categoryPx,
        zeroPx,
        hovered,
        activeIndex,
        format
      }) => {
        const count = values.reduce((most, one) => Math.max(most, one.length), 0);
        const drawn = values.map((_, index) => index).filter((index) => visible[index]);

        /*
         * How thick one bar is, and where in its slot it sits.
         *
         * Grouped, the band is divided between the visible series and each
         * takes a share less a gap — so hiding one with the legend widens the
         * survivors rather than leaving a hole in every category. Stacked,
         * there is one bar per category and the band is all of it.
         */
        const share = stacked ? band.band : band.band / Math.max(1, drawn.length);
        const thickness = Math.max(
          1,
          Math.min(share - (stacked ? 0 : MARK_GAP), BAR_MAX_THICKNESS[size])
        );

        return (
          <g className="mp-bar-chart__marks">
            {values.map((one, series) => {
              if (!visible[series]) {
                return null;
              }

              const paint = colors[series];
              const dimmed = hovered !== null && hovered !== series;
              const place = drawn.indexOf(series);

              return (
                <g key={series} opacity={dimmed ? 0.25 : 1}>
                  {Array.from({ length: count }, (_, at) => {
                    const value = one[at]?.value ?? null;

                    if (value === null) {
                      return null;
                    }

                    /*
                     * Where this bar starts from. Grouped, the axis. Stacked,
                     * whatever the visible series before it add up to — with
                     * the two signs accumulating apart, so a category holding
                     * +8 and −3 grows in both directions from the baseline.
                     */
                    let base = 0;
                    let last = series;

                    if (stacked) {
                      let up = 0;
                      let down = 0;

                      for (const other of drawn) {
                        const amount = values[other][at]?.value ?? null;

                        if (amount === null) {
                          continue;
                        }

                        if (other === series) {
                          base = amount >= 0 ? up : down;
                        }

                        if (amount >= 0) {
                          up += amount;
                        } else {
                          down += amount;
                        }

                        // The outermost segment in this bar's own direction is
                        // the only one whose end is the total, so it is the only
                        // one that gets the rounding.
                        if (amount >= 0 === value >= 0) {
                          last = other;
                        }
                      }
                    }

                    const from = valuePx(base);
                    const to = valuePx(value + (stacked ? base : 0));
                    // The gap between two segments comes out of the one further
                    // from zero, so the boundary stays where the running total
                    // puts it — the same rule the area chart's bands follow.
                    const start =
                      stacked && base !== 0 ? from + (to > from ? MARK_GAP : -MARK_GAP) : from;
                    const length = Math.abs(to - start);

                    if (length <= 0 || to > from !== to > start) {
                      return null;
                    }

                    // The band's near edge, then this series' share of it, then
                    // centred in that share. Stacked, the share *is* the band,
                    // so the same three terms centre one bar in the slot.
                    const along =
                      (horizontal ? plot.top : plot.left) +
                      categoryPx(at) -
                      band.band / 2 +
                      (stacked ? 0 : place * share) +
                      (share - thickness) / 2;

                    const end: BarEnd =
                      series !== last
                        ? 'none'
                        : horizontal
                          ? value >= 0
                            ? 'right'
                            : 'left'
                          : value >= 0
                            ? 'top'
                            : 'bottom';

                    const box = horizontal
                      ? { x: Math.min(start, to), y: along, w: length, h: thickness }
                      : { x: along, y: Math.min(start, to), w: thickness, h: length };

                    const active = activeIndex === at;

                    return (
                      <path
                        key={at}
                        d={barPath(box.x, box.y, box.w, box.h, BAR_RADIUS, end)}
                        fill={paint}
                        // The column under the pointer keeps its full colour and
                        // the rest step back, which is what makes the crosshair
                        // point at something.
                        opacity={activeIndex === null || active ? 1 : 0.55}
                      />
                    );
                  })}

                  {valueLabels === 'none' || stacked
                    ? null
                    : one.map((value, at) => {
                        if (value.value === null) {
                          return null;
                        }

                        const numbers = one
                          .map((v) => v.value)
                          .filter((v): v is number => v !== null);
                        const written =
                          valueLabels === 'all' ||
                          (valueLabels === 'last' && at === count - 1) ||
                          (valueLabels === 'extremes' &&
                            (value.value === Math.min(...numbers) ||
                              value.value === Math.max(...numbers)));

                        if (!written) {
                          return null;
                        }

                        const to = valuePx(value.value);
                        const along =
                          (horizontal ? plot.top : plot.left) +
                          categoryPx(at) -
                          band.band / 2 +
                          place * share +
                          share / 2;
                        // Written just past the data end, on the outside. Inside
                        // the bar it would have to survive the fill's colour,
                        // and a label that changes ink with its own value is one
                        // more thing between the reader and the number.
                        const away = value.value >= 0 ? -6 : 6;

                        return (
                          <text
                            key={at}
                            x={horizontal ? to - away : along}
                            y={horizontal ? along : to + away}
                            textAnchor={
                              horizontal ? (value.value >= 0 ? 'start' : 'end') : 'middle'
                            }
                            dominantBaseline={horizontal ? 'central' : 'auto'}
                            fill="var(--_mp-color-on-surface)"
                            fontSize={CHART_FONT_SIZE[size] - 1}
                          >
                            {value.label ?? format(value.value)}
                          </text>
                        );
                      })}
                </g>
              );
            })}

            {/* The baseline again, over the bars. A bar drawn across zero
                otherwise hides the line its own length is measured from. */}
            {horizontal ? (
              <line
                x1={zeroPx}
                x2={zeroPx}
                y1={plot.top}
                y2={plot.top + plot.height}
                stroke="var(--_mp-color-outline)"
                strokeWidth={1}
              />
            ) : (
              <line
                x1={plot.left}
                x2={plot.left + plot.width}
                y1={zeroPx}
                y2={zeroPx}
                stroke="var(--_mp-color-outline)"
                strokeWidth={1}
              />
            )}
          </g>
        );
      }}
    </CartesianFrame>
  );
}
