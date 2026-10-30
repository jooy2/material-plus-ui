/// A link, in a sentence or on its own.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// When an [MPTextLink]'s underline is drawn.
enum MPTextLinkUnderline {
  /// Always, and the default.
  always,

  /// Only under the pointer.
  hover,

  /// Never: position or colour is saying what it is.
  none,
}

/// How strong the underline is at rest, against the text's own colour. It goes
/// to the full colour under the pointer, so one rule works on an inherited
/// colour and on an accent one.
const double _underlineRest = 0.45;

/// How much heavier than the font's own underline the line is drawn. React
/// draws it at 0.08em; Flutter scales the font's thickness instead, which is
/// about 0.06em in the faces the library is set in.
const double _underlineWeight = 1.3;

/// The mark after the label, against the label's size: just under its cap
/// height, so the words around it are not spaced apart.
const double _markScale = 0.95;

/// A link, in a sentence or on its own.
///
/// ```dart
/// MPTextLink(onPressed: openColours, child: const Text('the colour page'))
/// ```
///
/// Everything about it is deliberately smaller than a button. It has no
/// surface, no height of its own and no colour unless asked; what it has is a
/// line under it, the one mark a reader already knows means "this goes
/// somewhere". It is announced as a link, not as a button, and activated with
/// <kbd>Enter</kbd> alone, as a link is on the web.
///
/// Flutter has no address bar and no default navigation, so going somewhere is
/// [onPressed]'s job: push a route, or hand [href] to `url_launcher`.
class MPTextLink extends StatelessWidget {
  /// Creates a link.
  const MPTextLink({
    required this.child,
    this.onPressed,
    this.href,
    this.underline = MPTextLinkUnderline.always,
    this.color,
    this.size,
    this.newTab = false,
    this.icon,
    this.newTabLabel,
    this.locale,
    this.focusNode,
    this.autofocus = false,
    super.key,
  }) : assert(icon == null || icon is bool || icon is Widget, 'icon must be a bool or a Widget');

  /// The label, usually a [Text].
  final Widget child;

  /// Runs when the link is activated, by pointer or by <kbd>Enter</kbd>. This
  /// is what goes somewhere.
  final VoidCallback? onPressed;

  /// Where the link goes, as a URL. Not opened by the link itself: it is told
  /// to assistive technology, and on the web the engine writes it into the link
  /// it renders for a screen reader.
  final String? href;

  /// When the underline is drawn.
  final MPTextLinkUnderline underline;

  /// Which accent family the link reads. Like `MPTypography` and unlike every
  /// control in the library this has **no default**: a link in a paragraph is
  /// usually the paragraph's own colour with a line under it.
  final MPColor? color;

  /// The type scale. Also no default: a link inside a sentence is the size of
  /// the sentence. Set it for a link that stands on its own.
  final MPSize? size;

  /// Marks the link as one that leaves the app or opens a new window: draws the
  /// arrow leaving its box after the label and tells a screen reader so.
  ///
  /// A window changing under the reader is the one thing about a link that
  /// cannot be seen before it happens. Opening it is still [onPressed]'s job.
  final bool newTab;

  /// The mark after the label: `true` draws the arrow leaving its box when
  /// [newTab] is on and the chain otherwise, `false` draws nothing, and a
  /// widget replaces the glyph. Left out, it follows [newTab].
  final Object? icon;

  /// What a screen reader hears after the label when [newTab] is on. Defaults
  /// to the wording in [locale].
  final String? newTabLabel;

  /// Which language that wording is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle inherited = DefaultTextStyle.of(context).style;
    final TextStyle? scale = size == null ? null : mpProseText(theme.typescale, size!).style();
    final Color ink = color == null
        ? inherited.color ?? theme.colors.onSurface
        : theme.colors.accent(color!).color;
    final double fontSize = scale?.fontSize ?? inherited.fontSize ?? 14;
    final Object mark = icon ?? newTab;
    final String? spoken = newTab
        ? newTabLabel ?? mpMessagesOf(context, mpTextLinkMessages, locale: locale)['newTab']!
        : null;

    return MPInteractive(
      onTap: onPressed,
      enabled: onPressed != null,
      interactive: onPressed != null,
      pressable: onPressed != null,
      focusNode: focusNode,
      autofocus: autofocus,
      cursor: onPressed != null ? SystemMouseCursors.click : MouseCursor.defer,
      // Not a button: a link goes somewhere, and Space scrolls the page there.
      shortcuts: MPInteractive.enterOnly,
      builder: (BuildContext context, MPInteraction state) {
        final bool lined =
            underline == MPTextLinkUnderline.always ||
            (underline == MPTextLinkUnderline.hover && state.hovered);
        final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

        // Hover leaves the text colour alone and strengthens the line instead:
        // a link in running prose that changes colour under the pointer drags
        // the reader's eye off the line they were reading.
        Widget label = TweenAnimationBuilder<double>(
          tween: Tween<double>(end: state.hovered ? 1 : _underlineRest),
          duration: still ? Duration.zero : MPMotion.short4,
          curve: MPMotion.standard,
          child: child,
          builder: (BuildContext context, double strength, Widget? child) {
            return DefaultTextStyle.merge(
              style: (scale ?? const TextStyle()).copyWith(
                color: ink,
                decoration: lined ? TextDecoration.underline : TextDecoration.none,
                decorationThickness: _underlineWeight,
                decorationColor: ink.withValues(alpha: ink.a * strength),
              ),
              child: child!,
            );
          },
        );

        if (mark != false) {
          final double glyph = fontSize * _markScale;

          label = Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Flexible(child: label),
              SizedBox(width: fontSize * 0.25),
              ExcludeSemantics(
                child: IconTheme.merge(
                  data: IconThemeData(color: ink, size: glyph),
                  child: mark is Widget
                      ? mark
                      : MPGlyph(
                          newTab ? MPGlyphShape.externalLink : MPGlyphShape.link,
                          size: glyph,
                          color: ink,
                        ),
                ),
              ),
            ],
          );
        }

        label = CustomPaint(
          foregroundPainter: state.focusVisible
              ? MPFocusRingPainter(
                  color: theme.colors.secondary,
                  borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
                )
              : null,
          child: label,
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          link: true,
          linkUrl: href == null ? null : Uri.tryParse(href!),
          enabled: onPressed != null,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          // Drawn for nobody and read to everybody: the arrow says "new tab"
          // only to a reader who can see it.
          hint: spoken,
          child: label,
        );
      },
    );
  }
}
