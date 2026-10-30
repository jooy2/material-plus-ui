import 'package:flutter/gestures.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// Reached directly rather than through the barrel, so that another
// component's half-finished file cannot break this suite.
import 'package:material_plus_ui/src/components/bottom_navigation/mp_bottom_navigation.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// `aria-current="page"` becomes a selected node, a computed background becomes
/// the decoration the destination built, and a bounding box becomes a
/// measurement of the laid-out widget.

class _Dot extends StatelessWidget {
  const _Dot(this.name);

  final String name;

  @override
  Widget build(BuildContext context) => SizedBox.square(dimension: 24, child: Text(name));
}

Widget _bar({
  Object? value,
  Object? initialValue = 'home',
  ValueChanged<Object>? onChanged,
  MPBottomNavigationLabels labels = MPBottomNavigationLabels.all,
  MPSize? size,
  bool divider = false,
  bool disabled = false,
}) {
  return MPBottomNavigation(
    label: 'Main',
    value: value,
    initialValue: initialValue,
    onChanged: onChanged,
    labels: labels,
    size: size,
    divider: divider,
    disabled: disabled,
    children: const <Widget>[
      MPBottomNavigationItem(value: 'home', label: 'Home', icon: _Dot('h')),
      MPBottomNavigationItem(value: 'search', label: 'Search', icon: _Dot('s')),
      MPBottomNavigationItem(value: 'saved', label: 'Saved', icon: _Dot('v'), disabled: true),
    ],
  );
}

/// The bar's own surface: the first box it paints.
BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find
                .descendant(
                  of: find.byType(MPBottomNavigation),
                  matching: find.byType(DecoratedBox),
                )
                .first,
          )
          .decoration
      as BoxDecoration;
}

Finder _item(int index) => find.byType(MPBottomNavigationItem).at(index);

/// The active indicator inside the destination at [index]: the one box filled
/// with `secondaryContainer`.
Finder _pill(int index, MPColorScheme colors) {
  return find.descendant(
    of: _item(index),
    matching: find.byWidgetPredicate(
      (Widget widget) =>
          widget is AnimatedContainer &&
          (widget.decoration as BoxDecoration?)?.color == colors.secondaryContainer,
    ),
  );
}

