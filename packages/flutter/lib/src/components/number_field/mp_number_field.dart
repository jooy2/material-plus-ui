/// A Material Design field that only holds a number.
library;

import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/text_selection.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// How long a held stepper waits before it starts repeating.
///
/// The pause is what tells a press from a hold. A press steps once when it is
/// released, the way every other button in the library fires; only a press that
/// outlasts this becomes a run of steps.
const Duration _repeatDelay = Duration(milliseconds: 400);

/// How often a held stepper fires after the pause.
const Duration _repeatInterval = Duration(milliseconds: 60);

/// A stepper's side, per rung: `size-6` to `size-12`.
const Map<MPSize, double> _stepperExtent = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 32,
  MPSize.md: 40,
  MPSize.lg: 44,
  MPSize.xl: 48,
};

/// The inline padding on the side a stepper stands at: the stepper brings its
/// own hit area, and the shell's padding on top of it would leave the button
/// floating in a gap. `pe-1`, `px-1`.
const double _stepperEdge = 4;

/// Where the two steppers sit.
///
/// There is deliberately no stacked pair of half-height chevrons. At `xs` each
/// would be under three pixels tall, and a target that small is a target
/// nobody hits.
enum MPNumberFieldSteppers {
  /// Both at the trailing edge, the way a spinner has always looked.
  end,

  /// Minus at the start, plus at the end, with the number between them. For a
  /// quantity that is nudged rather than typed.
  split,

  /// No buttons. It is still a number field: the arrow keys, the clamping and
  /// the formatting all stay.
  none,
}

/// Steps the value.
class _StepIntent extends Intent {
  const _StepIntent(this.direction, {this.amount = _StepAmount.normal});

  final int direction;
  final _StepAmount amount;
}

/// Jumps to an end of the range.
class _EdgeIntent extends Intent {
  const _EdgeIntent(this.toEnd);

  final bool toEnd;
}

/// Home or End, taken only while the range has that end, as Base UI takes
/// them. Otherwise the key goes on to the editor and moves the caret.
class _EdgeAction extends Action<_EdgeIntent> {
  _EdgeAction(this._state);

  final _MPNumberFieldState _state;

  @override
  bool isEnabled(_EdgeIntent intent) {
    return (intent.toEnd ? _state.widget.max : _state.widget.min) != null;
  }

  @override
  Object? invoke(_EdgeIntent intent) {
    _state._edge(intent.toEnd);

    return null;
  }
}

/// Which of the three steps a key press asked for.
enum _StepAmount { small, normal, large }

/// When a value the field writes is reported through
/// [MPNumberField.onValueCommitted].
enum _CommitWhen {
  /// Every time, changed or not: leaving the field, Enter, and the release of a
  /// press on a stepper.
  always,

  /// Only when the value changed: a key step, Home, End and the wheel.
  changed,

  /// Never: a repeat of a held stepper, which settles on its release.
  never,
}

/// A Material Design field that only holds a number.
///
/// ```dart
/// MPNumberField(
///   label: const Text('Quantity'),
///   value: quantity,
///   min: 1,
///   max: 20,
///   onChanged: (double? next) => setState(() => quantity = next),
/// )
/// ```
///
/// The shell is `MPTextField`'s, to the pixel: the same notched outline, the
/// same label in the notch, the same supporting text, because a form where the
/// quantity box is a different height or radius from the boxes around it is a
/// form that looks assembled rather than designed.
///
/// What is added on top is a real numeric control. The arrow keys and the
/// steppers move by [step] (Shift for [largeStep], Alt for [smallStep]),
/// Page Up and Page Down by [largeStep], Home and End go to the ends of the
/// range, a held stepper repeats, the value clamps to [min] and [max] when it
/// settles, and [format] writes it as currency or a percentage while the value
/// stays a plain number.
///
/// Controlled when [value] is given, `null` included, which is an empty field;
/// left out, the field keeps its own number, starting at [initialValue].
class MPNumberField extends StatefulWidget {
  /// Creates a number field.
  const MPNumberField({
    this.value = double.nan,
    this.initialValue,
    this.onChanged,
    this.onValueCommitted,
    this.min,
    this.max,
    this.step = 1,
    this.largeStep = 10,
    this.smallStep = 0.1,
    this.allowWheelScrub = false,
    this.format,
    this.parse,
    this.locale,
    this.steppers = MPNumberFieldSteppers.end,
    this.incrementLabel,
    this.decrementLabel,
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.placeholder,
    this.startIcon,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.name,
    this.size,
    this.fullWidth = false,
    this.onKeyEvent,
    this.onFocusChange,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  }) : assert(step > 0, 'step must be positive');

