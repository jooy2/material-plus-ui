/// A column beside the content, and a drawer once the space is too narrow.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/sidebar/sidebar_drawer.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/page_layout.dart' show MPPageCollapse, MPSidebarSide;

/// How far one arrow key press moves the edge.
const double _keyboardStep = 16;

/// How wide the grabbable track around the hairline is.
const double _handleTrack = 8;

/// One arrow key press on the resize handle.
class _NudgeIntent extends Intent {
  const _NudgeIntent(this.steps);

  final int steps;
}

/// A column beside the screen's content, and a drawer once the space is too
/// narrow to hold one.
///
/// ```dart
/// MPPageLayout(
///   sidebar: MPSidebar(label: 'Sections', child: navigation),
///   child: page,
/// )
/// ```
///
/// Two presentations of one panel, which is exactly the distinction MD3 draws:
/// the **standard** navigation drawer is part of the layout and the content is
/// laid out around it, and below an expanded window the same destinations
/// arrive as a **modal** drawer over a scrim, with the focus held inside, an
/// Escape and a way back. They are one widget because they are one thing (a
/// caller should not have to swap widgets at a breakpoint) and because [child]
/// is then built once either way, rather than twice for a screen reader to
/// read twice.
///
/// As a column it claims [SemanticsRole.complementary]: the region a screen
/// reader offers as related to the screen but not the screen.
///
/// ## The surface
///
/// The container ladder, said the way a bar says it, because a sidebar holds
/// somebody else's content and dyeing it would dye theirs. [MPVariant.outlined]
/// is the default: the page's own `surface`, with a hairline down the edge that
/// faces the content and none against the window. Once it has collapsed, the
/// drawer paints MD3's own navigation drawer surface and takes no weight from
/// here.
class MPSidebar extends StatefulWidget {
  /// Creates a sidebar.
  const MPSidebar({
    this.child,
    this.side,
    this.width,
    this.minWidth = 160,
    this.maxWidth = 480,
    this.resizable = false,
    this.onResize,
    this.onResizeEnd,
    this.collapseBelow,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.title,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.padded = true,
    this.label,
    this.locale,
    super.key,
  }) : assert(minWidth <= maxWidth, 'minWidth must not be wider than maxWidth');

  /// Everything in it: a list of destinations, a filter panel, a table of
  /// contents.
  final Widget? child;

  /// Which end of the band it takes. Logical rather than physical, so `start`
  /// is the left of an English screen and the right of an Arabic one.
  ///
  /// Inside an `MPPageLayout` this is already decided by which slot the
  /// sidebar was handed to, and setting it again is only a way of disagreeing
  /// with the layout. [MPSidebarSide.start] otherwise.
  final MPSidebarSide? side;

  /// How wide the column is, in logical pixels. Left out, it is the width
  /// [size] implies.
  ///
  /// With [resizable] this is only the width the column *starts* at: a drag
  /// writes over it, and the caller hears about it through [onResizeEnd]. A
  /// new value written here outranks the drag. An explicit width also
  /// survives the change into a drawer; the default one does not, because a
  /// column sized against the article beside it and a panel sized against a
  /// phone are two different numbers.
  final double? width;

  /// How narrow it may be dragged.
  final double minWidth;

  /// And how wide.
  final double maxWidth;

  /// Lets the reader drag the inner edge to change the column's width.
  ///
  /// Off by default. A sidebar that can be resized is a sidebar whose width is
  /// the reader's to remember, so a caller who turns this on usually also
  /// wants to store what [onResizeEnd] reports.
  final bool resizable;

  /// Called with the width while the edge is being dragged.
  final ValueChanged<double>? onResize;

  /// Called once, with the same number, when it is let go. An arrow key press
  /// is a whole gesture on its own and calls it every time.
  final ValueChanged<double>? onResizeEnd;

  /// The window size class below which the column becomes a drawer.
  ///
  /// Defaults to the `MPPageLayout`'s own, and to [MPPageCollapse.none]
  /// outside one: a sidebar that collapsed with nothing on the screen able to
  /// bring it back would be a sidebar the reader has lost. Inside a layout the
  /// width compared is the one the layout was given; on its own, the
  /// window's.
  final MPPageCollapse? collapseBelow;

