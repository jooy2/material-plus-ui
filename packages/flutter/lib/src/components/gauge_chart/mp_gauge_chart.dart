/// One reading on a dial.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/internal/threshold.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How thick the dial is, as a share of its radius.
const double _thickness = 0.22;

/// One reading on a dial.
///
/// ```dart
/// MPGaugeChart(
///   value: 72,
///   label: const Text('CPU'),
///   thresholds: const <MPThreshold>[MPThreshold(from: 80, color: MPColor.error)],
/// )
/// ```
///
/// ## Consider not using one
///
/// A gauge spends a whole panel on a single number, and an angle is judged
/// less accurately than a length. What a gauge is genuinely good for is a
/// **thresholded** reading somebody watches — a dial where the amber band is
/// drawn on the face, so "how close is this to trouble" is answered by where
/// the reading sits. That is what [bands] is for.
///
/// ## It reads as a meter
///
/// One semantics node carrying the name and the figure, the way an `MPMeter`
/// is read. There is no table behind it and no hover layer: a chart of one
/// number has nothing a reader could uncover that the figure is not saying.
///
/// ## Thresholds name roles
///
/// `MPThreshold(from: 80, color: MPColor.error)` and never a hex, so a dial and
/// a meter on the same page cannot disagree about where the amber starts.
class MPGaugeChart extends StatelessWidget {
  /// Creates a gauge.
  const MPGaugeChart({
    required this.value,
    this.min = 0,
    this.max = 100,
    this.sweep = 240,
    this.label,
    this.thresholds,
    this.bands = false,
    this.color,
    this.format,
    this.locale,
    this.height,
    this.size,
    this.semanticLabel,
    super.key,
  });

  /// The reading.
  final double value;

  /// The bottom of the scale.
  final double min;

  /// The top of the scale.
  final double max;

  /// How far round the dial goes, in degrees, centred on twelve o'clock. `180`
  /// is a half dial on its base; `240` is the classic gauge, open at the
  /// bottom. Held between 30 and 300.
  final double sweep;

  /// What the reading is called, under the figure. Usually a [Text].
  final Widget? label;

  /// Where the reading changes colour. The last one it has reached wins, so
  /// they are listed smallest first.
  final List<MPThreshold>? thresholds;

  /// Paints the **track** in threshold bands as well as the fill, so a reader
  /// sees where the trouble starts before the reading gets there.
  final bool bands;

  /// The family the dial carries before any threshold is reached.
  /// [MPColor.primary] unless an `MPConfigProvider` says otherwise.
  final MPColor? color;

  /// How the figure in the middle is written.
  final String Function(double value)? format;

  /// Accepted for the shape every chart shares. The gauge's only words are the
  /// figure, which [format] writes.
  final String? locale;

  /// How tall the drawing is. Defaults to the [size] ladder.
  final double? height;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The gauge's name for a screen reader, where [label] is not a [Text].
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme scheme = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPColor color = this.color ?? config?.color ?? MPColor.primary;
    final MPColor family = thresholdColor(value, color, thresholds);
    final double fraction = progressFraction(value, min, max) ?? 0;
    final double font = chartFontSize[size]!;
    final double boxHeight = height ?? chartPlotHeight[size]!;
    final String written = formatStatistic(value, format, compact: false);

    /* Where the dial sits in its box. A half dial stands on its base; anything
       wider dips below that line, and the centre rises by however much of the
       arc hangs under it — measured, because a fixed offset leaves a 240° dial
       floating and a 300° one clipped. */
    final double turn = sweep.clamp(30, 300) * math.pi / 180;
    final double half = turn / 2;
    final double drop = half > math.pi / 2 ? math.cos(math.pi - half) : 0;

    final MPTypeRole figure = switch (size) {
      MPSize.xs => theme.typescale.titleMedium,
      MPSize.sm => theme.typescale.titleLarge,
      MPSize.md => theme.typescale.headlineSmall,
      MPSize.lg => theme.typescale.headlineMedium,
      MPSize.xl => theme.typescale.displaySmall,
    };

