/// A set of things settling into place one after another.
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

/// A set of things settling into place one after another.
///
/// ```dart
/// MPAnimateAppear(children: [for (final Person person in people) Text(person.name)])
/// ```
///
/// Each child gets the same short fade and drift, held back by its position, so
/// the effect belongs to the **set** rather than to any one item and a reader's
/// eye is walked down the list in the order it should be read. That is what MD3
/// means by a list being introduced rather than merely drawn.
///
/// The children are laid out by [layoutBuilder] — a column of them when nobody
/// said — and the effect is drawn on each of them where it sits, so nothing
/// about the layout changes because the set is being animated. Hand it the
/// list, the row or the grid the children belong in.
///
/// The step is per **child**, so what you pass matters: eight children are
/// eight steps, and one child holding eight things is one step. That is also
/// how to take part of a set out of the sequence — group it.
class MPAnimateAppear extends StatelessWidget {
  /// Creates a set that settles in one child after another.
  const MPAnimateAppear({
    required this.children,
    this.layoutBuilder,
    this.stagger = const Duration(milliseconds: 80),
    this.from = MPSide.bottom,
    this.distance = 12,
    this.fade = true,
    this.reverse = false,
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
    super.key,
  });

  /// The things that appear, one after another.
  final List<Widget> children;

  /// Lays out [children]. A column of them, each at its own width, when
  /// nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// How much later each child starts than the one before it. This is the
  /// whole effect; everything else is what a single child does. At zero the
  /// set arrives all at once, which is a real thing to ask for: there is no
  /// box animation here to fall back to.
  final Duration stagger;

  /// Which edge each child drifts in from. Physical, as [MPSide] is everywhere
  /// in this library.
  final MPSide from;

  /// How far each child travels, in logical pixels. Short on purpose: this is
  /// a settling rather than an entrance from off screen, and a long travel
  /// over a list of eight turns the whole block into something moving.
  final double distance;

  /// Fades each child in as it settles.
  final bool fade;

  /// Runs the set from the last child to the first. Only the order turns
  /// round; each child still plays forwards.
  final bool reverse;

  /// How long one child takes. Left out, MD3's `medium4`, as a slide takes.
  final Duration? duration;

  /// How long before the first child starts.
  final Duration delay;

  /// Which Material curve each child runs on. Left out, `emphasizedDecelerate`.
  final MPEasing? easing;

  /// How many times it runs. `null` never stops.
  final MPAnimateRepeat repeat;

  /// Runs every other pass backwards, so a repeat returns instead of jumping.
  final bool alternate;

  /// Holds the whole set where it is.
  final bool paused;

  /// What starts it. The trigger belongs to the set: one decision for every
  /// child, rather than one per child each watching the screen for itself.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` starts it over.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it runs again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the set has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    final ({Offset fraction, Offset pixels}) start = mpSlideOffset(from, distance);

    return MPAnimateEffect(
      settings: MPAnimateSettings(
        duration: duration ?? MPAnimation.slide.durationFor(MPAnimateMode.enter),
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
      // Per child at any stagger: this widget is the per-child effect.
      spread: true,
      stagger: stagger,
      reverse: reverse,
      layoutBuilder: layoutBuilder,
      frame: (BuildContext context, double t, Widget inner) {
        return MPAnimateOpacity(
          opacity: fade ? t.clamp(0.0, 1.0) : 1,
          child: Transform.translate(offset: start.pixels * (1 - t), child: inner),
        );
      },
      children: children,
    );
  }
}
