/// A panel that opens downward.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

/// [child] revealed from its top edge as [factor] runs from `0` to `1`.
///
/// This is what a `SizeTransition` does — a clip and an `Align` with a height
/// factor — written out, and it is written out for a version reason. The
/// parameter that puts a vertical fold's alignment at the *top* is `alignment`
/// on a current Flutter and `axisAlignment` on 3.41.0, the oldest release this
/// package supports. One of the two is always either missing or deprecated, and
/// `flutter analyze` fails on both. The primitives underneath have not changed
/// in years.
///
/// The body is clipped rather than squashed while the panel moves, which is what
/// makes it a window opening onto the content rather than the content being
/// scaled.
class MPFold extends StatelessWidget {
  /// Creates a fold.
  const MPFold({required this.factor, this.child, super.key});

  /// How much of [child] is showing, `0` to `1`.
  final Animation<double> factor;

  /// What is being revealed. Laid out at its full size throughout.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: AnimatedBuilder(
        animation: factor,
        // Handed through rather than rebuilt: the panel's own subtree does not
        // change from frame to frame, only how much of it is showing.
        child: child,
        builder: (BuildContext context, Widget? panel) => Align(
          alignment: Alignment.topCenter,
          // A curve that overshoots below zero would otherwise ask `Align` for
          // a negative height.
          heightFactor: math.max(factor.value, 0),
          child: panel,
        ),
      ),
    );
  }
}
