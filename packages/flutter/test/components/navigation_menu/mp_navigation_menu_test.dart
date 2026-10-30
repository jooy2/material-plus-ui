import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/navigation_menu/mp_navigation_menu.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// Product, which opens a panel, Developers, which is disabled, and Pricing,
/// which goes somewhere.
Widget navigation({
  MPOrientation orientation = MPOrientation.horizontal,
  MPSize? size,
  String? initialValue,
  ValueChanged<String?>? onChanged,
  List<String>? went,
  int columns = 1,
  bool developersDisabled = false,
}) {
  return MPNavigationMenu(
    semanticLabel: 'Main',
    orientation: orientation,
    size: size,
    initialValue: initialValue,
    onChanged: onChanged,
    items: <MPNavigationMenuItem>[
      MPNavigationMenuItem(
        value: 'product',
        label: 'Product',
        columns: columns,
        links: <MPNavigationMenuLink>[
          MPNavigationMenuLink(
            title: 'Overview',
            description: 'What the thing is, in one screen',
            onPressed: () => went?.add('Overview'),
          ),
          MPNavigationMenuLink(title: 'Changelog', onPressed: () => went?.add('Changelog')),
        ],
      ),
      MPNavigationMenuItem(
        value: 'developers',
        label: 'Developers',
        disabled: developersDisabled,
        links: <MPNavigationMenuLink>[
          MPNavigationMenuLink(title: 'Documentation', onPressed: () => went?.add('Docs')),
        ],
      ),
      MPNavigationMenuItem(label: 'Pricing', onPressed: () => went?.add('Pricing')),
    ],
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('links and triggers', () {
    testWidgets('is a navigation region, which is what a row of destinations is', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(navigation(), overlay: true));

      expect(semanticsNodeLabelled(tester, 'Main')!.role, SemanticsRole.navigation);

      handle.dispose();
    });

    testWidgets('announces an item with no links as a link, and goes there', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      final List<String> went = <String>[];

      await tester.pumpWidget(host(navigation(went: went), overlay: true));

      final SemanticsNode pricing = semanticsNodeLabelled(tester, 'Pricing')!;

      expect(pricing.getSemanticsData().flagsCollection.isLink, isTrue);
      expect(pricing.getSemanticsData().flagsCollection.isExpanded, Tristate.none);

      await tester.tap(find.text('Pricing'));
      await tester.pumpAndSettle();

      expect(went, <String>['Pricing']);

      handle.dispose();
    });

    testWidgets('announces an item with links as something that expands', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(navigation(), overlay: true));

      Tristate expanded() =>
          semanticsNodeLabelled(tester, 'Product')!.getSemanticsData().flagsCollection.isExpanded;

      expect(
        semanticsNodeLabelled(tester, 'Product')!.getSemanticsData().flagsCollection.isButton,
        isTrue,
      );
      expect(expanded(), Tristate.isFalse);

      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(expanded(), Tristate.isTrue);

      handle.dispose();
    });

    testWidgets('opens the panel, and the panel is full of links', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      final List<String> went = <String>[];

      await tester.pumpWidget(host(navigation(went: went), overlay: true));

      expect(find.text('Overview'), findsNothing);

      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsOneWidget);
      expect(
        semanticsNodeLabelled(tester, 'Overview')!.getSemanticsData().flagsCollection.isLink,
        isTrue,
      );

      await tester.tap(find.text('Changelog'));
      await tester.pumpAndSettle();

      expect(went, <String>['Changelog']);
      expect(find.text('Overview'), findsNothing);

      handle.dispose();
    });

    testWidgets('draws the description under the title, muted', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(), overlay: true));
      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(find.text('What the thing is, in one screen')).dy,
        greaterThan(tester.getTopLeft(find.text('Overview')).dy),
      );
      expect(styleOf(tester, 'What the thing is, in one screen').color, light.onSurfaceVariant);
    });

    testWidgets('leaves a disabled item in the row and opens nothing', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(developersDisabled: true), overlay: true));
      await tester.tap(find.text('Developers'));
      await tester.pumpAndSettle();

      expect(find.text('Developers'), findsOneWidget);
      expect(find.text('Documentation'), findsNothing);
      expect(
        styleOf(tester, 'Developers').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });

    testWidgets('marks the open item in the accent and turns its chevron', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      double turns() => tester
          .widget<AnimatedRotation>(
            find.ancestor(of: find.byType(MPGlyph), matching: find.byType(AnimatedRotation)).first,
          )
          .turns;

      expect(turns(), 0);

      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Product').color, light.primary);
      expect(styleOf(tester, 'Pricing').color, light.onSurface);
      expect(turns(), 0.5);
    });
  });

  group('the value', () {
    testWidgets('reports which panel opened, and which closed', (WidgetTester tester) async {
      final List<String?> seen = <String?>[];

      await tester.pumpWidget(host(navigation(onChanged: seen.add), overlay: true));
      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(seen, <String?>['product', null]);
    });

    testWidgets('starts with the panel it was told to', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(initialValue: 'product'), overlay: true));
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsOneWidget);
    });

    testWidgets('closes on a press outside', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(initialValue: 'product'), overlay: true));
      await tester.pumpAndSettle();
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsNothing);
    });
  });

  group('the pointer', () {
    testWidgets('opens a panel once it has rested, and crosses to the next at once', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Product')));
      await tester.pump();

      expect(find.text('Overview'), findsNothing);

      await tester.pumpAndSettle(const Duration(milliseconds: 100));

      expect(find.text('Overview'), findsOneWidget);

      await mouse.moveTo(tester.getCenter(find.text('Developers')));
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsNothing);
      expect(find.text('Documentation'), findsOneWidget);
    });

    testWidgets('closes a panel the pointer opened once it leaves', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Product')));
      await tester.pumpAndSettle(const Duration(milliseconds: 100));
      await mouse.moveTo(const Offset(1, 599));
      await tester.pumpAndSettle(const Duration(milliseconds: 100));

      expect(find.text('Overview'), findsNothing);
    });

    testWidgets('keeps a panel the pointer opened once it is pressed', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Product')));
      await tester.pumpAndSettle(const Duration(milliseconds: 100));
      await mouse.down(tester.getCenter(find.text('Product')));
      await mouse.up();
      await mouse.moveTo(const Offset(1, 599));
      await tester.pumpAndSettle(const Duration(milliseconds: 100));

      expect(find.text('Overview'), findsOneWidget);
    });
  });

  group('the keyboard', () {
    Future<void> tabIn(WidgetTester tester, Widget menu) async {
      final FocusNode before = FocusNode(debugLabel: 'before');
      addTearDown(before.dispose);

      await tester.pumpWidget(host(afterFocusStop(before, menu), overlay: true));
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
    }

    Finder item(String label) =>
        find.ancestor(of: find.text(label), matching: find.byType(MPInteractive)).first;

    testWidgets('walks the items with the arrows, past a disabled one', (
      WidgetTester tester,
    ) async {
      await tabIn(tester, navigation(developersDisabled: true));

      expect(holdsFocus(tester, item('Product')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(holdsFocus(tester, item('Pricing')), isTrue);
    });

    testWidgets('opens a panel on the down arrow and goes into it', (WidgetTester tester) async {
      final List<String> went = <String>[];

      await tabIn(tester, navigation(went: went));
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsOneWidget);
      expect(holdsFocus(tester, item('Overview')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(went, <String>['Changelog']);
      expect(holdsFocus(tester, item('Product')), isTrue);
    });

    testWidgets('closes a panel on escape and goes back to its item', (WidgetTester tester) async {
      await tabIn(tester, navigation());
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsNothing);
      expect(holdsFocus(tester, item('Product')), isTrue);
    });

    testWidgets('goes into an open panel with tab, and out of its end to the next item', (
      WidgetTester tester,
    ) async {
      await tabIn(tester, navigation());
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, item('Overview')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsNothing);
      expect(holdsFocus(tester, item('Developers')), isTrue);
    });
  });

  group('the surface', () {
    testWidgets('draws the panel on MD3’s own menu surface', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(initialValue: 'product'), overlay: true));
      await tester.pumpAndSettle();

      final BoxDecoration panel = tester
          .widgetList<Container>(find.byType(Container))
          .map((Container box) => box.decoration)
          .whereType<BoxDecoration>()
          .firstWhere((BoxDecoration decoration) => decoration.boxShadow?.isNotEmpty ?? false);

      expect(panel.color, light.surfaceContainer);
      expect(panel.boxShadow, MPShadows.of(2));
      expect(panel.borderRadius, BorderRadius.circular(4));
    });

    testWidgets('sets the items at control height', (WidgetTester tester) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      expect(
        tester
            .getSize(find.ancestor(of: find.text('Pricing'), matching: find.byType(SizedBox)).first)
            .height,
        56,
      );
    });

    testWidgets('lays the panel out in columns when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(navigation(initialValue: 'product', columns: 2), width: 800, overlay: true),
      );
      await tester.pumpAndSettle();

      final Offset overview = tester.getTopLeft(find.text('Overview'));
      final Offset changelog = tester.getTopLeft(find.text('Changelog'));

      expect(changelog.dy, overview.dy);
      expect(changelog.dx, greaterThan(overview.dx));
    });

    testWidgets('floors a column count it could not lay out', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(navigation(initialValue: 'product', columns: -1), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(
        tester.getTopLeft(find.text('Changelog')).dy,
        greaterThan(tester.getTopLeft(find.text('Overview')).dy),
      );
    });
  });

  group('orientation', () {
    testWidgets('runs across by default and down when told to, opening beside a rail', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(navigation(), overlay: true));

      expect(
        tester.getCenter(find.text('Pricing')).dx,
        greaterThan(tester.getCenter(find.text('Product')).dx),
      );

      await tester.pumpWidget(
        host(
          width: 200,
          navigation(orientation: MPOrientation.vertical, size: MPSize.sm),
          overlay: true,
        ),
      );
      await tester.tap(find.text('Product'));
      await tester.pumpAndSettle();

      expect(
        tester.getCenter(find.text('Pricing')).dy,
        greaterThan(tester.getCenter(find.text('Product')).dy),
      );
      expect(
        tester.getTopLeft(find.text('Overview')).dx,
        greaterThan(tester.getTopRight(find.text('Product')).dx),
      );
    });
  });
}
