/// The arithmetic and the vocabulary the charts share.
///
/// The Dart half of the React package's `internal/chart.ts` and
/// `internal/time-scale.ts`. Nothing in here is a widget: it is the palette a
/// series is handed, the numbers a value is written as, the scales and ticks
/// under a plot, and the paths its marks are drawn with. Kept apart so a chart
/// component reads as its interesting fifty lines rather than as machinery.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;
import 'dart:ui';

import 'package:material_plus_ui/src/components/chart/mp_chart_types.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

/* ------------------------------------------------------------------ colour */

/// How many colours a chart hands out before it starts repeating.
///
/// Eight, and a chart that reaches the ninth should not have: a ninth hue is
/// indistinguishable from one of the first eight under colour-vision
/// deficiency whichever one is chosen.
const int chartSlots = 8;

/// A caller's [MPChartColor] as a colour, or `null` when they gave none.
///
/// An [MPColor] reads that family's accent; a [Color] is passed through.
Color? chartColorOf(MPColorScheme colors, MPChartColor? given) {
  if (given is MPColor) {
    return colors.accent(given).color;
  }

  if (given is Color) {
    return given;
  }

  return null;
}

/// What colour series [index] is, in the fixed order the palette is handed out.
///
/// [index] is the series' place in the list it was passed in, **not** its
/// place among the visible ones: filtering a legend must not repaint the
/// survivors.
Color seriesColor(MPColorScheme colors, int index, MPChartColor? explicit) {
  return chartColorOf(colors, explicit) ?? colors.chart[index % chartSlots];
}

/* ----------------------------------------------------------------- numbers */

/// Where a figure stops being read and starts being counted.
const double compactFrom = 10000;

const List<String> _compactUnits = <String>['K', 'M', 'B', 'T'];

/// [value] with at most [places] decimals and no trailing zeros.
String _trimmed(double value, int places) {
  final String text = value.toStringAsFixed(places);

  if (!text.contains('.')) {
    return text;
  }

  return text.replaceFirst(RegExp(r'\.?0+$'), '');
}

/// [text], a plain number, with its whole part grouped in threes by a comma.
///
/// English grouping, in every locale: it is what `Intl` gives the React build
/// for a reader in English, and without `package:intl` there is no other
/// locale's to reach for. A chart's `format` is how it writes numbers any other
/// way.
String _grouped(String text) {
  final bool negative = text.startsWith('-');
  final String unsigned = negative ? text.substring(1) : text;
  final int point = unsigned.indexOf('.');
  final String whole = point < 0 ? unsigned : unsigned.substring(0, point);
  final StringBuffer out = StringBuffer(negative ? '-' : '');

  for (int i = 0; i < whole.length; i += 1) {
    if (i > 0 && (whole.length - i) % 3 == 0) {
      out.write(',');
    }

    out.write(whole[i]);
  }

  if (point >= 0) {
    out.write(unsigned.substring(point));
  }

  return out.toString();
}

/// A plain number as `Intl.NumberFormat` writes it in English: grouped, with
/// at most three decimals.
String plainNumber(double value) {
  if (!value.isFinite) {
    return '';
  }

  final String text = _grouped(_trimmed(value, 3));

  // `-0` is a rounding artefact rather than a reading.
  return text == '-0' ? '0' : text;
}

/// A number compacted the way `notation: 'compact'` compacts it in English:
/// one decimal, and a value that rounds up to a thousand moves a unit along,
/// so 999,999 is `1M` rather than `1000K`.
String compactNumber(double value) {
  if (!value.isFinite) {
    return '';
  }

  double scaled = value.abs();
  int unit = -1;

  while (scaled >= 1000 && unit < _compactUnits.length - 1) {
    scaled /= 1000;
    unit += 1;
  }

  if (double.parse(scaled.toStringAsFixed(1)) >= 1000 && unit < _compactUnits.length - 1) {
    scaled /= 1000;
    unit += 1;
  }

  if (unit < 0) {
    return plainNumber(value);
  }

  return '${value < 0 ? '-' : ''}${_trimmed(scaled, 1)}${_compactUnits[unit]}';
}

/// A number as the reader should see it, compacted once it stops being
/// readable in full.
///
/// Four digits stay and five do not: `1,284` is taken in at a glance, and at
/// `12,900` the digits have stopped being read and started being counted, so
/// `12.9K` loses nothing. A caller's [format] overrides all of it, because a
/// caller who has said how a number is written has said what they want.
String formatStatistic(double value, String Function(double value)? format, {bool compact = true}) {
  if (!value.isFinite) {
    return '';
  }

  if (format != null) {
    return format(value);
  }

  if (compact && value.abs() >= compactFrom) {
    return compactNumber(value);
  }

  return plainNumber(value);
}

/// A share of a whole, as a whole percentage.
///
/// A share under a percent is written as the `<1%` it rounds to rather than as
/// the `0%` it is not: a slice that is there has to read as there.
String formatShare(double share) {
  if (!share.isFinite) {
    return '';
  }

  if (share > 0 && share < 0.005) {
    return '<1%';
  }

  return '${plainNumber((share * 100).roundToDouble())}%';
}

/// A share as a percentage with at most one decimal, which is how a pie writes
/// a slice: `33.3%`.
String formatPercent(double share) {
  if (!share.isFinite) {
    return '';
  }

  return '${_grouped(_trimmed(share * 100, 1))}%';
}

/* ------------------------------------------------------------------ shapes */

