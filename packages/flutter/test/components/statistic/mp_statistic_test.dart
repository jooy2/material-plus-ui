import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/statistic/mp_statistic.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads the value's and the delta's text and classes; this
/// reads the same text, and the colour the move was laid out in, off the
/// render tree. `data-mp-direction` becomes the key on the move's row.

final Finder _statistic = find.byType(MPStatistic);

Finder _direction(String which) => find.byKey(ValueKey<String>(which));

/// Everything the move says, in order, as one string.
String _move(WidgetTester tester) {
  final Finder row = find.descendant(of: _statistic, matching: find.byType(Row)).last;

  return tester
      .widgetList<Text>(find.descendant(of: row, matching: find.byType(Text)))
      .map((Text text) => text.data)
      .join(' ');
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('writes a number grouped in thousands', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, const MPStatistic(label: Text('Installs'), value: 1284)),
    );

    expect(find.text('1,284'), findsOneWidget);
  });

  group('compacting', () {
    testWidgets('leaves a figure alone until five digits', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 999)));
      expect(find.text('999'), findsOneWidget);

      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 9999)));
      expect(find.text('9,999'), findsOneWidget);

      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 12900)));
      expect(find.text('12.9K'), findsOneWidget);

      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 4200000)));
      expect(find.text('4.2M'), findsOneWidget);

      // A figure that rounds up to a thousand of one unit is one of the next.
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 999960)));
      expect(find.text('1M'), findsOneWidget);
    });

    testWidgets('does not compact what a caller has already written', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          MPStatistic(value: 4200000, formatValue: (num value) => '\$${value.toInt()}'),
        ),
      );

      expect(find.text('\$4200000'), findsOneWidget);
    });

    testWidgets('can be turned off', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 12900, compact: false)));

      expect(find.text('12,900'), findsOneWidget);
    });

    testWidgets('draws a value that is not a number exactly as it was given', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: '2h 14m')));
      expect(find.text('2h 14m'), findsOneWidget);

      await tester.pumpWidget(
        host(width: 400, const MPStatistic(value: Text('A+', key: Key('grade')))),
      );
      expect(find.byKey(const Key('grade')), findsOneWidget);
    });
  });

  group('the move', () {
    testWidgets('is signed, so the direction survives without the arrow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPStatistic(value: 128400, previousValue: 119200)),
      );

      expect(_move(tester), contains('+7.7%'));
      expect(_direction('up'), findsOneWidget);
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).quarterTurns, -1);
    });

    testWidgets('calls a fall good when the caller says falling is good', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(value: 4, previousValue: 10, betterWhen: MPStatisticBetterWhen.down),
        ),
      );

      expect(styleOf(tester, '-60%').color, light.tertiary);

      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 4, previousValue: 10)));

      expect(styleOf(tester, '-60%').color, light.error);
      expect(_direction('down'), findsOneWidget);
    });

    testWidgets('treats flat as a third state rather than a quiet rise', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 10, previousValue: 10)));

      expect(_direction('flat'), findsOneWidget);
      expect(styleOf(tester, '0%').color, light.onSurfaceVariant);
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.minus);
    });

    testWidgets('gives the absolute move rather than a percentage of nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 40, previousValue: 0)));

      expect(_move(tester), contains('+40'));
      expect(_move(tester), isNot(contains('%')));
    });

    testWidgets('writes it the way it is asked to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(value: 120, previousValue: 100, delta: MPStatisticDeltaFormat.absolute),
        ),
      );

      expect(_move(tester), contains('+20'));
      expect(_move(tester), isNot(contains('%')));

      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(value: 120, previousValue: 100, delta: MPStatisticDeltaFormat.both),
        ),
      );

      expect(find.text('+20 · +20%'), findsOneWidget);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(value: 120, previousValue: 100, delta: MPStatisticDeltaFormat.none),
        ),
      );

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('writes the move the way the figure is written', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          MPStatistic(
            value: 4234900,
            previousValue: 4610000,
            formatValue: (num value) => '\$${value.toInt()}',
            delta: MPStatisticDeltaFormat.absolute,
          ),
        ),
      );

      expect(find.text('-\$375100'), findsOneWidget);
    });

    testWidgets('compacts a large move on its own size', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(
            value: 128400,
            previousValue: 119200,
            delta: MPStatisticDeltaFormat.absolute,
          ),
        ),
      );
      expect(find.text('+9,200'), findsOneWidget);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(
            value: 4200000,
            previousValue: 4100000,
            delta: MPStatisticDeltaFormat.absolute,
          ),
        ),
      );
      expect(find.text('+100K'), findsOneWidget);
    });

    testWidgets('says nothing at all without something to compare against', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPStatistic(value: 120)));
      expect(find.byType(MPGlyph), findsNothing);

      // Nor for a figure that is not a number.
      await tester.pumpWidget(
        host(width: 400, const MPStatistic(value: '2h 14m', previousValue: 100)),
      );
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('reads the period after the move', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPStatistic(value: 120, previousValue: 100, period: Text('vs last month')),
        ),
      );

      expect(
        tester.getCenter(find.text('vs last month')).dx,
        greaterThan(tester.getCenter(find.text('+20%')).dx),
      );
      expect(styleOf(tester, 'vs last month').color, light.onSurfaceVariant);
    });
  });

  testWidgets('keeps the figure in the surface ink whichever way it went', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 400, const MPStatistic(value: 4, previousValue: 10)));

    expect(styleOf(tester, '4').color, light.onSurface);
  });

  testWidgets('sets the figure on the size ladder’s own roles', (WidgetTester tester) async {
    final List<double> sizes = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(host(width: 400, MPStatistic(value: 7, size: size)));
      sizes.add(styleOf(tester, '7').fontSize!);
    }

    // titleMedium, titleLarge, headlineSmall, headlineMedium, displaySmall.
    expect(sizes, <double>[16, 22, 24, 28, 36]);
    expect(styleOf(tester, '7').fontWeight, FontWeight.w500);
  });

  testWidgets('holds a picture of itself without owning one', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPStatistic(value: 10, trend: SizedBox(key: Key('spark'), height: 20)),
      ),
    );

    expect(tester.getSize(find.byKey(const Key('spark'))).width, 400);
  });

  testWidgets('aligns its lines to the end when asked, in the reading direction', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 400,
        textDirection: TextDirection.rtl,
        const MPStatistic(label: Text('Revenue'), value: 10, align: MPAlign.end),
      ),
    );

    expect(tester.getTopLeft(find.text('Revenue')).dx, tester.getTopLeft(_statistic).dx);
  });
}
