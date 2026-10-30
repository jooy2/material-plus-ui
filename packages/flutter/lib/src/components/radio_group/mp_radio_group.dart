/// A Material Design radio group: a set of options where exactly one is chosen.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/roving.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The ring: 16, 18, 20, 22, 24. A radio is 20dp where a checkbox is 18dp,
/// and that is the specification's own number: a circle inscribed in a square
/// looks smaller than the square, so the two have to differ to look the same
/// size in a column.
const Map<MPSize, double> _ring = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 18,
  MPSize.md: 20,
  MPSize.lg: 22,
  MPSize.xl: 24,
};

/// The dot inside it. MD3's is exactly half the ring, which is what makes a
/// chosen radio read as a ring *containing* something rather than as a smaller
/// ring. `sm` and `lg` round up to the next even number so the dot lands on the
/// pixel grid, as the React build's do.
const Map<MPSize, double> _dot = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 12,
};

/// The ring's stroke.
const double _edge = 2;

/// One option in an [MPRadioGroup].
///
/// It has no `size` and no `color` of its own. Both come from the group, which
/// is the only place they can be set once and mean the same thing for every
/// option.
class MPRadio extends StatelessWidget {
  /// Creates an option worth [value].
  const MPRadio({
    required this.value,
    this.label,
    this.description,
    this.disabled = false,
    this.semanticLabel,
    super.key,
  });

  /// What this option is worth. Reported by the group's `onChanged`.
  final String value;

  /// The text beside the dot. Pressing it chooses the option.
  final Widget? label;

  /// The line under the label.
  final Widget? description;

  /// Unavailable, but still listed: the option exists, it just cannot be
  /// taken.
  final bool disabled;

  /// The option's name for a screen reader, in its label's place.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final _MPRadioGroupScope? group = _MPRadioGroupScope.maybeOf(context);
    final int index = _MPRadioSlot.indexOf(context);

    // Outside a group there is no set for the option to be one of, so it
    // draws itself unchosen and does nothing, which is what a radio with no
    // name does in a browser.
    if (group == null) {
      return _RadioView(
        option: this,
        size: MPConfigProvider.maybeOf(context)?.size ?? MPSize.md,
        accent: MPTheme.of(context).colors.accent(MPColor.primary),
        invalid: false,
        selected: false,
        disabled: true,
        readOnly: false,
        onPressed: null,
        focusable: false,
        focusNode: null,
        autofocus: false,
      );
    }

    final bool disabled = group.disabled || this.disabled;
    final bool stop = index == group.stopIndex;

    return _RadioView(
      option: this,
      size: group.size,
      accent: group.accent,
      invalid: group.invalid,
      selected: group.value == value,
      disabled: disabled,
      readOnly: group.readOnly,
      onPressed: disabled || group.readOnly ? null : () => group.onSelect(index, value),
      focusable: stop,
      focusNode: stop ? group.stop : null,
      autofocus: stop && group.autofocus,
    );
  }
}

