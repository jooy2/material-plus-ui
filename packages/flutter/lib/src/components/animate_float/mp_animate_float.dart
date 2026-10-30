/// An endless, slow drift.
library;

import 'dart:math' as math;

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

/// An endless, slow drift.
///
/// ```dart
/// const MPAnimateFloat(child: Text('Above the sheet'))
/// ```
///
/// The only thing in this set that says **not fixed to the page**. A card that
/// drifts is a card that is above the sheet rather than printed on it, and no
/// amount of shadow says that as plainly as a few pixels of unhurried travel.
///
/// It has no arrival: the path rises, wanders to one side, rises further,
/// wanders to the other and comes home, so an interrupted drift leaves nothing
/// displaced.
///
/// ## Never on a control
///
/// A button that drifts cannot be pointed at. The pointer arrives where the
/// button was, the button has moved four pixels, and the reader has to track a
/// target that is running away from them. This is for decoration: an
/// illustration, a hero graphic, a badge on a marketing page. And one at a
/// time — six things drifting on their own cycles is a screen that will not sit
/// still to be read.
class MPAnimateFloat extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateFloat({
    this.child,
    this.children,
    this.layoutBuilder,
    this.distance = 10,
    this.sway = 6,
    this.tilt = 0,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.repeat,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    this.stagger = Duration.zero,
    this.durationStep = Duration.zero,
    this.reverse = false,
    super.key,
  }) : assert(child == null || children == null, 'Give a child or children, not both.');

  /// What drifts.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// How far it rises at the top of the drift, in logical pixels. Small on
  /// purpose: this says not fixed down, and anything a reader can measure says
  /// moving instead.
  final double distance;

  /// How far it wanders to either side, in logical pixels. Less than
  /// [distance], so the path reads as a drift rather than as a circle.
  final double sway;

  /// How far it leans at the extremes, in degrees. `0` by default: a tilt is
  /// the difference between floating and tumbling, and anything with text on
  /// it wants none of it.
  final double tilt;

  /// How long one drift takes. Left out, six seconds: the motion tokens run to
  /// a second because they are for things that arrive, and a period is not a
  /// duration.
  final Duration? duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve each leg of the path runs on. Left out, `standard`,
  /// so the drift does not pause at each corner of its path.
  final MPEasing? easing;

  /// How many times it runs. `null`, the default, never stops: a drift has no
  /// destination to arrive at.
  final MPAnimateRepeat repeat;

  /// Holds the animation where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` starts it over.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it runs again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the widget has to be on
  /// screen before it counts as visible, from `0` to `1`.
  final double threshold;

  /// How much later each of [children] starts than the one before it.
  /// At zero the box animates instead, which is right for a single subject.
  final Duration stagger;

  /// How much longer each of [children] runs than the one before it. Negative
  /// shortens, never below nothing. Only read alongside [stagger].
  final Duration durationStep;

  /// Runs the set from the last child to the first. Only the order turns
  /// round; each child still plays forwards.
  final bool reverse;

  @override
  Widget build(BuildContext context) {
    return MPAnimateEffect(
      settings: MPAnimateSettings(
        duration: duration ?? _period,
        delay: delay,
        // The run hands the frame its progress unswayed: the curve eases each
        // leg of the path, as a timing function eases each pair of keyframes.
        curve: Curves.linear,
        repeat: repeat,
        paused: paused,
        trigger: trigger,
        play: play,
        once: once,
        threshold: threshold,
      ),
      stagger: stagger,
      durationStep: durationStep,
      reverse: reverse,
      layoutBuilder: layoutBuilder,
      frame: (BuildContext context, double t, Widget inner) {
        final Curve curve = (easing ?? MPEasing.standard).curve;
        final double x = mpKeyframes(t, _stops, <double>[0, sway, 0, -sway, 0], curve);
        final double y = mpKeyframes(t, _stops, <double>[
          0,
          -distance,
          -1.5 * distance,
          -distance,
          0,
        ], curve);
        final double lean = mpKeyframes(t, _stops, <double>[0, tilt, 0, -tilt, 0], curve);

        // Physical, as a translation is: the drift is a picture's, and it does
        // not turn round for a reading direction.
        return Transform.translate(
          offset: Offset(x, y),
          child: Transform.rotate(angle: lean * math.pi / 180, child: inner),
        );
      },
      children: children,
      child: child,
    );
  }
}

/// Where the drift's five keyframes sit: home, up and to one side, highest,
/// up and to the other side, home.
const List<double> _stops = <double>[0, 0.25, 0.5, 0.75, 1];

/// Six seconds, and not a Material token.
const Duration _period = Duration(seconds: 6);
