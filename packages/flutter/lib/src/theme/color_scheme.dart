/// The colour roles, and how they are generated from one source colour.
///
/// MD3 generates a whole scheme from a single seed, and so does this. The
/// numbers below are the React token sheet's (`packages/react/src/styles.css`),
/// read off MD3's own baseline palette in OKLCh, and the derivation is the one
/// that file performs in CSS: so a scheme built from the same source colour is
/// the same scheme on both sides of the library.
///
/// The vocabulary is Material Design 3's, not Material UI's and not Flutter's
/// `ColorScheme`'s. That class carries roles this library never reads; a role
/// nobody reads is a promise to keep supporting a name, so [MPColorScheme] has
/// exactly the ones the components resolve.
library;

import 'dart:ui' show Brightness, Color;

import 'package:flutter/foundation.dart';

import 'package:material_plus_ui/src/theme/oklch.dart';
import 'package:material_plus_ui/src/types.dart';

/// The source colour every scheme is generated from unless told otherwise.
///
/// A deep azure rather than the specification's baseline purple, `#6750a4`, for
/// the reason the React token sheet gives: an application that has not chosen a
/// colour yet should not end up looking like it chose that one. It is picked for
/// its chroma as well as its hue, 0.118 against the baseline's 0.130, because
/// every role derives its saturation from here.
const Color mpDefaultSourceColor = Color(0xFF00639B);

/// One accent family read as the four roles a component paints with.
///
/// What `accentSlots` hands a component in the React package: the family's
/// colour, the ink that sits on it, its container tone and the ink on that.
@immutable
class MPAccent {
  /// Creates a family from its four roles.
  const MPAccent({
    required this.color,
    required this.onColor,
    required this.container,
    required this.onContainer,
  });

  /// The family itself: `primary`, `secondary`, `tertiary` or `error`.
  final Color color;

  /// The ink drawn on [color].
  final Color onColor;

  /// The family's container tone, the accent diluted rather than dimmed.
  final Color container;

  /// The ink drawn on [container].
  final Color onContainer;

  @override
  bool operator ==(Object other) {
    return other is MPAccent &&
        other.color == color &&
        other.onColor == onColor &&
        other.container == container &&
        other.onContainer == onContainer;
  }

  @override
  int get hashCode => Object.hash(color, onColor, container, onContainer);
}

/// Every colour role a Material Plus component reads.
@immutable
class MPColorScheme {
  /// A scheme with every role given.
  ///
  /// [MPColorScheme.fromSource] is what nearly everyone wants; this is for a
  /// scheme that came from somewhere else, such as a design tool's export.
  const MPColorScheme({
    required this.brightness,
    required this.primary,
    required this.onPrimary,
    required this.primaryContainer,
    required this.onPrimaryContainer,
    required this.secondary,
    required this.onSecondary,
    required this.secondaryContainer,
    required this.onSecondaryContainer,
    required this.tertiary,
    required this.onTertiary,
    required this.tertiaryContainer,
    required this.onTertiaryContainer,
    required this.error,
    required this.onError,
    required this.errorContainer,
    required this.onErrorContainer,
    required this.surface,
    required this.surfaceContainerLow,
    required this.surfaceContainer,
    required this.surfaceContainerHigh,
    required this.surfaceContainerHighest,
    required this.inverseSurface,
    required this.inverseOnSurface,
    required this.inversePrimary,
    required this.onSurface,
    required this.onSurfaceVariant,
    required this.outline,
    required this.outlineVariant,
    required this.scrim,
    required this.chart,
    required this.chartScale,
  }) : assert(chart.length == 8, 'The chart ramp has eight slots.'),
       assert(chartScale.length == 5, 'The sequential ramp has five steps.');

