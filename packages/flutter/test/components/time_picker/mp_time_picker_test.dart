import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/time_picker/mp_time_picker.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/locales/ko.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';

/// The React suite's questions for `MPTimePicker`, asked of the render tree.

final DateTime _day = DateTime(2026, 7, 7);

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
  DateTime? initialValue,
  ValueChanged<DateTime?>? onChanged,
  DateTime? minTime,
  DateTime? maxTime,
  bool Function(DateTime value, MPTimeUnit unit)? shouldDisableTime,
  bool? hour12 = false,
  bool showSeconds = false,
  int hourStep = 1,
  int minuteStep = 1,
  String? locale,
  bool closeOnSelect = false,
  String? name,
  bool clearable = false,
  Widget? startIcon = const _Default(),
}) {
  final MPTimePicker picker = startIcon is _Default
      ? MPTimePicker(
          value: value,
          initialValue: initialValue,
          onChanged: onChanged,
          referenceDate: _day,
          minTime: minTime,
          maxTime: maxTime,
          shouldDisableTime: shouldDisableTime,
          hour12: hour12,
          showSeconds: showSeconds,
          hourStep: hourStep,
          minuteStep: minuteStep,
          locale: locale,
          closeOnSelect: closeOnSelect,
          name: name,
          clearable: clearable,
          label: const Text('Start'),
        )
      : MPTimePicker(referenceDate: _day, label: const Text('Start'), startIcon: startIcon);

  return _top(picker);
}

class _Default extends StatelessWidget {
  const _Default();

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPFieldShell));
  await tester.pumpAndSettle();
}

/// The row a screen reader calls [label], which is its number and its column:
/// `09 Hour`.
Finder _row(String label) => find.bySemanticsLabel(label);

