import 'package:flutter/widgets.dart';

/// The drawings the layout demos need that `glyphs.dart` does not have.
///
/// Drawn the way that file draws its own: a stroke in a 24-unit box, sized and
/// coloured by the surrounding [IconTheme].
class _LayoutGlyph extends StatelessWidget {
  const _LayoutGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _LayoutGlyphPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _LayoutGlyphPainter extends CustomPainter {
  const _LayoutGlyphPainter({required this.trace, required this.color});

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
  bool shouldRepaint(_LayoutGlyphPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// Two angle brackets: code, or captions in a player.
class CodeGlyph extends StatelessWidget {
  /// Creates the brackets.
  const CodeGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(8, 7)
      ..lineTo(3, 12)
      ..lineTo(8, 17)
      ..moveTo(16, 7)
      ..lineTo(21, 12)
      ..lineTo(16, 17);
  }

  @override
  Widget build(BuildContext context) => const _LayoutGlyph(trace: _trace);
}

/// A circle with an "i" in it.
class InfoGlyph extends StatelessWidget {
  /// Creates the mark.
  const InfoGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(12, 11)
      ..lineTo(12, 16.5)
      ..addOval(Rect.fromCircle(center: const Offset(12, 7.8), radius: 0.4));
  }

  @override
  Widget build(BuildContext context) => const _LayoutGlyph(trace: _trace);
}
