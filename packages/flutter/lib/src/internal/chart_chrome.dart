/// Everything a chart draws that is not the data.
///
/// The legend, the hover panel, the spoken reading, the words that stand in
/// for the table behind the picture, and the arrangement that holds them —
/// the parts a pie chart and a line chart have in common, which is all of them
/// except the plot. The Dart half of the React package's `ChartChrome.tsx`.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/* -------------------------------------------------------------------- text */

/// Where a painted label sits against the point it is anchored to, along the
/// line it is written on.
enum ChartAnchor {
  /// The label starts at the point.
  start,

  /// The label is centred on it.
  middle,

  /// The label ends at it.
  end,
}

/// Paints [text] at [at] in [style], the way an SVG `<text>` places it.
///
/// [central] centres the line on [at] vertically, as `dominant-baseline:
/// central` does; otherwise [at] is the alphabetic baseline, which is where an
/// SVG puts it by default. [turn] rotates the label anticlockwise about [at],
/// in degrees.
void paintChartText(
  Canvas canvas,
  String text,
  Offset at, {
  required TextStyle style,
  ChartAnchor anchor = ChartAnchor.start,
  bool central = false,
  double turn = 0,
  TextDirection direction = TextDirection.ltr,
}) {
  if (text.isEmpty) {
    return;
  }

  final TextPainter painter = TextPainter(
    text: TextSpan(text: text, style: style),
    textDirection: direction,
    maxLines: 1,
  )..layout();

  final double dx = switch (anchor) {
    ChartAnchor.start => 0,
    ChartAnchor.middle => -painter.width / 2,
    ChartAnchor.end => -painter.width,
  };
  final double dy = central
      ? -painter.height / 2
      : -painter.computeDistanceToActualBaseline(TextBaseline.alphabetic);

  if (turn == 0) {
    painter.paint(canvas, at + Offset(dx, dy));
  } else {
    canvas
      ..save()
      ..translate(at.dx, at.dy)
      ..rotate(-turn * math.pi / 180);
    painter.paint(canvas, Offset(dx, dy));
    canvas.restore();
  }

  painter.dispose();
}

/// Paints [draw] at [opacity] as one group, the way an SVG `<g opacity>` does,
/// so the dot on a faded line is not darker where it overlaps the line.
void paintFaded(Canvas canvas, Size size, double opacity, VoidCallback draw) {
  if (opacity >= 1) {
    draw();

    return;
  }

  canvas.saveLayer(
    // Generous bounds: a marker or a label may hang past the plot.
    (Offset.zero & size).inflate(64),
    Paint()..color = Color.fromRGBO(0, 0, 0, opacity),
  );
  draw();
  canvas.restore();
}

/* ------------------------------------------------------------------ words */

/// The table behind the picture, as the sentence a screen reader is given.
///
/// The React build renders a clipped `<table>` and points the plot's
/// `aria-describedby` at it. Flutter has no such element to describe a node
/// with, so the same table is written out row by row as the node's value: each
/// row's heading, then each column's heading and the cell under it, which is
/// how a screen reader reads a table cell anyway. [columns] left `null` writes
/// the cells without headings, for a table of one column whose heading would
/// only repeat the chart's name.
String chartTableText({
  required List<String> rows,
  required List<String>? columns,
  required List<List<String>> cells,
}) {
  final List<String> out = <String>[];

  for (int row = 0; row < rows.length; row += 1) {
    final List<String> line = <String>[];
    final List<String> values = row < cells.length ? cells[row] : const <String>[];

    for (int column = 0; column < values.length; column += 1) {
      final String? heading = columns == null || column >= columns.length ? null : columns[column];

      line.add(heading == null ? values[column] : '$heading ${values[column]}');
    }

    out.add('${rows[row]}: ${line.join(', ')}');
  }

  return out.join('. ');
}

