import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/chat_bubble/mp_chat_bubble.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The bubble's own sheet: the first decoration with a corner.
BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
      .widgetList<DecoratedBox>(
        find.descendant(of: find.byType(MPChatBubble), matching: find.byType(DecoratedBox)),
      )
      .map((DecoratedBox box) => box.decoration)
      .whereType<BoxDecoration>()
      .firstWhere((BoxDecoration decoration) => decoration.borderRadius != null);
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('renders the message, the sender and the time', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPChatBubble(name: Text('Nadia'), time: Text('18:01'), child: Text('Six?')),
        ),
      );

      expect(find.text('Six?'), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('Nadia')).dy,
        lessThan(tester.getTopLeft(find.text('Six?')).dy),
      );
      expect(styleOf(tester, '18:01').color, light.onSurfaceVariant);
    });

    testWidgets('is tonal by default, and takes the accent when filled', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPChatBubble(child: Text('Hi'))));
      expect(_sheetOf(tester).color, light.primaryContainer);
      expect(styleOf(tester, 'Hi').color, light.onPrimaryContainer);

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(variant: MPVariant.filled, child: Text('Hi'))),
      );
      expect(_sheetOf(tester).color, light.primary);
      expect(styleOf(tester, 'Hi').color, light.onPrimary);

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(variant: MPVariant.text, child: Text('Hi'))),
      );
      expect(_sheetOf(tester).color, light.surfaceContainerLow);
    });

    testWidgets('cuts the corner nearest the speaker, on the logical side', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPChatBubble(child: Text('Hi'))));
      BorderRadius corners = _sheetOf(tester).borderRadius! as BorderRadius;
      expect(corners.topLeft, const Radius.circular(4));
      expect(corners.topRight, const Radius.circular(28));

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(side: MPChatBubbleSide.end, child: Text('Hi'))),
      );
      corners = _sheetOf(tester).borderRadius! as BorderRadius;
      expect(corners.topRight, const Radius.circular(4));
      expect(corners.topLeft, const Radius.circular(28));

      await tester.pumpWidget(
        host(width: 400, textDirection: TextDirection.rtl, const MPChatBubble(child: Text('Hi'))),
      );
      corners = _sheetOf(tester).borderRadius! as BorderRadius;
      expect(corners.topRight, const Radius.circular(4));
    });

    testWidgets('runs the row the other way for the reading end', (WidgetTester tester) async {
      const Widget avatar = SizedBox(key: Key('avatar'), width: 32, height: 32);

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(avatar: avatar, child: Text('Hi'))),
      );
      expect(
        tester.getCenter(find.byKey(const Key('avatar'))).dx,
        lessThan(tester.getCenter(find.text('Hi')).dx),
      );

      await tester.pumpWidget(
        host(
          width: 400,
          const MPChatBubble(side: MPChatBubbleSide.end, avatar: avatar, child: Text('Hi')),
        ),
      );
      expect(
        tester.getCenter(find.byKey(const Key('avatar'))).dx,
        greaterThan(tester.getCenter(find.text('Hi')).dx),
      );
      // The reading end hugs the far edge.
      expect(
        tester.getTopRight(find.byKey(const Key('avatar'))).dx,
        tester.getTopRight(find.byType(MPChatBubble)).dx,
      );
    });

    testWidgets('pads the bubble by its size', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPChatBubble(child: Text('Hi'))));

      final Rect sheet = tester.getRect(
        find.descendant(of: find.byType(MPChatBubble), matching: find.byType(ClipRRect)),
      );
      final Rect text = tester.getRect(find.text('Hi'));

      expect(text.left - sheet.left, 12);
      expect(text.top - sheet.top, 8);
    });
  });

  group('status', () {
    testWidgets('draws nothing when there is no status', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPChatBubble(child: Text('Hi'))));

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('draws a mark and reads it out as a word', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(status: MPChatBubbleStatus.read, child: Text('Hi'))),
      );

      expect(find.byType(MPGlyph), findsOneWidget);
      expect(find.bySemanticsLabel('Read'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('says it in the locale it was given, or a provider’s', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          const MPChatBubble(locale: 'ko', status: MPChatBubbleStatus.sent, child: Text('Hi')),
        ),
      );
      expect(find.bySemanticsLabel('Sent'), findsNothing);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPConfigProvider(
            locale: 'ko',
            child: MPChatBubble(status: MPChatBubbleStatus.sent, child: Text('Hi')),
          ),
        ),
      );
      expect(find.bySemanticsLabel('Sent'), findsNothing);
      semantics.dispose();
    });

    testWidgets('takes a word of its own', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          const MPChatBubble(
            status: MPChatBubbleStatus.read,
            statusLabel: 'Seen by Nadia',
            child: Text('Hi'),
          ),
        ),
      );

      expect(find.bySemanticsLabel('Seen by Nadia'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('colours only the two steps that mean something', (WidgetTester tester) async {
      final Map<MPChatBubbleStatus, Color> tones = <MPChatBubbleStatus, Color>{
        MPChatBubbleStatus.sending: light.onSurfaceVariant,
        MPChatBubbleStatus.sent: light.onSurfaceVariant,
        MPChatBubbleStatus.delivered: light.onSurfaceVariant,
        MPChatBubbleStatus.read: light.primary,
        MPChatBubbleStatus.failed: light.error,
      };

      for (final MapEntry<MPChatBubbleStatus, Color> entry in tones.entries) {
        await tester.pumpWidget(
          host(width: 400, MPChatBubble(status: entry.key, child: const Text('Hi'))),
        );

        expect(
          tester.widget<MPGlyph>(find.byType(MPGlyph)).color,
          entry.value,
          reason: '${entry.key}',
        );
      }
    });
  });

  group('typing', () {
    testWidgets('draws the dots instead of the message, and announces them', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPChatBubble(typing: true, child: Text('Hidden'))),
      );

      expect(find.text('Hidden'), findsNothing);
      expect(find.bySemanticsLabel('Typing'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('lights each dot at its own place in the wave, and rests under reduced motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPChatBubble(typing: true)));
      await tester.pump(const Duration(milliseconds: 400));

      List<double> alphas() {
        return tester
            .widgetList<DecoratedBox>(
              find.descendant(of: find.byType(MPChatBubble), matching: find.byType(DecoratedBox)),
            )
            .map((DecoratedBox box) => box.decoration)
            .whereType<BoxDecoration>()
            .where((BoxDecoration decoration) => decoration.shape == BoxShape.circle)
            .map((BoxDecoration decoration) => decoration.color!.a)
            .toList();
      }

      final List<double> moving = alphas();

      expect(moving, hasLength(3));
      expect(moving.toSet(), hasLength(3));

      await tester.pumpWidget(
        host(width: 400, disableAnimations: true, const MPChatBubble(typing: true)),
      );
      await tester.pump(const Duration(milliseconds: 400));

      expect(alphas().toSet(), hasLength(1));
    });
  });

  group('the slots', () {
    testWidgets('draws media edge to edge above the text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPChatBubble(
            media: SizedBox(key: Key('media'), width: 200, height: 80),
            child: Text('Look'),
          ),
        ),
      );

      final Rect sheet = tester.getRect(
        find.descendant(of: find.byType(MPChatBubble), matching: find.byType(ClipRRect)).first,
      );
      final Rect media = tester.getRect(find.byKey(const Key('media')));

      expect(media.top, sheet.top);
      expect(media.left, sheet.left);
      expect(media.bottom, lessThan(tester.getTopLeft(find.text('Look')).dy));
    });

    testWidgets('unfurls a link into a card that calls back when pressed', (
      WidgetTester tester,
    ) async {
      int opened = 0;
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          MPChatBubble(
            preview: MPChatBubblePreview(
              onPressed: () => opened++,
              site: const Text('m3.material.io'),
              title: const Text('Cards'),
              description: const Text('Cards contain content.'),
            ),
            child: const Text('This one'),
          ),
        ),
      );

      expect(
        tester.getTopLeft(find.text('Cards')).dy,
        greaterThan(tester.getTopLeft(find.text('This one')).dy),
      );

      await tester.tap(find.text('Cards'));
      expect(opened, 1);
      expect(
        tester.getSemantics(find.text('Cards')).getSemanticsData().flagsCollection.isLink,
        isTrue,
      );
      semantics.dispose();
    });

    testWidgets(
      'renders the avatar and the actions beside the bubble',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          host(
            width: 400,
            const MPChatBubble(
              avatar: SizedBox(key: Key('avatar'), width: 32, height: 32),
              actions: SizedBox(key: Key('actions'), width: 24, height: 24),
              child: Text('Hi'),
            ),
          ),
        );

        double opacity() => tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity)).opacity;

        expect(find.byKey(const Key('avatar')), findsOneWidget);
        expect(
          tester.getCenter(find.byKey(const Key('actions'))).dx,
          greaterThan(tester.getCenter(find.text('Hi')).dx),
        );
        // Out of the way until the row is reached for.
        expect(opacity(), 0);

        final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
        addTearDown(mouse.removePointer);
        await mouse.addPointer(location: Offset.zero);
        await mouse.moveTo(tester.getCenter(find.text('Hi')));
        await tester.pump();

        expect(opacity(), 1);
      },
      variant: TargetPlatformVariant.only(TargetPlatform.macOS),
    );

    testWidgets(
      'shows the actions all the time on a touch platform',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          host(
            width: 400,
            const MPChatBubble(actions: SizedBox(width: 24, height: 24), child: Text('Hi')),
          ),
        );

        expect(tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity)).opacity, 1);
      },
      variant: TargetPlatformVariant.only(TargetPlatform.android),
    );
  });
}
