import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/tabs/mp_tabs.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The questions the React suite asks of `MPTabs`, asked of the render tree: a
/// `role="tab"` becomes a semantics node with the tab role, a computed height
/// becomes a measured box, and `data-mp-overflow` becomes the mask the bar
/// lays over itself.

/// The React suite's bar: three tabs, the third disabled, and a panel each.
Widget _bar({
  String? value,
  String? initialValue = 'overview',
  ValueChanged<String>? onChanged,
  MPTabsVariant variant = MPTabsVariant.primary,
  bool activateOnFocus = false,
  bool loopFocus = true,
  FocusNode? focusNode,
}) {
  return MPTabs<String>(
    semanticLabel: 'Sections',
    value: value,
    initialValue: initialValue,
    onChanged: onChanged,
    variant: variant,
    activateOnFocus: activateOnFocus,
    loopFocus: loopFocus,
    focusNode: focusNode,
    children: const <Widget>[
      MPTab<String>(value: 'overview', child: Text('Overview')),
      MPTab<String>(value: 'pricing', child: Text('Pricing')),
      MPTab<String>(value: 'faq', disabled: true, child: Text('FAQ')),
      MPTabPanel<String>(value: 'overview', child: Text('What it is')),
      MPTabPanel<String>(value: 'pricing', child: Text('What it costs')),
      MPTabPanel<String>(value: 'faq', child: Text('Everything else')),
    ],
  );
}

Finder _tab(String label) =>
    find.ancestor(of: find.text(label), matching: find.byType(MPTab<String>));

/// The indicator's box: the one positioned child of the bar's stack.
Rect _indicatorOf(WidgetTester tester) {
  return tester.getRect(
    find.descendant(of: find.byType(AnimatedPositioned), matching: find.byType(DecoratedBox)),
  );
}

