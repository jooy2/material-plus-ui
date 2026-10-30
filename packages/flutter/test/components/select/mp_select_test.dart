import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/select/mp_select.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPSelect`, asked of the render tree.

const List<MPSelectOption> _cities = <MPSelectOption>[
  MPSelectOption(value: 'kr-11', label: Text('Seoul')),
  MPSelectOption(value: 'jp-13', label: Text('Tokyo')),
  MPSelectOption(value: 'fr-75', label: Text('Paris'), disabled: true),
];

/// A parent that keeps the value and shows it, as the React suite's
/// `ControlledSelect` does.
class _Parent extends StatefulWidget {
  const _Parent({
    this.initial,
    this.floatingLabel = true,
    this.startIcon,
    this.errorMessage,
    this.description,
    this.disabled = false,
    this.required = false,
    this.size,
    this.onFocusChange,
  });

  final MPSelectValue? initial;
  final bool floatingLabel;
  final Widget? startIcon;
  final Widget? errorMessage;
  final Widget? description;
  final bool disabled;
  final bool required;
  final MPSize? size;
  final ValueChanged<bool>? onFocusChange;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  late MPSelectValue? value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPSelect(
          items: _cities,
          label: const Text('City'),
          placeholder: const Text('Pick one'),
          value: value,
          onChanged: (MPSelectValue? next) => setState(() => value = next),
          floatingLabel: widget.floatingLabel,
          startIcon: widget.startIcon,
          errorMessage: widget.errorMessage,
          description: widget.description,
          disabled: widget.disabled,
          required: widget.required,
          size: widget.size,
          onFocusChange: widget.onFocusChange,
        ),
        Text('model: $value'),
      ],
    );
  }
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPSelect));
  await tester.pumpAndSettle();
}

/// The words [text] where they are drawn, rather than where the trigger's
/// width sizer lays them out unseen.
Finder _drawn(String text) {
  return find.byElementPredicate((Element element) {
    final Widget widget = element.widget;

    if (widget is! Text || widget.data != text) {
      return false;
    }

    bool sizing = false;

    element.visitAncestorElements((Element ancestor) {
      sizing = ancestor.widget is MPWidthSizer;

      return !sizing;
    });

    return !sizing;
  });
}

/// Whether the trigger is reading [text].
bool _triggerShows(WidgetTester tester, String text) {
  return find
      .descendant(of: find.byType(MPFieldShell), matching: _drawn(text))
      .evaluate()
      .isNotEmpty;
}

/// Whether the placeholder is painted, rather than laid out and hidden.
bool _placeholderShown(WidgetTester tester) {
  final Finder placeholder = find.ancestor(
    of: find.text('Pick one'),
    matching: find.byType(Visibility),
  );

  return tester.widget<Visibility>(placeholder.first).visible;
}

/// A row of the open list, rather than the same words in the trigger's width
/// sizer.
Finder _option(String label) {
  return find.descendant(of: find.byType(MPSelectRow), matching: find.text(label));
}

double _labelSize(WidgetTester tester) {
  return tester.renderObject<RenderParagraph>(_drawn('City')).text.style!.fontSize!;
}

MPSelectRow _row(WidgetTester tester, String label) {
  return tester.widget<MPSelectRow>(
    find.ancestor(of: find.text(label), matching: find.byType(MPSelectRow)),
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is one button named by its label', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(), overlay: true));

      expect(
        semanticsOf(tester, find.byType(MPSelect)),
        isSemantics(
          isButton: true,
          label: 'City',
          isEnabled: true,
          hasEnabledState: true,
          hasExpandedState: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );

      handle.dispose();
    });

    testWidgets('shows the placeholder while nothing is chosen', (WidgetTester tester) async {
      // With the label pinned in the notch nothing stands in the
      // placeholder's way, so it is there from the first frame.
      await tester.pumpWidget(host(const _Parent(floatingLabel: false), overlay: true));

      expect(_placeholderShown(tester), isTrue);
    });

    testWidgets('shows the chosen label rather than the raw value', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));

      expect(_triggerShows(tester, 'Seoul'), isTrue);
      expect(find.text('kr-11'), findsNothing);
      expect(semanticsOf(tester, find.byType(MPSelect)).value, 'Seoul');

      handle.dispose();
    });

    testWidgets('draws a value the list does not hold as itself', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 'us-nyc'), overlay: true));

      expect(_triggerShows(tester, 'us-nyc'), isTrue);
    });

    testWidgets('draws the notched outline the text field wears', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));

      expect(find.byType(MPFieldShell), findsOneWidget);
      expect(find.byType(MPSupportingText), findsOneWidget);
    });

    testWidgets('renders a leading adornment before the value', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Parent(initial: 'kr-11', startIcon: Text('KR')), overlay: true),
      );

      expect(
        tester.getTopLeft(find.text('KR')).dx,
        lessThan(tester.getTopLeft(_drawn('Seoul')).dx),
      );
    });

    testWidgets('lays the adornment out from the end under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Parent(initial: 'kr-11', startIcon: Text('KR')),
          overlay: true,
          textDirection: TextDirection.rtl,
        ),
      );

      expect(
        tester.getTopRight(find.text('KR')).dx,
        greaterThan(tester.getTopRight(_drawn('Seoul')).dx),
      );
    });
  });

  group('choosing', () {
    testWidgets('opens on a press and lists every option', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);

      expect(find.byType(MPSelectRow), findsNWidgets(3));
      expect(_option('Tokyo'), findsOneWidget);
    });

    testWidgets('hands the parent the chosen value', (WidgetTester tester) async {
      final List<MPSelectValue?> reported = <MPSelectValue?>[];

      await tester.pumpWidget(
        host(
          MPSelect(items: _cities, label: const Text('City'), onChanged: reported.add),
          overlay: true,
        ),
      );
      await _open(tester);
      await tester.tap(_option('Tokyo'));
      await tester.pumpAndSettle();

      expect(reported, <MPSelectValue?>['jp-13']);
    });

    testWidgets('chooses end to end through a controlled parent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);
      await tester.tap(_option('Seoul'));
      await tester.pumpAndSettle();

      expect(find.text('model: kr-11'), findsOneWidget);
      expect(find.byType(MPSelectRow), findsNothing);
      expect(_triggerShows(tester, 'Seoul'), isTrue);
    });

    testWidgets('keeps its own choice when left uncontrolled', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPSelect(items: _cities, label: Text('City'), initialValue: 'jp-13'),
          overlay: true,
        ),
      );

      expect(_triggerShows(tester, 'Tokyo'), isTrue);

      await _open(tester);
      await tester.tap(_option('Seoul'));
      await tester.pumpAndSettle();

      expect(_triggerShows(tester, 'Seoul'), isTrue);
    });

    testWidgets('shows a value the parent turned down as the parent holds it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPSelect(
            items: _cities,
            label: const Text('City'),
            value: 'jp-13',
            onChanged: (MPSelectValue? next) {},
          ),
          overlay: true,
        ),
      );
      await _open(tester);
      await tester.tap(_option('Seoul'));
      await tester.pumpAndSettle();

      expect(_triggerShows(tester, 'Tokyo'), isTrue);
    });

    testWidgets('lists a disabled option without letting it be taken', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);

      expect(
        semanticsNodeLabelled(tester, 'Paris')!.getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );

      await tester.tap(_option('Paris'));
      await tester.pumpAndSettle();

      expect(find.text('model: null'), findsOneWidget);
      expect(find.byType(MPSelectRow), findsNWidgets(3));

      handle.dispose();
    });

    testWidgets('marks the chosen row rather than only highlighting it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));
      await _open(tester);

      final SemanticsData seoul = semanticsNodeLabelled(tester, 'Seoul')!.getSemanticsData();

      expect(seoul.flagsCollection.isSelected, Tristate.isTrue);
      expect(
        semanticsNodeLabelled(tester, 'Tokyo')!.getSemanticsData().flagsCollection.isSelected,
        Tristate.isFalse,
      );

      handle.dispose();
    });

    testWidgets('washes the cursor over the chosen row rather than under it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));
      await _open(tester);

      // Both at once: the list opens on the chosen row.
      final MPSelectRow row = _row(tester, 'Seoul');

      expect(row.lit, isTrue);
      expect(row.selected, isTrue);

      final Finder rowFinder = find.ancestor(
        of: find.text('Seoul'),
        matching: find.byType(MPSelectRow),
      );
      final List<BoxDecoration> boxes = decorationsOf(tester, rowFinder);

      // The fill is still the chosen row's, with the wash on top of it.
      expect(boxes.any((BoxDecoration box) => box.color == light.secondaryContainer), isTrue);
      expect(
        boxes.any(
          (BoxDecoration box) =>
              box.color == light.onSecondaryContainer.withValues(alpha: MPStateOpacity.hover),
        ),
        isTrue,
      );
    });

    testWidgets('grows the tick into the row that was picked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));
      await _open(tester);

      final List<bool> shown = tester
          .widgetList<MPSelectTick>(find.byType(MPSelectTick))
          .map((MPSelectTick tick) => tick.shown)
          .toList();

      expect(shown, <bool>[true, false, false]);

      final AnimatedScale scale = tester.widget<AnimatedScale>(
        find.descendant(of: find.byType(MPSelectTick).last, matching: find.byType(AnimatedScale)),
      );

      expect(scale.scale, 0.6);
      expect(scale.duration, MPMotion.short4);
    });

    testWidgets('draws the popup on surfaceContainer at elevation 2', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);

      final BoxDecoration sheet = tester
          .widgetList<Container>(find.byType(Container))
          .map((Container box) => box.decoration)
          .whereType<BoxDecoration>()
          .firstWhere((BoxDecoration decoration) => decoration.boxShadow?.isNotEmpty ?? false);

      expect(sheet.color, light.surfaceContainer);
      expect(sheet.boxShadow, MPShadows.of(2));
      expect(sheet.borderRadius, BorderRadius.circular(4));
    });

    testWidgets('opens at least as wide as its trigger', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const SizedBox(
            width: 360,
            child: MPSelect(items: _cities, label: Text('City'), fullWidth: true),
          ),
          overlay: true,
        ),
      );
      await _open(tester);

      expect(tester.getSize(find.byType(MPSelectSheet)).width, closeTo(360, 0.5));
    });
  });

  group('the keyboard', () {
    testWidgets('opens on an arrow and walks past a disabled row', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return MPSelect(
                items: const <MPSelectOption>[
                  MPSelectOption(value: 'a', label: Text('Alpha')),
                  MPSelectOption(value: 'b', label: Text('Bravo'), disabled: true),
                  MPSelectOption(value: 'c', label: Text('Charlie')),
                ],
                label: const Text('Letter'),
                focusNode: node,
              );
            },
          ),
          overlay: true,
        ),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(_row(tester, 'Alpha').lit, isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();

      expect(_row(tester, 'Charlie').lit, isTrue);
      expect(_row(tester, 'Bravo').lit, isFalse);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);
      expect(_triggerShows(tester, 'Charlie'), isTrue);
      expect(node.hasFocus, isTrue);
    });

    testWidgets('jumps to the ends with Home and End', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(MPSelect(items: _cities, label: const Text('City'), focusNode: node), overlay: true),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();

      // Paris is disabled, so the end the keys can reach is Tokyo.
      expect(_row(tester, 'Tokyo').lit, isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();

      expect(_row(tester, 'Seoul').lit, isTrue);
    });

    testWidgets('closes on Escape without choosing', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(MPSelect(items: _cities, label: const Text('City'), focusNode: node), overlay: true),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNWidgets(3));

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);
      expect(node.hasFocus, isTrue);
    });

    testWidgets('jumps to the option a typed letter starts', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(MPSelect(items: _cities, label: const Text('City'), focusNode: node), overlay: true),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.keyT);
      await tester.pump();

      // On a closed select, as on a native one, the letter chooses.
      expect(_triggerShows(tester, 'Tokyo'), isTrue);

      // A disabled option is not one a letter can land on.
      await tester.sendKeyEvent(LogicalKeyboardKey.keyP);
      await tester.pump();

      expect(_triggerShows(tester, 'Tokyo'), isTrue);
    });

    testWidgets('reports a keystroke on the trigger', (WidgetTester tester) async {
      final List<LogicalKeyboardKey> heard = <LogicalKeyboardKey>[];
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          MPSelect(
            items: _cities,
            label: const Text('City'),
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
      await tester.sendKeyEvent(LogicalKeyboardKey.delete);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      // Both from the one keystroke: the caller hears it, and the select
      // still opens on it.
      expect(heard, <LogicalKeyboardKey>[LogicalKeyboardKey.delete, LogicalKeyboardKey.arrowDown]);
      expect(find.byType(MPSelectRow), findsNWidgets(3));
    });

    testWidgets('lets the caller take a key', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          MPSelect(
            items: _cities,
            label: const Text('City'),
            focusNode: node,
            onKeyEvent: (FocusNode node, KeyEvent event) => KeyEventResult.handled,
          ),
          overlay: true,
        ),
      );

      node.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);
    });

    testWidgets('reports the focus the trigger takes and closes when it goes', (
      WidgetTester tester,
    ) async {
      final List<bool> focus = <bool>[];
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(afterFocusStop(before, _Parent(onFocusChange: focus.add)), overlay: true),
      );

      await _open(tester);

      expect(focus, <bool>[true]);

      before.requestFocus();
      await tester.pumpAndSettle();

      expect(focus, <bool>[true, false]);
      expect(find.byType(MPSelectRow), findsNothing);
    });
  });

  group('the floating label', () {
    testWidgets('rests on the trigger’s line while nothing is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));

      expect(_labelSize(tester), 16);
    });

    testWidgets('stays up while the list is open', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);

      expect(_labelSize(tester), 12);
    });

    testWidgets('stays up once something is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));
      await _open(tester);
      await tester.tap(_option('Tokyo'));
      await tester.pumpAndSettle();

      expect(_labelSize(tester), 12);
    });

    testWidgets('starts up on a select that already has a value', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));

      expect(_labelSize(tester), 12);
    });

    testWidgets('withholds the placeholder until the label is out of its way', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Parent(), overlay: true));

      expect(_placeholderShown(tester), isFalse);

      await _open(tester);

      expect(_placeholderShown(tester), isTrue);
    });
  });

  group('states', () {
    testWidgets('shows an error message and marks the select invalid', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const _Parent(errorMessage: Text('Pick a city.')), overlay: true),
      );

      expect(find.text('Pick a city.'), findsOneWidget);
      expect(
        semanticsOf(tester, find.byType(MPSelect)).getSemanticsData().validationResult,
        SemanticsValidationResult.invalid,
      );

      handle.dispose();
    });

    testWidgets('lets the error replace the description', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Parent(
            description: Text('Where the order ships.'),
            errorMessage: Text('Pick a city.'),
          ),
          overlay: true,
        ),
      );

      expect(find.text('Pick a city.'), findsOneWidget);
      expect(find.text('Where the order ships.'), findsNothing);
    });

    testWidgets('disables the trigger', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(disabled: true), overlay: true));

      expect(
        semanticsOf(tester, find.byType(MPSelect)),
        isSemantics(
          isButton: true,
          hasEnabledState: true,
          isEnabled: false,
          hasExpandedState: true,
        ),
      );

      await tester.tap(find.byType(MPSelect));
      await tester.pumpAndSettle();

      expect(find.byType(MPSelectRow), findsNothing);

      handle.dispose();
    });

    testWidgets('does not open while read-only, and stays focusable', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          MPSelect(
            items: _cities,
            label: const Text('City'),
            initialValue: 'kr-11',
            readOnly: true,
            focusNode: node,
          ),
          overlay: true,
        ),
      );

      await _open(tester);

      expect(find.byType(MPSelectRow), findsNothing);

      node.requestFocus();
      await tester.pump();

      expect(node.hasFocus, isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.keyT);
      await tester.pump();

      expect(_triggerShows(tester, 'Seoul'), isTrue);
    });

    testWidgets('marks the select required', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(required: true), overlay: true));

      expect(
        semanticsOf(tester, find.byType(MPSelect)).getSemanticsData().flagsCollection.isRequired,
        Tristate.isTrue,
      );
      expect(find.text(' *'), findsOneWidget);

      handle.dispose();
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
        await tester.pumpWidget(host(_Parent(size: size), overlay: true));

        expect(tester.getSize(find.byType(MPFieldShell)).height, heights[size], reason: '$size');
      }
    });

    testWidgets('stretches to the container when fullWidth', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const SizedBox(
            width: 360,
            child: MPSelect(items: _cities, label: Text('City'), fullWidth: true),
          ),
          overlay: true,
        ),
      );

      expect(tester.getSize(find.byType(MPFieldShell)).width, 360);
    });

    testWidgets('holds its width whatever it says', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 'kr-11'), overlay: true));

      final double seoul = tester.getSize(find.byType(MPFieldShell)).width;

      await _open(tester);
      await tester.tap(_option('Tokyo'));
      await tester.pumpAndSettle();

      expect(tester.getSize(find.byType(MPFieldShell)).width, seoul);
    });
  });

  group('in a form', () {
    testWidgets('holds a submit back while a required select is empty', (
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
              MPSelect(items: _cities, name: 'city', label: Text('City'), required: true),
            ],
          ),
        ),
      );

      expect(form.currentState!.submit(), isFalse);
      await tester.pump();

      expect(submitted, isNull);
      expect(find.text('Required'), findsOneWidget);

      await _open(tester);
      await tester.tap(_option('Tokyo'));
      await tester.pumpAndSettle();

      // A message that is showing goes as soon as the field is put right.
      expect(find.text('Required'), findsNothing);
      expect(form.currentState!.submit(), isTrue);
      expect(submitted, <String, Object?>{'city': 'jp-13'});
    });

    testWidgets('shows an error the form hands back by name', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          overlay: true,
          const MPForm(
            errors: <String, String>{'city': 'We do not ship there.'},
            children: <Widget>[
              MPSelect(items: _cities, name: 'city', label: Text('City'), initialValue: 'kr-11'),
            ],
          ),
        ),
      );

      expect(find.text('We do not ship there.'), findsOneWidget);
    });
  });
}
