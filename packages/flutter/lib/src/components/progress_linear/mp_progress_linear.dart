/// The bar that fills.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The bar that fills, and the workhorse of the three progress indicators.
///
/// ```dart
/// MPProgressLinear(label: const Text('Uploading'), value: 62, showValue: true)
/// ```
///
/// It is the only one that can show *how much* is left at a glance, because
/// length is the one quantity a reader compares without counting. MD3 draws
/// it as a 4dp groove with the active indicator in `primary`. Here the
/// indicator is the chosen family's accent and the groove is `onSurface` at
/// 12%, so `color: MPColor.error` is a red bar in a neutral groove rather than
/// a red bar in a blue one.
///
/// Both ends are fully rounded, which is MD3's own shape for it: at four
/// pixels tall there is no flat run left to preserve, and a square-ended bar
/// reads as a rendering fault rather than as a decision.
///
/// It fills the width it is given, as the React build's `w-full` does, so it
/// needs a bounded width: inside a [Row], put it in an [Expanded].
class MPProgressLinear extends StatefulWidget {
  /// Creates a bar. With no [value] it is indeterminate and sweeps.
  const MPProgressLinear({
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

  /// How far along, between [min] and [max].
  ///
  /// `null`, the default, is the indeterminate case: something is happening
  /// and nobody knows how much of it is left. That is the default on purpose.
  /// An indicator that has not been told a value should say so rather than
  /// draw an empty track, which is a claim that no progress has been made.
  ///
  /// A value outside the range is clamped, and a range with nothing in it
  /// (`max <= min`) has nothing to say and sweeps.
  final double? value;

  /// The bottom of the range.
  final double min;

  /// The top of it.
  final double max;

  /// A name for what is loading. Read out with the value by a screen reader.
  final Widget? label;

  /// Keeps [label] for a screen reader and takes it off the screen.
  ///
  /// For a bar that is already labelled by what is around it, a bar under a
  /// filename. Drawing the name a second time is noise a sighted reader has to
  /// skip; removing it leaves a bar announced as "63%" and nothing else.
  final bool hideLabel;

  /// Shows the value as text beside the bar. A percentage of [min]…[max]
  /// unless [formatValue] says otherwise.
  final bool showValue;

  /// How the value is written when it is shown, given [value] clamped into
  /// [min]…[max].
  ///
  /// A callback where React takes `Intl.NumberFormat` options: there is no
  /// `Intl.NumberFormat` in the framework, and a package that pulled
  /// `package:intl` in to provide one would be making a dependency decision on
  /// its consumer's behalf. Without it the value is a percentage of the range,
  /// the only formatting that holds for a range nobody described.
  final String Function(double value)? formatValue;

  /// Thickness of the groove: 2, 3, 4, 6, 8. [MPSize.md] is MD3's own 4dp;
  /// nothing else on a bar has a size.
  final MPSize? size;

  /// Which accent family the indicator reads.
  final MPColor? color;

  @override
  State<MPProgressLinear> createState() => _MPProgressLinearState();
}

class _MPProgressLinearState extends State<MPProgressLinear> with SingleTickerProviderStateMixin {
  late final AnimationController _sweep = AnimationController(vsync: this, duration: sweepDuration);

  double? get _fraction => progressFraction(widget.value, widget.min, widget.max);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(MPProgressLinear oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _sweep.dispose();
    super.dispose();
  }

  void _sync() {
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    syncProgressLoop(_sweep, running: _fraction == null && !still);
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPColorScheme colors = MPTheme.of(context).colors;
    final Color accent = colors.accent(color).color;
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    final double? fraction = _fraction;
    final double? value = progressValue(widget.value, widget.min, widget.max);
    final String? text = progressLabel(fraction, value, widget.formatValue);
    final double thickness = barThickness[size]!;
    final BorderRadius radius = BorderRadius.circular(thickness / 2);

    final Widget groove = ClipRRect(
      borderRadius: radius,
      child: Container(
        height: thickness,
        width: double.infinity,
        // Not the family's container tone. `onSurface` at 12% is MD3's own
        // disabled-container wash and reads as a groove on every scheme,
        // which is what a track that has to sit under four different accents
        // needs.
        color: colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
        child: fraction == null
            ? _Sweep(animation: _sweep, color: accent, radius: radius, still: still)
            : Align(
                alignment: AlignmentDirectional.centerStart,
                child: AnimatedFractionallySizedBox(
                  // What makes it move rather than jump when the value changes.
                  duration: still ? Duration.zero : MPMotion.short4,
                  curve: MPMotion.standard,
                  alignment: AlignmentDirectional.centerStart,
                  widthFactor: fraction,
                  heightFactor: 1,
                  child: DecoratedBox(
                    decoration: BoxDecoration(color: accent, borderRadius: radius),
                  ),
                ),
              ),
      ),
    );

    // Drawn or not, the name is the same name. `hideLabel` decides which of
    // the two places renders it, never whether one does.
    final Widget? drawnLabel = widget.hideLabel ? null : widget.label;
    final String? shownValue = widget.showValue ? text : null;

    return progressSemantics(
      fraction: fraction,
      min: widget.min,
      max: widget.max,
      text: text,
      child: progressStack(
        size: size,
        hiddenLabel: widget.hideLabel && widget.label != null
            ? ProgressHiddenLabel(child: widget.label!)
            : null,
        header: drawnLabel != null || shownValue != null
            ? ProgressHeader(label: drawnLabel, value: shownValue)
            : null,
        groove: groove,
      ),
    );
  }
}

/// The two bars of the indeterminate groove.
///
/// Two, not one. MD3's indeterminate track is a long sweep followed by a short
/// one that catches up, and the second is what stops the groove being empty
/// for most of the cycle. Each edge of each bar is placed on its own curve,
/// so the bar stretches across the groove and gathers itself up at the far
/// end.
///
/// Placed with start and end insets rather than a transform, so the whole
/// thing runs the other way under right-to-left without being told.
class _Sweep extends StatelessWidget {
  const _Sweep({
    required this.animation,
    required this.color,
    required this.radius,
    required this.still,
  });

  final Animation<double> animation;
  final Color color;
  final BorderRadius radius;
  final bool still;

  @override
  Widget build(BuildContext context) {
    final Widget bar = DecoratedBox(
      decoration: BoxDecoration(color: color, borderRadius: radius),
    );

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double width = constraints.maxWidth;

        if (still) {
          // The frame it rests on: a partial bar from the start, never a full
          // one. An indicator that has stopped must not read as an indicator
          // that has finished.
          return Stack(
            children: <Widget>[
              PositionedDirectional(
                key: const ValueKey<String>('lead'),
                start: 0,
                end: width * 0.65,
                top: 0,
                bottom: 0,
                child: bar,
              ),
            ],
          );
        }

        return RepaintBoundary(
          child: AnimatedBuilder(
            animation: animation,
            builder: (BuildContext context, Widget? child) {
              return Stack(
                children: <Widget>[
                  for (final bool trail in const <bool>[false, true])
                    _place(
                      sweepBar(animation.value, trail: trail),
                      width,
                      ValueKey<String>(trail ? 'trail' : 'lead'),
                      child!,
                    ),
                ],
              );
            },
            child: bar,
          ),
        );
      },
    );
  }

  Widget _place(({double start, double end}) edges, double width, Key key, Widget bar) {
    // A bar with no length at this moment is not drawn, rather than drawn as
    // a box turned inside out.
    final double start = edges.start * width;
    final double end = edges.end * width;

    return PositionedDirectional(
      key: key,
      start: start,
      end: start + end >= width ? width - start : end,
      top: 0,
      bottom: 0,
      child: bar,
    );
  }
}
