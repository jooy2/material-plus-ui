/// Holding a picture back until the box it goes in is near the view.
///
/// A browser does this on its own: an `<img loading="lazy"` costs nothing until
/// the reader scrolls towards it, which is what the React build relies on. A
/// Flutter `Image` resolves its provider as soon as it is mounted, so a gallery
/// of sixty photographs asks for sixty decodes before any of them is on screen
/// — and a gallery is the one place in the library that builds a list of
/// pictures rather than one.
///
/// Laziness needs a viewport, and `MPGallery` has none: it sizes itself to its
/// content and the app scrolls it. So what is read here is the nearest
/// [Scrollable] above, and a gallery with none is built whole, as it was.
///
/// What is held back is the picture and not the tile. Every layout the gallery
/// draws knows each tile's box from the item's own `ratio`, never from the file,
/// so the board is laid out exactly as before and nothing moves when a picture
/// arrives.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// Builds [child] once its box comes within a screen of the view, and
/// [placeholder] until then.
///
/// One way only. A picture that has been asked for stays asked for: scrolling
/// back past it must not throw the decode away and show the placeholder again,
/// which would be a gallery that flickers whenever it is read twice.
class MPNearViewport extends StatefulWidget {
  /// Creates a gate.
  const MPNearViewport({required this.placeholder, required this.child, super.key});

  /// What stands in the box until then. The same thing the picture itself draws
  /// while it loads, so the swap is not a second appearance.
  final Widget placeholder;

  /// The picture.
  final Widget child;

  @override
  State<MPNearViewport> createState() => _MPNearViewportState();
}

class _MPNearViewportState extends State<MPNearViewport> {
  bool _near = false;
  ScrollPosition? _position;

  @override
  void initState() {
    super.initState();
    // The first look has to wait for a layout: until the box has a size there
    // is no offset to compare against the viewport's.
    WidgetsBinding.instance.addPostFrameCallback(_look);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (_near) {
      return;
    }

    final ScrollableState? scrollable = Scrollable.maybeOf(context);

    if (scrollable == null) {
      // Nothing to be far from. A gallery that is not in a scroll view is as
      // visible as it is ever going to be.
      _near = true;
      _drop();

      return;
    }

    if (identical(_position, scrollable.position)) {
      return;
    }

    _drop();
    _position = scrollable.position..addListener(_onScroll);
  }

  @override
  void dispose() {
    _drop();
    super.dispose();
  }

  void _drop() {
    _position?.removeListener(_onScroll);
    _position = null;
  }

  /// Layout is settled while a scroll notification is being delivered, so this
  /// reads the offsets there and then rather than waiting for a frame.
  void _onScroll() => _look(null);

  void _look(Duration? _) {
    if (!mounted || _near) {
      return;
    }

    final RenderObject? box = context.findRenderObject();
    final ScrollPosition? position = _position;

    if (box is! RenderBox || !box.attached || !box.hasSize) {
      return;
    }

    final RenderAbstractViewport? viewport = RenderAbstractViewport.maybeOf(box);

    if (viewport == null ||
        position == null ||
        !position.hasPixels ||
        !position.hasViewportDimension) {
      // Something about the arrangement is not what this expects. Showing the
      // picture is the answer that is never wrong, only slower.
      _reveal();

      return;
    }

    /* The two ends of the range of scroll offsets the box is on screen at:
       where its leading edge meets the viewport's, and where its trailing edge
       does. Which of the two is the larger depends on which way the list runs,
       so they are sorted rather than assumed. */
    final double start = viewport.getOffsetToReveal(box, 0).offset;
    final double end = viewport.getOffsetToReveal(box, 1).offset;
    // A screen either side, which is roughly what a browser gives an
    // `<img loading="lazy">` before it starts fetching.
    final double slack = position.viewportDimension;

    if (position.pixels >= math.min(start, end) - slack &&
        position.pixels <= math.max(start, end) + slack) {
      _reveal();
    }
  }

  void _reveal() {
    _drop();
    setState(() => _near = true);
  }

  @override
  Widget build(BuildContext context) {
    return _near ? widget.child : widget.placeholder;
  }
}
