import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/bar_chart/mp_bar_chart.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPBarChart`.

const List<String> _channels = <String>['Search', 'Direct', 'Social', 'Mail'];

const List<MPChartSeries> _one = <MPChartSeries>[
  MPChartSeries(name: 'Sessions', data: <num>[4820, 3110, 1940, 860]),
];

const List<MPChartSeries> _two = <MPChartSeries>[
  MPChartSeries(name: '2025', data: <num>[40, 30, 20, 10]),
  MPChartSeries(name: '2026', data: <num>[45, 25, 30, 15]),
];

final Finder _chart = find.byType(MPBarChart);

Widget _host(Widget chart) => host(chart, width: 400);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  /// The bars of series [index], left to right.
  List<Rect> barsOf(ChartCanvas canvas, int index) => <Rect>[
    for (final (Path path, Paint paint) in canvas.filled)
      if (sameColor(paint.color.withValues(alpha: 1), light.chart[index])) path.getBounds(),
  ];

  /// The paints of series [index]'s bars.
  List<Paint> paintsOf(ChartCanvas canvas, int index) => <Paint>[
    for (final (Path _, Paint paint) in canvas.filled)
      if (sameColor(paint.color.withValues(alpha: 1), light.chart[index])) paint,
  ];

  Path barPathOf(ChartCanvas canvas, int index, int at) {
    return <Path>[
      for (final (Path path, Paint paint) in canvas.filled)
        if (sameColor(paint.color.withValues(alpha: 1), light.chart[index])) path,
    ][at];
  }

  testWidgets('keeps zero on the axis, because a bar’s length is its value', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        const MPBarChart(
          categories: <String>['A', 'B'],
          series: <MPChartSeries>[
            MPChartSeries(data: <num>[3200, 3400]),
          ],
        ),
      ),
    );

    final List<Rect> bars = barsOf(paintPlot(tester, _chart), 0);

    // 3,200 against 3,400 is a pair of nearly equal lengths, not one bar and a
    // stub.
    expect(bars[0].height / bars[1].height, closeTo(3200 / 3400, 0.02));
  });

  testWidgets('draws a bar per category and stands them all on the baseline', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _one)));

    final List<Rect> bars = barsOf(paintPlot(tester, _chart), 0);

    expect(bars, hasLength(4));
    expect(bars.map((Rect bar) => bar.bottom).toSet(), hasLength(1));
  });

  testWidgets('rounds only the data end and leaves the baseline square', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _one)));

    final Path bar = barPathOf(paintPlot(tester, _chart), 0, 0);
    final Rect box = bar.getBounds();

    expect(bar.contains(box.topLeft + const Offset(0.5, 0.5)), isFalse);
    expect(bar.contains(box.bottomLeft + const Offset(0.5, -0.5)), isTrue);
  });

  testWidgets('rounds the bottom of a bar that hangs below zero', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPBarChart(
          categories: <String>['A', 'B'],
          series: <MPChartSeries>[
            MPChartSeries(data: <num>[-20, 10]),
          ],
        ),
      ),
    );

    final Path bar = barPathOf(paintPlot(tester, _chart), 0, 0);
    final Rect box = bar.getBounds();

    expect(bar.contains(box.topLeft + const Offset(0.5, 0.5)), isTrue);
    expect(bar.contains(box.bottomLeft + const Offset(0.5, -0.5)), isFalse);
  });

  testWidgets('stands two series side by side, each in its own share of the band', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _two)));

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(barsOf(canvas, 1).first.left, greaterThan(barsOf(canvas, 0).first.right));
  });

  testWidgets('centres one bar in the slot when stacked, with a gap between segments', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(const MPBarChart(categories: _channels, series: _two, stacked: MPChartStack.stacked)),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final Rect lower = barsOf(canvas, 0).first;
    final Rect upper = barsOf(canvas, 1).first;

    expect(upper.left, lower.left);
    expect(lower.top - upper.bottom, closeTo(2, 0.01));
  });

  testWidgets('rounds only the outermost segment of a stack', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPBarChart(categories: _channels, series: _two, stacked: MPChartStack.stacked)),
    );

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final Path inner = barPathOf(canvas, 0, 0);
    final Path outer = barPathOf(canvas, 1, 0);

    expect(inner.contains(inner.getBounds().topLeft + const Offset(0.5, 0.5)), isTrue);
    expect(outer.contains(outer.getBounds().topLeft + const Offset(0.5, 0.5)), isFalse);
  });

  testWidgets('widens the survivors when a series is hidden rather than leaving a hole', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _two)));
    final double before = barsOf(paintPlot(tester, _chart), 1).first.width;

    await tester.tap(find.text('2025'));
    await tester.pump();

    expect(barsOf(paintPlot(tester, _chart), 1).first.width, greaterThan(before));
  });

  testWidgets('runs the bars sideways when it is turned', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPBarChart(categories: _channels, series: _one, horizontal: true)),
    );

    final List<Rect> bars = barsOf(paintPlot(tester, _chart), 0);

    expect(bars.first.width, greaterThan(bars.first.height));
    expect(bars.map((Rect bar) => bar.left).toSet(), hasLength(1));
    expect(bars[1].top, greaterThan(bars[0].top));
  });

  testWidgets('walks the categories with the arrow keys, sideways too', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      _host(MPBarChart(categories: _channels, series: _one, horizontal: true, focusNode: focus)),
    );
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(readoutOf(tester), 'Search, Sessions: 4,820');

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(readoutOf(tester), 'Direct, Sessions: 3,110');
    semantics.dispose();
  });

  testWidgets('steps the other bars back so the crosshair points at something', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _one)));

    await hoverAt(tester, plotPoint(tester, _chart, 0.2, 0.5));

    final List<double> alphas = paintsOf(
      paintPlot(tester, _chart),
      0,
    ).map((Paint paint) => paint.color.a).toList();

    expect(alphas.where((double a) => a > 0.99), hasLength(1));
    expect(alphas.where((double a) => (a - 0.55).abs() < 0.01), hasLength(3));
  });

  testWidgets('writes values outside the bar rather than on the fill', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _one)));
    final int bare = paintPlot(tester, _chart).texts.length;

    await tester.pumpWidget(
      _host(
        const MPBarChart(categories: _channels, series: _one, valueLabels: MPChartValueLabels.all),
      ),
    );

    expect(paintPlot(tester, _chart).texts.length, bare + 4);
  });

  testWidgets('skips a gap rather than drawing a bar of nothing', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPBarChart(
          categories: _channels,
          series: <MPChartSeries>[
            MPChartSeries(data: <num?>[4, null, 2, 1]),
          ],
        ),
      ),
    );

    expect(barsOf(paintPlot(tester, _chart), 0), hasLength(3));
  });

  group('the hover panel', () {
    Future<void> openFirst(WidgetTester tester) async {
      await hoverAt(tester, plotPoint(tester, _chart, 0.2, 0.5));
    }

    double rowOf(WidgetTester tester, String text) {
      return tester
          .getCenter(find.descendant(of: find.byType(ChartTooltipPanel), matching: find.text(text)))
          .dy;
    }

    testWidgets('lists the series in the order they were passed', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _two)));
      await openFirst(tester);

      expect(rowOf(tester, '2025'), lessThan(rowOf(tester, '2026')));
    });

    testWidgets('puts the largest first when it is asked to', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          const MPBarChart(
            categories: _channels,
            series: _two,
            tooltip: MPChartTooltip(sort: MPChartTooltipSort.value),
          ),
        ),
      );
      await openFirst(tester);

      expect(rowOf(tester, '2026'), lessThan(rowOf(tester, '2025')));
    });

    testWidgets('adds up the column on a stack, because that is what a stack draws', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(const MPBarChart(categories: _channels, series: _two, stacked: MPChartStack.stacked)),
      );
      await openFirst(tester);

      expect(find.text('Total'), findsOneWidget);
      expect(find.text('85'), findsOneWidget);
    });

    testWidgets('leaves the total off a chart whose series are not parts of anything', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPBarChart(categories: _channels, series: _two)));
      await openFirst(tester);

      expect(find.text('Total'), findsNothing);
    });

    testWidgets('leaves it off a percent stack and says the value with its share', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(const MPBarChart(categories: _channels, series: _two, stacked: MPChartStack.percent)),
      );
      await openFirst(tester);

      expect(find.text('Total'), findsNothing);
      expect(find.text('40 · 47%'), findsOneWidget);
    });

    testWidgets('writes the total in the chart’s own language', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await tester.pumpWidget(
        _host(
          const MPBarChart(
            locale: 'ko',
            categories: _channels,
            series: _two,
            stacked: MPChartStack.stacked,
          ),
        ),
      );
      await openFirst(tester);

      expect(find.text('합계'), findsOneWidget);
    });
  });

  group('a percent stack', () {
    testWidgets('fills every column, whatever the totals were', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          const MPBarChart(
            categories: <String>['A', 'B'],
            stacked: MPChartStack.percent,
            series: <MPChartSeries>[
              MPChartSeries(name: 'X', data: <num>[1, 30]),
              MPChartSeries(name: 'Y', data: <num>[3, 10]),
            ],
          ),
        ),
      );

      final List<Rect> tops = barsOf(paintPlot(tester, _chart), 1);

      expect(tops[0].top, closeTo(tops[1].top, 0.01));
    });

    testWidgets('leaves a negative out, because it has no share of a whole', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPBarChart(
            categories: <String>['A', 'B'],
            stacked: MPChartStack.percent,
            series: <MPChartSeries>[
              MPChartSeries(name: 'X', data: <num>[1, 3]),
              MPChartSeries(name: 'Y', data: <num>[-3, 1]),
            ],
          ),
        ),
      );

      expect(barsOf(paintPlot(tester, _chart), 1), hasLength(1));
    });
  });
}
