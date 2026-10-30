/// A surface that floats beside something rather than over everything.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/back.dart';
import 'package:material_plus_ui/src/internal/ease.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How a popup's width follows its anchor's.
enum MPAnchorWidth {
  /// The popup's own width, whatever the anchor's is.
  free,

  /// At least the anchor's, and wider when the popup's content is: a menu that
  /// can say a longer word than the field it drops out of.
  atLeast,

  /// Exactly the anchor's: a list of suggestions for what is being typed, which
  /// is as wide as the place it is typed into.
  exact,
}

/// A popup lifted out of the tree and hung off an anchor.
///
/// What a `MPTooltip` and a `MPSelect`'s list have in common: the lift into the
/// nearest [Overlay], the anchoring, the flip when there is no room on the side
/// that was asked for, the fade, a press outside, and the system back.
///
/// The tracking is a [LayerLink] rather than arithmetic repeated every frame,
/// which is what keeps a popup stuck to its anchor while the page under it
/// scrolls: the follower is positioned by the compositor off the leader's own
/// layer, so nothing has to notice that the anchor moved.
///
/// Collision handling is a **flip and not a slide**. When the side that was
/// asked for has no room the popup goes to the opposite one; it never shifts
/// along the edge it is on. Sliding needs the popup's position recomputed
/// against the viewport every frame, which is the thing the layer link exists to
/// avoid, and a popup that creeps sideways as its anchor nears the edge is a
/// popup whose arrow no longer points at anything.
///
/// The side is decided as the popup opens, and again whenever the screen
/// changes size, the popup's own size changes, or a relayout moves or resizes
/// the anchor, and never on a scroll, which the layer link already follows. A
/// popup going up is laid out once before it is drawn, so the first frame it
/// is seen in is the one it was placed for.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator and
/// `MaterialApp` both provide.
class MPAnchoredPortal extends StatefulWidget {
  /// Creates an anchored popup.
  const MPAnchoredPortal({
    required this.open,
    required this.child,
    required this.popup,
    this.side = MPSide.top,
    this.align = MPAlign.center,
    this.offset = 6,
    this.onDismiss,
    this.onEscape,
    this.anchorInside = false,
    this.anchorWidth = MPAnchorWidth.free,
    this.fitWidth = false,
    this.onSideResolved,
    super.key,
  });

  /// Whether the popup is up.
  final bool open;

  /// The anchor, drawn where it was written.
  final Widget child;

  /// What floats beside it.
  final Widget popup;

  /// Which edge of the anchor the popup is asked for.
  final MPSide side;

  /// Where it sits along that edge.
  final MPAlign align;

  /// How far it stands off the anchor, in logical pixels.
  final double offset;

  /// Called when a press lands outside the popup. `null` leaves outside presses
  /// alone, which is what a tooltip wants: it is closed by the pointer leaving,
  /// not by anything being pressed.
  ///
  /// The press still reaches whatever it landed on, so the screen behind the
  /// popup goes on being pressed and scrolled. The exception is the anchor: a
  /// press on it closes the popup and goes no further, or a trigger that opens
  /// its popup would open it again on the same press. [anchorInside] turns that
  /// exception round.
  ///
  /// A popup that a press outside closes is one the system back closes too —
  /// Android's back button and gesture, TalkBack's back, VoiceOver's escape
  /// scrub — through [onEscape] where there is one, as <kbd>Escape</kbd> does.
  /// The back then closes the popup on top and leaves the page, or the modal
  /// the popup was opened in, where it is. Without it, the back goes on to
  /// whatever is under the popup, as a press outside does.
  final VoidCallback? onDismiss;

  /// Called when Escape is pressed while the popup is open and the focus is on
  /// the anchor or inside the popup. Falls back to [onDismiss].
  ///
  /// Separate because a tooltip closes on Escape without taking outside presses
  /// or the system back: it is not a barrier. With neither, Escape does nothing
  /// while the popup is open and goes no further, so a modal under a popup that
  /// refuses to be dismissed stays up too. While the popup is closed, Escape
  /// goes on to whatever is around it, a modal or a page that binds it too.
  final VoidCallback? onEscape;

