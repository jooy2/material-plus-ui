/// Content pulsing between full opacity and a floor.
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

/// Content pulsing between full opacity and a floor.
///
/// ```dart
/// const MPAnimateBlink(min: 0.15, child: Text('Recording'))
/// ```
///
/// The cycle is symmetric — full, faint, full — so however many times it runs
/// it ends where it started. A blink that finished halfway would leave the
/// widget permanently half drawn, which reads as a rendering fault rather than
/// as an effect that has ended.
///
/// It repeats for ever unless told otherwise, because a single blink is a
/// flicker and nobody asks for a flicker. [MPEasing.standard] rather than the
/// emphasized curve every other effect takes, for the same reason: a pulse has
/// no destination to decelerate into.
///
/// Something that never stops moving in the corner of a screen being read is
/// the one kind of motion this library otherwise refuses, and a reader who has
/// turned animations off sees none of it. So [min] is a **dimming**, never the
/// only thing carrying the message: if it is urgent, say so in words as well.
///
/// For a placeholder that pulses because content has not arrived yet, this is
/// the wrong widget: `MPSkeleton` reserves the space the real thing will take,
/// which is the part that was doing the work.
class MPAnimateBlink extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateBlink({
    this.child,
    this.children,
    this.layoutBuilder,
    this.min = 0,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.repeat,
    this.alternate = false,
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

  /// What pulses.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// How faint it gets at the bottom of the cycle, between `0` and `1`. Raise
  /// it for something that has to stay readable while it pulses.
  final double min;

  /// How long one cycle takes. Left out, MD3's `extraLong4`: a period rather
  /// than an arrival.
  final Duration? duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve each half of the cycle runs on. Left out, `standard`.
  final MPEasing? easing;

  /// How many times it runs. `null`, the default, never stops: a single blink
  /// is a flicker, which is not what anybody asks for.
  final MPAnimateRepeat repeat;

  /// Runs every other pass backwards, so a repeat returns instead of jumping.
  final bool alternate;

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
        duration: duration ?? MPAnimation.blink.durationFor(MPAnimateMode.enter),
        delay: delay,
        // The run hands the frame its progress unswayed: the curve eases each
        // half of the cycle, as a timing function eases each pair of keyframes.
        curve: Curves.linear,
        repeat: repeat,
        alternate: alternate,
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
        final Curve curve = (easing ?? MPAnimation.blink.easing).curve;

        // Full at both ends and faint in the middle, so a run that ends leaves
        // the widget exactly as it found it.
        return MPAnimateOpacity(
          opacity: mpKeyframes(t, _stops, <double>[1, min, 1], curve).clamp(0.0, 1.0),
          child: inner,
        );
      },
      children: children,
      child: child,
    );
  }
}

/// Where the cycle's three keyframes sit: full, faint, full.
const List<double> _stops = <double>[0, 0.5, 1];
