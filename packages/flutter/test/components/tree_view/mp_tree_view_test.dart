import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/tree_view/mp_tree_view.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const List<MPTreeItem> _files = <MPTreeItem>[
  MPTreeItem(
    value: 'src',
    label: Text('src'),
    children: <MPTreeItem>[
      MPTreeItem(
        value: 'components',
        label: Text('components'),
        children: <MPTreeItem>[
          MPTreeItem(value: 'button', label: Text('Button.tsx')),
          MPTreeItem(value: 'card', label: Text('Card.tsx')),
        ],
      ),
      MPTreeItem(value: 'index', label: Text('index.ts')),
    ],
  ),
  MPTreeItem(value: 'readme', label: Text('README.md')),
];

Widget _tree({
  List<Object>? initialExpanded,
  List<Object>? expanded,
  List<Object>? selected,
  ValueChanged<List<Object>>? onExpandedChange,
  ValueChanged<List<Object>>? onSelectedChange,
  bool multiple = false,
  MPTreeViewLines lines = MPTreeViewLines.simple,
  MPDensity? density,
  List<MPTreeItem> children = _files,
}) {
  return MPTreeView(
    label: 'Files',
    initialExpanded: initialExpanded,
    expanded: expanded,
    selected: selected,
    onExpandedChange: onExpandedChange,
    onSelectedChange: onSelectedChange,
    multiple: multiple,
    lines: lines,
    density: density,
    children: children,
  );
}

