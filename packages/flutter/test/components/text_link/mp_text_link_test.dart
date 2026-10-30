import 'package:flutter/gestures.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/text_link/mp_text_link.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('a link', () {
    testWidgets('is announced as a link, with its URL', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPTextLink(href: 'https://m3.material.io', onPressed: () {}, child: const Text('Spec')),
        ),
      );

      final SemanticsData data = tester.getSemantics(find.text('Spec')).getSemanticsData();
      expect(data.flagsCollection.isLink, isTrue);
      expect(data.linkUrl, Uri.parse('https://m3.material.io'));
      expect(data.label, 'Spec');
      semantics.dispose();
    });

    testWidgets('follows by pointer and by Enter, and not by Space', (WidgetTester tester) async {
      int follows = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPTextLink(focusNode: focus, onPressed: () => follows++, child: const Text('Spec'))),
      );

      await tester.tap(find.text('Spec'));
      expect(follows, 1);

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(follows, 2);
    });
  });

  group('the underline', () {
    TextStyle labelStyle(WidgetTester tester) => styleOf(tester, 'Spec');

    testWidgets('is drawn at rest by default, at 45% of the ink', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPTextLink(onPressed: () {}, child: const Text('Spec'))));

      expect(labelStyle(tester).decoration, TextDecoration.underline);
      expect(
        labelStyle(tester).decorationColor!.a,
        closeTo(0.45 * labelStyle(tester).color!.a, 0.01),
      );
    });

    testWidgets('waits for the pointer when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPTextLink(
            underline: MPTextLinkUnderline.hover,
            onPressed: () {},
            child: const Text('Spec'),
          ),
        ),
      );

      expect(labelStyle(tester).decoration, TextDecoration.none);

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Spec')));
      await tester.pumpAndSettle();

      expect(labelStyle(tester).decoration, TextDecoration.underline);
      expect(labelStyle(tester).decorationColor, labelStyle(tester).color);
    });

    testWidgets('is never drawn when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPTextLink(
            underline: MPTextLinkUnderline.none,
            onPressed: () {},
            child: const Text('Spec'),
          ),
        ),
      );

      expect(labelStyle(tester).decoration, TextDecoration.none);
    });
  });

  group('colour and size', () {
    testWidgets('takes the surrounding ink when no family is asked for', (
      WidgetTester tester,
    ) async {
      const Color ink = Color(0xFF445566);

      await tester.pumpWidget(
        host(
          DefaultTextStyle(
            style: const TextStyle(color: ink),
            child: MPTextLink(onPressed: () {}, child: const Text('Spec')),
          ),
        ),
      );

      expect(styleOf(tester, 'Spec').color, ink);
    });

    testWidgets('reads the accent family when one is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPTextLink(color: MPColor.primary, onPressed: () {}, child: const Text('Spec'))),
      );

      expect(styleOf(tester, 'Spec').color, light.primary);
    });

    testWidgets('sets a standalone link in the prose scale', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPTextLink(size: MPSize.sm, onPressed: () {}, child: const Text('Spec'))),
      );

      expect(styleOf(tester, 'Spec').fontSize, 14);
    });
  });

  group('a new tab', () {
    testWidgets('draws nothing beside a plain link', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPTextLink(onPressed: () {}, child: const Text('Spec'))));

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('draws the arrow leaving its box and says so', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPTextLink(newTab: true, onPressed: () {}, child: const Text('Spec'))),
      );

      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.externalLink);
      expect(tester.getSemantics(find.text('Spec')).getSemanticsData().hint, 'Opens in a new tab');
      semantics.dispose();
    });

    testWidgets('takes a caller’s wording for that note', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPTextLink(
            newTab: true,
            newTabLabel: 'leaves the app',
            onPressed: () {},
            child: const Text('Spec'),
          ),
        ),
      );

      expect(tester.getSemantics(find.text('Spec')).getSemanticsData().hint, 'leaves the app');
      semantics.dispose();
    });

    testWidgets('can be silenced', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPTextLink(newTab: true, icon: false, onPressed: () {}, child: const Text('Spec'))),
      );

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('draws the chain on a plain link that asks for a mark', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(MPTextLink(icon: true, onPressed: () {}, child: const Text('Spec'))),
      );

      expect(tester.widget<MPGlyph>(find.byType(MPGlyph)).shape, MPGlyphShape.link);
    });

    testWidgets('takes a mark of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPTextLink(
            icon: const SizedBox(key: Key('mark'), width: 8, height: 8),
            onPressed: () {},
            child: const Text('Spec'),
          ),
        ),
      );

      expect(find.byKey(const Key('mark')), findsOneWidget);
    });
  });
}
