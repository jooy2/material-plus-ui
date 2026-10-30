/// How much frame a preview needs, including whatever it has put in the air.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// The room one preview is asking for, measured after a frame.
///
/// A Flutter preview is an `<iframe>`, and an `<iframe>` is a window: nothing
/// the app draws can leave it. React's previews are in the page itself, so a
/// popover there floats over the documentation around it and the question never
/// comes up — while the same popover here is cut off at the edge of the frame,
/// which is how a reader ends up pressing a button and seeing nothing happen at
/// all.
///
/// So the frame follows what is open. Every frame the gallery measures what the
/// overlay is holding, and asks the page for the room it needs — **above** the
/// demo as well as below it, because a popup that has flipped upwards needs the
/// demo pushed down rather than the frame made taller.
@immutable
class PreviewRoom {
  /// Creates a measurement.
  const PreviewRoom({required this.lead, required this.height});

  /// A preview with nothing open: no room above, and no frame worth reporting
  /// until something has been laid out.
  static const PreviewRoom none = PreviewRoom(lead: 0, height: 0);

  /// Empty canvas held above the demo, in logical pixels, so a popup that opened
  /// upwards has somewhere to be. The demo is pushed down by this much.
  final double lead;

  /// The whole frame: [lead], the demo, and anything hanging below it.
  final double height;

  /// Whether this is the same measurement as [other], to within half a pixel.
  ///
  /// Reporting a height that has not changed would put the page into a resize
  /// loop with the frame it is resizing.
  bool matches(PreviewRoom other) =>
      (lead - other.lead).abs() < 0.5 && (height - other.height).abs() < 0.5;

  @override
  String toString() => 'PreviewRoom(lead: $lead, height: $height)';
}

/// Measures the preview [content] sits in, overlay included.
///
/// [lead] is the room the demo is *currently* being given above itself, which
/// is what makes this converge in one step rather than oscillating: a popup is
/// stuck to its anchor, so pushing the demo down by a pixel pushes the popup
/// down by a pixel too, and "how far above the demo does it reach" is the same
/// number before and after. Ask for exactly that much room and the next
/// measurement asks for it again.
///
/// Returns `null` when there is nothing laid out to measure yet.
PreviewRoom? measureRoom({
  required BuildContext context,
  required GlobalKey content,
  required double lead,
  required EdgeInsets padding,
  double screen = 360,
}) {
  final box = content.currentContext?.findRenderObject() as RenderBox?;

  if (box == null || !box.hasSize) {
    return null;
  }

  // The band is the preview as it stands with nothing open: the demo, plus the
  // canvas padding drawn around it inside the frame.
  final band = box.size.height + padding.vertical;
  final stage = Overlay.maybeOf(context)?.context.findRenderObject() as RenderBox?;

  double above = 0;
  double below = 0;
  bool sheet = false;

  if (stage != null && stage.attached) {
    final base = _entry(box, stage);

    stage.visitChildren((RenderObject child) {
      // Everything the overlay holds is a child of the same render object,
      // including the app itself. The app is the one child that is not a layer.
      if (identical(child, base)) {
        return;
      }

      final popups = _popups(child, stage);

      if (popups.isEmpty) {
        sheet = true;

        return;
      }

      for (final popup in popups) {
        final over = lead - popup.top;
        final under = popup.bottom - (lead + band);

        // A popup that has left the preview is given the margin the content
        // has, which is why the two sides differ: the top band is the one the
        // page floats its framework badge in, and a popup that stopped level
        // with the demo would be underneath it.
        if (over > 0) {
          above = math.max(above, over + padding.top);
        }

        if (under > 0) {
          below = math.max(below, under + padding.bottom);
        }
      }
    });
  }

  return PreviewRoom(
    lead: above,
    // A sheet is not measured, it is given a screen — see [_screen] at the call
    // site for why there is nothing here to measure.
    height: math.max(above + band + below, sheet ? screen : 0),
  );
}

/// Which of the overlay's children the demo itself is inside.
///
/// Walking up from the demo rather than down from the overlay, because the
/// ancestors are a line and the descendants are a tree.
RenderObject? _entry(RenderObject content, RenderObject stage) {
  RenderObject? node = content;

  while (node != null && !identical(node.parent, stage)) {
    node = node.parent;
  }

  return node;
}

/// The anchored popups inside one layer, in the overlay's own coordinates.
///
/// A `CompositedTransformFollower` is what sticks a Material Plus popup to its anchor,
/// and it is the only place in the package one is used — so the follower is what
/// identifies a popup, and its child is the popup itself. The walk stops there:
/// what is *inside* a popup can be clipped, scrolled or deliberately off screen,
/// and none of that is room the frame owes anybody.
///
/// A layer with no follower in it is a `MPPortal` — a modal, a drawer, an
/// overlay — which covers the window rather than hangs off something in it.
List<Rect> _popups(RenderObject layer, RenderBox stage) {
  final found = <Rect>[];

  void visit(RenderObject node) {
    if (node is RenderFollowerLayer) {
      final popup = node.child;

      if (popup != null && popup.attached && popup.hasSize) {
        // The follower's own transform is applied to its child rather than to
        // itself, so it is the child that knows where the popup ended up.
        found.add(popup.localToGlobal(Offset.zero, ancestor: stage) & popup.size);
      }

      return;
    }

    node.visitChildren(visit);
  }

  visit(layer);

  return found;
}
