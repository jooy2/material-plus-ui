import 'dart:ui' show CheckedState, Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/checkbox/mp_checkbox.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The box's own decoration: the fill and the edge.
BoxDecoration _boxOf(WidgetTester tester) {
  return tester
      .widgetList<AnimatedContainer>(
        find.descendant(of: find.byType(MPCheckbox), matching: find.byType(AnimatedContainer)),
      )
      .map((AnimatedContainer box) => box.decoration as BoxDecoration?)
      .whereType<BoxDecoration>()
      .firstWhere((BoxDecoration decoration) => decoration.shape == BoxShape.rectangle);
}

Size _tickOf(WidgetTester tester) {
  return tester.getSize(
    find.descendant(of: find.byType(MPCheckbox), matching: find.byType(AnimatedContainer)).at(1),
  );
}

MPSelectionMarkPainter _markOf(WidgetTester tester) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: find.byType(MPCheckbox), matching: find.byType(CustomPaint)),
      )
      .map((CustomPaint paint) => paint.painter)
      .whereType<MPSelectionMarkPainter>()
      .single;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is one checkbox node named by its label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPCheckbox(label: Text('Email me'))));

      expect(
        tester.getSemantics(find.text('Email me')),
        matchesSemantics(
          label: 'Email me',
          hasCheckedState: true,
          isChecked: false,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('renders without a label', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(semanticLabel: 'Select row')));

      expect(_tickOf(tester), const Size(18, 18));
    });

    testWidgets('fills with the accent once ticked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(checked: false)));
      expect((_boxOf(tester).border! as Border).top.color, light.onSurfaceVariant);

      await tester.pumpWidget(host(const MPCheckbox(checked: true)));
      await tester.pumpAndSettle();

      expect(_boxOf(tester).color, light.primary);
      expect(_markOf(tester).color, light.onPrimary);
    });

    testWidgets('reads the colour it is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(checked: true, color: MPColor.tertiary)));
      await tester.pumpAndSettle();

      expect(_boxOf(tester).color, light.tertiary);
    });
  });

  group('ticking', () {
    testWidgets('hands the parent a boolean', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(MPCheckbox(label: const Text('Email me'), onChanged: changes.add)),
      );
      await tester.tap(find.byType(MPCheckbox));

      expect(changes, <bool>[true]);
    });

    testWidgets('ticks and unticks through a controlled parent', (WidgetTester tester) async {
      bool checked = false;

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) => MPCheckbox(
              label: const Text('Email me'),
              checked: checked,
              onChanged: (bool next) => setState(() => checked = next),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(MPCheckbox));
      await tester.pump();
      expect(checked, isTrue);

      await tester.tap(find.byType(MPCheckbox));
      await tester.pump();
      expect(checked, isFalse);
    });

    testWidgets('stays where a controlled parent leaves it', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPCheckbox(checked: false, onChanged: (_) {})));
      await tester.tap(find.byType(MPCheckbox));
      await tester.pumpAndSettle();

      expect(_markOf(tester).shown, 0);
    });

    testWidgets('ticks from the label', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(MPCheckbox(label: const Text('Email me'), onChanged: changes.add)),
      );
      await tester.tap(find.text('Email me'));

      expect(changes, <bool>[true]);
    });

    testWidgets('holds its own state from initialChecked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(initialChecked: true)));
      await tester.pumpAndSettle();
      expect(_markOf(tester).shown, 1);

      await tester.tap(find.byType(MPCheckbox));
      await tester.pumpAndSettle();
      expect(_markOf(tester).shown, 0);
    });

    testWidgets('ticks from the keyboard', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(host(MPCheckbox(focusNode: focus, onChanged: changes.add)));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(changes, <bool>[true, false]);
    });

    testWidgets('grows the mark in and lets it play back out', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(checked: false)));
      await tester.pumpWidget(host(const MPCheckbox(checked: true)));
      await tester.pump(const Duration(milliseconds: 100));

      expect(_markOf(tester).shown, inExclusiveRange(0, 1));

      await tester.pumpAndSettle();
      expect(_markOf(tester).shown, 1);

      await tester.pumpWidget(host(const MPCheckbox(checked: false)));
      await tester.pump(const Duration(milliseconds: 100));
      expect(_markOf(tester).shown, inExclusiveRange(0, 1));
      expect(_markOf(tester).shape, MPSelectionMarkShape.check);
    });

    testWidgets('does not move when animations are off', (WidgetTester tester) async {
      await tester.pumpWidget(host(disableAnimations: true, const MPCheckbox(checked: false)));
      await tester.pumpWidget(host(disableAnimations: true, const MPCheckbox(checked: true)));
      await tester.pump();

      expect(_markOf(tester).shown, 1);
    });
  });

  group('the third state', () {
    testWidgets('announces itself as mixed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPCheckbox(indeterminate: true, label: Text('All'))));

      final SemanticsData data = tester.getSemantics(find.text('All')).getSemanticsData();
      expect(data.flagsCollection.isChecked, CheckedState.mixed);
      semantics.dispose();
    });

    testWidgets('draws a dash rather than a tick', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(indeterminate: true)));

      expect(_markOf(tester).shape, MPSelectionMarkShape.dash);
    });

    testWidgets('ticks when pressed', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(MPCheckbox(checked: false, indeterminate: true, onChanged: changes.add)),
      );
      await tester.tap(find.byType(MPCheckbox));

      expect(changes, <bool>[true]);
    });
  });

  group('states', () {
    testWidgets('turns over into the error family with a message', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPCheckbox(
            label: Text('Terms'),
            description: Text('Read them first.'),
            errorMessage: Text('Accept these to continue.'),
          ),
        ),
      );

      expect((_boxOf(tester).border! as Border).top.color, light.error);
      expect(find.text('Accept these to continue.'), findsOneWidget);
      // The error takes the description's place rather than stacking under it.
      expect(find.text('Read them first.'), findsNothing);
      expect(
        tester.getSemantics(find.text('Terms')).getSemanticsData().validationResult,
        SemanticsValidationResult.invalid,
      );
      semantics.dispose();
    });

    testWidgets('shows the description when there is no error', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPCheckbox(label: Text('Terms'), description: Text('Read them first.'))),
      );

      expect(find.text('Read them first.'), findsOneWidget);
    });

    testWidgets('disables the control', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(MPCheckbox(disabled: true, initialChecked: true, onChanged: changes.add)),
      );
      await tester.tap(find.byType(MPCheckbox));
      await tester.pumpAndSettle();

      expect(changes, isEmpty);
      expect(_boxOf(tester).color, light.onSurface.withValues(alpha: 0.38));
    });

    testWidgets('stays focusable and unchangeable when read-only', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPCheckbox(
            readOnly: true,
            focusNode: focus,
            label: const Text('Kept'),
            onChanged: changes.add,
          ),
        ),
      );
      await tester.tap(find.byType(MPCheckbox));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(changes, isEmpty);
      expect(focus.hasFocus, isTrue);

      final SemanticsData data = tester.getSemantics(find.text('Kept')).getSemanticsData();
      expect(data.flagsCollection.isReadOnly, isTrue);
      expect(data.hasAction(SemanticsAction.tap), isFalse);
      semantics.dispose();
    });

    testWidgets('marks the checkbox required', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPCheckbox(required: true, label: Text('Terms'))));

      // Drawn, and left out of what is read: the node says it is required.
      final RichText drawn = tester.widget<RichText>(find.byType(RichText));
      expect(drawn.text.toPlainText(includeSemanticsLabels: false), 'Terms *');
      final SemanticsNode node = semanticsNodeLabelled(tester, 'Terms')!;
      expect(node.getSemanticsData().flagsCollection.isRequired, Tristate.isTrue);
      semantics.dispose();
    });

    testWidgets('lights the halo only over the box', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox(label: Text('A long enough label'))));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);

      Color halo() {
        return tester
            .widget<MPSelectionHalo>(
              find.descendant(of: find.byType(MPCheckbox), matching: find.byType(MPSelectionHalo)),
            )
            .color
            .withValues(
              alpha: tester
                  .widget<MPSelectionHalo>(
                    find.descendant(
                      of: find.byType(MPCheckbox),
                      matching: find.byType(MPSelectionHalo),
                    ),
                  )
                  .opacity,
            );
      }

      await mouse.moveTo(tester.getCenter(find.text('A long enough label')));
      await tester.pump();
      expect(halo().a, 0);

      await mouse.moveTo(tester.getCenter(find.byType(MPSelectionHalo)));
      await tester.pump();
      expect(halo(), light.onSurface.withValues(alpha: MPStateOpacity.hover));
    });
  });

  group('the size ladder', () {
    testWidgets('grows the tick with the rung', (WidgetTester tester) async {
      final List<double> boxes = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPCheckbox(size: size)));
        boxes.add(_tickOf(tester).width);
      }

      expect(boxes, <double>[14, 16, 18, 20, 22]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPConfigProvider(size: MPSize.xl, child: MPCheckbox())));

      expect(_tickOf(tester).width, 22);
    });

    testWidgets('keeps the edge inside the box', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPCheckbox()));

      expect(_tickOf(tester), const Size(18, 18));
      expect((_boxOf(tester).border! as Border).top.width, 2);
    });
  });

  group('in a column narrower than its label', () {
    testWidgets('wraps inside the width it was given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 120,
          const MPCheckbox(label: Text('A label far longer than the column it is put in')),
        ),
      );

      expect(tester.getSize(find.byType(MPCheckbox)).width, lessThanOrEqualTo(120));
      expect(tester.takeException(), isNull);
    });

    testWidgets('sits inside a row without a width of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[MPCheckbox(label: Text('Select all'))],
          ),
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.text('Select all'), findsOneWidget);
    });
  });
}
