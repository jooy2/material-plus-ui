import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/card/mp_card.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The card's own sheet: the first decoration under it.
BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widgetList<DecoratedBox>(
            find.descendant(of: find.byType(MPCard), matching: find.byType(DecoratedBox)),
          )
          .first
          .decoration
      as BoxDecoration;
}

/// The rules between sections: every decoration with a top border only.
int _rulesIn(WidgetTester tester) {
  return tester
      .widgetList<DecoratedBox>(
        find.descendant(of: find.byType(MPCard), matching: find.byType(DecoratedBox)),
      )
      .map((DecoratedBox box) => box.decoration)
      .whereType<BoxDecoration>()
      .where((BoxDecoration decoration) {
        final BoxBorder? border = decoration.border;

        return border is Border && border.top != BorderSide.none && border.left == BorderSide.none;
      })
      .length;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the sections', () {
    testWidgets('renders the heading, the body and the footer', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPCard(
            title: Text('Totals'),
            subtitle: Text('This month'),
            footer: Text('Export'),
            child: Text('Forty-two orders.'),
          ),
        ),
      );

      expect(find.text('Totals'), findsOneWidget);
      expect(find.text('This month'), findsOneWidget);
      expect(find.text('Forty-two orders.'), findsOneWidget);
      expect(find.text('Export'), findsOneWidget);

      // In MD3's order: heading, body, footer.
      final double title = tester.getTopLeft(find.text('Totals')).dy;
      final double body = tester.getTopLeft(find.text('Forty-two orders.')).dy;
      final double footer = tester.getTopLeft(find.text('Export')).dy;

      expect(title, lessThan(body));
      expect(body, lessThan(footer));
    });

    testWidgets('draws no header when there is nothing to put in one', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, const MPCard(child: Text('Just a body.'))));

      expect(find.byType(Row), findsNothing);
    });

    testWidgets('announces the title as a heading only when given a level', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 360, const MPCard(title: Text('Totals'), headingLevel: 3, child: Text('Body'))),
      );

      final SemanticsData heading = tester.getSemantics(find.text('Totals')).getSemanticsData();

      expect(heading.flagsCollection.isHeader, isTrue);
      expect(heading.headingLevel, 3);

      await tester.pumpWidget(
        host(width: 360, const MPCard(title: Text('Totals'), child: Text('Body'))),
      );

      expect(
        tester.getSemantics(find.text('Totals')).getSemanticsData().flagsCollection.isHeader,
        isFalse,
      );
      semantics.dispose();
    });

    testWidgets('puts the header action on the title row, at its end', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPCard(
            title: Text('Totals'),
            headerAction: SizedBox(key: Key('more'), width: 24, height: 24),
            child: Text('Body'),
          ),
        ),
      );

      final Rect action = tester.getRect(find.byKey(const Key('more')));
      final Rect title = tester.getRect(find.text('Totals'));

      expect(action.top, title.top);
      expect(action.left, greaterThan(title.right));
      // The sheet's 16px padding, plus the outlined variant's hairline.
      expect(tester.getRect(find.byType(MPCard)).right - action.right, 17);
    });

    testWidgets('mirrors the header under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          textDirection: TextDirection.rtl,
          const MPCard(
            title: Text('Totals'),
            headerAction: SizedBox(key: Key('more'), width: 24, height: 24),
          ),
        ),
      );

      expect(
        tester.getCenter(find.byKey(const Key('more'))).dx,
        lessThan(tester.getCenter(find.text('Totals')).dx),
      );
    });
  });

  group('media', () {
    testWidgets('draws it above everything, outside the padded sections', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPCard(
            title: Text('Cover'),
            media: SizedBox(key: Key('media'), height: 120),
            child: Text('Body'),
          ),
        ),
      );

      final Rect card = tester.getRect(find.byType(MPCard));
      final Rect media = tester.getRect(find.byKey(const Key('media')));

      // Edge to edge inside the hairline, and flush with the top.
      expect(media.width, card.width - 2);
      expect(media.top, card.top + 1);
      expect(media.bottom, lessThan(tester.getTopLeft(find.text('Cover')).dy));
      // The card clips, so its own corners crop the picture.
      expect(find.byType(ClipRRect), findsOneWidget);
    });

    testWidgets('does not clip a card that has no picture to crop', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 360, const MPCard(title: Text('Totals'), child: Text('Body'))),
      );

      expect(find.byType(ClipRRect), findsNothing);
    });
  });

  group('dividers', () {
    testWidgets('separates the sections with space by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPCard(title: Text('Totals'), footer: Text('Export'), child: Text('Body')),
        ),
      );

      expect(_rulesIn(tester), 0);
    });

    testWidgets('rules between the sections, but not above the first', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPCard(
            dividers: true,
            title: Text('Totals'),
            footer: Text('Export'),
            child: Text('Body'),
          ),
        ),
      );

      // Three sections, two rules, in the card's own edge colour.
      expect(_rulesIn(tester), 2);
    });

    testWidgets('moves the padding onto the sections so a rule can reach both edges', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 360, const MPCard(dividers: true, title: Text('Totals'), child: Text('Body'))),
      );

      final Rect card = tester.getRect(find.byType(MPCard));

      // 16px of section padding inside the 1px hairline, on both axes.
      expect(tester.getTopLeft(find.text('Totals')), card.topLeft + const Offset(17, 17));
    });
  });

  group('the surface', () {
    testWidgets('is outlined in outlineVariant at a medium corner by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 360, const MPCard(child: Text('Body'))));

      final BoxDecoration sheet = _sheetOf(tester);

      expect((sheet.border! as Border).top.color, light.outlineVariant);
      expect(sheet.borderRadius, BorderRadius.circular(12));
      expect(sheet.color, const Color(0x00000000));
    });

    testWidgets('paints each variant from MD3’s card roles', (WidgetTester tester) async {
      final Map<MPVariant, Color> fills = <MPVariant, Color>{
        MPVariant.filled: light.surfaceContainerHighest,
        MPVariant.tonal: light.surfaceContainer,
        MPVariant.elevated: light.surfaceContainerLow,
      };

      for (final MapEntry<MPVariant, Color> entry in fills.entries) {
        await tester.pumpWidget(
          host(width: 360, MPCard(variant: entry.key, child: const Text('Body'))),
        );

        expect(_sheetOf(tester).color, entry.value, reason: entry.key.name);
      }

      expect(_sheetOf(tester).boxShadow, MPShadows.of(1));
    });

    testWidgets('takes its tone and its shadow from an elevation', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, const MPCard(elevation: 3, child: Text('Body'))));

      // `outlined` keeps its hairline under a level, and nothing else.
      expect(_sheetOf(tester).color, light.surfaceContainerHigh);
      expect(_sheetOf(tester).boxShadow, MPShadows.of(3));
      expect(_sheetOf(tester).border, isNotNull);
    });

    testWidgets('pads by its size and its density, from a provider too', (
      WidgetTester tester,
    ) async {
      Future<double> inset(Widget card) async {
        await tester.pumpWidget(host(width: 360, card));

        return tester.getTopLeft(find.text('Body')).dx - tester.getTopLeft(find.byType(MPCard)).dx;
      }

      expect(await inset(const MPCard(size: MPSize.xs, child: Text('Body'))), 11);
      expect(await inset(const MPCard(size: MPSize.xl, child: Text('Body'))), 25);
      expect(await inset(const MPCard(density: -2, child: Text('Body'))), 13);
      expect(
        await inset(
          const MPConfigProvider(
            size: MPSize.lg,
            child: MPCard(child: Text('Body')),
          ),
        ),
        21,
      );
    });

    testWidgets('sets the title larger as the size grows', (WidgetTester tester) async {
      final List<double> sizes = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 360, MPCard(size: size, title: const Text('Totals'))));
        sizes.add(styleOf(tester, 'Totals').fontSize!);
      }

      expect(sizes, <double>[14, 14, 16, 22, 24]);
    });
  });
}
