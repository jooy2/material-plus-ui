import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/number_field/mp_number_field.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPNumberField`, asked of the render tree.

/// A parent that keeps the number and shows it, as the React suite's
/// `ControlledNumberField` does.
class _Parent extends StatefulWidget {
  const _Parent({this.initial, this.min, this.max, this.step = 1});

  final double? initial;
  final double? min;
  final double? max;
  final double step;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  late double? value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPNumberField(
      label: const Text('Quantity'),
      value: value,
      min: widget.min,
      max: widget.max,
      step: widget.step,
      onChanged: (double? next) => setState(() => value = next),
    );
  }
}

String _shown(WidgetTester tester) {
  return tester.widget<EditableText>(find.byType(EditableText)).controller.text;
}

Finder _stepper(String name) {
  return find.ancestor(of: find.bySemanticsLabel(name), matching: find.byType(MPFieldIconButton));
}

double _labelSize(WidgetTester tester) => styleOf(tester, 'Quantity').fontSize!;

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is one text field node named by its label', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'), initialValue: 3)));

      expect(semanticsTextFields(tester), hasLength(1));
      expect(
        semanticsOf(tester, find.byType(MPNumberField)),
        isSemantics(isTextField: true, label: 'Quantity', value: '3'),
      );

      handle.dispose();
    });

    testWidgets('draws the notched outline the text field wears', (WidgetTester tester) async {
      // Without steppers, whose state layers are drawn ahead of the outline.
      await tester.pumpWidget(
        host(const MPNumberField(label: Text('Quantity'), steppers: MPNumberFieldSteppers.none)),
      );

      expect(find.byType(MPFieldShell), findsOneWidget);
      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.outline, style: PaintingStyle.stroke),
      );
    });

    testWidgets('names both steppers', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'))));

      expect(find.bySemanticsLabel('Increase'), findsOneWidget);
      expect(find.bySemanticsLabel('Decrease'), findsOneWidget);
    });

    testWidgets('takes its own names for them', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPNumberField(
            label: Text('Guests'),
            incrementLabel: 'Add a guest',
            decrementLabel: 'Remove a guest',
          ),
        ),
      );

      expect(find.bySemanticsLabel('Add a guest'), findsOneWidget);
      expect(find.bySemanticsLabel('Remove a guest'), findsOneWidget);
    });

    testWidgets('renders a placeholder and a leading adornment', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPNumberField(semanticLabel: 'Price', placeholder: '0', startIcon: Text(r'$'))),
      );

      expect(find.text('0'), findsOneWidget);
      expect(find.text(r'$'), findsOneWidget);
    });

    testWidgets('starts an uncontrolled field at its initialValue', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'), initialValue: 7)));

      expect(_shown(tester), '7');
    });
  });

  group('stepping', () {
    testWidgets('hands the parent a number rather than an event', (WidgetTester tester) async {
      double? received;

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            initialValue: 1,
            onChanged: (double? next) => received = next,
          ),
        ),
      );

      await tester.tap(_stepper('Increase'));
      await tester.pump();

      expect(received, 2);
      expect(_shown(tester), '2');
    });

    testWidgets('steps end to end through a controlled parent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 1)));

      await tester.tap(_stepper('Increase'));
      await tester.pump();
      expect(tester.state<_ParentState>(find.byType(_Parent)).value, 2);

      await tester.tap(_stepper('Decrease'));
      await tester.pump();
      expect(tester.state<_ParentState>(find.byType(_Parent)).value, 1);
    });

    testWidgets('steps by the step it is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 0, step: 5)));

      await tester.tap(_stepper('Increase'));
      await tester.pump();

      expect(tester.state<_ParentState>(find.byType(_Parent)).value, 5);
    });

    testWidgets('stops at the ends of the range, and says so', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: 1, min: 1, max: 2)));

      await tester.tap(_stepper('Increase'));
      await tester.pumpAndSettle();

      expect(tester.state<_ParentState>(find.byType(_Parent)).value, 2);
      expect(tester.widget<MPFieldIconButton>(_stepper('Increase')).onPressed, isNull);
      expect(tester.widget<MPFieldIconButton>(_stepper('Decrease')).onPressed, isNotNull);
    });

    testWidgets('reports the settled value separately from every change', (
      WidgetTester tester,
    ) async {
      double? committed;

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            initialValue: 1,
            onValueCommitted: (double? next) => committed = next,
          ),
        ),
      );

      await tester.tap(_stepper('Increase'));
      await tester.pump();

      expect(committed, 2);
    });

    testWidgets('repeats while a stepper is held', (WidgetTester tester) async {
      final List<double?> changes = <double?>[];

      await tester.pumpWidget(
        host(MPNumberField(label: const Text('Quantity'), initialValue: 0, onChanged: changes.add)),
      );

      final TestGesture press = await tester.startGesture(
        tester.getCenter(_stepper('Increase')),
        kind: PointerDeviceKind.mouse,
      );
      await tester.pump(const Duration(milliseconds: 400));
      await tester.pump(const Duration(milliseconds: 200));
      await press.up();
      await tester.pump();

      expect(changes.length, greaterThan(2));
      expect(changes.last, changes.length.toDouble());
    });

    testWidgets('steps from the keyboard, Shift for the large step', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(host(const SizedBox()));
      await tester.pumpWidget(
        host(MPNumberField(label: const Text('Quantity'), initialValue: 5, focusNode: focus)),
      );

      focus.requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();
      expect(_shown(tester), '6');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pump();
      expect(_shown(tester), '16');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(_shown(tester), '15');
    });

    testWidgets('goes to the ends of the range with Home and End', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            initialValue: 5,
            min: 1,
            max: 9,
            focusNode: focus,
          ),
        ),
      );

      focus.requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(_shown(tester), '9');

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(_shown(tester), '1');
    });

    testWidgets('puts zero in an empty field on the first step', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'), min: 3)));

      await tester.tap(_stepper('Increase'));
      await tester.pump();

      expect(_shown(tester), '3');
    });
  });

  group('typing', () {
    testWidgets('takes a typed number', (WidgetTester tester) async {
      double? received;

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            onChanged: (double? next) => received = next,
          ),
        ),
      );

      await tester.enterText(find.byType(EditableText), '42');

      expect(received, 42);
    });

    testWidgets('clamps and settles the typed number on blur', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      final List<double?> committed = <double?>[];
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            max: 10,
            focusNode: focus,
            onValueCommitted: committed.add,
          ),
        ),
      );

      await tester.enterText(find.byType(EditableText), '50');
      focus.unfocus();
      await tester.pump();

      expect(committed, <double?>[10]);
      expect(_shown(tester), '10');
    });

    testWidgets('writes the number the way it is asked to and reports a plain one', (
      WidgetTester tester,
    ) async {
      double? committed;

      String currency(double value) {
        final String digits = value.toStringAsFixed(0);
        final String grouped = digits.replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+$)'),
          (Match match) => '${match[1]},',
        );

        return '\$$grouped';
      }

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Price'),
            initialValue: 1240,
            format: currency,
            onValueCommitted: (double? next) => committed = next,
          ),
        ),
      );

      expect(_shown(tester), r'$1,240');

      await tester.tap(_stepper('Increase'));
      await tester.pump();

      expect(_shown(tester), r'$1,241');
      expect(committed, 1241);
    });
  });

  group('the steppers', () {
    testWidgets('puts both at the trailing edge by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'), initialValue: 1)));

      final double editor = tester.getCenter(find.byType(EditableText)).dx;

      expect(tester.getCenter(_stepper('Decrease')).dx, greaterThan(editor));
      expect(tester.getCenter(_stepper('Increase')).dx, greaterThan(editor));
    });

    testWidgets('puts one either side of the number when split', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPNumberField(
            label: Text('Quantity'),
            initialValue: 1,
            steppers: MPNumberFieldSteppers.split,
          ),
        ),
      );

      final double editor = tester.getCenter(find.byType(EditableText)).dx;

      expect(tester.getCenter(_stepper('Decrease')).dx, lessThan(editor));
      expect(tester.getCenter(_stepper('Increase')).dx, greaterThan(editor));
      expect(tester.widget<EditableText>(find.byType(EditableText)).textAlign, TextAlign.center);
    });

    testWidgets('mirrors under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          const MPNumberField(
            label: Text('Quantity'),
            initialValue: 1,
            steppers: MPNumberFieldSteppers.split,
          ),
        ),
      );

      final double editor = tester.getCenter(find.byType(EditableText)).dx;

      expect(tester.getCenter(_stepper('Decrease')).dx, greaterThan(editor));
    });

    testWidgets('drops them when asked, and stays a number field', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            initialValue: 1,
            steppers: MPNumberFieldSteppers.none,
            focusNode: focus,
          ),
        ),
      );

      expect(find.byType(MPFieldIconButton), findsNothing);

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();

      expect(_shown(tester), '2');
    });

    testWidgets('drops them when the field is read-only', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPNumberField(label: Text('Quantity'), initialValue: 1, readOnly: true)),
      );

      expect(find.byType(MPFieldIconButton), findsNothing);
      expect(tester.widget<EditableText>(find.byType(EditableText)).readOnly, isTrue);
    });

    testWidgets('are not stops on the way past the field', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(afterFocusStop(before, const MPNumberField(label: Text('Quantity')))),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(MPFieldIconButton).first), isFalse);
    });
  });

  group('the floating label', () {
    testWidgets('rests on the field’s line while it holds no number', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'))));

      expect(_labelSize(tester), 16);
    });

    testWidgets('starts up on a field that already holds one', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'), initialValue: 2)));

      expect(_labelSize(tester), 12);
    });

    testWidgets('lifts on the first digit typed', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPNumberField(label: Text('Quantity'))));

      await tester.enterText(find.byType(EditableText), '4');
      await tester.pumpAndSettle();

      expect(_labelSize(tester), 12);
    });

    testWidgets('is pinned in the notch by split steppers', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPNumberField(label: Text('Quantity'), steppers: MPNumberFieldSteppers.split)),
      );

      expect(_labelSize(tester), 12);
    });

    testWidgets('is pinned in the notch by floatingLabel: false', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPNumberField(label: Text('Quantity'), floatingLabel: false)),
      );

      expect(_labelSize(tester), 12);
    });
  });

  group('states', () {
    testWidgets('shows an error message and turns the field over', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPNumberField(
            label: Text('Quantity'),
            steppers: MPNumberFieldSteppers.none,
            errorMessage: Text('At least one, please.'),
          ),
        ),
      );

      expect(styleOf(tester, 'At least one, please.').color, light.error);
      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.error, style: PaintingStyle.stroke),
      );
    });

    testWidgets('lets the error replace the description', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPNumberField(
            label: Text('Quantity'),
            description: Text('Up to 20 per order.'),
            errorMessage: Text('At least one, please.'),
          ),
        ),
      );

      expect(find.text('At least one, please.'), findsOneWidget);
      expect(find.text('Up to 20 per order.'), findsNothing);
    });

    testWidgets('disables the control and drops both steppers', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPNumberField(label: Text('Quantity'), initialValue: 1, disabled: true)),
      );

      expect(find.byType(MPFieldIconButton), findsNothing);

      await tester.tap(find.byType(EditableText), warnIfMissed: false);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
    });
  });

  group('the size ladder', () {
    testWidgets('grows on the same rungs a text field uses', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPNumberField(label: const Text('Quantity'), size: size)));
        heights.add(tester.getSize(find.byType(MPFieldShell)).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });
  });

  group('the raw events', () {
    testWidgets('reports a keystroke on the input', (WidgetTester tester) async {
      final List<LogicalKeyboardKey> keys = <LogicalKeyboardKey>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            focusNode: focus,
            onKeyEvent: (FocusNode node, KeyEvent event) {
              if (event is KeyDownEvent) {
                keys.add(event.logicalKey);
              }

              return KeyEventResult.ignored;
            },
          ),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.digit4);

      expect(keys, <LogicalKeyboardKey>[LogicalKeyboardKey.digit4]);
    });

    testWidgets('reports a blur without taking the commit off it', (WidgetTester tester) async {
      final List<bool> focusChanges = <bool>[];
      final List<double?> committed = <double?>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPNumberField(
            label: const Text('Quantity'),
            focusNode: focus,
            onFocusChange: focusChanges.add,
            onValueCommitted: committed.add,
          ),
        ),
      );

      await tester.enterText(find.byType(EditableText), '8');
      focus.unfocus();
      await tester.pump();

      expect(focusChanges.last, isFalse);
      expect(committed, <double?>[8]);
    });
  });
}
