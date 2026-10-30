/// A Material Design segmented button: two to five choices in one pill.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/roving.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A segmented button's height, on a ladder of its own rather than the control
/// one: 32, 36, 40, 48, 56.
///
/// MD3 draws a segmented button at 40dp, and on the control ladder 40 is `sm`,
/// so the control ladder would put the specification's segmented button a rung
/// below its default. This ladder is centred on the specification's own
/// number instead; `xs`, `md` and `xl` are the control ladder's `xs`, `sm` and
/// `md` exactly, so a set lines up with a button drawn at those rungs.
const Map<MPSize, double> _height = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 36,
  MPSize.md: 40,
  MPSize.lg: 48,
  MPSize.xl: 56,
};

/// At least MD3's 12dp a side, growing with the pill as a button's does.
const Map<MPSize, double> _padX = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// MD3's 8dp between a segment's glyph and its label, at `md`.
const Map<MPSize, double> _gap = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 8,
  MPSize.xl: 8,
};

/// MD3's 18dp glyph at `md`.
const Map<MPSize, double> _icon = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 18,
  MPSize.md: 18,
  MPSize.lg: 20,
  MPSize.xl: 20,
};

/// `labelLarge` up to MD3's own rung, as the specification sets it there.
MPTypeRole _text(MPTypescale scale, MPSize size) {
  return size == MPSize.lg || size == MPSize.xl ? scale.titleMedium : scale.labelLarge;
}

/// One segment of an [MPSegmentedButton].
@immutable
class MPSegment {
  /// Creates a segment worth [value].
  const MPSegment({required this.value, this.label, this.icon, this.disabled = false});

  /// Identifies the segment. What `onChanged` reports.
  final String value;

  /// The words in the segment.
  final Widget? label;

  /// A glyph before the label. Replaced by the tick while the segment is
  /// chosen, which is what MD3 does: the tick and the icon share one slot, so
  /// the segment does not change width on selection.
  final Widget? icon;

  /// Unavailable, but still part of the set.
  final bool disabled;
}

