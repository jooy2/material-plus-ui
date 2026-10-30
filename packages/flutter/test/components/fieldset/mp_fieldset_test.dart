import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/fieldset/mp_fieldset.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPFieldset`. A `<fieldset disabled>` is
/// the browser reaching every control inside; here it is a scope every control
/// reads, and the focus and the pointer taken away from the group.

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the group', () {
    testWidgets('draws the legend in the sheet title role', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPFieldset(legend: Text('Billing address'), children: <Widget>[SizedBox()]),
        ),
      );

      final TextStyle legend = styleOf(tester, 'Billing address');

      expect(legend.fontSize, 16);
      expect(legend.color, light.onSurface);
    });

    testWidgets('reads the legend before every control inside it', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 300,
          const MPFieldset(
            legend: Text('Billing address'),
            children: <Widget>[MPTextField(label: Text('Street'), value: '', fullWidth: true)],
          ),
        ),
      );

      final List<String> labels = semanticsLabels(tester);

      expect(labels.indexOf('Billing address'), lessThan(labels.indexOf('Street')));

      handle.dispose();
    });

    testWidgets('draws a description under the legend', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPFieldset(
            legend: Text('Billing address'),
            description: Text('Where the invoice goes.'),
            children: <Widget>[SizedBox()],
          ),
        ),
      );

      expect(
        tester.getTopLeft(find.text('Where the invoice goes.')).dy,
        greaterThan(tester.getTopLeft(find.text('Billing address')).dy),
      );
      expect(styleOf(tester, 'Where the invoice goes.').color, light.onSurfaceVariant);
    });

    testWidgets('draws no legend block when there is nothing to put in one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 300, const MPFieldset(children: <Widget>[SizedBox(height: 10)])),
      );

      expect(tester.getSize(find.byType(MPFieldset)).height, 10);
    });

    testWidgets('stacks its controls on the ladder', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPFieldset(children: <Widget>[SizedBox(height: 10), SizedBox(height: 10)]),
        ),
      );

      expect(tester.getSize(find.byType(MPFieldset)).height, 10 + 12 + 10);

      await tester.pumpWidget(
        host(
          width: 300,
          const MPFieldset(
            size: MPSize.xl,
            children: <Widget>[SizedBox(height: 10), SizedBox(height: 10)],
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPFieldset)).height, 10 + 16 + 10);
    });

    testWidgets('draws no surface of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPFieldset(legend: Text('Group'), children: <Widget>[SizedBox()])),
      );

      expect(
        find.descendant(of: find.byType(MPFieldset), matching: find.byType(DecoratedBox)),
        findsNothing,
      );
    });
  });

  group('disabled', () {
    testWidgets('reaches every control inside, including ones it never heard of', (
      WidgetTester tester,
    ) async {
      int presses = 0;
      int foreign = 0;
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          width: 300,
          afterFocusStop(
            before,
            MPFieldset(
              disabled: true,
              children: <Widget>[
                const MPTextField(label: Text('Street'), value: '', fullWidth: true),
                MPButton(onPressed: () => presses++, child: const Text('Save')),
                GestureDetector(
                  onTap: () => foreign++,
                  child: const SizedBox(key: Key('foreign'), width: 40, height: 40),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.byType(MPButton), warnIfMissed: false);
      await tester.tap(find.byKey(const Key('foreign')), warnIfMissed: false);
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(presses, 0);
      expect(foreign, 0);
      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
      expect(holdsFocus(tester, find.byType(MPButton)), isFalse);
    });

    testWidgets('counts a disabled fieldset further out', (WidgetTester tester) async {
      late bool seen;

      await tester.pumpWidget(
        host(
          width: 300,
          MPFieldset(
            disabled: true,
            children: <Widget>[
              MPFieldset(
                children: <Widget>[
                  Builder(
                    builder: (BuildContext context) {
                      seen = MPFieldsetScope.disabledOf(context);

                      return const SizedBox();
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      );

      expect(seen, isTrue);
    });

    testWidgets('leaves them alone otherwise', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(
          width: 300,
          MPFieldset(
            children: <Widget>[MPButton(onPressed: () => presses++, child: const Text('Save'))],
          ),
        ),
      );

      await tester.tap(find.byType(MPButton));

      expect(presses, 1);
    });

    testWidgets('keeps what was typed as it is disabled and enabled again', (
      WidgetTester tester,
    ) async {
      Widget build({required bool disabled}) => host(
        width: 300,
        MPFieldset(
          disabled: disabled,
          children: const <Widget>[
            MPTextField(label: Text('Street'), value: 'Main', fullWidth: true),
          ],
        ),
      );

      await tester.pumpWidget(build(disabled: false));
      final EditableTextState editor = tester.state<EditableTextState>(find.byType(EditableText));

      await tester.pumpWidget(build(disabled: true));
      await tester.pumpWidget(build(disabled: false));

      expect(tester.state<EditableTextState>(find.byType(EditableText)), same(editor));
    });
  });
}
