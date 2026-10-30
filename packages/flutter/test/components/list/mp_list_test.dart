import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/list/mp_list.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widgetList<DecoratedBox>(
            find.descendant(of: find.byType(MPList), matching: find.byType(DecoratedBox)),
          )
          .first
          .decoration
      as BoxDecoration;
}

/// The row's own fill, which a selected row takes the container tone on.
BoxDecoration _rowOf(WidgetTester tester, String label) {
  return tester
          .widget<AnimatedContainer>(
            find.ancestor(of: find.text(label), matching: find.byType(AnimatedContainer)).first,
          )
          .decoration!
      as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the sheet', () {
    testWidgets('leaves the surface neutral whatever the accent is', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPList(
            color: MPColor.error,
            children: <Widget>[MPListItem(child: Text('Row'))],
          ),
        ),
      );

      expect(_sheetOf(tester).color, const Color(0x00000000));
      expect((_sheetOf(tester).border! as Border).top.color, light.outlineVariant);
    });

    testWidgets('keeps a hair of padding and rounded rows without dividers', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            children: <Widget>[MPListItem(onPressed: () {}, child: const Text('Row'))],
          ),
        ),
      );

      final Rect sheet = tester.getRect(find.byType(MPList));
      final Rect row = tester.getRect(find.byType(MPListItem));

      expect(row.left - sheet.left, 5);
      expect(_rowOf(tester, 'Row').borderRadius, BorderRadius.circular(8));
    });

    testWidgets('gives up both once the rules have to reach the edge', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            dividers: true,
            children: <Widget>[
              MPListItem(onPressed: () {}, child: const Text('One')),
              MPListItem(onPressed: () {}, child: const Text('Two')),
            ],
          ),
        ),
      );

      final Rect sheet = tester.getRect(find.byType(MPList));
      final Rect row = tester.getRect(find.byType(MPListItem).first);

      expect(row.left - sheet.left, 1);
      expect(_rowOf(tester, 'One').borderRadius, BorderRadius.zero);
      expect(find.byType(ClipRRect), findsOneWidget);
    });
  });

  group('inheritance', () {
    testWidgets('carries the size down to every row, however it was wrapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            size: MPSize.xs,
            children: <Widget>[
              const MPListItem(child: Text('Plain')),
              Builder(builder: (BuildContext context) => const MPListItem(child: Text('Wrapped'))),
            ],
          ),
        ),
      );

      // `bodyMedium` at the two small rungs.
      expect(styleOf(tester, 'Plain').fontSize, 14);
      expect(styleOf(tester, 'Wrapped').fontSize, 14);
    });
  });

  group('rows', () {
    testWidgets('is an inert row when there is nothing to press', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 360, const MPList(children: <Widget>[MPListItem(child: Text('Row'))])),
      );

      expect(
        tester.getSemantics(find.text('Row')).getSemanticsData().flagsCollection.isButton,
        isFalse,
      );
      semantics.dispose();
    });

    testWidgets('becomes a button with an onPressed, by pointer and keyboard', (
      WidgetTester tester,
    ) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            children: <Widget>[
              MPListItem(focusNode: focus, onPressed: () => presses++, child: const Text('Row')),
            ],
          ),
        ),
      );

      expect(
        tester.getSemantics(find.text('Row')),
        matchesSemantics(
          label: 'Row',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );

      await tester.tap(find.text('Row'));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(presses, 2);
      semantics.dispose();
    });

    testWidgets('stays inert while disabled, at the disabled ink', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            children: <Widget>[
              MPListItem(disabled: true, onPressed: () => presses++, child: const Text('Row')),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Row'));

      expect(presses, 0);
      expect(
        styleOf(tester, 'Row').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });

    testWidgets('washes the row in its ink under the pointer', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            children: <Widget>[MPListItem(onPressed: () {}, child: const Text('Row'))],
          ),
        ),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Row')));
      await tester.pumpAndSettle();

      expect(tester.widget<MPStateLayer>(find.byType(MPStateLayer)).opacity, MPStateOpacity.hover);
    });
  });

  group('selected', () {
    testWidgets('fills with the container tone under its own ink', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            color: MPColor.tertiary,
            children: <Widget>[
              MPListItem(selected: true, onPressed: () {}, child: const Text('Row')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_rowOf(tester, 'Row').color, light.tertiaryContainer);
      expect(styleOf(tester, 'Row').color, light.onTertiaryContainer);
      expect(
        tester.getSemantics(find.text('Row')).getSemanticsData().flagsCollection.isSelected,
        Tristate.isTrue,
      );
      semantics.dispose();
    });
  });

  group('slots', () {
    testWidgets('stacks a description under the label, muted', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPList(
            children: <Widget>[MPListItem(description: Text('Design'), child: Text('Anya'))],
          ),
        ),
      );

      expect(
        tester.getTopLeft(find.text('Design')).dy,
        greaterThan(tester.getTopLeft(find.text('Anya')).dy),
      );
      expect(styleOf(tester, 'Design').color, light.onSurfaceVariant);
      expect(styleOf(tester, 'Design').fontSize, 14);
    });

    testWidgets('keeps an action outside the pressable area', (WidgetTester tester) async {
      int rows = 0;
      int actions = 0;

      await tester.pumpWidget(
        host(
          width: 360,
          MPList(
            children: <Widget>[
              MPListItem(
                onPressed: () => rows++,
                action: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => actions++,
                  child: const SizedBox(key: Key('action'), width: 40, height: 24),
                ),
                child: const Text('Row'),
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('action')));

      expect(actions, 1);
      expect(rows, 0);
    });

    testWidgets('draws the icon slots either side of the label, mirrored in RTL', (
      WidgetTester tester,
    ) async {
      Future<void> pump(TextDirection direction) {
        return tester.pumpWidget(
          host(
            width: 360,
            textDirection: direction,
            const MPList(
              children: <Widget>[
                MPListItem(
                  startIcon: SizedBox(key: Key('start'), width: 18, height: 18),
                  endIcon: SizedBox(key: Key('end'), width: 18, height: 18),
                  child: Text('Row'),
                ),
              ],
            ),
          ),
        );
      }

      await pump(TextDirection.ltr);
      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        lessThan(tester.getCenter(find.byKey(const Key('end'))).dx),
      );

      await pump(TextDirection.rtl);
      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        greaterThan(tester.getCenter(find.byKey(const Key('end'))).dx),
      );
    });
  });

  group('density', () {
    testWidgets('keeps a one-line row on the control ladder at every step', (
      WidgetTester tester,
    ) async {
      final List<double> heights = <double>[];

      for (final MPDensity density in <MPDensity>[0, -1, -2, -3]) {
        await tester.pumpWidget(
          host(
            width: 360,
            MPList(
              density: density,
              children: const <Widget>[MPListItem(child: Text('Row'))],
            ),
          ),
        );
        heights.add(tester.getSize(find.byType(MPListItem)).height);
      }

      expect(heights, <double>[56, 52, 48, 44]);
    });

    testWidgets('lands every rung on its control height', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(
            width: 360,
            MPList(
              size: size,
              children: const <Widget>[MPListItem(child: Text('Row'))],
            ),
          ),
        );
        heights.add(tester.getSize(find.byType(MPListItem)).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('stops at the touch target rather than at the subtraction', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPList(
            size: MPSize.xs,
            density: -3,
            children: <Widget>[MPListItem(child: Text('Row'))],
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPListItem)).height, 24);
    });

    testWidgets('takes the configured default when the list says nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 360,
          const MPConfigProvider(
            density: -1,
            child: MPList(children: <Widget>[MPListItem(child: Text('Row'))]),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPListItem)).height, 52);
    });
  });
}
