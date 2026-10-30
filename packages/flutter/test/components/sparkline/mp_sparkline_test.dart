import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/sparkline/mp_sparkline.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/canvas.dart';
import '../../support/host.dart';
import '../chart/chart_support.dart';

/// The questions the React suite asks of `MPSparkline`.

const List<double> _week = <double>[12, 15, 14, 19, 22, 21, 27];

final Finder _spark = find.byType(MPSparkline);

Widget _host(Widget spark) => host(spark, width: 200);

/// The sparkline's painter, painted. Its box is smaller than a chart's, so it
/// is found by type rather than by [plotOf].
ChartCanvas _painted(WidgetTester tester) {
  final Finder paint = find.descendant(of: _spark, matching: find.byType(CustomPaint)).first;
  final ChartCanvas canvas = ChartCanvas();

  tester.widget<CustomPaint>(paint).painter!.paint(canvas, tester.getSize(paint));

  return canvas;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('says the shape in words: how many points and the two ends', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPSparkline(data: _week)));

    expect(semanticsNodeLabelled(tester, '7 points, from 12 to 27'), isNotNull);
    semantics.dispose();
  });

  testWidgets('counts only the readings it has', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPSparkline(data: <double?>[3, null, 5])));

    expect(semanticsNodeLabelled(tester, '2 points, from 3 to 5'), isNotNull);
    semantics.dispose();
  });

  testWidgets('takes a sentence of the caller’s own', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPSparkline(data: _week, label: 'Up all week')));

    expect(semanticsNodeLabelled(tester, 'Up all week'), isNotNull);
    semantics.dispose();
  });

  testWidgets('says so when there is nothing to draw', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPSparkline(data: <double?>[null])));

    expect(semanticsNodeLabelled(tester, 'No data'), isNotNull);
    semantics.dispose();
  });

  testWidgets('writes its sentence in the locale it was given', (WidgetTester tester) async {
    registerMPMessages(<MPLocale>[ko]);
    addTearDown(resetMPMessages);
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(_host(const MPSparkline(data: _week, locale: 'ko')));

    expect(semanticsNodeLabelled(tester, '7개 지점, 12에서 27까지'), isNotNull);
    semantics.dispose();
  });

  testWidgets('grows with the size ladder: 16, 24, 32, 44, 56', (WidgetTester tester) async {
    final List<double> heights = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(_host(MPSparkline(data: _week, size: size)));
      heights.add(tester.getSize(_spark).height);
    }

    expect(heights, <double>[16, 24, 32, 44, 56]);
  });

  testWidgets('breaks the line at a gap, and joins it dashed when asked', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPSparkline(data: <double?>[1, 2, null, 4, 5])));
    expect(_painted(tester).strokes.single.$1.computeMetrics().length, 2);

    await tester.pumpWidget(
      _host(const MPSparkline(data: <double?>[1, 2, null, 4, 5], gaps: MPChartGaps.connect)),
    );
    expect(_painted(tester).strokes, hasLength(2));
  });

  testWidgets('marks the newest point, and leaves it off when told', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPSparkline(data: _week)));

    final RecordingCanvas canvas = _painted(tester);

    expect(canvas.circles, hasLength(1));
    expect(canvas.circles.single.$1.dx, closeTo(200, 0.01));

    await tester.pumpWidget(_host(const MPSparkline(data: _week, endDot: false)));
    expect(_painted(tester).circles, isEmpty);
  });

  testWidgets('draws a bar per value, the newest one whole and the rest faded', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_host(const MPSparkline(data: _week, shape: MPSparklineShape.bar)));

    final List<double> alphas = _painted(
      tester,
    ).filled.map(((Path, Paint) one) => one.$2.color.a).toList();

    expect(alphas, hasLength(7));
    expect(alphas.last, closeTo(1, 0.01));
    expect(alphas.first, closeTo(0.55, 0.01));
  });

  testWidgets('fills under the line as an area', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPSparkline(data: _week, shape: MPSparklineShape.area)));

    expect(_painted(tester).filled.first.$2.color.a, closeTo(0.16, 0.01));
  });

  testWidgets('reads the accent a family names', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPSparkline(data: _week, color: MPColor.error)));

    expect(sameColor(_painted(tester).circles.single.$3.color, light.error), isTrue);
  });

  testWidgets('takes the first chart slot by default', (WidgetTester tester) async {
    await tester.pumpWidget(_host(const MPSparkline(data: _week)));

    expect(sameColor(_painted(tester).circles.single.$3.color, light.chart.first), isTrue);
  });
}
