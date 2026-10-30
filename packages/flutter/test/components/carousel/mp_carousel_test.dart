import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/carousel/mp_carousel.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';

List<Widget> _slides([int count = 3]) {
  return <Widget>[
    for (int index = 0; index < count; index += 1)
      SizedBox(height: 120, child: Center(child: Text('Slide ${index + 1}'))),
  ];
}

/// Which slide is in the frame: the one whose centre is inside it.
String _shown(WidgetTester tester) {
  final Rect frame = tester.getRect(find.byType(MPCarousel));

  for (int index = 0; index < 10; index += 1) {
    final Finder slide = find.text('Slide ${index + 1}');

    if (slide.evaluate().isEmpty) {
      break;
    }

    if (frame.contains(tester.getCenter(slide))) {
      return 'Slide ${index + 1}';
    }
  }

  return 'none';
}

Finder _arrow(String label) => find.bySemanticsLabel(label);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('makes every child a slide as wide as the frame', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));

      expect(_shown(tester), 'Slide 1');
      // As tall as the slides, plus the marks under it.
      expect(tester.getSize(find.byType(MPCarousel)).width, 400);
    });

    testWidgets('names itself and every slide, and lets the caller write the sentence', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          MPCarousel(
            label: 'Trails',
            slideLabel: (int index, int count) => 'Photo $index/$count',
            children: _slides(),
          ),
        ),
      );

      expect(find.bySemanticsLabel('Trails'), findsWidgets);
      expect(find.bySemanticsLabel(RegExp('Photo 2/3')), findsWidgets);
      semantics.dispose();
    });

    testWidgets('draws arrows and marks by default, and drops them when asked', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));
      expect(_arrow('Previous slide'), findsOneWidget);
      expect(_arrow('Next slide'), findsOneWidget);

      await tester.pumpWidget(
        host(width: 400, MPCarousel(arrows: false, indicators: false, children: _slides())),
      );
      expect(_arrow('Next slide'), findsNothing);
      semantics.dispose();
    });

    testWidgets('draws neither for a single slide, because there is nowhere to go', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides(1))));

      expect(_arrow('Next slide'), findsNothing);
      semantics.dispose();
    });

    testWidgets('frames the slides in the outlined surface by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));

      final BoxDecoration frame =
          tester
                  .widgetList<DecoratedBox>(
                    find.descendant(
                      of: find.byType(MPCarousel),
                      matching: find.byType(DecoratedBox),
                    ),
                  )
                  .first
                  .decoration
              as BoxDecoration;

      expect((frame.border! as Border).top.color, light.outlineVariant);
      expect(frame.borderRadius, BorderRadius.circular(12));
    });
  });

  group('moving', () {
    testWidgets('advances when the next arrow is pressed, and wraps at the end', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(width: 400, MPCarousel(onChanged: changes.add, children: _slides())),
      );

      for (int press = 0; press < 3; press += 1) {
        await tester.tap(_arrow('Next slide'));
        await tester.pumpAndSettle();
      }

      expect(changes, <int>[1, 2, 0]);
      expect(_shown(tester), 'Slide 1');
      semantics.dispose();
    });

    testWidgets('goes inert at the ends instead when it does not loop', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, MPCarousel(loop: false, children: _slides())));

      expect(
        tester.getSemantics(_arrow('Previous slide')).getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );
      semantics.dispose();
    });

    testWidgets('jumps to the slide whose mark was pressed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));

      final Finder third = find.descendant(
        of: find.byType(Row),
        matching: find.bySemanticsLabel('Slide 3 of 3'),
      );

      await tester.tap(third.last);
      await tester.pumpAndSettle();

      expect(_shown(tester), 'Slide 3');
      semantics.dispose();
    });

    testWidgets('opens on initialValue, not on the first slide', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, MPCarousel(initialValue: 2, children: _slides())));

      expect(_shown(tester), 'Slide 3');
    });

    testWidgets('settles on the next slide after a drag, and reports it', (
      WidgetTester tester,
    ) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(width: 400, MPCarousel(onChanged: changes.add, children: _slides())),
      );

      await tester.drag(find.text('Slide 1'), const Offset(-300, 0));
      await tester.pumpAndSettle();

      expect(_shown(tester), 'Slide 2');
      expect(changes, <int>[1]);

      // A short, slow drag springs back.
      await tester.timedDrag(
        find.byType(MPCarousel),
        const Offset(-60, 0),
        const Duration(seconds: 1),
      );
      await tester.pumpAndSettle();
      expect(_shown(tester), 'Slide 2');
    });

    testWidgets('runs the other way under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, textDirection: TextDirection.rtl, MPCarousel(children: _slides())),
      );

      await tester.drag(find.text('Slide 1'), const Offset(300, 0));
      await tester.pumpAndSettle();

      expect(_shown(tester), 'Slide 2');
    });

    testWidgets('stays where a controlled caller put it, and follows it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final List<int> changes = <int>[];

      Widget build(int value) {
        return host(
          width: 400,
          MPCarousel(value: value, onChanged: changes.add, children: _slides()),
        );
      }

      await tester.pumpWidget(build(0));
      await tester.tap(_arrow('Next slide'));
      await tester.pumpAndSettle();

      expect(changes, <int>[1]);
      expect(_shown(tester), 'Slide 1');

      await tester.pumpWidget(build(2));
      await tester.pumpAndSettle();
      expect(_shown(tester), 'Slide 3');
      semantics.dispose();
    });

    testWidgets('steps with the arrow keys once the strip has the focus', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));

      final Focus track = tester
          .widgetList<Focus>(
            find.descendant(of: find.byType(MPCarousel), matching: find.byType(Focus)),
          )
          .firstWhere((Focus focus) => focus.onKeyEvent != null);

      track.focusNode!.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(_shown(tester), 'Slide 2');

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(_shown(tester), 'Slide 3');
    });

    testWidgets('cuts rather than travels with animations off', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, disableAnimations: true, MPCarousel(children: _slides())),
      );

      await tester.tap(_arrow('Next slide'));
      await tester.pump();

      expect(_shown(tester), 'Slide 2');
      semantics.dispose();
    });
  });

  group('the marks', () {
    testWidgets('marks the current slide, and only that one, as a bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, MPCarousel(initialValue: 1, children: _slides())));
      await tester.pumpAndSettle();

      final List<double> widths = <double>[
        for (final Element mark
            in find
                .descendant(of: find.byType(Row), matching: find.byType(AnimatedContainer))
                .evaluate())
          (mark.renderObject! as RenderBox).size.width,
      ];

      expect(widths, <double>[6, 16, 6]);
    });
  });

  group('autoPlay', () {
    testWidgets('advances on its own every interval', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCarousel(
            autoPlay: true,
            interval: const Duration(seconds: 2),
            onChanged: changes.add,
            children: _slides(),
          ),
        ),
      );

      await tester.pump(const Duration(seconds: 2));
      await tester.pumpAndSettle();
      expect(changes, <int>[1]);

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('holds while the pointer is on it', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCarousel(
            autoPlay: true,
            interval: const Duration(seconds: 2),
            onChanged: changes.add,
            children: _slides(),
          ),
        ),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPCarousel)));
      await tester.pump();

      await tester.pump(const Duration(seconds: 5));
      expect(changes, isEmpty);

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('does not start with animations turned off', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(
          width: 400,
          disableAnimations: true,
          MPCarousel(
            autoPlay: true,
            interval: const Duration(seconds: 2),
            onChanged: changes.add,
            children: _slides(),
          ),
        ),
      );

      await tester.pump(const Duration(seconds: 5));
      expect(changes, isEmpty);
    });

    testWidgets('goes quiet while it advances by itself', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, MPCarousel(children: _slides())));
      expect(
        tester
            .getSemantics(find.bySemanticsLabel('Slide 1 of 3').last)
            .getSemanticsData()
            .flagsCollection
            .isLiveRegion,
        isTrue,
      );

      await tester.pumpWidget(host(width: 400, MPCarousel(autoPlay: true, children: _slides())));
      expect(
        tester
            .getSemantics(find.bySemanticsLabel('Slide 1 of 3').last)
            .getSemanticsData()
            .flagsCollection
            .isLiveRegion,
        isFalse,
      );
      await tester.pumpWidget(const SizedBox());
      semantics.dispose();
    });
  });
}