/// What the live region says for a reading: the heading, then each row, then
/// the total. Empty when nothing is being read.
String chartStatusText({
  required String? heading,
  required List<MPChartTooltipItem> items,
  String? total,
  String? totalLabel,
}) {
  if (items.isEmpty) {
    return '';
  }

  final StringBuffer out = StringBuffer();

  if (heading != null && heading.isNotEmpty) {
    out.write('$heading, ');
  }

  for (int i = 0; i < items.length; i += 1) {
    final MPChartTooltipItem item = items[i];

    if (i > 0) {
      out.write(', ');
    }

    if (item.name != null) {
      out.write('${item.name}: ');
    }

    out.write(item.label ?? item.formatted);
  }

  if (total != null) {
    out.write(', $totalLabel: $total');
  }

  return out.toString();
}

/* ----------------------------------------------------------------- legend */

/// The identity channel that does not depend on being able to see a colour:
/// a swatch and a word.
///
/// Interactive by default, and each entry is a real button that says whether
/// its series is shown, because a filter a keyboard cannot reach is a filter
/// half the readers do not have.
///
/// A series switched off is drawn at Material's disabled opacity, swatch and
/// name together; one merely standing back while another is hovered is one
/// step quieter than usual. Two levels, so the two states cannot be mistaken
/// for each other, and neither depends on hue.
class ChartLegend extends StatelessWidget {
  /// Creates a legend.
  const ChartLegend({
    required this.names,
    required this.colors,
    required this.options,
    required this.visible,
    required this.hovered,
    required this.onToggle,
    required this.onHover,
    required this.size,
    this.values,
    this.swatch,
    this.colorNames = false,
    super.key,
  });

  /// What each entry is called. Names rather than series, because a pie's
  /// entries are its slices.
  final List<String?> names;

  /// The colour of each entry's mark.
  final List<Color> colors;

  /// Where it sits and whether it filters.
  final MPChartLegend options;

  /// Which entries are drawn.
  final List<bool> visible;

  /// The entry being pointed at, if any.
  final int? hovered;

  /// Turns an entry on or off.
  final ValueChanged<int> onToggle;

  /// Says which entry is being pointed at, or `null` when none is.
  final ValueChanged<int?> onHover;

  /// The chart's size, which picks the type role.
  final MPSize size;

  /// Each entry's value at the active category, where `showValue` asks.
  final List<String?>? values;

  /// The swatch, where a chart's marks are not all the same shape.
  final Widget Function(int index, Color color)? swatch;

  /// Writes each name in its own mark's colour.
  final bool colorNames;

  @override
  Widget build(BuildContext context) {
    final bool beside = options.side == MPSide.left || options.side == MPSide.right;
    final List<Widget> entries = <Widget>[
      for (int i = 0; i < names.length; i += 1)
        _LegendEntry(
          name: names[i] ?? '${i + 1}',
          color: colors[i],
          shown: i < visible.length && visible[i],
          quiet: hovered != null && hovered != i,
          interactive: options.interactive,
          value: values != null && i < values!.length ? values![i] : null,
          swatch: swatch?.call(i, colors[i]),
          colorName: colorNames,
          size: size,
          onToggle: () => onToggle(i),
          onHover: (bool on) => onHover(on ? i : null),
        ),
    ];

    if (beside) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          for (int i = 0; i < entries.length; i += 1)
            Padding(
              padding: EdgeInsets.only(top: i == 0 ? 0 : 4),
              child: entries[i],
            ),
        ],
      );
    }

    return Wrap(
      spacing: 16,
      runSpacing: 4,
      crossAxisAlignment: WrapCrossAlignment.center,
      alignment: switch (options.align) {
        MPAlign.start => WrapAlignment.start,
        MPAlign.center => WrapAlignment.center,
        MPAlign.end => WrapAlignment.end,
      },
      children: entries,
    );
  }
}

class _LegendEntry extends StatelessWidget {
  const _LegendEntry({
    required this.name,
    required this.color,
    required this.shown,
    required this.quiet,
    required this.interactive,
    required this.value,
    required this.swatch,
    required this.colorName,
    required this.size,
    required this.onToggle,
    required this.onHover,
  });

