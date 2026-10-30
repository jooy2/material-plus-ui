import 'package:flutter/widgets.dart';

/// The drawings the demos use.
///
/// Flutter ships no icon set outside Material, and the library depends on
/// neither Material nor an icon package — so the gallery draws the handful of
/// glyphs its examples need, the same way an app would hand `MPIcon` whatever
/// its own set gave it.
///
/// Each one takes its size and its colour from the surrounding [IconTheme],
/// which is what an [Icon] does and what `MPIcon` sets.
class _Glyph extends StatelessWidget {
  const _Glyph({required this.trace});

  final void Function(Path path) trace;

  /// The weight every demo glyph is drawn at. One number, because two glyphs at
  /// two weights in the same row read as two icon sets.
  static const double strokeWidth = 1.6;

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);

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
    final path = Path();
    trace(path);

    canvas
      ..save()
      // Every drawing below is written in the 24-unit box its SVG uses.
      ..scale(size.shortestSide / 24)
      ..drawPath(
        path,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = _Glyph.strokeWidth
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

/// A lightning bolt.
class BoltGlyph extends StatelessWidget {
  /// Creates the bolt.
  const BoltGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(13, 2)
      ..lineTo(4, 14)
      ..lineTo(11, 14)
      ..lineTo(10, 22)
      ..lineTo(19, 10)
      ..lineTo(12, 10)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A bell.
class BellGlyph extends StatelessWidget {
  /// Creates the bell.
  const BellGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(18, 8)
      ..arcToPoint(const Offset(6, 8), radius: const Radius.circular(6), largeArc: true)
      ..cubicTo(6, 14, 4, 15, 4, 15)
      ..lineTo(20, 15)
      ..cubicTo(20, 15, 18, 14, 18, 8)
      ..moveTo(13.7, 20)
      ..arcToPoint(const Offset(10.3, 20), radius: const Radius.circular(2));
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A heart.
class HeartGlyph extends StatelessWidget {
  /// Creates the heart.
  const HeartGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 20.5)
      ..lineTo(4.2, 13)
      ..arcToPoint(const Offset(10.8, 6.4), radius: const Radius.circular(4.7))
      ..lineTo(12, 7.6)
      ..lineTo(13.2, 6.4)
      ..arcToPoint(const Offset(19.8, 13), radius: const Radius.circular(4.7), largeArc: true)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A plus.
class PlusGlyph extends StatelessWidget {
  /// Creates the plus.
  const PlusGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 5)
      ..lineTo(12, 19)
      ..moveTo(5, 12)
      ..lineTo(19, 12);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A share arrow leaving a tray.
class ShareGlyph extends StatelessWidget {
  /// Creates the share arrow.
  const ShareGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(4, 12)
      ..lineTo(4, 20)
      ..lineTo(20, 20)
      ..lineTo(20, 12)
      ..moveTo(12, 3)
      ..lineTo(12, 16)
      ..moveTo(8, 7)
      ..lineTo(12, 3)
      ..lineTo(16, 7);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// Three dots in a row — the "more" affordance.
class MoreGlyph extends StatelessWidget {
  /// Creates the three dots.
  const MoreGlyph({super.key});

  static void _trace(Path path) {
    for (final double x in <double>[5, 12, 19]) {
      path.addOval(Rect.fromCircle(center: Offset(x, 12), radius: 1.2));
    }
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A waste basket.
class TrashGlyph extends StatelessWidget {
  /// Creates the basket.
  const TrashGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(4, 7)
      ..lineTo(20, 7)
      ..moveTo(9, 7)
      ..lineTo(9, 4)
      ..lineTo(15, 4)
      ..lineTo(15, 7)
      ..moveTo(6, 7)
      ..lineTo(7, 20)
      ..lineTo(17, 20)
      ..lineTo(18, 7)
      ..moveTo(10, 11)
      ..lineTo(10, 17)
      ..moveTo(14, 11)
      ..lineTo(14, 17);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A floppy disk — the one drawing everybody still reads as "save".
class SaveGlyph extends StatelessWidget {
  /// Creates the disk.
  const SaveGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(5, 4)
      ..lineTo(16, 4)
      ..lineTo(19, 7)
      ..lineTo(19, 20)
      ..lineTo(5, 20)
      ..close()
      ..moveTo(8, 4)
      ..lineTo(8, 10)
      ..lineTo(16, 10)
      ..lineTo(16, 4)
      ..moveTo(8, 20)
      ..lineTo(8, 14)
      ..lineTo(16, 14)
      ..lineTo(16, 20);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A five-pointed star.
class StarGlyph extends StatelessWidget {
  /// Creates the star.
  const StarGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 3)
      ..lineTo(14.6, 8.6)
      ..lineTo(20.6, 9.4)
      ..lineTo(16.2, 13.6)
      ..lineTo(17.3, 19.7)
      ..lineTo(12, 16.8)
      ..lineTo(6.7, 19.7)
      ..lineTo(7.8, 13.6)
      ..lineTo(3.4, 9.4)
      ..lineTo(9.4, 8.6)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A house.
class HomeGlyph extends StatelessWidget {
  /// Creates the house.
  const HomeGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(4, 11)
      ..lineTo(12, 4)
      ..lineTo(20, 11)
      ..lineTo(20, 20)
      ..lineTo(4, 20)
      ..close()
      ..moveTo(9, 20)
      ..lineTo(9, 14)
      ..lineTo(15, 14)
      ..lineTo(15, 20);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A magnifying glass.
class SearchGlyph extends StatelessWidget {
  /// Creates the glass.
  const SearchGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(11, 11), radius: 6))
      ..moveTo(15.5, 15.5)
      ..lineTo(19.5, 19.5);
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A bookmark.
class BookmarkGlyph extends StatelessWidget {
  /// Creates the bookmark.
  const BookmarkGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(7, 4)
      ..lineTo(17, 4)
      ..lineTo(17, 20)
      ..lineTo(12, 16)
      ..lineTo(7, 20)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A head and shoulders.
class AccountGlyph extends StatelessWidget {
  /// Creates the silhouette.
  const AccountGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 9), radius: 3.4))
      ..moveTo(5, 20)
      ..arcToPoint(const Offset(19, 20), radius: const Radius.circular(7));
  }

  @override
  Widget build(BuildContext context) => const _Glyph(trace: _trace);
}

/// A tick.
class CheckGlyph extends StatelessWidget {
  /// Creates the glyph.
  const CheckGlyph({super.key});

  @override
  Widget build(BuildContext context) {
    return _Glyph(
      trace: (Path path) {
        path
          ..moveTo(5, 12.5)
          ..lineTo(10, 17.5)
          ..lineTo(19, 7);
      },
    );
  }
}
