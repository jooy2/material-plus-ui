import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// Reached directly rather than through the barrel while the other components
// are being written beside this one: a compile error in any of them would
// otherwise stop this suite too.
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/tooltip/mp_tooltip.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// `getByRole('tooltip')` becomes the plate's text on the screen, the
/// `--_mp-tooltip` slot becomes the [BoxDecoration] the plate built, and
/// `aria-describedby` becomes the tooltip the trigger's own semantics node
/// carries.

Widget _tooltip({
  MPSide side = MPSide.top,
  MPAlign align = MPAlign.center,
  MPSize size = MPSize.sm,
  MPColor? color,
  bool arrow = true,
  bool disabled = false,
  bool? open,
  bool initialOpen = false,
  Duration? delay = const Duration(milliseconds: 600),
  ValueChanged<bool>? onOpenChange,
  Widget content = const Text('Copy'),
  TextDirection textDirection = TextDirection.ltr,
  Brightness brightness = Brightness.light,
}) {
  return host(
    Center(
      child: MPTooltip(
        content: content,
        size: size,
        color: color,
        side: side,
        align: align,
        arrow: arrow,
        disabled: disabled,
        open: open,
        initialOpen: initialOpen,
        delay: delay,
        onOpenChange: onOpenChange,
        child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
      ),
    ),
    overlay: true,
    textDirection: textDirection,
    brightness: brightness,
  );
}

/// Rests the pointer on the trigger, and hands back the gesture so a test can
/// take it away again.
Future<TestGesture> _rest(WidgetTester tester, [String on = 'Trigger']) async {
  final TestGesture pointer = await tester.createGesture(kind: PointerDeviceKind.mouse);
  addTearDown(pointer.removePointer);
  await pointer.addPointer(location: Offset.zero);
  await pointer.moveTo(tester.getCenter(find.text(on)));
  await tester.pump();

  return pointer;
}

/// The plate's own surface: the box with a fill round the tooltip's words.
BoxDecoration _plateOf(WidgetTester tester, String words) {
  return tester
      .widgetList<DecoratedBox>(
        find.ancestor(of: find.text(words), matching: find.byType(DecoratedBox)),
      )
      .map((DecoratedBox box) => box.decoration)
      .whereType<BoxDecoration>()
      .firstWhere((BoxDecoration decoration) => decoration.color != null);
}

