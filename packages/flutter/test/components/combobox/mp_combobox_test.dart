import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/chip/mp_chip.dart';
import 'package:material_plus_ui/src/components/combobox/mp_combobox.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/select_trigger.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPCombobox`, asked of the render tree.

const List<MPComboboxOption> _fruit = <MPComboboxOption>[
  MPComboboxOption(value: 'apple', label: 'Apple'),
  MPComboboxOption(value: 'banana', label: 'Banana'),
  MPComboboxOption(value: 'cherry', label: 'Cherry', disabled: true),
];

/// A parent that keeps one value, as the React suite's `Single` does.
class _Single extends StatefulWidget {
  const _Single({
    this.initial,
    this.allowCustom = true,
    this.customLabel,
    this.emptyMessage,
    this.clearable = false,
    this.errorMessage,
    this.description,
    this.disabled = false,
    this.onInputValueChange,
    this.onKeyEvent,
    this.onFocusChange,
    this.focusNode,
  });

  final MPComboboxValue? initial;
  final bool allowCustom;
  final Widget Function(String query)? customLabel;
  final Widget? emptyMessage;
  final bool clearable;
  final Widget? errorMessage;
  final Widget? description;
  final bool disabled;
  final ValueChanged<String>? onInputValueChange;
  final FocusOnKeyEventCallback? onKeyEvent;
  final ValueChanged<bool>? onFocusChange;
  final FocusNode? focusNode;

  @override
  State<_Single> createState() => _SingleState();
}

class _SingleState extends State<_Single> {
  late MPComboboxValue? value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPCombobox(
          items: _fruit,
          label: const Text('Fruit'),
          value: value,
          onChanged: (MPComboboxValue? next) => setState(() => value = next),
          allowCustom: widget.allowCustom,
          customLabel: widget.customLabel,
          emptyMessage: widget.emptyMessage,
          clearable: widget.clearable,
          errorMessage: widget.errorMessage,
          description: widget.description,
          disabled: widget.disabled,
          onInputValueChange: widget.onInputValueChange,
          onKeyEvent: widget.onKeyEvent,
          onFocusChange: widget.onFocusChange,
          focusNode: widget.focusNode,
        ),
        Text('model: $value'),
      ],
    );
  }
}

/// A parent that keeps a set, as the React suite's `Multi` does.
class _Multi extends StatefulWidget {
  const _Multi({this.initial = const <MPComboboxValue>[], this.focusNode});

  final List<MPComboboxValue> initial;
  final FocusNode? focusNode;

  @override
  State<_Multi> createState() => _MultiState();
}

class _MultiState extends State<_Multi> {
  late List<MPComboboxValue> value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPCombobox.multiple(
          items: _fruit,
          label: const Text('Fruit'),
          value: value,
          onChanged: (List<MPComboboxValue> next) => setState(() => value = next),
          focusNode: widget.focusNode,
        ),
        Text('model: ${value.join(',')}'),
      ],
    );
  }
}

Finder get _editor => find.byType(EditableText);

String _text(WidgetTester tester) => tester.widget<EditableText>(_editor).controller.text;

Finder _option(String label) {
  return find.descendant(of: find.byType(MPSelectRow), matching: find.text(label));
}

Future<void> _type(WidgetTester tester, String text) async {
  await tester.enterText(_editor, text);
  await tester.pumpAndSettle();
}

Future<void> _openFromChevron(WidgetTester tester) async {
  await tester.tap(
    find.byWidgetPredicate(
      (Widget widget) => widget is MPFieldIconButton && widget.icon is MPSelectChevron,
    ),
  );
  await tester.pumpAndSettle();
}

