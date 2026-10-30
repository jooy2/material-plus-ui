/// A series as a mark, with no axes and nothing to read a value against.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// What the series is drawn as.
enum MPSparklineShape {
  /// A line.
  line,

  /// A line with the room under it filled.
  area,

  /// A bar per value.
  bar,
}

/// How tall, when nothing says otherwise: set against the type a sparkline
/// sits with rather than against the control ladder. `md` at 32 is a little
/// over two lines of `bodyMedium`.
const Map<MPSize, double> _heights = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 24,
  MPSize.md: 32,
  MPSize.lg: 44,
  MPSize.xl: 56,
};

/// How heavy the stroke is. Two pixels at `md`, the chart line weight.
const Map<MPSize, double> _strokes = <MPSize, double>{
  MPSize.xs: 1.25,
  MPSize.sm: 1.5,
  MPSize.md: 2,
  MPSize.lg: 2.5,
  MPSize.xl: 3,
};

/// The surface between two touching bars, as a share of the width: the React
/// build's two units of a hundred-unit view box.
const double _barGap = 0.02;

/// The width a sparkline takes when its parent sets no limit.
const double _looseWidth = 100;

/// A series as a mark, with no axes and nothing to read a value against.
///
/// ```dart
/// MPSparkline(data: const <double>[12, 15, 14, 19, 22, 21, 27])
/// ```
///
/// It answers one question — which way has this been going — in the space of
/// a word. Put it beside the number it is the history of: in a table cell, a
/// list row, under a statistic.
///
/// ## It has no hover layer, on purpose
///
/// It is thirty pixels tall with no axis to read a value against, and a
/// floating panel over a mark that size covers the mark. A reader who needs
/// the numbers needs an `MPLineChart`.
///
/// What it does have is a **sentence**: its semantics say the shape in words —
/// how many points, and the two ends — so what a sighted reader gets from the
/// outline is a thing every reader gets.
///
/// ## The line is quiet and the end is not
///
/// The stroke takes a faded step of its colour and the end dot takes the whole
/// of it. The history is context; the last value is the point.
class MPSparkline extends StatelessWidget {
  /// Creates a sparkline.
  const MPSparkline({
    required this.data,
    this.shape = MPSparklineShape.line,
    this.curve = MPChartCurve.linear,
    this.gaps = MPChartGaps.gap,
    this.endDot = true,
    this.baseline,
    this.min,
    this.max,
    this.width,
    this.height,
    this.color,
    this.label,
    this.locale,
    this.size,
    super.key,
  });

  /// The series, oldest first. A `null` is a gap, and it breaks the line.
  final List<double?> data;

  /// What the series is drawn as.
  final MPSparklineShape shape;

  /// How the line between two points is drawn.
  final MPChartCurve curve;

  /// What the shape does where the series has no value. A bar has no line to
  /// join, so it takes [MPChartGaps.zero] and reads [MPChartGaps.connect] as
  /// [MPChartGaps.gap].
  final MPChartGaps gaps;

  /// Marks the newest point, which is most of what makes a sparkline
  /// readable: without it a reader has to work out which end is now.
  final bool endDot;

  /// The value the area or the bars are measured from. The series' floor by
  /// default.
  final double? baseline;

  /// Pins the bottom of the scale, so two sparklines can be compared.
  final double? min;

  /// Pins the top of the scale.
  final double? max;

  /// How wide. Fills the width it is given by default, and takes 100 where
  /// its parent sets no limit.
  final double? width;

  /// How tall. Defaults to the [size] ladder.
  final double? height;

  /// Which accent family the mark reads, or any [Color]. Left out, it takes the
  /// first slot of the chart palette.
  final MPChartColor? color;

  /// What the shape says, for a reader who cannot see it. Left out, a sentence
  /// is written from the numbers.
  final String? label;