    return Semantics(
      container: true,
      label: semanticLabel ?? mpTextOf(label),
      value: written,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          SizedBox(
            height: boxHeight,
            child: LayoutBuilder(
              builder: (BuildContext context, BoxConstraints constraints) {
                final double width = chartWidthOf(context, constraints);
                final double room = math.min(width / 2, boxHeight / (1 + drop));
                final double outer = math.max(0, room - 2);
                final double inner = outer * (1 - _thickness);
                final double cx = width / 2;
                final double cy = outer + 2;

                return Stack(
                  clipBehavior: Clip.none,
                  children: <Widget>[
                    if (outer > 0)
                      ExcludeSemantics(
                        child: CustomPaint(
                          size: Size(width, boxHeight),
                          painter: _GaugePainter(
                            center: Offset(cx, cy),
                            outer: outer,
                            inner: inner,
                            turn: turn,
                            fraction: fraction,
                            fill: scheme.accent(family).color,
                            track: _segments(color),
                            bands: bands && (thresholds?.isNotEmpty ?? false),
                            scheme: scheme,
                          ),
                        ),
                      ),
                    Positioned(
                      left: 0,
                      right: 0,
                      top: cy - inner * 0.45,
                      child: ExcludeSemantics(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Text(
                              written,
                              textAlign: TextAlign.center,
                              style: figure
                                  .style(scheme.onSurface)
                                  .copyWith(
                                    fontWeight: FontWeight.w500,
                                    fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
                                  ),
                            ),
                            if (label != null)
                              ConstrainedBox(
                                constraints: BoxConstraints(maxWidth: math.max(0, inner * 1.8)),
                                child: DefaultTextStyle.merge(
                                  style: theme.typescale.bodySmall.style(scheme.onSurfaceVariant),
                                  textAlign: TextAlign.center,
                                  child: label!,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          // Room under the dial for whatever hangs below the centre.
          if (drop > 0) SizedBox(height: font / 2),
        ],
      ),
    );
  }

  /// The track, cut into the bands the thresholds describe.
  List<(double, double, MPColor)> _segments(MPColor color) {
    final List<MPThreshold>? given = thresholds;

    if (!bands || given == null || given.isEmpty) {
      return <(double, double, MPColor)>[(0, 1, color)];
    }

    final List<(double, MPColor)> stops = <(double, MPColor)>[
      for (final MPThreshold one in given)
        if ((progressFraction(one.from, min, max) ?? 0) > 0 &&
            (progressFraction(one.from, min, max) ?? 0) < 1)
          (progressFraction(one.from, min, max)!, one.color),
    ]..sort(((double, MPColor) a, (double, MPColor) b) => a.$1.compareTo(b.$1));

    final List<(double, double, MPColor)> out = <(double, double, MPColor)>[];
    double start = 0;
    MPColor paint = color;

    for (final (double at, MPColor next) in stops) {
      out.add((start, at, paint));
      start = at;
      paint = next;
    }

    return out..add((start, 1, paint));
  }
}

class _GaugePainter extends CustomPainter {
  const _GaugePainter({
    required this.center,
    required this.outer,
    required this.inner,
    required this.turn,
    required this.fraction,
    required this.fill,
    required this.track,
    required this.bands,
    required this.scheme,
  });

  final Offset center;
  final double outer;
  final double inner;
  final double turn;
  final double fraction;
  final Color fill;
  final List<(double, double, MPColor)> track;
  final bool bands;
  final MPColorScheme scheme;

  @override
  void paint(Canvas canvas, Size size) {
    final double from = -turn / 2;
    final double to = turn / 2;

    Path arc(double a, double b) => arcPath(center.dx, center.dy, outer, inner, a, b);

    // The track: a wash rather than the family at full strength, because the
    // track is where the reading is *not*.
    for (final (double start, double end, MPColor family) in track) {
      final Color base = bands ? scheme.accent(family).color : scheme.onSurface;

      canvas.drawPath(
        arc(from + start * turn, from + end * turn),
        Paint()
          ..color = base.withValues(
            alpha: base.a * (bands ? 0.22 : MPStateOpacity.disabledContainer),
          ),
      );
    }

    canvas.drawPath(arc(from, from + fraction * turn), Paint()..color = fill);

    // The two ends, so a dial that is empty or full still shows its range.
    final Paint end = Paint()..color = scheme.outline;

    canvas
      ..drawPath(arc(from, from + 0.004 * turn), end)
      ..drawPath(arc(to - 0.004 * turn, to), end);
  }

  @override
  bool shouldRepaint(_GaugePainter oldDelegate) => true;
}
