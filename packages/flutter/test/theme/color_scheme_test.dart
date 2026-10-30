import 'dart:ui' show Brightness, Color;

import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The React token sheet's static fallback, for browsers without relative
/// colour syntax: the derived scheme for the default source colour, written out
/// as hex. The Dart derivation has to land on the same numbers, or the two
/// packages would draw the same source colour as two different schemes.
const Map<String, int> _light = <String, int>{
  'primary': 0xFF0A67A0,
  'onPrimary': 0xFFFFFFFF,
  'primaryContainer': 0xFFCFE8FD,
  'onPrimaryContainer': 0xFF00213B,
  'secondary': 0xFF536574,
  'onSecondary': 0xFFFFFFFF,
  'secondaryContainer': 0xFFD2E7F8,
  'onSecondaryContainer': 0xFF12212E,
  'tertiary': 0xFF6B5A7A,
  'onTertiary': 0xFFFFFFFF,
  'tertiaryContainer': 0xFFEEDBFF,
  'onTertiaryContainer': 0xFF271833,
  'surface': 0xFFF3FBFF,
  'surfaceContainerLow': 0xFFEEF5FC,
  'surfaceContainer': 0xFFE8F1F9,
  'surfaceContainerHigh': 0xFFE1EAF2,
  'surfaceContainerHighest': 0xFFDBE4EB,
  'inverseSurface': 0xFF2C3237,
  'inverseOnSurface': 0xFFEBF3F9,
  'inversePrimary': 0xFF99D0FD,
  'onSurface': 0xFF181D21,
  'onSurfaceVariant': 0xFF3F4850,
  'outline': 0xFF6F7880,
  'outlineVariant': 0xFFBEC9D2,
  'error': 0xFFB3261E,
  'onError': 0xFFFFFFFF,
  'errorContainer': 0xFFFDDBD5,
  'onErrorContainer': 0xFF400705,
};

const Map<String, int> _dark = <String, int>{
  'primary': 0xFF99D0FD,
  'onPrimary': 0xFF00375B,
  'primaryContainer': 0xFF004E7D,
  'onPrimaryContainer': 0xFFCFE8FD,
  'secondary': 0xFFB7CCDE,
  'onSecondary': 0xFF263644,
  'secondaryContainer': 0xFF3B4D5B,
  'onSecondaryContainer': 0xFFD2E7F8,
  'tertiary': 0xFFD5BFE7,
  'onTertiary': 0xFF3D2C49,
  'tertiaryContainer': 0xFF534261,
  'onTertiaryContainer': 0xFFEEDBFF,
  'surface': 0xFF0E1418,
  'surfaceContainerLow': 0xFF181D21,
  'surfaceContainer': 0xFF1B2126,
  'surfaceContainerHigh': 0xFF252B30,
  'surfaceContainerHighest': 0xFF30363B,
  'inverseSurface': 0xFFDBE4EB,
  'inverseOnSurface': 0xFF2C3237,
  'inversePrimary': 0xFF0A67A0,
  'onSurface': 0xFFDBE4EB,
  'onSurfaceVariant': 0xFFBEC9D2,
  'outline': 0xFF8A939A,
  'outlineVariant': 0xFF3F4850,
  'error': 0xFFF2B8B5,
  'onError': 0xFF650714,
  'errorContainer': 0xFF8E031D,
  'onErrorContainer': 0xFFFEDAD8,
};

Map<String, Color> _roles(MPColorScheme scheme) {
  return <String, Color>{
    'primary': scheme.primary,
    'onPrimary': scheme.onPrimary,
    'primaryContainer': scheme.primaryContainer,
    'onPrimaryContainer': scheme.onPrimaryContainer,
    'secondary': scheme.secondary,
    'onSecondary': scheme.onSecondary,
    'secondaryContainer': scheme.secondaryContainer,
    'onSecondaryContainer': scheme.onSecondaryContainer,
    'tertiary': scheme.tertiary,
    'onTertiary': scheme.onTertiary,
    'tertiaryContainer': scheme.tertiaryContainer,
    'onTertiaryContainer': scheme.onTertiaryContainer,
    'surface': scheme.surface,
    'surfaceContainerLow': scheme.surfaceContainerLow,
    'surfaceContainer': scheme.surfaceContainer,
    'surfaceContainerHigh': scheme.surfaceContainerHigh,
    'surfaceContainerHighest': scheme.surfaceContainerHighest,
    'inverseSurface': scheme.inverseSurface,
    'inverseOnSurface': scheme.inverseOnSurface,
    'inversePrimary': scheme.inversePrimary,
    'onSurface': scheme.onSurface,
    'onSurfaceVariant': scheme.onSurfaceVariant,
    'outline': scheme.outline,
    'outlineVariant': scheme.outlineVariant,
    'error': scheme.error,
    'onError': scheme.onError,
    'errorContainer': scheme.errorContainer,
    'onErrorContainer': scheme.onErrorContainer,
  };
}

/// The largest difference in any one 0–255 channel.
int _distance(Color a, Color b) {
  int channel(double value) => (value * 255).round();

  return <int>[
    (channel(a.r) - channel(b.r)).abs(),
    (channel(a.g) - channel(b.g)).abs(),
    (channel(a.b) - channel(b.b)).abs(),
  ].reduce((int x, int y) => x > y ? x : y);
}

void main() {
  for (final (String name, Brightness brightness, Map<String, int> expected)
      in <(String, Brightness, Map<String, int>)>[
        ('light', Brightness.light, _light),
        ('dark', Brightness.dark, _dark),
      ]) {
    group('the $name scheme from the default source colour', () {
      final Map<String, Color> roles = _roles(MPColorScheme.fromSource(brightness: brightness));

      for (final MapEntry<String, int> entry in expected.entries) {
        test('lands on the React fallback for ${entry.key}', () {
          // One step of 255 either way: the fallback was rounded once, in a
          // browser, and this is rounded once here.
          expect(_distance(roles[entry.key]!, Color(entry.value)), lessThanOrEqualTo(1));
        });
      }
    });
  }

  test('a role given by name wins over the derivation', () {
    final MPColorScheme scheme = MPColorScheme.fromSource().copyWith(
      outline: const Color(0xFF123456),
    );

    expect(scheme.outline, const Color(0xFF123456));
  });

  test('the accent of a family is its four roles', () {
    final MPColorScheme scheme = MPColorScheme.fromSource();
    final MPAccent tertiary = scheme.accent(MPColor.tertiary);

    expect(tertiary.color, scheme.tertiary);
    expect(tertiary.onColor, scheme.onTertiary);
    expect(tertiary.container, scheme.tertiaryContainer);
    expect(tertiary.onContainer, scheme.onTertiaryContainer);
  });
}
