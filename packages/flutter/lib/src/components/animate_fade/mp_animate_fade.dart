/// Content arriving or leaving on opacity alone.
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

/// Content arriving or leaving on opacity alone.
///
/// ```dart
/// const MPAnimateFade(child: Text('Ready when you are'))
/// ```
///
/// The plainest effect in the set, and the one to reach for first: nothing
/// moves, so nothing is laid out again and no glyph is resampled. A fade is the
/// only entrance that is safe on a block of text at any size — everything else
/// in this group either scales it or travels it.
///
/// It is also the effect MD3 names in two of its four standard patterns. **Fade
/// through** — one thing out, then the next in — is two of these sequenced with
/// a [delay]; **fade** is what a thing entering or leaving a screen does on its
/// own, which is the default here.
///
/// [MPAnimateMode.exit] is the same run backwards, and it is held at the end: a
/// faded-out widget stays faded out rather than snapping back into view.
///
/// Given [children] and a [stagger], the fade moves off the box and onto each
/// child, held back by its position; [layoutBuilder] places them.
class MPAnimateFade extends StatelessWidget {
  /// Creates a fade around [child], or across [children].
  const MPAnimateFade({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = 0,
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

  /// What fades.
  final Widget? child;

  /// A set that fades as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content arrives or leaves. An exit is quicker than an
  /// entrance — MD3's `short4` against `medium2` — unless [duration] says
  /// otherwise.
  final MPAnimateMode mode;

  /// The opacity it starts from, between `0` and `1`. Raise it for content that
  /// should never be completely gone.
  final double from;

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

  /// How much later each of [children] starts than the one before it. At
  /// zero the box fades instead, which is right for a single subject.
  final Duration stagger;

  /// How much longer each of [children] runs than the one before it. Negative
  /// shortens, never below nothing. Only read alongside [stagger].
  final Duration durationStep;

  /// Runs the set from the last child to the first. Only the order turns
  /// round; each child still plays forwards, which is what separates this from
  /// [MPAnimateMode.exit].
  final bool reverse;

  @override
  Widget build(BuildContext context) {
    return MPAnimateEffect(
      mode: mode,
      settings: MPAnimateSettings(
        duration: duration ?? MPAnimation.fade.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.fade.easing).curve,
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
        return MPAnimateOpacity(opacity: lerpDouble(from, 1, t)!.clamp(0.0, 1.0), child: inner);
      },
      children: children,
      child: child,
    );
  }
}
