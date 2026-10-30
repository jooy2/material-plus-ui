import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_marquee/mp_animate_marquee.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// Four items 50 wide, so one copy is 4 × 50 + 3 gaps of 10 = 230 long and a
/// pass travels 230 + 10 = 240.
List<Widget> _items() => <Widget>[
  for (final String name in <String>['One', 'Two', 'Three', 'Four'])
    SizedBox(width: 50, height: 20, child: Text(name)),
];

Widget _marquee({
  MPOrientation orientation = MPOrientation.horizontal,
  bool reverse = false,
  double speed = 60,
  Duration? duration,
  bool pauseOnHover = true,
  int copies = 2,
  TextDirection textDirection = TextDirection.ltr,
  bool disableAnimations = false,
}) {
  return host(
    MPAnimateMarquee(
      orientation: orientation,
      reverse: reverse,
      speed: speed,
      duration: duration,
      gap: 10,
      copies: copies,
      pauseOnHover: pauseOnHover,
      children: _items(),
    ),
    width: 200,
    height: orientation == MPOrientation.vertical ? 100 : null,
    textDirection: textDirection,
    disableAnimations: disableAnimations,
  );
}

/// How far the strip has moved, along its own axis.
Offset _shift(WidgetTester tester) {
  final Transform transform = tester.widget<Transform>(
    find.descendant(of: find.byType(MPAnimateMarquee), matching: find.byType(Transform)),
  );

  return MatrixUtils.getAsTranslation(transform.transform)!;
}

Future<void> _advance(WidgetTester tester, Duration time) async {
  const Duration frame = Duration(milliseconds: 20);

  for (Duration gone = Duration.zero; gone < time; gone += frame) {
    await tester.pump(frame);
  }
}

void main() {
  testWidgets('lays the content down twice', (WidgetTester tester) async {
    await tester.pumpWidget(_marquee());

    expect(find.text('One'), findsNWidgets(2));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('reads out only the first copy, and reaches only it by keyboard', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(_marquee());

    expect(semanticsLabels(tester).where((String label) => label == 'One'), hasLength(1));
    expect(
      find.ancestor(of: find.text('One').last, matching: find.byType(ExcludeFocus)),
      findsOneWidget,
    );

    await tester.pumpWidget(const SizedBox());
    handle.dispose();
  });

  testWidgets('clips the strip to the width it is given', (WidgetTester tester) async {
    await tester.pumpWidget(_marquee());

    expect(tester.getSize(find.byType(MPAnimateMarquee)), const Size(200, 20));
    expect(tester.takeException(), isNull);

    await tester.pumpWidget(const SizedBox());
  });

  group('speed', () {
    testWidgets('turns the measured length into a duration', (WidgetTester tester) async {
      await tester.pumpWidget(_marquee());
      await tester.pump();
      await _advance(tester, const Duration(seconds: 1));

      // Sixty pixels a second, towards the start.
      expect(_shift(tester).dx, closeTo(-60, 2));

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('lets an explicit duration win over the measurement', (WidgetTester tester) async {
      await tester.pumpWidget(_marquee(duration: const Duration(seconds: 2)));
      await tester.pump();
      await _advance(tester, const Duration(seconds: 1));

      // Half of the 240 a pass travels.
      expect(_shift(tester).dx, closeTo(-120, 3));

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('holds the strip at a speed of nought', (WidgetTester tester) async {
      await tester.pumpWidget(_marquee(speed: 0));
      await _advance(tester, const Duration(seconds: 1));

      expect(_shift(tester), Offset.zero);

      await tester.pumpWidget(const SizedBox());
    });
  });

  testWidgets('comes back to where it began after a pass, with no seam', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_marquee(duration: const Duration(seconds: 1)));
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 1010));

    expect(_shift(tester).dx.abs(), lessThan(5));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('runs down the page when it is vertical', (WidgetTester tester) async {
    await tester.pumpWidget(_marquee(orientation: MPOrientation.vertical));
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 500));

    expect(_shift(tester).dx, 0);
    expect(_shift(tester).dy, lessThan(0));
    expect(tester.getSize(find.byType(MPAnimateMarquee)).height, 100);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('runs the other way round', (WidgetTester tester) async {
    await tester.pumpWidget(_marquee(reverse: true, duration: const Duration(seconds: 2)));
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 500));

    // Backwards from the end of a pass, so it starts a whole pass along.
    expect(_shift(tester).dx, closeTo(-180, 3));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('runs towards the reader’s start in a right-to-left language', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_marquee(textDirection: TextDirection.rtl));
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 500));

    expect(_shift(tester).dx, greaterThan(0));

    await tester.pumpWidget(const SizedBox());
  });

  group('pauseOnHover', () {
    testWidgets('holds the strip while the pointer is on it', (WidgetTester tester) async {
      await tester.pumpWidget(_marquee());
      await tester.pump();
      await _advance(tester, const Duration(milliseconds: 200));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);

      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPAnimateMarquee)));
      await tester.pump();

      final Offset held = _shift(tester);

      await _advance(tester, const Duration(milliseconds: 500));

      expect(_shift(tester), held);

      await mouse.moveTo(Offset.zero);
      await tester.pump();
      await _advance(tester, const Duration(milliseconds: 200));

      expect(_shift(tester).dx, lessThan(held.dx));

      await mouse.removePointer();
      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('can be turned off', (WidgetTester tester) async {
      await tester.pumpWidget(_marquee(pauseOnHover: false));
      await tester.pump();

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);

      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPAnimateMarquee)));
      await tester.pump();

      final Offset before = _shift(tester);

      await _advance(tester, const Duration(milliseconds: 300));

      expect(_shift(tester).dx, lessThan(before.dx));

      await mouse.removePointer();
      await tester.pumpWidget(const SizedBox());
    });
  });

  testWidgets('stands still with its first copy in frame under reduced motion', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_marquee(disableAnimations: true));
    await tester.pump(const Duration(seconds: 1));

    expect(_shift(tester), Offset.zero);
    expect(await redrawsIn(tester), isFalse);
  });
}
