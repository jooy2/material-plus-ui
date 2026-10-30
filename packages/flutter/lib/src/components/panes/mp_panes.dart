/// A set of regions with draggable handles between them.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A pane's share of the split.
///
/// Two constructors rather than the React package's `number | string`, a union
/// Dart has no word for. They mean what its two halves mean: a **percentage**
/// is how a split is usually described and keeps its meaning when the window
/// changes size, and a **length** is what a sidebar with a minimum needs, since
/// "at least 160 pixels" does not survive being written as a fraction of a
/// width nobody knows yet.
@immutable
class MPPaneSize {
  /// A share of the space the panes divide, from 0 to 100.
  const MPPaneSize.percent(double this.percent) : pixels = null;

  /// A length in logical pixels.
  const MPPaneSize.pixels(double this.pixels) : percent = null;

  /// The share, when this is a percentage.
  final double? percent;

  /// The length, when this is one.
  final double? pixels;

  /// This size against a run of [extent] logical pixels.
  double resolve(double extent) => pixels ?? extent * percent! / 100;

  @override
  bool operator ==(Object other) {
    return other is MPPaneSize && other.percent == percent && other.pixels == pixels;
  }

  @override
  int get hashCode => Object.hash(percent, pixels);
}

/// One region of an [MPPanes].
///
/// It carries no surface of its own on purpose: a split is layout, and the
/// moment a pane drew a sheet it would stop being usable as the thing a table,
/// a card or an editor is put inside. It clips what it holds, so a long line in
/// one does not decide how narrow the pane can be dragged.
///
/// Its three sizes are read by the split rather than by the pane, because a
/// pane cannot know what "half" is: only the thing holding all of them can.
class MPPane extends StatelessWidget {
  /// Creates a region holding [child].
  const MPPane({required this.child, this.defaultSize, this.minSize, this.maxSize, super.key});

  /// What is inside the pane.
  final Widget child;

  /// The share it starts with. Panes with none split whatever is left equally.
  final MPPaneSize? defaultSize;

  /// How small it may be dragged.
  final MPPaneSize? minSize;

  /// How large it may be dragged. Unbounded when left out.
  final MPPaneSize? maxSize;

  @override
  Widget build(BuildContext context) => ClipRect(child: child);
}

/// The width of a handle, and so the width of the target the pointer has to
/// hit: 4, 6, 8, 10, 12.
///
/// A visible line one pixel wide is a target one pixel wide, which is not a
/// target. So the handle is a track several pixels across with the hairline
/// drawn down the middle of it.
const Map<MPSize, double> _track = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// How far one arrow key press moves a handle.
const double _keyboardStep = 16;

/// Moves a handle by whole steps.
class _NudgeIntent extends Intent {
  const _NudgeIntent(this.steps, this.axis);

  final int steps;

  /// The axis of the arrow key that asked for it.
  final Axis axis;
}

/// Moves a handle to one end of its travel.
class _EndIntent extends Intent {
  const _EndIntent({required this.upper});

  final bool upper;
}

/// A set of regions with draggable handles between them.
///
/// ```dart
/// MPPanes(
///   children: <MPPane>[
///     MPPane(
///       defaultSize: const MPPaneSize.pixels(200),
///       minSize: const MPPaneSize.pixels(120),
///       child: sidebar,
///     ),
///     MPPane(child: body),
///   ],
/// )
/// ```
///
/// The panes are sized in **fractions** of what is left once the handles have
/// taken their tracks, which is the React package's own arithmetic. That one
/// needs a resize observer, because a split inside a closed accordion is zero
/// wide when it mounts; a [LayoutBuilder] is handed the extent on every layout,
/// so here there is nothing to observe.
///
/// A handle moves by dragging it, and from the keyboard: the arrow keys along
/// its travel move it 16 pixels, Home and End take it to the ends of what the
/// two panes either side of it allow. It is announced as a control with a value,
/// the share of the pane before it, because Flutter's semantics have no
/// `separator` role.
///
/// It fills the space it is given and draws nothing but the handles. Give it a
/// bounded box: a split with no height of its own has nothing to divide down
/// the page.
class MPPanes extends StatefulWidget {
  /// Creates a split of [children].
  const MPPanes({
    required this.children,
    this.orientation = MPOrientation.horizontal,
    this.resizable = true,
    this.color,
    this.size,
    this.onResize,
    this.onResizeEnd,
    this.semanticLabel,
    super.key,
  });

  /// The regions, one handle between each two.
  final List<MPPane> children;

  /// Which way they run. [MPOrientation.horizontal] puts them side by side with
  /// upright handles; [MPOrientation.vertical] stacks them.
  final MPOrientation orientation;

  /// Whether the handles can be moved. Turned off, the split is a layout rather
  /// than a control, and the handles leave the focus order.
  final bool resizable;

