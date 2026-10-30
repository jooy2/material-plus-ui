/// A Material Design slider.
library;

import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The rail: 2, 3, 4, 6, 8. MD3's 4dp track at `md`.
const Map<MPSize, double> _rail = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 3,
  MPSize.md: 4,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// The handle: 14, 16, 20, 24, 28. MD3's 20dp at `md`.
const Map<MPSize, double> _handle = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 28,
};

/// The strip a press lands on: 32 to 48, as tall as a finger rather than as
/// the rail. A press anywhere on it moves the value there.
const Map<MPSize, double> _strip = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 36,
  MPSize.md: 40,
  MPSize.lg: 44,
  MPSize.xl: 48,
};

/// A tick: smaller than anything else on the control. MD3 draws tick marks as
/// dots *inside* the track, so a tick is never thicker than the track.
const Map<MPSize, double> _tick = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 2,
  MPSize.md: 3,
  MPSize.lg: 4,
  MPSize.xl: 6,
};

/// A vertical slider's length, the React build's `h-40`. It has no length of
/// its own otherwise.
const double _verticalLength = 160;

/// A horizontal slider's length when nothing round it gives it a width. The
/// React slider is `w-full`; a row that does not bound its children has no
/// full width to give.
const double _unboundedLength = 240;

/// The most ticks [MPSliderMarks.everyStep] draws. Past fifty they stop being
/// ticks and become a dotted line that says less than no ticks at all.
const int _maxTicks = 50;

/// A named place on a slider's track.
@immutable
class MPSliderMark {
  /// Creates a mark at [value].
  const MPSliderMark({required this.value, this.label});

  /// Where on the range it sits. Outside `min`…`max` it is not drawn.
  final double value;

  /// What is written under it, or beside it on a vertical slider. Left out,
  /// the mark is a tick on the track and nothing else.
  final Widget? label;
}

/// The ticks on a slider's track.
///
/// The React prop takes `true` or an array; Dart has no union of the two, so
/// they are this class's two constructors.
@immutable
class MPSliderMarks {
  /// The marks in [marks], which may carry labels: the decades under a year
  /// range.
  const MPSliderMarks(List<MPSliderMark> this.marks);

  /// One tick at every `step`, which is MD3's discrete slider, up to fifty of
  /// them.
  const MPSliderMarks.everyStep() : marks = null;

  /// The marks named by hand, or `null` for one at every step.
  final List<MPSliderMark>? marks;
}

