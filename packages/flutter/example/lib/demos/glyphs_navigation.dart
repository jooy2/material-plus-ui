import 'package:flutter/widgets.dart';

/// The drawings the menu and command palette demos use, beside the shared
/// ones in `glyphs.dart`, `glyphs_display.dart` and `glyphs_navigation_bars.dart`.
///
/// The React demos take them from the bundled `ICONS` set. Flutter ships no
/// icon set outside Material, so the gallery draws its own, the way an app
/// hands `MPIcon` whatever its own set gave it. Each takes its size and colour
/// from the surrounding [IconTheme], as an [Icon] does.
class _NavigationGlyph extends StatelessWidget {
  const _NavigationGlyph({required this.trace});

  final void Function(Path path) trace;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _NavigationPainter(trace: trace, color: theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _NavigationPainter extends CustomPainter {
  const _NavigationPainter({required this.trace, required this.color});

  final void Function(Path path) trace;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path();
    trace(path);

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
  bool shouldRepaint(_NavigationPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.trace != trace;
  }
}

/// Two sheets, one over the other.
class CopyGlyph extends StatelessWidget {
  /// Creates the two sheets.
  const CopyGlyph({super.key});

  static void _trace(Path path) {
    path
      ..addRRect(RRect.fromLTRBR(9, 9, 20, 20, const Radius.circular(2)))
      ..moveTo(15, 9)
      ..lineTo(15, 6)
      ..arcToPoint(const Offset(13, 4), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(6, 4)
      ..arcToPoint(const Offset(4, 6), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(4, 13)
      ..arcToPoint(const Offset(6, 15), radius: const Radius.circular(2), clockwise: false)
      ..lineTo(9, 15);
  }

  @override
  Widget build(BuildContext context) => const _NavigationGlyph(trace: _trace);
}

/// Two links of a chain.
class LinkGlyph extends StatelessWidget {
  /// Creates the chain.
  const LinkGlyph({super.key});

  static void _trace(Path path) {
    path
      ..moveTo(10, 14)
      ..lineTo(14, 10)
      ..moveTo(11, 6.5)
      ..lineTo(13, 4.5)
      ..arcToPoint(const Offset(19.5, 11), radius: const Radius.circular(4.6))
      ..lineTo(17.5, 13)
      ..moveTo(13, 17.5)
      ..lineTo(11, 19.5)
      ..arcToPoint(const Offset(4.5, 13), radius: const Radius.circular(4.6))
      ..lineTo(6.5, 11);
  }

  @override
  Widget build(BuildContext context) => const _NavigationGlyph(trace: _trace);
}