  /// Whether a press on the anchor counts as a press inside the popup.
  ///
  /// Off, a press on the anchor is outside it, which suits an anchor that is a
  /// trigger and nothing else: the press closes the popup, as a trigger pressed
  /// again does. On, a press on the anchor leaves the popup open and reaches
  /// the anchor, which suits an anchor that goes on being used while its popup
  /// is up — a combobox's field, whose caret moves, whose chips come off and
  /// whose chevron closes the list itself. Base UI leaves a combobox's input
  /// group out of the outside press for the same reason. A picker's trigger is
  /// the other one: it closes its popup itself, and the × in it clears the
  /// value while the popup is up.
  final bool anchorInside;

  /// How the popup's width follows the anchor's.
  ///
  /// For a list that belongs to a field: a menu narrower than the box it drops
  /// out of reads as a different control.
  final MPAnchorWidth anchorWidth;

  /// Whether the popup is held to the room it has on its side of the anchor.
  ///
  /// The room is measured after the flip, whenever the side is decided: from
  /// where the popup hangs to the edge of the screen it runs towards. A popup
  /// here flips and never slides, so one wider than that room would run off
  /// the screen. For a popup as wide as whatever the caller puts in it; the
  /// rest keep the width they are given.
  ///
  /// A flip beside the anchor is decided against the popup's own width, the
  /// widest it would be laid out, as a React popup's `max-content`, and not
  /// against the width its room holds it to. That width is read from its
  /// intrinsic width, so what it holds has to be able to say what that is.
  final bool fitWidth;

  /// Told which side the popup actually ended up on, once it is known.
  ///
  /// The popup usually has to draw something that points back at the anchor, and
  /// only this knows which way that is after a flip.
  final ValueChanged<MPSide>? onSideResolved;

  @override
  State<MPAnchoredPortal> createState() => _MPAnchoredPortalState();
}

class _MPAnchoredPortalState extends State<MPAnchoredPortal> with SingleTickerProviderStateMixin {
  final LayerLink _link = LayerLink();
  final OverlayPortalController _portal = OverlayPortalController();
  final GlobalKey _anchorKey = GlobalKey();
  final GlobalKey _popupKey = GlobalKey();

  /// The group the popup's sheet reads the backdrop in, which is its alone, for
  /// the reason `MPPortal` gives: the popup is painted over the page, and a
  /// key it shared with the field it hangs off would hand it the backdrop as it
  /// was when that field was drawn.
  final BackdropKey _layer = BackdropKey();

  // No duration here, for the reason `MPPortal` gives: `_syncMotion` sets
  // it from the theme before the first frame and whenever the theme changes.
  late final AnimationController _fade = AnimationController(vsync: this);

  /// The fade as it is drawn, on the theme's curve, which `_syncMotion` hands
  /// it with the duration.
  late final CurvedAnimation _opacity = CurvedAnimation(parent: _fade, curve: Curves.linear);

  /// The side the popup is on, which is the one asked for until there is no room
  /// for it there.
  late MPSide _side = widget.side;

  /// How wide the anchor is, for a popup that has to match it.
  double? _anchorWidth;

  /// How wide the popup may be on the side it opened to, for a popup held to
  /// its room, and `null` until that has been measured.
  double? _room;

  /// What the side was last decided from, and `null` until it has been since
  /// the popup last opened.
  _Placed? _placed;

  /// The scrollables between the anchor and the screen, as the last measure
  /// found them, whose scrolls are taken out of where the anchor is.
  List<ScrollableState> _scrollables = const <ScrollableState>[];

  /// Whether a look at the anchor and the popup waits for the end of the next
  /// frame.
  bool _watching = false;

  /// Whether the popup is laid out and not drawn, which it is from the frame
  /// it goes up until the measure after that frame has placed it.
  bool _hidden = false;

  /// Answers Escape before anything around the popup does, so a popover opened
  /// in a modal closes itself and leaves the modal up.
  late final _EscapeAction _escape = _EscapeAction(this);

  @override
  void initState() {
    super.initState();
    _fade.addStatusListener(_onFade);

    if (widget.open) {
      _show();
    }
  }

  @override
  void didUpdateWidget(MPAnchoredPortal oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.side != oldWidget.side) {
      _side = widget.side;
    }

    if (widget.open != oldWidget.open) {
      // Read here as well as below, for the reason `MPPortal` gives: a theme
      // that changed in the same frame as `open` reaches an update first.
      _syncMotion();
      widget.open ? _show() : _fade.reverse();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
  }

