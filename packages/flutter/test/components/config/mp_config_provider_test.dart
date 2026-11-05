import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/calendar/mp_calendar.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/date_picker/mp_date_picker.dart';
import 'package:material_plus_ui/src/components/empty/mp_empty.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/select/mp_select.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

class _Probe extends StatelessWidget {
  const _Probe(this.seen);

  final void Function(BuildContext context) seen;

  @override
  Widget build(BuildContext context) {
    seen(context);

    return const SizedBox();
  }
}

/// The size the label called [label] is drawn at: 16 while it rests on the
/// field's line, 12 once it is up in the notch.
///
/// Read where it is drawn, not where a trigger's width sizer lays it out
/// unseen: a resting label is one of the strings a trigger holds the width of.
double? _labelSize(WidgetTester tester, String label) {
  final Finder drawn = find.byElementPredicate((Element element) {
    final Widget widget = element.widget;

    if (widget is! Text || widget.data != label) {
      return false;
    }

    bool sizing = false;

    element.visitAncestorElements((Element ancestor) {
      sizing = ancestor.widget is MPWidthSizer;

      return !sizing;
    });

    return !sizing;
  });

  return tester.renderObject<RenderParagraph>(drawn).text.style!.fontSize;
}

/// A select with a label and nothing chosen, so its label is free to rest.
Widget _select({bool? floatingLabel}) {
  return MPSelect(
    items: const <MPSelectOption>[MPSelectOption(value: 'kr-11', label: Text('Seoul'))],
    label: const Text('City'),
    floatingLabel: floatingLabel,
  );
}

/// A date picker with no glyph of its own, the one shape its label can rest
/// in.
Widget _datePicker({bool? floatingLabel}) {
  return MPDatePicker(label: const Text('Due date'), startIcon: null, floatingLabel: floatingLabel);
}

/// The day the first column of the calendar's header names, read off the
/// whole name each header cell is spoken as, in [names].
MPWeekday _weekStart(WidgetTester tester, MPDateNames names) {
  final Text first = tester
      .widgetList<Text>(find.byType(Text))
      .firstWhere((Text text) => names.weekdays.contains(text.semanticsLabel));
  // The names run Sunday first, and `MPWeekday` counts Monday 1 to Sunday 7.
  final int column = names.weekdays.indexOf(first.semanticsLabel!);

  return MPWeekday.values.firstWhere((MPWeekday day) => day.value % 7 == column);
}

Widget _calendar({String? locale, MPWeekday? weekStartsOn}) {
  return MPCalendar(defaultMonth: DateTime(2026, 7), locale: locale, weekStartsOn: weekStartsOn);
}

