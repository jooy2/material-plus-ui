import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/breadcrumb/mp_breadcrumb.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about the trail, asked of the semantics tree
/// and the laid-out row rather than of `<li>`s and `aria-current`.

final MPColorScheme _light = MPColorScheme.fromSource();

List<Widget> _steps(int count, {VoidCallback? onPressed}) {
  return <Widget>[
    for (int index = 0; index < count; index += 1)
      MPBreadcrumbItem(onPressed: onPressed ?? () {}, child: Text('Step ${index + 1}')),
  ];
}

SemanticsFlags _flagsOf(WidgetTester tester, String label) {
  return semanticsNodeLabelled(tester, label)!.getSemanticsData().flagsCollection;
}

/// The marks drawn between steps.
Finder _chevrons() => find.byWidgetPredicate(
  (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.chevron,
);

void main() {
  group('the trail', () {
    testWidgets('is named, in English by default', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(3))));

      expect(find.bySemanticsLabel('Breadcrumb'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('takes a name of its own', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPBreadcrumb(semanticLabel: 'You are here', children: _steps(3))),
      );

      expect(find.bySemanticsLabel('You are here'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('draws a mark between two steps and not before the first', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(3))));

      expect(_chevrons(), findsNWidgets(2));
      expect(
        tester.getTopLeft(_chevrons().first).dx,
        greaterThan(tester.getTopRight(find.text('Step 1')).dx),
      );
    });

    testWidgets('draws each named mark', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPBreadcrumb(separator: MPBreadcrumbSeparator.slash, children: _steps(3))),
      );
      expect(find.text('/'), findsNWidgets(2));

      await tester.pumpWidget(
        host(MPBreadcrumb(separator: MPBreadcrumbSeparator.dot, children: _steps(3))),
      );
      expect(find.text('·'), findsNWidgets(2));

      await tester.pumpWidget(
        host(MPBreadcrumb(separator: MPBreadcrumbSeparator.arrow, children: _steps(3))),
      );
      expect(
        find.byWidgetPredicate(
          (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.arrowRight,
        ),
        findsNWidgets(2),
      );
    });

    testWidgets('takes a mark of its own', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPBreadcrumb(separator: const Text('>'), children: _steps(3))));

      expect(find.text('>'), findsNWidgets(2));
    });

    testWidgets('points the chevron the way the trail reads', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(2))));
      expect(tester.widget<MPGlyph>(_chevrons()).quarterTurns, -1);

      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, MPBreadcrumb(children: _steps(2))),
      );
      expect(tester.widget<MPGlyph>(_chevrons()).quarterTurns, 1);
      expect(
        tester.getTopLeft(find.text('Step 1')).dx,
        greaterThan(tester.getTopLeft(find.text('Step 2')).dx),
      );
    });

    testWidgets('sets the steps in body type from the size ladder', (WidgetTester tester) async {
      final List<double?> sizes = <double?>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPBreadcrumb(size: size, children: _steps(2))));
        sizes.add(styleOf(tester, 'Step 1').fontSize);
      }

      expect(sizes.first, MPTypescale.material.bodyMedium.style().fontSize);
      expect(sizes.last, MPTypescale.material.bodyLarge.style().fontSize);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            size: MPSize.xs,
            child: MPBreadcrumb(children: _steps(2)),
          ),
        ),
      );

      expect(styleOf(tester, 'Step 1').fontSize, MPTypescale.material.bodyMedium.style().fontSize);
    });
  });

  group('the current step', () {
    testWidgets('is the last one, and is not a link', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      int presses = 0;

      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(3, onPressed: () => presses++))));

      expect(_flagsOf(tester, 'Step 1').isLink, isTrue);
      expect(_flagsOf(tester, 'Step 3').isLink, isFalse);
      expect(_flagsOf(tester, 'Step 3').isSelected, Tristate.isTrue);

      await tester.tap(find.text('Step 3'));
      expect(presses, 0);

      await tester.tap(find.text('Step 1'));
      expect(presses, 1);
      semantics.dispose();
    });

    testWidgets('is drawn in the full ink, one weight up', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(2))));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Step 2').color, _light.onSurface);
      expect(styleOf(tester, 'Step 2').fontWeight, FontWeight.w500);
      expect(styleOf(tester, 'Step 1').color, _light.onSurfaceVariant);
    });

    testWidgets('moves when a step claims it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPBreadcrumb(
            children: <Widget>[
              MPBreadcrumbItem(onPressed: () {}, child: const Text('Home')),
              MPBreadcrumbItem(onPressed: () {}, current: true, child: const Text('Docs')),
              MPBreadcrumbItem(onPressed: () {}, child: const Text('Draft')),
            ],
          ),
        ),
      );

      expect(_flagsOf(tester, 'Docs').isSelected, Tristate.isTrue);
      expect(_flagsOf(tester, 'Draft').isSelected, isNot(Tristate.isTrue));
      expect(_flagsOf(tester, 'Draft').isLink, isTrue);
      semantics.dispose();
    });
  });

  group('folding', () {
    testWidgets('shows the whole trail when no maximum is set', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 2000, MPBreadcrumb(children: _steps(7))));

      for (int index = 1; index <= 7; index += 1) {
        expect(find.text('Step $index'), findsOneWidget);
      }
    });

    testWidgets('folds the middle away past the maximum', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPBreadcrumb(maxItems: 3, children: _steps(6))));

      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsNothing);
      expect(find.text('Step 5'), findsNothing);
      expect(find.text('Step 6'), findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.ellipsis,
        ),
        findsOneWidget,
      );
    });

    testWidgets('keeps the right number of steps either side', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 2000,
          MPBreadcrumb(
            maxItems: 4,
            itemsBeforeCollapse: 2,
            itemsAfterCollapse: 2,
            children: _steps(7),
          ),
        ),
      );

      expect(find.text('Step 2'), findsOneWidget);
      expect(find.text('Step 3'), findsNothing);
      expect(find.text('Step 6'), findsOneWidget);
    });

    testWidgets('puts the trail back when the fold is pressed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 2000, MPBreadcrumb(maxItems: 3, children: _steps(6))));
      await tester.tap(find.bySemanticsLabel('Show hidden steps'));
      await tester.pump();

      for (int index = 1; index <= 6; index += 1) {
        expect(find.text('Step $index'), findsOneWidget);
      }
      semantics.dispose();
    });

    testWidgets('unfolds from the keyboard', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 2000, MPBreadcrumb(maxItems: 3, children: _steps(6))));

      final Finder fold = find.byWidgetPredicate(
        (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.ellipsis,
      );
      Focus.of(tester.element(fold)).requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(find.text('Step 3'), findsOneWidget);
    });

    testWidgets('does not fold when the mark would stand in for one step', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(MPBreadcrumb(maxItems: 2, children: _steps(3))));

      expect(find.text('Step 2'), findsOneWidget);
    });

    testWidgets('leaves the fold as a plain mark when it is not expandable', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPBreadcrumb(maxItems: 3, expandable: false, children: _steps(6))),
      );

      expect(find.bySemanticsLabel('Show hidden steps'), findsNothing);
      semantics.dispose();
    });

    testWidgets('takes a name for the fold, in its locale', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPBreadcrumb(maxItems: 3, expandLabel: 'More', children: _steps(6))),
      );

      expect(find.bySemanticsLabel('More'), findsOneWidget);
      semantics.dispose();
    });
  });

  group('MPBreadcrumbItem', () {
    testWidgets('stops answering while disabled', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      int presses = 0;

      await tester.pumpWidget(
        host(
          MPBreadcrumb(
            children: <Widget>[
              MPBreadcrumbItem(
                onPressed: () => presses++,
                disabled: true,
                child: const Text('Home'),
              ),
              const MPBreadcrumbItem(child: Text('Here')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Home'));
      expect(presses, 0);
      expect(_flagsOf(tester, 'Home').isLink, isTrue);
      expect(_flagsOf(tester, 'Home').isEnabled, isNot(Tristate.isTrue));
      expect(
        styleOf(tester, 'Home').color,
        _light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
      semantics.dispose();
    });

    testWidgets('washes in the accent container under a hovering pointer', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(MPBreadcrumb(children: _steps(2))));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Step 1')));
      await tester.pumpAndSettle();

      expect(
        decorationsOf(
          tester,
          find.byType(MPBreadcrumbItem).first,
        ).map((BoxDecoration decoration) => decoration.color),
        contains(_light.primaryContainer),
      );
      expect(styleOf(tester, 'Step 1').color, _light.onPrimaryContainer);
    });

    testWidgets('is followed from the keyboard', (WidgetTester tester) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPBreadcrumb(
            children: <Widget>[
              MPBreadcrumbItem(
                focusNode: focus,
                onPressed: () => presses++,
                child: const Text('Home'),
              ),
              const MPBreadcrumbItem(child: Text('Here')),
            ],
          ),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(presses, 1);
    });

    testWidgets('draws its icon slots around the label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPBreadcrumb(
            children: <Widget>[
              MPBreadcrumbItem(
                onPressed: () {},
                startIcon: const SizedBox(key: Key('start'), width: 10, height: 10),
                endIcon: const SizedBox(key: Key('end'), width: 10, height: 10),
                child: const Text('Home'),
              ),
              const MPBreadcrumbItem(child: Text('Here')),
            ],
          ),
        ),
      );

      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        lessThan(tester.getCenter(find.text('Home')).dx),
      );
      expect(
        tester.getCenter(find.byKey(const Key('end'))).dx,
        greaterThan(tester.getCenter(find.text('Home')).dx),
      );
    });

    testWidgets('stands alone outside a trail', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPBreadcrumbItem(onPressed: () {}, child: const Text('Home'))));

      expect(find.text('Home'), findsOneWidget);
    });
  });
}
