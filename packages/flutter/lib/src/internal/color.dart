/// Colour arithmetic, written out rather than installed.
///
/// [MPColorPicker] is the only widget that has to *compute* a colour rather
/// than name one, and the whole of what it needs is here: three
/// representations, the conversions between them, one parser and one formatter.
/// It is a hundred lines of trigonometry-free arithmetic, which is the entire
/// reason a widget that computes colours brings no colour package with it — in
/// a package whose whole claim is that it has no dependencies at all.
///
/// Two decisions worth knowing before reading:
///
/// - **HSV is the model the panel is drawn in, and it never leaves.** A
///   saturation/value square with a hue rail beside it *is* HSV, so the picker
///   keeps its state that way and converts on the way out. Round-tripping
///   through RGB instead would lose the hue of every greyscale colour — black
///   is `#000` at every hue — and the rail would jump to red the moment the
///   pointer reached a corner.
/// - **`alpha` is 0–1, everything else is what CSS says it is.** `h` is
///   degrees, `s`/`v`/`l` are percentages, `r`/`g`/`b` are 0–255. Nothing here
///   invents a normalised unit, because every one of these numbers is
///   eventually written into a string a human reads.
///
/// None of it is exported from `material_plus_ui.dart` except the format enum the
/// picker's own parameters need.
library;

import 'dart:math' as math;
import 'dart:ui' show Color;

/// `h` in degrees, `s` and `v` as percentages. The panel's own model.
class MPHsv {
  /// Creates a colour in the panel's model.
  const MPHsv(this.h, this.s, this.v);

  /// Degrees, 0–360.
  final double h;

  /// Percent, 0–100.
  final double s;

  /// Percent, 0–100.
  final double v;

  /// The same colour with one channel replaced.
  MPHsv copyWith({double? h, double? s, double? v}) {
    return MPHsv(h ?? this.h, s ?? this.s, v ?? this.v);
  }
}

/// A colour and how much of it there is. `alpha` is 0–1.
class MPColorValue {
  /// Creates a colour and its opacity.
  const MPColorValue(this.hsv, this.alpha);

  /// The colour.
  final MPHsv hsv;

  /// 0–1.
  final double alpha;
}

/// The three ways the picker will write a colour back out.
enum MPColorFormat {
  /// `#rrggbb`, with an `aa` pair when the colour is translucent.
  hex,

  /// `rgb(r, g, b)`, or `rgba(…)` when it is translucent.
  rgb,

  /// `hsl(h, s%, l%)`, or `hsla(…)` when it is translucent.
  hsl,
}

double _clamp(double value, double min, double max) {
  return value < min ? min : (value > max ? max : value);
}

