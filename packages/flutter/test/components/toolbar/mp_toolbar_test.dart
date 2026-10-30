import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/toolbar/mp_toolbar.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks of `MPToolbar`, asked of the render
/// tree: a slot's place becomes a measured rectangle, and a class name becomes
/// the decoration the bar built.

Rect _rectOf(WidgetTester tester, Finder finder) => tester.getRect(finder);

/// The outer sheet's decoration: the fill, the outline, the corners and the
/// shadow.
BoxDecoration _sheetOf(WidgetTester tester) {
  final Container sheet = tester.widget<Container>(
    find.descendant(of: find.byType(MPToolbar), matching: find.byType(Container)).first,
  );

  return sheet.decoration! as BoxDecoration;
}

/// The inner box, which carries the divider when there is one.
Container _innerOf(WidgetTester tester) {
  return tester.widget<Container>(
    find.descendant(of: find.byType(MPToolbar), matching: find.byType(Container)).at(1),
  );
}

const Widget _start = SizedBox(key: Key('start'), width: 40, height: 20);
const Widget _end = SizedBox(key: Key('end'), width: 60, height: 20);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the row', () {
    testWidgets('pins the two ends and gives the middle what is left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(
            start: _start,
            end: _end,
            child: SizedBox(key: Key('middle'), width: 10, height: 20),
          ),
        ),
      );

      final Rect bar = _rectOf(tester, find.byType(MPToolbar));
      // The outlined default's hairline takes its pixel, as a CSS border does.
      const double inset = 16 + 1;

      expect(_rectOf(tester, find.byKey(const Key('start'))).left, bar.left + inset);
      expect(_rectOf(tester, find.byKey(const Key('end'))).right, bar.right - inset);
      expect(
        _rectOf(tester, find.byKey(const Key('middle'))).left,
        _rectOf(tester, find.byKey(const Key('start'))).right + 12,
      );
    });

    testWidgets('keeps the ends at their ends with nothing in the middle', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(start: _start, end: _end)));

      final double gap =
          _rectOf(tester, find.byKey(const Key('end'))).left -
          _rectOf(tester, find.byKey(const Key('start'))).right;

      expect(gap, greaterThan(100));
    });

    testWidgets('puts the middle at the start of its room, and turns round under RTL', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          textDirection: TextDirection.rtl,
          const MPToolbar(
            start: _start,
            child: SizedBox(key: Key('middle'), width: 10, height: 20),
          ),
        ),
      );

      final Rect start = _rectOf(tester, find.byKey(const Key('start')));
      final Rect middle = _rectOf(tester, find.byKey(const Key('middle')));

      expect(start.right, _rectOf(tester, find.byType(MPToolbar)).right - 17);
      expect(middle.right, start.left - 12);
    });

    testWidgets('is as tall as what is in it', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(child: SizedBox(height: 80))));

      expect(tester.getSize(find.byType(MPToolbar)).height, 80 + (16 + 1) * 2);
    });

    testWidgets('tightens the padding with density and moves no type', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPToolbar(variant: MPVariant.text, child: SizedBox(height: 20))),
      );
      final double loose = tester.getSize(find.byType(MPToolbar)).height;
      final TextStyle looseType = DefaultTextStyle.of(
        tester.element(find.byType(SizedBox).last),
      ).style;

      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(variant: MPVariant.text, density: -2, child: SizedBox(height: 20)),
        ),
      );
      final double dense = tester.getSize(find.byType(MPToolbar)).height;
      final TextStyle denseType = DefaultTextStyle.of(
        tester.element(find.byType(SizedBox).last),
      ).style;

      // 16 a face at md, 12 a face two steps in.
      expect(loose, 20 + 16 * 2);
      expect(dense, 20 + 12 * 2);
      expect(denseType.fontSize, looseType.fontSize);
    });

    testWidgets('takes its size and density from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPConfigProvider(
            size: MPSize.xs,
            density: -1,
            child: MPToolbar(variant: MPVariant.text, child: SizedBox(height: 20)),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPToolbar)).height, 20 + 8 * 2);
    });
  });

  group('the sheet', () {
    testWidgets('is outlined by default, in outline-variant', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(child: Text('Middle'))));

      final Border border = _sheetOf(tester).border! as Border;

      expect(border.top.color, light.outlineVariant);
      expect(_sheetOf(tester).color, const Color(0x00000000));
    });

    testWidgets('stays neutral whatever weight it paints', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPToolbar(variant: MPVariant.filled, child: Text('Middle'))),
      );

      expect(_sheetOf(tester).color, light.surfaceContainerHighest);
    });

    testWidgets('is flat until it is asked not to be', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(child: Text('Middle'))));

      expect(_sheetOf(tester).boxShadow, isEmpty);

      await tester.pumpWidget(
        host(width: 400, const MPToolbar(elevation: 2, child: Text('Middle'))),
      );

      expect(_sheetOf(tester).boxShadow, MPShadows.of(2));
      expect(_sheetOf(tester).color, light.surfaceContainer);
    });

    testWidgets('is a sheet with corners until it is held against an edge', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(child: Text('Middle'))));

      expect(_sheetOf(tester).borderRadius, BorderRadius.circular(12));

      await tester.pumpWidget(
        host(width: 400, const MPToolbar(rounded: false, child: Text('Middle'))),
      );

      expect(_sheetOf(tester).borderRadius, BorderRadius.zero);
    });

    testWidgets('writes what is in it in on-surface', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPToolbar(child: Text('Middle'))));

      expect(styleOf(tester, 'Middle').color, light.onSurface);
    });
  });

  group('divider', () {
    testWidgets('faces the content, and moves with the side', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(variant: MPVariant.text, divider: true, child: Text('Middle')),
        ),
      );

      Border border = (_innerOf(tester).decoration! as BoxDecoration).border! as Border;

      expect(border.bottom.color, light.outlineVariant);
      expect(border.bottom.width, 1);
      expect(border.top, BorderSide.none);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(
            variant: MPVariant.text,
            divider: true,
            side: MPToolbarSide.bottom,
            child: Text('Middle'),
          ),
        ),
      );

      border = (_innerOf(tester).decoration! as BoxDecoration).border! as Border;

      expect(border.top.color, light.outlineVariant);
      expect(border.bottom, BorderSide.none);
    });

    testWidgets('takes its pixel, as a CSS border does', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(variant: MPVariant.text, divider: true, child: SizedBox(height: 20)),
        ),
      );

      expect(tester.getSize(find.byType(MPToolbar)).height, 20 + 16 * 2 + 1);
    });

    testWidgets('is not drawn twice on a bar that is already outlined', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPToolbar(divider: true, child: SizedBox(height: 20))),
      );

      expect(_innerOf(tester).decoration, isNull);
      expect(tester.getSize(find.byType(MPToolbar)).height, 20 + (16 + 1) * 2);
    });

    testWidgets('is clipped to the corners of a rounded sheet', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPToolbar(variant: MPVariant.filled, divider: true, child: Text('Middle')),
        ),
      );

      final Container sheet = tester.widget<Container>(
        find.descendant(of: find.byType(MPToolbar), matching: find.byType(Container)).first,
      );

      expect(sheet.clipBehavior, Clip.antiAlias);
    });
  });

  group('accessibility', () {
    testWidgets('claims nothing about its own keyboard behaviour', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, const MPToolbar(child: Text('Middle'))));

      expect(tester.getSemantics(find.text('Middle')).label, 'Middle');
      // No stop of its own and no node that takes the arrow keys.
      expect(
        find.descendant(of: find.byType(MPToolbar), matching: find.byType(Focus)),
        findsNothing,
      );

      handle.dispose();
    });

    testWidgets('takes a name of its own when it is given one', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPToolbar(semanticLabel: 'Editor', child: Text('Middle'))),
      );

      expect(semanticsLabels(tester), containsAllInOrder(<String>['Editor', 'Middle']));

      handle.dispose();
    });
  });
}
