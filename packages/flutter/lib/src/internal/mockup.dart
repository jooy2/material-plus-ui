/// The parts a device mockup is drawn out of.
///
/// `MPMockup` is one widget with a lot of pictures in it: three devices, six
/// systems, four bezels, three finishes and four cut-outs. Kept in the widget,
/// that would be a long file whose interesting part (the scale, the screen,
/// the content) was buried in geometry. So the geometry lives here, as tables
/// and small drawings, the Dart half of the React package's
/// `internal/mockup.tsx`, and the widget keeps the decisions.
///
/// Every length below is in the device's own logical pixels. The device is laid
/// out at its own resolution and scaled once, at the top, so a 14px bezel stays
/// 14 device pixels whatever size the picture is drawn at.
///
/// The chrome draws no words. A menu bar's titles and a dock's icons are
/// rounded blocks, which keeps it an impression of a system rather than a copy
/// of one, with nothing to translate and no other party's marks in it.
///
/// Only the enums and [MPMockupResolution] are exported, through
/// `mp_mockup.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which machine the mockup is a picture of.
enum MPMockupDevice {
  /// A monitor or a laptop.
  desktop,

  /// A tablet.
  tablet,

  /// A phone.
  mobile,
}

/// The system whose chrome is drawn on the screen.
enum MPMockupOs {
  /// A menu bar along the top and a dock along the bottom. A desktop's default.
  macos,

  /// A taskbar along the bottom.
  windows,

  /// A top bar with the clock in the middle.
  linux,

  /// A status bar over a dynamic island and a home indicator. A phone's
  /// default.
  ios,

  /// The same, without a cut-out. A tablet's default.
  ipados,

  /// A status bar and three navigation glyphs along the bottom.
  android,
}

/// What holds a desktop screen up.
enum MPMockupHardware {
  /// A stand under it.
  monitor,

  /// A keyboard in front of it.
  laptop,
}

/// The camera cut-out along the top edge of a handheld.
enum MPMockupNotch {
  /// None.
  none,

  /// The older notch: a tab hanging off the top edge.
  notch,

  /// A pill held clear of the top edge.
  dynamicIsland,

  /// A single hole.
  punchHole,
}

/// How much hardware there is around the screen.
enum MPMockupBezel {
  /// No hardware at all, leaving the screen on its own with its corners cut:
  /// not a thinner bezel, but a mockup that only wants the viewport.
  none,

  /// A narrow frame.
  thin,

  /// The frame a current device has.
  standard,

  /// An older device: narrow sides, a forehead and a chin.
  thick,
}

/// What the hardware is made of.
enum MPMockupFinish {
  /// Dark grey.
  graphite,

  /// Light grey.
  silver,

  /// Near white.
  white,
}

/// Which way a handheld is held.
///
/// `portrait` and `landscape` rather than [MPOrientation]'s two words: a
/// divider running horizontally is not "landscape", and a device held upright
/// is not "vertical" in any vocabulary a designer uses.
enum MPMockupOrientation {
  /// Upright.
  portrait,

  /// On its side.
  landscape,
}

/// A screen's logical size, in logical pixels.
@immutable
class MPMockupResolution {
  /// Creates a resolution.
  const MPMockupResolution(this.width, this.height);

  /// Across.
  final double width;

  /// Down.
  final double height;

  @override
  bool operator ==(Object other) {
    return other is MPMockupResolution && other.width == width && other.height == height;
  }

  @override
  int get hashCode => Object.hash(width, height);

  @override
  String toString() => 'MPMockupResolution($width, $height)';
}

/// Which systems each device can be running, its default first.
const Map<MPMockupDevice, List<MPMockupOs>> _systems = <MPMockupDevice, List<MPMockupOs>>{
  MPMockupDevice.desktop: <MPMockupOs>[MPMockupOs.macos, MPMockupOs.windows, MPMockupOs.linux],
  MPMockupDevice.tablet: <MPMockupOs>[MPMockupOs.ipados, MPMockupOs.android],
  MPMockupDevice.mobile: <MPMockupOs>[MPMockupOs.ios, MPMockupOs.android],
};

