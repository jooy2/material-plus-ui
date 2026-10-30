/// A product's mark, at a known size, that is never an empty box.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How an [MPAppLogo] frames its artwork.
enum MPAppLogoShape {
  /// No tile: the artwork at its own proportions, or the name set as a
  /// logotype. The default.
  bare,

  /// A square tile with the theme's corner, the way an app icon sits.
  app,

  /// A round tile.
  circle,
}

/// The logotype, the name when the name is the whole logo.
///
/// Its own ladder rather than a step off the type scale, because this is not
/// type: roughly 55% of the mark's height at every rung is where a word set in
/// the app's own face reads as a mark rather than as a bold sentence.
const Map<MPSize, double> _logotype = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 17,
  MPSize.lg: 22,
  MPSize.xl: 26,
};

/// The letter on a tile, larger than an avatar's initials at the same rung.
/// An avatar's initials stand in for a face and are read as letters; an app
/// icon's letter *is* the icon, drawn to fill the tile the way a glyph would.
const Map<MPSize, double> _tileLetter = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 17,
  MPSize.lg: 21,
  MPSize.xl: 25,
};

/// How much of a tile the artwork takes when [MPAppLogo.padded], the way an
/// app icon's glyph is held off its own corners.
const double _inset = 0.72;

/// The tile's corner: MD3's own sizes, which stop climbing at `md` because past
/// 12px on a box this small the corners meet and `app` and `circle` stop
/// looking different.
double _tileRadius(MPShapes shapes, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return shapes.extraSmall;
    case MPSize.sm:
      return shapes.small;
    case MPSize.md:
    case MPSize.lg:
    case MPSize.xl:
      return shapes.medium;
  }
}

/// The first character of the first word, plus the first of the last, split
/// into runes so a character outside the basic plane is not cut in half.
String _initialsOf(String name) {
  final List<String> words = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((String word) => word.isNotEmpty)
      .toList();

  if (words.isEmpty) {
    return '';
  }

  String head(String word) => String.fromCharCode(word.runes.first);

  return (head(words.first) + (words.length > 1 ? head(words.last) : '')).toUpperCase();
}

/// A product's mark, at a known size, that is never an empty box.
///
/// ```dart
/// MPAppLogo(name: 'Acme', shape: MPAppLogoShape.app, showName: true, onPressed: goHome)
/// ```
///
/// Four things can be the mark and exactly one of them is at a time: a widget
/// handed to [child], an [image], the initials of [name] on a tile, or, with no
/// tile to put them on, the name itself set as the logotype. The last is the
/// point: a product that has not drawn a logo yet still has one, and swapping
/// in the real file later is one parameter.
///
/// The name is said exactly once. A logotype *is* the name; a picture or a
/// glyph is named by it; and whenever the words are drawn beside the mark, the
/// mark becomes decoration rather than a second reading of the same thing.
class MPAppLogo extends StatelessWidget {
  /// Creates a logo.
  const MPAppLogo({
    this.image,
    this.semanticLabel,
    this.name,
    this.initials,
    this.showName = false,
    this.shape = MPAppLogoShape.bare,
    this.variant = MPVariant.filled,
    this.size,
    this.color,
    this.padded = true,
    this.height,
    this.onPressed,
    this.href,
    this.focusNode,
    this.autofocus = false,
    this.child,
    super.key,
  });

  /// The artwork, as a picture. Beaten by [child].
  final ImageProvider<Object>? image;

  /// What the artwork says for a reader who cannot see it. React's `alt`.
  /// Defaults to [name], which is almost always right: a logo means the
  /// product.
  final String? semanticLabel;

  /// The product's name: it names the artwork, its initials are what a tile
  /// falls back to, and it is drawn as the logotype when there is no artwork.
  final String? name;

  /// The initials on a tile, written out, for when the rule derived the wrong
  /// ones.
  final String? initials;

  /// Draws the name beside the artwork, as the words half of a lockup. Ignored
  /// when the name is already the whole logo, which is what a bare logo with no
  /// artwork is.
  final bool showName;

  /// How the artwork is framed. See [MPAppLogoShape].
  final MPAppLogoShape shape;

  /// How much surface the tile paints. Nothing at all on
  /// [MPAppLogoShape.bare], which draws no tile.
  final MPVariant variant;

  /// How tall the mark is: the control heights, so a logo and the button
  /// beside it in a header line up. [MPSize.md] unless an [MPConfigProvider]
  /// says otherwise.
  final MPSize? size;

  /// Which accent family the tile reads. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise.
  final MPColor? color;

  /// Insets the artwork from the tile's edge. Turn it off for a mark drawn to
  /// fill the tile. No effect on a bare logo or on a tile showing initials.
  final bool padded;

  /// An exact height for the mark, overriding [size]. A brand's artwork is
  /// drawn at a height somebody chose, and rounding it to a rung of a ladder is
  /// how a logo ends up half a pixel off the type beside it.
  final double? height;