  /// The whole scheme, generated from [sourceColor] for [brightness].
  ///
  /// MD3's light and dark schemes are not two palettes. They are the same tonal
  /// palettes read at different tones, which is why one source colour moves
  /// both and why this takes the brightness rather than a second colour.
  factory MPColorScheme.fromSource({
    Color sourceColor = mpDefaultSourceColor,
    Brightness brightness = Brightness.light,
  }) {
    final _Stops stops = brightness == Brightness.dark ? _Stops.dark : _Stops.light;
    final MPOklch source = MPOklch.fromColor(sourceColor);
    final double c = source.c;
    final double h = source.h;
    final double tertiaryHue = h + stops.hueTertiary;

    Color accent(double tone, double chroma, double hue) => mpFitToSrgb(tone, chroma, hue);
    Color neutral(double tone, double chroma) => MPOklch(tone, chroma, h).toColor();

    return MPColorScheme(
      brightness: brightness,
      primary: accent(stops.accent, c * stops.chromaPrimary, h),
      onPrimary: accent(stops.onAccent, c * _palettePrimary, h),
      primaryContainer: accent(stops.accentContainer, c * _palettePrimary, h),
      onPrimaryContainer: accent(stops.onAccentContainer, c * _palettePrimary, h),
      secondary: accent(stops.accent, c * stops.chromaSecondary, h),
      onSecondary: accent(stops.onAccent, c * _paletteSecondary, h),
      secondaryContainer: accent(stops.accentContainer, c * _paletteSecondary, h),
      onSecondaryContainer: accent(stops.onAccentContainer, c * _paletteSecondary, h),
      tertiary: accent(stops.accent, c * stops.chromaTertiary, tertiaryHue),
      onTertiary: accent(stops.onAccent, c * _paletteTertiary, tertiaryHue),
      tertiaryContainer: accent(stops.accentContainer, c * _paletteTertiary, tertiaryHue),
      onTertiaryContainer: accent(stops.onAccentContainer, c * _paletteTertiary, tertiaryHue),
      // Not derived from the source at all: an error has to read as an error
      // whatever colour the brand is.
      error: accent(stops.error, stops.chromaError, stops.hueError),
      onError: accent(stops.onAccent, _paletteError, stops.hueError),
      errorContainer: accent(stops.accentContainer, _paletteError, stops.hueError),
      onErrorContainer: accent(stops.onAccentContainer, _paletteError, stops.hueError),
      surface: neutral(stops.surface, stops.chromaSurface),
      surfaceContainerLow: neutral(stops.surfaceContainerLow, stops.chromaSurfaceContainerLow),
      surfaceContainer: neutral(stops.surfaceContainer, stops.chromaSurfaceContainer),
      surfaceContainerHigh: neutral(stops.surfaceContainerHigh, stops.chromaSurfaceContainerHigh),
      surfaceContainerHighest: neutral(
        stops.surfaceContainerHighest,
        stops.chromaSurfaceContainerHighest,
      ),
      inverseSurface: neutral(stops.inverseSurface, stops.chromaInverseSurface),
      inverseOnSurface: neutral(stops.inverseOnSurface, stops.chromaInverseOnSurface),
      inversePrimary: accent(stops.inverseAccent, c * stops.chromaInversePrimary, h),
      onSurface: neutral(stops.onSurface, stops.chromaOnSurface),
      onSurfaceVariant: neutral(stops.onSurfaceVariant, stops.chromaOnSurfaceVariant),
      outline: neutral(stops.outline, stops.chromaOutline),
      outlineVariant: neutral(stops.outlineVariant, stops.chromaOutlineVariant),
      // MD3 puts the scrim at neutral tone 0, and it stays black in the dark
      // scheme: a scrim is a dimmer, not a surface.
      scrim: const Color(0xFF000000),
      chart: List<Color>.unmodifiable(<Color>[
        for (int slot = 0; slot < 8; slot++)
          MPOklch(stops.chart[slot], 0.15, _chartHues[slot]).toColor(),
      ]),
      chartScale: List<Color>.unmodifiable(<Color>[
        for (int step = 0; step < 5; step++)
          MPOklch(stops.chartScale[step], stops.chromaChartScale[step], _chartHues[0]).toColor(),
      ]),
    );
  }

  /// Which scheme this is.
  final Brightness brightness;

