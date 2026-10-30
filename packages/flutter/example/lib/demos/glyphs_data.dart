import 'package:flutter/widgets.dart';

/// The drawings the data and surfaces demos use, beside the shared ones in
/// `glyphs.dart`.
///
/// The React demos take these from the bundled `ICONS` set (`info`, `link`,
/// `upload`, `chevron-right`, `folder`, `file`). Flutter ships no icon set
/// outside Material, so the gallery draws its own, the way an app hands
/// `MPIcon` whatever its own set gave it. Each takes its size and colour from
/// the surrounding [IconTheme].
class _DataGlyph extends StatelessWidget {
  const _DataGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _DataPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _DataPainter extends CustomPainter {
  const _DataPainter({required this.trace, required this.color});

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
  bool shouldRepaint(_DataPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// A circled `i`.
class InfoCircleGlyph extends StatelessWidget {
  /// Creates the circled `i`.
  const InfoCircleGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addOval(Rect.fromCircle(center: const Offset(12, 12), radius: 9))
      ..moveTo(12, 11)
      ..lineTo(12, 16.5)
      ..moveTo(12, 7.6)
      ..lineTo(12, 7.7);
  }

  @override
  Widget build(BuildContext context) => const _DataGlyph(trace: _trace);
}

/// Two links of a chain.
class LinkGlyph extends StatelessWidget {
  /// Creates the chain.
  const LinkGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(10, 14)
      ..lineTo(14, 10)
      ..moveTo(9.5, 7.5)
      ..lineTo(11.5, 5.5)
      ..arcToPoint(const Offset(18.5, 12.5), radius: const Radius.circular(5))
      ..lineTo(16.5, 14.5)
      ..moveTo(14.5, 16.5)
      ..lineTo(12.5, 18.5)
      ..arcToPoint(const Offset(5.5, 11.5), radius: const Radius.circular(5))
      ..lineTo(7.5, 9.5);
  }

  @override
  Widget build(BuildContext context) => const _DataGlyph(trace: _trace);
}

/// An arrow rising out of a tray.
class UploadGlyph extends StatelessWidget {
  /// Creates the arrow and tray.
  const UploadGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(12, 16)
      ..lineTo(12, 4)
      ..moveTo(7, 9)
      ..lineTo(12, 4)
      ..lineTo(17, 9)
      ..moveTo(4, 15)
      ..lineTo(4, 20)
      ..lineTo(20, 20)
      ..lineTo(20, 15);
  }

  @override
  Widget build(BuildContext context) => const _DataGlyph(trace: _trace);
}

/// A chevron pointing toward the end of the line, mirrored under right-to-left
/// text.
class ChevronEndGlyph extends StatelessWidget {
  /// Creates the chevron.
  const ChevronEndGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(9, 6)
      ..lineTo(15, 12)
      ..lineTo(9, 18);
  }

  @override
  Widget build(BuildContext context) {
    const Widget glyph = _DataGlyph(trace: _trace);

    if (Directionality.of(context) == TextDirection.rtl) {
      return Transform.flip(flipX: true, child: glyph);
    }

    return glyph;
  }
}

/// A folder.
class FolderGlyph extends StatelessWidget {
  /// Creates the folder.
  const FolderGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(3, 7)
      ..lineTo(3, 18)
      ..lineTo(21, 18)
      ..lineTo(21, 8.5)
      ..lineTo(12, 8.5)
      ..lineTo(10, 6)
      ..lineTo(3, 6)
      ..close();
  }

  @override
  Widget build(BuildContext context) => const _DataGlyph(trace: _trace);
}

/// A sheet of paper with a folded corner.
class FileGlyph extends StatelessWidget {
  /// Creates the sheet.
  const FileGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(6, 3)
      ..lineTo(14, 3)
      ..lineTo(19, 8)
      ..lineTo(19, 21)
      ..lineTo(6, 21)
      ..close()
      ..moveTo(14, 3)
      ..lineTo(14, 8)
      ..lineTo(19, 8);
  }

  @override
  Widget build(BuildContext context) => const _DataGlyph(trace: _trace);
}
