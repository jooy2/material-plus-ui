/// Scrolling a view from the keyboard.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// How far one arrow key press moves the view, about a line of body text.
const double _line = 40;

/// Makes a scroll view a tab stop while it has somewhere to scroll, and moves it
/// with the keys a browser moves a scrollable box with.
///
/// A box of text with nothing focusable in it, terms of service or a shelf with
/// no buttons, is otherwise out of reach of anyone without a pointer. The arrow
/// keys move it a line, Page Up and Page Down a screen, and Home and End to its
/// ends. The left and right arrows follow the writing direction.
///
/// The stop exists only while the content overflows, so a box that fits adds
/// nothing to the tab order. The ring is drawn around the box while the box
/// itself holds a focus that arrived from the keyboard, and never for a stop
/// inside it, which draws its own.
class MPKeyboardScroll extends StatefulWidget {
  /// Wraps [child], the scroll views that [vertical] and [horizontal] drive.
  const MPKeyboardScroll({
    required this.borderRadius,
    required this.child,
    this.vertical,
    this.horizontal,
    this.ringOffset = focusRingOffset,
    super.key,
  });

  /// The controller of the view that scrolls down, if there is one.
  final ScrollController? vertical;

  /// The controller of the view that scrolls along the row, if there is one.
  final ScrollController? horizontal;

  /// The corners the focus ring follows.
  final BorderRadius borderRadius;

  /// How far outside the box the focus ring sits.
  ///
  /// Negative draws it inside, for a box that lives inside something that
  /// clips, as a table's grid does inside its sheet: a ring drawn outside it
  /// would be cut off along with the overflow.
  final double ringOffset;

  /// The scroll views.
  final Widget child;

  @override
  State<MPKeyboardScroll> createState() => _MPKeyboardScrollState();
}

class _MPKeyboardScrollState extends State<MPKeyboardScroll> {
  final FocusNode _node = FocusNode(debugLabel: 'MPKeyboardScroll');

  bool _scrollable = false;
  bool _focusVisible = false;

  @override
  void initState() {
    super.initState();
    _node.addListener(_onFocus);
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => _check());
  }

  @override
  void dispose() {
    _node
      ..removeListener(_onFocus)
      ..dispose();
    super.dispose();
  }

  /// Rings the box while it holds the focus itself, as `:focus-visible` on the
  /// React box does.
  ///
  /// Read off the node rather than off `Focus.onFocusChange`, whose `hasFocus`
  /// counts a focused descendant as well: a sort heading inside a table would
  /// ring the whole box as well as itself, and the ring would stay when the
  /// focus moved from the box to a stop inside it. The node tells its
  /// listeners when it gains or loses the primary focus, either way.
  void _onFocus() {
    final bool visible =
        _node.hasPrimaryFocus &&
        FocusManager.instance.highlightMode == FocusHighlightMode.traditional;

    if (visible != _focusVisible) {
      setState(() => _focusVisible = visible);
    }
  }

  static bool _overflows(ScrollController? controller) {
    return controller != null &&
        controller.hasClients &&
        controller.position.hasContentDimensions &&
        controller.position.maxScrollExtent > controller.position.minScrollExtent;
  }

  /// Whether either view has anywhere to go, read after layout.
  void _check() {
    if (!mounted) {
      return;
    }

    final scrollable = _overflows(widget.vertical) || _overflows(widget.horizontal);

    if (scrollable != _scrollable) {
      setState(() => _scrollable = scrollable);
    }
  }

  bool get _reduceMotion => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  /// Moves [controller] to [offset], held inside its extent.
  ///
  /// An [arrow] that finds the view already at that end moved nothing, and goes
  /// on to the focus system under directional navigation.
  KeyEventResult _to(
    ScrollController? controller,
    double Function(ScrollPosition) offset, {
    bool arrow = false,
  }) {
    if (!_overflows(controller)) {
      return KeyEventResult.ignored;
    }

    final position = controller!.position;
    final target = offset(position).clamp(position.minScrollExtent, position.maxScrollExtent);
    final moved = target != position.pixels;

    if (_reduceMotion) {
      controller.jumpTo(target);
    } else {
      controller.animateTo(target, duration: MPMotion.medium2, curve: MPMotion.standard);
    }

    return arrow ? mpArrowResult(context, moved: moved) : KeyEventResult.handled;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final key = event.logicalKey;

    // Under directional navigation an arrow moves the focus from one control
    // to the next, and the focus system brings the control it reaches into
    // view. So the box scrolls with the arrows only while it holds the focus
    // itself, and one that comes up from a control inside it goes on, rather
    // than scrolling the box to its end before the focus can leave that
    // control. A browser scrolls the box with them, as the traditional mode
    // still does.
    if (mpIsArrow(key) && !node.hasPrimaryFocus && mpArrowsMoveFocus(context)) {
      return KeyEventResult.ignored;
    }

    // Page Up, Page Down, Home and End move the view that scrolls down, or the
    // only one there is.
    final primary = widget.vertical ?? widget.horizontal;
    // Under RTL a row scrolls from the right, so the left arrow is further on.
    final along = Directionality.of(context) == TextDirection.rtl ? -_line : _line;

    if (key == LogicalKeyboardKey.arrowDown) {
      return _to(
        widget.vertical,
        (ScrollPosition position) => position.pixels + _line,
        arrow: true,
      );
    }

    if (key == LogicalKeyboardKey.arrowUp) {
      return _to(
        widget.vertical,
        (ScrollPosition position) => position.pixels - _line,
        arrow: true,
      );
    }

    if (key == LogicalKeyboardKey.arrowRight) {
      return _to(
        widget.horizontal,
        (ScrollPosition position) => position.pixels + along,
        arrow: true,
      );
    }

    if (key == LogicalKeyboardKey.arrowLeft) {
      return _to(
        widget.horizontal,
        (ScrollPosition position) => position.pixels - along,
        arrow: true,
      );
    }

    if (key == LogicalKeyboardKey.pageDown) {
      return _to(
        primary,
        (ScrollPosition position) => position.pixels + position.viewportDimension,
      );
    }

    if (key == LogicalKeyboardKey.pageUp) {
      return _to(
        primary,
        (ScrollPosition position) => position.pixels - position.viewportDimension,
      );
    }

    if (key == LogicalKeyboardKey.home) {
      return _to(primary, (ScrollPosition position) => position.minScrollExtent);
    }

    if (key == LogicalKeyboardKey.end) {
      return _to(primary, (ScrollPosition position) => position.maxScrollExtent);
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      // `secondary`, the focus indicator on every control in the library.
      foregroundPainter: _focusVisible
          ? MPFocusRingPainter(
              color: MPTheme.of(context).colors.secondary,
              borderRadius: widget.borderRadius,
              offset: widget.ringOffset,
            )
          : null,
      child: Focus(
        focusNode: _node,
        canRequestFocus: _scrollable,
        skipTraversal: !_scrollable,
        onKeyEvent: _onKey,
        // Content that grows or shrinks changes whether there is anything to
        // scroll, and the answer can only be read once it is laid out.
        child: NotificationListener<ScrollMetricsNotification>(
          onNotification: (ScrollMetricsNotification notification) {
            WidgetsBinding.instance.addPostFrameCallback((Duration _) => _check());

            return false;
          },
          child: widget.child,
        ),
      ),
    );
  }
}
