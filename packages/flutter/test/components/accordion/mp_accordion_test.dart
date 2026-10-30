import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/accordion/mp_accordion.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

Widget _three({
  bool multiple = false,
  List<Object>? value,
  List<Object>? initialValue,
  ValueChanged<List<Object>>? onChanged,
  bool dividers = true,
  bool disabled = false,
  MPSize? size,
  MPDensity? density,
  int headingLevel = 3,
  bool disableSecond = false,
}) {
  return MPAccordion(
    multiple: multiple,
    value: value,
    initialValue: initialValue,
    onChanged: onChanged,
    dividers: dividers,
    disabled: disabled,
    size: size,
    density: density,
    headingLevel: headingLevel,
    children: <Widget>[
      const MPAccordionItem(value: 'a', title: Text('First'), child: Text('Body A')),
      MPAccordionItem(
        value: 'b',
        disabled: disableSecond,
        title: const Text('Second'),
        child: const Text('Body B'),
      ),
      const MPAccordionItem(value: 'c', title: Text('Third'), child: Text('Body C')),
    ],
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('renders a trigger per section', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three()));

      expect(find.text('First'), findsOneWidget);
      expect(find.text('Second'), findsOneWidget);
      expect(find.text('Third'), findsOneWidget);
    });

    testWidgets('hands every section the rung the stack was given', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three(size: MPSize.lg)));

      // `titleLarge` on every title.
      for (final String title in <String>['First', 'Second', 'Third']) {
        expect(styleOf(tester, title).fontSize, 22, reason: title);
      }
    });
  });

  group('folding', () {
    testWidgets('opens a section when its trigger is pressed', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three()));

      expect(find.text('Body A'), findsNothing);

      await tester.tap(find.text('First'));
      await tester.pumpAndSettle();

      expect(find.text('Body A'), findsOneWidget);
    });

    testWidgets('closes the last one as the next opens', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three(initialValue: <Object>['a'])));

      expect(find.text('Body A'), findsOneWidget);

      await tester.tap(find.text('Second'));
      await tester.pumpAndSettle();

      expect(find.text('Body A'), findsNothing);
      expect(find.text('Body B'), findsOneWidget);
    });

    testWidgets('keeps both open when told it may', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, _three(multiple: true, initialValue: <Object>['a'])),
      );

      await tester.tap(find.text('Second'));
      await tester.pumpAndSettle();

      expect(find.text('Body A'), findsOneWidget);
      expect(find.text('Body B'), findsOneWidget);
    });

    testWidgets('reports the whole open set, not the section that changed', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> changes = <List<Object>>[];

      await tester.pumpWidget(
        host(
          width: 400,
          _three(multiple: true, initialValue: <Object>['a'], onChanged: changes.add),
        ),
      );

      await tester.tap(find.text('Third'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('First'));
      await tester.pumpAndSettle();

      expect(changes, <List<Object>>[
        <Object>['a', 'c'],
        <Object>['c'],
      ]);
    });

    testWidgets('opens whatever a controlled caller says is open', (WidgetTester tester) async {
      final List<List<Object>> changes = <List<Object>>[];

      await tester.pumpWidget(
        host(width: 400, _three(value: <Object>['c'], onChanged: changes.add)),
      );

      expect(find.text('Body C'), findsOneWidget);

      await tester.tap(find.text('First'));
      await tester.pumpAndSettle();

      // Asked, and left where it was.
      expect(changes, <List<Object>>[
        <Object>['a'],
      ]);
      expect(find.text('Body A'), findsNothing);
      expect(find.text('Body C'), findsOneWidget);
    });

    testWidgets('disables every section at once from the stack', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three(disabled: true)));

      await tester.tap(find.text('First'));
      await tester.pumpAndSettle();

      expect(find.text('Body A'), findsNothing);
    });

    testWidgets('disables one section without touching the rest', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three(disableSecond: true)));

      await tester.tap(find.text('Second'));
      await tester.pumpAndSettle();
      expect(find.text('Body B'), findsNothing);
      expect(
        styleOf(tester, 'Second').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );

      await tester.tap(find.text('Third'));
      await tester.pumpAndSettle();
      expect(find.text('Body C'), findsOneWidget);
    });

    testWidgets('works without values, by identity', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPAccordion(
            children: <Widget>[
              MPAccordionItem(title: Text('First'), child: Text('Body A')),
              MPAccordionItem(title: Text('Second'), child: Text('Body B')),
            ],
          ),
        ),
      );

      await tester.tap(find.text('First'));
      await tester.pumpAndSettle();
      expect(find.text('Body A'), findsOneWidget);
      expect(find.text('Body B'), findsNothing);

      await tester.tap(find.text('Second'));
      await tester.pumpAndSettle();
      expect(find.text('Body A'), findsNothing);
      expect(find.text('Body B'), findsOneWidget);
    });
  });

  group('the header', () {
    testWidgets('keeps action outside the trigger, so both can be pressed', (
      WidgetTester tester,
    ) async {
      int actions = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          MPAccordion(
            children: <Widget>[
              MPAccordionItem(
                title: const Text('First'),
                action: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => actions++,
                  child: const SizedBox(key: Key('action'), width: 40, height: 24),
                ),
                child: const Text('Body A'),
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('action')));
      await tester.pumpAndSettle();

      expect(actions, 1);
      expect(find.text('Body A'), findsNothing);
    });
  });

  group('dividers', () {
    int rules(WidgetTester tester) {
      return tester
          .widgetList<DecoratedBox>(find.byType(DecoratedBox))
          .map((DecoratedBox box) => box.decoration)
          .whereType<BoxDecoration>()
          .where((BoxDecoration decoration) {
            final BoxBorder? border = decoration.border;

            return border is Border &&
                border.top.color == light.outlineVariant &&
                border.left == BorderSide.none;
          })
          .length;
    }

    testWidgets('rules the sections by default, and clips the sheet', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _three()));

      expect(rules(tester), 2);
      expect(find.byType(ClipRRect), findsOneWidget);
    });

    testWidgets('turns the sections into tiles when the rules are dropped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, _three(dividers: false)));

      expect(rules(tester), 0);

      final Iterable<BorderRadius> corners = tester
          .widgetList<MPStateLayer>(find.byType(MPStateLayer))
          .map((MPStateLayer layer) => layer.borderRadius);

      expect(corners.toSet(), <BorderRadius>{BorderRadius.circular(8)});
    });
  });

  group('density', () {
    testWidgets('takes room from the header and from under the body', (WidgetTester tester) async {
      Future<double> height(MPDensity density) async {
        await tester.pumpWidget(
          host(width: 400, _three(density: density, initialValue: <Object>['a'])),
        );
        await tester.pumpAndSettle();

        return tester.getSize(find.byType(MPAccordion)).height;
      }

      final double roomy = await height(0);
      final double dense = await height(-2);

      // Four faces in each of three headers, and one under the open body, at
      // four pixels a face.
      expect(roomy - dense, 4 * 2 * 3 + 4);
    });
  });

  group('headingLevel', () {
    testWidgets('announces each title as a level-3 heading by default', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _three()));

      final SemanticsData data = tester.getSemantics(find.text('First')).getSemanticsData();

      expect(data.flagsCollection.isHeader, isTrue);
      expect(data.headingLevel, 3);
      semantics.dispose();
    });

    testWidgets('announces them at the level the screen asks for', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _three(headingLevel: 2)));

      expect(tester.getSemantics(find.text('First')).getSemanticsData().headingLevel, 2);
      semantics.dispose();
    });
  });
}
