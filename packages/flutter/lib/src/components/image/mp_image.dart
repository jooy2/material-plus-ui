/// A picture that reserves its room, stands in while it loads, and says so
/// when it does not arrive.
library;

import 'dart:ui' as ui;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/decode.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/image.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// How an [MPImage]'s picture is fitted into its box.
enum MPImageFit {
  /// Fills the box and crops what does not fit. The default.
  cover,

  /// Fits the whole picture inside the box, leaving room on two sides.
  contain,

  /// Stretches the picture to the box, out of its own proportion.
  fill,

  /// Draws the picture at its own size, cropped or with room around it.
  none,

  /// [contain] that never enlarges a picture smaller than the box.
  scaleDown,
}

/// What an [MPImage]'s picture is doing right now.
enum MPImageState {
  /// On its way.
  loading,

  /// Drawn.
  loaded,

  /// Did not arrive; the fallback is drawn.
  error,
}

/// Which way an [MPImage]'s picture is mirrored, along the axes it is shown
/// on.
enum MPImageFlip {
  /// Not mirrored.
  none,

  /// Left and right swapped on the screen, whether or not the picture is
  /// turned.
  horizontal,

  /// Top and bottom swapped.
  vertical,

  /// Both, which is the same as a half turn.
  both,
}

/// What fills the room [MPImage.fit] leaves around the picture.
@immutable
class MPImageLetterbox {
  /// Paints [decoration] behind the picture: a colour, a gradient.
  const MPImageLetterbox(Decoration this.decoration);

  const MPImageLetterbox._blur() : decoration = null;

  /// Draws the same picture behind itself, covering the box and blurred, the
  /// way a video player fills the sides of a portrait clip. Drawn only for a
  /// fit that can leave room: contain, none and scaleDown.
  static const MPImageLetterbox blur = MPImageLetterbox._blur();

  /// What is painted behind the picture, or `null` for [blur].
  final Decoration? decoration;
}

/// A picture that stands in while the real one arrives: a small copy of the
/// file, fitted, placed, turned and mirrored like the picture, and blurred if
/// [blur] says so. Pass it as [MPImage.placeholder].
class MPImagePlaceholder extends StatelessWidget {
  /// Creates a picture placeholder.
  const MPImagePlaceholder({required this.image, this.blur = 0, super.key});

  /// The stand-in, usually a few hundred bytes.
  final ImageProvider<Object> image;

  /// The blur's radius in logical pixels. `0`, the default, draws it sharp;
  /// React's `blur: true` is 20.
  final double blur;

  @override
  Widget build(BuildContext context) {
    final Widget picture = Image(
      image: image,
      fit: BoxFit.cover,
      excludeFromSemantics: true,
      errorBuilder: _drawNothing,
    );

    return ClipRect(
      child: blur > 0 ? ImageFiltered(imageFilter: _blurOf(blur), child: picture) : picture,
    );
  }
}

Widget _drawNothing(BuildContext context, Object error, StackTrace? stack) {
  return const SizedBox.shrink();
}

ui.ImageFilter _blurOf(double sigma) => ui.ImageFilter.blur(sigmaX: sigma, sigmaY: sigma);

/// The letterbox blur's radius, and how far the blurred copy bleeds past the
/// box so its edges do not fade to nothing inside it.
const double _letterboxBlur = 24;

/// The room round a picture opened over the scrim.
const double _previewPad = 24;

BoxFit _boxFit(MPImageFit fit) {
  switch (fit) {
    case MPImageFit.cover:
      return BoxFit.cover;
    case MPImageFit.contain:
      return BoxFit.contain;
    case MPImageFit.fill:
      return BoxFit.fill;
    case MPImageFit.none:
      return BoxFit.none;
    case MPImageFit.scaleDown:
      return BoxFit.scaleDown;
  }
}

/// A picture that reserves its room, stands in while it loads, and says so
/// when it does not arrive.
///
/// ```dart
/// const MPImage(
///   image: NetworkImage('/photos/lake.webp'),
///   semanticLabel: 'A still lake below a low sun',
///   ratio: 16 / 9,
/// )
/// ```
///
/// A bare [Image] whose file fails draws nothing, and one still on its way
/// draws a gap the page reflows into when it lands. This reserves the room
/// from [ratio] or from [width] and [height], draws a pulse while the picture
/// loads, fades it in when it arrives, and draws a broken-picture mark on a
/// neutral surface when it does not. The picture is decoded at the size of the
/// box rather than the size of the file.
class MPImage extends StatefulWidget {
  /// Creates an image.
  const MPImage({
    required this.image,
    required this.semanticLabel,
    this.ratio,
    this.width,
    this.height,
    this.fit = MPImageFit.cover,
    this.position = Alignment.center,
    this.letterbox,
    this.rotate = 0,
    this.flip = MPImageFlip.none,
    this.placeholder,
    this.fallback,
    this.preview = false,
    this.previewImage,
    this.previewLabel,
    this.onStateChange,
    super.key,
  });

