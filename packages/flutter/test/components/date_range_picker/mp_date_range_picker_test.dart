import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/date_range_picker/mp_date_range_picker.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';

/// The React suite's questions for `MPDateRangePicker`, asked of the render
/// tree.

Widget _top(Widget child) {
  return host(
    overlay: true,
    Align(
      alignment: Alignment.topCenter,
      child: Padding(padding: const EdgeInsets.only(top: 8), child: child),
    ),
  );
}

Widget _picker({
  MPDateRange? value,
  MPDateRange? initialValue,
  ValueChanged<MPDateRange>? onChanged,
  int monthCount = 2,
  bool closeOnSelect = true,
  List<MPDateRangePreset> presets = const <MPDateRangePreset>[],
  bool clearable = false,
}) {
  return _top(
    MPDateRangePicker(
      value: value,
      initialValue: initialValue,
      onChanged: onChanged,
      defaultMonth: DateTime(2026, 7),
      monthCount: monthCount,
      closeOnSelect: closeOnSelect,
      presets: presets,
      clearable: clearable,
      startPlaceholder: 'Check in',
      endPlaceholder: 'Check out',
      label: const Text('Stay'),
    ),
  );
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPFieldShell));
  await tester.pumpAndSettle();
}

Finder _cell(String label) => find.bySemanticsLabel(label);

