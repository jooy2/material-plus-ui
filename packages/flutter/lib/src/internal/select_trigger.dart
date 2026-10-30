/// The field-shaped button a select, a colour picker and a tree select open
/// their popup from.
///
/// The React package draws it twice: once in `MPSelect`, with a chevron, and
/// once as `internal/Picker.tsx`'s shell, with a clear × instead, for the
/// pickers. Both are `MPTextField`'s shell to the pixel, the notched outline,
/// the label in the notch and the supporting text under it, wearing a button
/// where the editor would be. Here the two are one widget, because what tells
/// them apart is only what stands at the end of the row.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Whether [event] is a key that presses a button: Enter, the numpad's, or
/// Space, going down.
bool mpIsPressKey(KeyEvent event) {
  return event is KeyDownEvent &&
      (event.logicalKey == LogicalKeyboardKey.enter ||
          event.logicalKey == LogicalKeyboardKey.numpadEnter ||
          event.logicalKey == LogicalKeyboardKey.space);
}

/// A trigger, its popup, and the line of text under it.
///
/// The trigger is one button node for a screen reader, named by the label in
/// the notch and carrying what it holds as its value, `expanded` while the
/// popup is up. The focus stays on it while the popup is open unless the popup
/// takes it, so a list whose keys are the trigger's can be walked without the
/// focus ever leaving the field.
class MPSelectTrigger extends StatefulWidget {
  /// Creates a trigger of [size] that opens [popup].
  const MPSelectTrigger({
    required this.size,
    required this.open,
    required this.popup,
    required this.onPressed,
    required this.onDismiss,
    this.display,
    this.placeholder,
    this.samples = const <String>[],
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.startIcon,
    this.startIconPins = true,
    this.endIcon,
    this.onClear,
    this.clearLabel,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.fullWidth = false,
    this.anchorWidth = MPAnchorWidth.atLeast,
    this.anchorInside = false,
    this.onKey,
    this.onKeyEvent,
    this.onFocusChange,
    this.semanticLabel,
    this.semanticValue,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The rung.
  final MPSize size;

  /// Whether the popup is up.
  final bool open;

  /// What hangs off the trigger while [open].
  final Widget popup;

  /// A press on the trigger, by pointer, by Enter or Space, or from a screen
  /// reader. Not called while disabled or read-only.
  final VoidCallback onPressed;

  /// A press outside the popup, the system back, or Escape.
  final VoidCallback onDismiss;

  /// What the trigger reads, or `null` while nothing is held, which shows
  /// [placeholder] instead.
  final Widget? display;

  /// Shown while nothing is held, once a floating label is out of its way.
  final Widget? placeholder;

  /// Every string the trigger could read, so a trigger that is not full width
  /// holds the width of the widest rather than changing with its value.
  final List<String> samples;

  /// The label in the notch.
  final Widget? label;

  /// Whether the label may rest on the trigger's line.
  final bool floatingLabel;

  /// The line under the trigger.
  final Widget? description;

  /// The message under the trigger, which also puts it in its error state.
  final Widget? errorMessage;

  /// Content before the value.
  final Widget? startIcon;

  /// Whether [startIcon] holds the label up, as an icon standing where a
  /// resting label would does. Off for a mark that is the value drawn, a
  /// colour picker's swatch, which gives its place up to the resting label and
  /// comes back with it.
  final bool startIconPins;

  /// What stands at the end of the row: a select's chevron.
  final Widget? endIcon;

  /// Empties the control. Passing it is what puts the × at the end of the row.
  final VoidCallback? onClear;

  /// The ×'s name for a screen reader. Defaults to the word for "clear" in
  /// the locale in force.
  final String? clearLabel;

  /// Marks the trigger required, with the asterisk and to a screen reader.
  final bool required;

  /// Greys the trigger out and stops it opening.
  final bool disabled;

  /// Shows the value and stays in the focus order, without opening.
  final bool readOnly;

  /// Fills the width it is given.
  final bool fullWidth;

  /// How the popup's width follows the trigger's.
  final MPAnchorWidth anchorWidth;

  /// Whether a press on the trigger while the popup is up reaches the trigger
  /// rather than closing the popup: for a trigger with a × in it that clears
  /// the value while the popup stays up.
  final bool anchorInside;

  /// The component's own keys, heard after [onKeyEvent] and before Enter and
  /// Space press the trigger.
  final KeyEventResult Function(KeyEvent event)? onKey;

  /// The caller's, which hears every key first and takes it by returning
  /// [KeyEventResult.handled].
  final FocusOnKeyEventCallback? onKeyEvent;

  /// The trigger took or lost the focus.
  final ValueChanged<bool>? onFocusChange;

  /// The trigger's name for a screen reader, in the label's place.
  final String? semanticLabel;

  /// What the trigger holds, as a screen reader says it. Given, the drawn
  /// [display] is kept out of the node, which would otherwise read it a second
  /// time as part of the name.
  final String? semanticValue;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPSelectTrigger> createState() => _MPSelectTriggerState();
}

class _MPSelectTriggerState extends State<MPSelectTrigger> {
  FocusNode? _ownNode;
  bool _focused = false;

  FocusNode get _node =>
      widget.focusNode ?? (_ownNode ??= FocusNode(debugLabel: 'MPSelectTrigger'));

  bool get _usable => !widget.disabled && !widget.readOnly;

  @override
  void dispose() {
    _ownNode?.dispose();
    super.dispose();
  }

  void _press() {
    if (_usable) {
      widget.onPressed();
    }
  }

  void _onFocusChange(bool focused) {
    if (_focused != focused) {
      setState(() => _focused = focused);
    }

    widget.onFocusChange?.call(focused);
  }

  KeyEventResult _onKeyEvent(FocusNode node, KeyEvent event) {
    // Theirs first, and theirs wins, as a React handler that prevents the
    // default does. The trigger's own keys are left until after it.
    final KeyEventResult theirs = widget.onKeyEvent?.call(node, event) ?? KeyEventResult.ignored;

    if (theirs != KeyEventResult.ignored) {
      return theirs;
    }

    final KeyEventResult own = widget.onKey?.call(event) ?? KeyEventResult.ignored;

    if (own != KeyEventResult.ignored) {
      return own;
    }

    if (mpIsPressKey(event) && _usable) {
      widget.onPressed();

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPFieldMetrics metrics = MPFieldMetrics.of(widget.size);
    final bool disabled = widget.disabled;
    final bool empty = widget.display == null;
    final bool invalid = widget.errorMessage != null;

    Widget trigger = MPInteractive(
      onTap: _press,
      enabled: !disabled,
      interactive: _usable,
      // Enter and Space are pressed below, after the caller and the component
      // have heard them: bound here they would be taken before either.
      shortcuts: const <ShortcutActivator, Intent>{},
      focusNode: _node,
      autofocus: widget.autofocus,
      focusSemantics: true,
      onFocusChange: _onFocusChange,
      cursor: _usable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        return MPFieldShell(
          size: widget.size,
          label: widget.label == null
              ? null
              : ExcludeSemantics(excluding: widget.semanticLabel != null, child: widget.label!),
          required: widget.required,
          floating: widget.floatingLabel,
          filled: !empty,
          // The open popup holds the label up: the focus may have moved into
          // it, and a label that fell back down then would be reporting an
          // empty field over a popup the reader is halfway through answering.
          pinned: widget.open || (widget.startIcon != null && widget.startIconPins),
          invalid: invalid,
          disabled: disabled,
          focused: _focused || widget.open,
          cursor: _usable ? SystemMouseCursors.click : SystemMouseCursors.basic,
          builder: (BuildContext context, MPFieldStatus status) {
            return _row(theme, metrics, status: status, empty: empty);
          },
        );
      },
    );

    trigger = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onKeyEvent: _onKeyEvent,
      child: trigger,
    );

    trigger = MPAnchoredPortal(
      open: widget.open,
      side: MPSide.bottom,
      align: MPAlign.start,
      offset: mpSelectListOffset,
      anchorWidth: widget.anchorWidth,
      anchorInside: widget.anchorInside,
      onDismiss: widget.onDismiss,
      popup: widget.popup,
      child: trigger,
    );

    final Widget field = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        trigger,
        MPSupportingText(
          description: widget.description,
          errorMessage: widget.errorMessage,
          disabled: disabled,
          padding: EdgeInsetsDirectional.symmetric(horizontal: metrics.padX),
        ),
      ],
    );