  final String name;
  final Color color;
  final bool shown;
  final bool quiet;
  final bool interactive;
  final String? value;
  final Widget? swatch;
  final bool colorName;
  final MPSize size;
  final VoidCallback onToggle;
  final ValueChanged<bool> onHover;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTypeRole role = size == MPSize.xs || size == MPSize.sm
        ? theme.typescale.labelSmall
        : theme.typescale.labelMedium;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    // Switched off is the disabled treatment; standing back is one step
    // quieter than usual.
    final double fade = !shown
        ? MPStateOpacity.disabledContent
        : quiet
        ? 0.6
        : 1;

    final Widget body = AnimatedOpacity(
      opacity: fade,
      duration: reduceMotion ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          swatch ??
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: role.style(colorName ? color : colors.onSurfaceVariant),
            ),
          ),
          if (value != null) ...<Widget>[
            const SizedBox(width: 6),
            Text(
              value!,
              style: role
                  .style(colors.onSurface)
                  .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
            ),
          ],
        ],
      ),
    );

    if (!interactive) {
      return body;
    }

    return MPInteractive(
      onTap: onToggle,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );
        final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

        // Keyboard focus dims the rest, the way a hover does; a click does not,
        // because a pointer that has just pressed an entry is about to leave.
        return _HoverReport(
          hovered: state.hovered || state.focusVisible,
          onChange: onHover,
          child: Semantics(
            container: true,
            button: true,
            toggled: shown,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: onToggle,
            child: CustomPaint(
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                  : null,
              child: body,
            ),
          ),
        );
      },
    );
  }
}

/// Says when an entry starts and stops being pointed at, by pointer or by
/// keyboard focus, once per change rather than on every build.
class _HoverReport extends StatefulWidget {
  const _HoverReport({required this.hovered, required this.onChange, required this.child});

  final bool hovered;
  final ValueChanged<bool> onChange;
  final Widget child;

  @override
  State<_HoverReport> createState() => _HoverReportState();
}

class _HoverReportState extends State<_HoverReport> {
  @override
  void didUpdateWidget(_HoverReport oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.hovered != widget.hovered) {
      final bool now = widget.hovered;

      // After the frame, because telling the chart rebuilds it, and a build
      // may not start another.
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        if (mounted) {
          widget.onChange(now);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

/* ---------------------------------------------------------------- tooltip */

/// What the pointer uncovers, as a panel.
///
/// Drawn on `surfaceContainerHigh` at level 2, the plain tooltip of Material
/// with rows in it. It is a picture of the reading and is kept off the
/// semantics tree; the reading itself is said by [ChartReadout].
class ChartTooltipPanel extends StatelessWidget {
  /// Creates a panel.
  const ChartTooltipPanel({
    required this.items,
    required this.size,
    this.heading,
    this.total,
    this.totalLabel,
    super.key,
  });

  /// What the reading is about: the category, or the mark's own name.
  final String? heading;

  /// One row per series.
  final List<MPChartTooltipItem> items;

  /// What the rows add up to, where the chart is a picture of that sum.
  final String? total;

  /// What that row is called.
  final String? totalLabel;

  /// The chart's size, which picks the type role.
  final MPSize size;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTypeRole role = size == MPSize.xs || size == MPSize.sm
        ? theme.typescale.labelSmall
        : theme.typescale.labelMedium;
    final TextStyle muted = role.style(colors.onSurfaceVariant);
    final TextStyle figure = role
        .style(colors.onSurface)
        .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]);

    // The value is pushed to the far end of its row, the way `ms-auto` pushes
    // it, so the figures of a column line up down the panel.
    Widget row({Color? swatch, String? name, required String value}) {
      return Row(
        children: <Widget>[
          if (swatch != null) ...<Widget>[
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: swatch, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
          ],
          Expanded(
            child: name == null
                ? const SizedBox.shrink()
                : Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: muted),
          ),
          const SizedBox(width: 8),
          Text(value, style: figure),
        ],
      );
    }