/// A Material Design segmented button: two to five choices in one pill.
///
/// ```dart
/// MPSegmentedButton(
///   semanticLabel: 'View',
///   value: <String>[view],
///   onChanged: (List<String> next) => setState(() => view = next.first),
///   items: const <MPSegment>[
///     MPSegment(value: 'day', label: Text('Day')),
///     MPSegment(value: 'week', label: Text('Week')),
///     MPSegment(value: 'month', label: Text('Month')),
///   ],
/// )
/// ```
///
/// The container is a hairline `outline` with the segments divided by more of
/// the same, and the chosen one fills with `secondaryContainer`, deliberately
/// not `primary`, which MD3 reserves for the action a screen is about. A
/// segmented button changes what you are *looking at*; it does not do
/// anything.
///
/// The set takes one focus stop and the arrow keys move it between segments;
/// Enter and Space press the segment holding it. Each segment is announced as
/// a button that is pressed or not.
///
/// The value is a list in both modes, including single-select, where it holds
/// at most one entry: a value whose type changed with [multiple] would be a
/// union every caller has to narrow before reading it.
///
/// ## When this is the wrong component
///
/// At more than five segments the labels stop fitting; use a select. For
/// choosing something *in a form*, use `MPRadioGroup`.
class MPSegmentedButton extends StatefulWidget {
  /// Creates a segmented button over [items].
  const MPSegmentedButton({
    required this.items,
    this.value,
    this.initialValue = const <String>[],
    this.onChanged,
    this.multiple = false,
    this.showCheck = true,
    this.size,
    this.fullWidth = false,
    this.disabled = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The segments, in the order they are drawn.
  final List<MPSegment> items;

  /// Which segments are chosen. Given, the set is controlled.
  final List<String>? value;

  /// Which segments start chosen, for a set that holds its own value.
  final List<String> initialValue;

  /// Called with every chosen value, in the order the segments are drawn.
  final ValueChanged<List<String>>? onChanged;

  /// Whether more than one segment may be chosen at a time.
  final bool multiple;

  /// Whether a chosen segment shows a tick.
  ///
  /// On by default, and the slot is kept whether or not anything is chosen: a
  /// tick that appeared from nothing would push the label sideways at the
  /// moment the reader is looking at it. Turn it off for icon-only segments,
  /// where the fill already says which one is on.
  final bool showCheck;

  /// Which rung, on the segmented button's own ladder. [MPSize.md] is MD3's
  /// 40dp.
  final MPSize? size;

  /// Stretches the set to its container and gives every segment an equal
  /// part of the width.
  final bool fullWidth;

  /// Greys every segment out and stops the set taking input.
  final bool disabled;

  /// The set's name for a screen reader.
  final String? semanticLabel;

  /// The focus stop, which moves between the segments.
  final FocusNode? focusNode;

  /// Puts the focus on the stop as the set is inserted.
  final bool autofocus;

  @override
  State<MPSegmentedButton> createState() => _MPSegmentedButtonState();
}

class _MPSegmentedButtonState extends State<MPSegmentedButton>
    with MPRovingStop<MPSegmentedButton> {
  late List<String> _own = List<String>.of(widget.initialValue);

  /// The segment the arrows or a press last put the stop on.
  int? _active;

  @override
  FocusNode? get callerStop => widget.focusNode;

  List<String> get _value => widget.value ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool _reachable(MPSegment segment) => !_disabled && !segment.disabled;

  @override
  void didUpdateWidget(MPSegmentedButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    keepStop(oldWidget.focusNode);
  }

  int get _stopIndex {
    final List<MPSegment> items = widget.items;
    final int? active = _active;

    if (active != null && active < items.length && _reachable(items[active])) {
      return active;
    }

    final int chosen = items.indexWhere(
      (MPSegment segment) => _reachable(segment) && _value.contains(segment.value),
    );

    if (chosen >= 0) {
      return chosen;
    }

    final int first = items.indexWhere(_reachable);

    return first < 0 ? 0 : first;
  }

  void _press(int index) {
    final MPSegment segment = widget.items[index];
    final List<String> current = _value;
    final Set<String> chosen;

    if (current.contains(segment.value)) {
      chosen = current.where((String entry) => entry != segment.value).toSet();
    } else if (widget.multiple) {
      chosen = <String>{...current, segment.value};
    } else {
      chosen = <String>{segment.value};
    }

    // In the order the segments are drawn, whatever order they were pressed.
    final List<String> next = <String>[
      for (final MPSegment item in widget.items)
        if (chosen.contains(item.value)) item.value,
    ];

    keepStop(widget.focusNode);
    setState(() {
      _active = index;

      if (widget.value == null) {
        _own = next;
      }
    });

    widget.onChanged?.call(next);
  }

  bool _moveTo(int index) {
    keepStop(widget.focusNode);
    setState(() => _active = index);

    return true;
  }

  bool _move(int step) {
    final List<MPSegment> items = widget.items;
    final int count = items.length;

    if (count == 0) {
      return false;
    }

    final bool wraps = !mpArrowsMoveFocus(context);
    int index = _stopIndex;

    for (int tried = 0; tried < count; tried += 1) {
      index += step;

      if (wraps) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return false;
      }

      if (_reachable(items[index])) {
        return _moveTo(index);
      }
    }

    return false;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final int forward = Directionality.of(context) == TextDirection.rtl ? -1 : 1;
    final List<MPSegment> items = widget.items;

    if (mpArrowAcross(context, axis: Axis.horizontal, arrow: mpArrowAxis(event.logicalKey))) {
      return KeyEventResult.ignored;
    }

    return switch (event.logicalKey) {
      LogicalKeyboardKey.arrowRight => mpArrowResult(context, moved: _move(forward)),
      LogicalKeyboardKey.arrowLeft => mpArrowResult(context, moved: _move(-forward)),
      LogicalKeyboardKey.home when items.any(_reachable) =>
        _moveTo(items.indexWhere(_reachable)) ? KeyEventResult.handled : KeyEventResult.ignored,
      LogicalKeyboardKey.end when items.any(_reachable) =>
        _moveTo(items.lastIndexWhere(_reachable)) ? KeyEventResult.handled : KeyEventResult.ignored,
      _ => KeyEventResult.ignored,
    };
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final bool disabled = _disabled;
    final double height = _height[size]!;
    final int stopIndex = _stopIndex;
    final Color hairline = colors.outline;
    final Color drainedLine = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);

    final List<Widget> segments = <Widget>[
      for (int index = 0; index < widget.items.length; index += 1)
        _Segment(
          segment: widget.items[index],
          size: size,
          chosen: _value.contains(widget.items[index].value),
          disabled: disabled || widget.items[index].disabled,
          showCheck: widget.showCheck,
          // The divider is the segment's own leading edge, so it lands between
          // every pair and never at either end of the run.
          divider: index == 0
              ? null
              : (disabled || widget.items[index].disabled ? drainedLine : hairline),
          onPressed: () => _press(index),
          focusable: index == stopIndex,
          focusNode: index == stopIndex ? stop : null,
          autofocus: index == stopIndex && widget.autofocus,
        ),
    ];

    final BorderRadius radius = BorderRadius.circular(height / 2);

    // Equal parts of the width when `fullWidth`, so the set is one shape
    // divided rather than a row of differently sized tiles. Otherwise each
    // segment takes the width its label needs, and in a space narrower than
    // that they give it up in proportion and truncate their labels, as the
    // React segments do, rather than running off the edge.
    Widget run = widget.fullWidth
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[for (final Widget segment in segments) Expanded(child: segment)],
          )
        : _ShrinkRow(children: segments);

