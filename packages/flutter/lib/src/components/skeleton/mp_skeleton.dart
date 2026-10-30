/// The shape of something that has not loaded yet.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// What a placeholder is standing in for.
enum MPSkeletonShape {
  /// A run of text. Sized off the type scale, so an [MPSize.md] line is
  /// exactly as tall as the `md` type it will be replaced by.
  line,

  /// A block: an image, a chart, a card, a map.
  rect,

  /// An avatar, or anything else round.
  circle,
}

/// A line's height: the em box of the type it replaces, 12, 14, 16, 16, 22.
///
/// Not the line box. A placeholder as tall as the leading would be a bar with
/// no air between it and the next one, and a paragraph of those is a barcode.
const Map<MPSize, double> _lineHeight = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 16,
  MPSize.xl: 22,
};

/// The leading: what is left of the line box once the bar is drawn in it.
const Map<MPSize, double> _lineGap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 8,
  MPSize.xl: 6,
};

/// What a [MPSkeletonShape.rect] is as tall as when nothing says otherwise: a
/// thumbnail. Anything else wants a `height`, and most uses pass one.
const Map<MPSize, double> _blockHeight = <MPSize, double>{
  MPSize.xs: 48,
  MPSize.sm: 64,
  MPSize.md: 80,
  MPSize.lg: 112,
  MPSize.xl: 144,
};

/// How far short of the margin the last line of a stack stops.
const double _lastLine = 0.6;

/// One breath of the pulse, and its curve: Tailwind's `animate-pulse`, which
/// is what the React build runs.
const Duration _pulseDuration = Duration(seconds: 2);
const Cubic _pulseCurve = Cubic(0.4, 0, 0.6, 1);

/// The shape of something that has not loaded yet.
///
/// ```dart
/// MPSkeleton(shape: MPSkeletonShape.circle)
/// ```
///
/// It reserves the space the real thing will take, which is the whole job: a
/// card that grows by 200px when its image arrives has moved everything below
/// it while somebody was reading it. A spinner cannot do that.
///
/// The three shapes are the three things a layout is made of, and each is
/// sized off the ladder the real component uses, so an [MPSize.md] line is as
/// tall as `md` type and an `md` circle is exactly a 56px control.
///
/// The surface is deliberately flat: a tint and nothing else, no elevation and
/// no edge. A skeleton is the shape of something that is not there yet, and a
/// page of thirty of them should not ask for thirty shadows.
///
/// A line and a block fill the width they are given, as the React build's
/// `w-full` does, so they need a bounded width. A share of it is a
/// [FractionallySizedBox] round the skeleton.
class MPSkeleton extends StatefulWidget {
  /// Creates a placeholder.
  const MPSkeleton({
    this.shape = MPSkeletonShape.line,
    this.lines = 1,
    this.size,
    this.color,
    this.width,
    this.height,
    this.animated = true,
    this.label,
    super.key,
  });

  /// What the placeholder stands in for. [MPSkeletonShape.line] by default.
  final MPSkeletonShape shape;

  /// How many lines to draw, for [MPSkeletonShape.line]. The last one is drawn
  /// short, the way the last line of a paragraph is, so a block of them reads
  /// as prose rather than as a barcode. Ignored by the other two shapes.
  final int lines;

  /// The scale of the thing being stood in for: the type scale for a line,
  /// the diameter for a circle, the default block height for a rect.
  final MPSize? size;

  /// Which accent family tints the placeholder.
  ///
  /// **No default**, and not the provider's either: a placeholder is not a
  /// thing yet, so it has no meaning to carry. Left out it is
  /// `surfaceContainerHighest`, MD3's role for a container with nothing in
  /// it, which is precisely what this is. Setting it swaps in the family's
  /// container tone, for the rare page where the wait itself is branded.
  final MPColor? color;

  /// An explicit width, in logical pixels.
  final double? width;

  /// An explicit height, in logical pixels. Not applied to a stack of lines,
  /// where each bar has the type scale's own height and a height on the stack
  /// would squeeze the column rather than set a line.
  final double? height;

  /// The pulse. Turn it off for a page holding dozens of them, or where the
  /// wait is long enough that motion becomes noise.
  ///
  /// Not the accessibility switch: `MediaQuery.disableAnimations` stops the
  /// pulse without being asked, and the box is still the right size, which is
  /// the part that was doing the work.
  final bool animated;

