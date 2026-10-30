/// The wheel over a strip that runs the other way, and what happens when the
/// strip runs out of room.
library;

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

/// How long after the strip last moved the wheel still belongs to it.
///
/// Long enough to cover the gap between two notches of a wheel being turned,
/// short enough that a reader who has stopped and looked at what arrived is
/// scrolling the page again by the time they reach for it.
const Duration _latch = Duration(milliseconds: 250);

/// A pixel of slack, for the fractional layout that reports a strip everything
/// fits in as a hair longer than its box.
const double _epsilon = 1;

/// The scroll signals a strip takes off the framework, and the ones it refuses.
///
/// Two widgets have the same problem and it is not the one it looks like. A
/// mouse has one wheel, it points down the page, and a strip that runs across
/// the box has no use for that direction: a horizontal [Scrollable] reads the
/// horizontal half of a scroll and a mouse only ever produces the vertical one,
/// so the shelf under the pointer sits still while whatever is behind it moves
/// instead. The pointer being on the strip is the reader saying which of the two
/// things under it they meant to move, and [turn] is what acts on that.
///
/// [overscroll] is the second half, and it is the end of the strip rather than
/// the middle of it. A scroller that has run out hands the rest of the gesture
/// to whatever is behind it, and the reader who was flicking a shelf along gets
/// the whole page moving instead — without having asked for it, and usually
/// without having seen which pixel it happened at.
///
/// Everything goes through the [PointerSignalResolver] rather than being acted
/// on where it arrives. A scroll view that has claimed the same event is deeper
/// in the hit test and registers first, so the strip's own [Scrollable] moves it
/// and this does not move it again; and a claim that does nothing at all is what
/// keeps an ancestor from taking a signal the strip has decided to hold.
class MPWheelScroll extends StatefulWidget {
  /// Wraps [child] so the strip [controller] drives reads the wheel.
  const MPWheelScroll({
    required this.controller,
    required this.overscroll,
    required this.child,
    this.turn = true,
    super.key,
  });

  /// The strip's own controller. Nothing happens before it has a position.
  final ScrollController controller;

  /// Whether a wheel that points across the strip moves it along.
  ///
  /// The axis the framework has no answer for. A trackpad's two fingers and a
  /// tilt wheel already produce a gesture along the strip and are left alone.
  final bool turn;

  /// What the strip does with a gesture it has run out of room for.
  final MPOverscroll overscroll;

  /// The strip.
  final Widget child;

  @override
  State<MPWheelScroll> createState() => _MPWheelScrollState();
}

class _MPWheelScrollState extends State<MPWheelScroll> {
  /// When the strip last had somewhere to go, which is what the latch reads.
  Duration? _moved;

  void _onPointerSignal(PointerSignalEvent event) {
    if (event is! PointerScrollEvent || !widget.controller.hasClients) {
      return;
    }

    final ScrollPosition position = widget.controller.position;
    final bool horizontal = position.axis == Axis.horizontal;
    final Offset delta = event.scrollDelta;
    final double along = horizontal ? delta.dx : delta.dy;
    final double across = horizontal ? delta.dy : delta.dx;

    // A gesture that already points along the strip is the framework's own, and
    // the [Scrollable] inside this listener has registered for it already.
    final bool own = along.abs() >= across.abs();
    final double travel = own ? along : across;

    if (travel == 0) {
      return;
    }

    // The sentence the whole containment rests on: a strip everything fits in
    // is not a scroller, so it never takes the wheel and never holds it.
    // Without this, a bar of three tabs would be a place on the page the reader
    // cannot scroll past.
    if (position.maxScrollExtent - position.minScrollExtent <= _epsilon) {
      return;
    }

    final double target = (position.pixels + travel).clamp(
      position.minScrollExtent,
      position.maxScrollExtent,
    );

    if (target != position.pixels) {
      _moved = event.timeStamp;

      // Somewhere to go, and along the strip's own axis the framework is
      // already taking it there.
      if (own || !widget.turn) {
        return;
      }

      GestureBinding.instance.pointerSignalResolver.register(event, (PointerSignalEvent _) {
        widget.controller.jumpTo(target);
      });

      return;
    }

    // Nothing left this way. A strip the wheel does not turn has no claim on the
    // cross axis at all, so there is nothing for it to hold there either.
    if (!own && !widget.turn) {
      return;
    }

    final Duration? moved = _moved;
    final bool latched = moved != null && event.timeStamp - moved < _latch;

    // `contain` keeps the gesture; `auto` gives it back, but not in the middle
    // of the flick that was moving the strip a moment ago.
    if (widget.overscroll == MPOverscroll.contain || latched) {
      // Claimed and dropped, which is the whole of what containment is: the
      // signal is spoken for, so nothing behind the strip acts on it.
      GestureBinding.instance.pointerSignalResolver.register(event, (PointerSignalEvent _) {});
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.turn && widget.overscroll == MPOverscroll.auto) {
      return widget.child;
    }

    return Listener(onPointerSignal: _onPointerSignal, child: widget.child);
  }
}

/// What a strip does with a gesture it has run out of room for.
enum MPOverscroll {
  /// Hands the rest of the gesture to whatever is behind the strip, though not
  /// in the middle of a flick that was moving it a moment ago.
  auto,

  /// Keeps it, which is what the React package's `overscroll-contain` does.
  contain,
}