double _labelSize(WidgetTester tester) => styleOf(tester, 'Fruit').fontSize!;

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is one text field named by its label', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Single(), overlay: true));

      expect(semanticsTextFields(tester), hasLength(1));
      expect(
        semanticsOf(tester, find.byType(MPCombobox)),
        isSemantics(
          isTextField: true,
          label: 'Fruit',
          hasExpandedState: true,
          isExpanded: false,
          isEnabled: true,
          hasEnabledState: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );

      handle.dispose();
    });

    testWidgets('draws the notched outline the text field wears', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));

      expect(find.byType(MPFieldShell), findsOneWidget);
    });

    testWidgets('shows the placeholder while nothing is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox(
            items: _fruit,
            label: Text('Fruit'),
            placeholder: 'Pick a fruit',
            floatingLabel: false,
          ),
          overlay: true,
        ),
      );

      final Visibility placeholder = tester.widget<Visibility>(
        find.ancestor(of: find.text('Pick a fruit'), matching: find.byType(Visibility)),
      );

      expect(placeholder.visible, isTrue);
    });

    testWidgets('shows the chosen option’s label rather than its raw value', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Single(initial: 'banana'), overlay: true));

      expect(_text(tester), 'Banana');
    });
  });

  group('choosing', () {
    testWidgets('names the chevron after the field it opens', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Single(), overlay: true));

      expect(semanticsLabelsWithAction(tester, SemanticsAction.tap), contains('Fruit'));

      handle.dispose();
    });

    testWidgets('falls back to openLabel when there is no field label', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPCombobox(items: _fruit, openLabel: 'Show fruit'), overlay: true),
      );

      expect(semanticsLabelsWithAction(tester, SemanticsAction.tap), contains('Show fruit'));

      handle.dispose();
    });

    testWidgets('opens from its chevron and lists every option', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _openFromChevron(tester);

      expect(find.byType(MPSelectRow), findsNWidgets(3));
    });

    testWidgets('starts open when asked, on the chosen row', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox(
            items: _fruit,
            label: Text('Fruit'),
            initialValue: 'banana',
            initialOpen: true,
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      final MPSelectRow row = tester.widget<MPSelectRow>(
        find.ancestor(of: _option('Banana'), matching: find.byType(MPSelectRow)),
      );

      expect(row.lit, isTrue);
    });

    testWidgets('asks for the popup through onOpenChange when it is controlled', (
      WidgetTester tester,
    ) async {
      final List<bool> asked = <bool>[];

      await tester.pumpWidget(
        host(
          MPCombobox(
            items: _fruit,
            label: const Text('Fruit'),
            open: false,
            onOpenChange: asked.add,
          ),
          overlay: true,
        ),
      );
      await _openFromChevron(tester);

      expect(asked, <bool>[true]);
      expect(find.byType(MPSelectRow), findsNothing);
    });

    testWidgets('opens on a press on the field', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await tester.tap(find.byType(MPFieldShell));
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNWidgets(3));
    });

    testWidgets('hands the parent the chosen value', (WidgetTester tester) async {
      final List<MPComboboxValue?> reported = <MPComboboxValue?>[];

      await tester.pumpWidget(
        host(
          MPCombobox(items: _fruit, label: const Text('Fruit'), onChanged: reported.add),
          overlay: true,
        ),
      );
      await _openFromChevron(tester);
      await tester.tap(_option('Banana'));
      await tester.pumpAndSettle();

      expect(reported, <MPComboboxValue?>['banana']);
      expect(_text(tester), 'Banana');
    });

    testWidgets('chooses end to end through a controlled parent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _openFromChevron(tester);
      await tester.tap(_option('Apple'));
      await tester.pumpAndSettle();

      expect(find.text('model: apple'), findsOneWidget);
      expect(find.byType(MPSelectRow), findsNothing);
    });

    testWidgets('lists a disabled option without letting it be taken', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _openFromChevron(tester);

      expect(
        semanticsNodeLabelled(tester, 'Cherry')!.getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );

      await tester.tap(_option('Cherry'));
      await tester.pumpAndSettle();

      expect(find.text('model: null'), findsOneWidget);

      handle.dispose();
    });

    testWidgets('washes the cursor over the chosen row rather than under it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Single(initial: 'apple'), overlay: true));
      await _openFromChevron(tester);

      final MPSelectRow row = tester.widget<MPSelectRow>(
        find.ancestor(of: _option('Apple'), matching: find.byType(MPSelectRow)),
      );

      expect(row.lit, isTrue);
      expect(row.selected, isTrue);

      final List<BoxDecoration> boxes = decorationsOf(
        tester,
        find.ancestor(of: _option('Apple'), matching: find.byType(MPSelectRow)),
      );

      expect(boxes.any((BoxDecoration box) => box.color == light.secondaryContainer), isTrue);
      expect(
        boxes.any(
          (BoxDecoration box) =>
              box.color == light.onSecondaryContainer.withValues(alpha: MPStateOpacity.hover),
        ),
        isTrue,
      );
    });

    testWidgets('puts the text back when the list closes without a choice', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Single(initial: 'banana'), overlay: true));
      await _type(tester, 'app');

      expect(_text(tester), 'app');

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);
      expect(_text(tester), 'Banana');
      expect(find.text('model: banana'), findsOneWidget);
    });
  });

  group('filtering', () {
    testWidgets('narrows the list to what was typed', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'ban');

      expect(_option('Banana'), findsOneWidget);
      expect(_option('Apple'), findsNothing);
    });

    testWidgets('matches with case set aside', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'BAN');

      expect(_option('Banana'), findsOneWidget);
    });

    testWidgets('reports the query as it is typed', (WidgetTester tester) async {
      final List<String> queries = <String>[];

      await tester.pumpWidget(host(_Single(onInputValueChange: queries.add), overlay: true));
      await _type(tester, 'ban');

      expect(queries, contains('ban'));
    });

    testWidgets('lights the first match so Enter takes it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'an');
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('model: banana'), findsOneWidget);
      expect(_text(tester), 'Banana');
    });

    testWidgets('walks the list with the arrow keys', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await tester.tap(find.byType(MPFieldShell));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('model: banana'), findsOneWidget);
    });
  });

  group('a value the list does not have', () {
    testWidgets('is offered as its own row rather than committed on blur', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'durian');

      expect(_option('Add “durian”'), findsOneWidget);
      expect(find.text('model: null'), findsOneWidget);
    });

    testWidgets('commits only when the row is taken', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'durian');
      await tester.tap(_option('Add “durian”'));
      await tester.pumpAndSettle();

      expect(find.text('model: durian'), findsOneWidget);
      expect(_text(tester), 'durian');
    });

    testWidgets('marks that row with a plus rather than a tick', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'durian');

      final MPSelectRow row = tester.widget<MPSelectRow>(
        find.ancestor(of: _option('Add “durian”'), matching: find.byType(MPSelectRow)),
      );

      expect(row.mark, MPSelectMark.plus);
    });

    testWidgets('takes a label of the caller’s own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(_Single(customLabel: (String query) => Text('Create $query')), overlay: true),
      );
      await _type(tester, 'durian');

      expect(_option('Create durian'), findsOneWidget);
    });

    testWidgets('is not offered at all once allowCustom is off', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Single(allowCustom: false, emptyMessage: Text('Nothing here')), overlay: true),
      );
      await _type(tester, 'durian');

      expect(find.text('Nothing here'), findsOneWidget);
      expect(find.byType(MPSelectRow), findsNothing);
    });

    testWidgets('is not offered for something the list already has', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'Apple');

      expect(find.byType(MPSelectRow), findsOneWidget);
    });
  });

  group('multiple', () {
    testWidgets('turns each chosen value into a chip and keeps filtering', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Multi(), overlay: true));
      await _openFromChevron(tester);
      await tester.tap(_option('Apple'));
      await tester.pumpAndSettle();

      expect(find.text('model: apple'), findsOneWidget);
      expect(find.byType(MPChip), findsOneWidget);
      // The list stays open for the next pick.
      expect(find.byType(MPSelectRow), findsNWidgets(3));
      expect(semanticsLabelsWithAction(tester, SemanticsAction.tap), contains('Remove Apple'));

      handle.dispose();
    });

    testWidgets('takes a chosen row back out when it is taken again', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Multi(initial: <MPComboboxValue>['apple']), overlay: true),
      );
      await _openFromChevron(tester);
      await tester.tap(_option('Apple'));
      await tester.pumpAndSettle();

      expect(find.text('model: '), findsOneWidget);
    });

    testWidgets('removes a value from its chip', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Multi(initial: <MPComboboxValue>['apple', 'banana']), overlay: true),
      );

      await tester.tap(find.bySemanticsLabel('Remove Apple'));
      await tester.pumpAndSettle();

      expect(find.text('model: banana'), findsOneWidget);
    });

    testWidgets('takes the last chip off with Backspace in an empty field', (
      WidgetTester tester,
    ) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          _Multi(initial: const <MPComboboxValue>['apple', 'banana'], focusNode: node),
          overlay: true,
        ),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
      await tester.pumpAndSettle();

      expect(find.text('model: apple'), findsOneWidget);
    });

    testWidgets('walks back into the chips and takes one off from there', (
      WidgetTester tester,
    ) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          _Multi(initial: const <MPComboboxValue>['apple', 'banana'], focusNode: node),
          overlay: true,
        ),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.delete);
      await tester.pumpAndSettle();

      expect(find.text('model: banana'), findsOneWidget);
    });

    testWidgets('wraps the chips and keeps the text on the last line', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          SizedBox(
            width: 220,
            child: MPCombobox.multiple(
              items: const <MPComboboxOption>[
                MPComboboxOption(value: 'a', label: 'Alphabetical'),
                MPComboboxOption(value: 'b', label: 'Bibliography'),
                MPComboboxOption(value: 'c', label: 'Chronological'),
              ],
              label: const Text('Tags'),
              initialValue: const <MPComboboxValue>['a', 'b', 'c'],
              fullWidth: true,
            ),
          ),
          overlay: true,
        ),
      );

      final double first = tester.getTopLeft(find.text('Alphabetical')).dy;
      final double last = tester.getTopLeft(find.text('Chronological')).dy;

      expect(last, greaterThan(first));
      expect(tester.getSize(find.byType(MPFieldShell)).height, greaterThan(56));
      expect(tester.getTopLeft(_editor).dy, greaterThanOrEqualTo(last - 8));
    });
  });

  group('the floating label', () {
    testWidgets('rests on the text’s line while nothing is chosen or typed', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));

      expect(_labelSize(tester), 16);
    });

    testWidgets('lifts on typed text as well as on a chosen row', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(), overlay: true));
      await _type(tester, 'b');

      expect(_labelSize(tester), 12);
    });

    testWidgets('starts up on a combobox that already has a value', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(initial: 'apple'), overlay: true));

      expect(_labelSize(tester), 12);
    });

    testWidgets('stays up while there are chips in the field', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Multi(initial: <MPComboboxValue>['apple']), overlay: true),
      );

      expect(_labelSize(tester), 12);
    });
  });

  group('states', () {
    testWidgets('shows an error message and marks the combobox invalid', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const _Single(errorMessage: Text('Pick a fruit.')), overlay: true),
      );

      expect(find.text('Pick a fruit.'), findsOneWidget);
      expect(
        semanticsOf(tester, find.byType(MPCombobox)).getSemanticsData().validationResult,
        SemanticsValidationResult.invalid,
      );

      handle.dispose();
    });

    testWidgets('lets the error replace the description', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Single(description: Text('Any fruit.'), errorMessage: Text('Pick a fruit.')),
          overlay: true,
        ),
      );

      expect(find.text('Pick a fruit.'), findsOneWidget);
      expect(find.text('Any fruit.'), findsNothing);
    });

    testWidgets('disables the text', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(disabled: true), overlay: true));
      await tester.tap(find.byType(MPFieldShell));
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);
      expect(tester.widget<EditableText>(_editor).focusNode.hasFocus, isFalse);
    });

    testWidgets('offers a clear button only when it was asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Single(initial: 'apple'), overlay: true));

      expect(find.bySemanticsLabel('Clear'), findsNothing);

      await tester.pumpWidget(
        host(const _Single(initial: 'apple', clearable: true), overlay: true),
      );

      expect(find.bySemanticsLabel('Clear'), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pumpAndSettle();

      expect(find.text('model: null'), findsOneWidget);
      expect(_text(tester), isEmpty);
    });
  });

  group('the raw events', () {
    testWidgets('reports a keystroke in the text, and still walks the list', (
      WidgetTester tester,
    ) async {
      final List<LogicalKeyboardKey> heard = <LogicalKeyboardKey>[];
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          _Single(
            focusNode: node,
            onKeyEvent: (FocusNode node, KeyEvent event) {
              if (event is KeyDownEvent) {
                heard.add(event.logicalKey);
              }

              return KeyEventResult.ignored;
            },
          ),
          overlay: true,
        ),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(heard, <LogicalKeyboardKey>[LogicalKeyboardKey.arrowDown]);
      expect(find.byType(MPSelectRow), findsNWidgets(3));
    });

    testWidgets('reports the focus the text takes', (WidgetTester tester) async {
      final List<bool> focus = <bool>[];

      await tester.pumpWidget(host(_Single(onFocusChange: focus.add), overlay: true));
      await tester.tap(find.byType(MPFieldShell));
      await tester.pumpAndSettle();

      expect(focus, <bool>[true]);
    });
  });

  group('what a row draws', () {
    testWidgets('draws content in the popup and still filters on the label', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPCombobox(
            label: Text('Flash'),
            items: <MPComboboxOption>[
              MPComboboxOption(value: 'a', label: 'Alpha', content: Text('Alpha, 1998')),
              MPComboboxOption(value: 'b', label: 'Beta'),
            ],
          ),
          overlay: true,
        ),
      );
      await _type(tester, 'Alph');

      expect(_option('Alpha, 1998'), findsOneWidget);
      expect(_option('Beta'), findsNothing);
    });

    testWidgets('puts the label in the text when that row is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox(
            label: Text('Flash'),
            items: <MPComboboxOption>[
              MPComboboxOption(value: 'a', label: 'Alpha', content: Text('Alpha, 1998')),
            ],
          ),
          overlay: true,
        ),
      );
      await _openFromChevron(tester);
      await tester.tap(_option('Alpha, 1998'));
      await tester.pumpAndSettle();

      expect(_text(tester), 'Alpha');
    });
  });

  group('filter', () {
    testWidgets('shows every row when filtering is turned off', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox(
            label: Text('Tag'),
            filter: MPCombobox.noFilter,
            items: <MPComboboxOption>[
              MPComboboxOption(value: 'a', label: 'Alpha'),
              MPComboboxOption(value: 'b', label: 'Beta'),
            ],
          ),
          overlay: true,
        ),
      );
      await _type(tester, 'zzz');

      expect(_option('Alpha'), findsOneWidget);
      expect(_option('Beta'), findsOneWidget);
    });

    testWidgets('uses a caller’s match in place of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPCombobox(
            label: const Text('Tag'),
            allowCustom: false,
            filter: (MPComboboxOption option, String query) => '${option.value}'.startsWith(query),
            items: const <MPComboboxOption>[
              MPComboboxOption(value: 'alpha', label: 'First'),
              MPComboboxOption(value: 'beta', label: 'Second'),
            ],
          ),
          overlay: true,
        ),
      );
      await _type(tester, 'be');

      expect(_option('Second'), findsOneWidget);
      expect(_option('First'), findsNothing);
    });

    testWidgets('never hides the row offering what was typed', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPCombobox(
            label: const Text('Tag'),
            filter: (MPComboboxOption option, String query) => false,
            items: const <MPComboboxOption>[MPComboboxOption(value: 'a', label: 'Alpha')],
          ),
          overlay: true,
        ),
      );
      await _type(tester, 'new-tag');

      expect(_option('Add “new-tag”'), findsOneWidget);
    });

    testWidgets('lights the first of the rows a server sends after the query', (
      WidgetTester tester,
    ) async {
      List<MPComboboxOption> items = const <MPComboboxOption>[];
      late StateSetter rebuild;

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              rebuild = setState;

              return MPCombobox(
                label: const Text('Tag'),
                filter: MPCombobox.noFilter,
                allowCustom: false,
                items: items,
              );
            },
          ),
          overlay: true,
        ),
      );
      await _type(tester, 'al');

      rebuild(() => items = const <MPComboboxOption>[MPComboboxOption(value: 'a', label: 'Alpha')]);
      await tester.pumpAndSettle();

      final MPSelectRow row = tester.widget<MPSelectRow>(find.byType(MPSelectRow));

      expect(row.lit, isTrue);
    });
  });

  group('the chips in a multiple field', () {
    testWidgets('take the variant and the family they were given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox.multiple(
            label: Text('Tags'),
            chipVariant: MPVariant.outlined,
            chipColor: MPColor.secondary,
            initialValue: <MPComboboxValue>['a'],
            items: <MPComboboxOption>[MPComboboxOption(value: 'a', label: 'Alpha')],
          ),
          overlay: true,
        ),
      );

      final MPChip chip = tester.widget<MPChip>(find.byType(MPChip));

      expect(chip.variant, MPVariant.outlined);
      expect(chip.color, MPColor.secondary);
    });

    testWidgets('fall back to the tonal primary chip', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPCombobox.multiple(
            label: Text('Tags'),
            initialValue: <MPComboboxValue>['a'],
            items: <MPComboboxOption>[MPComboboxOption(value: 'a', label: 'Alpha')],
          ),
          overlay: true,
        ),
      );

      final MPChip chip = tester.widget<MPChip>(find.byType(MPChip));

      expect(chip.variant, MPVariant.tonal);
      expect(chip.color, MPColor.primary);
      expect(chip.size, MPSize.sm);
    });
  });

  group('the size ladder', () {
    testWidgets('grows on the rungs a text field uses', (WidgetTester tester) async {
      const Map<MPSize, double> heights = <MPSize, double>{
        MPSize.xs: 32,
        MPSize.sm: 40,
        MPSize.md: 56,
        MPSize.lg: 64,
        MPSize.xl: 72,
      };

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(MPCombobox(items: _fruit, label: const Text('Fruit'), size: size), overlay: true),
        );

        expect(tester.getSize(find.byType(MPFieldShell)).height, heights[size], reason: '$size');
      }
    });

    testWidgets('holds a one-row multiple field at the same height', (WidgetTester tester) async {
      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(
            MPCombobox.multiple(
              items: _fruit,
              label: const Text('Fruit'),
              size: size,
              initialValue: const <MPComboboxValue>['apple'],
            ),
            overlay: true,
          ),
        );

        expect(
          tester.getSize(find.byType(MPFieldShell)).height,
          MPFieldMetrics.of(size).height,
          reason: '$size',
        );
      }
    });
  });

  group('in a form', () {
    testWidgets('holds a submit back while a required combobox is empty', (
      WidgetTester tester,
    ) async {
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
              MPCombobox.multiple(
                items: _fruit,
                name: 'fruit',
                label: Text('Fruit'),
                required: true,
              ),
            ],
          ),
        ),
      );

      expect(form.currentState!.submit(), isFalse);
      await tester.pump();

      expect(find.text('Required'), findsOneWidget);

      await _openFromChevron(tester);
      await tester.tap(_option('Banana'));
      await tester.pumpAndSettle();

      expect(form.currentState!.submit(), isTrue);
      expect(submitted, <String, Object?>{
        'fruit': <MPComboboxValue>['banana'],
      });
    });
  });
}
