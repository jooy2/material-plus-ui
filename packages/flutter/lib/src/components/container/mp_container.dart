/// The page margin, and optionally a measure.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/types.dart';

/// The page margin, and optionally a measure.
///
/// ```dart
/// MPContainer(
///   maxWidth: const MPResponsive<MPMeasure>(MPMeasure.sm),
///   child: article,
/// )
/// ```
///
/// Material describes a layout as content held off the edge of the window by a
/// margin, 16dp in a compact window and 24dp from medium up, and this is that
/// margin, said once at the top of a page rather than on each of the things
/// inside it.
///
/// Nothing to do with the grid. A container holds an `MPGrid` as happily as it
/// holds a single paragraph, and a grid needs no container around it: how far
/// the content sits from the edge of the window and how the content divides
/// itself up are separate questions.
///
/// ## Why it draws no surface
///
/// No `variant`, no `color`, no shadow: the outermost widget on a page is the
/// one thing that must not decide what the page looks like. A container that
/// painted `surfaceContainer` would put a second background behind an app that
/// already has one, and every sheet inside it would be a sheet on a sheet. When
/// the page genuinely is a card on a background, that is an `MPBox` or an
/// `MPCard` inside the container.
///
/// ## Why the measure is off by default
///
/// Nearly every page wants the margin, and a good number of them (a dashboard,
/// a table, an editor) deliberately want the full width. A container that
/// capped the width on its own would be a widget whose most common use is
/// undoing something it did.
class MPContainer extends StatelessWidget {
  /// Creates a container around [child].
  const MPContainer({
    this.child,
    this.maxWidth,
    this.padded = true,
    this.size,
    this.centered = true,
    super.key,
  });

  /// The page.
  final Widget? child;

  /// How wide the content is allowed to get, per window size class.
  ///
  /// A rung pinned to MD3's window size classes ([MPMeasure.sm] 600,
  /// [MPMeasure.md] 840, [MPMeasure.lg] 1200, [MPMeasure.xl] 1600,
  /// [MPMeasure.xs] 480) or a length of your own, `MPMeasure.pixels(640)`.
  /// `MPResponsive<MPMeasure>.from(expanded: MPMeasure.lg)` is edge to edge on
  /// a phone and held to 1200 from 840 up.
  ///
  /// `null`, the default, is no limit, the same as [MPMeasure.none]: a
  /// container's job is the margin, and a measure is a second decision a page
  /// should have to ask for.
  final MPResponsive<MPMeasure>? maxWidth;

  /// The page margin. Turn it off to keep the centring and the measure without
  /// the gutter: a full-bleed hero, a section that pads itself.
  final bool padded;

  /// The margin's rung: 10, 12, 16, 20, 24. [MPSize.md] is 16, MD3's own
  /// compact margin; the specification widens it to 24 from a medium window
  /// up, which is [MPSize.xl].
  ///
  /// As on `MPBox` this is the size of the *sheet*: it never touches a height
  /// or the type scale, and it is independent of [maxWidth].
  final MPSize? size;

  /// Centres the content once [maxWidth] is narrower than the space given. No
  /// effect while there is no measure, because there is nothing left over to
  /// centre in.
  final bool centered;

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double limit = mpMeasureOf(context, maxWidth);

    Widget content = child ?? const SizedBox.shrink();

    if (padded) {
      content = Padding(
        padding: EdgeInsets.symmetric(horizontal: mpSheetPad[size]!),
        child: content,
      );
    }

    // `w-full`: the content fills the width it is offered rather than
    // shrink-wrapping, which is what makes the measure a limit and not a width.
    // The padding is inside the limit, as `box-sizing: border-box` puts it, so
    // a capped container is exactly as wide as it said it would be.
    content = _FillWidth(maxWidth: limit, child: content);

    // `mx-auto`, with the height factor that keeps the container as tall as
    // what it holds rather than as tall as the screen.
    return Align(
      alignment: centered ? AlignmentDirectional.topCenter : AlignmentDirectional.topStart,
      heightFactor: 1,
      child: content,
    );
  }
}

/// [child] as wide as it may be, up to [maxWidth].
///
/// A `SizedBox(width: double.infinity)` would say the same thing and throw the
/// moment the container is put somewhere with no width to fill, inside a `Row`
/// or a horizontal scroller. There the content keeps its own width, still held
/// to the measure, which is what a block with `width: 100%` does inside a
/// shrink-to-fit parent.
class _FillWidth extends SingleChildRenderObjectWidget {
  const _FillWidth({required this.maxWidth, super.child});

  final double maxWidth;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderFillWidth(maxWidth);

  @override
  void updateRenderObject(BuildContext context, _RenderFillWidth renderObject) {
    renderObject.maxWidth = maxWidth;
  }
}

class _RenderFillWidth extends RenderProxyBox {
  _RenderFillWidth(this._maxWidth);

  double _maxWidth;

  set maxWidth(double value) {
    if (value == _maxWidth) {
      return;
    }

    _maxWidth = value;
    markNeedsLayout();
  }

  BoxConstraints _constrain(BoxConstraints constraints) {
    if (!constraints.hasBoundedWidth) {
      return _maxWidth.isInfinite ? constraints : constraints.copyWith(maxWidth: _maxWidth);
    }

    final double width = constraints.constrainWidth(_maxWidth);

    return constraints.copyWith(minWidth: width, maxWidth: width);
  }

  @override
  double computeMinIntrinsicWidth(double height) {
    return _clampIntrinsic(super.computeMinIntrinsicWidth(height));
  }

  @override
  double computeMaxIntrinsicWidth(double height) {
    return _clampIntrinsic(super.computeMaxIntrinsicWidth(height));
  }

  double _clampIntrinsic(double width) => width > _maxWidth ? _maxWidth : width;

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final BoxConstraints inner = _constrain(constraints);

    return constraints.constrain(child?.getDryLayout(inner) ?? inner.smallest);
  }

  @override
  void performLayout() {
    final BoxConstraints inner = _constrain(constraints);

    if (child == null) {
      size = constraints.constrain(inner.smallest);

      return;
    }

    child!.layout(inner, parentUsesSize: true);
    size = constraints.constrain(child!.size);
  }
}
