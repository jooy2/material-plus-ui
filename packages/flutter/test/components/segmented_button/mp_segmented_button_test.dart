import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/segmented_button/mp_segmented_button.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const List<MPSegment> _views = <MPSegment>[
  MPSegment(value: 'day', label: Text('Day')),
  MPSegment(value: 'week', label: Text('Week')),
  MPSegment(value: 'month', label: Text('Month')),
];

Finder _segment(String label) {
  return find.ancestor(of: find.text(label), matching: find.byType(AnimatedContainer)).first;
}

/// The whole segment, its focus node included.
Finder _root(String label) {
  return find.ancestor(of: find.text(label), matching: find.byType(MergeSemantics)).first;
}

Color? _fillOf(WidgetTester tester, String label) {
  return (tester.widget<AnimatedContainer>(_segment(label)).decoration! as BoxDecoration).color;
}

MPSelectionMarkPainter _tickOf(WidgetTester tester, String label) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: _segment(label), matching: find.byType(CustomPaint)),
      )
      .map((CustomPaint paint) => paint.painter)
      .whereType<MPSelectionMarkPainter>()
      .single;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a named group of pressed-or-not buttons', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPSegmentedButton(
            semanticLabel: 'View',
            initialValue: <String>['week'],
            items: _views,
          ),
        ),
      );

      expect(semanticsNodeLabelled(tester, 'View'), isNotNull);
      expect(
        tester.getSemantics(find.text('Week')),
        matchesSemantics(
          label: 'Week',
          isButton: true,
          hasToggledState: true,
          isToggled: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('fills the chosen segment with the secondary container', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const MPSegmentedButton(initialValue: <String>['week'], items: _views)),
      );
      await tester.pumpAndSettle();

      expect(_fillOf(tester, 'Week'), light.secondaryContainer);
      expect(_fillOf(tester, 'Day')!.a, 0);
    });

    testWidgets('keeps the tick slot whether or not anything is chosen', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPSegmentedButton(items: _views)));
      final double before = tester.getSize(_segment('Day')).width;

      await tester.tap(find.text('Day'));
      await tester.pumpAndSettle();

      expect(tester.getSize(_segment('Day')).width, before);
      expect(_tickOf(tester, 'Day').shown, 1);
      expect(_tickOf(tester, 'Week').shown, 0);
    });

    testWidgets('drops the tick when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSegmentedButton(showCheck: false, items: _views)));

      expect(
        find.descendant(
          of: find.byType(MPSegmentedButton),
          matching: find.byWidgetPredicate(
            (Widget widget) => widget is CustomPaint && widget.painter is MPSelectionMarkPainter,
          ),
        ),
        findsNothing,
      );
    });

    testWidgets('renders an icon per segment, giving way to the tick', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPSegmentedButton(
            initialValue: <String>['a'],
            items: <MPSegment>[
              MPSegment(
                value: 'a',
                label: Text('A'),
                icon: SizedBox(key: Key('a')),
              ),
              MPSegment(
                value: 'b',
                label: Text('B'),
                icon: SizedBox(key: Key('b')),
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      double opacityOf(String key) => tester
          .widget<AnimatedOpacity>(
            find.ancestor(of: find.byKey(Key(key)), matching: find.byType(AnimatedOpacity)),
          )
          .opacity;

      expect(opacityOf('a'), 0);
      expect(opacityOf('b'), 1);
    });
  });

  group('choosing', () {
    testWidgets('hands the parent every chosen value', (WidgetTester tester) async {
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(host(MPSegmentedButton(onChanged: changes.add, items: _views)));
      await tester.tap(find.text('Month'));

      expect(changes, <List<String>>[
        <String>['month'],
      ]);
    });

    testWidgets('swaps rather than adds when only one may be on', (WidgetTester tester) async {
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(host(MPSegmentedButton(onChanged: changes.add, items: _views)));
      await tester.tap(find.text('Day'));
      await tester.pump();
      await tester.tap(find.text('Week'));

      expect(changes.last, <String>['week']);
    });

    testWidgets('keeps more than one in drawn order when multiple', (WidgetTester tester) async {
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(
        host(MPSegmentedButton(multiple: true, onChanged: changes.add, items: _views)),
      );
      await tester.tap(find.text('Month'));
      await tester.pump();
      await tester.tap(find.text('Day'));

      expect(changes.last, <String>['day', 'month']);
    });

    testWidgets('takes one focus stop and moves it with the arrows', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(
        host(
          afterFocusStop(
            before,
            MPSegmentedButton(
              initialValue: const <String>['week'],
              onChanged: changes.add,
              items: _views,
            ),
          ),
        ),
      );
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(holdsFocus(tester, _root('Week')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      await tester.pump();
      expect(holdsFocus(tester, _root('Month')), isTrue);
      expect(changes, isEmpty);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(changes.last, <String>['month']);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(holdsFocus(tester, find.byType(MPSegmentedButton)), isFalse);
    });
  });

  group('states', () {
    testWidgets('disables every segment at once', (WidgetTester tester) async {
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(
        host(MPSegmentedButton(disabled: true, onChanged: changes.add, items: _views)),
      );
      await tester.tap(find.text('Day'));

      expect(changes, isEmpty);
    });

    testWidgets('disables one segment without touching the rest', (WidgetTester tester) async {
      final List<List<String>> changes = <List<String>>[];

      await tester.pumpWidget(
        host(
          MPSegmentedButton(
            onChanged: changes.add,
            items: const <MPSegment>[
              MPSegment(value: 'a', label: Text('A')),
              MPSegment(value: 'b', label: Text('B'), disabled: true),
            ],
          ),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.tap(find.text('A'));

      expect(changes, <List<String>>[
        <String>['a'],
      ]);
    });
  });

  group('the size ladder', () {
    testWidgets('is MD3’s 40dp at md, on a ladder of its own', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPSegmentedButton(size: size, items: _views)));
        heights.add(tester.getSize(find.byType(MPSegmentedButton)).height);
      }

      expect(heights, <double>[32, 36, 40, 48, 56]);
    });

    testWidgets('gives up width in proportion rather than running off the edge', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPSegmentedButton(items: _views)));
      final double natural = tester.getSize(find.byType(MPSegmentedButton)).width;

      await tester.pumpWidget(host(width: natural / 2, const MPSegmentedButton(items: _views)));

      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(MPSegmentedButton)).width, lessThanOrEqualTo(natural / 2));
    });

    testWidgets('divides the width evenly when fullWidth', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 302,
          const MPSegmentedButton(
            fullWidth: true,
            items: <MPSegment>[
              MPSegment(value: 'a', label: Text('A')),
              MPSegment(value: 'b', label: Text('A much longer label')),
            ],
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPSegmentedButton)).width, 302);
      expect(tester.getSize(_segment('A')).width, 150);
      expect(tester.getSize(_segment('A much longer label')).width, 150);
    });
  });
}
