import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/collapsible/mp_collapsible.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widgetList<DecoratedBox>(
            find.descendant(of: find.byType(MPCollapsible), matching: find.byType(DecoratedBox)),
          )
          .first
          .decoration
      as BoxDecoration;
}

/// Whether the body is on screen: built, and given some height.
bool _showing(WidgetTester tester, String body) {
  final Finder text = find.text(body);

  return text.evaluate().isNotEmpty && tester.getSize(find.byType(MPCollapsible)).height > 80;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('renders the heading and the subtitle on the trigger', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPCollapsible(
            title: Text('Delivery'),
            subtitle: Text('Standard'),
            child: Text('Body'),
          ),
        ),
      );

      expect(find.text('Delivery'), findsOneWidget);
      expect(find.text('Standard'), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('Delivery')).dy,
        lessThan(tester.getTopLeft(find.text('Standard')).dy),
      );
    });

    testWidgets('draws the chevron, and drops it when told to', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPCollapsible(title: Text('Delivery'))));
      expect(find.byType(MPGlyph), findsOneWidget);

      await tester.pumpWidget(
        host(width: 400, const MPCollapsible(indicator: false, title: Text('Delivery'))),
      );
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('is outlined by default and takes any variant', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPCollapsible(title: Text('Delivery'))));
      expect((_sheetOf(tester).border! as Border).top.color, light.outlineVariant);

      await tester.pumpWidget(
        host(width: 400, const MPCollapsible(variant: MPVariant.filled, title: Text('Delivery'))),
      );
      expect(_sheetOf(tester).color, light.surfaceContainerHighest);
    });

    testWidgets('pads the header by its size', (WidgetTester tester) async {
      for (final (MPSize size, double inset) in <(MPSize, double)>[
        (MPSize.xs, 10),
        (MPSize.md, 16),
        (MPSize.xl, 24),
      ]) {
        await tester.pumpWidget(
          host(width: 400, MPCollapsible(size: size, title: const Text('Delivery'))),
        );

        final Offset title = tester.getTopLeft(find.text('Delivery'));
        final Offset sheet = tester.getTopLeft(find.byType(MPCollapsible));

        // The hairline, then the padding.
        expect(title.dx - sheet.dx, inset + 1, reason: size.name);
      }
    });
  });

  group('folding', () {
    testWidgets('starts closed, and shows the body once the trigger is pressed', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPCollapsible(title: Text('Delivery'), child: Text('Body'))),
      );

      expect(find.text('Body'), findsNothing);

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(_showing(tester, 'Body'), isTrue);
    });

    testWidgets('starts open when told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPCollapsible(initialOpen: true, title: Text('Delivery'), child: Text('Body')),
        ),
      );

      expect(_showing(tester, 'Body'), isTrue);
    });

    testWidgets('reports every change', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(
            onOpenChange: changes.add,
            title: const Text('Delivery'),
            child: const Text('Body'),
          ),
        ),
      );

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(changes, <bool>[true, false]);
      expect(find.text('Body'), findsNothing);
    });

    testWidgets('stays where a controlled caller put it', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(
            open: false,
            onOpenChange: changes.add,
            title: const Text('Delivery'),
            child: const Text('Body'),
          ),
        ),
      );

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(changes, <bool>[true]);
      expect(find.text('Body'), findsNothing);
    });

    testWidgets('folds from the keyboard', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(focusNode: focus, title: const Text('Delivery'), child: const Text('Body')),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(_showing(tester, 'Body'), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsNothing);
    });

    testWidgets('eases the height open, and jumps under reduced motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 400, const MPCollapsible(title: Text('Delivery'), child: Text('Body'))),
      );
      final double closed = tester.getSize(find.byType(MPCollapsible)).height;

      await tester.tap(find.text('Delivery'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      final double midway = tester.getSize(find.byType(MPCollapsible)).height;
      await tester.pumpAndSettle();
      final double open = tester.getSize(find.byType(MPCollapsible)).height;

      expect(midway, greaterThan(closed));
      expect(midway, lessThan(open));

      await tester.pumpWidget(
        host(
          width: 400,
          disableAnimations: true,
          const MPCollapsible(key: Key('still'), title: Text('Delivery'), child: Text('Body')),
        ),
      );
      await tester.tap(find.text('Delivery'));
      await tester.pump();
      await tester.pump();

      expect(tester.getSize(find.byType(MPCollapsible)).height, open);
    });

    testWidgets('stops answering while disabled, and draws itself disabled', (
      WidgetTester tester,
    ) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(
            disabled: true,
            onOpenChange: changes.add,
            title: const Text('Delivery'),
            child: const Text('Body'),
          ),
        ),
      );

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(changes, isEmpty);
      expect(find.text('Body'), findsNothing);
      expect(
        styleOf(tester, 'Delivery').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });
  });

  group('the header slots', () {
    testWidgets('keeps action outside the trigger, so both can be pressed', (
      WidgetTester tester,
    ) async {
      int actions = 0;
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(
            onOpenChange: changes.add,
            title: const Text('Notifications'),
            action: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => actions++,
              child: const SizedBox(key: Key('switch'), width: 40, height: 24),
            ),
            child: const Text('Body'),
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('switch')));
      await tester.pumpAndSettle();

      expect(actions, 1);
      expect(changes, isEmpty);
    });

    testWidgets('takes a trigger of its own and hands it the wiring', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          MPCollapsible(
            triggerBuilder: (BuildContext context, bool open, VoidCallback toggle) =>
                GestureDetector(onTap: toggle, child: Text(open ? 'Hide' : 'Show')),
            child: const Text('Body'),
          ),
        ),
      );

      expect(find.byType(MPGlyph), findsNothing);

      await tester.tap(find.text('Show'));
      await tester.pumpAndSettle();

      expect(find.text('Hide'), findsOneWidget);
      expect(find.text('Body'), findsOneWidget);
    });
  });

  group('the panel', () {
    testWidgets('leaves the tree once closed, unless kept mounted', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPCollapsible(keepMounted: true, title: Text('Delivery'), child: Text('Body')),
        ),
      );

      expect(find.text('Body', skipOffstage: false), findsOneWidget);
    });

    testWidgets('takes no focus and says nothing while closed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 400,
          const MPCollapsible(keepMounted: true, title: Text('Delivery'), child: Text('Body')),
        ),
      );

      expect(find.bySemanticsLabel('Body'), findsNothing);
      semantics.dispose();
    });
  });

  group('semantics', () {
    testWidgets('is a button that says whether it is expanded', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPCollapsible(title: Text('Delivery'), child: Text('Body'))),
      );

      expect(
        tester.getSemantics(find.text('Delivery')),
        matchesSemantics(
          label: 'Delivery',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasExpandedState: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(
        tester.getSemantics(find.text('Delivery')),
        matchesSemantics(
          label: 'Delivery',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasExpandedState: true,
          isExpanded: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });
  });
}
