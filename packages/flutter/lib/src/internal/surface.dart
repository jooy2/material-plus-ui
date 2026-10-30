/// What a Material surface is painted with: the state layer over an
/// interactive one, and the container tone, hairline and shadow of one that
/// holds content.
///
/// The React package's `StateLayer.tsx`, `surface.ts` and `elevation.ts`, in
/// one place because every component reaches for at least one of them.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How strong the state layer is for [state]: 8% under a hovering pointer, 10%
/// while pressed or reached by the keyboard, nothing at rest.
///
/// Keyboard focus only. A layer under every click-focused control would leave
/// the last button pressed looking permanently lit. And none on a disabled
/// control, which has its own treatment: a wash on top of it would say
/// something is available.
double mpStateLayerOpacity(MPInteraction state, {bool enabled = true}) {
  if (!enabled) {
    return 0;
  }

  if (state.pressed) {
    return MPStateOpacity.press;
  }

  if (state.focusVisible) {
    return MPStateOpacity.focus;
  }

  if (state.hovered) {
    return MPStateOpacity.hover;
  }

  return 0;
}

/// MD3's state layer: a wash of the content colour over a surface.
///
/// MD3 does not express hover, focus and press as three more colours. It puts
/// a translucent wash of the *ink* over the container, so one rule covers a
/// filled button, an outlined one and a bare text one. A layer composites
/// rather than replaces, so whatever was underneath (a fill, a hairline,
/// nothing) is still there under it.
///
/// Drawn flat and all at once rather than as a ripple, as the React package
/// draws it: the same statement without an animation that has to finish before
/// the screen the press triggered is allowed to change.
class MPStateLayer extends StatelessWidget {
  /// Washes [child]'s box in [color] at [opacity], clipped to [borderRadius].
  const MPStateLayer({
    required this.color,
    required this.opacity,
    required this.child,
    this.borderRadius = BorderRadius.zero,
    this.shape = BoxShape.rectangle,
    super.key,
  });

  /// The ink the layer is made of, which is the content colour of the surface.
  final Color color;

  /// How much of it, from [mpStateLayerOpacity].
  final double opacity;

  /// The surface's corners, which the layer follows.
  final BorderRadius borderRadius;

  /// A circle for a layer that is a halo round a small control, as on a
  /// checkbox, a radio or a switch's handle.
  final BoxShape shape;

  /// The surface under the layer.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return Stack(
      fit: StackFit.passthrough,
      children: <Widget>[
        child,
        Positioned.fill(
          child: IgnorePointer(
            child: AnimatedContainer(
              duration: reduceMotion ? Duration.zero : MPMotion.short4,
              curve: MPMotion.standard,
              decoration: BoxDecoration(
                color: color.withValues(alpha: opacity),
                borderRadius: shape == BoxShape.circle ? null : borderRadius,
                shape: shape,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// What a container is painted with.
@immutable
class MPContainerPaint {
  /// Creates a paint from its three parts.
  const MPContainerPaint({required this.color, this.border, this.shadows = const <BoxShadow>[]});

  /// The fill. Transparent for a surface that has none.
  final Color color;

  /// The hairline, or `null` for none.
  final BorderSide? border;

  /// The shadow.
  final List<BoxShadow> shadows;

  /// This paint as a decoration with [borderRadius].
  BoxDecoration decoration(BorderRadius borderRadius) {
    return BoxDecoration(
      color: color,
      border: border == null ? null : Border.fromBorderSide(border!),
      borderRadius: borderRadius,
      boxShadow: shadows,
    );
  }
}

/// The surface tone each elevation level names, with its shadow.
MPContainerPaint mpElevationPaint(MPColorScheme colors, MPElevation elevation) {
  final List<BoxShadow> shadows = MPShadows.of(elevation);

  switch (elevation.clamp(0, 5)) {
    case 0:
      return MPContainerPaint(color: colors.surface);
    case 1:
      return MPContainerPaint(color: colors.surfaceContainerLow, shadows: shadows);
    case 2:
      return MPContainerPaint(color: colors.surfaceContainer, shadows: shadows);
    case 3:
    case 4:
      return MPContainerPaint(color: colors.surfaceContainerHigh, shadows: shadows);
    default:
      return MPContainerPaint(color: colors.surfaceContainerHighest, shadows: shadows);
  }
}

/// A container's surface for [variant], or for [elevation] when one is given.
///
/// The variants are a card's: `filled` is the highest container tone, `tonal`
/// the middle one, `elevated` the low one under a level-1 shadow, `outlined` a
/// hairline in `outlineVariant`, and `text` nothing at all.
///
/// Given a level, the level decides the surface and the variant is left holding
/// only its hairline: `outlined` keeps its border, and nothing else paints.
/// Anything else would be two parameters writing one fill.
MPContainerPaint mpContainerPaint(
  MPColorScheme colors,
  MPVariant variant, {
  MPElevation? elevation,
}) {
  if (elevation != null) {
    final MPContainerPaint level = mpElevationPaint(colors, elevation);

    return variant == MPVariant.outlined
        ? MPContainerPaint(
            color: level.color,
            border: BorderSide(color: colors.outlineVariant),
            shadows: level.shadows,
          )
        : level;
  }

  switch (variant) {
    case MPVariant.filled:
      return MPContainerPaint(color: colors.surfaceContainerHighest);
    case MPVariant.tonal:
      return MPContainerPaint(color: colors.surfaceContainer);
    case MPVariant.elevated:
      return MPContainerPaint(color: colors.surfaceContainerLow, shadows: MPShadows.of(1));
    case MPVariant.outlined:
      return MPContainerPaint(
        color: const Color(0x00000000),
        border: BorderSide(color: colors.outlineVariant),
      );
    case MPVariant.text:
      return const MPContainerPaint(color: Color(0x00000000));
  }
}

/// The scrim under a modal surface: `scrim` at 32%, as the React package
/// paints it.
Color mpScrimColor(MPColorScheme colors) => colors.scrim.withValues(alpha: 0.32);
