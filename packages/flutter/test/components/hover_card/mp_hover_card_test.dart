import 'package:flutter/gestures.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// Reached directly rather than through the barrel while the other components
// are being written beside this one.
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/hover_card/mp_hover_card.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// `.mp-hover-card` becomes the card's text on the screen, the padding a
/// computed style reports becomes the laid-out distance between the card's
/// edge and its text, and `aria-labelledby` becomes the heading the card
/// carries.

const Widget _trigger = SizedBox(width: 120, height: 24, child: Text('Priya Raman'));

Widget _card({
  Widget? title = const Text('Priya'),
  Widget? description,
  Widget? child,
  MPSide side = MPSide.bottom,
  bool arrow = false,
  bool? open,
  Duration? delay = Duration.zero,
  Duration? closeDelay = Duration.zero,
  ValueChanged<bool>? onOpenChange,
  double? width,
  MPSize? size,
  MPDensity? density,
  AlignmentGeometry alignment = Alignment.center,
}) {
  return host(
    Align(
      alignment: alignment,
      child: MPHoverCard(
        trigger: _trigger,
        title: title,
        description: description,
        side: side,
        arrow: arrow,
        open: open,
        delay: delay,
        closeDelay: closeDelay,
        onOpenChange: onOpenChange,
        width: width,
        size: size,
        density: density,
        child: child,
      ),
    ),
    overlay: true,
  );
}

/// Rests a mouse on the trigger, and hands it back so a test can move it on.
Future<TestGesture> _rest(WidgetTester tester) async {
  final TestGesture pointer = await tester.createGesture(kind: PointerDeviceKind.mouse);
  addTearDown(pointer.removePointer);
  await pointer.addPointer(location: Offset.zero);
  await pointer.moveTo(tester.getCenter(find.text('Priya Raman')));
  await tester.pump();

  return pointer;
}

