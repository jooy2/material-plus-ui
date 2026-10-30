import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../support/host.dart';

/// Reads the theme in force wherever it is put.
class _Probe extends StatelessWidget {
  const _Probe(this.seen);

  final void Function(MPThemeData theme) seen;

  @override
  Widget build(BuildContext context) {
    seen(MPTheme.of(context));

    return const SizedBox();
  }
}

void main() {
  testWidgets('needs nothing above it, and follows the platform', (WidgetTester tester) async {
    late MPThemeData theme;

    await tester.pumpWidget(host(_Probe((MPThemeData value) => theme = value)));
    expect(theme.brightness, Brightness.light);
    expect(theme.colors, MPColorScheme.fromSource());

    await tester.pumpWidget(
      host(brightness: Brightness.dark, _Probe((MPThemeData value) => theme = value)),
    );
    expect(theme.brightness, Brightness.dark);
    expect(theme.colors, MPColorScheme.fromSource(brightness: Brightness.dark));
  });

  testWidgets('generates the scheme from its source colour', (WidgetTester tester) async {
    const Color purple = Color(0xFF7C3AED);
    late MPThemeData theme;

    await tester.pumpWidget(
      host(MPTheme(sourceColor: purple, child: _Probe((MPThemeData value) => theme = value))),
    );

    expect(theme.colors, MPColorScheme.fromSource(sourceColor: purple));
  });

  testWidgets('a nested theme says only what it changes', (WidgetTester tester) async {
    const Color purple = Color(0xFF7C3AED);
    late MPThemeData inner;

    await tester.pumpWidget(
      host(
        MPTheme(
          sourceColor: purple,
          shapes: MPShapes.sharp,
          child: MPTheme(
            brightness: Brightness.dark,
            child: _Probe((MPThemeData value) => inner = value),
          ),
        ),
      ),
    );

    // The outer source colour and shapes, in the inner brightness.
    expect(
      inner.colors,
      MPColorScheme.fromSource(sourceColor: purple, brightness: Brightness.dark),
    );
    expect(inner.shapes, MPShapes.sharp);
  });

  testWidgets('a scheme given whole is used as it is', (WidgetTester tester) async {
    final MPColorScheme custom = MPColorScheme.fromSource().copyWith(
      outline: const Color(0xFF123456),
    );
    late MPThemeData theme;

    await tester.pumpWidget(
      host(MPTheme(colors: custom, child: _Probe((MPThemeData value) => theme = value))),
    );

    expect(theme.colors.outline, const Color(0xFF123456));
  });

  testWidgets('a theme pinned to light stays light on a dark platform', (
    WidgetTester tester,
  ) async {
    late MPThemeData theme;

    await tester.pumpWidget(
      host(
        brightness: Brightness.dark,
        MPTheme(brightness: Brightness.light, child: _Probe((MPThemeData value) => theme = value)),
      ),
    );

    expect(theme.brightness, Brightness.light);
  });

  test('the type scale is MD3’s', () {
    const MPTypescale scale = MPTypescale.material;

    expect(scale.labelLarge.size, 14);
    expect(scale.labelLarge.lineHeight, 20);
    expect(scale.labelLarge.weight, FontWeight.w500);
    expect(scale.bodyLarge.tracking, 0.5);
    expect(scale.headlineSmall.weight, FontWeight.w400);
  });

  test('a full corner becomes a pill for the height it is drawn at', () {
    expect(MPShapes.circular(MPShapes.material.full, height: 40), BorderRadius.circular(20));
    expect(MPShapes.circular(MPShapes.material.medium), BorderRadius.circular(12));
  });
}
