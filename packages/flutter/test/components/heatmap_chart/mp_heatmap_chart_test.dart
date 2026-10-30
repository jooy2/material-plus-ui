import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/heatmap_chart/mp_heatmap_chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPHeatmapChart`.

const List<String> _days = <String>['Mon', 'Tue', 'Wed'];

const List<MPChartSeries> _hours = <MPChartSeries>[
  MPChartSeries(name: '09:00', data: <num>[4, 9, 2]),
  MPChartSeries(name: '10:00', data: <num>[7, 12, 5]),
];

final Finder _chart = find.byType(MPHeatmapChart);

Widget _host(Widget chart) => host(chart, width: 400);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  /// The fills of the cells, in row order.
  List<Color> fillsOf(ChartCanvas canvas) => <Color>[
    for (final Paint paint in canvas.rrects)
      if (paint.style == PaintingStyle.fill) paint.color,
  ];

  testWidgets('draws a cell per value', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPHeatmapChart(categories: _days, series: _hours)));

    expect(fillsOf(paintPlot(tester, _chart)), hasLength(6));
  });

  testWidgets('colours the cells from the ramp, low to high', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPHeatmapChart(categories: _days, series: _hours)));

    final List<Color> fills = fillsOf(paintPlot(tester, _chart));

    // 2 is the lowest and 12 the highest.
    expect(sameColor(fills[2], light.chartScale.first), isTrue);
    expect(sameColor(fills[4], light.chartScale.last), isTrue);
  });

  testWidgets('leaves a cell with nothing in it as a hole', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPHeatmapChart(
          categories: _days,
          series: <MPChartSeries>[
            MPChartSeries(name: '09:00', data: <num?>[4, null, 2]),
          ],
        ),
      ),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(fillsOf(canvas), hasLength(2));
    expect(
      canvas.strokes.where(((Path, Paint) one) => sameColor(one.$2.color, light.outlineVariant)),
      hasLength(1),
    );
  });

  testWidgets('scales to the range it is pinned to', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPHeatmapChart(categories: _days, series: _hours, min: 0, max: 100)),
    );

    // Everything is in the bottom fifth of a scale running to 100.
    expect(
      fillsOf(
        paintPlot(tester, _chart),
      ).every((Color fill) => sameColor(fill, light.chartScale.first)),
      isTrue,
    );
  });

  testWidgets('rings the cell under the pointer rather than recolouring it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPHeatmapChart(categories: _days, series: _hours)));

    await hoverAt(tester, plotPoint(tester, _chart, 0.95, 0.1));

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final List<Paint> rings = canvas.rrects
        .where((Paint paint) => paint.style == PaintingStyle.stroke)
        .toList();

    expect(rings, hasLength(1));
    expect(sameColor(rings.single.color, light.onSurface), isTrue);
    expect(find.byType(ChartTooltipPanel), findsOneWidget);
    expect(find.text('09:00 · Wed'), findsOneWidget);
  });

  testWidgets('walks the grid in both directions with the arrow keys', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      _host(MPHeatmapChart(categories: _days, series: _hours, focusNode: focus)),
    );
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(readoutOf(tester), '09:00 · Mon, 09:00: 4');

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(readoutOf(tester), '10:00 · Tue, 10:00: 12');

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pump();
    expect(readoutOf(tester), isNull);
    semantics.dispose();
  });

  testWidgets('writes the values in the cells only when asked', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPHeatmapChart(categories: _days, series: _hours)));
    final int bare = paintPlot(tester, _chart).texts.length;

    await tester.pumpWidget(
      _host(const MPHeatmapChart(categories: _days, series: _hours, valueLabels: true)),
    );

    expect(paintPlot(tester, _chart).texts.length, bare + 6);
  });

  testWidgets('draws the ramp as its legend, with the two ends written', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPHeatmapChart(categories: _days, series: _hours)));

    expect(find.text('2'), findsOneWidget);
    expect(find.text('12'), findsOneWidget);

    await tester.pumpWidget(
      _host(
        const MPHeatmapChart(
          categories: _days,
          series: _hours,
          legend: MPChartLegend(visible: false),
        ),
      ),
    );

    expect(find.text('12'), findsNothing);
  });

  testWidgets('describes the grid row by row', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      _host(const MPHeatmapChart(label: 'Load', categories: _days, series: _hours)),
    );

    expect(
      chartNode(tester, 'Load').value,
      '09:00: Mon 4, Tue 9, Wed 2. 10:00: Mon 7, Tue 12, Wed 5',
    );
    semantics.dispose();
  });

  testWidgets('draws the empty state when no cell has a value', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPHeatmapChart(
          categories: _days,
          series: <MPChartSeries>[
            MPChartSeries(data: <num?>[null, null]),
          ],
        ),
      ),
    );

    expect(find.text('No data'), findsOneWidget);
  });
}