/// The system to draw, with a mismatch corrected rather than refused.
///
/// `MPMockupOs.macos` on a phone is a caller who changed `device` and forgot
/// the other one, and the useful answer is the phone's own system.
MPMockupOs mockupOs(MPMockupDevice device, MPMockupOs? os) {
  final List<MPMockupOs> offered = _systems[device]!;

  return os != null && offered.contains(os) ? os : offered.first;
}

/// The cut-out a device has when nobody said otherwise.
MPMockupNotch mockupNotch(MPMockupDevice device, MPMockupOs os) {
  if (device != MPMockupDevice.mobile) {
    return MPMockupNotch.none;
  }

  return os == MPMockupOs.ios ? MPMockupNotch.dynamicIsland : MPMockupNotch.punchHole;
}

/// Five real resolutions per device, which is what `size` picks between: real
/// ones rather than a smooth ladder, because a layout tested at 390 and 430 has
/// been tested at the widths most phones actually are.
const Map<MPMockupDevice, Map<MPSize, MPMockupResolution>> mockupResolutions =
    <MPMockupDevice, Map<MPSize, MPMockupResolution>>{
      MPMockupDevice.mobile: <MPSize, MPMockupResolution>{
        MPSize.xs: MPMockupResolution(320, 568),
        MPSize.sm: MPMockupResolution(360, 780),
        MPSize.md: MPMockupResolution(390, 844),
        MPSize.lg: MPMockupResolution(414, 896),
        MPSize.xl: MPMockupResolution(430, 932),
      },
      MPMockupDevice.tablet: <MPSize, MPMockupResolution>{
        MPSize.xs: MPMockupResolution(744, 1133),
        MPSize.sm: MPMockupResolution(810, 1080),
        MPSize.md: MPMockupResolution(820, 1180),
        MPSize.lg: MPMockupResolution(1024, 1366),
        MPSize.xl: MPMockupResolution(1032, 1376),
      },
      MPMockupDevice.desktop: <MPSize, MPMockupResolution>{
        MPSize.xs: MPMockupResolution(1024, 640),
        MPSize.sm: MPMockupResolution(1280, 800),
        MPSize.md: MPMockupResolution(1440, 900),
        MPSize.lg: MPMockupResolution(1680, 1050),
        MPSize.xl: MPMockupResolution(1920, 1200),
      },
    };

/// How much hardware sits on each side of the screen.
@immutable
class MockupShell {
  /// Creates a shell.
  const MockupShell({
    required this.side,
    required this.top,
    required this.bottom,
    required this.radius,
  });

  /// Down each side.
  final double side;

  /// Above the screen.
  final double top;

  /// Below it.
  final double bottom;

  /// The outer corner.
  final double radius;
}

/// The hardware, per device and per bezel. `thick` is an older machine rather
/// than a thicker version of the same one: a forehead and a chin, narrow sides
/// and a squarer corner.
const Map<MPMockupDevice, Map<MPMockupBezel, MockupShell>> _shells =
    <MPMockupDevice, Map<MPMockupBezel, MockupShell>>{
      MPMockupDevice.mobile: <MPMockupBezel, MockupShell>{
        MPMockupBezel.thin: MockupShell(side: 10, top: 10, bottom: 10, radius: 46),
        MPMockupBezel.standard: MockupShell(side: 14, top: 14, bottom: 14, radius: 52),
        MPMockupBezel.thick: MockupShell(side: 12, top: 62, bottom: 82, radius: 26),
      },
      MPMockupDevice.tablet: <MPMockupBezel, MockupShell>{
        MPMockupBezel.thin: MockupShell(side: 14, top: 14, bottom: 14, radius: 28),
        MPMockupBezel.standard: MockupShell(side: 22, top: 22, bottom: 22, radius: 36),
        MPMockupBezel.thick: MockupShell(side: 20, top: 58, bottom: 58, radius: 22),
      },
      MPMockupDevice.desktop: <MPMockupBezel, MockupShell>{
        MPMockupBezel.thin: MockupShell(side: 10, top: 10, bottom: 10, radius: 12),
        MPMockupBezel.standard: MockupShell(side: 14, top: 14, bottom: 52, radius: 16),
        MPMockupBezel.thick: MockupShell(side: 20, top: 20, bottom: 72, radius: 10),
      },
    };

