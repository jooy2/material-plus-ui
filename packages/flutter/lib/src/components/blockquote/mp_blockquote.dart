/// Somebody else's words, set apart from your own.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The quote itself, one step above body copy with the leading opened up.
///
/// `md` is `titleLarge`, 22px at weight 400, MD3's largest role that is not a
/// heading and exactly what a pull quote is. The leading is the role's, so a
/// quote that runs to four lines has the air a paragraph needs.
MPTypeRole _quoteRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.bodyMedium;
    case MPSize.sm:
      return scale.bodyLarge;
    case MPSize.md:
      return scale.titleLarge;
    case MPSize.lg:
      return scale.headlineSmall;
    case MPSize.xl:
      return scale.headlineMedium;
  }
}

/// The rule down the leading edge: 2px at every size, because it is a mark in
/// the margin rather than a part of the type.
const double _rule = 2;

/// The room between an unpainted quote's rule and its words.
const double _textInset = 16;

/// The quotation mark, against the quote's own type size.
const double _markScale = 2;

/// A quote, set apart from the words around it.
///
/// ```dart
/// const MPBlockquote(
///   author: Text('Ada Lovelace'),
///   source: Text('Notes on the Analytical Engine'),
///   child: Text('The Analytical Engine has no pretensions whatever to originate anything.'),
/// )
/// ```
///
/// A rule down the leading edge, which every variant keeps, and a quotation
/// mark above the words. With an [author] or a [source] an attribution is set
/// under the quote, kept apart from it: an attribution is *about* the quote and
/// is not part of what was said.
class MPBlockquote extends StatelessWidget {
  /// Creates a quote.
  const MPBlockquote({
    required this.child,
    this.variant = MPVariant.text,
    this.size,
    this.color,
    this.author,
    this.source,
    this.icon,
    super.key,
  }) : assert(icon == null || icon is Widget || icon == false, 'icon must be a Widget or false');

  /// What was said, usually a [Text].
  final Widget child;

  /// How much surface the quote paints behind the words.
  ///
  /// [MPVariant.text] is the default and the one that belongs in running
  /// prose: a rule in the margin and nothing else. [MPVariant.elevated] and
  /// [MPVariant.outlined] keep the sheet neutral, because a quote holds
  /// somebody else's words and words on a tinted panel are words on a
  /// background nobody chose them against. [MPVariant.filled] and
  /// [MPVariant.tonal] dye it anyway, which is what a pull quote in a brand
  /// colour is.
  final MPVariant variant;

  /// The type scale of the quote and the room around it. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the rule is drawn in and, on filled and tonal, the
  /// surface behind the words. [MPColor.primary] unless an [MPConfigProvider]
  /// says otherwise.
  final MPColor? color;

  /// Who said it, after an em dash.
  final Widget? author;

  /// Where it is from: a book, a talk, a page.
  final Widget? source;

  /// The mark drawn before the quote. Left out it is the house glyph, a widget
  /// replaces it, and `false` takes it away.
  final Object? icon;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(color ?? config?.color ?? MPColor.primary);
    final bool painted = variant != MPVariant.text;
    final MPTypeRole role = _quoteRole(theme.typescale, size);
    final _QuotePaint paint = _paintFor(colors, accent, variant);

    final Widget? mark = icon == false
        ? null
        : icon is Widget
        ? icon! as Widget
        : _QuoteMark(size: role.size * _markScale);

    final Widget quote = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        if (mark != null)
          // At 38%, the specification's opacity for content that is present but
          // not the subject, rather than in a second colour.
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: ExcludeSemantics(
              child: Opacity(
                opacity: MPStateOpacity.disabledContent,
                child: IconTheme.merge(
                  data: IconThemeData(size: role.size * _markScale, color: paint.ink),
                  child: mark,
                ),
              ),
            ),
          ),
        child,
      ],
    );

    final Widget? attributed = author == null
        ? null
        : Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: <Widget>[
              // An em dash, the way an attribution has been set since print,
              // and left out of the semantics tree, because "em dash" before a
              // name is reading the typography rather than the text.
              const ExcludeSemantics(child: Text('— ')),
              Flexible(
                child: DefaultTextStyle.merge(
                  style: const TextStyle(fontWeight: FontWeight.w500),
                  child: author!,
                ),
              ),
            ],
          );

    Widget body = quote;

    if (attributed != null || source != null) {
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          quote,
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: DefaultTextStyle.merge(
              // On a painted surface the caption takes the surface's ink, a
              // little quieter; on a bare one the supporting role, which is what
              // an attribution is next to the words it attributes.
              style: theme.typescale.bodySmall.style(
                painted ? paint.ink.withValues(alpha: paint.ink.a * 0.8) : colors.onSurfaceVariant,
              ),
              child: Wrap(
                spacing: 6,
                crossAxisAlignment: WrapCrossAlignment.end,
                children: <Widget>[?attributed, ?source],
              ),
            ),
          ),
        ],
      );
    }

    body = DefaultTextStyle.merge(style: role.style(paint.ink), child: body);

    final double pad = mpSheetPad[size]!;
    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;
    // A quote is never a pill, and the corners on the ruled edge stay square: a
    // rule that curves away from the text it marks is a bracket, not a margin.
    final BorderRadius radius = painted
        ? BorderRadiusDirectional.horizontal(
            end: Radius.circular(theme.shapes.medium),
          ).resolve(direction)
        : BorderRadius.zero;
    final double edge = paint.outlined ? 1 : 0;

    // The edges are painted over the sheet rather than as its border: Flutter
    // draws a rounded border only in one colour, and this one is the accent on
    // the ruled edge and `outlineVariant` round the other three. Their widths
    // are added to the padding, as a CSS border's are.
    return CustomPaint(
      foregroundPainter: _EdgePainter(
        rule: accent.color,
        outline: paint.outlined ? colors.outlineVariant : null,
        radius: radius,
        direction: direction,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          // Nothing at all rather than a clear fill, for the two variants that
          // have no sheet.
          color: paint.fill.a == 0 ? null : paint.fill,
          borderRadius: radius,
          boxShadow: paint.shadows,
        ),
        child: Padding(
          padding: painted
              ? EdgeInsetsDirectional.fromSTEB(_rule + pad, edge + pad, edge + pad, edge + pad)
              : const EdgeInsetsDirectional.only(start: _rule + _textInset),
          child: body,
        ),
      ),
    );
  }
}

