import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/page_layout/mp_page_layout.dart';
import 'package:material_plus_ui/src/components/sidebar/mp_sidebar.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite asks these of a `<div>` and a `<main>`; here they are asked
/// of the boxes the layout laid out and the semantics nodes it claimed.
void main() {
  group('the arrangement', () {
    testWidgets('stacks the header, the band and the footer', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(header: Text('Header'), footer: Text('Footer'), child: Text('Body')),
          width: 900,
          height: 600,
        ),
      );

      expect(
        tester.getTopLeft(find.text('Header')).dy,
        lessThan(tester.getTopLeft(find.text('Body')).dy),
      );
      expect(
        tester.getTopLeft(find.text('Body')).dy,
        lessThan(tester.getTopLeft(find.text('Footer')).dy),
      );
      // The footer is at the bottom of the space, not under the last line.
      expect(tester.getBottomLeft(find.text('Footer')).dy, 600);
    });

    testWidgets('keeps the two sidebars in reading order around the content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            sidebar: SizedBox(width: 120, child: Text('Nav')),
            endSidebar: SizedBox(width: 120, child: Text('Aside')),
            child: Text('Body'),
          ),
          width: 900,
          height: 600,
        ),
      );

      final double nav = tester.getTopLeft(find.text('Nav')).dx;
      final double body = tester.getTopLeft(find.text('Body')).dx;
      final double aside = tester.getTopLeft(find.text('Aside')).dx;

      expect(nav, lessThan(body));
      expect(body, lessThan(aside));
    });

    testWidgets('draws nothing at all for a slot that was left empty', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPPageLayout(skipLink: false, child: Text('Body')), width: 900, height: 600),
      );

      expect(find.byType(Text), findsOneWidget);
    });

    testWidgets('runs the columns the other way under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            sidebar: SizedBox(width: 120, child: Text('Nav')),
            child: Text('Body'),
          ),
          width: 900,
          height: 600,
          textDirection: TextDirection.rtl,
        ),
      );

      expect(
        tester.getTopLeft(find.text('Nav')).dx,
        greaterThan(tester.getTopLeft(find.text('Body')).dx),
      );
    });
  });

  group('spans', () {
    testWidgets('spans the header across the sidebars by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            header: Text('Header'),
            sidebar: SizedBox(width: 120, child: Text('Nav')),
            child: Text('Body'),
          ),
          width: 900,
          height: 600,
        ),
      );

      expect(
        tester.getTopLeft(find.text('Header')).dy,
        lessThan(tester.getTopLeft(find.text('Nav')).dy),
      );
      expect(tester.getTopLeft(find.text('Header')).dx, 0);
    });

    testWidgets('puts the header between the sidebars when it spans the content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            headerSpan: MPPageSpan.content,
            header: Text('Header'),
            sidebar: SizedBox(width: 120, child: Text('Nav')),
            child: Text('Body'),
          ),
          width: 900,
          height: 600,
        ),
      );

      // The column takes the corner; the bar starts where the column ends.
      expect(tester.getTopLeft(find.text('Nav')).dy, 0);
      expect(tester.getTopLeft(find.text('Header')).dx, 120);
    });

    testWidgets('answers the same question for the footer separately', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            footerSpan: MPPageSpan.content,
            header: Text('Header'),
            footer: Text('Footer'),
            sidebar: SizedBox(width: 120, child: Text('Nav')),
            child: Text('Body'),
          ),
          width: 900,
          height: 600,
        ),
      );

      expect(tester.getTopLeft(find.text('Header')).dx, 0);
      expect(tester.getTopLeft(find.text('Footer')).dx, 120);
    });
  });

  group('the main region', () {
    testWidgets('claims the main role around the children', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPPageLayout(skipLink: false, child: Text('Body')), width: 900, height: 600),
      );

      expect(_roles(tester, SemanticsRole.main), hasLength(1));
      handle.dispose();
    });

    testWidgets('takes a name for that region', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPPageLayout(mainSemanticLabel: 'Search results', child: Text('Body')),
          width: 900,
          height: 600,
        ),
      );

      expect(_roles(tester, SemanticsRole.main).single.label, 'Search results');
      handle.dispose();
    });

    testWidgets('leaves the main role to a layout it is inside', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPPageLayout(
            mainSemanticLabel: 'Report',
            child: MPPageLayout(mainSemanticLabel: 'Pane', child: Text('Body')),
          ),
          width: 900,
          height: 600,
        ),
      );

      // A screen has one main region, and an inner layout is a part of that
      // screen rather than a second one. The name goes with the role.
      final List<SemanticsNode> mains = _roles(tester, SemanticsRole.main);

      expect(mains, hasLength(1));
      expect(mains.single.label, 'Report');
      expect(find.bySemanticsLabel('Pane'), findsNothing);
      // And one skip button, not one per layout.
      expect(
        semanticsLabels(tester).where((String label) => label == 'Skip to content'),
        hasLength(1),
      );
      handle.dispose();
    });
  });

  group('the skip link', () {
    testWidgets('is the first stop, ahead of anything in the header', (WidgetTester tester) async {
      final FocusNode first = FocusNode();
      addTearDown(first.dispose);

      await tester.pumpWidget(
        host(
          _keyboard(
            MPPageLayout(
              header: Focus(focusNode: first, child: const SizedBox(width: 40, height: 40)),
              child: const Text('Body'),
            ),
          ),
          width: 900,
          height: 600,
        ),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(MPPageLayout)), isTrue);
      expect(first.hasFocus, isFalse);
      expect(find.text('Skip to content'), findsOneWidget);

      // And the screen follows it in its own order.
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(first.hasFocus, isTrue);
      expect(find.text('Skip to content'), findsNothing);
    });

    testWidgets('is drawn only while the keyboard holds it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(_keyboard(const MPPageLayout(child: Text('Body'))), width: 900, height: 600),
      );

      expect(find.text('Skip to content'), findsNothing);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      final Rect pill = tester.getRect(find.text('Skip to content'));

      // Pinned to the leading corner, in front of the screen.
      expect(pill.left, greaterThan(12));
      expect(pill.top, greaterThan(12));
      expect(pill.left, lessThan(40));
    });

    testWidgets('sends the focus into the content, so the next Tab lands there', (
      WidgetTester tester,
    ) async {
      final FocusNode nav = FocusNode(debugLabel: 'nav');
      final FocusNode body = FocusNode(debugLabel: 'body');
      addTearDown(nav.dispose);
      addTearDown(body.dispose);

      await tester.pumpWidget(
        host(
          _keyboard(
            MPPageLayout(
              collapseBelow: MPPageCollapse.none,
              sidebar: SizedBox(
                width: 120,
                child: Focus(focusNode: nav, child: const SizedBox(height: 40)),
              ),
              child: Focus(focusNode: body, child: const SizedBox(height: 40)),
            ),
          ),
          width: 900,
          height: 600,
        ),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(nav.hasFocus, isFalse);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(body.hasFocus, isTrue);
    });

    testWidgets('says it in the language the layout was told to speak', (
      WidgetTester tester,
    ) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPPageLayout(locale: 'ko', child: Text('Body')), width: 900, height: 600),
      );

      final String word = mpMessagesOf(
        tester.element(find.byType(MPPageLayout)),
        mpLayoutMessages,
        locale: 'ko',
      )['skipToContent']!;

      expect(word, isNot('Skip to content'));
      expect(semanticsLabels(tester), contains(word));
      handle.dispose();
    });

    testWidgets('takes a word of its own', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPPageLayout(skipLabel: 'Skip to the report', child: Text('Body')),
          width: 900,
          height: 600,
        ),
      );

      expect(semanticsLabels(tester), contains('Skip to the report'));
      handle.dispose();
    });

    testWidgets('can be turned off', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPPageLayout(skipLink: false, child: Text('Body')), width: 900, height: 600),
      );

      expect(semanticsLabels(tester), isNot(contains('Skip to content')));
      handle.dispose();
    });
  });

  group('collapsing', () {
    testWidgets('tells a sidebar it is narrow below the class', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPPageLayout(sidebar: _Probe(), child: Text('Body')), width: 800, height: 600),
      );

      expect(find.text('drawer closed'), findsOneWidget);
    });

    testWidgets('and wide from it up', (WidgetTester tester) async {
      _wideView(tester);

      await tester.pumpWidget(
        host(const MPPageLayout(sidebar: _Probe(), child: Text('Body')), width: 840, height: 600),
      );

      expect(find.text('column start'), findsOneWidget);
    });

    testWidgets('keeps them columns at every width with none, and with compact', (
      WidgetTester tester,
    ) async {
      for (final MPPageCollapse collapse in <MPPageCollapse>[
        MPPageCollapse.none,
        MPPageCollapse.compact,
      ]) {
        await tester.pumpWidget(
          host(
            MPPageLayout(
              collapseBelow: collapse,
              sidebar: const _Probe(),
              child: const Text('Body'),
            ),
            width: 320,
            height: 600,
          ),
        );

        expect(find.text('column start'), findsOneWidget, reason: collapse.name);
      }
    });

    testWidgets('moves with the boundaries an MPConfigProvider sets', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            breakpoints: <MPWindowClass, double>{MPWindowClass.expanded: 700},
            child: MPPageLayout(sidebar: _Probe(), child: Text('Body')),
          ),
          width: 760,
          height: 600,
        ),
      );

      expect(find.text('column start'), findsOneWidget);
    });

    testWidgets('names the end each sidebar is on', (WidgetTester tester) async {
      _wideView(tester);

      await tester.pumpWidget(
        host(
          const MPPageLayout(sidebar: _Probe(), endSidebar: _Probe(), child: Text('Body')),
          width: 900,
          height: 600,
        ),
      );

      expect(find.text('column start'), findsOneWidget);
      expect(find.text('column end'), findsOneWidget);
    });
  });

  group('the drawers', () {
    testWidgets('holds the open state itself and hands it back', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPPageLayout(sidebar: _Probe(), child: Text('Body')), width: 400, height: 600),
      );

      expect(find.text('drawer closed'), findsOneWidget);

      await tester.tap(find.byType(_Probe));
      await tester.pump();

      expect(find.text('drawer open'), findsOneWidget);
    });

    testWidgets('starts open when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPPageLayout(
            initialEndSidebarOpen: true,
            sidebar: _Probe(),
            endSidebar: _Probe(),
            child: Text('Body'),
          ),
          width: 400,
          height: 600,
        ),
      );

      expect(find.text('drawer closed'), findsOneWidget);
      expect(find.text('drawer open'), findsOneWidget);
    });

    testWidgets('answers with what a controlled layout is given', (WidgetTester tester) async {
      final List<bool> seen = <bool>[];

      await tester.pumpWidget(
        host(
          MPPageLayout(
            sidebarOpen: false,
            onSidebarOpenChange: seen.add,
            sidebar: const _Probe(),
            child: const Text('Body'),
          ),
          width: 400,
          height: 600,
        ),
      );

      await tester.tap(find.byType(_Probe));
      await tester.pump();

      // The layout reported the ask and changed nothing: the state is the
      // caller's now.
      expect(seen, <bool>[true]);
      expect(find.text('drawer closed'), findsOneWidget);
    });
  });

  group('a resizable sidebar', () {
    testWidgets('widens a start column on a drag from the half of its handle over the content', (
      WidgetTester tester,
    ) async {
      final List<double> settled = <double>[];

      await tester.pumpWidget(host(_Resizable(onResizeEnd: settled.add), width: 800, height: 600));

      // The handle is 8px wide and straddles the edge, so its outer half lies
      // over the start of the scroll view beside the column, which takes a
      // press anywhere in it.
      final Rect box = tester.getRect(find.byType(MPSidebar).first);
      final TestGesture gesture = await tester.startGesture(
        Offset(box.right + 3, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(settled.single, closeTo(260, 2));
      expect(tester.getSize(find.byType(MPSidebar).first).width, closeTo(260, 2));
    });

    testWidgets('and under RTL, where the start column is on the right', (
      WidgetTester tester,
    ) async {
      final List<double> settled = <double>[];

      await tester.pumpWidget(
        host(
          _Resizable(onResizeEnd: settled.add),
          width: 800,
          height: 600,
          textDirection: TextDirection.rtl,
        ),
      );

      final Rect box = tester.getRect(find.byType(MPSidebar).first);
      final TestGesture gesture = await tester.startGesture(
        Offset(box.left - 3, box.center.dy),
        kind: PointerDeviceKind.mouse,
      );
      await gesture.moveBy(const Offset(-40, 0));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(settled.single, closeTo(260, 2));
    });

    testWidgets('draws a start column\'s handle over the content beside it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Resizable(), width: 800, height: 600));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      final Rect box = tester.getRect(find.byType(MPSidebar).first);

      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(Offset(box.right - 2, box.center.dy));
      await tester.pumpAndSettle();

      // The wash runs 4px past the edge, over the content's fill, and is
      // painted after it rather than under it.
      expect(
        tester.renderObject(find.byType(MPPageLayout)),
        paints
          ..something(_fills(_contentFill))
          ..something(_fills(MPColorScheme.fromSource().outlineVariant)),
      );
    });

    testWidgets('keeps the size and the place of every part, in both directions', (
      WidgetTester tester,
    ) async {
      for (final TextDirection direction in TextDirection.values) {
        await tester.pumpWidget(
          host(
            const _Resizable(headerSpan: MPPageSpan.content),
            width: 800,
            height: 600,
            textDirection: direction,
          ),
        );

        final bool rtl = direction == TextDirection.rtl;
        final Rect header = tester.getRect(find.text('Header'));

        expect(
          tester.getRect(find.byType(MPSidebar).first),
          Rect.fromLTWH(rtl ? 580 : 0, 0, 220, 600),
        );
        expect(header.left, 220);
        expect(header.right, 580);
        expect(
          tester.getRect(find.byKey(const Key('content'))),
          Rect.fromLTRB(220, header.bottom, 580, 600),
        );
        expect(
          tester.getRect(find.byType(MPSidebar).last),
          Rect.fromLTWH(rtl ? 0 : 580, 0, 220, 600),
        );
      }
    });

    testWidgets(
      'reads and tabs through the start column, the content and the end column in order',
      (WidgetTester tester) async {
        final SemanticsHandle handle = tester.ensureSemantics();
        final FocusNode nav = FocusNode(debugLabel: 'nav');
        final FocusNode body = FocusNode(debugLabel: 'body');
        final FocusNode outline = FocusNode(debugLabel: 'outline');

        addTearDown(nav.dispose);
        addTearDown(body.dispose);
        addTearDown(outline.dispose);

        await tester.pumpWidget(
          host(_Resizable(nav: nav, body: body, outline: outline), width: 800, height: 600),
        );

        expect(_readingOrder(tester), <String>[
          'Header',
          'Navigation',
          'Links',
          'Resize sidebar',
          'Page',
          'Body',
          'Outline',
          'Contents',
        ]);

        nav.requestFocus();
        await tester.pump();

        final List<FocusNode> stops = <FocusNode>[];

        for (int i = 0; i < 4; i++) {
          stops.add(FocusManager.instance.primaryFocus!);
          FocusManager.instance.primaryFocus!.nextFocus();
          await tester.pump();
        }

        // The handle is a stop of its own, between the column's links and the
        // content.
        expect(<FocusNode>[stops[0], stops[2], stops[3]], <FocusNode>[nav, body, outline]);
        expect(
          find.descendant(
            of: find.byType(MPSidebar).first,
            matching: find.byElementPredicate((Element element) => element == stops[1].context),
          ),
          findsOneWidget,
        );

        handle.dispose();
      },
    );
  });
}

