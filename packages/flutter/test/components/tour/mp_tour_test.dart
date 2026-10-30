import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/tour/mp_tour.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test measures `.mp-tour__scrim`'s box; here the scrim is a
/// painter, and the hole is asked of it directly: a point inside the hole is
/// somewhere the scrim does not paint.

final GlobalKey _one = GlobalKey(debugLabel: 'one');
final GlobalKey _two = GlobalKey(debugLabel: 'two');

List<MPTourStep> _steps() => <MPTourStep>[
  MPTourStep(target: _one, title: const Text('The first'), content: const Text('What it does.')),
  MPTourStep(target: _two, title: const Text('The second'), content: const Text('What that does.')),
  const MPTourStep(title: Text('The last'), content: Text('And you are done.')),
];

/// A page for the tour to stand over, with two things it can point at.
Widget _page({
  List<MPTourStep>? steps,
  bool? open,
  bool initialOpen = true,
  ValueChanged<bool>? onOpenChange,
  int? step,
  int initialStep = 0,
  ValueChanged<int>? onStepChange,
  VoidCallback? onFinish,
  bool scrim = true,
  bool skippable = true,
  bool dismissible = true,
  String? locale,
  Map<String, String>? labels,
  VoidCallback? onOne,
  double above = 0,
  bool disableAnimations = false,
  TextDirection textDirection = TextDirection.ltr,
}) {
  return host(
    Align(
      alignment: Alignment.topCenter,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          SizedBox(height: 40 + above),
          MPButton(key: _one, onPressed: onOne ?? () {}, child: const Text('One')),
          const SizedBox(height: 40),
          MPButton(key: _two, onPressed: () {}, child: const Text('Two')),
          MPTour(
            steps: steps ?? _steps(),
            open: open,
            initialOpen: initialOpen,
            onOpenChange: onOpenChange,
            step: step,
            initialStep: initialStep,
            onStepChange: onStepChange,
            onFinish: onFinish,
            scrim: scrim,
            skippable: skippable,
            dismissible: dismissible,
            locale: locale,
            labels: labels,
            scrollIntoView: false,
          ),
        ],
      ),
    ),
    width: 800,
    height: 600,
    overlay: true,
    disableAnimations: disableAnimations,
    textDirection: textDirection,
  );
}

/// The card, which is the box the step's words are written on.
Finder _card(String title) {
  return find.ancestor(of: find.text(title), matching: find.byType(DecoratedBox)).first;
}

/// The scrim's painter, or `null` when no scrim is drawn.
CustomPainter? _scrim(WidgetTester tester) {
  for (final CustomPaint paint in tester.widgetList<CustomPaint>(find.byType(CustomPaint))) {
    if (paint.painter?.runtimeType.toString() == '_ScrimPainter') {
      return paint.painter;
    }
  }

  return null;
}

/// Whether the scrim paints at [point], which it does everywhere but the hole.
bool _dims(WidgetTester tester, Offset point) => _scrim(tester)!.hitTest(point)!;

