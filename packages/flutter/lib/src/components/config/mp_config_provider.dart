/// The parameter defaults for everything under it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// The parameter defaults for everything under it.
///
/// Wrap the application. Every component still takes `size` and `color` of its
/// own, and every container takes `density`; this is where those parameters
/// get their default, so a design that runs at [MPSize.sm] is one decision
/// rather than one per call site.
///
/// ```dart
/// MPConfigProvider(
///   size: MPSize.sm,
///   color: MPColor.tertiary,
///   locale: 'ko',
///   child: const App(),
/// )
/// ```
///
/// A provider inside another one keeps whatever the outer one decided and it
/// left unsaid, field by field, so a nested provider that only says `density`
/// does not take the application's `locale` away from everything under it.
///
/// A component's own parameter always wins, then the set it is in (a button
/// group, a toggle group), then this, then the component's own default.
///
/// It carries no theme. The colours, the type, the corners and the brightness
/// are [MPTheme]'s, in the same way the React package keeps them in CSS rather
/// than in this provider.
class MPConfigProvider extends StatelessWidget {
  /// Sets defaults for [child] and its subtree.
  const MPConfigProvider({
    required this.child,
    this.size,
    this.color,
    this.density,
    this.breakpoints,
    this.locale,
    this.textDirection,
    this.reserveSupportingText,
    super.key,
  });

  /// The size every control under this starts at.
  final MPSize? size;

  /// The accent family every control under this reads.
  final MPColor? color;

  /// How tightly every component that holds things is packed under this.
  final MPDensity? density;

  /// Where the window size classes begin, in logical pixels.
  ///
  /// Partial and merged over MD3's own, so `{MPWindowClass.medium: 700}` moves
  /// one boundary and leaves the other three. [MPWindowClass.compact] is always
  /// nought: a first class whose floor is above zero leaves a band of windows
  /// in no class at all.
  ///
  /// Unlike the React package, this moves everything: Flutter has no
  /// stylesheet compiled ahead of time for a boundary to be stuck in.
  final Map<MPWindowClass, double>? breakpoints;

  /// The language the components speak: the same value [MPLocaleProvider]
  /// takes, carried here so an application needs one provider rather than two.
  final String? locale;

  /// Which way the text runs under this. Left out, the ambient
  /// [Directionality] stays in charge.
  final TextDirection? textDirection;

  /// Keeps a line under every field for its description or its error, whether
  /// or not there is one yet, so an error that arrives later fills the line in
  /// place instead of pushing everything below the field down.
  final bool? reserveSupportingText;

  /// The subtree the defaults apply to.
  final Widget child;

  /// What the nearest provider above [context] resolved to, or `null` if there
  /// is none.
  static MPConfigValue? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPConfigScope>()?.value;
  }

  /// What the nearest provider above [context] resolved to, or the library's
  /// own defaults if there is none.
  static MPConfigValue of(BuildContext context) => maybeOf(context) ?? MPConfigValue.none;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue outer = of(context);
    final MPConfigValue value = MPConfigValue(
      size: size ?? outer.size,
      color: color ?? outer.color,
      density: density ?? outer.density,
      breakpoints: breakpoints == null
          ? outer.breakpoints
          : <MPWindowClass, double>{
              ...outer.breakpoints,
              ...breakpoints!,
              MPWindowClass.compact: 0,
            },
      locale: locale ?? outer.locale,
      reserveSupportingText: reserveSupportingText ?? outer.reserveSupportingText,
    );
    final Widget scope = _MPConfigScope(value: value, child: child);

    if (textDirection == null) {
      return scope;
    }

    return Directionality(textDirection: textDirection!, child: scope);
  }
}

/// What an [MPConfigProvider] resolved to, merged with the ones above it.
@immutable
class MPConfigValue {
  /// Creates a resolved set of defaults.
  const MPConfigValue({
    this.size,
    this.color,
    this.density,
    this.breakpoints = mpWindowClassMinimums,
    this.locale,
    this.reserveSupportingText,
  });

  /// Nothing decided.
  static const MPConfigValue none = MPConfigValue();

  /// The size in scope, or `null`.
  final MPSize? size;

  /// The accent family in scope, or `null`.
  final MPColor? color;

  /// The density in scope, or `null`.
  final MPDensity? density;

  /// Where each window size class begins.
  final Map<MPWindowClass, double> breakpoints;

  /// The locale in scope, or `null`.
  final String? locale;

  /// Whether fields keep their supporting line open, or `null`.
  final bool? reserveSupportingText;

  /// The window size class a window [width] wide falls in.
  MPWindowClass windowClassOf(double width) {
    MPWindowClass found = MPWindowClass.compact;

    for (final MPWindowClass windowClass in MPWindowClass.values) {
      if (width >= (breakpoints[windowClass] ?? mpWindowClassMinimums[windowClass]!)) {
        found = windowClass;
      }
    }

    return found;
  }

  @override
  bool operator ==(Object other) {
    return other is MPConfigValue &&
        other.size == size &&
        other.color == color &&
        other.density == density &&
        _sameBreakpoints(other.breakpoints, breakpoints) &&
        other.locale == locale &&
        other.reserveSupportingText == reserveSupportingText;
  }

  @override
  int get hashCode => Object.hash(
    size,
    color,
    density,
    Object.hashAll(breakpoints.entries.map((MapEntry<MPWindowClass, double> e) => e.value)),
    locale,
    reserveSupportingText,
  );
}

bool _sameBreakpoints(Map<MPWindowClass, double> a, Map<MPWindowClass, double> b) {
  if (a.length != b.length) {
    return false;
  }

  for (final MapEntry<MPWindowClass, double> entry in a.entries) {
    if (b[entry.key] != entry.value) {
      return false;
    }
  }

  return true;
}

/// MD3's window size classes, by where each begins.
const Map<MPWindowClass, double> mpWindowClassMinimums = <MPWindowClass, double>{
  MPWindowClass.compact: 0,
  MPWindowClass.medium: 600,
  MPWindowClass.expanded: 840,
  MPWindowClass.large: 1200,
  MPWindowClass.extraLarge: 1600,
};

class _MPConfigScope extends InheritedWidget {
  const _MPConfigScope({required this.value, required super.child});

  final MPConfigValue value;

  @override
  bool updateShouldNotify(_MPConfigScope oldWidget) => oldWidget.value != value;
}
