import 'package:flutter/widgets.dart';

/// The status drawings the display demos use, beside the shared ones in
/// `glyphs.dart`.
///
/// The React demos take these from the bundled `ICONS` set (`info`, `success`,
/// `warning`, `error`). Flutter ships no icon set outside Material, so the
/// gallery draws its own, the way an app hands `MPIcon` whatever its own set
/// gave it. Each takes its size and colour from the surrounding [IconTheme].
class _StatusGlyph extends StatelessWidget {
  const _StatusGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _StatusPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _StatusPainter extends CustomPainter {
  const _StatusPainter({required this.trace, required this.color});

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
  bool shouldRepaint(_StatusPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// A circled `i`.
class InfoGlyph extends StatelessWidget {
  /// Creates the glyph.
  const InfoGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(12, 11)
      ..lineTo(12, 16)
      ..moveTo(12, 8)
      ..lineTo(12.01, 8);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// A circled tick.
class SuccessGlyph extends StatelessWidget {
  /// Creates the glyph.
  const SuccessGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(8.5, 12.5)
      ..lineTo(11, 15)
      ..lineTo(15.5, 9.5);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// A triangle with an exclamation mark.
class WarningGlyph extends StatelessWidget {
  /// Creates the glyph.
  const WarningGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 3.5)
      ..lineTo(21, 19.5)
      ..lineTo(3, 19.5)
      ..close()
      ..moveTo(12, 9.5)
      ..lineTo(12, 13.5)
      ..moveTo(12, 16.5)
      ..lineTo(12.01, 16.5);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// A circled exclamation mark.
class ErrorGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ErrorGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(12, 7.5)
      ..lineTo(12, 12.5)
      ..moveTo(12, 16)
      ..lineTo(12.01, 16);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// A clock face at ten past.
class ClockGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ClockGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(12, 7)
      ..lineTo(12, 12)
      ..lineTo(15, 14);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// An ×.
class CloseGlyph extends StatelessWidget {
  /// Creates the glyph.
  const CloseGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(6, 6)
      ..lineTo(18, 18)
      ..moveTo(18, 6)
      ..lineTo(6, 18);
  }

  @override
  Widget build(BuildContext context) => const _StatusGlyph(trace: _trace);
}

/// A lightning bolt, filled, for a mark drawn to the edges of its box.
class FilledBoltGlyph extends StatelessWidget {
  /// Creates the glyph.
  const FilledBoltGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _FilledBoltPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _FilledBoltPainter extends CustomPainter {
  const _FilledBoltPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.shortestSide / 24)
      ..drawPath(
        Path()
          ..moveTo(13, 2)
          ..lineTo(4.5, 13.5)
          ..lineTo(11, 13.5)
          ..lineTo(10, 22)
          ..lineTo(18.5, 10.5)
          ..lineTo(12, 10.5)
          ..close(),
        Paint()..color = color,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_FilledBoltPainter oldDelegate) => oldDelegate.color != color;
}
