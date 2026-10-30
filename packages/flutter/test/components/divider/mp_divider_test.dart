import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/divider/mp_divider.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// Every stretch of the rule, in the order it is laid out.
Iterable<ColoredBox> _rules(WidgetTester tester) {
  return tester.widgetList<ColoredBox>(
    find.descendant(of: find.byType(MPDivider), matching: find.byType(ColoredBox)),
  );
}

Rect _ruleRect(WidgetTester tester, int index) {
  return tester.getRect(
    find.descendant(of: find.byType(MPDivider), matching: find.byType(ColoredBox)).at(index),
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the rule', () {
    testWidgets('is a 1px hairline across its container by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider()));

      expect(tester.getSize(find.byType(MPDivider)), const Size(300, 1));
    });

    testWidgets('reads outlineVariant unless an accent is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider()));
      expect(_rules(tester).single.color, light.outlineVariant);

      await tester.pumpWidget(host(width: 300, const MPDivider(color: MPColor.error)));
      expect(_rules(tester).single.color, light.error);
    });

    testWidgets('takes a thickness', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider(thickness: 3)));

      expect(tester.getSize(find.byType(MPDivider)).height, 3);
    });

    testWidgets('runs for a length when given one', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider(length: 120)));

      expect(_ruleRect(tester, 0).width, 120);
    });

    testWidgets('runs a vertical rule the height it is given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(height: 32, const MPDivider(orientation: MPOrientation.vertical)),
      );

      expect(_ruleRect(tester, 0).size, const Size(1, 32));
    });

    testWidgets('turns a length into a height when vertical', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(height: 200, const MPDivider(orientation: MPOrientation.vertical, length: 40)),
      );

      expect(_ruleRect(tester, 0).size, const Size(1, 40));
    });
  });

  group('a label', () {
    testWidgets('is shown, with the rule on both sides', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider(child: Text('OR'))));

      expect(find.text('OR'), findsOneWidget);
      expect(_rules(tester), hasLength(2));
      expect(_ruleRect(tester, 0).right, lessThan(tester.getRect(find.text('OR')).left));
      expect(_ruleRect(tester, 1).left, greaterThan(tester.getRect(find.text('OR')).right));
    });

    testWidgets('splits the rule in half when centred', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider(child: Text('OR'))));

      expect(_ruleRect(tester, 0).width, _ruleRect(tester, 1).width);
    });

    testWidgets('leaves a short stub on the near side when off-centre', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 300, const MPDivider(textAlign: MPAlign.start, child: Text('Recent'))),
      );

      expect(_ruleRect(tester, 0).width, 16);
      expect(_ruleRect(tester, 1).width, greaterThan(16));
    });

    testWidgets('puts the stub on the right under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          textDirection: TextDirection.rtl,
          const MPDivider(textAlign: MPAlign.start, child: Text('Recent')),
        ),
      );

      expect(_ruleRect(tester, 0).width, 16);
      expect(_ruleRect(tester, 0).left, greaterThan(_ruleRect(tester, 1).left));
    });

    testWidgets('is set in the supporting role', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPDivider(child: Text('OR'))));

      expect(styleOf(tester, 'OR').color, light.onSurfaceVariant);
      expect(styleOf(tester, 'OR').fontSize, 12);
    });

    testWidgets('turns with a vertical rule', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(height: 200, const MPDivider(orientation: MPOrientation.vertical, child: Text('OR'))),
      );

      expect(find.byType(RotatedBox), findsOneWidget);
    });
  });

  group('semantics', () {
    testWidgets('names the divider from a text label, once', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPDivider(child: Text('OR'))));

      expect(semanticsLabels(tester), <String>['OR']);
      semantics.dispose();
    });

    testWidgets('leaves an unnamed rule out of the tree', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPDivider()));

      expect(semanticsLabels(tester), isEmpty);
      semantics.dispose();
    });
  });
}
