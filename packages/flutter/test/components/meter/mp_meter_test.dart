import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/meter/mp_meter.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads the accent slot off the root and the fill's width off
/// the indicator; this reads the indicator's decoration and its share of the
/// groove.

final Finder _meter = find.byType(MPMeter);

Rect _groove(WidgetTester tester) {
  return tester.getRect(find.descendant(of: _meter, matching: find.byType(ClipRRect)));
}

/// How wide the fill is, as a whole percentage of the groove.
int _filled(WidgetTester tester) {
  final double fill = tester
      .getSize(find.descendant(of: _meter, matching: find.byType(AnimatedFractionallySizedBox)))
      .width;

  return (fill / _groove(tester).width * 100).round();
}

/// The family the bar has resolved to.
Color? _accent(WidgetTester tester) {
  final AnimatedContainer bar = tester.widget<AnimatedContainer>(
    find.descendant(of: _meter, matching: find.byType(AnimatedContainer)),
  );

  return (bar.decoration! as BoxDecoration).color;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('is a measurement, not a progress bar', (WidgetTester tester) async {
    // Flutter has no meter role, and claiming `progressBar` would be
    // announcing the one thing a meter is not. A named node with a value is
    // what the platforms read out.
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(width: 300, const MPMeter(value: 41, max: 60, label: Text('Seats'))),
    );

    final SemanticsData node = semanticsOf(tester, _meter).getSemanticsData();

    expect(node.role, SemanticsRole.none);
    expect(node.label, 'Seats');
    expect(node.value, '68%');
    semantics.dispose();
  });

  testWidgets('fills the groove to the share of the range', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, const MPMeter(value: 30)));

    expect(_filled(tester), 30);
  });

  testWidgets('reads a range that does not start at zero', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, const MPMeter(value: 5, max: 20)));

    expect(_filled(tester), 25);

    await tester.pumpWidget(host(width: 300, const MPMeter(value: 15, min: 10, max: 20)));
    // Waited for, because the fill travels to a new reading rather than
    // jumping to it.
    await tester.pumpAndSettle();

    expect(_filled(tester), 50);
  });

  testWidgets('clamps a reading that ran past its own scale', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 300, const MPMeter(value: 140)));

    expect(_filled(tester), 100);

    await tester.pumpWidget(host(width: 300, const MPMeter(value: -20)));
    await tester.pumpAndSettle();

    expect(_filled(tester), 0);
  });

  testWidgets('shows the value as a share of the range when nothing said what it means', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 300, const MPMeter(value: 41, max: 60, showValue: true)));

    expect(find.text('68%'), findsOneWidget);
  });

  testWidgets('writes the value in its own units when `formatValue` says what they are', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(
        width: 300,
        MPMeter(
          value: 340,
          max: 500,
          showValue: true,
          formatValue: (double value) => '£${value.toStringAsFixed(2)}',
        ),
      ),
    );

    expect(find.text('£340.00'), findsOneWidget);
    expect(semanticsOf(tester, _meter).getSemanticsData().value, '£340.00');
    semantics.dispose();
  });

  testWidgets('carries `color` until a threshold is reached', (WidgetTester tester) async {
    const List<MPThreshold> thresholds = <MPThreshold>[
      MPThreshold(from: 60, color: MPColor.tertiary),
      MPThreshold(from: 90, color: MPColor.error),
    ];

    await tester.pumpWidget(host(width: 300, const MPMeter(value: 20, thresholds: thresholds)));
    expect(_accent(tester), light.primary);

    await tester.pumpWidget(host(width: 300, const MPMeter(value: 70, thresholds: thresholds)));
    await tester.pumpAndSettle();
    expect(_accent(tester), light.tertiary);

    await tester.pumpWidget(host(width: 300, const MPMeter(value: 95, thresholds: thresholds)));
    await tester.pumpAndSettle();
    expect(_accent(tester), light.error);
  });

  testWidgets('lets the last threshold reached win, in the order they were given', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPMeter(
          value: 95,
          thresholds: <MPThreshold>[
            MPThreshold(from: 90, color: MPColor.error),
            MPThreshold(from: 60, color: MPColor.tertiary),
          ],
        ),
      ),
    );

    expect(_accent(tester), light.tertiary);
  });

  testWidgets('starts from the provider’s family', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 300, const MPConfigProvider(color: MPColor.secondary, child: MPMeter(value: 50))),
    );

    expect(_accent(tester), light.secondary);
  });

  testWidgets('takes the groove’s thickness from `size`', (WidgetTester tester) async {
    final List<double> heights = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(host(width: 300, MPMeter(value: 50, size: size)));
      heights.add(_groove(tester).height);
    }

    expect(heights, <double>[2, 3, 4, 6, 8]);
  });

  testWidgets('draws no header line when there is nothing to put in it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 300, const MPMeter(value: 50)));

    expect(tester.getSize(_meter).height, 4);

    await tester.pumpWidget(host(width: 300, const MPMeter(value: 50, showValue: true)));

    expect(tester.getSize(_meter).height, greaterThan(4));
    // On its own the value sits at the end of the run it measures.
    expect(tester.getRect(find.text('50%')).right, _groove(tester).right);
  });
}