/// The corner a screen keeps when there is no hardware around it.
const Map<MPMockupDevice, double> _bareRadius = <MPMockupDevice, double>{
  MPMockupDevice.mobile: 44,
  MPMockupDevice.tablet: 26,
  MPMockupDevice.desktop: 8,
};

/// The stand under a monitor.
@immutable
class MockupStand {
  /// Creates a stand.
  const MockupStand({
    required this.neckWidth,
    required this.neckHeight,
    required this.footWidth,
    required this.footHeight,
  });

  /// The neck's width.
  final double neckWidth;

  /// The neck's height.
  final double neckHeight;

  /// The foot's width.
  final double footWidth;

  /// The foot's height.
  final double footHeight;
}

/// The keyboard a laptop's screen sits on.
@immutable
class MockupLaptop {
  /// Creates a base.
  const MockupLaptop({required this.width, required this.height, required this.lipWidth});

  /// Across the front edge.
  final double width;

  /// Front to back, as drawn.
  final double height;

  /// The notch a lid is opened by.
  final double lipWidth;
}

/// Everything the widget needs to draw one device, resolved.
@immutable
class MockupMetrics {
  /// Creates a set of metrics.
  const MockupMetrics({
    required this.screen,
    required this.body,
    required this.frame,
    required this.shell,
    required this.screenRadius,
    this.stand,
    this.laptop,
  });

  /// The screen.
  final MPMockupResolution screen;

  /// The device itself: the screen and its hardware.
  final MPMockupResolution body;

  /// The whole picture: the body and whatever holds it up.
  final MPMockupResolution frame;

  /// The hardware round the screen.
  final MockupShell shell;

  /// The screen's own corner.
  final double screenRadius;

  /// A monitor's stand, or `null`.
  final MockupStand? stand;

  /// A laptop's keyboard, or `null`.
  final MockupLaptop? laptop;
}

/// The geometry of one device.
MockupMetrics mockupMetrics({
  required MPMockupDevice device,
  required MPMockupBezel bezel,
  required MPMockupHardware hardware,
  required MPMockupOrientation orientation,
  required MPMockupResolution resolution,
}) {
  // The turn happens here and nowhere else: swapping the two numbers before
  // anything is measured against them is what keeps the bezel, the cut-out and
  // the chrome turning together. Rotating the drawn result would turn the
  // status bar on its side.
  final bool turned =
      device != MPMockupDevice.desktop && orientation == MPMockupOrientation.landscape;
  final MPMockupResolution screen = turned
      ? MPMockupResolution(resolution.height, resolution.width)
      : resolution;

  if (bezel == MPMockupBezel.none) {
    final double radius = _bareRadius[device]!;

    return MockupMetrics(
      screen: screen,
      body: screen,
      frame: screen,
      shell: MockupShell(side: 0, top: 0, bottom: 0, radius: radius),
      screenRadius: radius,
    );
  }

  final MockupShell shell = _shells[device]![bezel]!;
  final MPMockupResolution body = MPMockupResolution(
    screen.width + shell.side * 2,
    screen.height + shell.top + shell.bottom,
  );
  // The outer corner less the hardware between them, held at a floor a thick
  // device's narrow sides would otherwise take below nothing.
  final double screenRadius = math.max(2, shell.radius - shell.side);

  if (device != MPMockupDevice.desktop) {
    return MockupMetrics(
      screen: screen,
      body: body,
      frame: body,
      shell: shell,
      screenRadius: screenRadius,
    );
  }

  if (hardware == MPMockupHardware.laptop) {
    final MockupLaptop laptop = MockupLaptop(
      width: (body.width * 1.14).roundToDouble(),
      height: (body.height * 0.028).roundToDouble() + 12,
      lipWidth: (body.width * 0.12).roundToDouble(),
    );

    return MockupMetrics(
      screen: screen,
      body: body,
      frame: MPMockupResolution(laptop.width, body.height + laptop.height),
      shell: shell,
      screenRadius: screenRadius,
      laptop: laptop,
    );
  }

  final MockupStand stand = MockupStand(
    neckWidth: (body.width * 0.16).roundToDouble(),
    neckHeight: (body.height * 0.11).roundToDouble(),
    footWidth: (body.width * 0.42).roundToDouble(),
    footHeight: math.max(8, (body.height * 0.018).roundToDouble()),
  );

  return MockupMetrics(
    screen: screen,
    body: body,
    frame: MPMockupResolution(
      math.max(body.width, stand.footWidth),
      body.height + stand.neckHeight + stand.footHeight,
    ),
    shell: shell,
    screenRadius: screenRadius,
    stand: stand,
  );
}

