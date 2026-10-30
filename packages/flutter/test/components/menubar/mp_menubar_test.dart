import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/menu/mp_menu.dart';
import 'package:material_plus_ui/src/components/menubar/mp_menubar.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// File, Edit and View, with a row in each that says which menu it is in.
Widget bar({
  MPSize? size,
  MPOrientation orientation = MPOrientation.horizontal,
  bool disabled = false,
  bool editDisabled = false,
  List<String>? pressed,
}) {
  return MPMenubar(
    size: size,
    orientation: orientation,
    disabled: disabled,
    semanticLabel: 'Application',
    menus: <MPMenubarMenu>[
      MPMenubarMenu(
        label: 'File',
        items: <MPMenuEntry>[MPMenuItem(label: 'New', onPressed: () => pressed?.add('New'))],
      ),
      MPMenubarMenu(
        label: 'Edit',
        disabled: editDisabled,
        items: <MPMenuEntry>[MPMenuItem(label: 'Undo', onPressed: () => pressed?.add('Undo'))],
      ),
      MPMenubarMenu(
        label: 'View',
        items: <MPMenuEntry>[
          MPMenuItem(label: 'Zoom in', onPressed: () => pressed?.add('Zoom in')),
        ],
      ),
    ],
  );
}

/// The menu round the word reading [label], which holds the word's own focus
/// node and the one its menu takes the keys on.
Finder _word(String label) => find.ancestor(of: find.text(label), matching: find.byType(MPMenu));