  /// The main accent: a filled button, a selected switch, a focused field.
  final Color primary;

  /// Ink on [primary].
  final Color onPrimary;

  /// A quieter tone of the primary family, for a tonal button or a chip.
  final Color primaryContainer;

  /// Ink on [primaryContainer].
  final Color onPrimaryContainer;

  /// The secondary accent, and the colour of the focus indicator.
  final Color secondary;

  /// Ink on [secondary].
  final Color onSecondary;

  /// The secondary container tone: a selected navigation item, a tonal button.
  final Color secondaryContainer;

  /// Ink on [secondaryContainer].
  final Color onSecondaryContainer;

  /// The third accent, a hue turned away from the source colour.
  final Color tertiary;

  /// Ink on [tertiary].
  final Color onTertiary;

  /// The tertiary container tone.
  final Color tertiaryContainer;

  /// Ink on [tertiaryContainer].
  final Color onTertiaryContainer;

  /// The error family, which is not derived from the source colour.
  final Color error;

  /// Ink on [error].
  final Color onError;

  /// The error container tone, for an error alert.
  final Color errorContainer;

  /// Ink on [errorContainer].
  final Color onErrorContainer;

  /// The page's own surface. An overlay that hides the page paints this.
  final Color surface;

  /// The lowest container tone, under an elevated button or card.
  final Color surfaceContainerLow;

  /// The container tone a menu sits on.
  final Color surfaceContainer;

  /// One step up, where a dialog sits.
  final Color surfaceContainerHigh;

  /// The highest container tone, a switch's track or a filled field.
  final Color surfaceContainerHighest;

  /// The inverted surface, under a plain tooltip and a snackbar.
  final Color inverseSurface;

  /// Ink on [inverseSurface].
  final Color inverseOnSurface;

  /// The primary family read at the other scheme's tone, for an action label
  /// on [inverseSurface].
  final Color inversePrimary;

  /// The ink for text and icons on every surface.
  final Color onSurface;

  /// A quieter ink, for supporting text and inactive icons.
  final Color onSurfaceVariant;

  /// The hairline of an outlined field or button.
  final Color outline;

  /// A quieter hairline, for a divider or an outlined card.
  final Color outlineVariant;

  /// What dims the page behind a modal surface.
  final Color scrim;

  /// The chart ramp: eight hues at least 30° apart, an identity channel.
  ///
  /// The hues are the same in both schemes and only the lightness follows the
  /// brightness, because a series that changed hue when the page went dark
  /// would be a series a reader has to learn twice.
  final List<Color> chart;

  /// The sequential ramp, five steps of one hue, for a magnitude rather than an
  /// identity. Runs away from the page in both schemes.
  final List<Color> chartScale;

  /// The four roles of [family], for a component that paints in whichever
  /// accent it was given.
  MPAccent accent(MPColor family) {
    switch (family) {
      case MPColor.primary:
        return MPAccent(
          color: primary,
          onColor: onPrimary,
          container: primaryContainer,
          onContainer: onPrimaryContainer,
        );
      case MPColor.secondary:
        return MPAccent(
          color: secondary,
          onColor: onSecondary,
          container: secondaryContainer,
          onContainer: onSecondaryContainer,
        );
      case MPColor.tertiary:
        return MPAccent(
          color: tertiary,
          onColor: onTertiary,
          container: tertiaryContainer,
          onContainer: onTertiaryContainer,
        );
      case MPColor.error:
        return MPAccent(
          color: error,
          onColor: onError,
          container: errorContainer,
          onContainer: onErrorContainer,
        );
    }
  }

