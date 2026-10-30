import 'dart:ui' show CheckedState, SemanticsRole;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/radio_group/mp_radio_group.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const List<Widget> _delivery = <Widget>[
  MPRadio(value: 'standard', label: Text('Standard')),
  MPRadio(value: 'express', label: Text('Express')),
  MPRadio(value: 'pickup', label: Text('Collect in store')),
];

/// A group whose parent holds the value, as the hero demo does.
class _Controlled extends StatefulWidget {
  const _Controlled({
    this.initial = 'standard',
    this.readOnly = false,
    this.focusNode,
    this.children = _delivery,
    this.orientation = MPOrientation.vertical,
  });

  final String initial;
  final bool readOnly;
  final FocusNode? focusNode;
  final List<Widget> children;
  final MPOrientation orientation;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late String value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPRadioGroup(
      label: const Text('Delivery'),
      value: value,
      readOnly: widget.readOnly,
      focusNode: widget.focusNode,
      orientation: widget.orientation,
      onChanged: (String next) => setState(() => value = next),
      children: widget.children,
    );
  }
}

String? _chosen(WidgetTester tester) {
  return tester.state<_ControlledState>(find.byType(_Controlled)).value;
}

Color _edgeOf(WidgetTester tester, String label) {
  final Finder option = find.ancestor(of: find.text(label), matching: find.byType(MPRadio));
  final BoxDecoration ring = tester
      .widgetList<AnimatedContainer>(
        find.descendant(of: option, matching: find.byType(AnimatedContainer)),
      )
      .map((AnimatedContainer box) => box.decoration! as BoxDecoration)
      .firstWhere((BoxDecoration decoration) => decoration.border != null);

  return (ring.border! as Border).top.color;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is announced as a radio group named by its label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled()));

      final SemanticsNode group = semanticsNodeLabelled(tester, 'Delivery')!;
      expect(group.getSemanticsData().role, SemanticsRole.radioGroup);
      semantics.dispose();
    });

    testWidgets('renders one radio per option, each named by its label', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled()));

      for (final String label in <String>['Standard', 'Express', 'Collect in store']) {
        final SemanticsData data = semanticsNodeLabelled(tester, label)!.getSemanticsData();
        expect(data.flagsCollection.isInMutuallyExclusiveGroup, isTrue, reason: label);
      }

      expect(
        semanticsNodeLabelled(tester, 'Standard')!.getSemanticsData().flagsCollection.isChecked,
        CheckedState.isTrue,
      );
      semantics.dispose();
    });

    testWidgets('stacks vertically by default and can run across', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled()));
      expect(
        tester.getTopLeft(find.text('Express')).dy,
        greaterThan(tester.getTopLeft(find.text('Standard')).dy),
      );

      await tester.pumpWidget(host(const _Controlled(orientation: MPOrientation.horizontal)));
      expect(
        tester.getTopLeft(find.text('Express')).dx,
        greaterThan(tester.getTopLeft(find.text('Standard')).dx),
      );
    });

    testWidgets('draws the chosen ring in the accent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled()));
      await tester.pumpAndSettle();

      expect(_edgeOf(tester, 'Standard'), light.primary);
      expect(_edgeOf(tester, 'Express'), light.onSurfaceVariant);
    });
  });

  group('choosing', () {
    testWidgets('hands the parent the chosen value', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(host(MPRadioGroup(onChanged: changes.add, children: _delivery)));
      await tester.tap(find.text('Express'));

      expect(changes, <String>['express']);
    });

    testWidgets('moves the choice through a controlled parent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled()));

      await tester.tap(find.text('Collect in store'));
      await tester.pumpAndSettle();

      expect(_chosen(tester), 'pickup');
      expect(_edgeOf(tester, 'Collect in store'), light.primary);
    });

    testWidgets('holds its own choice from initialValue', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPRadioGroup(initialValue: 'express', children: _delivery)),
      );
      await tester.pumpAndSettle();
      expect(_edgeOf(tester, 'Express'), light.primary);

      await tester.tap(find.text('Standard'));
      await tester.pumpAndSettle();
      expect(_edgeOf(tester, 'Standard'), light.primary);
      expect(_edgeOf(tester, 'Express'), light.onSurfaceVariant);
    });

    testWidgets('does not report pressing the chosen option again', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(
        host(MPRadioGroup(value: 'standard', onChanged: changes.add, children: _delivery)),
      );
      await tester.tap(find.text('Standard'));

      expect(changes, isEmpty);
    });

    testWidgets('takes one focus stop and moves the choice with the arrows', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, const _Controlled(initial: 'express'))));
      before.requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(holdsFocus(tester, find.byType(MPRadio).at(1)), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(_chosen(tester), 'pickup');
      expect(holdsFocus(tester, find.byType(MPRadio).at(2)), isTrue);

      // A ring of alternatives: past the last is the first.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(_chosen(tester), 'standard');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pumpAndSettle();
      expect(_chosen(tester), 'pickup');

      // Tab leaves the set rather than walking through it.
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(holdsFocus(tester, find.byType(MPRadioGroup)), isFalse);
    });

    testWidgets('skips an option that cannot be taken', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(
          _Controlled(
            focusNode: stop,
            children: const <Widget>[
              MPRadio(value: 'standard', label: Text('Standard')),
              MPRadio(value: 'express', label: Text('Express'), disabled: true),
              MPRadio(value: 'pickup', label: Text('Collect in store')),
            ],
          ),
        ),
      );
      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(_chosen(tester), 'pickup');
    });

    testWidgets('follows the writing direction across a row', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          _Controlled(focusNode: stop, orientation: MPOrientation.horizontal),
        ),
      );
      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(_chosen(tester), 'express');
    });

    testWidgets('sees an option through padding', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(
          _Controlled(
            focusNode: stop,
            children: const <Widget>[
              Padding(
                padding: EdgeInsets.all(4),
                child: MPRadio(value: 'standard', label: Text('Standard')),
              ),
              Padding(
                padding: EdgeInsets.all(4),
                child: MPRadio(value: 'express', label: Text('Express')),
              ),
            ],
          ),
        ),
      );
      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(_chosen(tester), 'express');
    });
  });

  group('states', () {
    testWidgets('shows an error and turns every ring over', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPRadioGroup(
            description: Text('Pick one.'),
            errorMessage: Text('Choose one before continuing.'),
            children: _delivery,
          ),
        ),
      );

      expect(find.text('Choose one before continuing.'), findsOneWidget);
      expect(find.text('Pick one.'), findsNothing);
      expect(_edgeOf(tester, 'Standard'), light.error);
    });

    testWidgets('disables every option at once', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(
        host(MPRadioGroup(disabled: true, onChanged: changes.add, children: _delivery)),
      );
      await tester.tap(find.text('Express'));

      expect(changes, isEmpty);
      expect(_edgeOf(tester, 'Express'), light.onSurface.withValues(alpha: 0.38));
    });

    testWidgets('disables one option without touching the rest', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(
        host(
          MPRadioGroup(
            onChanged: changes.add,
            children: const <Widget>[
              MPRadio(value: 'a', label: Text('A')),
              MPRadio(value: 'b', label: Text('B'), disabled: true),
            ],
          ),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.tap(find.text('A'));

      expect(changes, <String>['a']);
    });

    testWidgets('moves only the stop when read-only', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(host(_Controlled(readOnly: true, focusNode: stop)));
      await tester.tap(find.text('Express'));
      expect(_chosen(tester), 'standard');

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(_chosen(tester), 'standard');
      expect(holdsFocus(tester, find.byType(MPRadio).at(1)), isTrue);
    });
  });

  group('the size ladder', () {
    testWidgets('sets the size once for every option', (WidgetTester tester) async {
      final List<double> rings = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPRadioGroup(size: size, children: _delivery)));
        final Finder ring = find.descendant(
          of: find.byType(MPRadio).first,
          matching: find.byWidgetPredicate(
            (Widget widget) =>
                widget is AnimatedContainer &&
                (widget.decoration as BoxDecoration?)?.border != null,
          ),
        );
        rings.add(tester.getSize(ring).width);
      }

      expect(rings, <double>[16, 18, 20, 22, 24]);
    });
  });
}
