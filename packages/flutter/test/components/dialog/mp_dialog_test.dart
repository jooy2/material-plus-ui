import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/dialog/mp_dialog.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// The React suite reads `max-w-[560px]` off the sheet's class list and the
/// `role` off the element; here the sheet is measured and the role is read off
/// the semantics node the layer made.

final MPColorScheme _light = MPColorScheme.fromSource();

/// The sheet's own box: the one decoration in `surfaceContainerHigh`.
final Finder _sheet = find.byWidgetPredicate(
  (Widget widget) =>
      widget is DecoratedBox &&
      widget.decoration is BoxDecoration &&
      (widget.decoration as BoxDecoration).color == _light.surfaceContainerHigh,
);

BoxDecoration _sheetDecoration(WidgetTester tester) {
  return tester.widget<DecoratedBox>(_sheet).decoration as BoxDecoration;
}

/// A screen wide enough for the widest rung, so a cap is the sheet's and not
/// the screen's.
void _wideScreen(WidgetTester tester) {
  tester.view.physicalSize = const Size(1400, 900);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

/// A dialog wired to a variable, which is how a controlled caller uses it.
class _Controlled extends StatefulWidget {
  const _Controlled({this.showClose, this.dismissible = true});

  final bool? showClose;
  final bool dismissible;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  bool open = true;

  void reopen() => setState(() => open = true);

  @override
  Widget build(BuildContext context) {
    return MPDialog(
      open: open,
      onOpenChange: (bool next) => setState(() => open = next),
      showClose: widget.showClose,
      dismissible: widget.dismissible,
      title: const Text('Delete project'),
      child: const Text('This cannot be undone.'),
    );
  }
}

Future<void> _pump(WidgetTester tester, Widget child, {bool disableAnimations = false}) async {
  await tester.pumpWidget(host(child, overlay: true, disableAnimations: disableAnimations));
  await tester.pumpAndSettle();
}

/// The route a screen reader is in while it reads [text].
SemanticsNode _routeAround(WidgetTester tester, String text) {
  SemanticsNode? node = tester.getSemantics(find.text(text));

  while (node != null && !node.getSemanticsData().flagsCollection.scopesRoute) {
    node = node.parent;
  }

  return node!;
}

void main() {
  group('rendering', () {
    testWidgets('renders a modal dialog named by its title', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPDialog(
          initialOpen: true,
          title: Text('Delete project'),
          child: Text('This cannot be undone.'),
        ),
      );

      final SemanticsData layer = _routeAround(tester, 'Delete project').getSemanticsData();

      expect(layer.role, SemanticsRole.dialog);
      expect(layer.label, 'Delete project');
      expect(layer.flagsCollection.namesRoute, isTrue);

      semantics.dispose();
    });

    testWidgets('announces the title as a heading', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(tester, const MPDialog(initialOpen: true, title: Text('Delete project')));

      expect(
        tester
            .getSemantics(find.text('Delete project'))
            .getSemanticsData()
            .flagsCollection
            .isHeader,
        isTrue,
      );

      semantics.dispose();
    });

    testWidgets('takes a name of its own for a title that is not plain text', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPDialog(
          initialOpen: true,
          semanticLabel: 'Delete project',
          title: Text.rich(TextSpan(text: 'Delete “Aurora”?')),
        ),
      );

      expect(_routeAround(tester, 'Delete “Aurora”?').getSemanticsData().label, 'Delete project');

      semantics.dispose();
    });

    testWidgets('lays out the header, the body and the actions in order', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          title: const Text('Delete project'),
          description: const Text('Everything in it goes too.'),
          actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Delete'))],
          child: const Text('This cannot be undone.'),
        ),
      );

      final double title = tester.getTopLeft(find.text('Delete project')).dy;
      final double description = tester.getTopLeft(find.text('Everything in it goes too.')).dy;
      final double body = tester.getTopLeft(find.text('This cannot be undone.')).dy;
      final double actions = tester.getTopLeft(find.text('Delete')).dy;

      expect(title, lessThan(description));
      expect(description, lessThan(body));
      expect(body, lessThan(actions));
    });

    testWidgets('is not on the screen until it is opened', (WidgetTester tester) async {
      await _pump(tester, const MPDialog(title: Text('Delete project')));

      expect(find.text('Delete project'), findsNothing);
    });

    testWidgets('sets the actions against the end edge, the left under RTL', (
      WidgetTester tester,
    ) async {
      for (final TextDirection direction in TextDirection.values) {
        await tester.pumpWidget(
          host(
            MPDialog(
              initialOpen: true,
              title: const Text('Delete project'),
              actions: <Widget>[
                MPButton(onPressed: () {}, child: const Text('Cancel')),
                MPButton(onPressed: () {}, child: const Text('Delete')),
              ],
            ),
            overlay: true,
            textDirection: direction,
          ),
        );
        await tester.pumpAndSettle();

        final Rect sheet = tester.getRect(_sheet);
        final Rect last = tester.getRect(find.widgetWithText(MPButton, 'Delete'));
        final Rect first = tester.getRect(find.widgetWithText(MPButton, 'Cancel'));

        if (direction == TextDirection.ltr) {
          expect(sheet.right - last.right, 24, reason: 'ltr');
          expect(first.right, lessThan(last.left));
        } else {
          expect(last.left - sheet.left, 24, reason: 'rtl');
          expect(first.left, greaterThan(last.right));
        }
      }
    });

    testWidgets('centres the header under a hero icon, painted in the colour family', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        const MPDialog(
          initialOpen: true,
          color: MPColor.error,
          icon: SizedBox(key: Key('icon'), width: 24, height: 24),
          title: Text('Your export is ready'),
        ),
      );

      final Rect sheet = tester.getRect(_sheet);

      expect(tester.getCenter(find.byKey(const Key('icon'))).dx, closeTo(sheet.center.dx, 0.5));
      expect(tester.getCenter(find.text('Your export is ready')).dx, closeTo(sheet.center.dx, 0.5));
      expect(
        IconTheme.of(tester.element(find.byKey(const Key('icon')))).color,
        _light.accent(MPColor.error).color,
      );
    });

    testWidgets('keeps its header in a row when it carries a × as well', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        const MPDialog(
          initialOpen: true,
          showClose: true,
          icon: SizedBox(key: Key('icon'), width: 24, height: 24),
          title: Text('Your export is ready'),
        ),
      );

      final double icon = tester.getCenter(find.byKey(const Key('icon'))).dx;

      expect(icon, lessThan(tester.getTopLeft(find.text('Your export is ready')).dx));
    });
  });

  group('the sheet', () {
    testWidgets('is surfaceContainerHigh, at the extraLarge corner, at elevation 3', (
      WidgetTester tester,
    ) async {
      await _pump(tester, const MPDialog(initialOpen: true, title: Text('Settings')));

      final BoxDecoration decoration = _sheetDecoration(tester);

      expect(decoration.borderRadius, BorderRadius.circular(28));
      expect(decoration.boxShadow, MPShadows.of(3));
    });

    testWidgets('caps its width per size: 320, 400, 560, 720, 960', (WidgetTester tester) async {
      _wideScreen(tester);
      final List<double> widths = <double>[];

      for (final MPSize size in MPSize.values) {
        await _pump(tester, MPDialog(initialOpen: true, size: size, title: const Text('Settings')));
        widths.add(tester.getSize(_sheet).width);
      }

      expect(widths, <double>[320, 400, 560, 720, 960]);
    });

    testWidgets('takes a width of its own when the content decides it', (
      WidgetTester tester,
    ) async {
      _wideScreen(tester);

      await _pump(tester, const MPDialog(initialOpen: true, width: 720, title: Text('Settings')));

      expect(tester.getSize(_sheet).width, 720);
    });

    testWidgets('hugs its content when it is not full width', (WidgetTester tester) async {
      _wideScreen(tester);

      await _pump(
        tester,
        const MPDialog(initialOpen: true, fullWidth: false, title: Text('Sure?')),
      );

      expect(tester.getSize(_sheet).width, lessThan(560));
    });

    testWidgets('fills the screen when fullScreen, and squares its corners', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        const MPDialog(initialOpen: true, fullScreen: true, title: Text('Settings')),
      );

      expect(tester.getSize(_sheet), tester.view.physicalSize / tester.view.devicePixelRatio);
      expect(_sheetDecoration(tester).borderRadius, BorderRadius.zero);
    });

    testWidgets('scrolls only the body, keeping the header and the actions on screen', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          title: const Text('Terms of service'),
          actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Accept'))],
          child: const SizedBox(height: 3000),
        ),
      );

      final double screen = tester.view.physicalSize.height / tester.view.devicePixelRatio;

      expect(find.byType(SingleChildScrollView), findsOneWidget);
      expect(tester.getTopLeft(find.text('Terms of service')).dy, greaterThanOrEqualTo(0));
      expect(tester.getBottomLeft(find.text('Accept')).dy, lessThanOrEqualTo(screen));
    });

    testWidgets('rules the sections apart with dividers', (WidgetTester tester) async {
      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          dividers: true,
          title: const Text('Terms of service'),
          actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Accept'))],
          child: const Text('Clause 1'),
        ),
      );

      final Iterable<Color> rules = tester
          .widgetList<DecoratedBox>(find.byType(DecoratedBox))
          .map((DecoratedBox box) => box.decoration)
          .whereType<BoxDecoration>()
          .where((BoxDecoration decoration) => decoration.border is Border)
          .map((BoxDecoration decoration) => (decoration.border! as Border).top.color);

      expect(rules.where((Color color) => color == _light.outlineVariant), hasLength(2));
    });

    testWidgets('grows in, and shrinks back out faster than it arrived', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPDialog(
            trigger: (BuildContext context, VoidCallback open) =>
                MPButton(onPressed: open, child: const Text('Open')),
            title: const Text('Delete project'),
          ),
          overlay: true,
        ),
      );

      double scale() => tester.widget<ScaleTransition>(find.byType(ScaleTransition)).scale.value;

      await tester.tap(find.text('Open'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      expect(scale(), lessThan(1));
      expect(scale(), greaterThanOrEqualTo(0.95));

      // Halfway through the 400ms arrival it is still arriving.
      await tester.pump(const Duration(milliseconds: 150));
      expect(scale(), lessThan(1));

      await tester.pumpAndSettle();
      expect(scale(), 1);

      // The departure is given half the time: 200ms in, the sheet has gone
      // back down to where it started.
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      await tester.pump(MPMotion.short4);

      expect(scale(), closeTo(0.95, 0.001));

      await tester.pumpAndSettle();
      expect(find.text('Delete project'), findsNothing);
    });

    testWidgets('only fades when it is full screen, having no middle to grow from', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        const MPDialog(initialOpen: true, fullScreen: true, title: Text('Settings')),
      );

      expect(find.byType(ScaleTransition), findsNothing);
    });

    testWidgets('arrives at once for a reader who asked for less motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          MPDialog(
            trigger: (BuildContext context, VoidCallback open) =>
                MPButton(onPressed: open, child: const Text('Open')),
            title: const Text('Delete project'),
          ),
          overlay: true,
          disableAnimations: true,
        ),
      );

      await tester.tap(find.text('Open'));
      await tester.pump();
      await tester.pump();

      expect(tester.widget<ScaleTransition>(find.byType(ScaleTransition)).scale.value, 1);
    });
  });

  group('the scrim', () {
    testWidgets('is the scrim role at 32%, blurred 2px', (WidgetTester tester) async {
      await _pump(tester, const MPDialog(initialOpen: true, title: Text('Settings')));

      final Iterable<Color> washes = tester
          .widgetList<ColoredBox>(find.byType(ColoredBox))
          .map((ColoredBox box) => box.color);

      expect(washes, contains(mpScrimColor(_light)));
      expect(find.byType(BackdropFilter), findsOneWidget);
    });
  });

  group('opening and closing', () {
    testWidgets('opens from the trigger it was given', (WidgetTester tester) async {
      await _pump(
        tester,
        MPDialog(
          trigger: (BuildContext context, VoidCallback open) =>
              MPButton(onPressed: open, child: const Text('Open')),
          title: const Text('Settings'),
          child: const Text('Body'),
        ),
      );

      expect(find.text('Body'), findsNothing);

      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();

      expect(find.text('Body'), findsOneWidget);
    });

    testWidgets('reports the change to a controlled parent', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          showClose: true,
          closeLabel: 'Dismiss',
          onOpenChange: changes.add,
          title: const Text('Settings'),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Dismiss'));
      await tester.pumpAndSettle();

      expect(changes, <bool>[false]);
    });

    testWidgets('closes end to end through a controlled parent', (WidgetTester tester) async {
      await _pump(tester, const _Controlled(showClose: true));

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();

      expect(tester.state<_ControlledState>(find.byType(_Controlled)).open, isFalse);
      expect(find.text('This cannot be undone.'), findsNothing);
    });

    testWidgets('stays open when a controlled parent does not follow the report', (
      WidgetTester tester,
    ) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPDialog(open: true, onOpenChange: changes.add, title: const Text('Settings')),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(changes, <bool>[false]);
      expect(find.text('Settings'), findsOneWidget);
    });

    testWidgets('dismisses from an MPDialogClose in the actions', (WidgetTester tester) async {
      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          title: const Text('Settings'),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
            ),
          ],
        ),
      );

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(find.text('Settings'), findsNothing);
    });

    testWidgets('closes on Escape and on a press outside', (WidgetTester tester) async {
      await _pump(tester, const _Controlled());

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(tester.state<_ControlledState>(find.byType(_Controlled)).open, isFalse);

      tester.state<_ControlledState>(find.byType(_Controlled)).reopen();
      await tester.pumpAndSettle();

      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(tester.state<_ControlledState>(find.byType(_Controlled)).open, isFalse);
    });

    testWidgets('a press on the sheet is not a press outside it', (WidgetTester tester) async {
      await _pump(tester, const _Controlled());

      await tester.tapAt(tester.getTopLeft(_sheet) + const Offset(30, 6));
      await tester.pumpAndSettle();

      expect(tester.state<_ControlledState>(find.byType(_Controlled)).open, isTrue);
    });

    testWidgets('refuses Escape and a press outside when it is not dismissible', (
      WidgetTester tester,
    ) async {
      await _pump(tester, const _Controlled(dismissible: false));

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(tester.state<_ControlledState>(find.byType(_Controlled)).open, isTrue);
      expect(find.text('Delete project'), findsOneWidget);
    });

    testWidgets('closes from an MPDialogClose even when it is not dismissible', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPDialog(
          initialOpen: true,
          dismissible: false,
          title: const Text('Session expired'),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(onPressed: close, child: const Text('Sign in again')),
            ),
          ],
        ),
      );

      await tester.tap(find.text('Sign in again'));
      await tester.pumpAndSettle();

      expect(find.text('Session expired'), findsNothing);
    });
  });

  group('the ×', () {
    testWidgets('is absent on a basic dialog, which MD3 answers with its actions', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(tester, const MPDialog(initialOpen: true, title: Text('Settings')));

      expect(find.bySemanticsLabel('Close'), findsNothing);

      semantics.dispose();
    });

    testWidgets('is present on a full-screen one, which has no scrim left to press', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPDialog(initialOpen: true, fullScreen: true, title: Text('Settings')),
      );

      expect(find.bySemanticsLabel('Close'), findsOneWidget);

      semantics.dispose();
    });

    testWidgets('can be asked for, and is a 40px circle at the end of the header', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPDialog(initialOpen: true, showClose: true, title: Text('Settings')),
      );

      final Rect close = tester.getRect(find.bySemanticsLabel('Close'));

      expect(close.size, const Size(40, 40));
      expect(close.left, greaterThan(tester.getRect(find.text('Settings')).right));

      semantics.dispose();
    });
  });

  group('accessibility', () {
    testWidgets('takes the page behind it off the semantics tree while it is open', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      Widget tree(bool open) {
        return host(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Semantics(
                button: true,
                label: 'Behind',
                onTap: () {},
                child: const SizedBox(width: 10, height: 10),
              ),
              MPDialog(open: open, title: const Text('Title'), child: const Text('Body')),
            ],
          ),
          overlay: true,
        );
      }

      await tester.pumpWidget(tree(false));
      await tester.pumpAndSettle();
      expect(semanticsLabels(tester), contains('Behind'));

      await tester.pumpWidget(tree(true));
      await tester.pumpAndSettle();
      expect(semanticsLabels(tester), isNot(contains('Behind')));
      expect(semanticsLabels(tester), contains('Body'));

      await tester.pumpWidget(tree(false));
      await tester.pumpAndSettle();
      expect(semanticsLabels(tester), contains('Behind'));

      semantics.dispose();
    });

    testWidgets('holds the focus inside, and gives it back to the opener', (
      WidgetTester tester,
    ) async {
      final FocusNode trigger = FocusNode();
      addTearDown(trigger.dispose);

      await _pump(
        tester,
        MPDialog(
          trigger: (BuildContext context, VoidCallback open) =>
              MPButton(focusNode: trigger, onPressed: open, child: const Text('Open')),
          title: const Text('Settings'),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(onPressed: close, child: const Text('Done')),
            ),
          ],
        ),
      );

      trigger.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(trigger.hasPrimaryFocus, isFalse);

      // Tab goes round inside the sheet and never reaches the trigger.
      for (int step = 0; step < 4; step += 1) {
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        expect(trigger.hasFocus, isFalse);
      }

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(trigger.hasPrimaryFocus, isTrue);
    });

    testWidgets('is an alert dialog when the layer above says so', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPLayerRole(
          role: SemanticsRole.alertDialog,
          child: MPDialog(initialOpen: true, title: Text('Delete project')),
        ),
      );

      expect(
        _routeAround(tester, 'Delete project').getSemanticsData().role,
        SemanticsRole.alertDialog,
      );

      semantics.dispose();
    });

    testWidgets('keeps a full-screen header out from under the status bar', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        const MediaQuery(
          data: MediaQueryData(padding: EdgeInsets.only(top: 100, bottom: 30)),
          child: MPDialog(
            initialOpen: true,
            fullScreen: true,
            title: Text('Title'),
            child: SizedBox(height: 2000),
          ),
        ),
      );

      expect(tester.getTopLeft(find.text('Title')).dy, greaterThanOrEqualTo(100));
    });

    testWidgets('ends above a soft keyboard', (WidgetTester tester) async {
      await _pump(
        tester,
        MediaQuery(
          data: const MediaQueryData(viewInsets: EdgeInsets.only(bottom: 250)),
          child: MPDialog(
            initialOpen: true,
            title: const Text('Title'),
            actions: <Widget>[MPButton(onPressed: () {}, child: const Text('Save'))],
            child: const SizedBox(height: 400),
          ),
        ),
      );

      final double screen = tester.view.physicalSize.height / tester.view.devicePixelRatio;

      expect(tester.getBottomLeft(find.text('Save')).dy, lessThanOrEqualTo(screen - 250));
    });

    testWidgets('the × says what it does and is enabled', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        const MPDialog(initialOpen: true, showClose: true, title: Text('Settings')),
      );

      final SemanticsData close = semanticsNodeLabelled(tester, 'Close')!.getSemanticsData();

      expect(close.flagsCollection.isButton, isTrue);
      expect(close.flagsCollection.isEnabled, Tristate.isTrue);
      expect(close.hasAction(SemanticsAction.tap), isTrue);

      semantics.dispose();
    });
  });
}
