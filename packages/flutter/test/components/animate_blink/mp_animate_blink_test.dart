import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_blink/mp_animate_blink.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateBlink), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

void main() {
  testWidgets('goes all the way to nothing halfway through a cycle, and back', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateBlink(child: Text('Recording'))));

    expect(_opacity(tester), 1);

    await tester.pump();
    await tester.pump(MPMotion.extraLong4 ~/ 2);

    expect(_opacity(tester), closeTo(0, 0.01));

    await tester.pump(MPMotion.extraLong4 ~/ 2);

    expect(_opacity(tester), closeTo(1, 0.05));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('repeats for ever unless told otherwise', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateBlink(child: Text('Recording'))));
    await tester.pump(const Duration(seconds: 10));

    expect(tester.binding.hasScheduledFrame, isTrue);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('ends where it started when a count runs out', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateBlink(repeat: 2, child: Text('Twice'))));

    for (int frame = 0; frame < 250; frame += 1) {
      await tester.pump(const Duration(milliseconds: 10));
    }

    expect(_opacity(tester), 1);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('eases each half on standard rather than the whole cycle', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateBlink(child: Text('Recording'))));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 250));

    // A quarter of the cycle is halfway down the first half, on the curve.
    expect(_opacity(tester), closeTo(1 - MPMotion.standard.transform(0.5), 0.02));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('can stay readable while it pulses', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateBlink(min: 0.55, child: Text('Failing'))));
    await tester.pump();
    await tester.pump(MPMotion.extraLong4 ~/ 2);

    expect(_opacity(tester), closeTo(0.55, 0.01));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('can be held still without unwinding', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateBlink(paused: true, child: Text('Held'))));
    await tester.pump(const Duration(seconds: 2));

    expect(_opacity(tester), 1);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('holds still at full strength under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateBlink(child: Text('Recording')), disableAnimations: true),
    );

    expect(_opacity(tester), 1);
    expect(await redrawsIn(tester), isFalse);
  });
}