/// The face and the edge of each finish, as fixed colours.
///
/// Not tokens, and not derived from the source colour: a graphite phone stays
/// graphite on a page switched to dark, because the hardware is a photograph of
/// an object rather than a surface of this library's.
const Map<MPMockupFinish, (Color, Color)> mockupFinishes = <MPMockupFinish, (Color, Color)>{
  MPMockupFinish.graphite: (Color(0xFF2F3033), Color(0xFF131416)),
  MPMockupFinish.silver: (Color(0xFFD8D9DD), Color(0xFFA3A5AA)),
  MPMockupFinish.white: (Color(0xFFF3F3F5), Color(0xFFC8C9CE)),
};

/// A piece of hardware: the finish's face with a hairline of its edge inside.
Widget mockupHardware({
  required MPMockupFinish finish,
  required BorderRadius borderRadius,
  required Widget child,
}) {
  final (Color face, Color edge) = mockupFinishes[finish]!;

  return DecoratedBox(
    decoration: BoxDecoration(color: face, borderRadius: borderRadius),
    position: DecorationPosition.background,
    child: DecoratedBox(
      // In front, so it is a line inside the edge rather than a border the
      // screen is pushed in by.
      position: DecorationPosition.foreground,
      decoration: BoxDecoration(
        border: Border.all(color: edge),
        borderRadius: borderRadius,
      ),
      child: child,
    ),
  );
}

/// The camera cut-out, drawn over the top edge of a screen [width] wide.
///
/// Hardware rather than chrome, so it is drawn whether or not the system's bars
/// are, and it sits over the screen rather than taking room from it.
class MockupCutout extends StatelessWidget {
  /// Creates a cut-out.
  const MockupCutout({required this.notch, required this.width, super.key});

  /// Which one.
  final MPMockupNotch notch;

  /// The screen's width.
  final double width;

  @override
  Widget build(BuildContext context) {
    const Color black = Color(0xFF000000);

    switch (notch) {
      case MPMockupNotch.none:
        return const SizedBox.shrink();
      case MPMockupNotch.punchHole:
        final double size = (width * 0.032).roundToDouble();

        return Padding(
          padding: EdgeInsets.only(top: size * 0.8),
          child: Container(
            width: size,
            height: size,
            decoration: const BoxDecoration(color: black, shape: BoxShape.circle),
          ),
        );
      case MPMockupNotch.dynamicIsland:
        final double height = (width * 0.09).roundToDouble();

        return Padding(
          padding: EdgeInsets.only(top: height * 0.35),
          child: Container(
            width: (width * 0.31).roundToDouble(),
            height: height,
            decoration: BoxDecoration(color: black, borderRadius: BorderRadius.circular(height)),
          ),
        );
      case MPMockupNotch.notch:
        final double height = (width * 0.075).roundToDouble();

        // Square across the top and rounded only where it meets the screen.
        return Container(
          width: (width * 0.52).roundToDouble(),
          height: height,
          decoration: BoxDecoration(
            color: black,
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(height * 0.6)),
          ),
        );
    }
  }
}