/// The label of the card's live region.
String _spoken(WidgetTester tester) {
  String? found;

  bool visit(SemanticsNode node) {
    if (node.getSemanticsData().flagsCollection.isLiveRegion) {
      found = node.label;

      return false;
    }

    node.visitChildren(visit);

    return found == null;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return found ?? '<none>';
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('what a screen reader is told', () {
    testWidgets('says nothing of its own on the step it opened on', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsOneWidget);
      expect(_spoken(tester), '');
      semantics.dispose();
    });

    testWidgets('announces where the reader has arrived when the step changes', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(_spoken(tester), 'Step 2 of 3. The second');
      semantics.dispose();
    });

    testWidgets('falls back to the position alone on a step with no title', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _page(
          steps: <MPTourStep>[
            MPTourStep(target: _one, content: const Text('First')),
            const MPTourStep(content: Text('Second')),
          ],
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(_spoken(tester), 'Step 2 of 2');
      semantics.dispose();
    });

    testWidgets('says the card is a dialog, with the title as its heading', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      final SemanticsNode title = semanticsNodeLabelled(tester, 'The first')!;

      expect(title.getSemanticsData().flagsCollection.isHeader, isTrue);

      bool dialog = false;
      SemanticsNode? node = title.parent;

      while (node != null && !dialog) {
        dialog = node.getSemanticsData().role == SemanticsRole.dialog;
        node = node.parent;
      }

      expect(dialog, isTrue);
      semantics.dispose();
    });
  });

  testWidgets('stands over the page on the step it was given', (WidgetTester tester) async {
    await tester.pumpWidget(_page());
    await tester.pumpAndSettle();

    expect(find.text('The first'), findsOneWidget);
    expect(find.text('Step 1 of 3'), findsOneWidget);
  });

  testWidgets('draws nothing at all when there are no steps', (WidgetTester tester) async {
    await tester.pumpWidget(_page(steps: const <MPTourStep>[]));
    await tester.pumpAndSettle();

    expect(find.text('Next'), findsNothing);
    expect(_scrim(tester), isNull);
  });

  testWidgets('waits to be opened when it does not start open', (WidgetTester tester) async {
    await tester.pumpWidget(_page(initialOpen: false));
    await tester.pumpAndSettle();

    expect(find.text('The first'), findsNothing);
    expect(_scrim(tester), isNull);
  });

  testWidgets('draws the card on a Material surface', (WidgetTester tester) async {
    await tester.pumpWidget(_page());
    await tester.pumpAndSettle();

    final BoxDecoration card =
        tester.widget<DecoratedBox>(_card('The first')).decoration as BoxDecoration;

    expect(card.color, light.surfaceContainer);
    expect(card.borderRadius, BorderRadius.circular(12));
    expect(card.boxShadow, MPShadows.of(3));
    expect(styleOf(tester, 'What it does.').color, light.onSurfaceVariant);
  });

  testWidgets('keeps the card to its measure at each size', (WidgetTester tester) async {
    const String long =
        'A sentence long enough to fill any card the ladder draws, and then go on '
        'to a second line and a third, so the width is the cap and not the words.';

    for (final (MPSize size, double width) in <(MPSize, double)>[
      (MPSize.xs, 224),
      (MPSize.md, 320),
      (MPSize.xl, 448),
    ]) {
      await tester.pumpWidget(
        host(
          MPTour(
            key: UniqueKey(),
            initialOpen: true,
            size: size,
            steps: const <MPTourStep>[MPTourStep(title: Text('Wide'), content: Text(long))],
          ),
          width: 800,
          height: 600,
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getSize(_card('Wide')).width, width, reason: size.name);
    }
  });

  group('the way through', () {
    testWidgets('walks forward and back, and only offers what there is', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      // Nothing to go back to on the first step.
      expect(find.text('Back'), findsNothing);

      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('The second'), findsOneWidget);

      await tester.tap(find.text('Back'));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsOneWidget);
    });

    testWidgets('turns Next into Done on the last step, and drops Skip with it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page(initialStep: 2));
      await tester.pumpAndSettle();

      expect(find.text('Next'), findsNothing);
      expect(find.text('Skip'), findsNothing);
      expect(find.text('Done'), findsOneWidget);
    });

    testWidgets('reports Done before it closes', (WidgetTester tester) async {
      final List<String> heard = <String>[];

      await tester.pumpWidget(
        _page(
          initialStep: 2,
          onFinish: () => heard.add('finish'),
          onOpenChange: (bool open) => heard.add('open: $open'),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();

      expect(heard, <String>['finish', 'open: false']);
      expect(find.text('The last'), findsNothing);
    });

    testWidgets('reports the step rather than keeping it, when it is controlled', (
      WidgetTester tester,
    ) async {
      final List<int> asked = <int>[];

      await tester.pumpWidget(_page(step: 0, onStepChange: asked.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(asked, <int>[1]);
      expect(find.text('The first'), findsOneWidget);

      await tester.pumpWidget(_page(step: 1, onStepChange: asked.add));
      await tester.pumpAndSettle();

      expect(find.text('The second'), findsOneWidget);
    });

    testWidgets('clamps a step past the end rather than drawing nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page(initialStep: 9));
      await tester.pumpAndSettle();

      expect(find.text('The last'), findsOneWidget);
    });

    testWidgets('keeps the focus in the card when the button it was on goes', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page(initialStep: 1));
      await tester.pumpAndSettle();

      Focus.of(tester.element(find.text('Back'))).requestFocus();
      await tester.pump();
      await tester.tap(find.text('Back'));
      await tester.pumpAndSettle();

      expect(find.text('Back'), findsNothing);
      expect(holdsFocus(tester, find.byType(MPTour)), isTrue);
    });
  });

  group('the dimming', () {
    testWidgets('never takes the pointer, which is the whole difference from a dialog', (
      WidgetTester tester,
    ) async {
      int pressed = 0;

      await tester.pumpWidget(_page(onOne: () => pressed += 1));
      await tester.pumpAndSettle();

      // The target, through the hole.
      await tester.tap(find.text('One'));
      // And a press well outside the hole, on the page under the scrim.
      await tester.tapAt(const Offset(20, 580));
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text('The first'), findsOneWidget);
      expect(_dims(tester, const Offset(20, 580)), isTrue);
    });

    testWidgets('is one path with a hole in it, six pixels round the target', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      final Rect target = tester.getRect(find.byKey(_one));

      expect(_dims(tester, target.center), isFalse);
      expect(_dims(tester, target.topLeft - const Offset(5, 5)), isFalse);
      expect(_dims(tester, target.topLeft - const Offset(7, 7)), isTrue);
      expect(_dims(tester, target.bottomRight + const Offset(5, 5)), isFalse);
      expect(_dims(tester, target.bottomRight + const Offset(7, 7)), isTrue);
    });

    testWidgets('paints MD3’s scrim at 32%, with the extra-small corner', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      final dynamic painter = _scrim(tester);

      // ignore: avoid_dynamic_calls
      expect(painter.color, light.scrim.withValues(alpha: 0.32));
      // ignore: avoid_dynamic_calls
      expect(painter.radius, 4);
    });

    testWidgets('takes the air the step asks for', (WidgetTester tester) async {
      await tester.pumpWidget(
        _page(
          steps: <MPTourStep>[
            MPTourStep(target: _one, title: const Text('Tight'), padding: 0),
            ..._steps().skip(1),
          ],
        ),
      );
      await tester.pumpAndSettle();

      final Rect target = tester.getRect(find.byKey(_one));

      expect(_dims(tester, target.topLeft + const Offset(1, 1)), isFalse);
      expect(_dims(tester, target.topLeft - const Offset(1, 1)), isTrue);
    });

    testWidgets('covers everything on a step that points at nothing', (WidgetTester tester) async {
      await tester.pumpWidget(_page(initialStep: 2));
      await tester.pumpAndSettle();

      expect(_dims(tester, tester.getCenter(find.byKey(_one))), isTrue);
    });

    testWidgets('hangs the card from the middle on a step that points at nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page(initialStep: 2));
      await tester.pumpAndSettle();

      final Rect card = tester.getRect(_card('The last'));

      expect(card.center.dx, closeTo(400, 0.5));
      expect(card.top, closeTo(300, 0.5));
    });

    testWidgets('puts the card below the target by default, ten pixels off', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      final Rect target = tester.getRect(find.byKey(_one));
      final Rect card = tester.getRect(_card('The first'));

      expect(card.top - target.bottom, closeTo(10, 0.5));
      expect(card.center.dx, closeTo(target.center.dx, 0.5));
    });

    testWidgets('lines a start card up with the reader’s start under RTL', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _page(
          textDirection: TextDirection.rtl,
          steps: <MPTourStep>[MPTourStep(target: _one, title: const Text('Start'))],
        ),
      );
      await tester.pumpAndSettle();

      final Rect target = tester.getRect(find.byKey(_one));

      expect(tester.getRect(_card('Start')).center.dx, closeTo(target.center.dx, 0.5));

      await tester.pumpWidget(
        _page(
          textDirection: TextDirection.rtl,
          steps: <MPTourStep>[
            MPTourStep(target: _one, title: const Text('Start'), align: MPAlign.start),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getRect(_card('Start')).right, closeTo(target.right, 0.5));
    });

    testWidgets('is not drawn at all when it is turned off', (WidgetTester tester) async {
      await tester.pumpWidget(_page(scrim: false));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsOneWidget);
      expect(_scrim(tester), isNull);
    });

    testWidgets('follows a target that has moved', (WidgetTester tester) async {
      await tester.pumpWidget(_page(steps: _steps().take(1).toList()));
      await tester.pumpAndSettle();

      final double before = tester.getRect(find.byKey(_one)).top;

      expect(_dims(tester, Offset(400, before + 120)), isTrue);

      await tester.pumpWidget(_page(steps: _steps().take(1).toList(), above: 120));
      await tester.pumpAndSettle();

      final Rect moved = tester.getRect(find.byKey(_one));

      expect(moved.top, before + 120);
      expect(_dims(tester, moved.center), isFalse);
      expect(tester.getRect(_card('The first')).top - moved.bottom, closeTo(10, 0.5));
    });
  });

  group('the ways out', () {
    testWidgets('is not ended by a press on the page it is pointing at', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();
      await tester.tapAt(const Offset(700, 500));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsOneWidget);
    });

    testWidgets('is ended by Escape', (WidgetTester tester) async {
      final List<bool> heard = <bool>[];

      await tester.pumpWidget(_page(onOpenChange: heard.add));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(heard, <bool>[false]);
      expect(find.text('The first'), findsNothing);
    });

    testWidgets('is not ended by Escape when it says it may not be', (WidgetTester tester) async {
      await tester.pumpWidget(_page(dismissible: false));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsOneWidget);
    });

    testWidgets('offers no × when it says it may not be dismissed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_page(dismissible: false));
      await tester.pumpAndSettle();

      expect(semanticsNodeLabelled(tester, 'Close'), isNull);

      await tester.pumpWidget(_page(initialOpen: false));
      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();

      expect(semanticsNodeLabelled(tester, 'Close'), isNotNull);
      semantics.dispose();
    });

    testWidgets('is ended by its ×', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_page());
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsNothing);
      semantics.dispose();
    });

    testWidgets('ends on Skip without reporting a finish', (WidgetTester tester) async {
      int finished = 0;

      await tester.pumpWidget(_page(onFinish: () => finished += 1));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsNothing);
      expect(finished, 0);
    });

    testWidgets('stays up when it is controlled and the owner does not close it', (
      WidgetTester tester,
    ) async {
      final List<bool> heard = <bool>[];

      await tester.pumpWidget(_page(open: true, onOpenChange: heard.add));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(heard, <bool>[false]);
      expect(find.text('The first'), findsOneWidget);

      await tester.pumpWidget(_page(open: false, onOpenChange: heard.add));
      await tester.pumpAndSettle();

      expect(find.text('The first'), findsNothing);
    });
  });

  group('focus', () {
    testWidgets('goes into the card, and back to where it was when it closes', (
      WidgetTester tester,
    ) async {
      final FocusNode opener = FocusNode();
      addTearDown(opener.dispose);

      Widget page({required bool open}) {
        return host(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPButton(focusNode: opener, onPressed: () {}, child: const Text('Start')),
              MPTour(
                open: open,
                steps: const <MPTourStep>[MPTourStep(title: Text('Hello'))],
              ),
            ],
          ),
          width: 800,
          height: 600,
          overlay: true,
        );
      }

      await tester.pumpWidget(page(open: false));
      opener.requestFocus();
      await tester.pump();

      await tester.pumpWidget(page(open: true));
      await tester.pumpAndSettle();

      expect(opener.hasFocus, isFalse);
      expect(holdsFocus(tester, find.byType(MPTour)), isTrue);

      await tester.pumpWidget(page(open: false));
      await tester.pumpAndSettle();

      expect(opener.hasFocus, isTrue);
    });
  });

  testWidgets('arrives at once when the reader asked for less motion', (WidgetTester tester) async {
    await tester.pumpWidget(_page(disableAnimations: true));
    await tester.pump();
    await tester.pump();

    final FadeTransition fade = tester.widget<FadeTransition>(
      find.ancestor(of: _card('The first'), matching: find.byType(FadeTransition)).first,
    );

    expect(fade.opacity.value, 1);
  });

  testWidgets('says its own words in the language it was given', (WidgetTester tester) async {
    registerMPMessages(<MPLocale>[ko]);
    addTearDown(resetMPMessages);

    await tester.pumpWidget(_page(locale: 'ko'));
    await tester.pumpAndSettle();

    expect(find.text('다음'), findsOneWidget);
    expect(find.text('3단계 중 1단계'), findsOneWidget);
  });

  testWidgets('takes an override for one word without losing the rest', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_page(labels: const <String, String>{'next': 'Show me'}));
    await tester.pumpAndSettle();

    expect(find.text('Show me'), findsOneWidget);
    expect(find.text('Skip'), findsOneWidget);
  });

  testWidgets('draws its buttons one rung under the card', (WidgetTester tester) async {
    await tester.pumpWidget(_page());
    await tester.pumpAndSettle();

    final MPButton next = tester.widget<MPButton>(
      find.ancestor(of: find.text('Next'), matching: find.byType(MPButton)),
    );
    final MPButton skip = tester.widget<MPButton>(
      find.ancestor(of: find.text('Skip'), matching: find.byType(MPButton)),
    );

    expect(next.size, MPSize.sm);
    expect(next.variant, isNull);
    expect(next.color, MPColor.primary);
    expect(skip.variant, MPVariant.text);
    expect(skip.color, MPColor.secondary);
  });
}
