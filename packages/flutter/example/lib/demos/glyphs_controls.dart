import 'package:flutter/widgets.dart';

/// The drawings the control demos use that `glyphs.dart` does not have.
///
/// Drawn the same way, in the 24-unit box an SVG uses, at the same weight and
/// from the surrounding [IconTheme], so a glyph from here and one from there
/// sit in one row as one set.
class _Glyph extends StatelessWidget {
  const _Glyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _GlyphPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _GlyphPainter extends CustomPainter {
  const _GlyphPainter({required this.trace, required this.color});

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
  bool shouldRepaint(_GlyphPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// Two sheets, one behind the other.
class CopyGlyph extends StatelessWidget {
  /// Creates the glyph.
  const CopyGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addRRect(
        RRect.fromRectAndRadius(const Rect.fromLTWH(8, 8, 12, 12), const Radius.circular(2)),
      )
      ..moveTo(16, 8)
      ..lineTo(16, 6)
      ..arcToPoint(const Offset(14, 4), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(6, 4)
      ..arcToPoint(const Offset(4, 6), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(4, 14)
      ..arcToPoint(const Offset(6, 16), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(8, 16);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// An arrow rising out of a tray.
class UploadGlyph extends StatelessWidget {
  /// Creates the glyph.
  const UploadGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 15)
      ..lineTo(12, 4)
      ..moveTo(7.5, 8.5)
      ..lineTo(12, 4)
      ..lineTo(16.5, 8.5)
      ..moveTo(4, 14)
      ..lineTo(4, 18)
      ..arcToPoint(const Offset(6, 20), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(18, 20)
      ..arcToPoint(const Offset(20, 18), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(20, 14);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A chevron pointing towards the reading direction's start.
///
/// It turns round under right-to-left, because "previous" points against the
/// reading direction in every language.
class ChevronStartGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ChevronStartGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(15, 6)
      ..lineTo(9, 12)
      ..lineTo(15, 18);
  }

  static void _mirrored(Path path) {
    path
      ..moveTo(9, 6)
      ..lineTo(15, 12)
      ..lineTo(9, 18);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality.of(context) == TextDirection.rtl
        ? const _Glyph(trace: _mirrored)
        : const _Glyph(trace: _trace);
  }
}

/// A chevron pointing towards the reading direction's end.
class ChevronEndGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ChevronEndGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality.of(context) == TextDirection.rtl
        ? const _Glyph(trace: ChevronStartGlyph._trace)
        : const _Glyph(trace: ChevronStartGlyph._mirrored);
  }
}

/// A chevron pointing up.
class ChevronUpGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ChevronUpGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(6, 15)
      ..lineTo(12, 9)
      ..lineTo(18, 15);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
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
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A bold capital B.
class BoldGlyph extends StatelessWidget {
  /// Creates the glyph.
  const BoldGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(7, 5)
      ..lineTo(13, 5)
      ..arcToPoint(const Offset(13, 12), radius: const Radius.circular(3.5))
      ..lineTo(7, 12)
      ..close()
      ..moveTo(7, 12)
      ..lineTo(14, 12)
      ..arcToPoint(const Offset(14, 19), radius: const Radius.circular(3.5))
      ..lineTo(7, 19)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A slanted capital I.
class ItalicGlyph extends StatelessWidget {
  /// Creates the glyph.
  const ItalicGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(10, 5)
      ..lineTo(18, 5)
      ..moveTo(6, 19)
      ..lineTo(14, 19)
      ..moveTo(14, 5)
      ..lineTo(10, 19);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A U standing on a line.
class UnderlineGlyph extends StatelessWidget {
  /// Creates the glyph.
  const UnderlineGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(7, 4)
      ..lineTo(7, 11)
      ..arcToPoint(const Offset(17, 11), radius: const Radius.circular(5), clockwise: false)
      ..lineTo(17, 4)
      ..moveTo(5, 20)
      ..lineTo(19, 20);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}
