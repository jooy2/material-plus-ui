import 'dart:convert';

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/app_logo/mp_app_logo.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

final MemoryImage _pixel = MemoryImage(
  base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
);

BoxDecoration? _tileOf(WidgetTester tester) {
  final Iterable<Container> tiles = tester.widgetList<Container>(
    find.descendant(of: find.byType(MPAppLogo), matching: find.byType(Container)),
  );

  return tiles.isEmpty ? null : tiles.first.decoration as BoxDecoration?;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('is a logo with nothing but a name', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAppLogo(name: 'Voltage')));

    expect(find.text('Voltage'), findsOneWidget);
    expect(_tileOf(tester), isNull);
  });

  testWidgets('falls back to the initials once there is a tile', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAppLogo(name: 'Voltage Labs', shape: MPAppLogoShape.app)));

    expect(find.text('VL'), findsOneWidget);
    expect(_tileOf(tester)!.color, light.primary);
  });

  testWidgets('takes written-out initials over the derived ones', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAppLogo(name: 'Voltage', initials: 'Vo', shape: MPAppLogoShape.app)),
    );

    expect(find.text('Vo'), findsOneWidget);
  });

  testWidgets('lets a widget beat a picture, and a picture beat the letters', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        MPAppLogo(
          name: 'Voltage',
          shape: MPAppLogoShape.app,
          image: _pixel,
          child: const SizedBox(key: Key('art'), width: 10, height: 10),
        ),
      ),
    );
    expect(find.byKey(const Key('art')), findsOneWidget);
    expect(find.byType(Image), findsNothing);

    await tester.pumpWidget(
      host(MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app, image: _pixel)),
    );
    expect(find.byType(Image), findsOneWidget);
    expect(find.text('V'), findsNothing);
  });

  testWidgets('rounds the tile all the way on circle, and to medium on app', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAppLogo(name: 'V', shape: MPAppLogoShape.circle)));
    expect(_tileOf(tester)!.borderRadius, BorderRadius.circular(28));

    await tester.pumpWidget(host(const MPAppLogo(name: 'V', shape: MPAppLogoShape.app)));
    expect(_tileOf(tester)!.borderRadius, BorderRadius.circular(12));
  });

  testWidgets('insets the artwork from the tile’s edge unless told not to', (
    WidgetTester tester,
  ) async {
    const Widget art = SizedBox(key: Key('art'), width: 24, height: 24);

    await tester.pumpWidget(host(const MPAppLogo(shape: MPAppLogoShape.app, child: art)));
    expect(tester.getRect(find.byKey(const Key('art'))).height, closeTo(56 * 0.72, 0.01));

    await tester.pumpWidget(
      host(const MPAppLogo(shape: MPAppLogoShape.app, padded: false, child: art)),
    );
    expect(tester.getRect(find.byKey(const Key('art'))).height, 56);
  });

  testWidgets('takes its height from the control ladder, or an exact one', (
    WidgetTester tester,
  ) async {
    final List<double> heights = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(host(MPAppLogo(name: 'V', shape: MPAppLogoShape.app, size: size)));
      heights.add(tester.getSize(find.byType(MPAppLogo)).height);
    }

    expect(heights, <double>[32, 40, 56, 64, 72]);

    await tester.pumpWidget(
      host(const MPAppLogo(name: 'V', shape: MPAppLogoShape.app, height: 30)),
    );
    expect(tester.getSize(find.byType(MPAppLogo)), const Size(30, 30));
  });

  testWidgets('draws the name beside the mark when asked, and only then', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app)));
    expect(find.text('Voltage'), findsNothing);

    await tester.pumpWidget(
      host(const MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app, showName: true)),
    );
    expect(find.text('Voltage'), findsOneWidget);
  });

  testWidgets('ignores showName when the name is already the whole logo', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAppLogo(name: 'Voltage', showName: true)));

    expect(find.text('Voltage'), findsOneWidget);
  });

  testWidgets('says the name exactly once, whatever the mark turned out to be', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    for (final MPAppLogo logo in <MPAppLogo>[
      const MPAppLogo(name: 'Voltage'),
      const MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app),
      const MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app, showName: true),
      MPAppLogo(name: 'Voltage', image: _pixel),
      const MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app, child: Text('⚡')),
    ]) {
      await tester.pumpWidget(host(logo));

      expect(semanticsLabels(tester), <String>['Voltage']);
    }

    semantics.dispose();
  });

  testWidgets('takes semanticLabel over the name for what the artwork says', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(MPAppLogo(name: 'Voltage', semanticLabel: 'Voltage, home', image: _pixel)),
    );

    expect(semanticsLabels(tester), <String>['Voltage, home']);
    semantics.dispose();
  });

  testWidgets('becomes a link when it is given somewhere to go', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    int follows = 0;
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      host(MPAppLogo(name: 'Voltage', href: '/', focusNode: focus, onPressed: () => follows++)),
    );

    final SemanticsData data = tester.getSemantics(find.text('Voltage')).getSemanticsData();
    expect(data.flagsCollection.isLink, isTrue);
    expect(data.linkUrl, Uri.parse('/'));

    await tester.tap(find.byType(MPAppLogo));
    focus.requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    expect(follows, 2);
    semantics.dispose();
  });

  testWidgets('is no link with nowhere to go', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPAppLogo(name: 'Voltage')));

    expect(
      tester.getSemantics(find.text('Voltage')).getSemanticsData().flagsCollection.isLink,
      isFalse,
    );
    semantics.dispose();
  });
}
