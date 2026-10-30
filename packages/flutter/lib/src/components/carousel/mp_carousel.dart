/// A strip of slides, one of which is in view.
library;

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How far the arrows sit in from the frame's edge.
const Map<MPSize, double> _arrowInset = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// The position marks: a dot at rest, a bar for the current one, and the gap
/// between them.
const Map<MPSize, ({double rest, double current, double height, double gap})> _dot =
    <MPSize, ({double rest, double current, double height, double gap})>{
      MPSize.xs: (rest: 4, current: 12, height: 4, gap: 4),
      MPSize.sm: (rest: 4, current: 14, height: 4, gap: 4),
      MPSize.md: (rest: 6, current: 16, height: 6, gap: 6),
      MPSize.lg: (rest: 6, current: 20, height: 6, gap: 8),
      MPSize.xl: (rest: 8, current: 24, height: 8, gap: 8),
    };

/// How fast a release has to be, in slides a second, to carry the strip on to
/// the next slide rather than back to the nearest.
const double _flingSlides = 0.6;

/// A strip of slides, one of which is in view.
///
/// ```dart
/// MPCarousel(
///   label: 'Trails',
///   children: <Widget>[
///     Image(image: forest, fit: BoxFit.cover),
///     Image(image: lake, fit: BoxFit.cover),
///   ],
/// )
/// ```
///
/// Every child is a slide, as wide as the frame, and the frame is as tall as
/// the tallest of them. The strip is dragged with a finger, a trackpad or a
/// mouse, stepped with the arrows, the marks or the arrow keys once it has the
/// focus, and it runs the other way under right-to-left text. Nothing is
/// transformed but the strip itself sliding under its frame.
///
/// Uncontrolled by default, starting at [initialValue]; give it [value] as
/// well and it shows whichever slide the caller says, reporting every move to
/// [onChanged], a drag that settled on a new slide included.
///
/// ## What this is, in MD3's terms
///
/// MD3 describes four carousel layouts, three of which resize their items as
/// they travel. This is the fourth: one item to a view, snapping, drawn out of
/// the specification's parts, a filled button either side and a selected
/// indicator that is a bar rather than a bigger dot.
class MPCarousel extends StatefulWidget {
  /// Creates a carousel of [children].
  const MPCarousel({
    required this.children,
    this.value,
    this.initialValue = 0,
    this.onChanged,
    this.loop = true,
    this.autoPlay = false,
    this.interval = const Duration(seconds: 5),
    this.arrows = true,
    this.indicators = true,
    this.variant = MPVariant.outlined,
    this.size,
    this.color,
    this.label,
    this.previousLabel,
    this.nextLabel,
    this.slideLabel,
    this.locale,
    super.key,
  });

  /// The slides. Every child becomes one.
  final List<Widget> children;

  /// Which slide is showing, counted from 0. Set it, with [onChanged], for a
  /// controlled carousel.
  final int? value;

  /// Which slide an uncontrolled carousel opens on. React's `defaultValue`.
  final int initialValue;

  /// Called with the new index for every way it can move: an arrow, a mark, a
  /// key, a drag that settled on a new slide, a turn of [autoPlay].
  final ValueChanged<int>? onChanged;

  /// Whether the arrows wrap from the last slide to the first.
  ///
  /// With it off they are disabled at the ends instead, the honest thing for a
  /// set with a beginning and an end: a gallery of three photographs has one, a
  /// rotating banner does not.
  final bool loop;

  /// Advances on its own, every [interval].
  ///
  /// Off by default, and deliberately: a carousel that moves while it is being
  /// read is the most complained-about pattern there is. It pauses while a
  /// pointer is over it, while anything in it has the focus and while the app
  /// is in the background, and does not start at all with animations turned
  /// off.
  final bool autoPlay;

  /// How long each slide is held when [autoPlay] is on.
  final Duration interval;

  /// Draws the previous and next buttons over the frame.
  final bool arrows;

  /// Draws the row of position marks under the frame.
  final bool indicators;

  /// How much surface the frame paints behind the slides. [MPVariant.text]
  /// draws no frame, for pictures that have edges of their own.
  final MPVariant variant;

  /// The size of the arrows and the marks, and how far the arrows sit in. Not
  /// the size of a slide, which is whatever the frame is.
  final MPSize? size;

  /// Which accent family the current mark and the arrows read.
  final MPColor? color;

