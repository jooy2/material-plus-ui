import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/button_group/mp_button_group.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/joined_run.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _surfaceOf(WidgetTester tester, Finder button) {
  final AnimatedContainer container = tester.widget<AnimatedContainer>(
    find.descendant(of: button, matching: find.byType(AnimatedContainer)).first,
  );

  return container.decoration! as BoxDecoration;
}

Finder _button(String label) =>
    find.ancestor(of: find.text(label), matching: find.byType(MPButton));

List<Widget> _three({VoidCallback? onPressed}) => <Widget>[
  MPButton(onPressed: onPressed ?? () {}, child: const Text('Left')),
  MPButton(onPressed: onPressed ?? () {}, child: const Text('Centre')),
  MPButton(onPressed: onPressed ?? () {}, child: const Text('Right')),
];

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('what it is', () {
    testWidgets('is one named node with the buttons inside it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPButtonGroup(semanticLabel: 'Alignment', children: _three())));

      final SemanticsNode group = semanticsNodeLabelled(tester, 'Alignment')!;
      final List<String> inside = <String>[];
      group.visitChildren((SemanticsNode child) {
        inside.add(child.label);
        return true;
      });

      expect(inside, <String>['Left', 'Centre', 'Right']);
      semantics.dispose();
    });

    testWidgets('leaves the buttons real buttons', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(host(MPButtonGroup(children: _three(onPressed: () => presses++))));
      await tester.tap(find.text('Centre'));

      expect(presses, 1);
    });
  });

  group('what a member inherits', () {
    testWidgets('hands its size and variant to every button', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPButtonGroup(size: MPSize.sm, variant: MPVariant.outlined, children: _three())),
      );

      for (final String label in <String>['Left', 'Centre', 'Right']) {
        expect(tester.getSize(_button(label)).height, 40);
        expect(_surfaceOf(tester, _button(label)).border, isNotNull);
      }
    });

    testWidgets('disables the whole set at once', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(MPButtonGroup(disabled: true, children: _three(onPressed: () => presses++))),
      );
      await tester.tap(find.text('Left'));

      expect(presses, 0);
    });

    testWidgets('lets a button disagree with the group', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButtonGroup(
            variant: MPVariant.outlined,
            children: <Widget>[
              MPButton(onPressed: () {}, child: const Text('Left')),
              MPButton(variant: MPVariant.filled, onPressed: () {}, child: const Text('Right')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester, _button('Right')).color, light.primary);
      expect(_surfaceOf(tester, _button('Left')).border, isNotNull);
    });

    testWidgets('leaves a button its own defaults when it named nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(MPButtonGroup(children: _three())));

      expect(_surfaceOf(tester, _button('Left')).color, light.primary);
      expect(tester.getSize(_button('Left')).height, 56);
    });

    testWidgets('hands its variant to an icon button, whose own default is text', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPButtonGroup(
            variant: MPVariant.tonal,
            children: <Widget>[
              MPIconButton(
                icon: const SizedBox.square(dimension: 20),
                label: 'Bold',
                onPressed: () {},
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester, find.byType(MPButton)).color, light.primaryContainer);

      await tester.pumpWidget(
        host(
          MPButtonGroup(
            children: <Widget>[
              MPIconButton(
                icon: const SizedBox.square(dimension: 20),
                label: 'Bold',
                onPressed: () {},
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester, find.byType(MPButton)).color, const Color(0x00000000));
    });
  });

  group('the shape of the run', () {
    testWidgets('keeps the outer corners round and cuts the inner ones', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(MPButtonGroup(children: _three())));

      const Radius round = Radius.circular(28);
      const Radius cut = Radius.circular(8);

      expect(
        _surfaceOf(tester, _button('Left')).borderRadius,
        const BorderRadius.only(topLeft: round, bottomLeft: round, topRight: cut, bottomRight: cut),
      );
      expect(_surfaceOf(tester, _button('Centre')).borderRadius, BorderRadius.circular(8));
      expect(
        _surfaceOf(tester, _button('Right')).borderRadius,
        const BorderRadius.only(topLeft: cut, bottomLeft: cut, topRight: round, bottomRight: round),
      );
    });

    testWidgets('cuts the top and bottom instead when vertical', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPButtonGroup(orientation: MPOrientation.vertical, children: _three())),
      );

      const Radius round = Radius.circular(28);
      const Radius cut = Radius.circular(8);

      expect(
        _surfaceOf(tester, _button('Left')).borderRadius,
        const BorderRadius.only(topLeft: round, topRight: round, bottomLeft: cut, bottomRight: cut),
      );
    });

    testWidgets('stretches a vertical run to its widest member', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButtonGroup(
            orientation: MPOrientation.vertical,
            children: <Widget>[
              MPButton(onPressed: () {}, child: const Text('A')),
              MPButton(onPressed: () {}, child: const Text('A much longer label')),
            ],
          ),
        ),
      );

      expect(
        tester.getSize(_button('A')).width,
        tester.getSize(_button('A much longer label')).width,
      );
    });

    testWidgets('leaves a two-pixel seam between members', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPButtonGroup(children: _three())));

      expect(
        tester.getTopLeft(_button('Centre')).dx - tester.getTopRight(_button('Left')).dx,
        mpJoinedGap,
      );
    });

    testWidgets('runs from the right under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, MPButtonGroup(children: _three())),
      );

      expect(
        tester.getCenter(_button('Left')).dx,
        greaterThan(tester.getCenter(_button('Right')).dx),
      );
    });

    testWidgets('paints the focused member over its neighbours', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
      addTearDown(() => FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic);

      await tester.pumpWidget(
        host(
          MPButtonGroup(
            children: <Widget>[
              MPButton(onPressed: () {}, child: const Text('Left')),
              MPButton(focusNode: focus, onPressed: () {}, child: const Text('Centre')),
              MPButton(onPressed: () {}, child: const Text('Right')),
            ],
          ),
        ),
      );
      focus.requestFocus();
      await tester.pumpAndSettle();

      final MPJoinedRun run = tester.widget<MPJoinedRun>(find.byType(MPJoinedRun));
      expect(run.raised, 1);
      expect(
        tester
            .widgetList<CustomPaint>(
              find.descendant(of: _button('Centre'), matching: find.byType(CustomPaint)),
            )
            .any((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter),
        isTrue,
      );
    });
  });

  group('fullWidth', () {
    testWidgets('divides the row between the buttons', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          MPButtonGroup(
            fullWidth: true,
            children: <Widget>[
              MPButton(onPressed: () {}, child: const Text('A')),
              MPButton(onPressed: () {}, child: const Text('Longer')),
            ],
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPButtonGroup)).width, 400);
      expect(tester.getSize(_button('A')).width, (400 - mpJoinedGap) / 2);
      expect(tester.getSize(_button('Longer')).width, (400 - mpJoinedGap) / 2);
    });
  });
}
