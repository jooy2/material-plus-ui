import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/stack/mp_stack.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads margins and `z-index` off the wrappers it builds. Here
/// the same answers are where each item landed and which one a tap reaches.

/// A 32px square that says which one it is.
Widget _item(int index) => SizedBox(key: Key('item$index'), width: 32, height: 32);

List<Widget> _five() => <Widget>[for (int index = 0; index < 5; index += 1) _item(index)];

Rect _rectOf(WidgetTester tester, int index) => tester.getRect(find.byKey(Key('item$index')));

Size _boxOf(WidgetTester tester) => tester.getSize(find.byType(MPStack));

void main() {
  group('the box is the size of what is drawn', () {
    testWidgets('measures 120 by 32 across', (WidgetTester tester) async {
      // Five 32s less four 10s.
      await tester.pumpWidget(host(MPStack(overlap: 10, children: _five())));

      expect(_boxOf(tester), const Size(120, 32));
    });

    testWidgets('measures 32 by 120 down', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPStack(direction: MPStackDirection.vertical, overlap: 10, children: _five())),
      );

      expect(_boxOf(tester), const Size(32, 120));
    });

    testWidgets('measures 120 by 72 on the diagonal', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPStack(direction: MPStackDirection.diagonal, overlap: 10, children: _five())),
      );

      expect(_boxOf(tester), const Size(120, 72));
    });
  });

  group('the overlap', () {
    testWidgets('runs the other way under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, MPStack(overlap: 10, children: _five())),
      );

      expect(_rectOf(tester, 0).right, tester.getTopRight(find.byType(MPStack)).dx);
      expect(_rectOf(tester, 0).left - _rectOf(tester, 1).left, 22);
    });

    testWidgets('falls back to the rung when nobody said', (WidgetTester tester) async {
      final List<double> steps = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPStack(size: size, children: <Widget>[_item(0), _item(1)])));
        steps.add(32 - (_rectOf(tester, 1).left - _rectOf(tester, 0).left));
      }

      expect(steps, <double>[10, 12, 18, 20, 24]);
    });

    testWidgets('takes its rung from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            size: MPSize.xs,
            child: MPStack(children: _five()),
          ),
        ),
      );

      expect(_boxOf(tester).width, 5 * 32 - 4 * 10);
    });
  });

  testWidgets('multiplies the diagonal drop by the index rather than repeating it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(MPStack(direction: MPStackDirection.diagonal, drop: 10, children: _five())),
    );

    final double top = tester.getTopLeft(find.byType(MPStack)).dy;

    expect(
      <double>[for (int index = 0; index < 5; index += 1) _rectOf(tester, index).top - top],
      <double>[0, 10, 20, 30, 40],
    );
  });

  testWidgets('centres items of different sizes across a straight pile', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        const MPStack(
          children: <Widget>[
            SizedBox(key: Key('big'), width: 40, height: 40),
            SizedBox(key: Key('small'), width: 20, height: 20),
          ],
        ),
      ),
    );

    expect(
      tester.getCenter(find.byKey(const Key('small'))).dy,
      tester.getCenter(find.byKey(const Key('big'))).dy,
    );
  });

  group('the front of the pile', () {
    Future<String?> tapped(WidgetTester tester, MPStackFront front) async {
      String? hit;

      await tester.pumpWidget(
        host(
          MPStack(
            overlap: 20,
            front: front,
            children: <Widget>[
              for (final String name in <String>['first', 'second'])
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => hit = name,
                  child: SizedBox(key: Key(name), width: 40, height: 40),
                ),
            ],
          ),
        ),
      );

      // The middle of the 20px the two items share.
      await tester.tapAt(tester.getTopLeft(find.byType(MPStack)) + const Offset(30, 20));

      return hit;
    }

    testWidgets('puts the first item in front by default', (WidgetTester tester) async {
      expect(await tapped(tester, MPStackFront.first), 'first');
    });

    testWidgets('turns round for front: last', (WidgetTester tester) async {
      expect(await tapped(tester, MPStackFront.last), 'second');
    });
  });

  group('depth', () {
    testWidgets('scales each item against the one in front of it', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPStack(scaleStep: 0.5, children: _five())));

      final List<double> scales = <double>[
        for (final Transform transform in tester.widgetList<Transform>(find.byType(Transform)))
          transform.transform.entry(0, 0),
      ];

      expect(scales, <double>[1, 0.5, 0.25, 0.125, 0.0625]);
    });

    testWidgets('changes what is drawn and not what is measured', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPStack(overlap: 10, scaleStep: 0.5, children: _five())));

      expect(_boxOf(tester), const Size(120, 32));
    });

    testWidgets('never fades the front item, whichever end it is', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPStack(front: MPStackFront.last, opacityStep: 0.5, children: _five())),
      );

      final List<double> opacities = <double>[
        for (final MPAnimateOpacity layer in tester.widgetList<MPAnimateOpacity>(
          find.byType(MPAnimateOpacity),
        ))
          layer.opacity,
      ];

      expect(opacities.last, 1);
      expect(opacities.first, 0.0625);
    });
  });

  group('max, total and overflow', () {
    testWidgets('draws the remainder from the number that did not fit', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPStack(max: 3, total: 12, overflow: (int hidden) => Text('+$hidden'), children: _five()),
        ),
      );

      expect(find.text('+9'), findsOneWidget);
      expect(find.byKey(const Key('item3')), findsNothing);
    });

    testWidgets('counts from the children when it was handed all of them', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(MPStack(max: 2, overflow: (int hidden) => Text('+$hidden'), children: _five())),
      );

      expect(find.text('+3'), findsOneWidget);
    });

    testWidgets('draws nothing for a remainder of nought', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPStack(max: 5, overflow: (int hidden) => Text('+$hidden'), children: _five())),
      );

      expect(find.textContaining('+'), findsNothing);
    });

    testWidgets('keeps the remainder in the pile', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPStack(
            max: 1,
            overlap: 10,
            overflow: (int hidden) => SizedBox(key: const Key('rest'), width: 32, height: 32),
            children: _five(),
          ),
        ),
      );

      expect(_boxOf(tester).width, 54);
      expect(tester.getTopLeft(find.byKey(const Key('rest'))).dx - _rectOf(tester, 0).left, 22);
    });
  });

  group('the entrance', () {
    testWidgets('deals the items one after another', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPStack(
            transition: MPAnimation.fade,
            duration: const Duration(milliseconds: 100),
            stagger: const Duration(milliseconds: 100),
            children: _five(),
          ),
        ),
      );
      // The first frame starts the clock; the pile is dealt from there.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 150));

      List<double> opacities() => <double>[
        for (final MPAnimateOpacity layer in tester.widgetList<MPAnimateOpacity>(
          find.byType(MPAnimateOpacity),
        ))
          layer.opacity,
      ];

      expect(opacities().first, 1);
      expect(opacities().last, 0);

      await tester.pumpAndSettle();
      expect(opacities().every((double opacity) => opacity == 1), isTrue);
    });

    testWidgets('deals from the back when reversed', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPStack(
            transition: MPAnimation.fade,
            duration: const Duration(milliseconds: 100),
            stagger: const Duration(milliseconds: 100),
            reverse: true,
            children: _five(),
          ),
        ),
      );
      // The first frame starts the clock; the pile is dealt from there.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 150));

      final List<MPAnimateOpacity> layers = tester
          .widgetList<MPAnimateOpacity>(find.byType(MPAnimateOpacity))
          .toList();

      expect(layers.first.opacity, 0);
      expect(layers.last.opacity, 1);
      await tester.pumpAndSettle();
    });

    testWidgets('moves nothing for a reader who asked for less motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(disableAnimations: true, MPStack(transition: MPAnimation.grow, children: _five())),
      );

      expect(
        tester
            .widgetList<MPAnimateOpacity>(find.byType(MPAnimateOpacity))
            .every((MPAnimateOpacity layer) => layer.opacity == 1),
        isTrue,
      );
    });

    testWidgets('animates nothing at all without a transition', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPStack(children: _five())));

      expect(find.byType(MPAnimateRun), findsNothing);
      expect(tester.binding.hasScheduledFrame, isFalse);
    });
  });

  testWidgets('rings each item in the page’s own surface', (WidgetTester tester) async {
    await tester.pumpWidget(host(MPStack(ring: true, children: _five())));

    final BoxDecoration ring =
        tester.widget<DecoratedBox>(find.byType(DecoratedBox).first).decoration as BoxDecoration;

    expect(ring.boxShadow!.single.color, MPColorScheme.fromSource().surface);
    expect(ring.boxShadow!.single.spreadRadius, 2);
    expect(_boxOf(tester), Size(5 * 32 - 4 * 18, 32));
  });

  testWidgets('names the pile when told to, and keeps the items’ own nodes', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(
      host(
        const MPStack(
          semanticLabel: 'Three people',
          children: <Widget>[Text('Anya'), Text('Lucas'), Text('Noa')],
        ),
      ),
    );

    expect(find.bySemanticsLabel('Three people'), findsOneWidget);
    expect(semanticsLabels(tester), containsAllInOrder(<String>['Anya', 'Lucas', 'Noa']));
    handle.dispose();
  });
}
