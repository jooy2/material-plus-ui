/// A value that changes with the window size class, and the measure a layout
/// holds content to.
library;

import 'package:flutter/foundation.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/types.dart';

/// A value, or the same value said differently at each window size class.
///
/// ```dart
/// MPGridItem(span: const MPResponsive<MPGridSpan>(MPGridSpan(12), medium: MPGridSpan(6)), ...)
/// MPContainer(maxWidth: const MPResponsive<MPMeasure>.from(expanded: MPMeasure.lg), ...)
/// ```
///
/// Each entry applies **from its own class upward**, so a layout is usually
/// two entries rather than five: anything not named keeps whatever the class
/// below it said. The classes are [MPWindowClass]'s, MD3's own, and an
/// [MPConfigProvider] that moves a boundary moves every responsive parameter
/// with it.
///
/// The React package spells this as a bare value or a map, `span={6}` or
/// `span={{ compact: 12, medium: 6 }}`, which a TypeScript union can carry and
/// Dart cannot. So there are two constructors, one for each half of that union:
///
/// - `MPResponsive(6)` is a value at every width, and `MPResponsive(12,
///   medium: 6)` a value with overrides. The first argument is the
///   [compact] entry, positional because it is the common case.
/// - `MPResponsive.from(expanded: 8)` names only the classes it changes, and
///   everything below the lowest of them keeps the parameter's own default.
///   That is what a React map with no `compact` key means: "from here up, this
///   instead", and not "and nothing below".
///
/// The window, not the box. The class is read off the [MediaQuery] the widget
/// is under, which is what a media query measures, so two grids side by side
/// are in the same class however wide each of them ended up.
@immutable
class MPResponsive<T extends Object> {
  /// [compact] from the narrowest window up, and each named override from its
  /// own class up.
  const MPResponsive(T this.compact, {this.medium, this.expanded, this.large, this.extraLarge});

  /// Only the classes named. Below the lowest of them, the parameter this is
  /// handed to keeps its own default.
  const MPResponsive.from({this.compact, this.medium, this.expanded, this.large, this.extraLarge});

  /// From the narrowest window up.
  final T? compact;

  /// From 600dp up, unless the breakpoints were moved.
  final T? medium;

  /// From 840dp up.
  final T? expanded;

  /// From 1200dp up.
  final T? large;

  /// From 1600dp up.
  final T? extraLarge;

  /// The entry in force at [windowClass]: its own, or the nearest one below
  /// it, or `null` when nothing at or below it was named.
  T? at(MPWindowClass windowClass) {
    switch (windowClass) {
      case MPWindowClass.extraLarge:
        return extraLarge ?? large ?? expanded ?? medium ?? compact;
      case MPWindowClass.large:
        return large ?? expanded ?? medium ?? compact;
      case MPWindowClass.expanded:
        return expanded ?? medium ?? compact;
      case MPWindowClass.medium:
        return medium ?? compact;
      case MPWindowClass.compact:
        return compact;
    }
  }

  /// The value at [windowClass], or [fallback] when nothing at or below it
  /// was named. [fallback] is the parameter's documented default.
  T resolve(MPWindowClass windowClass, T fallback) => at(windowClass) ?? fallback;

  @override
  bool operator ==(Object other) {
    return other is MPResponsive<T> &&
        other.compact == compact &&
        other.medium == medium &&
        other.expanded == expanded &&
        other.large == large &&
        other.extraLarge == extraLarge;
  }

  @override
  int get hashCode => Object.hash(compact, medium, expanded, large, extraLarge);

  @override
  String toString() {
    final List<String> entries = <String>[
      if (compact != null) 'compact: $compact',
      if (medium != null) 'medium: $medium',
      if (expanded != null) 'expanded: $expanded',
      if (large != null) 'large: $large',
      if (extraLarge != null) 'extraLarge: $extraLarge',
    ];

    return 'MPResponsive(${entries.join(', ')})';
  }
}

/// How wide content is allowed to get.
///
/// Two vocabularies in one type, because a measure is asked for in two ways
/// and neither covers the other.
///
/// A **rung of the size ladder** is the common one, and it is pinned to the
/// window size classes rather than to anything typographic: [MPMeasure.md] is
/// "never wider than an expanded window", 840dp, which is a sentence about the
/// specification rather than a number somebody liked. [MPMeasure.sm] is the
/// medium window's 600, [MPMeasure.lg] the large one's 1200 and [MPMeasure.xl]
/// the extra-large one's 1600. [MPMeasure.xs] is one rung below the ladder, at
/// 480, for the column of a form or a sign-in card. The rungs read the
/// boundaries in force where the widget is, so a page that moved one with
/// [MPConfigProvider] moves its measures too.
///
/// A **length** is the other: `MPMeasure.pixels(640)`. A measure is often a
/// decision about the text rather than about the window, and a library that
/// only offered its own five rungs would be making every one of those callers
/// wrap the widget in a `ConstrainedBox` to undo one it did not want.
///
/// [MPMeasure.none] is neither, and is what every component taking one means
/// by default: no limit at all.
@immutable
class MPMeasure {
  /// A rung of the ladder, by size.
  const MPMeasure.rung(MPSize this.rung) : pixels = null;

  /// An exact width in logical pixels. [double.infinity] is [none].
  const MPMeasure.pixels(double this.pixels) : rung = null, assert(pixels >= 0);

  /// No limit.
  static const MPMeasure none = MPMeasure.pixels(double.infinity);

  /// 480: narrower than any window class, for a form or a sign-in card.
  static const MPMeasure xs = MPMeasure.rung(MPSize.xs);

  /// The medium window's floor, 600.
  static const MPMeasure sm = MPMeasure.rung(MPSize.sm);

  /// The expanded window's floor, 840.
  static const MPMeasure md = MPMeasure.rung(MPSize.md);

  /// The large window's floor, 1200.
  static const MPMeasure lg = MPMeasure.rung(MPSize.lg);

  /// The extra-large window's floor, 1600.
  static const MPMeasure xl = MPMeasure.rung(MPSize.xl);

  /// The rung, or `null` for a length.
  final MPSize? rung;

  /// The length, or `null` for a rung.
  final double? pixels;

  /// The rung below the ladder.
  static const double _narrowerThanCompact = 480;

  /// This measure in logical pixels, with the rungs read against [minimums]:
  /// the boundaries `MPConfigProvider.of(context).breakpoints` hands out.
  /// [none] is [double.infinity], which a `BoxConstraints` reads as no limit.
  double resolve(Map<MPWindowClass, double> minimums) {
    if (pixels != null) {
      return pixels!;
    }

    double floor(MPWindowClass windowClass) {
      return minimums[windowClass] ?? mpWindowClassMinimums[windowClass]!;
    }

    switch (rung!) {
      case MPSize.xs:
        return _narrowerThanCompact;
      case MPSize.sm:
        return floor(MPWindowClass.medium);
      case MPSize.md:
        return floor(MPWindowClass.expanded);
      case MPSize.lg:
        return floor(MPWindowClass.large);
      case MPSize.xl:
        return floor(MPWindowClass.extraLarge);
    }
  }

  @override
  bool operator ==(Object other) {
    return other is MPMeasure && other.rung == rung && other.pixels == pixels;
  }

  @override
  int get hashCode => Object.hash(rung, pixels);

  @override
  String toString() {
    if (rung != null) {
      return 'MPMeasure.${rung!.name}';
    }

    return pixels!.isInfinite ? 'MPMeasure.none' : 'MPMeasure.pixels($pixels)';
  }
}
