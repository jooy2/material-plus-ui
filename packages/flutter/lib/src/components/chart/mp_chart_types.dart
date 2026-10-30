/// The vocabulary every chart shares.
///
/// A `series` handed to an `MPLineChart` is the same `series` an `MPBarChart`
/// takes, so switching a dashboard tile from one shape to the other is a
/// rename rather than a rewrite. Everything here describes *data* or one of
/// the parts drawn around it; how a chart draws the data — the curve, the
/// stacking, the hole in a donut — belongs to the widget, because that is the
/// part that differs.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/date.dart' show MPDateNames;

/// Where a point sits along the category axis: a [String], a [num] or a
/// [DateTime].
///
/// An alias of [Object] rather than a class, because Dart has no union type
/// and wrapping every label in a constructor would bury the data. A string is
/// a name and takes the slot its index gives it. A number or a date is a place
/// on a number line, which is what lets a chart of readings taken at uneven
/// times draw the gaps between them rather than spacing them evenly. Anything
/// else is written with its `toString`.
typedef MPChartCategory = Object;

/// One value: a [num], `null` for a gap, or an [MPChartPoint] with more to say
/// about itself.
///
/// An alias of `Object?` for the reason [MPChartCategory] is one, so a series
/// is written the way the React build writes it: `<num?>[120, 138, null]`.
/// Anything else — a string, a `NaN` — is read as a gap, because a value that
/// is not a number has nowhere on an axis to be.
typedef MPChartDatum = Object?;

/// A colour a caller hands a chart: an [MPColor] family, which reads that
/// accent from the theme, or any [Color].
///
/// The one place in this library where a colour is not only a role. A series
/// is an *entity* — a region, a plan, a competitor — and nothing about being
/// one means success or danger, so a brand colour has to be possible. Reach for
/// an [MPColor] to keep it a role.
typedef MPChartColor = Object;

/// One value, and everything a chart might want to know about it.
///
/// [y] of `null` is a **gap** rather than a zero — a sensor that was offline, a
/// month that has not closed. A line breaks across it, an area breaks with it,
/// and a bar is not drawn. A chart that draws missing data as zero reports an
/// outage as a collapse, in the one shape a reader trusts without checking.
@immutable
class MPChartPoint {
  /// Creates a point.
  const MPChartPoint({required this.y, this.x, this.z, this.color, this.label});

  /// The value. `null` is a gap.
  final double? y;

  /// Its place on the category axis. Without one the point is placed by its
  /// index, against the chart's `categories` if it was given any.
  final MPChartCategory? x;

  /// A second magnitude, for the marks that carry one — a bubble's area, a
  /// cell's weight. The charts with no use for it ignore it.
  final double? z;

  /// Overrides its series' colour for this one point: the slice worth pointing
  /// at, the bar that went over budget.
  final MPChartColor? color;

  /// What the hover panel, the reading and any value label say in place of
  /// [y].
  final String? label;
}

/// One line, one band of bars, one row of a heatmap — the unit identity
/// attaches to.
///
/// Colour follows the series and never its position in the drawing. A series
/// takes its palette slot from where it sits in the `series` list rather than
/// from how many of its neighbours are visible, so hiding one leaves the rest
/// the colours they already were.
@immutable
class MPChartSeries {
  /// Creates a series.
  const MPChartSeries({required this.data, this.name, this.color, this.hidden = false});

  /// Its values, in category order. Each one a [num], `null` or an
  /// [MPChartPoint].
  final List<MPChartDatum> data;

  /// Its name in the legend, the hover panel and the reading. Two series or
  /// more always draw a legend, so a series without a name is one the reader
  /// has no way to tell from the others.
  final String? name;

  /// Overrides the palette slot this series would take.
  final MPChartColor? color;

  /// Starts the series hidden. Only means anything beside an interactive
  /// legend, which is what turns it back on.
  final bool hidden;
}

/// One span on a timeline: a stretch with two ends.
@immutable
class MPTimelineSpan {
  /// Creates a span.
  const MPTimelineSpan({required this.start, required this.end, this.label, this.color});

  /// When it begins: a [DateTime], or a number of milliseconds.
  final MPChartCategory start;

  /// And when it is done. One that ends before it starts is drawn either way
  /// round.
  final MPChartCategory end;

  /// What the span is called, in the hover panel, the reading and on the bar.
  final String? label;

  /// Overrides its row's colour for this one span.
  final MPChartColor? color;
}

/// One row of a timeline, and everything on it.
///
/// A row is a series — one entity, one name, one colour — but its data are
/// spans rather than values, so it cannot be an [MPChartSeries]. There is no
/// `hidden` and no legend to pair one with: a timeline's rows **are** its
/// category axis, already named down the side.
@immutable
class MPTimelineSeries {
  /// Creates a row.
  const MPTimelineSeries({required this.data, this.name, this.color});

