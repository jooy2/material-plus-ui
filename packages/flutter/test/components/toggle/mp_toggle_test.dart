import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button_group/mp_button_group.dart';
import 'package:material_plus_ui/src/components/toggle/mp_toggle.dart';
import 'package:material_plus_ui/src/components/toggle/mp_toggle_group.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

Finder _toggle(String label) {
  return find.ancestor(of: find.text(label), matching: find.byType(MPToggle));
}

BoxDecoration _surfaceOf(WidgetTester tester, [Finder? toggle]) {
  final AnimatedContainer container = tester.widget<AnimatedContainer>(
    find
        .descendant(of: toggle ?? find.byType(MPToggle), matching: find.byType(AnimatedContainer))
        .first,
  );

  return container.decoration! as BoxDecoration;
}

const List<Widget> _marks = <Widget>[
  MPToggle(value: 'bold', child: Text('Bold')),
  MPToggle(value: 'italic', child: Text('Italic')),
  MPToggle(value: 'underline', child: Text('Underline')),
];

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('MPToggle', () {
    group('the state', () {
      testWidgets('announces itself as a button that is pressed or not', (
        WidgetTester tester,
      ) async {
        final SemanticsHandle semantics = tester.ensureSemantics();

        await tester.pumpWidget(host(const MPToggle(initialPressed: true, child: Text('Grid'))));

        expect(
          tester.getSemantics(find.text('Grid')),
          matchesSemantics(
            label: 'Grid',
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

      testWidgets('stays down once it is pressed', (WidgetTester tester) async {
        await tester.pumpWidget(host(const MPToggle(child: Text('Grid'))));
        await tester.tap(find.byType(MPToggle));
        await tester.pumpAndSettle();

        expect(_surfaceOf(tester).color, light.primaryContainer);
      });

      testWidgets('reports the change, and can be controlled', (WidgetTester tester) async {
        final List<bool> changes = <bool>[];

        await tester.pumpWidget(
          host(MPToggle(pressed: false, onChanged: changes.add, child: const Text('Grid'))),
        );
        await tester.tap(find.byType(MPToggle));
        await tester.pumpAndSettle();

        expect(changes, <bool>[true]);
        // Controlled, and the parent has not moved it.
        expect(_surfaceOf(tester).color, const Color(0x00000000));
      });

      testWidgets('presses from the keyboard', (WidgetTester tester) async {
        final List<bool> changes = <bool>[];
        final FocusNode focus = FocusNode();
        addTearDown(focus.dispose);

        await tester.pumpWidget(
          host(MPToggle(focusNode: focus, onChanged: changes.add, child: const Text('Grid'))),
        );
        focus.requestFocus();
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);

        expect(changes, <bool>[true, false]);
      });
    });

    group('the surface', () {
      testWidgets('is neutral while off, whatever family it turns on in', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          host(
            const MPToggle(variant: MPVariant.filled, color: MPColor.error, child: Text('Grid')),
          ),
        );

        expect(_surfaceOf(tester).color, light.surfaceContainerHighest);
        expect(
          tester
              .widget<RichText>(
                find.descendant(of: find.text('Grid'), matching: find.byType(RichText)),
              )
              .text
              .style!
              .color,
          light.onSurfaceVariant,
        );
      });

      testWidgets('takes the accent once it is on', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(const MPToggle(variant: MPVariant.filled, pressed: true, child: Text('Grid'))),
        );
        await tester.pumpAndSettle();

        expect(_surfaceOf(tester).color, light.primary);
      });

      testWidgets('keeps its depth across the change', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(const MPToggle(variant: MPVariant.elevated, pressed: false, child: Text('Grid'))),
        );
        expect(_surfaceOf(tester).boxShadow, MPShadows.of(1));

        await tester.pumpWidget(
          host(const MPToggle(variant: MPVariant.elevated, pressed: true, child: Text('Grid'))),
        );
        expect(_surfaceOf(tester).boxShadow, MPShadows.of(1));
      });

      testWidgets('takes the specification’s disabled treatment', (WidgetTester tester) async {
        final List<bool> changes = <bool>[];

        await tester.pumpWidget(
          host(
            MPToggle(
              variant: MPVariant.filled,
              disabled: true,
              onChanged: changes.add,
              child: const Text('Grid'),
            ),
          ),
        );
        await tester.tap(find.byType(MPToggle));
        await tester.pumpAndSettle();

        expect(changes, isEmpty);
        expect(
          _surfaceOf(tester).color,
          light.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
        );
      });
    });

    group('icon only', () {
      testWidgets('goes square around the glyph', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(const MPToggle(semanticLabel: 'Bold', startIcon: SizedBox.square(dimension: 20))),
        );

        expect(tester.getSize(find.byType(MPToggle)), const Size(56, 56));
      });

      testWidgets('keeps the inline padding when there is a label', (WidgetTester tester) async {
        await tester.pumpWidget(host(const MPToggle(child: Text('B'))));

        expect(tester.getSize(find.byType(MPToggle)).width, greaterThan(56));
      });
    });

    group('inside a group', () {
      testWidgets('takes the set’s values, and its own still win', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(
            const MPToggleGroup(
              size: MPSize.sm,
              variant: MPVariant.filled,
              children: <Widget>[
                MPToggle(value: 'a', child: Text('A')),
                MPToggle(value: 'b', size: MPSize.lg, child: Text('B')),
              ],
            ),
          ),
        );

        expect(tester.getSize(_toggle('A')).height, 40);
        expect(_surfaceOf(tester, _toggle('A')).color, light.surfaceContainerHighest);
        expect(tester.getSize(_toggle('B')).height, 64);
      });

      testWidgets('reads an MPButtonGroup too', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(
            const MPButtonGroup(
              size: MPSize.xs,
              children: <Widget>[MPToggle(child: Text('A'))],
            ),
          ),
        );

        expect(tester.getSize(find.byType(MPToggle)).height, 32);
      });
    });
  });

  group('MPToggleGroup', () {
    group('the value', () {
      testWidgets('belongs to the set and holds one at a time', (WidgetTester tester) async {
        final List<List<String>> changes = <List<String>>[];

        await tester.pumpWidget(host(MPToggleGroup(onChanged: changes.add, children: _marks)));
        await tester.tap(find.text('Bold'));
        await tester.pump();
        await tester.tap(find.text('Italic'));
        await tester.pumpAndSettle();

        expect(changes, <List<String>>[
          <String>['bold'],
          <String>['italic'],
        ]);
        expect(_surfaceOf(tester, _toggle('Bold')).color, const Color(0x00000000));
        expect(_surfaceOf(tester, _toggle('Italic')).color, light.primaryContainer);
      });

      testWidgets('holds as many as it likes when told to', (WidgetTester tester) async {
        final List<List<String>> changes = <List<String>>[];

        await tester.pumpWidget(
          host(MPToggleGroup(multiple: true, onChanged: changes.add, children: _marks)),
        );
        await tester.tap(find.text('Bold'));
        await tester.pump();
        await tester.tap(find.text('Underline'));
        await tester.pump();

        expect(changes.last, <String>['bold', 'underline']);
      });

      testWidgets('starts where initialValue says', (WidgetTester tester) async {
        await tester.pumpWidget(
          host(const MPToggleGroup(initialValue: <String>['italic'], children: _marks)),
        );
        await tester.pumpAndSettle();

        expect(_surfaceOf(tester, _toggle('Italic')).color, light.primaryContainer);
      });

      testWidgets('turns the one that is on off again', (WidgetTester tester) async {
        final List<List<String>> changes = <List<String>>[];

        await tester.pumpWidget(
          host(
            MPToggleGroup(value: const <String>['bold'], onChanged: changes.add, children: _marks),
          ),
        );
        await tester.tap(find.text('Bold'));

        expect(changes, <List<String>>[<String>[]]);
      });
    });

    group('what a member inherits', () {
      testWidgets('disables the whole run at once', (WidgetTester tester) async {
        final List<List<String>> changes = <List<String>>[];

        await tester.pumpWidget(
          host(MPToggleGroup(disabled: true, onChanged: changes.add, children: _marks)),
        );
        await tester.tap(find.text('Bold'));

        expect(changes, isEmpty);
      });
    });

    group('the keyboard', () {
      testWidgets('takes one focus stop and moves it with the arrows', (WidgetTester tester) async {
        final FocusNode before = FocusNode();
        addTearDown(before.dispose);

        await tester.pumpWidget(
          host(afterFocusStop(before, const MPToggleGroup(children: _marks))),
        );
        before.requestFocus();
        await tester.pump();

        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        expect(holdsFocus(tester, _toggle('Bold')), isTrue);

        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump();
        await tester.pump();
        expect(holdsFocus(tester, _toggle('Italic')), isTrue);

        // The arrows move the stop; they do not press anything.
        expect(_surfaceOf(tester, _toggle('Italic')).color, const Color(0x00000000));

        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pumpAndSettle();
        expect(_surfaceOf(tester, _toggle('Italic')).color, light.primaryContainer);

        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        expect(holdsFocus(tester, find.byType(MPToggleGroup)), isFalse);
      });

      testWidgets('wraps from the last toggle back to the first', (WidgetTester tester) async {
        final FocusNode before = FocusNode();
        addTearDown(before.dispose);

        await tester.pumpWidget(
          host(
            afterFocusStop(
              before,
              const MPToggleGroup(initialValue: <String>['underline'], children: _marks),
            ),
          ),
        );
        before.requestFocus();
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        expect(holdsFocus(tester, _toggle('Underline')), isTrue);

        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump();
        await tester.pump();
        expect(holdsFocus(tester, _toggle('Bold')), isTrue);
      });

      testWidgets('stops at the end when told not to wrap', (WidgetTester tester) async {
        final FocusNode before = FocusNode();
        addTearDown(before.dispose);

        await tester.pumpWidget(
          host(
            afterFocusStop(
              before,
              const MPToggleGroup(
                loopFocus: false,
                initialValue: <String>['underline'],
                children: _marks,
              ),
            ),
          ),
        );
        before.requestFocus();
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump();
        await tester.pump();

        expect(holdsFocus(tester, _toggle('Underline')), isTrue);
      });
    });

    group('the shape of the run', () {
      testWidgets('keeps the outer corners round and cuts the inner ones', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(host(const MPToggleGroup(children: _marks)));

        expect(_surfaceOf(tester, _toggle('Italic')).borderRadius, BorderRadius.circular(8));
        expect(
          _surfaceOf(tester, _toggle('Bold')).borderRadius,
          const BorderRadius.only(
            topLeft: Radius.circular(28),
            bottomLeft: Radius.circular(28),
            topRight: Radius.circular(8),
            bottomRight: Radius.circular(8),
          ),
        );
      });
    });
  });
}
