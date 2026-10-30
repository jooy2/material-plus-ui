/// How much of something there is, on a scale known in advance.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/internal/threshold.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much of something there is, on a scale known in advance: disk used,
/// seats taken, quota spent, a password's strength.
///
/// ```dart
/// MPMeter(
///   value: 41,
///   max: 60,
///   label: const Text('Seats taken'),
///   showValue: true,
///   thresholds: const <MPThreshold>[
///     MPThreshold(from: 48, color: MPColor.tertiary),
///     MPThreshold(from: 57, color: MPColor.error),
///   ],
/// )
/// ```
///
/// ## It looks like a progress bar and is not one
///
/// A progress bar is about **time**: something is happening, this is how far
/// it has got, it may have no value at all, and it is expected to move on its
/// own. A meter is about **quantity**: the number is already known, it does
/// not move unless the thing it measures does, and it is meaningful to say the
/// reading is bad, which is what [thresholds] is for. A disk that is 94% full
/// is not 94% finished.
///
/// ## [thresholds] names roles, not colours
///
/// MD3 has four accent families and none of them is called `warning`, so an
/// amber band is [MPColor.tertiary] under whatever source colour the page is
/// themed from. A threshold that named a colour would be a colour that
/// ignores the theme, on the one component whose whole point is to be read at
/// a glance.
///
/// It fills the width it is given, as the React build's `w-full` does, so it
/// needs a bounded width.
class MPMeter extends StatelessWidget {
  /// Creates a meter. [value] is required, which is the whole difference from
  /// an `MPProgressLinear`.
  const MPMeter({
    required this.value,
    this.min = 0,
    this.max = 100,
    this.label,
    this.showValue = false,
    this.formatValue,
    this.thresholds,
    this.size,
    this.color,
    super.key,
  });

  /// How much there is.
  ///
  /// Required: a meter reports a quantity that is already known, so there is
  /// no indeterminate case for a default to stand in for. A reading past
  /// either end of the scale is drawn at that end.
  final double value;

  /// The bottom of the scale.
  final double min;

  /// The top of it.
  final double max;

  /// A name for what is being measured. Read out with the value.
  final Widget? label;

  /// Shows the value as text beside the bar. A share of the range unless
  /// [formatValue] says otherwise.
  final bool showValue;

  /// How the value is written, given [value] as it is.
  ///
  /// It matters more here than on a progress bar: a meter usually has real
  /// units, 41 of 60 seats, 2.1 GB of 5, £340 of a £500 budget, and a
  /// percentage is what a range nobody described reads as, not what the
  /// reader came for. A callback where React takes `Intl.NumberFormat`
  /// options, because the framework has no `Intl.NumberFormat` to hand them
  /// to.
  final String Function(double value)? formatValue;

  /// Where the bar changes colour, smallest [MPThreshold.from] first. The
  /// family of the last threshold the value has reached wins, in the order
  /// the list was given; below all of them [color] stands.
  final List<MPThreshold>? thresholds;

  /// Thickness of the groove: 2, 3, 4, 6, 8. Nothing else on a meter has a
  /// size.
  final MPSize? size;

  /// The family the bar carries before any threshold is reached.
  final MPColor? color;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPColor color = this.color ?? config?.color ?? MPColor.primary;
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPColor family = thresholdColor(value, color, thresholds);
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = still ? Duration.zero : MPMotion.short4;

    // `null` only for a scale with nothing in it, which is a caller's mistake
    // rather than a state: the bar sits empty and the value is still read.
    final double fraction = progressFraction(value, min, max) ?? 0;
    final String text = formatValue != null ? formatValue!(value) : progressText(fraction)!;
    final double thickness = barThickness[size]!;
    final BorderRadius radius = BorderRadius.circular(thickness / 2);

    final Widget groove = ClipRRect(
      borderRadius: radius,
      child: Container(
        height: thickness,
        width: double.infinity,
        // The groove `MPProgressLinear` cuts, because they are the same
        // object: `onSurface` at 12% reads as a groove under all four accents
        // on both schemes.
        color: colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: AnimatedFractionallySizedBox(
            duration: duration,
            curve: MPMotion.standard,
            alignment: AlignmentDirectional.centerStart,
            widthFactor: fraction,
            heightFactor: 1,
            // The colour travels as well as the width: a reading that crosses
            // a threshold has two things happening at once.
            child: AnimatedContainer(
              duration: duration,
              curve: MPMotion.standard,
              decoration: BoxDecoration(color: colors.accent(family).color, borderRadius: radius),
            ),
          ),
        ),
      ),
    );

    // Merged, so the label and the bar are one node rather than a name
    // floating beside an unnamed value.
    //
    // No role, and that is not an omission: Flutter's roles have no `meter`,
    // and claiming `progressBar` would announce the one thing this widget
    // exists to say it is not. A named node carrying a value is what the
    // platforms read out either way.
    return MergeSemantics(
      child: Semantics(
        container: true,
        value: text,
        child: progressStack(
          size: size,
          hiddenLabel: null,
          header: label != null || showValue
              ? ProgressHeader(label: label, value: showValue ? text : null)
              : null,
          groove: groove,
        ),
      ),
    );
  }
}
