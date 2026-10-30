import 'dart:ui' show CheckedState, Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/chip/mp_chip.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/menu/mp_menu.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test finds a row by its role and reads a class name off it; a
/// widget test finds it by its text and reads what was laid out and painted.

/// A menu with a plain trigger, which is how nearly every caller uses one.
Widget menu(
  List<MPMenuEntry> items, {
  String? label,
  bool disabled = false,
  MPSize? size,
  MPColor? color,
  ValueChanged<bool>? onOpenChange,
}) {
  return MPMenu(
    items: items,
    semanticLabel: label,
    disabled: disabled,
    size: size,
    color: color,
    onOpenChange: onOpenChange,
    trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
        MPButton(onPressed: open, child: const Text('Open')),
  );
}

Future<void> openMenu(WidgetTester tester) async {
  await tester.tap(find.text('Open'));
  await tester.pumpAndSettle();
}

/// The popup's own surface: the fill, the corner and the shadow.
BoxDecoration _popupOf(WidgetTester tester) {
  return tester
      .widgetList<Container>(find.byType(Container))
      .map((Container box) => box.decoration)
      .whereType<BoxDecoration>()
      .firstWhere((BoxDecoration decoration) => decoration.boxShadow?.isNotEmpty ?? false);
}

/// The height the row reading [label] was laid out at.
double _rowHeight(WidgetTester tester, String label) {
  return tester
      .getSize(find.ancestor(of: find.text(label), matching: find.byType(ConstrainedBox)).first)
      .height;
}

/// The wash over the row reading [label]: its colour, at the strength it is
/// drawn.
Color? _washOf(WidgetTester tester, String label) {
  final Finder row = find.ancestor(of: find.text(label), matching: find.byType(GestureDetector));
  final AnimatedContainer layer = tester.widget<AnimatedContainer>(
    find.descendant(of: row.first, matching: find.byType(AnimatedContainer)).first,
  );

  return (layer.decoration! as BoxDecoration).color;
}

