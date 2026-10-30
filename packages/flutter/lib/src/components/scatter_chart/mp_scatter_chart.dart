/// Two measures against each other, one mark per observation.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/types.dart';

/// How far off a mark the pointer still counts as on it.
const double _reach = 20;

/// Two measures against each other, one mark per observation.
///
/// ```dart
/// MPScatterChart(
///   series: const <MPChartSeries>[
///     MPChartSeries(
///       name: 'Runs',
///       data: <MPChartDatum>[MPChartPoint(x: 12, y: 4.2), MPChartPoint(x: 19, y: 5.1)],
///     ),
///   ],
/// )
/// ```
///
/// The only chart here with a value axis in **both** directions. Its question
/// is whether two things move together, and its marks are observations rather
/// than a sequence, so there is nothing to join up.
///
/// ## Neither axis starts at zero
///
/// A position claims nothing about proportion, so cropping both scales moves
/// every mark by the same amount and the relationship survives.
///
/// ## Three series is the cap on colour alone
///
/// On a scatter any two marks can sit side by side, and colour separates only
/// three series that touch. So the marks take shapes as well — a circle, a
/// square, a triangle, a diamond and a cross, each scaled to the same area.
///
/// ## No zoom
///
/// What a drag would cut is a row of category slots, and a scatter has none.
/// Crop it with `xAxis` and `yAxis` instead.
class MPScatterChart extends StatelessWidget {
  /// Creates a scatter chart.
  const MPScatterChart({
    required this.series,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.bubble = false,
    this.maxRadius = 22,
    this.shapes = true,
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

  /// The series. Each point's `x` is its place on the horizontal axis.
  final List<MPChartSeries> series;

  /// The horizontal values by index, for points that carry no `x`.
  final List<MPChartCategory>? categories;

  /// The horizontal axis, a second value axis here.
  final MPChartAxis? xAxis;

  /// The vertical axis.
  final MPChartAxis? yAxis;

  /// Sizes each mark by its point's `z`, carried by the **area** rather than
  /// the radius.
  final bool bubble;

  /// How big the largest bubble gets, in pixels.
  final double maxRadius;

  /// Gives each series a mark of its own shape as well as its own colour.
  final bool shapes;

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

  /// What the pointer uncovers. The one mark being pointed at by default.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink the legend's names wear.
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

  ChartMarkShape _shapeOf(int index) {
    return shapes
        ? ChartMarkShape.values[index % ChartMarkShape.values.length]
        : ChartMarkShape.circle;
  }

  @override
  Widget build(BuildContext context) {
    return CartesianFrame(
      series: series,
      categories: categories,
      xAxis: xAxis,
      yAxis: yAxis,
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
      xScale: CartesianXScale.value,
      includeZero: false,
      markRadius: _reach,
      // A mark is drawn from its centre, so half of the widest one hangs over
      // every edge.
      markInset: bubble ? maxRadius + 2 : chartMarkerRadius[MPSize.xl]! + 2,
      // The legend's swatch is the mark's own shape: the shape is here because
      // the colour runs out.
      swatch: (int index, Color color) => CustomPaint(
        size: const Size.square(10),
        painter: _SwatchPainter(shape: _shapeOf(index), color: color),
      ),
      marks: _marks,
      paint: _paint,
    );
  }

  List<ChartMark> _marks(CartesianContext layout) {
    final double base = chartMarkerRadius[layout.size]!;
    double biggest = 0;

    if (bubble) {
      for (int s = 0; s < layout.values.length; s += 1) {
        if (layout.visible[s]) {
          for (final ChartValue value in layout.values[s]) {
            biggest = math.max(biggest, value.z ?? 0);
          }
        }
      }
    }

    return <ChartMark>[
      for (int s = 0; s < layout.values.length; s += 1)
        if (layout.visible[s])
          for (int i = 0; i < layout.values[s].length; i += 1)
            if (layout.values[s][i].value != null &&
                pointX(layout.values[s][i], i, categories) != null)
              ChartMark(
                series: s,
                index: i,
                x: layout.categoryValuePx(pointX(layout.values[s][i], i, categories)!),
                y: layout.valuePx(layout.values[s][i].value!),
                r: bubble
                    ? bubbleRadius(layout.values[s][i].z ?? 0, biggest, maxRadius, base)
                    : base + 1,
              ),
    ];
  }

  void _paint(Canvas canvas, Size size, CartesianContext context) {
    for (final ChartMark mark in context.marks) {
      final ChartMarkShape shape = _shapeOf(mark.series);
      final bool on = identical(context.activeMark, mark);
      final bool dimmed = context.hovered != null && context.hovered != mark.series;
      final Color color = context.colors[mark.series];
      final Path path = markPath(shape, mark.x, mark.y, on ? mark.r + 1.5 : mark.r);

      // Marks overlap by nature, so they are drawn part-transparent: a dense
      // cluster then reads as dense rather than as one blob.
      paintFaded(canvas, size, dimmed ? 0.15 : (on ? 1 : 0.85), () {
        if (shape == ChartMarkShape.cross) {
          // A cross is a stroke and has no inside.
          canvas.drawPath(
            path,
            Paint()
              ..color = color
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2
              ..strokeCap = StrokeCap.round,
          );

          return;
        }

        // A ring of surface round each fill keeps two overlapping marks
        // reading as two.
        canvas
          ..drawPath(path, Paint()..color = color)
          ..drawPath(
            path,
            Paint()
              ..color = context.scheme.surface
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1.5,
          );
      });
    }

    // Nothing else: no line joining the marks and no trend line, because a
    // fitted line is a claim this has no way to justify.
  }
}

/// A legend swatch in a mark's own shape.
class _SwatchPainter extends CustomPainter {
  const _SwatchPainter({required this.shape, required this.color});

  final ChartMarkShape shape;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = markPath(shape, size.width / 2, size.height / 2, 4);

    canvas.drawPath(
      path,
      shape == ChartMarkShape.cross
          ? (Paint()
              ..color = color
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1.5)
          : (Paint()..color = color),
    );
  }

  @override
  bool shouldRepaint(_SwatchPainter oldDelegate) {
    return oldDelegate.shape != shape || oldDelegate.color != color;
  }
}
