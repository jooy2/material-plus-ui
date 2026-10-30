import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/scatter_chart/mp_scatter_chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPScatterChart`.

const List<MPChartSeries> _runs = <MPChartSeries>[
  MPChartSeries(
    name: 'Runs',
    data: <MPChartDatum>[
      MPChartPoint(x: 12, y: 4.2),
      MPChartPoint(x: 19, y: 5.1),
      MPChartPoint(x: 25, y: 6.4),
    ],
  ),
  MPChartSeries(
    name: 'Rides',
    data: <MPChartDatum>[MPChartPoint(x: 15, y: 3.1), MPChartPoint(x: 30, y: 4.4)],
  ),
];

final Finder _chart = find.byType(MPScatterChart);

Widget _host(Widget chart) => host(chart, width: 400);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  List<Path> marksOf(ChartCanvas canvas, int index) => <Path>[
    for (final (Path path, Paint paint) in canvas.filled)
      if (sameColor(paint.color, light.chart[index])) path,
  ];

  testWidgets('draws one mark per observation across every series', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs)));

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(marksOf(canvas, 0), hasLength(3));
    expect(marksOf(canvas, 1), hasLength(2));
  });

  testWidgets('places a mark by its own x rather than by its index', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPScatterChart(
          series: <MPChartSeries>[
            MPChartSeries(
              data: <MPChartDatum>[MPChartPoint(x: 30, y: 1), MPChartPoint(x: 10, y: 1)],
            ),
          ],
        ),
      ),
    );

    final List<Path> marks = marksOf(paintPlot(tester, _chart), 0);

    expect(marks[0].getBounds().center.dx, greaterThan(marks[1].getBounds().center.dx));
  });

  testWidgets('rules the plot both ways, which no other chart here does', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs)));

    final List<(Offset, Offset, Paint)> grid = paintPlot(tester, _chart).lines
        .where(((Offset, Offset, Paint) line) => sameColor(line.$3.color, light.outlineVariant))
        .toList();

    expect(grid.where(((Offset, Offset, Paint) line) => line.$1.dx == line.$2.dx), isNotEmpty);
    expect(grid.where(((Offset, Offset, Paint) line) => line.$1.dy == line.$2.dy), isNotEmpty);
  });

  testWidgets('gives each series a shape as well as a colour', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs)));

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final Path circle = marksOf(canvas, 0).first;
    final Path square = marksOf(canvas, 1).first;

    Offset nearCorner(Path path) => path.getBounds().topLeft + const Offset(0.5, 0.5);

    expect(circle.contains(nearCorner(circle)), isFalse);
    expect(square.contains(nearCorner(square)), isTrue);
  });

  testWidgets('drops back to circles when the shapes are turned off', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs, shapes: false)));

    final Path mark = marksOf(paintPlot(tester, _chart), 1).first;

    expect(mark.contains(mark.getBounds().topLeft + const Offset(0.5, 0.5)), isFalse);
  });

  testWidgets('puts the shape in the legend rather than a dot', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs)));

    final Iterable<CustomPaint> swatches = tester
        .widgetList<CustomPaint>(
          find.descendant(of: find.byType(ChartLegend), matching: find.byType(CustomPaint)),
        )
        .where((CustomPaint paint) => paint.painter != null);

    expect(swatches, hasLength(2));
  });

  testWidgets('sizes a bubble by area rather than by radius', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPScatterChart(
          bubble: true,
          series: <MPChartSeries>[
            MPChartSeries(
              data: <MPChartDatum>[
                MPChartPoint(x: 1, y: 1, z: 100),
                MPChartPoint(x: 2, y: 2, z: 25),
              ],
            ),
          ],
        ),
      ),
    );

    final List<Path> marks = marksOf(paintPlot(tester, _chart), 0);
    final double big = marks[0].getBounds().width / 2;
    final double small = marks[1].getBounds().width / 2;

    // From a floor of 4 to 22: the quarter-sized z gets half the extra radius.
    expect(big, closeTo(22, 0.01));
    expect(small, closeTo(4 + 18 * 0.5, 0.01));
  });

  testWidgets('titles the panel with the mark’s own x, and drops no crosshair', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPScatterChart(series: _runs)));

    final Rect mark = marksOf(paintPlot(tester, _chart), 0).first.getBounds();
    final Offset origin = tester.getTopLeft(plotOf(_chart).first);

    await hoverAt(tester, origin + mark.center);

    expect(find.byType(ChartTooltipPanel), findsOneWidget);
    expect(
      find.descendant(of: find.byType(ChartTooltipPanel), matching: find.text('12')),
      findsOneWidget,
    );
    expect(
      paintPlot(tester, _chart).lines.where(
        ((Offset, Offset, Paint) line) =>
            sameColor(line.$3.color, light.outline) && line.$1.dx == line.$2.dx && line.$1.dx > 100,
      ),
      isEmpty,
    );
  });

  testWidgets('walks the marks rather than columns', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(_host(MPScatterChart(series: _runs, focusNode: focus)));
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(readoutOf(tester), '12, Runs: 4.2');

    await tester.sendKeyEvent(LogicalKeyboardKey.end);
    await tester.pump();
    expect(readoutOf(tester), '30, Rides: 4.4');
    semantics.dispose();
  });

  testWidgets('draws the empty state when no point has a place on the axis', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPScatterChart(
          series: <MPChartSeries>[
            MPChartSeries(data: <MPChartDatum>[MPChartPoint(x: 'north', y: 3)]),
          ],
        ),
      ),
    );

    expect(find.text('No data'), findsOneWidget);
  });

  testWidgets('takes a reference on the category axis, because that axis has a scale', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPScatterChart(
          series: _runs,
          xAxis: MPChartAxis(references: <MPChartReference>[MPChartReference(value: 20)]),
        ),
      ),
    );

    final Path line = paintPlot(
      tester,
      _chart,
    ).strokes.firstWhere(((Path, Paint) one) => sameColor(one.$2.color, light.outline)).$1;

    expect(line.getBounds().width, closeTo(0, 0.01));
  });

  testWidgets('describes the picture with the numbers behind it', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPScatterChart(label: 'Pace', series: _runs)));

    expect(chartNode(tester, 'Pace').value, contains('Runs 4.2'));
    semantics.dispose();
  });
}