  /// The number, `null` for an empty field. Given, the field is controlled:
  /// it shows this and reports what it should become through [onChanged].
  ///
  /// Left out, it defaults to a marker that is not a number, and the field
  /// keeps a number of its own, starting at [initialValue].
  final double? value;

  /// The number an uncontrolled field starts at.
  final double? initialValue;

  /// Called on every change: a keystroke, a step, the wheel. The React build's
  /// `onValueChange`.
  ///
  /// What it reports while a number is being typed is what has been typed, not
  /// what it will settle to: `5` on the way to `50` is not out of a range that
  /// starts at ten, it is half finished. The clamp happens when the field
  /// settles.
  final ValueChanged<double?>? onChanged;

  /// Called when the value settles: on blur after typing, on release after a
  /// press, and together with [onChanged] for the keyboard and the wheel.
  final ValueChanged<double?>? onValueCommitted;

  /// The bottom of the range. Stepping stops here.
  final double? min;

  /// The top of the range.
  final double? max;

  /// How far one step goes.
  final double step;

  /// The step taken while Shift is held.
  final double largeStep;

  /// The step taken while Alt is held.
  final double smallStep;

  /// Whether the wheel changes the value while the field is focused and the
  /// pointer is over it.
  ///
  /// Off by default: a page that scrolls under the pointer and a field that
  /// changes under it are the same gesture, and only one of them was meant.
  final bool allowWheelScrub;

  /// How a settled number is written: a currency mark, a unit, a fixed number
  /// of decimal places.
  ///
  /// A function where the React build takes `Intl.NumberFormat` options,
  /// because the Dart SDK has no `Intl` and this package has no dependencies.
  /// Left out, a whole number is written without a decimal point and anything
  /// else as Dart writes it.
  final String Function(double value)? format;

  /// How typed text is read back, the other half of [format].
  ///
  /// Left out, everything but digits, a sign and a decimal point is dropped and
  /// the rest is parsed, which is what keeps `$1,240` typeable in a field that
  /// formats as currency.
  final double? Function(String text)? parse;

  /// Which language the steppers are named in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Where the steppers sit, or [MPNumberFieldSteppers.none] for a field
  /// without them.
  final MPNumberFieldSteppers steppers;

  /// The increment button's name. Defaults to the word for it in [locale].
  final String? incrementLabel;

  /// The decrement button's name.
  final String? decrementLabel;

  /// The label, drawn in the outline's notch and, while the field holds no
  /// number and has nothing standing at its start, resting on the field's own
  /// line. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the field's line while there is nothing to make
  /// room for. `false` pins it in the notch. A [startIcon], or split steppers
  /// whose minus stands in the same place, holds it up regardless.
  final bool floatingLabel;

  /// The line under the field. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the field, which also turns the field over to its
  /// error state.
  final Widget? errorMessage;

  /// Shown while the field is empty. With a floating label it is held back
  /// until the label has risen out of its way.
  final String? placeholder;

  /// Content placed before the number: a currency mark, a unit, an icon.
  final Widget? startIcon;

  /// Marks the field required. Inside an `MPForm`, an empty required field
  /// holds the submit back.
  final bool required;

  /// Greys the field out, stops it taking input, and drops the steppers.
  final bool disabled;

  /// Shows the number without allowing edits, and drops the steppers: leaving
  /// them there disabled would be two ways of saying the same thing, and the
  /// disabled one is the one that looks broken.
  final bool readOnly;

  /// The name an `MPForm` files the value under.
  final String? name;

  /// Which rung of the size ladder. [MPSize.md] unless an [MPConfigProvider]
  /// says otherwise.
  final MPSize? size;

  /// Fills the width it is given rather than taking about twenty characters'
  /// worth.
  final bool fullWidth;