BoxDecoration _indicatorPaint(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find.descendant(
              of: find.byType(AnimatedPositioned),
              matching: find.byType(DecoratedBox),
            ),
          )
          .decoration
      as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('panels', () {
    testWidgets('shows the panel belonging to the chosen tab, and only that one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      expect(find.text('What it is'), findsOneWidget);
      expect(find.text('What it costs'), findsNothing);
    });

    testWidgets('sorts tabs into the bar and panels into the body', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      expect(find.byType(MPTab<String>), findsNWidgets(3));
      expect(
        tester.getRect(find.text('What it is')).top,
        greaterThan(tester.getRect(_tab('Overview')).bottom),
      );
    });

    testWidgets('sorts them in any order', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPTabs<String>(
            initialValue: 'a',
            children: <Widget>[
              MPTab<String>(value: 'a', child: Text('A')),
              MPTabPanel<String>(value: 'a', child: Text('First panel')),
              MPTab<String>(value: 'b', child: Text('B')),
              MPTabPanel<String>(value: 'b', child: Text('Second panel')),
            ],
          ),
        ),
      );

      expect(tester.getRect(_tab('A')).top, tester.getRect(_tab('B')).top);

      await tester.tap(_tab('B'));
      await tester.pumpAndSettle();

      expect(find.text('Second panel'), findsOneWidget);
    });

    testWidgets('changes panel when a tab is pressed', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(host(width: 400, _bar(onChanged: changes.add)));
      await tester.tap(_tab('Pricing'));
      await tester.pumpAndSettle();

      expect(find.text('What it costs'), findsOneWidget);
      expect(changes, <String>['pricing']);
    });

    testWidgets('leaves a controlled bar where the caller put it', (WidgetTester tester) async {
      final List<String> changes = <String>[];

      await tester.pumpWidget(host(width: 400, _bar(value: 'overview', onChanged: changes.add)));
      await tester.tap(_tab('Pricing'));
      await tester.pumpAndSettle();

      expect(changes, <String>['pricing']);
      expect(find.text('What it is'), findsOneWidget);
    });

    testWidgets('starts on the first tab that is not disabled when told nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPTabs<String>(
            children: <Widget>[
              MPTab<String>(value: 'a', disabled: true, child: Text('A')),
              MPTab<String>(value: 'b', child: Text('B')),
              MPTabPanel<String>(value: 'a', child: Text('First panel')),
              MPTabPanel<String>(value: 'b', child: Text('Second panel')),
            ],
          ),
        ),
      );

      expect(find.text('Second panel'), findsOneWidget);
    });

    testWidgets('fades the arriving panel in, and nothing on the first paint', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      double opacityOf(String text) {
        return tester
            .widget<FadeTransition>(
              find.ancestor(of: find.text(text), matching: find.byType(FadeTransition)).first,
            )
            .opacity
            .value;
      }

      expect(opacityOf('What it is'), 1);

      await tester.tap(_tab('Pricing'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      expect(opacityOf('What it costs'), lessThan(1));

      await tester.pumpAndSettle();

      expect(opacityOf('What it costs'), 1);
      expect(find.text('What it is'), findsNothing);
    });

    testWidgets('does not fade for a reader who asked for less movement', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, disableAnimations: true, _bar()));
      await tester.tap(_tab('Pricing'));
      await tester.pump();

      final FadeTransition fade = tester.widget<FadeTransition>(
        find.ancestor(of: find.text('What it costs'), matching: find.byType(FadeTransition)).first,
      );

      expect(fade.opacity.value, 1);
    });

    testWidgets('takes a hidden panel out of the tree unless it is told to stay', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPTabs<String>(
            initialValue: 'a',
            children: <Widget>[
              MPTab<String>(value: 'a', child: Text('A')),
              MPTab<String>(value: 'b', child: Text('B')),
              MPTab<String>(value: 'c', child: Text('C')),
              MPTabPanel<String>(value: 'a', child: Text('First')),
              MPTabPanel<String>(value: 'b', keepMounted: true, child: Text('Second')),
              MPTabPanel<String>(value: 'c', child: Text('Third')),
            ],
          ),
        ),
      );

      expect(find.text('Third', skipOffstage: false), findsNothing);
      expect(find.text('Second', skipOffstage: false), findsOneWidget);
      expect(find.text('Second'), findsNothing);
    });

    testWidgets('keeps a kept panel’s state as it is switched away from and back', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPTabs<String>(
            initialValue: 'a',
            children: <Widget>[
              MPTab<String>(value: 'a', child: Text('A')),
              MPTab<String>(value: 'b', child: Text('B')),
              MPTabPanel<String>(value: 'a', keepMounted: true, child: _Counter()),
              MPTabPanel<String>(value: 'b', child: Text('Second')),
            ],
          ),
        ),
      );

      await tester.tap(find.text('Count 0'));
      await tester.pump();
      expect(find.text('Count 1'), findsOneWidget);

      await tester.tap(_tab('B'));
      await tester.pumpAndSettle();
      await tester.tap(_tab('A'));
      await tester.pumpAndSettle();

      expect(find.text('Count 1'), findsOneWidget);
    });
  });

  group('keyboard', () {
    testWidgets('is one tab stop, with the arrow keys moving the focus inside it', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      final FocusNode stop = FocusNode();
      addTearDown(before.dispose);
      addTearDown(stop.dispose);

      await tester.pumpWidget(host(width: 400, afterFocusStop(before, _bar(focusNode: stop))));

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, _tab('Overview')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      // `activateOnFocus` is off, so the arrow moves the focus and the panel
      // stays until the tab is actually chosen.
      expect(holdsFocus(tester, _tab('Pricing')), isTrue);
      expect(find.text('What it is'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(find.text('What it costs'), findsOneWidget);
      expect(holdsFocus(tester, _tab('Pricing')), isTrue);
    });

    testWidgets('chooses the tab an arrow key lands on when told to', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(host(width: 400, _bar(focusNode: stop, activateOnFocus: true)));

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('What it costs'), findsOneWidget);
    });

    testWidgets('skips a disabled tab, and wraps round the ends', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(host(width: 400, _bar(focusNode: stop, activateOnFocus: true)));

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      // Past FAQ, which is disabled, and round to the first.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(find.text('What it is'), findsOneWidget);
    });

    testWidgets('stops at the ends when told not to wrap', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(width: 400, _bar(focusNode: stop, activateOnFocus: true, loopFocus: false)),
      );

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('What it is'), findsOneWidget);
    });

    testWidgets('goes to either end on Home and End', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(host(width: 400, _bar(focusNode: stop)));

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();

      // The last tab that is not disabled.
      expect(holdsFocus(tester, _tab('Pricing')), isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, _tab('Overview')), isTrue);
    });

    testWidgets('runs the arrows the other way under RTL', (WidgetTester tester) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(
          width: 400,
          textDirection: TextDirection.rtl,
          _bar(focusNode: stop, activateOnFocus: true),
        ),
      );

      stop.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(find.text('What it costs'), findsOneWidget);
    });

    testWidgets('halts at an end and lets the arrow go under directional navigation', (
      WidgetTester tester,
    ) async {
      final FocusNode stop = FocusNode();
      addTearDown(stop.dispose);

      await tester.pumpWidget(
        host(
          width: 400,
          inNavigationMode(
            NavigationMode.directional,
            _bar(focusNode: stop, activateOnFocus: true),
          ),
        ),
      );

      stop.requestFocus();
      await tester.pump();

      final bool handled = await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();

      expect(handled, isFalse);
      expect(find.text('What it is'), findsOneWidget);
    });

    testWidgets('puts the stop back on the chosen tab once the focus has left', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(host(width: 400, afterFocusStop(before, _bar())));

      await tester.tap(_tab('Overview'));
      await tester.pump();
      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(holdsFocus(tester, _tab('Pricing')), isTrue);

      before.requestFocus();
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, _tab('Overview')), isTrue);
    });
  });

  group('drawing', () {
    testWidgets('draws MD3 primary tabs by default, 48 tall', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      expect(tester.getSize(_tab('Overview')).height, 48);
    });

    testWidgets('climbs the size ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(
            width: 400,
            MPTabs<String>(
              size: size,
              initialValue: 'a',
              children: const <Widget>[MPTab<String>(value: 'a', child: Text('A'))],
            ),
          ),
        );
        heights.add(tester.getSize(_tab('A')).height);
      }

      expect(heights, <double>[32, 40, 48, 56, 64]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPConfigProvider(
            size: MPSize.sm,
            child: MPTabs<String>(
              initialValue: 'a',
              children: <Widget>[MPTab<String>(value: 'a', child: Text('A'))],
            ),
          ),
        ),
      );

      expect(tester.getSize(_tab('A')).height, 40);
    });

    testWidgets('gives a primary indicator a rounded 3dp bar inset to the label', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, _bar()));
      await tester.pump();

      final Rect tab = tester.getRect(_tab('Overview'));
      final Rect indicator = _indicatorOf(tester);

      expect(indicator.height, 3);
      expect(indicator.width, closeTo(tab.width - 32, 0.01));
      expect(indicator.left, closeTo(tab.left + 16, 0.01));
      expect(_indicatorPaint(tester).borderRadius, isNotNull);
      expect(_indicatorPaint(tester).color, light.primary);
    });

    testWidgets('gives a secondary indicator a square 2dp bar across the whole tab', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, _bar(variant: MPTabsVariant.secondary)));
      await tester.pump();

      final Rect tab = tester.getRect(_tab('Overview'));
      final Rect indicator = _indicatorOf(tester);

      expect(indicator.height, 2);
      expect(indicator.width, closeTo(tab.width, 0.01));
      expect(_indicatorPaint(tester).borderRadius, isNull);
    });

    testWidgets('slides the indicator to the tab that is chosen', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));
      await tester.pump();
      await tester.tap(_tab('Pricing'));
      await tester.pumpAndSettle();

      expect(_indicatorOf(tester).left, closeTo(tester.getRect(_tab('Pricing')).left + 16, 0.01));
    });

    testWidgets('follows the chosen tab when a tab before it changes size on its own', (
      WidgetTester tester,
    ) async {
      final ValueNotifier<String> label = ValueNotifier<String>('A');
      addTearDown(label.dispose);

      await tester.pumpWidget(
        host(
          width: 400,
          MPTabs<String>(
            initialValue: 'b',
            children: <Widget>[
              MPTab<String>(
                value: 'a',
                child: ValueListenableBuilder<String>(
                  valueListenable: label,
                  builder: (BuildContext context, String text, Widget? _) => Text(text),
                ),
              ),
              const MPTab<String>(value: 'b', child: Text('B')),
            ],
          ),
        ),
      );
      await tester.pump();

      label.value = 'A much longer label';
      await tester.pumpAndSettle();

      expect(_indicatorOf(tester).left, closeTo(tester.getRect(_tab('B')).left + 16, 0.01));
    });

    testWidgets('writes the chosen label in the accent on a primary bar, plain ink on a '
        'secondary one', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Overview').color, light.primary);
      expect(styleOf(tester, 'Pricing').color, light.onSurfaceVariant);

      await tester.pumpWidget(host(width: 400, _bar(variant: MPTabsVariant.secondary)));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Overview').color, light.onSurface);
    });

    testWidgets('draws a disabled tab at the specification’s 38%', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'FAQ').color, light.onSurface.withValues(alpha: 0.38));
    });

    testWidgets('stacks a primary tab’s glyph and inlines a secondary one’s', (
      WidgetTester tester,
    ) async {
      Widget withGlyph(MPTabsVariant variant, {MPTabIconPosition? position}) {
        return MPTabs<String>(
          variant: variant,
          iconPosition: position,
          initialValue: 'a',
          children: const <Widget>[
            MPTab<String>(
              value: 'a',
              icon: SizedBox(key: Key('glyph'), width: 10, height: 10),
              child: Text('Label'),
            ),
          ],
        );
      }

      await tester.pumpWidget(host(width: 400, withGlyph(MPTabsVariant.primary)));

      expect(tester.getSize(_tab('Label')).height, 64);
      expect(
        tester.getRect(find.byKey(const Key('glyph'))).bottom,
        lessThan(tester.getRect(find.text('Label')).top),
      );

      await tester.pumpWidget(host(width: 400, withGlyph(MPTabsVariant.secondary)));

      expect(tester.getSize(_tab('Label')).height, 48);
      expect(
        tester.getRect(find.byKey(const Key('glyph'))).right,
        lessThan(tester.getRect(find.text('Label')).left),
      );

      // And moved against the variant when told to.
      await tester.pumpWidget(
        host(width: 400, withGlyph(MPTabsVariant.primary, position: MPTabIconPosition.start)),
      );

      expect(tester.getSize(_tab('Label')).height, 48);
    });

    testWidgets('rules the bar off from the content, and stops when told to', (
      WidgetTester tester,
    ) async {
      Iterable<BoxDecoration> rules() {
        return tester
            .widgetList<DecoratedBox>(
              find.descendant(of: find.byType(MPTabs<String>), matching: find.byType(DecoratedBox)),
            )
            .map((DecoratedBox box) => box.decoration)
            .whereType<BoxDecoration>()
            .where((BoxDecoration decoration) => decoration.border != null);
      }

      await tester.pumpWidget(host(width: 400, _bar()));

      final Border border = rules().single.border! as Border;
      expect(border.bottom.color, light.outlineVariant);
      expect(border.bottom.width, 1);

      await tester.pumpWidget(
        host(
          width: 400,
          const MPTabs<String>(
            divider: false,
            initialValue: 'a',
            children: <Widget>[MPTab<String>(value: 'a', child: Text('A'))],
          ),
        ),
      );

      expect(rules(), isEmpty);
    });

    testWidgets('runs the bar the full width it is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      final Rect bar = tester.getRect(find.byType(MPTabs<String>));

      expect(bar.width, 400);
      expect(tester.getRect(_tab('Overview')).left, bar.left);
    });

    testWidgets('starts the tabs at the right under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, textDirection: TextDirection.rtl, _bar()));

      expect(
        tester.getRect(_tab('Overview')).right,
        tester.getRect(find.byType(MPTabs<String>)).right,
      );
      expect(
        tester.getRect(_tab('Pricing')).right,
        lessThanOrEqualTo(tester.getRect(_tab('Overview')).left),
      );
    });

    testWidgets('divides the bar evenly when told to fill it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPTabs<String>(
            fullWidth: true,
            initialValue: 'a',
            children: <Widget>[
              MPTab<String>(value: 'a', child: Text('A')),
              MPTab<String>(value: 'b', child: Text('A much longer label')),
            ],
          ),
        ),
      );

      expect(tester.getSize(_tab('A')).width, 300);
      expect(tester.getSize(_tab('A much longer label')).width, 300);
    });

    testWidgets('washes a tab in its ink while hovered', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(_tab('Pricing')));
      await tester.pumpAndSettle();

      final Iterable<Color?> washes = tester
          .widgetList<AnimatedContainer>(
            find.descendant(of: _tab('Pricing'), matching: find.byType(AnimatedContainer)),
          )
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(washes, contains(light.onSurfaceVariant.withValues(alpha: 0.08)));
    });
  });

  group('a bar with more tabs than room', () {
    const List<String> names = <String>[
      'Overview',
      'Activity',
      'Settings',
      'Members',
      'Billing',
      'Integrations',
    ];

    Widget narrow({String initial = 'Overview', TextDirection direction = TextDirection.ltr}) {
      return host(
        width: 320,
        textDirection: direction,
        MPTabs<String>(
          initialValue: initial,
          children: <Widget>[
            for (final String name in names) MPTab<String>(value: name, child: Text(name)),
          ],
        ),
      );
    }

    testWidgets('scrolls rather than overflowing its box', (WidgetTester tester) async {
      await tester.pumpWidget(narrow());
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(MPTabs<String>)).width, 320);
      expect(find.byType(SingleChildScrollView), findsOneWidget);
    });

    testWidgets('fades the end that still has tabs past it', (WidgetTester tester) async {
      await tester.pumpWidget(narrow());
      await tester.pump();

      expect(find.byType(ShaderMask), findsOneWidget);
    });

    testWidgets('says nothing at all while every tab fits', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, _bar()));
      await tester.pump();

      expect(find.byType(ShaderMask), findsNothing);
    });

    testWidgets('opens with the chosen tab in view, moving only the bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(narrow(initial: 'Integrations'));
      await tester.pump();

      final Rect bar = tester.getRect(find.byType(MPTabs<String>));
      final Rect tab = tester.getRect(_tab('Integrations'));

      expect(tab.left, greaterThanOrEqualTo(bar.left));
      expect(tab.right, lessThanOrEqualTo(bar.right));
    });

    testWidgets('opens with the chosen tab in view under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(narrow(initial: 'Integrations', direction: TextDirection.rtl));
      await tester.pump();

      final Rect bar = tester.getRect(find.byType(MPTabs<String>));
      final Rect tab = tester.getRect(_tab('Integrations'));

      expect(tab.left, greaterThanOrEqualTo(bar.left));
      expect(tab.right, lessThanOrEqualTo(bar.right));
    });
  });

  group('accessibility', () {
    testWidgets('names the bar and says it is a set of tabs', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _bar()));

      final SemanticsNode bar = semanticsNodeLabelled(tester, 'Sections')!;

      expect(bar.getSemanticsData().role, SemanticsRole.tabBar);
      expect(bar.childrenCount, 3);

      handle.dispose();
    });

    testWidgets('says each tab is a tab, and which one is chosen', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _bar()));

      final SemanticsData overview = semanticsNodeLabelled(tester, 'Overview')!.getSemanticsData();
      final SemanticsData pricing = semanticsNodeLabelled(tester, 'Pricing')!.getSemanticsData();
      final SemanticsData faq = semanticsNodeLabelled(tester, 'FAQ')!.getSemanticsData();

      expect(overview.role, SemanticsRole.tab);
      expect(overview.flagsCollection.isSelected, Tristate.isTrue);
      expect(pricing.flagsCollection.isSelected, Tristate.isFalse);
      expect(pricing.hasAction(SemanticsAction.tap), isTrue);
      expect(faq.flagsCollection.isEnabled, Tristate.isFalse);

      handle.dispose();
    });

    testWidgets('wires the chosen tab to its panel', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _bar(initialValue: 'pricing')));

      final SemanticsData tab = semanticsNodeLabelled(tester, 'Pricing')!.getSemanticsData();
      final SemanticsNode text = semanticsNodeLabelled(tester, 'What it costs')!;
      SemanticsNode? panel = text;

      while (panel != null && panel.getSemanticsData().role != SemanticsRole.tabPanel) {
        panel = panel.parent;
      }

      expect(panel, isNotNull);
      expect(tab.controlsNodes, <String>{panel!.identifier});

      handle.dispose();
    });

    testWidgets('lets a screen reader choose a tab', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, _bar()));

      tester.semantics.tap(find.semantics.byLabel('Pricing'));
      await tester.pumpAndSettle();

      expect(find.text('What it costs'), findsOneWidget);

      handle.dispose();
    });
  });
}

/// A panel with state of its own, to see whether it survives being hidden.
class _Counter extends StatefulWidget {
  const _Counter();

  @override
  State<_Counter> createState() => _CounterState();
}

class _CounterState extends State<_Counter> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(onTap: () => setState(() => _count += 1), child: Text('Count $_count'));
  }
}