/// The cubic segments of a monotone interpolation, appended to [path].
///
/// Fritsch–Carlson: the tangent at each point is the harmonic mean of the
/// slopes either side of it, clamped to zero wherever the two disagree in
/// sign. That clamp is why a run of rising values never dips on its way up,
/// and why the lowest number in the data is the lowest point on screen.
void _monotone(Path path, List<Offset> points) {
  final int n = points.length;
  final List<double> slopes = <double>[];

  for (int i = 0; i < n - 1; i += 1) {
    final double dx = points[i + 1].dx - points[i].dx;

    slopes.add(dx == 0 ? 0 : (points[i + 1].dy - points[i].dy) / dx);
  }

  final List<double> tangents = <double>[slopes.isEmpty ? 0 : slopes.first];

  for (int i = 1; i < n - 1; i += 1) {
    final double before = slopes[i - 1];
    final double after = slopes[i];

    tangents.add(before * after <= 0 ? 0 : (2 * before * after) / (before + after));
  }

  tangents.add(n >= 2 ? slopes[n - 2] : 0);

  for (int i = 0; i < n - 1; i += 1) {
    final double dx = (points[i + 1].dx - points[i].dx) / 3;

    path.cubicTo(
      points[i].dx + dx,
      points[i].dy + tangents[i] * dx,
      points[i + 1].dx - dx,
      points[i + 1].dy - tangents[i + 1] * dx,
      points[i + 1].dx,
      points[i + 1].dy,
    );
  }
}

/// One unbroken run of points appended to [path], starting with a move when
/// [move] is set and with a line to its first point otherwise.
void _run(Path path, List<Offset> run, MPChartCurve curve, {bool move = true}) {
  if (run.isEmpty) {
    return;
  }

  if (move) {
    path.moveTo(run.first.dx, run.first.dy);
  } else {
    path.lineTo(run.first.dx, run.first.dy);
  }

  if (run.length == 1) {
    // A lone point between two gaps has no line to be part of. A zero-length
    // stroke is what it is, and a round cap draws that as the dot it should be.
    path.lineTo(run.first.dx, run.first.dy);

    return;
  }

  if (curve == MPChartCurve.smooth) {
    _monotone(path, run);

    return;
  }

  for (int i = 1; i < run.length; i += 1) {
    if (curve == MPChartCurve.step) {
      // The step turns halfway between the two rather than at either, so
      // neither the old value nor the new one is drawn as lasting longer than
      // it did.
      final double middle = (run[i - 1].dx + run[i].dx) / 2;

      path
        ..lineTo(middle, run[i - 1].dy)
        ..lineTo(middle, run[i].dy)
        ..lineTo(run[i].dx, run[i].dy);
    } else {
      path.lineTo(run[i].dx, run[i].dy);
    }
  }
}

/// Every unbroken run in a series, split at the gaps.
List<List<Offset>> _runsOf(List<Offset?> points) {
  final List<List<Offset>> runs = <List<Offset>>[];
  List<Offset> run = <Offset>[];

  for (final Offset? point in points) {
    if (point == null) {
      if (run.isNotEmpty) {
        runs.add(run);
      }

      run = <Offset>[];
    } else {
      run.add(point);
    }
  }

  if (run.isNotEmpty) {
    runs.add(run);
  }

  return runs;
}

/// A series as one path, broken wherever it has a gap.
///
/// The break is the point: a path that joined the two sides of a `null` would
/// draw a straight line through a value nobody has.
Path linePath(List<Offset?> points, MPChartCurve curve) {
  final Path path = Path();

  for (final List<Offset> run in _runsOf(points)) {
    _run(path, run, curve);
  }

  return path;
}

/// The straight runs that cross a series' gaps, and nothing else.
///
/// Drawn beside [linePath] and dashed, so a joined gap still says which part
/// of the line is a guess. Straight whatever the curve is: a smoothed bridge
/// would claim to know how the value moved while nobody was watching.
Path bridgePath(List<Offset?> points) {
  final Path path = Path();
  Offset? last;
  bool gapped = false;

  for (final Offset? point in points) {
    if (point == null) {
      gapped = last != null;

      continue;
    }

    if (last != null && gapped) {
      path
        ..moveTo(last.dx, last.dy)
        ..lineTo(point.dx, point.dy);
    }

    last = point;
    gapped = false;
  }

  return path;
}

/// The dash a bridge is drawn in, as a multiple of the stroke's width.
const double chartBridgeDash = 3;

/// Every point a series has, with the gaps dropped rather than kept as holes.
List<Offset?> withoutGaps(List<Offset?> points) => <Offset?>[
  for (final Offset? point in points) ?point,
];

/// The ribbon between two runs of points.
///
/// Built run by run, so a gap in either edge is a gap in the band: an area that
/// closed across a missing month would fill in a value that was never
/// measured. The underside is drawn with the same curve, so the two edges agree
/// about where the band is between two points.
Path bandPath(List<Offset?> top, List<Offset?> bottom, MPChartCurve curve) {
  final Path path = Path();
  List<Offset> upper = <Offset>[];
  List<Offset> lower = <Offset>[];

  void close() {
    if (upper.isNotEmpty) {
      _run(path, upper, curve);
      _run(path, lower.reversed.toList(), curve, move: false);
      path.close();
    }

    upper = <Offset>[];
    lower = <Offset>[];
  }

  for (int at = 0; at < top.length; at += 1) {
    final Offset? point = top[at];
    final Offset? under = at < bottom.length ? bottom[at] : null;

    if (point == null || under == null) {
      close();

      continue;
    }

    upper.add(point);
    lower.add(under);
  }

  close();

  return path;
}

/// The same path closed down to a flat baseline, for an area standing on the
/// axis rather than on another band.
Path areaPath(List<Offset?> points, double baseline, MPChartCurve curve) {
  return bandPath(points, <Offset?>[
    for (final Offset? point in points) point == null ? null : Offset(point.dx, baseline),
  ], curve);
}

/// [path] cut into dashes of [dash] with [gap] between them.
Path dashedPath(Path path, double dash, double gap) {
  final Path out = Path();

  for (final PathMetric metric in path.computeMetrics()) {
    double at = 0;

    while (at < metric.length) {
      out.addPath(metric.extractPath(at, math.min(at + dash, metric.length)), Offset.zero);
      at += dash + gap;
    }
  }

  return out;
}

/// Which edge of a bar is its data end — the one the value is at.
enum BarEnd {
  /// Grows upward.
  top,