  /// Makes the whole lockup a link, run by pointer or by <kbd>Enter</kbd>. A
  /// logo in a header is nearly always the way back to the first screen.
  final VoidCallback? onPressed;

  /// Where the link goes, as a URL, told to assistive technology. Not opened
  /// by the logo itself; [onPressed] does that.
  final String? href;

  /// Drives the link's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// The artwork, as a widget: a drawing, an `Icon`, an SVG from a package.
  /// Sized to the mark's height, and coloured through [IconTheme] and
  /// [DefaultTextStyle] like an icon.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(color ?? config?.color ?? MPColor.primary);
    final double box = height ?? mpControlHeight[size]!;
    final bool tile = shape != MPAppLogoShape.bare;
    final bool hasArtwork = child != null || image != null;

    // With no artwork the name *is* the mark: the logotype on a bare logo, its
    // initials on a tile.
    final bool logotype = !hasArtwork && !tile;
    final bool drawName = showName && !logotype && name != null;
    final String? label = semanticLabel ?? name;
    final String letters = initials ?? (name == null ? '' : _initialsOf(name!));

    final _LogoPaint paint = _paintFor(colors, accent, variant);
    final Color ink = tile ? paint.ink : colors.onSurface;
    final double artwork = tile && padded ? box * _inset : box;

    Widget mark;

    if (child != null) {
      mark = SizedBox(
        height: artwork,
        child: IconTheme.merge(
          data: IconThemeData(color: ink, size: artwork),
          child: DefaultTextStyle.merge(
            style: TextStyle(color: ink),
            child: FittedBox(child: child),
          ),
        ),
      );
    } else if (image != null) {
      mark = Image(
        image: image!,
        height: artwork,
        fit: BoxFit.contain,
        // Named once, by the `Semantics` below.
        excludeFromSemantics: true,
      );
    } else {
      mark = Text(
        logotype ? name ?? '' : letters,
        maxLines: 1,
        softWrap: false,
        style: TextStyle(
          color: ink,
          fontSize: logotype ? _logotype[size] : _tileLetter[size],
          fontWeight: FontWeight.w600,
          height: 1,
          letterSpacing: -0.025 * (logotype ? _logotype[size]! : _tileLetter[size]!),
        ),
      );
    }

    if (tile) {
      final BorderRadius radius = shape == MPAppLogoShape.circle
          ? BorderRadius.circular(box / 2)
          : BorderRadius.circular(_tileRadius(theme.shapes, size));

      mark = Container(
        width: box,
        height: box,
        alignment: Alignment.center,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: paint.fill,
          borderRadius: radius,
          border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
          boxShadow: paint.shadows,
        ),
        child: mark,
      );
    } else {
      mark = SizedBox(
        height: box,
        child: Center(widthFactor: 1, child: mark),
      );
    }

    // A logotype speaks for itself; anything else is named once, here, unless
    // the name is drawn beside it, in which case the drawn name is what is read
    // and the mark is decoration.
    if (!logotype) {
      mark = drawName || label == null
          ? ExcludeSemantics(child: mark)
          : Semantics(
              container: true,
              image: image != null && child == null,
              label: label,
              child: ExcludeSemantics(child: mark),
            );
    }

    Widget content = mark;

    if (drawName) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        spacing: mpControlGap[size]!,
        children: <Widget>[
          mark,
          Flexible(
            child: Text(
              name!,
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: colors.onSurface,
                fontSize: _logotype[size],
                fontWeight: FontWeight.w600,
                height: 1,
                leadingDistribution: TextLeadingDistribution.even,
              ),
            ),
          ),
        ],
      );
    }

    if (onPressed == null && href == null) {
      return content;
    }

    return MPInteractive(
      onTap: onPressed,
      enabled: onPressed != null,
      interactive: onPressed != null,
      pressable: onPressed != null,
      focusNode: focusNode,
      autofocus: autofocus,
      cursor: onPressed != null ? SystemMouseCursors.click : MouseCursor.defer,
      // A link, not a button: Enter follows it, and Space scrolls.
      shortcuts: MPInteractive.enterOnly,
      builder: (BuildContext context, MPInteraction state) {
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
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(
                    color: colors.secondary,
                    borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
                  )
                : null,
            child: content,
          ),
        );
      },
    );
  }
}

/// What a tile paints.
class _LogoPaint {
  const _LogoPaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

/// The five weights. A logo tile *is* the thing being coloured, as a chip, a
/// badge and an avatar are, so it takes the tint. [MPVariant.filled] is the
/// default: a product has one logo on the screen, and an app icon that is not
/// filled is not an app icon.
_LogoPaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _LogoPaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _LogoPaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _LogoPaint(
        fill: colors.surfaceContainerLow,
        ink: accent.color,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _LogoPaint(
        fill: const Color(0x00000000),
        ink: accent.color,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _LogoPaint(fill: const Color(0x00000000), ink: colors.onSurfaceVariant);
  }
}
