/// The frame a chart with two axes is drawn in.
///
/// The plot box once the axes have taken their bands, the value scale, the
/// band scale, the grid and the crosshair — everything that is identical on a
/// line chart and a bar chart. What is left for a chart to do is its marks, and
/// it is handed **pixels** to draw them at: a component that had to know which
/// way round the axes run is a component that gets it wrong when somebody
/// turns it sideways. The Dart half of the React package's `ChartFrame.tsx`.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/chart.dart';
import 'package:material_plus_ui/src/internal/chart_chrome.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// What the category axis runs on.
enum CartesianXScale {
  /// A row of slots, one per category.
  band,

  /// A second value axis, for a scatter.
  value,
}

/// One mark on a plot whose marks are not arranged in columns.
///
/// A scatter has no shared categories, so the only question a reader can be
/// asking is "which of these dots". A chart that hands the frame its marks gets
/// the nearest-mark search, the arrow keys and the panel's anchoring.
class ChartMark {
  /// Creates a mark.
  const ChartMark({
    required this.series,
    required this.index,
    required this.x,
    required this.y,
    required this.r,
    this.rx,
    this.ry,
  });

  /// Its series' place in the list as it was passed.
  final int series;

  /// Its own place within that series.
  final int index;

  /// Its centre, in pixels from the chart's top-left.
  final double x;

  /// Its centre, in pixels from the chart's top-left.
  final double y;

  /// How big it is. Widens the hit target, so a bubble is easier to hit.
  final double r;

  /// Its half-width, where the mark is a box rather than a disc: a span on a
  /// timeline is hit anywhere along its body rather than near its centre.
  final double? rx;

  /// Its half-height, where the mark is a box.
  final double? ry;

  /// How far [at] is from the mark's edge, which is zero anywhere inside it.
  double bodyDistance(Offset at) {
    if (rx == null) {
      return math.max(0, (Offset(x, y) - at).distance - r);
    }

    return Offset(
      math.max(0, (x - at.dx).abs() - rx!),
      math.max(0, (y - at.dy).abs() - (ry ?? rx!)),
    ).distance;
  }
}

/// Where everything goes, and what the pointer has decided.
class CartesianContext {
  /// Creates a context.
  const CartesianContext({
    required this.plot,
    required this.values,
    required this.visible,
    required this.colors,
    required this.scheme,
    required this.labelColor,
    required this.scale,
    required this.band,
    required this.horizontal,
    required this.inset,
    required this.count,
    required this.categoryScale,
    required this.categories,
    required this.format,
    required this.size,
    required this.fontSize,
    required this.textStyle,
    this.hovered,
    this.activeIndex,
    this.marks = const <ChartMark>[],
    this.activeMark,
  });

  /// The plot's box inside the chart, once the axes have taken their bands.
  final Rect plot;

  /// Every series unpacked, in the order it was passed, cut to the window.
  final List<List<ChartValue>> values;

  /// Which of them are drawn.
  final List<bool> visible;

  /// And what colour each one is, by its original index.
  final List<Color> colors;

  /// The theme's colours.
  final MPColorScheme scheme;

  /// What ink a value written beside a mark wears.
  final MPChartLabelColor labelColor;

  /// The value axis' scale.
  final ValueScale scale;

  /// The category axis' slots.
  final BandScale band;

  /// Bars run along the category axis rather than across it.
  final bool horizontal;

  /// Marks sit on the category ticks rather than between them.
  final bool inset;

  /// How many categories are drawn.
  final int count;

  /// The category axis' scale where it is a second value axis.
  final ValueScale? categoryScale;

  /// The categories drawn, cut to the window.
  final List<MPChartCategory> categories;

  /// A value as this chart writes it.
  final String Function(double value) format;

  /// The chart's size.
  final MPSize size;

  /// What the axis labels are set in.
  final double fontSize;

  /// The type every label on the canvas starts from.
  final TextStyle textStyle;

  /// The series the legend is being pointed at.
  final int? hovered;

  /// The category under the pointer.
  final int? activeIndex;

  /// Every mark, where the chart supplied a builder.
  final List<ChartMark> marks;

  /// The one the pointer is on, or the one the arrow keys walked to.
  final ChartMark? activeMark;

  /// The ink a value written beside one of series [series]' marks wears:
  /// `onSurface`, or the series' own colour where the caller asked for it.
  Color labelInk(int series) {
    return labelColor == MPChartLabelColor.series ? colors[series] : scheme.onSurface;
  }

  /// Where a value sits along the value axis, in pixels from the chart's edge.
  double valuePx(double value) => horizontal
      ? plot.left + scale.fraction(value) * plot.width
      : plot.top + (1 - scale.fraction(value)) * plot.height;

  /// How long the category axis is.
  double get categoryLength => horizontal ? plot.height : plot.width;

  /// Where a category's centre sits along the category axis, as an offset
  /// along it.
  double categoryPx(int index) {
    if (!inset) {
      return band.centre(index);
    }

    return count <= 1 ? categoryLength / 2 : categoryLength * index / (count - 1);
  }

  /// Where a value sits along the category axis, in pixels from the chart's
  /// edge, where that axis is a second value axis.
  double categoryValuePx(double value) {
    final double fraction = categoryScale?.fraction(value) ?? 0;

    return horizontal ? plot.top + (1 - fraction) * plot.height : plot.left + fraction * plot.width;
  }

  /// A category and a value as a point, whichever way round the chart runs.
  Offset point(int index, double value) => horizontal
      ? Offset(valuePx(value), plot.top + categoryPx(index))
      : Offset(plot.left + categoryPx(index), valuePx(value));

  /// Where the baseline sits along the value axis.
  double get zeroPx => valuePx(math.min(math.max(0, scale.min), scale.max));

  /// A fraction as a share.
  String share(double fraction) => formatShare(fraction);

  /// The same layout with what the pointer decided.
  CartesianContext withPointer({
    int? hovered,
    int? activeIndex,
    List<ChartMark> marks = const <ChartMark>[],
    ChartMark? activeMark,
  }) {
    return CartesianContext(
      plot: plot,
      values: values,
      visible: visible,
      colors: colors,
      scheme: scheme,
      labelColor: labelColor,
      scale: scale,
      band: band,
      horizontal: horizontal,
      inset: inset,
      count: count,
      categoryScale: categoryScale,
      categories: categories,
      format: format,
      size: size,
      fontSize: fontSize,
      textStyle: textStyle,
      hovered: hovered,
      activeIndex: activeIndex,
      marks: marks,
      activeMark: activeMark,
    );
  }
}

/// Paints a chart's marks.
typedef CartesianMarkPainter = void Function(Canvas canvas, Size size, CartesianContext context);

/// Builds a chart's marks from the layout.
typedef CartesianMarkBuilder = List<ChartMark> Function(CartesianContext layout);

/// What the panel says about a mark whose value is not a cell of the grid.
typedef CartesianMarkTooltip =
    ({String heading, List<MPChartTooltipItem> items})? Function(ChartMark mark);