  /// Whether the drawer is open. Only meaningful once the sidebar has
  /// collapsed: a column is not opened, it is there.
  ///
  /// Inside an `MPPageLayout` the layout owns this (it is what an
  /// `MPSidebarTrigger` anywhere on the screen talks to), so control it there
  /// rather than here. [onOpenChange] still fires either way.
  final bool? open;

  /// Which state the drawer starts in, for an uncontrolled sidebar with no
  /// layout around it.
  final bool initialOpen;

  /// Called when the drawer asks to open or close.
  final ValueChanged<bool>? onOpenChange;

  /// The heading, drawn only while the sidebar is a drawer.
  ///
  /// A column has the screen around it to say what it is. A panel that has
  /// covered the screen does not, so left out, [label] is drawn as the heading
  /// instead, and then the word for "sidebar" in [locale].
  final Widget? title;

  /// How much surface the column paints, on the ladder `MPHeader` and
  /// `MPFooter` use.
  ///
  /// - [MPVariant.filled] is `surfaceContainerHighest`.
  /// - [MPVariant.tonal] is `surfaceContainer`.
  /// - [MPVariant.elevated] is `surfaceContainerLow` under a level-2 shadow,
  ///   one level higher than a box's, because a bar sits over the content
  ///   rather than in it.
  /// - [MPVariant.outlined], the default, is the page's own `surface` with a
  ///   hairline in `outlineVariant` down the edge that faces the content.
  /// - [MPVariant.text] paints nothing.
  final MPVariant variant;

  /// How far off the page the column is lifted, on MD3's own scale. It moves
  /// the tone as well as the shadow. Left `null`, [variant] decides.
  final MPElevation? elevation;

  /// The column's default width and the air around its content. [MPSize.md]
  /// is 360, MD3's own navigation drawer, so a sidebar is exactly as wide as
  /// the drawer it becomes.
  final MPSize? size;

  /// Takes room out of the air around the column's content.
  ///
  /// The width is [size]'s and does not move: a navigation column narrower
  /// than its labels is a column of truncated labels. What this tightens is
  /// the gutter, which is what a sidebar full of destinations is competing for.
  final MPDensity? density;

  /// The gutter, and the air above and below the content.
  final bool padded;

  /// The name the region is announced by.
  ///
  /// Every sidebar on a screen should have one, and a screen with two *must*,
  /// or a screen reader offers two regions with the same name. Defaults to
  /// the word for "sidebar" in [locale].
  final String? label;

  /// Which language the sidebar's own words are in. Falls back to the
  /// `MPPageLayout`'s, then to the nearest `MPLocaleProvider`, then to the
  /// app's locale, then to English.
  final String? locale;

  @override
  State<MPSidebar> createState() => _MPSidebarState();
}

class _MPSidebarState extends State<MPSidebar> {
  /// The dragged width, held in a notifier rather than in `setState`.
  ///
  /// Nothing in the panel depends on the number except one [SizedBox], and a
  /// `setState` per pointer move would rebuild every row in the sidebar to
  /// change it. The Dart shape of the React package writing the width straight
  /// onto the element.
  final ValueNotifier<double> _width = ValueNotifier<double>(0);

  late bool _ownOpen = widget.initialOpen;

  /// The width the caller asked for last, resolved through the size ladder.
  ///
  /// Compared rather than `widget.width`, which is `null` whenever the width
  /// comes from [MPSidebar.size]: a size that arrives from an
  /// [MPConfigProvider] would otherwise read as a change on every rebuild and
  /// throw away the width the reader had dragged to.
  double? _declared;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPDensity get _density => widget.density ?? MPConfigProvider.maybeOf(context)?.density ?? 0;

