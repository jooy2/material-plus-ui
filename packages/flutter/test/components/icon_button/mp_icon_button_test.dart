import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/button_group/mp_button_group.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const Widget _glyph = SizedBox.square(key: Key('glyph'), dimension: 20);

BoxDecoration _surfaceOf(WidgetTester tester) {
  final AnimatedContainer container = tester.widget<AnimatedContainer>(
    find.descendant(of: find.byType(MPButton), matching: find.byType(AnimatedContainer)).first,
  );

  return container.decoration! as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the name', () {
    testWidgets('is what the button is found by', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPIconButton(icon: _glyph, label: 'Search', onPressed: () {})));

      expect(
        tester.getSemantics(find.bySemanticsLabel('Search')),
        matchesSemantics(
          label: 'Search',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('is announced rather than drawn', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPIconButton(icon: _glyph, label: 'Search', onPressed: () {})));

      expect(find.text('Search'), findsNothing);
      expect(find.byKey(const Key('glyph')), findsOneWidget);
    });
  });

  group('what it borrows from MPButton', () {
    testWidgets('is a circle: a square footprint at a pill radius', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPIconButton(icon: _glyph, label: 'Search', onPressed: () {})));

      expect(tester.getSize(find.byType(MPIconButton)), const Size(56, 56));
      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));
    });

    testWidgets('starts on the standard variant, MD3 default', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPIconButton(icon: _glyph, label: 'Search', onPressed: () {})));

      expect(tester.widget<MPButton>(find.byType(MPButton)).variant, MPVariant.text);
      expect(_surfaceOf(tester).color, const Color(0x00000000));
    });

    testWidgets('takes a louder variant when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPIconButton(icon: _glyph, label: 'Add', variant: MPVariant.filled, onPressed: () {})),
      );
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester).color, light.primary);
    });

    testWidgets('walks the size ladder', (WidgetTester tester) async {
      final List<double> sides = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(MPIconButton(icon: _glyph, label: 'Search', size: size, onPressed: () {})),
        );
        final Size box = tester.getSize(find.byType(MPIconButton));
        expect(box.width, box.height);
        sides.add(box.width);
      }

      expect(sides, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('swallows the press while loading, and stays focusable', (
      WidgetTester tester,
    ) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPIconButton(
            icon: _glyph,
            label: 'Save',
            loading: true,
            focusNode: focus,
            onPressed: () => presses++,
          ),
        ),
      );
      await tester.tap(find.byType(MPIconButton));
      focus.requestFocus();
      await tester.pump();

      expect(presses, 0);
      expect(focus.hasFocus, isTrue);
      expect(find.byType(MPSpinner), findsOneWidget);
      expect(find.byKey(const Key('glyph')), findsNothing);
    });

    testWidgets('takes what a surrounding group sets', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButtonGroup(
            variant: MPVariant.tonal,
            size: MPSize.sm,
            children: <Widget>[MPIconButton(icon: _glyph, label: 'Bold', onPressed: () {})],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getSize(find.byType(MPIconButton)), const Size(40, 40));
      expect(_surfaceOf(tester).color, light.primaryContainer);
    });

    testWidgets('fires like any other button', (WidgetTester tester) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPIconButton(icon: _glyph, label: 'Search', focusNode: focus, onPressed: () => presses++),
        ),
      );
      await tester.tap(find.byType(MPIconButton));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(presses, 2);
    });
  });
}