    run = Container(
      height: height,
      width: widget.fullWidth ? double.infinity : null,
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(color: disabled ? drainedLine : hairline),
      ),
      // Clipped to the pill, so the fill of the first and last segments takes
      // the container's corners instead of squaring them off.
      clipBehavior: Clip.antiAlias,
      child: run,
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: Focus(canRequestFocus: false, skipTraversal: true, onKeyEvent: _onKey, child: run),
    );
  }
}

/// One segment.
class _Segment extends StatelessWidget {
  const _Segment({
    required this.segment,
    required this.size,
    required this.chosen,
    required this.disabled,
    required this.showCheck,
    required this.divider,
    required this.onPressed,
    required this.focusable,
    required this.focusNode,
    required this.autofocus,
  });

  final MPSegment segment;
  final MPSize size;
  final bool chosen;
  final bool disabled;
  final bool showCheck;
  final Color? divider;
  final VoidCallback onPressed;
  final bool focusable;
  final FocusNode? focusNode;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : chosen
        ? colors.onSecondaryContainer
        : colors.onSurface;
    final Color fill = !disabled && chosen
        ? colors.secondaryContainer
        : colors.secondaryContainer.withValues(alpha: 0);
    final double icon = _icon[size]!;
    final bool slot = showCheck || segment.icon != null;

