/// The arithmetic a [MPImage] turns and places its picture with.
///
/// It is here rather than in the widget for the reason `internal/gallery.dart`
/// is: **the React build needs the same answers.** Every function in this file
/// matches one in `internal/image.ts`. A turn that rounded a stray `45` to a
/// different quarter on the two sides would be one picture lying two different
/// ways, and a crop that kept a different part of it would be two pictures.
///
/// `positionFractions` and `objectPosition` have no counterpart here, and are
/// not an oversight: they read and write the CSS spelling of a position, and a
/// position here is an [Alignment] already. [posed] is the counterpart of
/// `poseStyle`, drawing the same turn and mirror with widgets.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

/// A turn in degrees as a count of clockwise quarters, whatever number arrived.
///
/// `-90` is the `270` it means, `450` is `90`, anything between two quarters
/// goes to the nearer one, and a number that is not finite is no turn at all.
///
/// Halfway goes up in both directions, so `45` is one quarter and `-45` is none.
/// That is JavaScript's `Math.round`, written out, because Dart's own `round`
/// takes a half away from zero and would put `-45` on the other side.
int quartersOf(num degrees) {
  if (!degrees.isFinite) {
    return 0;
  }

  return (degrees / 90 + 0.5).floor() % 4;
}

/// Whether a turn puts the picture on its side, swapping its width and height.
bool isSideways(int quarters) => quarters.isOdd;

/// A place on the picture as it is shown, as the same place on the picture
/// before it is turned and mirrored — each a fraction of the free space, across
/// and down.
///
/// An [Image]'s alignment is laid out in the picture's own frame, before the
/// turn and the mirror around it, so `top` on a picture turned upside down would
/// keep what ends up at the bottom. The mirror is undone first, because it acts
/// on the axes of the screen after the turn. Then the turn, a quarter at a time:
/// one quarter clockwise lays the picture's left edge along the top of the
/// screen, so what is across on the screen was down the picture.
(double, double) elementFractions(
  (double, double) shown,
  int quarters, {
  required bool mirrorAcross,
  required bool mirrorDown,
}) {
  double across = mirrorAcross ? 1 - shown.$1 : shown.$1;
  double down = mirrorDown ? 1 - shown.$2 : shown.$2;

  for (int turn = 0; turn < quarters; turn += 1) {
    final double was = across;

    across = down;
    down = 1 - was;
  }

  return (across, down);
}

/// [child] turned by [quarters] and mirrored along the axes it is shown on.
///
/// The turn is a [RotatedBox] rather than a [Transform], because it turns the
/// layout as well as the paint: the picture is laid out at its box's height by
/// its width, fitted there, and turned into place, so a picture on its side
/// fills its box rather than overhanging it on one axis and falling short on
/// the other.
///
/// The mirror goes outside the turn, so it acts on the axes of the screen and
/// needs no swapping on a quarter turn. The React build writes its mirror in
/// the element's own axes and swaps them there instead.
Widget posed(Widget child, int quarters, {required bool mirrorAcross, required bool mirrorDown}) {
  Widget result = child;

  if (quarters != 0) {
    result = RotatedBox(quarterTurns: quarters, child: result);
  }

  if (mirrorAcross || mirrorDown) {
    result = Transform.flip(flipX: mirrorAcross, flipY: mirrorDown, child: result);
  }

  return result;
}
