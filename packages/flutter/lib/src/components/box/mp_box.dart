/// A sheet with content on it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A sheet with content on it. The plainest surface in the library: it groups
/// things, and that is all it does.
///
/// ```dart
/// MPBox(child: Text('Grouped.'))
/// ```
///
/// Everything structural (a heading, a footer, dividers, a picture across the
/// top) belongs to `MPCard`, which is this box with those sections laid out on
/// it.
///
/// ## Why a box is never dyed, and takes no `color`
///
/// What it holds is somebody else's content, and that content arrives with its
/// own colours: body text, links, buttons, fields. On an accent fill every one
/// of them would need an on-accent treatment of its own, which is the opposite
/// of what a container is for. So the ladder runs up the **neutral** surface
/// roles: [MPVariant.filled] is `surfaceContainerHighest`, MD3's own filled
/// card, and [MPVariant.elevated] and [MPVariant.outlined] are the
/// specification's other two card variants to the letter.
///
/// ## What [elevation] does
///
/// MD3 does not treat height as a free axis: an elevated surface is
/// `surfaceContainerLow` **under** a level-1 shadow, and the tone and the shadow
/// are one decision. So a level names both, and `variant: MPVariant.elevated` is
/// that decision made once, at level 1.
///
/// ## No `transition`
///
/// The React box takes an entrance that runs once as it mounts. Here that is
/// the job of the `MPAnimate*` widgets, which wrap anything; in Flutter a
/// wrapper costs no element of its own, which was the React prop's whole reason
/// to exist.
class MPBox extends StatelessWidget {
  /// Creates a sheet holding [child].
  const MPBox({
    this.child,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.padded = true,
    this.clipBehavior = Clip.none,
    super.key,
  });

  /// What the sheet holds. It brings its own typography; the box sets only the
  /// ink, `onSurface`.
  final Widget? child;

  /// How much surface the sheet paints. A container's ladder, so
  /// [MPVariant.filled] is `surfaceContainerHighest` and never the accent.
  ///
  /// - [MPVariant.filled]: `surfaceContainerHighest`, MD3's filled card.
  /// - [MPVariant.tonal]: `surfaceContainer`, one step quieter.
  /// - [MPVariant.elevated]: `surfaceContainerLow` under a level-1 shadow.
  /// - [MPVariant.outlined]: a hairline in `outlineVariant`, the default.
  /// - [MPVariant.text]: grouping only, no surface at all.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`, on MD3's own scale.
  ///
  /// It moves the **tone** as well as the shadow, because Material pairs the
  /// two. Given a level, [variant] is left holding only its hairline. Left
  /// unset, [variant] decides.
  final MPElevation? elevation;

  /// The room inside, and nothing else.
  ///
  /// **The one component where `size` sets no height and no type scale.** A box
  /// is as tall as what it holds, and a container that reset the type scale
  /// would make the same paragraph render at two sizes depending on what it was
  /// wrapped in. The corner is not on the ladder either: a sheet is
  /// `corner-medium` at every rung, exactly as MD3 draws a card.
  final MPSize? size;

  /// Takes room out of the padding [size] chose, two pixels a side per step.
  final MPDensity? density;

  /// Inner padding. Turn it off for full-bleed content: a picture, a table, a
  /// list that draws its own rows.
  final bool padded;

  /// Whether what is on the sheet is cut to the sheet's corners.
  ///
  /// The React box has no such prop: a browser's `overflow: hidden` is one class
  /// a caller adds. Here a clip is a widget rather than a property, so it is a
  /// parameter, and it is off by default because a clip also cuts off anything
  /// a child draws outside itself, a focus ring included. Turn it on for a
  /// full-bleed picture that would otherwise poke out of the rounded corners.
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(colors, variant, elevation: elevation);

    // The hairline is inside the box, as CSS's `border-box` puts it, so an
    // outlined box and a filled one beside it hold their content at the same
    // inset rather than a pixel apart.
    final double hairline = paint.border?.width ?? 0;
    final double pad = padded ? mpSheetPadOf(size, density) : 0;

    Widget content = Padding(
      padding: EdgeInsets.all(hairline + pad),
      child: DefaultTextStyle.merge(
        style: TextStyle(color: colors.onSurface),
        child: child ?? const SizedBox.shrink(),
      ),
    );

    if (clipBehavior != Clip.none) {
      content = ClipRRect(borderRadius: radius, clipBehavior: clipBehavior, child: content);
    }

    return DecoratedBox(decoration: paint.decoration(radius), child: content);
  }
}