/// What one system puts above and below the content.
@immutable
class MockupChrome {
  /// Creates a set of bars.
  const MockupChrome({
    required this.top,
    required this.bottom,
    required this.insetTop,
    required this.insetBottom,
  });

  /// Along the top, or `null`.
  final Widget? top;

  /// Along the bottom, or `null`.
  final Widget? bottom;

  /// How much room the top one takes out of the screen.
  final double insetTop;

  /// And the bottom one.
  final double insetBottom;
}

/// A rounded block standing in for a word, an icon or a window.
class _Tile extends StatelessWidget {
  const _Tile({required this.width, required this.height, required this.ink, this.round = false});

  final double width;
  final double height;
  final Color ink;
  final bool round;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: ink,
        borderRadius: BorderRadius.circular(round ? height : height * 0.3),
      ),
    );
  }
}

/// A row of tiles in the widths a row of menu names has.
Widget _tiles(
  List<double> widths, {
  required double height,
  required double gap,
  required Color ink,
}) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    spacing: gap,
    children: <Widget>[
      for (final double width in widths) _Tile(width: width, height: height, ink: ink),
    ],
  );
}

/// The signal bars, the Wi-Fi arcs and the battery at the end of a handheld's
/// status bar.
class _StatusPainter extends CustomPainter {
  const _StatusPainter({required this.height, required this.ink, required this.faint});

  final double height;
  final Color ink;
  final Color faint;

  /// The width this needs for a glyph [height] tall.
  static double widthFor(double height) {
    final double bar = math.max(1, (height * 0.18).roundToDouble());

    return bar * 4 +
        bar * 0.6 * 3 +
        height * 0.4 +
        height * 1.2 +
        height * 0.4 +
        height * 1.9 +
        bar * 0.8 +
        bar;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final double bar = math.max(1, (height * 0.18).roundToDouble());
    final Paint fill = Paint()..color = ink;
    double x = 0;

    // Signal: four bars climbing.
    for (final double share in <double>[0.4, 0.6, 0.8, 1]) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, height * (1 - share), bar, height * share),
          const Radius.circular(1),
        ),
        fill,
      );
      x += bar + bar * 0.6;
    }

    x += height * 0.4 - bar * 0.6;

    // Wi-Fi: three arcs and a dot.
    final Offset centre = Offset(x + height * 0.6, height);
    final Paint arc = Paint()
      ..color = ink
      ..style = PaintingStyle.stroke
      ..strokeWidth = bar;

    for (final double share in <double>[1, 0.62]) {
      canvas.drawArc(
        Rect.fromCircle(center: centre, radius: height * share - bar / 2),
        math.pi * 1.25,
        math.pi * 0.5,
        false,
        arc,
      );
    }

    canvas.drawCircle(centre.translate(0, -height * 0.13), height * 0.13, fill);
    x += height * 1.2 + height * 0.4;

    // Battery: a body, a fill and a nub.
    final Rect body = Rect.fromLTWH(x, 0, height * 1.9, height);
    canvas
      ..drawRRect(
        RRect.fromRectAndRadius(body.deflate(0.5), const Radius.circular(2)),
        Paint()
          ..color = faint
          ..style = PaintingStyle.stroke,
      )
      ..drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(
            body.left + bar * 0.6 + 1,
            body.top + bar * 0.6 + 1,
            (body.width - bar * 1.2 - 2) * 0.68,
            body.height - bar * 1.2 - 2,
          ),
          const Radius.circular(1),
        ),
        fill,
      )
      ..drawRect(
        Rect.fromLTWH(body.right + bar * 0.8, height * 0.3, bar, height * 0.4),
        Paint()..color = faint,
      );
  }

  @override
  bool shouldRepaint(_StatusPainter oldDelegate) {
    return oldDelegate.height != height || oldDelegate.ink != ink || oldDelegate.faint != faint;
  }
}

