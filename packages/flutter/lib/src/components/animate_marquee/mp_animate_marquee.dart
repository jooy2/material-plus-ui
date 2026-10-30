/// Content scrolling steadily past, for ever.
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

/// How long a pass takes before the strip has been measured: a sane number
/// rather than nothing, which would finish at once.
const Duration _unmeasured = Duration(seconds: 12);

/// Content scrolling steadily past, for ever.
///
/// ```dart
/// MPAnimateMarquee(children: [for (final String tool in tools) Text(tool)])
/// ```
///
/// The content is laid down [copies] times, and each copy travels exactly its
/// own length plus the [gap] — so the moment the first copy has left, the
/// second is standing precisely where it began. There is no seam, no jump and
/// no frame where the strip is empty.
///
/// What is measured is the speed. A duration would mean a strip of four logos
/// and a strip of forty crossing the same box in the same time, with the long
/// one becoming unreadable; [speed] is pixels per second, so both move at the
/// pace of a reader instead. The strip is measured again whenever it changes.
///
/// A strip runs towards the reader's start: in English it enters on the right
/// and leaves on the left, and in a right-to-left language the other way, or
/// the words would arrive backwards.
///
/// [pauseOnHover] is on by default and is not decoration: content moving past
/// a pointer cannot be pressed reliably, and a link inside a marquee that never
/// stops is a link nobody can follow.
///
/// Only the first copy is read out or reached by the keyboard. The rest are
/// scenery, left out of the semantics and the focus order alike, or a screen
/// reader would announce the strip as many times as it was laid down.
class MPAnimateMarquee extends StatefulWidget {
  /// Creates a marquee of [children].
  const MPAnimateMarquee({
    required this.children,
    this.orientation = MPOrientation.horizontal,
    this.reverse = false,
    this.speed = 60,
    this.gap = 32,
    this.copies = 2,
    this.pauseOnHover = true,
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
    super.key,
  });

  /// The things that scroll past.
  final List<Widget> children;

  /// Which way the strip runs. A vertical strip needs a height from its
  /// parent, as a box with its overflow hidden does.
  final MPOrientation orientation;

  /// Runs it the other way: towards the reader's end, or bottom to top.
  final bool reverse;

  /// How fast the content travels, in logical pixels per second. `0` or less
  /// holds the strip where it is. [duration] overrides it.
  final double speed;

  /// The gap between items, and between the last item and the first of the
  /// next pass, in logical pixels.
  final double gap;

  /// How many copies of the content are laid end to end. Two is enough for
  /// anything at least as long as its box; raise it when the content is short
  /// enough to leave a hole behind itself.
  final int copies;

  /// Stops while the pointer is on it, so something scrolling past can be read
  /// or pressed.
  final bool pauseOnHover;

  /// How long one pass takes. Left out, [speed] and the measurement decide.
  final Duration? duration;

  /// How long before it starts.
  final Duration delay;

  /// Which Material curve a pass runs on. Left out, [MPEasing.linear]: an
  /// eased marquee slows at both ends of a loop that has no ends, which reads
  /// as the screen stuttering.
  final MPEasing? easing;

  /// How many passes. `null`, the default, never stops.
  final MPAnimateRepeat repeat;

  /// Runs every other pass backwards, so the strip swings back and forth.
  final bool alternate;

  /// Holds the strip where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual].
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the box has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  State<MPAnimateMarquee> createState() => _MPAnimateMarqueeState();
}

class _MPAnimateMarqueeState extends State<MPAnimateMarquee> {
  /// The first copy, measured for how far a pass has to go.
  final GlobalKey _track = GlobalKey();

  /// How far one copy has to go: its own length plus the gap after it.
  double _travel = 0;

  bool _hovered = false;