  /// What a screen reader is told, if anything.
  ///
  /// Left out, the placeholder says nothing, because a dozen boxes each
  /// announcing themselves is worse than silence. Give the *one* skeleton that
  /// stands for the whole region a label and it becomes a status node that
  /// reports the wait.
  final String? label;

  @override
  State<MPSkeleton> createState() => _MPSkeletonState();
}

class _MPSkeletonState extends State<MPSkeleton> with SingleTickerProviderStateMixin {
  // One clock for every bar, so a paragraph of them costs one ticker and
  // breathes in step.
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: _pulseDuration,
  );

  late final Animation<double> _opacity = TweenSequence<double>(<TweenSequenceItem<double>>[
    TweenSequenceItem<double>(
      tween: Tween<double>(begin: 1, end: 0.5).chain(CurveTween(curve: _pulseCurve)),
      weight: 1,
    ),
    TweenSequenceItem<double>(
      tween: Tween<double>(begin: 0.5, end: 1).chain(CurveTween(curve: _pulseCurve)),
      weight: 1,
    ),
  ]).animate(_pulse);

  bool get _pulsing => widget.animated && !(MediaQuery.maybeDisableAnimationsOf(context) ?? false);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(MPSkeleton oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  void _sync() {
    if (_pulsing) {
      if (!_pulse.isAnimating) {
        _pulse.repeat();
      }
    } else if (_pulse.isAnimating) {
      _pulse
        ..stop()
        ..value = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Color fill = widget.color == null
        ? colors.surfaceContainerHighest
        : colors.accent(widget.color!).container;
    final bool pulsing = _pulsing;

    Widget bar({required double radius, double? width, double? height}) {
      Widget box = Container(
        width: width,
        height: height,
        decoration: BoxDecoration(color: fill, borderRadius: BorderRadius.circular(radius)),
      );

      if (pulsing) {
        box = FadeTransition(opacity: _opacity, child: box);
      }

      return box;
    }

    // A run of lines is a stack of bars rather than one box, so the gaps
    // between them are real gaps: text has leading.
    final bool stacked = widget.shape == MPSkeletonShape.line && widget.lines > 1;
    Widget placeholder;

    if (stacked) {
      placeholder = SizedBox(
        width: widget.width ?? double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            for (int index = 0; index < widget.lines; index += 1) ...<Widget>[
              if (index > 0) SizedBox(height: _lineGap[size]),
              FractionallySizedBox(
                alignment: AlignmentDirectional.centerStart,
                // The last line of a paragraph does not reach the margin.
                widthFactor: index == widget.lines - 1 ? _lastLine : 1,
                child: bar(radius: theme.shapes.extraSmall, height: _lineHeight[size]),
              ),
            ],
          ],
        ),
      );
    } else {
      switch (widget.shape) {
        case MPSkeletonShape.line:
          placeholder = bar(
            radius: theme.shapes.extraSmall,
            width: widget.width ?? double.infinity,
            height: widget.height ?? _lineHeight[size],
          );
        case MPSkeletonShape.rect:
          placeholder = bar(
            radius: theme.shapes.medium,
            width: widget.width ?? double.infinity,
            height: widget.height ?? _blockHeight[size],
          );
        case MPSkeletonShape.circle:
          final double diameter = mpControlHeight[size]!;
          final double width = widget.width ?? diameter;
          final double height = widget.height ?? diameter;

          placeholder = bar(
            radius: MPShapes.circular(
              theme.shapes.full,
              height: width < height ? width : height,
            ).topLeft.x,
            width: width,
            height: height,
          );
      }
    }

    if (pulsing) {
      placeholder = RepaintBoundary(child: placeholder);
    }

    // A width of its own is kept even where the parent would stretch it, and
    // so is a circle's: an avatar's placeholder in a stretched column is still
    // round. It sits at the start, where a block of that width would.
    if (widget.width != null || widget.shape == MPSkeletonShape.circle) {
      placeholder = Align(
        alignment: AlignmentDirectional.centerStart,
        widthFactor: 1,
        heightFactor: 1,
        child: placeholder,
      );
    }

    // Unlabelled it is scenery and says nothing; labelled it is the one node
    // that reports the wait for the region around it.
    final String? label = widget.label;

    if (label == null || label.isEmpty) {
      return ExcludeSemantics(child: placeholder);
    }

    return Semantics(
      container: true,
      role: SemanticsRole.status,
      label: label,
      child: ExcludeSemantics(child: placeholder),
    );
  }
}