  /// Looks at the anchor and the popup at the end of every frame for as long
  /// as the popup is open, and measures it again when anything the side was
  /// decided from has changed, as Floating UI's `autoUpdate` places a React
  /// popup again.
  ///
  /// A look at the end of a frame rather than a listener on the screen, the
  /// popup and the anchor: nothing else hears a relayout that moves the anchor.
  /// It costs nothing while no frame is drawn, and only an open popup looks. A
  /// scroll is taken out of where the anchor is, so a scroll that the layer
  /// link carries the popup through measures nothing.
  void _watch() {
    if (_watching) {
      return;
    }

    _watching = true;
    _afterFrame(() {
      _watching = false;

      if (!mounted || !widget.open) {
        return;
      }

      final placed = _placed;
      final now = _look()?.placed;

      if (now != null && (placed == null || now.differs(placed))) {
        _measure();
      }

      _watch();
    });
  }

  /// Hands the fade the theme's duration and curve, or no duration at all for
  /// a reader who asked for less movement.
  void _syncMotion() {
    _fade.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;
    easeBothWays(_opacity, MPMotion.standard);
  }

  @override
  void dispose() {
    _fade.removeStatusListener(_onFade);
    _opacity.dispose();
    _fade.dispose();
    super.dispose();
  }

  void _onFade(AnimationStatus status) {
    if (status != AnimationStatus.dismissed || !_portal.isShowing) {
      return;
    }

    // After the frame while the tree is building, for the reason `MPPortal`
    // gives: under reduced motion the fade is over inside the build that
    // closed the popup.
    if (SchedulerBinding.instance.schedulerPhase == SchedulerPhase.persistentCallbacks) {
      _afterFrame(_takeDown);
    } else {
      _takeDown();
    }
  }

  /// Takes the popup down, unless it has been opened again or has left the
  /// tree since it finished going out.
  void _takeDown() {
    if (mounted && !widget.open && _fade.isDismissed && _portal.isShowing) {
      _portal.hide();
    }
  }

