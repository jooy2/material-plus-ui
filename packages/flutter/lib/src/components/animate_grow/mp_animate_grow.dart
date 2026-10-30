/// Content unfolding from a point.
library;

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

/// Content unfolding from a point.
///
/// ```dart
/// const MPAnimateGrow(origin: Alignment.topCenter, child: Text('Out of the toolbar'))
/// ```
///
/// This is the container transform MD3 describes, at the one scale a component
/// library can offer it: something opens out of the place it belongs to. A panel
/// out of a toolbar, a card out of the row it sits in — [origin] is what anchors
/// it to that place, and it is the whole difference between this and
/// `MPAnimateZoom`.
///
/// A grow starts close to its final size, so the travel is short and the content
/// inside is legible for most of the animation. A zoom starts at less than half
/// and always about the middle: it comes at the reader rather than out of
/// anything.
///
/// The scale is a paint-time transform, so nothing beside the widget is laid out
/// again while it runs.
class MPAnimateGrow extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateGrow({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = 0.8,
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

  /// What unfolds.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content unfolds or folds away. An exit is quicker than an
  /// entrance — MD3's `short4` against `medium4` — unless [duration] says
  /// otherwise.
  final MPAnimateMode mode;

  /// The scale it starts from, as a multiple of its final size. Above `1` it
  /// settles down onto the page instead of up out of it.
  final double from;

  /// Which point stays put while the rest moves. [Alignment.topCenter] unfolds
  /// downwards, [Alignment.bottomLeft] out of a corner. An
  /// [AlignmentDirectional] follows the reading direction.
  final AlignmentGeometry origin;

  /// Fades in as it grows. Turn it off for something already on the page that
  /// is only changing size.
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
        duration: duration ?? MPAnimation.grow.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.grow.easing).curve,
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
          child: Transform.scale(scale: lerpDouble(from, 1, t)!, alignment: origin, child: inner),
        );
      },
      children: children,
      child: child,
    );
  }
}
