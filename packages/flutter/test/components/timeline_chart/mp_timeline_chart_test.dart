import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/timeline_chart/mp_timeline_chart.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPTimelineChart`.

final List<MPTimelineSeries> _plan = <MPTimelineSeries>[
  MPTimelineSeries(
    name: 'Build',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: DateTime(2026, 3, 2), end: DateTime(2026, 3, 5), label: 'Core'),
    ],
  ),
  MPTimelineSeries(
    name: 'Test',
    data: <MPTimelineSpan>[MPTimelineSpan(start: DateTime(2026, 3, 5), end: DateTime(2026, 3, 13))],
  ),
];

final Finder _chart = find.byType(MPTimelineChart);

Widget _host(Widget chart) => host(chart, width: 500);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  List<Path> barsOf(ChartCanvas canvas, int row) => <Path>[
    for (final (Path path, Paint paint) in canvas.filled)
      if (sameColor(paint.color.withValues(alpha: 1), light.chart[row])) path,
  ];

  testWidgets('draws a bar per span, a longer span as a longer bar, a row a line', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(MPTimelineChart(series: _plan)));

    final ChartCanvas canvas = paintPlot(tester, _chart);
    final Rect build = barsOf(canvas, 0).single.getBounds();
    final Rect test = barsOf(canvas, 1).single.getBounds();

    expect(test.width, greaterThan(build.width));
    expect(test.top, greaterThan(build.bottom));
  });

  testWidgets('rounds both ends, because neither is the value', (WidgetTester tester) async {
    await tester.pumpWidget(_host(MPTimelineChart(series: _plan)));

    final Path bar = barsOf(paintPlot(tester, _chart), 1).single;
    final Rect box = bar.getBounds();

    expect(bar.contains(box.topLeft + const Offset(0.5, 0.5)), isFalse);
    expect(bar.contains(box.topRight + const Offset(-0.5, 0.5)), isFalse);
  });

  test('ticks on the calendar rather than on round numbers', () {
    final TimeScale scale = timeScale(
      ChartExtent(
        DateTime(2026, 3, 2, 14).millisecondsSinceEpoch.toDouble(),
        DateTime(2026, 3, 13).millisecondsSinceEpoch.toDouble(),
      ),
    );

    expect(scale.unit, ChartTimeUnit.day);
    // Rounded out to midnight on the first day.
    expect(scale.min, DateTime(2026, 3, 2).millisecondsSinceEpoch.toDouble());
    expect(
      scale.ticks.map((double tick) => formatTimeTick(tick, scale.unit, MPDateNames.english)),
      everyElement(matches(RegExp(r'^Mar \d+$'))),
    );
  });

  test('aligns a three-hour step on the clock', () {
    final TimeScale scale = timeScale(
      ChartExtent(
        DateTime(2026, 3, 2, 1, 20).millisecondsSinceEpoch.toDouble(),
        DateTime(2026, 3, 2, 17).millisecondsSinceEpoch.toDouble(),
      ),
    );

    expect(
      formatTimeTick(scale.ticks.first, scale.unit, MPDateNames.english),
      matches(RegExp(r'^(00|03):00$')),
    );
  });

  testWidgets('names the rows down the side and draws no legend', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(MPTimelineChart(label: 'Plan', series: _plan)));

    expect(find.byType(ChartLegend), findsNothing);
    expect(chartNode(tester, 'Plan').value, 'Build: Mar 2 – Mar 5. Test: Mar 5 – Mar 13');
    semantics.dispose();
  });

  testWidgets('walks the spans and says both ends of each rather than its length', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(_host(MPTimelineChart(series: _plan, focusNode: focus)));
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(readoutOf(tester), 'Build · Core, Mar 2 – Mar 5');

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(readoutOf(tester), 'Test, Mar 5 – Mar 13');
    semantics.dispose();
  });

  testWidgets('is hit anywhere along a bar rather than only near its middle', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(MPTimelineChart(series: _plan)));

    final Rect bar = barsOf(paintPlot(tester, _chart), 1).single.getBounds();
    final Offset origin = tester.getTopLeft(plotOf(_chart).first);

    await hoverAt(tester, origin + Offset(bar.left + 4, bar.center.dy));

    expect(
      find.descendant(of: find.byType(ChartTooltipPanel), matching: find.text('Test')),
      findsOneWidget,
    );
  });

  testWidgets('writes a span’s label inside its bar, and leaves it off when asked', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(MPTimelineChart(series: _plan)));
    final int labelled = paintPlot(tester, _chart).texts.length;

    await tester.pumpWidget(_host(MPTimelineChart(series: _plan, spanLabels: false)));

    expect(paintPlot(tester, _chart).texts.length, labelled - 1);
  });

  testWidgets('drops a label the bar cannot hold rather than clipping it', (
    WidgetTester tester,
  ) async {
    final List<MPTimelineSeries> cramped = <MPTimelineSeries>[
      MPTimelineSeries(
        name: 'Build',
        data: <MPTimelineSpan>[
          MPTimelineSpan(
            start: DateTime(2026, 3, 2),
            end: DateTime(2026, 3, 2, 2),
            label: 'A very long name for a short span',
          ),
          MPTimelineSpan(start: DateTime(2026, 3, 3), end: DateTime(2026, 3, 30)),
        ],
      ),
    ];

    await tester.pumpWidget(_host(MPTimelineChart(series: cramped)));
    final int withLabel = paintPlot(tester, _chart).texts.length;

    await tester.pumpWidget(_host(MPTimelineChart(series: cramped, spanLabels: false)));

    expect(paintPlot(tester, _chart).texts.length, withLabel);
  });

  testWidgets('draws a span the other way round when its ends are swapped', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        MPTimelineChart(
          series: <MPTimelineSeries>[
            MPTimelineSeries(
              data: <MPTimelineSpan>[
                MPTimelineSpan(start: DateTime(2026, 3, 9), end: DateTime(2026, 3, 2)),
              ],
            ),
          ],
        ),
      ),
    );

    expect(barsOf(paintPlot(tester, _chart), 0).single.getBounds().width, greaterThan(50));
  });

  testWidgets('drops a span whose ends are not places on a number line', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _host(
        MPTimelineChart(
          series: <MPTimelineSeries>[
            MPTimelineSeries(
              data: <MPTimelineSpan>[
                MPTimelineSpan(start: DateTime(2026, 3, 2), end: DateTime(2026, 3, 4)),
                MPTimelineSpan(start: 'soon', end: DateTime(2026, 3, 9)),
              ],
            ),
          ],
        ),
      ),
    );

    expect(barsOf(paintPlot(tester, _chart), 0), hasLength(1));
  });

  testWidgets('draws the empty state when there are no rows', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPTimelineChart(series: <MPTimelineSeries>[])));

    expect(find.text('No data'), findsOneWidget);
  });
}
