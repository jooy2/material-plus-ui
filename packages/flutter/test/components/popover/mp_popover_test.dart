import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// The component files directly rather than the barrel, which pulls in every
// other component in the package and fails with any of them.
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/popover/mp_popover.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test finds `.mp-popover` in the document; here the popup is the
/// sheet the popover lifted into the overlay, found by the words on it.

const String _body = 'Three to five working days.';

MPPopoverTriggerBuilder _button(String label) {
  return (BuildContext context, VoidCallback toggle) =>
      MPButton(onPressed: toggle, child: Text(label));
}

/// The sheet's own decoration: the fill, the corner and the shadow.
BoxDecoration _sheetOf(WidgetTester tester) {
  return decorationWhere(
    tester,
    find.ancestor(of: find.text(_body), matching: find.byType(DecoratedBox)).last,
    (BoxDecoration decoration) => decoration.boxShadow != null,
  );
}

/// The sheet's laid-out box.
Rect _sheetRect(WidgetTester tester) {
  return tester.getRect(
    find.ancestor(of: find.text(_body), matching: find.byType(DecoratedBox)).last,
  );
}

Future<void> _pump(WidgetTester tester, Widget child, {TextDirection? textDirection}) async {
  await tester.pumpWidget(
    host(child, overlay: true, textDirection: textDirection ?? TextDirection.ltr),
  );
  await tester.pumpAndSettle();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('opening', () {
    testWidgets('is closed until its trigger is pressed', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(
          trigger: _button('Details'),
          title: const Text('Shipping'),
          child: const Text(_body),
        ),
      );

      expect(find.text(_body), findsNothing);

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();

      expect(find.text(_body), findsOneWidget);
    });

    testWidgets('reports every change', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), onOpenChange: changes.add, child: const Text(_body)),
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(changes, <bool>[true, false]);
    });

    testWidgets('opens with no trigger at all, for a controlled one', (WidgetTester tester) async {
      await _pump(tester, const MPPopover(open: true, child: Text(_body)));

      expect(find.text(_body), findsOneWidget);
    });

    testWidgets('starts open from initialOpen', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
      );

      expect(find.text(_body), findsOneWidget);
    });

    testWidgets('follows a controlled open and nothing else', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPPopover(
          open: false,
          trigger: _button('Details'),
          onOpenChange: changes.add,
          child: const Text(_body),
        ),
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();

      // Asked, and not opened: the parent owns the answer.
      expect(changes, <bool>[true]);
      expect(find.text(_body), findsNothing);
    });

    testWidgets('tells its trigger whether it is expanded', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await _pump(tester, MPPopover(trigger: _button('Details'), child: const Text(_body)));

      expect(
        semanticsNodeLabelled(
          tester,
          'Details',
        )!.getSemanticsData().flagsCollection.isExpanded.toBoolOrNull(),
        isFalse,
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();

      expect(
        semanticsNodeLabelled(
          tester,
          'Details',
        )!.getSemanticsData().flagsCollection.isExpanded.toBoolOrNull(),
        isTrue,
      );

      handle.dispose();
    });
  });

  group('the header', () {
    testWidgets('names the popup with its title, announced as a heading', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await _pump(
        tester,
        const MPPopover(
          open: true,
          title: Text('Shipping'),
          description: Text('For this address'),
          child: Text(_body),
        ),
      );

      final SemanticsNode title = semanticsNodeLabelled(tester, 'Shipping')!;
      final SemanticsData data = title.getSemanticsData();

      expect(data.flagsCollection.isHeader, isTrue);
      expect(data.flagsCollection.namesRoute, isTrue);
      expect(semanticsLabels(tester), contains('For this address'));

      handle.dispose();
    });

    testWidgets('is a dialog to a screen reader', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await _pump(tester, const MPPopover(open: true, title: Text('Shipping'), child: Text(_body)));

      SemanticsNode? dialog;

      bool visit(SemanticsNode node) {
        if (node.getSemanticsData().role == SemanticsRole.dialog) {
          dialog = node;

          return false;
        }

        node.visitChildren(visit);

        return dialog == null;
      }

      tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

      expect(dialog, isNotNull);
      expect(dialog!.getSemanticsData().flagsCollection.scopesRoute, isTrue);

      handle.dispose();
    });

    testWidgets('draws no header when there is nothing to put in one', (WidgetTester tester) async {
      await _pump(tester, const MPPopover(open: true, child: Text('Just a body.')));

      expect(find.text('Just a body.'), findsOneWidget);
      expect(find.bySemanticsLabel('Close'), findsNothing);
    });

    testWidgets('carries no × until asked, and closes on it', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPPopover(
          open: true,
          showClose: true,
          onOpenChange: changes.add,
          title: const Text('Shipping'),
          child: const Text(_body),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();

      expect(changes, <bool>[false]);
    });

    testWidgets('names the × in the locale it is given', (WidgetTester tester) async {
      await _pump(
        tester,
        const MPPopover(
          open: true,
          showClose: true,
          closeLabel: 'Dismiss',
          title: Text('Shipping'),
          child: Text(_body),
        ),
      );

      expect(find.bySemanticsLabel('Dismiss'), findsOneWidget);
    });

    testWidgets('sets the title in the rung’s title role', (WidgetTester tester) async {
      final Map<MPSize, double> sizes = <MPSize, double>{
        MPSize.xs: MPTypescale.material.titleSmall.size,
        MPSize.md: MPTypescale.material.titleMedium.size,
        MPSize.lg: MPTypescale.material.titleLarge.size,
        MPSize.xl: MPTypescale.material.headlineSmall.size,
      };

      for (final MapEntry<MPSize, double> entry in sizes.entries) {
        await _pump(
          tester,
          MPPopover(
            open: true,
            size: entry.key,
            title: const Text('Shipping'),
            child: const Text(_body),
          ),
        );

        expect(styleOf(tester, 'Shipping').fontSize, entry.value, reason: entry.key.name);
      }
    });
  });

  group('dismissing', () {
    testWidgets('closes from an action wired with MPPopoverClose', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(
          initialOpen: true,
          title: const Text('Filters'),
          child: MPPopoverClose(
            builder: (BuildContext context, VoidCallback close) =>
                MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
          ),
        ),
      );

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(find.text('Filters'), findsNothing);
    });

    testWidgets('closes on Escape', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text(_body), findsNothing);
    });

    testWidgets('refuses Escape when it must not be dismissed', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await _pump(
        tester,
        MPPopover(
          open: true,
          dismissible: false,
          onOpenChange: changes.add,
          title: const Text('Answer me'),
          child: const Text(_body),
        ),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(changes, isEmpty);
      expect(find.text(_body), findsOneWidget);
    });

    testWidgets('closes on a press outside, and refuses it when told to', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
      );

      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text(_body), findsNothing);

      await _pump(
        tester,
        MPPopover(
          key: const Key('stubborn'),
          trigger: _button('Details'),
          initialOpen: true,
          dismissible: false,
          child: const Text(_body),
        ),
      );

      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text(_body), findsOneWidget);
    });

    testWidgets('lets the page take a press outside while it is not modal', (
      WidgetTester tester,
    ) async {
      int pressed = 0;

      await _pump(
        tester,
        Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPButton(onPressed: () => pressed++, child: const Text('Elsewhere')),
            const SizedBox(height: 200),
            MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
          ],
        ),
      );

      await tester.tap(find.text('Elsewhere'));
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text(_body), findsNothing);
    });

    testWidgets('keeps a press outside off the page while it is modal', (
      WidgetTester tester,
    ) async {
      int pressed = 0;

      await _pump(
        tester,
        Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPButton(onPressed: () => pressed++, child: const Text('Elsewhere')),
            const SizedBox(height: 200),
            MPPopover(
              trigger: _button('Details'),
              initialOpen: true,
              modal: MPPopoverModal.on,
              child: const Text(_body),
            ),
          ],
        ),
      );

      await tester.tap(find.text('Elsewhere'), warnIfMissed: false);
      await tester.pumpAndSettle();

      // Closed by the press, which went no further.
      expect(pressed, 0);
      expect(find.text(_body), findsNothing);
    });
  });

  group('focus', () {
    testWidgets('moves into the popup and back to the trigger', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(
          trigger: _button('Details'),
          child: MPButton(onPressed: () {}, child: const Text('Inside')),
        ),
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Inside')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Details')), isTrue);
    });

    testWidgets('lets Tab leave a popover that is not modal, and closes it', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await _pump(
        tester,
        afterFocusStop(
          before,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPPopover(
                trigger: _button('Details'),
                child: MPButton(onPressed: () {}, child: const Text('Inside')),
              ),
              const SizedBox(height: 120),
              MPButton(onPressed: () {}, child: const Text('After')),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();
      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Inside')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();

      expect(find.text('Inside'), findsNothing);
      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'After')), isTrue);
    });

    testWidgets('keeps Tab inside a popover that traps the focus', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await _pump(
        tester,
        afterFocusStop(
          before,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPPopover(
                trigger: _button('Details'),
                modal: MPPopoverModal.trapFocus,
                child: MPButton(onPressed: () {}, child: const Text('Inside')),
              ),
              const SizedBox(height: 120),
              MPButton(onPressed: () {}, child: const Text('After')),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Details'));
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();

      expect(find.text('Inside'), findsOneWidget);
      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Inside')), isTrue);
    });
  });

  group('the popup', () {
    testWidgets('is surfaceContainer at elevation 2, on the medium corner', (
      WidgetTester tester,
    ) async {
      await _pump(tester, const MPPopover(open: true, child: Text(_body)));

      final BoxDecoration sheet = _sheetOf(tester);

      expect(sheet.color, light.surfaceContainer);
      expect(sheet.boxShadow, MPShadows.of(2));
      expect(sheet.borderRadius, BorderRadius.circular(12));
    });

    testWidgets('pads itself off the sheet ladder', (WidgetTester tester) async {
      final Map<MPSize, double> pads = <MPSize, double>{
        MPSize.xs: 10,
        MPSize.sm: 12,
        MPSize.md: 16,
        MPSize.lg: 20,
        MPSize.xl: 24,
      };

      for (final MapEntry<MPSize, double> entry in pads.entries) {
        await _pump(tester, MPPopover(open: true, size: entry.key, child: const Text(_body)));

        final Rect sheet = _sheetRect(tester);
        final Rect text = tester.getRect(find.text(_body));

        expect(text.left - sheet.left, entry.value, reason: entry.key.name);
      }
    });

    testWidgets('caps its width off the ladder', (WidgetTester tester) async {
      final Map<MPSize, double> caps = <MPSize, double>{
        MPSize.xs: 224,
        MPSize.sm: 256,
        MPSize.md: 320,
        MPSize.lg: 384,
        MPSize.xl: 512,
      };
      final String long = List<String>.filled(40, 'word').join(' ');

      for (final MapEntry<MPSize, double> entry in caps.entries) {
        await _pump(
          tester,
          MPPopover(
            open: true,
            size: entry.key,
            child: Column(children: <Widget>[const Text(_body), Text(long)]),
          ),
        );

        expect(_sheetRect(tester).width, entry.value, reason: entry.key.name);
      }
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      final String long = List<String>.filled(40, 'word').join(' ');

      await _pump(
        tester,
        MPConfigProvider(
          size: MPSize.xs,
          child: MPPopover(
            open: true,
            child: Column(children: <Widget>[const Text(_body), Text(long)]),
          ),
        ),
      );

      expect(_sheetRect(tester).width, 224);
    });

    testWidgets('takes a width of its own', (WidgetTester tester) async {
      final String long = List<String>.filled(60, 'word').join(' ');

      await _pump(
        tester,
        MPPopover(
          open: true,
          width: 420,
          child: Column(children: <Widget>[const Text(_body), Text(long)]),
        ),
      );

      expect(_sheetRect(tester).width, 420);
    });

    testWidgets('draws no wedge until asked, and one when it is', (WidgetTester tester) async {
      await _pump(tester, const MPPopover(open: true, child: Text(_body)));

      expect(find.byType(MPPopupArrow), findsNothing);

      await _pump(tester, const MPPopover(open: true, arrow: true, child: Text(_body)));

      final MPPopupArrow arrow = tester.widget<MPPopupArrow>(find.byType(MPPopupArrow));

      expect(arrow.color, light.surfaceContainer);
      expect(arrow.size, 10);
    });

    testWidgets('hangs below its trigger by sideOffset', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
      );

      final Rect trigger = tester.getRect(find.byType(MPButton));

      expect(_sheetRect(tester).top - trigger.bottom, 8);
    });

    testWidgets('shifts along its edge by alignOffset', (WidgetTester tester) async {
      await _pump(
        tester,
        MPPopover(trigger: _button('Details'), initialOpen: true, child: const Text(_body)),
      );
      final double centred = _sheetRect(tester).left;

      await _pump(
        tester,
        MPPopover(
          key: const Key('shifted'),
          trigger: _button('Details'),
          initialOpen: true,
          alignOffset: 20,
          child: const Text(_body),
        ),
      );

      expect(_sheetRect(tester).left - centred, 20);
    });

    testWidgets('lines its start up with the trigger’s, under RTL as well', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPPopover(
          trigger: _button('Details'),
          initialOpen: true,
          align: MPAlign.start,
          child: const Text(_body),
        ),
      );

      expect(_sheetRect(tester).left, tester.getRect(find.byType(MPButton)).left);

      await _pump(
        tester,
        MPPopover(
          key: const Key('rtl'),
          trigger: _button('Details'),
          initialOpen: true,
          align: MPAlign.start,
          child: const Text(_body),
        ),
        textDirection: TextDirection.rtl,
      );

      expect(_sheetRect(tester).right, tester.getRect(find.byType(MPButton)).right);
    });

    testWidgets('goes at once under reduced motion', (WidgetTester tester) async {
      final ValueNotifier<bool> open = ValueNotifier<bool>(true);
      addTearDown(open.dispose);

      await tester.pumpWidget(
        host(
          ValueListenableBuilder<bool>(
            valueListenable: open,
            builder: (BuildContext context, bool value, Widget? child) =>
                MPPopover(open: value, child: const Text(_body)),
          ),
          overlay: true,
          disableAnimations: true,
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text(_body), findsOneWidget);

      open.value = false;
      await tester.pump();
      await tester.pump();

      expect(find.text(_body), findsNothing);
    });
  });
}