/// The card's own surface, the box with a fill round [text].
Finder _surface(String text) {
  return find.ancestor(of: find.text(text), matching: find.byType(DecoratedBox)).first;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('draws nothing until the pointer rests on the trigger', (WidgetTester tester) async {
    await tester.pumpWidget(_card());
    await tester.pumpAndSettle();

    expect(find.text('Priya'), findsNothing);
  });

  testWidgets('opens on a rest and closes when the pointer leaves', (WidgetTester tester) async {
    await tester.pumpWidget(_card());
    final TestGesture pointer = await _rest(tester);
    await tester.pumpAndSettle();

    expect(find.text('Priya'), findsOneWidget);

    await pointer.moveTo(const Offset(1, 1));
    await tester.pumpAndSettle();

    expect(find.text('Priya'), findsNothing);
  });

  testWidgets('waits Base UI’s 600ms before opening and 300ms before closing', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_card(delay: null, closeDelay: null));
    final TestGesture pointer = await _rest(tester);

    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Priya'), findsNothing);

    await tester.pump(const Duration(milliseconds: 200));
    await tester.pumpAndSettle();
    expect(find.text('Priya'), findsOneWidget);

    await pointer.moveTo(const Offset(1, 1));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Priya'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 200));
    await tester.pumpAndSettle();
    expect(find.text('Priya'), findsNothing);
  });

  testWidgets('is reachable: the pointer can cross into it', (WidgetTester tester) async {
    // The whole difference from a tooltip, which the pointer never reaches.
    await tester.pumpWidget(
      _card(closeDelay: const Duration(milliseconds: 200), child: const Text('Platform team')),
    );
    final TestGesture pointer = await _rest(tester);
    await tester.pumpAndSettle();

    await pointer.moveTo(tester.getBottomLeft(find.text('Priya Raman')) + const Offset(4, 4));
    await tester.pump(const Duration(milliseconds: 50));
    await pointer.moveTo(tester.getCenter(find.text('Platform team')));
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();

    expect(find.text('Platform team'), findsOneWidget);
  });

  testWidgets('says when it opens and closes', (WidgetTester tester) async {
    final List<bool> reported = <bool>[];
    await tester.pumpWidget(_card(onOpenChange: reported.add));
    final TestGesture pointer = await _rest(tester);
    await tester.pumpAndSettle();
    await pointer.moveTo(const Offset(1, 1));
    await tester.pumpAndSettle();

    expect(reported, <bool>[true, false]);
  });

  testWidgets('holds open when it is told to, whatever the pointer does', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_card(open: true, title: const Text('Priya Raman, again')));
    await tester.pumpAndSettle();

    expect(find.text('Priya Raman, again'), findsOneWidget);
  });

  testWidgets('opens on the keyboard’s focus and closes on Escape', (WidgetTester tester) async {
    final FocusNode node = FocusNode();
    addTearDown(node.dispose);

    await tester.pumpWidget(
      host(
        MPHoverCard(
          trigger: Focus(focusNode: node, child: _trigger),
          title: const Text('Priya'),
          delay: Duration.zero,
        ),
        overlay: true,
      ),
    );
    node.requestFocus();
    await tester.pumpAndSettle();
    expect(find.text('Priya'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();

    expect(find.text('Priya'), findsNothing);
  });

  testWidgets('stays open while the keyboard moves into it', (WidgetTester tester) async {
    final FocusNode trigger = FocusNode();
    final FocusNode inside = FocusNode();
    addTearDown(trigger.dispose);
    addTearDown(inside.dispose);

    await tester.pumpWidget(
      host(
        MPHoverCard(
          trigger: Focus(focusNode: trigger, child: _trigger),
          title: const Text('Priya'),
          delay: Duration.zero,
          closeDelay: Duration.zero,
          child: Focus(focusNode: inside, child: const Text('Platform team')),
        ),
        overlay: true,
      ),
    );
    trigger.requestFocus();
    await tester.pumpAndSettle();

    inside.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Platform team'), findsOneWidget);
  });

  group('the surface', () {
    testWidgets('is surfaceContainer at elevation 2, with the medium corner', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_card(open: true));
      await tester.pumpAndSettle();

      final BoxDecoration card =
          tester.widget<DecoratedBox>(_surface('Priya')).decoration as BoxDecoration;

      expect(card.color, light.surfaceContainer);
      expect(card.boxShadow, MPShadows.of(2));
      expect(card.borderRadius, BorderRadius.circular(12));
    });

    testWidgets('sets the title in the sheet title and the line in bodySmall', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_card(open: true, description: const Text('Platform team')));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Priya').fontSize, 16);
      expect(styleOf(tester, 'Platform team').fontSize, 12);
      expect(styleOf(tester, 'Platform team').color, light.onSurfaceVariant);
    });

    testWidgets('draws no header when there is nothing to put in it', (WidgetTester tester) async {
      await tester.pumpWidget(_card(open: true, title: null, child: const Text('Just a body')));
      await tester.pumpAndSettle();

      final Rect card = tester.getRect(_surface('Just a body'));
      final Rect body = tester.getRect(find.text('Just a body'));

      // The body starts one padding in, with no header's gap above it.
      expect(body.top - card.top, moreOrLessEquals(16));
    });

    testWidgets('takes a width over the one `size` implies', (WidgetTester tester) async {
      await tester.pumpWidget(
        _card(open: true, width: 240, child: Text('A long line of preview text ' * 4)),
      );
      await tester.pumpAndSettle();

      expect(tester.getSize(_surface('Priya')).width, lessThanOrEqualTo(240));
    });

    testWidgets('caps its width by size, one rung wider than a popover', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_card(open: true, child: Text('A long line of preview text ' * 6)));
      await tester.pumpAndSettle();

      expect(tester.getSize(_surface('Priya')).width, 384);
    });

    testWidgets('tightens the room inside with `density`', (WidgetTester tester) async {
      double padding() =>
          tester.getTopLeft(find.text('Priya')).dy - tester.getTopLeft(_surface('Priya')).dy;

      await tester.pumpWidget(_card(open: true));
      await tester.pumpAndSettle();
      final double loose = padding();

      await tester.pumpWidget(_card(open: true, density: -2));
      await tester.pumpAndSettle();

      expect(padding(), lessThan(loose));
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            size: MPSize.xs,
            child: const MPHoverCard(trigger: _trigger, title: Text('Priya'), open: true),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      // `xs` sets the title in titleSmall.
      expect(styleOf(tester, 'Priya').fontSize, 14);
    });

    testWidgets('draws the wedge only when it is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(_card(open: true));
      await tester.pumpAndSettle();
      expect(find.byType(MPPopupArrow), findsNothing);

      await tester.pumpWidget(_card(open: true, arrow: true));
      await tester.pumpAndSettle();
      expect(find.byType(MPPopupArrow), findsOneWidget);
    });
  });

  group('placement', () {
    testWidgets('sits below the trigger by default, eight pixels off', (WidgetTester tester) async {
      await tester.pumpWidget(_card(open: true));
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(_surface('Priya')).dy - tester.getBottomLeft(find.text('Priya Raman')).dy,
        moreOrLessEquals(8),
      );
    });

    testWidgets('opens where it is told to, and flips when there is no room', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_card(open: true, side: MPSide.top));
      await tester.pumpAndSettle();

      expect(
        tester.getBottomLeft(_surface('Priya')).dy,
        lessThan(tester.getTopLeft(find.text('Priya Raman')).dy),
      );

      await tester.pumpWidget(_card(open: true, side: MPSide.top, alignment: Alignment.topCenter));
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(_surface('Priya')).dy,
        greaterThan(tester.getBottomLeft(find.text('Priya Raman')).dy),
      );
    });
  });

  group('accessibility', () {
    testWidgets('marks its title as a heading', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(_card(open: true, title: const Text('Priya Raman, card')));
      await tester.pumpAndSettle();

      final SemanticsNode? title = semanticsNodeLabelled(tester, 'Priya Raman, card');

      expect(title, isNotNull);
      expect(title!.getSemanticsData().flagsCollection.isHeader, isTrue);

      handle.dispose();
    });
  });
}