void main() {
  testWidgets('decides nothing when it is absent', (WidgetTester tester) async {
    MPConfigValue? value;

    await tester.pumpWidget(
      host(_Probe((BuildContext context) => value = MPConfigProvider.maybeOf(context))),
    );

    expect(value, isNull);
  });

  testWidgets('a nested provider keeps what the outer one said', (WidgetTester tester) async {
    late MPConfigValue value;

    await tester.pumpWidget(
      host(
        MPConfigProvider(
          size: MPSize.sm,
          color: MPColor.tertiary,
          locale: 'ko',
          child: MPConfigProvider(
            density: -2,
            child: _Probe((BuildContext context) => value = MPConfigProvider.of(context)),
          ),
        ),
      ),
    );

    expect(value.size, MPSize.sm);
    expect(value.color, MPColor.tertiary);
    expect(value.locale, 'ko');
    expect(value.density, -2);
  });

  testWidgets('moves one window class boundary and keeps the rest', (WidgetTester tester) async {
    late MPConfigValue value;

    await tester.pumpWidget(
      host(
        MPConfigProvider(
          breakpoints: const <MPWindowClass, double>{
            MPWindowClass.medium: 700,
            MPWindowClass.compact: 50,
          },
          child: _Probe((BuildContext context) => value = MPConfigProvider.of(context)),
        ),
      ),
    );

    expect(value.windowClassOf(650), MPWindowClass.compact);
    expect(value.windowClassOf(700), MPWindowClass.medium);
    expect(value.windowClassOf(900), MPWindowClass.expanded);
    // A first class whose floor is above zero would leave windows in no class.
    expect(value.windowClassOf(10), MPWindowClass.compact);
  });

  testWidgets('sets the direction when it is given one', (WidgetTester tester) async {
    late TextDirection direction;

    await tester.pumpWidget(
      host(
        MPConfigProvider(
          textDirection: TextDirection.rtl,
          child: _Probe((BuildContext context) => direction = Directionality.of(context)),
        ),
      ),
    );

    expect(direction, TextDirection.rtl);
  });

  testWidgets('resolves the locale in the documented order', (WidgetTester tester) async {
    late String? locale;

    Widget probe() => _Probe((BuildContext context) => locale = mpLocaleOf(context));

    await tester.pumpWidget(host(MPConfigProvider(locale: 'ja', child: probe())));
    expect(locale, 'ja');

    await tester.pumpWidget(
      host(
        MPConfigProvider(
          locale: 'ja',
          child: MPLocaleProvider(locale: 'ko', child: probe()),
        ),
      ),
    );
    expect(locale, 'ko');

    await tester.pumpWidget(
      host(
        MPLocaleProvider(
          locale: 'ko',
          child: _Probe((BuildContext context) => locale = mpLocaleOf(context, 'fr')),
        ),
      ),
    );
    expect(locale, 'fr');
  });

  test('clamps density onto Material’s four steps', () {
    expect(mpClampDensity(-5), -3);
    expect(mpClampDensity(2), 0);
    expect(mpClampDensity(-1), -1);
  });

  group('floatingLabel', () {
    testWidgets('lets every label rest when nothing says otherwise', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));
      expect(_labelSize(tester, 'Email'), 16);

      await tester.pumpWidget(host(_select(), overlay: true));
      expect(_labelSize(tester, 'City'), 16);

      await tester.pumpWidget(host(_datePicker(), overlay: true));
      expect(_labelSize(tester, 'Due date'), 16);
    });

    testWidgets('pins every label in the notch under false', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            floatingLabel: false,
            child: MPTextField(label: Text('Email'), value: ''),
          ),
        ),
      );
      expect(_labelSize(tester, 'Email'), 12);

      await tester.pumpWidget(
        host(MPConfigProvider(floatingLabel: false, child: _select()), overlay: true),
      );
      expect(_labelSize(tester, 'City'), 12);

      await tester.pumpWidget(
        host(MPConfigProvider(floatingLabel: false, child: _datePicker()), overlay: true),
      );
      expect(_labelSize(tester, 'Due date'), 12);
    });

    testWidgets('gives way to a field’s own floatingLabel', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            floatingLabel: false,
            child: MPTextField(label: Text('Email'), value: '', floatingLabel: true),
          ),
        ),
      );
      expect(_labelSize(tester, 'Email'), 16);

      await tester.pumpWidget(
        host(
          MPConfigProvider(floatingLabel: true, child: _select(floatingLabel: false)),
          overlay: true,
        ),
      );
      expect(_labelSize(tester, 'City'), 12);
    });

    testWidgets('is kept by a nested provider that leaves it unsaid', (WidgetTester tester) async {
      late MPConfigValue value;

      await tester.pumpWidget(
        host(
          MPConfigProvider(
            floatingLabel: false,
            child: MPConfigProvider(
              density: -1,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  _Probe((BuildContext context) => value = MPConfigProvider.of(context)),
                  const MPTextField(label: Text('Email'), value: ''),
                ],
              ),
            ),
          ),
        ),
      );

      expect(value.floatingLabel, isFalse);
      expect(_labelSize(tester, 'Email'), 12);

      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            floatingLabel: false,
            child: MPConfigProvider(
              floatingLabel: true,
              child: MPTextField(label: Text('Email'), value: ''),
            ),
          ),
        ),
      );

      expect(_labelSize(tester, 'Email'), 16);
    });
  });

  group('weekStartsOn', () {
    testWidgets('leaves the week where the locale starts it', (WidgetTester tester) async {
      await tester.pumpWidget(host(_calendar()));
      expect(_weekStart(tester, MPDateNames.english), MPWeekday.sunday);

      await tester.pumpWidget(host(_calendar(locale: 'de')));
      expect(_weekStart(tester, mpDateNamesFor('de')), MPWeekday.monday);
    });

    testWidgets('starts every calendar under it on its day', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            weekStartsOn: MPWeekday.saturday,
            child: _calendar(locale: 'de'),
          ),
        ),
      );
      expect(_weekStart(tester, mpDateNamesFor('de')), MPWeekday.saturday);

      await tester.pumpWidget(
        host(
          MPConfigProvider(
            weekStartsOn: MPWeekday.monday,
            child: MPDatePicker(open: true, defaultMonth: DateTime(2026, 7)),
          ),
          overlay: true,
        ),
      );
      // The popup goes up on the frame after the one that built the picker.
      await tester.pumpAndSettle();
      expect(_weekStart(tester, MPDateNames.english), MPWeekday.monday);
    });

    testWidgets('gives way to a calendar’s own weekStartsOn', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            weekStartsOn: MPWeekday.saturday,
            child: _calendar(weekStartsOn: MPWeekday.wednesday),
          ),
        ),
      );

      expect(_weekStart(tester, MPDateNames.english), MPWeekday.wednesday);
    });

    testWidgets('is kept by a nested provider that leaves it unsaid', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            weekStartsOn: MPWeekday.monday,
            child: MPConfigProvider(size: MPSize.sm, child: _calendar()),
          ),
        ),
      );
      expect(_weekStart(tester, MPDateNames.english), MPWeekday.monday);

      await tester.pumpWidget(
        host(
          MPConfigProvider(
            weekStartsOn: MPWeekday.monday,
            child: MPConfigProvider(weekStartsOn: MPWeekday.saturday, child: _calendar()),
          ),
        ),
      );
      expect(_weekStart(tester, MPDateNames.english), MPWeekday.saturday);
    });
  });

  group('labels', () {
    tearDown(resetMPMessages);

    testWidgets('leaves the words as the locale has them', (WidgetTester tester) async {
      late Map<String, String> common;

      await tester.pumpWidget(
        host(_Probe((BuildContext context) => common = mpMessagesOf(context, mpCommonMessages))),
      );

      expect(common, mpCommonMessages.en);
    });

    testWidgets('reaches the words a component says', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            labels: <String, Map<String, String>>{
              'empty': <String, String>{'title': 'No results'},
            },
            child: MPEmpty(),
          ),
        ),
      );

      expect(find.text('No results'), findsOneWidget);
      expect(find.text('Nothing here'), findsNothing);
    });

    testWidgets('sits between the translation and a component’s own words', (
      WidgetTester tester,
    ) async {
      registerMPMessages(const <MPLocale>[
        MPLocale(
          locale: 'fr',
          messages: <String, Map<String, String>>{
            'common': <String, String>{'close': 'Fermer', 'clear': 'Effacer'},
          },
        ),
      ]);

      late Map<String, String> configured;
      late Map<String, String> overridden;

      await tester.pumpWidget(
        host(
          MPConfigProvider(
            locale: 'fr',
            labels: const <String, Map<String, String>>{
              'common': <String, String>{'close': 'Masquer'},
            },
            child: _Probe((BuildContext context) {
              configured = mpMessagesOf(context, mpCommonMessages);
              overridden = mpMessagesOf(
                context,
                mpCommonMessages,
                overrides: const <String, String>{'close': 'Quitter'},
              );
            }),
          ),
        ),
      );

      // The provider over the translation, the translation over English.
      expect(configured['close'], 'Masquer');
      expect(configured['clear'], 'Effacer');
      expect(configured['open'], 'Open');
      // A component's own words over the provider's.
      expect(overridden['close'], 'Quitter');
      expect(overridden['clear'], 'Effacer');
    });

    testWidgets('loses to a component’s own labels', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            labels: const <String, Map<String, String>>{
              'picker': <String, String>{'today': 'Go to today', 'clear': 'Wipe'},
            },
            child: MPDatePicker(
              open: true,
              clearable: true,
              defaultMonth: DateTime(2026, 7),
              labels: const <String, String>{'today': 'Jump to today'},
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Jump to today'), findsOneWidget);
      expect(find.text('Go to today'), findsNothing);
      expect(find.text('Wipe'), findsOneWidget);
    });

    testWidgets('merges a nested provider a namespace and a key at a time', (
      WidgetTester tester,
    ) async {
      late MPConfigValue outer;
      late MPConfigValue inner;
      late Map<String, String> common;

      await tester.pumpWidget(
        host(
          MPConfigProvider(
            labels: const <String, Map<String, String>>{
              'common': <String, String>{'close': 'Dismiss', 'clear': 'Wipe'},
              'empty': <String, String>{'title': 'No results'},
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                _Probe((BuildContext context) => outer = MPConfigProvider.of(context)),
                MPConfigProvider(
                  labels: const <String, Map<String, String>>{
                    'common': <String, String>{'close': 'Hide'},
                    'picker': <String, String>{'today': 'Go to today'},
                  },
                  child: _Probe((BuildContext context) {
                    inner = MPConfigProvider.of(context);
                    common = mpMessagesOf(context, mpCommonMessages);
                  }),
                ),
              ],
            ),
          ),
        ),
      );

      expect(inner.labels, <String, Map<String, String>>{
        'common': <String, String>{'close': 'Hide', 'clear': 'Wipe'},
        'empty': <String, String>{'title': 'No results'},
        'picker': <String, String>{'today': 'Go to today'},
      });
      expect(common['close'], 'Hide');
      expect(common['clear'], 'Wipe');
      expect(common['open'], 'Open');
      // The outer provider's own subtree is untouched by the nested one.
      expect(outer.labels!['common'], <String, String>{'close': 'Dismiss', 'clear': 'Wipe'});
    });

    testWidgets('does not build its dependents again for the same words', (
      WidgetTester tester,
    ) async {
      int builds = 0;
      String close = 'Dismiss';
      late StateSetter rebuild;
      // One instance, so it builds again only when the provider says the
      // words have changed.
      final Widget probe = _Probe((BuildContext context) {
        MPConfigProvider.of(context);
        builds += 1;
      });

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              rebuild = setState;

              // A new map every build, as an inline literal is.
              return MPConfigProvider(
                labels: <String, Map<String, String>>{
                  'common': <String, String>{'close': close},
                },
                child: probe,
              );
            },
          ),
        ),
      );
      expect(builds, 1);

      rebuild(() {});
      await tester.pump();
      expect(builds, 1);

      rebuild(() => close = 'Hide');
      await tester.pump();
      expect(builds, 2);
    });
  });

  test('compares every field by what it says', () {
    MPConfigValue labelled(String close) {
      return MPConfigValue(
        labels: <String, Map<String, String>>{
          'common': <String, String>{'close': close, 'clear': 'Wipe'},
        },
      );
    }

    final MPConfigValue reordered = MPConfigValue(
      labels: <String, Map<String, String>>{
        'common': <String, String>{'clear': 'Wipe', 'close': 'Dismiss'},
      },
    );

    expect(labelled('Dismiss'), labelled('Dismiss'));
    expect(labelled('Dismiss').hashCode, labelled('Dismiss').hashCode);
    expect(reordered, labelled('Dismiss'));
    expect(reordered.hashCode, labelled('Dismiss').hashCode);
    expect(labelled('Dismiss'), isNot(labelled('Hide')));
    expect(labelled('Dismiss'), isNot(MPConfigValue.none));
    expect(const MPConfigValue(floatingLabel: false), isNot(MPConfigValue.none));
    expect(const MPConfigValue(weekStartsOn: MPWeekday.monday), isNot(MPConfigValue.none));
    expect(
      const MPConfigValue(floatingLabel: false, weekStartsOn: MPWeekday.monday),
      const MPConfigValue(floatingLabel: false, weekStartsOn: MPWeekday.monday),
    );
  });
}
