import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_fade/mp_animate_fade.dart';
// Reached directly: the opacity a fade paints with is the library talking to
// itself, and the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads `--_mp-anim-duration` off an element; a widget test
/// moves the clock and reads the opacity the fade is painting with.

/// Every opacity the fade is painting with, in tree order: one for the box,
/// or one per child of a staggered set.
List<double> _opacities(WidgetTester tester) {
  return tester
      .widgetList<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateFade), matching: find.byType(MPAnimateOpacity)),
      )
      .map((MPAnimateOpacity widget) => widget.opacity)
      .toList();
}

double _opacity(WidgetTester tester) => _opacities(tester).single;

/// Moves the clock on [time] a frame at a time, as an app draws it. One long
/// pump would hand a pass that ended halfway through the jump its whole
/// overshoot, and a delay that ran out inside it none of the time after.
Future<void> _advance(WidgetTester tester, Duration time) async {
  const Duration frame = Duration(milliseconds: 10);

  for (Duration gone = Duration.zero; gone < time; gone += frame) {
    await tester.pump(frame);
  }
}

void main() {
  group('rendering', () {
    testWidgets('holds its child at the start opacity on the first frame', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('Arriving'))));

      expect(_opacity(tester), 0);
      expect(find.text('Arriving'), findsOneWidget);
    });

    testWidgets('arrives at full opacity and stays there', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('Arriving'))));
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });

    testWidgets('adds no opacity layer once it has arrived', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('Arriving'))));
      await tester.pumpAndSettle();

      expect(tester.layers.whereType<OpacityLayer>(), isEmpty);
    });

    testWidgets('is read out while it waits to come in', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPAnimateFade(delay: Duration(seconds: 1), child: Text('Arriving'))),
      );

      // At 0 while it waits out its delay, and still read, as CSS `opacity: 0`
      // leaves an element in the accessibility tree.
      expect(_opacity(tester), 0);
      expect(semanticsLabels(tester), contains('Arriving'));

      await tester.pumpAndSettle();
      handle.dispose();
    });
  });

  group('duration', () {
    testWidgets('takes medium2 when nobody said', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('Arriving'))));
      await tester.pump();
      await tester.pump(MPMotion.medium2 - const Duration(milliseconds: 50));

      expect(_opacity(tester), lessThan(1));

      await tester.pump(const Duration(milliseconds: 60));

      expect(_opacity(tester), 1);
    });

    testWidgets('is quicker leaving than arriving', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(mode: MPAnimateMode.exit, child: Text('Leaving'))),
      );
      await tester.pump();
      await tester.pump(MPMotion.short4 + const Duration(milliseconds: 10));

      expect(_opacity(tester), 0);
    });

    testWidgets('lets a duration win', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(duration: Duration(seconds: 2), child: Text('Arriving'))),
      );
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));

      expect(_opacity(tester), allOf(greaterThan(0), lessThan(1)));
    });
  });

  group('easing', () {
    testWidgets('decelerates into place by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(duration: Duration(seconds: 1), child: Text('Arriving'))),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      expect(_opacity(tester), closeTo(MPMotion.emphasizedDecelerate.transform(0.5), 0.02));
    });

    testWidgets('takes a Material curve by name', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(
            duration: Duration(seconds: 1),
            easing: MPEasing.linear,
            child: Text('Arriving'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      expect(_opacity(tester), closeTo(0.5, 0.02));
    });
  });

  group('mode', () {
    testWidgets('leaves by running the entrance backwards, and is held there', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(mode: MPAnimateMode.exit, child: Text('Leaving'))),
      );

      expect(_opacity(tester), 1);

      await tester.pumpAndSettle();

      expect(_opacity(tester), 0);
      expect(find.text('Leaving'), findsOneWidget);
    });

    testWidgets('turns the curve round with it, so it leaves accelerating', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(
            mode: MPAnimateMode.exit,
            duration: Duration(seconds: 1),
            child: Text('Leaving'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // A reversed decelerate is slow to start, so most of it is still there.
      expect(_opacity(tester), greaterThan(0.8));
    });
  });

  group('from', () {
    testWidgets('starts from nothing', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('Arriving'))));

      expect(_opacity(tester), 0);
    });

    testWidgets('can be floored, for content that should never be completely gone', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPAnimateFade(from: 0.4, child: Text('Arriving'))));

      expect(_opacity(tester), closeTo(0.4, 0.001));
    });
  });

  group('trigger', () {
    testWidgets('waits on its own first frame under manual control', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(trigger: MPAnimateTrigger.manual, child: Text('Arriving'))),
      );
      await tester.pump(const Duration(seconds: 1));

      expect(_opacity(tester), 0);
    });

    testWidgets('runs when `play` goes up, and again on every rise after', (
      WidgetTester tester,
    ) async {
      Widget fade(bool play) {
        return host(
          MPAnimateFade(trigger: MPAnimateTrigger.manual, play: play, child: const Text('A')),
        );
      }

      await tester.pumpWidget(fade(true));
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);

      // Down holds where it is, as a paused keyframe does.
      await tester.pumpWidget(fade(false));
      await tester.pump();

      expect(_opacity(tester), 1);

      // Up again rewinds before the paint, without rebuilding the child.
      await tester.pumpWidget(fade(true));

      expect(_opacity(tester), 0);

      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });

    testWidgets('keeps what is inside alive across a replay', (WidgetTester tester) async {
      final GlobalKey<State<StatefulWidget>> inside = GlobalKey();

      Widget fade(bool play) {
        return host(
          MPAnimateFade(
            trigger: MPAnimateTrigger.manual,
            play: play,
            child: _Counter(key: inside),
          ),
        );
      }

      await tester.pumpWidget(fade(true));
      final State<StatefulWidget> before = inside.currentState!;

      await tester.pumpWidget(fade(false));
      await tester.pumpWidget(fade(true));
      await tester.pumpAndSettle();

      expect(inside.currentState, same(before));
    });

    testWidgets('starts on the pointer when it is a hover trigger', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(
            trigger: MPAnimateTrigger.hover,
            child: SizedBox(width: 100, height: 40, child: Text('Hover')),
          ),
        ),
      );
      await tester.pump(const Duration(seconds: 1));

      expect(_opacity(tester), 0);

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);

      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Hover')));
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);

      await mouse.removePointer();
    });

    testWidgets('starts when the focus lands inside a hover trigger', (WidgetTester tester) async {
      final FocusNode node = FocusNode();

      addTearDown(node.dispose);

      await tester.pumpWidget(
        host(
          MPAnimateFade(
            trigger: MPAnimateTrigger.hover,
            child: Focus(focusNode: node, child: const Text('Focus')),
          ),
        ),
      );
      await tester.pump(const Duration(seconds: 1));

      expect(_opacity(tester), 0);

      node.requestFocus();
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });

    testWidgets('waits to be scrolled into view when it is a visible trigger', (
      WidgetTester tester,
    ) async {
      final ScrollController page = ScrollController();

      addTearDown(page.dispose);

      await tester.pumpWidget(
        host(
          SingleChildScrollView(
            controller: page,
            child: const Column(
              children: <Widget>[
                SizedBox(height: 800),
                MPAnimateFade(
                  trigger: MPAnimateTrigger.visible,
                  child: SizedBox(height: 100, child: Text('Below')),
                ),
                SizedBox(height: 800),
              ],
            ),
          ),
          width: 300,
          height: 400,
        ),
      );
      await tester.pump(const Duration(seconds: 1));

      expect(_opacity(tester), 0);

      page.jumpTo(600);
      await pumpScrolled(tester);
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });

    testWidgets('runs at once with no scrollable to watch', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAnimateFade(trigger: MPAnimateTrigger.visible, child: Text('Here'))),
      );
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });
  });

  group('paused', () {
    testWidgets('holds the animation where it is without unwinding it', (
      WidgetTester tester,
    ) async {
      Widget fade(bool paused) {
        return host(
          MPAnimateFade(
            paused: paused,
            duration: const Duration(seconds: 1),
            easing: MPEasing.linear,
            child: const Text('A'),
          ),
        );
      }

      await tester.pumpWidget(fade(false));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));

      final double held = _opacity(tester);

      await tester.pumpWidget(fade(true));
      await tester.pump(const Duration(seconds: 2));

      expect(_opacity(tester), closeTo(held, 0.05));

      await tester.pumpWidget(fade(false));
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });
  });

  group('repeat', () {
    testWidgets('runs once', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('A'))));
      await tester.pumpAndSettle();

      expect(await redrawsIn(tester), isFalse);
    });

    testWidgets('never stops on `null`', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateFade(repeat: null, child: Text('A'))));
      await tester.pump(const Duration(seconds: 5));

      expect(tester.binding.hasScheduledFrame, isTrue);

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('returns instead of jumping with `alternate`', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(
            repeat: 2,
            alternate: true,
            easing: MPEasing.linear,
            duration: Duration(seconds: 1),
            child: Text('A'),
          ),
        ),
      );
      await tester.pump();
      await _advance(tester, const Duration(milliseconds: 1500));

      expect(_opacity(tester), closeTo(0.5, 0.05));

      await tester.pumpAndSettle();

      // Two passes, the second backwards, end where the first began.
      expect(_opacity(tester), 0);
    });
  });

  group('stagger', () {
    Widget set({
      Duration stagger = const Duration(milliseconds: 100),
      Duration durationStep = Duration.zero,
      bool reverse = false,
    }) {
      return host(
        MPAnimateFade(
          stagger: stagger,
          durationStep: durationStep,
          reverse: reverse,
          duration: const Duration(milliseconds: 100),
          easing: MPEasing.linear,
          children: const <Widget>[Text('One'), Text('Two'), Text('Three')],
        ),
      );
    }

    testWidgets('runs the effect on each child, held back by its position', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(set());
      await tester.pump();
      await _advance(tester, const Duration(milliseconds: 150));

      final List<double> opacities = _opacities(tester);

      // One opacity per child and none for the box.
      expect(opacities, hasLength(3));
      expect(opacities[0], 1);
      expect(opacities[1], closeTo(0.5, 0.1));
      expect(opacities[2], 0);

      await tester.pumpAndSettle();

      expect(_opacities(tester), <double>[1, 1, 1]);
    });

    testWidgets('counts from the end when reversed, each child still forwards', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(set(reverse: true));
      await tester.pump();
      await _advance(tester, const Duration(milliseconds: 150));

      final List<double> opacities = _opacities(tester);

      expect(opacities[0], 0);
      expect(opacities[2], 1);
    });

    testWidgets('steps the duration through the set, never below nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        set(stagger: const Duration(milliseconds: 1), durationStep: const Duration(seconds: -1)),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 20));

      // The first child takes 100ms, the rest a clamped zero.
      final List<double> opacities = _opacities(tester);

      expect(opacities[0], lessThan(1));
      expect(opacities[1], 1);
      expect(opacities[2], 1);

      await tester.pumpAndSettle();
    });

    testWidgets('holds the whole set with one pause', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(
            paused: true,
            stagger: Duration(milliseconds: 50),
            children: <Widget>[Text('One'), Text('Two')],
          ),
        ),
      );
      await tester.pump(const Duration(seconds: 1));

      expect(_opacities(tester), <double>[0, 0]);
    });

    testWidgets('animates the box again at a stagger of nought', (WidgetTester tester) async {
      await tester.pumpWidget(set(stagger: Duration.zero));

      expect(_opacities(tester), hasLength(1));
      expect(find.text('Two'), findsOneWidget);
    });

    testWidgets('lays the set out with the builder it was given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPAnimateFade(
            stagger: const Duration(milliseconds: 50),
            layoutBuilder: (BuildContext context, List<Widget> children) {
              return Row(mainAxisSize: MainAxisSize.min, children: children);
            },
            children: const <Widget>[Text('One'), Text('Two')],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getTopLeft(find.text('One')).dy, tester.getTopLeft(find.text('Two')).dy);
      expect(
        tester.getTopLeft(find.text('Two')).dx,
        greaterThan(tester.getTopLeft(find.text('One')).dx),
      );
    });
  });

  group('reduced motion', () {
    testWidgets('is simply there, even before its trigger', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(trigger: MPAnimateTrigger.manual, child: Text('A')),
          disableAnimations: true,
        ),
      );

      expect(_opacity(tester), 1);
      expect(await redrawsIn(tester), isFalse);
    });

    testWidgets('leaves an exit there too, as `animation: none` does', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateFade(mode: MPAnimateMode.exit, child: Text('A')),
          disableAnimations: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });

    testWidgets('starts from the beginning once movement is given back', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPAnimateFade(child: Text('A')), disableAnimations: true));

      expect(_opacity(tester), 1);

      await tester.pumpWidget(host(const MPAnimateFade(child: Text('A'))));

      expect(_opacity(tester), 0);

      await tester.pumpAndSettle();

      expect(_opacity(tester), 1);
    });
  });
}

class _Counter extends StatefulWidget {
  const _Counter({super.key});

  @override
  State<_Counter> createState() => _CounterState();
}

class _CounterState extends State<_Counter> {
  @override
  Widget build(BuildContext context) => const Text('Inside');
}
