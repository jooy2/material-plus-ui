import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// Reached directly rather than through the barrel, so that another
// component's half-finished file cannot break this suite.
import 'package:material_plus_ui/src/components/bottom_navigation/mp_bottom_navigation.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/floating_bottom_navigation/mp_floating_bottom_navigation.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks of the floating bar, asked the way
/// Flutter asks them: `bottom: 24px` becomes the gap measured under the
/// lozenge, and a computed `box-shadow` becomes the decoration it built.

const List<Widget> _destinations = <Widget>[
  MPBottomNavigationItem(value: 'home', label: 'Home', icon: SizedBox.square(dimension: 24)),
  MPBottomNavigationItem(value: 'search', label: 'Search', icon: SizedBox.square(dimension: 24)),
  MPBottomNavigationItem(value: 'saved', label: 'Saved', icon: SizedBox.square(dimension: 24)),
];

Widget _bar({
  Object? value,
  Object? initialValue = 'home',
  ValueChanged<Object>? onChanged,
  MPBottomNavigationLabels labels = MPBottomNavigationLabels.selected,
  MPVariant? variant,
  MPElevation? elevation,
  MPSize? size,
  double offset = 16,
  bool safeArea = true,
  bool disabled = false,
}) {
  return MPFloatingBottomNavigation(
    label: 'Main',
    value: value,
    initialValue: initialValue,
    onChanged: onChanged,
    labels: labels,
    variant: variant,
    elevation: elevation,
    size: size,
    offset: offset,
    safeArea: safeArea,
    disabled: disabled,
    children: _destinations,
  );
}

/// The lozenge: the box that paints the sheet.
Finder get _lozenge {
  return find
      .descendant(of: find.byType(MPFloatingBottomNavigation), matching: find.byType(DecoratedBox))
      .first;
}

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester.widget<DecoratedBox>(_lozenge).decoration as BoxDecoration;
}

