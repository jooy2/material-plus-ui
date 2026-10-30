/// A number counting up to its value.
library;

import 'dart:ui' show FontFeature, lerpDouble;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/animate.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// A number counting up to its value.
///
/// ```dart
/// const MPAnimateCounter(value: 128400)
/// ```
///
/// The one effect in this set whose every frame is text: each frame takes the
/// run's progress between [from] and [value] and writes it out. What it borrows
/// from the rest is the run itself, so [duration], [delay], [easing],
/// [trigger], [paused] and reduced motion are the same machinery every other
/// effect uses rather than a second implementation of each. A counter waiting
/// to be scrolled to shows [from] rather than the answer.
///
/// ## What a screen reader gets
///
/// The final number, once. The counting copy is left out of the semantics: a
/// live count would be announced on every frame, and the one thing a reader
/// wants from a statistic is the statistic.
///
/// ## How the number is written
///
/// With digit grouping and up to three decimals, in English, unless [format]
/// says otherwise. The React build hands this to `Intl.NumberFormat`; the
/// package has no `intl` to ask, so a currency, a percentage or another
/// language's separators is a [format] of your own.
class MPAnimateCounter extends StatelessWidget {
  /// Creates a counter that settles on [value].
  const MPAnimateCounter({
    required this.value,
    this.from = 0,
    this.format,
    this.style,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// The number it settles on.
  final double value;

  /// Where it starts.
  final double from;

  /// Writes a number out, for every frame and for the screen reader's copy.
  ///
  /// Left out, the number is grouped in thousands with up to three decimals:
  /// `128,400`, `0.999`.
  final String Function(double value)? format;

  /// The text style, merged over the inherited one. The figures are set on one
  /// width whatever it says, or the number would jump sideways on every frame
  /// that swaps a `1` for an `8`.
  final TextStyle? style;

  /// How long the count takes. Left out, MD3's `medium2`.
  final Duration? duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve it counts on. Left out, `emphasizedDecelerate`, so it
  /// slows into the answer.
  final MPEasing? easing;

  /// Holds the count where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` counts it again.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it counts again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the number has to be on
  /// screen before it counts as visible, from `0` to `1`.
  final double threshold;

  String _write(double at) => (format ?? _groupedNumber)(at);

  @override
  Widget build(BuildContext context) {
    final TextStyle figures = const TextStyle(
      fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
    ).merge(style);

    return Semantics(
      // The answer, once. What is drawn is left out below.
      label: _write(value),
      excludeSemantics: true,
      child: MPAnimateRun(
        settings: MPAnimateSettings(
          duration: duration ?? MPAnimation.fade.durationFor(MPAnimateMode.enter),
          delay: delay,
          curve: (easing ?? MPAnimation.fade.easing).curve,
          paused: paused,
          trigger: trigger,
          play: play,
          once: once,
          threshold: threshold,
        ),
        frame: (BuildContext context, double t, Widget inner) {
          return Text(_write(lerpDouble(from, value, t)!), style: figures);
        },
        child: const SizedBox.shrink(),
      ),
    );
  }
}

/// [value] grouped in thousands with a comma and given up to three decimals,
/// the zeros after them dropped: what `Intl.NumberFormat` writes in English
/// when nobody passes it options.
String _groupedNumber(double value) {
  if (!value.isFinite) {
    return value.toString();
  }

  final bool negative = value < 0;
  final String fixed = value.abs().toStringAsFixed(3);
  final int point = fixed.indexOf('.');
  final String whole = fixed.substring(0, point);
  final String fraction = fixed.substring(point + 1).replaceFirst(RegExp(r'0+$'), '');
  final StringBuffer grouped = StringBuffer();

  for (int index = 0; index < whole.length; index += 1) {
    if (index > 0 && (whole.length - index) % 3 == 0) {
      grouped.write(',');
    }

    grouped.write(whole[index]);
  }

  final String digits = fraction.isEmpty ? '$grouped' : '$grouped.$fraction';

  // No minus on a zero that rounding made of a tiny negative.
  return negative && digits != '0' ? '-$digits' : digits;
}
