import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_shake/mp_animate_shake.dart';

import '../../support/host.dart';

double _shift(WidgetTester tester) {
  final double laid = tester.getTopLeft(find.byType(MPAnimateShake)).dx;
  final RenderBox box = tester.renderObject<RenderBox>(find.byKey(const Key('content')));

  return box.localToGlobal(Offset.zero).dx - laid;
}

Widget _shake({bool play = false}) {
  return host(
    MPAnimateShake(
      play: play,
      child: const SizedBox(key: Key('content'), width: 100, height: 40),
    ),
  );
}

void main() {
  testWidgets('does nothing on mount, because nothing has been refused yet', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_shake());
    await tester.pump(const Duration(milliseconds: 100));

    expect(_shift(tester), 0);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('answers when `play` goes up, swinging out a distance each way', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_shake());
    await tester.pumpWidget(_shake(play: true));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 80));

    // The first keyframe, a fifth of the way in.
    expect(_shift(tester), closeTo(-8, 0.1));

    await tester.pump(const Duration(milliseconds: 80));

    expect(_shift(tester), closeTo(8, 0.1));
  });

  testWidgets('says it once, and ends at home', (WidgetTester tester) async {
    await tester.pumpWidget(_shake());
    await tester.pumpWidget(_shake(play: true));
    await tester.pumpAndSettle();

    expect(_shift(tester), 0);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('says it again on the next refusal', (WidgetTester tester) async {
    await tester.pumpWidget(_shake());
    await tester.pumpWidget(_shake(play: true));
    await tester.pumpAndSettle();
    await tester.pumpWidget(_shake());
    await tester.pumpWidget(_shake(play: true));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 80));

    expect(_shift(tester), closeTo(-8, 0.1));
  });

  testWidgets('takes its travel in logical pixels', (WidgetTester tester) async {
    Widget shake(bool play) {
      return host(
        MPAnimateShake(
          play: play,
          distance: 20,
          child: const SizedBox(key: Key('content'), width: 100, height: 40),
        ),
      );
    }

    await tester.pumpWidget(shake(false));
    await tester.pumpWidget(shake(true));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 80));

    expect(_shift(tester), closeTo(-20, 0.1));
  });

  testWidgets('stays still under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateShake(
          play: true,
          child: SizedBox(key: Key('content'), width: 100, height: 40),
        ),
        disableAnimations: true,
      ),
    );
    await tester.pump(const Duration(milliseconds: 80));

    expect(_shift(tester), 0);
  });
}
