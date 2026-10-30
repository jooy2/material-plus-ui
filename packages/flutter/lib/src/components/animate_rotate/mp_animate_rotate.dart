/// Content turning into place, or turning for ever.
library;

import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

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

/// Content turning into place, or turning for ever.
///
/// ```dart
/// const MPAnimateRotate(child: Text('Swinging into place'))
/// ```
///
/// Two angles rather than one, which is what lets this be both effects a
/// rotation is ever used for. [from] alone is an arrival — something swinging
/// into place and stopping. [from] and [to] together with an endless [repeat]
/// and [MPEasing.linear] is a spin that never lands.
///
/// It takes `long2` where the other arrivals take `medium4`: half a turn is a
/// long way to travel, and it reads as rushed at anything shorter.
///
/// Never on a control. A button that turns cannot be read while it turns, and
/// its label lands upside down for a moment on the way in.
class MPAnimateRotate extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateRotate({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = -180,
    this.to = 0,
    this.origin = Alignment.center,
    this.fade = true,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.repeat = 1,
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

  /// What turns.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content turns in or turns away. An exit is quicker than an
  /// entrance — MD3's `medium2` against `long2` — unless [duration] says
  /// otherwise.
  final MPAnimateMode mode;

  /// The angle it starts from, in degrees. Negative turns it clockwise into
  /// place.
  final double from;

  /// The angle it ends at, in degrees. `0` is upright; a whole turn and an
  /// endless [repeat] is a spin.
  final double to;

  /// Which point it turns about. An [AlignmentDirectional] follows the reading
  /// direction.
  final AlignmentGeometry origin;

  /// Fades in as it turns. Turn it off for a spin, which has no arrival to
  /// fade into.
  final bool fade;

  /// How long one run takes. Left out, the effect's own MD3 duration token.
  final Duration? duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve it runs on. Left out, `emphasizedDecelerate`.
  final MPEasing? easing;

  /// How many times it runs. `null` never stops.
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
      mode: mode,
      settings: MPAnimateSettings(
        duration: duration ?? MPAnimation.rotate.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.rotate.easing).curve,
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
        return MPAnimateOpacity(
          opacity: fade ? t.clamp(0.0, 1.0) : 1,
          child: Transform.rotate(
            angle: lerpDouble(from, to, t)! * math.pi / 180,
            alignment: origin,
            child: inner,
          ),
        );
      },
      children: children,
      child: child,
    );
  }
}
