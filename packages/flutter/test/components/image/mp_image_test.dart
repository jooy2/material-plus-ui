import 'dart:convert';

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/image/mp_image.dart';
import 'package:material_plus_ui/src/internal/decode.dart';

import '../../support/host.dart';

/// A 2 by 1 picture: wide enough that a quarter turn is visible in its shape.
final MemoryImage _wide = MemoryImage(
  base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADklEQVR4nGP4z8AAQv8BD/kD/YURmXYAAAAASUVORK5CYII=',
  ),
);

/// Bytes that are not a picture, so decoding fails.
final MemoryImage _broken = MemoryImage(base64Decode('AAAA'));

/// Lets the picture decode, which happens off the fake clock.
Future<void> _load(WidgetTester tester, Widget widget) async {
  await tester.runAsync(() async {
    await tester.pumpWidget(widget);
    await tester.pump();
    await Future<void>.delayed(const Duration(milliseconds: 50));
  });
  await tester.pumpAndSettle();
}

void main() {
  group('the picture', () {
    testWidgets('is shown once it arrives, and says so once', (WidgetTester tester) async {
      final List<MPImageState> states = <MPImageState>[];

      await _load(
        tester,
        host(
          width: 200,
          MPImage(image: _wide, semanticLabel: 'A lake', ratio: 2, onStateChange: states.add),
        ),
      );

      expect(states, <MPImageState>[MPImageState.loaded]);
      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('is decoded at the size of its box, not of its file', (WidgetTester tester) async {
      await _load(
        tester,
        host(width: 200, MPImage(image: _wide, semanticLabel: 'A lake', ratio: 2)),
      );

      expect(tester.widget<Image>(find.byType(Image)).image, isA<MPSizedImage>());
    });

    testWidgets('falls back, and reports the failure', (WidgetTester tester) async {
      final List<MPImageState> states = <MPImageState>[];

      await _load(
        tester,
        host(
          width: 200,
          MPImage(
            image: _broken,
            semanticLabel: 'A lake',
            ratio: 2,
            fallback: const SizedBox(key: Key('fallback')),
            onStateChange: states.add,
          ),
        ),
      );

      expect(find.byKey(const Key('fallback')), findsOneWidget);
      expect(states, <MPImageState>[MPImageState.error]);
    });

    testWidgets('draws a placeholder of its own while it loads', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 200,
          MPImage(
            image: _wide,
            semanticLabel: 'A lake',
            ratio: 2,
            placeholder: const SizedBox(key: Key('waiting')),
          ),
        ),
      );

      expect(find.byKey(const Key('waiting')), findsOneWidget);
    });
  });

  group('the box', () {
    testWidgets('reserves the room from a ratio', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 320, MPImage(image: _wide, semanticLabel: 'A lake', ratio: 16 / 9)),
      );

      expect(tester.getSize(find.byType(MPImage)), const Size(320, 180));
    });

    testWidgets('reserves the proportion of a declared size', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 240, MPImage(image: _wide, semanticLabel: 'A boat', width: 480, height: 320)),
      );

      expect(tester.getSize(find.byType(MPImage)), const Size(240, 160));
    });

    testWidgets('turns that proportion with a quarter turn', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 240,
          MPImage(image: _wide, semanticLabel: 'A boat', width: 480, height: 320, rotate: 90),
        ),
      );

      expect(tester.getSize(find.byType(MPImage)), const Size(240, 360));
    });

    testWidgets('keeps an explicit ratio through a turn', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 200, MPImage(image: _wide, semanticLabel: 'A boat', ratio: 2, rotate: 90)),
      );

      expect(tester.getSize(find.byType(MPImage)), const Size(200, 100));
    });

    testWidgets('makes a box as tall as a lone height', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, MPImage(image: _wide, semanticLabel: 'A path', height: 140)),
      );

      expect(tester.getSize(find.byType(MPImage)), const Size(300, 140));
    });

    testWidgets('rounds any turn to the nearest quarter', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 200, MPImage(image: _wide, semanticLabel: 'A boat', ratio: 2, rotate: 100)),
      );

      expect(tester.widget<RotatedBox>(find.byType(RotatedBox)).quarterTurns, 1);
    });

    testWidgets('paints a letterbox behind the picture', (WidgetTester tester) async {
      const Color behind = Color(0xFF203040);

      await tester.pumpWidget(
        host(
          width: 200,
          MPImage(
            image: _wide,
            semanticLabel: 'An umbrella',
            ratio: 4 / 3,
            fit: MPImageFit.contain,
            letterbox: const MPImageLetterbox(BoxDecoration(color: behind)),
          ),
        ),
      );

      final DecoratedBox box = tester.widget<DecoratedBox>(
        find.descendant(of: find.byType(MPImage), matching: find.byType(DecoratedBox)),
      );
      expect((box.decoration as BoxDecoration).color, behind);
    });
  });

  group('semantics', () {
    testWidgets('is an image named by its label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 200, MPImage(image: _wide, semanticLabel: 'A lake', ratio: 2)),
      );

      expect(
        tester.getSemantics(find.byType(MPImage)),
        matchesSemantics(label: 'A lake', isImage: true),
      );
      semantics.dispose();
    });

    testWidgets('leaves a decorative picture out of the tree', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 200, MPImage(image: _wide, semanticLabel: '', ratio: 2)));

      expect(semanticsLabels(tester), isEmpty);
      semantics.dispose();
    });
  });

  group('preview', () {
    testWidgets('is not a button unless it is asked for', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 200, MPImage(image: _wide, semanticLabel: 'A lake', ratio: 2)),
      );

      expect(tester.getSemantics(find.byType(MPImage)), isNot(matchesSemantics(isButton: true)));
      semantics.dispose();
    });

    testWidgets('opens the picture over a scrim, and closes on Escape', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _load(
        tester,
        host(
          overlay: true,
          width: 200,
          MPImage(image: _wide, semanticLabel: 'A lake', ratio: 2, preview: true),
        ),
      );

      expect(find.bySemanticsLabel('A lake'), findsOneWidget);

      await tester.tap(find.byType(MPImage));
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsNWidgets(2));

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('opens previewImage when there is one', (WidgetTester tester) async {
      final MemoryImage full = MemoryImage(_wide.bytes);

      await _load(
        tester,
        host(
          overlay: true,
          width: 200,
          MPImage(
            image: _wide,
            previewImage: full,
            semanticLabel: 'A lake',
            ratio: 2,
            preview: true,
          ),
        ),
      );

      await tester.tap(find.byType(MPImage));
      await tester.pumpAndSettle();

      final ImageProvider<Object> opened = tester.widgetList<Image>(find.byType(Image)).last.image;
      expect(opened is MPSizedImage ? opened.image : opened, same(full));
    });

    testWidgets('refuses to open a picture that failed', (WidgetTester tester) async {
      await _load(
        tester,
        host(
          overlay: true,
          width: 200,
          MPImage(image: _broken, semanticLabel: 'A lake', ratio: 2, preview: true),
        ),
      );

      await tester.tap(find.byType(MPImage));
      await tester.pumpAndSettle();

      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('takes a label of its own', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          width: 200,
          MPImage(
            image: _wide,
            semanticLabel: 'A lake',
            previewLabel: 'Open the lake',
            ratio: 2,
            preview: true,
          ),
        ),
      );

      final SemanticsData data = tester
          .getSemantics(find.bySemanticsLabel('Open the lake'))
          .getSemanticsData();
      expect(data.flagsCollection.isButton, isTrue);
      expect(data.flagsCollection.isImage, isTrue);
      semantics.dispose();
    });
  });
}
