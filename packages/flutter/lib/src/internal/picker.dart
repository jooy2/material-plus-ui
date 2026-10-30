/// The shell the pickers wear: a field-shaped trigger with a popup hanging off
/// it.
///
/// Here rather than in one of the components for the reason the calendar is:
/// several components need it, and none of them should have to import
/// another. What it draws is deliberately not new: the trigger is
/// [MPFieldShell], the same notched outline an `MPTextField` and an
/// `MPNumberField` are drawn in, to the pixel. A form where the date field is a
/// different height, radius or outline weight from the text field beside it is
/// a form that looks assembled rather than designed.
///
/// ## The one thing the pickers do not offer
///
/// Typing a date into the trigger. Parsing a date out of free text is
/// locale-dependent in a way that cannot be done honestly without a date
/// library (`27/7/26` is three different days depending on who is reading it)
/// and a field that understands it in one place and not the next is worse than
/// one that never claimed to. So the trigger is a button, exactly as a
/// select's is, and the popup is where the answer comes from.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/calendar.dart';
import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The popup's room, one track tighter than a control's: 6, 8, 10, 12, 14.
///
/// A calendar is already a grid of forty-two padded cells; giving the sheet
/// around it a control's 16 as well would put 24 of nothing between the last
/// column and the edge. `MPCalendar` draws the same grid on a surface of its
/// own with the same room, so a standalone calendar and the identical one in a
/// picker's popup are not one track apart.
const Map<MPSize, double> mpPickerPopupPad = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// How far the popup stands off the trigger.
const double _standoff = 4;

/// The `startIcon` a picker is given when its caller says nothing, which the
/// picker swaps for its own glyph.
///
/// A widget of its own rather than `null`, because `null` is how a caller asks
/// for no glyph at all: the glyph stands exactly where a resting label would,
/// so taking it away is what lets a floating label rest. The React package
/// tells the two apart as `undefined` and `null`; Dart has one of those, so the
/// default is a constant this one recognises.
class MPPickerDefaultIcon extends StatelessWidget {
  /// The marker. It draws nothing; a picker draws its glyph in its place.
  const MPPickerDefaultIcon({super.key});

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

/// [icon] when the caller left the default in place, otherwise what they
/// gave, `null` included.
Widget? mpPickerStartIcon(Widget? given, MPGlyphShape icon, MPSize size) {
  return given is MPPickerDefaultIcon ? MPGlyph(icon, size: mpControlIcon[size]) : given;
}

/// Every distinct string a trigger could write, kept for as long as what
/// decides them says the same thing.
///
/// Twenty-five dates written out is cheap once and not cheap on every frame,
/// and every frame is what a range picker asks for: moving the pointer across
/// a calendar rebuilds the control to redraw the band.
class MPPickerSamples {
  Object? _key;
  List<String> _samples = const <String>[];

  /// The strings [write] makes of `displaySamples`, worked out again only when
  /// [key] changes. A record of the names, the caller's format and whatever
  /// else the writing reads is the key.
  List<String> of(Object key, String Function(DateTime date) write) {
    if (key != _key) {
      _key = key;
      _samples = <String>{for (final DateTime sample in displaySamples) write(sample)}.toList();
    }

    return _samples;
  }
}

/// A trigger, a label, the line of text under it, and a popup.
///
/// Everything about it that is visible is a decision already made elsewhere:
/// the notched outline, the label in the notch, the supporting text, the
/// disabled treatment, and the popup's `surfaceContainer` at elevation 2,
/// which is the sheet a menu and a popover are drawn on.
class MPPickerShell extends StatefulWidget {
  /// Creates a picker shell.
  const MPPickerShell({
    required this.size,
    required this.empty,
    required this.open,
    required this.onOpenChange,
    required this.popup,
    required this.formValue,
    this.display,
    this.emptyDisplay,
    this.semanticValue,
    this.placeholder,
    this.samples = const <String>[],
    this.clearable = false,
    this.onClear,
    this.clearLabel = 'Clear',
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.startIcon,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.onKeyEvent,
    this.onFocusChange,
    this.name,
    this.locale,
    super.key,
  });