  /// The carousel's name for a screen reader. Defaults to the word for it in
  /// [locale].
  final String? label;

  /// The previous button's name. Defaults to the wording in [locale].
  final String? previousLabel;

  /// The next button's name. Defaults to the wording in [locale].
  final String? nextLabel;

  /// How one slide is named to a screen reader, and how its mark is
  /// labelled, from its 1-based position and the count. Defaults to the
  /// wording in [locale] with the two numbers set into it.
  final String Function(int index, int count)? slideLabel;

  /// Which language the carousel's own names are in. Nothing here is drawn as
  /// words, so without it a Korean screen reads its slides out in English.
  final String? locale;

  @override
  State<MPCarousel> createState() => _MPCarouselState();
}

class _MPCarouselState extends State<MPCarousel>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late int _uncontrolled = widget.initialValue;

  /// Where the strip is, in slides: `1.5` is halfway from the second to the
  /// third.
  late final AnimationController _position = AnimationController.unbounded(
    vsync: this,
    value: _index.toDouble(),
  );

  final FocusNode _track = FocusNode(debugLabel: 'MPCarousel');

  Timer? _timer;
  bool _hovered = false;
  bool _focusWithin = false;
  bool _trackRing = false;
  bool _dragging = false;

  int get _count => widget.children.length;

  int get _index {
    if (_count == 0) {
      return 0;
    }

    return (widget.value ?? _uncontrolled).clamp(0, _count - 1);
  }

  bool get _reduceMotion => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _track.addListener(_onTrackFocus);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _restart();
  }

  @override
  void didUpdateWidget(MPCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A caller who moved the slide moves the strip, and a strip that lost
    // slides from under it comes back to the last one.
    if (!_dragging &&
        (widget.value != oldWidget.value || _position.value > math.max(_count - 1, 0))) {
      _travelTo(_index);
    }

    if (widget.autoPlay != oldWidget.autoPlay ||
        widget.interval != oldWidget.interval ||
        widget.children.length != oldWidget.children.length) {
      _restart();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) => _restart();

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _track
      ..removeListener(_onTrackFocus)
      ..dispose();
    _position.dispose();
    super.dispose();
  }

  void _onTrackFocus() {
    final bool ring =
        _track.hasPrimaryFocus &&
        FocusManager.instance.highlightMode == FocusHighlightMode.traditional;

    if (ring != _trackRing) {
      setState(() => _trackRing = ring);
    }
  }

  /// Slides the strip to [page], or puts it there at once with animations off.
  void _travelTo(int page) {
    if (_reduceMotion) {
      _position.value = page.toDouble();

      return;
    }

    _position.animateTo(page.toDouble(), duration: MPMotion.medium4, curve: MPMotion.standard);
  }

  /// Moves to [next], wrapped or clamped by [MPCarousel.loop], and says so.
  void _go(int next) {
    if (_count == 0) {
      return;
    }

    final int wrapped = widget.loop
        ? ((next % _count) + _count) % _count
        : next.clamp(0, _count - 1);

    final int previous = _index;

    if (widget.value == null) {
      setState(() => _uncontrolled = wrapped);
    }

    // A controlled strip travels when the caller hands it the new value, and
    // until then settles back where it was, as a drag let go short does.
    _travelTo(widget.value == null ? wrapped : previous);

    if (wrapped != previous) {
      widget.onChanged?.call(wrapped);
    }
  }

  /// The timer, started or stopped by everything that should hold it.
  void _restart() {
    _timer?.cancel();
    _timer = null;

    final AppLifecycleState? lifecycle = WidgetsBinding.instance.lifecycleState;
    final bool away =
        lifecycle == AppLifecycleState.hidden ||
        lifecycle == AppLifecycleState.paused ||
        lifecycle == AppLifecycleState.detached;

    if (!mounted ||
        !widget.autoPlay ||
        _count < 2 ||
        _hovered ||
        _focusWithin ||
        away ||
        _reduceMotion ||
        !TickerMode.valuesOf(context).enabled) {
      return;
    }

    _timer = Timer.periodic(widget.interval, (Timer _) => _go(_index + 1));
  }

  void _hover(bool hovered) {
    _hovered = hovered;
    _restart();
  }

  void _focusMoved(bool focused) {
    _focusWithin = focused;
    _restart();
  }

  // Dragging, in slides rather than pixels: the strip is as wide as the frame.

  final GlobalKey _strip = GlobalKey();

  double get _width {
    final RenderObject? box = _strip.currentContext?.findRenderObject();

    return box is RenderBox && box.hasSize && box.size.width > 0 ? box.size.width : 1;
  }

  double get _direction => Directionality.of(context) == TextDirection.rtl ? -1 : 1;

  void _dragStart(DragStartDetails details) {
    _dragging = true;
    _position.stop();
  }

  void _dragUpdate(DragUpdateDetails details) {
    final double next = _position.value - details.primaryDelta! / _width * _direction;

    // A little give past either end, and no further.
    _position.value = next.clamp(-0.25, _count - 0.75);
  }

  void _dragEnd(DragEndDetails details) {
    _dragging = false;

    final double velocity = -details.primaryVelocity! / _width * _direction;
    final int target;

    if (velocity.abs() > _flingSlides) {
      target = velocity > 0 ? _position.value.floor() + 1 : _position.value.ceil() - 1;
    } else {
      target = _position.value.round();
    }

    // A drag never wraps: past the ends it springs back.
    final int clamped = target.clamp(0, math.max(_count - 1, 0));

    if (clamped == _index) {
      _travelTo(_index);
    } else {
      _go(clamped);
    }
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey key = event.logicalKey;

    // The arrows follow the writing direction, as scrolling the React strip
    // with them does.
    if (key == LogicalKeyboardKey.arrowRight || key == LogicalKeyboardKey.arrowLeft) {
      final bool forward = (key == LogicalKeyboardKey.arrowRight) != rtl;

      if (!widget.loop && (forward ? _index >= _count - 1 : _index <= 0)) {
        return KeyEventResult.handled;
      }

      _go(_index + (forward ? 1 : -1));

      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.home) {
      _go(0);

      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.end) {
      _go(_count - 1);

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  String _describe(int index) {
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpCarouselMessages,
      locale: widget.locale,
    );

    return widget.slideLabel?.call(index, _count) ??
        mpFillMessage(messages['slide']!, <String, String>{'index': '$index', 'total': '$_count'});
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpCarouselMessages,
      locale: widget.locale,
    );
    final String name = widget.label ?? messages['label']!;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(colors, widget.variant);
    final double hairline = paint.border?.width ?? 0;
    final Duration duration = _reduceMotion ? Duration.zero : MPMotion.short4;
    final int index = _index;

    Widget strip = _Strip(
      key: _strip,
      position: _position,
      children: <Widget>[
        for (int slide = 0; slide < _count; slide += 1)
          // Never hidden when it is off screen: a slide can hold a button, and a
          // subtree a screen reader refuses to describe that a keyboard can
          // still reach is the bug this would be.
          Semantics(container: true, label: _describe(slide + 1), child: widget.children[slide]),
      ],
    );

    strip = GestureDetector(
      behavior: HitTestBehavior.translucent,
      onHorizontalDragStart: _count > 1 ? _dragStart : null,
      onHorizontalDragUpdate: _count > 1 ? _dragUpdate : null,
      onHorizontalDragEnd: _count > 1 ? _dragEnd : null,
      child: strip,
    );

    // A focus stop, so the strip can be stepped with the arrow keys by
    // whoever is not using a pointer.
    strip = Focus(
      focusNode: _track,
      onKeyEvent: _onKey,
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        child: CustomPaint(
          // Inset: the frame clips, and a ring outside the strip would be cut.
          foregroundPainter: _trackRing
              ? MPFocusRingPainter(
                  color: colors.secondary,
                  borderRadius: radius - BorderRadius.circular(hairline),
                  offset: -focusRingWidth,
                )
              : null,
          child: strip,
        ),
      ),
    );

    Widget frame = DecoratedBox(
      decoration: paint.decoration(radius),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        child: ClipRRect(borderRadius: radius - BorderRadius.circular(hairline), child: strip),
      ),
    );

    if (widget.arrows && _count > 1) {
      final double inset = _arrowInset[size]!;

      frame = Stack(
        children: <Widget>[
          frame,
          PositionedDirectional(
            start: inset,
            top: 0,
            bottom: 0,
            child: Center(
              child: _Arrow(
                forward: false,
                size: size,
                accent: accent,
                colors: colors,
                label: widget.previousLabel ?? messages['previous']!,
                onPressed: !widget.loop && index <= 0 ? null : () => _go(index - 1),
              ),
            ),
          ),
          PositionedDirectional(
            end: inset,
            top: 0,
            bottom: 0,
            child: Center(
              child: _Arrow(
                forward: true,
                size: size,
                accent: accent,
                colors: colors,
                label: widget.nextLabel ?? messages['next']!,
                onPressed: !widget.loop && index >= _count - 1 ? null : () => _go(index + 1),
              ),
            ),
          ),
        ],
      );
    }

    final ({double rest, double current, double height, double gap}) dot = _dot[size]!;

    return MouseRegion(
      onEnter: (_) => _hover(true),
      onExit: (_) => _hover(false),
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onFocusChange: _focusMoved,
        child: Semantics(
          container: true,
          label: name,
          explicitChildNodes: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              frame,
              if (widget.indicators && _count > 1)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    spacing: dot.gap,
                    children: <Widget>[
                      for (int mark = 0; mark < _count; mark += 1)
                        _Dot(
                          current: mark == index,
                          label: _describe(mark + 1),
                          rest: dot.rest,
                          grown: dot.current,
                          height: dot.height,
                          accent: accent.color,
                          quiet: colors.outlineVariant,
                          hover: colors.outline,
                          ring: colors.secondary,
                          duration: duration,
                          onPressed: () => _go(mark),
                        ),
                    ],
                  ),
                ),
              // Where the reader is, as a sentence. Silent while the carousel
              // advances on its own: a live region that names a new slide every
              // five seconds makes a screen reader unusable on that screen.
              if (_count > 0)
                Semantics(
                  container: true,
                  liveRegion: !widget.autoPlay,
                  label: _describe(index + 1),
                  child: const SizedBox(width: 1, height: 0),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The slides side by side, each as wide as the strip, the strip as tall as
/// the tallest, slid along by [position].
class _Strip extends MultiChildRenderObjectWidget {
  const _Strip({required this.position, required super.children, super.key});

  final Animation<double> position;

  @override
  _RenderStrip createRenderObject(BuildContext context) {
    return _RenderStrip(position: position, textDirection: Directionality.of(context));
  }

  @override
  void updateRenderObject(BuildContext context, _RenderStrip renderObject) {
    renderObject
      ..position = position
      ..textDirection = Directionality.of(context);
  }
}

class _StripParentData extends ContainerBoxParentData<RenderBox> {}

class _RenderStrip extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _StripParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _StripParentData> {
  _RenderStrip({required Animation<double> position, required TextDirection textDirection})
    : _position = position,
      _textDirection = textDirection;

  Animation<double> _position;

  set position(Animation<double> value) {
    if (identical(value, _position)) {
      return;
    }

    if (attached) {
      _position.removeListener(_moved);
      value.addListener(_moved);
    }

    _position = value;
    _moved();
  }

  TextDirection _textDirection;

  set textDirection(TextDirection value) {
    if (value == _textDirection) {
      return;
    }

    _textDirection = value;
    _moved();
  }

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);
    _position.addListener(_moved);
  }

  @override
  void detach() {
    _position.removeListener(_moved);
    super.detach();
  }

  /// Moving the strip places the slides again without laying them out again.
  void _moved() {
    _place();
    markNeedsPaint();
    markNeedsSemanticsUpdate();
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _StripParentData) {
      child.parentData = _StripParentData();
    }
  }

  @override
  double computeMinIntrinsicHeight(double width) => _tallest(width, min: true);

  @override
  double computeMaxIntrinsicHeight(double width) => _tallest(width, min: false);

  double _tallest(double width, {required bool min}) {
    double tallest = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      tallest = math.max(
        tallest,
        min ? child.getMinIntrinsicHeight(width) : child.getMaxIntrinsicHeight(width),
      );
    }

    return tallest;
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final double width = constraints.maxWidth.isFinite ? constraints.maxWidth : 0;
    double tallest = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      tallest = math.max(tallest, child.getDryLayout(BoxConstraints.tightFor(width: width)).height);
    }

    return constraints.constrain(Size(width, tallest));
  }

  @override
  void performLayout() {
    final double width = constraints.maxWidth.isFinite ? constraints.maxWidth : 0;
    double tallest = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      child.layout(
        BoxConstraints(minWidth: width, maxWidth: width, maxHeight: constraints.maxHeight),
        parentUsesSize: true,
      );
      tallest = math.max(tallest, child.size.height);
    }

    size = constraints.constrain(Size(width, tallest));

    // Every slide as tall as the strip, so a short picture sits in a slide the
    // height of the tallest rather than leaving the frame ragged.
    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      if (child.size.height != size.height) {
        child.layout(BoxConstraints.tightFor(width: width, height: size.height));
      }
    }

    _place();
  }

  void _place() {
    if (!hasSize) {
      return;
    }

    final double width = size.width;
    final double sign = _textDirection == TextDirection.rtl ? -1 : 1;
    int index = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      final double along = (index - _position.value) * width;

      (child.parentData! as _StripParentData).offset = Offset(along * sign, 0);
      index += 1;
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    return defaultHitTestChildren(result, position: position);
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    context.pushClipRect(needsCompositing, offset, Offset.zero & size, (
      PaintingContext context,
      Offset offset,
    ) {
      for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
        final Offset at = (child.parentData! as _StripParentData).offset;

        // Only what is in the frame, so a strip of twenty photographs paints
        // two of them while it travels.
        if (at.dx < size.width && at.dx + child.size.width > 0) {
          context.paintChild(child, offset + at);
        }
      }
    });
  }

  @override
  Rect? describeApproximatePaintClip(RenderObject child) => Offset.zero & size;
}

