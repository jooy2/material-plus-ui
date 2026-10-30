import 'package:flutter/widgets.dart';

/// The two drawings the transition demos need that `glyphs.dart` does not
/// have: the React demos' `chevron-down` and `spinner`.
///
/// Each takes its size and its colour from the surrounding [IconTheme], as an
/// [Icon] does and as `MPIcon` sets.
class _Stroke extends StatelessWidget {
  const _Stroke({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _StrokePainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _StrokePainter extends CustomPainter {
  const _StrokePainter({required this.trace, required this.color});

  final void Function(Path path) trace;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path();

    trace(path);
    canvas
      ..save()
      // Written in the 24-unit box an SVG icon uses.
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
  bool shouldRepaint(_StrokePainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// A chevron pointing down.
class ChevronDownGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ChevronDownGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(6, 9)
      ..lineTo(12, 15)
      ..lineTo(18, 9);
  }

  @override
  Widget build(BuildContext context) => const _Stroke(trace: _trace);
}

/// Three quarters of a ring, the shape a spinner turns.
class SpinnerGlyph extends StatelessWidget {
  /// Creates the glyph.
  const SpinnerGlyph({super.key});

  static void _trace(Path path) {
    path.addArc(Rect.fromCircle(center: const Offset(12, 12), radius: 8), 0, 4.712);
  }

  @override
  Widget build(BuildContext context) => const _Stroke(trace: _trace);
}
