/// A picture of a person or a thing, at a known size, that is never an empty
/// box.
library;

import 'dart:async';

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/decode.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// What an [MPAvatar] reports about its picture as it loads.
enum MPAvatarLoadingStatus {
  /// There is no picture to load.
  idle,

  /// The picture has been asked for and has not arrived.
  loading,

  /// The picture has arrived and is drawn.
  loaded,

  /// The picture failed, and the fallback is drawn for good.
  error,
}

/// The crop.
enum MPAvatarShape {
  /// A round crop, and the default. MD3's avatar is a circle, and a round crop
  /// is what a portrait has been for as long as there have been portraits.
  circle,

  /// Cuts the corners off instead, which is what a logo or a repository icon
  /// wants: those are drawn to the edges of a rectangle and a round crop eats
  /// them.
  square,
}

/// A picture of a person or a thing, at a known size, that is never an empty
/// box.
///
/// ```dart
/// const MPAvatar(name: 'Ada Lovelace', image: NetworkImage('/ada.webp'))
/// ```
///
/// Three things can be drawn in it and exactly one of them is at a time: the
/// picture, if [image] is given and loads; otherwise whatever stands in for it,
/// [child], or [initials], or the initials derived from [name]; and failing all
/// of those, a silhouette.
///
/// It carries no status dot of its own. An avatar with a mark on it is an
/// `MPBadge` with an avatar in it, and a second spelling for that would give
/// the library two of them.
class MPAvatar extends StatefulWidget {
  /// Creates an avatar.
  const MPAvatar({
    this.image,
    this.name,
    this.initials,
    this.semanticLabel,
    this.shape,
    this.variant,
    this.size,
    this.color,
    this.delay,
    this.onLoadingStatusChange,
    this.child,
    super.key,
  });

  /// The picture. Until it loads, and forever if it fails, the fallback is
  /// what is drawn, so an avatar is never an empty box.
  ///
  /// An [ImageProvider] rather than a URL, because that is the shape every
  /// picture in Flutter has: a `NetworkImage`, an `AssetImage` or a provider
  /// from a caching package all fit without the avatar knowing which. It is
  /// decoded at the size of the box, not the size of the file.
  final ImageProvider<Object>? image;

  /// Who or what this is. One parameter doing three jobs: it names the picture,
  /// the initials are derived from it, and it is the sentence a screen reader
  /// hears instead of those initials.
  ///
  /// The initials are the first character of the first word plus the first
  /// character of the last: "Jane Doe" is `JD`, "홍길동" is `홍`. That rule is
  /// wrong for some names, which is what [initials] is for.
  final String? name;

  /// The initials, written out, for when the rule derived the wrong ones.
  final String? initials;

  /// What the picture says, for a reader who cannot see it. React's `alt`.
  ///
  /// Defaults to [name], and to nothing at all when there is no name: an
  /// avatar next to the person's own name in a row is decoration, and reading
  /// it out says the name twice.
  final String? semanticLabel;

  /// The crop. [MPAvatarShape.circle] when left out.
  final MPAvatarShape? shape;

  /// How much surface is painted behind the fallback. Invisible once a picture
  /// has loaded, apart from the edge [MPVariant.outlined] keeps.
  ///
  /// [MPVariant.tonal] is the default because it is what MD3 draws a monogram
  /// on: the container tone of the accent family, with the matching `on` ink.
  /// A page of filled avatars is a page of saturated circles nobody can read a
  /// name off.
  final MPVariant? variant;

  /// The box the picture is drawn in: the control heights, so an avatar and
  /// the button beside it in a toolbar are the same height. [MPSize.md] unless
  /// an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the fallback reads. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise.
  final MPColor? color;

  /// How long to wait before drawing the fallback while [image] loads. Set it
  /// to roughly the time a cached picture takes and the initials stop flashing
  /// up in front of a picture that was about to arrive anyway.
  final Duration? delay;

  /// Called as the picture moves between the [MPAvatarLoadingStatus] values.
  final ValueChanged<MPAvatarLoadingStatus>? onLoadingStatusChange;

  /// The fallback, drawn instead of the initials: an icon, a logo, a single
  /// emoji, whatever stands in for this particular thing when there is no
  /// picture of it.
  final Widget? child;

  @override
  State<MPAvatar> createState() => _MPAvatarState();
}

/// The initials, sized off the box rather than off the row.
///
/// Its own ladder and not the control text, because a control's label is
/// measured against the words next to it and this one against the circle
/// around it: roughly 40% of the diameter at every step, which is where two
/// characters fill the width without touching the edge. The steps are still
/// Material roles rather than interpolated sizes.
MPTypeRole _initialsRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.labelMedium;
    case MPSize.sm:
      return scale.labelLarge;
    case MPSize.md:
      return scale.titleLarge;
    case MPSize.lg:
      return scale.headlineSmall;
    case MPSize.xl:
      return scale.headlineMedium;
  }
}