/// A Material Design radio group: a set of options where exactly one is chosen.
///
/// ```dart
/// MPRadioGroup(
///   label: const Text('Delivery'),
///   value: delivery,
///   onChanged: (String next) => setState(() => delivery = next),
///   children: const <Widget>[
///     MPRadio(value: 'standard', label: Text('Standard')),
///     MPRadio(value: 'express', label: Text('Express')),
///   ],
/// )
/// ```
///
/// The set takes **one** focus stop and the arrow keys move the choice within
/// it, which is what a radio group is and what hand-rolled ones almost always
/// get wrong. The stop rests on the chosen option, or on the first one that
/// can be reached while nothing is chosen.
///
/// The options are children rather than a list of values, because a radio
/// option is a block, a label and a description laid out down the page, and
/// what a caller wants to vary is its content. Each entry in [children] is one
/// option: an [MPRadio], or an [MPRadio] inside padding or alignment, which the
/// group sees through.
///
/// Controlled with [value] and [onChanged], or left to hold its own choice
/// from [initialValue].
class MPRadioGroup extends StatefulWidget {
  /// Creates a radio group over [children].
  const MPRadioGroup({
    required this.children,
    this.value,
    this.initialValue,
    this.onChanged,
    this.label,
    this.description,
    this.errorMessage,
    this.orientation = MPOrientation.vertical,
    this.size,
    this.color,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The options, usually [MPRadio]s.
  final List<Widget> children;

  /// The chosen value. Given, the group is controlled.
  ///
  /// `null` cannot also mean "controlled, with nothing chosen", so a
  /// controlled group with nothing chosen yet holds its own choice until the
  /// first one, reports it through [onChanged], and is controlled from then on.
  final String? value;

  /// The value chosen at the start, for a group that holds its own choice.
  final String? initialValue;

  /// Called with the newly chosen value.
  final ValueChanged<String>? onChanged;

  /// The question the options answer, read before the first option.
  final Widget? label;

  /// The line under the options. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the options. Its presence is also what turns the group
  /// over into its error state.
  final Widget? errorMessage;

  /// Which way the options stack. A column is scannable at any length; a row
  /// silently stops being readable the moment one label is longer than
  /// expected.
  final MPOrientation orientation;

  /// The dots' size and the labels' type role, for every option at once.
  final MPSize? size;

  /// Which accent family the chosen option is drawn in.
  final MPColor? color;

  /// Marks the group required.
  final bool required;

  /// Greys every option out and stops the set taking input.
  final bool disabled;

  /// Shows the choice without allowing it to be changed. The arrows still move
  /// the focus stop, so each option can be reached and heard.
  final bool readOnly;

  /// The group's name for a screen reader, in [label]'s place.
  final String? semanticLabel;

  /// The focus stop, which moves with the choice.
  final FocusNode? focusNode;

  /// Puts the focus on the stop as the group is inserted.
  final bool autofocus;

  @override
  State<MPRadioGroup> createState() => _MPRadioGroupState();
}

class _MPRadioGroupState extends State<MPRadioGroup> with MPRovingStop<MPRadioGroup> {
  late String? _own = widget.initialValue;

  /// The option the arrows or a press last put the stop on, or `null` while
  /// it rests on the chosen one.
  int? _highlight;

  @override
  FocusNode? get callerStop => widget.focusNode;

  String? get _value => widget.value ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  @override
  void didUpdateWidget(MPRadioGroup oldWidget) {
    super.didUpdateWidget(oldWidget);
    keepStop(oldWidget.focusNode);
  }

  /// What each child is worth, read off the child itself: its value and
  /// whether it can be taken. `null` for a child that holds no [MPRadio] the
  /// group can see.
  List<MPRadio?> get _options => widget.children.map(_radioWithin).toList(growable: false);

  /// Which option the one focus stop rests on: the one the arrows last moved
  /// it to, otherwise the chosen one, or with nothing chosen the first one
  /// that can be reached. Which is the roving tab index, in a sentence.
  int _stopIndex(List<MPRadio?> options) {
    final int? highlight = _highlight;

    if (highlight != null && highlight < options.length && _reachable(options[highlight])) {
      return highlight;
    }

    final int chosen = options.indexWhere((MPRadio? option) => option?.value == _value);

    if (chosen >= 0 && _reachable(options[chosen])) {
      return chosen;
    }

    final int first = options.indexWhere(_reachable);

    return first < 0 ? 0 : first;
  }

  bool _reachable(MPRadio? option) => option != null && !option.disabled;

  void _select(int index, String value) {
    // Pressing the option that is already chosen changes nothing, so it is
    // reported as nothing.
    final bool changed = value != _value;

    keepStop(widget.focusNode);
    setState(() {
      _highlight = index;

      if (widget.value == null) {
        _own = value;
      }
    });

    if (changed) {
      widget.onChanged?.call(value);
    }
  }

  /// Moves the stop to the next option in [step]'s direction that can be
  /// taken, wrapping, and says whether there was one.
  ///
  /// In a live set the choice goes with it. In a read-only one only the stop
  /// moves. Under directional navigation the arrows are also the only way out
  /// of the set, so there the stop halts at either end instead of wrapping.
  bool _move(int step) {
    final List<MPRadio?> options = _options;

    if (_disabled || options.isEmpty) {
      return false;
    }

    final int count = options.length;
    final bool wraps = !mpArrowsMoveFocus(context);
    int index = _stopIndex(options);

    for (int tried = 0; tried < count; tried += 1) {
      index += step;

      if (wraps) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return false;
      }

      final MPRadio? option = options[index];

      if (_reachable(option)) {
        if (widget.readOnly) {
          keepStop(widget.focusNode);
          setState(() => _highlight = index);
        } else {
          _select(index, option!.value);
        }

        return true;
      }
    }

    return false;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final Axis axis = widget.orientation == MPOrientation.horizontal
        ? Axis.horizontal
        : Axis.vertical;

    if (mpArrowAcross(context, axis: axis, arrow: mpArrowAxis(event.logicalKey))) {
      return KeyEventResult.ignored;
    }

    // The horizontal arrows follow the writing direction, because a row of
    // options does: under right-to-left the next one is to the left.
    final int forward = Directionality.of(context) == TextDirection.rtl ? -1 : 1;

    return switch (event.logicalKey) {
      LogicalKeyboardKey.arrowDown => mpArrowResult(context, moved: _move(1)),
      LogicalKeyboardKey.arrowUp => mpArrowResult(context, moved: _move(-1)),
      LogicalKeyboardKey.arrowRight => mpArrowResult(context, moved: _move(forward)),
      LogicalKeyboardKey.arrowLeft => mpArrowResult(context, moved: _move(-forward)),
      _ => KeyEventResult.ignored,
    };
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final bool invalid = widget.errorMessage != null;
    final bool disabled = _disabled;
    final MPAccent accent = colors.accent(
      invalid ? MPColor.error : widget.color ?? config?.color ?? MPColor.primary,
    );
    final List<MPRadio?> options = _options;
    final Color meta = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurfaceVariant;

    final List<Widget> slots = <Widget>[
      for (int index = 0; index < widget.children.length; index += 1)
        _MPRadioSlot(index: index, child: widget.children[index]),
    ];

    final Widget run = widget.orientation == MPOrientation.horizontal
        ? Wrap(spacing: 24, runSpacing: 8, children: slots)
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: slots,
          );

    return _MPRadioGroupScope(
      size: size,
      accent: accent,
      invalid: invalid,
      disabled: disabled,
      readOnly: widget.readOnly,
      value: _value,
      stopIndex: _stopIndex(options),
      stop: stop,
      autofocus: widget.autofocus,
      onSelect: _select,
      child: Semantics(
        container: true,
        role: SemanticsRole.radioGroup,
        label: widget.semanticLabel ?? mpTextOf(widget.label),
        enabled: !disabled,
        readOnly: widget.readOnly,
        isRequired: widget.required ? true : null,
        validationResult: invalid
            ? SemanticsValidationResult.invalid
            : SemanticsValidationResult.none,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            if (widget.label != null)
              // Named on the group's own node above, so the words are drawn and
              // not read a second time. Beside the options rather than as a
              // flex item among them, so a row of options keeps its label on
              // top.
              ExcludeSemantics(
                excluding: widget.semanticLabel != null || mpTextOf(widget.label) != null,
                child: DefaultTextStyle.merge(
                  style: theme.typescale.bodySmall.style(meta),
                  child: widget.required
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Flexible(child: widget.label!),
                            const ExcludeSemantics(child: Text(' *')),
                          ],
                        )
                      : widget.label!,
                ),
              ),
            Focus(
              // The group takes no focus itself: the option holding the stop
              // does. This listens on the way past, which is what a key event
              // travelling up the focus chain from that option runs into.
              canRequestFocus: false,
              skipTraversal: true,
              onKeyEvent: _onKey,
              child: run,
            ),
            // Outside the run of options, so a screen reader moving from one
            // option to the next does not have to walk past it.
            if (widget.description != null || widget.errorMessage != null)
              MPSupportingLine(
                disabled: disabled,
                description: widget.description,
                errorMessage: widget.errorMessage,
              ),
          ],
        ),
      ),
    );
  }
}