  /// The spans on this row. Overlapping ones are drawn over each other.
  final List<MPTimelineSpan> data;

  /// Its name on the axis, in the hover panel and in the reading.
  final String? name;

  /// Overrides the palette slot this row would otherwise take.
  final MPChartColor? color;
}

/// How the series of a stacking chart are piled up.
///
/// A percent stack answers "what is this made of" and refuses to answer "how
/// much of it is there", which is the trade it makes and the reason it is a
/// third setting rather than a flag on the second. A negative has no share of
/// a whole, so a percent stack leaves it out the way `MPPieChart` does.
enum MPChartStack {
  /// Side by side, or overlapping. The parts are compared with each other.
  none,

  /// On each other, so the far edge is the total.
  stacked,

  /// On each other and normalised, so every column is full and what is
  /// compared is the composition.
  percent,
}

/// How a line gets from one point to the next.
enum MPChartCurve {
  /// Straight, the one curve that claims nothing the data did not say.
  linear,

  /// A monotone cubic: curved, but it never dips below a value both of its
  /// neighbours are above.
  smooth,

  /// Flat between two points, turning halfway — what a rate or a tier did
  /// between two readings.
  step,
}

/// What a line or an area does where a series has no value.
///
/// Only the drawing changes. The hover panel and the reading still report a
/// gap as a gap, because they are the copy of the data a reader gets when they
/// need the number itself.
enum MPChartGaps {
  /// The line stops and starts again on the far side. The default, because a
  /// straight run through values nobody has looks exactly like data.
  ///
  /// React spells this `'break'`, which is a reserved word in Dart.
  gap,

  /// The two sides are joined, and the joining run is drawn **dashed** so the
  /// picture still says which part of it was measured.
  connect,

  /// The missing reading is drawn at zero, and the value axis is widened to
  /// hold it.
  zero,
}

/// What an axis does with a tick label too wide for the room it has.
///
/// Only the axis along the **bottom** reads it: labels stacked up the side
/// already have a row each.
enum MPChartTickLabels {
  /// Flat while the labels fit, turned when they do not. The default.
  auto,

  /// Cut with an ellipsis, and never turned.
  truncate,

  /// Every label turned 45°.
  rotate,

  /// Every label stood on end.
  vertical,
}

/// Which values are written onto the marks themselves.
enum MPChartValueLabels {
  /// None, which is not timidity: a number beside every point is the most
  /// reliable way to make a chart unreadable.
  none,

  /// The last value of each series.
  last,

  /// The highest and the lowest.
  extremes,

  /// Every one of them.
  all,
}

/// What ink a chart writes the text naming a series in.
enum MPChartLabelColor {
  /// `onSurfaceVariant` for every name, and `onSurface` for the values written
  /// on the marks. The default: the palette is fitted to 3:1 against the
  /// surface, which is the bar a mark has to clear, and small text wants 4.5:1.
  ink,

  /// Each name in its own mark's colour.
  series,
}

/// What the pointer uncovers.
enum MPChartTooltipMode {
  /// Every series at the category under the pointer, with a crosshair dropped
  /// through it.
  ///
  /// React spells this `'index'`; every Dart enum already has an `index`.
  column,

  /// The one mark being pointed at.
  item,

  /// Nothing, and then the numbers are read another way.
  none,
}

/// What order the rows of a hover panel come in.
enum MPChartTooltipSort {
  /// The order the series were passed, which is the legend's order.
  series,

  /// Largest first.
  value,
}

/// One series' answer at the category the pointer is resting on.
@immutable
class MPChartTooltipItem {
  /// Creates a row of a hover panel.
  const MPChartTooltipItem({
    required this.seriesIndex,
    required this.color,
    required this.value,
    required this.formatted,
    this.name,
    this.label,
  });

  /// Its place in the `series` list — the same index its colour came from.
  final int seriesIndex;

  /// The series' name.
  final String? name;

  /// The colour its mark is drawn in.
  final Color color;

  /// The value, or `null` for a gap.
  final double? value;

  /// [value], written the way this chart writes numbers.
  final String formatted;

  /// What the point called itself, if it said.
  final String? label;
}

/// What a replacement hover panel is handed.
@immutable
class MPChartTooltipContext {
  /// Creates the context.
  const MPChartTooltipContext({
    required this.index,
    required this.category,
    required this.items,
    this.total,
  });

  /// The category's index.
  final int index;

  /// The category itself.
  final MPChartCategory category;

  /// Only the series that are visible and have a value here, in the panel's
  /// order.
  final List<MPChartTooltipItem> items;

  /// What they add up to, where the chart is a picture of that sum.
  final String? total;
}

/// The hover layer.
@immutable
class MPChartTooltip {
  /// Creates the options.
  const MPChartTooltip({
    this.mode,
    this.sort = MPChartTooltipSort.series,
    this.total,
    this.crosshair = true,
    this.builder,
  });

