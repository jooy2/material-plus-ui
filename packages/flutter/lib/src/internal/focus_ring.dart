/// The focus ring.
///
/// An outline and not a border, in the CSS sense: it is drawn **outside** the
/// control's box, it takes no space, and it does not move anything on the page.
/// Flutter has no such primitive, so it is painted — a stroked rounded
/// rectangle a few pixels wider than the widget that owns it, on a
/// [CustomPaint] that is allowed to draw past its own bounds.
///
/// The offset also grows the radius, which is what CSS does and what stops the
/// ring from cutting the corners of the control it is around.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/scale.dart';

/// Paints a focus ring around a box of the painter's size.
///
/// It goes on a [CustomPaint] that is in the tree whether the focus is there or
/// not, as its `foregroundPainter` while there is a ring to draw and `null`
/// while there is none. A [CustomPaint] put round the control only while it was
/// focused would move the control a level down the tree as the focus arrived
/// and again as it left, and Flutter builds a moved widget again from scratch:
/// what the control holds would lose its state, start its animations over, and
/// give up a focus it had just been given.
class MPFocusRingPainter extends CustomPainter {
  /// Creates a ring in [color] around a shape with [borderRadius].
  const MPFocusRingPainter({
    required this.color,
    required this.borderRadius,
    this.offset = focusRingOffset,
  });

  /// The family's own ring colour.
  final Color color;

  /// The control's corner radius, which the ring follows.
  final BorderRadius borderRadius;

  /// How far outside the control the ring sits, as CSS's `outline-offset`.
  ///
  /// Negative turns it inward, which is the only way to draw a ring on
  /// something that lives *inside* something that clips — a segment in a
  /// groove, a tab on a rail, a fold in a scored pane. A ring drawn outside
  /// those is a ring with its top or its bottom sliced off by the container's
  /// own overflow.
  final double offset;

  @override
  void paint(Canvas canvas, Size size) {
    // The stroke is centred on the path, so the path sits half a stroke outside
    // the offset — which puts the ring's *inner* edge exactly `offset` away
    // from the control, as `outline-offset` specifies.
    final spread = offset + focusRingWidth / 2;
    final radius = borderRadius + BorderRadius.circular(spread);
    final shape = (spread < 0 ? _floor(radius) : radius).toRRect(
      (Offset.zero & size).inflate(spread),
    );

    canvas.drawRRect(
      shape,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = focusRingWidth
        ..color = color,
    );
  }

  /// A negative spread can take a corner past zero, and a negative radius is a
  /// painting error rather than a sharp corner.
  static BorderRadius _floor(BorderRadius radius) {
    Radius clamp(Radius corner) {
      return Radius.elliptical(corner.x < 0 ? 0 : corner.x, corner.y < 0 ? 0 : corner.y);
    }

    return BorderRadius.only(
      topLeft: clamp(radius.topLeft),
      topRight: clamp(radius.topRight),
      bottomLeft: clamp(radius.bottomLeft),
      bottomRight: clamp(radius.bottomRight),
    );
  }

  @override
  bool shouldRepaint(MPFocusRingPainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.borderRadius != borderRadius ||
        oldDelegate.offset != offset;
  }
}
