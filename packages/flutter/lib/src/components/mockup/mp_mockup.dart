/// A picture of a device, with a real screen inside it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/mockup.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/mockup.dart'
    show
        MPMockupBezel,
        MPMockupDevice,
        MPMockupFinish,
        MPMockupHardware,
        MPMockupNotch,
        MPMockupOrientation,
        MPMockupOs,
        MPMockupResolution;

/// A picture of a device, with a real screen inside it.
///
/// ```dart
/// MPMockup(device: MPMockupDevice.mobile, width: 280, child: YourScreen())
/// ```
///
/// ## The screen is a real viewport
///
/// [child] is laid out against the device's own resolution (390 by 844 for a
/// phone at [MPSize.md]) and the whole device is then scaled once to whatever
/// room it was given. So a layout inside it wraps where it would wrap on the
/// machine, not where it would wrap in the box the picture happens to fit in.
///
/// It goes one step further than the React component can. A media query there
/// still measures the browser window, which nothing on a page can change; here
/// the screen is handed a [MediaQuery] the size of the device, so an `MPGrid`,
/// an `MPShow` or anything else that reads the window size class inside it
/// answers for the phone and not for the page the phone is drawn on.
///
/// ## The scale is the exception
///
/// The rule elsewhere in the library is that a surface is not scaled. It is a
/// rule about controls, and nothing here is pressed into a different size: the
/// scale is set from the room available and from nothing else. A device drawn
/// at a third of its size is a picture of a device, which is the point.
///
/// ## Hardware is a photograph, software is a page
///
/// The finishes are fixed colours and do not follow the theme: a graphite phone
/// stays graphite on a page switched to dark. The chrome on the screen does
/// follow it, drawn out of `surface` and `onSurface`, so the frame stays a
/// frame round *your* screen rather than becoming a picture of somebody else's.
class MPMockup extends StatelessWidget {
  /// Creates a picture of [device] with [child] on its screen.
  const MPMockup({
    required this.device,
    this.child,
    this.os,
    this.hardware = MPMockupHardware.monitor,
    this.size,
    this.resolution,
    this.orientation = MPMockupOrientation.portrait,
    this.bezel = MPMockupBezel.standard,
    this.finish = MPMockupFinish.graphite,
    this.notch,
    this.systemUi = true,
    this.width,
    this.height,
    super.key,
  });

  /// Which machine this is a picture of. The one parameter with no default: a
  /// mockup that has not said what it is a mockup of has not said anything.
  final MPMockupDevice device;

  /// What is on the screen.
  final Widget? child;

  /// The system whose chrome is drawn on the screen. A desktop runs `macos`,
  /// `windows` or `linux`; a tablet `ipados` or `android`; a phone `ios` or
  /// `android`. A value the device cannot run falls back to the device's own
  /// default rather than being refused.
  final MPMockupOs? os;

  /// What holds a desktop screen up: a stand under it, or a keyboard in front
  /// of it. Ignored on a tablet and a phone, which hold themselves up.
  final MPMockupHardware hardware;

  /// How big the device is, on a ladder of five real resolutions per device: a
  /// 320-wide phone up to a 430-wide one, a 1024-wide desktop up to a 1920-wide
  /// one. As on `MPBox`, it sets no height and no type scale; [resolution]
  /// overrides it outright.
  final MPSize? size;

  /// The screen's logical resolution, when none of the five steps is the
  /// machine you mean.
  final MPMockupResolution? resolution;

  /// Which way a handheld is held. Landscape turns the screen, the bezel and
  /// the cut-out together. Ignored on a desktop, whose stand does not turn.
  final MPMockupOrientation orientation;

  /// How much hardware there is round the screen. [MPMockupBezel.none] is no
  /// hardware at all, the screen alone with its corners cut.
  final MPMockupBezel bezel;

  /// What the hardware is made of.
  final MPMockupFinish finish;

  /// The camera cut-out. Defaults to what the device would have: a dynamic
  /// island on an iOS phone, a punch hole on an Android one, nothing elsewhere.
  /// Hardware rather than chrome, so it is drawn whether or not [systemUi] is.
  final MPMockupNotch? notch;

  /// Draws the system's own bars: a status bar and a home indicator, a menu bar
  /// and a dock, a taskbar. Each takes its own room rather than covering the
  /// content, so turning them off gives the screen back to [child].
  final bool systemUi;

  /// The rendered width of the whole picture, in logical pixels. Left out, the
  /// mockup fills the width it is given. The device is laid out at its own
  /// resolution and scaled once, so this changes how big the picture is and
  /// never what [child] thinks the screen is.
  final double? width;

  /// The rendered height. Given on its own it decides the size and the width
  /// follows; given with [width], the device fits inside both.
  final double? height;

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPMockupOs system = mockupOs(device, os);
    final MPMockupNotch cutout = notch ?? mockupNotch(device, system);
    final MockupMetrics metrics = mockupMetrics(
      device: device,
      bezel: bezel,
      hardware: hardware,
      orientation: orientation,
      resolution: resolution ?? mockupResolutions[device]![size]!,
    );
    final MPMockupResolution screen = metrics.screen;
    final MockupChrome? chrome = systemUi
        ? mockupChrome(os: system, width: screen.width, notch: cutout, colors: colors)
        : null;
    final double contentHeight =
        screen.height - (chrome?.insetTop ?? 0) - (chrome?.insetBottom ?? 0);

