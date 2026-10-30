import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/tree_select/mp_tree_select.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPTreeSelect`, asked of the render tree.

const List<MPTreeSelectItem> _items = <MPTreeSelectItem>[
  MPTreeSelectItem(
    value: 'europe',
    label: Text('Europe'),
    children: <MPTreeSelectItem>[
      MPTreeSelectItem(value: 'france', label: Text('France')),
      MPTreeSelectItem(value: 'spain', label: Text('Spain')),
    ],
  ),
  MPTreeSelectItem(
    value: 'asia',
    label: Text('Asia'),
    children: <MPTreeSelectItem>[
      MPTreeSelectItem(
        value: 'korea',
        label: Text('Korea'),
        children: <MPTreeSelectItem>[MPTreeSelectItem(value: 'seoul', label: Text('Seoul'))],
      ),
      MPTreeSelectItem(value: 'japan', label: Text('Japan'), disabled: true),
    ],
  ),
];

/// A parent that keeps the values and shows them.
class _Parent extends StatefulWidget {
  const _Parent({
    this.initial = const <Object>[],
    this.items = _items,
    this.multiple = false,
    this.selectableBranches = false,
    this.initialExpanded = const <Object>[],
    this.searchable = false,
    this.clearable = false,
    this.readOnly = false,
    this.closeOnSelect,
    this.format,
  });

  final List<Object> initial;
  final List<MPTreeSelectItem> items;
  final bool multiple;
  final bool selectableBranches;
  final List<Object> initialExpanded;
  final bool searchable;
  final bool clearable;
  final bool readOnly;
  final bool? closeOnSelect;
  final String Function(List<MPTreeSelectItem> chosen)? format;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  late List<Object> value = widget.initial;
  int reports = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPTreeSelect(
          label: const Text('Region'),
          items: widget.items,
          value: value,
          onChanged: (List<Object> next) => setState(() {
            value = next;
            reports += 1;
          }),
          multiple: widget.multiple,
          selectableBranches: widget.selectableBranches,
          initialExpanded: widget.initialExpanded,
          searchable: widget.searchable,
          clearable: widget.clearable,
          readOnly: widget.readOnly,
          closeOnSelect: widget.closeOnSelect,
          format: widget.format,
        ),
        Text('model: ${value.join(',')} ($reports)'),
      ],
    );
  }
}

/// A row of the open tree, by its label.
Finder _row(String label) {
  return find.descendant(
    of: find.byWidgetPredicate((Widget widget) => widget.runtimeType.toString() == '_TreeRow'),
    matching: find.text(label),
  );
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPFieldShell));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('opens a tree behind a field', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const _Parent(initialExpanded: <Object>['europe']), overlay: true),
    );

    expect(_row('Europe'), findsNothing);

    await _open(tester);

    expect(_row('Europe'), findsOneWidget);
    expect(_row('France'), findsOneWidget);
  });

  testWidgets('will not choose a branch unless it is allowed to', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(), overlay: true));
    await _open(tester);
    await tester.tap(_row('Europe'));
    await tester.pumpAndSettle();

    // It opened rather than answering, and the popup stayed up.
    expect(_row('France'), findsOneWidget);
    expect(find.text('model:  (0)'), findsOneWidget);
  });

  testWidgets('leaves what is held alone when a heading is pressed', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const _Parent(initial: <Object>['france'], initialExpanded: <Object>['europe']),
        overlay: true,
      ),
    );
    await _open(tester);
    await tester.tap(_row('Asia'));
    await tester.pumpAndSettle();

    expect(_row('Korea'), findsOneWidget);
    expect(find.text('model: france (0)'), findsOneWidget);
  });

  testWidgets('chooses a branch once it is told branches count', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(selectableBranches: true), overlay: true));
    await _open(tester);
    await tester.tap(_row('Europe'));
    await tester.pumpAndSettle();

    expect(find.text('model: europe (1)'), findsOneWidget);
  });

  testWidgets('lets one item overrule the rule either way', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const _Parent(
          items: <MPTreeSelectItem>[
            MPTreeSelectItem(
              value: 'europe',
              label: Text('Europe'),
              selectable: true,
              children: <MPTreeSelectItem>[
                MPTreeSelectItem(value: 'france', label: Text('France'), selectable: false),
              ],
            ),
          ],
        ),
        overlay: true,
      ),
    );
    await _open(tester);
    await tester.tap(_row('Europe'));
    await tester.pumpAndSettle();

    expect(find.text('model: europe (1)'), findsOneWidget);
  });

  testWidgets('holds a leaf, writes it in the trigger and closes', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(
      host(const _Parent(initialExpanded: <Object>['europe']), overlay: true),
    );
    await _open(tester);
    await tester.tap(_row('France'));
    await tester.pumpAndSettle();

    expect(find.text('model: france (1)'), findsOneWidget);
    expect(_row('France'), findsNothing);
    expect(semanticsOf(tester, find.byType(MPTreeSelect)).value, 'France');

    handle.dispose();
  });

  testWidgets('stays open, and keeps every choice, when more than one may be held', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const _Parent(multiple: true, initialExpanded: <Object>['europe']), overlay: true),
    );
    await _open(tester);
    await tester.tap(_row('France'));
    await tester.pumpAndSettle();
    await tester.tap(_row('Spain'));
    await tester.pumpAndSettle();

    expect(_row('France'), findsOneWidget);
    expect(find.text('model: france,spain (2)'), findsOneWidget);

    // Pressed again, a chosen row lets go.
    await tester.tap(_row('France'));
    await tester.pumpAndSettle();

    expect(find.text('model: spain (3)'), findsOneWidget);
  });

  testWidgets('keeps only the last choice unless it may hold more than one', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const _Parent(initialExpanded: <Object>['europe'], closeOnSelect: false), overlay: true),
    );
    await _open(tester);
    await tester.tap(_row('France'));
    await tester.pumpAndSettle();
    await tester.tap(_row('Spain'));
    await tester.pumpAndSettle();

    expect(find.text('model: spain (2)'), findsOneWidget);
  });

  testWidgets('refuses a disabled node', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(host(const _Parent(initialExpanded: <Object>['asia']), overlay: true));
    await _open(tester);

    expect(
      semanticsNodeLabelled(tester, 'Japan')!.getSemanticsData().flagsCollection.isEnabled,
      Tristate.isFalse,
    );

    await tester.tap(_row('Japan'));
    await tester.pumpAndSettle();

    expect(find.text('model:  (0)'), findsOneWidget);

    handle.dispose();
  });

  testWidgets('keeps the ancestors of a match, and opens every branch it kept', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const _Parent(searchable: true), overlay: true));
    await _open(tester);
    await tester.enterText(find.byType(EditableText), 'seo');
    await tester.pumpAndSettle();

    expect(_row('Asia'), findsOneWidget);
    expect(_row('Korea'), findsOneWidget);
    expect(_row('Seoul'), findsOneWidget);
    expect(_row('Europe'), findsNothing);
    expect(_row('Japan'), findsNothing);
  });

  testWidgets('keeps everything under a branch that matched', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(searchable: true), overlay: true));
    await _open(tester);
    await tester.enterText(find.byType(EditableText), 'EUROPE');
    await tester.pumpAndSettle();

    expect(_row('France'), findsOneWidget);
    expect(_row('Spain'), findsOneWidget);
  });

  testWidgets('says so when a search matched nothing', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(searchable: true), overlay: true));
    await _open(tester);
    await tester.enterText(find.byType(EditableText), 'zzz');
    await tester.pumpAndSettle();

    expect(find.text('No matches'), findsOneWidget);
  });

  testWidgets('forgets the search when it closes', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(searchable: true), overlay: true));
    await _open(tester);
    await tester.enterText(find.byType(EditableText), 'seo');
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    await _open(tester);

    expect(_row('Europe'), findsOneWidget);
  });

  testWidgets('names the filter with the word that is already written down', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const _Parent(searchable: true), overlay: true));
    await _open(tester);

    expect(find.text('Search'), findsOneWidget);
  });

  testWidgets('offers no search field unless it is asked for', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(), overlay: true));
    await _open(tester);

    expect(find.byType(EditableText), findsNothing);
  });

  testWidgets('empties when the × is pressed', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const _Parent(initial: <Object>['france'], clearable: true), overlay: true),
    );

    await tester.tap(find.bySemanticsLabel('Clear'));
    await tester.pumpAndSettle();

    expect(find.text('model:  (1)'), findsOneWidget);
  });

  testWidgets('does not open while it is read-only', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(readOnly: true), overlay: true));
    await _open(tester);

    expect(_row('Europe'), findsNothing);
  });

  testWidgets('writes what is held however the caller says', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        _Parent(
          initial: const <Object>['france', 'seoul'],
          multiple: true,
          format: (List<MPTreeSelectItem> chosen) => '${chosen.length} regions',
        ),
        overlay: true,
      ),
    );

    expect(find.text('2 regions'), findsOneWidget);
  });

  testWidgets('walks the rows with the arrow keys and chooses with Enter', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const _Parent(), overlay: true));
    await _open(tester);

    // The focus went into the tree as it opened, on its first row.
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();

    expect(_row('France'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(find.text('model: spain (1)'), findsOneWidget);
  });

  testWidgets('steps out to the parent and shuts it with the arrow back', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const _Parent(), overlay: true));
    await _open(tester);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
    await tester.pumpAndSettle();

    expect(_row('France'), findsNothing);
  });

  testWidgets('holds a submit back while it is required and empty', (WidgetTester tester) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
    Map<String, Object?>? submitted;

    await tester.pumpWidget(
      host(
        width: 300,
        overlay: true,
        MPForm(
          key: form,
          onSubmit: (Map<String, Object?> values) => submitted = values,
          children: const <Widget>[
            MPTreeSelect(
              name: 'region',
              label: Text('Region'),
              items: _items,
              required: true,
              initialExpanded: <Object>['europe'],
            ),
          ],
        ),
      ),
    );

    expect(form.currentState!.submit(), isFalse);
    await tester.pump();

    expect(find.text('Required'), findsOneWidget);

    await _open(tester);
    await tester.tap(_row('Spain'));
    await tester.pumpAndSettle();

    expect(form.currentState!.submit(), isTrue);
    expect(submitted, <String, Object?>{
      'region': <Object>['spain'],
    });
  });

  testWidgets('draws the trigger on the rungs a text field uses', (WidgetTester tester) async {
    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(
        host(MPTreeSelect(label: const Text('Region'), items: _items, size: size), overlay: true),
      );

      expect(
        tester.getSize(find.byType(MPFieldShell)).height,
        MPFieldMetrics.of(size).height,
        reason: '$size',
      );
    }
  });
}
