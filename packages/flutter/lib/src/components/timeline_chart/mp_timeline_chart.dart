/// What ran when, one row per thing.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much of a row's band a span takes.
const double _rowFill = 0.62;

/// One span, with its two ends as numbers.
class _Span {
  const _Span(this.from, this.to, this.span);

  final double from;
  final double to;
  final MPTimelineSpan span;
}

/// What ran when, one row per thing.
///
/// ```dart
/// MPTimelineChart(
///   series: <MPTimelineSeries>[
///     MPTimelineSeries(name: 'Build', data: <MPTimelineSpan>[
///       MPTimelineSpan(start: DateTime(2026, 3, 2), end: DateTime(2026, 3, 5)),
///     ]),
///     MPTimelineSeries(name: 'Test', data: <MPTimelineSpan>[
///       MPTimelineSpan(start: DateTime(2026, 3, 5), end: DateTime(2026, 3, 9)),
///     ]),
///   ],
/// )
/// ```
///
/// A Gantt: rows down the side, time along the bottom, and a bar for every
/// stretch. What it encodes is a **duration and its place**, the one question
/// the other charts cannot be asked.
///
/// ## The axis is a calendar, not a number line
///
/// The 1-2-5-10 steps a value axis uses are exactly wrong for an instant, so
/// this axis steps in seconds, minutes, hours, days, weeks, months and years,
/// walked with real calendar arithmetic and aligned so a three-hour axis reads
/// 00:00, 03:00, 06:00.
///
/// ## There is no legend
///
/// The rows **are** the category axis, already named down the side.
///
/// ## The pointer is tested against the whole bar
///
/// A span can be two hundred pixels long, so it is hit anywhere along its body
/// rather than only near its middle.
class MPTimelineChart extends StatelessWidget {
  /// Creates a timeline chart.
  const MPTimelineChart({
    required this.series,
    this.yAxis,
    this.xAxis,
    this.spanLabels = true,
    this.height,
    this.format,
    this.locale,
    this.label,
    this.tooltip,
    this.empty,
    this.size,
    this.dateNames,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The rows, top to bottom. Each carries its own spans.
  final List<MPTimelineSeries> series;

  /// The row axis.
  final MPChartAxis? yAxis;

  /// The time axis.
  final MPChartAxis? xAxis;

  /// Writes each span's label inside it, where the span is wide enough to hold
  /// the text. One that does not fit is dropped rather than clipped.
  final bool spanLabels;

  /// How tall the drawing is, axis labels included.
  final double? height;

  /// Accepted for the shape every chart shares. A timeline writes instants,
  /// so its numbers are dates.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**.
  final String? label;

  /// What the pointer uncovers. The span being pointed at by default.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The words dates are written with.
  final MPDateNames? dateNames;

  /// Drives the plot's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the chart is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPDateNames names = dateNames ?? mpDateNamesFor(mpLocaleOf(context, locale));
    final List<Color> colors = <Color>[
      for (int i = 0; i < series.length; i += 1)
        seriesColor(MPTheme.of(context).colors, i, series[i].color),
    ];

    // A span whose ends are not places on a number line is not a span, and is
    // dropped here rather than reaching the scale as a NaN.
    final List<List<_Span>> rows = <List<_Span>>[
      for (final MPTimelineSeries row in series)
        <_Span>[
          for (final MPTimelineSpan span in row.data)
            if (toNumber(span.start) != null && toNumber(span.end) != null)
              _Span(
                math.min(toNumber(span.start)!, toNumber(span.end)!),
                math.max(toNumber(span.start)!, toNumber(span.end)!),
                span,
              ),
        ],
    ];

    final ChartExtent? starts = bounds(<double>[
      for (final List<_Span> row in rows)
        for (final _Span one in row) one.from,
    ]);
    final ChartExtent? ends = bounds(<double>[
      for (final List<_Span> row in rows)
        for (final _Span one in row) one.to,
    ]);
    final TimeScale scale = timeScale(
      starts != null && ends != null ? ChartExtent(starts.min, ends.max) : null,
      min: xAxis?.min,
      max: xAxis?.max,
      tickCount: xAxis?.tickCount,
    );

    String written(double value) => formatTimeTick(value, scale.unit, names);

    final List<String> rowNames = <String>[
      for (int i = 0; i < series.length; i += 1) series[i].name ?? '${i + 1}',
    ];

    /* The frame's `series` is one placeholder row per timeline row, and its
       categories are the row names: a timeline's rows are exactly the slots of
       a band axis. The value axis takes its extent from `scale`. */
    return CartesianFrame(
      series: <MPChartSeries>[
        MPChartSeries(data: <num>[for (final _ in series) 0]),
      ],
      categories: rowNames,
      height: height,
      format: format,
      locale: locale,
      label: label,
      tooltip: tooltip,
      empty: empty,
      size: size,
      dateNames: dateNames,
      focusNode: focusNode,
      autofocus: autofocus,
      // Rows down the side and time along the bottom: a horizontal chart in the
      // frame's terms.
      horizontal: true,
      bandRatio: _rowFill,
      scale: scale,
      // The epoch is not a baseline anybody measures a Tuesday against.
      includeZero: false,
      legend: const MPChartLegend(visible: false),
      xAxis: yAxis,
      yAxis: MPChartAxis(
        hidden: xAxis?.hidden ?? false,
        label: xAxis?.label,
        grid: xAxis?.grid,
        min: xAxis?.min,
        max: xAxis?.max,
        tickCount: xAxis?.tickCount,
        tickFormat:
            xAxis?.tickFormat ??
            (MPChartCategory value, int index) => written(toNumber(value) ?? 0),
        tickLabels: xAxis?.tickLabels,
        thickness: xAxis?.thickness,
        references: xAxis?.references ?? const <MPChartReference>[],
      ),
      marks: (CartesianContext layout) => <ChartMark>[
        for (int row = 0; row < rows.length; row += 1)
          for (int index = 0; index < rows[row].length; index += 1)
            _markOf(layout, row, index, rows[row][index]),
      ],
      markTooltip: (ChartMark mark) {
        if (mark.series >= rows.length || mark.index >= rows[mark.series].length) {
          return null;
        }

        final _Span one = rows[mark.series][mark.index];

        return (
          // The row and the span's own name, with the dates below: a panel that
          // named the span and never said when it ran would withhold the one
          // thing a timeline is drawn for.
          heading: one.span.label == null
              ? rowNames[mark.series]
              : '${rowNames[mark.series]} · ${one.span.label}',
          items: <MPChartTooltipItem>[
            MPChartTooltipItem(
              seriesIndex: mark.series,
              color:
                  chartColorOf(MPTheme.of(context).colors, one.span.color) ?? colors[mark.series],
              value: one.to - one.from,
              // The two ends rather than the length: when it ran is what a
              // reader wants, and the duration is a subtraction.
              formatted: '${written(one.from)} – ${written(one.to)}',
            ),
          ],
        );
      },
      // One row per timeline row, and its cell says every span on it.
      table: () => chartTableText(
        rows: rowNames,
        columns: null,
        cells: <List<String>>[
          for (final List<_Span> row in rows)
            <String>[
              row.isEmpty
                  ? mpMessagesOf(context, mpTableMessages, locale: locale)['empty']!
                  : row.map((_Span one) => '${written(one.from)} – ${written(one.to)}').join('; '),
            ],
        ],
      ),
      paint: (Canvas canvas, Size size, CartesianContext context) =>
          _paint(canvas, context, rows, colors),
    );
  }

  ChartMark _markOf(CartesianContext layout, int row, int index, _Span one) {
    final double from = layout.valuePx(one.from);
    final double to = layout.valuePx(one.to);

    return ChartMark(
      series: row,
      index: index,
      x: (from + to) / 2,
      y: layout.plot.top + layout.categoryPx(row),
      r: layout.band.band / 2,
      // The half-width and half-height the pointer is tested against, so a
      // long bar is hit anywhere along it.
      rx: math.max(1, (to - from).abs() / 2),
      ry: layout.band.band / 2,
    );
  }

  void _paint(Canvas canvas, CartesianContext context, List<List<_Span>> rows, List<Color> colors) {
    final double font = context.fontSize - 1;
    final Rect plot = context.plot;

    for (int row = 0; row < rows.length; row += 1) {
      for (int index = 0; index < rows[row].length; index += 1) {
        final _Span one = rows[row][index];
        final double from = context.valuePx(one.from);
        final double to = context.valuePx(one.to);
        final double thickness = math.max(2, context.band.band - chartMarkGap);
        final double y = plot.top + context.categoryPx(row) - thickness / 2;
        final double width = math.max(1, to - from);
        final ChartMark? active = context.activeMark;
        final bool on = active != null && active.series == row && active.index == index;
        final Color paint = chartColorOf(context.scheme, one.span.color) ?? colors[row];
        // Rounded at both ends: a span *is* two ends, and neither is more the
        // value than the other.
        final Path bar = barPath(from, y, width, thickness, chartBarRadius, BarEnd.both);

        canvas.drawPath(bar, Paint()..color = paint.withValues(alpha: paint.a * (on ? 1 : 0.85)));

        if (on) {
          canvas.drawPath(
            bar,
            Paint()
              ..color = context.scheme.onSurface
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1.5,
          );
        }

        final String? label = one.span.label;

        // Measured and dropped rather than clipped.
        if (spanLabels &&
            label != null &&
            label.isNotEmpty &&
            width >= textWidth(label, font) + 16) {
          paintChartText(
            canvas,
            label,
            Offset(from + 8, plot.top + context.categoryPx(row)),
            // The page's own colour on the bar: every palette slot was measured
            // to carry it.
            style: context.textStyle.copyWith(fontSize: font, color: context.scheme.surface),
            central: true,
          );
        }
      }
    }
  }
}