    return ExcludeSemantics(
      child: IgnorePointer(
        child: Container(
          constraints: const BoxConstraints(minWidth: 96, maxWidth: 256),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: colors.surfaceContainerHigh,
            borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
            boxShadow: MPShadows.of(2),
          ),
          child: IntrinsicWidth(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                if (heading != null && heading!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      heading!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: muted,
                    ),
                  ),
                for (int i = 0; i < items.length; i += 1)
                  Padding(
                    padding: EdgeInsets.only(top: i == 0 ? 0 : 2),
                    child: row(
                      swatch: items[i].color,
                      name: items[i].name,
                      value: items[i].label ?? items[i].formatted,
                    ),
                  ),
                // Ruled off rather than listed with the parts, and with no
                // swatch: a total is not one more series.
                if (total != null)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: colors.outlineVariant)),
                    ),
                    child: row(name: totalLabel, value: total!),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Hangs a panel beside [anchor]: twelve pixels clear of it, centred on it
/// vertically, and on the near side when [flip] says the far side is past the
/// edge of the plot.
class ChartTooltipPlacement extends StatelessWidget {
  /// Places [child].
  const ChartTooltipPlacement({
    required this.anchor,
    required this.flip,
    required this.child,
    super.key,
  });

  /// The point the panel is about, in the plot's coordinates.
  final Offset anchor;

  /// Hangs it to the left of the anchor rather than to the right.
  final bool flip;

  /// The panel.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return CustomSingleChildLayout(
      delegate: _PlacementDelegate(anchor: anchor, flip: flip),
      child: child,
    );
  }
}

class _PlacementDelegate extends SingleChildLayoutDelegate {
  const _PlacementDelegate({required this.anchor, required this.flip});

  final Offset anchor;
  final bool flip;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) => const BoxConstraints();

  @override
  Offset getPositionForChild(Size size, Size childSize) {
    return Offset(
      flip ? anchor.dx - 12 - childSize.width : anchor.dx + 12,
      anchor.dy - childSize.height / 2,
    );
  }

  @override
  bool shouldRelayout(_PlacementDelegate oldDelegate) {
    return oldDelegate.anchor != anchor || oldDelegate.flip != flip;
  }
}

/// The reading, said rather than drawn.
///
/// A live region, so a reader walking the categories is told each one as it
/// arrives without the focus moving off the chart; empty when nothing is being
/// read, so leaving the chart clears what was said. A pixel square rather than
/// nothing at all, because a node with no size is taken off the tree.
class ChartReadout extends StatelessWidget {
  /// Says [said].
  const ChartReadout({required this.said, super.key});

  /// What is being read, or empty when nothing is.
  final String said;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      liveRegion: true,
      label: said,
      child: const SizedBox.square(dimension: 1),
    );
  }
}

/* ------------------------------------------------------------------ shell */

/// The arrangement: a plot, a legend on one of its four sides, and the reading
/// beside it.
///
/// The plot is one tab stop and one semantics node: its name, then the table
/// behind the picture as its value. The reading and any control over the
/// corner of the plot are **siblings** of that node rather than children, so
/// neither is folded into the picture.
class ChartShell extends StatefulWidget {
  /// Creates the arrangement.
  const ChartShell({
    required this.name,
    required this.description,
    required this.interactive,
    required this.height,
    required this.plot,
    required this.status,
    this.focusNode,
    this.autofocus = false,
    this.onKeyEvent,
    this.onFocusChange,
    this.overlay,
    this.legend,
    this.legendSide = MPSide.bottom,
    this.legendWidth,
    super.key,
  });

  /// The plot's name for a screen reader.
  final String name;

  /// What the plot says after its name: the table behind the picture.
  final String description;

  /// Whether there is anything to walk. A chart with no data is not a tab
  /// stop.
  final bool interactive;

  /// How tall the plot is.
  final double height;