  /// Hangs downward.
  bottom,

  /// Grows leftward.
  left,

  /// Grows rightward.
  right,

  /// The inner segment of a stack, square at both faces.
  none,

  /// A span, rounded at both ends.
  both,
}

/// A rectangle with the two corners at its **data end** rounded.
///
/// Rounded at the end and square at the baseline: a bar rounded where it meets
/// the axis has lost the point it starts from. The radius shrinks to fit, so a
/// bar two pixels tall is a bar and not a dome.
Path barPath(double x, double y, double width, double height, double radius, BarEnd end) {
  final double w = width.abs();
  final double h = height.abs();
  final Path path = Path();

  if (w == 0 || h == 0) {
    return path;
  }

  final Radius r = Radius.circular(math.max(0, math.min(radius, math.min(w / 2, h / 2))));
  final bool all = end == BarEnd.both;

  return path..addRRect(
    RRect.fromRectAndCorners(
      Rect.fromLTWH(x, y, w, h),
      topLeft: all || end == BarEnd.top || end == BarEnd.left ? r : Radius.zero,
      topRight: all || end == BarEnd.top || end == BarEnd.right ? r : Radius.zero,
      bottomRight: all || end == BarEnd.bottom || end == BarEnd.right ? r : Radius.zero,
      bottomLeft: all || end == BarEnd.bottom || end == BarEnd.left ? r : Radius.zero,
    ),
  );
}

/* ------------------------------------------------------------------- scale */

/// The lowest and highest of a set of numbers.
class ChartExtent {
  /// Creates an extent.
  const ChartExtent(this.min, this.max);

  /// The lowest.
  final double min;

  /// The highest.
  final double max;
}

/// The lowest and highest of [values] in one pass, or `null` for none.
ChartExtent? bounds(Iterable<double> values) {
  double low = double.infinity;
  double high = double.negativeInfinity;

  for (final double value in values) {
    if (value < low) {
      low = value;
    }

    if (value > high) {
      high = value;
    }
  }

  return low <= high ? ChartExtent(low, high) : null;
}

/// The lowest and highest a series reaches, with the caller's overrides.
///
/// A flat series has no extent, and dividing by nothing would put every point
/// on one pixel or on none, so one unit of room draws it as the flat line it
/// is, halfway up.
ChartExtent extentOf(List<double?> values, {double? min, double? max}) {
  final ChartExtent? real = bounds(<double>[
    for (final double? value in values)
      if (value != null && value.isFinite) value,
  ]);
  final double low = min ?? real?.min ?? 0;
  final double high = max ?? real?.max ?? 0;

  return low == high ? ChartExtent(low - 0.5, high + 0.5) : ChartExtent(low, high);
}

/// An extent opened out to hold the places a caller has marked, so a target
/// above everything measured is not cropped out of the picture.
ChartExtent? withReferences(ChartExtent? extent, List<MPChartReference>? references) {
  final List<double> marks = <double>[
    for (final MPChartReference one in references ?? const <MPChartReference>[]) ...<double>[
      ?toNumber(one.value),
      if (one.to != null) ?toNumber(one.to),
    ],
  ];

  if (marks.isEmpty || extent == null) {
    return extent;
  }

  return ChartExtent(
    math.min(extent.min, marks.reduce(math.min)),
    math.max(extent.max, marks.reduce(math.max)),
  );
}

/// The lowest and highest a set of series reaches.
///
/// Stacked is a different question: what a stacked axis has to hold is the
/// tallest *column*, and positives and negatives accumulate apart, because a
/// column of +8 and −3 reaches from −3 to 8. `null` when nothing was measured
/// at all, which is a different answer from a chart of zeroes.
ChartExtent? seriesExtent(List<List<ChartValue>> values, {required bool stacked}) {
  double low = double.infinity;
  double high = double.negativeInfinity;
  bool seen = false;

  if (stacked) {
    final int length = values.fold<int>(0, (int most, List<ChartValue> one) {
      return math.max(most, one.length);
    });

    for (int index = 0; index < length; index += 1) {
      double up = 0;
      double down = 0;

      for (final List<ChartValue> one in values) {
        final double? value = index < one.length ? one[index].value : null;

        if (value == null) {
          continue;
        }

        seen = true;

        if (value >= 0) {
          up += value;
        } else {
          down += value;
        }
      }

      low = math.min(low, down);
      high = math.max(high, up);
    }
  } else {
    for (final List<ChartValue> one in values) {
      for (final ChartValue entry in one) {
        final double? value = entry.value;

        if (value == null) {
          continue;
        }

        seen = true;
        low = math.min(low, value);
        high = math.max(high, value);
      }
    }
  }

  return seen ? ChartExtent(low, high) : null;
}

/* ------------------------------------------------------------------- ticks */

double _log10(double value) => math.log(value) / math.ln10;