  /// Everything a popup does to itself is out of bounds during a build, and a
  /// build is where the change nearly always arrives from.
  void _afterFrame(VoidCallback callback) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => callback());
  }

  void _show() {
    _afterFrame(() {
      if (!mounted || !widget.open) {
        return;
      }

      // A popup still going out is drawn where it was placed, and stays there
      // until the measure below says otherwise.
      if (!_portal.isShowing) {
        _side = widget.side;
        _placed = null;
        _hidden = true;
        _fromAnchor();
        _portal.show();
      }

      _fade.forward();

      // One more frame: the popup has to have been laid out once before there is
      // a size to decide the flip against. It is not drawn in that frame, so the
      // first frame it is seen in is the one it was placed for.
      _afterFrame(() {
        _measure();
        _watch();
      });
    });
  }

  /// Holds a popup that is going up to what its anchor says about its width,
  /// before it is first laid out: the anchor's width, and the room it has on
  /// the side it is asked for.
  ///
  /// Above or below the anchor the room is the same on either side, so the
  /// popup is laid out at the width it keeps and its first measure decides
  /// the flip against the height it has there. Beside the anchor, the room on
  /// the other side is taken up once a flip is decided, which it is against
  /// the popup's own width and not the room's.
  void _fromAnchor() {
    final seen = _anchorOnScreen();

    if (seen == null) {
      _room = null;

      return;
    }

    final (:anchor, :room, :box) = seen;

    _anchorWidth = anchor.size.width;
    _room = widget.fitWidth ? _roomOn(_side, box, room.size) : null;
  }

  /// The anchor and the screen as they are laid out now, with where the anchor
  /// is on the screen, or `null` while either has not been laid out.
  ({RenderBox anchor, RenderBox room, Rect box})? _anchorOnScreen() {
    final anchor = _anchorKey.currentContext?.findRenderObject() as RenderBox?;
    final room = Overlay.maybeOf(context)?.context.findRenderObject() as RenderBox?;

    if (anchor == null || room == null || !anchor.attached || !anchor.hasSize || !room.hasSize) {
      return null;
    }

    return (
      anchor: anchor,
      room: room,
      box: anchor.localToGlobal(Offset.zero, ancestor: room) & anchor.size,
    );
  }

  /// The anchor, the popup and the screen as they are laid out now, with what
  /// a side is decided from, or `null` while any of them has not been laid out.
  ///
  /// [collect] finds the scrollables between the anchor and the screen again,
  /// which a measure does and a look at the end of a frame does not.
  ({RenderBox anchor, RenderBox popup, RenderBox room, Rect box, _Placed placed})? _look({
    bool collect = false,
  }) {
    final seen = _anchorOnScreen();
    final popup = _popupKey.currentContext?.findRenderObject() as RenderBox?;

    if (seen == null || popup == null || !popup.attached || !popup.hasSize) {
      return null;
    }

    final (:anchor, :room, :box) = seen;

    if (collect) {
      final anchorContext = _anchorKey.currentContext;
      final overlay = Overlay.maybeOf(context);

      if (anchorContext != null && overlay != null) {
        _scrollables = _scrollablesBetween(anchorContext, overlay.context);
      }
    }

    // A popup held to its room is decided against the width it would be at
    // its own width, within the anchor's and the screen's.
    double? own;

    if (widget.fitWidth) {
      final bounds = _widthFor(anchor.size.width).enforce(BoxConstraints.loose(room.size));
      own = bounds.constrainWidth(popup.getMaxIntrinsicWidth(bounds.maxHeight));
    }

    return (
      anchor: anchor,
      popup: popup,
      room: room,
      box: box,
      placed: _Placed(anchor: box.shift(_scrolled()), popup: popup.size, own: own, room: room.size),
    );
  }

  /// The scrollables [anchor] sits in, up to [overlay].
  static List<ScrollableState> _scrollablesBetween(BuildContext anchor, BuildContext overlay) {
    final found = <ScrollableState>[];

    anchor.visitAncestorElements((Element element) {
      if (identical(element, overlay)) {
        return false;
      }

      if (element is StatefulElement && element.state is ScrollableState) {
        found.add(element.state as ScrollableState);
      }

      return true;
    });

    return found;
  }

  /// How far the scrollables between the anchor and the screen have carried
  /// it, turned round: added to where the anchor is, it gives a place that a
  /// scroll does not change and a relayout does.
  Offset _scrolled() {
    var by = Offset.zero;

    for (final scrollable in _scrollables) {
      if (!scrollable.mounted || !scrollable.position.hasPixels) {
        continue;
      }

      final pixels = scrollable.position.pixels;

      by += switch (scrollable.axisDirection) {
        AxisDirection.down => Offset(0, pixels),
        AxisDirection.up => Offset(0, -pixels),
        AxisDirection.right => Offset(pixels, 0),
        AxisDirection.left => Offset(-pixels, 0),
      };
    }

    return by;
  }

  /// The widths the popup is held to by an anchor [width] wide.
  BoxConstraints _widthFor(double? width) {
    return switch (widget.anchorWidth) {
      MPAnchorWidth.free => const BoxConstraints(),
      MPAnchorWidth.atLeast => BoxConstraints(minWidth: width ?? 0),
      MPAnchorWidth.exact => BoxConstraints.tightFor(width: width),
    };
  }

  /// Decides the side, and the widths the popup is held to, from where the
  /// anchor and the popup are laid out now.
  ///
  /// Run as the popup opens, and after any frame that changed what it was
  /// last decided from, which includes a width it holds the popup to: a
  /// narrower popup wraps its lines and grows taller, and a flip above or
  /// below the anchor is decided against the height it grows to. That measure
  /// settles the side rather than turning it back. A popup is held to the same
  /// room above the anchor as below it, so it is as tall on either side, and a
  /// flip beside the anchor is decided against its own width, which no room
  /// changes.
  void _measure() {
    if (!mounted || !widget.open) {
      return;
    }

    final seen = _look(collect: true);

    if (seen == null) {
      // Drawn where it is rather than never, which a popup nothing can be
      // measured round would otherwise be.
      if (_hidden) {
        setState(() => _hidden = false);
      }

      return;
    }

    final (:anchor, :popup, :room, :box, :placed) = seen;
    _placed = placed;

    final size = widget.fitWidth ? Size(placed.own!, popup.size.height) : popup.size;
    final side = _fit(box, size, room.size);
    final space = widget.fitWidth ? _roomOn(side, box, room.size) : null;

    if (_hidden || side != _side || anchor.size.width != _anchorWidth || space != _room) {
      setState(() {
        _hidden = false;
        _side = side;
        _anchorWidth = anchor.size.width;
        _room = space;
      });
    }

    widget.onSideResolved?.call(side);
  }

  /// Whether [position], in global coordinates, is on the anchor.
  bool _onAnchor(Offset position) {
    final anchor = _anchorKey.currentContext?.findRenderObject() as RenderBox?;

    if (anchor == null || !anchor.attached || !anchor.hasSize) {
      return false;
    }

    return (Offset.zero & anchor.size).contains(anchor.globalToLocal(position));
  }

  /// The side that has room, which is the one asked for unless it does not.
  MPSide _fit(Rect anchor, Size popup, Size room) {
    final needsY = popup.height + widget.offset;
    final needsX = popup.width + widget.offset;

    return switch (widget.side) {
      MPSide.top =>
        anchor.top >= needsY || anchor.bottom + needsY > room.height ? MPSide.top : MPSide.bottom,
      MPSide.bottom =>
        anchor.bottom + needsY <= room.height || anchor.top < needsY ? MPSide.bottom : MPSide.top,
      MPSide.left =>
        anchor.left >= needsX || anchor.right + needsX > room.width ? MPSide.left : MPSide.right,
      MPSide.right =>
        anchor.right + needsX <= room.width || anchor.left < needsX ? MPSide.right : MPSide.left,
    };
  }

  /// How wide a popup on [side] of [anchor] can be before it runs off a screen
  /// of [room]: from where it hangs to the edge it runs towards, as
  /// [_anchors] places it.
  double _roomOn(MPSide side, Rect anchor, Size room) {
    final rtl = Directionality.of(context) == TextDirection.rtl;

    final space = switch (side) {
      MPSide.left => anchor.left - widget.offset,
      MPSide.right => room.width - anchor.right - widget.offset,
      MPSide.top || MPSide.bottom => switch (widget.align) {
        // Centred on the anchor, it runs both ways, and the nearer edge is the
        // one it reaches first.
        MPAlign.center => math.min(anchor.center.dx, room.width - anchor.center.dx) * 2,
        // From the start of the line towards its end, which is the left under
        // RTL, and from the end the other way.
        MPAlign.start => rtl ? anchor.right : room.width - anchor.left,
        MPAlign.end => rtl ? room.width - anchor.left : anchor.right,
      },
    };

    return math.max(space, 0.0);
  }

  /// Where on the anchor the popup hangs from, and where on the popup that point
  /// lands. The pair is what places it; the offset is only the standoff.
  ///
  /// Along a top or a bottom edge, `start` and `end` are the reader's, so the
  /// right and the left under RTL, and they are resolved against [direction]
  /// here because the follower takes a resolved alignment. Along a side edge
  /// they are the top and the bottom in either direction.
  (Alignment, Alignment, Offset) _anchors(TextDirection direction) {
    final along = switch (widget.align) {
      MPAlign.start => -1.0,
      MPAlign.center => 0.0,
      MPAlign.end => 1.0,
    };

    return switch (_side) {
      MPSide.top => (
        AlignmentDirectional(along, -1).resolve(direction),
        AlignmentDirectional(along, 1).resolve(direction),
        Offset(0, -widget.offset),
      ),
      MPSide.bottom => (
        AlignmentDirectional(along, 1).resolve(direction),
        AlignmentDirectional(along, -1).resolve(direction),
        Offset(0, widget.offset),
      ),
      MPSide.left => (Alignment(-1, along), Alignment(1, along), Offset(-widget.offset, 0)),
      MPSide.right => (Alignment(1, along), Alignment(-1, along), Offset(widget.offset, 0)),
    };
  }

  @override
  Widget build(BuildContext context) {
    // Around the portal rather than inside the popup: the popup's element sits
    // under the portal's, so one binding reaches a focus on the anchor and a
    // focus inside the popup alike.
    final Widget anchored = Shortcuts(
      shortcuts: const <ShortcutActivator, Intent>{
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{if (widget.open) DismissIntent: _escape},
        child: CompositedTransformTarget(
          link: _link,
          child: OverlayPortal(
            controller: _portal,
            overlayChildBuilder: _buildPopup,
            child: _PressShield(
              shielding: widget.open && widget.onDismiss != null && !widget.anchorInside,
              child: KeyedSubtree(key: _anchorKey, child: widget.child),
            ),
          ),
        ),
      ),
    );

    // The back is taken by the popups a press outside closes, and answered as
    // Escape is. A tooltip is not one of them: it is not a barrier.
    return MPBackGuard(
      active: widget.open && widget.onDismiss != null,
      onBack: widget.onEscape ?? widget.onDismiss,
      child: anchored,
    );
  }

  Widget _buildPopup(BuildContext context) {
    final (targetAnchor, followerAnchor, standoff) = _anchors(Directionality.of(context));

    final BoxConstraints width = _widthFor(_anchorWidth);
    final double? room = widget.fitWidth ? _room : null;

    Widget popup = FadeTransition(
      // Not drawn while it waits to be placed. The fade starts at nothing
      // anyway, but under reduced motion it starts at full, which would show
      // the popup where it was laid out before it was placed.
      opacity: _hidden ? kAlwaysDismissedAnimation : _opacity,
      child: ConstrainedBox(
        constraints: room == null ? width : width.enforce(BoxConstraints(maxWidth: room)),
        // A press anywhere on the popup is the popup's, including one on a gap
        // between its parts, which would otherwise fall through to the page.
        child: Listener(
          behavior: widget.onDismiss != null
              ? HitTestBehavior.opaque
              : HitTestBehavior.deferToChild,
          child: KeyedSubtree(key: _popupKey, child: widget.popup),
        ),
      ),
    );

    popup = CompositedTransformFollower(
      link: _link,
      // The popup goes away with its anchor rather than staying behind on the
      // last place it was seen.
      showWhenUnlinked: false,
      targetAnchor: targetAnchor,
      followerAnchor: followerAnchor,
      offset: standoff,
      child: popup,
    );

    // The popup is an ordinary child of the stack rather than a positioned one,
    // and the difference matters: a child positioned by only two edges is laid
    // out **unbounded**, and an unbounded width is not a width. Unpositioned it
    // is measured loosely against the screen, which is the cap it should have —
    // and where it actually lands is the follower's business, not the stack's.
    return BackdropGroup(
      backdropKey: _layer,
      child: SizedBox.expand(
        child: Stack(
          alignment: AlignmentDirectional.topStart,
          children: <Widget>[
            // Told about a press outside without taking it. A translucent listener
            // over an empty box reports the press and then answers that it hit
            // nothing, so the press goes on to the page under the overlay.
            if (widget.onDismiss != null)
              Positioned.fill(
                child: Listener(
                  behavior: HitTestBehavior.translucent,
                  onPointerDown: (PointerDownEvent event) {
                    if (widget.open && !(widget.anchorInside && _onAnchor(event.position))) {
                      widget.onDismiss!();
                    }
                  },
                ),
              ),
            popup,
          ],
        ),
      ),
    );
  }
}