/// Whichever row holds the primary focus, by its label.
String? _focused(WidgetTester tester) {
  final BuildContext? context = FocusManager.instance.primaryFocus?.context;

  if (context == null) {
    return null;
  }

  String? label;

  void visit(Element element) {
    if (label != null) {
      return;
    }

    if (element.widget is Text) {
      label = (element.widget as Text).data;

      return;
    }

    element.visitChildren(visit);
  }

  (context as Element).visitChildren(visit);

  return label;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('structure', () {
    testWidgets('draws a shut branch not at all', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, _tree()));

      expect(find.text('src'), findsOneWidget);
      expect(find.text('components'), findsNothing);
    });

    testWidgets('names the tree, and says which rows are open and chosen', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 360, _tree(initialExpanded: <Object>['src'], selected: <Object>['index'])),
      );

      expect(find.bySemanticsLabel('Files'), findsOneWidget);

      final SemanticsData src = tester.getSemantics(find.text('src')).getSemanticsData();

      expect(src.flagsCollection.isExpanded, Tristate.isTrue);
      expect(
        tester.getSemantics(find.text('index.ts')).getSemanticsData().flagsCollection.isSelected,
        Tristate.isTrue,
      );
      semantics.dispose();
    });

    testWidgets('has exactly one tab stop', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(width: 360, afterFocusStop(before, _tree(initialExpanded: <Object>['src']))),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(_focused(tester), 'src');

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(holdsFocus(tester, find.byType(MPTreeView)), isFalse);
    });

    testWidgets('sets each level in by one indent', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, _tree(initialExpanded: <Object>['src'])));

      expect(
        tester.getTopLeft(find.text('index.ts')).dx - tester.getTopLeft(find.text('src')).dx,
        20,
      );
    });
  });

  group('pressing', () {
    testWidgets('opens and shuts a branch, and chooses the row as well', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(host(width: 360, _tree(onSelectedChange: chosen.add)));

      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();
      expect(find.text('components'), findsOneWidget);
      expect(chosen.last, <Object>['src']);

      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();
      expect(find.text('components'), findsNothing);
    });

    testWidgets('opens a branch from the arrow without choosing the row', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(host(width: 360, _tree(onSelectedChange: chosen.add)));

      await tester.tap(find.byType(MPGlyph).first);
      await tester.pumpAndSettle();

      expect(find.text('components'), findsOneWidget);
      expect(chosen, isEmpty);
    });

    testWidgets('keeps one row chosen, and toggles when more than one may be', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(host(width: 360, _tree(onSelectedChange: chosen.add)));
      await tester.tap(find.text('README.md'));
      await tester.tap(find.text('README.md'));
      expect(chosen.last, <Object>['readme']);

      chosen.clear();
      await tester.pumpWidget(
        host(
          width: 360,
          KeyedSubtree(
            key: const Key('multiple'),
            child: _tree(multiple: true, onSelectedChange: chosen.add),
          ),
        ),
      );
      await tester.tap(find.text('README.md'));
      await tester.pump();
      await tester.tap(find.text('README.md'));
      await tester.pump();
      expect(chosen.last, isEmpty);
    });

    testWidgets('says what it is told when it is controlled', (WidgetTester tester) async {
      final List<List<Object>> opened = <List<Object>>[];

      await tester.pumpWidget(
        host(width: 360, _tree(expanded: <Object>[], onExpandedChange: opened.add)),
      );

      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();

      expect(opened, <List<Object>>[
        <Object>['src'],
      ]);
      expect(find.text('components'), findsNothing);
    });

    testWidgets('fills a chosen row with secondaryContainer', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, _tree(selected: <Object>['readme'])));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'README.md').color, light.onSecondaryContainer);
    });

    testWidgets('draws an arrow on a branch that has no rows yet', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          _tree(
            children: const <MPTreeItem>[
              MPTreeItem(value: 'lazy', label: Text('Lazy'), expandable: true),
              MPTreeItem(value: 'leaf', label: Text('Leaf')),
            ],
          ),
        ),
      );

      expect(find.byType(MPGlyph), findsOneWidget);
    });

    testWidgets('stops a disabled row answering, and draws it disabled', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(
        host(
          width: 360,
          _tree(
            onSelectedChange: chosen.add,
            children: const <MPTreeItem>[
              MPTreeItem(
                value: 'off',
                label: Text('Off'),
                disabled: true,
                children: <MPTreeItem>[MPTreeItem(label: Text('Inside'))],
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();

      expect(chosen, isEmpty);
      expect(find.text('Inside'), findsNothing);
      expect(
        styleOf(tester, 'Off').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });

    testWidgets('keeps an action out of the pressable area', (WidgetTester tester) async {
      int actions = 0;
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(
        host(
          width: 360,
          _tree(
            onSelectedChange: chosen.add,
            children: <MPTreeItem>[
              MPTreeItem(
                value: 'row',
                label: const Text('Row'),
                action: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => actions++,
                  child: const SizedBox(key: Key('action'), width: 24, height: 24),
                ),
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('action')));

      expect(actions, 1);
      expect(chosen, isEmpty);
    });
  });

  group('the keyboard', () {
    Future<void> focusFirst(WidgetTester tester) async {
      Focus.of(tester.element(find.text('src'))).requestFocus();
      await tester.pump();
    }

    testWidgets('walks the rows that are showing with Up, Down, Home and End', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 360, _tree(initialExpanded: <Object>['src'])));
      await focusFirst(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(_focused(tester), 'components');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(_focused(tester), 'index.ts');

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(_focused(tester), 'README.md');

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(_focused(tester), 'src');
    });

    testWidgets('opens with Right and steps into the branch on the next press', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 360, _tree()));
      await focusFirst(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(find.text('components'), findsOneWidget);
      expect(_focused(tester), 'src');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(_focused(tester), 'components');
    });

    testWidgets('shuts with Left, and steps out of a leaf to its parent', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 360, _tree(initialExpanded: <Object>['src'])));
      await focusFirst(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(_focused(tester), 'index.ts');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pump();
      expect(_focused(tester), 'src');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(find.text('index.ts'), findsNothing);
    });

    testWidgets('swaps Right and Left under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, textDirection: TextDirection.rtl, _tree()));
      await focusFirst(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('components'), findsOneWidget);
    });

    testWidgets('presses the row with Enter and with Space', (WidgetTester tester) async {
      final List<List<Object>> chosen = <List<Object>>[];

      await tester.pumpWidget(host(width: 360, _tree(onSelectedChange: chosen.add)));
      await focusFirst(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(find.text('components'), findsOneWidget);
      expect(chosen.last, <Object>['src']);

      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(find.text('components'), findsNothing);
    });
  });

  group('lines and density', () {
    int rails(WidgetTester tester) {
      return tester
          .widgetList<CustomPaint>(find.byType(CustomPaint))
          .where((CustomPaint paint) => paint.painter?.runtimeType.toString() == '_Rail')
          .length;
    }

    testWidgets('draws the rails only when it is asked to', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, _tree(initialExpanded: <Object>['src'])));
      expect(rails(tester), 2);

      await tester.pumpWidget(
        host(width: 360, _tree(initialExpanded: <Object>['src'], lines: MPTreeViewLines.none)),
      );
      expect(rails(tester), 0);
    });

    testWidgets('tightens the rows with density and leaves the type alone', (
      WidgetTester tester,
    ) async {
      Future<double> rowHeight(MPDensity density) async {
        await tester.pumpWidget(host(width: 360, _tree(density: density)));

        return tester
            .getSize(
              find.ancestor(of: find.text('README.md'), matching: find.byType(AnimatedContainer)),
            )
            .height;
      }

      expect(await rowHeight(0), 40);
      expect(await rowHeight(-2), 32);
      expect(styleOf(tester, 'README.md').fontSize, 16);
    });
  });
}