/// The frame: two axes, a grid, a crosshair, a legend, a panel and the words
/// behind the picture.
class CartesianFrame extends StatefulWidget {
  /// Creates the frame.
  const CartesianFrame({
    required this.series,
    required this.paint,
    this.categories,
    this.xAxis,
    this.yAxis,
    this.zoom,
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
    this.xScale = CartesianXScale.band,
    this.marks,
    this.markRadius = 24,
    this.swatch,
    this.scale,
    this.table,
    this.markTooltip,
    this.horizontal = false,
    this.stacked = MPChartStack.none,
    this.includeZero = true,
    this.bandRatio = 1,
    this.inset = false,
    this.headroom = 0,
    this.markInset = 0,
    super.key,
  });

  /// The series, in the order their colours are handed out.
  final List<MPChartSeries> series;

  /// Draws the marks.
  final CartesianMarkPainter paint;

  /// The category axis' labels.
  final List<MPChartCategory>? categories;

  /// The category axis.
  final MPChartAxis? xAxis;

  /// The value axis.
  final MPChartAxis? yAxis;

  /// Dragging a range out of the category axis.
  final MPChartZoom? zoom;

  /// How tall the drawing is.
  final double? height;

  /// How numbers are written.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart of.
  final String? label;

  /// The legend.
  final MPChartLegend? legend;

  /// The hover layer.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink names and written values wear.
  final MPChartLabelColor labelColor;

  /// The size ladder rung.
  final MPSize? size;

  /// The words dates are written with.
  final MPDateNames? dateNames;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// What the category axis runs on.
  final CartesianXScale xScale;

  /// Builds every mark, which swaps the column hit-testing for a nearest-mark
  /// search and makes the arrow keys walk this list.
  final CartesianMarkBuilder? marks;

  /// How far off a mark the pointer still counts as on it.
  final double markRadius;

  /// The legend's swatch, where a chart's marks are not all the same shape.
  final Widget Function(int index, Color color)? swatch;

  /// The value axis' scale, already worked out.
  final ValueScale? scale;

  /// The words behind the picture, for a chart whose data are not a grid of
  /// series against categories.
  final String Function()? table;

  /// What the panel says about a mark.
  final CartesianMarkTooltip? markTooltip;

  /// Bars, and only bars, run the other way.
  final bool horizontal;

  /// The value axis measures totals rather than parts, or shares of one.
  final MPChartStack stacked;

  /// A line chart may leave zero out; a bar chart may not.
  final bool includeZero;

  /// How much of a band the marks take.
  final double bandRatio;

  /// Lines sit on the category ticks; bars sit between them.
  final bool inset;

  /// Extra room at the far end of the value axis, for labels riding the marks.
  final double headroom;

  /// Room on every side, for marks drawn from their centre.
  final double markInset;

  @override
  State<CartesianFrame> createState() => _CartesianFrameState();
}

class _CartesianFrameState extends State<CartesianFrame> {
  /// Which series are switched off, by their place in the list, so a hidden one
  /// does not renumber those after it. `hidden` is read once, as the React
  /// build reads it.
  final Set<int> _hidden = <int>{};

  /// The series the legend is pointing at.
  int? _hovered;

  /// The column under the pointer, or the one a key walked to.
  int? _column;

  /// The mark under the pointer, by its series and its own index.
  (int, int)? _mark;

  /// Where the pointer sits along the value axis, for `item` mode. `null`
  /// when the reading arrived by key.
  double? _pointer;

  /// The range being dragged, in window indices.
  (int, int)? _drag;

  /// The window, where the caller does not hold it.
  (int, int)? _ownRange;

  @override
  void initState() {
    super.initState();

    for (int i = 0; i < widget.series.length; i += 1) {
      if (widget.series[i].hidden) {
        _hidden.add(i);
      }
    }

    _ownRange = widget.zoom?.range ?? widget.zoom?.initialRange;
  }

  @override
  void didUpdateWidget(CartesianFrame oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.zoom?.range != widget.zoom?.range) {
      _ownRange = widget.zoom?.range;
    }