  /// A copy with the given roles replaced.
  ///
  /// The supported way to disagree with one generated colour, the same as
  /// setting `--mp-sys-color-outline` in the React package: name the role and
  /// leave the derivation alone.
  MPColorScheme copyWith({
    Color? primary,
    Color? onPrimary,
    Color? primaryContainer,
    Color? onPrimaryContainer,
    Color? secondary,
    Color? onSecondary,
    Color? secondaryContainer,
    Color? onSecondaryContainer,
    Color? tertiary,
    Color? onTertiary,
    Color? tertiaryContainer,
    Color? onTertiaryContainer,
    Color? error,
    Color? onError,
    Color? errorContainer,
    Color? onErrorContainer,
    Color? surface,
    Color? surfaceContainerLow,
    Color? surfaceContainer,
    Color? surfaceContainerHigh,
    Color? surfaceContainerHighest,
    Color? inverseSurface,
    Color? inverseOnSurface,
    Color? inversePrimary,
    Color? onSurface,
    Color? onSurfaceVariant,
    Color? outline,
    Color? outlineVariant,
    Color? scrim,
    List<Color>? chart,
    List<Color>? chartScale,
  }) {
    return MPColorScheme(
      brightness: brightness,
      primary: primary ?? this.primary,
      onPrimary: onPrimary ?? this.onPrimary,
      primaryContainer: primaryContainer ?? this.primaryContainer,
      onPrimaryContainer: onPrimaryContainer ?? this.onPrimaryContainer,
      secondary: secondary ?? this.secondary,
      onSecondary: onSecondary ?? this.onSecondary,
      secondaryContainer: secondaryContainer ?? this.secondaryContainer,
      onSecondaryContainer: onSecondaryContainer ?? this.onSecondaryContainer,
      tertiary: tertiary ?? this.tertiary,
      onTertiary: onTertiary ?? this.onTertiary,
      tertiaryContainer: tertiaryContainer ?? this.tertiaryContainer,
      onTertiaryContainer: onTertiaryContainer ?? this.onTertiaryContainer,
      error: error ?? this.error,
      onError: onError ?? this.onError,
      errorContainer: errorContainer ?? this.errorContainer,
      onErrorContainer: onErrorContainer ?? this.onErrorContainer,
      surface: surface ?? this.surface,
      surfaceContainerLow: surfaceContainerLow ?? this.surfaceContainerLow,
      surfaceContainer: surfaceContainer ?? this.surfaceContainer,
      surfaceContainerHigh: surfaceContainerHigh ?? this.surfaceContainerHigh,
      surfaceContainerHighest: surfaceContainerHighest ?? this.surfaceContainerHighest,
      inverseSurface: inverseSurface ?? this.inverseSurface,
      inverseOnSurface: inverseOnSurface ?? this.inverseOnSurface,
      inversePrimary: inversePrimary ?? this.inversePrimary,
      onSurface: onSurface ?? this.onSurface,
      onSurfaceVariant: onSurfaceVariant ?? this.onSurfaceVariant,
      outline: outline ?? this.outline,
      outlineVariant: outlineVariant ?? this.outlineVariant,
      scrim: scrim ?? this.scrim,
      chart: chart ?? this.chart,
      chartScale: chartScale ?? this.chartScale,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is MPColorScheme &&
        other.brightness == brightness &&
        other.primary == primary &&
        other.onPrimary == onPrimary &&
        other.primaryContainer == primaryContainer &&
        other.onPrimaryContainer == onPrimaryContainer &&
        other.secondary == secondary &&
        other.onSecondary == onSecondary &&
        other.secondaryContainer == secondaryContainer &&
        other.onSecondaryContainer == onSecondaryContainer &&
        other.tertiary == tertiary &&
        other.onTertiary == onTertiary &&
        other.tertiaryContainer == tertiaryContainer &&
        other.onTertiaryContainer == onTertiaryContainer &&
        other.error == error &&
        other.onError == onError &&
        other.errorContainer == errorContainer &&
        other.onErrorContainer == onErrorContainer &&
        other.surface == surface &&
        other.surfaceContainerLow == surfaceContainerLow &&
        other.surfaceContainer == surfaceContainer &&
        other.surfaceContainerHigh == surfaceContainerHigh &&
        other.surfaceContainerHighest == surfaceContainerHighest &&
        other.inverseSurface == inverseSurface &&
        other.inverseOnSurface == inverseOnSurface &&
        other.inversePrimary == inversePrimary &&
        other.onSurface == onSurface &&
        other.onSurfaceVariant == onSurfaceVariant &&
        other.outline == outline &&
        other.outlineVariant == outlineVariant &&
        other.scrim == scrim &&
        listEquals(other.chart, chart) &&
        listEquals(other.chartScale, chartScale);
  }

  @override
  int get hashCode => Object.hashAll(<Object>[
    brightness,
    primary,
    onPrimary,
    primaryContainer,
    onPrimaryContainer,
    secondary,
    onSecondary,
    secondaryContainer,
    onSecondaryContainer,
    tertiary,
    onTertiary,
    tertiaryContainer,
    onTertiaryContainer,
    error,
    onError,
    errorContainer,
    onErrorContainer,
    surface,
    surfaceContainerLow,
    surfaceContainer,
    surfaceContainerHigh,
    surfaceContainerHighest,
    inverseSurface,
    inverseOnSurface,
    inversePrimary,
    onSurface,
    onSurfaceVariant,
    outline,
    outlineVariant,
    scrim,
    ...chart,
    ...chartScale,
  ]);
}

/// The chroma each accent palette carries, as a multiplier of the source
/// colour's own. Not reassigned for the dark scheme: MD3 holds a palette's
/// chroma constant across its tones and lets the gamut take back what will not
/// fit, which is why `primary` is vivid and `primary-container` a pale wash
/// from one number.
const double _palettePrimary = 1;
const double _paletteSecondary = 0.274;
const double _paletteTertiary = 0.464;

/// The error palette's chroma, absolute, since error is not derived from the
/// source colour.
const double _paletteError = 0.1783;

/// The chart ramp's eight hues, the same in both schemes.
const List<double> _chartHues = <double>[245, 55, 180, 280, 0, 120, 315, 150];

/// One scheme's tone stops.
///
/// Lightnesses are OKLCh L rather than MD3 tone numbers, and the near-grey
/// roles' chroma is absolute. Every value is the React token sheet's; the
/// comments there say where each one was read from.
class _Stops {
  const _Stops({
    required this.accent,
    required this.onAccent,
    required this.accentContainer,
    required this.onAccentContainer,
    required this.chromaPrimary,
    required this.chromaSecondary,
    required this.chromaTertiary,
    required this.hueTertiary,
    required this.onSurface,
    required this.chromaOnSurface,
    required this.onSurfaceVariant,
    required this.chromaOnSurfaceVariant,
    required this.outline,
    required this.chromaOutline,
    required this.outlineVariant,
    required this.chromaOutlineVariant,
    required this.surface,
    required this.chromaSurface,
    required this.surfaceContainerLow,
    required this.chromaSurfaceContainerLow,
    required this.surfaceContainer,
    required this.chromaSurfaceContainer,
    required this.surfaceContainerHigh,
    required this.chromaSurfaceContainerHigh,
    required this.surfaceContainerHighest,
    required this.chromaSurfaceContainerHighest,
    required this.inverseAccent,
    required this.chromaInversePrimary,
    required this.inverseSurface,
    required this.chromaInverseSurface,
    required this.inverseOnSurface,
    required this.chromaInverseOnSurface,
    required this.error,
    required this.chromaError,
    required this.hueError,
    required this.chart,
    required this.chartScale,
    required this.chromaChartScale,
  });

