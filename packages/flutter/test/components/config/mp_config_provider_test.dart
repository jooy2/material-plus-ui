import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
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
}