  /// The picture. An [ImageProvider] rather than a URL, because that is the
  /// shape every picture in Flutter has.
  final ImageProvider<Object> image;

  /// What the picture says, for a reader who cannot see it. React's `alt`.
  ///
  /// Required, for the reason React's is: a picture with no text alternative
  /// is the most common accessibility defect a component library can help
  /// with. Pass `''` for a picture that is decoration, which is a claim rather
  /// than an omission.
  final String semanticLabel;

  /// The proportion the box holds, width over height: `16 / 9`. Left out, the
  /// box is whatever the picture and its constraints come to.
  final double? ratio;

  /// The width of the file, or of the box when given without [height]. With
  /// [height] as well, the two are the file's size and reserve its proportion.
  final double? width;

  /// The height of the file, or of the box when given without [width].
  final double? height;

  /// How the picture is fitted into the box.
  final MPImageFit fit;

  /// Which part of the picture a cover crop keeps, and where the other fits
  /// leave their room. Read on the picture as it is shown, so `topCenter`
  /// keeps the top of a picture that has been turned or mirrored. Physical
  /// rather than directional: the subject of a photograph does not move to the
  /// other side on a right-to-left screen.
  final Alignment position;

  /// What fills the room [fit] leaves around the picture. Left out, nothing.
  final MPImageLetterbox? letterbox;

  /// Turns the picture clockwise, in degrees, rounded to the nearest quarter.
  /// A quarter turn swaps the box's proportion when it is read from [width]
  /// and [height]; an explicit [ratio] is the layout's shape and is kept.
  final int rotate;

  /// Mirrors the picture along the axes it is shown on.
  final MPImageFlip flip;

  /// Drawn while the picture is on its way. A pulse on a container tone by
  /// default; `SizedBox.shrink()` draws nothing; an [MPImagePlaceholder] draws a
  /// small copy of the picture instead.
  final Widget? placeholder;

  /// Drawn instead of the picture when it does not arrive. A broken-picture
  /// mark on a neutral surface by default.
  final Widget? fallback;

  /// Opens the picture over a scrim when it is pressed. The box becomes a
  /// button, reachable by keyboard. Off by default: most pictures are not worth
  /// opening, and one that silently became pressable would be a control nobody
  /// declared.
  final bool preview;

  /// What the preview opens, when that is not [image]: the full-resolution
  /// file behind a thumbnail.
  final ImageProvider<Object>? previewImage;

  /// The name of the button [preview] turns the box into. Defaults to
  /// [semanticLabel], and to the word for "open" when that is empty.
  final String? previewLabel;

  /// Called as the picture moves between the [MPImageState] values.
  final ValueChanged<MPImageState>? onStateChange;

  @override
  State<MPImage> createState() => _MPImageState();
}

class _MPImageState extends State<MPImage> {
  MPImageState _state = MPImageState.loading;
  bool _open = false;

  /// The box the picture is laid out in, once it has been measured: the
  /// picture is decoded for it.
  bool _measured = false;
  double? _boxWidth;
  double? _boxHeight;