    // One node for the whole field, the trigger's: the label and the message
    // merge into it, and the focus the trigger's surface says is folded in.
    return Semantics(
      container: true,
      button: true,
      enabled: !disabled,
      readOnly: widget.readOnly ? true : null,
      expanded: widget.open,
      label:
          widget.semanticLabel ?? (widget.label == null ? mpTextWithin(widget.placeholder) : null),
      value: empty ? null : widget.semanticValue,
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      onTap: _usable ? widget.onPressed : null,
      child: widget.fullWidth ? field : IntrinsicWidth(child: field),
    );
  }

  Widget _row(
    MPThemeData theme,
    MPFieldMetrics metrics, {
    required MPFieldStatus status,
    required bool empty,
  }) {
    final MPColorScheme colors = theme.colors;
    final bool disabled = widget.disabled;
    final bool clear = widget.onClear != null && !empty && _usable;
    final TextStyle style = metrics
        .text(theme.typescale)
        .style(MPFieldPaint.value(colors, disabled: disabled));

    final Widget shown;

    if (!empty) {
      shown = ExcludeSemantics(excluding: widget.semanticValue != null, child: widget.display!);
    } else {
      // Withheld while a floating label rests in the same place: two greyed
      // strings in one box is not a hint. Kept off the node, which says it as
      // the trigger's name when there is no label to.
      shown = ExcludeSemantics(
        child: Visibility(
          visible: status.shrunk && widget.placeholder != null,
          maintainState: true,
          maintainAnimation: true,
          maintainSize: true,
          child: DefaultTextStyle.merge(
            style: TextStyle(color: MPFieldPaint.muted(colors, disabled: disabled)),
            child: widget.placeholder ?? const SizedBox.shrink(),
          ),
        ),
      );
    }

    Widget value = DefaultTextStyle.merge(
      style: style,
      maxLines: 1,
      softWrap: false,
      overflow: TextOverflow.ellipsis,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Align(alignment: AlignmentDirectional.centerStart, child: shown),
          // A full-width trigger takes its width from its container, so it
          // lays out no samples: every one would be work for nothing.
          if (!widget.fullWidth) MPWidthSizer(samples: widget.samples, style: style),
        ],
      ),
    );

    value = widget.fullWidth ? Expanded(child: value) : Flexible(child: value);

    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: metrics.padX,
        // The × brings its own round hit area, so it stands 4px off the edge
        // rather than a whole inline padding in: React's `end-1`.
        end: clear ? 4 : metrics.padX,
      ),
      child: Row(
        mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: <Widget>[
          if (widget.startIcon != null && (widget.startIconPins || status.shrunk)) ...<Widget>[
            MPFieldAdornment(
              size: widget.size,
              disabled: disabled,
              apart: false,
              child: widget.startIcon!,
            ),
            const SizedBox(width: MPFieldMetrics.gap),
          ],
          value,
          if (widget.endIcon != null) ...<Widget>[
            const SizedBox(width: MPFieldMetrics.gap),
            MPFieldAdornment(
              size: widget.size,
              disabled: disabled,
              apart: false,
              child: ExcludeSemantics(child: widget.endIcon!),
            ),
          ],
          if (clear) ...<Widget>[
            const SizedBox(width: 4),
            MPFieldIconButton(
              icon: const MPGlyph(MPGlyphShape.close),
              iconSize: metrics.icon,
              semanticLabel: widget.clearLabel ?? mpMessagesOf(context, mpCommonMessages)['clear']!,
              onPressed: widget.onClear,
              extent: 32,
            ),
          ],
        ],
      ),
    );
  }
}

/// A select's chevron, which turns over while the popup is open.
///
/// The one thing in the trigger that may turn: it is a glyph rather than a
/// label, so nothing about it is resampled.
class MPSelectChevron extends StatelessWidget {
  /// Creates a chevron of a field of [size].
  const MPSelectChevron({required this.size, required this.open, super.key});

  /// The field's rung, which sizes the glyph.
  final MPSize size;

  /// Whether to point it up.
  final bool open;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return AnimatedRotation(
      turns: open ? 0.5 : 0,
      duration: reduceMotion ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      child: MPGlyph(MPGlyphShape.chevron, size: MPFieldMetrics.of(size).icon),
    );
  }
}
