import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/scroll_area/mp_scroll_area.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads Base UI's bar elements and their classes. Here a bar
/// is a [RawScrollbar], and the questions are what it was told to draw.

Widget _tall() => const SizedBox(key: Key('content'), width: 200, height: 1000);

Iterable<RawScrollbar> _barsOf(WidgetTester tester) {
  return tester.widgetList<RawScrollbar>(find.byType(RawScrollbar));
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('draws a vertical bar and nothing else by default', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));

    expect(_barsOf(tester), hasLength(1));
    expect(find.byType(ColoredBox), findsNothing);
  });

  testWidgets('draws both when told to, and the corner between them', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPScrollArea(
          axis: MPScrollAxis.both,
          maxHeight: 200,
          child: SizedBox(width: 1000, height: 1000),
        ),
      ),
    );

    expect(_barsOf(tester), hasLength(2));
    expect(tester.widget<ColoredBox>(find.byType(ColoredBox)).color, light.surfaceContainer);
  });

  testWidgets('is a real scroll view', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));

    final double before = tester.getTopLeft(find.byKey(const Key('content'))).dy;
    await tester.drag(find.byType(MPScrollArea), const Offset(0, -300));
    await tester.pumpAndSettle();

    expect(tester.getTopLeft(find.byKey(const Key('content'))).dy, before - 300);
  });

  testWidgets('bounds the box with maxHeight, and shrinks to short content', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));
    expect(tester.getSize(find.byType(MPScrollArea)).height, 200);

    await tester.pumpWidget(
      host(width: 300, const MPScrollArea(maxHeight: 200, child: SizedBox(height: 50))),
    );
    expect(tester.getSize(find.byType(MPScrollArea)).height, 50);
  });

  testWidgets('takes a fixed height', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 300, const MPScrollArea(height: 160, child: SizedBox(height: 50))),
    );

    expect(tester.getSize(find.byType(MPScrollArea)).height, 160);
  });

  testWidgets('holds the bar open when asked, and shows it on hover otherwise', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(width: 300, MPScrollArea(maxHeight: 200, persistent: true, child: _tall())),
    );
    expect(_barsOf(tester).single.thumbVisibility, isTrue);

    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));
    expect(_barsOf(tester).single.thumbVisibility, isFalse);

    final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    addTearDown(mouse.removePointer);
    await mouse.addPointer(location: Offset.zero);
    await mouse.moveTo(tester.getCenter(find.byType(MPScrollArea)));
    await tester.pump();

    expect(_barsOf(tester).single.thumbVisibility, isTrue);
  });

  testWidgets('takes the thickness from size: 6 to 14 with the thumb inset by 2', (
    WidgetTester tester,
  ) async {
    final List<double?> thumbs = <double?>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(
        host(width: 300, MPScrollArea(size: size, maxHeight: 200, child: _tall())),
      );
      thumbs.add(_barsOf(tester).single.thickness);
    }

    expect(thumbs, <double>[2, 4, 6, 8, 10]);
    expect(_barsOf(tester).single.crossAxisMargin, 2);
  });

  testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        MPConfigProvider(
          size: MPSize.xl,
          child: MPScrollArea(maxHeight: 200, child: _tall()),
        ),
      ),
    );

    expect(_barsOf(tester).single.thickness, 10);
  });

  testWidgets('draws the thumb in onSurface at 38%', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));

    expect(
      _barsOf(tester).single.thumbColor,
      light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
    );
  });

  testWidgets('does not take room from the layout', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, MPScrollArea(maxHeight: 200, child: _tall())));

    // The bar is drawn over the content, which keeps the whole width.
    expect(tester.getSize(find.byKey(const Key('content'))).width, 300);
    expect(
      tester.getTopLeft(find.byKey(const Key('content'))).dx,
      tester.getTopLeft(find.byType(MPScrollArea)).dx,
    );
  });

  testWidgets('scrolls from the keyboard once it has the focus', (WidgetTester tester) async {
    final FocusNode before = FocusNode();
    addTearDown(before.dispose);

    await tester.pumpWidget(
      host(width: 300, afterFocusStop(before, MPScrollArea(maxHeight: 200, child: _tall()))),
    );
    before.requestFocus();
    await tester.pump();

    final double top = tester.getTopLeft(find.byKey(const Key('content'))).dy;

    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(holdsFocus(tester, find.byType(MPScrollArea)), isTrue);

    await tester.sendKeyEvent(LogicalKeyboardKey.end);
    await tester.pumpAndSettle();

    expect(tester.getTopLeft(find.byKey(const Key('content'))).dy, top - 800);
  });

  testWidgets('adds no tab stop while everything fits', (WidgetTester tester) async {
    final FocusNode before = FocusNode();
    addTearDown(before.dispose);

    await tester.pumpWidget(
      host(
        width: 300,
        afterFocusStop(before, const MPScrollArea(maxHeight: 200, child: SizedBox(height: 50))),
      ),
    );
    before.requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();

    expect(holdsFocus(tester, find.byType(MPScrollArea)), isFalse);
  });
}
