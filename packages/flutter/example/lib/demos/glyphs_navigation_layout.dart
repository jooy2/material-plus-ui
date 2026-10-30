import 'package:flutter/widgets.dart';

/// The drawings the tabs and toolbar demos use, beside the shared ones in
/// `glyphs.dart`.
///
/// The React demos take these from the bundled `ICONS` set (`arrow-up`,
/// `calendar`, `arrow-right`). Flutter ships no icon set outside Material, so
/// the gallery draws its own, the way an app hands `MPIcon` whatever its own
/// set gave it. Each takes its size and colour from the surrounding
/// [IconTheme], and is drawn in a 24-unit box at the weight `glyphs.dart` uses.
class _LayoutGlyph extends StatelessWidget {
  const _LayoutGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _LayoutPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _LayoutPainter extends CustomPainter {
  const _LayoutPainter({required this.trace, required this.color});

  final void Function(Path path) trace;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path();
    trace(path);

    canvas
      ..save()
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
  bool shouldRepaint(_LayoutPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// An arrow pointing up.
class ArrowUpGlyph extends StatelessWidget {
  /// Creates the arrow.
  const ArrowUpGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 19)
      ..lineTo(12, 5)
      ..moveTo(6, 11)
      ..lineTo(12, 5)
      ..lineTo(18, 11);
  }

  @override
  Widget build(BuildContext context) => const _LayoutGlyph(trace: _trace);
}

/// An arrow pointing right.
class ArrowRightGlyph extends StatelessWidget {
  /// Creates the arrow.
  const ArrowRightGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(5, 12)
      ..lineTo(19, 12)
      ..moveTo(13, 6)
      ..lineTo(19, 12)
      ..lineTo(13, 18);
  }

  @override
  Widget build(BuildContext context) => const _LayoutGlyph(trace: _trace);
}

/// A page of a calendar, with its two rings and a few days marked.
class CalendarGlyph extends StatelessWidget {
  /// Creates the calendar.
  const CalendarGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addRRect(RRect.fromLTRBR(4, 5, 20, 20, const Radius.circular(2)))
      ..moveTo(8, 3)
      ..lineTo(8, 7)
      ..moveTo(16, 3)
      ..lineTo(16, 7)
      ..moveTo(4, 10)
      ..lineTo(20, 10);

    for (final Offset day in const <Offset>[
      Offset(8.5, 13.5),
      Offset(12, 13.5),
      Offset(15.5, 13.5),
      Offset(8.5, 16.5),
      Offset(12, 16.5),
    ]) {
      path
        ..moveTo(day.dx, day.dy)
        ..lineTo(day.dx + 0.01, day.dy);
    }
  }

  @override
  Widget build(BuildContext context) => const _LayoutGlyph(trace: _trace);
}
