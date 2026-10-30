import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/scroll_zone/mp_scroll_zone.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite drives a real scroll container in a browser. Here the strip
/// is a scroll view with a controller the test holds, so where it scrolled to is
/// a number to read rather than a `scrollLeft` to query.

/// [count] boxes 100 wide, named by their index.
List<Widget> _items(int count, {double extent = 100}) => <Widget>[
  for (int index = 0; index < count; index += 1)
    SizedBox(key: Key('item$index'), width: extent, height: extent),
];

MPButton _buttonFor(WidgetTester tester, String label) {
  return tester.widget<MPButton>(
    find.byWidgetPredicate((Widget widget) => widget is MPButton && widget.semanticLabel == label),
  );
}

Future<void> _pump(WidgetTester tester, Widget zone, {double width = 400}) async {
  await tester.pumpWidget(host(width: width, zone));
  // The buttons are decided once the strip has been measured.
  await tester.pump();
}

void main() {
  late ScrollController scroll;

  setUp(() => scroll = ScrollController());
  tearDown(() => scroll.dispose());

  testWidgets('lays the children out along one line and scrolls that way', (
    WidgetTester tester,
  ) async {
    await _pump(tester, MPScrollZone(controller: scroll, children: _items(10)));

    expect(
      tester.getTopLeft(find.byKey(const Key('item1'))).dx -
          tester.getTopLeft(find.byKey(const Key('item0'))).dx,
      108,
    );
    expect(scroll.position.axis, Axis.horizontal);
  });

  testWidgets('stacks them into lines rows before starting a new column', (
    WidgetTester tester,
  ) async {
    await _pump(tester, MPScrollZone(lines: 2, controller: scroll, children: _items(4)));

    final Offset first = tester.getTopLeft(find.byKey(const Key('item0')));

    expect(tester.getTopLeft(find.byKey(const Key('item1'))), first + const Offset(0, 108));
    expect(tester.getTopLeft(find.byKey(const Key('item2'))), first + const Offset(108, 0));
  });

  testWidgets('draws no buttons while everything fits', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await _pump(tester, MPScrollZone(children: _items(2)));

    expect(find.byType(MPButton), findsNothing);
    handle.dispose();
  });

  testWidgets('draws both once it does, with the one at the end disabled', (
    WidgetTester tester,
  ) async {
    await _pump(tester, MPScrollZone(children: _items(10)));

    expect(find.byType(MPButton), findsNWidgets(2));
    expect(_buttonFor(tester, 'Scroll back').disabled, isTrue);
    expect(_buttonFor(tester, 'Scroll forward').disabled, isFalse);
  });

  testWidgets('draws them from the first frame when told to always', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, MPScrollZone(buttons: MPScrollZoneButtons.always, children: _items(2))),
    );

    expect(find.byType(MPButton), findsNWidgets(2));
  });

  testWidgets('draws none at all when asked for none', (WidgetTester tester) async {
    await _pump(tester, MPScrollZone(buttons: MPScrollZoneButtons.none, children: _items(10)));

    expect(find.byType(MPButton), findsNothing);
  });

  testWidgets('removes an overlay button with nowhere to go rather than disabling it', (
    WidgetTester tester,
  ) async {
    await _pump(
      tester,
      MPScrollZone(buttonPlacement: MPScrollZoneButtonPlacement.overlay, children: _items(10)),
    );

    expect(find.byType(MPButton), findsOneWidget);
    expect(_buttonFor(tester, 'Scroll forward').disabled, isFalse);
  });

  testWidgets('moves to the next child when the forward button is pressed', (
    WidgetTester tester,
  ) async {
    await _pump(tester, MPScrollZone(controller: scroll, children: _items(10)));

    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();

    expect(scroll.offset, 108);
  });

  testWidgets('moves step children at a time, and back again', (WidgetTester tester) async {
    await _pump(tester, MPScrollZone(controller: scroll, step: 2, children: _items(10)));

    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();
    expect(scroll.offset, 216);

    await tester.tap(_backButton());
    await tester.pumpAndSettle();
    expect(scroll.offset, 0);
  });

  testWidgets('moves by everything in view in page mode', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(
        controller: scroll,
        mode: MPScrollZoneMode.page,
        buttons: MPScrollZoneButtons.none,
        children: _items(20),
      ),
    );
    final double extent = scroll.position.viewportDimension;

    await _pump(
      tester,
      MPScrollZone(
        controller: scroll,
        mode: MPScrollZoneMode.page,
        buttonPlacement: MPScrollZoneButtonPlacement.overlay,
        children: _items(20),
      ),
    );
    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();

    expect(scroll.offset, extent);
  });

  testWidgets('runs down the page when it is vertical', (WidgetTester tester) async {
    await _pump(
      tester,
      SizedBox(
        height: 300,
        child: MPScrollZone(
          orientation: MPOrientation.vertical,
          controller: scroll,
          children: _items(10),
        ),
      ),
    );

    expect(scroll.position.axis, Axis.vertical);
    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();
    expect(scroll.offset, 108);
  });

  testWidgets('is a group with a name, its own or the locale’s', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await _pump(tester, MPScrollZone(children: _items(2)));
    expect(semanticsLabels(tester), contains('Scrollable content'));

    await _pump(tester, MPScrollZone(label: 'Categories', children: _items(2)));
    expect(semanticsLabels(tester), contains('Categories'));
    handle.dispose();
  });

  testWidgets('names the buttons as it is told to', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(previousLabel: 'Earlier', nextLabel: 'Later', children: _items(10)),
    );

    expect(_buttonFor(tester, 'Later').disabled, isFalse);
    expect(_buttonFor(tester, 'Earlier').disabled, isTrue);
  });

  testWidgets('draws a scrollbar only when asked for one', (WidgetTester tester) async {
    await _pump(tester, MPScrollZone(children: _items(10)));
    expect(find.byType(RawScrollbar), findsNothing);

    await _pump(tester, MPScrollZone(scrollbar: true, children: _items(10)));
    expect(find.byType(RawScrollbar), findsOneWidget);
  });

  testWidgets('snaps the nearest child to the leading edge when asked', (
    WidgetTester tester,
  ) async {
    await _pump(
      tester,
      MPScrollZone(
        controller: scroll,
        snap: true,
        buttons: MPScrollZoneButtons.none,
        children: _items(10),
      ),
    );

    scroll.jumpTo(130);
    await tester.pumpAndSettle();
    // A jump ends at once; the end of it is what snaps.
    scroll.position.didEndScroll();
    await tester.pumpAndSettle();

    expect(scroll.offset, 108);
  });

  testWidgets('lets a mouse drag the strip along', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(controller: scroll, buttons: MPScrollZoneButtons.none, children: _items(10)),
    );

    final TestGesture mouse = await tester.startGesture(
      tester.getCenter(find.byType(MPScrollZone)),
      kind: PointerDeviceKind.mouse,
    );
    await mouse.moveBy(const Offset(-50, 0));
    await mouse.moveBy(const Offset(-50, 0));
    await mouse.up();
    await tester.pumpAndSettle();

    expect(scroll.offset, greaterThan(0));
  });

  testWidgets('leaves a mouse drag alone when told not to take it', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(
        controller: scroll,
        drag: false,
        buttons: MPScrollZoneButtons.none,
        children: _items(10),
      ),
    );

    final TestGesture mouse = await tester.startGesture(
      tester.getCenter(find.byType(MPScrollZone)),
      kind: PointerDeviceKind.mouse,
    );
    await mouse.moveBy(const Offset(-100, 0));
    await mouse.up();
    await tester.pumpAndSettle();

    expect(scroll.offset, 0);
  });

  testWidgets('travels for as long as a button is held', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(controller: scroll, mode: MPScrollZoneMode.hold, children: _items(40)),
    );

    final TestGesture press = await tester.startGesture(tester.getCenter(_forwardButton()));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    await press.up();
    await tester.pump();

    // 900 pixels a second for half a second, give or take a frame.
    expect(scroll.offset, closeTo(450, 30));
    await tester.pumpAndSettle();
  });

  testWidgets('answers a press too short to be a hold with one item', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(controller: scroll, mode: MPScrollZoneMode.hold, children: _items(40)),
    );

    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();

    expect(scroll.offset, closeTo(108, 2));
  });

  testWidgets('leaves the wheel to the page unless it is asked for', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(controller: scroll, buttons: MPScrollZoneButtons.none, children: _items(10)),
    );

    final TestPointer wheel = TestPointer(1, PointerDeviceKind.mouse);
    await tester.sendEventToBinding(wheel.hover(tester.getCenter(find.byType(MPScrollZone))));
    await tester.sendEventToBinding(wheel.scroll(const Offset(0, 100)));
    await tester.pumpAndSettle();

    expect(scroll.offset, 0);
  });

  testWidgets('turns the wheel onto its own axis when it is', (WidgetTester tester) async {
    await _pump(
      tester,
      MPScrollZone(
        controller: scroll,
        wheel: true,
        buttons: MPScrollZoneButtons.none,
        children: _items(10),
      ),
    );

    final TestPointer wheel = TestPointer(1, PointerDeviceKind.mouse);
    await tester.sendEventToBinding(wheel.hover(tester.getCenter(find.byType(MPScrollZone))));
    await tester.sendEventToBinding(wheel.scroll(const Offset(0, 100)));
    await tester.pumpAndSettle();

    expect(scroll.offset, 100);
  });

  testWidgets('runs the other way under right-to-left text', (WidgetTester tester) async {
    await _pump(
      tester,
      Directionality(
        textDirection: TextDirection.rtl,
        child: MPScrollZone(controller: scroll, children: _items(10)),
      ),
    );

    expect(
      tester.getTopRight(find.byKey(const Key('item0'))).dx,
      greaterThan(tester.getTopRight(find.byKey(const Key('item1'))).dx),
    );

    await tester.tap(_forwardButton());
    await tester.pumpAndSettle();
    expect(scroll.offset, 108);
  });
}

Finder _forwardButton() => find.byWidgetPredicate(
  (Widget widget) => widget is MPButton && widget.semanticLabel == 'Scroll forward',
);

Finder _backButton() => find.byWidgetPredicate(
  (Widget widget) => widget is MPButton && widget.semanticLabel == 'Scroll back',
);
