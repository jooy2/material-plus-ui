/// A row of one-character slots: a PIN, a texted code, an invite key.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// What may be typed into a slot.
enum MPOtpFieldCharset {
  /// Digits. The default, because that is what a texted code is, and it is also
  /// what puts a number pad in front of a phone.
  numeric,

  /// Letters.
  alpha,

  /// Letters and digits.
  alphanumeric,

  /// Whatever the keyboard produces, for a licence key with punctuation in it.
  any,
}

/// How many slots a code may have. Two is the shortest thing worth splitting;
/// past twelve the row stops fitting a phone.
const int _minLength = 2;
const int _maxLength = 12;

/// A slot's box: the control height, to the pixel, so a code sits at the same
/// height as the fields above and below it, and narrower than it is tall, which
/// is what makes a row of them read as places for one character each.
const Map<MPSize, Size> _slotSize = <MPSize, Size>{
  MPSize.xs: Size(28, 32),
  MPSize.sm: Size(36, 40),
  MPSize.md: Size(48, 56),
  MPSize.lg: Size(56, 64),
  MPSize.xl: Size(64, 72),
};

/// Between the slots, a little wider at the rungs where the boxes are.
const Map<MPSize, double> _slotGap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// A slot's type, well above the control ladder: a code is read out loud off a
/// phone and typed with the other hand, and it is the one piece of text in a
/// form that should be larger than the label above it. Every rung is a real MD3
/// role.
MPTypeRole _slotText(MPTypescale typescale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return typescale.bodyLarge;
    case MPSize.sm:
      return typescale.titleMedium;
    case MPSize.md:
      return typescale.titleLarge;
    case MPSize.lg:
      return typescale.headlineSmall;
    case MPSize.xl:
      return typescale.headlineMedium;
  }
}

/// A row of one-character slots: a PIN, a texted verification code, an invite
/// key.
///
/// ```dart
/// MPOtpField(
///   label: const Text('Verification code'),
///   groupSize: 3,
///   onComplete: verify,
/// )
/// ```
///
/// One editor stands behind however many slots, so a paste spreads across them
/// from wherever the caret was, backspace steps back a box, a press anywhere
/// lands on the first empty slot, and a phone can offer the code straight from
/// the message it arrived in.
///
/// Each slot is Material's outlined text field cut down to one character: the
/// same `corner-extra-small`, the same hairline in `outline`, the same
/// two-pixel `primary` ring on the slot the next character goes into. The ring
/// is drawn inside the slot, so the slot does not grow as the focus moves along
/// the row and nothing beside it moves.
///
/// Controlled when [value] is given; left out, the field keeps the code itself,
/// starting at [initialValue].
class MPOtpField extends StatefulWidget {
  /// Creates a code field.
  const MPOtpField({
    this.length = 6,
    this.charset = MPOtpFieldCharset.numeric,
    this.mask = false,
    this.groupSize,
    this.separator = const Text('–'),
    this.value,
    this.initialValue,
    this.onChanged,
    this.onComplete,
    this.onValueInvalid,
    this.autoSubmit = false,
    this.label,
    this.description,
    this.errorMessage,
    this.name,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.autofocus = false,
    this.size,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    super.key,
  });

  /// How many characters the code has. Clamped to 2–12: a single box is an
  /// `MPTextField`, and past twelve the row stops fitting a phone.
  final int length;

  /// What may be typed. Anything rejected is dropped rather than shown, and
  /// [onValueInvalid] reports it.
  final MPOtpFieldCharset charset;

  /// Hides the characters, the way a password field does.
  final bool mask;

  /// Splits the row every [groupSize] slots with a [separator]. `3` on a
  /// six-digit code gives the familiar two blocks of three.
  final int? groupSize;

  /// What is drawn between two groups. Punctuation inside one value, so it is
  /// kept off the semantics tree.
  final Widget separator;

  /// The code. Given, the field is controlled: it shows this and reports what
  /// it should become through [onChanged].
  final String? value;

  /// The code an uncontrolled field starts with.
  final String? initialValue;

  /// Called on every change. The React build's `onValueChange`.
  final ValueChanged<String>? onChanged;

  /// Called once every slot is filled: the moment to verify the code.
  final ValueChanged<String>? onComplete;

  /// Called with what was typed or pasted when it held characters [charset]
  /// rejects. A slot that silently swallows a keystroke is a slot the reader
  /// thinks is broken.
  final ValueChanged<String>? onValueInvalid;

  /// Submits the `MPForm` the field is in as soon as the code is complete.
  final bool autoSubmit;

  /// The label above the row, usually a [Text].
  ///
  /// Above it rather than in a notch, which is the one place this control
  /// departs from `MPTextField`'s shell. A notched label belongs to *one*
  /// outlined box; a code is six of them, and cutting the notch into the first
  /// would name the first digit rather than the field.
  final Widget? label;

  /// The line under the row. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the row, whose presence is also what puts the field
  /// into its error state.
  final Widget? errorMessage;

  /// The name an `MPForm` files the code under.
  final String? name;

  /// The form must have a complete code before it submits.
  final bool required;

