/// A box that keeps a proportion whatever width it is given.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How the media inside is fitted to the box.
///
/// `object-fit`'s own five words, because the React component is those five
/// values and a nicer set of names would only make a reader map one onto the
/// other. They land on Flutter's [BoxFit] one for one.
enum MPAspectFit {
  /// Fills the box and crops whatever does not fit. What a thumbnail wants:
  /// one that letterboxed itself would be a thumbnail with two bands in it.
  cover,

  /// Fits entirely inside the box, letterboxing what is left over. For the
  /// picture whose whole subject matters: a diagram, a logo, a scan.
  contain,

  /// Stretches to the box on both axes, proportion abandoned.
  fill,

  /// Drawn at its own size, centred, and cropped by the box.
  none,

  /// [contain] for something larger than the box, and its own size for
  /// something smaller: it is never enlarged.
  scaleDown,
}

/// A box that keeps a proportion whatever width it is given.
///
/// ```dart
/// MPAspectRatio(
///   ratio: 16 / 9,
///   fit: MPAspectFit.cover,
///   rounded: true,
///   child: Image(image: cover),
/// )
/// ```
///
/// It draws nothing: no surface, no border, no shadow, no colour. What it does
/// is *reserve* the space, so a card whose picture arrives late does not reflow
/// the screen around it, and a row of thumbnails is a row of one shape. The
/// single most common way a real page stops lining up is media of unknown
/// height arriving after the text around it has been laid out.
///
/// The box clips what it holds, rounded or not. Without that a `cover` child
/// spills straight out of the proportion it was just given, and the box would
/// only be reserving space rather than holding anything to it.
class MPAspectRatio extends StatelessWidget {
  /// Creates a box that holds [ratio].
  const MPAspectRatio({
    this.child,
    this.ratio = 1,
    this.fit,
    this.rounded = false,
    this.size,
    super.key,
  }) : assert(ratio > 0, 'ratio must be greater than zero');

  /// What the proportion holds, laid out to the full box.
  final Widget? child;

  /// The proportion, as width over height. `1` is a square and `16 / 9` a video
  /// frame, written as the division, which is how Flutter states a proportion
  /// everywhere else.
  final double ratio;

  /// How [child] is fitted to the box, or `null` to lay it out to the box as it
  /// is.
  ///
  /// **`null` by default, where the React component defaults to `cover`.** In a
  /// browser `object-fit` reaches only a replaced element, an image or a video,
  /// so React can default it and have it leave a box of text alone. Flutter has
  /// no such distinction: a fit here is a [FittedBox] round whatever the child
  /// is, and one applied by default would scale a column of prose. So it is
  /// opt-in, and it applies to anything. An [Image] that carries its own
  /// [BoxFit] needs nothing here.
  final MPAspectFit? fit;

  /// Rounds the corners to the [size] rung.
  ///
  /// Off by default. A layout widget draws nothing, and a photograph with its
  /// corners cut is a decision about the photograph, but it is such a common one
  /// that making the caller wrap this in a [ClipRRect] would be perverse.
  final bool rounded;

  /// Which corner [rounded] uses: `extraSmall`, `small`, `medium`, `medium`,
  /// `extraLarge`.
  ///
  /// [MPSize.md] is `medium`, MD3's own card corner, because a photograph
  /// inside a card should have the card's corner. [MPSize.lg] shares it, as in
  /// the React package, whose token sheet jumps from `medium` to `extraLarge`.
  /// There is no height and no type scale on a box whose whole job is a
  /// proportion, so this is the one axis `size` has here.
  final MPSize? size;

  /// The [BoxFit] an [MPAspectFit] names.
  static BoxFit boxFitOf(MPAspectFit fit) {
    switch (fit) {
      case MPAspectFit.cover:
        return BoxFit.cover;
      case MPAspectFit.contain:
        return BoxFit.contain;
      case MPAspectFit.fill:
        return BoxFit.fill;
      case MPAspectFit.none:
        return BoxFit.none;
      case MPAspectFit.scaleDown:
        return BoxFit.scaleDown;
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPShapes shapes = MPTheme.of(context).shapes;
    final double corner = switch (size) {
      MPSize.xs => shapes.extraSmall,
      MPSize.sm => shapes.small,
      MPSize.md || MPSize.lg => shapes.medium,
      MPSize.xl => shapes.extraLarge,
    };

    Widget? held = child;

    if (held != null && fit != null) {
      held = FittedBox(fit: boxFitOf(fit!), clipBehavior: Clip.hardEdge, child: held);
    }

    if (held != null) {
      held = rounded
          ? ClipRRect(borderRadius: BorderRadius.circular(corner), child: held)
          : ClipRect(child: held);
    }

    return AspectRatio(aspectRatio: ratio, child: held);
  }
}