/// What a popup's side was decided from: where its anchor is, with every scroll
/// between it and the screen taken out, how big the popup is, how wide it is
/// at its own width when it is held to its room, and how big the screen is.
@immutable
class _Placed {
  const _Placed({required this.anchor, required this.popup, required this.own, required this.room});

  final Rect anchor;
  final Size popup;
  final double? own;
  final Size room;

  /// Whether the two would decide the side apart. The anchor's place is let
  /// off by a hundredth of a pixel, which a scroll taken back out can leave.
  bool differs(_Placed other) {
    return (anchor.topLeft - other.anchor.topLeft).distance > 0.01 ||
        anchor.size != other.anchor.size ||
        popup != other.popup ||
        own != other.own ||
        room != other.room;
  }
}

/// Escape, for as long as the popup is open.
///
/// Mapped only for that long, as `RawMenuAnchor` maps its own, rather than
/// mapped and disabled while the popup is closed: the search for an intent's
/// action stops at the first one that maps it, enabled or not, so a disabled
/// action here would keep the key from a modal or a page that binds it too.
/// Only the map changes and the `Actions` widget stays, so the tree under the
/// anchor is not rebuilt every time the popup opens.
class _EscapeAction extends Action<DismissIntent> {
  _EscapeAction(this._state);

  final _MPAnchoredPortalState _state;

  VoidCallback? get _callback => _state.widget.onEscape ?? _state.widget.onDismiss;

  @override
  bool isEnabled(DismissIntent intent) => _state.widget.open;

  @override
  Object? invoke(DismissIntent intent) {
    _callback?.call();

    return null;
  }
}

/// Keeps presses off the anchor while its popup is open.
///
/// The press has already been reported as outside the popup by then, and it
/// closes it. A trigger that also took it would open the popup again. This is
/// [AbsorbPointer] without the semantics: an absorbing pointer blocks the
/// actions of everything under it too, and a screen reader has to be able to
/// reach the trigger while its popup is up.
class _PressShield extends SingleChildRenderObjectWidget {
  const _PressShield({required this.shielding, required super.child});

  final bool shielding;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderPressShield(shielding);

  @override
  void updateRenderObject(BuildContext context, _RenderPressShield renderObject) {
    renderObject.shielding = shielding;
  }
}

class _RenderPressShield extends RenderProxyBox {
  _RenderPressShield(this.shielding);

  bool shielding;

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    return shielding ? size.contains(position) : super.hitTest(result, position: position);
  }
}