  /// Hears every key pressed in the field before the field does anything with
  /// it. Returning [KeyEventResult.handled] takes the key. The React build's
  /// `onKeyDown` and `onKeyUp`.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called with `true` when the field takes the focus and `false` when it
  /// loses it. The settle a blur causes still happens.
  final ValueChanged<bool>? onFocusChange;

  /// The field's name for a screen reader, for a field with no visible label.
  final String? semanticLabel;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPNumberField> createState() => _MPNumberFieldState();
}

class _MPNumberFieldState extends State<MPNumberField> {
  late final TextEditingController _controller;
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();
  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => _value,
    validate: () {
      if (widget.readOnly || !widget.required || _read(_controller.text) != null) {
        return null;
      }

      return mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['required'];
    },
    focus: () => _focusNode.requestFocus(),
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  FocusNode? _ownedFocus;
  Timer? _repeat;
  bool _focused = false;

  /// The number an uncontrolled field holds.
  double? _own;

  /// Whether the stepper being held has repeated, which makes its release the
  /// moment the value settles rather than one more step.
  bool _repeated = false;

  /// Whether a change has been reported that has not settled since: text typed
  /// into the box, or the repeats of a held stepper before its release.
  bool _unsettled = false;

  /// Whether the box holds text typed into it since the field last wrote it.
  ///
  /// A value handed in while the field is focused is written into the box
  /// unless this holds: a value written over typed text would move the caret
  /// out from under the finger between two keystrokes.
  bool _typed = false;

  /// The value as far as the field knows it: the last one handed in, or the
  /// last one it reported, whichever came later, until the frame after a
  /// report brings the parent's answer.
  double? _held;

  FocusNode get _focusNode => widget.focusNode ?? (_ownedFocus ??= FocusNode());

  bool get _controlled => !(widget.value?.isNaN ?? false);

  /// The number the field holds, whoever keeps it.
  double? get _value => _controlled ? widget.value : _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _editable => !widget.readOnly && !_disabled;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  void initState() {
    super.initState();
    _own = widget.initialValue;
    _held = _value;
    _controller = TextEditingController(text: _write(_held));
    _focusNode.addListener(_onFocusChanged);
  }

