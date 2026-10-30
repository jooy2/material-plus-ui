/// A box with a scrollbar of its own.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/keyboard_scroll.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which way the content is allowed to scroll.
///
/// [MPOrientation]'s two plus a third, rather than the shared enum widened:
/// "both" means nothing anywhere else an orientation is asked for.
enum MPScrollAxis {
  /// Along the row.
  horizontal,

  /// Down the side. The common case.
  vertical,

  /// Both, with a bar on each edge and a corner where they meet.
  both,
}

/// The scrollbar's thickness, and the only thing `size` sets here: 6, 8, 10,
/// 12, 14.
///
/// A scrollbar is not a control and has no height on the ladder; what it has
/// is a width, and these are the useful range: 6 is a hairline that says
/// "there is more", 14 a target a pointer can catch without aiming.
const Map<MPSize, double> _track = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// The room between the track's edge and the thumb, `p-0.5`.
const double _inset = 2;

/// A box with a scrollbar of its own.
///
/// ```dart
/// MPScrollArea(maxHeight: 320, child: list)
/// ```
///
/// A platform scrollbar is a different width on every machine and a different
/// colour from the sheet it is cut into, and the framework's own `Scrollbar`
/// lives in `material.dart`, which this package does not import. This one is
/// made of the library's tokens and is the same everywhere: a pill of
/// `onSurface` at 38%, MD3's disabled-content wash, which is legible on every
/// surface role in both schemes and quieter than anything the content is made
/// of.
///
/// ## Something has to bound the box
///
/// A scroll area whose height is its content's height never overflows and
/// never shows a bar. [maxHeight] is the usual way to say what bounds it,
/// [height] a fixed one, and a parent that hands it a bounded height is the
/// other.
///
/// ## The scrollbar overlays the content
///
/// It takes no room in the layout, so adding one does not reflow anything. The
/// trade is that content can pass underneath it, so a box whose content reaches
/// the edge wants a little inline padding of its own.
///
/// ## It is still a real scroll view
///
/// The wheel, a trackpad, a touch drag and the thumb all scroll it, and so does
/// the keyboard: while the content overflows the box is a tab stop, and the
/// arrow keys, Page Up, Page Down, Home and End move it, as a browser moves a
/// scrollable box.
class MPScrollArea extends StatefulWidget {
  /// Creates a scroll area around [child].
  const MPScrollArea({
    required this.child,
    this.size,
    this.axis = MPScrollAxis.vertical,
    this.maxHeight,
    this.height,
    this.persistent = false,
    this.semanticLabel,
    super.key,
  });

  /// What scrolls.
  final Widget child;

  /// The scrollbar's thickness.
  final MPSize? size;

  /// Which way the content may scroll. [MPScrollAxis.both] is for content with
  /// a width of its own, a wide table or a diagram, where neither axis should be
  /// the one that wraps.
  final MPScrollAxis axis;

  /// How tall the box may get before it starts scrolling, in logical pixels.
  final double? maxHeight;

  /// A fixed height, for the box that should be its size whatever is in it.
  final double? height;

  /// Keeps the scrollbar drawn instead of fading it out when the pointer
  /// leaves. Off, it shows while scrolling or hovered and is gone otherwise; on
  /// is right for a panel whose scrollability is not obvious from its content.
  final bool persistent;

  /// The name the box is announced by when it takes the focus. Worth giving: a
  /// box reachable by the keyboard because it scrolls is otherwise announced as
  /// nothing at all.
  final String? semanticLabel;

  @override
  State<MPScrollArea> createState() => _MPScrollAreaState();
}

class _MPScrollAreaState extends State<MPScrollArea> {
  final ScrollController _vertical = ScrollController();
  final ScrollController _horizontal = ScrollController();

  bool _hovering = false;

  bool get _hasVertical => widget.axis != MPScrollAxis.horizontal;
  bool get _hasHorizontal => widget.axis != MPScrollAxis.vertical;

  @override
  void dispose() {
    _vertical.dispose();
    _horizontal.dispose();
    super.dispose();
  }

  void _setHovering(bool hovering) {
    if (_hovering != hovering) {
      setState(() => _hovering = hovering);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final double track = _track[size]!;
    final double thumb = track - _inset * 2;
    final bool both = _hasVertical && _hasHorizontal;

    // Shown while hovered or while the content moves, and faded rather than
    // switched: a bar that pops in reads as a jolt at the edge of the eye.
    final bool visible = widget.persistent || _hovering;

    final bool rtl = Directionality.maybeOf(context) == TextDirection.rtl;

    Widget bar(
      ScrollController controller, {
      required int depth,
      required EdgeInsets clear,
      required Widget child,
    }) {
      return RawScrollbar(
        controller: controller,
        thumbColor: colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
        thickness: thumb,
        radius: Radius.circular(thumb),
        crossAxisMargin: _inset,
        mainAxisMargin: _inset,
        // Where two bars meet, each stops short of the corner.
        padding: clear,
        thumbVisibility: visible,
        fadeDuration: reduceMotion ? Duration.zero : MPMotion.short4,
        // Each bar listens to its own view only: with two axes the outer view is
        // one level up from here, and a bar that answered both would jump when
        // the other direction moved.
        notificationPredicate: (ScrollNotification notification) => notification.depth == depth,
        child: child,
      );
    }

    Widget content = widget.child;

    if (_hasHorizontal) {
      content = bar(
        _horizontal,
        depth: 0,
        clear: both
            ? (rtl ? EdgeInsets.only(left: track) : EdgeInsets.only(right: track))
            : EdgeInsets.zero,
        child: SingleChildScrollView(
          controller: _horizontal,
          scrollDirection: Axis.horizontal,
          child: content,
        ),
      );
    }

    if (_hasVertical) {
      content = bar(
        _vertical,
        depth: both ? 1 : 0,
        clear: both ? EdgeInsets.only(bottom: track) : EdgeInsets.zero,
        child: SingleChildScrollView(controller: _vertical, child: content),
      );
    }

    if (both) {
      // The square where the two bars meet. Drawn only when both exist: on one
      // axis there is no corner, and a square there would be a grey patch in
      // the corner of a box that scrolls one way.
      content = Stack(
        children: <Widget>[
          content,
          PositionedDirectional(
            end: 0,
            bottom: 0,
            child: IgnorePointer(
              child: SizedBox.square(
                dimension: track,
                child: ColoredBox(color: colors.surfaceContainer),
              ),
            ),
          ),
        ],
      );
    }

    final Widget box = MPKeyboardScroll(
      vertical: _hasVertical ? _vertical : null,
      horizontal: _hasHorizontal ? _horizontal : null,
      borderRadius: BorderRadius.zero,
      child: ClipRect(child: content),
    );

    return MouseRegion(
      onEnter: (_) => _setHovering(true),
      onExit: (_) => _setHovering(false),
      child: Semantics(
        label: widget.semanticLabel,
        container: widget.semanticLabel != null,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: widget.maxHeight ?? double.infinity),
          child: SizedBox(height: widget.height, child: box),
        ),
      ),
    );
  }
}