/// Scrolls [column] until the row reading [text] is in view, and presses it.
Future<void> _press(WidgetTester tester, String column, String text) async {
  final Finder row = find.descendant(of: find.bySemanticsLabel(column), matching: find.text(text));

  await tester.ensureVisible(row);
  await tester.pumpAndSettle();
  await tester.tap(row);
  await tester.pumpAndSettle();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the trigger', () {
    testWidgets('is a button named by the label in the notch', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_picker(initialValue: DateTime(2026, 7, 7, 9, 5)));

      expect(
        tester.getSemantics(find.byType(MPFieldShell)),
        matchesSemantics(
          label: 'Start',
          value: '09:05',
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

    testWidgets('wears the clock glyph', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());

      expect(tester.widget<MPGlyph>(find.byType(MPGlyph).first).shape, MPGlyphShape.clock);
    });

    testWidgets('opens on a press even with no glyph holding the label up', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(startIcon: null));
      await _open(tester);

      expect(find.bySemanticsLabel('Hour'), findsOneWidget);
    });

    testWidgets('writes the chosen time the way the locale writes it', (WidgetTester tester) async {
      final DateTime time = DateTime(2026, 7, 7, 21, 5);

      await tester.pumpWidget(_picker(initialValue: time, hour12: null));
      expect(find.text('9:05 PM'), findsOneWidget);

      await tester.pumpWidget(_picker(value: time, hour12: null, locale: 'ko'));
      expect(find.text('오후 9:05'), findsOneWidget);

      await tester.pumpWidget(_picker(value: time, hour12: null, locale: 'de'));
      expect(find.text('21:05'), findsOneWidget);
    });
  });

  group('the columns', () {
    testWidgets('are named, and leave the seconds out unless asked', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      expect(find.bySemanticsLabel('Hour'), findsOneWidget);
      expect(find.bySemanticsLabel('Minute'), findsOneWidget);
      expect(find.bySemanticsLabel('Second'), findsNothing);
      expect(find.bySemanticsLabel('AM/PM'), findsNothing);
    });

    testWidgets('add the seconds when asked', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(showSeconds: true));
      await _open(tester);

      expect(find.bySemanticsLabel('Second'), findsOneWidget);
    });

    testWidgets('grow an AM/PM column on a 12-hour dial, read 12 first', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(hour12: true));
      await _open(tester);

      expect(find.bySemanticsLabel('AM/PM'), findsOneWidget);
      expect(find.text('AM'), findsOneWidget);
      expect(tester.getTopLeft(_row('12 Hour')).dy, lessThan(tester.getTopLeft(_row('1 Hour')).dy));
    });

    testWidgets('step as far apart as they were told to', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(minuteStep: 15));
      await _open(tester);

      expect(_row('15 Minute'), findsOneWidget);
      expect(_row('05 Minute'), findsNothing);
    });

    testWidgets('survive a step of nought, or a negative one', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(minuteStep: 0, hourStep: -3));
      await _open(tester);

      expect(_row('59 Minute'), findsOneWidget);
      expect(_row('23 Hour'), findsOneWidget);
    });

    testWidgets('hold a step larger than the column to the column', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(minuteStep: 90));
      await _open(tester);

      expect(_row('00 Minute'), findsOneWidget);
      expect(_row('01 Minute'), findsNothing);
    });

    testWidgets('match the calendar’s seven rows in height', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      expect(tester.getSize(find.bySemanticsLabel('Hour')).height, 40 * 7);
    });
  });

  group('the columns as a keyboard reader meets them', () {
    testWidgets('take the focus on the chosen row and walk it with the arrows', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(
          initialValue: DateTime(2026, 7, 7, 9, 30),
          onChanged: (DateTime? next) => chosen = next,
        ),
      );
      await _open(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      // The arrows move the focus and choose nothing.
      expect(chosen, isNull);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(chosen, DateTime(2026, 7, 7, 11, 30));
    });

    testWidgets('go to the ends with Home and End, and stop there', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(chosen?.hour, 23);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(chosen?.hour, 0);
    });

    testWidgets('take one tab stop for the whole column', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      await _open(tester);

      final FocusNode hour = FocusManager.instance.primaryFocus!;

      expect(hour.debugLabel, 'MPTimeGrid hour 0');

      // What Tab asks for: the next stop is the minute column's, not the next
      // hour.
      hour.nextFocus();
      await tester.pumpAndSettle();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'MPTimeGrid minute 0');
    });

    testWidgets('bring the chosen row into view on open', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: DateTime(2026, 7, 7, 9, 45)));
      await _open(tester);

      final Rect column = tester.getRect(find.bySemanticsLabel('Minute'));
      final Rect row = tester.getRect(_row('45 Minute'));

      expect(row.top, greaterThanOrEqualTo(column.top));
      expect(row.bottom, lessThanOrEqualTo(column.bottom + 0.01));
    });
  });

  group('choosing a time', () {
    testWidgets('hands the parent a DateTime on the reference day', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.tap(_row('03 Hour'));

      expect(chosen, DateTime(2026, 7, 7, 3));
    });

    testWidgets('takes two answers without closing in between, and closes on Done', (
      WidgetTester tester,
    ) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(_picker(onChanged: chosen.add));
      await _open(tester);
      await _press(tester, 'Hour', '09');
      await _press(tester, 'Minute', '30');

      expect(chosen.last, DateTime(2026, 7, 7, 9, 30));
      expect(find.text('Done'), findsOneWidget);

      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();

      expect(find.text('Done'), findsNothing);
      expect(find.text('09:30'), findsOneWidget);
    });

    testWidgets('closes as soon as a column is touched when asked', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(closeOnSelect: true));
      await _open(tester);
      await tester.tap(_row('09 Hour'));
      await tester.pumpAndSettle();

      expect(find.bySemanticsLabel('Hour'), findsNothing);
    });

    testWidgets('marks the chosen row rather than only highlighting it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_picker(initialValue: DateTime(2026, 7, 7, 9, 30)));
      await _open(tester);

      expect(tester.getSemantics(_row('09 Hour')).flagsCollection.isSelected, isNotNull);
      final AnimatedContainer box = tester.widget<AnimatedContainer>(
        find.descendant(of: _row('09 Hour'), matching: find.byType(AnimatedContainer)).first,
      );

      expect((box.decoration! as BoxDecoration).color, light.primary);
      semantics.dispose();
    });
  });

  group('the bounds', () {
    testWidgets('keep the hour that contains the minimum and grey out the minutes before it', (
      WidgetTester tester,
    ) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(
          initialValue: DateTime(2026, 7, 7, 9, 40),
          minTime: DateTime(2026, 1, 1, 9, 30),
          onChanged: chosen.add,
        ),
      );
      await _open(tester);
      await _press(tester, 'Hour', '08');
      await _press(tester, 'Hour', '09');

      expect(chosen, <DateTime?>[DateTime(2026, 7, 7, 9, 40)]);

      await _press(tester, 'Minute', '10');

      expect(chosen, hasLength(1));

      await _press(tester, 'Minute', '45');

      expect(chosen.last, DateTime(2026, 7, 7, 9, 45));
    });

    testWidgets('take a rule of their own, per column', (WidgetTester tester) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(
          shouldDisableTime: (DateTime value, MPTimeUnit unit) =>
              unit == MPTimeUnit.hour && value.hour >= 12,
          onChanged: chosen.add,
        ),
      );
      await _open(tester);
      await _press(tester, 'Hour', '13');

      expect(chosen, isEmpty);

      await _press(tester, 'Hour', '11');

      expect(chosen, hasLength(1));
    });
  });

  group('submitting', () {
    testWidgets('hands an MPForm the shape a native time input submits', (
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
              MPTimePicker(name: 'start', initialValue: DateTime(2026, 7, 7, 9, 5, 7)),
              MPTimePicker(
                name: 'end',
                showSeconds: true,
                initialValue: DateTime(2026, 7, 7, 17, 0, 30),
              ),
            ],
          ),
        ),
      );
      form.currentState!.submit();

      expect(values, <String, Object?>{'start': '09:05', 'end': '17:00:30'});
    });
  });

  group('localisation', () {
    setUp(() => registerMPMessages(<MPLocale>[ko]));
    tearDown(resetMPMessages);

    testWidgets('names the columns in the locale it was given', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(locale: 'ko', hour12: null));
      await _open(tester);

      expect(find.bySemanticsLabel('시'), findsOneWidget);
      expect(find.bySemanticsLabel('오전/오후'), findsOneWidget);
      expect(find.text('오전'), findsOneWidget);
    });

    testWidgets('follows a provider when it has no locale of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        _top(
          MPLocaleProvider(
            locale: 'ko',
            child: MPTimePicker(initialValue: DateTime(2026, 7, 7, 9, 5)),
          ),
        ),
      );

      expect(find.text('오전 9:05'), findsOneWidget);
    });

    testWidgets('reads the dial off the locale when nobody said which', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(locale: 'de', hour12: null));
      await _open(tester);

      expect(find.bySemanticsLabel('AM/PM'), findsNothing);
      expect(_row('23 Hour'), findsOneWidget);
    });
  });

  group('clearing', () {
    testWidgets('empties the picker on the ×', (WidgetTester tester) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(clearable: true, value: DateTime(2026, 7, 7, 9), onChanged: chosen.add),
      );
      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pumpAndSettle();

      expect(chosen, <DateTime?>[null]);
    });
  });
}