    if (_hovered != null && _hovered! >= widget.series.length) {
      _hovered = null;
    }
  }

  void _clearActive() {
    if (_column != null || _mark != null || _pointer != null) {
      setState(() {
        _column = null;
        _mark = null;
        _pointer = null;
      });
    }
  }

  void _setRange((int, int)? next) {
    setState(() => _ownRange = next);
    widget.zoom?.onRangeChange?.call(next);
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
    final MPChartAxis valueAxis = widget.yAxis ?? const MPChartAxis();
    final MPChartAxis categoryAxis = widget.xAxis ?? const MPChartAxis();
    final MPChartTooltip options = widget.tooltip ?? const MPChartTooltip();
    final MPChartLegend legendOptions = widget.legend ?? const MPChartLegend();
    final double fontSize = chartFontSize[size]!;
    final TextStyle textStyle = DefaultTextStyle.of(
      context,
    ).style.copyWith(fontSize: fontSize, height: 1, decoration: TextDecoration.none);

    String formatValue(double value) => formatStatistic(value, widget.format);

    final List<List<ChartValue>> allValues = toValues(widget.series);
    final List<Color> colors = <Color>[
      for (int i = 0; i < widget.series.length; i += 1)
        seriesColor(scheme, i, widget.series[i].color),
    ];
    final List<String?> seriesNames = <String?>[
      for (final MPChartSeries one in widget.series) one.name,
    ];
    final int categoryTotal = categoryCount(widget.series);
    final List<MPChartCategory> allLabels = <MPChartCategory>[
      for (int i = 0; i < categoryTotal; i += 1) categoryAt(i, widget.categories, allValues),
    ];

    /* The window, and everything downstream reading it rather than the data:
       the scale re-fits, the panel narrows, and the reading follows. Clamped
       rather than trusted, because a range outlives the data it was picked
       from. */
    final bool zoomable = widget.zoom != null && widget.xScale == CartesianXScale.band;
    final (int, int)? asked = zoomable ? (widget.zoom!.range ?? _ownRange) : null;
    final (int, int)? windowed = asked == null || categoryTotal == 0
        ? null
        : (
            math.min(asked.$1, asked.$2).clamp(0, categoryTotal - 1),
            math.max(asked.$1, asked.$2).clamp(0, categoryTotal - 1),
          );
    final int from = windowed?.$1 ?? 0;
    final int count = windowed == null ? categoryTotal : windowed.$2 - windowed.$1 + 1;
    final List<List<ChartValue>> values = windowed == null
        ? allValues
        : <List<ChartValue>>[
            for (final List<ChartValue> one in allValues)
              <ChartValue>[
                for (int i = from; i < from + count; i += 1) i < one.length ? one[i] : chartGap,
              ],
          ];
    final List<MPChartCategory> labels = windowed == null
        ? allLabels
        : allLabels.sublist(from, from + count);

    final List<bool> visible = <bool>[
      for (int i = 0; i < widget.series.length; i += 1) !_hidden.contains(i),
    ];
    final List<List<ChartValue>> shown = <List<ChartValue>>[
      for (int i = 0; i < values.length; i += 1)
        if (visible[i]) values[i],
    ];

    /* A percent stack has no extent to find: every column is full, so the axis
       runs 0 to 1 whatever the numbers are. */
    final bool percent = widget.stacked == MPChartStack.percent;
    final ChartExtent? extent = percent
        ? const ChartExtent(0, 1)
        : seriesExtent(shown, stacked: widget.stacked != MPChartStack.none);

    final ValueScale scale =
        widget.scale ??
        valueScale(
          percent ? extent : withReferences(extent, valueAxis.references),
          min: percent ? 0 : valueAxis.min,
          max: percent ? 1 : valueAxis.max,
          tickCount: valueAxis.tickCount ?? (percent ? 4 : null),
          includeZero: widget.includeZero,
        );

    /* A second scale of the same kind where the categories are numbers. Zero is
       not forced in: a position encodes a place, and cropping moves every mark
       by the same amount. */
    final ChartExtent? spread = widget.xScale == CartesianXScale.value
        ? categoryExtent(shown, widget.categories)
        : null;
    final ValueScale? categoryScale = widget.xScale == CartesianXScale.value
        ? valueScale(
            withReferences(spread, categoryAxis.references),
            min: categoryAxis.min,
            max: categoryAxis.max,
            tickCount: categoryAxis.tickCount,
            includeZero: false,
          )
        : null;

    final List<String> tickTexts = <String>[
      for (int i = 0; i < scale.ticks.length; i += 1)
        valueAxis.tickFormat?.call(scale.ticks[i], i) ??
            (percent ? formatShare(scale.ticks[i]) : formatValue(scale.ticks[i])),
    ];

    /* `format` belongs to the value axis and is not borrowed for the
       categories: a currency applied to an axis of years prints `$2,019`. */
    final List<String> rawCategoryTexts = categoryScale != null
        ? <String>[
            for (int i = 0; i < categoryScale.ticks.length; i += 1)
              categoryAxis.tickFormat?.call(categoryScale.ticks[i], i) ??
                  formatStatistic(categoryScale.ticks[i], null),
          ]
        : <String>[
            for (int i = 0; i < labels.length; i += 1)
              categoryAxis.tickFormat?.call(labels[i], i) ?? formatCategory(labels[i], names),
          ];

    final bool nothing =
        count == 0 || extent == null || (widget.xScale == CartesianXScale.value && spread == null);
    final double boxHeight = widget.height ?? chartPlotHeight[size]!;
    final bool showLegend = legendOptions.visible ?? widget.series.length > 1;
    final bool beside = legendOptions.side == MPSide.left || legendOptions.side == MPSide.right;

    final int? walkedIndex = widget.marks != null ? _mark?.$2 : _column;

    final Widget? legend = !showLegend
        ? null
        : ChartLegend(
            names: seriesNames,
            colors: colors,
            options: legendOptions,
            visible: visible,
            hovered: _hovered,
            size: size,
            swatch: widget.swatch,
            colorNames: widget.labelColor == MPChartLabelColor.series,
            onToggle: (int index) => setState(() {
              if (!_hidden.remove(index)) {
                _hidden.add(index);
              }
            }),
            onHover: (int? index) {
              if (index != _hovered) {
                setState(() => _hovered = index);
              }
            },
            values: legendOptions.showValue && walkedIndex != null
                ? <String?>[
                    for (final List<ChartValue> one in values)
                      walkedIndex < one.length && one[walkedIndex].value != null
                          ? formatValue(one[walkedIndex].value!)
                          : null,
                  ]
                : null,
          );

    /* The references as words. Only the named ones: "80" on its own is not a
       fact. A date is written as a date rather than as its milliseconds. */
    String spokenReference(Object value) =>
        value is DateTime ? formatCategory(value, names) : formatValue(toNumber(value) ?? 0);
    final List<MPChartReference> spokenReferences = <MPChartReference>[
      ...valueAxis.references,
      if (categoryScale != null) ...categoryAxis.references,
    ].where((MPChartReference one) => one.label != null && one.label!.isNotEmpty).toList();

    String describe() {
      if (nothing) {
        return '';
      }

      final String table =
          widget.table?.call() ??
          chartTableText(
            rows: <String>[for (final MPChartCategory one in labels) formatCategory(one, names)],
            columns: <String>[
              for (int i = 0; i < seriesNames.length; i += 1) seriesNames[i] ?? '${i + 1}',
            ],
            cells: <List<String>>[
              for (int row = 0; row < labels.length; row += 1)
                <String>[
                  for (final List<ChartValue> one in values)
                    row < one.length && one[row].label != null
                        ? one[row].label!
                        : row < one.length && one[row].value != null
                        ? formatValue(one[row].value!)
                        : emptyWord,
                ],
            ],
          );
      final List<String> notes = <String>[
        for (final MPChartReference one in spokenReferences)
          one.to == null
              ? '${one.label}: ${spokenReference(one.value)}'
              : '${one.label}: ${spokenReference(one.value)}–${spokenReference(one.to!)}',
      ];

      return <String>[table, ...notes].where((String part) => part.isNotEmpty).join('. ');
    }

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double outerWidth = chartWidthOf(context, constraints);
        final double legendWidth = legend != null && beside
            ? _legendWidth(seriesNames, fontSize)
            : 0;
        final double width = math.max(0, outerWidth - (legendWidth > 0 ? legendWidth + 12 : 0));

        final _Frame frame = _layOut(
          width: width,
          boxHeight: boxHeight,
          scheme: scheme,
          size: size,
          fontSize: fontSize,
          textStyle: textStyle,
          values: values,
          labels: labels,
          visible: visible,
          colors: colors,
          scale: scale,
          categoryScale: categoryScale,
          tickTexts: tickTexts,
          rawCategoryTexts: rawCategoryTexts,
          valueAxis: valueAxis,
          categoryAxis: categoryAxis,
          count: count,
          formatValue: formatValue,
        );
        final CartesianContext layout = frame.context;

        /* The marks, laid out once: what the pointer is tested against and
           what the chart draws, from the same list. */
        final List<ChartMark> markList = widget.marks?.call(layout) ?? const <ChartMark>[];
        final bool usesMarks = widget.marks != null;
        final MPChartTooltipMode mode =
            options.mode ?? (usesMarks ? MPChartTooltipMode.item : MPChartTooltipMode.column);

        ChartMark? activeMark;

        if (_mark != null) {
          for (final ChartMark mark in markList) {
            if (mark.series == _mark!.$1 && mark.index == _mark!.$2) {
              activeMark = mark;
              break;
            }
          }
        }

        final int? activeIndex = nothing
            ? null
            : usesMarks
            ? activeMark?.index
            : (_column != null && _column! < count ? _column : null);
        final int walkLength = usesMarks ? markList.length : count;

        final _Reading reading = _read(
          layout: layout,
          activeIndex: activeIndex,
          activeMark: activeMark,
          mode: mode,
          options: options,
          values: values,
          labels: labels,
          visible: visible,
          colors: colors,
          names: names,
          percent: percent,
          formatValue: formatValue,
        );

        int? indexAt(Offset local) {
          if (count == 0) {
            return null;
          }

          final double length = layout.categoryLength;
          final double along = widget.horizontal
              ? local.dy - layout.plot.top
              : local.dx - layout.plot.left;

          if (along < -layout.band.step || along > length + layout.band.step) {
            return null;
          }

          final int raw = widget.inset
              ? (count <= 1 ? 0 : (along / math.max(1, length) * (count - 1)).round())
              : (along / math.max(1e-9, layout.band.step)).floor();

          return raw.clamp(0, count - 1);
        }

        ChartMark? nearestMark(Offset local) {
          ChartMark? found;
          double best = double.infinity;
          double tie = double.infinity;

          for (final ChartMark mark in markList) {
            final double toCentre = (Offset(mark.x, mark.y) - local).distance;
            final double body = mark.bodyDistance(local);

            // Inside two overlapping marks the edge distance is zero for both,
            // and the nearer centre is the one being pointed at.
            if (body <= widget.markRadius && (body < best || (body == best && toCentre < tie))) {
              best = body;
              tie = toCentre;
              found = mark;
            }
          }

          return found;
        }

        void onMove(Offset local) {
          if (_drag != null) {
            final int to = indexAt(local) ?? _drag!.$2;

            if (to != _drag!.$2) {
              setState(() => _drag = (_drag!.$1, to));
            }

            return;
          }

          if (mode == MPChartTooltipMode.none || nothing) {
            return;
          }

          if (usesMarks) {
            final ChartMark? found = nearestMark(local);
            final (int, int)? next = found == null ? null : (found.series, found.index);

            if (next != _mark) {
              setState(() => _mark = next);
            }

            return;
          }

          final int? next = indexAt(local);
          // Only `item` mode reads where the pointer is along the value axis,
          // and only it pays for a rebuild per pixel.
          final double? pointer = mode == MPChartTooltipMode.item
              ? (widget.horizontal ? local.dx : local.dy)
              : null;

          if (next != _column || pointer != _pointer) {
            setState(() {
              _column = next;
              _pointer = pointer;
            });
          }
        }

        void startDrag(Offset local) {
          final int? at = indexAt(local);

          if (at == null) {
            return;
          }

          setState(() {
            _column = null;
            _mark = null;
            _pointer = null;
            _drag = (at, at);
          });
        }

        void endDrag() {
          final (int, int)? picked = _drag;

          if (picked == null) {
            return;
          }

          final int low = math.min(picked.$1, picked.$2);
          final int high = math.max(picked.$1, picked.$2);

          setState(() => _drag = null);

          // A click is a drag of no width, and a window of one category has no
          // distance left in it for a line to have travelled.
          if (high - low + 1 >= math.max(2, widget.zoom?.min ?? 2)) {
            _setRange((from + low, from + high));
          }
        }

        void onPointerDown(PointerDownEvent event) {
          if (nothing) {
            return;
          }

          if (zoomable) {
            startDrag(event.localPosition);

            return;
          }

          if (event.kind == PointerDeviceKind.mouse) {
            return;
          }

          // A tap leaves the panel up, and a second tap on the same thing takes
          // it down: on a touch screen there is no pointer to move away.
          final int? before = _column;
          final (int, int)? beforeMark = _mark;

          onMove(event.localPosition);

          final bool same = usesMarks
              ? beforeMark != null && beforeMark == _mark
              : before != null && before == _column;

          if (same) {
            _clearActive();
          }
        }

        void goTo(int at) {
          if (walkLength == 0) {
            return;
          }

          final int bounded = at.clamp(0, walkLength - 1);

          setState(() {
            _pointer = null;

            if (usesMarks) {
              _mark = (markList[bounded].series, markList[bounded].index);
            } else {
              _column = bounded;
            }
          });
        }

        bool stepBy(int delta) {
          // The state as it is now rather than as this build saw it: two keys
          // can arrive before the next frame.
          int? current;

          if (usesMarks) {
            final int at = markList.indexWhere(
              (ChartMark mark) =>
                  _mark != null && mark.series == _mark!.$1 && mark.index == _mark!.$2,
            );

            current = at < 0 ? null : at;
          } else {
            current = _column != null && _column! < count ? _column : null;
          }
          final int target = (current ?? (delta > 0 ? -1 : walkLength)) + delta;

          goTo(target);

          return walkLength > 0 && target.clamp(0, walkLength - 1) != current;
        }

        KeyEventResult onKey(FocusNode node, KeyEvent event) {
          if (!chartKeyDown(event) || nothing) {
            return KeyEventResult.ignored;
          }

          final LogicalKeyboardKey key = event.logicalKey;

          if (key == LogicalKeyboardKey.escape) {
            // The reading first and the window second: Escape undoes the last
            // thing the reader did. With neither, the key belongs to whatever
            // the chart sits in.
            if (activeIndex != null || activeMark != null) {
              _clearActive();

              return KeyEventResult.handled;
            }

            if (windowed != null) {
              _setRange(null);

              return KeyEventResult.handled;
            }

            return KeyEventResult.ignored;
          }

          if (mode == MPChartTooltipMode.none) {
            return KeyEventResult.ignored;
          }

          // Along the category axis, whichever way round it runs.
          final LogicalKeyboardKey forward = widget.horizontal
              ? LogicalKeyboardKey.arrowDown
              : LogicalKeyboardKey.arrowRight;
          final LogicalKeyboardKey back = widget.horizontal
              ? LogicalKeyboardKey.arrowUp
              : LogicalKeyboardKey.arrowLeft;

          if (key == forward) {
            return mpArrowResult(context, moved: stepBy(1));
          }

          if (key == back) {
            return mpArrowResult(context, moved: stepBy(-1));
          }

          if (key == LogicalKeyboardKey.home) {
            goTo(0);

            return KeyEventResult.handled;
          }

          if (key == LogicalKeyboardKey.end) {
            goTo(walkLength - 1);

            return KeyEventResult.handled;
          }

          return KeyEventResult.ignored;
        }

        final bool panelOpen =
            activeIndex != null &&
            reading.items.isNotEmpty &&
            mode != MPChartTooltipMode.none &&
            _drag == null;

        final CartesianContext painted = layout.withPointer(
          hovered: _hovered,
          activeIndex: activeIndex,
          marks: markList,
          activeMark: activeMark,
        );

        Widget plot;

        if (nothing) {
          plot = ChartEmpty(fallback: emptyWord, child: widget.empty);
        } else {
          final Widget? panel = !panelOpen
              ? null
              : options.builder != null
              ? ExcludeSemantics(
                  child: IgnorePointer(
                    child: options.builder!(
                      MPChartTooltipContext(
                        index: activeIndex,
                        category: activeIndex < labels.length ? labels[activeIndex] : activeIndex,
                        items: reading.items,
                        total: reading.total,
                      ),
                    ),
                  ),
                )
              : ChartTooltipPanel(
                  heading: reading.heading,
                  items: reading.items,
                  total: reading.total,
                  totalLabel: words['total'],
                  size: size,
                );

          plot = Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: onPointerDown,
            onPointerMove: (PointerMoveEvent event) => onMove(event.localPosition),
            onPointerHover: (PointerHoverEvent event) => onMove(event.localPosition),
            onPointerUp: (PointerUpEvent event) => endDrag(),
            onPointerCancel: (PointerCancelEvent event) {
              if (_drag != null) {
                setState(() => _drag = null);
              }
            },
            child: MouseRegion(
              onExit: (PointerExitEvent event) {
                // A drag that leaves the plot keeps its pointer, and is
                // committed on release rather than here.
                if (_drag == null) {
                  _clearActive();
                }
              },
              child: SizedBox(
                width: width,
                height: boxHeight,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: <Widget>[
                    CustomPaint(
                      size: Size(width, boxHeight),
                      painter: _CartesianPainter(
                        context: painted,
                        frame: frame,
                        valueAxis: valueAxis,
                        categoryAxis: categoryAxis,
                        crosshair:
                            activeIndex != null &&
                            !usesMarks &&
                            mode == MPChartTooltipMode.column &&
                            options.crosshair,
                        drag: _drag,
                        paintMarks: widget.paint,
                        direction: Directionality.maybeOf(context) ?? TextDirection.ltr,
                      ),
                    ),
                    if (panel != null)
                      Positioned.fill(
                        child: ChartTooltipPlacement(
                          anchor: reading.anchor,
                          flip: reading.flip,
                          child: panel,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        }

        return ChartShell(
          name: widget.label ?? words['label']!,
          description: describe(),
          interactive: !nothing,
          height: boxHeight,
          plot: plot,
          status: mode == MPChartTooltipMode.none
              ? ''
              : chartStatusText(
                  heading: reading.heading,
                  items: reading.items,
                  total: reading.total,
                  totalLabel: words['total'],
                ),
          focusNode: widget.focusNode,
          autofocus: widget.autofocus,
          onKeyEvent: onKey,
          onFocusChange: (bool has) {
            if (!has) {
              _clearActive();
            }
          },
          overlay: windowed == null || nothing
              ? null
              : _ShowAll(label: words['showAll']!, onPressed: () => _setRange(null)),
          legend: legend,
          legendSide: legendOptions.side,
          legendWidth: legendWidth > 0 ? legendWidth : null,
        );
      },
    );
  }

  /// How wide a legend down the side is: its widest entry, held under 200.
  double _legendWidth(List<String?> names, double fontSize) {
    double widest = 0;

    for (int i = 0; i < names.length; i += 1) {
      widest = math.max(widest, textWidth(names[i] ?? '${i + 1}', fontSize));
    }

    return math.min(200, 10 + 6 + widest + 8);
  }

  /// The plot box and everything measured on the way to it.
  _Frame _layOut({
    required double width,
    required double boxHeight,
    required MPColorScheme scheme,
    required MPSize size,
    required double fontSize,
    required TextStyle textStyle,
    required List<List<ChartValue>> values,
    required List<MPChartCategory> labels,
    required List<bool> visible,
    required List<Color> colors,
    required ValueScale scale,
    required ValueScale? categoryScale,
    required List<String> tickTexts,
    required List<String> rawCategoryTexts,
    required MPChartAxis valueAxis,
    required MPChartAxis categoryAxis,
    required int count,
    required String Function(double value) formatValue,
  }) {
    final bool horizontal = widget.horizontal;
    double widest(List<String> texts) => texts.fold<double>(0, (double most, String text) {
      return math.max(most, textWidth(text, fontSize));
    });

    final double widestTick = widest(tickTexts);
    final double axisNameBand = fontSize + 6;
    final double valueBand = valueAxis.hidden
        ? 0
        : widestTick + 10 + (valueAxis.label != null ? axisNameBand : 0);

    // How much room one category label has: a column width on a horizontal
    // chart, a slot along the bottom on an upright one.
    final double slot = (width - (horizontal ? 0 : valueBand) - 16) / math.max(1, count);

    // The axis along the bottom, the only one a turn is any use to.
    final MPChartAxis bottomAxis = horizontal ? valueAxis : categoryAxis;
    final List<String> bottomTexts = horizontal ? tickTexts : rawCategoryTexts;

    final double leftEstimate = horizontal
        ? (categoryAxis.hidden
              ? 0
              : rawCategoryTexts.fold<double>(0, (double most, String text) {
                      return math.max(most, math.min(150, textWidth(text, fontSize)));
                    }) +
                    10 +
                    (categoryAxis.label != null ? axisNameBand : 0))
        : valueBand;
    final double rightEstimate = horizontal
        ? 12 + widget.headroom
        : math.max(8, widest(bottomTexts) / 2);
    final double bottomSlot =
        (width - leftEstimate - rightEstimate - widget.markInset * 2) /
        math.max(1, bottomTexts.length);

    /* `auto` turns names and leaves rulers alone: a value axis' labels are
       samples of a continuum, and showing every nth of them loses nothing. */
    final bool ruler = horizontal || categoryScale != null;
    final double turn = bottomAxis.hidden
        ? 0
        : tickTurn(
            bottomAxis.tickLabels ?? (ruler ? MPChartTickLabels.truncate : MPChartTickLabels.auto),
            bottomTexts,
            fontSize,
            bottomSlot,
          );

    // Half the box and never more than 120px: a name is worth a band, but not
    // the whole picture.
    final double turnCap = math.min(120, boxHeight * 0.5);

    double turnRoom(int index) {
      return math.min(
        turnedRoom(turn, turnCap, fontSize),
        turn >= 90
            ? double.infinity
            : (leftEstimate + bottomSlot * (index + (widget.inset ? 0 : 0.5))) /
                  math.cos(turn * math.pi / 180),
      );
    }

    /* Cut a long name to the room it has rather than dropping labels until the
       rest fit. A tick is never cut while it is flat: half of `12.4K` is not a
       smaller number, it is a wrong one. */
    final List<String> categoryTexts = turn > 0 && !horizontal
        ? <String>[
            for (int i = 0; i < rawCategoryTexts.length; i += 1)
              truncateLabel(rawCategoryTexts[i], turnRoom(i), fontSize),
          ]
        : categoryScale != null
        ? rawCategoryTexts
        : horizontal || slot - 6 >= fontSize * 2.4
        ? <String>[
            for (final String text in rawCategoryTexts)
              truncateLabel(text, horizontal ? 150 : slot - 6, fontSize),
          ]
        : rawCategoryTexts;

    final double widestCategory = widest(categoryTexts);
    final double bottomTickBand = bottomAxis.hidden
        ? 0
        : turn > 0
        ? 8 +
              math.min(
                turnCap,
                turnedBand(turn, horizontal ? widestTick : widestCategory, fontSize),
              ) +
              4
        : fontSize + 12;

    final double leftBand = horizontal
        ? (categoryAxis.hidden
              ? 0
              : widestCategory + 10 + (categoryAxis.label != null ? axisNameBand : 0))
        : valueBand;
    final double bottomBand =
        bottomTickBand + (bottomAxis.hidden || bottomAxis.label == null ? 0 : axisNameBand);

    // `thickness` belongs to whichever axis is on that edge.
    final double left = (horizontal ? categoryAxis : valueAxis).thickness ?? leftBand;
    final double bottom = bottomAxis.thickness ?? bottomBand;

    final double rightPad =
        (horizontal || turn > 0
            ? 12 + (horizontal ? widget.headroom : 0)
            : math.max(8, widestCategory / 2)) +
        widget.markInset;
    final double topPad =
        chartMarkerRadius[size]! + 4 + (horizontal ? 0 : widget.headroom) + widget.markInset;

    final Rect plot = Rect.fromLTWH(
      left + widget.markInset,
      topPad,
      math.max(0, width - left - widget.markInset - rightPad),
      math.max(0, boxHeight - topPad - bottom - widget.markInset),
    );

    // Bars divide the axis into `count` slots; lines into `count - 1` gaps.
    final BandScale band = BandScale(
      widget.inset ? math.max(1, count - 1) : count,
      horizontal ? plot.height : plot.width,
      widget.bandRatio,
    );

    final CartesianContext context = CartesianContext(
      plot: plot,
      values: values,
      visible: visible,
      colors: colors,
      scheme: scheme,
      labelColor: widget.labelColor,
      scale: scale,
      band: band,
      horizontal: horizontal,
      inset: widget.inset,
      count: count,
      categoryScale: categoryScale,
      categories: labels,
      format: formatValue,
      size: size,
      fontSize: fontSize,
      textStyle: textStyle,
    );

    /* The references in pixels, each drawn perpendicular to the axis it was
       given to. The category axis is asked only when it has a scale. */
    List<_ReferenceMark> marksOf(
      List<MPChartReference> references,
      double Function(double value) px, {
      required bool upright,
    }) {
      return <_ReferenceMark>[
        for (final MPChartReference one in references)
          if (toNumber(one.value) != null)
            _ReferenceMark(
              at: px(toNumber(one.value)!),
              to: one.to == null || toNumber(one.to) == null ? null : px(toNumber(one.to)!),
              upright: upright,
              label: one.label,
              // Never a palette slot: a reference is not a series.
              color: chartColorOf(scheme, one.color) ?? scheme.outline,
              dashed: one.dashed,
            ),
      ];
    }

    return _Frame(
      context: context,
      tickTexts: tickTexts,
      categoryTexts: categoryTexts,
      turn: turn,
      tickBand: bottomTickBand,
      references: <_ReferenceMark>[
        ...marksOf(valueAxis.references, context.valuePx, upright: horizontal),
        if (categoryScale != null)
          ...marksOf(categoryAxis.references, context.categoryValuePx, upright: !horizontal),
      ],
    );
  }

  /// What the pointer uncovers: the rows, the heading, the total and where the
  /// panel hangs.
  _Reading _read({
    required CartesianContext layout,
    required int? activeIndex,
    required ChartMark? activeMark,
    required MPChartTooltipMode mode,
    required MPChartTooltip options,
    required List<List<ChartValue>> values,
    required List<MPChartCategory> labels,
    required List<bool> visible,
    required List<Color> colors,
    required MPDateNames names,
    required bool percent,
    required String Function(double value) formatValue,
  }) {
    if (activeIndex == null) {
      return const _Reading(items: <MPChartTooltipItem>[], anchor: Offset.zero, flip: false);
    }

    // What the column adds up to on a percent stack: the visible positives,
    // the same whole the marks were drawn against.
    double columnTotal = 0;

    if (percent) {
      for (int i = 0; i < values.length; i += 1) {
        final double? value = visible[i] && activeIndex < values[i].length
            ? values[i][activeIndex].value
            : null;

        if (value != null && value > 0) {
          columnTotal += value;
        }
      }
    }

    final List<MPChartTooltipItem> column = <MPChartTooltipItem>[];

    for (int i = 0; i < widget.series.length; i += 1) {
      // A mark names its own series, so there is no column to narrow.
      if (!visible[i] || (activeMark != null && activeMark.series != i)) {
        continue;
      }

      final ChartValue? value = activeIndex < values[i].length ? values[i][activeIndex] : null;

      if (value == null || value.value == null) {
        continue;
      }

      column.add(
        MPChartTooltipItem(
          seriesIndex: i,
          name: widget.series[i].name,
          color: chartColorOf(layout.scheme, value.color) ?? colors[i],
          value: value.value,
          // On a percent stack, both: the share is what the picture shows and
          // the value is what the reader came for.
          formatted: percent && columnTotal > 0 && value.value! > 0
              ? '${formatValue(value.value!)} · ${formatShare(value.value! / columnTotal)}'
              : formatValue(value.value!),
          label: value.label,
        ),
      );
    }

    final ({String heading, List<MPChartTooltipItem> items})? supplied =
        activeMark != null && widget.markTooltip != null ? widget.markTooltip!(activeMark) : null;

    // `item` is the column narrowed to the one series nearest the pointer
    // along the value axis.
    List<MPChartTooltipItem> items = supplied?.items ?? column;

    if (supplied == null &&
        mode == MPChartTooltipMode.item &&
        column.length > 1 &&
        _pointer != null) {
      items = <MPChartTooltipItem>[
        column.reduce((MPChartTooltipItem nearest, MPChartTooltipItem item) {
          return (layout.valuePx(item.value ?? 0) - _pointer!).abs() <
                  (layout.valuePx(nearest.value ?? 0) - _pointer!).abs()
              ? item
              : nearest;
        }),
      ];
    }

    // Sorting must not move the panel, so the anchor below reads [items] in
    // the order they were built.
    final List<MPChartTooltipItem> shownItems = options.sort == MPChartTooltipSort.value
        ? (List<MPChartTooltipItem>.of(items)..sort((MPChartTooltipItem a, MPChartTooltipItem b) {
            return (b.value ?? double.negativeInfinity).compareTo(
              a.value ?? double.negativeInfinity,
            );
          }))
        : items;

    // A stack and nothing else: its whole point is the height of the column.
    final bool showTotal = options.total ?? widget.stacked == MPChartStack.stacked;
    final String? total = !showTotal || supplied != null || items.length < 2
        ? null
        : formatValue(
            items.fold<double>(0, (double sum, MPChartTooltipItem item) {
              return sum + (item.value ?? 0);
            }),
          );

    final String heading = supplied != null
        ? supplied.heading
        : activeMark != null
        ? formatCategory(
            values[activeMark.series][activeMark.index].x ??
                (widget.categories != null && activeMark.index < widget.categories!.length
                    ? widget.categories![activeMark.index]
                    : activeMark.index),
            names,
          )
        : formatCategory(activeIndex < labels.length ? labels[activeIndex] : activeIndex, names);

    final Rect plot = layout.plot;
    final double firstValue = items.isEmpty ? 0 : (items.first.value ?? 0);
    final Offset anchor = activeMark != null
        ? Offset(activeMark.x, activeMark.y)
        : widget.horizontal
        ? Offset(layout.valuePx(firstValue), plot.top + layout.categoryPx(activeIndex))
        : Offset(plot.left + layout.categoryPx(activeIndex), plot.top + plot.height / 2);
    final bool flip = activeMark != null
        ? (activeMark.x - plot.left) / math.max(1, plot.width) > 0.6
        : (widget.horizontal
                  ? layout.scale.fraction(firstValue)
                  : layout.categoryPx(activeIndex) / math.max(1, layout.categoryLength)) >
              0.6;

    return _Reading(heading: heading, items: shownItems, total: total, anchor: anchor, flip: flip);
  }
}

/// Everything measured on the way to the plot box.
class _Frame {
  const _Frame({
    required this.context,
    required this.tickTexts,
    required this.categoryTexts,
    required this.turn,
    required this.tickBand,
    required this.references,
  });

  final CartesianContext context;
  final List<String> tickTexts;
  final List<String> categoryTexts;
  final double turn;
  final double tickBand;
  final List<_ReferenceMark> references;
}

/// What the pointer uncovers.
class _Reading {
  const _Reading({
    required this.items,
    required this.anchor,
    required this.flip,
    this.heading,
    this.total,
  });

  final String? heading;
  final List<MPChartTooltipItem> items;
  final String? total;
  final Offset anchor;
  final bool flip;
}

/// One reference, already in pixels and already pointed the right way.
class _ReferenceMark {
  const _ReferenceMark({
    required this.at,
    required this.to,
    required this.upright,
    required this.label,
    required this.color,
    required this.dashed,
  });

  final double at;
  final double? to;
  final bool upright;
  final String? label;
  final Color color;
  final bool dashed;
}

/// The control that puts every category back, over the corner of the plot.
class _ShowAll extends StatelessWidget {
  const _ShowAll({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: theme.colors.secondary, borderRadius: radius)
                : null,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Text(label, style: theme.typescale.labelMedium.style(theme.colors.primary)),
            ),
          ),
        );
      },
    );
  }
}