  /// Which rung: the trigger's height and padding, the popup's room.
  final MPSize size;

  /// Nothing has been chosen yet, so the placeholder shows and the label may
  /// rest.
  final bool empty;

  /// Whether the popup is up.
  final bool open;

  /// Called when it should open or close.
  final ValueChanged<bool> onOpenChange;

  /// The panel that floats off the trigger.
  final Widget popup;

  /// The value as one string, `''` while nothing is chosen: what `required` is
  /// checked against and what an `MPForm` reports under [name].
  final String formValue;

  /// What the trigger reads while something is chosen.
  final Widget? display;

  /// What it reads while nothing is, once the label is out of the way: the
  /// [placeholder] when this is left out. A range picker's two halves, each
  /// with a placeholder of its own.
  final Widget? emptyDisplay;

  /// The same thing in words, for a screen reader: it goes on the node as its
  /// value, so the label names the field and the value says what is in it.
  final String? semanticValue;

  /// Shown in the trigger while nothing is chosen.
  final String? placeholder;

  /// Every string the display could hold, so the trigger stops changing width
  /// with its value. The placeholder is added to them.
  final List<String> samples;

  /// Offers the × that empties the control.
  final bool clearable;

  /// Called when that × is pressed.
  final VoidCallback? onClear;

  /// The ×'s name.
  final String clearLabel;

  /// The label in the outline's notch.
  final Widget? label;

  /// Whether the label rests on the trigger's line while there is nothing to
  /// make room for. Only takes effect with no [startIcon], which stands where a
  /// resting label would.
  final bool floatingLabel;

  /// The line under the control.
  final Widget? description;

  /// The message under the control, and the error state with it.
  final Widget? errorMessage;

  /// The glyph before the value, already resolved.
  final Widget? startIcon;

  /// Marks the picker required, to a screen reader and with an asterisk, and
  /// holds an `MPForm` back while nothing is chosen.
  final bool required;

  /// Greys the picker out and stops it opening.
  final bool disabled;

  /// Shows the value, stays focusable, and does not open.
  final bool readOnly;

  /// Fills the width it is given rather than hugging the widest thing it
  /// could say.
  final bool fullWidth;

  /// The trigger's name for a screen reader, in place of the label.
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// Hears every key the trigger itself does not answer.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called when the trigger takes or loses the focus.
  final ValueChanged<bool>? onFocusChange;

  /// The name an `MPForm` files the value under.
  final String? name;

  /// The language the "required" message is in.
  final String? locale;

  @override
  State<MPPickerShell> createState() => _MPPickerShellState();
}

class _MPPickerShellState extends State<MPPickerShell> {
  FocusNode? _ownTrigger;

  /// The popup's scope. Tab stops at its edges, where [_traverse] hands the
  /// focus on, as Base UI's popover lets the focus go.
  final FocusScopeNode _scope = FocusScopeNode(
    debugLabel: 'MPPicker popup',
    skipTraversal: true,
    traversalEdgeBehavior: TraversalEdgeBehavior.stop,
  );

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => widget.formValue,
    validate: () {
      if (widget.readOnly || !widget.required || widget.formValue.isNotEmpty) {
        return null;
      }

      return mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['required'];
    },
    focus: () => _trigger.requestFocus(),
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  bool _focused = false;

  FocusNode get _trigger => widget.focusNode ?? (_ownTrigger ??= FocusNode(debugLabel: 'MPPicker'));

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _usable => !_disabled && !widget.readOnly;

  @override
  void initState() {
    super.initState();
    _trigger.addListener(_onFocus);
    _scope.descendantsAreFocusable = widget.open;
  }