/// The corner of a squared avatar.
///
/// A shape statement rather than a fraction of the box: MD3's corner sizes are
/// absolute, and `medium` on a 56px avatar is the same 12px it is anywhere
/// else. It stops climbing at `md` because past 12px on a box this small the
/// corners meet and [MPAvatar.shape] stops having two values.
double _squareRadius(MPShapes shapes, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return shapes.extraSmall;
    case MPSize.sm:
      return shapes.small;
    case MPSize.md:
    case MPSize.lg:
    case MPSize.xl:
      return shapes.medium;
  }
}

/// How much of the box the silhouette fills, edge to edge.
const double _silhouetteFraction = 0.6;

/// The first character of the first word, plus the first of the last.
///
/// Split into runes rather than indexed, so a name that starts with an emoji or
/// any character outside the basic plane is not cut in half between its two
/// code units. One word gives one character on purpose: Korean, Japanese and
/// Chinese names are a single token, and two of their characters at 32px is a
/// smudge where one is a name.
String _initialsOf(String name) {
  final List<String> words = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((String word) => word.isNotEmpty)
      .toList();

  if (words.isEmpty) {
    return '';
  }

  String head(String word) => String.fromCharCode(word.runes.first);

  final String first = head(words.first);
  final String last = words.length > 1 ? head(words.last) : '';

  return (first + last).toUpperCase();
}

class _MPAvatarState extends State<MPAvatar> {
  MPAvatarLoadingStatus _status = MPAvatarLoadingStatus.idle;

  /// Whether the fallback may be drawn yet. Only ever `false` while a [delay]
  /// is running for a picture that is still on its way.
  bool _fallbackDue = true;

