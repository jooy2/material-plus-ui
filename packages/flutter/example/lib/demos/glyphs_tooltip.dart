import 'package:flutter/widgets.dart';

/// The one drawing the tooltip demos need beside the shared ones in
/// `glyphs.dart`: the React demo takes `ICONS.copy` from the bundled set.
///
/// It takes its size and colour from the surrounding [IconTheme], as the
/// shared glyphs do.
class CopyGlyph extends StatelessWidget {
  /// Creates the two overlapping sheets.
  const CopyGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _CopyPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _CopyPainter extends CustomPainter {
  const _CopyPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path()
      ..addRRect(RRect.fromLTRBR(9, 9, 20, 20, const Radius.circular(2)))
      ..moveTo(15, 9)
      ..lineTo(15, 6)
      ..arcToPoint(const Offset(13, 4), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(6, 4)
      ..arcToPoint(const Offset(4, 6), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(4, 13)
      ..arcToPoint(const Offset(6, 15), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(9, 15);

    canvas
      ..save()
      // Written in a 24-unit box, at the weight the shared demo glyphs use.
      ..scale(size.shortestSide / 24)
      ..drawPath(
        path,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..color = color,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_CopyPainter oldDelegate) => oldDelegate.color != color;
}