    // The screen is the window, for whatever reads the window inside it.
    final MediaQueryData window = (MediaQuery.maybeOf(context) ?? const MediaQueryData()).copyWith(
      size: Size(screen.width, screen.height),
      padding: EdgeInsets.zero,
      viewPadding: EdgeInsets.zero,
      viewInsets: EdgeInsets.zero,
    );

    final Widget display = ClipRRect(
      borderRadius: BorderRadius.circular(metrics.screenRadius),
      child: ColoredBox(
        color: colors.surface,
        child: DefaultTextStyle.merge(
          style: TextStyle(color: colors.onSurface),
          child: Stack(
            alignment: Alignment.topCenter,
            children: <Widget>[
              Column(
                children: <Widget>[
                  if (chrome?.top != null) ExcludeSemantics(child: chrome!.top!),
                  // A box of exactly what the system left, so content that asks
                  // for more is clipped rather than growing the screen.
                  ClipRect(
                    child: SizedBox(
                      width: screen.width,
                      height: contentHeight,
                      child: MediaQuery(data: window, child: child ?? const SizedBox.shrink()),
                    ),
                  ),
                  if (chrome?.bottom != null) ExcludeSemantics(child: chrome!.bottom!),
                ],
              ),
              ExcludeSemantics(
                child: MockupCutout(notch: cutout, width: screen.width),
              ),
            ],
          ),
        ),
      ),
    );

    final MockupShell shell = metrics.shell;
    Widget body = SizedBox(
      width: metrics.body.width,
      height: metrics.body.height,
      child: Padding(
        padding: EdgeInsets.fromLTRB(shell.side, shell.top, shell.side, shell.bottom),
        child: display,
      ),
    );

    if (bezel != MPMockupBezel.none) {
      body = mockupHardware(
        finish: finish,
        borderRadius: BorderRadius.circular(shell.radius),
        child: body,
      );
    }

    final MockupStand? stand = metrics.stand;
    final MockupLaptop? laptop = metrics.laptop;

    final Widget frame = SizedBox(
      width: metrics.frame.width,
      height: metrics.frame.height,
      child: Column(
        children: <Widget>[
          body,
          if (stand != null) ...<Widget>[
            mockupHardware(
              finish: finish,
              borderRadius: BorderRadius.zero,
              child: SizedBox(width: stand.neckWidth, height: stand.neckHeight),
            ),
            mockupHardware(
              finish: finish,
              borderRadius: BorderRadius.circular(stand.footHeight),
              child: SizedBox(width: stand.footWidth, height: stand.footHeight),
            ),
          ],
          if (laptop != null) _LaptopBase(laptop: laptop, finish: finish),
        ],
      ),
    );

    // One scale, from the room available, with the device's proportions kept
    // outside it so the box takes the room a device that shape would take.
    final Widget scaled = FittedBox(child: frame);
    final double ratio = metrics.frame.width / metrics.frame.height;

    if (width != null && height != null) {
      return SizedBox(width: width, height: height, child: scaled);
    }

    if (width != null || height != null) {
      return SizedBox(
        width: width ?? height! * ratio,
        height: height ?? width! / ratio,
        child: scaled,
      );
    }

    return AspectRatio(aspectRatio: ratio, child: scaled);
  }
}

/// The keyboard a laptop's screen sits on, as a trapezium: wider at the front
/// than where the screen meets it, which is what makes it read as lying flat.
class _LaptopBase extends StatelessWidget {
  const _LaptopBase({required this.laptop, required this.finish});

  final MockupLaptop laptop;
  final MPMockupFinish finish;

  @override
  Widget build(BuildContext context) {
    final (Color face, Color edge) = mockupFinishes[finish]!;

    return ClipPath(
      clipper: _Trapezium(laptop.height * 0.5),
      child: Container(
        width: laptop.width,
        height: laptop.height,
        color: face,
        alignment: Alignment.topCenter,
        // The lip a lid is opened by.
        child: Container(
          width: laptop.lipWidth,
          height: laptop.height * 0.28,
          decoration: BoxDecoration(
            color: edge,
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(laptop.height)),
          ),
        ),
      ),
    );
  }
}

class _Trapezium extends CustomClipper<Path> {
  const _Trapezium(this.radius);

  final double radius;

  @override
  Path getClip(Size size) {
    final Path shape = Path()
      ..moveTo(size.width * 0.02, 0)
      ..lineTo(size.width * 0.98, 0)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    final Path rounded = Path()
      ..addRRect(
        RRect.fromRectAndCorners(
          Offset.zero & size,
          bottomLeft: Radius.circular(radius),
          bottomRight: Radius.circular(radius),
        ),
      );

    return Path.combine(PathOperation.intersect, shape, rounded);
  }

  @override
  bool shouldReclip(_Trapezium oldClipper) => oldClipper.radius != radius;
}