/// The [MPRadio] inside [child], seen through the wrappers that only place a
/// widget, or `null` when there is none to see.
MPRadio? _radioWithin(Widget child) {
  final Widget current = child;

  if (current is MPRadio) {
    return current;
  }

  if (current is KeyedSubtree) {
    return _radioWithin(current.child);
  }

  if (current is SingleChildRenderObjectWidget && current.child != null) {
    return _radioWithin(current.child!);
  }

  if (current is ProxyWidget) {
    return _radioWithin(current.child);
  }

  return null;
}

/// What every option reads off the set around it.
class _MPRadioGroupScope extends InheritedWidget {
  const _MPRadioGroupScope({
    required this.size,
    required this.accent,
    required this.invalid,
    required this.disabled,
    required this.readOnly,
    required this.value,
    required this.stopIndex,
    required this.stop,
    required this.autofocus,
    required this.onSelect,
    required super.child,
  });

  final MPSize size;
  final MPAccent accent;
  final bool invalid;
  final bool disabled;
  final bool readOnly;
  final String? value;
  final int stopIndex;
  final FocusNode stop;
  final bool autofocus;
  final void Function(int index, String value) onSelect;

  static _MPRadioGroupScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPRadioGroupScope>();
  }

  @override
  bool updateShouldNotify(_MPRadioGroupScope oldWidget) {
    return size != oldWidget.size ||
        accent.color != oldWidget.accent.color ||
        invalid != oldWidget.invalid ||
        disabled != oldWidget.disabled ||
        readOnly != oldWidget.readOnly ||
        value != oldWidget.value ||
        stopIndex != oldWidget.stopIndex ||
        !identical(stop, oldWidget.stop) ||
        autofocus != oldWidget.autofocus ||
        onSelect != oldWidget.onSelect;
  }
}

