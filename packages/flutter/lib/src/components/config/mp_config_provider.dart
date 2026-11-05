/// The parameter defaults for everything under it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// The parameter defaults for everything under it.
///
/// Wrap the application. Every component still takes `size` and `color` of its
/// own, and every container takes `density`; this is where those parameters
/// get their default, so a design that runs at [MPSize.sm] is one decision
/// rather than one per call site. The same holds for every field's
/// `floatingLabel`, every calendar's `weekStartsOn`, and the words the
/// components say.
///
/// ```dart
/// MPConfigProvider(
///   size: MPSize.sm,
///   color: MPColor.tertiary,
///   locale: 'ko',
///   weekStartsOn: MPWeekday.monday,
///   child: const App(),
/// )
/// ```
///
/// A provider inside another one keeps whatever the outer one decided and it
/// left unsaid, field by field, so a nested provider that only says `density`
/// does not take the application's `locale` away from everything under it.
/// [labels] go one step further and merge a word at a time.
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
    this.floatingLabel,
    this.weekStartsOn,
    this.labels,
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

  /// Whether every field's label rests on the field's line while there is
  /// nothing in it, and rises into the notch on focus or on the first
  /// character. `false` pins every one of them in the notch from the start.
  ///
  /// Left out, each field's own default, which is `true`. A field's own
  /// `floatingLabel` still wins, and a `startIcon` holds a label up whatever
  /// this says, since the icon stands where a resting label would be.
  final bool? floatingLabel;

  /// Which day the weeks start on, in every calendar and date picker under
  /// this.
  ///
  /// Left out, each one starts the week where its date names do: the locale's,
  /// or the `names` it was handed. That is right for most applications. A
  /// product whose weeks start on Monday wherever its readers are says so
  /// here, and a calendar's own `weekStartsOn` still wins.
  final MPWeekday? weekStartsOn;

  /// The words the components say on their own behalf, by namespace and then
  /// by key, in the shape `registerMPMessages` takes:
  /// `{'common': {'close': 'Dismiss'}}`.
  ///
  /// Partial, and laid over the language in force rather than in its place, so
  /// renaming one button does not mean supplying every other word. A
  /// component's own `labels` still wins over this, and this wins over a
  /// registered translation, which wins over English. A provider inside
  /// another one merges over it a namespace and then a key at a time, so a
  /// nested provider that renames one word keeps every other word the outer
  /// one renamed.
  ///
  /// It is not a language. A registered table answers to a locale tag for the
  /// whole application; this is the application's own wording, for this
  /// subtree, in whatever language is in force. The month and weekday names
  /// are not words in this sense either: they come from the date names, which
  /// a calendar's own `names` replaces.
  final Map<String, Map<String, String>>? labels;

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
      floatingLabel: floatingLabel ?? outer.floatingLabel,
      weekStartsOn: weekStartsOn ?? outer.weekStartsOn,
      labels: _mergeLabels(outer.labels, labels),
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
    this.floatingLabel,
    this.weekStartsOn,
    this.labels,
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

  /// Whether a field's label rests on the field's line until it rises, or
  /// `null`.
  final bool? floatingLabel;

  /// The day the weeks start on, or `null`.
  final MPWeekday? weekStartsOn;

  /// The words in scope, by namespace and then by key, already merged over
  /// every provider above, or `null`.
  final Map<String, Map<String, String>>? labels;

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
        other.reserveSupportingText == reserveSupportingText &&
        other.floatingLabel == floatingLabel &&
        other.weekStartsOn == weekStartsOn &&
        _sameLabels(other.labels, labels);
  }

  @override
  int get hashCode => Object.hash(
    size,
    color,
    density,
    Object.hashAll(breakpoints.entries.map((MapEntry<MPWindowClass, double> e) => e.value)),
    locale,
    reserveSupportingText,
    floatingLabel,
    weekStartsOn,
    _hashLabels(labels),
  );
}

/// [inner] over [outer], a namespace and then a key at a time.
///
/// Copied rather than kept, so a caller that changes its map in place and
/// builds again is compared against what the map said before, not against
/// itself.
Map<String, Map<String, String>>? _mergeLabels(
  Map<String, Map<String, String>>? outer,
  Map<String, Map<String, String>>? inner,
) {
  if (inner == null) {
    return outer;
  }

  return <String, Map<String, String>>{
    ...?outer,
    for (final MapEntry<String, Map<String, String>> entry in inner.entries)
      entry.key: <String, String>{...?outer?[entry.key], ...entry.value},
  };
}

/// Whether [a] and [b] say the same words, whatever maps they are.
///
/// By value rather than by identity: a provider is usually handed a map
/// literal, which is a new map every time the widget above it builds, and
/// comparing those by identity would build everything under it again each
/// time.
bool _sameLabels(Map<String, Map<String, String>>? a, Map<String, Map<String, String>>? b) {
  if (identical(a, b)) {
    return true;
  }

  if (a == null || b == null || a.length != b.length) {
    return false;
  }

  for (final MapEntry<String, Map<String, String>> namespace in a.entries) {
    final Map<String, String>? other = b[namespace.key];

    if (other == null || other.length != namespace.value.length) {
      return false;
    }

    for (final MapEntry<String, String> word in namespace.value.entries) {
      if (other[word.key] != word.value) {
        return false;
      }
    }
  }

  return true;
}

/// A hash that agrees with [_sameLabels]: unordered at both levels, because
/// two maps that hold the same words in another order are the same words.
int _hashLabels(Map<String, Map<String, String>>? labels) {
  if (labels == null) {
    return null.hashCode;
  }

  return Object.hashAllUnordered(
    labels.entries.map((MapEntry<String, Map<String, String>> namespace) {
      return Object.hash(
        namespace.key,
        Object.hashAllUnordered(
          namespace.value.entries.map((MapEntry<String, String> word) {
            return Object.hash(word.key, word.value);
          }),
        ),
      );
    }),
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
