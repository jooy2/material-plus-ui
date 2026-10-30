/// A row of segments that light up.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A row of segments that light up.
///
/// ```dart
/// MPProgressBox(label: const Text('Deploying'), value: 50, showValue: true)
/// ```
///
/// The third shape, and the one that answers a different question from the
/// other two. A bar and a ring both say "this much of it is done", a quantity
/// a reader reads off a length. A row of four segments says "this is step
/// three", which is a quantity they *count*, and counting is faster than
/// measuring for any number small enough to count.
///
/// That makes it the right indicator for work that genuinely has steps, an
/// upload with a verify and a publish after it, and the wrong one for a
/// percentage. MD3 has a bar and a ring and stops there; this is drawn out of
/// the specification's own parts all the same, `extraSmall` tiles, the accent
/// and `onSurface` at 12%, so a row of them sits in a Material page without
/// announcing that it is extra.
///
/// With a value the segments fill from the start, the leading one partially,
/// so four segments read as a four-part bar rather than rounding 30% away to a
/// quarter. Without one they light in a wave, each held back by its index.
class MPProgressBox extends StatefulWidget {
  /// Creates a row. With no [value] it is indeterminate and the wave runs.
  const MPProgressBox({
    this.value,
    this.min = 0,
    this.max = 100,
    this.count = 4,
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

  /// How many segments the row is made of.
  ///
  /// Four by default: enough that the wave reads as a wave, few enough that a
  /// determinate row can be counted at a glance rather than measured. Set it
  /// to the number of steps when the thing being waited on genuinely has
  /// steps. Anything under one draws one, because a row of no segments is not
  /// an indicator.
  final int count;

  /// A name for what is loading. Read out with the value by a screen reader.
  final Widget? label;

  /// Keeps [label] for a screen reader and takes it off the screen.
  final bool hideLabel;

  /// Shows the value as text beside the label. A percentage of [min]…[max]
  /// unless [formatValue] says otherwise.
  final bool showValue;

  /// How the value is written when it is shown, given [value] clamped into
  /// [min]…[max]. A callback where React takes `Intl.NumberFormat` options.
  final String Function(double value)? formatValue;

  /// Size of one segment: 8, 10, 12, 16, 20. The gap between them and the
  /// corner cut off each one follow the same rung.
  final MPSize? size;

  /// Which accent family the lit segments read.
  final MPColor? color;

  @override
  State<MPProgressBox> createState() => _MPProgressBoxState();
}

class _MPProgressBoxState extends State<MPProgressBox> with SingleTickerProviderStateMixin {
  late final AnimationController _wave = AnimationController(vsync: this, duration: waveDuration);

  double? get _fraction => progressFraction(widget.value, widget.min, widget.max);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(MPProgressBox oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _wave.dispose();
    super.dispose();
  }

  void _sync() {
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    syncProgressLoop(_wave, running: _fraction == null && !still);
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
    final int segments = math.max(1, widget.count);
    final double side = segmentSize[size]!;
    final BorderRadius radius = BorderRadius.circular(segmentRadius(theme.shapes, size));
    final Color accent = colors.accent(color).color;
    final Color groove = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);

    Widget segment(int index) {
      if (fraction == null) {
        // Opacity, not position: the wave is a change of light along a row
        // that holds still, in the accent a filled segment is.
        final Widget lit = DecoratedBox(
          decoration: BoxDecoration(color: accent, borderRadius: radius),
        );

        if (still) {
          return SizedBox.square(
            dimension: side,
            child: Opacity(opacity: 0.6, child: lit),
          );
        }

        return SizedBox.square(
          dimension: side,
          child: AnimatedBuilder(
            animation: _wave,
            builder: (BuildContext context, Widget? child) {
              return Opacity(opacity: waveOpacity(_wave.value - index * waveStagger), child: child);
            },
            child: lit,
          ),
        );
      }

      // Each segment is a groove of its own, so the leading one can be part
      // full. Without that, four segments could only ever show 0, 25, 50, 75
      // or 100.
      final double filled = (fraction * segments - index).clamp(0.0, 1.0);

      return SizedBox.square(
        dimension: side,
        child: ClipRRect(
          borderRadius: radius,
          child: ColoredBox(
            color: groove,
            child: Align(
              alignment: AlignmentDirectional.centerStart,
              child: AnimatedFractionallySizedBox(
                duration: still ? Duration.zero : MPMotion.short4,
                curve: MPMotion.standard,
                alignment: AlignmentDirectional.centerStart,
                widthFactor: filled,
                heightFactor: 1,
                child: ColoredBox(color: accent),
              ),
            ),
          ),
        ),
      );
    }

    final Widget track = Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (int index = 0; index < segments; index += 1) ...<Widget>[
          if (index > 0) SizedBox(width: segmentGap[size]),
          segment(index),
        ],
      ],
    );

    final Widget? drawnLabel = widget.hideLabel ? null : widget.label;
    final String? shownValue = widget.showValue ? text : null;

    // As wide as its widest line and no wider, which is the React build's
    // `inline-flex`: a label longer than the row widens it rather than
    // wrapping under four small squares.
    return progressSemantics(
      fraction: fraction,
      min: widget.min,
      max: widget.max,
      text: text,
      child: IntrinsicWidth(
        child: progressStack(
          size: size,
          hiddenLabel: widget.hideLabel && widget.label != null
              ? ProgressHiddenLabel(child: widget.label!)
              : null,
          header: drawnLabel != null || shownValue != null
              ? ProgressHeader(label: drawnLabel, value: shownValue)
              : null,
          groove: Align(alignment: AlignmentDirectional.centerStart, child: track),
        ),
      ),
    );
  }
}