BoxDecoration _decoration(WidgetTester tester, String label) {
  final AnimatedContainer box = tester.widget<AnimatedContainer>(
    find.descendant(of: _cell(label), matching: find.byType(AnimatedContainer)).first,
  );

  return box.decoration! as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the trigger', () {
    testWidgets('is a button named by the label in the notch', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_picker());

      expect(
        tester.getSemantics(find.byType(MPFieldShell)),
        matchesSemantics(
          label: 'Stay',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          hasExpandedState: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('shows a placeholder per end, because either may be missing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());

      expect(find.text('Check in').hitTestable(), findsOneWidget);
      expect(find.text('Check out').hitTestable(), findsOneWidget);
    });

    testWidgets('writes both ends once they are chosen', (WidgetTester tester) async {
      await tester.pumpWidget(
        _picker(
          initialValue: MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)),
        ),
      );

      expect(find.text('Jul 3, 2026'), findsOneWidget);
      expect(find.text('Jul 9, 2026'), findsOneWidget);
    });
  });

  group('the two panels', () {
    testWidgets('show two months, because a range that crosses one is the ordinary case', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      expect(find.text('July'), findsOneWidget);
      expect(find.text('August'), findsOneWidget);
    });

    testWidgets('drop to one when asked', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(monthCount: 1));
      await _open(tester);

      expect(find.text('July'), findsOneWidget);
      expect(find.text('August'), findsNothing);
      expect(find.bySemanticsLabel('Next month'), findsOneWidget);
    });

    testWidgets('move as a pair: the two panels are one calendar in two halves', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      // One back stepper on the left and one forward stepper on the right.
      expect(find.bySemanticsLabel('Previous month'), findsOneWidget);
      expect(find.bySemanticsLabel('Next month'), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pumpAndSettle();

      expect(find.text('August'), findsOneWidget);
      expect(find.text('September'), findsOneWidget);
    });

    testWidgets('draw no leading or trailing days, so no date appears in both panels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      // July's panel stops at the 31st, so the 1st appears once per month.
      expect(_cell('Saturday, August 1, 2026'), findsOneWidget);
      expect(find.text('1'), findsNWidgets(2));
    });
  });

  group('choosing a range', () {
    testWidgets('takes two presses, and reports half a range as half a range', (
      WidgetTester tester,
    ) async {
      final List<MPDateRange> chosen = <MPDateRange>[];

      await tester.pumpWidget(_picker(onChanged: chosen.add));
      await _open(tester);
      await tester.tap(_cell('Friday, July 3, 2026'));
      await tester.pumpAndSettle();
      await tester.tap(_cell('Thursday, July 9, 2026'));
      await tester.pumpAndSettle();

      expect(chosen, <MPDateRange>[
        MPDateRange(start: DateTime(2026, 7, 3)),
        MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)),
      ]);
    });

    testWidgets('reads a backwards pair as the same range given the other way round', (
      WidgetTester tester,
    ) async {
      MPDateRange? chosen;

      await tester.pumpWidget(_picker(onChanged: (MPDateRange next) => chosen = next));
      await _open(tester);
      await tester.tap(_cell('Thursday, July 9, 2026'));
      await tester.pumpAndSettle();
      await tester.tap(_cell('Friday, July 3, 2026'));
      await tester.pumpAndSettle();

      expect(chosen, MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)));
    });

    testWidgets('closes once both ends are in, and stays open when told to', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());
      await _open(tester);
      await tester.tap(_cell('Friday, July 3, 2026'));
      await tester.pumpAndSettle();
      await tester.tap(_cell('Thursday, July 9, 2026'));
      await tester.pumpAndSettle();

      expect(find.text('August'), findsNothing);
    });

    testWidgets('marks the band between the two ends', (WidgetTester tester) async {
      await tester.pumpWidget(
        _picker(
          initialValue: MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)),
        ),
      );
      await _open(tester);

      expect(_decoration(tester, 'Friday, July 3, 2026').color, light.primary);
      expect(_decoration(tester, 'Monday, July 6, 2026').color, light.primaryContainer);
      expect(_decoration(tester, 'Monday, July 6, 2026').borderRadius, BorderRadius.zero);
      expect(_decoration(tester, 'Thursday, July 9, 2026').color, light.primary);
      expect(_decoration(tester, 'Friday, July 10, 2026').color, const Color(0x00000000));
    });

    testWidgets('previews the band under the pointer before the second press', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker());
      await _open(tester);
      await tester.tap(_cell('Friday, July 3, 2026'));
      await tester.pumpAndSettle();

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(_cell('Thursday, July 9, 2026')));
      await tester.pumpAndSettle();

      expect(_decoration(tester, 'Monday, July 6, 2026').color, light.primaryContainer);
    });
  });

  group('the footer', () {
    testWidgets('says which end the next press fills', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      expect(find.text('Start'), findsOneWidget);

      await tester.tap(_cell('Friday, July 3, 2026'));
      await tester.pumpAndSettle();

      expect(find.text('End'), findsOneWidget);
    });
  });

  group('presets', () {
    testWidgets('apply a named range in one press', (WidgetTester tester) async {
      MPDateRange? chosen;
      final MPDateRange week = MPDateRange(start: DateTime(2026, 9, 1), end: DateTime(2026, 9, 7));

      await tester.pumpWidget(
        _picker(
          onChanged: (MPDateRange next) => chosen = next,
          presets: <MPDateRangePreset>[
            MPDateRangePreset(label: const Text('First week of September'), value: week),
            MPDateRangePreset.computed(
              label: const Text('Today'),
              resolve: () => MPDateRange(start: DateTime(2026), end: DateTime(2026)),
            ),
          ],
        ),
      );
      await _open(tester);
      await tester.tap(find.text('First week of September'));
      await tester.pumpAndSettle();

      expect(chosen, week);
      expect(find.text('Sep 1, 2026'), findsOneWidget);
    });
  });

  group('clearing', () {
    testWidgets('hands back the empty range rather than null', (WidgetTester tester) async {
      final List<MPDateRange> chosen = <MPDateRange>[];

      await tester.pumpWidget(
        _picker(
          clearable: true,
          value: MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)),
          onChanged: chosen.add,
        ),
      );
      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pumpAndSettle();

      expect(chosen, <MPDateRange>[MPDateRange.empty]);
    });
  });

  group('submitting', () {
    testWidgets('hands an MPForm both ends as one ISO interval, once both are in', (
      WidgetTester tester,
    ) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? values;

      await tester.pumpWidget(
        _top(
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> submitted) => values = submitted,
            children: <Widget>[
              MPDateRangePicker(
                name: 'stay',
                initialValue: MPDateRange(start: DateTime(2026, 7, 3), end: DateTime(2026, 7, 9)),
              ),
              MPDateRangePicker(
                name: 'half',
                initialValue: MPDateRange(start: DateTime(2026, 7, 3)),
              ),
            ],
          ),
        ),
      );
      form.currentState!.submit();

      expect(values, <String, Object?>{'stay': '2026-07-03/2026-07-09', 'half': ''});
    });
  });
}
