/// The geometry a spotlight is cut out of, as arithmetic rather than as a
/// widget.
///
/// A tour dims the screen and takes one thing out of the dimming, then puts a
/// card beside it. Both are rectangles, so both are here: they can be read and
/// tested without a frame, and the first is the same shape the React build
/// punches with a CSS `clip-path`.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// A rectangle grown by [padding] on every side, never to a negative size.
Rect inflate(Rect rect, double padding) {
  final grown = rect.inflate(padding);

  return Rect.fromLTWH(
    grown.left,
    grown.top,
    grown.width < 0 ? 0 : grown.width,
    grown.height < 0 ? 0 : grown.height,
  );
}

/// The whole screen with a hole in it.
///
/// A clip and not a painted ring, and that is the decision the whole widget
/// rests on. The obvious way to draw a hole is four rectangles around the
/// target, and it buys nothing else: the corners of a four-piece scrim never
/// quite meet, and the seams show as hairlines the moment the dimming is
/// anything but opaque. A clip buys two things instead:
///
/// **The dimming can blur.** A [BackdropFilter] inside a [ClipPath] blurs the
/// screen everywhere the scrim is painted and nowhere it is not, so the page
/// around the light is out of focus rather than merely grey — which is this
/// library's own material.
///
/// **The hole is a hole for the pointer too.** [ClipPath] clips hit testing as
/// well as painting, so the scrim can take the pointer everywhere it is painted
/// and nowhere it is not. The reader can use the control being pointed at and
/// nothing else, which is what separates a tour from a dialog with a picture of
/// a control in it — and it falls out of the geometry rather than being a
/// second mechanism that has to agree with it.
///
/// A `null` [spot] is a step with no target: the whole screen dims and nothing
/// is cut out, which is what a welcome step and a closing step are.
Path spotlightPath(Size view, Rect? spot, double radius) {
  final outer = Path()..addRect(Offset.zero & view);

  if (spot == null || spot.width <= 0 || spot.height <= 0) {
    return outer;
  }

  // A radius larger than half the shorter side draws a bow tie rather than a
  // rounded corner, which is what a two-pixel-tall target would ask for.
  final r = radius.clamp(0.0, spot.shortestSide / 2);
  final hole = Path()..addRRect(RRect.fromRectAndRadius(spot, Radius.circular(r)));

  return Path.combine(PathOperation.difference, outer, hole);
}

/// Where the card goes: beside the light on [side], lined up by [align], and on
/// the opposite side instead when the one that was asked for has no room.
///
/// A flip and not a slide, which is the same bargain `MPAnchoredPortal`
/// makes: a card that crept sideways as its target neared the edge would be a
/// card that no longer looks like it is pointing at anything. What does move is
/// the *cross* axis, and only far enough to keep the card on screen — a card
/// half off the edge is a card with half a sentence on it.
Offset cardOffset({
  required Size view,
  required Rect spot,
  required Size card,
  required MPSide side,
  required MPAlign align,
  required double gap,
  required double margin,
}) {
  bool fits(MPSide candidate) => switch (candidate) {
    MPSide.top => spot.top - gap - card.height >= margin,
    MPSide.bottom => spot.bottom + gap + card.height <= view.height - margin,
    MPSide.left => spot.left - gap - card.width >= margin,
    MPSide.right => spot.right + gap + card.width <= view.width - margin,
  };

  const opposite = <MPSide, MPSide>{
    MPSide.top: MPSide.bottom,
    MPSide.bottom: MPSide.top,
    MPSide.left: MPSide.right,
    MPSide.right: MPSide.left,
  };

  final resolved = fits(side) || !fits(opposite[side]!) ? side : opposite[side]!;
  final vertical = resolved == MPSide.top || resolved == MPSide.bottom;

  final double main = switch (resolved) {
    MPSide.top => spot.top - gap - card.height,
    MPSide.bottom => spot.bottom + gap,
    MPSide.left => spot.left - gap - card.width,
    MPSide.right => spot.right + gap,
  };

  final double extent = vertical ? card.width : card.height;
  final double start = vertical ? spot.left : spot.top;
  final double length = vertical ? spot.width : spot.height;

  final double cross = switch (align) {
    MPAlign.start => start,
    MPAlign.center => start + (length - extent) / 2,
    MPAlign.end => start + length - extent,
  };

  final double limit = (vertical ? view.width : view.height) - extent - margin;
  final double clamped = limit < margin ? margin : cross.clamp(margin, limit);

  return vertical ? Offset(clamped, main) : Offset(main, clamped);
}
