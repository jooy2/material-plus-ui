/// What stands where content would have been.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The room above and below the state, and its own ladder rather than the
/// sheet padding's: 20, 24, 32, 40, 48.
///
/// A sheet is padded so its content does not touch the edge; an empty state is
/// padded so the emptiness reads as *deliberate*. Given a sheet's 16px an `md`
/// one comes out the height of three lines of text, which looks like a
/// paragraph that failed to load rather than an answer to a question.
const Map<MPSize, double> _padY = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 24,
  MPSize.md: 32,
  MPSize.lg: 40,
  MPSize.xl: 48,
};

/// The glyph's size: 24, 28, 36, 44, 52.
///
/// A long way above the size an icon rides a label at, because this one is
/// not riding anything: it is the first thing in an otherwise empty rectangle.
const Map<MPSize, double> _glyph = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 28,
  MPSize.md: 36,
  MPSize.lg: 44,
  MPSize.xl: 52,
};

/// How many ems of the prose role the text block may run to: the React
/// build's `max-w-prose`, 65 characters, at the width a digit is set at.
const double _measure = 36;

/// What stands where content would have been: a glyph, a headline, a sentence
/// and a way out.
///
/// ```dart
/// MPEmpty(
///   title: const Text('No results'),
///   action: MPButton(onPressed: clear, child: const Text('Clear filters')),
///   child: const Text('Try a shorter term, or widen the date range.'),
/// )
/// ```
///
/// It is the other half of `MPSkeleton`. A skeleton is the shape of something
/// on its way; this is the shape of something that is not coming: a search
/// with no matches, an inbox nobody has written to, a folder before the first
/// file. The two are never both right at once, and a list that shows neither
/// has a blank rectangle where its answer should be.
///
/// The headline is defaulted rather than required for one reason: the
/// version that says nothing useful is the version that gets shipped. "Nothing
/// here" is a floor, and every slot above it is there to be filled with what
/// is actually missing.
///
/// ## No `color`
///
/// Deliberately absent. An empty state in the accent colour is making a claim
/// about content that does not exist; the way to say "this is a problem" is an
/// `MPColor.error` button in [action], which is the thing that can actually be
/// pressed about it.
class MPEmpty extends StatelessWidget {
  /// Creates an empty state.
  const MPEmpty({
    this.child,
    this.title,
    this.showTitle = true,
    this.icon,
    this.showIcon = true,
    this.action,
    this.variant = MPVariant.text,
    this.size,
    this.liveRegion = true,
    this.locale,
    super.key,
  });

  /// The sentence under the headline: why it is empty, or what to do next.
  final Widget? child;

  /// The headline. Left out, the words for "nothing here" in [locale].
  final Widget? title;

  /// Whether a headline is drawn at all, for a state that is a glyph and a
  /// sentence with no heading over them.
  final bool showTitle;

  /// The glyph above the headline. Left out, the empty tray: drawn here
  /// rather than taken from an icon set because it is the one glyph that has
  /// to sit over every *reason* a thing is empty. A folder, a magnifying glass
  /// and a document each name one.
  ///
  /// An icon is drawn at the state's glyph size through [IconTheme]; a picture
  /// keeps whatever size it was given.
  final Widget? icon;

  /// Whether a glyph is drawn at all.
  final bool showIcon;

  /// What to do about it, under the text: a "Create the first one" button, a
  /// "Clear filters" link. A [Row] of several sits centred; give a [Wrap] for
  /// a set that should wrap together.
  final Widget? action;

  /// How much surface the state paints.
  ///
  /// [MPVariant.text] is the default here and on nothing else in the library.
  /// An empty state is nearly always already inside something, a card's body,
  /// a table below its header, a panel, and a second rectangle drawn inside
  /// the first is one rectangle too many. The other four are for the case
  /// where it is not.
  final MPVariant variant;

  /// The room the state takes and the scale of everything in it.
  final MPSize? size;

  /// Whether the state is announced when it appears.
  ///
  /// A list that empties under the reader has to say so, and it has no other
  /// way to: nothing was removed from the page, something was added to it.
  /// Announced politely, because "no results" is the answer to a question that
  /// was just asked. `false` for a state that is simply part of the screen on
  /// arrival: the React build's `role={undefined}`.
  final bool liveRegion;

  /// Which language the default headline is written in. Falls back to the
  /// nearest `MPLocaleProvider`, then to the app's locale, then to English.
  ///
  /// It matters more here than anywhere else in the library: this is the one
  /// invented string that is **drawn** rather than only read out.
  final String? locale;

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTypeRole prose = mpProseText(theme.typescale, size);
    final double gap = mpSheetGap[size]!;