  final double accent;
  final double onAccent;
  final double accentContainer;
  final double onAccentContainer;
  final double chromaPrimary;
  final double chromaSecondary;
  final double chromaTertiary;
  final double hueTertiary;
  final double onSurface;
  final double chromaOnSurface;
  final double onSurfaceVariant;
  final double chromaOnSurfaceVariant;
  final double outline;
  final double chromaOutline;
  final double outlineVariant;
  final double chromaOutlineVariant;
  final double surface;
  final double chromaSurface;
  final double surfaceContainerLow;
  final double chromaSurfaceContainerLow;
  final double surfaceContainer;
  final double chromaSurfaceContainer;
  final double surfaceContainerHigh;
  final double chromaSurfaceContainerHigh;
  final double surfaceContainerHighest;
  final double chromaSurfaceContainerHighest;
  final double inverseAccent;
  final double chromaInversePrimary;
  final double inverseSurface;
  final double chromaInverseSurface;
  final double inverseOnSurface;
  final double chromaInverseOnSurface;
  final double error;
  final double chromaError;
  final double hueError;
  final List<double> chart;
  final List<double> chartScale;
  final List<double> chromaChartScale;

  static const _Stops light = _Stops(
    accent: 0.496,
    onAccent: 1,
    accentContainer: 0.918,
    onAccentContainer: 0.242,
    chromaPrimary: 1,
    chromaSecondary: 0.274,
    chromaTertiary: 0.464,
    hueTertiary: 64.7,
    onSurface: 0.227,
    chromaOnSurface: 0.01,
    onSurfaceVariant: 0.398,
    chromaOnSurfaceVariant: 0.0174,
    outline: 0.567,
    chromaOutline: 0.0163,
    outlineVariant: 0.829,
    chromaOutlineVariant: 0.0178,
    surface: 0.984,
    chromaSurface: 0.0128,
    surfaceContainerLow: 0.967,
    chromaSurfaceContainerLow: 0.0118,
    surfaceContainer: 0.954,
    chromaSurfaceContainer: 0.0147,
    surfaceContainerHigh: 0.933,
    chromaSurfaceContainerHigh: 0.0148,
    surfaceContainerHighest: 0.914,
    chromaSurfaceContainerHighest: 0.0137,
    inverseAccent: 0.835,
    chromaInversePrimary: 0.725,
    inverseSurface: 0.313,
    chromaInverseSurface: 0.0118,
    inverseOnSurface: 0.96,
    chromaInverseOnSurface: 0.0118,
    error: 0.501,
    chromaError: 0.1783,
    hueError: 28.7,
    chart: <double>[0.56, 0.44, 0.62, 0.44, 0.62, 0.44, 0.62, 0.5],
    chartScale: <double>[0.755, 0.68, 0.605, 0.53, 0.45],
    chromaChartScale: <double>[0.06, 0.085, 0.11, 0.13, 0.15],
  );