  /// Greys every slot out and stops them taking input.
  final bool disabled;

  /// Readable and copyable, but not typeable.
  final bool readOnly;

  /// Puts the caret in the first slot as the field is inserted.
  final bool autofocus;

  /// Which rung: the slot's box, its type and the gap between slots.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Lets the field, and the line under it, take the width it is given. The
  /// slots keep their own size either way.
  final bool fullWidth;

  /// The field's name for a screen reader, for a field with no visible label.
  final String? semanticLabel;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  @override
  State<MPOtpField> createState() => _MPOtpFieldState();
}

class _MPOtpFieldState extends State<MPOtpField> {
  late final MPFieldText _text = MPFieldText(value: _current, onCommit: () {});
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();
  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => _current,
    validate: () {
      if (widget.readOnly || !widget.required || _current.length >= _slots) {
        return null;
      }

      return mpMessagesOf(context, mpCommonMessages)['required'];
    },
    focus: _focusAtEnd,
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  late String _own = widget.initialValue ?? '';
  FocusNode? _ownedFocus;
  bool _focused = false;
  bool _hovered = false;

  FocusNode get _focusNode => widget.focusNode ?? (_ownedFocus ??= FocusNode());

  bool get _controlled => widget.value != null;

  String get _current => _controlled ? widget.value! : _own;

