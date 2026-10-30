import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/calendar/mp_calendar.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/locales/ko.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks of `MPCalendar`, asked of the
/// render tree: a cell's class becomes the decoration it built, and a role
/// becomes the semantics node a screen reader is given.

final DateTime _july7 = DateTime(2026, 7, 7);

/// The cell a screen reader calls [label], by its whole date.
Finder _cell(String label) => find.bySemanticsLabel(label);

/// The decoration of the cell whose day number is [day].
BoxDecoration _decorationOf(WidgetTester tester, String day) {
  final AnimatedContainer box = tester.widget<AnimatedContainer>(
    find.ancestor(of: find.text(day), matching: find.byType(AnimatedContainer)).first,
  );

  return box.decoration! as BoxDecoration;
}

Widget _calendar({
  DateTime? value,
  DateTime? initialValue,
  ValueChanged<DateTime>? onChanged,
  DateTime? month,
  DateTime? defaultMonth,
  ValueChanged<DateTime>? onMonthChange,
  MPDatePrecision precision = MPDatePrecision.day,
  DateTime? minDate,
  DateTime? maxDate,
  bool Function(DateTime date)? shouldDisableDate,
  String? locale,
  Map<String, String>? labels,
  MPVariant variant = MPVariant.text,
  MPSize? size,
  String? name,
  bool autofocus = false,
}) {
  return MPCalendar(
    value: value,
    initialValue: initialValue,
    onChanged: onChanged,
    month: month,
    defaultMonth: defaultMonth ?? DateTime(2026, 7),
    onMonthChange: onMonthChange,
    precision: precision,
    minDate: minDate,
    maxDate: maxDate,
    shouldDisableDate: shouldDisableDate,
    locale: locale,
    labels: labels,
    variant: variant,
    size: size,
    name: name,
    autofocus: autofocus,
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('standing on the page', () {
    testWidgets('draws the grid with no trigger in front of it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_calendar()));

      expect(find.text('July'), findsOneWidget);
      expect(find.text('2026'), findsOneWidget);
      expect(_cell('Tuesday, July 7, 2026'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('opens on the month it was given', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(defaultMonth: DateTime(2026, 3))));

      expect(find.text('March'), findsOneWidget);
    });

    testWidgets('opens on the month of its value ahead of defaultMonth', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(_calendar(initialValue: DateTime(2025, 11, 4), defaultMonth: DateTime(2026, 3))),
      );

      expect(find.text('November'), findsOneWidget);
      expect(find.text('2025'), findsOneWidget);
    });

    testWidgets('paints no surface by default, so it can be dropped into one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_calendar()));

      // The first stepper sits on the calendar's own corner, with no room
      // round it, and seven cells of 40 are the whole width.
      expect(
        tester.getTopLeft(find.byType(MPIconButton).first),
        tester.getTopLeft(find.byType(MPCalendar)),
      );
      expect(tester.getSize(find.byType(MPCalendar)).width, 280);
    });

    testWidgets('paints one when asked, and takes the popup ladder for its room', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_calendar(variant: MPVariant.outlined)));

      final DecoratedBox box = tester.widget<DecoratedBox>(
        find.descendant(of: find.byType(MPCalendar), matching: find.byType(DecoratedBox)).first,
      );
      final BoxDecoration decoration = box.decoration as BoxDecoration;

      expect((decoration.border! as Border).top.color, light.outlineVariant);
      expect(decoration.borderRadius, BorderRadius.circular(12));
      expect(tester.getSize(find.byType(MPCalendar)).width, 280 + 10 * 2);
    });

    testWidgets('does not take the focus on mount', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(initialValue: _july7)));
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, isNot('MPCalendar cursor'));
    });

    testWidgets('takes it when asked, on the chosen day', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(initialValue: _july7, autofocus: true)));
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'MPCalendar cursor');
    });
  });

  group('the size ladder', () {
    testWidgets('draws its cells at 28, 32, 40, 44, 48', (WidgetTester tester) async {
      final List<double> widths = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(_calendar(size: size)));
        widths.add(tester.getSize(find.byType(MPCalendar)).width / 7);
      }

      expect(widths, <double>[28, 32, 40, 44, 48]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPConfigProvider(size: MPSize.sm, child: _calendar())));

      expect(tester.getSize(find.byType(MPCalendar)).width, 32 * 7);
    });
  });

  group('choosing', () {
    testWidgets('reports the day that was pressed', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(host(_calendar(onChanged: (DateTime next) => chosen = next)));
      await tester.tap(find.text('15'));

      expect(chosen, DateTime(2026, 7, 15));
    });

    testWidgets('works uncontrolled, and paints the chosen day', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar()));
      await tester.tap(find.text('15'));
      await tester.pumpAndSettle();

      expect(_decorationOf(tester, '15').color, light.primary);
    });

    testWidgets('keeps the time of day the value already carried', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(
        host(
          _calendar(
            value: DateTime(2026, 7, 10, 14, 30),
            onChanged: (DateTime next) => chosen = next,
          ),
        ),
      );
      await tester.tap(find.text('15'));

      expect(chosen, DateTime(2026, 7, 15, 14, 30));
    });

    testWidgets('does not unchoose the day when it is pressed again', (WidgetTester tester) async {
      final List<DateTime> chosen = <DateTime>[];

      await tester.pumpWidget(host(_calendar(initialValue: _july7, onChanged: chosen.add)));
      await tester.tap(find.text('7').first);
      await tester.pumpAndSettle();

      expect(chosen, <DateTime>[_july7]);
      expect(_decorationOf(tester, '7').color, light.primary);
    });

    testWidgets('is emptied by a controlled null', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(value: _july7)));
      await tester.pumpWidget(host(_calendar()));
      await tester.pumpAndSettle();

      expect(_decorationOf(tester, '7').color, const Color(0x00000000));
    });
  });

  group('the month on screen', () {
    testWidgets('stays where the reader left it', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(initialValue: _july7)));
      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pumpAndSettle();
      await tester.pumpWidget(host(_calendar(initialValue: _july7)));
      await tester.pumpAndSettle();

      expect(find.text('August'), findsOneWidget);
    });

    testWidgets('reports each step through onMonthChange', (WidgetTester tester) async {
      final List<DateTime> months = <DateTime>[];

      await tester.pumpWidget(host(_calendar(onMonthChange: months.add)));
      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Previous month'));
      await tester.pumpAndSettle();

      expect(months, <DateTime>[DateTime(2026, 8), DateTime(2026, 7)]);
    });

    testWidgets('can be driven from outside', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(month: DateTime(2026, 12, 20))));

      expect(find.text('December'), findsOneWidget);

      // A step asks for the next month and is not taken until the parent
      // says so.
      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pumpAndSettle();

      expect(find.text('December'), findsOneWidget);
    });

    testWidgets('opens a grid of months, and a grid of years', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(host(_calendar(onChanged: (DateTime next) => chosen = next)));
      await tester.tap(find.bySemanticsLabel('Choose a year'));
      await tester.pumpAndSettle();

      expect(find.text('2016–2027'), findsOneWidget);

      await tester.tap(find.text('2020'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Mar'));
      await tester.pumpAndSettle();

      expect(find.text('March'), findsOneWidget);
      expect(find.text('2020'), findsOneWidget);

      await tester.tap(find.text('3').first);

      expect(chosen, DateTime(2020, 3, 3));
    });
  });

  group('precision', () {
    testWidgets('answers with the 1st of a month, and never draws a day grid', (
      WidgetTester tester,
    ) async {
      DateTime? chosen;

      await tester.pumpWidget(
        host(
          _calendar(precision: MPDatePrecision.month, onChanged: (DateTime next) => chosen = next),
        ),
      );

      expect(find.text('Jan'), findsOneWidget);
      expect(find.text('15'), findsNothing);

      await tester.tap(find.text('Sep'));

      expect(chosen, DateTime(2026, 9));
    });

    testWidgets('answers with 1 January for a year', (WidgetTester tester) async {
      DateTime? chosen;

      await tester.pumpWidget(
        host(
          _calendar(precision: MPDatePrecision.year, onChanged: (DateTime next) => chosen = next),
        ),
      );
      await tester.tap(find.text('2023'));

      expect(chosen, DateTime(2023));
    });
  });

  group('bounds', () {
    testWidgets('blocks a day outside min and max without removing it', (
      WidgetTester tester,
    ) async {
      final List<DateTime> chosen = <DateTime>[];
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          _calendar(
            minDate: DateTime(2026, 7, 10),
            maxDate: DateTime(2026, 7, 20),
            onChanged: chosen.add,
          ),
        ),
      );

      expect(find.text('5'), findsWidgets);
      expect(
        tester.getSemantics(_cell('Sunday, July 5, 2026')),
        matchesSemantics(
          label: 'Sunday, July 5, 2026',
          isButton: true,
          hasEnabledState: true,
          hasSelectedState: true,
          isFocusable: true,
          hasFocusAction: true,
        ),
      );

      await tester.tap(_cell('Sunday, July 5, 2026'));
      await tester.tap(_cell('Wednesday, July 15, 2026'));

      expect(chosen, <DateTime>[DateTime(2026, 7, 15)]);
      semantics.dispose();
    });

    testWidgets('consults shouldDisableDate for days', (WidgetTester tester) async {
      final List<DateTime> chosen = <DateTime>[];

      await tester.pumpWidget(
        host(
          _calendar(
            shouldDisableDate: (DateTime date) => date.weekday == DateTime.sunday,
            onChanged: chosen.add,
          ),
        ),
      );
      await tester.tap(find.text('12'));
      await tester.tap(find.text('13'));

      expect(chosen, <DateTime>[DateTime(2026, 7, 13)]);
    });

    testWidgets('never consults it on a month calendar', (WidgetTester tester) async {
      int asked = 0;

      await tester.pumpWidget(
        host(
          _calendar(
            precision: MPDatePrecision.month,
            shouldDisableDate: (DateTime date) {
              asked += 1;

              return true;
            },
          ),
        ),
      );

      expect(asked, 0);
    });
  });

  group('localisation', () {
    setUp(() => registerMPMessages(<MPLocale>[ko]));
    tearDown(resetMPMessages);

    testWidgets('takes the language from an MPLocaleProvider', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPLocaleProvider(locale: 'ko', child: _calendar())));

      expect(find.text('7월'), findsOneWidget);
      expect(find.bySemanticsLabel('다음 달'), findsOneWidget);
      // The year before the month, as Korean writes them.
      expect(
        tester.getCenter(find.text('2026')).dx,
        lessThan(tester.getCenter(find.text('7월')).dx),
      );
    });

    testWidgets('lets its own locale beat the provider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPLocaleProvider(
            locale: 'ko',
            child: _calendar(locale: 'de'),
          ),
        ),
      );

      expect(find.text('Juli'), findsOneWidget);
      // German weeks start on a Monday.
      expect(find.text('M').evaluate().length, greaterThanOrEqualTo(1));
    });

    testWidgets('takes a labels override over the translation', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(_calendar(locale: 'ko', labels: <String, String>{'nextMonth': '앞으로'})),
      );

      expect(find.bySemanticsLabel('앞으로'), findsOneWidget);
      expect(find.bySemanticsLabel('이전 달'), findsOneWidget);
    });
  });

  group('the names', () {
    test('are read off the language, with Chinese found by its script or region', () {
      expect(mpDateNamesFor('ko-KR').medium(DateTime(2026, 7, 15)), '2026. 7. 15.');
      expect(mpDateNamesFor('de').firstDayOfWeek, MPWeekday.monday);
      expect(mpDateNamesFor('ar').firstDayOfWeek, MPWeekday.saturday);
      expect(mpDateNamesFor('zh-TW').weekdaysNarrow.first, '日');
      expect(mpDateNamesFor('zh-Hans-CN').monthYear(DateTime(2026, 7)), '2026年7月');
      expect(mpDateNamesFor('sw'), MPDateNames.english);
      expect(mpDateNamesFor(null), MPDateNames.english);
    });

    test('write a language that inflects its months the way it is written in a date', () {
      final MPDateNames polish = mpDateNamesFor('pl');

      expect(polish.months[6], 'lipiec');
      expect(polish.spell(DateTime(2026, 7, 7)), 'wtorek, 7 lipca 2026');
    });

    test('quote the letters a pattern means literally', () {
      expect(mpDateNamesFor('es').monthYear(DateTime(2026, 7)), 'julio de 2026');
      expect(
        MPDateNames.english.format(DateTime(2026, 7, 7, 9, 5), "h 'o''clock' a"),
        "9 o'clock AM",
      );
    });

    test('write a time on either dial', () {
      final DateTime evening = DateTime(2026, 7, 7, 21, 5, 3);

      expect(MPDateNames.english.time(evening, hour12: true), '9:05 PM');
      expect(MPDateNames.english.time(evening, hour12: false, seconds: true), '21:05:03');
      expect(mpDateNamesFor('ko').time(evening, hour12: true), '오후 9:05');
      expect(mpDateNamesFor('vi').dateTime(evening, hour12: false), '21:05 7 thg 7, 2026');
    });
  });

  group('in a form', () {
    Future<Map<String, Object?>?> submit(WidgetTester tester, Widget calendar) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? values;

      await tester.pumpWidget(
        host(
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> submitted) => values = submitted,
            children: <Widget>[calendar],
          ),
        ),
      );
      form.currentState!.submit();

      return values;
    }

    testWidgets('submits the chosen day as YYYY-MM-DD under name', (WidgetTester tester) async {
      final Map<String, Object?>? values = await submit(
        tester,
        _calendar(name: 'day', initialValue: DateTime(2026, 7, 5)),
      );

      expect(values, <String, Object?>{'day': '2026-07-05'});
    });

    testWidgets('trims what it submits to the precision', (WidgetTester tester) async {
      final Map<String, Object?>? values = await submit(
        tester,
        _calendar(name: 'month', precision: MPDatePrecision.month, initialValue: _july7),
      );

      expect(values, <String, Object?>{'month': '2026-07'});
    });

    testWidgets('submits an empty string while nothing is chosen', (WidgetTester tester) async {
      final Map<String, Object?>? values = await submit(tester, _calendar(name: 'day'));

      expect(values, <String, Object?>{'day': ''});
    });

    testWidgets('submits nothing at all without a name', (WidgetTester tester) async {
      final Map<String, Object?>? values = await submit(tester, _calendar(initialValue: _july7));

      expect(values, isEmpty);
    });
  });

  group('today', () {
    testWidgets('is marked with an outlined circle', (WidgetTester tester) async {
      final DateTime now = DateTime.now();

      await tester.pumpWidget(host(_calendar(defaultMonth: now)));

      final AnimatedContainer box = tester.widget<AnimatedContainer>(
        find
            .descendant(
              of: find.bySemanticsLabel(MPDateNames.english.spell(now)),
              matching: find.byType(AnimatedContainer),
            )
            .first,
      );
      final BoxDecoration decoration = box.decoration! as BoxDecoration;

      expect((decoration.border! as Border).top.color, light.primary);
      expect(decoration.color, const Color(0x00000000));
    });
  });

  group('the keyboard', () {
    testWidgets('moves one day at a time and pulls the month along at the edge', (
      WidgetTester tester,
    ) async {
      final List<DateTime> chosen = <DateTime>[];

      await tester.pumpWidget(
        host(
          _calendar(initialValue: DateTime(2026, 7, 31), autofocus: true, onChanged: chosen.add),
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('August'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(chosen, <DateTime>[DateTime(2026, 8, 8)]);
    });

    testWidgets('runs the arrows the way an RTL page reads', (WidgetTester tester) async {
      final List<DateTime> chosen = <DateTime>[];

      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          _calendar(initialValue: _july7, autofocus: true, onChanged: chosen.add),
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(chosen, <DateTime>[DateTime(2026, 7, 6)]);
    });

    testWidgets('steps a month with PageDown and a year with Shift', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar(initialValue: _july7, autofocus: true)));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
      await tester.pumpAndSettle();

      expect(find.text('August'), findsOneWidget);

      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pumpAndSettle();

      expect(find.text('2027'), findsOneWidget);
    });

    testWidgets('turns the page from the side it was fetched from', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar()));
      final double settled = tester.getTopLeft(find.text('15')).dx;

      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 30));

      // August's weeks are still arriving from the right.
      final double arriving = tester.getTopLeft(find.text('15')).dx;

      await tester.pumpAndSettle();

      expect(arriving, greaterThan(tester.getTopLeft(find.text('15')).dx));
      expect(tester.getTopLeft(find.text('15')).dx, isNot(settled));
    });

    testWidgets('lands the page at once when motion is reduced', (WidgetTester tester) async {
      await tester.pumpWidget(host(disableAnimations: true, _calendar()));
      await tester.tap(find.bySemanticsLabel('Next month'));
      await tester.pump();

      expect(tester.hasRunningAnimations, isFalse);
    });
  });
}
