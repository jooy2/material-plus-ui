/// A measured length per category.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/chart_frame.dart';
import 'package:material_plus_ui/src/types.dart';

/// A measured length per category — how much, next to how much else.
///
/// ```dart
/// MPBarChart(
///   categories: const <String>['Search', 'Direct', 'Social', 'Mail'],
///   series: const <MPChartSeries>[
///     MPChartSeries(name: 'Sessions', data: <num>[4820, 3110, 1940, 860]),
///   ],
/// )
/// ```
///
/// What a bar encodes is **length**, the one visual channel a reader judges
/// accurately, which is why a bar chart beats a pie for almost every
/// comparison somebody has to make.
///
/// ## The axis starts at zero and there is no switch to stop it
///
/// A bar's length is proportional to its value only from a zero baseline.
/// `yAxis: MPChartAxis(min: ...)` still moves the scale, because a caller who
/// has said so has said so; for values that are close together, reach for an
/// `MPLineChart`.
///
/// ## Grouped or stacked, never both
///
/// Side by side compares the parts with each other. Stacked compares the
/// totals and shows what makes them up.
///
/// ## Turn it sideways for long names
///
/// [horizontal] gives every category a row of its own. Upright, the axis turns
/// long names instead — 45° while that fits and upright past it — rather than
/// cutting them to a slot the width of one bar.
class MPBarChart extends StatelessWidget {
  /// Creates a bar chart.
  const MPBarChart({
    required this.series,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.zoom,
    this.stacked = MPChartStack.none,
    this.horizontal = false,
    this.valueLabels = MPChartValueLabels.none,
    this.height,
    this.format,
    this.locale,
    this.label,
    this.legend,
    this.tooltip,
    this.empty,
    this.labelColor = MPChartLabelColor.ink,
    this.size,
    this.dateNames,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The series, in the order their colours are handed out.
  final List<MPChartSeries> series;

  /// The category axis' labels. Points may carry their own `x` instead.
  final List<MPChartCategory>? categories;

  /// The category axis, whichever way round the chart runs.
  final MPChartAxis? xAxis;

  /// The value axis, whichever way round the chart runs.
  final MPChartAxis? yAxis;

  /// Lets a reader drag a range out of the category axis and redraws to it.
  final MPChartZoom? zoom;

  /// Stacks the series into one bar per category instead of standing them
  /// side by side. [MPChartStack.percent] fills every bar, so what is compared
  /// is the composition.
  final MPChartStack stacked;

  /// Turns the chart on its side, so the bars run across and every name has a
  /// row.
  final bool horizontal;

  /// Which values are written past the ends of the bars. A stack writes none.
  final MPChartValueLabels valueLabels;

  /// How tall the drawing is, axis labels included.
  final double? height;

  /// How numbers are written everywhere they appear.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**.
  final String? label;

  /// The legend.
  final MPChartLegend? legend;

  /// What the pointer uncovers.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink the legend's names and the written values wear.
  final MPChartLabelColor labelColor;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The words dates are written with.
  final MPDateNames? dateNames;

  /// Drives the plot's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the chart is inserted.
  final bool autofocus;

  /// How much room the written values need past the end of the longest bar:
  /// one line of type upright, and the widest number sideways.
  double _headroom(MPSize size) {
    final double font = chartFontSize[size]!;

    if (valueLabels == MPChartValueLabels.none || stacked != MPChartStack.none) {
      return 0;
    }

    if (!horizontal) {
      return font + 8;
    }

    double widest = 0;

    for (final List<ChartValue> one in toValues(series)) {
      for (final ChartValue value in one) {
        if (value.value != null) {
          widest = math.max(
            widest,
            textWidth(value.label ?? formatStatistic(value.value!, format), font),
          );
        }
      }
    }

    return widest + 10;
  }

  @override
  Widget build(BuildContext context) {
    final MPSize resolved = size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

    return CartesianFrame(
      series: series,
      categories: categories,
      xAxis: xAxis,
      yAxis: yAxis,
      zoom: zoom,
      height: height,
      format: format,
      locale: locale,
      label: label,
      legend: legend,
      tooltip: tooltip,
      empty: empty,
      labelColor: labelColor,
      size: size,
      dateNames: dateNames,
      focusNode: focusNode,
      autofocus: autofocus,
      stacked: stacked,
      horizontal: horizontal,
      bandRatio: chartBarBandRatio,
      includeZero: true,
      headroom: _headroom(resolved),
      paint: _paint,
    );
  }

  void _paint(Canvas canvas, Size size, CartesianContext context) {
    final List<List<ChartValue>> values = context.values;
    final Rect plot = context.plot;
    final bool stack = stacked != MPChartStack.none;
    final int count = values.fold<int>(0, (int most, List<ChartValue> one) {
      return math.max(most, one.length);
    });
    final List<int> drawn = <int>[
      for (int i = 0; i < values.length; i += 1)
        if (context.visible[i]) i,
    ];

    /* What one bar is worth, which on a percent stack is its share of its own
       column: the visible positives, the same whole the panel divides by. */
    final List<double>? totals = stacked != MPChartStack.percent
        ? null
        : <double>[
            for (int at = 0; at < count; at += 1)
              drawn.fold<double>(0, (double sum, int s) {
                final double value = at < values[s].length ? values[s][at].value ?? 0 : 0;

                return sum + (value > 0 ? value : 0);
              }),
          ];

    double? reading(int s, int at) {
      final double? value = at < values[s].length ? values[s][at].value : null;

      if (value == null || totals == null) {
        return value;
      }

      return value >= 0 && totals[at] > 0 ? value / totals[at] : null;
    }

    /* How thick one bar is. Grouped, the band is divided between the visible
       series, so hiding one widens the survivors; stacked, there is one bar
       per category and the band is all of it. */
    final double band = context.band.band;
    final double share = stack ? band : band / math.max(1, drawn.length);
    final double thickness = math.max(
      1,
      math.min(share - (stack ? 0 : chartMarkGap), chartBarMaxThickness[context.size]!),
    );
    final double near = horizontal ? plot.top : plot.left;

    for (final int s in drawn) {
      final Color paint = context.colors[s];
      final bool dimmed = context.hovered != null && context.hovered != s;
      final bool Function(int) labelled = valueLabelTest(values[s], valueLabels, last: count - 1);
      final int place = drawn.indexOf(s);

      paintFaded(canvas, size, dimmed ? 0.25 : 1, () {
        for (int at = 0; at < count; at += 1) {
          final double? value = reading(s, at);

          if (value == null) {
            continue;
          }

          // Where this bar starts: the axis, or on a stack whatever the visible
          // series before it add up to, the two signs apart.
          double base = 0;
          int last = s;

          if (stack) {
            double up = 0;
            double down = 0;

            for (final int other in drawn) {
              final double? amount = reading(other, at);

              if (amount == null) {
                continue;
              }

              if (other == s) {
                base = amount >= 0 ? up : down;
              }

              if (amount >= 0) {
                up += amount;
              } else {
                down += amount;
              }

              // The outermost segment in this bar's direction is the only one
              // whose end is the total, so only it is rounded.
              if ((amount >= 0) == (value >= 0)) {
                last = other;
              }
            }
          }

          final double from = context.valuePx(base);
          final double to = context.valuePx(value + (stack ? base : 0));
          // The gap between two segments comes out of the one further from
          // zero, so the boundary stays where the running total puts it.
          final double start = stack && base != 0
              ? from + (to > from ? chartMarkGap : -chartMarkGap)
              : from;
          final double length = (to - start).abs();

          if (length <= 0 || (to > from) != (to > start)) {
            continue;
          }

          final double along =
              near +
              context.categoryPx(at) -
              band / 2 +
              (stack ? 0 : place * share) +
              (share - thickness) / 2;

          final BarEnd end = s != last
              ? BarEnd.none
              : horizontal
              ? (value >= 0 ? BarEnd.right : BarEnd.left)
              : (value >= 0 ? BarEnd.top : BarEnd.bottom);

          final Path bar = horizontal
              ? barPath(math.min(start, to), along, length, thickness, chartBarRadius, end)
              : barPath(along, math.min(start, to), thickness, length, chartBarRadius, end);

          // The column under the pointer keeps its full colour and the rest
          // step back, which is what makes the crosshair point at something.
          final bool lit = context.activeIndex == null || context.activeIndex == at;

          canvas.drawPath(
            bar,
            Paint()..color = paint.withValues(alpha: paint.a * (lit ? 1 : 0.55)),
          );
        }

        if (valueLabels == MPChartValueLabels.none || stack) {
          return;
        }

        for (int at = 0; at < values[s].length; at += 1) {
          final ChartValue value = values[s][at];

          if (value.value == null || !labelled(at)) {
            continue;
          }

          final double to = context.valuePx(value.value!);
          final double along = near + context.categoryPx(at) - band / 2 + place * share + share / 2;
          // Just past the data end, on the outside: inside the bar it would
          // have to survive the fill's colour.
          final double away = value.value! >= 0 ? -6 : 6;

          paintChartText(
            canvas,
            value.label ?? context.format(value.value!),
            horizontal ? Offset(to - away, along) : Offset(along, to + away),
            style: context.textStyle.copyWith(
              fontSize: context.fontSize - 1,
              color: context.labelInk(s),
            ),
            anchor: horizontal
                ? (value.value! >= 0 ? ChartAnchor.start : ChartAnchor.end)
                : ChartAnchor.middle,
            central: horizontal,
          );
        }
      });
    }

    // The baseline again, over the bars: a bar drawn across zero otherwise
    // hides the line its own length is measured from.
    final double zero = context.zeroPx;
    final Paint rule = Paint()
      ..color = context.scheme.outline
      ..strokeWidth = 1;

    canvas.drawLine(
      horizontal ? Offset(zero, plot.top) : Offset(plot.left, zero),
      horizontal ? Offset(zero, plot.bottom) : Offset(plot.right, zero),
      rule,
    );
  }
}
