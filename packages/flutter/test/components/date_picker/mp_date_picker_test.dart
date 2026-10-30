import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/date_picker/mp_date_picker.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/locales/ko.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions for `MPDatePicker`, asked of the render tree.

final DateTime _july7 = DateTime(2026, 7, 7);

Widget _picker({
  DateTime? value,
  DateTime? initialValue,
  ValueChanged<DateTime?>? onChanged,
  bool? open,
  bool initialOpen = false,
  MPDatePrecision precision = MPDatePrecision.day,
  DateTime? defaultMonth,
  DateTime? minDate,
  DateTime? maxDate,
  bool Function(DateTime date)? shouldDisableDate,
  String? locale,
  String Function(DateTime value)? format,
  String? placeholder,
  bool clearable = false,
  bool closeOnSelect = true,
  Map<String, String>? labels,
  String? name,
  MPSize? size,
  MPColor? color,
  String? label = 'Due date',
  Widget? startIcon = const _Default(),
  bool required = false,
  bool readOnly = false,
  bool disabled = false,
  FocusNode? focusNode,
  FocusOnKeyEventCallback? onKeyEvent,
  ValueChanged<bool>? onFocusChange,
}) {
  final Widget? icon = startIcon is _Default ? null : startIcon;
  final bool keepDefault = startIcon is _Default;

  final MPDatePicker picker = keepDefault
      ? MPDatePicker(
          value: value,
          initialValue: initialValue,
          onChanged: onChanged,
          open: open,
          initialOpen: initialOpen,
          precision: precision,
          defaultMonth: defaultMonth ?? DateTime(2026, 7),
          minDate: minDate,
          maxDate: maxDate,
          shouldDisableDate: shouldDisableDate,
          locale: locale,
          format: format,
          placeholder: placeholder,
          clearable: clearable,
          closeOnSelect: closeOnSelect,
          labels: labels,
          name: name,
          size: size,
          color: color,
          label: label == null ? null : Text(label),
          required: required,
          readOnly: readOnly,
          disabled: disabled,
          focusNode: focusNode,
          onKeyEvent: onKeyEvent,
          onFocusChange: onFocusChange,
        )
      : MPDatePicker(
          value: value,
          initialValue: initialValue,
          onChanged: onChanged,
          defaultMonth: defaultMonth ?? DateTime(2026, 7),
          label: label == null ? null : Text(label),
          startIcon: icon,
        );

  return _top(picker);
}

/// Puts [child] at the top of the screen, so the popup has the room under it
/// that a test's 800 by 600 leaves.
Widget _top(Widget child) {
  return host(
    overlay: true,
    Align(
      alignment: Alignment.topCenter,
      child: Padding(padding: const EdgeInsets.only(top: 8), child: child),
    ),
  );
}

/// Stands for "leave `startIcon` alone" in [_picker].
class _Default extends StatelessWidget {
  const _Default();

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPDatePicker));
  await tester.pumpAndSettle();
}

Finder _cell(String label) => find.bySemanticsLabel(label);

