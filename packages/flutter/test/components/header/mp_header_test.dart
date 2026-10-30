import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/components/header/mp_header.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads the bar's classes and measures its slots. Here the
/// sheet is the decoration the bar built and the slots are measured where they
/// landed.

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find.descendant(of: find.byType(MPHeader), matching: find.byType(DecoratedBox)).first,
          )
          .decoration
      as BoxDecoration;
}

Widget _box(String name, {double width = 40}) => SizedBox(key: Key(name), width: width, height: 20);

Rect _rectOf(WidgetTester tester, String name) => tester.getRect(find.byKey(Key(name)));

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the slots', () {
    testWidgets('draws no wrapper at all for a slot that was left empty', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 600, const MPHeader(brand: <Widget>[Text('Acme')])));

      expect(find.byType(Expanded), findsNothing);
      expect(find.text('Acme'), findsOneWidget);
    });

    testWidgets('keeps them in reading order: brand, middle, actions', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(
            brand: <Widget>[_box('brand')],
            actions: <Widget>[_box('actions')],
            child: _box('middle'),
          ),
        ),
      );

      expect(_rectOf(tester, 'brand').left, lessThan(_rectOf(tester, 'middle').left));
      expect(_rectOf(tester, 'middle').left, lessThan(_rectOf(tester, 'actions').left));
    });

    testWidgets('mirrors the order under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          textDirection: TextDirection.rtl,
          MPHeader(brand: <Widget>[_box('brand')], actions: <Widget>[_box('actions')]),
        ),
      );

      expect(_rectOf(tester, 'brand').left, greaterThan(_rectOf(tester, 'actions').left));
    });

    testWidgets('sets the brand in the headline role, and leaves the middle alone', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 600, const MPHeader(brand: <Widget>[Text('Acme')], child: Text('Docs'))),
      );

      final MPTypescale scale = MPTypescale.material;

      expect(styleOf(tester, 'Acme').fontSize, scale.titleLarge.style().fontSize);
      expect(styleOf(tester, 'Docs').fontSize, isNot(scale.titleLarge.style().fontSize));
    });

    testWidgets('spaces the regions further apart than the things inside one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(brand: <Widget>[_box('mark'), _box('name')], child: _box('middle')),
        ),
      );

      expect(_rectOf(tester, 'name').left - _rectOf(tester, 'mark').right, 12);
      expect(_rectOf(tester, 'middle').left - _rectOf(tester, 'name').right, 24);
    });

    testWidgets('keeps the actions at the end with no middle between', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(
            padded: false,
            brand: <Widget>[_box('brand')],
            actions: <Widget>[_box('actions')],
          ),
        ),
      );

      expect(_rectOf(tester, 'actions').right, tester.getTopRight(find.byType(MPHeader)).dx);
    });
  });

  group('align', () {
    testWidgets('packs the middle against the brand by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 600, MPHeader(brand: <Widget>[_box('brand')], child: _box('middle'))),
      );

      expect(_rectOf(tester, 'middle').left - _rectOf(tester, 'brand').right, 24);
    });

    testWidgets('gives both ends equal shares so the middle lands on the midline', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(
            align: MPAlign.center,
            brand: <Widget>[_box('brand', width: 160)],
            actions: <Widget>[_box('actions', width: 20)],
            child: _box('middle', width: 80),
          ),
        ),
      );

      expect(_rectOf(tester, 'middle').center.dx, tester.getCenter(find.byType(MPHeader)).dx);
    });

    testWidgets('still takes the empty end’s share when only one end is filled', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(
            align: MPAlign.center,
            brand: <Widget>[_box('brand', width: 120)],
            child: _box('middle', width: 80),
          ),
        ),
      );

      expect(_rectOf(tester, 'middle').center.dx, tester.getCenter(find.byType(MPHeader)).dx);
    });

    testWidgets('pushes the middle to the actions at the end', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPHeader(
            align: MPAlign.end,
            brand: <Widget>[_box('brand')],
            actions: <Widget>[_box('actions')],
            child: _box('middle'),
          ),
        ),
      );

      expect(_rectOf(tester, 'actions').left - _rectOf(tester, 'middle').right, 24);
    });
  });

  group('the sheet', () {
    testWidgets('is MD3’s scrolled app bar by default, with no rule under it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 600, const MPHeader(brand: <Widget>[Text('Acme')])));

      expect(_sheetOf(tester).color, light.surfaceContainer);
      expect(_sheetOf(tester).border, isNull);
    });

    testWidgets('draws the hairline on exactly one edge when outlined', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPHeader(variant: MPVariant.outlined, brand: <Widget>[Text('Acme')]),
        ),
      );

      final Border border = _sheetOf(tester).border! as Border;

      expect(_sheetOf(tester).color, light.surface);
      expect(border.bottom.color, light.outlineVariant);
      expect(border.top, BorderSide.none);
    });

    testWidgets('paints nothing at all when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 600, const MPHeader(variant: MPVariant.text, brand: <Widget>[Text('Acme')])),
      );

      expect(_sheetOf(tester).color, const Color(0x00000000));
    });

    testWidgets('lifts an elevated bar to level 2, and a level to its own', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 600, const MPHeader(variant: MPVariant.elevated, brand: <Widget>[Text('A')])),
      );
      expect(_sheetOf(tester).boxShadow, MPShadows.of(2));

      await tester.pumpWidget(
        host(width: 600, const MPHeader(elevation: 3, brand: <Widget>[Text('A')])),
      );
      expect(_sheetOf(tester).boxShadow, MPShadows.of(3));
      expect(_sheetOf(tester).color, light.surfaceContainerHigh);
    });

    testWidgets('has a floor on the bar ladder: 48, 56, 64, 80, 96', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(width: 600, MPHeader(size: size, child: const SizedBox(height: 10))),
        );
        heights.add(tester.getSize(find.byType(MPHeader)).height);
      }

      expect(heights, <double>[48, 56, 64, 80, 96]);
    });

    testWidgets('grows past its floor rather than clipping', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, const MPHeader(child: SizedBox(height: 90))));

      expect(tester.getSize(find.byType(MPHeader)).height, 90);
    });

    testWidgets('takes its gutter off the sheet ladder, with density', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          MPConfigProvider(density: -2, child: MPHeader(brand: <Widget>[_box('brand')])),
        ),
      );

      expect(_rectOf(tester, 'brand').left - tester.getTopLeft(find.byType(MPHeader)).dx, 12);
    });

    testWidgets('holds the row to a measure while the sheet spans the width', (
      WidgetTester tester,
    ) async {
      tester.view
        ..physicalSize = const Size(2400, 1200)
        ..devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        host(
          width: 1200,
          MPHeader(
            maxWidth: const MPResponsive<MPMeasure>(MPMeasure.sm),
            padded: false,
            brand: <Widget>[_box('brand')],
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPHeader)).width, 1200);
      expect(_rectOf(tester, 'brand').left - tester.getTopLeft(find.byType(MPHeader)).dx, 300);
    });

    testWidgets('writes in onSurface', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, const MPHeader(child: Text('Docs'))));

      expect(styleOf(tester, 'Docs').color, light.onSurface);
    });
  });

  group('semantics', () {
    testWidgets('claims nothing without a name', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(host(width: 600, const MPHeader(brand: <Widget>[Text('Acme')])));

      expect(
        find.descendant(of: find.byType(MPHeader), matching: find.byType(Semantics)),
        findsNothing,
      );
      handle.dispose();
    });

    testWidgets('is a named region when given a name', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(width: 600, const MPHeader(semanticLabel: 'Site', brand: <Widget>[Text('Acme')])),
      );

      final SemanticsNode node = semanticsNodeLabelled(tester, 'Site')!;

      expect(node.getSemanticsData().role, SemanticsRole.region);
      handle.dispose();
    });
  });
}
