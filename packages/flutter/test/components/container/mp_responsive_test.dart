import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/types.dart';

/// The two rules every responsive parameter in the package leans on: an entry
/// applies from its own class upward, and a map that leaves the bottom out
/// leaves it to the parameter's default.
void main() {
  group('MPResponsive', () {
    test('is one value at every width when given one', () {
      const MPResponsive<int> span = MPResponsive<int>(6);

      for (final MPWindowClass windowClass in MPWindowClass.values) {
        expect(span.resolve(windowClass, 12), 6, reason: windowClass.name);
      }
    });

    test('applies each entry from its own class upward', () {
      const MPResponsive<int> span = MPResponsive<int>(12, medium: 6, large: 4);

      expect(
        <int>[
          for (final MPWindowClass windowClass in MPWindowClass.values)
            span.resolve(windowClass, 0),
        ],
        <int>[12, 6, 6, 4, 4],
      );
    });

    test('leaves the classes under a partial map to the default', () {
      const MPResponsive<int> spacing = MPResponsive<int>.from(expanded: 8);

      expect(spacing.at(MPWindowClass.medium), isNull);
      expect(spacing.resolve(MPWindowClass.medium, 4), 4);
      expect(spacing.resolve(MPWindowClass.expanded, 4), 8);
      expect(spacing.resolve(MPWindowClass.extraLarge, 4), 8);
    });

    test('compares by its entries', () {
      expect(
        const MPResponsive<int>(1, medium: 2),
        // ignore: prefer_const_constructors
        MPResponsive<int>(1, medium: 2),
      );
      expect(const MPResponsive<int>(1), isNot(const MPResponsive<int>(1, medium: 2)));
    });
  });

  group('MPMeasure', () {
    test('pins the rungs to the window size classes', () {
      expect(
        <double>[
          for (final MPMeasure measure in <MPMeasure>[
            MPMeasure.xs,
            MPMeasure.sm,
            MPMeasure.md,
            MPMeasure.lg,
            MPMeasure.xl,
          ])
            measure.resolve(mpWindowClassMinimums),
        ],
        <double>[480, 600, 840, 1200, 1600],
      );
    });

    test('reads the boundaries it is handed', () {
      final Map<MPWindowClass, double> moved = <MPWindowClass, double>{
        ...mpWindowClassMinimums,
        MPWindowClass.expanded: 900,
      };

      expect(MPMeasure.md.resolve(moved), 900);
      expect(MPMeasure.xs.resolve(moved), 480);
    });

    test('takes a length of its own, and none is no limit', () {
      expect(const MPMeasure.pixels(640).resolve(mpWindowClassMinimums), 640);
      expect(MPMeasure.none.resolve(mpWindowClassMinimums), double.infinity);
    });

    test('names a rung by size', () {
      expect(const MPMeasure.rung(MPSize.lg), MPMeasure.lg);
    });
  });
}
