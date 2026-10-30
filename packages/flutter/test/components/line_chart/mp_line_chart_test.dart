import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/line_chart/mp_line_chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPLineChart`, asked of the painter
/// and the semantics tree instead of the DOM.

const List<String> _days = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const List<MPChartSeries> _one = <MPChartSeries>[
  MPChartSeries(name: 'Signups', data: <num>[120, 138, 131, 164, 190]),
];

const List<MPChartSeries> _two = <MPChartSeries>[
  MPChartSeries(name: 'Organic', data: <num>[4200, 4610, 4380, 5120, 5640]),
  MPChartSeries(name: 'Referral', data: <num>[3100, 3450, 3980, 4260, 4110]),
];

final Finder _chart = find.byType(MPLineChart);

Widget _host(Widget chart, {double width = 400}) => host(chart, width: width);

/// The stroked paths drawn in [color]: the lines of one series.
List<Path> _linesIn(ChartCanvas canvas, Color color) => <Path>[
  for (final (Path path, Paint paint) in canvas.strokes)
    if (sameColor(paint.color, color) && paint.strokeWidth > 1) path,
];

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('draws one line per series', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      final ChartCanvas canvas = paintPlot(tester, _chart);

      expect(_linesIn(canvas, light.chart[0]), hasLength(1));
      expect(_linesIn(canvas, light.chart[1]), hasLength(1));
    });

    testWidgets('breaks the line at a gap rather than drawing through it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: <MPChartSeries>[
              MPChartSeries(data: <num?>[1, 2, null, 4, 5]),
            ],
          ),
        ),
      );

      final Path line = _linesIn(paintPlot(tester, _chart), light.chart[0]).single;

      expect(line.computeMetrics().length, 2);
    });

    testWidgets('leaves zero out of the scale, so a real change is not drawn flat', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: <String>['A', 'B'],
            series: <MPChartSeries>[
              MPChartSeries(data: <num>[3200, 3400]),
            ],
          ),
        ),
      );

      final double rise = _linesIn(
        paintPlot(tester, _chart),
        light.chart[0],
      ).single.getBounds().height;

      expect(rise, greaterThan(100));
    });

    testWidgets('takes a zero baseline when the caller says the axis has one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: <String>['A', 'B'],
            yAxis: MPChartAxis(min: 0),
            series: <MPChartSeries>[
              MPChartSeries(data: <num>[3200, 3400]),
            ],
          ),
        ),
      );

      final double rise = _linesIn(
        paintPlot(tester, _chart),
        light.chart[0],
      ).single.getBounds().height;

      expect(rise, lessThan(20));
    });

    testWidgets('draws the empty state rather than an axis of nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(series: <MPChartSeries>[])));

      expect(find.text('No data'), findsOneWidget);
      expect(plotOf(_chart), findsNothing);
    });

    testWidgets('draws the caller’s own empty state', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(const MPLineChart(series: <MPChartSeries>[], empty: Text('Nothing yet'))),
      );

      expect(find.text('Nothing yet'), findsOneWidget);
    });
  });

  group('the size ladder', () {
    testWidgets('draws at 220 by default and grows with the ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(_host(MPLineChart(categories: _days, series: _one, size: size)));
        heights.add(tester.getSize(plotOf(_chart).first).height);
      }

      expect(heights, <double>[120, 160, 220, 280, 360]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          const MPConfigProvider(
            size: MPSize.sm,
            child: MPLineChart(categories: _days, series: _one),
          ),
        ),
      );

      expect(tester.getSize(plotOf(_chart).first).height, 160);
    });

    testWidgets('takes a height of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(const MPLineChart(categories: _days, series: _one, height: 300)),
      );

      expect(tester.getSize(plotOf(_chart).first).height, 300);
    });
  });

  group('markers and value labels', () {
    testWidgets('draws markers when they have room to be separate marks', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));

      // A fill and a ring of surface per point.
      expect(paintPlot(tester, _chart).circles, hasLength(10));
    });

    testWidgets('drops them once the line is denser than they are', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          MPLineChart(
            series: <MPChartSeries>[MPChartSeries(data: List<num>.generate(120, (int i) => i % 7))],
          ),
        ),
      );

      expect(paintPlot(tester, _chart).circles, isEmpty);
    });

    testWidgets('writes only the last value when asked for the last value', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(const MPLineChart(categories: _days, series: _one, yAxis: MPChartAxis(hidden: true))),
      );
      final int bare = paintPlot(tester, _chart).texts.length;

      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: _one,
            yAxis: MPChartAxis(hidden: true),
            valueLabels: MPChartValueLabels.last,
          ),
        ),
      );

      expect(paintPlot(tester, _chart).texts.length, bare + 1);
    });

    testWidgets('reserves room above the plot for a value label to sit in', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));
      final double top = _linesIn(paintPlot(tester, _chart), light.chart[0]).single.getBounds().top;

      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: _one,
            valueLabels: MPChartValueLabels.extremes,
          ),
        ),
      );
      final double lowered = _linesIn(
        paintPlot(tester, _chart),
        light.chart[0],
      ).single.getBounds().top;

      expect(lowered, greaterThan(top + 10));
    });
  });

  group('gaps', () {
    const List<MPChartSeries> gapped = <MPChartSeries>[
      MPChartSeries(data: <num?>[318, 324, 311, null, 296]),
    ];

    testWidgets('joins the two sides of a gap with a dashed run when asked to', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(const MPLineChart(categories: _days, series: gapped, gaps: MPChartGaps.connect)),
      );

      final List<Path> lines = _linesIn(paintPlot(tester, _chart), light.chart[0]);

      // The line in its two runs, and the bridge as dashes.
      expect(lines, hasLength(2));
      expect(lines.last.computeMetrics().length, greaterThan(1));
    });

    testWidgets('draws no bridge where it was not asked for', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: gapped)));

      expect(_linesIn(paintPlot(tester, _chart), light.chart[0]), hasLength(1));
    });

    testWidgets('widens the scale to hold zero when a gap is drawn as one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(const MPLineChart(categories: _days, series: gapped, gaps: MPChartGaps.zero)),
      );

      final Rect plot = tester.getRect(plotOf(_chart).first);
      final Rect line = _linesIn(paintPlot(tester, _chart), light.chart[0]).single.getBounds();

      expect(line.bottom, lessThanOrEqualTo(plot.height));
    });

    testWidgets('still reports a gap as a gap in the words behind the picture', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _host(
          const MPLineChart(
            label: 'Latency',
            categories: _days,
            series: gapped,
            gaps: MPChartGaps.zero,
          ),
        ),
      );

      expect(chartNode(tester, 'Latency').value, contains('Thu: 1 No data'));
      semantics.dispose();
    });
  });

  group('the legend', () {
    testWidgets('is left off a chart with one series', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));

      expect(find.byType(ChartLegend), findsNothing);
    });

    testWidgets('is drawn from two series up', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      expect(find.text('Organic'), findsOneWidget);
      expect(find.text('Referral'), findsOneWidget);
    });

    testWidgets('is drawn for one series when asked, and left off two when told', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(categories: _days, series: _one, legend: MPChartLegend(visible: true)),
        ),
      );
      expect(find.text('Signups'), findsOneWidget);

      await tester.pumpWidget(
        _host(
          const MPLineChart(categories: _days, series: _two, legend: MPChartLegend(visible: false)),
        ),
      );
      expect(find.byType(ChartLegend), findsNothing);
    });

    testWidgets('takes a series out of the plot when its entry is pressed', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      await tester.tap(find.text('Organic'));
      await tester.pump();

      final ChartCanvas canvas = paintPlot(tester, _chart);

      expect(_linesIn(canvas, light.chart[0]), isEmpty);
      // The survivor keeps the colour it already had.
      expect(_linesIn(canvas, light.chart[1]), hasLength(1));
    });

    testWidgets('starts a hidden series switched off, and turns it back on', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: <MPChartSeries>[
              MPChartSeries(name: 'A', data: <num>[1, 2, 3]),
              MPChartSeries(name: 'B', data: <num>[3, 2, 1], hidden: true),
            ],
          ),
        ),
      );
      expect(_linesIn(paintPlot(tester, _chart), light.chart[1]), isEmpty);

      await tester.tap(find.text('B'));
      await tester.pump();
      expect(_linesIn(paintPlot(tester, _chart), light.chart[1]), hasLength(1));
    });

    testWidgets('fades a switched-off entry the way a disabled control is faded', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      await tester.tap(find.text('Organic'));
      await tester.pumpAndSettle();

      final AnimatedOpacity fade = tester.widget<AnimatedOpacity>(
        find.ancestor(of: find.text('Organic'), matching: find.byType(AnimatedOpacity)),
      );

      expect(fade.opacity, 0.38);
    });

    testWidgets('dims the other series while one entry is hovered', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      await hoverAt(tester, tester.getCenter(find.text('Organic')));
      await tester.pump();

      expect(paintPlot(tester, _chart).layers, contains(0.25));
    });

    testWidgets('is a control that says whether its series is shown', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _two)));

      expect(
        tester.getSemantics(find.text('Organic')),
        matchesSemantics(
          label: 'Organic',
          isButton: true,
          hasToggledState: true,
          isToggled: true,
          hasTapAction: true,
          isFocusable: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });
  });

  group('the hover layer', () {
    testWidgets('opens the panel and drops a crosshair where the pointer is', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));

      await hoverAt(tester, plotPoint(tester, _chart, 0.5, 0.5));

      expect(find.byType(ChartTooltipPanel), findsOneWidget);
      expect(find.text('Wed'), findsWidgets);
      expect(find.text('131'), findsOneWidget);

      final List<(Offset, Offset, Paint)> upright = paintPlot(tester, _chart).lines
          .where(
            ((Offset, Offset, Paint) line) =>
                line.$1.dx == line.$2.dx && sameColor(line.$3.color, light.outline),
          )
          .toList();

      expect(upright, isNotEmpty);
    });

    testWidgets('closes it again when the pointer leaves', (WidgetTester tester) async {
      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));

      final TestGesture mouse = await hoverAt(tester, plotPoint(tester, _chart, 0.5, 0.5));
      await mouse.moveTo(const Offset(1, 1));
      await tester.pump();

      expect(find.byType(ChartTooltipPanel), findsNothing);
    });

    testWidgets('opens nothing when the tooltip is off', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: _one,
            tooltip: MPChartTooltip(mode: MPChartTooltipMode.none),
          ),
        ),
      );

      await hoverAt(tester, plotPoint(tester, _chart, 0.5, 0.5));

      expect(find.byType(ChartTooltipPanel), findsNothing);
    });

    testWidgets('puts the largest row first when sorted by value', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: <MPChartSeries>[
              MPChartSeries(name: 'Small', data: <num>[1, 1, 1, 1, 1]),
              MPChartSeries(name: 'Large', data: <num>[9, 9, 9, 9, 9]),
            ],
            tooltip: MPChartTooltip(sort: MPChartTooltipSort.value),
          ),
        ),
      );

      await hoverAt(tester, plotPoint(tester, _chart, 0.5, 0.5));

      final Finder panel = find.byType(ChartTooltipPanel);
      final double large = tester
          .getCenter(find.descendant(of: panel, matching: find.text('Large')))
          .dy;
      final double small = tester
          .getCenter(find.descendant(of: panel, matching: find.text('Small')))
          .dy;

      expect(large, lessThan(small));
    });

    testWidgets('hands the reading to a builder of the caller’s own', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(
          MPLineChart(
            categories: _days,
            series: _one,
            tooltip: MPChartTooltip(
              builder: (MPChartTooltipContext context) =>
                  Text('${context.category}: ${context.items.single.formatted}'),
            ),
          ),
        ),
      );

      await hoverAt(tester, plotPoint(tester, _chart, 0.5, 0.5));

      expect(find.text('Wed: 131'), findsOneWidget);
      expect(find.byType(ChartTooltipPanel), findsNothing);
    });
  });

  group('the keyboard', () {
    testWidgets('walks the columns and says each one, outside the picture', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        _host(MPLineChart(categories: _days, series: _one, focusNode: focus)),
      );
      focus.requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(readoutOf(tester), 'Mon, Signups: 120');

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(readoutOf(tester), 'Tue, Signups: 138');

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(readoutOf(tester), 'Fri, Signups: 190');

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(readoutOf(tester), 'Mon, Signups: 120');
      semantics.dispose();
    });

    testWidgets('clears the active column on Escape', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        _host(MPLineChart(categories: _days, series: _one, focusNode: focus)),
      );
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(find.byType(ChartTooltipPanel), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();

      expect(find.byType(ChartTooltipPanel), findsNothing);
      expect(readoutOf(tester), isNull);
      semantics.dispose();
    });
  });

  group('semantics', () {
    testWidgets('is one tab stop, named even when the caller named nothing', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_host(const MPLineChart(categories: _days, series: _one)));

      final SemanticsNode node = chartNode(tester, 'Chart');

      expect(isTabStop(node), isTrue);
      expect(node.getSemanticsData().flagsCollection.isImage, isTrue);
      semantics.dispose();
    });

    testWidgets('describes the picture with the numbers behind it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _host(const MPLineChart(label: 'Traffic', categories: _days, series: _two)),
      );

      expect(
        chartNode(tester, 'Traffic').value,
        startsWith('Mon: Organic 4,200, Referral 3,100. Tue: Organic 4,610, Referral 3,450.'),
      );
      semantics.dispose();
    });

    testWidgets('is no tab stop when there is nothing to walk', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_host(const MPLineChart(series: <MPChartSeries>[])));

      expect(isTabStop(chartNode(tester, 'Chart')), isFalse);
      semantics.dispose();
    });

    testWidgets('writes its words in the locale it was given', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(_host(const MPLineChart(locale: 'ko', series: <MPChartSeries>[])));

      expect(find.text('데이터가 없습니다'), findsOneWidget);
      expect(semanticsNodeLabelled(tester, '차트'), isNotNull);
      semantics.dispose();
    });
  });

  group('references', () {
    const List<MPChartSeries> latency = <MPChartSeries>[
      MPChartSeries(name: 'p95', data: <num>[318, 324, 311, 296, 288]),
    ];

    testWidgets('draws a dashed line across the plot in the chrome ink', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: latency,
            yAxis: MPChartAxis(references: <MPChartReference>[MPChartReference(value: 300)]),
          ),
        ),
      );

      final List<Path> dashed = <Path>[
        for (final (Path path, Paint paint) in paintPlot(tester, _chart).strokes)
          if (sameColor(paint.color, light.outline)) path,
      ];

      expect(dashed, hasLength(1));
      expect(dashed.single.computeMetrics().length, greaterThan(1));
    });

    testWidgets('opens the scale to hold a target above everything measured', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const MPLineChart(
            categories: _days,
            series: latency,
            yAxis: MPChartAxis(
              references: <MPChartReference>[MPChartReference(value: 500, dashed: false)],
            ),
          ),
        ),
      );

      final Rect plot = tester.getRect(plotOf(_chart).first);
      final Rect line = <Path>[
        for (final (Path path, Paint paint) in paintPlot(tester, _chart).strokes)
          if (sameColor(paint.color, light.outline)) path,
      ].single.getBounds();

      expect(line.top, greaterThanOrEqualTo(0));
      expect(line.top, lessThan(plot.height));
    });

    testWidgets('is a band when it has two ends, drawn under the marks', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _host(
          MPLineChart(
            categories: _days,
            series: latency,
            yAxis: MPChartAxis(
              references: <MPChartReference>[
                MPChartReference(value: 280, to: 320, color: MPColor.error),
              ],
            ),
          ),
        ),
      );

      final ChartCanvas canvas = paintPlot(tester, _chart);

      expect(
        canvas.rects.where(
          ((Rect, Paint) rect) => sameColor(rect.$2.color, light.error.withValues(alpha: 0.12)),
        ),
        hasLength(1),
      );
      // Both edges drawn.
      expect(
        canvas.strokes.where(((Path, Paint) path) => sameColor(path.$2.color, light.error)),
        hasLength(2),
      );
    });

    testWidgets('tells a reader who cannot see the line what it was', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _host(
          const MPLineChart(
            label: 'Latency',
            categories: _days,
            series: latency,
            yAxis: MPChartAxis(
              references: <MPChartReference>[
                MPChartReference(value: 350, label: 'SLO'),
                MPChartReference(value: 200),
              ],
            ),
          ),
        ),
      );

      final String value = chartNode(tester, 'Latency').value;

      expect(value, endsWith('SLO: 350'));
      expect(value, isNot(contains('200')));
      semantics.dispose();
    });
  });

  group('zoom', () {
    final List<String> days = List<String>.generate(10, (int i) => 'D${i + 1}');
    final List<MPChartSeries> long = <MPChartSeries>[
      MPChartSeries(name: 'Signups', data: List<num>.generate(10, (int i) => 100 + i)),
    ];

    Future<void> drag(WidgetTester tester, double from, double to) async {
      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(plotPoint(tester, _chart, from, 0.5));
      await mouse.down(plotPoint(tester, _chart, from, 0.5));
      await tester.pump();
      await mouse.moveTo(plotPoint(tester, _chart, to, 0.5));
      await tester.pump();
      await mouse.up();
      await tester.pump();
    }

    testWidgets('redraws to the range the reader dragged, words and all', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _host(
          MPLineChart(label: 'Signups', categories: days, series: long, zoom: const MPChartZoom()),
        ),
      );

      await drag(tester, 0.3, 0.6);

      final String value = chartNode(tester, 'Signups').value;

      expect(value, isNot(contains('D1:')));
      expect(value, isNot(contains('D10:')));
      expect(find.text('Show all'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('offers a way back, as a control a keyboard can reach', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        _host(
          MPLineChart(label: 'Signups', categories: days, series: long, zoom: const MPChartZoom()),
        ),
      );
      await drag(tester, 0.3, 0.6);

      expect(
        tester.getSemantics(find.text('Show all')),
        matchesSemantics(
          label: 'Show all',
          isButton: true,
          hasTapAction: true,
          isFocusable: true,
          hasFocusAction: true,
        ),
      );

      await tester.tap(find.text('Show all'));
      await tester.pump();

      expect(chartNode(tester, 'Signups').value, contains('D10:'));
      expect(find.text('Show all'), findsNothing);
      semantics.dispose();
    });

    testWidgets('ignores a drag too narrow to be a chart of anything', (WidgetTester tester) async {
      await tester.pumpWidget(
        _host(MPLineChart(categories: days, series: long, zoom: const MPChartZoom())),
      );

      await drag(tester, 0.5, 0.5);

      expect(find.text('Show all'), findsNothing);
    });

    testWidgets('draws nothing to drag when it was not asked for', (WidgetTester tester) async {
      await tester.pumpWidget(_host(MPLineChart(categories: days, series: long)));

      await drag(tester, 0.2, 0.8);

      expect(find.text('Show all'), findsNothing);
    });

    testWidgets('starts where the caller says, and reports what the reader picked', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final List<(int, int)?> picked = <(int, int)?>[];

      await tester.pumpWidget(
        _host(
          MPLineChart(
            label: 'Signups',
            categories: days,
            series: long,
            zoom: MPChartZoom(initialRange: (2, 5), onRangeChange: picked.add),
          ),
        ),
      );

      expect(chartNode(tester, 'Signups').value, startsWith('D3:'));

      await tester.tap(find.text('Show all'));
      await tester.pump();

      expect(picked, <(int, int)?>[null]);
      semantics.dispose();
    });
  });

  testWidgets('lays out under a right-to-left reading direction', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPLineChart(categories: _days, series: _two),
        width: 400,
        textDirection: TextDirection.rtl,
      ),
    );

    expect(tester.takeException(), isNull);
    expect(_linesIn(paintPlot(tester, _chart), light.chart[0]), hasLength(1));
  });
}
