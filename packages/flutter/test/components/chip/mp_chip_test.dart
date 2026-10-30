import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/chip/mp_chip.dart';
import 'package:material_plus_ui/src/internal/dismiss.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _surfaceOf(WidgetTester tester) {
  return tester
          .widget<AnimatedContainer>(
            find
                .descendant(of: find.byType(MPChip), matching: find.byType(AnimatedContainer))
                .first,
          )
          .decoration!
      as BoxDecoration;
}

Size _boxOf(WidgetTester tester) => tester.getSize(find.byType(MPChip));

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('shows its label', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPChip(child: Text('Design'))));

      expect(find.text('Design'), findsOneWidget);
    });

    testWidgets('is outlined by default, which is Material’s chip', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPChip(child: Text('Design'))));

      expect((_surfaceOf(tester).border! as Border).top.color, light.outline);
      expect(styleOf(tester, 'Design').color, light.onSurfaceVariant);
    });

    testWidgets('is never a pill', (WidgetTester tester) async {
      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPChip(size: size, child: const Text('Design'))));

        final double radius = (_surfaceOf(tester).borderRadius! as BorderRadius).topLeft.x;
        expect(radius, lessThan(_boxOf(tester).height / 2), reason: size.name);
      }
    });

    testWidgets('sits on its own ladder: 24, 28, 32, 40, 48', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPChip(size: size, child: const Text('Design'))));
        heights.add(_boxOf(tester).height);
      }

      expect(heights, <double>[24, 28, 32, 40, 48]);
    });

    testWidgets('cuts a long label short rather than overflowing', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 80, const MPChip(child: Text('A label far too long for the room'))),
      );

      expect(tester.takeException(), isNull);
      expect(_boxOf(tester).width, lessThanOrEqualTo(80));
    });
  });

  group('pressable', () {
    testWidgets('is no button when there is nothing to press', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPChip(child: Text('Design'))));

      expect(tester.getSemantics(find.text('Design')), isNot(matchesSemantics(isButton: true)));
      semantics.dispose();
    });

    testWidgets('fires by pointer and by keyboard', (WidgetTester tester) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPChip(focusNode: focus, onPressed: () => presses++, child: const Text('Open'))),
      );

      await tester.tap(find.byType(MPChip));
      expect(presses, 1);

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 3);
    });

    testWidgets('is one button node that reports its selected state', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPChip(selected: true, onPressed: () {}, child: const Text('Open'))),
      );

      expect(
        tester.getSemantics(find.text('Open')),
        matchesSemantics(
          label: 'Open',
          isButton: true,
          hasSelectedState: true,
          isSelected: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('says nothing about a state an action chip does not have', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPChip(onPressed: () {}, child: const Text('Open'))));

      expect(
        tester.getSemantics(find.text('Open')),
        isNot(matchesSemantics(hasSelectedState: true)),
      );
      semantics.dispose();
    });

    testWidgets('is a toggle that is off when selected is false', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPChip(selected: false, onPressed: () {}, child: const Text('Open'))),
      );

      expect(
        tester.getSemantics(find.text('Open')),
        matchesSemantics(
          label: 'Open',
          isButton: true,
          hasSelectedState: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('fills with the container tone when selected', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPChip(selected: true, child: Text('Open'))));
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester).color, light.primaryContainer);
      expect(styleOf(tester, 'Open').color, light.onPrimaryContainer);
    });

    testWidgets('leads with a tick when selected', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPChip(variant: MPVariant.filled, selected: true, child: Text('Open'))),
      );

      final MPGlyph tick = tester.widget<MPGlyph>(find.byType(MPGlyph));
      expect(tick.shape, MPGlyphShape.check);
      expect(
        tester.getCenter(find.byType(MPGlyph)).dx,
        lessThan(tester.getCenter(find.text('Open')).dx),
      );
    });

    testWidgets('keeps its own start icon in place of the tick', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPChip(
            selected: true,
            startIcon: SizedBox(key: Key('own'), width: 10, height: 10),
            child: Text('Open'),
          ),
        ),
      );

      expect(find.byKey(const Key('own')), findsOneWidget);
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('stays inert while disabled', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(MPChip(disabled: true, onPressed: () => presses++, child: const Text('Open'))),
      );

      await tester.tap(find.byType(MPChip));
      expect(presses, 0);
    });

    testWidgets('washes the surface in its ink while hovered', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPChip(onPressed: () {}, child: const Text('Open'))));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPChip)));
      await tester.pumpAndSettle();

      final Iterable<Color?> washes = decorationsOf(
        tester,
        find.byType(MPChip),
      ).map((BoxDecoration box) => box.color);

      expect(washes, contains(light.onSurfaceVariant.withValues(alpha: MPStateOpacity.hover)));
    });

    testWidgets('rings the chip in secondary on keyboard focus', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
      addTearDown(() => FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic);

      await tester.pumpWidget(
        host(MPChip(focusNode: focus, onPressed: () {}, child: const Text('Open'))),
      );
      focus.requestFocus();
      await tester.pumpAndSettle();

      final CustomPaint ring = tester
          .widgetList<CustomPaint>(
            find.descendant(of: find.byType(MPChip), matching: find.byType(CustomPaint)),
          )
          .firstWhere((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter);

      expect((ring.foregroundPainter! as MPFocusRingPainter).color, light.secondary);
    });
  });

  group('onDelete', () {
    testWidgets('draws no affordance unless a handler is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPChip(child: Text('Design'))));

      expect(find.byType(MPDismissButton), findsNothing);
    });

    testWidgets('adds a second, separate button', (WidgetTester tester) async {
      int presses = 0;
      int deletes = 0;
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          MPChip(
            onPressed: () => presses++,
            onDelete: () => deletes++,
            child: const Text('Design'),
          ),
        ),
      );

      expect(find.bySemanticsLabel('Remove'), findsOneWidget);

      await tester.tap(find.byType(MPDismissButton));
      expect(deletes, 1);
      expect(presses, 0);

      await tester.tap(find.text('Design'));
      expect(presses, 1);
      expect(deletes, 1);
      semantics.dispose();
    });

    testWidgets('takes a name of its own', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPChip(onDelete: () {}, deleteLabel: 'Remove design', child: const Text('Design'))),
      );

      expect(find.bySemanticsLabel('Remove design'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('names it in the locale it is given', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPChip(onDelete: () {}, locale: 'ko', child: const Text('디자인'))),
      );

      expect(
        find.bySemanticsLabel(
          mpMessagesOf(
            tester.element(find.byType(MPChip)),
            mpCommonMessages,
            locale: 'ko',
          )['remove']!,
        ),
        findsOneWidget,
      );
      semantics.dispose();
    });

    testWidgets('is disabled with the chip', (WidgetTester tester) async {
      int deletes = 0;

      await tester.pumpWidget(
        host(MPChip(disabled: true, onDelete: () => deletes++, child: const Text('Design'))),
      );

      await tester.tap(find.byType(MPDismissButton));
      expect(deletes, 0);
    });
  });

  group('slots', () {
    testWidgets('draws a start icon before the label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPChip(
            startIcon: SizedBox(key: Key('start'), width: 10, height: 10),
            child: Text('Design'),
          ),
        ),
      );

      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        lessThan(tester.getCenter(find.text('Design')).dx),
      );
    });

    testWidgets('lays the slots out from the end under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          const MPChip(
            startIcon: SizedBox(key: Key('start'), width: 10, height: 10),
            child: Text('Design'),
          ),
        ),
      );

      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        greaterThan(tester.getCenter(find.text('Design')).dx),
      );
    });

    testWidgets('sets a count on its own plate, after the label', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPChip(count: 12, child: Text('Errors'))));

      expect(find.text('12'), findsOneWidget);
      expect(
        tester.getCenter(find.text('12')).dx,
        greaterThan(tester.getCenter(find.text('Errors')).dx),
      );
      expect(styleOf(tester, '12').color, light.onPrimaryContainer);
    });
  });

  group('disabled', () {
    testWidgets('drops the accent for the specification’s treatment', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPChip(variant: MPVariant.filled, disabled: true, child: Text('Design'))),
      );
      await tester.pumpAndSettle();

      expect(
        _surfaceOf(tester).color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
      );
      expect(
        styleOf(tester, 'Design').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );
    });
  });
}
