import 'package:flutter/widgets.dart';

/// The one drawing the confirm demo needs beside the shared ones in
/// `glyphs.dart`: the React demo takes `ICONS.close` from the bundled set.
///
/// It takes its size and colour from the surrounding [IconTheme], as the
/// shared glyphs do.
class CloseGlyph extends StatelessWidget {
  /// Creates the ×.
  const CloseGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _ClosePainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _ClosePainter extends CustomPainter {
  const _ClosePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path()
      ..moveTo(6, 6)
      ..lineTo(18, 18)
      ..moveTo(18, 6)
      ..lineTo(6, 18);

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
          ..color = color,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_ClosePainter oldDelegate) => oldDelegate.color != color;
}
