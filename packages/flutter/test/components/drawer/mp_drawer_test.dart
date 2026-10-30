import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/drawer/mp_drawer.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads `.mp-drawer` and its classes; a widget test reads the
/// panel's own [Container]: its box, its decoration and where it is on the
/// screen. The screen the host lays out is 800 by 600.

/// The panel itself: the [Container] nearest round the title. Not the first
/// one under the drawer, which may be the trigger's: a button's animated box
/// builds one too.
Finder _panel() =>
    find.ancestor(of: find.text('Navigation'), matching: find.byType(Container)).first;

BoxDecoration _decorationOf(WidgetTester tester) =>
    tester.widget<Container>(_panel()).decoration! as BoxDecoration;

/// A drawer with a trigger that opens it, which is how an uncontrolled one is
/// used.
Widget _triggered({
  MPSide side = MPSide.left,
  bool disableAnimations = false,
  List<Widget>? actions,
}) {
  return host(
    overlay: true,
    disableAnimations: disableAnimations,
    MPDrawer(
      side: side,
      title: const Text('Navigation'),
      actions: actions,
      trigger: (BuildContext context, VoidCallback open) =>
          MPButton(onPressed: open, child: const Text('Menu')),
      child: const Text('Everything else.'),
    ),
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('modal', () {
    testWidgets('is closed until its trigger is pressed', (WidgetTester tester) async {
      await tester.pumpWidget(_triggered());
      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsNothing);

      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsOneWidget);
    });

    testWidgets('says it is a dialog, named by its title', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          const MPDrawer(
            open: true,
            title: Text('Navigation'),
            description: Text('Where everything is'),
            child: Text('Body'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final SemanticsNode layer = semanticsNodeLabelled(tester, 'Navigation')!;

      expect(layer.getSemanticsData().role, SemanticsRole.dialog);
      expect(layer.getSemanticsData().flagsCollection.scopesRoute, isTrue);
      expect(find.text('Where everything is'), findsOneWidget);

      handle.dispose();
    });

    testWidgets('takes a name of its own for a title that is not a Text', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          const MPDrawer(
            open: true,
            semanticLabel: 'Site navigation',
            title: Row(children: <Widget>[Text('Nav')]),
            child: Text('Body'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        semanticsNodeLabelled(tester, 'Site navigation')!.getSemanticsData().role,
        SemanticsRole.dialog,
      );

      handle.dispose();
    });

    testWidgets('announces its title as a heading', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          const MPDrawer(open: true, semanticLabel: 'Layer', title: Text('Navigation')),
        ),
      );
      await tester.pumpAndSettle();

      final SemanticsData title = semanticsNodeLabelled(tester, 'Navigation')!.getSemanticsData();

      expect(title.flagsCollection.isHeader, isTrue);
      expect(title.headingLevel, 2);

      handle.dispose();
    });

    testWidgets('draws a scrim over the page', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(overlay: true, const MPDrawer(open: true, title: Text('Navigation'))),
      );
      await tester.pumpAndSettle();

      final Iterable<Color> washes = tester
          .widgetList<ColoredBox>(find.byType(ColoredBox))
          .map((ColoredBox box) => box.color);

      expect(washes, contains(mpScrimColor(light)));
    });

    testWidgets('carries the × by default, and closes on it', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          overlay: true,
          MPDrawer(open: true, onOpenChange: changes.add, title: const Text('Navigation')),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();

      expect(changes, <bool>[false]);
    });

    testWidgets('takes a name of its own for the ×', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          const MPDrawer(open: true, closeLabel: 'Hide the menu', title: Text('Navigation')),
        ),
      );
      await tester.pumpAndSettle();

      expect(semanticsLabels(tester), contains('Hide the menu'));
      expect(semanticsLabels(tester), isNot(contains('Close')));

      handle.dispose();
    });

    testWidgets('drops the × when it is told to', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          overlay: true,
          const MPDrawer(open: true, showClose: false, title: Text('Navigation')),
        ),
      );
      await tester.pumpAndSettle();

      expect(semanticsLabels(tester), isNot(contains('Close')));

      handle.dispose();
    });

    testWidgets('closes from an action wired with MPDrawerClose', (WidgetTester tester) async {
      // An uncontrolled drawer has no state of the caller's for its Cancel
      // button to set.
      await tester.pumpWidget(
        host(
          overlay: true,
          MPDrawer(
            initialOpen: true,
            title: const Text('Filters'),
            actions: <Widget>[
              MPDrawerClose(
                builder: (BuildContext context, VoidCallback close) =>
                    MPButton(onPressed: close, child: const Text('Cancel')),
              ),
            ],
            child: const Text('Body'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Body'), findsOneWidget);

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(find.text('Body'), findsNothing);
    });

    testWidgets('leaves the panel to its owner while it is controlled', (
      WidgetTester tester,
    ) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          overlay: true,
          MPDrawer(
            open: true,
            onOpenChange: changes.add,
            title: const Text('Navigation'),
            child: const Text('Body'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(changes, <bool>[false]);
      expect(find.text('Body'), findsOneWidget);
    });

    testWidgets('closes on Escape and on a press on the scrim', (WidgetTester tester) async {
      await tester.pumpWidget(_triggered());
      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsNothing);

      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();
      // Past the right edge of a 360-wide left panel, on the scrim.
      await tester.tapAt(const Offset(700, 300));
      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsNothing);
    });

    testWidgets('refuses to be dismissed when it has to be answered', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          overlay: true,
          MPDrawer(
            open: true,
            dismissible: false,
            onOpenChange: changes.add,
            title: const Text('Answer me'),
            child: const Text('Body'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.tapAt(const Offset(700, 300));
      await tester.pumpAndSettle();

      expect(changes, isEmpty);
      expect(find.text('Body'), findsOneWidget);
    });

    testWidgets('does not close on a press on the panel', (WidgetTester tester) async {
      await tester.pumpWidget(_triggered());
      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();

      await tester.tapAt(const Offset(100, 500));
      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsOneWidget);
    });

    testWidgets('holds the focus while it is up, and gives it back to the trigger', (
      WidgetTester tester,
    ) async {
      final FocusNode trigger = FocusNode();
      addTearDown(trigger.dispose);

      await tester.pumpWidget(
        host(
          overlay: true,
          MPDrawer(
            title: const Text('Navigation'),
            trigger: (BuildContext context, VoidCallback open) =>
                MPButton(focusNode: trigger, onPressed: open, child: const Text('Menu')),
            child: const Text('Body'),
          ),
        ),
      );

      trigger.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(trigger.hasFocus, isFalse);
      expect(holdsFocus(tester, find.text('Body')), isFalse);
      expect(FocusManager.instance.primaryFocus, isA<FocusScopeNode>());

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(trigger.hasFocus, isTrue);
    });

    testWidgets('comes in from the edge it is attached to, and goes back out to it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_triggered());
      await tester.tap(find.text('Menu'));
      // The frame that lifts the layer, and the one that first draws it.
      await tester.pump();
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      // Off the left edge, on its way home.
      expect(tester.getTopLeft(_panel()).dx, lessThan(0));

      await tester.pumpAndSettle();

      expect(tester.getTopLeft(_panel()).dx, 0);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(tester.getTopLeft(_panel()).dx, lessThan(0));
    });

    testWidgets('travels the other way from the right', (WidgetTester tester) async {
      await tester.pumpWidget(_triggered(side: MPSide.right));
      await tester.tap(find.text('Menu'));
      await tester.pump();
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      expect(tester.getTopRight(_panel()).dx, greaterThan(800));

      await tester.pumpAndSettle();

      expect(tester.getTopRight(_panel()).dx, 800);
    });

    testWidgets('leaves faster than it arrived', (WidgetTester tester) async {
      // MD3's own pair: medium4 in, short4 out. An arrival is given time to
      // read as one; a departure has already said what it had to say.
      await tester.pumpWidget(_triggered());
      await tester.tap(find.text('Menu'));
      await tester.pump();
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(tester.getTopLeft(_panel()).dx, lessThan(0), reason: 'still arriving at 200ms');

      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // Gone off its edge, while the layer under it is still fading.
      expect(find.text('Everything else.'), findsOneWidget);
      expect(tester.getTopRight(_panel()).dx, lessThanOrEqualTo(0));

      await tester.pumpAndSettle();

      expect(find.text('Everything else.'), findsNothing);
    });

    testWidgets('simply appears for a reader who asked for less motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_triggered(disableAnimations: true));
      await tester.tap(find.text('Menu'));
      await tester.pump();
      await tester.pump();

      expect(tester.getTopLeft(_panel()).dx, 0);
    });

    testWidgets('keeps its edge physical under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          overlay: true,
          textDirection: TextDirection.rtl,
          const MPDrawer(open: true, title: Text('Navigation')),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getTopLeft(_panel()).dx, 0);
    });

    testWidgets('is lifted at elevation 1 on surfaceContainerLow', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(overlay: true, const MPDrawer(open: true, title: Text('Navigation'))),
      );
      await tester.pumpAndSettle();

      expect(_decorationOf(tester).color, light.surfaceContainerLow);
      expect(_decorationOf(tester).boxShadow, MPShadows.of(1));
    });
  });

  group('standard', () {
    testWidgets('is in the layout rather than lifted, and starts open', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          height: 400,
          const MPDrawer(
            mode: MPDrawerMode.standard,
            title: Text('Navigation'),
            child: Text('Everything else.'),
          ),
        ),
      );

      expect(find.text('Everything else.'), findsOneWidget);
      expect(tester.getSize(_panel()), const Size(360, 400));
    });

    testWidgets('is not a dialog, and draws no scrim', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(height: 400, const MPDrawer(mode: MPDrawerMode.standard, title: Text('Navigation'))),
      );

      final SemanticsData title = semanticsNodeLabelled(tester, 'Navigation')!.getSemanticsData();

      expect(title.role, isNot(SemanticsRole.dialog));
      expect(find.byType(ColoredBox), findsNothing);

      handle.dispose();
    });

    testWidgets('lies flat on surface', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(height: 400, const MPDrawer(mode: MPDrawerMode.standard, title: Text('Navigation'))),
      );

      expect(_decorationOf(tester).color, light.surface);
      expect(_decorationOf(tester).boxShadow, isNull);
    });

    testWidgets('carries no ×, because there would be nothing to reopen it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(height: 400, const MPDrawer(mode: MPDrawerMode.standard, title: Text('Navigation'))),
      );

      expect(semanticsLabels(tester), isNot(contains('Close')));

      handle.dispose();
    });

    testWidgets('takes a × when asked, and reports the press', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          height: 400,
          MPDrawer(
            mode: MPDrawerMode.standard,
            showClose: true,
            open: true,
            onOpenChange: changes.add,
            title: const Text('Navigation'),
          ),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pump();

      expect(changes, <bool>[false]);
      // Controlled: the panel stays until its owner says otherwise.
      expect(find.text('Navigation'), findsOneWidget);
    });

    testWidgets('renders nothing at all when it is closed', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          const MPDrawer(mode: MPDrawerMode.standard, open: false, title: Text('Navigation')),
        ),
      );

      expect(find.text('Navigation'), findsNothing);
      expect(find.byType(Container), findsNothing);
    });

    testWidgets('closes itself when nobody is driving it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          const MPDrawer(mode: MPDrawerMode.standard, showClose: true, title: Text('Navigation')),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pump();

      expect(find.text('Navigation'), findsNothing);
    });

    testWidgets('starts closed when initialOpen says so', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          const MPDrawer(
            mode: MPDrawerMode.standard,
            initialOpen: false,
            title: Text('Navigation'),
          ),
        ),
      );

      expect(find.text('Navigation'), findsNothing);
    });

    testWidgets('builds no trigger, because there is nothing to open', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          MPDrawer(
            mode: MPDrawerMode.standard,
            title: const Text('Navigation'),
            trigger: (BuildContext context, VoidCallback open) =>
                MPButton(onPressed: open, child: const Text('Menu')),
          ),
        ),
      );

      expect(find.text('Menu'), findsNothing);
    });

    testWidgets('closes from an MPDrawerClose too', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          MPDrawer(
            mode: MPDrawerMode.standard,
            title: const Text('Navigation'),
            actions: <Widget>[
              MPDrawerClose(
                builder: (BuildContext context, VoidCallback close) =>
                    MPButton(onPressed: close, child: const Text('Hide')),
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Hide'));
      await tester.pump();

      expect(find.text('Navigation'), findsNothing);
    });
  });

  group('the panel', () {
    Widget standard({
      MPSide side = MPSide.left,
      bool rounded = true,
      double? extent,
      MPSize? size,
      bool dividers = false,
      List<Widget>? actions,
      Widget? child,
    }) {
      // Aligned to its edge rather than handed the whole box, which would make
      // any panel exactly as big as the box: in a page a drawer sits in a row
      // or a column that lets it be its own size.
      return host(
        width: 800,
        height: 600,
        Align(
          alignment: switch (side) {
            MPSide.left => Alignment.centerLeft,
            MPSide.right => Alignment.centerRight,
            MPSide.top => Alignment.topCenter,
            MPSide.bottom => Alignment.bottomCenter,
          },
          child: MPDrawer(
            mode: MPDrawerMode.standard,
            side: side,
            rounded: rounded,
            extent: extent,
            size: size,
            dividers: dividers,
            actions: actions,
            title: const Text('Navigation'),
            child: child,
          ),
        ),
      );
    }

    testWidgets('rounds only the edge that faces the page', (WidgetTester tester) async {
      await tester.pumpWidget(standard());

      final BoxDecoration decoration = _decorationOf(tester);
      final Border border = decoration.border! as Border;

      expect(decoration.borderRadius, const BorderRadius.horizontal(right: Radius.circular(16)));
      expect(border.right.color, light.outlineVariant);
      expect(border.right.width, 1);
      expect(border.left, BorderSide.none);
      expect(border.top, BorderSide.none);
    });

    testWidgets('rounds a top or bottom sheet at extraLarge', (WidgetTester tester) async {
      await tester.pumpWidget(standard(side: MPSide.bottom));

      final BoxDecoration decoration = _decorationOf(tester);

      expect(decoration.borderRadius, const BorderRadius.vertical(top: Radius.circular(28)));
      expect((decoration.border! as Border).top.color, light.outlineVariant);
    });

    testWidgets('squares off when told to', (WidgetTester tester) async {
      await tester.pumpWidget(standard(rounded: false));

      expect(_decorationOf(tester).borderRadius, BorderRadius.zero);
    });

    testWidgets('takes the width its size implies along the sides', (WidgetTester tester) async {
      final List<double> widths = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(standard(size: size));
        widths.add(tester.getSize(_panel()).width);
      }

      expect(widths, <double>[240, 288, 360, 416, 480]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          height: 400,
          const MPConfigProvider(
            size: MPSize.xs,
            child: MPDrawer(mode: MPDrawerMode.standard, title: Text('Navigation')),
          ),
        ),
      );

      expect(tester.getSize(_panel()).width, 240);
    });

    testWidgets('takes an extent of its own as a width on a side panel', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(standard(extent: 280));

      expect(tester.getSize(_panel()).width, 280);
    });

    testWidgets('takes it as a height on a bottom sheet', (WidgetTester tester) async {
      await tester.pumpWidget(standard(side: MPSide.bottom, extent: 240));

      expect(tester.getSize(_panel()), const Size(800, 240));
    });

    testWidgets('is as tall as its content at the ends, up to 85%', (WidgetTester tester) async {
      await tester.pumpWidget(standard(side: MPSide.bottom, child: const SizedBox(height: 40)));

      final double short = tester.getSize(_panel()).height;

      expect(short, lessThan(200));

      await tester.pumpWidget(standard(side: MPSide.bottom, child: const SizedBox(height: 2000)));

      expect(tester.getSize(_panel()).height, 600 * 0.85);
    });

    testWidgets('scrolls the body and keeps the header and the actions in view', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        standard(
          actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Save'))],
          child: const SizedBox(height: 2000),
        ),
      );

      expect(find.byType(SingleChildScrollView), findsOneWidget);
      expect(tester.getBottomLeft(find.text('Save')).dy, lessThan(600));
      expect(tester.getTopLeft(find.text('Navigation')).dy, greaterThanOrEqualTo(0));
    });

    testWidgets('rules the sections when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        standard(
          dividers: true,
          actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Save'))],
          child: const Text('Body'),
        ),
      );

      final Iterable<BoxDecoration> rules = tester
          .widgetList<DecoratedBox>(
            find.descendant(of: _panel(), matching: find.byType(DecoratedBox)),
          )
          .map((DecoratedBox box) => box.decoration)
          .whereType<BoxDecoration>()
          .where((BoxDecoration decoration) => decoration.border is Border)
          .where((BoxDecoration decoration) {
            final Border border = decoration.border! as Border;

            return border.top.color == light.outlineVariant && border.bottom == BorderSide.none;
          });

      // Between the header and the body, and between the body and the actions.
      expect(rules, hasLength(2));
    });

    testWidgets('sets its title on the sheet ladder', (WidgetTester tester) async {
      await tester.pumpWidget(standard(size: MPSize.lg));

      expect(styleOf(tester, 'Navigation').fontSize, 22);
    });
  });
}
