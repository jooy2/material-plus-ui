/// Keeps the row a keyboard has moved to inside a popup list's own view.
library;

import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// Remembers where a list's highlighted row was built, and scrolls the list —
/// and only the list — until the row is in view.
///
/// Worked out against the list's own viewport rather than asked for with
/// `Scrollable.ensureVisible`, which walks every scrollable ancestor: a popup
/// that scrolled the page behind it to show a row would move the field it hangs
/// off.
///
/// Only a keyboard move asks for this. A row the pointer lights is already
/// under the pointer, and scrolling it would move it out from under.
class MPRowReveal {
  BuildContext? _row;
  int _index = -1;

  /// Wraps the highlighted row, so where it landed can be read after layout.
  ///
  /// [marked] says whether the row is the highlighted one. A list that wraps
  /// every row and passes it keeps each row in the same place in the tree as
  /// the highlight moves, so what the row holds is not built again from
  /// scratch, and a row easing to its highlighted ink goes on easing. Only a
  /// marked row is remembered.
  Widget mark({required int index, required Widget child, bool marked = true}) {
    return Builder(
      builder: (BuildContext context) {
        if (marked) {
          _row = context;
          _index = index;
        }

        return child;
      },
    );
  }

  /// Scrolls [controller]'s list so that row [index] of [count] is in view,
  /// once the frame that draws it has been laid out.
  void reveal(ScrollController controller, int index, int count) {
    _after(() => _reveal(controller, index, count, attempts: 3));
  }

  void _after(VoidCallback callback) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => callback());
  }

  void _reveal(ScrollController controller, int index, int count, {required int attempts}) {
    if (index < 0 || attempts <= 0) {
      return;
    }

    // A list that has only just been asked to open is not on screen until the
    // popup's own next frame.
    if (!controller.hasClients) {
      _after(() => _reveal(controller, index, count, attempts: attempts - 1));

      return;
    }

    final ScrollPosition position = controller.position;
    final BuildContext? row = _row;
    final RenderObject? object = row != null && row.mounted && _index == index
        ? row.findRenderObject()
        : null;

    if (object == null || !object.attached) {
      // A lazy list builds only what is near its view, so a row far away has no
      // box yet. Jump to where it should be by its share of the list, and read
      // the row itself once that frame has built it.
      if (count > 0) {
        final double whole = position.maxScrollExtent + position.viewportDimension;

        position.jumpTo(
          clampDouble(
            whole * index / count - position.viewportDimension / 2,
            position.minScrollExtent,
            position.maxScrollExtent,
          ),
        );
      }

      _after(() => _reveal(controller, index, count, attempts: attempts - 1));

      return;
    }

    final RenderAbstractViewport viewport = RenderAbstractViewport.of(object);
    final double toTop = viewport.getOffsetToReveal(object, 0).offset;
    final double toBottom = viewport.getOffsetToReveal(object, 1).offset;

    // The least movement that shows the row: nothing when it already shows, and
    // otherwise just far enough to bring its nearer edge to the edge of the view.
    final double target = clampDouble(
      clampDouble(position.pixels, math.min(toBottom, toTop), toTop),
      position.minScrollExtent,
      position.maxScrollExtent,
    );

    if (target != position.pixels) {
      position.jumpTo(target);
    }
  }
}