/// The rule down the leading edge, and the hairline round the other three
/// sides of an outlined quote.
class _EdgePainter extends CustomPainter {
  const _EdgePainter({
    required this.rule,
    required this.outline,
    required this.radius,
    required this.direction,
  });

  final Color rule;
  final Color? outline;
  final BorderRadius radius;
  final TextDirection direction;

  @override
  void paint(Canvas canvas, Size size) {
    if (outline != null) {
      canvas.drawRRect(
        radius.toRRect(Offset.zero & size).deflate(0.5),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1
          ..color = outline!,
      );
    }

    // Over the hairline's leading side, which it replaces.
    final double start = direction == TextDirection.ltr ? 0 : size.width - _rule;

    canvas.drawRect(Rect.fromLTWH(start, 0, _rule, size.height), Paint()..color = rule);
  }

  @override
  bool shouldRepaint(_EdgePainter oldDelegate) {
    return oldDelegate.rule != rule ||
        oldDelegate.outline != outline ||
        oldDelegate.radius != radius ||
        oldDelegate.direction != direction;
  }
}

/// What a quote's sheet paints.
class _QuotePaint {
  const _QuotePaint({
    required this.fill,
    required this.ink,
    this.outlined = false,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final bool outlined;
  final List<BoxShadow> shadows;
}

_QuotePaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _QuotePaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _QuotePaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _QuotePaint(
        fill: colors.surfaceContainerLow,
        ink: colors.onSurface,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _QuotePaint(fill: const Color(0x00000000), ink: colors.onSurface, outlined: true);
    case MPVariant.text:
      return _QuotePaint(fill: const Color(0x00000000), ink: colors.onSurface);
  }
}

/// The quotation mark: a pair of commas turned up, drawn rather than typed.
///
/// A real `“` would be set in whatever face the app uses and change shape,
/// weight and baseline with it, and at twice the quote's size it is the
/// largest single glyph in the component. This is one drawing at one weight,
/// in the 16-unit box the React package's SVG uses.
class _QuoteMark extends StatelessWidget {
  const _QuoteMark({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);

    return CustomPaint(
      size: Size.square(theme.size ?? size),
      painter: _QuoteMarkPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _QuoteMarkPainter extends CustomPainter {
  const _QuoteMarkPainter(this.color);

  final Color color;

  static Path _comma(double dx) {
    return Path()
      ..moveTo(6.4 + dx, 3.6)
      ..cubicTo(4.1 + dx, 4.5, 2.7 + dx, 6.4, 2.7 + dx, 8.7)
      ..cubicTo(2.7 + dx, 10.7, 3.9 + dx, 12, 5.5 + dx, 12)
      ..cubicTo(6.9 + dx, 12, 8 + dx, 11, 8 + dx, 9.6)
      ..cubicTo(8 + dx, 8.3, 7.1 + dx, 7.4, 5.9 + dx, 7.4)
      ..cubicTo(5.7 + dx, 7.4, 5.5 + dx, 7.4, 5.3 + dx, 7.5)
      ..cubicTo(5.6 + dx, 6.5, 6.4 + dx, 5.7, 7.5 + dx, 5.2)
      ..close();
  }

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;

    canvas
      ..save()
      ..scale(size.shortestSide / 16)
      ..drawPath(_comma(0), paint)
      ..drawPath(_comma(6.9), paint)
      ..restore();
  }

  @override
  bool shouldRepaint(_QuoteMarkPainter oldDelegate) => oldDelegate.color != color;
}