  /// Which language the written sentence is in.
  final String? locale;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The shape in words: how many points and the two **ends**, which say which
  /// way it went where the two extremes would not.
  String _spoken(BuildContext context) {
    if (label != null) {
      return label!;
    }

    final List<double> real = <double>[
      for (final double? value in data)
        if (value != null && value.isFinite) value,
    ];

    if (real.isEmpty) {
      return mpMessagesOf(context, mpTableMessages, locale: locale)['empty']!;
    }

    return mpFillMessage(
      mpMessagesOf(context, mpSparklineMessages, locale: locale)['summary']!,
      <String, String>{
        'count': plainNumber(real.length.toDouble()),
        'first': plainNumber(real.first),
        'last': plainNumber(real.last),
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme scheme = MPTheme.of(context).colors;
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double boxHeight = height ?? _heights[size]!;
    final Color paint = seriesColor(scheme, 0, color);

    return Semantics(
      container: true,
      image: true,
      label: _spoken(context),
      child: ExcludeSemantics(
        child: SizedBox(
          width: width,
          height: boxHeight,
          child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              final double boxWidth =
                  width ?? (constraints.maxWidth.isFinite ? constraints.maxWidth : _looseWidth);

              return CustomPaint(
                size: Size(boxWidth, boxHeight),
                painter: _SparklinePainter(
                  data: data,
                  shape: shape,
                  curve: curve,
                  gaps: gaps,
                  endDot: endDot,
                  baseline: baseline,
                  min: min,
                  max: max,
                  stroke: _strokes[size]!,
                  color: paint,
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  const _SparklinePainter({
    required this.data,
    required this.shape,
    required this.curve,
    required this.gaps,
    required this.endDot,
    required this.baseline,
    required this.min,
    required this.max,
    required this.stroke,
    required this.color,
  });

  final List<double?> data;
  final MPSparklineShape shape;
  final MPChartCurve curve;
  final MPChartGaps gaps;
  final bool endDot;
  final double? baseline;
  final double? min;
  final double? max;
  final double stroke;
  final Color color;

  Color _faded(double opacity) => color.withValues(alpha: color.a * opacity);

  @override
  void paint(Canvas canvas, Size size) {
    final double width = size.width;
    final double height = size.height;
    final double inset = shape == MPSparklineShape.bar ? 0 : stroke / 2;

    /* A missing reading read as a zero is a reading, so the scale has to reach
       it. Everywhere else the gaps are simply not on the scale. */
    final List<double?> scaled = <double?>[
      for (final double? value in data)
        value == null || !value.isFinite ? (gaps == MPChartGaps.zero ? 0 : null) : value,
    ];
    final ChartExtent extent = extentOf(scaled, min: min, max: max);
    final double span = extent.max - extent.min;

    double yOf(double value) => height - inset - (value - extent.min) / span * (height - inset * 2);

    final double step = data.length > 1 ? width / (data.length - 1) : 0;
    final List<Offset?> points = <Offset?>[
      for (int i = 0; i < scaled.length; i += 1)
        scaled[i] == null ? null : Offset(data.length > 1 ? i * step : width / 2, yOf(scaled[i]!)),
    ];
    final bool joined = gaps == MPChartGaps.connect && shape != MPSparklineShape.bar;
    final double floor = baseline ?? extent.min;

    if (shape == MPSparklineShape.bar) {
      final double slot = data.isEmpty ? 0 : width / data.length;
      final double thickness = math.max(width * 0.005, slot - width * _barGap);
      final double base = yOf(floor);

      for (int i = 0; i < scaled.length; i += 1) {
        final double? value = scaled[i];

        if (value == null) {
          continue;
        }

        final double top = yOf(value);

        canvas.drawPath(
          barPath(
            i * slot + (slot - thickness) / 2,
            math.min(top, base),
            thickness,
            (base - top).abs(),
            thickness / 3,
            value >= floor ? BarEnd.top : BarEnd.bottom,
          ),
          // Only the newest bar is the point; the rest are the history.
          Paint()..color = _faded(endDot && i == data.length - 1 ? 1 : 0.55),
        );
      }

      return;
    }

    if (shape == MPSparklineShape.area) {
      canvas.drawPath(
        areaPath(joined ? withoutGaps(points) : points, yOf(floor), curve),
        Paint()..color = _faded(0.16),
      );
    }

    final Paint line = Paint()
      ..color = _faded(0.55)
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(linePath(points, curve), line);

    // The runs across the gaps, dashed and straight: the part that was
    // measured still tells itself apart from the part that was inferred.
    if (joined) {
      canvas.drawPath(
        dashedPath(bridgePath(points), stroke * chartBridgeDash, stroke * chartBridgeDash),
        line,
      );
    }

    Offset? last;

    for (final Offset? point in points.reversed) {
      if (point != null) {
        last = point;
        break;
      }
    }

    if (endDot && last != null) {
      canvas.drawCircle(last, stroke * 1.25, Paint()..color = color);
    }
  }

  @override
  bool shouldRepaint(_SparklinePainter oldDelegate) => true;
}
