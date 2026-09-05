import * as React from 'react';
import { CartesianFrame, type CartesianChartProps } from '../../internal/ChartFrame';
import {
  MARKER_RADIUS,
  MARK_SHAPES,
  bubbleRadius,
  markPath,
  pointX,
  type MPChartMarkShape
} from '../../internal/chart';

export interface MPScatterChartProps extends CartesianChartProps {
  /**
   * Sizes each mark by its point's `z`, so a third number rides along.
   *
   * The **area** carries it and not the radius — a bubble drawn with its radius
   * proportional to the value shows four times the ink for twice the number,
   * and every reader judges the blob rather than the line across it.
   * @default false
   */
  bubble?: boolean;
  /** How big the largest bubble gets, in pixels. @default 22 */
  maxRadius?: number;
  /**
   * Gives each series a mark of its own shape as well as its own colour.
   *
   * On by default, and it is not decoration. Colour separates **three** series
   * where any two marks can touch, and a scatter is exactly that case — see the
   * note on the component. A shape is the second channel that carries the rest,
   * and it survives greyscale, print and forced colours too.
   * @default true
   */
  shapes?: boolean;
}

/** How far off a mark the pointer still counts as on it. */
const REACH = 20;

/**
 * Two measures against each other, one mark per observation.
 *
 * ```tsx
 * <MPScatterChart
 *   series={[{ name: 'Runs', data: [{ x: 12, y: 4.2 }, { x: 19, y: 5.1 }] }]}
 * />
 * ```
 *
 * The only chart here with a value axis in **both** directions. Its question is
 * whether two things move together, and its marks are observations rather than
 * a sequence — so there is no order to walk along and nothing to join up.
 *
 * ## Neither axis starts at zero
 *
 * A position encodes a value and claims nothing about proportion, so cropping
 * both scales moves every mark by the same amount and the relationship survives
 * intact. Forcing zero onto two measures that live between 40 and 60 puts the
 * whole picture in one corner, which is the one way to make a scatter say
 * nothing at all.
 *
 * ## Three series is the cap on colour alone
 *
 * The palette's eight slots are separable pair by pair only to the third, and
 * on a scatter **any two marks can sit side by side** — unlike a line or a bar,
 * where only neighbours meet. That is a property of the colour space rather
 * than of this palette, and no ordering of eight does better.
 *
 * So the marks take shapes as well: a circle, a square, a triangle, a diamond
 * and a cross, each scaled to the same area so no series looks heavier than
 * another. Past five series, facet the chart rather than reaching for a sixth
 * shape.
 *
 * ## The grid runs both ways here and nowhere else
 *
 * A grid in both directions is graph paper, and on a chart of columns the
 * vertical rules would be doing the job the crosshair already does. Here there
 * is no column to be in and reading a mark's x off the picture is half of what
 * the reader came for, so graph paper is exactly the point.
 */
export function MPScatterChart({
  bubble = false,
  maxRadius = 22,
  shapes = true,
  ...frame
}: MPScatterChartProps) {
  const shapeOf = (index: number): MPChartMarkShape =>
    shapes ? MARK_SHAPES[index % MARK_SHAPES.length] : 'circle';

  return (
    <CartesianFrame
      {...frame}
      // The category axis is a second value axis: what a scatter needs and what
      // nothing else does.
      xScale="value"
      // Neither scale is dragged to zero. See the note on the component.
      includeZero={false}
      markRadius={REACH}
      // A mark is drawn from its centre, so half of the widest one hangs over
      // every edge — including the value axis' own labels, which `headroom`
      // does not cover because it only reserves one side.
      markInset={bubble ? maxRadius + 2 : MARKER_RADIUS.xl + 2}
      marks={({ values, visible, valuePx, categoryValuePx, categories, size }) => {
        const base = MARKER_RADIUS[size];
        const biggest = bubble
          ? values.reduce(
              (most, one, series) =>
                visible[series]
                  ? one.reduce((inner, value) => Math.max(inner, value.z ?? 0), most)
                  : most,
              0
            )
          : 0;

        return values.flatMap((one, series) =>
          visible[series]
            ? one.flatMap((value, index) => {
                const x = pointX(value, index, categories);

                if (value.value === null || x === null) {
                  return [];
                }

                const r = bubble ? bubbleRadius(value.z ?? 0, biggest, maxRadius, base) : base + 1;

                return [{ series, index, x: categoryValuePx(x), y: valuePx(value.value), r }];
              })
            : []
        );
      }}
      // The legend's swatch is the mark's own shape, not a dot. A legend whose
      // swatches are all circles is a legend that only carries the colour, and
      // the shape is here precisely because the colour runs out.
      swatch={(index, color) => (
        <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden="true" className="block">
          <path
            d={markPath(shapeOf(index), 5, 5, 4)}
            fill={shapeOf(index) === 'cross' ? 'none' : color}
            stroke={color}
            strokeWidth={shapeOf(index) === 'cross' ? 1.5 : 0}
          />
        </svg>
      )}
    >
      {({ marks, colors, activeMark, hovered }) => (
        <g className="mp-scatter-chart__marks">
          {marks.map((mark, at) => {
            const shape = shapeOf(mark.series);
            const on = activeMark === mark;
            const dimmed = hovered !== null && hovered !== mark.series;

            return (
              <path
                key={at}
                d={markPath(shape, mark.x, mark.y, on ? mark.r + 1.5 : mark.r)}
                // A cross is a stroke and has no inside; everything else is a
                // fill with a ring of surface round it, which is what keeps two
                // overlapping marks reading as two.
                fill={shape === 'cross' ? 'none' : colors[mark.series]}
                stroke={shape === 'cross' ? colors[mark.series] : 'var(--_mp-color-surface)'}
                strokeWidth={shape === 'cross' ? 2 : 1.5}
                strokeLinecap="round"
                // Marks overlap by nature, so they are drawn part-transparent: a
                // dense cluster then reads as dense rather than as one blob the
                // colour of whichever series was drawn last.
                opacity={dimmed ? 0.15 : on ? 1 : 0.85}
              />
            );
          })}

          {/* Nothing else. No line joining the marks, and no trend line: a
              scatter's marks are observations rather than a sequence, and a
              fitted line is a claim this has no way to justify — which model,
              over what range, with what confidence. */}
        </g>
      )}
    </CartesianFrame>
  );
}