/// 1, 2, 5, 10 — the steps a reader can do arithmetic on without stopping.
double niceStep(double rough) {
  final double magnitude = math.pow(10, _log10(rough).floor()).toDouble();
  final double normalised = rough / magnitude;

  if (normalised <= 1) {
    return magnitude;
  }

  if (normalised <= 2) {
    return 2 * magnitude;
  }

  if (normalised <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

/// A step that lands on **both** ends of a range the caller pinned.
///
/// Where `min` and `max` are both given the ends cannot move, so the step is
/// what has to give — and a step that does not divide the range leaves the top
/// tick missing. The family is widened by 2.5 and searched for whichever
/// divides the range exactly and lands nearest the tick count asked for.
double dividingStep(double range, int tickCount) {
  final double magnitude = math.pow(10, _log10(range / math.max(1, tickCount)).floor()).toDouble();
  double best = niceStep(range / math.max(1, tickCount));
  double closest = double.infinity;

  for (final double scale in <double>[0.1, 1, 10]) {
    for (final double unit in <double>[1, 2, 2.5, 5]) {
      final double step = unit * scale * magnitude;
      final double count = range / step;
      final int whole = count.round();

      // A floating-point guard rather than a fudge: `0.5 / 0.1` is
      // 4.999999999999999.
      if (whole < 1 || (count - whole).abs() > 1e-9) {
        continue;
      }

      final int distance = (whole - tickCount).abs();

      if (distance < closest) {
        closest = distance.toDouble();
        best = step;
      }
    }
  }

  return best;
}

/// A value axis: where it starts, where it ends, and what it ticks at.
class ValueScale {
  /// Creates a scale.
  const ValueScale(this.min, this.max, this.ticks);

  /// Where it starts.
  final double min;

  /// Where it ends.
  final double max;

  /// The values it ticks at.
  final List<double> ticks;

  /// [value] as a fraction of the plot: `0` at [min], `1` at [max].
  double fraction(double value) {
    final double span = max - min;

    return (value - min) / (span == 0 ? 1 : span);
  }
}

/// The scale a value axis runs on, rounded out to numbers.
///
/// Rounding **outward** is the part that matters: a maximum of 4,830 becomes
/// 5,000, so the tallest mark stops short of the ceiling. Zero stays in range
/// unless the caller says otherwise, because a bar's length is proportional to
/// its value only from a zero baseline.
ValueScale valueScale(
  ChartExtent? extent, {
  double? min,
  double? max,
  int? tickCount,
  bool includeZero = true,
}) {
  final int count = tickCount ?? 5;
  double low = min ?? extent?.min ?? 0;
  double high = max ?? extent?.max ?? 1;

  if (includeZero && min == null) {
    low = math.min(low, 0);
  }

  if (includeZero && max == null) {
    high = math.max(high, 0);
  }

  // A flat series has no extent to divide by. Open a band around it rather
  // than drawing every mark off the top of the plot.
  if (high == low) {
    final double pad = high.abs() > 0 ? high.abs() * 0.5 : 1;

    low -= pad;
    high += pad;
  }

  final bool pinned = min != null && max != null;
  final double step = pinned
      ? dividingStep(high - low, count)
      : niceStep((high - low) / math.max(1, count));

  final double start = min != null ? low : (low / step).floor() * step;
  final double end = max != null ? high : (high / step).ceil() * step;
  final List<double> ticks = <double>[];

  // The epsilon is the same floating-point guard: `0.1 * 3` is
  // 0.30000000000000004, and without room for it the last tick falls off.
  for (double tick = start; tick <= end + step * 1e-9; tick += step) {
    ticks.add(double.parse(tick.toStringAsFixed(12)));

    if (ticks.length > 500) {
      break;
    }
  }

  return ValueScale(start, end, ticks);
}

/// A band scale: one slot per category, with the marks centred in it.
class BandScale {
  /// Divides [length] into [count] slots, of which the marks take [ratio].
  BandScale(int count, double length, double ratio)
    : step = count > 0 ? length / count : length,
      band = (count > 0 ? length / count : length) * ratio;

  /// How wide one slot is.
  final double step;

  /// How much of a slot the marks in it may take, together.
  final double band;

  /// The centre of category [index], in pixels along the axis.
  double centre(int index) => step * (index + 0.5);
}

/* ------------------------------------------------------------------ labels */

/// Hangul jamo, CJK radicals through Yi, Hangul syllables, compatibility
/// ideographs and the vertical forms: the characters that take a full em.
final RegExp _wide = RegExp('[ᄀ-ᇿ⺀-꓏가-퟿豈-﫿︰-﹏]');

/// Roughly how wide [text] renders at [fontSize].
///
/// An estimate on purpose, as the React build's is: what the number decides is
/// how much room to reserve, where a few pixels of generosity cost nothing and
/// measuring every label on every layout costs a frame. 0.6em is about the
/// advance of a digit; a CJK character is close to a full em.
double textWidth(String text, double fontSize) {
  double width = 0;

  for (final int rune in text.runes) {
    width += _wide.hasMatch(String.fromCharCode(rune)) ? 1 : 0.6;
  }

  return width * fontSize;
}

/// A label cut to the room it has, with an ellipsis.
///
/// Cut rather than dropped: the first few characters tell five words apart,
/// and the hover panel and the reading still carry the whole of it.
String truncateLabel(String text, double maxWidth, double fontSize) {
  if (maxWidth <= 0 || textWidth(text, fontSize) <= maxWidth) {
    return text;
  }

  final double room = maxWidth - textWidth('…', fontSize);
  final StringBuffer cut = StringBuffer();
  double width = 0;

  for (final int rune in text.runes) {
    final String character = String.fromCharCode(rune);
    final double next = width + textWidth(character, fontSize);

    if (next > room) {
      break;
    }

    width = next;
    cut.write(character);
  }

  final String kept = cut.toString().trimRight();

  return kept.isEmpty ? '…' : '$kept…';
}

/// How many labels an axis can show before they collide — every nth.
int tickStride(int count, double available, double labelWidth) {
  if (count <= 1 || available <= 0) {
    return 1;
  }

  return math.max(1, (count / math.max(1, (available / math.max(1, labelWidth)).floor())).ceil());
}

/// Whether the label at [index] survives the stride: every nth, and the last
/// one where it fits, which is the number a reader looks for first.
bool showsTick(int index, int count, int stride, {required bool roomForLast}) {
  return index % stride == 0 || (roomForLast && index == count - 1);
}

/// Whether the last label clears the last one the stride kept.
bool fitsLast(int count, int stride, double step, double labelWidth) {
  final int over = (count - 1) % stride;

  return over > 0 && over * step >= labelWidth + 8;
}

/// The angle a turned label is drawn at first, in degrees anticlockwise.
const double _rotated = 45;

/// And the upright one.
const double _vertical = 90;

/// How much clear page two flat labels want between them.
const double labelAir = 12;

/// How long a label has to be before `auto` turns it, in ems: about five
/// characters. Below that a label is an abbreviation, and an axis crowded with
/// those wants every nth rather than a turn.
const double _turnFrom = 3;

/// A label's line box, as a multiple of its font size.
const double _lineHeight = 1.35;

/// How far a label lies off the horizontal, in degrees.
///
/// `auto` keeps flat labels while the widest one fits its slot, then tries 45°
/// before standing them on end. Short labels are left flat whatever the
/// crowding.
double tickTurn(MPChartTickLabels? mode, List<String> texts, double fontSize, double slot) {
  if (mode == MPChartTickLabels.rotate) {
    return _rotated;
  }

  if (mode == MPChartTickLabels.vertical) {
    return _vertical;
  }

  if (mode == MPChartTickLabels.truncate || mode == null) {
    return 0;
  }

  final double widest = texts.fold<double>(0, (double most, String text) {
    return math.max(most, textWidth(text, fontSize));
  });

  if (widest + labelAir <= slot || widest < fontSize * _turnFrom) {
    return 0;
  }

  return slot >= turnedStep(_rotated, fontSize) ? _rotated : _vertical;
}

/// How much room one turned label needs **along** its axis: its line box,
/// opened out by the angle, which does not grow with the label.
double turnedStep(double angle, double fontSize) {
  final double radians = angle * math.pi / 180;

  return (fontSize * _lineHeight) / math.max(0.2, math.sin(radians));
}

/// How deep a band of turned labels is, for the widest of them.
double turnedBand(double angle, double widest, double fontSize) {
  final double radians = angle * math.pi / 180;

  return widest * math.sin(radians) + (fontSize * _lineHeight * math.cos(radians)) / 2;
}

/// The widest a label may print at before a band of [depth] would overflow.
double turnedRoom(double angle, double depth, double fontSize) {
  final double radians = angle * math.pi / 180;

  return (depth - (fontSize * _lineHeight * math.cos(radians)) / 2) /
      math.max(0.2, math.sin(radians));
}

/* -------------------------------------------------------------------- data */

/// One datum, unpacked into the parts the frame reads.
class ChartValue {
  /// Creates a value.
  const ChartValue({this.value, this.x, this.z, this.color, this.label});

  /// The value, or `null` for a gap.
  final double? value;

  /// Its own place on the category axis.
  final MPChartCategory? x;

  /// Its second magnitude.
  final double? z;

  /// Its own colour, overriding its series'.
  final MPChartColor? color;

  /// What it calls itself.
  final String? label;
}

/// A gap.
const ChartValue chartGap = ChartValue();

/// A datum in the one shape everything downstream reads.
///
/// Every way of being absent collapses to a `null` value here — `null`, a
/// `NaN`, an infinity, a type that is not a number — because they mean the same
/// thing to a reader and must mean the same thing to the path builder.
ChartValue toValue(MPChartDatum datum) {
  if (datum is num) {
    return datum.isFinite ? ChartValue(value: datum.toDouble()) : chartGap;
  }

  if (datum is MPChartPoint) {
    final double? y = datum.y;

    return ChartValue(
      value: y == null || !y.isFinite ? null : y,
      x: datum.x,
      z: datum.z,
      color: datum.color,
      label: datum.label,
    );
  }

  return chartGap;
}

/// Every series unpacked, in the order it was given.
List<List<ChartValue>> toValues(List<MPChartSeries> series) => <List<ChartValue>>[
  for (final MPChartSeries one in series)
    <ChartValue>[for (final Object? d in one.data) toValue(d)],
];

/// A category as a number: a [DateTime] is its epoch milliseconds, a [num]
/// itself, and anything else `null`.
double? toNumber(Object? value) {
  if (value is DateTime) {
    return value.millisecondsSinceEpoch.toDouble();
  }

  if (value is num) {
    return value.isFinite ? value.toDouble() : null;
  }

  return null;
}

/// How many categories there are: the longest series decides.
int categoryCount(List<MPChartSeries> series) {
  return series.fold<int>(0, (int most, MPChartSeries one) => math.max(most, one.data.length));
}

/// What category [index] is called: the chart's own `categories` first, then
/// whatever a point said its `x` was, then the index.
MPChartCategory categoryAt(
  int index,
  List<MPChartCategory>? categories,
  List<List<ChartValue>> values,
) {
  if (categories != null && index < categories.length) {
    return categories[index];
  }

  for (final List<ChartValue> one in values) {
    final MPChartCategory? x = index < one.length ? one[index].x : null;

    if (x != null) {
      return x;
    }
  }

  return index;
}

/// Which points of one series a value label is written beside, as a test on a
/// point's index. Worked out once per series rather than once per point.
///
/// [last] names the index `last` means. Left out, it is the last point with a
/// value, which is what a line means by it.
bool Function(int index) valueLabelTest(
  List<ChartValue> series,
  MPChartValueLabels mode, {
  int? last,
}) {
  switch (mode) {
    case MPChartValueLabels.all:
      return (int index) => true;
    case MPChartValueLabels.none:
      return (int index) => false;
    case MPChartValueLabels.last:
      int at = last ?? -1;

      if (last == null) {
        for (int index = series.length - 1; index >= 0; index -= 1) {
          if (series[index].value != null) {
            at = index;
            break;
          }
        }
      }

      return (int index) => index == at;
    case MPChartValueLabels.extremes:
      final ChartExtent? found = bounds(<double>[
        for (final ChartValue one in series)
          if (one.value != null) one.value!,
      ]);

      return (int index) {
        final double? value = index < series.length ? series[index].value : null;

        return found != null && value != null && (value == found.min || value == found.max);
      };
  }
}

/// A category as the axis writes it.
///
/// A [DateTime] gets a short day, `Mar 4`: an axis is a row of labels that
/// have to fit beside each other. The year is the caller's to add with
/// `tickFormat` when a chart spans one.
String formatCategory(MPChartCategory value, MPDateNames names) {
  if (value is DateTime) {
    return '${names.monthsShort[value.month - 1]} ${value.day}';
  }

  if (value is num) {
    return plainNumber(value.toDouble());
  }

  return value.toString();
}

/* -------------------------------------------------------------------- size */

/// How tall the drawing is, before the caller says otherwise. Not the control
/// ladder: `md` at 220 gives five gridlines about forty pixels apart.
const Map<MPSize, double> chartPlotHeight = <MPSize, double>{
  MPSize.xs: 120,
  MPSize.sm: 160,
  MPSize.md: 220,
  MPSize.lg: 280,
  MPSize.xl: 360,
};

/// What the axis labels are set in, in pixels.
const Map<MPSize, double> chartFontSize = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 11,
  MPSize.md: 12,
  MPSize.lg: 13,
  MPSize.xl: 14,
};

/// How heavy a line is. Two pixels at `md`.
const Map<MPSize, double> chartLineWidth = <MPSize, double>{
  MPSize.xs: 1.5,
  MPSize.sm: 1.75,
  MPSize.md: 2,
  MPSize.lg: 2.5,
  MPSize.xl: 3,
};

/// How big a marker is. `md` at 4 makes an 8px dot, the floor for a mark a
/// pointer is expected to land on.
const Map<MPSize, double> chartMarkerRadius = <MPSize, double>{
  MPSize.xs: 3,
  MPSize.sm: 3.5,
  MPSize.md: 4,
  MPSize.lg: 4.5,
  MPSize.xl: 5,
};

/// The gap of surface between two marks that would otherwise touch. Where two
/// fills meet with no gap the eye reads one shape.
const double chartMarkGap = 2;

/// How much a bar's data end is rounded.
const double chartBarRadius = 4;

/// How thick a bar is allowed to get. Past this a bar stops reading as a
/// measured length and starts reading as a block of colour.
const Map<MPSize, double> chartBarMaxThickness = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 32,
  MPSize.md: 40,
  MPSize.lg: 48,
  MPSize.xl: 56,
};