double _pillOpacity(WidgetTester tester, int index) {
  return tester
      .widget<AnimatedOpacity>(
        find.descendant(
          of: find.byType(MPBottomNavigationItem).at(index),
          matching: find.byType(AnimatedOpacity),
        ),
      )
      .opacity;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a named navigation landmark of ordinary buttons', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar()));

      expect(
        semanticsNodeLabelled(tester, 'Main')!.getSemanticsData().role,
        SemanticsRole.navigation,
      );
      expect(
        semanticsNodeLabelled(tester, 'Search'),
        isSemantics(isButton: true, hasSelectedState: false),
      );
      expect(semanticsNodeLabelled(tester, 'Home'), isSemantics(isSelected: true));
      semantics.dispose();
    });

    testWidgets('is only as wide as what is in it', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 800, _bar()));

      expect(tester.getSize(_lozenge).width, lessThan(400));
      // Centred in what it is given.
      expect(
        tester.getCenter(_lozenge).dx,
        moreOrLessEquals(tester.getCenter(find.byType(MPFloatingBottomNavigation)).dx),
      );
    });

    testWidgets('is a stadium rather than a sheet with cut corners', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar()));

      final Size box = tester.getSize(_lozenge);

      expect(_sheetOf(tester).borderRadius, BorderRadius.circular(box.height / 2));
    });

    testWidgets('truncates names before the sheet runs off a narrow screen', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 160, _bar(labels: MPBottomNavigationLabels.all)));

      expect(tester.takeException(), isNull);
      expect(tester.getSize(_lozenge).width, lessThanOrEqualTo(160));
    });
  });

  group('the surface', () {
    testWidgets('is raised to level 3 by default, because a flat lozenge reads as a mistake', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_bar()));

      expect(_sheetOf(tester).boxShadow, MPShadows.of(3));
      expect(_sheetOf(tester).color, light.surfaceContainerHigh);

      await tester.pumpWidget(host(_bar(elevation: 0)));

      expect(_sheetOf(tester).boxShadow, isEmpty);
    });

    testWidgets('draws the variant it is given, flat, instead of the default lift', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(_bar(variant: MPVariant.tonal)));

      expect(_sheetOf(tester).color, light.surfaceContainer);
      expect(_sheetOf(tester).boxShadow, isEmpty);

      await tester.pumpWidget(host(_bar(variant: MPVariant.tonal, elevation: 2)));

      expect(_sheetOf(tester).boxShadow, MPShadows.of(2));
    });

    testWidgets('stays neutral whatever weight it paints', (WidgetTester tester) async {
      for (final MPVariant variant in MPVariant.values) {
        await tester.pumpWidget(host(_bar(variant: variant)));

        expect(_sheetOf(tester).color, isNot(light.primary), reason: variant.name);
        expect(_sheetOf(tester).color, isNot(light.secondaryContainer), reason: variant.name);
      }
    });

    testWidgets('grows monotonically: 48, 56, 64, 72, 80', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(_bar(size: size)));
        heights.add(tester.getSize(_lozenge).height);
      }

      expect(heights, <double>[48, 56, 64, 72, 80]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPConfigProvider(size: MPSize.xs, child: _bar())));

      expect(tester.getSize(_lozenge).height, 48);
    });
  });

  group('offset', () {
    testWidgets('floats above the bottom edge by offset', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar(offset: 24, safeArea: false)));

      final double gap =
          tester.getBottomLeft(find.byType(MPFloatingBottomNavigation)).dy -
          tester.getBottomLeft(_lozenge).dy;

      expect(gap, 24);
    });

    testWidgets('lifts the whole sheet clear of the home indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MediaQuery(
            data: const MediaQueryData(padding: EdgeInsets.only(bottom: 34)),
            child: _bar(),
          ),
        ),
      );

      final double gap =
          tester.getBottomLeft(find.byType(MPFloatingBottomNavigation)).dy -
          tester.getBottomLeft(_lozenge).dy;

      expect(gap, 16 + 34);
      // The sheet itself is not padded: the row inside it keeps its height.
      expect(tester.getSize(_lozenge).height, 64);
    });
  });

  group('names', () {
    testWidgets('names only the destination the reader is on', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar()));

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Search'), findsNothing);
      // Undrawn is not unsaid.
      expect(semanticsNodeLabelled(tester, 'Search'), isNotNull);
      semantics.dispose();
    });

    testWidgets('draws every name when it is asked to', (WidgetTester tester) async {
      await tester.pumpWidget(host(_bar(labels: MPBottomNavigationLabels.all)));

      for (final String name in <String>['Home', 'Search', 'Saved']) {
        expect(find.text(name), findsOneWidget);
      }
    });
  });

  group('pressing', () {
    testWidgets('moves when a destination is pressed, and says so', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];

      await tester.pumpWidget(host(_bar(onChanged: changes.add)));
      await tester.tap(find.byType(MPBottomNavigationItem).at(2));
      await tester.pumpAndSettle();

      expect(changes, <Object>['saved']);
      expect(_pillOpacity(tester, 2), 1);
      expect(find.text('Saved'), findsOneWidget);
    });

    testWidgets('says what it is told when it is controlled', (WidgetTester tester) async {
      final List<Object> changes = <Object>[];

      await tester.pumpWidget(host(_bar(value: 'home', onChanged: changes.add)));
      await tester.tap(find.byType(MPBottomNavigationItem).at(2));
      await tester.pumpAndSettle();

      expect(changes, <Object>['saved']);
      // Still on `home`, because nothing told it otherwise.
      expect(_pillOpacity(tester, 0), 1);
    });

    testWidgets('stops every destination answering when it is disabled', (
      WidgetTester tester,
    ) async {
      final List<Object> changes = <Object>[];
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(_bar(disabled: true, onChanged: changes.add)));
      await tester.tap(find.byType(MPBottomNavigationItem).at(2));

      expect(changes, isEmpty);
      expect(semanticsNodeLabelled(tester, 'Saved'), isSemantics(isEnabled: false));
      semantics.dispose();
    });
  });
}