  /// The family a handle lights up in under the pointer, while dragged and
  /// while it has the keyboard focus. A split draws no sheet, so that is the
  /// only place the family shows.
  final MPColor? color;

  /// How thick a handle is, and how wide the target the pointer has to hit.
  final MPSize? size;

  /// Fires with every pane's share, in percent, while a handle is dragged.
  final ValueChanged<List<double>>? onResize;

  /// Fires once, with the same shape, when the handle is let go, and on a key
  /// press, which is a whole gesture with no let-go to wait for.
  final ValueChanged<List<double>>? onResizeEnd;

  /// What a screen reader calls a handle, before the share it is at.
  final String? semanticLabel;

  @override
  State<MPPanes> createState() => _MPPanesState();
}

class _MPPanesState extends State<MPPanes> {
  /// Every pane's share, summing to one, once anything has moved a handle.
  List<double>? _fractions;

  bool get _horizontal => widget.orientation == MPOrientation.horizontal;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  double get _gutter {
    final int handles = widget.children.length - 1;

    return _track[_size]! * (handles < 0 ? 0 : handles);
  }

  /// The split as it stands: what a handle was moved to, or until then what the
  /// panes asked for.
  List<double> _current(double extent) {
    final List<double>? held = _fractions;

    if (held != null && held.length == widget.children.length) {
      return held;
    }

    return _initial(extent);
  }

  /// Every pane's share of [extent], summing to one.
  List<double> _initial(double extent) {
    final List<double?> sizes = <double?>[
      for (final MPPane pane in widget.children) pane.defaultSize?.resolve(extent),
    ];
    final double named = sizes.fold<double>(0, (double total, double? size) => total + (size ?? 0));
    final int unnamed = sizes.where((double? size) => size == null).length;
    // What the named panes left, split evenly; nothing when they asked for
    // more than there is.
    final double share = unnamed > 0
        ? (extent - named).clamp(0, double.infinity).toDouble() / unnamed
        : 0;
    final List<double> resolved = <double>[
      for (final double? size in sizes) (size ?? share).clamp(0, double.infinity).toDouble(),
    ];
    final double total = resolved.fold<double>(0, (double sum, double size) => sum + size);

    if (total <= 0) {
      return <double>[for (final double _ in resolved) 1 / resolved.length];
    }

    return <double>[for (final double size in resolved) size / total];
  }

  /// The travel of the boundary after pane [index]: where the pane before it
  /// starts and the two limits it may move between, or `null` when the limits
  /// leave it nowhere to go.
  ///
  /// A move only ever shifts one boundary, so the pair's total is fixed and
  /// one pane's floor is the other's ceiling. Folding all four bounds into one
  /// range on the first of the pair keeps every move to one clamp.
  ({double start, double pair, double lower, double upper})? _travel(int index, double extent) {
    if (!widget.resizable || extent <= 0 || index + 1 >= widget.children.length) {
      return null;
    }

    final List<double> current = _current(extent);
    final MPPane before = widget.children[index];
    final MPPane after = widget.children[index + 1];
    final double start = current[index] * extent;
    final double pair = start + current[index + 1] * extent;

    final double lower = <double>[
      before.minSize?.resolve(extent) ?? 0,
      pair - (after.maxSize?.resolve(extent) ?? pair),
    ].reduce((double a, double b) => a > b ? a : b);
    final double upper = <double>[
      before.maxSize?.resolve(extent) ?? pair,
      pair - (after.minSize?.resolve(extent) ?? 0),
    ].reduce((double a, double b) => a < b ? a : b);

    if (upper < lower) {
      return null;
    }

    return (start: start, pair: pair, lower: lower, upper: upper);
  }

  /// Moves the boundary after pane [index] to [to] pixels from the start of
  /// that pane, held inside its travel, and says what the split became.
  List<double>? _moveTo(
    int index,
    double Function(double start, double lower, double upper) to,
    double extent,
  ) {
    final ({double start, double pair, double lower, double upper})? travel = _travel(
      index,
      extent,
    );

    if (travel == null) {
      return null;
    }

    final double sized = to(
      travel.start,
      travel.lower,
      travel.upper,
    ).clamp(travel.lower, travel.upper);
    final List<double> next = List<double>.of(_current(extent));

    next[index] = sized / extent;
    next[index + 1] = (travel.pair - sized) / extent;

    // A move that leaves the line where it was, a pane held at its limit,
    // reports nothing.
    if (sized == travel.start) {
      return next;
    }

    setState(() => _fractions = next);
    widget.onResize?.call(_percent(next));

    return next;
  }

