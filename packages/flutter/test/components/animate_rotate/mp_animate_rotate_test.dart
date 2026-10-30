import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_rotate/mp_animate_rotate.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

Transform _transform(WidgetTester tester) {
  return tester.widget<Transform>(
    find.descendant(of: find.byType(MPAnimateRotate), matching: find.byType(Transform)).first,
  );
}

/// The angle drawn, in degrees.
double _angle(WidgetTester tester) {
  final Matrix4 matrix = _transform(tester).transform;

  return math.atan2(matrix.entry(1, 0), matrix.entry(0, 0)) * 180 / math.pi;
}

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateRotate), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

void main() {
  testWidgets('swings into place from half a turn back', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateRotate(child: Text('Arrival'))));

    expect(_angle(tester).abs(), closeTo(180, 0.01));
    expect(_opacity(tester), 0);

    await tester.pumpAndSettle();

    expect(_angle(tester), closeTo(0, 0.01));
    expect(_opacity(tester), 1);
  });

  testWidgets('takes long2, which is longer than the other arrivals', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateRotate(child: Text('Arrival'))));
    await tester.pump();
    await tester.pump(MPMotion.medium4 + const Duration(milliseconds: 10));

    expect(_opacity(tester), lessThan(1));

    await tester.pump(MPMotion.long2 - MPMotion.medium4);

    expect(_opacity(tester), 1);
  });

  testWidgets('becomes an endless spin when both angles are given', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateRotate(
          from: 0,
          to: 360,
          repeat: null,
          easing: MPEasing.linear,
          fade: false,
          duration: Duration(seconds: 2),
          child: Text('Spin'),
        ),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    expect(_angle(tester), closeTo(90, 1));
    expect(_opacity(tester), 1);

    await tester.pump(const Duration(seconds: 10));

    expect(tester.binding.hasScheduledFrame, isTrue);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('turns about the origin it was given', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateRotate(origin: Alignment.bottomLeft, child: Text('Arrival'))),
    );

    expect(_transform(tester).alignment, Alignment.bottomLeft);
  });

  testWidgets('is upright under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateRotate(child: Text('Arrival')), disableAnimations: true),
    );

    expect(_angle(tester), closeTo(0, 0.01));
  });
}
