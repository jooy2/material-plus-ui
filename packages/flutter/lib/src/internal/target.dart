/// Where a small control can be pressed from.
///
/// WCAG 2.5.8 asks for a target at least 24 logical pixels square. The × on a
/// chip and on a picker trigger is drawn smaller than that, and drawing it
/// larger would make the chip or the trigger larger with it. So the drawing
/// stays where it is and the press is moved instead: a press anywhere in the
/// square around a [MPTarget] is handed on as a press in the middle of it.
///
/// It takes two widgets rather than one because a box is only asked about a
/// press inside its own size, and so is every box above it. The × sits in a row
/// as tall as its line of text, so a margin it claimed round itself would never
/// be asked about. [MPTargetScope] goes round the whole control, which is.
///
/// None of this is exported from `material_plus_ui.dart` — it is the library talking to
/// itself.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// The side of the square a [MPTarget] can be pressed from.
const double mpTargetSize = 24;

/// Goes round a control that holds a [MPTarget], and takes a press in the
/// square around that target as a press on it.
///
/// Where the square reaches over something else in the control — the label
/// beside a chip's ×, the value beside a picker's — the target has the press
/// inside the square and the neighbour keeps the rest. Nothing is laid out any
/// differently.
class MPTargetScope extends SingleChildRenderObjectWidget {
  /// Creates a scope around [child].
  const MPTargetScope({required Widget super.child, super.key});

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderTargetScope();
}

/// Marks a control drawn smaller than [mpTargetSize], for the nearest
/// [MPTargetScope] above it.
class MPTarget extends SingleChildRenderObjectWidget {
  /// Marks [child].
  const MPTarget({required Widget super.child, super.key});

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderTarget();
}

class _RenderTargetScope extends RenderProxyBox {
  final List<_RenderTarget> _targets = <_RenderTarget>[];

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    for (final _RenderTarget target in _targets) {
      if (!target.hasSize) {
        continue;
      }

      final Rect box = MatrixUtils.transformRect(
        target.getTransformTo(this),
        Offset.zero & target.size,
      );
      final Rect square = Rect.fromCenter(
        center: box.center,
        width: math.max(box.width, mpTargetSize),
        height: math.max(box.height, mpTargetSize),
      );

      // Moved back inside the control where it would stick out of it. Nothing
      // outside the control is sure to be asked about a press, so a square that
      // reached past the end of the smallest chip would lose that strip. Moved
      // in, it still covers the whole target.
      final Rect reach = square.shift(
        Offset(
          _nudge(start: square.left, end: square.right, extent: size.width),
          _nudge(start: square.top, end: square.bottom, extent: size.height),
        ),
      );

      // Handed on at the target's middle, so every box on the way down to it is
      // asked about a point inside itself.
      if (reach.contains(position) && super.hitTest(result, position: box.center)) {
        return true;
      }
    }

    return super.hitTest(result, position: position);
  }
}

/// How far `start`–`end` has to move to lie inside `0`–`extent`: nothing when
/// it already does, or when it is too long to.
double _nudge({required double start, required double end, required double extent}) {
  if (end - start > extent) {
    return 0;
  }

  if (start < 0) {
    return -start;
  }

  if (end > extent) {
    return extent - end;
  }

  return 0;
}

class _RenderTarget extends RenderProxyBox {
  _RenderTargetScope? _scope;

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);

    RenderObject? node = parent;

    while (node != null && node is! _RenderTargetScope) {
      node = node.parent;
    }

    _scope = node as _RenderTargetScope?;
    _scope?._targets.add(this);
  }

  @override
  void detach() {
    _scope?._targets.remove(this);
    _scope = null;
    super.detach();
  }
}