double _pillOpacity(WidgetTester tester, int index) {
  return tester
      .widget<AnimatedOpacity>(
        find.descendant(of: _item(index), matching: find.byType(AnimatedOpacity)),
      )
      .opacity;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a named navigation landmark holding the destinations', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar()));

      final SemanticsNode? bar = semanticsNodeLabelled(tester, 'Main');

      expect(bar, isNotNull);
      expect(bar!.getSemanticsData().role, SemanticsRole.navigation);
      expect(find.byType(MPBottomNavigationItem), findsNWidgets(3));
      semantics.dispose();
    });

    testWidgets('marks the destination the reader is on, and only that one', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar(initialValue: 'search')));

      expect(
        semanticsNodeLabelled(tester, 'Search'),
        isSemantics(label: 'Search', isButton: true, isSelected: true),
      );
      expect(
        semanticsNodeLabelled(tester, 'Home'),
        isSemantics(label: 'Home', isButton: true, hasSelectedState: false),
      );
      // The honest claim: no tab anywhere, because there are no panels and no
      // roving focus to go with them.
      expect(
        semanticsNodeLabelled(tester, 'Search')!.getSemanticsData().role,
        isNot(SemanticsRole.tab),
      );
      semantics.dispose();
    });

    testWidgets('is surfaceContainer, separated by tone rather than a rule', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_bar()));

      final BoxDecoration sheet = _sheetOf(tester);

      expect(sheet.color, light.surfaceContainer);
      expect(sheet.border, isNull);
    });

    testWidgets('draws a hairline along the top when asked to', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar(divider: true)));

      final Border border = _sheetOf(tester).border! as Border;

      expect(border.top.color, light.outlineVariant);
      expect(border.top.width, 1);
      expect(border.bottom, BorderSide.none);
    });

    testWidgets('divides the width evenly between the destinations', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, _bar()));

      final List<double> widths = <double>[
        for (int index = 0; index < 3; index++) tester.getSize(_item(index)).width,
      ];

      expect(widths, <double>[120, 120, 120]);
    });

    testWidgets('lays the destinations out from the reading start', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, textDirection: TextDirection.rtl, _bar()));

      expect(tester.getCenter(_item(0)).dx, greaterThan(tester.getCenter(_item(1)).dx));
    });
  });

  group('the size ladder', () {
    testWidgets('is 80 tall at md, which is the specification’s own', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar()));

      expect(tester.getSize(find.byType(MPBottomNavigation)).height, 80);
    });

    testWidgets('grows monotonically: 56, 64, 80, 88, 96', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(_bar(size: size)));
        heights.add(tester.getSize(find.byType(MPBottomNavigation)).height);
      }

      expect(heights, <double>[56, 64, 80, 88, 96]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPConfigProvider(size: MPSize.sm, child: _bar())));

      expect(tester.getSize(find.byType(MPBottomNavigation)).height, 64);
    });

    testWidgets('keeps the row clear of the home indicator, under the surface', (
      WidgetTester tester,
    ) async {
      Widget inset(bool safeArea) {
        return host(
          MediaQuery(
            data: const MediaQueryData(padding: EdgeInsets.only(bottom: 34)),
            child: MPBottomNavigation(
              safeArea: safeArea,
              children: const <Widget>[MPBottomNavigationItem(value: 'home', label: 'Home')],
            ),
          ),
        );
      }

      await tester.pumpWidget(inset(true));
      expect(tester.getSize(find.byType(MPBottomNavigation)).height, 80 + 34);
      expect(tester.getSize(_item(0)).height, 80);

      await tester.pumpWidget(inset(false));
      expect(tester.getSize(find.byType(MPBottomNavigation)).height, 80);
    });
  });

  group('the active indicator', () {
    testWidgets('is secondaryContainer, drawn on the current destination alone', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_bar()));

      expect(_pill(0, light), findsOneWidget);
      expect(_pillOpacity(tester, 0), 1);
      expect(_pillOpacity(tester, 1), 0);
    });

    testWidgets('widens out of a circle, without moving the destinations', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 360, _bar()));

      // MD3's 64×32 pill, and the circle it grows out of.
      expect(tester.getSize(_pill(0, light)), const Size(64, 32));
      expect(tester.getSize(_pill(1, light)), const Size(32, 32));

      final Offset before = tester.getCenter(_item(1));

      await tester.tap(_item(1));
      await tester.pump();
      await tester.pump(MPMotion.short4 ~/ 2);

      // Part of the way there, and a pill at every frame.
      final double between = tester.getSize(_pill(1, light)).width;
      expect(between, greaterThan(32));
      expect(between, lessThan(64));

      await tester.pumpAndSettle();

      expect(tester.getSize(_pill(1, light)).width, 64);
      expect(tester.getSize(_pill(0, light)).width, 32);
      // The slots never moved.
      expect(tester.getCenter(_item(1)), before);
    });

    testWidgets('arrives at once when animations are off', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 360, disableAnimations: true, _bar()));

      await tester.tap(_item(1));
      await tester.pump();
      await tester.pump();

      expect(tester.getSize(_pill(1, light)).width, 64);
    });

    testWidgets('puts the pill’s own ink on the current glyph', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar()));
      await tester.pumpAndSettle();

      Color? inkOf(String glyph) =>
          DefaultTextStyle.of(tester.element(find.text(glyph))).style.color;

      expect(inkOf('h'), light.onSecondaryContainer);
      expect(inkOf('s'), light.onSurfaceVariant);
    });

    testWidgets('washes the slot in its ink under a hovering pointer', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar()));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(_item(1)));
      await tester.pumpAndSettle();

      final Iterable<Color?> washes = tester
          .widgetList<AnimatedContainer>(
            find.descendant(of: _item(1), matching: find.byType(AnimatedContainer)),
          )
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(washes, contains(light.onSurfaceVariant.withValues(alpha: MPStateOpacity.hover)));
    });
  });

  group('names', () {
    testWidgets('draws every name by default, in labelMedium', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar()));

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Search'), findsOneWidget);
      expect(styleOf(tester, 'Home').fontSize, MPTypescale.material.labelMedium.size);
      expect(styleOf(tester, 'Home').color, light.onSurface);
      expect(styleOf(tester, 'Search').color, light.onSurfaceVariant);
    });

    testWidgets('names only the current destination when asked to', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar(labels: MPBottomNavigationLabels.selected)));

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Search'), findsNothing);
    });

    testWidgets('keeps an undrawn name on the semantics tree', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar(labels: MPBottomNavigationLabels.none)));

      expect(find.text('Search'), findsNothing);
      expect(semanticsNodeLabelled(tester, 'Search'), isSemantics(label: 'Search', isButton: true));
      // The glyph inside is not a second thing to read.
      expect(semanticsLabels(tester), isNot(contains('s')));
      semantics.dispose();
    });

    testWidgets('swaps the glyph for the destination the reader is on', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPBottomNavigation(
            initialValue: 'home',
            children: <Widget>[
              MPBottomNavigationItem(
                value: 'home',
                label: 'Home',
                icon: Text('outline'),
                activeIcon: Text('filled'),
              ),
              MPBottomNavigationItem(
                value: 'search',
                label: 'Search',
                icon: Text('outline'),
                activeIcon: Text('filled'),
              ),
            ],
          ),
        ),
      );

      expect(find.descendant(of: _item(0), matching: find.text('filled')), findsOneWidget);
      expect(find.descendant(of: _item(1), matching: find.text('outline')), findsOneWidget);
    });
  });

  group('pressing', () {
    testWidgets('moves when a destination is pressed, and says so', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];

      await tester.pumpWidget(host(_bar(onChanged: changes.add)));
      await tester.tap(find.text('Search'));
      await tester.pumpAndSettle();

      expect(changes, <Object>['search']);
      expect(_pillOpacity(tester, 1), 1);
      expect(_pillOpacity(tester, 0), 0);
    });

    testWidgets('leaves a controlled bar where the caller put it', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];

      await tester.pumpWidget(host(_bar(value: 'home', onChanged: changes.add)));
      await tester.tap(find.text('Search'));
      await tester.pumpAndSettle();

      expect(changes, <Object>['search']);
      expect(_pillOpacity(tester, 0), 1);
    });

    testWidgets('runs the destination’s own onPressed after the bar’s', (
      WidgetTester tester,
    ) async {
      final List<String> calls = <String>[];

      await tester.pumpWidget(
        host(
          MPBottomNavigation(
            onChanged: (Object value) => calls.add('bar:$value'),
            children: <Widget>[
              MPBottomNavigationItem(
                value: 'home',
                label: 'Home',
                onPressed: () => calls.add('item'),
              ),
            ],
          ),
        ),
      );
      await tester.tap(find.text('Home'));

      expect(calls, <String>['bar:home', 'item']);
    });

    testWidgets('moves by keyboard too', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPBottomNavigation(
            onChanged: changes.add,
            children: <Widget>[
              const MPBottomNavigationItem(value: 'home', label: 'Home'),
              MPBottomNavigationItem(value: 'search', label: 'Search', focusNode: focus),
            ],
          ),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(changes, <Object>['search', 'search']);
    });

    testWidgets('does not move for a disabled destination', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar(onChanged: changes.add)));
      await tester.tap(find.text('Saved'));

      expect(changes, isEmpty);
      expect(
        semanticsNodeLabelled(tester, 'Saved'),
        isSemantics(isEnabled: false, hasTapAction: false, isFocusable: false),
      );
      expect(styleOf(tester, 'Saved').color, light.onSurface.withValues(alpha: 0.38));
      semantics.dispose();
    });

    testWidgets('stops the whole bar answering when the bar is disabled', (
      WidgetTester tester,
    ) async {
      final List<Object> changes = <Object>[];

      await tester.pumpWidget(host(_bar(disabled: true, onChanged: changes.add)));
      await tester.tap(find.text('Search'));

      expect(changes, isEmpty);
      // No pill on a destination that is not there to be used, current or not.
      expect(find.descendant(of: _item(0), matching: find.byType(AnimatedOpacity)), findsNothing);
    });

    testWidgets('rings the destination in secondary on keyboard focus, inside it', (
      WidgetTester tester,
    ) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
      addTearDown(() => FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic);

      await tester.pumpWidget(
        host(
          MPBottomNavigation(
            children: <Widget>[
              MPBottomNavigationItem(value: 'home', label: 'Home', focusNode: focus),
            ],
          ),
        ),
      );
      focus.requestFocus();
      await tester.pumpAndSettle();

      final MPFocusRingPainter ring =
          tester
                  .widgetList<CustomPaint>(
                    find.descendant(of: _item(0), matching: find.byType(CustomPaint)),
                  )
                  .firstWhere((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter)
                  .foregroundPainter!
              as MPFocusRingPainter;

      expect(ring.color, light.secondary);
      expect(ring.offset, lessThan(0));
    });
  });
}