BoxDecoration _cellDecoration(WidgetTester tester, String label) {
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

      await tester.pumpWidget(_picker(initialValue: _july7));

      expect(
        tester.getSemantics(find.byType(MPFieldShell)),
        matchesSemantics(
          label: 'Due date',
          value: 'Jul 7, 2026',
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

    testWidgets('wears the notched outline a text field wears, at every rung', (
      WidgetTester tester,
    ) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(_picker(size: size));
        heights.add(tester.getSize(find.byType(MPFieldShell)).height);
      }

      expect(find.byType(MPFieldShell), findsOneWidget);
      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        _top(
          MPConfigProvider(
            size: MPSize.sm,
            child: MPDatePicker(label: const Text('Due')),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPFieldShell)).height, 40);
    });

    testWidgets('shows the placeholder while nothing is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(placeholder: 'Pick a day'));

      expect(find.text('Pick a day').hitTestable(), findsOneWidget);
    });

    testWidgets('writes the chosen day the way the locale writes it', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: _july7));
      expect(find.text('Jul 7, 2026'), findsOneWidget);

      await tester.pumpWidget(_picker(initialValue: _july7, locale: 'ko'));
      expect(find.text('2026. 7. 7.'), findsOneWidget);

      await tester.pumpWidget(_picker(initialValue: _july7, locale: 'de-DE'));
      expect(find.text('07.07.2026'), findsOneWidget);
    });

    testWidgets('takes a format of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        _picker(initialValue: _july7, format: (DateTime value) => '${value.day}/${value.month}'),
      );

      expect(find.text('7/7'), findsOneWidget);
    });

    testWidgets('does not change width with its value', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: DateTime(2026, 5, 1)));
      final double narrow = tester.getSize(find.byType(MPFieldShell)).width;

      await tester.pumpWidget(_picker(initialValue: DateTime(2026, 9, 28)));

      expect(tester.getSize(find.byType(MPFieldShell)).width, narrow);
    });

    testWidgets('wears the calendar glyph unless it is asked away', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph).first).shape, MPGlyphShape.calendar);

      await tester.pumpWidget(_picker(startIcon: null));
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('says it is required', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_picker(required: true));

      expect(
        tester.getSemantics(find.byType(MPFieldShell)).flagsCollection.isRequired,
        Tristate.isTrue,
      );
      expect(find.text(' *'), findsOneWidget);
      semantics.dispose();
    });
  });

  group('the width samples', () {
    testWidgets('are not written out again while nothing about them changed', (
      WidgetTester tester,
    ) async {
      int written = 0;
      String format(DateTime value) {
        written += 1;

        return '${value.day}/${value.month}';
      }

      await tester.pumpWidget(_picker(initialValue: _july7, format: format));
      final int first = written;

      await tester.pumpWidget(_picker(initialValue: _july7, format: format, label: 'Again'));

      // The value is written again; the twenty-five samples are not.
      expect(written - first, 1);
    });
  });

  group('the floating label', () {
    double labelTop(WidgetTester tester) => tester.getTopLeft(find.text('Due date')).dy;
    double shellTop(WidgetTester tester) => tester.getTopLeft(find.byType(MPFieldShell)).dy;

    testWidgets('is pinned in the notch by the picker’s own glyph', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());

      expect(labelTop(tester), lessThan(shellTop(tester)));
    });

    testWidgets('rests once the glyph is asked away', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(startIcon: null));

      expect(labelTop(tester), greaterThan(shellTop(tester)));
    });

    testWidgets('lifts again on a chosen day', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(startIcon: null, initialValue: _july7));

      expect(labelTop(tester), lessThan(shellTop(tester)));
    });
  });

  group('choosing a day', () {
    testWidgets('opens the calendar on the month it was told to', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(defaultMonth: DateTime(2027, 2)));
      await _open(tester);

      expect(find.text('February'), findsOneWidget);
      expect(find.text('2027'), findsOneWidget);
    });

    testWidgets('names the grid by the month and every cell as a whole date', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_picker());
      await _open(tester);

      expect(find.bySemanticsLabel('July 2026'), findsOneWidget);
      expect(_cell('Wednesday, July 15, 2026'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('hands the parent a DateTime, and closes', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.tap(find.text('15'));
      await tester.pumpAndSettle();

      expect(chosen, DateTime(2026, 7, 15));
      expect(find.text('Jul 15, 2026'), findsOneWidget);
      expect(find.text('Today'), findsNothing);
    });

    testWidgets('chooses end to end through a controlled parent', (WidgetTester tester) async {
      DateTime? value;

      await tester.pumpWidget(
        StatefulBuilder(
          builder: (BuildContext context, StateSetter setState) {
            return _picker(
              value: value,
              onChanged: (DateTime? next) => setState(() => value = next),
            );
          },
        ),
      );
      await _open(tester);
      await tester.tap(find.text('20'));
      await tester.pumpAndSettle();

      expect(value, DateTime(2026, 7, 20));
      expect(find.text('Jul 20, 2026'), findsOneWidget);
    });

    testWidgets('stays open when told to', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(closeOnSelect: false));
      await _open(tester);
      await tester.tap(find.text('15'));
      await tester.pumpAndSettle();

      expect(find.text('Today'), findsOneWidget);
    });

    testWidgets('keeps the time of day the value already carried', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(value: DateTime(2026, 7, 10, 14, 30), onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.text('15'));

      expect(chosen, DateTime(2026, 7, 15, 14, 30));
    });

    testWidgets('puts the calendar back on the chosen day when it opens again', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(initialValue: _july7));
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pumpAndSettle();
      expect(find.text('August'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      await _open(tester);

      expect(find.text('July'), findsOneWidget);
    });
  });

  group('the chosen day is painted', () {
    testWidgets('fills it with the accent', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: _july7));
      await _open(tester);

      expect(_cellDecoration(tester, 'Tuesday, July 7, 2026').color, light.primary);
    });

    testWidgets('reads the family the picker was given', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: _july7, color: MPColor.tertiary));
      await _open(tester);

      expect(_cellDecoration(tester, 'Tuesday, July 7, 2026').color, light.tertiary);
    });

    testWidgets('leaves an unchosen day unpainted', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(initialValue: _july7));
      await _open(tester);

      expect(_cellDecoration(tester, 'Wednesday, July 8, 2026').color, const Color(0x00000000));
    });
  });

  group('reaching another month', () {
    testWidgets('steps a month at a time', (WidgetTester tester) async {
      await tester.pumpWidget(_picker());
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Previous month'));
      await tester.pumpAndSettle();

      expect(find.text('June'), findsOneWidget);
    });

    testWidgets('opens a grid of years, so any year at all is three presses', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Choose a year'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Previous years'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Previous years'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('1996'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Feb'));
      await tester.pumpAndSettle();
      await tester.tap(_cell('Thursday, February 29, 1996'));
      await tester.pumpAndSettle();

      expect(chosen, DateTime(1996, 2, 29));
    });
  });

  group('precision', () {
    testWidgets('opens a month picker on the twelve months, with no way down to a day', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(precision: MPDatePrecision.month, onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);

      expect(find.text('15'), findsNothing);
      expect(find.bySemanticsLabel('2026'), findsWidgets);

      await tester.tap(find.text('Sep'));
      await tester.pumpAndSettle();

      expect(chosen, DateTime(2026, 9));
      expect(find.text('September 2026'), findsOneWidget);
    });

    testWidgets('still reaches another year through the view above it', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(precision: MPDatePrecision.month, onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.bySemanticsLabel('Choose a year'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('2024'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Mar'));

      expect(chosen, DateTime(2024, 3));
    });

    testWidgets('opens a year picker on the years, answering 1 January', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(precision: MPDatePrecision.year, onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.text('2021'));
      await tester.pumpAndSettle();

      expect(chosen, DateTime(2021));
      expect(find.text('2021'), findsOneWidget);
    });

    testWidgets('names the footer shortcut after the unit and lands on the whole unit', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;
      final DateTime now = DateTime.now();

      await tester.pumpWidget(
        _picker(precision: MPDatePrecision.month, onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.text('This month'));

      expect(chosen, DateTime(now.year, now.month));

      await tester.pumpWidget(_picker(precision: MPDatePrecision.year));
      await tester.pumpAndSettle();
      await _open(tester);

      expect(find.text('This year'), findsOneWidget);
    });

    testWidgets('reads the bounds at the unit it is asking for', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(
          precision: MPDatePrecision.month,
          minDate: DateTime(2026, 7, 10),
          onChanged: (DateTime? next) => chosen = next,
        ),
      );
      await _open(tester);
      await tester.tap(find.text('Jun'));
      await tester.tap(find.text('Jul'));

      expect(chosen, DateTime(2026, 7));
    });

    testWidgets('does not ask shouldDisableDate about a month', (WidgetTester tester) async {
      int asked = 0;

      await tester.pumpWidget(
        _picker(
          precision: MPDatePrecision.month,
          shouldDisableDate: (DateTime date) {
            asked += 1;

            return true;
          },
        ),
      );
      await _open(tester);

      expect(asked, 0);
    });

    testWidgets('says this month in the language the picker is in', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await tester.pumpWidget(_picker(precision: MPDatePrecision.month, locale: 'ko'));
      await _open(tester);

      expect(find.text('이번 달'), findsOneWidget);
    });
  });

  group('what cannot be chosen', () {
    testWidgets('blocks the days before minDate without removing them', (
      WidgetTester tester,
    ) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(_picker(minDate: DateTime(2026, 7, 10), onChanged: chosen.add));
      await _open(tester);
      await tester.tap(_cell('Monday, July 6, 2026'));
      await tester.pumpAndSettle();

      expect(chosen, isEmpty);
      expect(
        tester
            .widget<AnimatedDefaultTextStyle>(
              find
                  .descendant(
                    of: _cell('Monday, July 6, 2026'),
                    matching: find.byType(AnimatedDefaultTextStyle),
                  )
                  .first,
            )
            .style
            .color,
        light.onSurface.withValues(alpha: 0.38),
      );
    });

    testWidgets('blocks the days a rule says are unavailable', (WidgetTester tester) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(
          shouldDisableDate: (DateTime date) => date.weekday >= DateTime.saturday,
          onChanged: chosen.add,
        ),
      );
      await _open(tester);
      await tester.tap(find.text('11'));
      await tester.pumpAndSettle();

      expect(chosen, isEmpty);
    });

    testWidgets('does not open at all while read only or disabled', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(readOnly: true, initialValue: _july7));
      await _open(tester);
      expect(find.text('Today'), findsNothing);

      await tester.pumpWidget(_picker(disabled: true));
      await _open(tester);
      expect(find.text('Today'), findsNothing);
    });
  });

  group('the footer', () {
    testWidgets('offers today, and lands on it', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(_picker(onChanged: (DateTime? next) => chosen = next));
      await _open(tester);
      await tester.tap(find.text('Today'));

      final DateTime now = DateTime.now();

      expect(chosen, DateTime(now.year, now.month, now.day));
    });

    testWidgets('greys today out when today is out of bounds', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(maxDate: DateTime(2000), onChanged: (DateTime? next) => chosen = next),
      );
      await _open(tester);
      await tester.tap(find.text('Today'));

      expect(chosen, isNull);
    });
  });

  group('clearing', () {
    testWidgets('offers no × until there is something to clear', (WidgetTester tester) async {
      await tester.pumpWidget(_picker(clearable: true));
      expect(find.bySemanticsLabel('Clear'), findsNothing);

      await tester.pumpWidget(_picker(clearable: true, value: _july7));
      expect(find.bySemanticsLabel('Clear'), findsOneWidget);
    });

    testWidgets('empties the picker from the × and from the footer', (WidgetTester tester) async {
      final List<DateTime?> chosen = <DateTime?>[];

      await tester.pumpWidget(
        _picker(clearable: true, initialValue: _july7, onChanged: chosen.add),
      );
      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pumpAndSettle();

      expect(chosen, <DateTime?>[null]);
      expect(find.text('Jul 7, 2026'), findsNothing);

      await tester.pumpWidget(
        _picker(clearable: true, value: _july7, onChanged: chosen.add, label: 'Again'),
      );
      await _open(tester);
      await tester.tap(find.text('Clear'));
      await tester.pumpAndSettle();

      expect(chosen, <DateTime?>[null, null]);
      expect(find.text('Today'), findsNothing);
    });
  });

  group('in a form', () {
    testWidgets('submits the local day under its name', (WidgetTester tester) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? values;

      await tester.pumpWidget(
        host(
          overlay: true,
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> submitted) => values = submitted,
            children: <Widget>[
              MPDatePicker(name: 'due', initialValue: DateTime(2026, 7, 15, 23, 30)),
              MPDatePicker(name: 'month', precision: MPDatePrecision.month, initialValue: _july7),
              MPDatePicker(name: 'year', precision: MPDatePrecision.year, initialValue: _july7),
              MPDatePicker(name: 'empty'),
            ],
          ),
        ),
      );
      form.currentState!.submit();

      expect(values, <String, Object?>{
        'due': '2026-07-15',
        'month': '2026-07',
        'year': '2026',
        'empty': '',
      });
    });

    testWidgets('keeps the form from submitting while required and empty', (
      WidgetTester tester,
    ) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? values;

      await tester.pumpWidget(
        host(
          overlay: true,
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> submitted) => values = submitted,
            children: <Widget>[MPDatePicker(name: 'due', required: true, label: const Text('Due'))],
          ),
        ),
      );

      expect(form.currentState!.submit(), isFalse);
      await tester.pump();

      expect(values, isNull);
      expect(find.text('Required'), findsOneWidget);
    });
  });

  group('localisation', () {
    setUp(() => registerMPMessages(<MPLocale>[ko]));
    tearDown(resetMPMessages);

    testWidgets('takes its month names and its header order from the locale', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(locale: 'ko'));
      await _open(tester);

      expect(find.text('7월'), findsOneWidget);
      expect(
        tester.getCenter(find.text('2026')).dx,
        lessThan(tester.getCenter(find.text('7월')).dx),
      );
      expect(find.text('오늘'), findsOneWidget);
    });

    testWidgets('follows a provider when it has no locale of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        _top(
          MPLocaleProvider(
            locale: 'ko',
            child: MPDatePicker(initialValue: _july7),
          ),
        ),
      );

      expect(find.text('2026. 7. 7.'), findsOneWidget);
    });

    testWidgets('lets a caller override one word without losing the rest', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(locale: 'ko', labels: <String, String>{'today': '지금 날짜'}));
      await _open(tester);

      expect(find.text('지금 날짜'), findsOneWidget);
      expect(find.bySemanticsLabel('다음 달'), findsOneWidget);
    });

    testWidgets('falls back to English for a language it has no table for', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_picker(locale: 'sw'));
      await _open(tester);

      expect(find.text('July'), findsOneWidget);
      expect(find.text('Today'), findsOneWidget);
    });
  });

  group('the keyboard', () {
    testWidgets('opens on Enter and puts the focus on the chosen day', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(_picker(initialValue: _july7, focusNode: focus));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('Today'), findsOneWidget);
      expect(FocusManager.instance.primaryFocus?.debugLabel, 'MPCalendar cursor');
    });

    testWidgets('moves a day at a time, chooses with Enter, and returns the focus', (
      WidgetTester tester,
    ) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      DateTime? chosen;

      await tester.pumpWidget(
        _picker(
          initialValue: _july7,
          focusNode: focus,
          onChanged: (DateTime? next) => chosen = next,
        ),
      );
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(chosen, DateTime(2026, 7, 8));
      expect(focus.hasPrimaryFocus, isTrue);
    });

    testWidgets('closes on Escape and gives the focus back to the trigger', (
      WidgetTester tester,
    ) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(_picker(focusNode: focus));
      await _open(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Today'), findsNothing);
      expect(focus.hasPrimaryFocus, isTrue);
    });
  });

  group('the raw events', () {
    testWidgets('reports a keystroke on the trigger', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      final List<LogicalKeyboardKey> keys = <LogicalKeyboardKey>[];

      await tester.pumpWidget(
        _picker(
          focusNode: focus,
          onKeyEvent: (FocusNode node, KeyEvent event) {
            if (event is KeyDownEvent) {
              keys.add(event.logicalKey);
            }

            return KeyEventResult.ignored;
          },
        ),
      );
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.keyA);

      expect(keys, <LogicalKeyboardKey>[LogicalKeyboardKey.keyA]);
    });

    testWidgets('reports the focus the trigger takes', (WidgetTester tester) async {
      final List<bool> focus = <bool>[];

      await tester.pumpWidget(_picker(onFocusChange: focus.add));
      await _open(tester);

      expect(focus.first, isTrue);
    });
  });
}
