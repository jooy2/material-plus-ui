import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
// Reached directly rather than through the barrel: these are the library
// talking to itself, and the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads a class name off an element; a widget test reads the
/// render tree. So `toHaveClass('h-14')` becomes a measurement of the laid-out
/// box, and `bg-(--_mp-accent)` becomes the [BoxDecoration] the button built.

Size _boxOf(WidgetTester tester) => tester.getSize(find.byType(MPButton));

/// The decoration of the button's own surface: the fill, the hairline and the
/// shadow all live here.
BoxDecoration _surfaceOf(WidgetTester tester) {
  final AnimatedContainer container = tester.widget<AnimatedContainer>(
    find.descendant(of: find.byType(MPButton), matching: find.byType(AnimatedContainer)).first,
  );

  return container.decoration! as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is filled by default, in the primary family', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      expect(_surfaceOf(tester).color, light.primary);
    });

    testWidgets('draws every variant at the same height', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPVariant variant in MPVariant.values) {
        await tester.pumpWidget(
          host(MPButton(variant: variant, onPressed: () {}, child: const Text('Save'))),
        );
        heights.add(_boxOf(tester).height);
      }

      expect(heights.toSet(), <double>{56});
    });

    testWidgets('paints each variant from its own roles', (WidgetTester tester) async {
      final Map<MPVariant, Color> fills = <MPVariant, Color>{
        MPVariant.filled: light.primary,
        MPVariant.tonal: light.primaryContainer,
        MPVariant.elevated: light.surfaceContainerLow,
        MPVariant.outlined: const Color(0x00000000),
        MPVariant.text: const Color(0x00000000),
      };

      for (final MapEntry<MPVariant, Color> entry in fills.entries) {
        await tester.pumpWidget(
          host(MPButton(variant: entry.key, onPressed: () {}, child: const Text('Save'))),
        );
        await tester.pumpAndSettle();

        expect(_surfaceOf(tester).color, entry.value, reason: entry.key.name);
      }
    });

    testWidgets('outlines only the outlined variant', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPButton(variant: MPVariant.outlined, onPressed: () {}, child: const Text('Save'))),
      );

      final Border border = _surfaceOf(tester).border! as Border;

      expect(border.top.color, light.outline);
      expect(border.top.width, 1);
    });

    testWidgets('lifts only the elevated variant', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPButton(variant: MPVariant.elevated, onPressed: () {}, child: const Text('Save'))),
      );

      expect(_surfaceOf(tester).boxShadow, MPShadows.of(1));

      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      expect(_surfaceOf(tester).boxShadow, isEmpty);
    });

    testWidgets('is a pill', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));
    });

    testWidgets('renders the icons around the label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButton(
            onPressed: () {},
            startIcon: const SizedBox(key: Key('start'), width: 10, height: 10),
            endIcon: const SizedBox(key: Key('end'), width: 10, height: 10),
            child: const Text('Save'),
          ),
        ),
      );

      final double start = tester.getCenter(find.byKey(const Key('start'))).dx;
      final double label = tester.getCenter(find.text('Save')).dx;
      final double end = tester.getCenter(find.byKey(const Key('end'))).dx;

      expect(start, lessThan(label));
      expect(label, lessThan(end));
    });

    testWidgets('goes square when there is no label to pad against', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButton(
            onPressed: () {},
            semanticLabel: 'Add',
            startIcon: const SizedBox(width: 20, height: 20),
          ),
        ),
      );

      expect(_boxOf(tester), const Size(56, 56));
    });

    testWidgets('stays wide for two glyphs and no label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButton(
            onPressed: () {},
            startIcon: const SizedBox(width: 20, height: 20),
            endIcon: const SizedBox(width: 20, height: 20),
          ),
        ),
      );

      expect(_boxOf(tester).width, greaterThan(56));
    });
  });

  group('the size ladder', () {
    testWidgets('draws at Material’s own size by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      expect(_boxOf(tester).height, 56);
    });

    testWidgets('grows monotonically: 32, 40, 56, 64, 72', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(MPButton(size: size, onPressed: () {}, child: const Text('Save'))),
        );
        heights.add(_boxOf(tester).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPConfigProvider(
            size: MPSize.sm,
            child: MPButton(onPressed: () {}, child: const Text('Save')),
          ),
        ),
      );

      expect(_boxOf(tester).height, 40);
    });

    testWidgets('stretches to the container when fullWidth', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, MPButton(fullWidth: true, onPressed: () {}, child: const Text('Save'))),
      );

      expect(_boxOf(tester).width, 300);
    });
  });

  group('pressing', () {
    testWidgets('calls onPressed, by pointer and by keyboard', (WidgetTester tester) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPButton(focusNode: focus, onPressed: () => presses++, child: const Text('Save'))),
      );

      await tester.tap(find.byType(MPButton));
      expect(presses, 1);

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 3);
    });

    testWidgets('does not fire when disabled', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(MPButton(disabled: true, onPressed: () => presses++, child: const Text('Save'))),
      );

      await tester.tap(find.byType(MPButton));
      expect(presses, 0);
    });

    testWidgets('draws the specification’s disabled treatment', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPButton(onPressed: null, child: Text('Save'))));
      await tester.pumpAndSettle();

      expect(
        _surfaceOf(tester).color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
      );
    });

    testWidgets('washes the surface in its ink while hovered', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPButton)));
      await tester.pumpAndSettle();

      final Iterable<Color?> washes = tester
          .widgetList<AnimatedContainer>(
            find.descendant(of: find.byType(MPButton), matching: find.byType(AnimatedContainer)),
          )
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(washes, contains(light.onPrimary.withValues(alpha: MPStateOpacity.hover)));
    });

    testWidgets('rings the button in secondary on keyboard focus', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);
      FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
      addTearDown(() => FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic);

      await tester.pumpWidget(
        host(MPButton(focusNode: focus, onPressed: () {}, child: const Text('Save'))),
      );
      focus.requestFocus();
      await tester.pumpAndSettle();

      final CustomPaint ring = tester
          .widgetList<CustomPaint>(
            find.descendant(of: find.byType(MPButton), matching: find.byType(CustomPaint)),
          )
          .firstWhere((CustomPaint paint) => paint.foregroundPainter is MPFocusRingPainter);

      expect((ring.foregroundPainter! as MPFocusRingPainter).color, light.secondary);
    });
  });

  group('loading', () {
    testWidgets('swallows the press but keeps the focus', (WidgetTester tester) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPButton(
            loading: true,
            focusNode: focus,
            onPressed: () => presses++,
            child: const Text('Save'),
          ),
        ),
      );

      await tester.tap(find.byType(MPButton));
      expect(presses, 0);

      focus.requestFocus();
      await tester.pump();
      expect(focus.hasFocus, isTrue);
    });

    testWidgets('puts the spinner where the leading icon was', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPButton(
            loading: true,
            onPressed: () {},
            startIcon: const SizedBox(key: Key('start'), width: 10, height: 10),
            child: const Text('Save'),
          ),
        ),
      );

      expect(find.byKey(const Key('start')), findsNothing);
      expect(find.byType(MPSpinner), findsOneWidget);
      expect(
        tester.getCenter(find.byType(MPSpinner)).dx,
        lessThan(tester.getCenter(find.text('Save')).dx),
      );
    });

    testWidgets('announces the spinner in the locale it is given', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPButton(loading: true, locale: 'ko', onPressed: () {}, child: const Text('저장'))),
      );

      expect(find.bySemanticsLabel(RegExp('불러오는 중')), findsOneWidget);
      semantics.dispose();
    });
  });

  group('colour', () {
    testWidgets('reads a different family for each colour', (WidgetTester tester) async {
      final Set<Color?> fills = <Color?>{};

      for (final MPColor color in MPColor.values) {
        await tester.pumpWidget(
          host(MPButton(color: color, onPressed: () {}, child: const Text('Save'))),
        );
        await tester.pumpAndSettle();
        fills.add(_surfaceOf(tester).color);
      }

      expect(fills, <Color>{light.primary, light.secondary, light.tertiary, light.error});
    });

    testWidgets('follows the theme’s source colour', (WidgetTester tester) async {
      const Color purple = Color(0xFF7C3AED);

      await tester.pumpWidget(
        host(
          MPTheme(
            sourceColor: purple,
            child: MPButton(onPressed: () {}, child: const Text('Save')),
          ),
        ),
      );

      expect(_surfaceOf(tester).color, MPColorScheme.fromSource(sourceColor: purple).primary);
    });

    testWidgets('follows the platform into the dark scheme', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          brightness: Brightness.dark,
          MPButton(onPressed: () {}, child: const Text('Save')),
        ),
      );

      expect(
        _surfaceOf(tester).color,
        MPColorScheme.fromSource(brightness: Brightness.dark).primary,
      );
    });
  });

  group('semantics', () {
    testWidgets('is one button node with its label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPButton(onPressed: () {}, child: const Text('Save'))));

      expect(
        tester.getSemantics(find.text('Save')),
        matchesSemantics(
          label: 'Save',
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

    testWidgets('names an icon button by its semanticLabel alone', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPButton(onPressed: () {}, semanticLabel: 'Add', startIcon: const Text('+'))),
      );

      expect(find.bySemanticsLabel('Add'), findsOneWidget);
      expect(find.bySemanticsLabel('+'), findsNothing);
      semantics.dispose();
    });
  });
}