/// A test view wider than the 800 a test gets by default, so a layout can be
/// given an expanded window's width.
void _wideView(WidgetTester tester) {
  tester.view
    ..physicalSize = const Size(1600, 900)
    ..devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

/// What the scroll view beside the columns is filled with.
const Color _contentFill = Color(0xFF123456);

/// Every semantics node that claims [role].
List<SemanticsNode> _roles(WidgetTester tester, SemanticsRole role) {
  final List<SemanticsNode> found = <SemanticsNode>[];

  bool visit(SemanticsNode node) {
    if (node.getSemanticsData().role == role) {
      found.add(node);
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return found;
}

/// The Tab key a `WidgetsApp` would give the tree, and the keyboard as the way
/// focus arrives, so the skip button can show itself.
Widget _keyboard(Widget child) {
  return Shortcuts(
    shortcuts: WidgetsApp.defaultShortcuts,
    child: Actions(
      actions: WidgetsApp.defaultActions,
      child: FocusScope(autofocus: true, child: child),
    ),
  );
}

/// A layout with a resizable start column, a scroll view that fills the band
/// to its edges, and a plain end column.
class _Resizable extends StatelessWidget {
  const _Resizable({
    this.onResizeEnd,
    this.headerSpan = MPPageSpan.full,
    this.nav,
    this.body,
    this.outline,
  });

  final ValueChanged<double>? onResizeEnd;
  final MPPageSpan headerSpan;
  final FocusNode? nav;
  final FocusNode? body;
  final FocusNode? outline;

  @override
  Widget build(BuildContext context) {
    return MPPageLayout(
      collapseBelow: MPPageCollapse.none,
      skipLink: false,
      headerSpan: headerSpan,
      header: const Text('Header'),
      mainSemanticLabel: 'Page',
      sidebar: MPSidebar(
        resizable: true,
        width: 220,
        label: 'Navigation',
        onResizeEnd: onResizeEnd,
        child: Focus(focusNode: nav, child: const Text('Links')),
      ),
      endSidebar: MPSidebar(
        width: 220,
        label: 'Outline',
        child: Focus(focusNode: outline, child: const Text('Contents')),
      ),
      child: SingleChildScrollView(
        key: const Key('content'),
        child: ColoredBox(
          color: _contentFill,
          child: Focus(
            focusNode: body,
            child: const SizedBox(height: 1200, child: Text('Body')),
          ),
        ),
      ),
    );
  }
}

/// Matches a rectangle filled with [color], after any number of other calls.
///
/// Compared as 8-bit channels, because a [Paint] hands its colour back through
/// single-precision storage.
PaintPatternPredicate _fills(Color color) {
  return (Symbol method, List<dynamic> arguments) =>
      method == #drawRect && (arguments[1] as Paint).color.toARGB32() == color.toARGB32();
}

/// Every label on the semantics tree, in the order a screen reader reads it.
List<String> _readingOrder(WidgetTester tester) {
  final List<String> labels = <String>[];

  void visit(SemanticsNode node) {
    if (node.label.isNotEmpty) {
      labels.add(node.label);
    }

    for (final SemanticsNode child in node.debugListChildrenInOrder(
      DebugSemanticsDumpOrder.traversalOrder,
    )) {
      visit(child);
    }
  }

  visit(tester.binding.renderViews.first.debugSemantics!);

  return labels;
}

/// A stand-in for a sidebar: it reports what the layout told it and can ask to
/// be opened. `MPSidebar` is the real reader of the same three facts.
class _Probe extends StatelessWidget {
  const _Probe();

  @override
  Widget build(BuildContext context) {
    final MPPageLayoutScope? layout = MPPageLayoutScope.maybeOf(context);
    final MPSidebarSide side = MPSidebarSideScope.maybeOf(context) ?? MPSidebarSide.start;
    final bool collapsed = layout?.collapsed ?? false;
    final bool open = layout?.open[side] ?? false;

    return GestureDetector(
      onTap: () => layout?.setOpen(side, !open),
      child: SizedBox(
        width: 120,
        child: Text(collapsed ? 'drawer ${open ? 'open' : 'closed'}' : 'column ${side.name}'),
      ),
    );
  }
}
