import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/box/mp_box.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads the computed background, border and padding off the
/// element. Here the sheet is the [BoxDecoration] the box built, and the
/// padding is where the child landed inside it.

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find.descendant(of: find.byType(MPBox), matching: find.byType(DecoratedBox)).first,
          )
          .decoration
      as BoxDecoration;
}

const Key _body = Key('body');

/// How far in from the sheet's edge the content starts.
double _insetOf(WidgetTester tester) {
  return tester.getTopLeft(find.byKey(_body)).dx - tester.getTopLeft(find.byType(MPBox)).dx;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('renders what it was handed', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPBox(child: Text('Grouped.'))));

    expect(find.text('Grouped.'), findsOneWidget);
  });

  testWidgets('is outlined by default, in outlineVariant', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPBox(child: Text('Body'))));

    final Border border = _sheetOf(tester).border! as Border;

    expect(border.top.color, light.outlineVariant);
    expect(border.top.width, 1);
    expect(_sheetOf(tester).color, const Color(0x00000000));
  });

  testWidgets('paints each variant from a neutral surface role', (WidgetTester tester) async {
    // A container holding somebody else's content is never dyed, so no rung of
    // the ladder resolves to the accent.
    final Map<MPVariant, Color> fills = <MPVariant, Color>{
      MPVariant.filled: light.surfaceContainerHighest,
      MPVariant.tonal: light.surfaceContainer,
      MPVariant.elevated: light.surfaceContainerLow,
      MPVariant.outlined: const Color(0x00000000),
      MPVariant.text: const Color(0x00000000),
    };

    for (final MapEntry<MPVariant, Color> entry in fills.entries) {
      await tester.pumpWidget(host(MPBox(variant: entry.key, child: const Text('Body'))));

      expect(_sheetOf(tester).color, entry.value, reason: entry.key.name);
      expect(_sheetOf(tester).color, isNot(light.primary), reason: entry.key.name);
    }
  });

  testWidgets('takes its padding off the sheet ladder', (WidgetTester tester) async {
    final List<double> insets = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(
        host(
          MPBox(
            variant: MPVariant.filled,
            size: size,
            child: const SizedBox(key: _body, width: 10, height: 10),
          ),
        ),
      );
      insets.add(_insetOf(tester));
    }

    expect(insets, <double>[10, 12, 16, 20, 24]);
  });

  testWidgets('takes density out of the padding, two pixels a step', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPBox(
          variant: MPVariant.filled,
          density: -2,
          child: SizedBox(key: _body, width: 10, height: 10),
        ),
      ),
    );

    expect(_insetOf(tester), 12);
  });

  testWidgets('takes its rung and density from an MPConfigProvider', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPConfigProvider(
          size: MPSize.xl,
          density: -1,
          child: MPBox(
            variant: MPVariant.filled,
            child: SizedBox(key: _body, width: 10, height: 10),
          ),
        ),
      ),
    );

    expect(_insetOf(tester), 22);
  });

  testWidgets('holds content at the same inset whether outlined or not', (
    WidgetTester tester,
  ) async {
    // The hairline is inside the box, as `box-border` puts it.
    await tester.pumpWidget(host(const MPBox(child: SizedBox(key: _body, width: 10, height: 10))));
    final Size outlined = tester.getSize(find.byType(MPBox));

    await tester.pumpWidget(
      host(
        const MPBox(
          variant: MPVariant.filled,
          child: SizedBox(key: _body, width: 10, height: 10),
        ),
      ),
    );

    expect(tester.getSize(find.byType(MPBox)).width, outlined.width - 2);
  });

  testWidgets('drops the padding for full-bleed content', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPBox(
          variant: MPVariant.filled,
          padded: false,
          child: SizedBox(key: _body, width: 10, height: 10),
        ),
      ),
    );

    expect(_insetOf(tester), 0);
    expect(tester.getSize(find.byType(MPBox)), const Size(10, 10));
  });

  testWidgets('keeps the corner off the size ladder', (WidgetTester tester) async {
    for (final MPSize size in <MPSize>[MPSize.xs, MPSize.xl]) {
      await tester.pumpWidget(host(MPBox(size: size, child: const Text('Body'))));

      expect(_sheetOf(tester).borderRadius, BorderRadius.circular(12), reason: size.name);
    }
  });

  testWidgets('writes in onSurface and leaves the type scale alone', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const DefaultTextStyle(
          style: TextStyle(fontSize: 31),
          child: MPBox(child: Text('Body')),
        ),
      ),
    );

    expect(styleOf(tester, 'Body').color, light.onSurface);
    expect(styleOf(tester, 'Body').fontSize, 31);
  });

  testWidgets('clips only when asked to', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPBox(child: Text('Body'))));
    expect(find.descendant(of: find.byType(MPBox), matching: find.byType(ClipRRect)), findsNothing);

    await tester.pumpWidget(host(const MPBox(clipBehavior: Clip.antiAlias, child: Text('Body'))));
    expect(
      find.descendant(of: find.byType(MPBox), matching: find.byType(ClipRRect)),
      findsOneWidget,
    );
  });

  group('elevation', () {
    testWidgets('casts a shadow and moves the tone with it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBox(variant: MPVariant.filled, child: Text('Body'))));
      final Color flat = _sheetOf(tester).color!;

      expect(_sheetOf(tester).boxShadow, isEmpty);

      await tester.pumpWidget(
        host(const MPBox(variant: MPVariant.filled, elevation: 2, child: Text('Body'))),
      );

      expect(_sheetOf(tester).boxShadow, MPShadows.of(2));
      expect(_sheetOf(tester).color, isNot(flat));
    });

    testWidgets('is what variant elevated already says, at 1', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBox(variant: MPVariant.elevated, child: Text('Body'))));
      final BoxDecoration named = _sheetOf(tester);

      await tester.pumpWidget(
        host(const MPBox(variant: MPVariant.filled, elevation: 1, child: Text('Body'))),
      );

      expect(_sheetOf(tester).color, named.color);
      expect(_sheetOf(tester).boxShadow, named.boxShadow);
    });

    testWidgets('rises through all five levels', (WidgetTester tester) async {
      final Set<List<BoxShadow>?> shadows = <List<BoxShadow>?>{};

      for (int level = 0; level <= 5; level += 1) {
        await tester.pumpWidget(
          host(MPBox(variant: MPVariant.filled, elevation: level, child: const Text('Body'))),
        );
        shadows.add(_sheetOf(tester).boxShadow);
      }

      expect(shadows.first, isEmpty);
      expect(shadows.length, 6);
    });

    testWidgets('keeps an outlined box outlined', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBox(elevation: 3, child: Text('Body'))));

      expect((_sheetOf(tester).border! as Border).top.width, 1);
      expect(_sheetOf(tester).boxShadow, isNotEmpty);
    });
  });
}
