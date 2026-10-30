import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/page_layout/mp_page_layout.dart';
import 'package:material_plus_ui/src/components/sidebar/mp_sidebar.dart';
import 'package:material_plus_ui/src/components/sidebar/mp_sidebar_trigger.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/disposal.dart';
import '../../support/host.dart';

/// The React suite asks these of an `<aside>`, a `separator` and a dialog;
/// here they are asked of the box the column laid out, the slider its handle
/// is to a screen reader, and the layer the drawer lifts into the overlay.
void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('as a column', () {
    testWidgets('is the complementary region, and names itself', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(column(const MPSidebar(child: Text('Links'))), height: 400));

      final SemanticsData data = semanticsOf(tester, find.byType(MPSidebar)).getSemanticsData();

      // Two unnamed ones would be two regions called the same thing.
      expect(data.role, SemanticsRole.complementary);
      expect(data.label, 'Sidebar');
      handle.dispose();
    });

    testWidgets('takes a name of its own, and says the default in its language', (
      WidgetTester tester,
    ) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(column(const MPSidebar(label: 'Filters', child: Text('Links'))), height: 400),
      );

      expect(semanticsOf(tester, find.byType(MPSidebar)).getSemanticsData().label, 'Filters');

      await tester.pumpWidget(
        host(column(const MPSidebar(locale: 'ko', child: Text('Links'))), height: 400),
      );

      final String word = mpMessagesOf(
        tester.element(find.byType(MPSidebar)),
        mpLayoutMessages,
        locale: 'ko',
      )['sidebar']!;

      expect(word, isNot('Sidebar'));
      expect(semanticsOf(tester, find.byType(MPSidebar)).getSemanticsData().label, word);
      handle.dispose();
    });

    testWidgets('walks the width up the drawer ladder: 240, 288, 360, 416, 480', (
      WidgetTester tester,
    ) async {
      final List<double> widths = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(column(MPSidebar(size: size, child: const Text('Links'))), height: 400),
        );
        widths.add(tester.getSize(find.byType(MPSidebar)).width);
      }

      expect(widths, <double>[240, 288, 360, 416, 480]);
    });

    testWidgets('takes its size from an MPConfigProvider, and a width of its own', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          column(
            const MPConfigProvider(
              size: MPSize.sm,
              child: MPSidebar(child: Text('Links')),
            ),
          ),
          height: 400,
        ),
      );

      expect(tester.getSize(find.byType(MPSidebar)).width, 288);

      await tester.pumpWidget(
        host(column(const MPSidebar(width: 220, child: Text('Links'))), height: 400),
      );

      expect(tester.getSize(find.byType(MPSidebar)).width, 220);
    });

    testWidgets('pads its content off the sheet ladder, tightened by density', (
      WidgetTester tester,
    ) async {
      Offset inset() {
        return tester.getTopLeft(find.byKey(const Key('content'))) -
            tester.getTopLeft(find.byType(MPSidebar));
      }

      await tester.pumpWidget(
        host(
          column(const MPSidebar(child: SizedBox(key: Key('content'), height: 10))),
          height: 400,
        ),
      );

      expect(inset(), const Offset(16, 16));

      await tester.pumpWidget(
        host(
          column(const MPSidebar(density: -2, child: SizedBox(key: Key('content'), height: 10))),
          height: 400,
        ),
      );

      expect(inset(), const Offset(12, 12));

      await tester.pumpWidget(
        host(
          column(const MPSidebar(padded: false, child: SizedBox(key: Key('content'), height: 10))),
          height: 400,
        ),
      );

      expect(inset(), Offset.zero);
    });

    testWidgets('draws the hairline on the edge that faces the content', (
      WidgetTester tester,
    ) async {
      BorderDirectional? ruleOf() {
        return decorationsOf(tester, find.byType(MPSidebar))
            .map((BoxDecoration decoration) => decoration.border)
            .whereType<BorderDirectional>()
            .firstOrNull;
      }

      await tester.pumpWidget(host(column(const MPSidebar(child: Text('Links'))), height: 400));

      expect(ruleOf()!.end.color, light.outlineVariant);
      expect(ruleOf()!.start, BorderSide.none);

      await tester.pumpWidget(
        host(column(const MPSidebar(side: MPSidebarSide.end, child: Text('Links'))), height: 400),
      );

      expect(ruleOf()!.start.color, light.outlineVariant);
      expect(ruleOf()!.end, BorderSide.none);

      await tester.pumpWidget(
        host(column(const MPSidebar(variant: MPVariant.tonal, child: Text('Links'))), height: 400),
      );

      expect(ruleOf(), isNull);
    });

    testWidgets('paints each variant from a bar\'s roles, never an accent', (
      WidgetTester tester,
    ) async {
      final Map<MPVariant, Color> fills = <MPVariant, Color>{
        MPVariant.filled: light.surfaceContainerHighest,
        MPVariant.tonal: light.surfaceContainer,
        MPVariant.elevated: light.surfaceContainerLow,
        MPVariant.outlined: light.surface,
        MPVariant.text: const Color(0x00000000),
      };

      for (final MapEntry<MPVariant, Color> entry in fills.entries) {
        await tester.pumpWidget(
          host(column(MPSidebar(variant: entry.key, child: const Text('Links'))), height: 400),
        );

        expect(decorationsOf(tester, find.byType(MPSidebar)).first.color, entry.value);
      }

      // A bar's `elevated` is level 2, one above a box's.
      await tester.pumpWidget(
        host(
          column(const MPSidebar(variant: MPVariant.elevated, child: Text('Links'))),
          height: 400,
        ),
      );

      expect(decorationsOf(tester, find.byType(MPSidebar)).first.boxShadow, MPShadows.of(2));
    });

    testWidgets('moves the tone with the shadow when given a level', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(column(const MPSidebar(elevation: 3, child: Text('Links'))), height: 400),
      );

      final BoxDecoration paint = decorationsOf(tester, find.byType(MPSidebar)).first;

      expect(paint.color, light.surfaceContainerHigh);
      expect(paint.boxShadow, MPShadows.of(3));
    });

    testWidgets('takes the side the layout slot puts it on, with no prop of its own', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            collapseBelow: MPPageCollapse.none,
            endSidebar: MPSidebar(label: 'Contents', child: Text('Links')),
            child: Text('Body'),
          ),
          width: 700,
          height: 400,
        ),
      );

      final BorderDirectional rule = decorationsOf(
        tester,
        find.byType(MPSidebar),
      ).map((BoxDecoration decoration) => decoration.border).whereType<BorderDirectional>().first;

      // The trailing slot, so the rule is on the leading edge.
      expect(rule.end, BorderSide.none);
      expect(rule.start, isNot(BorderSide.none));
    });

    testWidgets('leaves the landmark role it cannot claim inside a page\'s content', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPPageLayout(
            skipLink: false,
            collapseBelow: MPPageCollapse.none,
            child: Align(
              alignment: Alignment.centerLeft,
              child: MPSidebar(label: 'Filters', child: Text('Links')),
            ),
          ),
          width: 700,
          height: 400,
        ),
      );

      // A complementary region inside the main one is a tree Flutter refuses;
      // the panel keeps its name as a region of the content.
      final SemanticsData data = semanticsOf(tester, find.byType(MPSidebar)).getSemanticsData();

      expect(data.role, isNot(SemanticsRole.complementary));
      expect(data.label, 'Filters');
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('scrolls a list longer than the screen on its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(column(const MPSidebar(child: SizedBox(height: 2000))), height: 400),
      );

      expect(
        find.descendant(of: find.byType(MPSidebar), matching: find.byType(Scrollable)),
        findsOneWidget,
      );
      expect(tester.getSize(find.byType(MPSidebar)).height, 400);
    });
  });

  group('the resize handle', () {
    testWidgets('offers no handle by default', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(column(const MPSidebar(child: Text('Links'))), height: 400));

      expect(find.bySemanticsLabel('Resize sidebar'), findsNothing);
      handle.dispose();
    });

    testWidgets('is a named control that reads back the width, in pixels', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          column(const MPSidebar(resizable: true, width: 220, child: Text('Links'))),
          height: 400,
        ),
      );

      final SemanticsData data = tester
          .getSemantics(find.bySemanticsLabel('Resize sidebar'))
          .getSemanticsData();

      expect(data.flagsCollection.isSlider, isTrue);
      expect(data.value, '220');
      expect(data.increasedValue, '236');
      expect(data.decreasedValue, '204');
      handle.dispose();
    });

    testWidgets('widens the column on a drag and reports every step', (WidgetTester tester) async {
      final List<double> seen = <double>[];
      final List<double> settled = <double>[];

      await tester.pumpWidget(
        host(
          column(
            MPSidebar(
              resizable: true,
              width: 220,
              onResize: seen.add,
              onResizeEnd: settled.add,
              child: const Text('Links'),
            ),
          ),
          height: 400,
        ),
      );

      final Rect box = tester.getRect(find.byType(MPSidebar));
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right - 1, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(seen, isNotEmpty);
      expect(seen.last, closeTo(260, 2));
      expect(settled.single, closeTo(260, 2));
      expect(tester.getSize(find.byType(MPSidebar)).width, closeTo(260, 2));
    });

    testWidgets('widens the column on a drag from the half of the handle past its edge', (
      WidgetTester tester,
    ) async {
      final List<double> settled = <double>[];

      await tester.pumpWidget(
        host(
          column(
            MPSidebar(
              resizable: true,
              width: 220,
              onResizeEnd: settled.add,
              child: const Text('Links'),
            ),
          ),
          height: 400,
        ),
      );

      // The handle is 8px wide and straddles the edge, so its outer half runs
      // from the edge to 4px past it.
      final Rect box = tester.getRect(find.byType(MPSidebar));
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right + 3, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(settled.single, closeTo(260, 2));
    });

    testWidgets('washes the whole handle in outlineVariant under the pointer', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          column(const MPSidebar(resizable: true, width: 220, child: Text('Links'))),
          height: 400,
        ),
      );

      // Nothing round the handle clips it, so its wash and its focus ring are
      // drawn across the edge rather than cut off at it.
      expect(
        tester
            .renderObject<RenderStack>(
              find.descendant(of: find.byType(MPSidebar), matching: find.byType(Stack)).first,
            )
            .clipBehavior,
        Clip.none,
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      final Rect box = tester.getRect(find.byType(MPSidebar));

      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(Offset(box.right + 3, box.center.dy));
      await tester.pumpAndSettle();

      final BoxDecoration wash =
          tester
                  .widget<AnimatedContainer>(
                    find.descendant(of: _handle(), matching: find.byType(AnimatedContainer)),
                  )
                  .decoration!
              as BoxDecoration;

      expect(wash.color, light.outlineVariant);
    });

    testWidgets('keeps a dragged width when the page around it rebuilds', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) => column(
              MPSidebar(
                resizable: true,
                // A caller that rebuilds on every step, which is the ordinary
                // way to show the width somewhere else.
                onResize: (double _) => setState(() {}),
                child: const Text('Links'),
              ),
            ),
          ),
          width: 700,
          height: 400,
        ),
      );

      final Rect box = tester.getRect(find.byType(MPSidebar));
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right - 1, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(tester.getSize(find.byType(MPSidebar)).width, closeTo(400, 2));
    });

    testWidgets('lets a new width outrank the one it was dragged to', (WidgetTester tester) async {
      Widget build(double width) {
        return host(
          column(MPSidebar(resizable: true, width: width, child: const Text('Links'))),
          height: 400,
        );
      }

      await tester.pumpWidget(build(220));

      final Rect box = tester.getRect(find.byType(MPSidebar));
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right - 1, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();
      await tester.pumpWidget(build(300));

      expect(tester.getSize(find.byType(MPSidebar)).width, 300);
    });

    testWidgets('clamps what a drag may set', (WidgetTester tester) async {
      final List<double> settled = <double>[];

      await tester.pumpWidget(
        host(
          column(
            MPSidebar(
              resizable: true,
              width: 220,
              maxWidth: 240,
              onResizeEnd: settled.add,
              child: const Text('Links'),
            ),
          ),
          height: 400,
        ),
      );

      final Rect box = tester.getRect(find.byType(MPSidebar));
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right - 1, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(200, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(settled.single, 240);
    });

    testWidgets('moves the edge from the semantics action too', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      final List<double> settled = <double>[];

      await tester.pumpWidget(
        host(
          column(
            MPSidebar(
              resizable: true,
              width: 220,
              onResizeEnd: settled.add,
              child: const Text('Links'),
            ),
          ),
          height: 400,
        ),
      );

      final SemanticsNode node = tester.getSemantics(find.bySemanticsLabel('Resize sidebar'));
      node.owner!.performAction(node.id, SemanticsAction.increase);
      await tester.pump();

      // A key press is a whole gesture on its own, so the settled callback
      // fires with it.
      expect(settled.single, 236);
      handle.dispose();
    });

    testWidgets('moves the edge outwards with the arrow keys, mirrored under RTL', (
      WidgetTester tester,
    ) async {
      for (final TextDirection direction in TextDirection.values) {
        final List<double> settled = <double>[];

        await tester.pumpWidget(
          host(
            column(
              MPSidebar(
                key: ValueKey<TextDirection>(direction),
                resizable: true,
                width: 220,
                onResizeEnd: settled.add,
                child: const Text('Links'),
              ),
            ),
            height: 400,
            textDirection: direction,
          ),
        );

        Focus.of(tester.element(_handle())).requestFocus();
        await tester.pump();

        // The start column grows towards the content, which is to the right in
        // English and to the left in Arabic.
        await tester.sendKeyEvent(
          direction == TextDirection.ltr
              ? LogicalKeyboardKey.arrowRight
              : LogicalKeyboardKey.arrowLeft,
        );

        expect(settled, <double>[236], reason: direction.name);
      }
    });

    for (final NavigationMode mode in NavigationMode.values) {
      testWidgets('keeps an arrow that moves nothing only in traditional navigation, '
          '${mode.name}', (WidgetTester tester) async {
        final List<double> settled = <double>[];

        await tester.pumpWidget(
          host(
            inNavigationMode(
              mode,
              column(
                MPSidebar(
                  resizable: true,
                  width: 240,
                  maxWidth: 240,
                  onResizeEnd: settled.add,
                  child: const Text('Links'),
                ),
              ),
            ),
            height: 400,
          ),
        );
        Focus.of(tester.element(_handle())).requestFocus();
        await tester.pump();

        expect(holdsFocus(tester, find.byType(MPSidebar)), isTrue);

        // At its widest. Under directional navigation the arrows are the only
        // way off the handle, so one that moves nothing goes on to the focus
        // system, and it reports nothing, having moved nothing.
        expect(
          await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight),
          mode == NavigationMode.traditional,
        );
        expect(settled, isEmpty);

        // An arrow that moves the edge is kept in both.
        expect(await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft), isTrue);
        expect(settled, <double>[224]);
      });
    }
  });

  group('as a drawer', () {
    testWidgets('becomes one once the window is below the class it collapses at', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          _window(
            const Size(500, 400),
            const MPSidebar(collapseBelow: MPPageCollapse.expanded, child: Text('Links')),
          ),
          overlay: true,
        ),
      );

      // A closed drawer is not on the screen at all, and there is no column.
      expect(find.text('Links'), findsNothing);

      await tester.pumpWidget(
        host(
          _window(
            const Size(900, 400),
            const MPSidebar(collapseBelow: MPPageCollapse.expanded, child: Text('Links')),
          ),
          overlay: true,
        ),
      );

      expect(find.text('Links'), findsOneWidget);
    });

    testWidgets('stays a column at every width outside a layout, unless told', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(_window(const Size(320, 400), const MPSidebar(child: Text('Links'))), overlay: true),
      );

      expect(find.text('Links'), findsOneWidget);
    });

    testWidgets('is named even when the column it was did not need to be', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          _window(
            const Size(500, 400),
            const MPSidebar(
              collapseBelow: MPPageCollapse.expanded,
              open: true,
              child: Text('Links'),
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Sidebar'), findsOneWidget);
      expect(find.text('Links'), findsOneWidget);
    });

    testWidgets('takes a title instead, once it has covered the screen', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          _window(
            const Size(500, 400),
            const MPSidebar(
              collapseBelow: MPPageCollapse.expanded,
              open: true,
              title: Text('Sections'),
              child: Text('Links'),
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Sections'), findsOneWidget);
      expect(find.text('Sidebar'), findsNothing);
    });

    testWidgets('paints MD3\'s modal drawer, at the rung\'s width or its own', (
      WidgetTester tester,
    ) async {
      Future<void> open(Widget sidebar) async {
        await tester.pumpWidget(host(_window(const Size(700, 500), sidebar), overlay: true));
        await tester.pumpAndSettle();
      }

      await open(
        const MPSidebar(collapseBelow: MPPageCollapse.expanded, open: true, child: Text('Links')),
      );

      final Finder panel = find.ancestor(
        of: find.text('Links'),
        matching: find.byWidgetPredicate(
          (Widget widget) =>
              widget is DecoratedBox &&
              (widget.decoration as BoxDecoration).color == light.surfaceContainerLow,
        ),
      );

      expect(tester.getSize(panel).width, 360);
      expect(
        (tester.widget<DecoratedBox>(panel).decoration as BoxDecoration).boxShadow,
        MPShadows.of(1),
      );

      await open(
        const MPSidebar(
          collapseBelow: MPPageCollapse.expanded,
          open: true,
          width: 300,
          child: Text('Links'),
        ),
      );

      expect(tester.getSize(panel).width, 300);
    });

    testWidgets('comes from the left in English and from the right in Arabic', (
      WidgetTester tester,
    ) async {
      for (final TextDirection direction in TextDirection.values) {
        await tester.pumpWidget(
          host(
            _window(
              const Size(700, 500),
              const MPSidebar(
                collapseBelow: MPPageCollapse.expanded,
                open: true,
                child: Text('Links'),
              ),
            ),
            overlay: true,
            textDirection: direction,
          ),
        );
        await tester.pumpAndSettle();

        final Rect links = tester.getRect(find.text('Links'));

        if (direction == TextDirection.ltr) {
          expect(links.left, lessThan(360));
        } else {
          expect(links.right, greaterThan(800 - 360));
        }
      }
    });

    testWidgets('closes from its own button, from Escape and from the scrim', (
      WidgetTester tester,
    ) async {
      final List<bool> asked = <bool>[];

      await tester.pumpWidget(
        host(
          _window(
            const Size(700, 500),
            MPSidebar(
              collapseBelow: MPPageCollapse.expanded,
              open: true,
              onOpenChange: asked.add,
              child: const Text('Links'),
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.tapAt(const Offset(780, 250));

      expect(asked, <bool>[false, false, false]);
    });

    testWidgets('opens and closes itself when nobody controls it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          _window(
            const Size(700, 500),
            const MPSidebar(
              collapseBelow: MPPageCollapse.expanded,
              initialOpen: true,
              child: Text('Links'),
            ),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Links'), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();

      expect(find.text('Links'), findsNothing);
    });

    testWidgets('builds its child once, not twice', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            sidebar: MPSidebar(child: Text('Links')),
            initialSidebarOpen: true,
            child: Text('Body'),
          ),
          width: 500,
          height: 400,
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Links'), findsOneWidget);
    });

    testWidgets('lets go of everything it made once it leaves the tree', (
      WidgetTester tester,
    ) async {
      for (final String className in <String>['AnimationController', 'CurvedAnimation']) {
        final ({int made, int kept}) seen = await disposalOf(tester, className, () async {
          await tester.pumpWidget(
            host(
              _window(
                const Size(700, 500),
                const MPSidebar(
                  collapseBelow: MPPageCollapse.expanded,
                  open: true,
                  child: Text('Links'),
                ),
              ),
              overlay: true,
            ),
          );
          await tester.pumpAndSettle();
        });

        expect(seen.made, greaterThan(0), reason: className);
        expect(seen.kept, 0, reason: className);
      }
    });

    testWidgets('slides nowhere for a reader who asked for less motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          _window(
            const Size(700, 500),
            const MPSidebar(
              collapseBelow: MPPageCollapse.expanded,
              open: true,
              child: Text('Links'),
            ),
            disableAnimations: true,
          ),
          overlay: true,
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(SlideTransition), findsNothing);
      expect(find.text('Links'), findsOneWidget);
    });
  });

  group('MPSidebarTrigger', () {
    testWidgets('renders nothing at all outside a layout', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSidebarTrigger()));

      expect(find.byType(MPButton), findsNothing);
    });

    testWidgets('renders nothing while the sidebar is still a column', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            collapseBelow: MPPageCollapse.medium,
            header: MPSidebarTrigger(),
            sidebar: MPSidebar(child: Text('Links')),
            child: Text('Body'),
          ),
          width: 780,
          height: 500,
          overlay: true,
        ),
      );

      expect(find.byType(MPButton), findsNothing);
    });

    testWidgets('opens the layout\'s sidebar, and says which way it will go', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPPageLayout(
            skipLink: false,
            header: Align(alignment: Alignment.centerLeft, child: MPSidebarTrigger()),
            sidebar: MPSidebar(child: Text('Links')),
            child: Text('Body'),
          ),
          width: 500,
          height: 500,
          overlay: true,
        ),
      );

      SemanticsData trigger() => tester.getSemantics(find.byType(MPButton)).getSemanticsData();

      expect(trigger().label, 'Open sidebar');
      expect(trigger().flagsCollection.isExpanded, Tristate.isFalse);
      expect(find.text('Links'), findsNothing);

      await tester.tap(find.byType(MPButton));
      await tester.pumpAndSettle();

      expect(find.text('Links'), findsOneWidget);
      expect(trigger().label, 'Close sidebar');
      expect(trigger().flagsCollection.isExpanded, Tristate.isTrue);
      handle.dispose();
    });

    testWidgets('opens the trailing sidebar when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            header: Align(
              alignment: Alignment.centerLeft,
              child: MPSidebarTrigger(side: MPSidebarSide.end),
            ),
            sidebar: MPSidebar(child: Text('Links')),
            endSidebar: MPSidebar(child: Text('Outline')),
            child: Text('Body'),
          ),
          width: 500,
          height: 500,
          overlay: true,
        ),
      );

      await tester.tap(find.byType(MPButton));
      await tester.pumpAndSettle();

      expect(find.text('Outline'), findsOneWidget);
      expect(find.text('Links'), findsNothing);
    });

    testWidgets('is a text icon button, square at its rung', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            header: Align(
              alignment: Alignment.centerLeft,
              child: MPSidebarTrigger(size: MPSize.xs),
            ),
            sidebar: MPSidebar(child: Text('Links')),
            child: Text('Body'),
          ),
          width: 500,
          height: 500,
          overlay: true,
        ),
      );

      expect(tester.widget<MPButton>(find.byType(MPButton)).variant, MPVariant.text);
      expect(tester.getSize(find.byType(MPButton)), const Size(32, 32));
    });
  });
}

/// The resize handle's track.
Finder _handle() {
  return find.descendant(
    of: find.byType(MPSidebar),
    matching: find.byWidgetPredicate(
      (Widget widget) => widget is MouseRegion && widget.cursor == SystemMouseCursors.resizeColumn,
    ),
  );
}

/// [child] in a window [size] wide, which is what a standalone sidebar's
/// `collapseBelow` is measured against.
Widget _window(Size size, Widget child, {bool disableAnimations = false}) {
  return MediaQuery(
    data: MediaQueryData(size: size, disableAnimations: disableAnimations),
    child: Align(alignment: Alignment.centerLeft, child: child),
  );
}

/// A sidebar in column mode, given loose width and the height of the host.
///
/// The host wraps what it is given in a box of the width the test asked for,
/// which would force the column to that width instead of letting it take the
/// one it decided on.
Widget column(Widget sidebar) => Align(alignment: Alignment.centerLeft, child: sidebar);