/// The previous or next button: MD3's filled icon button, its container let
/// down to 85% at rest so two discs of the accent do not shout over the
/// picture they move, and solid again under the pointer, the focus or a press.
///
/// The alpha is on the container rather than on the button: the glyph against
/// its own container is the contrast that has to survive.
class _Arrow extends StatelessWidget {
  const _Arrow({
    required this.forward,
    required this.size,
    required this.accent,
    required this.colors,
    required this.label,
    required this.onPressed,
  });

  final bool forward;
  final MPSize size;
  final MPAccent accent;
  final MPColorScheme colors;
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final bool enabled = onPressed != null;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final double extent = mpControlHeight[size]!;
    final BorderRadius radius = BorderRadius.circular(extent / 2);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return MPInteractive(
      onTap: onPressed,
      enabled: enabled,
      interactive: enabled,
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        final bool lit = state.hovered || state.pressed || state.focusVisible;
        // The specification's disabled treatment, left as it is: thinning a
        // 12% wash further would leave a control nobody can find.
        final Color fill = enabled
            ? accent.color.withValues(alpha: lit ? 1 : 0.85)
            : colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);
        final Color ink = enabled
            ? accent.onColor
            : colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          enabled: enabled,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                : null,
            child: AnimatedContainer(
              duration: reduceMotion ? Duration.zero : MPMotion.short4,
              curve: MPMotion.standard,
              width: extent,
              height: extent,
              decoration: BoxDecoration(color: fill, borderRadius: radius),
              child: MPStateLayer(
                color: ink,
                opacity: mpStateLayerOpacity(state, enabled: enabled),
                borderRadius: radius,
                child: Center(
                  // "Previous" is on the other side of the frame in a language
                  // that runs the other way.
                  child: MPGlyph(
                    MPGlyphShape.chevron,
                    size: mpControlIcon[size],
                    color: ink,
                    quarterTurns: forward != rtl ? -1 : 1,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// One position mark: a dot, or a bar for the current slide.
///
/// The bar grows along the row rather than scaling, so the row's height never
/// changes and the marks either side stay put.
class _Dot extends StatelessWidget {
  const _Dot({
    required this.current,
    required this.label,
    required this.rest,
    required this.grown,
    required this.height,
    required this.accent,
    required this.quiet,
    required this.hover,
    required this.ring,
    required this.duration,
    required this.onPressed,
  });

  final bool current;
  final String label;
  final double rest;
  final double grown;
  final double height;
  final Color accent;
  final Color quiet;
  final Color hover;
  final Color ring;
  final Duration duration;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final BorderRadius radius = BorderRadius.circular(height / 2);

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          selected: current,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: ring, borderRadius: radius)
                : null,
            child: AnimatedContainer(
              duration: duration,
              curve: MPMotion.standard,
              width: current ? grown : rest,
              height: height,
              decoration: BoxDecoration(
                color: current
                    ? accent
                    : state.hovered
                    ? hover
                    : quiet,
                borderRadius: radius,
              ),
            ),
          ),
        );
      },
    );
  }
}