  @override
  void didUpdateWidget(MPImage oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.image != widget.image) {
      _state = MPImageState.loading;
    }
  }

  static double? _bound(double length) => length.isFinite ? length : null;

  void _onMeasured(BoxConstraints constraints) {
    if (!mounted) {
      return;
    }

    // Only ever grown: a picture decoded for a larger box is still sharp in a
    // smaller one, and decoding again as a window is dragged narrower would be
    // work for nothing.
    double? larger(double? next, double? held) {
      if (next == null || held == null) {
        return _measured ? held : next;
      }

      return next > held ? next : held;
    }

    final double? width = larger(_bound(constraints.maxWidth), _boxWidth);
    final double? height = larger(_bound(constraints.maxHeight), _boxHeight);

    if (_measured && width == _boxWidth && height == _boxHeight) {
      return;
    }

    setState(() {
      _measured = true;
      _boxWidth = width;
      _boxHeight = height;
    });
  }

  ImageProvider<Object> _decoded(ImageProvider<Object> image, double? width, double? height) {
    if (widget.fit == MPImageFit.none) {
      return image;
    }

    final bool sideways = isSideways(quartersOf(widget.rotate));

    return sizedForDecode(
      image,
      width: sideways ? height : width,
      height: sideways ? width : height,
      devicePixelRatio: MediaQuery.maybeDevicePixelRatioOf(context) ?? 1,
      cover: widget.fit == MPImageFit.cover || widget.fit == MPImageFit.fill,
    );
  }

  /// Records a state the picture reported, after the frame: the frame and
  /// error builders run inside a build.
  void _settle(MPImageState next) {
    if (_state == next) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (!mounted || _state == next) {
        return;
      }

      setState(() => _state = next);
      widget.onStateChange?.call(next);
    });
  }

  bool get _mirrorAcross =>
      widget.flip == MPImageFlip.horizontal || widget.flip == MPImageFlip.both;

  bool get _mirrorDown => widget.flip == MPImageFlip.vertical || widget.flip == MPImageFlip.both;

  /// [MPImage.position], moved into the picture's own frame: an [Image]'s
  /// alignment is laid out before the turn and the mirror round it.
  Alignment get _alignment {
    final Alignment shown = widget.position;
    final (double across, double down) = elementFractions(
      ((shown.x + 1) / 2, (shown.y + 1) / 2),
      quartersOf(widget.rotate),
      mirrorAcross: _mirrorAcross,
      mirrorDown: _mirrorDown,
    );

    return Alignment(across * 2 - 1, down * 2 - 1);
  }

  Widget _pose(Widget child) {
    return posed(
      child,
      quartersOf(widget.rotate),
      mirrorAcross: _mirrorAcross,
      mirrorDown: _mirrorDown,
    );
  }

  /// The blurred copy behind a letterboxed picture.
  Widget? _backdrop(ImageProvider<Object> decoded) {
    final MPImageFit fit = widget.fit;

    if (widget.letterbox != MPImageLetterbox.blur ||
        fit == MPImageFit.cover ||
        fit == MPImageFit.fill) {
      return null;
    }

    return Positioned(
      left: -_letterboxBlur * 2,
      right: -_letterboxBlur * 2,
      top: -_letterboxBlur * 2,
      bottom: -_letterboxBlur * 2,
      child: IgnorePointer(
        child: ImageFiltered(
          imageFilter: _blurOf(_letterboxBlur),
          child: _pose(
            Image(
              image: decoded,
              fit: BoxFit.cover,
              alignment: _alignment,
              excludeFromSemantics: true,
              errorBuilder: _drawNothing,
            ),
          ),
        ),
      ),
    );
  }

  /// The picture placeholder, fitted and posed like the picture, until the
  /// picture has faded in over it.
  Widget? _standIn({required bool arrived, required Duration fade}) {
    final Widget? placeholder = widget.placeholder;

    if (placeholder is! MPImagePlaceholder) {
      return null;
    }

    final double bleed = placeholder.blur * 2;
    Widget layer = _pose(
      Image(
        image: placeholder.image,
        fit: _boxFit(widget.fit),
        alignment: _alignment,
        excludeFromSemantics: true,
        errorBuilder: _drawNothing,
      ),
    );

    if (placeholder.blur > 0) {
      layer = ImageFiltered(imageFilter: _blurOf(placeholder.blur), child: layer);
    }

    return Positioned(
      left: -bleed,
      right: -bleed,
      top: -bleed,
      bottom: -bleed,
      child: IgnorePointer(
        // Held until the picture has finished fading in over it, then taken
        // away at once: a stand-in fading out as the picture fades in would
        // show the page through both halfway.
        child: AnimatedOpacity(
          opacity: arrived ? 0 : 1,
          duration: fade,
          curve: const Threshold(1),
          child: layer,
        ),
      ),
    );
  }

  void _openPreview() => setState(() => _open = true);

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration fade = reduceMotion ? Duration.zero : MPMotion.short4;

    final Widget placeholder = widget.placeholder ?? _Pulse(color: colors.surfaceContainerHigh);
    final Widget fallback =
        widget.fallback ??
        ColoredBox(
          color: colors.surfaceContainer,
          child: Center(child: _BrokenPicture(color: colors.onSurfaceVariant)),
        );

    final ImageProvider<Object> decoded = _decoded(widget.image, _boxWidth, _boxHeight);

    Widget frameOf(BuildContext context, Widget child, int? frame, bool synchronous) {
      final Widget? backdrop = _backdrop(decoded);
      final Widget posed = _pose(child);
      final Widget shown = backdrop == null
          ? posed
          : Stack(fit: StackFit.passthrough, children: <Widget>[backdrop, posed]);

      if (synchronous || frame != null) {
        _settle(MPImageState.loaded);
      }

      // A picture that was already in the cache has nothing to arrive from.
      if (synchronous) {
        return shown;
      }

      final bool arrived = frame != null || _state == MPImageState.loaded;
      final Widget? standIn = _standIn(arrived: arrived, fade: fade);

      return Stack(
        fit: StackFit.passthrough,
        children: <Widget>[
          ?standIn,
          if (!arrived && standIn == null) Positioned.fill(child: placeholder),
          AnimatedOpacity(
            opacity: arrived ? 1 : 0,
            duration: fade,
            curve: MPMotion.standard,
            child: shown,
          ),
        ],
      );
    }

    Widget picture = _MeasuredBox(
      onMeasured: _onMeasured,
      child: _measured
          ? Image(
              image: decoded,
              fit: _boxFit(widget.fit),
              alignment: _alignment,
              excludeFromSemantics: true,
              gaplessPlayback: _state == MPImageState.loaded,
              frameBuilder: frameOf,
              errorBuilder: (BuildContext context, Object error, StackTrace? stack) {
                _settle(MPImageState.error);

                return fallback;
              },
            )
          // The first frame is laid out with nothing in it, so the box can be
          // measured before the picture is asked for at that size.
          : frameOf(context, const SizedBox.shrink(), null, false),
    );

    final Decoration? painted = widget.letterbox?.decoration;

    if (painted != null) {
      picture = DecoratedBox(decoration: painted, child: picture);
    }

    final double? width = widget.width;
    final double? height = widget.height;
    final bool sideways = isSideways(quartersOf(widget.rotate));
    double? ratio = widget.ratio;

    if (ratio == null && width != null && height != null && width > 0 && height > 0) {
      ratio = sideways ? height / width : width / height;
    }

    if (ratio != null) {
      picture = AspectRatio(aspectRatio: ratio, child: picture);
    }

    final bool loneWidth = width != null && height == null;
    final bool loneHeight = height != null && width == null;

    if (loneWidth) {
      picture = SizedBox(width: width, child: picture);
    } else if (loneHeight) {
      picture = SizedBox(
        height: height,
        width: ratio == null ? double.infinity : height * ratio,
        child: picture,
      );
    }

    picture = ClipRect(child: picture);

    // A box narrowed by a lone width, or by a lone height and a ratio, keeps
    // its width inside a parent that stretches its children, such as a column
    // with `CrossAxisAlignment.stretch`: there a bare `SizedBox` would be
    // handed the full width and lose.
    if (loneWidth || (loneHeight && ratio != null)) {
      picture = Align(
        alignment: AlignmentDirectional.topStart,
        widthFactor: 1,
        heightFactor: 1,
        child: picture,
      );
    }

    final String label = widget.semanticLabel;

    if (!widget.preview) {
      return label.isEmpty
          ? ExcludeSemantics(child: picture)
          : Semantics(
              container: true,
              image: true,
              label: label,
              child: ExcludeSemantics(child: picture),
            );
    }

    final bool ready = _state != MPImageState.error;
    final String name =
        widget.previewLabel ??
        (label.isNotEmpty ? label : mpMessagesOf(context, mpCommonMessages)['open']!);
    final Widget content = picture;

    return Stack(
      children: <Widget>[
        MPInteractive(
          onTap: ready ? _openPreview : null,
          enabled: ready,
          interactive: ready,
          cursor: ready ? SystemMouseCursors.zoomIn : SystemMouseCursors.basic,
          builder: (BuildContext context, MPInteraction state) {
            final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus =
                mpFocusSemanticsOf(context);

            return Semantics(
              container: true,
              button: true,
              image: true,
              enabled: ready,
              label: name,
              focused: focus.focused,
              onFocus: focus.onFocus,
              onTap: ready ? _openPreview : null,
              child: ExcludeSemantics(
                child: CustomPaint(
                  foregroundPainter: state.focusVisible
                      ? MPFocusRingPainter(color: colors.secondary, borderRadius: BorderRadius.zero)
                      : null,
                  child: MPStateLayer(
                    color: colors.onSurface,
                    opacity: mpStateLayerOpacity(state, enabled: ready),
                    child: content,
                  ),
                ),
              ),
            );
          },
        ),
        MPPortal(
          open: _open,
          barrierColor: mpScrimColor(colors),
          label: name,
          onDismiss: () => setState(() => _open = false),
          child: Padding(
            padding: const EdgeInsets.all(_previewPad),
            child: Center(child: _pose(_previewPicture(context, label))),
          ),
        ),
      ],
    );
  }

  /// The picture opened over the scrim: the whole of it, as large as the
  /// screen allows, decoded for the screen rather than for the thumbnail.
  Widget _previewPicture(BuildContext context, String label) {
    final Size screen = MediaQuery.sizeOf(context);
    final bool sideways = isSideways(quartersOf(widget.rotate));

    return Image(
      image: sizedForDecode(
        widget.previewImage ?? widget.image,
        width: sideways ? screen.height : screen.width,
        height: sideways ? screen.width : screen.height,
        devicePixelRatio: MediaQuery.maybeDevicePixelRatioOf(context) ?? 1,
        cover: false,
      ),
      fit: BoxFit.contain,
      semanticLabel: label.isEmpty ? null : label,
      excludeFromSemantics: label.isEmpty,
      errorBuilder: _drawNothing,
    );
  }
}