/// Which entry of the group's children an option is.
class _MPRadioSlot extends InheritedWidget {
  const _MPRadioSlot({required this.index, required super.child});

  final int index;

  static int indexOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPRadioSlot>()?.index ?? -1;
  }

  @override
  bool updateShouldNotify(_MPRadioSlot oldWidget) => index != oldWidget.index;
}

/// One drawn option.
class _RadioView extends StatefulWidget {
  const _RadioView({
    required this.option,
    required this.size,
    required this.accent,
    required this.invalid,
    required this.selected,
    required this.disabled,
    required this.readOnly,
    required this.onPressed,
    required this.focusable,
    required this.focusNode,
    required this.autofocus,
  });

  final MPRadio option;
  final MPSize size;
  final MPAccent accent;
  final bool invalid;
  final bool selected;
  final bool disabled;
  final bool readOnly;
  final VoidCallback? onPressed;
  final bool focusable;
  final FocusNode? focusNode;
  final bool autofocus;

  @override
  State<_RadioView> createState() => _RadioViewState();
}

class _RadioViewState extends State<_RadioView> {
  /// Whether a mouse is over the ring itself, which is what the halo follows.
  bool _ringHovered = false;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size;
    final bool disabled = widget.disabled;
    final bool selected = widget.selected;
    final bool interactive = widget.onPressed != null;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double ring = _ring[size]!;
    final Color drained = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);

    // The ring takes the accent when it is chosen. Unlike a checkbox it is
    // never filled, because the fill is the dot.
    final Color edge = disabled
        ? drained
        : selected
        ? widget.accent.color
        : widget.invalid
        ? colors.error
        : colors.onSurfaceVariant;
    final Color dot = disabled ? drained : widget.accent.color;

    Widget mark(MPInteraction state) {
      final Widget circle = Container(
        width: ring,
        height: ring,
        alignment: Alignment.center,
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            SizedBox.square(
              dimension: ring,
              child: AnimatedContainer(
                duration: duration,
                curve: MPMotion.standard,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: edge, width: _edge),
                ),
              ),
            ),
            // Unlike the checkbox's tick this one starts at nothing. A tick is
            // a stroke and has to stay legible as it arrives; a dot is a disc,
            // and a disc at any size is still a disc, so it grows out of the
            // centre of the ring that is taking the accent round it.
            TweenAnimationBuilder<double>(
              tween: Tween<double>(end: selected ? 1 : 0),
              duration: duration,
              curve: MPMotion.standard,
              builder: (BuildContext context, double shown, Widget? child) {
                final double diameter = _dot[size]! * shown;

                return Container(
                  width: diameter,
                  height: diameter,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: dot.withValues(alpha: dot.a * shown),
                  ),
                );
              },
            ),
          ],
        ),
      );

      return MouseRegion(
        onEnter: (_) => setState(() => _ringHovered = true),
        onExit: (_) => setState(() => _ringHovered = false),
        child: MPSelectionHalo(
          diameter: mpSelectionHalo[size]!,
          color: selected ? widget.accent.color : colors.onSurface,
          opacity: disabled
              ? 0
              : mpStateLayerOpacity(
                  MPInteraction(
                    hovered: _ringHovered && interactive,
                    pressed: state.pressed,
                    focusVisible: state.focusVisible,
                  ),
                ),
          child: circle,
        ),
      );
    }

    final MPRadio option = widget.option;
    final bool hasText = option.label != null || option.description != null;

    return MergeSemantics(
      child: Semantics(
        container: true,
        inMutuallyExclusiveGroup: true,
        checked: selected,
        // Read-only is not disabled, for the reason the set gives: only the
        // tap action goes.
        enabled: !disabled,
        readOnly: widget.readOnly,
        label: option.semanticLabel,
        onTap: widget.onPressed,
        // The roving tab index, in one widget: every option answers the
        // pointer, and exactly one of them is in the focus order.
        child: ExcludeFocus(
          excluding: !widget.focusable,
          child: MPInteractive(
            onTap: widget.onPressed,
            interactive: interactive,
            enabled: !disabled,
            focusNode: widget.focusNode,
            autofocus: widget.autofocus,
            focusSemantics: true,
            cursor: interactive ? SystemMouseCursors.click : SystemMouseCursors.basic,
            builder: (BuildContext context, MPInteraction state) {
              return MPSelectionRow(
                line: MPSelectionText.lineOf(theme, size),
                extent: ring,
                control: mark(state),
                text: hasText
                    ? MPSelectionText(
                        size: size,
                        disabled: disabled,
                        label: option.label,
                        description: option.description,
                        excludeLabelSemantics: option.semanticLabel != null,
                      )
                    : null,
              );
            },
          ),
        ),
      ),
    );
  }
}
