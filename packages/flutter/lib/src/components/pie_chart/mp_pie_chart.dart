/// Parts of a whole, at a glance.
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

/// How the ring is drawn.
enum MPPieChartShape {
  /// A filled disc.
  pie,

  /// A ring, with room in the middle for the total.
  donut,

  /// Half a ring, opened along the bottom, for a tile wider than it is tall.
  semi,
}

/// How much of the radius a donut's hole takes, before the caller says.
const double _hole = 0.62;

/// And the widest hole a ring can have and still be one.
const double _maxHole = 0.9;

/// How far off the outer edge the pointer still counts as on a slice.
const double _reach = 8;

/// Parts of a whole, at a glance.
///
/// ```dart
/// MPPieChart(
///   categories: const <String>['Search', 'Direct', 'Social'],
///   data: const <num>[52, 31, 17],
/// )
/// ```
///
/// The narrowest chart here and the easiest one to misuse. An angle is a poor
/// thing to compare, so a pie answers exactly one question — **is one of these
/// most of it?** Anything finer, and anything past about six slices, is an
/// `MPBarChart`.
///
/// ## What it does with a negative
///
/// Leaves it out. A negative has no share of a whole, and every way of drawing
/// one is a lie. The words behind the picture still carry the number.
///
/// ## Colour follows the slice
///
/// A slice takes its palette slot from its place in [data], never from its
/// size, so a chart that is refiltered keeps every category the colour it had.
class MPPieChart extends StatefulWidget {
  /// Creates a pie chart.
  const MPPieChart({
    required this.data,
    this.categories,
    this.shape = MPPieChartShape.pie,
    this.startAngle = 0,
    this.hole = _hole,
    this.gap = chartMarkGap,
    this.center,
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

  /// The slices: numbers, or points carrying their own name and colour. One
  /// series rather than a list of them, because the slices are the entities.
  final List<MPChartDatum> data;

  /// What each slice is called. Points may carry their own `x` instead.
  final List<MPChartCategory>? categories;

  /// A disc, a ring, or half a ring.
  final MPPieChartShape shape;

  /// Where the first slice starts, in degrees clockwise from twelve o'clock.
  /// Ignored by [MPPieChartShape.semi].
  final double startAngle;

  /// How much of the radius the hole takes, from `0` to `0.9`. Read by the
  /// donut and the semicircle only.
  final double hole;

  /// How much page shows between two slices, in pixels, drawn as a stroke in
  /// the surface's colour so every slice keeps the angle its share earned.
  final double gap;

  /// What goes in the hole: the total, or the one figure the chart is about.
  final Widget? center;

  /// Writes each slice's **share** on it, where the slice is wide enough to
  /// hold it. Only [MPChartValueLabels.all] writes anything: a slice has no
  /// "last" or "extreme".
  final MPChartValueLabels valueLabels;

  /// How tall the drawing is.
  final double? height;

  /// How numbers are written everywhere they appear.
  final String Function(double value)? format;

  /// Which language the chart's own words are in.
  final String? locale;

  /// What the chart is a chart **of**.
  final String? label;

  /// The legend. Drawn from two slices up.
  final MPChartLegend? legend;

  /// What the pointer uncovers.
  final MPChartTooltip? tooltip;

  /// What to draw when there is nothing to draw.
  final Widget? empty;

  /// What ink the legend's names wear.
  final MPChartLabelColor labelColor;

  /// The size ladder rung. [MPSize.md] unless an `MPConfigProvider` says
  /// otherwise.
  final MPSize? size;

  /// The words dates are written with, for slices named by a date.
  final MPDateNames? dateNames;

  /// Drives the plot's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the chart is inserted.
  final bool autofocus;

  @override
  State<MPPieChart> createState() => _MPPieChartState();
}

/// One slice's place on the ring, in the clock convention.
class _Arc {
  const _Arc(this.from, this.to, this.share);

  final double from;
  final double to;
  final double share;
}

class _MPPieChartState extends State<MPPieChart> {
  final Set<int> _hidden = <int>{};
  int? _hovered;
  int? _active;

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
    final MPChartTooltip options = widget.tooltip ?? const MPChartTooltip();
    final MPChartLegend legendOptions = widget.legend ?? const MPChartLegend();
    final bool silent = options.mode == MPChartTooltipMode.none;
    final double font = chartFontSize[size]!;
    final double boxHeight = widget.height ?? chartPlotHeight[size]!;

    String formatValue(double value) => formatStatistic(value, widget.format);

    final List<ChartValue> slices = <ChartValue>[
      for (final Object? datum in widget.data) toValue(datum),
    ];
    final List<String> sliceNames = <String>[
      for (int i = 0; i < slices.length; i += 1)
        formatCategory(categoryAt(i, widget.categories, <List<ChartValue>>[slices]), names),
    ];
    final List<Color> colors = <Color>[
      for (int i = 0; i < slices.length; i += 1)
        chartColorOf(scheme, slices[i].color) ?? scheme.chart[i % chartSlots],
    ];
    final List<bool> visible = <bool>[
      for (int i = 0; i < slices.length; i += 1) !_hidden.contains(i),
    ];

    // A negative is left out rather than drawn: it has no share of a whole.
    final List<double> shares = <double>[
      for (int i = 0; i < slices.length; i += 1)
        visible[i] && slices[i].value != null && slices[i].value! > 0 ? slices[i].value! : 0,
    ];
    final double total = shares.fold<double>(0, (double sum, double one) => sum + one);
    final bool nothing = total <= 0;

    final int? active = _active != null && _active! < shares.length && shares[_active!] > 0
        ? _active
        : null;

    String percent(double share) => total > 0 ? formatPercent(share / total) : '';

    final List<MPChartTooltipItem> items = active == null
        ? const <MPChartTooltipItem>[]
        : <MPChartTooltipItem>[
            // One row, with no name: a slice *is* the category, and the heading
            // already says it.
            MPChartTooltipItem(
              seriesIndex: active,
              color: colors[active],
              value: shares[active],
              formatted: '${formatValue(shares[active])} · ${percent(shares[active])}',
              label: slices[active].label,
            ),
          ];
    final String? heading = active == null ? null : sliceNames[active];

    final bool showLegend = legendOptions.visible ?? slices.length > 1;
    final bool beside = legendOptions.side == MPSide.left || legendOptions.side == MPSide.right;
    final double legendWidth = !showLegend || !beside
        ? 0
        : math.min(
            200,
            sliceNames.fold<double>(0, (double most, String name) {
                  return math.max(most, textWidth(name, font));
                }) +
                24,
          );

    final Widget? legend = !showLegend
        ? null
        : ChartLegend(
            names: sliceNames,
            colors: colors,
            options: legendOptions,
            visible: visible,
            hovered: _hovered,
            size: size,
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
          );

    final String description = nothing
        ? ''
        : chartTableText(
            rows: sliceNames,
            columns: null,
            cells: <List<String>>[
              for (final ChartValue slice in slices)
                <String>[
                  slice.label ?? (slice.value == null ? emptyWord : formatValue(slice.value!)),
                ],
            ],
          );

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double width = math.max(
          0,
          chartWidthOf(context, constraints) - (legendWidth > 0 ? legendWidth + 12 : 0),
        );
        final bool semi = widget.shape == MPPieChartShape.semi;
        final double cx = width / 2;
        // A semicircle is drawn from its base, so its centre sits low and the
        // radius may take the whole height.
        final double cy = semi ? boxHeight - font - 4 : boxHeight / 2;
        final double outer = math.max(
          0,
          semi ? math.min(width / 2, boxHeight - font - 8) - 2 : math.min(width, boxHeight) / 2 - 2,
        );
        final double inner = widget.shape == MPPieChartShape.pie
            ? 0
            : outer * widget.hole.clamp(0, _maxHole);
        final double turn = semi ? math.pi : math.pi * 2;
        final double first = semi ? -math.pi / 2 : widget.startAngle * math.pi / 180;

        double angle = first;
        final List<_Arc> arcs = <_Arc>[
          for (final double share in shares)
            () {
              final double from = angle;

              angle += total > 0 ? share / total * turn : 0;

              return _Arc(from, angle, share);
            }(),
        ];

        int? sliceAt(Offset local) {
          if (total <= 0) {
            return null;
          }

          final double dx = local.dx - cx;
          final double dy = local.dy - cy;
          final double radius = math.sqrt(dx * dx + dy * dy);

          if (radius > outer + _reach || radius < inner) {
            return null;
          }

          // Back into the clock convention, and wrapped into the turn the chart
          // occupies so a slice crossing twelve o'clock still matches.
          final double at = math.atan2(dx, -dy);

          for (int i = 0; i < arcs.length; i += 1) {
            if (arcs[i].share <= 0) {
              continue;
            }

            final double offset = (at - arcs[i].from + math.pi * 4) % (math.pi * 2);

            if (offset < arcs[i].to - arcs[i].from) {
              return i;
            }
          }

          return null;
        }

        void onMove(Offset local) {
          if (silent || nothing) {
            return;
          }

          final int? next = sliceAt(local);

          if (next != _active) {
            setState(() => _active = next);
          }
        }

        void walk(int delta) {
          final List<int> drawn = <int>[
            for (int i = 0; i < arcs.length; i += 1)
              if (arcs[i].share > 0) i,
          ];

          if (drawn.isEmpty) {
            return;
          }

          // The state as it is now rather than as this build saw it: two keys
          // can arrive before the next frame.
          final int? now = _active != null && drawn.contains(_active) ? _active : null;
          final int at = now == null ? (delta > 0 ? -1 : 0) : drawn.indexOf(now);

          setState(() => _active = drawn[(at + delta + drawn.length) % drawn.length]);
        }

        KeyEventResult onKey(FocusNode node, KeyEvent event) {
          if (!chartKeyDown(event) || nothing || silent) {
            return KeyEventResult.ignored;
          }

          final LogicalKeyboardKey key = event.logicalKey;

          if (key == LogicalKeyboardKey.arrowRight || key == LogicalKeyboardKey.arrowDown) {
            walk(1);
          } else if (key == LogicalKeyboardKey.arrowLeft || key == LogicalKeyboardKey.arrowUp) {
            walk(-1);
          } else if (key == LogicalKeyboardKey.escape && active != null) {
            _clear();
          } else {
            return KeyEventResult.ignored;
          }

          return KeyEventResult.handled;
        }

        Widget plot;

        if (nothing) {
          plot = ChartEmpty(fallback: emptyWord, child: widget.empty);
        } else {
          final _Arc? arc = active == null ? null : arcs[active];
          final Offset? anchor = arc == null
              ? null
              : polarPoint(cx, cy, outer * 0.75, (arc.from + arc.to) / 2);
          final double hollow = inner;

          plot = Listener(
            behavior: HitTestBehavior.opaque,
            onPointerHover: (PointerHoverEvent event) => onMove(event.localPosition),
            onPointerMove: (PointerMoveEvent event) => onMove(event.localPosition),
            onPointerDown: (PointerDownEvent event) {
              if (event.kind == PointerDeviceKind.mouse) {
                return;
              }

              // A tap leaves the panel up; a second tap on the same slice takes
              // it down.
              final int? before = _active;

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
                      painter: _PiePainter(
                        arcs: arcs,
                        colors: colors,
                        cx: cx,
                        cy: cy,
                        outer: outer,
                        inner: inner,
                        gap: widget.gap,
                        active: active,
                        hovered: _hovered,
                        surface: scheme.surface,
                        labels: widget.valueLabels == MPChartValueLabels.all
                            ? <String>[for (final _Arc one in arcs) percent(one.share)]
                            : null,
                        labelStyle: DefaultTextStyle.of(context).style.copyWith(
                          fontSize: font,
                          height: 1,
                          color: scheme.onSurface,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ),
                    if (widget.center != null && widget.shape != MPPieChartShape.pie)
                      Positioned(
                        left: cx - hollow,
                        top: cy - hollow,
                        width: hollow * 2,
                        height: semi ? hollow : hollow * 2,
                        child: IgnorePointer(child: Center(child: widget.center)),
                      ),
                    if (anchor != null && items.isNotEmpty && !silent)
                      Positioned.fill(
                        child: ChartTooltipPlacement(
                          anchor: anchor,
                          flip: anchor.dx > cx,
                          child: ChartTooltipPanel(heading: heading, items: items, size: size),
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
          description: description,
          interactive: !nothing,
          height: boxHeight,
          plot: plot,
          status: silent ? '' : chartStatusText(heading: heading, items: items),
          focusNode: widget.focusNode,
          autofocus: widget.autofocus,
          onKeyEvent: onKey,
          onFocusChange: (bool has) {
            if (!has) {
              _clear();
            }
          },
          legend: legend,
          legendSide: legendOptions.side,
          legendWidth: legendWidth > 0 ? legendWidth : null,
        );
      },
    );
  }
}

class _PiePainter extends CustomPainter {
  const _PiePainter({
    required this.arcs,
    required this.colors,
    required this.cx,
    required this.cy,
    required this.outer,
    required this.inner,
    required this.gap,
    required this.active,
    required this.hovered,
    required this.surface,
    required this.labels,
    required this.labelStyle,
  });

  final List<_Arc> arcs;
  final List<Color> colors;
  final double cx;
  final double cy;
  final double outer;
  final double inner;
  final double gap;
  final int? active;
  final int? hovered;
  final Color surface;
  final List<String>? labels;
  final TextStyle labelStyle;

  @override
  void paint(Canvas canvas, Size size) {
    for (int i = 0; i < arcs.length; i += 1) {
      final _Arc arc = arcs[i];

      if (arc.share <= 0) {
        continue;
      }

      final Path path = arcPath(cx, cy, active == i ? outer + 3 : outer, inner, arc.from, arc.to);
      final double opacity = hovered == null || hovered == i ? 1 : 0.35;

      // The gap is a stroke in the page's own colour rather than a narrower
      // sweep, so every slice keeps the angle its share earned.
      paintFaded(canvas, size, opacity, () {
        canvas.drawPath(path, Paint()..color = colors[i]);

        if (gap > 0) {
          canvas.drawPath(
            path,
            Paint()
              ..color = surface
              ..style = PaintingStyle.stroke
              ..strokeWidth = gap
              ..strokeJoin = StrokeJoin.round,
          );
        }
      });
    }

    if (labels == null) {
      return;
    }

    final double fontSize = labelStyle.fontSize ?? 12;

    for (int i = 0; i < arcs.length; i += 1) {
      final _Arc arc = arcs[i];
      final String written = labels![i];
      final double radius = inner > 0 ? (outer + inner) / 2 : outer * 0.68;
      // Dropped rather than clipped where the slice cannot hold it.
      final double room = (arc.to - arc.from) * radius;

      if (arc.share <= 0 || room < written.length * fontSize * 0.6 + 8) {
        continue;
      }

      paintChartText(
        canvas,
        written,
        polarPoint(cx, cy, radius, (arc.from + arc.to) / 2),
        style: labelStyle,
        anchor: ChartAnchor.middle,
        central: true,
      );
    }
  }

  @override
  bool shouldRepaint(_PiePainter oldDelegate) => true;
}
