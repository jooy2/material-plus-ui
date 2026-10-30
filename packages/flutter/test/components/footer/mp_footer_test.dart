import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/components/footer/mp_footer.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find.descendant(of: find.byType(MPFooter), matching: find.byType(DecoratedBox)).first,
          )
          .decoration
      as BoxDecoration;
}

const Key _body = Key('body');

Offset _insetOf(WidgetTester tester) {
  return tester.getTopLeft(find.byKey(_body)) - tester.getTopLeft(find.byType(MPFooter));
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the sheet', () {
    testWidgets('marks the end of the document with a rule along its top', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 600, const MPFooter(child: Text('Fine print'))));

      final Border border = _sheetOf(tester).border! as Border;

      expect(_sheetOf(tester).color, light.surface);
      expect(border.top.color, light.outlineVariant);
      expect(border.bottom, BorderSide.none);
    });

    testWidgets('drops the rule for any other weight, which says it by tone', (
      WidgetTester tester,
    ) async {
      final Map<MPVariant, Color> fills = <MPVariant, Color>{
        MPVariant.filled: light.surfaceContainerHighest,
        MPVariant.tonal: light.surfaceContainer,
        MPVariant.elevated: light.surfaceContainerLow,
        MPVariant.text: const Color(0x00000000),
      };

      for (final MapEntry<MPVariant, Color> entry in fills.entries) {
        await tester.pumpWidget(
          host(width: 600, MPFooter(variant: entry.key, child: const Text('Fine print'))),
        );

        expect(_sheetOf(tester).border, isNull, reason: entry.key.name);
        expect(_sheetOf(tester).color, entry.value, reason: entry.key.name);
      }
    });

    testWidgets('pads both axes, unlike a header', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPFooter(
            variant: MPVariant.tonal,
            child: SizedBox(key: _body, height: 10),
          ),
        ),
      );

      expect(_insetOf(tester), const Offset(16, 16));
    });

    testWidgets('keeps the content clear of its own rule', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 600, const MPFooter(child: SizedBox(key: _body, height: 10))),
      );

      expect(_insetOf(tester), const Offset(16, 17));
    });

    testWidgets('moves its padding with size and density', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPConfigProvider(
            size: MPSize.xl,
            child: MPFooter(
              variant: MPVariant.tonal,
              density: -1,
              child: SizedBox(key: _body, height: 10),
            ),
          ),
        ),
      );

      expect(_insetOf(tester), const Offset(22, 22));
    });

    testWidgets('gives up the padding when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPFooter(
            variant: MPVariant.tonal,
            padded: false,
            child: SizedBox(key: _body, height: 10),
          ),
        ),
      );

      expect(_insetOf(tester), Offset.zero);
    });

    testWidgets('holds the content to a measure while the sheet spans the width', (
      WidgetTester tester,
    ) async {
      tester.view
        ..physicalSize = const Size(2400, 1200)
        ..devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        host(
          width: 1200,
          const MPFooter(
            variant: MPVariant.tonal,
            padded: false,
            maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
            child: SizedBox(key: _body, height: 10),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPFooter)).width, 1200);
      expect(tester.getSize(find.byKey(_body)).width, 600);
      expect(_insetOf(tester).dx, 300);
    });
  });

  group('semantics', () {
    testWidgets('is the contentInfo landmark at the top of a screen', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(width: 600, const MPFooter(semanticLabel: 'Site', child: Text('Fine print'))),
      );

      expect(
        semanticsNodeLabelled(tester, 'Site')!.getSemanticsData().role,
        SemanticsRole.contentInfo,
      );
      handle.dispose();
    });

    testWidgets('claims no landmark inside a layout’s main region', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(
          width: 600,
          const MPLandmarkScope(
            child: Column(
              children: <Widget>[
                MPFooter(child: Text('Article end')),
                MPFooter(semanticLabel: 'Notes', child: Text('More')),
              ],
            ),
          ),
        ),
      );

      expect(
        find.descendant(of: find.byType(MPFooter).first, matching: find.byType(Semantics)),
        findsNothing,
      );
      expect(semanticsNodeLabelled(tester, 'Notes')!.getSemanticsData().role, SemanticsRole.region);
      handle.dispose();
    });
  });
}
