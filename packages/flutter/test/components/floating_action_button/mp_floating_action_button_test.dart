import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/floating_action_button/mp_floating_action_button.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const Widget _glyph = SizedBox.square(key: Key('glyph'), dimension: 24);

BoxDecoration _surfaceOf(WidgetTester tester) {
  return tester
          .widget<AnimatedContainer>(
            find
                .descendant(
                  of: find.byType(MPFloatingActionButton),
                  matching: find.byType(AnimatedContainer),
                )
                .first,
          )
          .decoration!
      as BoxDecoration;
}

Size _sizeOf(WidgetTester tester) {
  return tester.getSize(
    find
        .descendant(
          of: find.byType(MPFloatingActionButton),
          matching: find.byType(AnimatedContainer),
        )
        .first,
  );
}

/// A button in the flow, the way a demo page puts one.
Widget _inline(MPFloatingActionButton button) => host(button);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('has a name even though it is only a glyph', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      _inline(
        MPFloatingActionButton(floating: false, icon: _glyph, label: 'Compose', onPressed: () {}),
      ),
    );

    expect(
      tester.getSemantics(find.bySemanticsLabel('Compose')),
      matchesSemantics(
        label: 'Compose',
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

  testWidgets('fires when pressed, by pointer and by keyboard', (WidgetTester tester) async {
    int presses = 0;
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      _inline(
        MPFloatingActionButton(
          floating: false,
          icon: _glyph,
          label: 'Compose',
          focusNode: focus,
          onPressed: () => presses++,
        ),
      ),
    );
    await tester.tap(find.byType(MPFloatingActionButton));
    focus.requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);

    expect(presses, 2);
  });

  testWidgets('is Material’s own default before anything is chosen', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inline(
        MPFloatingActionButton(floating: false, icon: _glyph, label: 'Compose', onPressed: () {}),
      ),
    );

    expect(_surfaceOf(tester).color, light.primaryContainer);
    expect(_surfaceOf(tester).boxShadow, MPShadows.of(3));
    expect(_sizeOf(tester), const Size(56, 56));
    expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(16));
  });

  testWidgets('paints each variant from its own roles', (WidgetTester tester) async {
    final Map<MPFloatingActionButtonVariant, Color> fills = <MPFloatingActionButtonVariant, Color>{
      MPFloatingActionButtonVariant.filled: light.primary,
      MPFloatingActionButtonVariant.tonal: light.primaryContainer,
      MPFloatingActionButtonVariant.elevated: light.surfaceContainerHigh,
    };

    for (final MapEntry<MPFloatingActionButtonVariant, Color> entry in fills.entries) {
      await tester.pumpWidget(
        _inline(
          MPFloatingActionButton(
            floating: false,
            variant: entry.key,
            icon: _glyph,
            label: 'Compose',
            onPressed: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_surfaceOf(tester).color, entry.value, reason: entry.key.name);
    }
  });

  testWidgets('walks its own ladder and moves the corner with it', (WidgetTester tester) async {
    final List<double> heights = <double>[];
    final List<BorderRadiusGeometry?> corners = <BorderRadiusGeometry?>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(
        _inline(
          MPFloatingActionButton(
            floating: false,
            size: size,
            icon: _glyph,
            label: 'Compose',
            onPressed: () {},
          ),
        ),
      );
      heights.add(_sizeOf(tester).height);
      corners.add(_surfaceOf(tester).borderRadius);
    }

    expect(heights, <double>[40, 48, 56, 72, 96]);
    expect(corners, <BorderRadius>[
      BorderRadius.circular(12),
      BorderRadius.circular(16),
      BorderRadius.circular(16),
      BorderRadius.circular(28),
      BorderRadius.circular(28),
    ]);
  });

  testWidgets('writes the label on the button when extended', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inline(
        MPFloatingActionButton(
          floating: false,
          extended: true,
          icon: _glyph,
          label: 'Compose',
          onPressed: () {},
        ),
      ),
    );

    expect(find.text('Compose'), findsOneWidget);
    expect(_sizeOf(tester).width, greaterThan(56));
    expect(_sizeOf(tester).height, 56);
  });

  testWidgets('stays square while it is a disc', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inline(
        MPFloatingActionButton(floating: false, icon: _glyph, label: 'Compose', onPressed: () {}),
      ),
    );

    expect(_sizeOf(tester), const Size(56, 56));
    expect(tester.getSize(find.text('Compose')).width, greaterThan(0));
    expect(
      tester
          .getSize(find.ancestor(of: find.text('Compose'), matching: find.byType(ClipRect)))
          .width,
      0,
    );
  });

  testWidgets('travels between the disc and the stadium', (WidgetTester tester) async {
    Widget build({required bool extended}) {
      return _inline(
        MPFloatingActionButton(
          floating: false,
          extended: extended,
          icon: _glyph,
          label: 'Compose',
          onPressed: () {},
        ),
      );
    }

    await tester.pumpWidget(build(extended: false));
    await tester.pumpWidget(build(extended: true));
    await tester.pump(const Duration(milliseconds: 100));
    final double midway = _sizeOf(tester).width;
    await tester.pumpAndSettle();
    final double open = _sizeOf(tester).width;

    expect(midway, greaterThan(56));
    expect(midway, lessThan(open));
  });

  testWidgets('sits in the corner it was pinned to, at its offset', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 400,
        height: 300,
        Stack(
          children: <Widget>[
            MPFloatingActionButton(icon: _glyph, label: 'Compose', onPressed: () {}),
          ],
        ),
      ),
    );

    final Rect stack = tester.getRect(find.byType(Stack).first);
    final Rect button = tester.getRect(find.byType(MPFloatingActionButton));

    expect(stack.right - button.right, 16);
    expect(stack.bottom - button.bottom, 16);
  });

  testWidgets('takes the start corner from the writing direction', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 400,
        height: 300,
        textDirection: TextDirection.rtl,
        Stack(
          children: <Widget>[
            MPFloatingActionButton(
              corner: MPCorner.topStart,
              offset: 24,
              icon: _glyph,
              label: 'Compose',
              onPressed: () {},
            ),
          ],
        ),
      ),
    );

    final Rect stack = tester.getRect(find.byType(Stack).first);
    final Rect button = tester.getRect(find.byType(MPFloatingActionButton));

    expect(stack.right - button.right, 24);
    expect(button.top - stack.top, 24);
  });

  testWidgets('stops floating while it is unavailable', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inline(
        const MPFloatingActionButton(
          floating: false,
          icon: _glyph,
          label: 'Compose',
          onPressed: null,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(_surfaceOf(tester).boxShadow, isEmpty);
    expect(_surfaceOf(tester).color, light.onSurface.withValues(alpha: 0.12));
  });
}
