/// A connected run of controls: a button group and a toggle group.
///
/// The React package lays the run out with `inline-flex gap-0.5` and lifts a
/// focused member over its neighbours with `[&>*:focus-visible]:z-10`, because
/// the focus ring is drawn outside the control and a member in the middle of a
/// run would otherwise be painted under whichever neighbour comes after it.
/// A [Row] paints its children in order and has no `z-index`, so this lays the
/// run out the same way and paints the member holding the focus last.
///
/// It also does the one thing `inline-flex` does by default that a [Column]
/// does not: a vertical run stretches every member to the widest one, so a
/// stack of buttons is one shape rather than a ragged edge.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// The seam between two members, `gap-0.5`. A gap rather than a shared
/// hairline is what lets a filled run work at all: two filled buttons sharing
/// an edge merge into one blob.
const double mpJoinedGap = 2;

/// Lays [children] along [orientation] with [mpJoinedGap] between them, and
/// paints the one at [raised] over the rest.
class MPJoinedRun extends MultiChildRenderObjectWidget {
  /// Creates a run.
  const MPJoinedRun({
    required this.orientation,
    required super.children,
    this.fill = false,
    this.raised,
    super.key,
  });

  /// Which way the run goes.
  final MPOrientation orientation;

  /// Stretches the run to the width it is given and divides the main axis
  /// evenly between the members.
  final bool fill;

  /// The member to paint last, usually the one holding the focus.
  final int? raised;

  @override
  RenderObject createRenderObject(BuildContext context) {
    return _RenderJoinedRun(
      orientation: orientation,
      fill: fill,
      raised: raised,
      textDirection: Directionality.maybeOf(context) ?? TextDirection.ltr,
    );
  }

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderJoinedRun)
      ..orientation = orientation
      ..fill = fill
      ..raised = raised
      ..textDirection = Directionality.maybeOf(context) ?? TextDirection.ltr;
  }
}

class _JoinedParentData extends ContainerBoxParentData<RenderBox> {}

class _RenderJoinedRun extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _JoinedParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _JoinedParentData> {
  _RenderJoinedRun({
    required MPOrientation orientation,
    required bool fill,
    required int? raised,
    required TextDirection textDirection,
  }) : _orientation = orientation,
       _fill = fill,
       _raised = raised,
       _textDirection = textDirection;

  MPOrientation _orientation;
  set orientation(MPOrientation value) {
    if (value != _orientation) {
      _orientation = value;
      markNeedsLayout();
    }
  }

  bool _fill;
  set fill(bool value) {
    if (value != _fill) {
      _fill = value;
      markNeedsLayout();
    }
  }

  int? _raised;
  set raised(int? value) {
    if (value != _raised) {
      _raised = value;
      markNeedsPaint();
    }
  }

  TextDirection _textDirection;
  set textDirection(TextDirection value) {
    if (value != _textDirection) {
      _textDirection = value;
      markNeedsLayout();
    }
  }

