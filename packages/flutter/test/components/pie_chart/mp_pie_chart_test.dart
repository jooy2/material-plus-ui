import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/pie_chart/mp_pie_chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPPieChart`.

const List<String> _sources = <String>['Search', 'Direct', 'Social'];
const List<num> _shares = <num>[52, 31, 17];

final Finder _chart = find.byType(MPPieChart);

Widget _host(Widget chart) => host(chart, width: 400);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  List<Path> slicesOf(ChartCanvas canvas) => <Path>[
    for (final (Path path, Paint _) in canvas.filled) path,
  ];

  testWidgets('draws a slice per value, each in the slot its place gives it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(canvas.filled, hasLength(3));

    for (int i = 0; i < 3; i += 1) {
      expect(sameColor(canvas.filled[i].$2.color, light.chart[i]), isTrue);
    }
  });

  testWidgets('leaves a negative out rather than drawing a share it does not have', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(const MPPieChart(categories: _sources, data: <num>[52, -31, 17])),
    );

    expect(paintPlot(tester, _chart).filled, hasLength(2));
  });

  testWidgets('separates the slices with a stroke of the page’s own colour', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));

    final List<(Path, Paint)> strokes = paintPlot(tester, _chart).strokes;

    expect(strokes, hasLength(3));
    expect(sameColor(strokes.first.$2.color, light.surface), isTrue);
    expect(strokes.first.$2.strokeWidth, 2);
  });

  testWidgets('leaves a hole in a donut and none in a pie', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));
    final Offset centre = tester.getSize(plotOf(_chart).first).center(Offset.zero);

    expect(
      slicesOf(
        paintPlot(tester, _chart),
      ).any((Path path) => path.contains(centre + const Offset(2, 2))),
      isTrue,
    );

    await tester.pumpWidget(
      _host(const MPPieChart(categories: _sources, data: _shares, shape: MPPieChartShape.donut)),
    );

    expect(
      slicesOf(
        paintPlot(tester, _chart),
      ).any((Path path) => path.contains(centre + const Offset(2, 2))),
      isFalse,
    );
  });

  testWidgets('opens a half ring along the bottom', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPPieChart(categories: _sources, data: _shares, shape: MPPieChartShape.semi)),
    );

    final Size box = tester.getSize(plotOf(_chart).first);
    final Rect ring = slicesOf(
      paintPlot(tester, _chart),
    ).map((Path path) => path.getBounds()).reduce((Rect a, Rect b) => a.expandToInclude(b));

    expect(ring.width, greaterThan(ring.height * 1.8));
    expect(ring.bottom, lessThan(box.height));
  });

  testWidgets('puts its centre in the hole, and nowhere on a pie', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(
        const MPPieChart(
          categories: _sources,
          data: _shares,
          shape: MPPieChartShape.donut,
          center: Text('100'),
        ),
      ),
    );
    expect(find.text('100'), findsOneWidget);

    await tester.pumpWidget(
      _host(const MPPieChart(categories: _sources, data: _shares, center: Text('100'))),
    );
    expect(find.text('100'), findsNothing);
  });

  testWidgets('takes a slice out when its legend entry is pressed', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));

    await tester.tap(find.text('Direct'));
    await tester.pump();

    final ChartCanvas canvas = paintPlot(tester, _chart);

    expect(canvas.filled, hasLength(2));
    // The survivors keep their colours.
    expect(sameColor(canvas.filled.last.$2.color, light.chart[2]), isTrue);
  });

  testWidgets('says the value and its share when a slice is pointed at', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));

    // A little right of twelve o'clock is inside the first slice.
    await hoverAt(tester, plotPoint(tester, _chart, 0.55, 0.2));

    expect(find.byType(ChartTooltipPanel), findsOneWidget);
    expect(
      find.descendant(of: find.byType(ChartTooltipPanel), matching: find.text('Search')),
      findsOneWidget,
    );
    expect(find.text('52 · 52%'), findsOneWidget);
  });

  testWidgets('walks the slices with the arrow keys, round the ring', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(
      _host(MPPieChart(categories: _sources, data: _shares, focusNode: focus)),
    );
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(readoutOf(tester), 'Search, 52 · 52%');

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
    await tester.pump();
    expect(readoutOf(tester), 'Social, 17 · 17%');

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pump();
    expect(readoutOf(tester), isNull);
    semantics.dispose();
  });

  testWidgets('writes each share on its slice where it fits', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPPieChart(categories: _sources, data: _shares)));
    final int bare = paintPlot(tester, _chart).texts.length;

    await tester.pumpWidget(
      _host(
        const MPPieChart(categories: _sources, data: _shares, valueLabels: MPChartValueLabels.all),
      ),
    );

    expect(paintPlot(tester, _chart).texts.length, bare + 3);
  });

  testWidgets('describes the picture with the numbers behind it', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      _host(const MPPieChart(label: 'Sources', categories: _sources, data: _shares)),
    );

    expect(chartNode(tester, 'Sources').value, 'Search: 52. Direct: 31. Social: 17');
    semantics.dispose();
  });

  testWidgets('draws the empty state when there is no whole to share', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPPieChart(data: <num>[0, -3])));

    expect(find.text('No data'), findsOneWidget);
  });

  testWidgets('draws at the plot height of its size', (WidgetTester tester) async {
    await tester.pumpWidget(
      _host(const MPPieChart(categories: _sources, data: _shares, size: MPSize.lg)),
    );

    expect(tester.getSize(plotOf(_chart).first).height, 280);
  });
}