  @override
  void didUpdateWidget(MPNumberField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownedFocus)?.removeListener(_onFocusChanged);
      _focusNode.addListener(_onFocusChanged);
    }

    if (!_controlled) {
      return;
    }

    final double? old = oldWidget.value;
    final bool changed = old == null || old.isNaN ? true : widget.value != old;

    if (!changed) {
      return;
    }

    _held = widget.value;

    // A value handed in from outside is written into the box, focused or not,
    // unless the box holds text being typed. That settles when the field is
    // left.
    if (!(_focused && _typed)) {
      _show(widget.value);
    }
  }

  @override
  void dispose() {
    _repeat?.cancel();
    _focusNode.removeListener(_onFocusChanged);
    _ownedFocus?.dispose();
    _controller.dispose();
    _form.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    if (_focused == _focusNode.hasFocus) {
      return;
    }

    _focused = _focusNode.hasFocus;
    widget.onFocusChange?.call(_focused);

    if (!_focused) {
      _form.blurred();
    }

    // Leaving the field is what settles it: the text is read, clamped and
    // written back, so a box holding `007` or nothing at all comes back saying
    // what the field holds. A read-only or disabled field is left as it is.
    if (!_focused && _editable) {
      if (!_typed && !_unsettled) {
        _show(_held);

        return;
      }

      final double? raw = _read(_controller.text);
      final double? next = raw == null ? null : _settle(raw);

      if (_unsettled || next != _held) {
        _commit(raw);
      } else {
        _show(next);
      }
    }
  }

  /// Writes [value] into the box as a settled value is written, with the caret
  /// at the end.
  void _show(double? value) {
    final String text = _write(value);

    _typed = false;

    if (_controller.text != text) {
      _controller.value = TextEditingValue(
        text: text,
        selection: TextSelection.collapsed(offset: text.length),
      );
    }
  }

  String _write(double? value) {
    if (value == null || value.isNaN) {
      return '';
    }

    if (widget.format != null) {
      return widget.format!(value);
    }

    return value == value.roundToDouble() && value.abs() < 1e15
        ? value.toStringAsFixed(0)
        : '$value';
  }

  double? _read(String text) {
    if (widget.parse != null) {
      return widget.parse!(text);
    }

    // Everything a number is written *with* rather than *as*: a thousands
    // separator, a currency mark and a unit all come off, and what is left is a
    // number or it is nothing.
    final String digits = text.replaceAll(RegExp(r'[^0-9.\-]'), '');

    return digits.isEmpty ? null : double.tryParse(digits);
  }

  /// The value held inside the range.
  double _settle(double value) {
    double next = value;

    if (widget.min != null && next < widget.min!) {
      next = widget.min!;
    }

    if (widget.max != null && next > widget.max!) {
      next = widget.max!;
    }

    return next;
  }

  /// Settles [raw] into the box, reports it through `onChanged` if the value
  /// changed, and through `onValueCommitted` as [when] says.
  void _commit(double? raw, {_CommitWhen when = _CommitWhen.always}) {
    final double? next = raw == null ? null : _settle(raw);
    // Measured against what the field knows rather than the parent's value,
    // which a second key in the same frame would find still holding the value
    // before the first.
    final bool changed = next != _held;

    _show(next);

    if (changed) {
      _held = next;
      _unsettled = true;
      _own = next;
      _form.changed();
      widget.onChanged?.call(next);
    }

    if (when == _CommitWhen.always || (when == _CommitWhen.changed && changed)) {
      _unsettled = false;
      widget.onValueCommitted?.call(next);
    }

    _takeAnswer(show: true);
  }

  /// After the frame that builds the parent's answer to a report, holds the
  /// value the parent holds, and with [show] writes it into the box: a number
  /// the parent turned down is not left on screen.
  void _takeAnswer({required bool show}) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (!mounted) {
        return;
      }

      _held = _value;

      if (show) {
        _show(_value);
      }
    });
    WidgetsBinding.instance.ensureVisualUpdate();
  }

  void _step(
    int direction, {
    _StepAmount amount = _StepAmount.normal,
    _CommitWhen when = _CommitWhen.always,
  }) {
    if (!_editable) {
      return;
    }

    final double by = switch (amount) {
      _StepAmount.small => widget.smallStep,
      _StepAmount.normal => widget.step,
      _StepAmount.large => widget.largeStep,
    };

    final double? from = _read(_controller.text);

    // An empty field is given zero, held inside the range, rather than a step:
    // the first press of `+` on a blank quantity box puts something in it.
    if (from == null) {
      _commit(0, when: when);

      return;
    }

    // A step of 0.1 from 0.3 is 0.4 and not 0.30000000000000004. Rounded far
    // finer than any step anybody reads and coarse enough to swallow the
    // binary. Only a step is: a number typed in is kept as it was typed.
    _commit(double.parse((from + by * direction).toStringAsFixed(10)), when: when);
  }

  /// Home or End: an editable field goes to that end of the range.
  void _edge(bool toEnd) {
    final double? target = toEnd ? widget.max : widget.min;

    if (target != null && _editable) {
      _commit(target, when: _CommitWhen.changed);
    }
  }

  void _onTyped(String text) {
    // Reported as typed rather than as settled: see the note on `onChanged`.
    final double? typed = _read(text);

    _held = typed;
    _own = typed;
    _unsettled = true;
    _typed = true;
    _form.changed();
    widget.onChanged?.call(typed);

    // The box keeps what was typed until the field is left, whatever the
    // parent answers.
    _takeAnswer(show: false);
  }

  /// Which step the modifiers being held ask for, read off the keyboard so
  /// Shift held while pressing `+` means what it means with the up arrow.
  _StepAmount get _heldAmount {
    final HardwareKeyboard keyboard = HardwareKeyboard.instance;

    if (keyboard.isShiftPressed) {
      return _StepAmount.large;
    }

    return keyboard.isAltPressed ? _StepAmount.small : _StepAmount.normal;
  }

  /// Arms the repeat on a stepper that is being held. The step itself belongs
  /// to the press, which fires when it is released.
  void _arm(int direction) {
    final _StepAmount amount = _heldAmount;

    _repeat?.cancel();
    _repeated = false;
    _repeat = Timer(_repeatDelay, () {
      _repeat = Timer.periodic(_repeatInterval, (Timer timer) {
        _repeated = true;
        _step(direction, amount: amount, when: _CommitWhen.never);

        // Nothing more to add once the range has run out.
        final double? now = _read(_controller.text);

        if (now != null &&
            (direction > 0
                ? widget.max != null && now >= widget.max!
                : widget.min != null && now <= widget.min!)) {
          timer.cancel();
        }
      });
    });
  }

  /// A press coming down on a stepper. A mouse press brings the focus into the
  /// field, so the arrow keys carry on from the value the press leaves; a finger
  /// does not, since the focus would raise a keyboard over a field that was
  /// only being nudged.
  void _pressStepper(PointerDownEvent event, int direction) {
    final bool touchLike = switch (event.kind) {
      PointerDeviceKind.touch ||
      PointerDeviceKind.stylus ||
      PointerDeviceKind.invertedStylus => true,
      _ => false,
    };

    if (!touchLike && !_focusNode.hasFocus) {
      _focusNode.requestFocus();
    }

    _arm(direction);
  }

  /// Ends a hold. A hold that repeated settles here, once.
  void _release() {
    _repeat?.cancel();
    _repeat = null;

    if (_repeated) {
      _unsettled = false;
      widget.onValueCommitted?.call(_read(_controller.text));

      // Kept for the press that ends the hold, which arrives in the same
      // pointer event, and dropped after it.
      scheduleMicrotask(() => _repeated = false);
    }
  }

  /// A press on a stepper, which is a step unless it ended a hold that already
  /// repeated.
  void _tapStepper(int direction) {
    if (_repeated) {
      _repeated = false;

      return;
    }

    _step(direction, amount: _heldAmount);
  }

  bool _atEdge(int direction) {
    final double? value = _read(_controller.text);

    if (value == null) {
      return false;
    }

    return direction > 0
        ? widget.max != null && value >= widget.max!
        : widget.min != null && value <= widget.min!;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    final KeyEventResult theirs = widget.onKeyEvent?.call(node, event) ?? KeyEventResult.ignored;

    if (theirs != KeyEventResult.ignored) {
      return theirs;
    }

    // Enter settles the box, as Base UI commits on it.
    if (mpIsEnterDown(event) && (_typed || _unsettled)) {
      _commit(_read(_controller.text));
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = _size;
    final MPFieldMetrics metrics = MPFieldMetrics.of(size);
    final bool disabled = _disabled;
    final bool showSteppers =
        widget.steppers != MPNumberFieldSteppers.none && !widget.readOnly && !disabled;
    final bool split = showSteppers && widget.steppers == MPNumberFieldSteppers.split;

    _form.bind(context, name: widget.name, disabled: disabled);

    final Widget? error = widget.errorMessage ?? _textOrNull(_form.error);
    final bool invalid = error != null;
    final Map<String, String> words = mpMessagesOf(
      context,
      mpNumberFieldMessages,
      locale: widget.locale,
    );

    final Widget shell = ValueListenableBuilder<TextEditingValue>(
      valueListenable: _controller,
      builder: (BuildContext context, TextEditingValue value, Widget? child) {
        return MPFieldShell(
          size: size,
          label: widget.label == null
              ? null
              : ExcludeSemantics(excluding: widget.semanticLabel != null, child: widget.label!),
          required: widget.required,
          floating: widget.floatingLabel,
          filled: value.text.isNotEmpty,
          pinned: widget.startIcon != null || split,
          invalid: invalid,
          disabled: disabled,
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.text,
          onTap: disabled ? null : () => mpTapEditor(_editor),
          builder: (BuildContext context, MPFieldStatus status) {
            return _row(
              theme,
              metrics,
              status: status,
              empty: value.text.isEmpty,
              disabled: disabled,
              showSteppers: showSteppers,
              split: split,
              words: words,
            );
          },
        );
      },
    );

    Widget field = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        shell,
        MPSupportingText(
          description: widget.description,
          errorMessage: error,
          disabled: disabled,
          padding: EdgeInsetsDirectional.symmetric(horizontal: metrics.padX),
        ),
      ],
    );

    if (widget.allowWheelScrub) {
      field = Listener(onPointerSignal: _onWheel, child: field);
    }

    return Semantics(
      container: true,
      enabled: !disabled,
      label: widget.semanticLabel ?? (widget.label == null ? widget.placeholder : null),
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      onTap: _editable ? () => mpTapEditor(_editor) : null,
      onFocus: disabled ? null : () => mpFocusEditor(_editor),
      child: widget.fullWidth ? field : IntrinsicWidth(child: field),
    );
  }

  Widget? _textOrNull(String? message) => message == null ? null : Text(message);

  void _onWheel(PointerSignalEvent event) {
    // Focused *and* under the pointer: a wheel over a field nobody is typing in
    // belongs to the page under it.
    if (event is! PointerScrollEvent || !_focused || !_editable) {
      return;
    }

    final HardwareKeyboard keys = HardwareKeyboard.instance;

    // Control with the wheel is a pinch, which zooms the page.
    if (keys.isControlPressed) {
      return;
    }

    final Offset delta = event.scrollDelta;
    final bool sideways = delta.dx.abs() > delta.dy.abs();
    final bool shift = keys.isShiftPressed;
    final double turn = shift && sideways ? delta.dx : delta.dy;

    if (turn == 0 || (!shift && sideways)) {
      return;
    }

    final _StepAmount amount = keys.isAltPressed
        ? _StepAmount.small
        : shift
        ? _StepAmount.large
        : _StepAmount.normal;

    // Claimed through the resolver, so the page does not scroll on the same
    // turn and carry the field away from the pointer.
    GestureBinding.instance.pointerSignalResolver.register(event, (PointerSignalEvent _) {
      _step(turn > 0 ? -1 : 1, amount: amount, when: _CommitWhen.changed);
    });
  }

  Widget _row(
    MPThemeData theme,
    MPFieldMetrics metrics, {
    required MPFieldStatus status,
    required bool empty,
    required bool disabled,
    required bool showSteppers,
    required bool split,
    required Map<String, String> words,
  }) {
    final MPColorScheme colors = theme.colors;
    final TextStyle style = metrics
        .text(theme.typescale)
        .style(MPFieldPaint.value(colors, disabled: disabled))
        .copyWith(
          // Digits that change under a press should not move the ones beside
          // them.
          fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
        );
    final TextAlign align = split ? TextAlign.center : TextAlign.start;

    Widget editor = MPTextSelectionArea(
      editableKey: _editor,
      enabled: !disabled,
      builder: (BuildContext context, MPTextSelection selection) => EditableText(
        key: _editor,
        controller: _controller,
        focusNode: _focusNode,
        readOnly: widget.readOnly,
        autofocus: widget.autofocus,
        keyboardType: const TextInputType.numberWithOptions(signed: true, decimal: true),
        onChanged: _onTyped,
        textAlign: align,
        style: style,
        cursorColor: MPFieldPaint.caret(colors),
        backgroundCursorColor: colors.onSurfaceVariant,
        selectionColor: MPFieldPaint.selection(colors),
        selectionControls: selection.controls,
        contextMenuBuilder: selection.contextMenuBuilder,
        showSelectionHandles: selection.showHandles,
        onSelectionChanged: selection.onSelectionChanged,
        rendererIgnoresPointer: selection.rendererIgnoresPointer,
        enableInteractiveSelection: !disabled,
        stylusHandwritingEnabled: !disabled,
        autofillHints: disabled ? null : const <String>[],
        // Enter settles the field and keeps the focus in it.
        onEditingComplete: () {},
        onSubmitted: (String text) {
          if (_typed || _unsettled) {
            _commit(_read(text));
          }
        },
        cursorOpacityAnimates: true,
      ),
    );

    editor = ExcludeFocus(excluding: disabled, child: editor);

    editor = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onKeyEvent: _onKey,
      child: editor,
    );

    if (widget.placeholder != null) {
      editor = Stack(
        children: <Widget>[
          Positioned.fill(
            child: IgnorePointer(
              child: ExcludeSemantics(
                child: Visibility(
                  visible: empty && status.shrunk,
                  maintainState: true,
                  maintainAnimation: true,
                  maintainSize: true,
                  child: Text(
                    widget.placeholder!,
                    textAlign: align,
                    style: style.copyWith(color: MPFieldPaint.muted(colors, disabled: disabled)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
          ),
          editor,
        ],
      );
    }

    editor = MPEditorPress(
      onPress: disabled ? null : () => mpTapEditor(_editor),
      // Left and right leave the field at either end under directional
      // navigation. Up and down step it, below.
      child: MPEditorArrows(editor: _editor, vertical: false, child: editor),
    );

    // Bound inside the field, nearer the editor than the app's own text
    // shortcuts, which is what keeps the up arrow from moving the caret in a
    // box where it moves the number.
    editor = Shortcuts(
      shortcuts: const <ShortcutActivator, Intent>{
        SingleActivator(LogicalKeyboardKey.arrowUp): _StepIntent(1),
        SingleActivator(LogicalKeyboardKey.arrowDown): _StepIntent(-1),
        SingleActivator(LogicalKeyboardKey.arrowUp, shift: true): _StepIntent(
          1,
          amount: _StepAmount.large,
        ),
        SingleActivator(LogicalKeyboardKey.arrowDown, shift: true): _StepIntent(
          -1,
          amount: _StepAmount.large,
        ),
        SingleActivator(LogicalKeyboardKey.arrowUp, alt: true): _StepIntent(
          1,
          amount: _StepAmount.small,
        ),
        SingleActivator(LogicalKeyboardKey.arrowDown, alt: true): _StepIntent(
          -1,
          amount: _StepAmount.small,
        ),
        SingleActivator(LogicalKeyboardKey.pageUp): _StepIntent(1, amount: _StepAmount.large),
        SingleActivator(LogicalKeyboardKey.pageDown): _StepIntent(-1, amount: _StepAmount.large),
        SingleActivator(LogicalKeyboardKey.home): _EdgeIntent(false),
        SingleActivator(LogicalKeyboardKey.end): _EdgeIntent(true),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          _StepIntent: CallbackAction<_StepIntent>(
            onInvoke: (_StepIntent intent) {
              // Under directional navigation an arrow with nothing left to step
              // moves the focus that way instead.
              if (intent.amount == _StepAmount.normal &&
                  mpArrowsMoveFocus(context) &&
                  (!_editable || _atEdge(intent.direction))) {
                _focusNode.focusInDirection(
                  intent.direction > 0 ? TraversalDirection.up : TraversalDirection.down,
                );

                return null;
              }

              _step(intent.direction, amount: intent.amount, when: _CommitWhen.changed);

              return null;
            },
          ),
          _EdgeIntent: _EdgeAction(this),
        },
        child: editor,
      ),
    );

    editor = widget.fullWidth
        ? Expanded(key: const ValueKey<String>('editor'), child: editor)
        : SizedBox(
            key: const ValueKey<String>('editor'),
            width: metrics.controlWidth,
            child: editor,
          );

    Widget stepper(int direction) {
      final bool atEdge = _atEdge(direction);

      // A held stepper repeats, which is the difference between a spinner and
      // two buttons: nobody presses `+` forty times.
      return Listener(
        onPointerDown: atEdge ? null : (PointerDownEvent event) => _pressStepper(event, direction),
        onPointerUp: (PointerUpEvent event) => _release(),
        onPointerCancel: (PointerCancelEvent event) => _release(),
        child: MPFieldIconButton(
          icon: MPGlyph(direction > 0 ? MPGlyphShape.plus : MPGlyphShape.minus),
          iconSize: metrics.icon,
          semanticLabel: direction > 0
              ? widget.incrementLabel ?? words['increase']!
              : widget.decrementLabel ?? words['decrease']!,
          // A stepper that has run out of room is disabled, which a reader can
          // see before they press it.
          onPressed: atEdge ? null : () => _tapStepper(direction),
          extent: _stepperExtent[metrics.size]!,
          focusable: false,
        ),
      );
    }

    return Padding(
      // The shell keeps its padding only on a side with no stepper.
      padding: EdgeInsetsDirectional.only(
        start: split ? _stepperEdge : metrics.padX,
        end: showSteppers ? _stepperEdge : metrics.padX,
      ),
      child: Row(
        mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
        spacing: MPFieldMetrics.gap,
        children: <Widget>[
          if (split) stepper(-1),
          if (widget.startIcon != null)
            MPFieldAdornment(size: metrics.size, disabled: disabled, child: widget.startIcon!),
          editor,
          if (showSteppers && !split)
            Row(mainAxisSize: MainAxisSize.min, children: <Widget>[stepper(-1), stepper(1)]),
          if (split) stepper(1),
        ],
      ),
    );
  }
}
