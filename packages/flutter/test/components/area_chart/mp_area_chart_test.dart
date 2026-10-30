import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/area_chart/mp_area_chart.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPAreaChart`.

const List<String> _months = <String>['Jan', 'Feb', 'Mar', 'Apr'];

const List<MPChartSeries> _two = <MPChartSeries>[
  MPChartSeries(name: 'Mobile', data: <num>[10, 12, 14, 16]),
  MPChartSeries(name: 'Desktop', data: <num>[6, 7, 8, 9]),
];

final Finder _chart = find.byType(MPAreaChart);

Widget _host(Widget chart) => host(chart, width: 400);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  /// The fill of series [index]: the filled path in its colour.
  (Path, Paint) fillOf(ChartCanvas canvas, int index) => canvas.filled.firstWhere(
    ((Path, Paint) one) =>
        sameColor(one.$2.color.withValues(alpha: 1), light.chart[index].withValues(alpha: 1)) &&
        one.$2.color.a < 1,
  );

  testWidgets('keeps zero on the axis, because a fill measures from a baseline', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B'],
          series: <MPChartSeries>[
            MPChartSeries(data: <num>[3200, 3400]),
          ],
        ),
      ),
    );

    final Rect band = fillOf(paintPlot(tester, _chart), 0).$1.getBounds();

    // The fill reaches from the baseline to the value, and the value is most of
    // the way up: zero is on the axis.
    expect(band.height, greaterThan(100));
  });

  testWidgets('stands every band on the baseline when they are not stacked', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPAreaChart(categories: _months, series: _two)));

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(fillOf(canvas, 0).$1.getBounds().bottom, fillOf(canvas, 1).$1.getBounds().bottom);
  });

  testWidgets('puts the second band on top of the first, with the gap taken from above', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(const MPAreaChart(categories: _months, series: _two, stacked: MPChartStack.stacked)),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final Rect first = fillOf(canvas, 0).$1.getBounds();
    final Rect second = fillOf(canvas, 1).$1.getBounds();

    expect(second.top, lessThan(first.top));
    // The band above stands on the one below rather than on the baseline.
    expect(second.bottom, lessThan(first.bottom - 10));
  });

  testWidgets('re-stacks the survivors rather than leaving a hole', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPAreaChart(categories: _months, series: _two, stacked: MPChartStack.stacked)),
    );
    final double floor = fillOf(paintPlot(tester, _chart), 0).$1.getBounds().bottom;

    await tester.tap(find.text('Mobile'));
    await tester.pump();

    expect(fillOf(paintPlot(tester, _chart), 1).$1.getBounds().bottom, floor);
  });

  testWidgets('stacks negatives downward rather than folding them into the total', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B'],
          stacked: MPChartStack.stacked,
          series: <MPChartSeries>[
            MPChartSeries(name: 'Up', data: <num>[5, 5]),
            MPChartSeries(name: 'Down', data: <num>[-3, -3]),
          ],
        ),
      ),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(fillOf(canvas, 1).$1.getBounds().top, greaterThan(fillOf(canvas, 0).$1.getBounds().top));
    expect(
      fillOf(canvas, 1).$1.getBounds().top,
      greaterThanOrEqualTo(fillOf(canvas, 0).$1.getBounds().bottom - 1),
    );
  });

  testWidgets('breaks the band at a gap rather than filling across it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B', 'C', 'D', 'E'],
          series: <MPChartSeries>[
            MPChartSeries(data: <num?>[1, 2, null, 4, 5]),
          ],
        ),
      ),
    );

    expect(fillOf(paintPlot(tester, _chart), 0).$1.computeMetrics().length, 2);
  });

  testWidgets('closes the fill across a gap when asked, and marks the joining edge', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B', 'C', 'D', 'E'],
          gaps: MPChartGaps.connect,
          series: <MPChartSeries>[
            MPChartSeries(data: <num?>[1, 2, null, 4, 5]),
          ],
        ),
      ),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final List<(Path, Paint)> edges = canvas.strokes
        .where(((Path, Paint) one) => sameColor(one.$2.color, light.chart[0]))
        .toList();

    expect(fillOf(canvas, 0).$1.computeMetrics().length, 1);
    // The edge in its two runs, and the dashed bridge.
    expect(edges, hasLength(2));
  });

  testWidgets('pinches the band shut at a gap read as a zero', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B', 'C', 'D', 'E'],
          gaps: MPChartGaps.zero,
          series: <MPChartSeries>[
            MPChartSeries(data: <num?>[1, 2, null, 4, 5]),
          ],
        ),
      ),
    );

    expect(fillOf(paintPlot(tester, _chart), 0).$1.computeMetrics().length, 1);
  });

  testWidgets('draws the top edge in full colour over a faint fill', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPAreaChart(categories: _months, series: _two)));

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(fillOf(canvas, 0).$2.color.a, closeTo(0.18, 0.01));
    expect(
      canvas.strokes.where(((Path, Paint) one) => sameColor(one.$2.color, light.chart[0])),
      isNotEmpty,
    );
  });

  testWidgets('fills a stacked band nearly solid, having nothing behind it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(const MPAreaChart(categories: _months, series: _two, stacked: MPChartStack.stacked)),
    );

    expect(fillOf(paintPlot(tester, _chart), 0).$2.color.a, closeTo(0.85, 0.01));
  });

  testWidgets('leaves the markers off a stack, and draws them on an overlap with room', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(const MPAreaChart(categories: _months, series: _two, stacked: MPChartStack.stacked)),
    );
    expect(paintPlot(tester, _chart).circles, isEmpty);

    await tester.pumpWidget(_host(const MPAreaChart(categories: _months, series: _two)));
    expect(paintPlot(tester, _chart).circles, hasLength(16));
  });

  testWidgets('fills the plot when the stack is a percent one', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPAreaChart(
          categories: <String>['A', 'B'],
          stacked: MPChartStack.percent,
          series: <MPChartSeries>[
            MPChartSeries(name: 'X', data: <num>[1, 30]),
            MPChartSeries(name: 'Y', data: <num>[3, 10]),
          ],
        ),
      ),
    );

    final Rect top = fillOf(paintPlot(tester, _chart), 1).$1.getBounds();
    final Path edge = canvasEdge(paintPlot(tester, _chart), light.chart[1]);

    // The top band's upper edge is flat: every column is full.
    expect(edge.getBounds().height, closeTo(0, 0.01));
    expect(top.top, edge.getBounds().top);
  });

  testWidgets('carries the frame’s keyboard, reading and total', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      _host(
        MPAreaChart(
          label: 'Visits',
          categories: _months,
          series: _two,
          stacked: MPChartStack.stacked,
          focusNode: focus,
        ),
      ),
    );
    focus.requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();

    expect(readoutOf(tester), 'Jan, Mobile: 10, Desktop: 6, Total: 16');
    expect(chartNode(tester, 'Visits').value, startsWith('Jan: Mobile 10, Desktop 6.'));
    semantics.dispose();
  });
}

/// The stroked top edge drawn in [color].
Path canvasEdge(ChartCanvas canvas, Color color) {
  return canvas.strokes.firstWhere(((Path, Paint) one) => sameColor(one.$2.color, color)).$1;
}
