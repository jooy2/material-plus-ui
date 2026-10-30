/// How a Material Plus widget finds its colours, type and corners.
///
/// There is deliberately nothing to install. An [MPButton] dropped into an app
/// with no theme anywhere above it works, and works in the right scheme,
/// because [MPTheme.of] falls back to the default source colour at the
/// platform's own brightness. A theme is what you reach for to *change* that:
/// a brand colour, a section forced dark, a sharper set of corners. It is the
/// Flutter spelling of setting `--mp-source-color` or `data-mp-scheme` on an
/// element in the React package, and it scopes the same way: to the subtree.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// Everything a component reads from the theme, resolved.
@immutable
class MPThemeData {
  /// Creates a resolved theme.
  const MPThemeData({
    required this.colors,
    this.typescale = MPTypescale.material,
    this.shapes = MPShapes.material,
  });

  /// The default theme for [brightness]: the default source colour, MD3's type
  /// scale and its corners.
  factory MPThemeData.fallback([Brightness brightness = Brightness.light]) {
    return brightness == Brightness.dark ? _darkFallback : _lightFallback;
  }

  static final MPThemeData _lightFallback = MPThemeData(
    colors: MPColorScheme.fromSource(brightness: Brightness.light),
  );

  static final MPThemeData _darkFallback = MPThemeData(
    colors: MPColorScheme.fromSource(brightness: Brightness.dark),
  );

  /// The colour roles.
  final MPColorScheme colors;

  /// The type scale.
  final MPTypescale typescale;

  /// The corner ladder.
  final MPShapes shapes;

  /// Which scheme the colours are.
  Brightness get brightness => colors.brightness;

  @override
  bool operator ==(Object other) {
    return other is MPThemeData &&
        other.colors == colors &&
        other.typescale == typescale &&
        other.shapes == shapes;
  }

  @override
  int get hashCode => Object.hash(colors, typescale, shapes);
}

/// Themes everything below it.
///
/// Each parameter left out is inherited from the theme above, or from the
/// defaults where there is none, so a nested theme says only what it changes:
///
/// ```dart
/// MPTheme(
///   sourceColor: const Color(0xFF7C3AED),
///   child: MPTheme(
///     brightness: Brightness.dark,
///     child: const PromoBanner(), // the brand's purple, in the dark scheme
///   ),
/// )
/// ```
class MPTheme extends StatelessWidget {
  /// Themes [child] and its subtree.
  const MPTheme({
    required this.child,
    this.sourceColor,
    this.brightness,
    this.colors,
    this.typescale,
    this.shapes,
    super.key,
  });

  /// The colour every role is generated from: MD3's source colour.
  ///
  /// The one value most apps ever set. A near-grey source does not work: below
  /// a chroma of about 0.05 the derived `primary` stops being distinguishable
  /// from `outline`, and a focus indicator then reads as no change at all.
  final Color? sourceColor;

  /// The scheme to draw in. Left out, the theme above decides, and with no
  /// theme above, the platform does: the subtree follows
  /// `MediaQuery.platformBrightnessOf` and rebuilds when it changes.
  final Brightness? brightness;

  /// A whole scheme, used as it is instead of one generated from
  /// [sourceColor]. For a scheme that came from somewhere else, and for the one
  /// role a design disagrees with:
  /// `MPColorScheme.fromSource(...).copyWith(outline: ...)`.
  final MPColorScheme? colors;

  /// The type scale. MD3's own unless given.
  final MPTypescale? typescale;

  /// The corner ladder: [MPShapes.material], [MPShapes.rounded],
  /// [MPShapes.sharp] or one of your own.
  final MPShapes? shapes;

  /// The subtree the theme applies to.
  final Widget child;

  /// The theme in force at [context].
  ///
  /// Never `null`. With no [MPTheme] above, it is the default theme at the
  /// platform's brightness, and [context] is registered on `MediaQuery` so it
  /// rebuilds when the device switches between light and dark.
  static MPThemeData of(BuildContext context) {
    final _MPThemeScope? scope = context.dependOnInheritedWidgetOfExactType<_MPThemeScope>();

    if (scope != null) {
      return scope.data;
    }

    return MPThemeData.fallback(MediaQuery.maybePlatformBrightnessOf(context) ?? Brightness.light);
  }

  /// The theme an [MPTheme] above [context] resolved, or `null` when there is
  /// none and the defaults are in use.
  static MPThemeData? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPThemeScope>()?.data;
  }

  @override
  Widget build(BuildContext context) {
    final _MPThemeScope? outer = context.dependOnInheritedWidgetOfExactType<_MPThemeScope>();
    final Brightness resolvedBrightness =
        brightness ??
        outer?.brightness ??
        MediaQuery.maybePlatformBrightnessOf(context) ??
        Brightness.light;
    final Color resolvedSource = sourceColor ?? outer?.sourceColor ?? mpDefaultSourceColor;

    final MPColorScheme resolvedColors =
        colors ??
        // An outer scheme given whole is kept as long as nothing here asks for
        // a different source or scheme; otherwise the derivation runs again.
        (sourceColor == null &&
                brightness == null &&
                outer != null &&
                outer.data.colors.brightness == resolvedBrightness
            ? outer.data.colors
            : _schemeFor(resolvedSource, resolvedBrightness));

    return _MPThemeScope(
      sourceColor: resolvedSource,
      brightness: resolvedBrightness,
      data: MPThemeData(
        colors: resolvedColors,
        typescale: typescale ?? outer?.data.typescale ?? MPTypescale.material,
        shapes: shapes ?? outer?.data.shapes ?? MPShapes.material,
      ),
      child: child,
    );
  }
}

/// Generated schemes, by source and brightness.
///
/// A scheme is about sixty colour conversions, cheap once and wasteful on
/// every rebuild of every themed subtree. Bounded, because the source is a
/// caller's and an app that animates it would otherwise keep every frame's.
final Map<(int, Brightness), MPColorScheme> _schemes = <(int, Brightness), MPColorScheme>{};

MPColorScheme _schemeFor(Color source, Brightness brightness) {
  final (int, Brightness) key = (source.toARGB32(), brightness);
  final MPColorScheme? cached = _schemes[key];

  if (cached != null) {
    return cached;
  }

  if (_schemes.length >= 32) {
    _schemes.remove(_schemes.keys.first);
  }

  return _schemes[key] = MPColorScheme.fromSource(sourceColor: source, brightness: brightness);
}

class _MPThemeScope extends InheritedWidget {
  const _MPThemeScope({
    required this.sourceColor,
    required this.brightness,
    required this.data,
    required super.child,
  });

  final Color sourceColor;
  final Brightness brightness;
  final MPThemeData data;

  @override
  bool updateShouldNotify(_MPThemeScope oldWidget) {
    return oldWidget.data != data ||
        oldWidget.sourceColor != sourceColor ||
        oldWidget.brightness != brightness;
  }
}