/// How much of its slot a band of bars takes, leaving the rest as air.
const double chartBarBandRatio = 0.72;

/* -------------------------------------------------------------------- arcs */

/// A point on a circle, with zero at twelve o'clock and the angle growing
/// clockwise, the way a clock is read.
Offset polarPoint(double cx, double cy, double radius, double angle) {
  return Offset(cx + radius * math.sin(angle), cy - radius * math.cos(angle));
}

/// A ring segment, or a pie slice when [inner] is nothing, between two angles
/// in the clock convention.
///
/// A full turn is drawn as two arcs rather than one: an arc from a point back
/// to the same point draws nothing, and a single-category pie is a real chart.
Path arcPath(double cx, double cy, double outer, double inner, double from, double to) {
  final Path path = Path();
  final double sweep = to - from;

  if (sweep.abs() < 1e-9 || outer <= 0) {
    return path;
  }

  final bool full = sweep.abs() >= math.pi * 2 - 1e-9;
  final double end = full ? from + math.pi * 2 * (sweep < 0 ? -1 : 1) : to;
  final Rect outerBox = Rect.fromCircle(center: Offset(cx, cy), radius: outer);
  // The clock convention measures from twelve o'clock clockwise; the canvas
  // measures from three o'clock clockwise.
  final double start = from - math.pi / 2;
  final double turn = end - from;

  if (full) {
    path
      ..addArc(outerBox, start, turn / 2)
      ..arcTo(outerBox, start + turn / 2, turn / 2, false);
  } else {
    final Offset first = polarPoint(cx, cy, outer, from);

    if (inner <= 0) {
      path
        ..moveTo(cx, cy)
        ..lineTo(first.dx, first.dy);
    } else {
      path.moveTo(first.dx, first.dy);
    }

    path.arcTo(outerBox, start, turn, false);
  }

  if (inner <= 0) {
    return path..close();
  }

  final Rect innerBox = Rect.fromCircle(center: Offset(cx, cy), radius: inner);

  if (full) {
    // The hole as a second contour, so the even-odd fill leaves it empty.
    path
      ..close()
      ..addArc(innerBox, start, turn / 2)
      ..arcTo(innerBox, start + turn / 2, turn / 2, false)
      ..close()
      ..fillType = PathFillType.evenOdd;

    return path;
  }

  final Offset innerEnd = polarPoint(cx, cy, inner, end);

  return path
    ..lineTo(innerEnd.dx, innerEnd.dy)
    ..arcTo(innerBox, end - math.pi / 2, -turn, false)
    ..close();
}