  bool get _vertical => widget.orientation == MPOrientation.vertical;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _measure());
  }

  @override
  void didUpdateWidget(MPAnimateMarquee oldWidget) {
    super.didUpdateWidget(oldWidget);
    WidgetsBinding.instance.addPostFrameCallback((_) => _measure());
  }

  void _measure() {
    if (!mounted) {
      return;
    }

    final RenderObject? object = _track.currentContext?.findRenderObject();

    if (object is! RenderBox || !object.hasSize) {
      return;
    }

    final double next = (_vertical ? object.size.height : object.size.width) + widget.gap;

    if ((next - _travel).abs() > 0.5) {
      setState(() => _travel = next);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool rtl = Directionality.maybeOf(context) == TextDirection.rtl;
    final bool still = mpReducedMotion(context);
    // A speed of zero is not a speed, and a negative one is not a direction —
    // [reverse] says which way the strip goes. Either holds the strip where it
    // is rather than dividing by nothing.
    final bool stopped = widget.duration == null && widget.speed <= 0;
    final Duration duration =
        widget.duration ??
        (_travel > 0 && !stopped
            ? Duration(microseconds: (_travel / widget.speed * 1000000).round())
            : _unmeasured);

    Widget strip = MPAnimateRun(
      // Backwards is the other way round, as `animation-direction: reverse`.
      mode: widget.reverse ? MPAnimateMode.exit : MPAnimateMode.enter,
      settings: MPAnimateSettings(
        duration: duration,
        delay: widget.delay,
        curve: (widget.easing ?? MPEasing.linear).curve,
        repeat: widget.repeat,
        alternate: widget.alternate,
        paused: widget.paused || stopped,
        trigger: widget.trigger,
        play: widget.play,
        once: widget.once,
        threshold: widget.threshold,
      ),
      // The pointer stops the strip where it is, as the React build pauses the
      // keyframe in its stylesheet.
      held: widget.pauseOnHover && _hovered,
      // The box is drawn inside the run rather than around it, so what the run
      // measures for a `visible` trigger and for resting off screen is the box
      // a reader sees, not the strip, which is longer than the box by design.
      frame: (BuildContext context, double t, Widget inner) {
        // Stopped, not slowed, under reduced motion: a strip that has stopped
        // is a strip of content, with its first copy fully in frame.
        final double shift = still ? 0 : t * _travel;
        final Offset offset = _vertical ? Offset(0, -shift) : Offset(rtl ? shift : -shift, 0);

        // Laid out against an unbounded main axis and clipped, because the
        // strip is longer than its box by design and a `ClipRect` alone would
        // leave a flex reporting that it overflowed.
        return UnconstrainedBox(
          constrainedAxis: _vertical ? Axis.horizontal : Axis.vertical,
          alignment: _vertical ? Alignment.topCenter : AlignmentDirectional.centerStart,
          clipBehavior: Clip.hardEdge,
          child: Transform.translate(offset: offset, child: inner),
        );
      },
      child: _copies(),
    );

    if (widget.pauseOnHover) {
      strip = MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: strip,
      );
    }

    // The whole length the box is given along the strip, as a block with its
    // overflow hidden takes it, where there is a length to take.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final bool bounded = _vertical ? constraints.hasBoundedHeight : constraints.hasBoundedWidth;

        if (!bounded) {
          return strip;
        }

        return SizedBox(
          width: _vertical ? null : constraints.maxWidth,
          height: _vertical ? constraints.maxHeight : null,
          child: strip,
        );
      },
    );
  }

  /// The copies, end to end with a gap between them. Only the first is read
  /// out or reached by the keyboard.
  Widget _copies() {
    final Axis axis = _vertical ? Axis.vertical : Axis.horizontal;
    final int count = widget.copies < 1 ? 1 : widget.copies;

    return Flex(
      direction: axis,
      mainAxisSize: MainAxisSize.min,
      spacing: widget.gap,
      children: <Widget>[
        for (int index = 0; index < count; index += 1)
          if (index == 0)
            KeyedSubtree(key: _track, child: _copy(axis))
          else
            ExcludeSemantics(child: ExcludeFocus(child: _copy(axis))),
      ],
    );
  }

  /// One pass of the content.
  Widget _copy(Axis axis) {
    return Flex(
      direction: axis,
      mainAxisSize: MainAxisSize.min,
      spacing: widget.gap,
      children: widget.children,
    );
  }
}