  /// The drawing, with its pointer handling and its panel.
  final Widget plot;

  /// What the live region says.
  final String status;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the chart is inserted.
  final bool autofocus;

  /// The walk.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Told as the focus arrives and leaves.
  final ValueChanged<bool>? onFocusChange;

  /// A control over the top end corner of the plot.
  final Widget? overlay;

  /// The legend.
  final Widget? legend;

  /// Which side of the plot the legend sits on.
  final MPSide legendSide;

  /// How wide a legend down the side is given, so the plot beside it knows its
  /// own width before it is laid out.
  final double? legendWidth;

  @override
  State<ChartShell> createState() => _ChartShellState();
}

class _ChartShellState extends State<ChartShell> {
  FocusNode? _own;

  FocusNode get _node => widget.focusNode ?? (_own ??= FocusNode(debugLabel: 'MPChart'));

  /// Whether the ring is drawn: the plot holds the focus and it arrived from
  /// the keyboard.
  bool _ringed = false;

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    Widget plot = SizedBox(height: widget.height, child: widget.plot);

    plot = Semantics(
      container: true,
      image: true,
      label: widget.name,
      value: widget.description,
      focusable: widget.interactive ? true : null,
      focused: widget.interactive ? _node.hasFocus : null,
      onFocus: widget.interactive ? _node.requestFocus : null,
      child: ExcludeSemantics(child: plot),
    );

    plot = Focus(
      focusNode: _node,
      autofocus: widget.autofocus,
      canRequestFocus: widget.interactive,
      skipTraversal: !widget.interactive,
      includeSemantics: false,
      onKeyEvent: widget.onKeyEvent,
      onFocusChange: (bool has) {
        setState(() {
          _ringed = has && FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
        });
        widget.onFocusChange?.call(has);
      },
      child: CustomPaint(
        foregroundPainter: _ringed
            ? MPFocusRingPainter(
                color: theme.colors.secondary,
                borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
              )
            : null,
        child: plot,
      ),
    );

    plot = Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        plot,
        Positioned(left: 0, top: 0, child: ChartReadout(said: widget.status)),
        if (widget.overlay != null) PositionedDirectional(top: 0, end: 0, child: widget.overlay!),
      ],
    );

    final Widget? legend = widget.legend;

    if (legend == null) {
      return plot;
    }

    switch (widget.legendSide) {
      case MPSide.bottom:
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[plot, const SizedBox(height: 12), legend],
        );
      case MPSide.top:
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[legend, const SizedBox(height: 12), plot],
        );
      case MPSide.left:
      case MPSide.right:
        final Widget side = widget.legendWidth != null
            ? SizedBox(width: widget.legendWidth, child: legend)
            : ConstrainedBox(constraints: const BoxConstraints(maxWidth: 200), child: legend);

        return Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: widget.legendSide == MPSide.right
              ? <Widget>[Expanded(child: plot), const SizedBox(width: 12), side]
              : <Widget>[side, const SizedBox(width: 12), Expanded(child: plot)],
        );
    }
  }
}

/// The empty state: the caller's widget, or the library's "No data", centred
/// in the plot's box in `bodySmall`.
class ChartEmpty extends StatelessWidget {
  /// Creates the empty state.
  const ChartEmpty({required this.fallback, this.child, super.key});

  /// The caller's own.
  final Widget? child;

  /// The words used when there is no [child].
  final String fallback;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Center(
      child: DefaultTextStyle.merge(
        style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
        child: child ?? Text(fallback),
      ),
    );
  }
}

/// The width a plot is drawn at when its parent sets no limit: the screen's,
/// as a block element takes the page's.
double chartWidthOf(BuildContext context, BoxConstraints constraints) {
  return constraints.maxWidth.isFinite ? constraints.maxWidth : MediaQuery.sizeOf(context).width;
}

/// Whether a key press is one a chart's walk reads: a press or a repeat.
bool chartKeyDown(KeyEvent event) => event is KeyDownEvent || event is KeyRepeatEvent;
