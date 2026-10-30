import 'package:flutter/widgets.dart';

/// The drawings the drawer demos use, beside the shared ones in `glyphs.dart`.
///
/// The React demos take these from the bundled `ICONS` set (`calendar` and
/// `upload`). Flutter ships no icon set outside Material, so the gallery draws
/// its own, the way an app hands `MPIcon` whatever its own set gave it. Each
/// takes its size and colour from the surrounding [IconTheme].
class _DrawerGlyph extends StatelessWidget {
  const _DrawerGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _DrawerGlyphPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _DrawerGlyphPainter extends CustomPainter {
  const _DrawerGlyphPainter({required this.trace, required this.color});

  final void Function(Path path) trace;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path();
    trace(path);

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
  bool shouldRepaint(_DrawerGlyphPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// A page of a calendar, with its two rings.
class CalendarGlyph extends StatelessWidget {
  /// Creates the glyph.
  const CalendarGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addRRect(
        RRect.fromRectAndRadius(const Rect.fromLTRB(4, 5, 20, 20), const Radius.circular(2)),
      )
      ..moveTo(4, 10)
      ..lineTo(20, 10)
      ..moveTo(8, 3)
      ..lineTo(8, 7)
      ..moveTo(16, 3)
      ..lineTo(16, 7);
  }

  @override
  Widget build(BuildContext context) => const _DrawerGlyph(trace: _trace);
}

/// An arrow rising out of a tray.
class UploadGlyph extends StatelessWidget {
  /// Creates the glyph.
  const UploadGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(4, 15)
      ..lineTo(4, 19)
      ..lineTo(20, 19)
      ..lineTo(20, 15)
      ..moveTo(12, 4)
      ..lineTo(12, 15)
      ..moveTo(7.5, 8.5)
      ..lineTo(12, 4)
      ..lineTo(16.5, 8.5);
  }

  @override
  Widget build(BuildContext context) => const _DrawerGlyph(trace: _trace);
}