  static List<double> _percent(List<double> fractions) {
    return <double>[for (final double fraction in fractions) fraction * 100];
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPAccent accent = colors.accent(_color);

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double run = _horizontal ? constraints.maxWidth : constraints.maxHeight;
        final double extent = run - _gutter;
        final bool measured = extent.isFinite && extent > 0;
        final List<double> fractions = measured
            ? _current(extent)
            : <double>[for (final MPPane _ in widget.children) 1 / widget.children.length];
        final List<Widget> line = <Widget>[];

        for (int index = 0; index < widget.children.length; index += 1) {
          if (index > 0) {
            line.add(_handle(colors, accent, index - 1, extent, fractions));
          }

          final MPPane pane = widget.children[index];

          // Nothing to divide yet: the panes still lay out, evenly, rather than
          // collapsing to nothing and jumping on the next frame.
          line.add(
            measured
                ? SizedBox(
                    width: _horizontal ? fractions[index] * extent : null,
                    height: _horizontal ? null : fractions[index] * extent,
                    child: pane,
                  )
                : Expanded(child: pane),
          );
        }

        return _horizontal
            ? Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: line)
            : Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: line);
      },
    );
  }

  Widget _handle(
    MPColorScheme colors,
    MPAccent accent,
    int index,
    double extent,
    List<double> fractions,
  ) {
    final bool measured = extent.isFinite && extent > 0;

    void settle(List<double>? next, double before) {
      // A key press is a whole gesture: the settled callback fires with it,
      // when it moved the line at all.
      if (next != null && next[index] != before) {
        widget.onResizeEnd?.call(_percent(next));
      }
    }

    return _Handle(
      track: _track[_size]!,
      horizontal: _horizontal,
      resizable: widget.resizable && measured,
      rest: colors.outlineVariant,
      lit: accent.color,
      focus: colors.secondary,
      label: widget.semanticLabel,
      share: (fractions[index] * 100).round(),
      // What one key press is worth, as a share: Flutter takes no increase
      // action without being told what the value becomes.
      step: measured ? (_keyboardStep / extent * 100).round().clamp(1, 100) : 1,
      onDrag: (double delta) {
        return _moveTo(index, (double start, double lower, double upper) => start + delta, extent);
      },
      onSettle: (List<double> fractions) => widget.onResizeEnd?.call(_percent(fractions)),
      onNudge: (int steps) {
        final double before = _current(extent)[index];
        final List<double>? next = _moveTo(
          index,
          (double start, double lower, double upper) => start + steps * _keyboardStep,
          extent,
        );

        settle(next, before);

        return next != null && next[index] != before;
      },
      onEnd: (bool upper) {
        final double before = _current(extent)[index];
        final List<double>? next = _moveTo(
          index,
          (double start, double lower, double high) => upper ? high : lower,
          extent,
        );

        settle(next, before);
      },
    );
  }
}

/// One handle: the track that can be grabbed, and the hairline drawn down it.
class _Handle extends StatefulWidget {
  const _Handle({
    required this.track,
    required this.horizontal,
    required this.resizable,
    required this.rest,
    required this.lit,
    required this.focus,
    required this.share,
    required this.step,
    required this.onDrag,
    required this.onSettle,
    required this.onNudge,
    required this.onEnd,
    this.label,
  });

  final double track;
  final bool horizontal;
  final bool resizable;

  /// The hairline at rest, `outlineVariant`.
  final Color rest;

  /// The accent the hairline and its wash turn under the pointer.
  final Color lit;

  /// The focus ring, `secondary`.
  final Color focus;

  final String? label;
  final int share;
  final int step;
  final List<double>? Function(double delta) onDrag;
  final ValueChanged<List<double>> onSettle;

  /// Moves the boundary [steps] key steps along and says whether it moved.
  final bool Function(int steps) onNudge;

  /// Moves the boundary to one end of its travel.
  final ValueChanged<bool> onEnd;

  @override
  State<_Handle> createState() => _HandleState();
}

class _HandleState extends State<_Handle> {
  bool _hovered = false;
  bool _dragging = false;
  bool _focusVisible = false;
  List<double>? _latest;

