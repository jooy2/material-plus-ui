import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_grow/mp_animate_grow.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

/// The scale the grow is drawing at, read off its transform.
double _scale(WidgetTester tester) {
  return tester
      .widget<Transform>(
        find.descendant(of: find.byType(MPAnimateGrow), matching: find.byType(Transform)).first,
      )
      .transform
      .entry(0, 0);
}

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateGrow), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

void main() {
  testWidgets('starts close to its final size and fades in as it grows', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateGrow(child: Text('Unfolding'))));

    expect(_scale(tester), closeTo(0.8, 0.001));
    expect(_opacity(tester), 0);

    await tester.pumpAndSettle();

    expect(_scale(tester), 1);
    expect(_opacity(tester), 1);
  });

  testWidgets('takes medium4 arriving and short4 leaving', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateGrow(child: Text('In'))));
    await tester.pump();
    await tester.pump(MPMotion.medium4 - const Duration(milliseconds: 20));

    expect(_scale(tester), lessThan(1));

    await tester.pump(const Duration(milliseconds: 30));

    expect(_scale(tester), 1);

    await tester.pumpWidget(
      host(const MPAnimateGrow(key: Key('out'), mode: MPAnimateMode.exit, child: Text('Out'))),
    );
    await tester.pump();
    await tester.pump(MPMotion.short4 + const Duration(milliseconds: 10));

    expect(_scale(tester), closeTo(0.8, 0.001));
  });

  testWidgets('can settle down onto the page from above 1', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateGrow(from: 1.15, child: Text('Settling'))));

    expect(_scale(tester), closeTo(1.15, 0.001));
  });

  testWidgets('anchors the unfold to the origin it was given', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateGrow(
          origin: Alignment.topLeft,
          child: SizedBox(width: 100, height: 100, child: Text('Corner')),
        ),
      ),
    );

    final Transform transform = tester.widget<Transform>(
      find.descendant(of: find.byType(MPAnimateGrow), matching: find.byType(Transform)).first,
    );

    expect(transform.alignment, Alignment.topLeft);

    // The top left corner stays where it will end up while the rest moves.
    final Offset corner = tester.getTopLeft(find.byType(SizedBox).last);

    await tester.pumpAndSettle();

    expect(tester.getTopLeft(find.byType(SizedBox).last), corner);
  });

  testWidgets('is the middle by default', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateGrow(child: Text('Unfolding'))));

    final Transform transform = tester.widget<Transform>(
      find.descendant(of: find.byType(MPAnimateGrow), matching: find.byType(Transform)).first,
    );

    expect(transform.alignment, Alignment.center);
  });

  testWidgets('holds full opacity for something only changing size', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateGrow(fade: false, child: Text('Resizing'))));

    expect(_opacity(tester), 1);
    expect(_scale(tester), closeTo(0.8, 0.001));
  });

  testWidgets('is at its own size under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateGrow(child: Text('Unfolding')), disableAnimations: true),
    );

    expect(_scale(tester), 1);
    expect(_opacity(tester), 1);
  });
}