    Widget content(MPInteraction state) {
      final Widget row = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        spacing: _gap[size]!,
        children: <Widget>[
          if (slot)
            // Both glyphs are drawn and one of them is transparent, so the
            // segment's fill and the tick cross on the same 200ms rather than
            // the tick being stamped on halfway through. Stacked in a slot
            // that keeps their space, so the label does not move under them.
            SizedBox.square(
              dimension: icon,
              child: Stack(
                fit: StackFit.expand,
                children: <Widget>[
                  if (showCheck)
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(end: chosen ? 1 : 0),
                      duration: duration,
                      curve: MPMotion.standard,
                      builder: (BuildContext context, double shown, Widget? child) {
                        return CustomPaint(
                          painter: MPSelectionMarkPainter(
                            shape: MPSelectionMarkShape.check,
                            color: ink,
                            shown: shown,
                            strokeWidth: 2,
                            from: 1,
                          ),
                        );
                      },
                    ),
                  if (segment.icon != null)
                    AnimatedOpacity(
                      opacity: showCheck && chosen ? 0 : 1,
                      duration: duration,
                      curve: MPMotion.standard,
                      child: Center(child: segment.icon),
                    ),
                ],
              ),
            ),
          if (segment.label != null) Flexible(child: segment.label!),
        ],
      );

      // The padding and the glyph's slot cannot shrink. A segment squeezed
      // past them keeps them, centred, and is clipped at both edges, which is
      // what the React segment's `overflow-hidden` does, rather than reporting
      // an overflow.
      final double floor = _padX[size]! * 2 + (slot ? icon + _gap[size]! : 0);

      return ConstraintsTransformBox(
        clipBehavior: Clip.hardEdge,
        constraintsTransform: (BoxConstraints constraints) {
          return constraints.maxWidth < floor
              ? constraints.copyWith(minWidth: floor, maxWidth: floor)
              : constraints;
        },
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: _padX[size]!),
          child: Center(
            widthFactor: 1,
            child: DefaultTextStyle.merge(
              style: _text(theme.typescale, size).style(ink),
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              child: IconTheme.merge(
                data: IconThemeData(size: icon, color: ink),
                child: row,
              ),
            ),
          ),
        ),
      );
    }

    return MergeSemantics(
      child: Semantics(
        button: true,
        toggled: chosen,
        enabled: !disabled,
        onTap: disabled ? null : onPressed,
        child: ExcludeFocus(
          excluding: !focusable,
          child: MPInteractive(
            onTap: onPressed,
            enabled: !disabled,
            interactive: !disabled,
            focusNode: focusNode,
            autofocus: autofocus,
            focusSemantics: true,
            cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
            builder: (BuildContext context, MPInteraction state) {
              return AnimatedContainer(
                duration: duration,
                curve: MPMotion.standard,
                decoration: BoxDecoration(
                  color: fill,
                  border: divider == null
                      ? null
                      : BorderDirectional(start: BorderSide(color: divider!)),
                ),
                child: MPStateLayer(
                  color: ink,
                  // No ring on a segment: it lives inside a pill that clips,
                  // and the layer at the focus strength is what says where the
                  // keyboard is, as the React segment's does.
                  opacity: mpStateLayerOpacity(state, enabled: !disabled),
                  child: content(state),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// A row of segments at their own widths that, given less room than they
/// need, takes the difference from each in proportion to its width: CSS's
/// `flex-shrink`, which a [Row] does not have.
class _ShrinkRow extends MultiChildRenderObjectWidget {
  const _ShrinkRow({required super.children});

  @override
  RenderObject createRenderObject(BuildContext context) {
    return _RenderShrinkRow(Directionality.maybeOf(context) ?? TextDirection.ltr);
  }

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderShrinkRow).textDirection =
        Directionality.maybeOf(context) ?? TextDirection.ltr;
  }
}

class _ShrinkParentData extends ContainerBoxParentData<RenderBox> {}

class _RenderShrinkRow extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _ShrinkParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _ShrinkParentData> {
  _RenderShrinkRow(this._textDirection);

  TextDirection _textDirection;
  set textDirection(TextDirection value) {
    if (value != _textDirection) {
      _textDirection = value;
      markNeedsLayout();
    }
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _ShrinkParentData) {
      child.parentData = _ShrinkParentData();
    }
  }

  Iterable<RenderBox> get _members sync* {
    RenderBox? child = firstChild;

    while (child != null) {
      yield child;
      child = childAfter(child);
    }
  }

  @override
  double computeMinIntrinsicWidth(double height) => 0;

  @override
  double computeMaxIntrinsicWidth(double height) {
    return _members.fold<double>(
      0,
      (double sum, RenderBox c) => sum + c.getMaxIntrinsicWidth(height),
    );
  }

  @override
  double computeMinIntrinsicHeight(double width) {
    return _members.fold<double>(
      0,
      (double m, RenderBox c) => math.max(m, c.getMinIntrinsicHeight(width)),
    );
  }

  @override
  double computeMaxIntrinsicHeight(double width) {
    return _members.fold<double>(
      0,
      (double m, RenderBox c) => math.max(m, c.getMaxIntrinsicHeight(width)),
    );
  }

  List<double> _widths(BoxConstraints constraints) {
    final double height = constraints.maxHeight;
    final List<double> natural = <double>[
      for (final RenderBox child in _members) child.getMaxIntrinsicWidth(height),
    ];
    final double total = natural.fold<double>(0, (double sum, double w) => sum + w);

    if (!constraints.hasBoundedWidth || total <= constraints.maxWidth || total <= 0) {
      return natural;
    }

    final double ratio = constraints.maxWidth / total;

    return <double>[for (final double width in natural) width * ratio];
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final double width = _widths(constraints).fold<double>(0, (double sum, double w) => sum + w);

    return constraints.constrain(
      Size(width, constraints.maxHeight.isFinite ? constraints.maxHeight : 0),
    );
  }

  @override
  void performLayout() {
    final List<double> widths = _widths(constraints);
    final double height = constraints.maxHeight.isFinite ? constraints.maxHeight : 0;
    final double total = widths.fold<double>(0, (double sum, double w) => sum + w);
    final Size box = constraints.constrain(Size(total, height));
    final bool rtl = _textDirection == TextDirection.rtl;
    double at = 0;
    int index = 0;

    for (final RenderBox child in _members) {
      final double width = widths[index];

      child.layout(BoxConstraints.tightFor(width: width, height: box.height), parentUsesSize: true);
      (child.parentData! as _ShrinkParentData).offset = Offset(
        rtl ? box.width - at - width : at,
        0,
      );
      at += width;
      index += 1;
    }

    size = box;
  }

  @override
  void paint(PaintingContext context, Offset offset) => defaultPaint(context, offset);

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    return defaultHitTestChildren(result, position: position);
  }
}