  bool get _horizontal => _orientation == MPOrientation.horizontal;

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _JoinedParentData) {
      child.parentData = _JoinedParentData();
    }
  }

  List<RenderBox> get _members {
    final List<RenderBox> members = <RenderBox>[];
    RenderBox? child = firstChild;

    while (child != null) {
      members.add(child);
      child = childAfter(child);
    }

    return members;
  }

  double _gaps(int count) => count > 1 ? mpJoinedGap * (count - 1) : 0;

  @override
  double computeMinIntrinsicWidth(double height) => _intrinsicWidth(height, min: true);

  @override
  double computeMaxIntrinsicWidth(double height) => _intrinsicWidth(height, min: false);

  @override
  double computeMinIntrinsicHeight(double width) => _intrinsicHeight(width, min: true);

  @override
  double computeMaxIntrinsicHeight(double width) => _intrinsicHeight(width, min: false);

  double _intrinsicWidth(double height, {required bool min}) {
    final List<RenderBox> members = _members;
    final Iterable<double> widths = members.map(
      (RenderBox child) =>
          min ? child.getMinIntrinsicWidth(height) : child.getMaxIntrinsicWidth(height),
    );

    if (_horizontal) {
      return widths.fold<double>(0, (double sum, double w) => sum + w) + _gaps(members.length);
    }

    return widths.fold<double>(0, math.max);
  }

  double _intrinsicHeight(double width, {required bool min}) {
    final List<RenderBox> members = _members;
    final Iterable<double> heights = members.map(
      (RenderBox child) =>
          min ? child.getMinIntrinsicHeight(width) : child.getMaxIntrinsicHeight(width),
    );

    if (_horizontal) {
      return heights.fold<double>(0, math.max);
    }

    return heights.fold<double>(0, (double sum, double h) => sum + h) + _gaps(members.length);
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    return _layout(constraints, dry: true);
  }

  @override
  void performLayout() {
    size = _layout(constraints, dry: false);
  }

  Size _layout(BoxConstraints constraints, {required bool dry}) {
    final List<RenderBox> members = _members;

    if (members.isEmpty) {
      return constraints.smallest;
    }

    Size measure(RenderBox child, BoxConstraints inner) {
      if (dry) {
        return child.getDryLayout(inner);
      }

      child.layout(inner, parentUsesSize: true);

      return child.size;
    }

    final int count = members.length;
    final List<Size> sizes;

    if (_horizontal) {
      final bool fill = _fill && constraints.hasBoundedWidth;
      final double share = fill
          ? math.max(0, (constraints.maxWidth - _gaps(count)) / count)
          : double.infinity;

      // Each member keeps its own height: a control here is drawn at the
      // height its rung gives it, which `inline-flex`'s stretch does not
      // override either, and the shorter ones are centred on the run.
      sizes = <Size>[
        for (final RenderBox child in members)
          measure(
            child,
            fill
                ? BoxConstraints(minWidth: share, maxWidth: share, maxHeight: constraints.maxHeight)
                : BoxConstraints(maxHeight: constraints.maxHeight),
          ),
      ];
    } else {
      final bool fill = _fill && constraints.hasBoundedWidth;
      final List<Size> loose = <Size>[
        for (final RenderBox child in members)
          measure(child, BoxConstraints(maxWidth: constraints.maxWidth)),
      ];
      final double cross = fill
          ? constraints.maxWidth
          : loose.fold<double>(0, (double m, Size s) => math.max(m, s.width));

      sizes = <Size>[
        for (int index = 0; index < count; index += 1)
          measure(
            members[index],
            BoxConstraints.tightFor(width: cross, height: loose[index].height),
          ),
      ];
    }

    final double main =
        sizes.fold<double>(0, (double sum, Size s) => sum + (_horizontal ? s.width : s.height)) +
        _gaps(count);
    final double cross = sizes.fold<double>(
      0,
      (double m, Size s) => math.max(m, _horizontal ? s.height : s.width),
    );
    final Size total = constraints.constrain(_horizontal ? Size(main, cross) : Size(cross, main));

    if (dry) {
      return total;
    }

    final bool rtl = _horizontal && _textDirection == TextDirection.rtl;
    double at = 0;

    for (int index = 0; index < count; index += 1) {
      final Size child = sizes[index];
      final _JoinedParentData data = members[index].parentData! as _JoinedParentData;

      if (_horizontal) {
        final double x = rtl ? total.width - at - child.width : at;
        data.offset = Offset(x, (total.height - child.height) / 2);
        at += child.width + mpJoinedGap;
      } else {
        data.offset = Offset((total.width - child.width) / 2, at);
        at += child.height + mpJoinedGap;
      }
    }

    return total;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    RenderBox? lifted;
    RenderBox? child = firstChild;
    int index = 0;

    while (child != null) {
      final _JoinedParentData data = child.parentData! as _JoinedParentData;

      if (index == _raised) {
        lifted = child;
      } else {
        context.paintChild(child, data.offset + offset);
      }

      child = data.nextSibling;
      index += 1;
    }

    if (lifted != null) {
      context.paintChild(lifted, (lifted.parentData! as _JoinedParentData).offset + offset);
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    return defaultHitTestChildren(result, position: position);
  }
}
