/// Content wiped into view from one edge.
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

/// Content wiped into view from one edge.
///
/// ```dart
/// const MPAnimateReveal(child: Text('What we shipped this quarter'))
/// ```
///
/// The claim, drawn: a heading and the rule under it are where they will be
/// from the first frame, at the colour they will end at, and only how much of
/// them is painted changes. Nothing moves and nothing fades, which is the whole
/// reason to reach for this over a slide — the reader's eye goes to where the
/// content already is.
///
/// The wipe is a clip at paint time, so nothing beside the widget is laid out
/// again while it runs, and the box is its finished size from the first frame.
///
/// [MPAnimateMode.exit] covers it again by running the wipe backwards, held at
/// the end.
class MPAnimateReveal extends StatelessWidget {
  /// Creates the effect around [child], or across [children].
  const MPAnimateReveal({
    this.child,
    this.children,
    this.layoutBuilder,
    this.mode = MPAnimateMode.enter,
    this.from = MPSide.left,
    this.fade = false,
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

  /// What is wiped into view.
  final Widget? child;

  /// A set that moves as one, or one after another with a [stagger].
  final List<Widget>? children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// Whether the content is wiped in or wiped away. An exit is quicker than an
  /// entrance — MD3's `short4` against `medium4` — unless [duration] says
  /// otherwise.
  final MPAnimateMode mode;

  /// Which edge the wipe opens at. Physical, as [MPSide] is everywhere in this
  /// library: a title disclosed from the left of its box is disclosed from
  /// the left in every writing direction, and which edge to name under a
  /// right-to-left reading is the caller's to decide.
  final MPSide from;

  /// Fades in as well as wiping. Off by default, because a reveal is not a
  /// fade: the content is at its final colour the moment any of it shows.
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
        duration: duration ?? MPAnimation.reveal.durationFor(mode),
        delay: delay,
        curve: (easing ?? MPAnimation.reveal.easing).curve,
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
          // A clipper rather than an `Align` with a width factor: an `Align`
          // resizes the box and everything beside it moves, while a clipper is
          // asked for a rectangle at paint time and the layout never hears
          // about it.
          child: ClipRect(
            clipper: _RevealClipper(from: from, progress: t.clamp(0.0, 1.0)),
            child: inner,
          ),
        );
      },
      children: children,
      child: child,
    );
  }
}

/// How much of the box is painted, from the edge the wipe opens at.
///
/// At the end of the wipe it is the whole box and still a clip, as the React
/// build's `inset(0)` is: what the content draws outside its own box stays
/// outside the picture either way, so nothing appears at the last frame.
class _RevealClipper extends CustomClipper<Rect> {
  const _RevealClipper({required this.from, required this.progress});

  /// The edge the wipe opens at.
  final MPSide from;

  /// `0` paints nothing; `1` paints the whole box.
  final double progress;

  @override
  Rect getClip(Size size) {
    switch (from) {
      case MPSide.left:
        return Rect.fromLTWH(0, 0, size.width * progress, size.height);
      case MPSide.right:
        return Rect.fromLTWH(size.width * (1 - progress), 0, size.width * progress, size.height);
      case MPSide.top:
        return Rect.fromLTWH(0, 0, size.width, size.height * progress);
      case MPSide.bottom:
        return Rect.fromLTWH(0, size.height * (1 - progress), size.width, size.height * progress);
    }
  }

  @override
  bool shouldReclip(_RevealClipper oldClipper) {
    return oldClipper.from != from || oldClipper.progress != progress;
  }
}
