import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/date_time_picker/mp_date_time_picker.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/icons.dart';

import '../../support/host.dart';

/// The React suite's questions for `MPDateTimePicker`, asked of the render
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
  DateTime? value,
  ValueChanged<DateTime?>? onChanged,
  DateTime? minDate,
  bool? hour12 = false,
  bool clearable = false,
  String Function(DateTime value)? format,
}) {
  return _top(
    MPDateTimePicker(
      value: value,
      onChanged: onChanged,
      defaultMonth: DateTime(2026, 7),
      minDate: minDate,
      hour12: hour12,
      clearable: clearable,
      format: format,
      label: const Text('Starts'),
    ),
  );
}

/// A parent that holds the value, as a form would.
class _Controlled extends StatefulWidget {
  const _Controlled({this.initial, this.minDate});

  final DateTime? initial;
  final DateTime? minDate;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late DateTime? value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return _picker(
      value: value,
      minDate: widget.minDate,
      onChanged: (DateTime? next) => setState(() => value = next),
    );
  }
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPFieldShell));
  await tester.pumpAndSettle();
}

Future<void> _press(WidgetTester tester, String column, String text) async {
  final Finder row = find.descendant(of: find.bySemanticsLabel(column), matching: find.text(text));

  await tester.ensureVisible(row);
  await tester.pumpAndSettle();
  await tester.tap(row);
  await tester.pumpAndSettle();
}

void main() {
  group('the popup', () {
    testWidgets('holds a calendar and a clock side by side', (WidgetTester tester) async {
      await tester.pumpWidget(const _Controlled());
      await _open(tester);

      final Rect grid = tester.getRect(find.bySemanticsLabel('July 2026'));
      final Rect clock = tester.getRect(find.bySemanticsLabel('Hour'));

      expect(clock.left, greaterThan(grid.right));
    });

    testWidgets('draws both panels at the same height, so the popup is one rectangle', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const _Controlled());
      await _open(tester);

      expect(
        tester.getSize(find.bySemanticsLabel('July 2026')).height,
        tester.getSize(find.bySemanticsLabel('Hour')).height,
      );
    });
  });

  group('choosing a moment', () {
    testWidgets('does not close on the day, because a moment is two answers', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const _Controlled());
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Wednesday, July 15, 2026'));
      await tester.pumpAndSettle();

      expect(find.bySemanticsLabel('Hour'), findsOneWidget);
    });

    testWidgets('takes a day and then a time', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Wednesday, July 15, 2026'));
      await tester.pumpAndSettle();

      expect(chosen, DateTime(2026, 7, 15));

      await _press(tester, 'Hour', '14');

      expect(chosen, DateTime(2026, 7, 15, 14));
    });

    testWidgets('keeps the clock when the day is corrected afterwards', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(value: DateTime(2026, 7, 15, 14, 30), onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Monday, July 20, 2026'));

      expect(chosen, DateTime(2026, 7, 20, 14, 30));
    });

    testWidgets('closes on Done', (WidgetTester tester) async {
      await tester.pumpWidget(const _Controlled());
      await _open(tester);
      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();

      expect(find.bySemanticsLabel('Hour'), findsNothing);
    });
  });

  group('the bounds, at full precision', () {
    testWidgets('leave the day the minimum falls on selectable, and grey out its morning', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _Controlled(initial: DateTime(2026, 7, 27, 12), minDate: DateTime(2026, 7, 27, 9, 30)),
      );
      await _open(tester);

      await _press(tester, 'Hour', '08');
      expect(find.text('Jul 27, 2026, 12:00'), findsOneWidget);

      await _press(tester, 'Hour', '09');
      expect(find.text('Jul 27, 2026, 09:00'), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('Sunday, July 26, 2026'));
      await tester.pumpAndSettle();
      expect(find.text('Jul 27, 2026, 09:00'), findsOneWidget);
    });
  });

  group('submitting', () {
    testWidgets('hands an MPForm the shape a datetime-local input submits, in local time', (
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
              MPDateTimePicker(name: 'starts', initialValue: DateTime(2026, 7, 15, 23, 45)),
            ],
          ),
        ),
      );
      form.currentState!.submit();

      expect(values, <String, Object?>{'starts': '2026-07-15T23:45'});
    });
  });

  group('the trigger', () {
    testWidgets('writes the whole moment, and agrees with the dial it was given', (
      WidgetTester tester,
    ) async {
      final DateTime moment = DateTime(2026, 7, 15, 21, 5);

      await tester.pumpWidget(_picker(value: moment, hour12: true));
      expect(find.text('Jul 15, 2026, 9:05 PM'), findsOneWidget);

      await tester.pumpWidget(_picker(value: moment, hour12: false));
      expect(find.text('Jul 15, 2026, 21:05'), findsOneWidget);
    });

    testWidgets('wears the calendar glyph alone', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());

      expect(find.byType(MPGlyph), findsOneWidget);
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.calendar);
    });

    testWidgets('empties on the ×', (WidgetTester tester) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(value: DateTime(2026, 7, 15, 9), clearable: true, onChanged: chosen.add),
      );
      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pumpAndSettle();

      expect(chosen, <DateTime?>[null]);
    });
  });
}