/// A Material Design slider.
///
/// ```dart
/// MPSlider(
///   label: const Text('Volume'),
///   showValue: true,
///   value: <double>[volume],
///   onChanged: (List<double> next) => setState(() => volume = next.first),
/// )
/// ```
///
/// The active part of the track is the accent family and the rest is
/// `surfaceContainerHighest`, MD3's own pairing and the reason the inactive
/// half reads as a groove rather than as a second value.
///
/// The value is a list: one entry is a slider, two are a range. There is no
/// separate `range` parameter, because the shape of the value already says
/// which one this is. The handles of a range cannot cross.
///
/// The handle travels to a value it was not dragged to, a key press or a press
/// on the track, on `short2`, and never while it is being dragged, when the
/// one thing it must do is stay under the finger.
///
/// ## The handle is a circle, not a bar
///
/// Material's 2025 revision draws the handle as a tall bar with a gap punched
/// out of the track either side. The gap has to be filled with the colour the
/// slider is sitting on, which a component library does not know, so this is
/// the earlier circular handle.
class MPSlider extends StatefulWidget {
  /// Creates a slider.
  const MPSlider({
    this.value,
    this.initialValue,
    this.onChanged,
    this.onValueCommitted,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.marks,
    this.label,
    this.description,
    this.showValue = false,
    this.format,
    this.orientation = MPOrientation.horizontal,
    this.size,
    this.color,
    this.disabled = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The value, one entry per handle. Given, the slider is controlled.
  final List<double>? value;

  /// The starting value, for a slider that holds its own. `[min]` when left
  /// out.
  final List<double>? initialValue;

  /// Called on every move, with the same shape the value takes.
  final ValueChanged<List<double>>? onChanged;

  /// Called once a move settles: a drag ends, a key is pressed, the track is
  /// pressed. Where an expensive update belongs.
  final ValueChanged<List<double>>? onValueCommitted;

  /// The bottom of the range.
  final double min;

  /// The top of the range.
  final double max;

  /// How far one arrow key, or one notch of a drag, moves.
  final double step;

  /// The ticks on the track, and optionally what is written under them.
  ///
  /// A tick over the filled part of the track is drawn in the accent's own ink
  /// and one over the groove in `onSurfaceVariant`, so a tick stays visible as
  /// the handle passes it.
  final MPSliderMarks? marks;

  /// The label above the track.
  final Widget? label;

  /// The line under the track, also read to a screen reader on the handle.
  final Widget? description;

  /// Shows the current value beside the label. A slider with no readout is a
  /// control whose value can only be estimated, which is fine for a volume
  /// dial and wrong for anything with units.
  final bool showValue;

  /// How the readout and the spoken value write one number. Left out, the
  /// number is written with as many decimals as [step] has.
  final String Function(double value)? format;

  /// Which way the slider runs. A vertical slider is 160px long and runs
  /// bottom to top.
  final MPOrientation orientation;

  /// The rail's thickness and the handle's size.
  final MPSize? size;

  /// Which accent family the active track and handle take.
  final MPColor? color;

  /// Greys the slider out and stops it taking input.
  final bool disabled;

  /// The slider's name for a screen reader, for one with no visible [label].
  final String? semanticLabel;

  /// Drives the focus of the first handle from outside.
  final FocusNode? focusNode;

  /// Puts the focus on the first handle as the slider is inserted.
  final bool autofocus;

  @override
  State<MPSlider> createState() => _MPSliderState();
}

class _MPSliderState extends State<MPSlider> {
  late List<double> _own = List<double>.of(widget.initialValue ?? <double>[widget.min]);

  /// The handle being dragged, or `null`.
  int? _dragging;

  List<double> get _values => widget.value ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _vertical => widget.orientation == MPOrientation.vertical;

  /// Whether the run is mirrored. The minimum belongs at the inline start, so
  /// three things turn over together under right-to-left: where the fill is
  /// painted, which end a press maps to, and which way an arrow counts.
  bool get _rtl => !_vertical && Directionality.of(context) == TextDirection.rtl;

  double get _range => widget.max - widget.min;

  double _fraction(double value) {
    return _range <= 0 ? 0 : ((value - widget.min) / _range).clamp(0.0, 1.0);
  }

  /// The value at [fraction], snapped to the step and held between the
  /// neighbouring handles.
  double _valueAt(double fraction, int index) {
    final List<double> values = _values;
    final double raw = widget.min + fraction.clamp(0.0, 1.0) * _range;
    final double snapped = widget.step > 0
        ? widget.min + ((raw - widget.min) / widget.step).round() * widget.step
        : raw;
    final double lower = index > 0 ? values[index - 1] : widget.min;
    final double upper = index < values.length - 1 ? values[index + 1] : widget.max;

    return snapped.clamp(math.min(lower, upper), math.max(lower, upper)).toDouble();
  }

  void _report(int index, double value, {bool commit = false}) {
    final List<double> values = _values;

    if (index >= values.length) {
      return;
    }

    final List<double> next = <double>[...values]..[index] = value;
    final bool moved = values[index] != value;

    if (moved) {
      if (widget.value == null) {
        setState(() => _own = next);
      }

      widget.onChanged?.call(next);
    }

    if (commit) {
      widget.onValueCommitted?.call(next);
    }
  }

  /// The handle nearest [fraction], which is the one a press on the track
  /// moves.
  int _nearest(double fraction) {
    final List<double> values = _values;
    int best = 0;
    double distance = double.infinity;

    for (int index = 0; index < values.length; index += 1) {
      final double gap = (_fraction(values[index]) - fraction).abs();

      // A tie goes to the later handle when the press is past it, so two
      // handles parked on one value can still be pulled apart upwards.
      if (gap < distance || (gap == distance && fraction > _fraction(values[index]))) {
        distance = gap;
        best = index;
      }
    }

    return best;
  }

  /// Where a press at [local] in a strip of [box] sits along the range, as
  /// 0…1. A vertical slider runs bottom to top: up is more.
  double _fractionOf(Offset local, Size box) {
    final double extent = _vertical ? box.height : box.width;

    if (extent <= 0) {
      return 0;
    }

    final double along = _vertical ? box.height - local.dy : local.dx;
    final double fraction = (along / extent).clamp(0.0, 1.0);

    return _rtl ? 1 - fraction : fraction;
  }

  String _formatted(double value) {
    final String Function(double value)? format = widget.format;

    if (format != null) {
      return format(value);
    }

    final String step = widget.step.toString();
    final int dot = step.indexOf('.');
    final int decimals = dot < 0 || step.contains('e')
        ? 0
        : step.substring(dot + 1).replaceFirst(RegExp(r'0+$'), '').length;

    return value.toStringAsFixed(decimals);
  }

  double _stepped(int index, double by) {
    return _valueAt(_fraction(_values[index] + by), index);
  }

  KeyEventResult _onKey(int index, KeyEvent event) {
    if (_disabled || (event is! KeyDownEvent && event is! KeyRepeatEvent)) {
      return KeyEventResult.ignored;
    }

    final Axis axis = _vertical ? Axis.vertical : Axis.horizontal;

    if (mpArrowAcross(context, axis: axis, arrow: mpArrowAxis(event.logicalKey))) {
      return KeyEventResult.ignored;
    }

    final double value = _values[index];
    // Up and down are up and down in every writing direction; right and left
    // are the ones that mean "further along the line".
    final double along = _rtl ? -widget.step : widget.step;
    // Base UI's large step: ten of the slider's units, or one step if that is
    // further.
    final double large = math.max(widget.step, 10);

    final double? next = switch (event.logicalKey) {
      LogicalKeyboardKey.arrowUp => value + widget.step,
      LogicalKeyboardKey.arrowDown => value - widget.step,
      LogicalKeyboardKey.arrowRight => value + along,
      LogicalKeyboardKey.arrowLeft => value - along,
      LogicalKeyboardKey.pageUp => value + large,
      LogicalKeyboardKey.pageDown => value - large,
      LogicalKeyboardKey.home => widget.min,
      LogicalKeyboardKey.end => widget.max,
      _ => null,
    };

    if (next == null) {
      return KeyEventResult.ignored;
    }

    final double resolved = _valueAt(_fraction(next), index);
    final bool moved = resolved != value;

    if (moved) {
      _report(index, resolved, commit: true);
    }

    return mpIsArrow(event.logicalKey)
        ? mpArrowResult(context, moved: moved)
        : KeyEventResult.handled;
  }

  void _press(Offset local, Size box) {
    final double fraction = _fractionOf(local, box);
    final int index = _nearest(fraction);

    _report(index, _valueAt(fraction, index), commit: true);
  }

  void _dragStart(Offset local, Size box) {
    final double fraction = _fractionOf(local, box);
    final int index = _nearest(fraction);

    setState(() => _dragging = index);
    _report(index, _valueAt(fraction, index));
  }

  void _dragUpdate(Offset local, Size box) {
    final int? index = _dragging;

    if (index != null) {
      _report(index, _valueAt(_fractionOf(local, box), index));
    }
  }

  void _dragEnd() {
    final int? index = _dragging;

    if (index == null) {
      return;
    }

    setState(() => _dragging = null);
    widget.onValueCommitted?.call(_values);
  }

  /// The ticks to draw, resolved from [MPSlider.marks]. A mark outside the
  /// range is dropped rather than pinned to an end, where it would read as a
  /// tick that is somewhere it is not.
  List<MPSliderMark> get _ticks {
    final MPSliderMarks? marks = widget.marks;

    if (marks == null || widget.max <= widget.min) {
      return const <MPSliderMark>[];
    }

    final List<MPSliderMark>? named = marks.marks;

    if (named != null) {
      return named
          .where((MPSliderMark mark) => mark.value >= widget.min && mark.value <= widget.max)
          .toList(growable: false);
    }

    if (widget.step <= 0) {
      return const <MPSliderMark>[];
    }

    final int count = (_range / widget.step).floor();

    if (count < 1 || count > _maxTicks) {
      return const <MPSliderMark>[];
    }

    return <MPSliderMark>[
      for (int index = 0; index <= count; index += 1)
        MPSliderMark(value: widget.min + index * widget.step),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(widget.color ?? config?.color ?? MPColor.primary);
    final bool disabled = _disabled;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final List<double> values = _values;
    final List<MPSliderMark> ticks = _ticks;
    final Color drained = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color meta = disabled ? drained : colors.onSurfaceVariant;

    final double rail = _rail[size]!;
    final double handle = _handle[size]!;
    final double strip = _strip[size]!;

    // A single value fills from the bottom of the range; a pair fills between
    // them, which is the same sentence with a different floor.
    final double fillFrom = values.length > 1 ? values.reduce(math.min) : widget.min;
    final double fillTo = values.isEmpty ? widget.min : values.reduce(math.max);

    Duration travel(bool held) {
      return reduceMotion || held ? Duration.zero : MPMotion.short2;
    }

    Widget track(BoxConstraints constraints) {
      final double extent = _vertical
          ? _verticalLength
          : (constraints.hasBoundedWidth ? constraints.maxWidth : _unboundedLength);
      final Size box = _vertical ? Size(strip, extent) : Size(extent, strip);

      double along(double value) => _fraction(value) * extent;

      final double start = along(fillFrom);
      final double end = along(fillTo);

      final List<Widget> layers = <Widget>[
        // The groove, a pill along the middle of the strip.
        Positioned(
          left: _vertical ? (strip - rail) / 2 : 0,
          right: _vertical ? (strip - rail) / 2 : 0,
          top: _vertical ? 0 : (strip - rail) / 2,
          bottom: _vertical ? 0 : (strip - rail) / 2,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: disabled
                  ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer)
                  : colors.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(rail / 2),
            ),
          ),
        ),
        // The active part of it.
        AnimatedPositionedDirectional(
          duration: travel(_dragging != null),
          curve: MPMotion.standard,
          start: _vertical ? (strip - rail) / 2 : start,
          width: _vertical ? rail : math.max(0, end - start),
          top: _vertical ? extent - end : (strip - rail) / 2,
          height: _vertical ? math.max(0, end - start) : rail,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: disabled ? drained : accent.color,
              borderRadius: BorderRadius.circular(rail / 2),
            ),
          ),
        ),
        // On the track and under the handle, which is where MD3 draws them,
        // and out of the semantics tree: the ticks are a picture of the step,
        // which a screen reader is told by the value it can move to.
        for (final MPSliderMark mark in ticks)
          PositionedDirectional(
            start: _vertical ? (strip - _tick[size]!) / 2 : along(mark.value) - _tick[size]! / 2,
            top: _vertical
                ? extent - along(mark.value) - _tick[size]! / 2
                : (strip - _tick[size]!) / 2,
            width: _tick[size],
            height: _tick[size],
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: disabled
                    ? drained
                    : mark.value >= fillFrom && mark.value <= fillTo
                    ? accent.onColor
                    : colors.onSurfaceVariant,
              ),
            ),
          ),
        for (int index = 0; index < values.length; index += 1)
          AnimatedPositionedDirectional(
            duration: travel(_dragging == index),
            curve: MPMotion.standard,
            start: _vertical ? (strip - handle) / 2 : along(values[index]) - handle / 2,
            top: _vertical ? extent - along(values[index]) - handle / 2 : (strip - handle) / 2,
            child: _Handle(
              diameter: handle,
              halo: mpSelectionHalo[size]!,
              accent: accent,
              disabled: disabled,
              dragging: _dragging == index,
              focusNode: index == 0 ? widget.focusNode : null,
              autofocus: index == 0 && widget.autofocus,
              onKey: (KeyEvent event) => _onKey(index, event),
              semantics: (Widget child) => _adjustable(index: index, child: child),
            ),
          ),
      ];

      final bool horizontalDrag = !_vertical;

      return MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTapUp: disabled ? null : (TapUpDetails details) => _press(details.localPosition, box),
          onHorizontalDragStart: disabled || !horizontalDrag
              ? null
              : (DragStartDetails details) => _dragStart(details.localPosition, box),
          onHorizontalDragUpdate: disabled || !horizontalDrag
              ? null
              : (DragUpdateDetails details) => _dragUpdate(details.localPosition, box),
          onHorizontalDragEnd: disabled || !horizontalDrag ? null : (_) => _dragEnd(),
          onHorizontalDragCancel: disabled || !horizontalDrag ? null : _dragEnd,
          onVerticalDragStart: disabled || horizontalDrag
              ? null
              : (DragStartDetails details) => _dragStart(details.localPosition, box),
          onVerticalDragUpdate: disabled || horizontalDrag
              ? null
              : (DragUpdateDetails details) => _dragUpdate(details.localPosition, box),
          onVerticalDragEnd: disabled || horizontalDrag ? null : (_) => _dragEnd(),
          onVerticalDragCancel: disabled || horizontalDrag ? null : _dragEnd,
          dragStartBehavior: DragStartBehavior.down,
          child: SizedBox(
            width: box.width,
            height: box.height,
            child: Stack(clipBehavior: Clip.none, children: layers),
          ),
        ),
      );
    }

    final Widget control = _vertical
        ? track(const BoxConstraints())
        : LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) => track(constraints),
          );

    final bool hasHeader = widget.label != null || widget.showValue;
    final TextStyle metaStyle = theme.typescale.bodySmall.style(meta);

    final Widget? header = hasHeader
        ? Row(
            mainAxisSize: _vertical ? MainAxisSize.min : MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            spacing: 8,
            children: <Widget>[
              if (widget.label != null)
                // The handle carries the name, so the drawn words are not read
                // a second time.
                ExcludeSemantics(
                  excluding: mpTextOf(widget.label) != null || widget.semanticLabel != null,
                  child: DefaultTextStyle.merge(style: metaStyle, child: widget.label!),
                ),
              if (widget.showValue && !_vertical) const Spacer(),
              if (widget.showValue)
                ExcludeSemantics(
                  child: Text(
                    values.map(_formatted).join(' – '),
                    style: metaStyle.copyWith(
                      color: disabled ? drained : colors.onSurface,
                      fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
                    ),
                  ),
                ),
            ],
          )
        : null;

    final bool labelled = ticks.any((MPSliderMark mark) => mark.label != null);
    final Widget? captions = labelled
        ? ExcludeSemantics(
            child: DefaultTextStyle.merge(
              style: metaStyle,
              softWrap: false,
              child: _Captions(
                ticks: ticks,
                vertical: _vertical,
                fraction: _fraction,
                line: theme.typescale.bodySmall.lineHeight,
              ),
            ),
          )
        : null;

    final Widget? description = widget.description == null
        ? null
        : ExcludeSemantics(
            // Read on the handle instead, which is the one place a description
            // means anything to someone moving it.
            excluding: mpTextOf(widget.description) != null,
            child: DefaultTextStyle.merge(style: metaStyle, child: widget.description!),
          );

    if (_vertical) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        spacing: 8,
        children: <Widget>[
          ?header,
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 8,
            children: <Widget>[control, ?captions],
          ),
          ?description,
        ],
      );
    }

    final Widget body = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 4,
      children: <Widget>[?header, control, ?captions, ?description],
    );

    // Full width, as the React slider is; inside something that gives it no
    // width to fill, a length of its own.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        return constraints.hasBoundedWidth ? body : SizedBox(width: _unboundedLength, child: body);
      },
    );
  }

  /// What one handle says to a screen reader, and the two actions it answers:
  /// the swipe up and down a screen reader adjusts a slider with.
  Widget _adjustable({required int index, required Widget child}) {
    final double value = _values[index];
    final double up = _stepped(index, widget.step);
    final double down = _stepped(index, -widget.step);
    final bool disabled = _disabled;

    return Semantics(
      container: true,
      slider: true,
      enabled: !disabled,
      label: widget.semanticLabel ?? mpTextOf(widget.label),
      hint: mpTextOf(widget.description),
      value: _formatted(value),
      increasedValue: up == value ? null : _formatted(up),
      decreasedValue: down == value ? null : _formatted(down),
      onIncrease: disabled || up == value ? null : () => _report(index, up, commit: true),
      onDecrease: disabled || down == value ? null : () => _report(index, down, commit: true),
      child: child,
    );
  }
}