  Timer? _delay;

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void didUpdateWidget(MPAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.image != widget.image) {
      _start();
    }
  }

  @override
  void dispose() {
    _delay?.cancel();
    super.dispose();
  }

  /// Resets the bookkeeping for a new picture, or for none.
  void _start() {
    _delay?.cancel();
    _delay = null;

    final MPAvatarLoadingStatus next = widget.image == null
        ? MPAvatarLoadingStatus.idle
        : MPAvatarLoadingStatus.loading;

    final Duration? delay = widget.delay;

    _fallbackDue = widget.image == null || delay == null || delay <= Duration.zero;

    if (!_fallbackDue) {
      _delay = Timer(delay!, () {
        if (mounted) {
          setState(() => _fallbackDue = true);
        }
      });
    }

    if (next != _status) {
      _status = next;
      _report(next);
    }
  }

  /// Tells the caller, after the frame: the picture's own callbacks run in the
  /// middle of a build, and a caller that calls `setState` from inside one
  /// would be rebuilding a widget that is already being built.
  void _report(MPAvatarLoadingStatus status) {
    final ValueChanged<MPAvatarLoadingStatus>? listener = widget.onLoadingStatusChange;

    if (listener == null) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _status == status) {
        listener(status);
      }
    });
  }

  /// Records a status the picture reported. A failure changes what is drawn,
  /// so it is the one that rebuilds; an arrival is already on screen through
  /// the frame builder.
  void _settle(MPAvatarLoadingStatus status) {
    if (_status == status) {
      return;
    }

    _status = status;
    _report(status);

    if (status == MPAvatarLoadingStatus.error) {
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        if (mounted) {
          setState(() {
            _delay?.cancel();
            _fallbackDue = true;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPVariant variant = widget.variant ?? MPVariant.tonal;
    final MPAvatarShape shape = widget.shape ?? MPAvatarShape.circle;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    final double box = mpControlHeight[size]!;
    final BorderRadius radius = shape == MPAvatarShape.circle
        ? BorderRadius.circular(box / 2)
        : BorderRadius.circular(_squareRadius(theme.shapes, size));
    final _AvatarPaint paint = _paintFor(colors, colors.accent(color), variant);

    final String derived = widget.name == null ? '' : _initialsOf(widget.name!);
    final String? standIn = widget.initials ?? (derived.isEmpty ? null : derived);
    final String? label = widget.semanticLabel ?? widget.name;

    // `child` beats the initials beats the silhouette. Only the last of the
    // three has nothing to say, which is what decides whether the fallback
    // needs the name read out in place of what it shows.
    final bool speaks = widget.child != null || standIn != null;

    Widget fallback = DefaultTextStyle.merge(
      style: _initialsRole(
        theme.typescale,
        size,
      ).style(paint.ink).copyWith(fontWeight: FontWeight.w500, height: 1),
      maxLines: 1,
      softWrap: false,
      child: IconTheme.merge(
        data: IconThemeData(color: paint.ink, size: box * _silhouetteFraction),
        child:
            widget.child ??
            (standIn != null
                ? Text(standIn)
                : _Silhouette(size: box * _silhouetteFraction, color: paint.ink)),
      ),
    );

    // `JD` read out loud is two letters, not a person. When there is a name it
    // becomes the avatar's name and the initials are left as the picture they
    // are standing in for.
    if (label != null && speaks) {
      fallback = ExcludeSemantics(child: fallback);
    }

    final Widget standInBox = _fallbackDue ? Center(child: fallback) : const SizedBox.expand();

    Widget content = standInBox;

    if (widget.image != null && _status != MPAvatarLoadingStatus.error) {
      content = Image(
        // Decoded at the size of the box rather than the size of the file,
        // which is the difference between a few hundred kilobytes and several
        // megabytes for every avatar in a list.
        image: sizedForDecode(
          widget.image!,
          width: box,
          height: box,
          devicePixelRatio: MediaQuery.maybeDevicePixelRatioOf(context) ?? 1,
          cover: true,
        ),
        width: box,
        height: box,
        fit: BoxFit.cover,
        // Named once, by the `Semantics` round the whole avatar.
        excludeFromSemantics: true,
        frameBuilder: (BuildContext context, Widget child, int? frame, bool synchronous) {
          if (frame == null && !synchronous) {
            return standInBox;
          }

          _settle(MPAvatarLoadingStatus.loaded);

          // The picture *arrives*, over the avatar's own container tone rather
          // than over the initials: a letter dissolving into a face is a
          // different claim from a face being filled in. A picture that was
          // already in the cache has nothing to arrive from.
          if (synchronous || reduceMotion) {
            return child;
          }

          return TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: MPMotion.short4,
            curve: MPMotion.standard,
            builder: (BuildContext context, double opacity, Widget? child) {
              return Opacity(opacity: opacity, child: child);
            },
            child: child,
          );
        },
        errorBuilder: (BuildContext context, Object error, StackTrace? stack) {
          _settle(MPAvatarLoadingStatus.error);

          return Center(child: fallback);
        },
      );
    }

    return Semantics(
      container: label != null,
      image: widget.image != null && _status != MPAvatarLoadingStatus.error,
      label: label,
      // The box is sized outside the animation: the colours ease, the size does
      // not, so an avatar given a new size takes it at once.
      child: SizedBox.square(
        dimension: box,
        child: AnimatedContainer(
          duration: reduceMotion ? Duration.zero : MPMotion.short4,
          curve: MPMotion.standard,
          decoration: BoxDecoration(
            color: paint.fill,
            borderRadius: radius,
            border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
            boxShadow: paint.shadows,
          ),
          clipBehavior: Clip.antiAlias,
          child: content,
        ),
      ),
    );
  }
}

/// What an avatar paints behind its fallback.
class _AvatarPaint {
  const _AvatarPaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

const Color _clear = Color(0x00000000);

/// The five weights. An avatar *is* the thing being coloured, so, as on a chip
/// and a badge, its container takes the tint rather than staying neutral.
_AvatarPaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _AvatarPaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _AvatarPaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _AvatarPaint(
        fill: colors.surfaceContainerLow,
        ink: accent.color,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _AvatarPaint(
        fill: _clear,
        ink: accent.color,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _AvatarPaint(fill: _clear, ink: colors.onSurfaceVariant);
  }
}

/// A shoulders-and-head silhouette, drawn here rather than taken from an icon
/// set because it has to fill its circle edge to edge, and a stroked glyph is
/// drawn with a margin.
///
/// It exists so that an [MPAvatar] with nothing at all is still an avatar. A
/// box with no picture, no name and no glyph in it is indistinguishable from a
/// component that failed to render.
class _Silhouette extends StatelessWidget {
  const _Silhouette({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(size: Size.square(size), painter: _SilhouettePainter(color));
  }
}

class _SilhouettePainter extends CustomPainter {
  const _SilhouettePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;

    // Written in the 24-unit box the React package's SVG uses, so the two are
    // the same drawing.
    canvas
      ..save()
      ..scale(size.shortestSide / 24)
      ..drawCircle(const Offset(12, 7.5), 4.5, paint)
      ..drawPath(
        Path()
          ..moveTo(12, 14.25)
          ..cubicTo(7.72, 14.25, 4.25, 16.67, 4.25, 19.65)
          ..cubicTo(4.25, 20.4, 4.85, 21, 5.6, 21)
          ..lineTo(18.4, 21)
          ..cubicTo(19.15, 21, 19.75, 20.4, 19.75, 19.65)
          ..cubicTo(19.75, 16.67, 16.28, 14.25, 12, 14.25)
          ..close(),
        paint,
      )
      ..restore();
  }

  @override
  bool shouldRepaint(_SilhouettePainter oldDelegate) => oldDelegate.color != color;
}
