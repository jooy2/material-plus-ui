/// Content arriving from the middle of where it will end up.
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

/// Content arriving from the middle of where it will end up.
///
/// ```dart
/// const MPAnimateZoom(child: Text('Payment received'))
/// ```
///
/// The same arithmetic as `MPAnimateGrow` at more than twice the distance, and
/// always about the centre, which is the whole difference. A grow unfolds from
/// somewhere; a zoom comes at the reader.
///
/// Use it for the one thing on a screen that is meant to interrupt: a
/// confirmation, a result, a number that has just landed. Use it once. An
/// interruption that happens three times on one screen is a layout, and the
/// effect that belongs to a set of things is `MPAnimateAppear`.
///
/// There is no `origin`, on purpose. A zoom anchored to a corner is a grow, and
/// the library does not offer two spellings of one idea.
class MPAnimateZoom extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateZoom({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = 0.4,
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

  /// What zooms.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content comes forward or falls away. An exit is quicker than
  /// an entrance — MD3's `short4` against `medium4` — unless [duration] says
  /// otherwise.
  final MPAnimateMode mode;

  /// The scale it starts from, as a multiple of its final size. Above `1` it
  /// arrives oversized and settles back, which reads as coming towards the
  /// reader rather than up out of the page.
  final double from;

  /// Fades in as it zooms.
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
        duration: duration ?? MPAnimation.zoom.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.zoom.easing).curve,
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
          // Written out rather than left to the default, so the middle is the
          // middle whatever the reading direction.
          child: Transform.scale(
            scale: lerpDouble(from, 1, t)!,
            alignment: Alignment.center,
            child: inner,
          ),
        );
      },
      children: children,
      child: child,
    );
  }
}