  @override
  void didUpdateWidget(MPPickerShell oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownTrigger)?.removeListener(_onFocus);
      _trigger.addListener(_onFocus);
    }

    // Any change to the value counts as the field changing for the form: it
    // clears an error the form was handed for it, and re-checks one that is
    // showing, so a message goes as soon as the field is put right.
    if (oldWidget.formValue != widget.formValue) {
      _form.changed();
    }

    if (oldWidget.open != widget.open) {
      if (!widget.open && _scope.hasFocus) {
        // Back to the trigger, the half of moving the focus that is easy to
        // forget: a popup that leaves the focus behind drops the reader at the
        // top of the screen.
        _trigger.requestFocus();
      }

      // Out of reach while it fades, so Tab cannot land in a popup that is
      // going. Set after the focus is handed back.
      _scope.descendantsAreFocusable = widget.open;
    }
  }

  @override
  void dispose() {
    _trigger.removeListener(_onFocus);
    _ownTrigger?.dispose();
    _scope.dispose();
    _form.dispose();
    super.dispose();
  }

  void _onFocus() {
    final bool focused = _trigger.hasFocus;

    if (focused == _focused) {
      return;
    }

    setState(() => _focused = focused);
    widget.onFocusChange?.call(focused);

    // Moving into the popup is not leaving the field.
    if (!focused && !widget.open) {
      _form.blurred();
    }
  }

  void _toggle() {
    if (!_usable) {
      return;
    }

    // A button takes the focus when it is pressed, which is what brings the
    // focus back here when the popup closes.
    _trigger.requestFocus();
    widget.onOpenChange(!widget.open);
  }

  /// Empties the control, closes the popup if it is up, and keeps the focus on
  /// the control.
  ///
  /// The × leaves the tree with the value it cleared. Holding the focus as it
  /// goes, it would hand it to whatever held it before and take the reader off
  /// the field they had just emptied.
  void _clear() {
    final bool held = _trigger.hasFocus && !_trigger.hasPrimaryFocus;

    widget.onClear?.call();

    if (widget.open) {
      widget.onOpenChange(false);
    }

    if (held) {
      _trigger.requestFocus();
    }
  }

  /// Tab inside the popup.
  ///
  /// Off the end the focus goes to whatever follows the trigger and the popup
  /// closes, as a focus leaving a Base UI popover closes it; off the start it
  /// goes back to the trigger and the popup stays.
  Object? _traverse({required bool forward}) {
    final FocusNode? current = FocusManager.instance.primaryFocus;
    final bool moved = current != null && (forward ? current.nextFocus() : current.previousFocus());

    if (moved) {
      return null;
    }

    _trigger.requestFocus();

    if (forward) {
      widget.onOpenChange(false);
      _trigger.nextFocus();
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = widget.size;
    final MPFieldMetrics metrics = MPFieldMetrics.of(size);
    final bool disabled = _disabled;
    final bool usable = _usable;

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final bool invalid = error != null;
    final bool showClear = widget.clearable && !widget.empty && usable;

    final Widget trigger = MPInteractive(
      focusNode: _trigger,
      autofocus: widget.autofocus,
      enabled: !disabled,
      interactive: usable,
      focusSemantics: true,
      cursor: usable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onTap: _toggle,
      builder: (BuildContext context, MPInteraction state) {
        return MPFieldShell(
          size: size,
          // A `semanticLabel` is the name in the label's place, so the drawn
          // words are not read after it.
          label: widget.label == null
              ? null
              : ExcludeSemantics(excluding: widget.semanticLabel != null, child: widget.label!),
          required: widget.required,
          floating: widget.floatingLabel,
          filled: !widget.empty,
          // The open popup is here because the focus moves into it, and the
          // label would otherwise fall back over a picker that is plainly
          // being answered.
          pinned: widget.open || widget.startIcon != null,
          invalid: invalid,
          disabled: disabled,
          focused: _focused && !widget.open,
          cursor: usable ? SystemMouseCursors.click : SystemMouseCursors.basic,
          builder: (BuildContext context, MPFieldStatus status) {
            return _row(theme, metrics, status, disabled: disabled, showClear: showClear);
          },
        );
      },
    );

    final Widget field = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        MPAnchoredPortal(
          open: widget.open,
          side: MPSide.bottom,
          align: MPAlign.start,
          offset: _standoff,
          onDismiss: () => widget.onOpenChange(false),
          // A press on the trigger reaches it rather than closing the popup on
          // its way down and going no further. The trigger closes the popup
          // itself, and the × inside it clears while the popup is up.
          anchorInside: true,
          fitWidth: true,
          popup: _PickerPopup(
            size: size,
            child: FocusScope(
              node: _scope,
              child: Actions(
                actions: <Type, Action<Intent>>{
                  NextFocusIntent: CallbackAction<NextFocusIntent>(
                    onInvoke: (NextFocusIntent intent) => _traverse(forward: true),
                  ),
                  PreviousFocusIntent: CallbackAction<PreviousFocusIntent>(
                    onInvoke: (PreviousFocusIntent intent) => _traverse(forward: false),
                  ),
                },
                child: widget.popup,
              ),
            ),
          ),
          child: Focus(
            canRequestFocus: false,
            skipTraversal: true,
            includeSemantics: false,
            onKeyEvent: widget.onKeyEvent,
            child: trigger,
          ),
        ),
        MPSupportingText(
          description: widget.description,
          errorMessage: error,
          disabled: disabled,
          padding: EdgeInsetsDirectional.symmetric(horizontal: metrics.padX),
        ),
      ],
    );

    // One node for the whole field: the label and the message merge into it,
    // so a screen reader reads the name, the value and the message as one
    // stop. The × is a node of its own inside it.
    return Semantics(
      container: true,
      button: true,
      enabled: !disabled,
      readOnly: widget.readOnly,
      label: widget.semanticLabel ?? (widget.label == null ? widget.placeholder : null),
      value: widget.semanticValue,
      expanded: widget.open,
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      onTap: usable ? _toggle : null,
      child: widget.fullWidth ? field : IntrinsicWidth(child: field),
    );
  }

  Widget _row(
    MPThemeData theme,
    MPFieldMetrics metrics,
    MPFieldStatus status, {
    required bool disabled,
    required bool showClear,
  }) {
    final MPColorScheme colors = theme.colors;
    final TextStyle style = metrics.text(theme.typescale).style();
    final bool empty = widget.empty;
    final Color ink = empty
        ? MPFieldPaint.muted(colors, disabled: disabled)
        : MPFieldPaint.value(colors, disabled: disabled);

    // Withheld while a floating label rests in the same place: what a picker
    // shows when it is empty is a hint, and two greyed strings in one box is
    // not a hint.
    final Widget shown = !empty
        ? widget.display ?? const SizedBox.shrink()
        : !status.shrunk
        ? const SizedBox.shrink()
        : widget.emptyDisplay ??
              (widget.placeholder == null ? const SizedBox.shrink() : Text(widget.placeholder!));

    final List<String> samples = <String>[...widget.samples, ?widget.placeholder];

    // The value over every value it could have been, kept off the semantics
    // tree: the samples are there to be measured and never read, and the value
    // is already on the node above.
    Widget value = ExcludeSemantics(
      child: DefaultTextStyle.merge(
        style: style.copyWith(color: ink),
        maxLines: 1,
        softWrap: false,
        overflow: TextOverflow.ellipsis,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            shown,
            if (!widget.fullWidth) MPWidthSizer(samples: samples, style: style),
          ],
        ),
      ),
    );

    value = widget.fullWidth ? Expanded(child: value) : Flexible(child: value);

    return Padding(
      // The × carries its own room, so it stands four from the end, and the
      // value stops four before it: the React trigger's `pe-10` and `end-1`.
      padding: EdgeInsetsDirectional.only(start: metrics.padX, end: showClear ? 4 : metrics.padX),
      child: Row(
        mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: <Widget>[
          if (widget.startIcon != null) ...<Widget>[
            MPFieldAdornment(
              size: metrics.size,
              disabled: disabled,
              apart: false,
              child: widget.startIcon!,
            ),
            const SizedBox(width: MPFieldMetrics.gap),
          ],
          value,
          if (showClear) ...<Widget>[
            const SizedBox(width: 4),
            MPFieldIconButton(
              icon: const MPGlyph(MPGlyphShape.close),
              iconSize: metrics.icon,
              semanticLabel: widget.clearLabel,
              onPressed: _clear,
              extent: 32,
            ),
          ],
        ],
      ),
    );
  }
}