/// The grid, the rules, the labels, the references and the crosshair, with
/// the marks drawn in the middle of them.
class _CartesianPainter extends CustomPainter {
  const _CartesianPainter({
    required this.context,
    required this.frame,
    required this.valueAxis,
    required this.categoryAxis,
    required this.crosshair,
    required this.drag,
    required this.paintMarks,
    required this.direction,
  });

  final CartesianContext context;
  final _Frame frame;
  final MPChartAxis valueAxis;
  final MPChartAxis categoryAxis;
  final bool crosshair;
  final (int, int)? drag;
  final CartesianMarkPainter paintMarks;
  final TextDirection direction;

  Paint _stroke(Color color) => Paint()
    ..color = color
    ..strokeWidth = 1
    ..style = PaintingStyle.stroke;

  void _text(
    Canvas canvas,
    String text,
    Offset at, {
    ChartAnchor anchor = ChartAnchor.start,
    bool central = false,
    double turn = 0,
    Color? color,
  }) {
    paintChartText(
      canvas,
      text,
      at,
      style: context.textStyle.copyWith(color: color ?? context.scheme.onSurfaceVariant),
      anchor: anchor,
      central: central,
      turn: turn,
      direction: direction,
    );
  }

  /// One label along the bottom: flat and centred a line under the axis, or
  /// turned about its end so it runs up towards the tick it belongs to.
  void _bottomTick(Canvas canvas, String text, double along, double top) {
    final double turn = frame.turn;

    if (turn <= 0) {
      _text(canvas, text, Offset(along, top + context.fontSize + 6), anchor: ChartAnchor.middle);
    } else {
      _text(
        canvas,
        text,
        Offset(along, top + 8),
        anchor: ChartAnchor.end,
        central: true,
        turn: turn,
      );
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    final Rect plot = context.plot;
    final MPColorScheme scheme = context.scheme;
    final Paint grid = _stroke(scheme.outlineVariant);
    final Paint rule = _stroke(scheme.outline);

    _paintAxes(canvas, plot, grid, rule);
    _paintReferences(canvas, plot, band: true);

    // No crosshair on a chart with marks: it says "these numbers all belong to
    // this column", and where there is no column it is a line through one dot.
    if (crosshair && context.activeIndex != null) {
      final double along = context.categoryPx(context.activeIndex!);

      if (context.horizontal) {
        canvas.drawLine(
          Offset(plot.left, plot.top + along),
          Offset(plot.right, plot.top + along),
          rule,
        );
      } else {
        canvas.drawLine(
          Offset(plot.left + along, plot.top),
          Offset(plot.left + along, plot.bottom),
          rule,
        );
      }
    }

    paintMarks(canvas, size, context);

    // A band is a region the marks stand in, so it goes under them; a line is
    // a level they are measured against, so it goes over them.
    _paintReferences(canvas, plot, band: false);

    if (drag != null) {
      final List<double> edges = <double>[
        (context.horizontal ? plot.top : plot.left) + context.categoryPx(drag!.$1),
        (context.horizontal ? plot.top : plot.left) + context.categoryPx(drag!.$2),
      ]..sort();
      final double thickness = math.max(context.band.step, 1);
      final double low = edges.first - thickness / 2;
      final double extent = edges.last - edges.first + thickness;
      final Rect box = context.horizontal
          ? Rect.fromLTWH(plot.left, low, plot.width, extent)
          : Rect.fromLTWH(low, plot.top, extent, plot.height);

      canvas
        ..drawRect(box, Paint()..color = scheme.primary.withValues(alpha: 0.12))
        ..drawRect(box, _stroke(scheme.primary));
    }
  }

  void _paintAxes(Canvas canvas, Rect plot, Paint grid, Paint rule) {
    final bool horizontal = context.horizontal;
    final double fontSize = context.fontSize;
    final ValueScale scale = context.scale;
    final ValueScale? categoryScale = context.categoryScale;
    final List<String> tickTexts = frame.tickTexts;
    final List<String> categoryTexts = frame.categoryTexts;
    final double turn = frame.turn;
    final bool valueGrid = valueAxis.grid != false && !valueAxis.hidden;
    // Graph paper only where there is no column to be in: a plot with two
    // value axes, where reading a mark's x off the picture is half the point.
    final bool categoryGrid = categoryAxis.hidden
        ? false
        : (categoryAxis.grid ?? categoryScale != null);

    double categoryAlong(int index) => categoryScale != null
        ? context.categoryValuePx(categoryScale.ticks[index])
        : (horizontal ? plot.top : plot.left) + context.categoryPx(index);

    double widest(List<String> texts) => texts.fold<double>(1, (double most, String text) {
      return math.max(most, textWidth(text, fontSize));
    });

    double bottomRoom(List<String> texts, double air) =>
        turn > 0 ? turnedStep(turn, fontSize) : widest(texts) + air;

    final int categoryStride = tickStride(
      categoryTexts.length,
      horizontal ? plot.height : plot.width,
      horizontal ? fontSize * 1.8 : bottomRoom(categoryTexts, 12),
    );
    final int valueStride = tickStride(
      scale.ticks.length,
      horizontal ? plot.width : plot.height,
      horizontal ? bottomRoom(tickTexts, 16) : fontSize * 2,
    );

    final double categoryStep = categoryTexts.length > 1
        ? (categoryAlong(1) - categoryAlong(0)).abs()
        : plot.width;
    final double valueStep = scale.ticks.length > 1
        ? (context.valuePx(scale.ticks[1]) - context.valuePx(scale.ticks[0])).abs()
        : plot.height;

    final bool lastCategory = fitsLast(
      categoryTexts.length,
      categoryStride,
      categoryStep,
      horizontal
          ? fontSize * 1.8
          : turn > 0
          ? turnedStep(turn, fontSize)
          : textWidth(categoryTexts.isEmpty ? '' : categoryTexts.last, fontSize),
    );
    final bool lastValue = fitsLast(
      scale.ticks.length,
      valueStride,
      valueStep,
      horizontal
          ? (turn > 0
                ? turnedStep(turn, fontSize)
                : textWidth(tickTexts.isEmpty ? '' : tickTexts.last, fontSize))
          : fontSize * 1.6,
    );

    for (int index = 0; index < scale.ticks.length; index += 1) {
      final double tick = scale.ticks[index];
      final double along = context.valuePx(tick);
      // Zero is where a value's sign changes, so it is a rule rather than a
      // gridline.
      final bool isZero = tick.abs() < 1e-9 && scale.min < 0;

      if (valueGrid) {
        canvas.drawLine(
          horizontal ? Offset(along, plot.top) : Offset(plot.left, along),
          horizontal ? Offset(along, plot.bottom) : Offset(plot.right, along),
          isZero ? rule : grid,
        );
      }

      final bool written =
          !valueAxis.hidden &&
          showsTick(index, scale.ticks.length, valueStride, roomForLast: lastValue);

      if (written && index < tickTexts.length) {
        if (horizontal) {
          _bottomTick(canvas, tickTexts[index], along, plot.bottom);
        } else {
          _text(
            canvas,
            tickTexts[index],
            Offset(plot.left - 8, along),
            anchor: ChartAnchor.end,
            central: true,
          );
        }
      }
    }

    for (int index = 0; index < categoryTexts.length; index += 1) {
      final bool written =
          !categoryAxis.hidden &&
          showsTick(index, categoryTexts.length, categoryStride, roomForLast: lastCategory);

      if (!categoryGrid && !written) {
        continue;
      }

      final double along = categoryAlong(index);

      if (categoryGrid) {
        canvas.drawLine(
          horizontal ? Offset(plot.left, along) : Offset(along, plot.top),
          horizontal ? Offset(plot.right, along) : Offset(along, plot.bottom),
          grid,
        );
      }

      if (written) {
        if (horizontal) {
          _text(
            canvas,
            categoryTexts[index],
            Offset(plot.left - 8, along),
            anchor: ChartAnchor.end,
            central: true,
          );
        } else {
          _bottomTick(canvas, categoryTexts[index], along, plot.bottom);
        }
      }
    }

    // The baseline the marks stand on, whether or not zero is a tick.
    final double zero = context.zeroPx;

    canvas.drawLine(
      horizontal ? Offset(zero, plot.top) : Offset(plot.left, zero),
      horizontal ? Offset(zero, plot.bottom) : Offset(plot.right, zero),
      rule,
    );

    // The axis names. The value axis' is turned to read bottom to top, the one
    // rotation a chart is allowed.
    final double middleY = plot.top + plot.height / 2;
    final double underTicks = plot.bottom + frame.tickBand + fontSize;

    if (valueAxis.label != null && !valueAxis.hidden) {
      if (horizontal) {
        _text(
          canvas,
          valueAxis.label!,
          Offset(plot.left + plot.width / 2, underTicks),
          anchor: ChartAnchor.middle,
        );
      } else {
        _text(
          canvas,
          valueAxis.label!,
          Offset(fontSize, middleY),
          anchor: ChartAnchor.middle,
          central: true,
          turn: 90,
        );
      }
    }

    if (categoryAxis.label != null && !categoryAxis.hidden) {
      if (horizontal) {
        _text(
          canvas,
          categoryAxis.label!,
          Offset(fontSize, middleY),
          anchor: ChartAnchor.middle,
          central: true,
          turn: 90,
        );
      } else {
        _text(
          canvas,
          categoryAxis.label!,
          Offset(plot.left + plot.width / 2, underTicks),
          anchor: ChartAnchor.middle,
        );
      }
    }
  }

  void _paintReferences(Canvas canvas, Rect plot, {required bool band}) {
    for (final _ReferenceMark mark in frame.references) {
      Rect box(double from, double to) => mark.upright
          ? Rect.fromLTRB(math.min(from, to), plot.top, math.max(from, to), plot.bottom)
          : Rect.fromLTRB(plot.left, math.min(from, to), plot.right, math.max(from, to));

      if (band) {
        if (mark.to != null) {
          canvas.drawRect(
            box(mark.at, mark.to!),
            Paint()..color = mark.color.withValues(alpha: 0.12),
          );
        }

        continue;
      }

      // A band is bounded by both of its edges.
      for (final double edge in <double>[mark.at, ?mark.to]) {
        final Path line = Path()
          ..moveTo(mark.upright ? edge : plot.left, mark.upright ? plot.top : edge)
          ..lineTo(mark.upright ? edge : plot.right, mark.upright ? plot.bottom : edge);

        canvas.drawPath(mark.dashed ? dashedPath(line, 4, 3) : line, _stroke(mark.color));
      }

      // The name, at the end of the line rather than its middle, where the
      // data is.
      if (mark.label != null && mark.label!.isNotEmpty) {
        _text(
          canvas,
          mark.label!,
          mark.upright
              ? Offset(mark.at + 4, plot.top + context.fontSize)
              : Offset(plot.right, mark.at - 4),
          anchor: mark.upright ? ChartAnchor.start : ChartAnchor.end,
          color: mark.color,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_CartesianPainter oldDelegate) => true;
}