/// The extent of the **category** values, for an axis that runs on numbers.
/// Only points that have a value count.
ChartExtent? categoryExtent(List<List<ChartValue>> values, List<MPChartCategory>? categories) {
  double low = double.infinity;
  double high = double.negativeInfinity;
  bool seen = false;

  for (final List<ChartValue> one in values) {
    for (int index = 0; index < one.length; index += 1) {
      if (one[index].value == null) {
        continue;
      }

      final double? x = pointX(one[index], index, categories);

      if (x == null) {
        continue;
      }

      seen = true;
      low = math.min(low, x);
      high = math.max(high, x);
    }
  }

  return seen ? ChartExtent(low, high) : null;
}

/// Where one point sits along a category axis that runs on numbers: its own
/// `x`, then the chart's category at its index, then the index.
double? pointX(ChartValue value, int index, List<MPChartCategory>? categories) {
  final Object own =
      value.x ?? (categories != null && index < categories.length ? categories[index] : index);

  return toNumber(own);
}

/// The shapes a scatter's marks take, in the order they are handed out.
enum ChartMarkShape {
  /// The mark a scatter is expected to use.
  circle,

  /// Told apart by its corners.
  square,

  /// By having three of them.
  triangle,

  /// A square turned.
  diamond,

  /// A stroke rather than a fill.
  cross,
}