/// The label of every node on the semantics tree that says it holds the
/// focus, in tree order.
List<String> _focusedLabels(WidgetTester tester) {
  final List<String> labels = <String>[];

  bool visit(SemanticsNode node) {
    if (node.getSemanticsData().flagsCollection.isFocused == Tristate.isTrue) {
      labels.add(node.label);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return labels;
}

/// Whether the trigger is drawing its focus ring.
bool _ringed(WidgetTester tester) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: find.byType(MPButton), matching: find.byType(CustomPaint)),
      )
      .any((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter);
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('opening', () {
    testWidgets('puts nothing on the page until the trigger is pressed', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')]), overlay: true),
      );

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('opens on a press and lists its rows', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy'), MPMenuItem(label: 'Paste')]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(find.text('Copy'), findsOneWidget);
      expect(find.text('Paste'), findsOneWidget);
    });

    testWidgets('reports the change to a controlled parent', (WidgetTester tester) async {
      final List<bool> seen = <bool>[];

      await tester.pumpWidget(
        host(
          MPMenu(
            open: false,
            onOpenChange: seen.add,
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );
      await openMenu(tester);

      // Asked, and left shut, because the parent did not say yes.
      expect(seen, <bool>[true]);
      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('opens and closes on what a controlled parent says', (WidgetTester tester) async {
      Widget build(bool open) {
        return host(
          MPMenu(
            open: open,
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
          ),
          overlay: true,
        );
      }

      await tester.pumpWidget(build(true));
      await tester.pumpAndSettle();

      // With no trigger of its own, hung off the place it was written.
      expect(find.text('Copy'), findsOneWidget);

      await tester.pumpWidget(build(false));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('starts open when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPMenu(initialOpen: true, items: <MPMenuEntry>[MPMenuItem(label: 'Copy')]),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('opens nothing at all while it is disabled', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')], disabled: true), overlay: true),
      );
      await openMenu(tester);

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('closes on escape and on a press outside', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')]), overlay: true),
      );
      await openMenu(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);

      await openMenu(tester);
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('opens on hover when asked, and a press keeps it open', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPMenu(
            openOnHover: true,
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Open')));
      await tester.pumpAndSettle(const Duration(milliseconds: 200));

      expect(find.text('Copy'), findsOneWidget);

      // A press on the trigger of a menu hover opened keeps it open.
      await tester.tap(find.text('Open'));
      await mouse.moveTo(Offset.zero);
      await tester.pumpAndSettle(const Duration(milliseconds: 200));

      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('closes a hover-opened menu once the pointer leaves', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPMenu(
            openOnHover: true,
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Open')));
      await tester.pumpAndSettle(const Duration(milliseconds: 200));
      await mouse.moveTo(Offset.zero);
      await tester.pumpAndSettle(const Duration(milliseconds: 200));

      expect(find.text('Copy'), findsNothing);
    });
  });

  group('the surface', () {
    testWidgets('is surface-container at elevation 2 under the extra-small corner', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')]), overlay: true),
      );
      await openMenu(tester);

      final BoxDecoration popup = _popupOf(tester);

      expect(popup.color, light.surfaceContainer);
      expect(popup.boxShadow, MPShadows.of(2));
      expect(popup.borderRadius, BorderRadius.circular(4));
    });

    testWidgets('is never narrower than 112 or wider than 280', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'A')]), overlay: true),
      );
      await openMenu(tester);

      final Finder sheet = find.byWidgetPredicate(
        (Widget widget) =>
            widget is Container &&
            ((widget.decoration as BoxDecoration?)?.boxShadow?.isNotEmpty ?? false),
      );

      expect(tester.getSize(sheet).width, 112);

      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[MPMenuItem(label: 'A very long label ' * 8)]),
          width: 800,
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(tester.getSize(sheet).width, 280);
    });

    testWidgets('steps its rows up the ladder: 32, 40, 48, 56, 64', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')], size: size), overlay: true),
        );
        await openMenu(tester);
        heights.add(_rowHeight(tester, 'Copy'));
        await tester.pumpWidget(const SizedBox.shrink());
      }

      expect(heights, <double>[32, 40, 48, 56, 64]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            size: MPSize.sm,
            child: menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')]),
          ),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(_rowHeight(tester, 'Copy'), 40);
    });

    testWidgets('grows a row with a description rather than clipping it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuItem(label: 'Split view', description: 'Side by side with this one'),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(find.text('Side by side with this one'), findsOneWidget);
      expect(_rowHeight(tester, 'Split view'), greaterThanOrEqualTo(48));
    });
  });

  group('a row', () {
    testWidgets('calls back when it is picked, and closes', (WidgetTester tester) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[MPMenuItem(label: 'Copy', onPressed: () => pressed++)]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Copy'));
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('stays open when it is told not to close', (WidgetTester tester) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', closeOnPress: false, onPressed: () => pressed++),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Copy'));
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text('Copy'), findsOneWidget);
    });

    testWidgets('fires from a screen reader too', (WidgetTester tester) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[MPMenuItem(label: 'Copy', onPressed: () => pressed++)]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      tester.semantics.tap(find.semantics.byLabel('Copy'));
      await tester.pumpAndSettle();

      expect(pressed, 1);
    });

    testWidgets('lists a disabled row without letting it be taken', (WidgetTester tester) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', disabled: true, onPressed: () => pressed++),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Copy'));
      await tester.pumpAndSettle();

      expect(pressed, 0);
      // Still listed, and the press did not fall through and close the menu.
      expect(find.text('Copy'), findsOneWidget);
      expect(
        styleOf(tester, 'Copy').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });

    testWidgets('re-points its own family when it names one', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', onPressed: () {}),
            MPMenuItem(label: 'Delete', color: MPColor.error, onPressed: () {}),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(styleOf(tester, 'Copy').color, light.onSurface);
      expect(styleOf(tester, 'Delete').color, light.error);
    });

    testWidgets('sets a shortcut at the end of the row without binding it', (
      WidgetTester tester,
    ) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', shortcut: '⌘C', onPressed: () => pressed++),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(find.text('⌘C'), findsOneWidget);
      expect(
        tester.getCenter(find.text('⌘C')).dx,
        greaterThan(tester.getCenter(find.text('Copy')).dx),
      );
      expect(styleOf(tester, '⌘C').color, light.onSurfaceVariant);

      await tester.sendKeyEvent(LogicalKeyboardKey.keyC);
      await tester.pumpAndSettle();

      expect(pressed, 0);
    });

    testWidgets('washes the row the pointer is on in its own ink', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', onPressed: () {}),
            MPMenuItem(label: 'Paste', onPressed: () {}),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Paste')));
      await tester.pumpAndSettle();

      expect(_washOf(tester, 'Paste'), light.onSurface.withValues(alpha: MPStateOpacity.hover));
      expect(_washOf(tester, 'Copy')!.a, 0);
    });
  });

  group('ticking and choosing', () {
    testWidgets('renders a checkbox row that stays open when it is ticked', (
      WidgetTester tester,
    ) async {
      final List<bool> seen = <bool>[];

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuCheckboxItem(label: 'Grid lines', checked: false, onChanged: seen.add),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Grid lines'));
      await tester.pumpAndSettle();

      expect(seen, <bool>[true]);
      expect(find.text('Grid lines'), findsOneWidget);
    });

    testWidgets('keeps the tick of a row nobody controls', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[MPMenuCheckboxItem(label: 'Rulers', initialChecked: true)]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      AnimatedOpacity mark() => tester.widget<AnimatedOpacity>(
        find
            .descendant(
              of: find.ancestor(of: find.text('Rulers'), matching: find.byType(Row)).first,
              matching: find.byType(AnimatedOpacity),
            )
            .first,
      );

      expect(mark().opacity, 1);

      await tester.tap(find.text('Rulers'));
      await tester.pumpAndSettle();

      expect(mark().opacity, 0);
    });

    testWidgets('renders a radio group where only one row is chosen', (WidgetTester tester) async {
      String density = 'comfortable';

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) => menu(<MPMenuEntry>[
              MPMenuRadioGroup<String>(
                value: density,
                onChanged: (String next) => setState(() => density = next),
                items: const <MPMenuRadioItem<String>>[
                  MPMenuRadioItem<String>(value: 'comfortable', label: 'Comfortable'),
                  MPMenuRadioItem<String>(value: 'compact', label: 'Compact'),
                ],
              ),
            ]),
          ),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Compact'));
      await tester.pumpAndSettle();

      expect(density, 'compact');
      expect(find.text('Compact'), findsOneWidget);
    });

    testWidgets('keeps the choice of a set nobody controls', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuRadioGroup<int>(
              initialValue: 1,
              items: <MPMenuRadioItem<int>>[
                MPMenuRadioItem<int>(value: 1, label: 'One'),
                MPMenuRadioItem<int>(value: 2, label: 'Two'),
              ],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      CheckedState checked(String label) =>
          semanticsNodeLabelled(tester, label)!.getSemanticsData().flagsCollection.isChecked;

      expect(checked('One'), CheckedState.isTrue);
      expect(checked('Two'), CheckedState.isFalse);

      await tester.tap(find.text('Two'));
      await tester.pumpAndSettle();

      expect(checked('One'), CheckedState.isFalse);
      expect(checked('Two'), CheckedState.isTrue);

      handle.dispose();
    });

    testWidgets("grows a ticked row's mark in from 60%, and a dot from nothing", (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuCheckboxItem(label: 'Rulers'),
            MPMenuRadioGroup<int>(
              items: <MPMenuRadioItem<int>>[MPMenuRadioItem<int>(value: 1, label: 'One')],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      final List<AnimatedScale> scales = tester
          .widgetList<AnimatedScale>(find.byType(AnimatedScale))
          .toList();

      expect(scales.map((AnimatedScale scale) => scale.scale), <double>[0.6, 0]);
      expect(scales.first.duration, MPMotion.short4);

      await tester.tap(find.text('Rulers'));
      await tester.pump();

      expect(tester.widgetList<AnimatedScale>(find.byType(AnimatedScale)).first.scale, 1);
    });

    testWidgets('draws the mark at once for a reader who asked for less motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[MPMenuCheckboxItem(label: 'Rulers')]),
          disableAnimations: true,
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(tester.widget<AnimatedScale>(find.byType(AnimatedScale)).duration, Duration.zero);
    });

    testWidgets('marks in the menu family, or the row family when it names one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          menu(color: MPColor.tertiary, const <MPMenuEntry>[
            MPMenuCheckboxItem(label: 'Rulers', initialChecked: true),
            MPMenuCheckboxItem(label: 'Guides', initialChecked: true, color: MPColor.error),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      final List<Color?> inks = tester
          .widgetList<MPGlyph>(find.byType(MPGlyph))
          .where((MPGlyph glyph) => glyph.shape == MPGlyphShape.check)
          .map((MPGlyph glyph) => glyph.color)
          .toList();

      expect(inks, <Color>[light.tertiary, light.error]);
    });
  });

  group('structure', () {
    testWidgets('names a group without making the heading pickable', (WidgetTester tester) async {
      int pressed = 0;

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuGroup(
              label: 'Show',
              items: <MPMenuEntry>[MPMenuItem(label: 'Copy', onPressed: () => pressed++)],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(find.text('Show'), findsOneWidget);
      expect(styleOf(tester, 'Show').color, light.onSurfaceVariant);

      await tester.tap(find.text('Show'));
      await tester.pumpAndSettle();

      expect(pressed, 0);
      expect(find.text('Show'), findsOneWidget);
    });

    testWidgets('draws a separator in outline-variant', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuItem(label: 'Copy'),
            MPMenuSeparator(),
            MPMenuItem(label: 'Delete'),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(
        tester
            .widgetList<ColoredBox>(find.byType(ColoredBox))
            .where((ColoredBox box) => box.color == light.outlineVariant),
        hasLength(1),
      );
    });

    testWidgets('opens a submenu from its own row', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuSubmenu(
              label: 'Open in',
              items: <MPMenuEntry>[MPMenuItem(label: 'New tab')],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      expect(find.text('Open in'), findsOneWidget);
      expect(find.text('New tab'), findsNothing);

      await tester.tap(find.text('Open in'));
      await tester.pumpAndSettle();

      expect(find.text('New tab'), findsOneWidget);
    });

    testWidgets('opens a submenu towards the end of the line, and turns its chevron there', (
      WidgetTester tester,
    ) async {
      for (final TextDirection direction in TextDirection.values) {
        await tester.pumpWidget(
          host(
            textDirection: direction,
            menu(<MPMenuEntry>[
              MPMenuSubmenu(
                label: 'Open in',
                items: <MPMenuEntry>[MPMenuItem(label: 'New tab', onPressed: () {})],
              ),
            ]),
            overlay: true,
          ),
        );
        await openMenu(tester);
        await tester.tap(find.text('Open in'));
        await tester.pumpAndSettle();

        final Rect row = tester.getRect(find.text('Open in'));
        final Rect nested = tester.getRect(find.text('New tab'));
        final int turns = tester
            .widget<MPGlyph>(
              find.byWidgetPredicate(
                (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.chevron,
              ),
            )
            .quarterTurns;

        if (direction == TextDirection.rtl) {
          expect(nested.right, lessThan(row.left), reason: '$direction');
          expect(turns, 1);
        } else {
          expect(nested.left, greaterThan(row.right), reason: '$direction');
          expect(turns, -1);
        }

        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('a press on a rule in a submenu does not close the menu', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuSubmenu(
              label: 'Open in',
              items: <MPMenuEntry>[
                MPMenuItem(label: 'New tab'),
                MPMenuSeparator(),
                MPMenuItem(label: 'Split view', disabled: true),
              ],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Open in'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Split view'));
      await tester.pumpAndSettle();

      expect(find.text('New tab'), findsOneWidget);
    });
  });

  group('the keyboard', () {
    testWidgets('puts no stop of its own in front of the trigger', (WidgetTester tester) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          afterFocusStop(before, menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')])),
          overlay: true,
        ),
      );
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(MPButton)), isTrue);
    });

    group('hands the focus back to the trigger', () {
      /// A menu whose trigger holds the focus, opened from the keyboard, with
      /// [elsewhere] beside it when a row needs somewhere else to send it.
      Future<FocusNode> openFromTrigger(
        WidgetTester tester,
        List<MPMenuEntry> items, {
        FocusNode? elsewhere,
      }) async {
        final FocusNode before = FocusNode(debugLabel: 'before');
        final FocusNode button = FocusNode(debugLabel: 'trigger');
        addTearDown(before.dispose);
        addTearDown(button.dispose);

        await tester.pumpWidget(
          host(
            afterFocusStop(
              before,
              Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  MPMenu(
                    items: items,
                    trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                        MPButton(onPressed: open, focusNode: button, child: const Text('Open')),
                  ),
                  if (elsewhere != null)
                    Focus(focusNode: elsewhere, child: const SizedBox.square(dimension: 1)),
                ],
              ),
            ),
            overlay: true,
          ),
        );
        button.requestFocus();
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();

        expect(find.text('Copy'), findsOneWidget);

        return button;
      }

      testWidgets('when it is closed with escape', (WidgetTester tester) async {
        final FocusNode button = await openFromTrigger(tester, const <MPMenuEntry>[
          MPMenuItem(label: 'Copy'),
        ]);

        await tester.sendKeyEvent(LogicalKeyboardKey.escape);
        await tester.pumpAndSettle();

        expect(find.text('Copy'), findsNothing);
        expect(button.hasPrimaryFocus, isTrue);
        expect(_ringed(tester), isTrue);
      });

      testWidgets('when a row is picked', (WidgetTester tester) async {
        final FocusNode button = await openFromTrigger(tester, const <MPMenuEntry>[
          MPMenuItem(label: 'Copy'),
        ]);

        // Opened from the keyboard, the first row is already lit.
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();

        expect(find.text('Copy'), findsNothing);
        expect(button.hasPrimaryFocus, isTrue);
      });

      testWidgets('unless the row sent it somewhere of its own', (WidgetTester tester) async {
        final FocusNode field = FocusNode(debugLabel: 'field');
        addTearDown(field.dispose);

        final FocusNode button = await openFromTrigger(tester, <MPMenuEntry>[
          MPMenuItem(label: 'Copy', onPressed: field.requestFocus),
        ], elsewhere: field);

        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();

        expect(field.hasPrimaryFocus, isTrue);
        expect(button.hasFocus, isFalse);
      });

      testWidgets('and moves on from it with tab', (WidgetTester tester) async {
        final FocusNode field = FocusNode(debugLabel: 'field');
        addTearDown(field.dispose);

        await openFromTrigger(tester, const <MPMenuEntry>[
          MPMenuItem(label: 'Copy'),
        ], elsewhere: field);

        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pumpAndSettle();

        expect(find.text('Copy'), findsNothing);
        expect(field.hasPrimaryFocus, isTrue);
      });
    });

    testWidgets('hands the focus back to a trigger a pointer pressed, with no ring', (
      WidgetTester tester,
    ) async {
      final FocusNode button = FocusNode(debugLabel: 'trigger');
      addTearDown(button.dispose);

      await tester.pumpWidget(
        host(
          MPMenu(
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, focusNode: button, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );
      await openMenu(tester);
      await tester.tap(find.text('Copy'));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsNothing);
      expect(button.hasPrimaryFocus, isTrue);
      expect(_ringed(tester), isFalse);
    });

    testWidgets('opens on the down arrow with the first row lit, on the up with the last', (
      WidgetTester tester,
    ) async {
      final List<String> pressed = <String>[];
      final FocusNode button = FocusNode(debugLabel: 'trigger');
      addTearDown(button.dispose);

      await tester.pumpWidget(
        host(
          MPMenu(
            items: <MPMenuEntry>[
              MPMenuItem(label: 'Copy', onPressed: () => pressed.add('Copy')),
              MPMenuItem(label: 'Paste', onPressed: () => pressed.add('Paste')),
            ],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, focusNode: button, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );
      button.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['Copy', 'Paste']);
    });

    testWidgets('walks the rows and picks one', (WidgetTester tester) async {
      final List<String> pressed = <String>[];

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', onPressed: () => pressed.add('Copy')),
            MPMenuItem(label: 'Paste', onPressed: () => pressed.add('Paste')),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['Paste']);
    });

    testWidgets('wraps from the last row to the first, unless told not to', (
      WidgetTester tester,
    ) async {
      for (final bool loop in <bool>[true, false]) {
        final List<String> pressed = <String>[];

        await tester.pumpWidget(
          host(
            MPMenu(
              loopFocus: loop,
              items: <MPMenuEntry>[
                MPMenuItem(label: 'Copy', onPressed: () => pressed.add('Copy')),
                MPMenuItem(label: 'Paste', onPressed: () => pressed.add('Paste')),
              ],
              trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                  MPButton(onPressed: open, child: const Text('Open')),
            ),
            overlay: true,
          ),
        );
        await openMenu(tester);

        await tester.sendKeyEvent(LogicalKeyboardKey.end);
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();

        expect(pressed, <String>[if (loop) 'Copy' else 'Paste'], reason: 'loopFocus: $loop');

        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('lands on a disabled row, as React does, and does not fire it', (
      WidgetTester tester,
    ) async {
      final List<String> pressed = <String>[];

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', disabled: true, onPressed: () => pressed.add('Copy')),
            MPMenuItem(label: 'Paste', onPressed: () => pressed.add('Paste')),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, isEmpty);
      expect(find.text('Copy'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['Paste']);
    });

    testWidgets('opens and closes a submenu with the arrow keys', (WidgetTester tester) async {
      final List<String> pressed = <String>[];

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuSubmenu(
              label: 'Open in',
              items: <MPMenuEntry>[
                MPMenuItem(label: 'New tab', onPressed: () => pressed.add('New tab')),
              ],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('New tab'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('New tab'), findsNothing);
      expect(find.text('Open in'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['New tab']);
    });

    testWidgets('turns the submenu arrows round under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          menu(const <MPMenuEntry>[
            MPMenuSubmenu(
              label: 'Open in',
              items: <MPMenuEntry>[MPMenuItem(label: 'New tab')],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('New tab'), findsOneWidget);
    });

    testWidgets('jumps to a row by what was typed, disabled rows included', (
      WidgetTester tester,
    ) async {
      final List<String> pressed = <String>[];

      await tester.pumpWidget(
        host(
          menu(<MPMenuEntry>[
            MPMenuItem(label: 'Copy', onPressed: () => pressed.add('Copy')),
            MPMenuItem(label: 'Paste', disabled: true, onPressed: () => pressed.add('Paste')),
            MPMenuItem(label: 'Print', onPressed: () => pressed.add('Print')),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.keyP);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      // "Still found by typeahead", and still unavailable.
      expect(pressed, isEmpty);

      await tester.sendKeyEvent(LogicalKeyboardKey.keyP);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(pressed, <String>['Print']);
    });
  });

  group('accessibility', () {
    testWidgets('names the popup and calls it a menu of menu items', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy')], label: 'Actions'), overlay: true),
      );
      await openMenu(tester);

      expect(semanticsNodeLabelled(tester, 'Actions')!.role, SemanticsRole.menu);
      expect(semanticsNodeLabelled(tester, 'Copy')!.role, SemanticsRole.menuItem);

      handle.dispose();
    });

    testWidgets('says the trigger holds the focus while it is open, and whether it is open', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      final FocusNode button = FocusNode(debugLabel: 'trigger');
      addTearDown(button.dispose);

      await tester.pumpWidget(
        host(
          MPMenu(
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPButton(onPressed: open, focusNode: button, child: const Text('Open')),
          ),
          overlay: true,
        ),
      );

      Tristate expanded() =>
          semanticsNodeLabelled(tester, 'Open')!.getSemanticsData().flagsCollection.isExpanded;

      expect(semanticsLabelsWithAction(tester, SemanticsAction.focus), <String>['Open']);
      expect(expanded(), Tristate.isFalse);

      button.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
      expect(button.hasPrimaryFocus, isFalse);
      expect(_focusedLabels(tester), <String>['Open']);
      expect(expanded(), Tristate.isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(button.hasPrimaryFocus, isTrue);
      expect(expanded(), Tristate.isFalse);

      handle.dispose();
    });

    testWidgets('opens from a chip, with the state on the chip itself', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPMenu(
            items: const <MPMenuEntry>[MPMenuItem(label: 'Copy')],
            trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
                MPChip(onPressed: open, child: const Text('Filter')),
          ),
          overlay: true,
        ),
      );
      await tester.tap(find.text('Filter'));
      await tester.pumpAndSettle();

      expect(find.text('Copy'), findsOneWidget);
      expect(_focusedLabels(tester), <String>['Filter']);

      handle.dispose();
    });

    testWidgets('marks a ticked row checked and a chosen one checked in a set', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          menu(const <MPMenuEntry>[
            MPMenuCheckboxItem(label: 'Rulers', checked: true),
            MPMenuRadioGroup<String>(
              value: 'grid',
              items: <MPMenuRadioItem<String>>[
                MPMenuRadioItem<String>(value: 'grid', label: 'Grid'),
              ],
            ),
            MPMenuSubmenu(
              label: 'Open in',
              items: <MPMenuEntry>[MPMenuItem(label: 'New tab')],
            ),
          ]),
          overlay: true,
        ),
      );
      await openMenu(tester);

      final SemanticsNode rulers = semanticsNodeLabelled(tester, 'Rulers')!;
      final SemanticsNode grid = semanticsNodeLabelled(tester, 'Grid')!;
      final SemanticsNode submenu = semanticsNodeLabelled(tester, 'Open in')!;

      expect(rulers.role, SemanticsRole.menuItemCheckbox);
      expect(rulers.getSemanticsData().flagsCollection.isChecked, CheckedState.isTrue);
      expect(grid.role, SemanticsRole.menuItemRadio);
      expect(grid.getSemanticsData().flagsCollection.isChecked, CheckedState.isTrue);
      expect(grid.getSemanticsData().flagsCollection.isInMutuallyExclusiveGroup, isTrue);
      expect(submenu.getSemanticsData().flagsCollection.isExpanded, Tristate.isFalse);

      handle.dispose();
    });

    testWidgets('says a disabled row is unavailable', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(menu(const <MPMenuEntry>[MPMenuItem(label: 'Copy', disabled: true)]), overlay: true),
      );
      await openMenu(tester);

      expect(
        semanticsNodeLabelled(tester, 'Copy')!.getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );

      handle.dispose();
    });
  });
}