/// The colour the word reading [label] is drawn in.
Color? _inkOf(WidgetTester tester, String label) => styleOf(tester, label).color;

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the strip', () {
    testWidgets('is one widget rather than a row of unrelated buttons', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(bar(), overlay: true));

      expect(semanticsNodeLabelled(tester, 'Application')!.role, SemanticsRole.menuBar);
      expect(semanticsNodeLabelled(tester, 'File')!.role, SemanticsRole.menuItem);

      handle.dispose();
    });

    testWidgets('draws the words and nothing else until one is opened', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(bar(), overlay: true));

      expect(find.text('File'), findsOneWidget);
      expect(find.text('Edit'), findsOneWidget);
      expect(find.text('New'), findsNothing);
    });

    testWidgets('draws no surface of its own', (WidgetTester tester) async {
      await tester.pumpWidget(host(bar(), overlay: true));

      final Iterable<Color?> fills = decorationsOf(
        tester,
        find.byType(MPMenubar),
      ).map((BoxDecoration decoration) => decoration.color).where((Color? color) => color != null);

      // The only boxes are the words' washes, which are clear at rest.
      expect(fills.every((Color? color) => color!.a == 0), isTrue);
    });

    testWidgets('sets the words a rung below the control ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(bar(size: size), overlay: true));
        heights.add(
          tester
              .getSize(find.ancestor(of: find.text('File'), matching: find.byType(SizedBox)).first)
              .height,
        );
      }

      expect(heights, <double>[24, 28, 32, 40, 48]);
    });
  });

  group('opening a menu', () {
    testWidgets('opens the rows behind the word', (WidgetTester tester) async {
      await tester.pumpWidget(host(bar(), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      expect(find.text('New'), findsOneWidget);
    });

    testWidgets('marks which word is open, in colour and nothing else', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(bar(), overlay: true));

      final Size before = tester.getSize(find.text('File'));

      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      expect(_inkOf(tester, 'File'), light.primary);
      expect(_inkOf(tester, 'Edit'), light.onSurface);
      expect(tester.getSize(find.text('File')), before);
    });

    testWidgets('runs the row that was pressed, and closes', (WidgetTester tester) async {
      final List<String> pressed = <String>[];

      await tester.pumpWidget(host(bar(pressed: pressed), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('New'));
      await tester.pumpAndSettle();

      expect(pressed, <String>['New']);
      expect(find.text('New'), findsNothing);
    });

    testWidgets('walks to the next menu when the pointer crosses the strip', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(bar(), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: tester.getCenter(find.text('File')));
      await mouse.moveTo(tester.getCenter(find.text('View')));
      await tester.pumpAndSettle();

      expect(find.text('New'), findsNothing);
      expect(find.text('Zoom in'), findsOneWidget);
    });

    testWidgets('opens nothing on hover while every menu is shut', (WidgetTester tester) async {
      await tester.pumpWidget(host(bar(), overlay: true));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('View')));
      await tester.pumpAndSettle();

      expect(find.text('Zoom in'), findsNothing);
    });

    testWidgets('switches menus on a press of another word', (WidgetTester tester) async {
      await tester.pumpWidget(host(bar(), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('View'));
      await tester.pumpAndSettle();

      expect(find.text('New'), findsNothing);
      expect(find.text('Zoom in'), findsOneWidget);
    });

    testWidgets('leaves a disabled word on the strip, opening nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(bar(editDisabled: true), overlay: true));
      await tester.tap(find.text('Edit'));
      await tester.pumpAndSettle();

      expect(find.text('Edit'), findsOneWidget);
      expect(find.text('Undo'), findsNothing);
      expect(
        _inkOf(tester, 'Edit'),
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });
  });

  group('the keyboard', () {
    testWidgets('is one stop, and the arrows walk the words', (WidgetTester tester) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, bar()), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, _word('File')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(holdsFocus(tester, _word('Edit')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();

      expect(holdsFocus(tester, _word('View')), isTrue);

      // And round again, from the last word to the first.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(holdsFocus(tester, _word('File')), isTrue);
    });

    testWidgets('draws its focus ring inside the word', (WidgetTester tester) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, bar()), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      final MPFocusRingPainter ring =
          tester
                  .widgetList<CustomPaint>(find.byType(CustomPaint))
                  .firstWhere((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter)
                  .foregroundPainter!
              as MPFocusRingPainter;

      expect(ring.offset, lessThan(0));
      expect(ring.color, light.secondary);
    });

    testWidgets('opens on the down arrow, walks to the next menu, and picks a row', (
      WidgetTester tester,
    ) async {
      final List<String> pressed = <String>[];
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, bar(pressed: pressed)), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(find.text('New'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('New'), findsNothing);
      expect(find.text('Undo'), findsOneWidget);

      // Opened from the keyboard, its first row is lit.
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['Undo']);
      // And the focus is back on the word whose menu it was.
      expect(holdsFocus(tester, _word('Edit')), isTrue);
    });

    testWidgets('walks back with the arrow towards the start, past a disabled word', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, bar(editDisabled: true)), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('Zoom in'), findsOneWidget);
    });

    testWidgets('closes on escape and gives the focus back to the word', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, bar()), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('New'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('New'), findsNothing);
      expect(holdsFocus(tester, _word('File')), isTrue);
    });
  });

  group('the values the bar sets once', () {
    testWidgets('passes its size down to every menu on it', (WidgetTester tester) async {
      await tester.pumpWidget(host(bar(size: MPSize.sm), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      final double row = tester
          .getSize(find.ancestor(of: find.text('New'), matching: find.byType(ConstrainedBox)).first)
          .height;

      expect(row, 40);
    });

    testWidgets('runs down the page when told to, and opens its menus beside it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(bar(orientation: MPOrientation.vertical), overlay: true));

      expect(
        tester.getCenter(find.text('Edit')).dy,
        greaterThan(tester.getCenter(find.text('File')).dy),
      );

      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(find.text('New')).dx,
        greaterThan(tester.getTopRight(find.text('File')).dx),
      );
    });

    testWidgets('walks a column with the up and down arrows', (WidgetTester tester) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(afterFocusStop(before, bar(orientation: MPOrientation.vertical)), overlay: true),
      );
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(find.text('New'), findsNothing);
      expect(holdsFocus(tester, _word('Edit')), isTrue);

      // The arrow that points across opens it.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('Undo'), findsOneWidget);
    });

    testWidgets('disables every menu on the bar at once', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(bar(disabled: true), overlay: true));

      for (final String word in <String>['File', 'Edit', 'View']) {
        await tester.tap(find.text(word));
        await tester.pumpAndSettle();

        expect(
          semanticsNodeLabelled(tester, word)!.getSemanticsData().flagsCollection.isEnabled,
          Tristate.isFalse,
        );
      }

      expect(find.text('New'), findsNothing);
      expect(find.text('Undo'), findsNothing);
      expect(find.text('Zoom in'), findsNothing);

      handle.dispose();
    });

    testWidgets('says which word is open', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(bar(), overlay: true));
      await tester.tap(find.text('File'));
      await tester.pumpAndSettle();

      Tristate expanded(String word) =>
          semanticsNodeLabelled(tester, word)!.getSemanticsData().flagsCollection.isExpanded;

      expect(expanded('File'), Tristate.isTrue);
      expect(expanded('Edit'), Tristate.isFalse);

      handle.dispose();
    });
  });
}
