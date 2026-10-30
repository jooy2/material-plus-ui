import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/alert/mp_alert.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions. A role on the element becomes the live region
/// on the alert's semantics node, and a transition that collapses a grid row
/// becomes a height that runs down to nothing.

final Finder _alert = find.byType(MPAlert);

/// The alert's own surface: the box carrying the fill, the hairline and the
/// shadow.
BoxDecoration _surface(WidgetTester tester) {
  final Container box = tester.widget<Container>(
    find.descendant(of: _alert, matching: find.byType(Container)).first,
  );

  return box.decoration! as BoxDecoration;
}

/// The node the alert built for itself, which is where its live region is.
SemanticsData _node(WidgetTester tester) {
  return tester
      .getSemantics(find.descendant(of: _alert, matching: find.byType(Semantics)).first)
      .getSemanticsData();
}

Finder _dismiss(String label) => find.bySemanticsLabel(label);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('renders the message it was handed', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPAlert(child: Text('Saved.'))));

      expect(find.text('Saved.'), findsOneWidget);
    });

    testWidgets('renders a heading and the detail under it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPAlert(title: Text('Payment failed'), child: Text('Card was declined.')),
        ),
      );

      expect(
        tester.getTopLeft(find.text('Payment failed')).dy,
        lessThan(tester.getTopLeft(find.text('Card was declined.')).dy),
      );
    });

    testWidgets('draws a glyph for the family it was given', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPAlert(child: Text('Heads up'))));
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.note);

      await tester.pumpWidget(
        host(width: 400, const MPAlert(color: MPColor.error, child: Text('Heads up'))),
      );
      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.dangerMark);
    });

    testWidgets('drops the glyph when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPAlert(showIcon: false, child: Text('Heads up'))),
      );

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('takes a glyph of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPAlert(icon: Text('!'), child: Text('Heads up'))),
      );

      expect(find.text('!'), findsOneWidget);
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('is tonal by default, in the family’s container', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPAlert(child: Text('Heads up'))));

      expect(_surface(tester).color, light.primaryContainer);
      expect(_surface(tester).borderRadius, BorderRadius.circular(12));
    });

    testWidgets('paints each variant from its own roles', (WidgetTester tester) async {
      final Map<MPVariant, Color> fills = <MPVariant, Color>{
        MPVariant.filled: light.error,
        MPVariant.tonal: light.errorContainer,
        MPVariant.elevated: light.surfaceContainerLow,
        MPVariant.outlined: const Color(0x00000000),
        MPVariant.text: const Color(0x00000000),
      };

      for (final MapEntry<MPVariant, Color> entry in fills.entries) {
        await tester.pumpWidget(
          host(
            width: 400,
            MPAlert(variant: entry.key, color: MPColor.error, child: const Text('Heads up')),
          ),
        );

        expect(_surface(tester).color, entry.value, reason: entry.key.name);
      }
    });

    testWidgets('outlines only the outlined variant, and lifts only the elevated', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPAlert(variant: MPVariant.outlined, child: Text('Heads up'))),
      );
      expect((_surface(tester).border! as Border).top.color, light.outline);

      await tester.pumpWidget(
        host(width: 400, const MPAlert(variant: MPVariant.elevated, child: Text('Heads up'))),
      );
      expect(_surface(tester).boxShadow, MPShadows.of(1));
    });

    testWidgets('spends the accent on the glyph and the heading only on a neutral surface', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPAlert(
            variant: MPVariant.outlined,
            color: MPColor.tertiary,
            title: Text('Heading'),
            child: Text('Detail'),
          ),
        ),
      );

      expect(styleOf(tester, 'Heading').color, light.tertiary);
      expect(styleOf(tester, 'Detail').color, light.onSurfaceVariant);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPAlert(color: MPColor.tertiary, title: Text('Heading'), child: Text('Detail')),
        ),
      );

      expect(styleOf(tester, 'Heading').color, light.onTertiaryContainer);
      expect(styleOf(tester, 'Detail').color, light.onTertiaryContainer);
    });

    testWidgets('pads to the sheet ladder and gives room back with density', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPAlert(showIcon: false, child: Text('Heads up'))),
      );
      final double standard = tester.getSize(_alert).height;

      await tester.pumpWidget(
        host(width: 400, const MPAlert(showIcon: false, density: -1, child: Text('Heads up'))),
      );

      // 16 on each side at `md`, 14 at `-1`, around one 24px line.
      expect(standard, 56);
      expect(tester.getSize(_alert).height, 52);
    });

    testWidgets('puts the glyph at the start under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, textDirection: TextDirection.rtl, const MPAlert(child: Text('Heads up'))),
      );

      expect(
        tester.getCenter(find.byType(MPGlyph)).dx,
        greaterThan(tester.getCenter(find.text('Heads up')).dx),
      );
    });
  });

  group('the live region', () {
    testWidgets('announces everything but an alert told to stay quiet', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, const MPAlert(child: Text('Saved'))));
      expect(_node(tester).flagsCollection.isLiveRegion, isTrue);

      await tester.pumpWidget(
        host(width: 400, const MPAlert(color: MPColor.error, child: Text('Failed'))),
      );
      // Off the web, where the role says nothing, the error family is the one
      // live region the platform has.
      expect(_node(tester).flagsCollection.isLiveRegion, isTrue);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPAlert(
            color: MPColor.error,
            live: MPAlertLive.off,
            child: Text('Three fields need attention'),
          ),
        ),
      );
      expect(_node(tester).flagsCollection.isLiveRegion, isFalse);
      // Still readable, still an alert on the screen: just not one that
      // announces itself.
      expect(find.text('Three fields need attention'), findsOneWidget);
      semantics.dispose();
    });
  });

  group('dismissing', () {
    testWidgets('renders no × until there is something to call', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPAlert(child: Text('Heads up'))));

      expect(
        find.byWidgetPredicate((Widget widget) {
          return widget is MPGlyph && widget.shape == MPGlyphShape.close;
        }),
        findsNothing,
      );
    });

    testWidgets('calls back once the alert has finished leaving', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      int closed = 0;

      await tester.pumpWidget(
        host(width: 400, MPAlert(onClose: () => closed++, child: const Text('Heads up'))),
      );

      await tester.tap(_dismiss('Dismiss'));
      await tester.pump();
      expect(closed, 0);

      await tester.pump(const Duration(milliseconds: 100));
      expect(closed, 0);

      await tester.pumpAndSettle();
      expect(closed, 1);
      semantics.dispose();
    });

    testWidgets('collapses the space it took rather than only fading', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, MPAlert(onClose: () {}, child: const Text('Heads up'))),
      );

      final double before = tester.getSize(_alert).height;

      await tester.tap(_dismiss('Dismiss'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      final double during = tester.getSize(_alert).height;

      expect(during, lessThan(before));
      expect(during, greaterThan(0));

      await tester.pumpAndSettle();
      expect(tester.getSize(_alert).height, 0);
      semantics.dispose();
    });

    testWidgets('still calls back when there is no motion to wait for', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      int closed = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          disableAnimations: true,
          MPAlert(onClose: () => closed++, child: const Text('Heads up')),
        ),
      );

      await tester.tap(_dismiss('Dismiss'));
      await tester.pump();

      expect(closed, 1);
      semantics.dispose();
    });

    testWidgets('stops the × answering a second press during the exit', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      int closed = 0;

      await tester.pumpWidget(
        host(width: 400, MPAlert(onClose: () => closed++, child: const Text('Heads up'))),
      );

      await tester.tap(_dismiss('Dismiss'));
      await tester.pump(const Duration(milliseconds: 20));
      // Out of reach the moment it starts leaving: off the semantics tree and
      // deaf to the pointer.
      expect(semanticsLabels(tester), isNot(contains('Dismiss')));
      await tester.tapAt(tester.getCenter(find.byType(MPGlyph).last));

      await tester.pumpAndSettle();
      expect(closed, 1);
      semantics.dispose();
    });

    testWidgets('is reached by the keyboard and ringed in secondary', (WidgetTester tester) async {
      FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
      addTearDown(() => FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic);
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);
      int closed = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          afterFocusStop(before, MPAlert(onClose: () => closed++, child: const Text('Heads up'))),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      final CustomPaint ring = tester
          .widgetList<CustomPaint>(find.descendant(of: _alert, matching: find.byType(CustomPaint)))
          .firstWhere((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter);

      expect((ring.foregroundPainter! as MPFocusRingPainter).color, light.secondary);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(closed, 1);
    });

    testWidgets('washes the × in the message’s ink under a pointer', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, MPAlert(onClose: () {}, child: const Text('Heads up'))),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPGlyph).last));
      await tester.pumpAndSettle();

      final Iterable<Color?> washes = tester
          .widgetList<AnimatedContainer>(
            find.descendant(of: _alert, matching: find.byType(AnimatedContainer)),
          )
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(washes, contains(light.onPrimaryContainer.withValues(alpha: MPStateOpacity.hover)));
    });

    testWidgets('takes a name of its own for the ×', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          MPAlert(onClose: () {}, closeLabel: 'Hide this', child: const Text('Heads up')),
        ),
      );

      expect(_dismiss('Hide this'), findsOneWidget);
      semantics.dispose();
    });

    group('in another language', () {
      setUp(() => registerMPMessages(<MPLocale>[ko, ja]));
      tearDown(resetMPMessages);

      testWidgets('names the × in the locale it was given', (WidgetTester tester) async {
        final SemanticsHandle semantics = tester.ensureSemantics();

        await tester.pumpWidget(
          host(width: 400, MPAlert(onClose: () {}, locale: 'ko', child: const Text('알림'))),
        );

        expect(_dismiss('닫기'), findsOneWidget);
        semantics.dispose();
      });

      testWidgets('follows a provider when it has no locale of its own', (
        WidgetTester tester,
      ) async {
        final SemanticsHandle semantics = tester.ensureSemantics();

        await tester.pumpWidget(
          host(
            width: 400,
            MPLocaleProvider(
              locale: 'ja',
              child: MPAlert(onClose: () {}, child: const Text('お知らせ')),
            ),
          ),
        );

        expect(_dismiss('閉じる'), findsOneWidget);
        semantics.dispose();
      });

      testWidgets('lets its own locale beat the provider', (WidgetTester tester) async {
        final SemanticsHandle semantics = tester.ensureSemantics();

        await tester.pumpWidget(
          host(
            width: 400,
            MPLocaleProvider(
              locale: 'ja',
              child: MPAlert(onClose: () {}, locale: 'ko', child: const Text('알림')),
            ),
          ),
        );

        expect(_dismiss('닫기'), findsOneWidget);
        semantics.dispose();
      });
    });
  });

  group('the action', () {
    testWidgets('renders a button the caller passed beside the message', (
      WidgetTester tester,
    ) async {
      int retries = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          MPAlert(
            action: MPButton(onPressed: () => retries++, child: const Text('Retry')),
            child: const Text('Upload failed'),
          ),
        ),
      );

      await tester.tap(find.text('Retry'));
      expect(retries, 1);
    });

    testWidgets('overhangs the first line rather than pushing the message down', (
      WidgetTester tester,
    ) async {
      int retries = 0;

      await tester.pumpWidget(
        host(
          width: 640,
          MPAlert(
            action: MPButton(
              variant: MPVariant.text,
              onPressed: () => retries++,
              child: const Text('Retry'),
            ),
            child: const Text('Upload failed'),
          ),
        ),
      );

      // A 56px button on a 24px line, in an alert as tall as the line and its
      // padding.
      expect(tester.getSize(_alert).height, 56);

      // Pressed near its top edge, outside the line it is centred on.
      final Rect button = tester.getRect(find.byType(MPButton));
      await tester.tapAt(Offset(button.center.dx, button.top + 4));
      expect(retries, 1);
    });
  });
}