  /// What the pointer uncovers. [MPChartTooltipMode.column] by default, or
  /// [MPChartTooltipMode.item] where the marks are not arranged in columns.
  final MPChartTooltipMode? mode;

  /// What order the rows come in.
  final MPChartTooltipSort sort;

  /// Adds a row for what the column adds up to. On for a stack, whose whole
  /// point is the height of the column, and off everywhere else.
  final bool? total;

  /// The line dropped through the plot at the active category, in
  /// [MPChartTooltipMode.column] only.
  final bool crosshair;

  /// Draws the panel yourself. The chart still decides when it opens and
  /// where. React's `render`.
  final Widget Function(MPChartTooltipContext context)? builder;
}

/// A line drawn across the plot at a place on one of its scales, or a band
/// where it has two ends.
///
/// A target, a service level, the day a release went out. It is **not** data:
/// it is drawn in the chrome's ink rather than out of the series palette.
@immutable
class MPChartReference {
  /// Creates a reference.
  const MPChartReference({
    required this.value,
    this.to,
    this.label,
    this.color,
    this.dashed = true,
  });

  /// Where it sits, on that axis' own scale: a [num], or a [DateTime] on an
  /// axis of dates.
  final Object value;

  /// And where it ends, which makes it a **band** rather than a line.
  final Object? to;

  /// What it is called, written at its own end of the line and read out with
  /// the chart.
  final String? label;

  /// Which family it wears. `outline` by default, which keeps it reading as
  /// chrome rather than as another series.
  final MPChartColor? color;

  /// Draws it dashed, so it cannot be mistaken for a gridline or a baseline.
  final bool dashed;
}

/// One of a chart's two axes.
///
/// `xAxis` is the category axis and `yAxis` is the value axis on every chart
/// and in both orientations: turning a bar chart on its side changes the
/// drawing and not what the caller's data means.
@immutable
class MPChartAxis {
  /// Creates the options.
  const MPChartAxis({
    this.hidden = false,
    this.label,
    this.grid,
    this.min,
    this.max,
    this.tickCount,
    this.tickFormat,
    this.tickLabels,
    this.thickness,
    this.references = const <MPChartReference>[],
  });

  /// Leaves it undrawn — its rule, its ticks and its labels — and gives the
  /// room back to the plot.
  final bool hidden;

  /// A name for what it measures, set beside it.
  final String? label;

  /// The gridlines it casts across the plot. On for the value axis and off for
  /// the category axis by default.
  final bool? grid;

  /// Where the scale starts. Taken from the data otherwise.
  final double? min;

  /// Where the scale ends. Taken from the data otherwise.
  final double? max;

  /// Roughly how many ticks. A target and not a count: the scale still rounds
  /// them to numbers a reader can do arithmetic on.
  final int? tickCount;

  /// How a tick is written, overriding the chart's own `format`.
  final String Function(MPChartCategory value, int index)? tickFormat;

  /// What to do with a label too wide for the room it has. Read by the axis
  /// along the bottom only.
  final MPChartTickLabels? tickLabels;

  /// How much room it keeps for its ticks and its label, in pixels.
  final double? thickness;

  /// Lines and bands drawn across the plot at places on **this** axis' scale.
  /// The scale is widened to hold them.
  final List<MPChartReference> references;
}

/// Dragging a range out of a long category axis.
///
/// Everything follows the window: the value scale, the hover panel, the
/// spoken reading. Only a chart whose categories are a row of slots takes it.
@immutable
class MPChartZoom {
  /// Turns dragging a range on.
  const MPChartZoom({this.range, this.initialRange, this.onRangeChange, this.min = 2});

  /// The range drawn, as a first and last **category index**. Given, it is the
  /// window; set it back to `null` to show every category again.
  final (int, int)? range;

  /// Where the window starts out. React's `defaultRange`.
  final (int, int)? initialRange;

  /// Called with what the reader dragged, and with `null` when they reset it.
  final ValueChanged<(int, int)?>? onRangeChange;

  /// The fewest categories a drag may leave.
  final int min;
}

/// Where the legend sits, and what it does when it is used.
@immutable
class MPChartLegend {
  /// Creates the options.
  const MPChartLegend({
    this.visible,
    this.side = MPSide.bottom,
    this.align = MPAlign.center,
    this.interactive = true,
    this.showValue = false,
  });

  /// Whether it is drawn. `null` draws it from two series up: a legend with one
  /// swatch in it restates the title. React's `legend={true}` and
  /// `legend={false}`.
  final bool? visible;

  /// Which edge of the plot.
  final MPSide side;

  /// Where along that edge.
  final MPAlign align;

  /// Pressing an entry hides and shows its series, and hovering one dims the
  /// rest.
  final bool interactive;

  /// Writes each series' value at the active category beside its name.
  final bool showValue;
}
