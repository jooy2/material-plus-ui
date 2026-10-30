/// Content travelling in from one edge.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// Content travelling in from one edge.
///
/// ```dart
/// const MPAnimateSlide(from: MPSide.left, child: Text('From behind the edge'))
/// ```
///
/// This is MD3's shared axis transition, at the scale one wrapper can offer it:
/// things that are related move along the same line, so a reader reads the
/// direction as a relationship. A panel belonging to the bar above it comes
/// down from the top.
///
/// The default distance is the widget's own size, so it starts exactly out of
/// frame and is never half drawn somewhere it does not belong. Put it in a box
/// that clips, a [ClipRect], and the effect is a panel appearing from behind
/// that box's edge.
///
/// A slide moves the widget and not the layout: it is a translation at paint
/// time, so nothing beside it is laid out again while it runs. For a much
/// shorter travel over a list of things, one after another, use
/// `MPAnimateAppear`.
class MPAnimateSlide extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateSlide({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = MPSide.bottom,
    this.distance,
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

  /// What slides.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content slides in or slides away. An exit leaves by the same
  /// edge it would have come from, and is quicker — MD3's `short4` against
  /// `medium4`.
  final MPAnimateMode mode;

  /// Which edge it travels from. Physical, as [MPSide] is everywhere in this
  /// library: a panel sliding down from the top comes from the top in every
  /// writing direction.
  final MPSide from;

  /// How far it travels, in logical pixels. Left out, the widget's own width
  /// or height, which is what makes it appear from behind its own edge.
  final double? distance;

  /// Fades in as it slides.
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
        duration: duration ?? MPAnimation.slide.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.slide.easing).curve,
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
        final ({Offset fraction, Offset pixels}) start = mpSlideOffset(from, distance);
        final double left = 1 - t;

        return MPAnimateOpacity(
          opacity: fade ? t.clamp(0.0, 1.0) : 1,
          child: mpTranslate(
            offset: start.pixels * left,
            fraction: start.fraction * left,
            useFraction: distance == null,
            child: inner,
          ),
        );
      },
      children: children,
      child: child,
    );
  }
}