/// One handle, with its halo, its focus and its keys.
class _Handle extends StatelessWidget {
  const _Handle({
    required this.diameter,
    required this.halo,
    required this.accent,
    required this.disabled,
    required this.dragging,
    required this.focusNode,
    required this.autofocus,
    required this.onKey,
    required this.semantics,
  });

  final double diameter;
  final double halo;
  final MPAccent accent;
  final bool disabled;
  final bool dragging;
  final FocusNode? focusNode;
  final bool autofocus;
  final KeyEventResult Function(KeyEvent event) onKey;
  final Widget Function(Widget child) semantics;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;

    return Focus(
      // Not a stop of its own: it hears the keys on their way up from the
      // handle's node inside it.
      canRequestFocus: false,
      skipTraversal: true,
      onKeyEvent: (FocusNode node, KeyEvent event) => onKey(event),
      child: MPInteractive(
        enabled: !disabled,
        interactive: !disabled,
        focusNode: focusNode,
        autofocus: autofocus,
        // The handle takes no tap of its own: a press on it is a press on the
        // track, which the strip round it answers.
        onTap: null,
        behavior: HitTestBehavior.translucent,
        shortcuts: const <ShortcutActivator, Intent>{},
        cursor: disabled
            ? SystemMouseCursors.basic
            : dragging
            ? SystemMouseCursors.grabbing
            : SystemMouseCursors.grab,
        builder: (BuildContext context, MPInteraction state) {
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );
          // A slider is the one control with a *dragging* state, and MD3 gives
          // it the heaviest layer of the four.
          final double opacity = disabled
              ? 0
              : dragging
              ? MPStateOpacity.drag
              : mpStateLayerOpacity(
                  MPInteraction(
                    hovered: state.hovered,
                    pressed: state.pressed,
                    focusVisible: state.focusVisible,
                  ),
                );

          return semantics(
            Semantics(
              focused: focus.focused,
              onFocus: focus.onFocus,
              child: MPSelectionHalo(
                diameter: halo,
                color: accent.color,
                opacity: opacity,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: disabled
                        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
                        : accent.color,
                  ),
                  child: SizedBox.square(dimension: diameter),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// The marks' labels, each centred on its own tick, out of the track's flow:
/// they are longer than the ticks they belong to, and a track that had to be
/// as tall as its own captions would stop being 4dp.
class _Captions extends StatelessWidget {
  const _Captions({
    required this.ticks,
    required this.vertical,
    required this.fraction,
    required this.line,
  });

  final List<MPSliderMark> ticks;
  final bool vertical;
  final double Function(double value) fraction;
  final double line;

  /// The box each label is centred in. Wide enough for a year or a price;
  /// a longer label belongs in fewer marks rather than a wider box.
  static const double _box = 160;

  @override
  Widget build(BuildContext context) {
    if (vertical) {
      return SizedBox(
        width: _box / 2,
        height: _verticalLength,
        child: Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            for (final MPSliderMark mark in ticks)
              if (mark.label != null)
                PositionedDirectional(
                  start: 0,
                  top: _verticalLength - fraction(mark.value) * _verticalLength - line / 2,
                  height: line,
                  child: mark.label!,
                ),
          ],
        ),
      );
    }

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double extent = constraints.hasBoundedWidth ? constraints.maxWidth : _unboundedLength;

        return SizedBox(
          height: line,
          width: extent,
          child: Stack(
            clipBehavior: Clip.none,
            children: <Widget>[
              for (final MPSliderMark mark in ticks)
                if (mark.label != null)
                  PositionedDirectional(
                    start: fraction(mark.value) * extent - _box / 2,
                    width: _box,
                    top: 0,
                    height: line,
                    child: Center(child: mark.label),
                  ),
            ],
          ),
        );
      },
    );
  }
}
