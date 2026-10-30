/// A sheet with the parts a card is made of laid out on it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A sheet with the parts a card is made of laid out on it: a picture, a
/// heading, a subheading, a body and a footer.
///
/// ```dart
/// MPCard(
///   variant: MPVariant.elevated,
///   title: const Text('Weekly digest'),
///   subtitle: const Text('Sent every Monday at 09:00'),
///   footer: MPButton(onPressed: send, child: const Text('Send now')),
///   child: const Text('Forty-two people opened the last one.'),
/// )
/// ```
///
/// The sections are parameters rather than sub-widgets, for the reason the
/// React package gives: the arrangement of a card is fixed (media, headline,
/// subhead, body, actions, MD3's own anatomy), and what a caller decides is
/// what goes in each slot, not what order the slots come in. A slot left empty
/// draws nothing: no wrapper, no padding, no gap.
///
/// ## The surface is MD3's card
///
/// `medium` corners, and three of the five variants are the specification's
/// card variants to the letter: [MPVariant.filled] is
/// `surfaceContainerHighest`, [MPVariant.elevated] is `surfaceContainerLow`
/// under a level-1 shadow, [MPVariant.outlined] is a hairline in
/// `outlineVariant`. None of them is dyed and there is no `color`: what a card
/// holds is somebody else's content, and it arrived with its own colours.
///
/// ## Not pressable
///
/// A card with a heading, a body and buttons in its footer that is also one
/// big target is a control containing controls. Make the heading pressable, or
/// give the footer a button.
class MPCard extends StatelessWidget {
  /// Creates a card.
  const MPCard({
    this.child,
    this.title,
    this.headingLevel,
    this.subtitle,
    this.headerAction,
    this.media,
    this.footer,
    this.dividers = false,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    super.key,
  }) : assert(
         headingLevel == null || (headingLevel >= 1 && headingLevel <= 6),
         'headingLevel must be between 1 and 6',
       );

  /// The card's body, set in the prose role of [size].
  final Widget? child;

  /// The card's heading, set in the sheet's title role.
  ///
  /// Styled as a title and not announced as a heading unless [headingLevel]
  /// says where it sits in the screen's outline.
  final Widget? title;

  /// The title's depth in the screen's outline, `1` to `6`.
  ///
  /// The React card takes a heading element in `title` for this; a Flutter
  /// widget has no tag, so the level is a parameter beside it. Left out, a
  /// screen of cards is not a screen of headings in whatever order they
  /// happen to build, which is an outline nobody wrote.
  final int? headingLevel;

  /// A second line under the title, `bodySmall` in `onSurfaceVariant`.
  final Widget? subtitle;

  /// Content pinned to the end of the header row: a menu button, a status
  /// chip. It stays on the title's first line while the title wraps beside it.
  final Widget? headerAction;

  /// A picture, a chart, a map, drawn edge to edge across the top so the
  /// card's own corners crop it.
  ///
  /// A slot of its own rather than part of [child] because it is the one part
  /// of a card that must not be padded. The card only clips when it is given
  /// one: a clip on every card would shave the focus ring off a control
  /// sitting against the sheet's edge, for no gain.
  final Widget? media;

  /// The bottom area, laid out as a wrapping row with an 8px gap.
  ///
  /// One widget, so a footer with two buttons brings its own [Wrap] or [Row].
  /// The React card lays out a fragment of children for you; there is no
  /// fragment here to lay out.
  final Widget? footer;

  /// Draws a hairline between the sections instead of separating them with
  /// space.
  ///
  /// The rules run the full width of the sheet, so the padding moves off the
  /// card and onto each section. There is never a rule above the first
  /// section, or under the media, which is already the break.
  final bool dividers;

  /// How much surface the sheet paints. [MPVariant.outlined] by default.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`.
  ///
  /// A level moves the tone as well as the shadow, as MD3 pairs them; given
  /// one, [variant] is left holding only its hairline.
  final MPElevation? elevation;

  /// The room inside, and the type scale of the title and the body. Unlike a
  /// control, `size` sets no height: a card is as tall as what it holds.
  final MPSize? size;

  /// Takes room out of the padding, 2px a face per step.
  final MPDensity? density;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final double pad = mpSheetPadOf(size, density);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(colors, variant, elevation: elevation);

    final List<Widget> sections = <Widget>[
      if (title != null || subtitle != null || headerAction != null) _header(theme, size),
      if (child != null)
        DefaultTextStyle.merge(style: mpProseText(theme.typescale, size).style(), child: child!),
      if (footer != null)
        Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[footer!],
        ),
    ];

    final BorderSide rule = BorderSide(color: colors.outlineVariant);

    Widget? body;

    if (sections.isNotEmpty) {
      // With dividers the lines have to reach both edges, so the sheet gives up
      // its padding and every section takes it on instead. Without them the
      // sheet keeps the vertical track and the sections are told apart by a
      // gap, the same trade a dialog makes.
      body = Padding(
        padding: EdgeInsets.symmetric(vertical: dividers ? 0 : pad),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: dividers ? 0 : mpSheetGap[size]!,
          children: <Widget>[
            for (int index = 0; index < sections.length; index += 1)
              DecoratedBox(
                decoration: BoxDecoration(border: dividers && index > 0 ? Border(top: rule) : null),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: pad, vertical: dividers ? pad : 0),
                  child: sections[index],
                ),
              ),
          ],
        ),
      );
    }

    final Widget content = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[?media, ?body],
    );

    // The hairline is inside the box, as CSS's `border-box` puts it, so an
    // outlined card and a filled one beside it hold their content at the same
    // inset rather than a pixel apart.
    final double hairline = paint.border?.width ?? 0;

    return DecoratedBox(
      decoration: paint.decoration(radius),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        child: DefaultTextStyle.merge(
          style: TextStyle(color: colors.onSurface),
          child: media == null
              ? content
              : ClipRRect(
                  // The inner edge of the hairline, so the picture's corners
                  // meet the border rather than covering it.
                  borderRadius: radius - BorderRadius.circular(hairline),
                  child: content,
                ),
        ),
      ),
    );
  }

  Widget _header(MPThemeData theme, MPSize size) {
    final MPColorScheme colors = theme.colors;
    final bool heading = headingLevel != null;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        if (title != null || subtitle != null)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (title != null)
                  DefaultTextStyle.merge(
                    style: mpSheetTitle(theme.typescale, size).style(),
                    child: Semantics(
                      header: heading ? true : null,
                      headingLevel: heading ? headingLevel : null,
                      child: title!,
                    ),
                  ),
                if (subtitle != null)
                  DefaultTextStyle.merge(
                    style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                    child: subtitle!,
                  ),
              ],
            ),
          )
        else
          const Spacer(),
        ?headerAction,
      ],
    );
  }
}