  double get _declaredWidth => widget.width ?? mpSidebarExtent[_size]!;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncDeclared();
  }

  @override
  void didUpdateWidget(MPSidebar oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncDeclared();
  }

  /// A width the caller changed is an instruction, and it outranks a drag: a
  /// sidebar told to be 320 is 320, whatever it was last dragged to.
  void _syncDeclared() {
    final double declared = _declaredWidth;

    if (declared != _declared) {
      _declared = declared;
      _width.value = declared;
    }
  }

  @override
  void dispose() {
    _width.dispose();
    super.dispose();
  }

  double _clamp(double value) => value.clamp(widget.minWidth, widget.maxWidth);

  /// Moves the edge to [next], and says whether it moved.
  bool _resize(double next, {required bool settled}) {
    final double sized = _clamp(next).roundToDouble();

    // A move that leaves the width where it was, at a limit, reports nothing.
    if (sized == _width.value) {
      return false;
    }

    _width.value = sized;
    widget.onResize?.call(sized);

    if (settled) {
      widget.onResizeEnd?.call(sized);
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPPageLayoutScope? layout = MPPageLayoutScope.maybeOf(context);
    final MPSidebarSide side =
        widget.side ?? MPSidebarSideScope.maybeOf(context) ?? MPSidebarSide.start;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpLayoutMessages,
      locale: widget.locale ?? layout?.locale,
    );
    final String name = widget.label ?? messages['sidebar']!;

    final bool collapsed;

    if (widget.collapseBelow == null) {
      collapsed = layout?.collapsed ?? false;
    } else {
      // Inside a layout, the width the layout was given, which is what its own
      // `collapseBelow` was measured against; on its own, the window's.
      collapsed = mpCollapsedAt(
        widget.collapseBelow!,
        width: layout != null ? layout.width : MediaQuery.maybeSizeOf(context)?.width,
        minimums: mpWindowMinimumsOf(context),
      );
    }

    if (collapsed) {
      final bool open = widget.open ?? (layout != null ? layout.open[side] ?? false : _ownOpen);

      void changeOpen(bool next) {
        if (widget.open == null) {
          if (layout != null) {
            layout.setOpen(side, next);
          } else {
            setState(() => _ownOpen = next);
          }
        }

        widget.onOpenChange?.call(next);
      }

      return MPSidebarDrawer(
        open: open,
        onClose: () => changeOpen(false),
        side: drawerSide(side, Directionality.of(context)),
        size: _size,
        // A panel that has covered the screen always has a heading, even when
        // the column it was did not need to say what it is.
        heading: widget.title ?? Text(name),
        // The heading names the layer when it is the sidebar's own name; a
        // title of the caller's is a widget, and its words are its own.
        semanticLabel: widget.title == null ? name : widget.label,
        closeLabel: mpMessagesOf(
          context,
          mpCommonMessages,
          locale: widget.locale ?? layout?.locale,
        )['close']!,
        extent: widget.width,
        child: widget.child,
      );
    }

    final MPSize size = _size;
    final MPContainerPaint paint = mpBarPaint(colors, widget.variant, widget.elevation);
    final double pad = mpSheetPadOf(size, _density);

    Widget panel = Padding(
      padding: widget.padded ? EdgeInsets.all(pad) : EdgeInsets.zero,
      child: widget.child ?? const SizedBox.shrink(),
    );

    // The column scrolls on its own: a list of destinations longer than the
    // screen has to be reachable without the content beside it moving.
    panel = SingleChildScrollView(child: panel);

    panel = DefaultTextStyle.merge(
      style: TextStyle(color: colors.onSurface),
      child: panel,
    );

    // The inner edge only. The outer one is against the window, where there is
    // nothing on the other side of it to be separated from: the same
    // single-edge rule a header and a drawer draw.
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final BoxBorder? edge = widget.variant == MPVariant.outlined
        ? (side == MPSidebarSide.start
              ? BorderDirectional(end: rule)
              : BorderDirectional(start: rule))
        : null;

    panel = DecoratedBox(
      decoration: BoxDecoration(color: paint.color, border: edge, boxShadow: paint.shadows),
      child: panel,
    );

    if (widget.resizable) {
      panel = Stack(
        // The handle's outer half hangs past the column, over the edge of the
        // content beside it, and is drawn there.
        clipBehavior: Clip.none,
        children: <Widget>[
          Positioned.fill(child: panel),
          PositionedDirectional(
            top: 0,
            bottom: 0,
            // Straddling the inner edge rather than sitting inside it: a
            // hairline one pixel wide is a target one pixel wide, which is not a
            // target.
            start: side == MPSidebarSide.start ? null : -_handleTrack / 2,
            end: side == MPSidebarSide.start ? -_handleTrack / 2 : null,
            width: _handleTrack,
            child: _HandleMark(
              child: _ResizeHandle(
                label: messages['resizeSidebar']!,
                outwards: side == MPSidebarSide.start ? 1 : -1,
                width: _width,
                min: widget.minWidth,
                max: widget.maxWidth,
                onDrag: (double delta) => _resize(_width.value + delta, settled: false),
                onSettle: () => widget.onResizeEnd?.call(_width.value),
                onNudge: (int steps) =>
                    _resize(_width.value + steps * _keyboardStep, settled: true),
              ),
            ),
          ),
        ],
      );
    }

    return _HandleReach(
      child: Semantics(
        // Not inside a page's main region, where Flutter refuses a
        // complementary one: a filter panel in the content is still named, and
        // is a region of the content rather than a landmark of the screen.
        role: MPLandmarkScope.within(context) ? null : SemanticsRole.complementary,
        container: true,
        explicitChildNodes: true,
        label: name,
        child: ValueListenableBuilder<double>(
          valueListenable: _width,
          builder: (BuildContext context, double width, Widget? child) =>
              SizedBox(width: width, child: child),
          child: panel,
        ),
      ),
    );
  }
}

