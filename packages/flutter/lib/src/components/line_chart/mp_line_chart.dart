/// A quantity over an ordered axis.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/internal/chart_line.dart';
import 'package:material_plus_ui/src/types.dart';

/// A quantity over an ordered axis — how it has moved, and where it is going.
///
/// ```dart
/// MPLineChart(
///   categories: const <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
///   series: const <MPChartSeries>[
///     MPChartSeries(name: 'Signups', data: <num>[120, 138, 131, 164, 190]),
///   ],
/// )
/// ```
///
/// What a line encodes is **position**: it says where a number was, and the
/// distance between two of them says how far it moved.
///
/// ## The axis does not start at zero
///
/// A bar's length means its value, so a bar chart cut off above zero is a lie
/// about proportion. A line's position means its value and nothing about the
/// mark claims proportionality, so cropping the scale moves every point by the
/// same amount. Pass `yAxis: MPChartAxis(min: 0)` where zero genuinely is the
/// baseline.
///
/// ## A gap is a gap
///
/// A `null` is a point nothing was measured at, and the line breaks there.
/// [gaps] is there for the two cases where breaking is the wrong reading:
/// [MPChartGaps.connect] joins the two sides with a **dashed** run, and
/// [MPChartGaps.zero] draws the missing reading at zero.
///
/// ## Everything a pointer does, a keyboard does
///
/// The plot is one tab stop. The arrow keys walk the columns, Home and End
/// jump to the ends, Escape clears the reading, and a live region says each
/// column out loud. The plot's own semantics carry the whole table behind the
/// picture, so a reader who cannot see it has the numbers themselves.
class MPLineChart extends StatelessWidget {
  /// Creates a line chart.
  const MPLineChart({
    required this.series,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.zoom,
    this.curve = MPChartCurve.linear,
    this.markers,
    this.gaps = MPChartGaps.gap,
    this.valueLabels = MPChartValueLabels.none,
    this.height,
    this.format,
    this.locale,
    this.label,
    this.legend,
    this.tooltip,
    this.empty,
    this.labelColor = MPChartLabelColor.ink,
    this.size,
    this.dateNames,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The series, in the order their colours are handed out.
  final List<MPChartSeries> series;

  /// The category axis' labels. Points may carry their own `x` instead.
  final List<MPChartCategory>? categories;

  /// The category axis.
  final MPChartAxis? xAxis;

  /// The value axis.
  final MPChartAxis? yAxis;

  /// Lets a reader drag a range out of the category axis and redraws to it.
  /// `null` leaves it off.
  final MPChartZoom? zoom;

  /// How the line gets from one point to the next.
  final MPChartCurve curve;

  /// The dots on the joins. `null`, React's `'auto'`, draws them while they
  /// still have room to be separate marks and drops them once the line is
  /// denser than that.
  final bool? markers;

  /// What the line does where a series has no value.
  final MPChartGaps gaps;

  /// Which values are written onto the line itself.
  final MPChartValueLabels valueLabels;

  /// How tall the drawing is, axis labels included. Defaults to the [size]
  /// ladder.
  final double? height;

  /// How numbers are written everywhere they appear. Without it a figure is
  /// compacted past ten thousand.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**. Read out in place of the drawing.
  final String? label;

  /// The legend. Drawn from two series up unless it says otherwise.
  final MPChartLegend? legend;

  /// What the pointer uncovers. On by default.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink the legend's names and the written values wear.
  final MPChartLabelColor labelColor;

  /// Plot height, type, line weight and marker radius. [MPSize.md] unless an
  /// `MPConfigProvider` says otherwise.
  final MPSize? size;

  /// The words dates are written with. Left out, the library's table for the
  /// locale in force, the same one the date pickers read.
  final MPDateNames? dateNames;

  /// Drives the plot's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the chart is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    return CartesianFrame(
      series: series,
      categories: categories,
      xAxis: xAxis,
      yAxis: yAxis,
      zoom: zoom,
      height: height,
      format: format,
      locale: locale,
      label: label,
      legend: legend,
      tooltip: tooltip,
      empty: empty,
      labelColor: labelColor,
      size: size,
      dateNames: dateNames,
      focusNode: focusNode,
      autofocus: autofocus,
      // A line's points sit *on* the category ticks rather than in the middle
      // of a band, so the line starts at the axis.
      inset: true,
      // Zero is left out of the scale, because a line's position carries its
      // value — unless a gap is a zero, which is a reading the axis must reach.
      includeZero: gaps == MPChartGaps.zero,
      // A written value rides above its point, and the highest point is at the
      // top of the plot already.
      headroom: valueLabels == MPChartValueLabels.none ? 0 : 14,
      paint: _paint,
    );
  }

  void _paint(Canvas canvas, Size size, CartesianContext context) {
    paintLines(
      canvas,
      size,
      context,
      curve: curve,
      markers: markers,
      gaps: gaps,
      valueLabels: valueLabels,
    );
  }
}