  static const _Stops dark = _Stops(
    accent: 0.835,
    onAccent: 0.325,
    accentContainer: 0.41,
    onAccentContainer: 0.918,
    chromaPrimary: 0.725,
    chromaSecondary: 0.287,
    chromaTertiary: 0.51,
    hueTertiary: 65.7,
    onSurface: 0.914,
    chromaOnSurface: 0.0137,
    onSurfaceVariant: 0.829,
    chromaOnSurfaceVariant: 0.0178,
    outline: 0.657,
    chromaOutline: 0.0153,
    outlineVariant: 0.398,
    chromaOutlineVariant: 0.0174,
    surface: 0.187,
    chromaSurface: 0.0124,
    surfaceContainerLow: 0.227,
    chromaSurfaceContainerLow: 0.01,
    surfaceContainer: 0.245,
    chromaSurfaceContainer: 0.0134,
    surfaceContainerHigh: 0.286,
    chromaSurfaceContainerHigh: 0.0129,
    surfaceContainerHighest: 0.33,
    chromaSurfaceContainerHighest: 0.0125,
    inverseAccent: 0.496,
    chromaInversePrimary: 1,
    inverseSurface: 0.914,
    chromaInverseSurface: 0.0137,
    inverseOnSurface: 0.313,
    chromaInverseOnSurface: 0.0118,
    error: 0.834,
    chromaError: 0.0677,
    hueError: 22,
    chart: <double>[0.56, 0.6, 0.64, 0.64, 0.56, 0.64, 0.64, 0.64],
    chartScale: <double>[0.405, 0.49, 0.575, 0.66, 0.745],
    chromaChartScale: <double>[0.06, 0.09, 0.115, 0.135, 0.15],
  );
}