/// Goes round the whole sidebar, and takes a press on the half of the resize
/// handle that hangs past the column as a press on the handle.
///
/// Two widgets rather than one, because a box is only asked about a press
/// inside its own size, and so is every box above it: the column, its region
/// and the stack the handle stands in are all as wide as the column, so none
/// of them would pass on a press past its edge. This is the outermost box of
/// the sidebar, which whatever holds it asks about any press, and it hands one
/// in the handle's outer half straight to the handle.
///
/// What holds the sidebar asks the boxes it holds in its own order, so a
/// neighbour it asks first and that takes the press keeps it. An
/// `MPPageLayout` asks both of its sidebars before its content, and paints
/// them after it.
class _HandleReach extends SingleChildRenderObjectWidget {
  const _HandleReach({required Widget super.child});

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderHandleReach();
}

/// Marks the resize handle for the [_HandleReach] round it.
class _HandleMark extends SingleChildRenderObjectWidget {
  const _HandleMark({required Widget super.child});

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderHandleMark();
}

class _RenderHandleReach extends RenderProxyBox {
  _RenderHandleMark? _handle;

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    final _RenderHandleMark? handle = _handle;

    if (size.contains(position) || handle == null || !handle.hasSize) {
      return super.hitTest(result, position: position);
    }

    final Matrix4 transform = handle.getTransformTo(this);

    if (!MatrixUtils.transformRect(transform, Offset.zero & handle.size).contains(position)) {
      return false;
    }

    final bool hit = result.addWithPaintTransform(
      transform: transform,
      position: position,
      hitTest: (BoxHitTestResult result, Offset local) => handle.hitTest(result, position: local),
    );

    if (hit) {
      result.add(BoxHitTestEntry(this, position));
    }

    return hit;
  }
}

class _RenderHandleMark extends RenderProxyBox {
  _RenderHandleReach? _reach;

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);

    RenderObject? node = parent;

    while (node != null && node is! _RenderHandleReach) {
      node = node.parent;
    }

    _reach = node as _RenderHandleReach?;
    _reach?._handle = this;
  }

  @override
  void detach() {
    if (_reach?._handle == this) {
      _reach?._handle = null;
    }

    _reach = null;
    super.detach();
  }
}

/// The track around the sidebar's inner edge.
///
/// `outlineVariant` while the pointer is on it or it is being dragged, and the
/// focus ring in `secondary` drawn just inside it while the keyboard holds it,
/// where nothing next to the column can cover it.
class _ResizeHandle extends StatefulWidget {
  const _ResizeHandle({
    required this.label,
    required this.outwards,
    required this.width,
    required this.min,
    required this.max,
    required this.onDrag,
    required this.onSettle,
    required this.onNudge,
  });

