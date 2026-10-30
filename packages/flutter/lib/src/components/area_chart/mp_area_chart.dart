/// A quantity over an ordered axis, with the room under it filled in.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/internal/chart_line.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much of its colour a band keeps: faint where bands overlap, so the ones
/// behind show through, and nearly solid in a stack, where nothing is behind
/// anything.
const double _overlappingFill = 0.18;
const double _stackedFill = 0.85;

/// A quantity over an ordered axis, with the room under it filled in.
///
/// ```dart
/// MPAreaChart(
///   categories: const <String>['Jan', 'Feb', 'Mar', 'Apr'],
///   series: const <MPChartSeries>[
///     MPChartSeries(name: 'Storage', data: <num>[12, 19, 24, 31]),
///   ],
/// )
/// ```
///
/// A line chart that has been asked a second question. A line says where a
/// number was; filling underneath says how much there is of it — so this is
/// the shape for a volume, a total, a stock of something, and [stacked] is the
/// shape for how that total is made up.
///
/// ## The axis starts at zero, and on a line chart it does not
///
/// A filled area's **size** encodes the quantity, so the fill is proportional
/// to the value only from a zero baseline. If your data wants a cropped axis,
/// it wants a line.
///
/// ## Stacked bands are separated by surface
///
/// A stack leaves two pixels of page between neighbours, taken entirely from
/// the band **above** the boundary: every band's top edge stays where its
/// running total puts it, because that edge is the data. Positives stack up and
/// negatives stack down.
///
/// ## Only visible series are in the stack
///
/// Turning a series off re-stacks the survivors rather than leaving a hole, and
/// the colours do not move with them.
class MPAreaChart extends StatelessWidget {
  /// Creates an area chart.
  const MPAreaChart({
    required this.series,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.zoom,
    this.curve = MPChartCurve.linear,
    this.stacked = MPChartStack.none,
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
  final MPChartZoom? zoom;

  /// How the edge of each band gets from one point to the next.
  final MPChartCurve curve;

  /// Stacks the series on each other, so the top edge is the total.
  /// [MPChartStack.percent] fills the plot, so what is left is the
  /// composition alone.
  final MPChartStack stacked;

  /// The dots on the joins. `null` draws them on an unstacked chart with room
  /// for them and never on a stack, where a vertex belongs to a boundary.
  final bool? markers;

  /// What a band does where a series has no value: a hole in the fill, a fill
  /// closed across it with a dashed edge, or a reading of zero.
  final MPChartGaps gaps;

  /// Which values are written onto the top edge.
  final MPChartValueLabels valueLabels;

  /// How tall the drawing is, axis labels included.
  final double? height;

  /// How numbers are written everywhere they appear.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**.
  final String? label;

  /// The legend.
  final MPChartLegend? legend;

  /// What the pointer uncovers.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink the legend's names and the written values wear.
  final MPChartLabelColor labelColor;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The words dates are written with.
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
      // The band's points sit on the category ticks, as a line's do.
      inset: true,
      stacked: stacked,
      // A fill measures from zero or it measures nothing.
      includeZero: true,
      headroom: valueLabels == MPChartValueLabels.none ? 0 : 14,
      paint: _paint,
    );
  }

  void _paint(Canvas canvas, Size size, CartesianContext context) {
    final List<List<ChartValue>> values = context.values;
    final List<bool> visible = context.visible;
    final int count = values.fold<int>(0, (int most, List<ChartValue> one) {
      return math.max(most, one.length);
    });
    final bool stack = stacked != MPChartStack.none;

    /* What one band is worth, which on a percent stack is its share of its own
       column. The whole is the visible positives at that category. */
    final List<double>? totals = stacked != MPChartStack.percent
        ? null
        : <double>[
            for (int at = 0; at < count; at += 1)
              <double>[
                for (int s = 0; s < values.length; s += 1)
                  if (visible[s] && at < values[s].length) values[s][at].value ?? 0,
              ].where((double value) => value > 0).fold<double>(0, (double a, double b) => a + b),
          ];

    double? shareOf(double value, int at) {
      if (totals == null) {
        return value;
      }

      return value >= 0 && totals[at] > 0 ? value / totals[at] : null;
    }

    /* Where each band's two edges are. Unstacked, every band stands on the
       baseline. Stacked, a band stands on what the visible series before it add
       up to, with the two signs accumulating apart; a gap contributes nothing
       rather than resetting the total. */
    final List<List<Offset?>> tops = <List<Offset?>>[for (final _ in values) <Offset?>[]];
    final List<List<Offset?>> bases = <List<Offset?>>[for (final _ in values) <Offset?>[]];
    final double zero = context.zeroPx;

    for (int at = 0; at < count; at += 1) {
      double up = 0;
      double down = 0;

      for (int s = 0; s < values.length; s += 1) {
        final double? measured = at < values[s].length ? values[s][at].value : null;
        final double? raw = measured == null && gaps == MPChartGaps.zero ? 0 : measured;
        final double? value = raw == null ? null : shareOf(raw, at);

        if (!visible[s] || value == null) {
          tops[s].add(null);
          bases[s].add(null);

          continue;
        }

        if (!stack) {
          final Offset top = context.point(at, value);

          tops[s].add(top);
          bases[s].add(Offset(top.dx, zero));

          continue;
        }

        final double from = value >= 0 ? up : down;
        final double to = from + value;

        if (value >= 0) {
          up = to;
        } else {
          down = to;
        }

        final Offset base = context.point(at, from);

        tops[s].add(context.point(at, to));
        // The gap between two bands comes out of the one above the boundary;
        // the axis itself has nothing to be held off.
        bases[s].add(
          Offset(base.dx, from == 0 ? base.dy : base.dy - (value < 0 ? -1 : 1) * chartMarkGap),
        );
      }
    }

    paintLines(
      canvas,
      size,
      context,
      curve: curve,
      markers: markers,
      gaps: gaps,
      valueLabels: valueLabels,
      tops: tops,
      autoMarkers: !stack,
      // On a percent stack the picture is the share, so that is what is
      // written on it. The value is in the panel and the reading.
      written: totals == null
          ? null
          : (int series, int index, double value) => context.share(shareOf(value, index) ?? 0),
      under: (int s) {
        final Path band = gaps == MPChartGaps.connect
            ? bandPath(withoutGaps(tops[s]), withoutGaps(bases[s]), curve)
            : bandPath(tops[s], bases[s], curve);

        canvas.drawPath(
          band,
          Paint()
            ..color = context.colors[s].withValues(
              alpha: context.colors[s].a * (stack ? _stackedFill : _overlappingFill),
            ),
        );
      },
    );
  }
}
