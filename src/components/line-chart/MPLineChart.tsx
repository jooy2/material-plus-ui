import * as React from 'react';
import { CartesianFrame, type CartesianChartProps } from '../../internal/ChartFrame';
import {
  BRIDGE_DASH,
  LINE_WIDTH,
  MARKER_RADIUS,
  bridgePath,
  linePath,
  type PlotPoint
} from '../../internal/chart';
import type { MPChartCurve, MPChartGaps, MPChartValueLabels } from '../../types';

export interface MPLineChartProps extends CartesianChartProps {
  /**
   * How the line gets from one point to the next.
   * @default 'linear'
   */
  curve?: MPChartCurve;
  /**
   * The dots on the joins.
   *
   * `auto` draws them while they still have room to be separate marks and drops
   * them once the line is denser than that — a dot every three pixels is not a
   * row of dots, it is a thicker line.
   * @default 'auto'
   */
  markers?: boolean | 'auto';
  /**
   * What the line does where a series has no value.
   *
   * `break` stops and restarts, `connect` joins the two sides with a dashed
   * run, and `zero` draws the missing reading at zero and widens the axis to
   * hold it. The hover panel and the table still report a gap as a gap in all
   * three.
   * @default 'break'
   */
  gaps?: MPChartGaps;
  /**
   * Which values are written onto the line itself.
   * @default 'none'
   */
  valueLabels?: MPChartValueLabels;
}

/** How much room a marker needs before `auto` will draw it. */
const MARKER_ROOM = 6;

/**
 * A quantity over an ordered axis — how it has moved, and where it is going.
 *
 * ```tsx
 * <MPLineChart
 *   categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
 *   series={[{ name: 'Signups', data: [120, 138, 131, 164, 190] }]}
 * />
 * ```
 *
 * It is the shape for a value read along a sequence — days, releases, versions,
 * steps of a process. What it encodes is **position**, and that is the whole
 * argument for every decision below: a line says where a number was, and the
 * distance between two of them says how far it moved.
 *
 * ## The axis does not start at zero
 *
 * A bar's length means its value, so a bar chart cut off above zero is a lie
 * about proportion. A line's *position* means its value and nothing about the
 * mark claims proportionality, so cropping the scale moves every point by the
 * same amount and the picture survives. Forcing zero onto a series that runs
 * between 3,200 and 3,400 draws a flat line and reports a real change as
 * nothing happening.
 *
 * Pass `yAxis={{ min: 0 }}` where zero genuinely is the baseline.
 *
 * ## A gap is a gap
 *
 * A `null` is a point nothing was measured at, and the line breaks there rather
 * than being joined across. A bridged gap draws a straight run through values
 * nobody has, and it is the one kind of invented data a reader never questions
 * — it looks exactly like the rest of the line.
 *
 * `gaps` is there for the two cases where the default is the wrong reading.
 * `connect` joins the two sides and draws the joining run **dashed**, so the
 * line carries on and the picture still says which part of it was measured.
 * `zero` draws the missing reading at zero and widens the axis to hold it,
 * which is right where a gap means "none of it happened" and wrong where it
 * means "nobody was counting". The table behind the chart reports a gap as a
 * gap whichever is chosen.
 *
 * ## The hover layer is not optional
 *
 * A chart in a browser is a thing a reader interrogates, so the crosshair and
 * the panel are on by default: the question a line chart gets asked is "what
 * happened in March", and answering it by making somebody measure against a
 * gridline is answering it badly. The arrow keys walk the same columns, and a
 * clipped live region says each one out loud.
 */
export function MPLineChart({
  curve = 'linear',
  markers = 'auto',
  gaps = 'break',
  valueLabels = 'none',
  ...frame
}: MPLineChartProps) {
  return (
    <CartesianFrame
      {...frame}
      // A line's points sit *on* the category ticks rather than in the middle of
      // a band. That half-step is the difference between a line that starts at
      // the axis and one that floats a centimetre off it.
      inset
      // Zero is left out of the scale, because a line's *position* carries its
      // value and cropping the axis costs nothing — unless the caller has said
      // a gap is a zero, in which case zero is a reading the chart is about to
      // draw and an axis that did not reach it would draw it off the plot.
      includeZero={gaps === 'zero'}
      // A written value rides above its point, and the point at the top of the
      // scale is already at the top of the plot. Without room reserved for it,
      // the one label a reader most wants — the highest number — is the one
      // drawn off the edge.
      headroom={valueLabels === 'none' ? 0 : 14}
    >
      {({ plot, values, visible, colors, labelInk, point, size, hovered, activeIndex, format }) => {
        const stroke = LINE_WIDTH[size];
        const radius = MARKER_RADIUS[size];
        const count = values.reduce((most, one) => Math.max(most, one.length), 0);
        const step = count > 1 ? plot.width / (count - 1) : plot.width;
        const showMarkers = markers === 'auto' ? step >= radius * MARKER_ROOM : markers;

        return (
          <g className="mp-line-chart__marks">
            {values.map((one, index) => {
              if (!visible[index]) {
                return null;
              }

              const points: PlotPoint[] = one.map((value, at) =>
                value.value === null
                  ? gaps === 'zero'
                    ? point(at, 0)
                    : null
                  : point(at, value.value)
              );
              const paint = colors[index];
              // Dimming is what makes hovering the legend mean something. It is
              // opacity rather than grey, so the survivor keeps its own colour
              // and the reader is not asked to re-learn which line is which.
              const dimmed = hovered !== null && hovered !== index;

              return (
                <g key={index} opacity={dimmed ? 0.25 : 1}>
                  <path
                    d={linePath(points, curve)}
                    fill="none"
                    stroke={paint}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* The runs across the gaps, dashed. A reader asked for the
                      line to carry on, and gets that — with the part of it that
                      was measured still telling itself apart from the part that
                      was inferred. */}
                  {gaps === 'connect' ? (
                    <path
                      d={bridgePath(points)}
                      fill="none"
                      stroke={paint}
                      strokeWidth={stroke}
                      strokeDasharray={`${stroke * BRIDGE_DASH} ${stroke * BRIDGE_DASH}`}
                      strokeLinecap="round"
                    />
                  ) : null}

                  {points.map((at, i) => {
                    if (!at) {
                      return null;
                    }

                    // The active column's dot is drawn whatever `markers` says.
                    // It is not decoration — it is where the crosshair and the
                    // panel are pointing, and a crosshair with nothing on it
                    // leaves the reader to guess which line it crossed.
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
                        // A ring of surface around the dot, so two series
                        // crossing read as two marks rather than one blob.
                        stroke="var(--_mp-color-surface)"
                        strokeWidth={2}
                      />
                    );
                  })}

                  {valueLabels === 'none'
                    ? null
                    : one.map((value, i) => {
                        const at = points[i];

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

                        // Centred on its point everywhere except the two ends,
                        // where half a label would hang past the plot. Turning
                        // the anchor in is what keeps the last value — usually
                        // the point of writing any of them — inside the picture.
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
                            // Ordinary ink unless the caller asked for
                            // `labelColor="series"`. A number in the mark's
                            // colour is a number the reader decodes before they
                            // read it, so matching the two is their call.
                            fill={labelInk(index)}
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
