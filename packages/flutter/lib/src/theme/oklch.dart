/// OKLab, OKLCh and sRGB, written out rather than installed.
///
/// The React package derives its scheme in the browser, with CSS relative
/// colour syntax: `oklch(from var(--mp-source-color) L C h)`, then a pull
/// towards grey until the colour fits inside sRGB. This file is the same
/// arithmetic in Dart, step for step, so that a scheme given the same source
/// colour comes out as the same hex in both packages. That is the whole reason
/// it exists rather than `material_color_utilities`: HCT is the better colour
/// model, and it is not the one the other half of this library uses.
///
/// Nothing here is exported from `material_plus_ui.dart`. It is the library
/// talking to itself, in the sense `internal/` always means.
library;

import 'dart:math' as math;
import 'dart:ui' show Color;

/// A colour in OKLCh: lightness 0 to 1, chroma from 0, hue in degrees.
class MPOklch {
  /// Creates a colour from its three coordinates.
  const MPOklch(this.l, this.c, this.h);

  /// Reads [color] into OKLCh. Its alpha is ignored.
  factory MPOklch.fromColor(Color color) {
    final List<double> lab = _linearToOklab(
      _toLinear(color.r),
      _toLinear(color.g),
      _toLinear(color.b),
    );
    final double c = math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
    double h = math.atan2(lab[2], lab[1]) * 180 / math.pi;

    if (h < 0) {
      h += 360;
    }

    return MPOklch(lab[0], c, h);
  }

  /// Lightness, 0 to 1.
  final double l;

  /// Chroma, from 0. sRGB tops out a little under 0.4.
  final double c;

  /// Hue, in degrees.
  final double h;

  /// This colour in sRGB, each channel clipped on its own.
  ///
  /// What a browser does with an `oklch()` that falls outside the gamut, and so
  /// what the chart ramp and the near-grey roles come out as on the web. A
  /// clipped channel moves the hue a little, which does not matter for a
  /// colour that was inside the gamut to begin with and is why the accent roles
  /// go through [mpFitToSrgb] instead.
  Color toColor() {
    final List<double> rgb = _oklabToLinear(l, c * _cosDeg(h), c * _sinDeg(h));

    return _linearToColor(rgb[0], rgb[1], rgb[2]);
  }

  @override
  String toString() => 'MPOklch($l, $c, $h)';
}

/// The colour at lightness [l], chroma [c] and hue [h], pulled towards the grey
/// of the same lightness until it fits inside sRGB.
///
/// The token sheet's "Inside sRGB" step, in the same two passes. Each pass
/// finds how far along the line from that grey to the colour the gamut ends,
/// as the smallest of the three channels' answers. The first pass scales the
/// colour's chroma by it in OKLab, which keeps the hue; the second, in linear
/// sRGB, takes back whatever the curvature of the gamut boundary left over.
///
/// A colour that already fits comes back unchanged, since every channel then
/// answers one.
Color mpFitToSrgb(double l, double c, double h) {
  final double grey = l * l * l;
  final double a = c * _cosDeg(h);
  final double b = c * _sinDeg(h);

  final List<double> first = _oklabToLinear(l, a, b);
  final double reach = _reach(first, grey);
  final List<double> second = _oklabToLinear(l, a * reach, b * reach);
  final double rest = _reach(second, grey);

  return _linearToColor(
    grey + rest * (second[0] - grey),
    grey + rest * (second[1] - grey),
    grey + rest * (second[2] - grey),
  );
}

/// How far from [grey] towards [rgb] the gamut reaches, 0 to 1.
///
/// The `+ 0.0000001` on both sides is the token sheet's, and it is there for
/// the same reason: a channel exactly at the grey would otherwise divide zero
/// by zero, where it means "this channel sets no limit".
double _reach(List<double> rgb, double grey) {
  const double epsilon = 0.0000001;
  double reach = 1;

  for (final double channel in rgb) {
    final double clipped = channel.clamp(0.0, 1.0);
    final double ratio = (clipped - grey + epsilon) / (channel - grey + epsilon);

    if (ratio < reach) {
      reach = ratio;
    }
  }

  return reach.clamp(0.0, 1.0);
}

double _cosDeg(double degrees) => math.cos(degrees * math.pi / 180);

double _sinDeg(double degrees) => math.sin(degrees * math.pi / 180);

/// sRGB's transfer function, from a 0–1 channel to linear light.
double _toLinear(double channel) {
  return channel <= 0.04045 ? channel / 12.92 : math.pow((channel + 0.055) / 1.055, 2.4).toDouble();
}

/// And back, clipped into 0–1.
double _fromLinear(double channel) {
  final double clipped = channel.clamp(0.0, 1.0);

  return clipped <= 0.0031308
      ? clipped * 12.92
      : 1.055 * math.pow(clipped, 1 / 2.4).toDouble() - 0.055;
}

Color _linearToColor(double r, double g, double b) {
  int channel(double linear) => (_fromLinear(linear) * 255).round().clamp(0, 255);

  return Color.fromARGB(255, channel(r), channel(g), channel(b));
}

/// Björn Ottosson's matrices, as published with OKLab and as CSS Color 4 uses
/// them.
List<double> _oklabToLinear(double l, double a, double b) {
  final double l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  final double m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  final double s1 = l - 0.0894841775 * a - 1.2914855480 * b;

  final double l3 = l1 * l1 * l1;
  final double m3 = m1 * m1 * m1;
  final double s3 = s1 * s1 * s1;

  return <double>[
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ];
}

List<double> _linearToOklab(double r, double g, double b) {
  final double l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  final double m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  final double s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  final double l1 = _cbrt(l);
  final double m1 = _cbrt(m);
  final double s1 = _cbrt(s);

  return <double>[
    0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1,
    1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1,
    0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1,
  ];
}

double _cbrt(double value) {
  return value < 0 ? -math.pow(-value, 1 / 3).toDouble() : math.pow(value, 1 / 3).toDouble();
}
