import 'package:flutter/widgets.dart';

/// The drawing the navigation bar demos use beside the shared ones in
/// `glyphs.dart` and `glyphs_display.dart`.
///
/// The React demos take it from the bundled `ICONS` set. Flutter ships no icon
/// set outside Material, so the gallery draws its own, the way an app hands
/// `MPIcon` whatever its own set gave it. It takes its size and colour from the
/// surrounding [IconTheme], as an [Icon] does.
class UploadGlyph extends StatelessWidget {
  /// Creates the arrow rising out of a tray.
  const UploadGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _UploadPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _UploadPainter extends CustomPainter {
  const _UploadPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path()
      // The arrow.
      ..moveTo(12, 15)
      ..lineTo(12, 4)
      ..moveTo(7, 9)
      ..lineTo(12, 4)
      ..lineTo(17, 9)
      // The tray it rises out of.
      ..moveTo(4, 15)
      ..lineTo(4, 19)
      ..lineTo(20, 19)
      ..lineTo(20, 15);

    canvas
      ..save()
      // Written in the 24-unit box its SVG uses, at the weight the shared demo
      // glyphs are drawn at.
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
  bool shouldRepaint(_UploadPainter oldDelegate) => oldDelegate.color != color;
}
