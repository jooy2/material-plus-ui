/// A short refusal: the content shaken side to side once.
library;

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

/// A short refusal: the content shaken side to side once.
///
/// ```dart
/// MPAnimateShake(play: wrong, child: field)
/// ```
///
/// The one gesture every platform already uses for *no*: a wrong password, a
/// code that was not recognised, a step that cannot be skipped. It is an answer
/// to something the reader just did, so it does nothing on its own —
/// [MPAnimateTrigger.manual] is the default and [play] is what runs it.
///
/// Set [play] back to `false` and then to `true` so the second refusal moves as
/// much as the first.
///
/// It starts and ends at home, and the last two swings are half the size of the
/// first two, so it settles rather than stops, and an interrupted shake leaves
/// nothing displaced.
///
/// ## A shake is not a message
///
/// A reader who has turned animations off sees none of this, and a reader who
/// cannot see the screen never did. Say what happened in words — a field's
/// error message — and let the shake only point at it.
class MPAnimateShake extends StatelessWidget {
  /// Creates a shake around [child].
  const MPAnimateShake({
    required this.child,
    this.distance = 8,
    this.duration = const Duration(milliseconds: 400),
    this.delay = Duration.zero,
    this.easing = MPEasing.standard,
    this.paused = false,
    this.trigger = MPAnimateTrigger.manual,
    this.play = false,
    super.key,
  });

  /// What shakes.
  final Widget child;

  /// How far the first swing reaches to either side, in logical pixels.
  final double distance;

  /// How long the whole shake takes. Four hundred milliseconds, and not a
  /// Material token: a refusal is not on any arrival's ladder.
  final Duration duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve each swing runs on.
  final MPEasing easing;

  /// Holds the animation where it is.
  final bool paused;

  /// What starts it. [MPAnimateTrigger.manual] unless said otherwise, because
  /// nothing has been refused yet when it is built.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` shakes it again.
  final bool play;

  @override
  Widget build(BuildContext context) {
    return MPAnimateRun(
      settings: MPAnimateSettings(
        duration: duration,
        delay: delay,
        // The run hands the frame its progress unswayed: the curve eases each
        // swing, as a timing function eases each pair of keyframes.
        curve: Curves.linear,
        paused: paused,
        trigger: trigger,
        play: play,
      ),
      frame: (BuildContext context, double t, Widget inner) {
        final double x = mpKeyframes(t, _stops, <double>[
          0,
          -distance,
          distance,
          -0.55 * distance,
          0.55 * distance,
          0,
        ], easing.curve);

        // Physical: a refusal is a shake of the head, which does not turn
        // round for a reading direction.
        return Transform.translate(offset: Offset(x, 0), child: inner);
      },
      child: child,
    );
  }
}

/// Where the shake's six keyframes sit: home, four swings, home.
const List<double> _stops = <double>[0, 0.2, 0.4, 0.6, 0.8, 1];