  final String label;

  /// `1` when dragging toward the end of the axis makes the column wider.
  final int outwards;

  final ValueListenable<double> width;
  final double min;
  final double max;
  final ValueChanged<double> onDrag;
  final VoidCallback onSettle;

  /// Moves the edge [steps] key steps outwards, and says whether it moved.
  final bool Function(int steps) onNudge;

  @override
  State<_ResizeHandle> createState() => _ResizeHandleState();
}

class _ResizeHandleState extends State<_ResizeHandle> {
  bool _hovered = false;
  bool _dragging = false;
  bool _focusVisible = false;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool lit = _hovered || _dragging;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    // A decoration that is always there, with only its colour changing, so the
    // wash eases in and out over `short4` as the React handle's does.
    Widget mark = AnimatedContainer(
      duration: reduceMotion ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      decoration: BoxDecoration(
        color: lit ? colors.outlineVariant : colors.outlineVariant.withValues(alpha: 0),
      ),
    );

    mark = CustomPaint(
      foregroundPainter: _focusVisible
          ? MPFocusRingPainter(
              color: colors.secondary,
              borderRadius: BorderRadius.zero,
              offset: -focusRingWidth,
            )
          : null,
      child: mark,
    );

    Widget handle = MouseRegion(
      cursor: SystemMouseCursors.resizeColumn,
      onEnter: (PointerEnterEvent event) => setState(() => _hovered = true),
      onExit: (PointerExitEvent event) => setState(() => _hovered = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onHorizontalDragStart: (DragStartDetails details) => setState(() => _dragging = true),
        // Positive is always "wider", so a drag under RTL, where the leading
        // edge is on the right, moves the edge the way the pointer went rather
        // than the way the axis is numbered.
        onHorizontalDragUpdate: (DragUpdateDetails details) =>
            widget.onDrag((rtl ? -details.delta.dx : details.delta.dx) * widget.outwards),
        onHorizontalDragEnd: (DragEndDetails details) {
          setState(() => _dragging = false);
          widget.onSettle();
        },
        onHorizontalDragCancel: () => setState(() => _dragging = false),
        child: mark,
      ),
    );

    handle = FocusableActionDetector(
      includeFocusSemantics: false,
      onShowFocusHighlight: (bool value) {
        if (_focusVisible != value) {
          setState(() => _focusVisible = value);
        }
      },
      shortcuts: const <ShortcutActivator, Intent>{
        SingleActivator(LogicalKeyboardKey.arrowRight): _NudgeIntent(1),
        SingleActivator(LogicalKeyboardKey.arrowLeft): _NudgeIntent(-1),
      },
      actions: <Type, Action<Intent>>{
        // An arrow that moved nothing, with the column at its floor or its
        // ceiling, goes on to the focus system under directional navigation.
        _NudgeIntent: MPArrowAction<_NudgeIntent>(
          context,
          onArrow: (_NudgeIntent intent) =>
              widget.onNudge((rtl ? -intent.steps : intent.steps) * widget.outwards),
        ),
      },
      child: handle,
    );

    // Flutter's semantics tree has no `separator` role and no `valuenow`, so
    // the handle is what it actually is to a screen reader: a control with a
    // value, in pixels, that can be turned up and down.
    return ValueListenableBuilder<double>(
      valueListenable: widget.width,
      builder: (BuildContext context, double width, Widget? child) => Semantics(
        slider: true,
        label: widget.label,
        value: '${width.round()}',
        increasedValue: '${(width + _keyboardStep).clamp(widget.min, widget.max).round()}',
        decreasedValue: '${(width - _keyboardStep).clamp(widget.min, widget.max).round()}',
        onIncrease: () => widget.onNudge(1),
        onDecrease: () => widget.onNudge(-1),
        child: child,
      ),
      child: ExcludeSemantics(child: handle),
    );
  }
}