/// The default placeholder: a container tone that breathes, and holds still
/// when the platform asks for no motion.
class _Pulse extends StatefulWidget {
  const _Pulse({required this.color});

  final Color color;

  @override
  State<_Pulse> createState() => _PulseState();
}

class _PulseState extends State<_Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _beat = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 2),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _beat
        ..stop()
        ..value = 0;
    } else if (!_beat.isAnimating) {
      _beat.repeat();
    }
  }

  @override
  void dispose() {
    _beat.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: AnimatedBuilder(
        animation: _beat,
        builder: (BuildContext context, Widget? child) {
          // Tailwind's pulse: down to half and back, eased at both ends.
          final double t = _beat.value;
          final double wave = t < 0.5 ? t * 2 : (1 - t) * 2;

          return Opacity(opacity: 1 - 0.5 * Curves.easeInOut.transform(wave), child: child);
        },
        child: ColoredBox(color: widget.color, child: const SizedBox.expand()),
      ),
    );
  }
}

/// The broken-picture mark the default fallback draws: a frame with a
/// mountain in it, cracked across. Drawn here because nothing else draws it.
class _BrokenPicture extends StatelessWidget {
  const _BrokenPicture({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: CustomPaint(size: const Size.square(24), painter: _BrokenPainter(color)),
    );
  }
}

