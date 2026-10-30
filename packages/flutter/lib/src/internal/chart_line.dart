/// The line, its markers, its bridges and its written values, as the line and
/// area charts draw them.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much room a marker needs, in radii, before `markers: null` draws it: a
/// dot every three pixels is not a row of dots, it is a thicker line.
const double _markerRoom = 6;

/// Draws every visible series of [context] as a line, with its markers, its
/// bridges and its written values.
///
/// [tops], when given, replaces each series' own points — the area chart's
/// stacked top edges — and [written] what each value label says.
void paintLines(
  Canvas canvas,
  Size size,
  CartesianContext context, {
  required MPChartCurve curve,
  required bool? markers,
  required MPChartGaps gaps,
  required MPChartValueLabels valueLabels,
  List<List<Offset?>>? tops,
  String Function(int series, int index, double value)? written,
  void Function(int series)? under,
  bool autoMarkers = true,
}) {
  final Rect plot = context.plot;
  final double stroke = chartLineWidth[context.size]!;
  final double radius = chartMarkerRadius[context.size]!;
  final int count = context.values.fold<int>(0, (int most, List<ChartValue> one) {
    return math.max(most, one.length);
  });
  final double step = count > 1 ? plot.width / (count - 1) : plot.width;
  final bool showMarkers = markers ?? (autoMarkers && step >= radius * _markerRoom);
  final double labelSize = context.size == MPSize.xs || context.size == MPSize.sm ? 10 : 11;

  for (int index = 0; index < context.values.length; index += 1) {
    if (!context.visible[index]) {
      continue;
    }

    final List<ChartValue> one = context.values[index];
    final List<Offset?> points =
        tops?[index] ??
        <Offset?>[
          for (int at = 0; at < one.length; at += 1)
            one[at].value == null
                ? (gaps == MPChartGaps.zero ? context.point(at, 0) : null)
                : context.point(at, one[at].value!),
        ];
    final Color paint = context.colors[index];
    // Dimming is opacity rather than grey, so the survivor keeps its own colour.
    final bool dimmed = context.hovered != null && context.hovered != index;
    final bool Function(int) labelled = valueLabelTest(one, valueLabels);

    paintFaded(canvas, size, dimmed ? 0.25 : 1, () {
      under?.call(index);

      final Paint line = Paint()
        ..color = paint
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      canvas.drawPath(linePath(points, curve), line);

      // The runs across the gaps, dashed: the line carries on, and the part
      // of it that was measured still tells itself apart from the guess.
      if (gaps == MPChartGaps.connect) {
        canvas.drawPath(
          dashedPath(bridgePath(points), stroke * chartBridgeDash, stroke * chartBridgeDash),
          line,
        );
      }

      for (int at = 0; at < points.length; at += 1) {
        final Offset? point = points[at];

        if (point == null) {
          continue;
        }

        // The active column's dot is drawn whatever `markers` says: it is where
        // the crosshair and the panel are pointing.
        final bool active = context.activeIndex == at;

        if (!showMarkers && !active) {
          continue;
        }

        final double r = active ? radius + 1 : radius;

        // A ring of surface round the dot, so two series crossing read as two
        // marks rather than one blob.
        canvas
          ..drawCircle(point, r, Paint()..color = paint)
          ..drawCircle(
            point,
            r,
            Paint()
              ..color = context.scheme.surface
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2,
          );
      }

      if (valueLabels == MPChartValueLabels.none) {
        return;
      }

      for (int at = 0; at < one.length && at < points.length; at += 1) {
        final Offset? point = points[at];

        if (point == null || one[at].value == null || !labelled(at)) {
          continue;
        }

        // Centred on its point except at the two ends, where half a label
        // would hang past the plot.
        final ChartAnchor anchor = point.dx > plot.right - 24
            ? ChartAnchor.end
            : point.dx < plot.left + 24
            ? ChartAnchor.start
            : ChartAnchor.middle;

        paintChartText(
          canvas,
          one[at].label ??
              written?.call(index, at, one[at].value!) ??
              context.format(one[at].value!),
          Offset(point.dx, point.dy - radius - 5),
          style: context.textStyle.copyWith(fontSize: labelSize, color: context.labelInk(index)),
          anchor: anchor,
        );
      }
    });
  }
}
