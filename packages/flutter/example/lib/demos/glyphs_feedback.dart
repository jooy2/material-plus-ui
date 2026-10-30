import 'package:flutter/widgets.dart';

/// The drawings the feedback demos use, beside the shared ones in
/// `glyphs.dart`.
///
/// The React demos take these from the bundled `ICONS` set. Flutter ships no
/// icon set outside Material, so the gallery draws the two it needs, the way an
/// app hands `MPIcon` whatever its own set gave it. Each takes its size and its
/// colour from the surrounding [IconTheme].
class _FeedbackGlyph extends StatelessWidget {
  const _FeedbackGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _FeedbackPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _FeedbackPainter extends CustomPainter {
  const _FeedbackPainter({required this.trace, required this.color});

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
  bool shouldRepaint(_FeedbackPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// A tick in a ring: something that worked.
class DoneGlyph extends StatelessWidget {
  /// Creates the glyph.
  const DoneGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 8.75))
      ..moveTo(8.25, 12.25)
      ..lineTo(10.75, 14.75)
      ..lineTo(15.75, 9.5);
  }

  @override
  Widget build(BuildContext context) => const _FeedbackGlyph(trace: _trace);
}

/// A triangle round a mark: proceed carefully.
class CautionGlyph extends StatelessWidget {
  /// Creates the glyph.
  const CautionGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(10.3, 4.6)
      ..lineTo(2.9, 17.6)
      ..quadraticBezierTo(2, 19.5, 4.1, 19.5)
      ..lineTo(19.9, 19.5)
      ..quadraticBezierTo(22, 19.5, 21.1, 17.6)
      ..lineTo(13.7, 4.6)
      ..quadraticBezierTo(12, 2.4, 10.3, 4.6)
      ..close()
      ..moveTo(12, 9.25)
      ..lineTo(12, 13.25)
      ..moveTo(12, 16.25)
      ..lineTo(12.01, 16.25);
  }

  @override
  Widget build(BuildContext context) => const _FeedbackGlyph(trace: _trace);
}
