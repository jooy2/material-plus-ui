/// A grid of cells, coloured by how much.
library;

import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A grid of cells, coloured by how much.
///
/// ```dart
/// MPHeatmapChart(
///   categories: const <String>['Mon', 'Tue', 'Wed'],
///   series: const <MPChartSeries>[
///     MPChartSeries(name: '09:00', data: <num>[4, 9, 2]),
///     MPChartSeries(name: '10:00', data: <num>[7, 12, 5]),
///   ],
/// )
/// ```
///
/// Two categorical axes and a magnitude in the cells: the shape for a pattern
/// across two dimensions, where what a reader is looking for is *where* the
/// dense part is.
///
/// ## Its colour is a ramp, not the palette
///
/// The eight chart slots say *which*; a cell's colour has to say *how much*,
/// so it comes from the theme's sequential ramp — one hue, five steps, running
/// further from the page as the value grows, in both brightnesses.
///
/// ## Steps rather than a gradient
///
/// Given a gradient a reader can say "darker" and nothing else; given five
/// steps they can match a cell to a band in the legend.
///
/// ## Pin the scale to compare two of them
///
/// Each heatmap scales to its own range unless [min] and [max] say otherwise,
/// so the darkest cell of a quiet week looks like the darkest cell of a bad
/// one.
class MPHeatmapChart extends StatefulWidget {
  /// Creates a heatmap.
  const MPHeatmapChart({
    required this.series,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.min,
    this.max,
    this.valueLabels = false,
    this.height,
    this.format,
    this.locale,
    this.label,
    this.legend,
    this.tooltip,
    this.empty,
    this.size,
    this.dateNames,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The rows. Each series is one row, and its data are that row's cells in
  /// the order [categories] names the columns.
  final List<MPChartSeries> series;

  /// The column headings.
  final List<MPChartCategory>? categories;

  /// The column axis. Only `label`, `hidden`, `thickness`, `tickFormat` and
  /// `tickLabels` mean anything here.
  final MPChartAxis? xAxis;

  /// The row axis. Only `label`, `hidden` and `thickness` mean anything here.
  final MPChartAxis? yAxis;

  /// Where the colour scale starts. Taken from the data otherwise.
  final double? min;

  /// Where the colour scale ends. Taken from the data otherwise.
  final double? max;

  /// Writes each cell's value in it, where the cell is big enough to hold the
  /// text. One that does not fit is dropped rather than clipped.
  final bool valueLabels;

  /// How tall the drawing is, axis labels included.
  final double? height;

  /// How numbers are written everywhere they appear.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**.
  final String? label;

  /// The legend, which here is the ramp itself with its two ends written.
  /// Only `visible` means anything: it always sits under the grid.
  final MPChartLegend? legend;

  /// What the pointer uncovers.
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
  State<MPHeatmapChart> createState() => _MPHeatmapChartState();
}

class _MPHeatmapChartState extends State<MPHeatmapChart> {
  /// The cell being read, by its row and column.
  (int, int)? _active;

  void _clear() {
    if (_active != null) {
      setState(() => _active = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme scheme = theme.colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final Map<String, String> words = mpMessagesOf(context, mpChartMessages, locale: widget.locale);
    final String emptyWord = mpMessagesOf(
      context,
      mpTableMessages,
      locale: widget.locale,
    )['empty']!;
    final MPDateNames names =
        widget.dateNames ?? mpDateNamesFor(mpLocaleOf(context, widget.locale));
    final MPChartAxis xAxis = widget.xAxis ?? const MPChartAxis();
    final MPChartAxis yAxis = widget.yAxis ?? const MPChartAxis();
    final bool silent = widget.tooltip?.mode == MPChartTooltipMode.none;
    final double font = chartFontSize[size]!;
    final double boxHeight = widget.height ?? chartPlotHeight[size]!;

    String formatValue(double value) => formatStatistic(value, widget.format);

    final List<List<ChartValue>> rows = toValues(widget.series);
    final int columns = rows.fold<int>(0, (int most, List<ChartValue> one) {
      return math.max(most, one.length);
    });
    final List<String> rowNames = <String>[
      for (int i = 0; i < widget.series.length; i += 1) widget.series[i].name ?? '${i + 1}',
    ];
    final List<String> columnNames = <String>[
      for (int i = 0; i < columns; i += 1)
        () {
          final MPChartCategory category =
              widget.categories != null && i < widget.categories!.length
              ? widget.categories![i]
              : i;

          return xAxis.tickFormat?.call(category, i) ?? formatCategory(category, names);
        }(),
    ];

    // The extent the ramp is stretched across.
    final ChartExtent? found = bounds(<double>[
      for (final List<ChartValue> one in rows)
        for (final ChartValue cell in one)
          if (cell.value != null) cell.value!,
    ]);
    final double low = widget.min ?? found?.min ?? 0;
    final double high = widget.max ?? found?.max ?? 0;
    final double span = high - low == 0 ? 1 : high - low;
    final bool nothing = columns == 0 || rows.isEmpty || found == null;

    int stepOf(double value) => rampStep((value - low) / span);

    final (int, int)? active = _active != null && _active!.$1 < rows.length && _active!.$2 < columns
        ? _active
        : null;
    final ChartValue? activeCell = active == null || active.$2 >= rows[active.$1].length
        ? null
        : rows[active.$1][active.$2];
    final List<MPChartTooltipItem> items = active == null || activeCell?.value == null
        ? const <MPChartTooltipItem>[]
        : <MPChartTooltipItem>[
            MPChartTooltipItem(
              seriesIndex: active.$1,
              name: rowNames[active.$1],
              color: rampFill(scheme, stepOf(activeCell!.value!)),
              value: activeCell.value,
              formatted: formatValue(activeCell.value!),
              label: activeCell.label,
            ),
          ];
    final String? heading = active == null
        ? null
        : '${rowNames[active.$1]} · ${columnNames[active.$2]}';

    final bool showLegend = (widget.legend?.visible ?? true) && found != null;

    // The table is the transpose of the drawing: a row per series and a column
    // per category, the way a reader would write the grid down.
    final String description = nothing
        ? ''
        : chartTableText(
            rows: rowNames,
            columns: columnNames,
            cells: <List<String>>[
              for (final List<ChartValue> one in rows)
                <String>[
                  for (int column = 0; column < columns; column += 1)
                    column < one.length && one[column].label != null
                        ? one[column].label!
                        : column < one.length && one[column].value != null
                        ? formatValue(one[column].value!)
                        : emptyWord,
                ],
            ],
          );

    final TextStyle textStyle = DefaultTextStyle.of(context).style.copyWith(
      fontSize: font,
      height: 1,
      decoration: TextDecoration.none,
      color: scheme.onSurfaceVariant,
    );

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double width = chartWidthOf(context, constraints);

        // Both axes are category axes, so both are as wide as their widest
        // label rather than their widest number.
        final double widestRow = rowNames.fold<double>(0, (double most, String name) {
          return math.max(most, textWidth(name, font));
        });
        final double left = yAxis.hidden ? 0 : (yAxis.thickness ?? math.min(140, widestRow + 10));
        final double plotWidth = math.max(0, width - left);
        final double cellWidth = columns > 0 ? plotWidth / columns : 0;
        final double turn = xAxis.hidden
            ? 0
            : tickTurn(xAxis.tickLabels ?? MPChartTickLabels.auto, columnNames, font, cellWidth);
        final double turnCap = math.min(120, boxHeight * 0.5);
        final List<String> columnTexts = <String>[
          for (int column = 0; column < columnNames.length; column += 1)
            truncateLabel(
              columnNames[column],
              turn > 0
                  ? math.min(
                      turnedRoom(turn, turnCap, font),
                      turn >= 90
                          ? double.infinity
                          : (left + cellWidth * (column + 0.5)) / math.cos(turn * math.pi / 180),
                    )
                  : cellWidth - 2,
              font,
            ),
        ];
        final double widestColumn = columnTexts.fold<double>(0, (double most, String name) {
          return math.max(most, textWidth(name, font));
        });
        final double bottom = xAxis.hidden
            ? 0
            : (xAxis.thickness ??
                  (turn > 0 ? 8 + turnedBand(turn, widestColumn, font) + 4 : font + 12));
        final Rect plot = Rect.fromLTWH(left, 0, plotWidth, math.max(0, boxHeight - bottom));
        final double cellHeight = rows.isNotEmpty ? plot.height / rows.length : 0;

        (int, int)? cellAt(Offset local) {
          if (cellWidth <= 0 || cellHeight <= 0) {
            return null;
          }

          final int column = ((local.dx - plot.left) / cellWidth).floor();
          final int row = ((local.dy - plot.top) / cellHeight).floor();

          if (column < 0 || column >= columns || row < 0 || row >= rows.length) {
            return null;
          }

          return (row, column);
        }

        void onMove(Offset local) {
          if (silent || nothing) {
            return;
          }

          final (int, int)? next = cellAt(local);

          if (next != _active) {
            setState(() => _active = next);
          }
        }

        void walk(int dRow, int dColumn) {
          // The state as it is now rather than as this build saw it: two keys
          // can arrive before the next frame.
          final (int, int)? now =
              _active != null && _active!.$1 < rows.length && _active!.$2 < columns
              ? _active
              : null;
          final (int, int) from = now ?? (0, 0);
          final bool moving = now != null;

          setState(() {
            _active = (
              (from.$1 + (moving ? dRow : 0)).clamp(0, rows.length - 1),
              (from.$2 + (moving ? dColumn : 0)).clamp(0, columns - 1),
            );
          });
        }

        KeyEventResult onKey(FocusNode node, KeyEvent event) {
          if (!chartKeyDown(event) || nothing || silent) {
            return KeyEventResult.ignored;
          }

          final LogicalKeyboardKey key = event.logicalKey;

          if (key == LogicalKeyboardKey.arrowRight) {
            walk(0, 1);
          } else if (key == LogicalKeyboardKey.arrowLeft) {
            walk(0, -1);
          } else if (key == LogicalKeyboardKey.arrowDown) {
            walk(1, 0);
          } else if (key == LogicalKeyboardKey.arrowUp) {
            walk(-1, 0);
          } else if (key == LogicalKeyboardKey.escape && active != null) {
            _clear();
          } else {
            return KeyEventResult.ignored;
          }

          return KeyEventResult.handled;
        }

        final Widget plotWidget = nothing
            ? ChartEmpty(fallback: emptyWord, child: widget.empty)
            : Listener(
                behavior: HitTestBehavior.opaque,
                onPointerHover: (PointerHoverEvent event) => onMove(event.localPosition),
                onPointerMove: (PointerMoveEvent event) => onMove(event.localPosition),
                onPointerDown: (PointerDownEvent event) {
                  if (event.kind == PointerDeviceKind.mouse) {
                    return;
                  }

                  final (int, int)? before = _active;

                  onMove(event.localPosition);

                  if (before != null && before == _active) {
                    _clear();
                  }
                },
                child: MouseRegion(
                  onExit: (PointerExitEvent event) => _clear(),
                  child: SizedBox(
                    width: width,
                    height: boxHeight,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: <Widget>[
                        CustomPaint(
                          size: Size(width, boxHeight),
                          painter: _HeatmapPainter(
                            rows: rows,
                            columns: columns,
                            plot: plot,
                            cellWidth: cellWidth,
                            cellHeight: cellHeight,
                            stepOf: stepOf,
                            active: active,
                            scheme: scheme,
                            textStyle: textStyle,
                            formatValue: formatValue,
                            valueLabels: widget.valueLabels,
                            rowNames: yAxis.hidden ? null : rowNames,
                            columnTexts: xAxis.hidden ? null : columnTexts,
                            left: left,
                            turn: turn,
                          ),
                        ),
                        if (active != null && items.isNotEmpty && !silent)
                          Positioned.fill(
                            child: ChartTooltipPlacement(
                              anchor: Offset(
                                plot.left + (active.$2 + 0.5) * cellWidth,
                                plot.top + (active.$1 + 0.5) * cellHeight,
                              ),
                              flip: active.$2 > columns / 2,
                              child: ChartTooltipPanel(heading: heading, items: items, size: size),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );

        return ChartShell(
          name: widget.label ?? words['label']!,
          description: description,
          interactive: !nothing,
          height: boxHeight,
          plot: plotWidget,
          status: silent ? '' : chartStatusText(heading: heading, items: items),
          focusNode: widget.focusNode,
          autofocus: widget.autofocus,
          onKeyEvent: onKey,
          onFocusChange: (bool has) {
            if (!has) {
              _clear();
            }
          },
          legend: showLegend
              ? _RampLegend(low: formatValue(low), high: formatValue(high), scheme: scheme)
              : null,
        );
      },
    );
  }
}

/// The legend for a ramp is the ramp itself: five swatches in order, with the
/// two ends written. A reader needs to match a cell against a band, which is a
/// picture rather than a key.
class _RampLegend extends StatelessWidget {
  const _RampLegend({required this.low, required this.high, required this.scheme});

  final String low;
  final String high;
  final MPColorScheme scheme;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle ends = theme.typescale.labelSmall
        .style(scheme.onSurfaceVariant)
        .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]);
    final Radius corner = Radius.circular(theme.shapes.extraSmall);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(low, style: ends),
        const SizedBox(width: 8),
        ExcludeSemantics(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              for (int step = 0; step < rampSteps; step += 1)
                Container(
                  width: 24,
                  height: 12,
                  decoration: BoxDecoration(
                    color: rampFill(scheme, step),
                    borderRadius: BorderRadiusDirectional.horizontal(
                      start: step == 0 ? corner : Radius.zero,
                      end: step == rampSteps - 1 ? corner : Radius.zero,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Text(high, style: ends),
      ],
    );
  }
}

class _HeatmapPainter extends CustomPainter {
  const _HeatmapPainter({
    required this.rows,
    required this.columns,
    required this.plot,
    required this.cellWidth,
    required this.cellHeight,
    required this.stepOf,
    required this.active,
    required this.scheme,
    required this.textStyle,
    required this.formatValue,
    required this.valueLabels,
    required this.rowNames,
    required this.columnTexts,
    required this.left,
    required this.turn,
  });

  final List<List<ChartValue>> rows;
  final int columns;
  final Rect plot;
  final double cellWidth;
  final double cellHeight;
  final int Function(double value) stepOf;
  final (int, int)? active;
  final MPColorScheme scheme;
  final TextStyle textStyle;
  final String Function(double value) formatValue;
  final bool valueLabels;
  final List<String>? rowNames;
  final List<String>? columnTexts;
  final double left;
  final double turn;

  @override
  void paint(Canvas canvas, Size size) {
    final double font = textStyle.fontSize ?? 12;
    final double w = math.max(0, cellWidth - chartMarkGap);
    final double h = math.max(0, cellHeight - chartMarkGap);

    for (int row = 0; row < rows.length; row += 1) {
      for (int column = 0; column < columns; column += 1) {
        final ChartValue? cell = column < rows[row].length ? rows[row][column] : null;
        final RRect box = RRect.fromRectAndRadius(
          Rect.fromLTWH(
            plot.left + column * cellWidth + chartMarkGap / 2,
            plot.top + row * cellHeight + chartMarkGap / 2,
            w,
            h,
          ),
          const Radius.circular(2),
        );

        if (cell == null || cell.value == null) {
          // A cell with nothing in it is a hole rather than the lowest step:
          // the bottom of a ramp is a reading.
          canvas.drawPath(
            dashedPath(Path()..addRRect(box), 2, 2),
            Paint()
              ..color = scheme.outlineVariant
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1,
          );

          continue;
        }

        final int step = stepOf(cell.value!);

        canvas.drawRRect(
          box,
          Paint()..color = chartColorOf(scheme, cell.color) ?? rampFill(scheme, step),
        );

        // The cell under the pointer is ringed rather than recoloured: a cell
        // that changed colour on hover would report a different number.
        if (active == (row, column)) {
          canvas.drawRRect(
            box,
            Paint()
              ..color = scheme.onSurface
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2,
          );
        }

        final String written = formatValue(cell.value!);

        if (valueLabels && w > textWidth(written, font) + 8 && h > font + 4) {
          paintChartText(
            canvas,
            written,
            Offset(plot.left + (column + 0.5) * cellWidth, plot.top + (row + 0.5) * cellHeight),
            style: textStyle.copyWith(color: rampInk(scheme, step)),
            anchor: ChartAnchor.middle,
            central: true,
          );
        }
      }
    }

    // Names down the side and along the bottom, with no ticks and no grid:
    // both axes are categorical, so there is nothing to measure against.
    if (rowNames != null) {
      for (int row = 0; row < rowNames!.length; row += 1) {
        paintChartText(
          canvas,
          truncateLabel(rowNames![row], left - 10, font),
          Offset(plot.left - 8, plot.top + (row + 0.5) * cellHeight),
          style: textStyle,
          anchor: ChartAnchor.end,
          central: true,
        );
      }
    }

    if (columnTexts != null) {
      for (int column = 0; column < columnTexts!.length; column += 1) {
        final double at = plot.left + (column + 0.5) * cellWidth;

        paintChartText(
          canvas,
          columnTexts![column],
          turn > 0 ? Offset(at, plot.bottom + 8) : Offset(at, plot.bottom + font + 4),
          style: textStyle,
          anchor: turn > 0 ? ChartAnchor.end : ChartAnchor.middle,
          central: turn > 0,
          turn: turn,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_HeatmapPainter oldDelegate) => true;
}
