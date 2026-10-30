import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_lighting/mp_animate_lighting.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const Widget _content = SizedBox(key: Key('content'), width: 120, height: 60);

/// The glow's own box, which sits behind the content.
BoxDecoration _glow(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find.descendant(
              of: find.byType(MPAnimateLighting),
              matching: find.byType(DecoratedBox),
            ),
          )
          .decoration
      as BoxDecoration;
}

double _turn(WidgetTester tester) {
  final SweepGradient sweep = _glow(tester).gradient! as SweepGradient;

  return (sweep.transform! as GradientRotation).radians;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('draws the glow behind the content, reaching past it by the spread', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateLighting(child: _content)));

    final Rect content = tester.getRect(find.byKey(const Key('content')));
    final Rect glow = tester.getRect(
      find.descendant(of: find.byType(MPAnimateLighting), matching: find.byType(DecoratedBox)),
    );

    expect(glow, content.inflate(3));

    // Behind: the glow is the stack's first child and the content its last,
    // so the content is painted over it.
    final Stack stack = tester.widget<Stack>(
      find.descendant(of: find.byType(MPAnimateLighting), matching: find.byType(Stack)),
    );

    expect(stack.children.first, isA<Positioned>());
    expect(stack.children.last, same(_content));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('leaves the content untouched', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(child: _content)));

    expect(tester.getSize(find.byType(MPAnimateLighting)), const Size(120, 60));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('runs the revolution linearly, three seconds to a turn', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(child: _content)));
    await tester.pump();

    final double start = _turn(tester);

    await tester.pump(const Duration(milliseconds: 750));

    expect(_turn(tester) - start, closeTo(3.14159 / 2, 0.01));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('runs the light the other way round', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(reverse: true, child: _content)));
    await tester.pump();

    final double start = _turn(tester);

    await tester.pump(const Duration(milliseconds: 750));

    expect(_turn(tester) - start, closeTo(-3.14159 / 2, 0.01));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('reads an accent family rather than a colour', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateLighting(color: MPColor.tertiary, child: _content)),
    );

    final SweepGradient sweep = _glow(tester).gradient! as SweepGradient;

    expect(sweep.colors[1], light.tertiary);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('follows the corner ladder, and the provider', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(child: _content)));

    expect(_glow(tester).borderRadius, BorderRadius.circular(12));

    await tester.pumpWidget(host(const MPAnimateLighting(size: MPSize.xl, child: _content)));

    expect(_glow(tester).borderRadius, BorderRadius.circular(28));

    await tester.pumpWidget(
      host(
        const MPConfigProvider(
          size: MPSize.sm,
          child: MPAnimateLighting(child: _content),
        ),
      ),
    );

    expect(_glow(tester).borderRadius, BorderRadius.circular(8));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('takes the shape of the light from its dials', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(arc: 90, spread: 6, child: _content)));

    final SweepGradient sweep = _glow(tester).gradient! as SweepGradient;

    expect(sweep.stops, <double>[0, 0.25, 0.5, 1]);

    final Rect glow = tester.getRect(
      find.descendant(of: find.byType(MPAnimateLighting), matching: find.byType(DecoratedBox)),
    );

    expect(glow.width, 132);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('can be held still', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateLighting(paused: true, child: _content)));
    await tester.pump(const Duration(seconds: 1));

    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('becomes an even glow under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateLighting(child: _content), disableAnimations: true),
    );

    expect(_glow(tester).gradient, isNull);
    expect(_glow(tester).color, light.primary);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('starts on the pointer over the content when it is a hover trigger', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateLighting(trigger: MPAnimateTrigger.hover, child: _content)),
    );
    await tester.pump(const Duration(seconds: 1));

    final double before = _turn(tester);
    final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);

    await mouse.addPointer(location: Offset.zero);
    await mouse.moveTo(tester.getCenter(find.byKey(const Key('content'))));
    // A frame to start on, which a ticker counts from, and one to move on.
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 10));
    await tester.pump(const Duration(milliseconds: 300));

    expect(_turn(tester), isNot(before));

    await mouse.removePointer();
    await tester.pumpWidget(const SizedBox());
  });
}
