import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A drawing of your own that reads its size and colour off the [IconTheme],
/// the way an icon set's widget does: it is handed both.
class _SpiralGlyph extends StatelessWidget {
  const _SpiralGlyph();

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? 24),
      painter: _SpiralPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _SpiralPainter extends CustomPainter {
  const _SpiralPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.shortestSide / 24)
      ..drawPath(
        Path()
          ..moveTo(12, 3)
          ..arcToPoint(const Offset(3, 12), radius: const Radius.circular(9), largeArc: true)
          ..arcToPoint(const Offset(10, 5), radius: const Radius.circular(7))
          ..arcToPoint(const Offset(15, 10), radius: const Radius.circular(5))
          ..arcToPoint(const Offset(12, 13), radius: const Radius.circular(3)),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6
          ..strokeCap = StrokeCap.round
          ..color = color,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_SpiralPainter oldDelegate) => oldDelegate.color != color;
}

/// A drawing that is already drawn: a fixed 24-unit picture that reads
/// nothing, so the box scales it.
class _AddMark extends StatelessWidget {
  const _AddMark();

  @override
  Widget build(BuildContext context) {
    // The colour is taken once, here, the way an SVG's `currentColor` is; the
    // size is not taken at all.
    final Color color = DefaultTextStyle.of(context).style.color ?? const Color(0xFF000000);

    return FittedBox(
      child: CustomPaint(size: const Size.square(24), painter: _AddPainter(color)),
    );
  }
}

class _AddPainter extends CustomPainter {
  const _AddPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeCap = StrokeCap.round
      ..color = color;

    canvas
      ..drawRRect(
        RRect.fromRectAndRadius(const Rect.fromLTWH(4, 4, 16, 16), const Radius.circular(4)),
        stroke,
      )
      ..drawLine(const Offset(9, 12), const Offset(15, 12), stroke)
      ..drawLine(const Offset(12, 9), const Offset(12, 15), stroke);
  }

  @override
  bool shouldRepaint(_AddPainter oldDelegate) => oldDelegate.color != color;
}

class IconCustom extends StatelessWidget {
  const IconCustom({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle caption = theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant);

    return DefaultTextStyle.merge(
      style: TextStyle(color: theme.colors.onSurface),
      child: IconTheme.merge(
        data: IconThemeData(color: theme.colors.onSurface),
        child: Wrap(
          spacing: 32,
          runSpacing: 24,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            Column(
              mainAxisSize: MainAxisSize.min,
              spacing: 8,
              children: <Widget>[
                const MPIcon(icon: _SpiralGlyph(), size: 28, label: 'Spiral'),
                Text('component', style: caption),
              ],
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              spacing: 8,
              children: <Widget>[
                // Already drawn, so nothing is passed into it: the box scales it.
                const MPIcon(icon: _AddMark(), size: 28, label: 'Add'),
                Text('element', style: caption),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