/// Android's three navigation glyphs: back, home, recents.
class _NavPainter extends CustomPainter {
  const _NavPainter({required this.glyph, required this.ink});

  final double glyph;
  final Color ink;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint stroke = Paint()
      ..color = ink
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final double gap = glyph * 1.6;
    final double mid = size.height / 2;
    double x = 0;

    // Back: a chevron pointing to the start.
    final double back = glyph * 0.6;
    canvas.drawPath(
      Path()
        ..moveTo(x + back, mid - back * 0.7)
        ..lineTo(x + back * 0.3, mid)
        ..lineTo(x + back, mid + back * 0.7),
      stroke,
    );
    x += back + gap;

    // Home: a ring.
    final double home = glyph * 0.75;
    canvas.drawCircle(Offset(x + home / 2, mid), home / 2 - 1, stroke);
    x += home + gap;

    // Recents: a square.
    final double recents = glyph * 0.7;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(x + 1, mid - recents / 2 + 1, recents - 2, recents - 2),
        const Radius.circular(2),
      ),
      stroke,
    );
  }

  @override
  bool shouldRepaint(_NavPainter oldDelegate) =>
      oldDelegate.glyph != glyph || oldDelegate.ink != ink;
}

/// A system's own bars on a screen [width] wide.
///
/// Each takes its own room rather than covering the content, so turning them
/// off gives the screen back to the content. They are drawn out of this
/// library's roles, `surface` and `onSurface`, rather than each system's real
/// colours: the hardware is a photograph and keeps fixed colours, the software
/// on the screen is a page and follows the page. The three lights on a macOS
/// menu bar are the exception, because a close button that followed the page
/// would stop being red.
MockupChrome mockupChrome({
  required MPMockupOs os,
  required double width,
  required MPMockupNotch notch,
  required MPColorScheme colors,
}) {
  final double unit = math.max(10, (width * 0.035).roundToDouble());
  final double glyph = (unit * 0.36).roundToDouble();
  final double pad = (unit * 0.5).roundToDouble();
  final Color ink = colors.onSurface;
  final Color tile = colors.onSurface.withValues(alpha: 0.38);
  final Color faint = colors.onSurface.withValues(alpha: 0.6);

  if (os == MPMockupOs.ios || os == MPMockupOs.ipados || os == MPMockupOs.android) {
    // A cut-out pushes the status bar's own content down and out from under it.
    final double height = notch == MPMockupNotch.none
        ? (unit * 1.3).roundToDouble()
        : (unit * 2.2).roundToDouble();

    final Widget top = SizedBox(
      height: height,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          pad * 2,
          notch == MPMockupNotch.none ? 0 : (unit * 0.6).roundToDouble(),
          pad * 2,
          0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            _Tile(width: (unit * 1.4).roundToDouble(), height: glyph, ink: tile),
            CustomPaint(
              size: Size(_StatusPainter.widthFor(glyph), glyph),
              painter: _StatusPainter(height: glyph, ink: ink, faint: faint),
            ),
          ],
        ),
      ),
    );

    if (os == MPMockupOs.android) {
      final double navHeight = (unit * 1.8).roundToDouble();
      final double size = glyph * 1.6;

      return MockupChrome(
        top: top,
        bottom: SizedBox(
          height: navHeight,
          child: Center(
            child: CustomPaint(
              size: Size(size * (0.6 + 0.75 + 0.7) + size * 1.6 * 2, size),
              painter: _NavPainter(glyph: size, ink: ink),
            ),
          ),
        ),
        insetTop: height,
        insetBottom: navHeight,
      );
    }

    final double indicator = (unit * 1.4).roundToDouble();

    return MockupChrome(
      top: top,
      bottom: SizedBox(
        height: indicator,
        child: Center(
          child: _Tile(
            width: (width * 0.36).roundToDouble(),
            height: math.max(3, glyph * 0.28),
            ink: faint,
            round: true,
          ),
        ),
      ),
      insetTop: height,
      insetBottom: indicator,
    );
  }

  if (os == MPMockupOs.macos) {
    final double menuHeight = (unit * 0.95).roundToDouble();
    final double dockHeight = (unit * 2.1).roundToDouble();
    final double dockTile = (unit * 1.3).roundToDouble();

    return MockupChrome(
      top: Container(
        height: menuHeight,
        color: colors.surfaceContainer.withValues(alpha: 0.8),
        padding: EdgeInsets.symmetric(horizontal: pad * 1.5),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          spacing: pad * 2,
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.min,
              spacing: pad,
              children: <Widget>[
                Row(
                  mainAxisSize: MainAxisSize.min,
                  spacing: pad * 0.7,
                  children: <Widget>[
                    for (final Color light in const <Color>[
                      Color(0xFFFF5F57),
                      Color(0xFFFEBC2E),
                      Color(0xFF28C840),
                    ])
                      Container(
                        width: glyph,
                        height: glyph,
                        decoration: BoxDecoration(color: light, shape: BoxShape.circle),
                      ),
                  ],
                ),
                _tiles(
                  <double>[glyph * 3, glyph * 2, glyph * 2.4],
                  height: glyph,
                  gap: pad,
                  ink: tile,
                ),
              ],
            ),
            _tiles(<double>[glyph * 1.6, glyph * 3], height: glyph, gap: pad, ink: tile),
          ],
        ),
      ),
      bottom: SizedBox(
        height: dockHeight,
        child: Center(
          child: Container(
            padding: EdgeInsets.all(pad),
            decoration: BoxDecoration(
              color: colors.surfaceContainerHigh.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular((dockTile + pad * 2) * 0.18),
            ),
            child: _tiles(
              <double>[for (int index = 0; index < 5; index += 1) dockTile],
              height: dockTile,
              gap: pad,
              ink: tile,
            ),
          ),
        ),
      ),
      insetTop: menuHeight,
      insetBottom: dockHeight,
    );
  }

  // Windows and Linux: one bar each, and they differ in where it is and what
  // sits on it.
  final double barHeight = (unit * 1.5).roundToDouble();
  final double square = (unit * 0.95).roundToDouble();
  final Color barFill = colors.surfaceContainer.withValues(alpha: 0.85);

  if (os == MPMockupOs.windows) {
    final double pane = (square - square * 0.14) / 2;

    return MockupChrome(
      top: null,
      bottom: Container(
        height: barHeight,
        color: barFill,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: pad * 1.5,
          children: <Widget>[
            // The start button, as the four panes it has been for thirty years.
            SizedBox.square(
              dimension: square,
              child: Wrap(
                spacing: square * 0.14,
                runSpacing: square * 0.14,
                children: <Widget>[
                  for (int index = 0; index < 4; index += 1)
                    Container(
                      width: pane,
                      height: pane,
                      decoration: BoxDecoration(
                        color: faint,
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                ],
              ),
            ),
            _tiles(<double>[square, square, square, square], height: square, gap: pad, ink: tile),
          ],
        ),
      ),
      insetTop: 0,
      insetBottom: barHeight,
    );
  }

  return MockupChrome(
    top: Container(
      height: barHeight,
      color: barFill,
      padding: EdgeInsets.symmetric(horizontal: pad * 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          _tiles(<double>[glyph * 3, glyph * 2], height: glyph, gap: pad, ink: tile),
          _Tile(width: glyph * 3.4, height: glyph, ink: tile),
          _tiles(
            <double>[glyph * 1.6, glyph * 1.6, glyph * 2.4],
            height: glyph,
            gap: pad,
            ink: tile,
          ),
        ],
      ),
    ),
    bottom: null,
    insetTop: barHeight,
    insetBottom: 0,
  );
}
