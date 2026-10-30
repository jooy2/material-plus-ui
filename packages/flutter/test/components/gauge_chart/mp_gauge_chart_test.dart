import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/gauge_chart/mp_gauge_chart.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPGaugeChart`.

final Finder _gauge = find.byType(MPGaugeChart);

Widget _host(Widget gauge) => host(gauge, width: 300);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  /// The reading's arc: the filled path in full colour that is not an end.
  Path readingOf(ChartCanvas canvas, Color color) {
    return canvas.filled.firstWhere(((Path, Paint) one) => sameColor(one.$2.color, color)).$1;
  }

  testWidgets('reads as a meter: the name, then the figure', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPGaugeChart(value: 72, label: Text('CPU'))));

    expect(tester.getSemantics(_gauge), matchesSemantics(label: 'CPU', value: '72'));
    semantics.dispose();
  });

  testWidgets('writes the figure the way it is told to', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(MPGaugeChart(value: 72, format: (double value) => '${value.round()}%')),
    );

    expect(find.text('72%'), findsOneWidget);
  });

  testWidgets('fills the dial in the primary family by default', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPGaugeChart(value: 50)));

    expect(
      paintPlot(
        tester,
        _gauge,
      ).filled.where(((Path, Paint) one) => sameColor(one.$2.color, light.primary)),
      hasLength(1),
    );
  });

  testWidgets('turns the family a threshold names once the reading reaches it', (
    WidgetTester tester,
  ) async {
    const List<MPThreshold> thresholds = <MPThreshold>[MPThreshold(from: 80, color: MPColor.error)];

    await tester.pumpWidget(_host(const MPGaugeChart(value: 70, thresholds: thresholds)));
    expect(
      paintPlot(
        tester,
        _gauge,
      ).filled.where(((Path, Paint) one) => sameColor(one.$2.color, light.error)),
      isEmpty,
    );

    await tester.pumpWidget(_host(const MPGaugeChart(value: 90, thresholds: thresholds)));
    expect(
      paintPlot(
        tester,
        _gauge,
      ).filled.where(((Path, Paint) one) => sameColor(one.$2.color, light.error)),
      hasLength(1),
    );
  });

  testWidgets('reads the thresholds in the order given, as the React gauge does', (
    WidgetTester tester,
  ) async {
    // Listed out of order: the last one the reading has reached wins, and that
    // is the 70 rather than the higher 90.
    await tester.pumpWidget(
      _host(
        const MPGaugeChart(
          value: 95,
          thresholds: <MPThreshold>[
            MPThreshold(from: 90, color: MPColor.error),
            MPThreshold(from: 70, color: MPColor.tertiary),
          ],
        ),
      ),
    );

    expect(
      paintPlot(
        tester,
        _gauge,
      ).filled.where(((Path, Paint) one) => sameColor(one.$2.color, light.tertiary)),
      hasLength(1),
    );
  });

  testWidgets('cuts the track into the bands the thresholds describe', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPGaugeChart(
          value: 30,
          bands: true,
          thresholds: <MPThreshold>[
            MPThreshold(from: 60, color: MPColor.tertiary),
            MPThreshold(from: 85, color: MPColor.error),
          ],
        ),
      ),
    );

    final List<Paint> washes = paintPlot(tester, _gauge).filled
        .map(((Path, Paint) one) => one.$2)
        .where((Paint paint) => (paint.color.a - 0.22).abs() < 0.01)
        .toList();

    expect(washes, hasLength(3));
  });

  testWidgets('draws a larger reading as a longer arc', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPGaugeChart(value: 20, sweep: 180)));
    final double low = readingOf(paintPlot(tester, _gauge), light.primary).getBounds().width;

    await tester.pumpWidget(_host(const MPGaugeChart(value: 80, sweep: 180)));
    final double high = readingOf(paintPlot(tester, _gauge), light.primary).getBounds().width;

    expect(high, greaterThan(low));
  });

  testWidgets('takes its height from the size ladder and its family from a provider', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPConfigProvider(
          size: MPSize.sm,
          color: MPColor.tertiary,
          child: MPGaugeChart(value: 50, sweep: 180),
        ),
      ),
    );

    expect(tester.getSize(plotOf(_gauge).first).height, 160);
    expect(
      paintPlot(
        tester,
        _gauge,
      ).filled.where(((Path, Paint) one) => sameColor(one.$2.color, light.tertiary)),
      hasLength(1),
    );
  });
}