  @override
  Widget build(BuildContext context) {
    final bool lit = widget.resizable && (_hovered || _dragging || _focusVisible);
    final bool rtl = Directionality.maybeOf(context) == TextDirection.rtl;
    final Duration motion = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;

    // What is drawn is the hairline; what can be grabbed is the track round it.
    // The hairline changes colour and nothing else, so nothing either side of
    // it moves when the pointer arrives.
    Widget mark = Center(
      child: AnimatedContainer(
        duration: motion,
        curve: MPMotion.standard,
        width: widget.horizontal ? 1 : double.infinity,
        height: widget.horizontal ? double.infinity : 1,
        color: lit ? widget.lit : widget.rest,
      ),
    );

    // The wash is always there with only its colour changing, so it eases in
    // and out: the accent at 8% under the pointer, 10% while dragged.
    final double wash = !widget.resizable
        ? 0
        : _dragging
        ? MPStateOpacity.press
        : _hovered
        ? MPStateOpacity.hover
        : 0;

    mark = AnimatedContainer(
      duration: motion,
      curve: MPMotion.standard,
      width: widget.horizontal ? widget.track : double.infinity,
      height: widget.horizontal ? double.infinity : widget.track,
      color: widget.lit.withValues(alpha: wash),
      child: mark,
    );

    mark = CustomPaint(
      foregroundPainter: _focusVisible
          ? MPFocusRingPainter(color: widget.focus, borderRadius: BorderRadius.zero, offset: 0)
          : null,
      child: mark,
    );

    Widget handle = MouseRegion(
      cursor: widget.resizable
          ? (widget.horizontal ? SystemMouseCursors.resizeColumn : SystemMouseCursors.resizeRow)
          : MouseCursor.defer,
      onEnter: (PointerEnterEvent event) => setState(() => _hovered = true),
      onExit: (PointerExitEvent event) => setState(() => _hovered = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onHorizontalDragStart: widget.resizable && widget.horizontal ? _start : null,
        // Positive is always towards the end, so a drag under right-to-left
        // text moves the boundary the way the pointer went.
        onHorizontalDragUpdate: widget.resizable && widget.horizontal
            ? (DragUpdateDetails details) => _drag(rtl ? -details.delta.dx : details.delta.dx)
            : null,
        onHorizontalDragEnd: widget.resizable && widget.horizontal ? _end : null,
        onVerticalDragStart: widget.resizable && !widget.horizontal ? _start : null,
        onVerticalDragUpdate: widget.resizable && !widget.horizontal
            ? (DragUpdateDetails details) => _drag(details.delta.dy)
            : null,
        onVerticalDragEnd: widget.resizable && !widget.horizontal ? _end : null,
        child: mark,
      ),
    );

    // In the tree whether the split can be resized or not, and enabled only
    // while it can, which is what takes the handle out of the focus order
    // without rebuilding the line underneath it.
    handle = FocusableActionDetector(
      enabled: widget.resizable,
      includeFocusSemantics: false,
      onShowFocusHighlight: (bool value) {
        if (_focusVisible != value) {
          setState(() => _focusVisible = value);
        }
      },
      shortcuts: const <ShortcutActivator, Intent>{
        SingleActivator(LogicalKeyboardKey.arrowRight): _NudgeIntent(1, Axis.horizontal),
        SingleActivator(LogicalKeyboardKey.arrowDown): _NudgeIntent(1, Axis.vertical),
        SingleActivator(LogicalKeyboardKey.arrowLeft): _NudgeIntent(-1, Axis.horizontal),
        SingleActivator(LogicalKeyboardKey.arrowUp): _NudgeIntent(-1, Axis.vertical),
        SingleActivator(LogicalKeyboardKey.home): _EndIntent(upper: false),
        SingleActivator(LogicalKeyboardKey.end): _EndIntent(upper: true),
      },
      actions: <Type, Action<Intent>>{
        _NudgeIntent: MPArrowAction<_NudgeIntent>(
          context,
          onArrow: (_NudgeIntent intent) {
            // Only the arrows along the line's travel move it; the others go on
            // to the focus system under directional navigation.
            final Axis axis = widget.horizontal ? Axis.horizontal : Axis.vertical;

            if (intent.axis != axis || mpArrowAcross(context, axis: axis, arrow: intent.axis)) {
              return false;
            }

            return widget.onNudge(widget.horizontal && rtl ? -intent.steps : intent.steps);
          },
        ),
        _EndIntent: CallbackAction<_EndIntent>(
          onInvoke: (_EndIntent intent) {
            widget.onEnd(intent.upper);

            return null;
          },
        ),
      },
      child: handle,
    );

    // Flutter's semantics have no `separator` role and no `valuenow`, so a
    // handle is what it is to a screen reader: a control with a value that can
    // be turned up and down.
    return Semantics(
      slider: true,
      enabled: widget.resizable,
      label: widget.label,
      value: '${widget.share}%',
      increasedValue: '${(widget.share + widget.step).clamp(0, 100)}%',
      decreasedValue: '${(widget.share - widget.step).clamp(0, 100)}%',
      onIncrease: widget.resizable ? () => widget.onNudge(1) : null,
      onDecrease: widget.resizable ? () => widget.onNudge(-1) : null,
      child: ExcludeSemantics(child: handle),
    );
  }

  void _start(DragStartDetails details) => setState(() => _dragging = true);

  void _drag(double delta) {
    _latest = widget.onDrag(delta) ?? _latest;
  }

  void _end(DragEndDetails details) {
    setState(() => _dragging = false);

    final List<double>? settled = _latest;

    _latest = null;

    if (settled != null) {
      widget.onSettle(settled);
    }
  }
}