/// The scale that gives each shape the **area** of a circle of the same
/// radius, so no series looks heavier than another for no reason in the data.
const Map<ChartMarkShape, double> _shapeScale = <ChartMarkShape, double>{
  ChartMarkShape.circle: 1,
  ChartMarkShape.square: 0.886,
  ChartMarkShape.triangle: 1.35,
  ChartMarkShape.diamond: 1.25,
  ChartMarkShape.cross: 1.1,
};

/// One mark, centred on a point.
Path markPath(ChartMarkShape shape, double cx, double cy, double radius) {
  final double r = radius * _shapeScale[shape]!;

  switch (shape) {
    case ChartMarkShape.square:
      return Path()..addRect(Rect.fromLTRB(cx - r, cy - r, cx + r, cy + r));
    case ChartMarkShape.triangle:
      // Centred on its centroid rather than on the middle of its box, so a
      // triangle and a circle at the same point sit on the same spot.
      return Path()
        ..moveTo(cx, cy - r)
        ..lineTo(cx + r * 0.866, cy + r * 0.5)
        ..lineTo(cx - r * 0.866, cy + r * 0.5)
        ..close();
    case ChartMarkShape.diamond:
      return Path()
        ..moveTo(cx, cy - r)
        ..lineTo(cx + r, cy)
        ..lineTo(cx, cy + r)
        ..lineTo(cx - r, cy)
        ..close();
    case ChartMarkShape.cross:
      return Path()
        ..moveTo(cx - r, cy - r)
        ..lineTo(cx + r, cy + r)
        ..moveTo(cx + r, cy - r)
        ..lineTo(cx - r, cy + r);
    case ChartMarkShape.circle:
      return Path()..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r));
  }
}

/// How big a bubble is, for a magnitude carried by its **area**: the radius
/// goes as the square root, so twice the number is twice the ink.
double bubbleRadius(double z, double maxZ, double max, double min) {
  if (maxZ <= 0 || z <= 0) {
    return min;
  }

  return min + (max - min) * math.sqrt(math.min(1, z / maxZ));
}

/* -------------------------------------------------------------------- ramp */

/// How many steps the sequential ramp has.
const int rampSteps = 5;

/// Which step of the ramp a fraction of the range lands on. Steps rather than
/// a gradient, so a reader can match a cell to a band in the legend.
int rampStep(double fraction) {
  if (!fraction.isFinite) {
    return 0;
  }

  return math.min(rampSteps - 1, math.max(0, (fraction * rampSteps).floor()));
}

/// The colour of one step, by its index from the low end.
Color rampFill(MPColorScheme colors, int step) => colors.chartScale[step.clamp(0, rampSteps - 1)];

/// The ink a label sits in **on** a ramp step: the two deepest steps take the
/// surface's colour and the rest take `onSurface`.
Color rampInk(MPColorScheme colors, int step) {
  return step >= rampSteps - 2 ? colors.surface : colors.onSurface;
}

/* -------------------------------------------------------------------- time */

/// The units a time axis steps in.
enum ChartTimeUnit {
  /// Seconds.
  second,

  /// Minutes.
  minute,

  /// Hours.
  hour,

  /// Days.
  day,

  /// Weeks, from Monday.
  week,

  /// Months.
  month,

  /// Years.
  year,
}

const int _second = 1000;
const int _minute = 60 * _second;
const int _hour = 60 * _minute;
const int _day = 24 * _hour;

/// The steps a clock and a calendar actually have, smallest first. `size` is
/// nominal and only chooses the step; the ticks are walked by the calendar.
const List<(ChartTimeUnit, int, int)> _timeSteps = <(ChartTimeUnit, int, int)>[
  (ChartTimeUnit.second, 1, _second),
  (ChartTimeUnit.second, 5, 5 * _second),
  (ChartTimeUnit.second, 15, 15 * _second),
  (ChartTimeUnit.second, 30, 30 * _second),
  (ChartTimeUnit.minute, 1, _minute),
  (ChartTimeUnit.minute, 5, 5 * _minute),
  (ChartTimeUnit.minute, 15, 15 * _minute),
  (ChartTimeUnit.minute, 30, 30 * _minute),
  (ChartTimeUnit.hour, 1, _hour),
  (ChartTimeUnit.hour, 3, 3 * _hour),
  (ChartTimeUnit.hour, 6, 6 * _hour),
  (ChartTimeUnit.hour, 12, 12 * _hour),
  (ChartTimeUnit.day, 1, _day),
  (ChartTimeUnit.day, 2, 2 * _day),
  (ChartTimeUnit.week, 1, 7 * _day),
  (ChartTimeUnit.month, 1, 30 * _day),
  (ChartTimeUnit.month, 3, 91 * _day),
  (ChartTimeUnit.year, 1, 365 * _day),
];

/// The start of the unit [time] falls in.
int _floorTime(int time, ChartTimeUnit unit) {
  final DateTime at = DateTime.fromMillisecondsSinceEpoch(time);

  switch (unit) {
    case ChartTimeUnit.second:
      return DateTime(
        at.year,
        at.month,
        at.day,
        at.hour,
        at.minute,
        at.second,
      ).millisecondsSinceEpoch;
    case ChartTimeUnit.minute:
      return DateTime(at.year, at.month, at.day, at.hour, at.minute).millisecondsSinceEpoch;
    case ChartTimeUnit.hour:
      return DateTime(at.year, at.month, at.day, at.hour).millisecondsSinceEpoch;
    case ChartTimeUnit.day:
      return DateTime(at.year, at.month, at.day).millisecondsSinceEpoch;
    case ChartTimeUnit.week:
      // Back to the Monday: a week on a chart is a week of work.
      return DateTime(at.year, at.month, at.day - (at.weekday - 1)).millisecondsSinceEpoch;
    case ChartTimeUnit.month:
      return DateTime(at.year, at.month).millisecondsSinceEpoch;
    case ChartTimeUnit.year:
      return DateTime(at.year).millisecondsSinceEpoch;
  }
}