  int get _slots => widget.length.clamp(_minLength, _maxLength);

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocus);
    _text.controller.addListener(_onSelection);
  }

  @override
  void didUpdateWidget(MPOtpField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownedFocus)?.removeListener(_onFocus);
      _focusNode.addListener(_onFocus);
    }

    _text.value = _current;
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocus);
    _ownedFocus?.dispose();
    _text.dispose();
    _form.dispose();
    super.dispose();
  }

  void _onFocus() {
    if (_focused == _focusNode.hasFocus) {
      return;
    }

    setState(() => _focused = _focusNode.hasFocus);

    if (!_focused) {
      _form.blurred();
    }
  }

  /// The caret moved, which moves the ring.
  void _onSelection() {
    if (mounted) {
      setState(() {});
    }
  }

  void _onChanged(String text) {
    if (!_controlled) {
      _own = text;
    }

    _form.changed();
    widget.onChanged?.call(text);
    _text.answered(() => _current);

    if (text.characters.length == _slots) {
      widget.onComplete?.call(text);

      if (widget.autoSubmit) {
        _form.submitForm();
      }
    }
  }

  /// A press anywhere in the row puts the caret after the last character, which
  /// is where the next one lands whatever was pressed, and asks for the
  /// keyboard. A read-only row takes the focus and opens no keyboard.
  void _focusAtEnd() {
    if (_disabled) {
      return;
    }

    mpTapEditor(_editor);
    _text.controller.selection = TextSelection.collapsed(offset: _text.controller.text.length);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final bool disabled = _disabled;
    final Size box = _slotSize[size]!;
    final MPTypeRole type = _slotText(theme.typescale, size);
    final int slots = _slots;
    final int every = widget.groupSize != null && widget.groupSize! > 0 ? widget.groupSize! : 0;

    _form.bind(context, name: widget.name, disabled: disabled);

    final Widget? error = widget.errorMessage ?? _textOrNull(_form.error);
    final bool invalid = error != null;
    final String text = _text.controller.text;
    final List<String> characters = text.characters.toList();
    final int caret = characters.length.clamp(0, slots - 1);
    final Duration duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;

    final List<Widget> row = <Widget>[];

    for (int index = 0; index < slots; index++) {
      if (every > 0 && index > 0 && index % every == 0) {
        // Punctuation inside one value, not a break between two things: a
        // reader that announced it once per group would be reading out the
        // shape of the box instead of the code in it.
        row.add(
          ExcludeSemantics(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: DefaultTextStyle.merge(
                style: type.style(MPFieldPaint.muted(colors, disabled: disabled)),
                child: widget.separator,
              ),
            ),
          ),
        );
      }

      // The slot the next character goes into: `focus` and not
      // `focus-visible`, since a slot is put in focus by pressing it as often
      // as by typing into it, and the ring is the only thing saying where the
      // next keystroke lands.
      final bool active = _focused && index == caret && !widget.readOnly && !disabled;
      final Color edge = active
          ? colors.primary
          : disabled
          ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer)
          : invalid
          ? colors.error
          : widget.readOnly
          ? colors.outlineVariant
          : _hovered
          ? colors.onSurface
          : colors.outline;

      row.add(
        ExcludeSemantics(
          // Sized outside the animation: the colours ease, the box does not, so
          // a field given a new size takes it at once.
          child: SizedBox.fromSize(
            size: box,
            child: AnimatedContainer(
              duration: duration,
              curve: MPMotion.standard,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
                // The second pixel of the ring is inside the slot rather than a
                // thicker box, so the slot does not grow as the focus arrives.
                border: Border.all(color: edge, width: active ? 2 : 1),
              ),
              child: Text(
                index < characters.length ? (widget.mask ? '•' : characters[index]) : '',
                style: type.style(MPFieldPaint.value(colors, disabled: disabled)),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
      );
    }

    // The editor is laid out over the row and painted at zero opacity: a text
    // input has to be in the tree and measured to hold a connection to the
    // platform. The press over the row owns every press, and what a reader sees
    // is the boxes.
    final Widget editor = IgnorePointer(
      child: Opacity(
        opacity: 0,
        child: MPEditorArrows(
          editor: _editor,
          child: EditableText(
            key: _editor,
            controller: _text.controller,
            focusNode: _focusNode,
            readOnly: widget.readOnly || disabled,
            autofocus: widget.autofocus,
            keyboardType: widget.charset == MPOtpFieldCharset.numeric
                ? TextInputType.number
                : TextInputType.text,
            // What lets a phone offer the code straight from the message.
            autofillHints: disabled ? null : const <String>[AutofillHints.oneTimeCode],
            autocorrect: false,
            enableSuggestions: false,
            obscureText: widget.mask,
            inputFormatters: <TextInputFormatter>[
              _CharsetFormatter(charset: widget.charset, onRejected: widget.onValueInvalid),
              LengthLimitingTextInputFormatter(slots),
            ],
            onChanged: _onChanged,
            style: type.style(colors.onSurface),
            cursorColor: invalid ? colors.error : colors.primary,
            backgroundCursorColor: colors.onSurfaceVariant,
            showSelectionHandles: false,
            enableInteractiveSelection: false,
          ),
        ),
      ),
    );

    Widget slotRow = Stack(
      children: <Widget>[
        Row(mainAxisSize: MainAxisSize.min, spacing: _slotGap[size]!, children: row),
        Positioned.fill(
          // A disabled field leaves the focus order. In the tree either way, so
          // the editor is kept as `disabled` changes.
          child: ExcludeFocus(excluding: disabled, child: editor),
        ),
      ],
    );

    slotRow = MouseRegion(
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.text,
      onEnter: (PointerEnterEvent event) => setState(() => _hovered = true),
      onExit: (PointerExitEvent event) => setState(() => _hovered = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: disabled ? null : _focusAtEnd,
        child: TextFieldTapRegion(child: slotRow),
      ),
    );

    final Color labelInk = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : invalid
        ? colors.error
        : colors.onSurfaceVariant;

    final Widget column = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: mpStackGap[size]!,
      children: <Widget>[
        if (widget.label != null)
          // A `semanticLabel` is the name in its place, so the drawn words are
          // not read after it.
          ExcludeSemantics(
            excluding: widget.semanticLabel != null,
            child: DefaultTextStyle.merge(
              style: theme.typescale.bodySmall.style(labelInk),
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
        slotRow,
        MPSupportingText(description: widget.description, errorMessage: error, disabled: disabled),
      ],
    );

    return Semantics(
      container: true,
      textField: true,
      readOnly: widget.readOnly,
      enabled: !disabled,
      obscured: widget.mask,
      label: widget.semanticLabel,
      // The code itself is what a screen reader reads back: the boxes are a
      // drawing of it.
      value: widget.mask ? '•' * characters.length : text,
      focused: _focused,
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      // The editor is painted at zero opacity, which takes it off the semantics
      // tree, so the focus and the action that gives it are declared here.
      onTap: disabled ? null : _focusAtEnd,
      onFocus: disabled ? null : () => mpFocusEditor(_editor, focus: _focusAtEnd),
      child: widget.fullWidth
          ? SizedBox(width: double.infinity, child: column)
          : IntrinsicWidth(child: column),
    );
  }

  Widget? _textOrNull(String? message) => message == null ? null : Text(message);
}

/// Drops what the charset refuses, and reports what was attempted.
///
/// A `FilteringTextInputFormatter` would do the dropping and nothing else, and
/// a refusal that disappears silently is the worst thing a code field does: the
/// reader presses a key, sees nothing, and concludes the field is broken.
class _CharsetFormatter extends TextInputFormatter {
  const _CharsetFormatter({required this.charset, this.onRejected});

  final MPOtpFieldCharset charset;
  final ValueChanged<String>? onRejected;

  static final RegExp _numeric = RegExp('[0-9]');
  static final RegExp _alpha = RegExp('[A-Za-z]');
  static final RegExp _alphanumeric = RegExp('[A-Za-z0-9]');

  RegExp? get _allowed {
    switch (charset) {
      case MPOtpFieldCharset.numeric:
        return _numeric;
      case MPOtpFieldCharset.alpha:
        return _alpha;
      case MPOtpFieldCharset.alphanumeric:
        return _alphanumeric;
      case MPOtpFieldCharset.any:
        return null;
    }
  }

  @override
  TextEditingValue formatEditUpdate(TextEditingValue before, TextEditingValue after) {
    final RegExp? allowed = _allowed;

    if (allowed == null) {
      return after;
    }

    final StringBuffer kept = StringBuffer();
    bool rejected = false;

    for (final String character in after.text.characters) {
      if (allowed.hasMatch(character)) {
        kept.write(character);
      } else {
        rejected = true;
      }
    }

    if (!rejected) {
      return after;
    }

    onRejected?.call(after.text);

    final String text = kept.toString();

    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