/// The nodes a screen reader can land on, in tree order: every node below the
/// root that is not merged into the one above it.
List<SemanticsNode> _stops(WidgetTester tester) {
  final List<SemanticsNode> stops = <SemanticsNode>[];

  bool visit(SemanticsNode node) {
    if (!node.isMergedIntoParent) {
      stops.add(node);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return stops;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();
  final MPColorScheme dark = MPColorScheme.fromSource(brightness: Brightness.dark);

  group('the trigger', () {
    testWidgets('adds no box and no focus stop of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPTooltip(
            content: const Text('Copy'),
            child: MPButton(onPressed: () {}, child: const Text('Copy it')),
          ),
          overlay: true,
        ),
      );

      // The tooltip is exactly the size of the button it wraps.
      expect(tester.getSize(find.byType(MPTooltip)), tester.getSize(find.byType(MPButton)));
    });

    testWidgets('draws nothing until it is asked', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip());
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });
  });

  group('the plate', () {
    testWidgets('reads the inverse surface unless an accent is asked for', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_tooltip(initialOpen: true));
      await tester.pumpAndSettle();

      expect(_plateOf(tester, 'Copy').color, light.inverseSurface);
      expect(styleOf(tester, 'Copy').color, light.inverseOnSurface);
    });

    testWidgets('turns over with the scheme, dark on light and light on dark', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_tooltip(initialOpen: true, brightness: Brightness.dark));
      await tester.pumpAndSettle();

      expect(_plateOf(tester, 'Copy').color, dark.inverseSurface);
    });

    testWidgets('takes an accent fill when one is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(initialOpen: true, color: MPColor.error));
      await tester.pumpAndSettle();

      expect(_plateOf(tester, 'Copy').color, light.error);
      expect(styleOf(tester, 'Copy').color, light.onError);
    });

    testWidgets('has the extra-small corner and no shadow', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(initialOpen: true));
      await tester.pumpAndSettle();

      final BoxDecoration plate = _plateOf(tester, 'Copy');

      expect(plate.borderRadius, BorderRadius.circular(4));
      expect(plate.boxShadow, isNull);
    });

    testWidgets('is MD3’s plain tooltip at sm: 24 tall, bodySmall', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(initialOpen: true));
      await tester.pumpAndSettle();

      final RenderParagraph text = tester.renderObject<RenderParagraph>(find.text('Copy'));

      expect(text.text.style?.fontSize, 12);
      expect(
        tester
            .getSize(find.ancestor(of: find.text('Copy'), matching: find.byType(DecoratedBox)))
            .height,
        24,
      );
    });

    testWidgets('grows its padding and type up the ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(_tooltip(initialOpen: true, size: size));
        await tester.pumpAndSettle();
        heights.add(
          tester
              .getSize(
                find.ancestor(of: find.text('Copy'), matching: find.byType(DecoratedBox)).first,
              )
              .height,
        );
      }

      for (int i = 1; i < heights.length; i += 1) {
        expect(heights[i], greaterThanOrEqualTo(heights[i - 1]));
      }

      expect(heights.first, lessThan(heights.last));
    });

    testWidgets('wraps a long phrase at 256', (WidgetTester tester) async {
      await tester.pumpWidget(
        _tooltip(
          initialOpen: true,
          content: Text('A phrase long enough to need more than one line ' * 4),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getSize(find.byType(DecoratedBox).last).width, lessThanOrEqualTo(256));
    });

    testWidgets('draws the wedge by default, and drops it when asked', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(initialOpen: true));
      await tester.pumpAndSettle();

      expect(find.byType(MPPopupArrow), findsOneWidget);

      await tester.pumpWidget(_tooltip(initialOpen: true, arrow: false));
      await tester.pumpAndSettle();

      expect(find.byType(MPPopupArrow), findsNothing);
    });
  });

  group('open state', () {
    testWidgets('stays shut until asked, when controlled', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(open: false, delay: Duration.zero));
      await _rest(tester);
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('opens when the controlled value says so', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(open: true));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('waits out the delay before it appears', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip());
      await _rest(tester);

      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Copy'), findsNothing);

      await tester.pump(const Duration(milliseconds: 400));
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('waits Base UI’s 600ms when no delay is given', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(delay: null));
      await _rest(tester);

      await tester.pump(const Duration(milliseconds: 550));
      expect(find.text('Copy'), findsNothing);

      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('reports both ways round on hover', (WidgetTester tester) async {
      final List<bool> reported = <bool>[];
      await tester.pumpWidget(_tooltip(delay: Duration.zero, onOpenChange: reported.add));

      final TestGesture pointer = await _rest(tester);
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsOneWidget);

      await pointer.moveTo(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
      expect(reported, <bool>[true, false]);
    });

    testWidgets('stays up while the pointer crosses onto the plate', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(delay: Duration.zero));
      final TestGesture pointer = await _rest(tester);
      await tester.pumpAndSettle();

      await pointer.moveTo(tester.getTopLeft(find.text('Trigger')) + const Offset(10, -3));
      await tester.pump();
      await pointer.moveTo(tester.getCenter(find.text('Copy')));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('closes on a press of the trigger', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(delay: Duration.zero));
      final TestGesture pointer = await _rest(tester);
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsOneWidget);

      await pointer.down(tester.getCenter(find.text('Trigger')));
      await tester.pump();
      await pointer.up();
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('never opens while disabled, and leaves the trigger alone', (
      WidgetTester tester,
    ) async {
      int pressed = 0;
      await tester.pumpWidget(
        host(
          MPTooltip(
            content: const Text('Copy'),
            delay: Duration.zero,
            disabled: true,
            child: MPButton(onPressed: () => pressed += 1, child: const Text('Trigger')),
          ),
          overlay: true,
        ),
      );
      await _rest(tester);
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);

      // A slow press, past the long-press timeout, still reaches the button.
      final TestGesture finger = await tester.startGesture(tester.getCenter(find.byType(MPButton)));
      await tester.pump(const Duration(seconds: 1));
      await finger.up();
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('switched off while it is up, it closes and says so once', (
      WidgetTester tester,
    ) async {
      final List<bool> reported = <bool>[];
      await tester.pumpWidget(_tooltip(delay: Duration.zero, onOpenChange: reported.add));
      await _rest(tester);
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _tooltip(delay: Duration.zero, disabled: true, onOpenChange: reported.add),
      );
      await tester.pumpAndSettle();
      await tester.pumpWidget(
        _tooltip(delay: Duration.zero, disabled: true, onOpenChange: reported.add),
      );
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
      expect(reported, <bool>[true, false]);
    });

    testWidgets('a long press is the touch screen’s way in', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip());

      await tester.longPress(find.text('Trigger'));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);

      // And it stays a moment after the finger lifts, then goes.
      await tester.pump(const Duration(seconds: 2));
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsNothing);
    });
  });

  group('the keyboard', () {
    Widget focusable(FocusNode node) {
      return host(
        Center(
          child: MPTooltip(
            content: const Text('Copy'),
            delay: Duration.zero,
            child: Focus(
              focusNode: node,
              child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
            ),
          ),
        ),
        overlay: true,
      );
    }

    testWidgets('opens on focus and closes on Escape', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(focusable(node));
      node.requestFocus();
      await tester.pumpAndSettle();
      expect(find.text('Copy'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('keeps what the keyboard opened when the pointer brushes past', (
      WidgetTester tester,
    ) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(focusable(node));
      node.requestFocus();
      await tester.pumpAndSettle();

      final TestGesture pointer = await _rest(tester);
      await tester.pumpAndSettle();
      await pointer.moveTo(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('does not open on a focus that a press brought', (WidgetTester tester) async {
      final FocusNode node = FocusNode();
      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          Center(
            child: MPTooltip(
              content: const Text('Copy'),
              delay: Duration.zero,
              child: GestureDetector(
                onTapDown: (_) => node.requestFocus(),
                child: Focus(
                  focusNode: node,
                  child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
                ),
              ),
            ),
          ),
          overlay: true,
        ),
      );

      // A finger, so nothing rests on the trigger before the press.
      await tester.tap(find.text('Trigger'));
      await tester.pumpAndSettle();

      expect(node.hasFocus, isTrue);
      expect(find.text('Copy'), findsNothing);
    });
  });

  group('placement', () {
    testWidgets('sits above the trigger by default, and below when asked', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_tooltip(open: true));
      await tester.pumpAndSettle();

      expect(
        tester.getBottomLeft(find.text('Copy')).dy,
        lessThan(tester.getTopLeft(find.text('Trigger')).dy),
      );

      await tester.pumpWidget(_tooltip(open: true, side: MPSide.bottom));
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(find.text('Copy')).dy,
        greaterThan(tester.getBottomLeft(find.text('Trigger')).dy),
      );
    });

    testWidgets('stands six pixels off the trigger', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(open: true));
      await tester.pumpAndSettle();

      final Rect plate = tester.getRect(
        find.ancestor(of: find.text('Copy'), matching: find.byType(DecoratedBox)).first,
      );

      expect(tester.getTopLeft(find.text('Trigger')).dy - plate.bottom, moreOrLessEquals(6));
    });

    testWidgets('the wedge sits in the gap, pointing at the trigger', (WidgetTester tester) async {
      await tester.pumpWidget(_tooltip(open: true, size: MPSize.xl));
      await tester.pumpAndSettle();

      final Rect wedge = tester.getRect(
        find.descendant(of: find.byType(MPPopupArrow), matching: find.byType(CustomPaint)).last,
      );
      final Rect plate = tester.getRect(
        find.ancestor(of: find.text('Copy'), matching: find.byType(DecoratedBox)).first,
      );

      expect(wedge.top, greaterThanOrEqualTo(plate.bottom - 1));
      expect(wedge.bottom, lessThanOrEqualTo(tester.getRect(find.text('Trigger')).top));
    });

    for (final TextDirection direction in TextDirection.values) {
      testWidgets('an align: start wedge points at the start of the trigger in $direction', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          _tooltip(
            open: true,
            align: MPAlign.start,
            content: const Text('Copy the link to this page'),
            textDirection: direction,
          ),
        );
        await tester.pumpAndSettle();

        final double wedge = tester
            .getRect(
              find
                  .descendant(of: find.byType(MPPopupArrow), matching: find.byType(CustomPaint))
                  .last,
            )
            .center
            .dx;
        final Rect trigger = tester.getRect(find.text('Trigger'));

        expect(wedge, inInclusiveRange(trigger.left, trigger.right));
        expect(
          wedge,
          direction == TextDirection.ltr
              ? lessThan(trigger.center.dx)
              : greaterThan(trigger.center.dx),
        );
      });
    }

    testWidgets('flips to the other side when there is no room', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          Align(
            alignment: Alignment.topCenter,
            child: MPTooltip(
              content: const Text('Copy'),
              open: true,
              child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(find.text('Copy')).dy,
        greaterThan(tester.getBottomLeft(find.text('Trigger')).dy),
      );
    });
  });

  group('reduced motion', () {
    testWidgets('appears in one frame', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          Center(
            child: MPTooltip(
              content: const Text('Copy'),
              open: true,
              child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
            ),
          ),
          overlay: true,
          disableAnimations: true,
        ),
      );
      // The frame that lifts the plate, and the one that places it.
      await tester.pump();
      await tester.pump();
      await tester.pump();

      final FadeTransition fade = tester.widget<FadeTransition>(
        find.ancestor(of: find.text('Copy'), matching: find.byType(FadeTransition)).first,
      );

      expect(fade.opacity.value, 1);
    });
  });

  group('accessibility', () {
    testWidgets('the trigger carries what the plate says', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(_tooltip());

      expect(tester.getSemantics(find.text('Trigger')), isSemantics(tooltip: 'Copy'));

      handle.dispose();
    });

    testWidgets('takes a label when the plate is not plain text', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(
          Center(
            child: MPTooltip(
              content: const Row(mainAxisSize: MainAxisSize.min, children: <Widget>[Text('⌘C')]),
              semanticLabel: 'Copy, Command C',
              child: const SizedBox(width: 80, height: 32, child: Text('Trigger')),
            ),
          ),
          overlay: true,
        ),
      );

      expect(tester.getSemantics(find.text('Trigger')), isSemantics(tooltip: 'Copy, Command C'));

      handle.dispose();
    });

    testWidgets('a button under it is one node, named by itself and described by the tooltip', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(
          Center(
            child: MPTooltip(
              content: const Text('Copy to clipboard'),
              child: MPButton(onPressed: () {}, semanticLabel: 'Copy'),
            ),
          ),
          overlay: true,
        ),
      );

      final List<SemanticsNode> stops = _stops(tester);

      expect(stops, hasLength(1));
      expect(
        stops.single,
        isSemantics(
          label: 'Copy',
          tooltip: 'Copy to clipboard',
          isButton: true,
          hasTapAction: true,
        ),
      );
      expect(stops.single.getSemanticsData().hasAction(SemanticsAction.longPress), isFalse);

      handle.dispose();
    });

    testWidgets('does not read the plate a second time', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(_tooltip(open: true));
      await tester.pumpAndSettle();

      expect(semanticsLabels(tester).where((String label) => label.contains('Copy')), isEmpty);

      handle.dispose();
    });

    testWidgets('switched off, says nothing about the control under it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        host(
          Center(
            child: MPTooltip(
              content: const Text('Delete'),
              disabled: true,
              child: MPButton(onPressed: () {}, child: const Text('Delete')),
            ),
          ),
          overlay: true,
        ),
      );

      expect(_stops(tester).where((SemanticsNode node) => node.tooltip.isNotEmpty), isEmpty);

      handle.dispose();
    });

    testWidgets('is switched off and on again without building the trigger again', (
      WidgetTester tester,
    ) async {
      Widget build({required bool disabled}) {
        return host(
          Center(
            child: MPTooltip(
              content: const Text('Copy the link'),
              disabled: disabled,
              child: MPButton(onPressed: () {}, child: const Text('Copy')),
            ),
          ),
          overlay: true,
        );
      }

      await tester.pumpWidget(build(disabled: false));
      final State before = tester.state(find.byType(MPButton));

      await tester.pumpWidget(build(disabled: true));
      expect(tester.state(find.byType(MPButton)), same(before));

      await tester.pumpWidget(build(disabled: false));
      expect(tester.state(find.byType(MPButton)), same(before));
    });
  });

  group('MPTooltipProvider', () {
    Widget pair({Duration timeout = const Duration(milliseconds: 400), Duration? delay}) {
      return host(
        MPTooltipProvider(
          timeout: timeout,
          delay: delay,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPTooltip(
                content: Text('First'),
                child: SizedBox(width: 60, height: 32, child: Text('One')),
              ),
              MPTooltip(
                content: Text('Second'),
                child: SizedBox(width: 60, height: 32, child: Text('Two')),
              ),
            ],
          ),
        ),
        overlay: true,
      );
    }

    testWidgets('a neighbour opens at once once one of them has', (WidgetTester tester) async {
      await tester.pumpWidget(pair());

      final TestGesture pointer = await _rest(tester, 'One');
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();
      expect(find.text('First'), findsOneWidget);

      await pointer.moveTo(tester.getCenter(find.text('Two')));
      await tester.pump();
      await tester.pumpAndSettle();

      expect(find.text('First'), findsNothing);
      expect(find.text('Second'), findsOneWidget);
    });

    testWidgets('hands its delay to the tooltips that do not set one', (WidgetTester tester) async {
      await tester.pumpWidget(pair(delay: const Duration(milliseconds: 100)));

      await _rest(tester, 'One');
      await tester.pump(const Duration(milliseconds: 150));
      await tester.pumpAndSettle();

      expect(find.text('First'), findsOneWidget);
    });
  });
}