/// [count] units after [time], by the calendar rather than by arithmetic, so a
/// month is a month and a day survives the clocks going back.
int _addTime(int time, ChartTimeUnit unit, int count) {
  final DateTime at = DateTime.fromMillisecondsSinceEpoch(time);

  switch (unit) {
    case ChartTimeUnit.second:
      return time + count * _second;
    case ChartTimeUnit.minute:
      return time + count * _minute;
    case ChartTimeUnit.hour:
      return DateTime(
        at.year,
        at.month,
        at.day,
        at.hour + count,
        at.minute,
        at.second,
      ).millisecondsSinceEpoch;
    case ChartTimeUnit.day:
      return DateTime(at.year, at.month, at.day + count, at.hour, at.minute).millisecondsSinceEpoch;
    case ChartTimeUnit.week:
      return DateTime(
        at.year,
        at.month,
        at.day + count * 7,
        at.hour,
        at.minute,
      ).millisecondsSinceEpoch;
    case ChartTimeUnit.month:
      return DateTime(at.year, at.month + count, at.day, at.hour).millisecondsSinceEpoch;
    case ChartTimeUnit.year:
      return DateTime(at.year + count, at.month, at.day, at.hour).millisecondsSinceEpoch;
  }
}

/// The first tick: floored to the unit, then back to a multiple of the count,
/// so a three-hour axis ticks at 00:00, 03:00, 06:00.
int _alignTime(int time, ChartTimeUnit unit, int count) {
  final int floored = _floorTime(time, unit);

  if (count <= 1) {
    return floored;
  }

  final DateTime at = DateTime.fromMillisecondsSinceEpoch(floored);

  switch (unit) {
    case ChartTimeUnit.second:
      return DateTime(
        at.year,
        at.month,
        at.day,
        at.hour,
        at.minute,
        at.second ~/ count * count,
      ).millisecondsSinceEpoch;
    case ChartTimeUnit.minute:
      return DateTime(
        at.year,
        at.month,
        at.day,
        at.hour,
        at.minute ~/ count * count,
      ).millisecondsSinceEpoch;
    case ChartTimeUnit.hour:
      return DateTime(at.year, at.month, at.day, at.hour ~/ count * count).millisecondsSinceEpoch;
    case ChartTimeUnit.month:
      return DateTime(at.year, (at.month - 1) ~/ count * count + 1).millisecondsSinceEpoch;
    case ChartTimeUnit.year:
      return DateTime(at.year ~/ count * count).millisecondsSinceEpoch;
    case ChartTimeUnit.day:
    case ChartTimeUnit.week:
      // A two-day step has no natural anchor, so it starts where the data do.
      return floored;
  }
}

/// A value scale whose ticks are instants, plus the unit they step in.
class TimeScale extends ValueScale {
  /// Creates a time scale.
  const TimeScale(super.min, super.max, super.ticks, this.unit, this.count);

  /// What a tick is a step of.
  final ChartTimeUnit unit;

  /// How many of [unit] each step covers.
  final int count;
}

/// The scale an axis of instants runs on.
///
/// The 1-2-5-10 family is exactly wrong for a moment: run on milliseconds it
/// lands a tick at 14:53:20 on an arbitrary Tuesday. The step nearest the one
/// that gives [tickCount] ticks is chosen by ratio, and the ends round outward
/// to it, so an axis of work starting on a Wednesday afternoon begins at
/// midnight on the Wednesday.
TimeScale timeScale(ChartExtent? extent, {double? min, double? max, int? tickCount}) {
  final int ticksWanted = tickCount ?? 6;
  final int low = (min ?? extent?.min ?? DateTime.now().millisecondsSinceEpoch.toDouble()).round();
  final int high = (max ?? extent?.max ?? (low + _day).toDouble()).round();
  // A single instant has no range to divide. Two hours is a scale a reader can
  // place it on.
  final int range = high - low == 0 ? _hour * 2 : high - low;
  final double ideal = range / math.max(1, ticksWanted);

  (ChartTimeUnit, int, int) step = _timeSteps.first;

  for (final (ChartTimeUnit, int, int) one in _timeSteps) {
    if ((math.log(one.$3 / ideal)).abs() < (math.log(step.$3 / ideal)).abs()) {
      step = one;
    }
  }

  final ChartTimeUnit unit = step.$1;
  // Past a year the table runs out, so the count of years takes the 1-2-5-10
  // family again: years are counted rather than clocked.
  final int count = unit == ChartTimeUnit.year
      ? math.max(1, niceStep(math.max(1, range / (365 * _day) / ticksWanted)).round())
      : step.$2;

  final int start = min != null ? low : _alignTime(low, unit, count);
  int end;

  if (max != null) {
    end = high;
  } else {
    // At least one step, so a single instant that is itself a landmark is
    // still a scale rather than a point.
    end = start;

    do {
      end = _addTime(end, unit, count);
    } while (end < high);
  }

  final List<double> ticks = <double>[];

  for (int tick = start; tick <= end; tick = _addTime(tick, unit, count)) {
    ticks.add(tick.toDouble());

    if (ticks.length > 500) {
      break;
    }
  }

  return TimeScale(start.toDouble(), end.toDouble(), ticks, unit, count);
}

/// A tick written at the resolution its step implies: clock times for hours,
/// month names for months.
String formatTimeTick(double value, ChartTimeUnit unit, MPDateNames names) {
  final DateTime at = DateTime.fromMillisecondsSinceEpoch(value.round());
  String two(int part) => part.toString().padLeft(2, '0');

  switch (unit) {
    case ChartTimeUnit.second:
      return '${two(at.minute)}:${two(at.second)}';
    case ChartTimeUnit.minute:
    case ChartTimeUnit.hour:
      return '${two(at.hour)}:${two(at.minute)}';
    case ChartTimeUnit.day:
    case ChartTimeUnit.week:
      return '${names.monthsShort[at.month - 1]} ${at.day}';
    case ChartTimeUnit.month:
      return '${names.monthsShort[at.month - 1]} ${at.year}';
    case ChartTimeUnit.year:
      return '${at.year}';
  }
}