class _BrokenPainter extends CustomPainter {
  const _BrokenPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;

    canvas
      ..save()
      ..scale(size.shortestSide / 24)
      // The frame, broken where the crack runs through it.
      ..drawPath(
        Path()
          ..moveTo(13, 3.5)
          ..lineTo(18.5, 3.5)
          ..arcToPoint(const Offset(20.5, 5.5), radius: const Radius.circular(2))
          ..lineTo(20.5, 18.5)
          ..arcToPoint(const Offset(18.5, 20.5), radius: const Radius.circular(2))
          ..lineTo(11, 20.5)
          ..moveTo(8, 20.5)
          ..lineTo(5.5, 20.5)
          ..arcToPoint(const Offset(3.5, 18.5), radius: const Radius.circular(2))
          ..lineTo(3.5, 5.5)
          ..arcToPoint(const Offset(5.5, 3.5), radius: const Radius.circular(2))
          ..lineTo(10, 3.5),
        stroke,
      )
      // The crack.
      ..drawPath(
        Path()
          ..moveTo(10, 3.5)
          ..lineTo(12, 8)
          ..lineTo(10, 12)
          ..lineTo(12.5, 16)
          ..lineTo(11, 20.5),
        stroke,
      )
      // The sun, and the hill on the far side of the crack.
      ..drawCircle(const Offset(7.5, 8.5), 1.5, stroke)
      ..drawPath(
        Path()
          ..moveTo(13.5, 15)
          ..lineTo(16, 12.5)
          ..lineTo(20.5, 17),
        stroke,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_BrokenPainter oldDelegate) => oldDelegate.color != color;
}

/// Reports the constraints the picture is laid out under, after the frame, so
/// the picture can be decoded for that box.
class _MeasuredBox extends SingleChildRenderObjectWidget {
  const _MeasuredBox({required this.onMeasured, required super.child});

  final ValueChanged<BoxConstraints> onMeasured;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderMeasuredBox(onMeasured);

  @override
  void updateRenderObject(BuildContext context, _RenderMeasuredBox renderObject) {
    renderObject.onMeasured = onMeasured;
  }
}

class _RenderMeasuredBox extends RenderProxyBox {
  _RenderMeasuredBox(this.onMeasured);

  ValueChanged<BoxConstraints> onMeasured;
  BoxConstraints? _reported;

  @override
  void performLayout() {
    super.performLayout();

    if (constraints == _reported) {
      return;
    }

    final BoxConstraints measured = constraints;
    _reported = measured;
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => onMeasured(measured));
  }
}
