/// The ring that fills.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The ring that fills, and the one to reach for where there is no room for
/// a bar: inside a button, at the end of a table row, next to a field.
///
/// ```dart
/// MPProgressCircular(value: 40, showValue: true)
/// ```
///
/// The value and the label sit *beside* the ring rather than inside it. A
/// number in the middle of a dial is the picture everyone has of this
/// component, and it only works at two of the five sizes: at [MPSize.xs] the
/// ring is twenty-four pixels across and there is nowhere for "40%" to go.
/// Beside it, every size reads.
///
/// With no [value] it turns while the arc it draws grows and shrinks: two
/// motions rather than one, because the turn is linear and the arc is eased,
/// and a spinner whose arc pulses on the same curve it rotates on reads as a
/// stutter.
class MPProgressCircular extends StatefulWidget {
  /// Creates a ring. With no [value] it is indeterminate and turns.
  const MPProgressCircular({
    this.value,
    this.min = 0,
    this.max = 100,
    this.label,
    this.hideLabel = false,
    this.showValue = false,
    this.formatValue,
    this.size,
    this.color,
    super.key,
  });

  /// How far along, between [min] and [max]. `null`, the default, is the
  /// indeterminate case. A value outside the range is clamped.
  final double? value;

  /// The bottom of the range.
  final double min;

  /// The top of it.
  final double max;

  /// A name for what is loading, drawn beside the ring and read out with the
  /// value.
  final Widget? label;

  /// Keeps [label] for a screen reader and takes it off the screen, for a
  /// ring inside a card whose heading already says what is loading.
  final bool hideLabel;

  /// Shows the value as text beside the ring. A percentage of [min]…[max]
  /// unless [formatValue] says otherwise.
  final bool showValue;

  /// How the value is written when it is shown, given [value] clamped into
  /// [min]…[max]. A callback where React takes `Intl.NumberFormat` options.
  final String Function(double value)? formatValue;

  /// Diameter of the ring: 24, 32, 48, 56, 64. [MPSize.md] is MD3's own 48dp,
  /// and every rung sits inside the control height of the same name, so a
  /// ring dropped into a button, a field or a table row never makes the row
  /// taller than it was.
  final MPSize? size;

  /// Which accent family the arc reads.
  final MPColor? color;

  @override
  State<MPProgressCircular> createState() => _MPProgressCircularState();
}

class _MPProgressCircularState extends State<MPProgressCircular>
    with SingleTickerProviderStateMixin {
  late final AnimationController _spin = AnimationController(vsync: this, duration: spinDuration);

  double? get _fraction => progressFraction(widget.value, widget.min, widget.max);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(MPProgressCircular oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _spin.dispose();
    super.dispose();
  }

  void _sync() {
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    syncProgressLoop(_spin, running: _fraction == null && !still);
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    final double? fraction = _fraction;
    final double? value = progressValue(widget.value, widget.min, widget.max);
    final String? text = progressLabel(fraction, value, widget.formatValue);
    final double diameter = ringDiameter[size]!;
    final Color track = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);
    final Color accent = colors.accent(color).color;

    Widget ring;

    if (fraction != null) {
      ring = TweenAnimationBuilder<double>(
        tween: Tween<double>(end: fraction),
        duration: still ? Duration.zero : MPMotion.short4,
        curve: MPMotion.standard,
        builder: (BuildContext context, double sweep, Widget? child) {
          return CustomPaint(
            size: Size.square(diameter),
            painter: _RingPainter(
              track: track,
              arc: accent,
              stroke: ringStroke[size]!,
              start: 0,
              sweep: sweep,
            ),
          );
        },
      );
    } else if (still) {
      // The frame it rests on: a quarter of the circle, never the whole of
      // it. An indicator that has stopped must not read as one that has
      // finished.
      ring = CustomPaint(
        size: Size.square(diameter),
        painter: _RingPainter(
          track: track,
          arc: accent,
          stroke: ringStroke[size]!,
          start: 0,
          sweep: 0.25,
        ),
      );
    } else {
      ring = RepaintBoundary(
        child: AnimatedBuilder(
          animation: _spin,
          builder: (BuildContext context, Widget? child) {
            final ({double start, double sweep}) arc = spinArc(_spin.value);

            return CustomPaint(
              size: Size.square(diameter),
              painter: _RingPainter(
                track: track,
                arc: accent,
                stroke: ringStroke[size]!,
                // The turn is linear and the breath is eased, on one clock.
                start: _spin.value + arc.start,
                sweep: arc.sweep,
              ),
            );
          },
        ),
      );
    }

    final TextStyle meta = theme.typescale.bodySmall.style();
    final bool drawnLabel = widget.label != null && !widget.hideLabel;
    final String? shownValue = widget.showValue ? text : null;
    final double gap = mpControlGap[size]!;

    return progressSemantics(
      fraction: fraction,
      min: widget.min,
      max: widget.max,
      text: text,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ring,
          // Out of the flow, so it costs neither room nor the row's gap.
          if (widget.hideLabel && widget.label != null) ProgressHiddenLabel(child: widget.label!),
          if (drawnLabel) ...<Widget>[
            SizedBox(width: gap),
            Flexible(
              child: DefaultTextStyle.merge(
                style: meta.copyWith(color: colors.onSurface),
                maxLines: 1,
                softWrap: false,
                overflow: TextOverflow.ellipsis,
                child: widget.label!,
              ),
            ),
          ],
          if (shownValue != null) ...<Widget>[
            SizedBox(width: gap),
            // Drawn, not read: the same string is the node's value.
            ExcludeSemantics(
              child: Text(
                shownValue,
                maxLines: 1,
                softWrap: false,
                style: meta.copyWith(
                  color: colors.onSurfaceVariant,
                  fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// The groove and the arc over it.
///
/// [start] and [sweep] are fractions of the circle, measured clockwise from
/// twelve o'clock: a determinate ring fills from the top rather than from
/// three o'clock, where an arc starts unless it is told otherwise.
class _RingPainter extends CustomPainter {
  const _RingPainter({
    required this.track,
    required this.arc,
    required this.stroke,
    required this.start,
    required this.sweep,
  });

  final Color track;
  final Color arc;
  final double stroke;
  final double start;
  final double sweep;

  @override
  void paint(Canvas canvas, Size size) {
    // The stroke straddles the path, so the radius comes in by half of it or
    // the ring is clipped by its own box.
    final Rect circle = Rect.fromCircle(
      center: size.center(Offset.zero),
      radius: size.shortestSide / 2 - stroke / 2,
    );

    canvas.drawArc(
      circle,
      0,
      math.pi * 2,
      false,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..color = track,
    );

    if (sweep <= 0) {
      return;
    }

    canvas.drawArc(
      circle,
      -math.pi / 2 + start * math.pi * 2,
      sweep.clamp(0.0, 1.0) * math.pi * 2,
      false,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..strokeCap = StrokeCap.round
        ..color = arc,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) {
    return oldDelegate.track != track ||
        oldDelegate.arc != arc ||
        oldDelegate.stroke != stroke ||
        oldDelegate.start != start ||
        oldDelegate.sweep != sweep;
  }
}