/// The sheet the popup is drawn on.
class _PickerPopup extends StatelessWidget {
  const _PickerPopup({required this.size, required this.child});

  final MPSize size;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;

    // A dialog anchored to its trigger, as Base UI's popup is: a route of its
    // own to a screen reader.
    return Semantics(
      container: true,
      explicitChildNodes: true,
      scopesRoute: true,
      role: SemanticsRole.dialog,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.surfaceContainer,
          borderRadius: BorderRadius.circular(theme.shapes.medium),
          boxShadow: MPShadows.of(2),
        ),
        child: Padding(
          padding: EdgeInsets.all(mpPickerPopupPad[size]!),
          child: DefaultTextStyle.merge(
            style: mpProseText(theme.typescale, size).style(colors.onSurface),
            child: IconTheme.merge(
              data: IconThemeData(color: colors.onSurface),
              // Scrolls rather than overflowing on a screen smaller than the
              // popup: a range picker's two months beside a list of presets
              // are wider than a phone held upright, and the anchored portal
              // holds the popup to the room it has.
              child: SingleChildScrollView(
                primary: false,
                scrollDirection: Axis.horizontal,
                child: SingleChildScrollView(
                  primary: false,
                  // As wide as the widest thing in it, which is the calendar,
                  // rather than as wide as the screen: a footer that stretched
                  // would put its buttons at the far edge of the world.
                  child: IntrinsicWidth(child: child),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The row of shortcuts under a picker's panel.
///
/// A hairline above it rather than a gap, because the actions act on the panel
/// and a gap would read as a second popup stacked under the first.
class MPPickerFooter extends StatelessWidget {
  /// Creates a footer.
  const MPPickerFooter({required this.children, super.key});

  /// The actions, which are ordinary buttons, and perhaps a line of text before
  /// them.
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;

    return Container(
      padding: const EdgeInsets.only(top: 6),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.outlineVariant)),
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.end, spacing: 4, children: children),
    );
  }
}

/// The vertical hairline between a calendar and the clock beside it.
class MPPickerDivider extends StatelessWidget {
  /// Creates the hairline.
  const MPPickerDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: Container(width: 1, color: MPTheme.of(context).colors.outlineVariant),
    );
  }
}

/// A footer button: a text button, or a filled one for the button that closes
/// the popup, one rung down the ladder as the calendar's header is.
class MPPickerAction extends StatelessWidget {
  /// Creates a footer button.
  const MPPickerAction({
    required this.size,
    required this.color,
    required this.onPressed,
    required this.label,
    this.filled = false,
    this.disabled = false,
    super.key,
  });

  /// The picker's size, which the button takes one rung down.
  final MPSize size;

  /// The accent family.
  final MPColor color;

  /// What it does.
  final VoidCallback onPressed;

  /// What it says.
  final String label;

  /// The one filled button, which closes the popup.
  final bool filled;

  /// Unavailable: today, when today is out of bounds.
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    return MPButton(
      variant: filled ? MPVariant.filled : MPVariant.text,
      size: mpCalendarHeaderSize[size],
      color: color,
      disabled: disabled,
      onPressed: onPressed,
      child: Text(label),
    );
  }
}
