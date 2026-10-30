import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_float/mp_animate_float.dart';

import '../../support/host.dart';

/// How far the content is drawn from where it is laid out.
Offset _drift(WidgetTester tester) {
  final Offset laid = tester.getTopLeft(find.byType(MPAnimateFloat));
  final RenderBox box = tester.renderObject<RenderBox>(find.byKey(const Key('content')));

  return box.localToGlobal(Offset.zero) - laid;
}

const Widget _content = SizedBox(key: Key('content'), width: 60, height: 30);

void main() {
  testWidgets('drifts for ever, because a drift has no destination', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateFloat(child: _content)));
    await tester.pump(const Duration(seconds: 30));

    expect(tester.binding.hasScheduledFrame, isTrue);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('rises and sways along its path, and comes home', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateFloat(duration: Duration(seconds: 4), child: _content)),
    );

    expect(_drift(tester), Offset.zero);

    await tester.pump();
    await tester.pump(const Duration(seconds: 1));

    // A quarter of the way: up by the distance and over by the sway.
    expect(_drift(tester).dx, closeTo(6, 0.1));
    expect(_drift(tester).dy, closeTo(-10, 0.1));

    await tester.pump(const Duration(seconds: 1));

    expect(_drift(tester).dx, closeTo(0, 0.1));
    expect(_drift(tester).dy, closeTo(-15, 0.1));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('takes its travel in logical pixels', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateFloat(
          distance: 20,
          sway: 2,
          duration: Duration(seconds: 4),
          child: _content,
        ),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(seconds: 1));

    expect(_drift(tester), within(distance: 0.1, from: const Offset(2, -20)));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('does not lean unless it was asked to', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateFloat(duration: Duration(seconds: 4), child: _content)),
    );
    await tester.pump();
    await tester.pump(const Duration(seconds: 1));

    final Iterable<Transform> transforms = tester.widgetList<Transform>(
      find.descendant(of: find.byType(MPAnimateFloat), matching: find.byType(Transform)),
    );

    // The lean is the inner transform, and it is the identity.
    expect(transforms.last.transform.isIdentity(), isTrue);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('spreads across the children when asked, like the rest of them', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        const MPAnimateFloat(
          stagger: Duration(milliseconds: 900),
          children: <Widget>[Text('Above'), Text('the'), Text('sheet')],
        ),
      ),
    );

    // One drift per child, and none for the box.
    expect(
      find.descendant(of: find.byType(MPAnimateFloat), matching: find.byType(Transform)),
      findsNWidgets(6),
    );

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('stays home under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateFloat(child: _content), disableAnimations: true));

    expect(_drift(tester), Offset.zero);
    expect(await redrawsIn(tester), isFalse);
  });
}