/// Degrees, wrapped rather than clamped — 370 is 10, and -10 is 350.
double _wrapHue(double hue) {
  final double wrapped = hue % 360;

  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/// The colour as something Flutter can paint.
Color hsvToColor(MPHsv hsv, [double alpha = 1]) {
  final List<int> rgb = hsvToRgb(hsv);

  return Color.fromARGB((_clamp(alpha, 0, 1) * 255).round(), rgb[0], rgb[1], rgb[2]);
}

/// `[r, g, b]`, each 0–255.
List<int> hsvToRgb(MPHsv hsv) {
  final double hue = _wrapHue(hsv.h) / 60;
  final double saturation = _clamp(hsv.s, 0, 100) / 100;
  final double value = _clamp(hsv.v, 0, 100) / 100;

  final double chroma = value * saturation;
  final double second = chroma * (1 - ((hue % 2) - 1).abs());
  final double base = value - chroma;

  final int sector = hue.floor() % 6;
  const List<List<int>> order = <List<int>>[
    <int>[0, 1, 2],
    <int>[1, 0, 2],
    <int>[2, 0, 1],
    <int>[2, 1, 0],
    <int>[1, 2, 0],
    <int>[0, 2, 1],
  ];

  // `parts` is chroma, the second-largest channel and zero; `order` says which
  // of the three each of r, g and b takes in this sixth of the wheel.
  final List<double> parts = <double>[chroma, second, 0];
  final List<int> indices = order[sector];

  return <int>[
    ((parts[indices[0]] + base) * 255).round(),
    ((parts[indices[1]] + base) * 255).round(),
    ((parts[indices[2]] + base) * 255).round(),
  ];
}

/// The panel's model, read back out of three channels.
MPHsv rgbToHsv(int r, int g, int b) {
  final double red = _clamp(r.toDouble(), 0, 255) / 255;
  final double green = _clamp(g.toDouble(), 0, 255) / 255;
  final double blue = _clamp(b.toDouble(), 0, 255) / 255;

  final double max = math.max(red, math.max(green, blue));
  final double min = math.min(red, math.min(green, blue));
  final double chroma = max - min;

  double hue = 0;

  if (chroma != 0) {
    if (max == red) {
      hue = ((green - blue) / chroma) % 6;
    } else if (max == green) {
      hue = (blue - red) / chroma + 2;
    } else {
      hue = (red - green) / chroma + 4;
    }
  }

  return MPHsv(_wrapHue(hue * 60), max == 0 ? 0 : (chroma / max) * 100, max * 100);
}

/// `[h, s, l]`, only ever an output format.
List<double> rgbToHsl(int r, int g, int b) {
  final MPHsv hsv = rgbToHsv(r, g, b);
  final double value = hsv.v / 100;
  final double saturation = hsv.s / 100;

  final double lightness = value * (1 - saturation / 2);
  final double divisor = math.min(lightness, 1 - lightness);

  return <double>[hsv.h, divisor == 0 ? 0 : ((value - lightness) / divisor) * 100, lightness * 100];
}

MPHsv _hslToHsv(double h, double s, double l) {
  final double lightness = _clamp(l, 0, 100) / 100;
  final double saturation = _clamp(s, 0, 100) / 100;
  final double value = lightness + saturation * math.min(lightness, 1 - lightness);

  return MPHsv(h, value == 0 ? 0 : 2 * (1 - lightness / value) * 100, value * 100);
}

final RegExp _hex = RegExp(r'^#?([0-9a-f]{3,8})$');
final RegExp _functional = RegExp(r'^(rgba?|hsla?)\((.*)\)$');
final RegExp _number = RegExp(r'-?[\d.]+%?');

MPColorValue? _parseHex(String source) {
  final RegExpMatch? match = _hex.firstMatch(source.trim());

  if (match == null) return null;

  final String digits = match.group(1)!;
  // `#abc` and `#abcd` are the same colours as `#aabbcc` and `#aabbccdd`, so
  // the short forms are doubled rather than parsed a second way.
  final String expanded = digits.length == 3 || digits.length == 4
      ? digits.split('').map((String digit) => '$digit$digit').join()
      : digits;

  if (expanded.length != 6 && expanded.length != 8) return null;

  int channel(int index) => int.parse(expanded.substring(index * 2, index * 2 + 2), radix: 16);

  return MPColorValue(
    rgbToHsv(channel(0), channel(1), channel(2)),
    expanded.length == 8 ? channel(3) / 255 : 1,
  );
}

/// A CSS colour string, or `null` if it is not one this understands.
///
/// Hex in all four lengths, and `rgb()`/`rgba()`/`hsl()`/`hsla()` in both the
/// comma and the space syntax. Named colours are deliberately out: a picker has
/// to be able to write every value it can read, and there is no honest way back
/// from a name to a point on the panel.
MPColorValue? parseColor(String input) {
  final String source = input.trim().toLowerCase();

  if (source.isEmpty) return null;

  if (source.startsWith('#') || _hex.hasMatch(source)) {
    return _parseHex(source);
  }

  final RegExpMatch? functional = _functional.firstMatch(source);

  if (functional == null) return null;

  final String name = functional.group(1)!;
  final String body = functional.group(2)!;
  final List<String> tokens = _number
      .allMatches(body)
      .map((RegExpMatch match) => match.group(0)!)
      .toList(growable: false);

  if (tokens.length < 3) return null;

  final List<double?> numbers = tokens.map(double.tryParse).toList(growable: false);
  final List<double?> parsed = <double?>[
    for (int index = 0; index < tokens.length; index += 1)
      tokens[index].endsWith('%')
          ? double.tryParse(tokens[index].substring(0, tokens[index].length - 1))
          : numbers[index],
  ];

  if (parsed.take(3).any((double? value) => value == null)) return null;

  double alpha = 1;

  if (parsed.length > 3 && parsed[3] != null) {
    alpha = _clamp(tokens[3].endsWith('%') ? parsed[3]! / 100 : parsed[3]!, 0, 1);
  }

  if (name.startsWith('rgb')) {
    return MPColorValue(
      rgbToHsv(parsed[0]!.round(), parsed[1]!.round(), parsed[2]!.round()),
      alpha,
    );
  }

  return MPColorValue(_hslToHsv(parsed[0]!, parsed[1]!, parsed[2]!), alpha);
}

String _hexPair(num value) {
  return _clamp(value.toDouble().roundToDouble(), 0, 255).toInt().toRadixString(16).padLeft(2, '0');
}

/// Two decimals at most, and no trailing zeroes: `0.5`, not `0.50`.
String _alphaText(double alpha) {
  final double rounded = (_clamp(alpha, 0, 1) * 100).roundToDouble() / 100;

  return rounded == rounded.roundToDouble() ? rounded.toInt().toString() : rounded.toString();
}

/// The value the widget hands back, in whichever notation was asked for.
///
/// `hex` drops the alpha pair when the colour is opaque, and the two functional
/// forms drop the fourth argument for the same reason — a caller who never
/// turned `alpha` on should never see `rgba(…, 1)` come out of a control they
/// only used three channels of.
String formatColor(MPHsv hsv, double alpha, MPColorFormat format) {
  final List<int> rgb = hsvToRgb(hsv);

  switch (format) {
    case MPColorFormat.hex:
      final String base = '#${_hexPair(rgb[0])}${_hexPair(rgb[1])}${_hexPair(rgb[2])}';

      return alpha >= 1 ? base : '$base${_hexPair(alpha * 255)}';
    case MPColorFormat.rgb:
      final String channels = '${rgb[0]}, ${rgb[1]}, ${rgb[2]}';

      return alpha >= 1 ? 'rgb($channels)' : 'rgba($channels, ${_alphaText(alpha)})';
    case MPColorFormat.hsl:
      final List<double> hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      final String channels = '${hsl[0].round()}, ${hsl[1].round()}%, ${hsl[2].round()}%';

      return alpha >= 1 ? 'hsl($channels)' : 'hsla($channels, ${_alphaText(alpha)})';
  }
}

/// Black or white, whichever can be read on top of this colour.
///
/// The tick on a chosen swatch is the only thing the picker draws *on* an
/// arbitrary colour, and a fixed white tick disappears on yellow. The threshold
/// is relative luminance rather than plain lightness, because the eye weighs
/// green about six times as heavily as blue and a colour model that pretends
/// otherwise puts the tick the wrong way round on both.
Color readableInk(MPHsv hsv) {
  final List<int> rgb = hsvToRgb(hsv);

  double channel(int value) {
    final double scaled = value / 255;

    return scaled <= 0.03928 ? scaled / 12.92 : math.pow((scaled + 0.055) / 1.055, 2.4).toDouble();
  }

  final double luminance =
      0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);

  return luminance > 0.42 ? const Color(0xFF000000) : const Color(0xFFFFFFFF);
}

/// The swatches a picker shows when it was given none.
///
/// Deliberately **not** the package's own six families: those are semantic
/// roles and a picker is asked for a colour, not for a meaning. This is a plain
/// spectrum plus the greys — the row somebody reaches for when they are
/// labelling a calendar, a tag or a project.
const List<String> defaultSwatches = <String>[
  '#000000',
  '#4b5563',
  '#9ca3af',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
];