    final Widget? heading = !showTitle
        ? null
        : title ?? Text(mpMessagesOf(context, mpEmptyMessages, locale: locale)['title']!);
    final bool titled = heading != null;

    final List<Widget> words = <Widget>[
      if (heading != null)
        DefaultTextStyle.merge(style: mpSheetTitle(theme.typescale, size).style(), child: heading),
      if (child != null)
        // The detail is supporting text under a headline, so it takes
        // `onSurfaceVariant`, the role a field's description takes. Without a
        // headline it *is* the state, and stays reading text.
        DefaultTextStyle.merge(
          style: prose.style(titled ? colors.onSurfaceVariant : null),
          child: child!,
        ),
    ];

    final List<Widget> parts = <Widget>[
      if (showIcon)
        IconTheme.merge(
          data: IconThemeData(color: colors.onSurfaceVariant, size: _glyph[size]),
          child: icon ?? const _Tray(),
        ),
      if (words.isNotEmpty)
        // A measure and nothing narrower: an empty state is centred, and a
        // centred sentence running the full width of a page is one whose
        // second line starts somewhere the eye has to hunt for.
        ConstrainedBox(
          constraints: BoxConstraints(maxWidth: prose.size * _measure),
          child: Column(mainAxisSize: MainAxisSize.min, children: _spaced(words, gap)),
        ),
      ?action,
    ];

    final MPContainerPaint paint = mpContainerPaint(colors, variant);
    final BorderRadius radius = variant == MPVariant.text
        ? BorderRadius.zero
        : BorderRadius.circular(theme.shapes.medium);

    final Widget state = Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: mpSheetPad[size]!, vertical: _padY[size]!),
      // The sheet stays neutral even on `filled`, because `action` is
      // somebody else's button and it arrived with its own colours.
      decoration: paint.decoration(radius),
      child: DefaultTextStyle.merge(
        style: prose.style(colors.onSurface),
        textAlign: TextAlign.center,
        child: Column(mainAxisSize: MainAxisSize.min, children: _spaced(parts, gap)),
      ),
    );

    return Semantics(container: true, liveRegion: liveRegion ? true : null, child: state);
  }
}

/// [parts] with [gap] between each pair.
List<Widget> _spaced(List<Widget> parts, double gap) {
  return <Widget>[
    for (int index = 0; index < parts.length; index += 1) ...<Widget>[
      if (index > 0) SizedBox(height: gap),
      parts[index],
    ],
  ];
}

/// The tray with nothing in it.
///
/// The lip is a separate stroke, so what the drawing shows is a container
/// with an opening and no contents rather than a solid block. The React
/// package's 16-unit drawing, point for point.
class _Tray extends StatelessWidget {
  const _Tray();

  @override
  Widget build(BuildContext context) {
    final IconThemeData icon = IconTheme.of(context);
    final double side = icon.size ?? 24;

    return ExcludeSemantics(
      child: CustomPaint(
        size: Size.square(side),
        painter: _TrayPainter(icon.color ?? const Color(0xFF000000)),
      ),
    );
  }
}

class _TrayPainter extends CustomPainter {
  const _TrayPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.shortestSide / 16);

    const Radius corner = Radius.circular(1.5);
    final Paint stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;

    final Path lip = Path()
      ..moveTo(1.75, 9.75)
      ..lineTo(4.75, 9.75)
      ..lineTo(5.65, 11.35)
      ..lineTo(10.35, 11.35)
      ..lineTo(11.25, 9.75)
      ..lineTo(14.25, 9.75);

    final Path tray = Path()
      ..moveTo(1.75, 9.75)
      ..lineTo(3.85, 3.75)
      ..arcToPoint(const Offset(5.27, 2.75), radius: corner)
      ..lineTo(10.73, 2.75)
      ..arcToPoint(const Offset(12.15, 3.75), radius: corner)
      ..lineTo(14.25, 9.75)
      ..lineTo(14.25, 11.75)
      ..arcToPoint(const Offset(12.75, 13.25), radius: corner)
      ..lineTo(3.25, 13.25)
      ..arcToPoint(const Offset(1.75, 11.75), radius: corner)
      ..close();

    canvas
      ..drawPath(lip, stroke)
      ..drawPath(tray, stroke);
  }

  @override
  bool shouldRepaint(_TrayPainter oldDelegate) => oldDelegate.color != color;
}
