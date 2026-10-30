import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/empty/mp_empty.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads `role="status"` and the surface's classes off the
/// element; this reads the live region off the semantics node and the
/// decoration off the box.

final Finder _empty = find.byType(MPEmpty);

BoxDecoration _surface(WidgetTester tester) {
  final Container box = tester.widget<Container>(
    find.descendant(of: _empty, matching: find.byType(Container)).first,
  );

  return box.decoration! as BoxDecoration;
}

/// The default tray: the one [CustomPaint] the state draws on its own.
Finder get _tray => find.descendant(of: _empty, matching: find.byType(CustomPaint));

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the headline', () {
    testWidgets('says something rather than nothing by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty()));

      expect(find.text('Nothing here'), findsOneWidget);
    });

    testWidgets('takes a headline of its own', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty(title: Text('No results'))));

      expect(find.text('No results'), findsOneWidget);
      expect(find.text('Nothing here'), findsNothing);
    });

    testWidgets('can be dropped entirely', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPEmpty(showTitle: false, child: Text('Try another search.'))),
      );

      expect(find.text('Nothing here'), findsNothing);
      expect(find.text('Try another search.'), findsOneWidget);
    });

    testWidgets('is written in the locale it was given', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await tester.pumpWidget(host(width: 400, const MPEmpty(locale: 'ko')));

      expect(find.text('아무것도 없습니다'), findsOneWidget);
    });
  });

  group('the glyph', () {
    testWidgets('draws the empty tray by default, in the muted ink', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty()));

      expect(_tray, findsOneWidget);
      expect(tester.getSize(_tray), const Size.square(36));
    });

    testWidgets('can be taken away', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty(showIcon: false)));

      expect(_tray, findsNothing);
    });

    testWidgets('takes an illustration of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPEmpty(icon: SizedBox(key: Key('art'), width: 132, height: 132))),
      );

      expect(_tray, findsNothing);
      // A picture keeps whatever size it was given.
      expect(tester.getSize(find.byKey(const Key('art'))), const Size.square(132));
    });

    testWidgets('grows with the size ladder: 24, 28, 36, 44, 52', (WidgetTester tester) async {
      final List<double> sides = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 400, MPEmpty(size: size)));
        sides.add(tester.getSize(_tray).width);
      }

      expect(sides, <double>[24, 28, 36, 44, 52]);
    });
  });

  group('the body', () {
    testWidgets('is supporting text under a headline', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty(child: Text('Try another search.'))));

      expect(styleOf(tester, 'Try another search.').color, light.onSurfaceVariant);
      expect(styleOf(tester, 'Nothing here').color, light.onSurface);
    });

    testWidgets('is the state itself without one', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPEmpty(showTitle: false, child: Text('Try another search.'))),
      );

      expect(styleOf(tester, 'Try another search.').color, light.onSurface);
    });

    testWidgets('is centred, glyph over headline over sentence', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty(child: Text('Try again.'))));

      final double centre = tester.getCenter(_empty).dx;

      expect(tester.getCenter(find.text('Nothing here')).dx, closeTo(centre, 0.5));
      expect(tester.getCenter(_tray).dy, lessThan(tester.getCenter(find.text('Nothing here')).dy));
      expect(
        tester.getCenter(find.text('Nothing here')).dy,
        lessThan(tester.getCenter(find.text('Try again.')).dy),
      );
    });
  });

  group('action', () {
    testWidgets('draws a way out under the text', (WidgetTester tester) async {
      int cleared = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          MPEmpty(
            action: MPButton(onPressed: () => cleared++, child: const Text('Clear filters')),
          ),
        ),
      );

      expect(
        tester.getCenter(find.text('Clear filters')).dy,
        greaterThan(tester.getCenter(find.text('Nothing here')).dy),
      );

      await tester.tap(find.text('Clear filters'));
      expect(cleared, 1);
    });
  });

  group('accessibility', () {
    testWidgets('announces itself, because nothing was removed from the page', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, const MPEmpty()));

      expect(semanticsOf(tester, _empty).getSemanticsData().flagsCollection.isLiveRegion, isTrue);
      semantics.dispose();
    });

    testWidgets('can be silenced for a state that is simply part of the page', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, const MPEmpty(liveRegion: false)));

      expect(semanticsOf(tester, _empty).getSemanticsData().flagsCollection.isLiveRegion, isFalse);
      semantics.dispose();
    });
  });

  group('variant', () {
    testWidgets('draws no second rectangle by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty()));

      expect(_surface(tester).color, const Color(0x00000000));
      expect(_surface(tester).borderRadius, BorderRadius.zero);
      expect(_surface(tester).border, isNull);
    });

    testWidgets('paints a neutral surface when asked, never the accent', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPEmpty(variant: MPVariant.tonal)));

      expect(_surface(tester).color, light.surfaceContainer);
      expect(_surface(tester).borderRadius, BorderRadius.circular(12));

      await tester.pumpWidget(host(width: 400, const MPEmpty(variant: MPVariant.outlined)));

      expect((_surface(tester).border! as Border).top.color, light.outlineVariant);
    });

    testWidgets('takes its own room above and below: 32 at md', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPEmpty(showIcon: false, showTitle: false, child: Text('x'))),
      );

      // 32 above, 32 below, and one 24px line of body text.
      expect(tester.getSize(_empty).height, 32 + 24 + 32);
    });
  });
}
