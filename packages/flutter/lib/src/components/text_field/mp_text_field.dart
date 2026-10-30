/// A Material Design text field that survives an input method.
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
import 'package:material_plus_ui/src/internal/text_selection.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// The input modes a text field is built for.
///
/// [search] is here for the keyboard it summons rather than for anything
/// visual: the keyboard's action key reads "search" for it. The field draws
/// exactly as [text] does.
enum MPTextFieldType {
  /// Plain text.
  text,

  /// An email address: the keyboard with `@` on it, and no autocorrection.
  email,

  /// A password: the characters are hidden, and a reveal toggle grows in the
  /// trailing adornment. The one type that changes behaviour rather than only
  /// the keyboard.
  password,

  /// A search box: the keyboard's action key says "search".
  search,
}

/// A Material Design outlined text field that survives an input method.
///
/// ```dart
/// MPTextField(
///   label: const Text('Email'),
///   type: MPTextFieldType.email,
///   value: email,
///   onChanged: (String next) => setState(() => email = next),
/// )
/// ```
///
/// Drawn from Material Design 3's outlined text field tokens: `outline` at rest,
/// `onSurface` under the pointer, `primary` at two pixels on focus, `error`
/// while there is a message, and the specification's disabled opacities. The
/// label rests on the field's line while it is empty and rises into a notch cut
/// in the outline on focus or on the first character.
///
/// ## The composition problem
///
/// The field is **controlled**: it shows [value], and reports what the value
/// should become through [onChanged]. While an input method is composing
/// (Korean, Japanese, Chinese, and dead-key sequences in several European
/// layouts) the editor holds a provisional string the platform owns, and
/// writing a value over it in that moment ends the composition: the syllable
/// in progress is thrown away and the caret jumps. Anything the parent does to
/// the value in [onChanged] (trimming, upper-casing, validating, or simply
/// building again slowly) is enough to cause it.
///
/// So while a composition is running the field shows what is being composed
/// and holds [value] back. [onChanged] still fires for every keystroke, so the
/// parent sees the text as it is typed. When the composition ends the
/// committed text is reported, and the field shows [value] again. That is the
/// whole reason the component exists, and why [value] and [onChanged] are a
/// plain string rather than a `TextEditingController` a parent writes into.
class MPTextField extends StatefulWidget {
  /// Creates a text field showing [value].
  const MPTextField({
    required this.value,
    this.onChanged,
    this.name,
    this.type = MPTextFieldType.text,
    this.placeholder,
    this.autofillHints,
    this.label,
    this.semanticLabel,
    this.floatingLabel = true,
    this.required = false,
    this.disabled = false,
    this.autofocus = false,
    this.readOnly = false,
    this.disableEnterKey = false,
    this.errorMessage,
    this.rows,
    this.maxLength,
    this.startIcon,
    this.locale,
    this.passwordLabels,
    this.onSubmit,
    this.onFormReset,
    this.onKeyEvent,
    this.onFocusChange,
    this.size,
    this.fullWidth = false,
    this.focusNode,
    super.key,
  }) : assert(rows == null || rows > 0, 'rows must be positive');

  /// The field's text. What is shown is what is passed, except during a
  /// composition: see the class documentation.
  final String value;

  /// Called with the field's text on every change, including each keystroke of
  /// a composition in progress. The parent is free to normalise, truncate or
  /// reject what it is handed without the caret jumping mid-syllable.
  final ValueChanged<String>? onChanged;

  /// The name an `MPForm` files the value under, and finds the field's errors
  /// by.
  final String? name;

  /// Which keyboard to summon, and for [MPTextFieldType.password], the reveal
  /// toggle.
  final MPTextFieldType type;

  /// Shown while the field is empty.
  ///
  /// With a floating label it is held back until the label has risen out of
  /// its way, which is the moment the field is focused. Two greyed strings in
  /// one box is not a hint, it is a collision.
  final String? placeholder;

  /// What the platform's autofill should offer, from [AutofillHints]:
  /// `AutofillHints.email`, `AutofillHints.password`. The React build's
  /// `autoComplete`.
  final Iterable<String>? autofillHints;

  /// The label, drawn in the outline's notch and, while the field is empty,
  /// unfocused and has no [startIcon], resting on the field's own line where a
  /// placeholder would be. Usually a [Text]; the field gives it the label's
  /// type role and colour.
  final Widget? label;

  /// The field's name for a screen reader, for a field with no visible
  /// [label]: a filter box whose purpose the panel round it already shows. The
  /// React build's `aria-label`.
  final String? semanticLabel;

  /// Whether the label rests on the field's line while there is nothing to make
  /// room for, and rises into the notch on focus or on the first character.
  ///
  /// `false` pins it in the notch, which is the one thing a floating label
  /// costs: a field with a label and one without no longer sit at the same
  /// height in a form until both are filled. A [startIcon] holds the label up
  /// regardless, since the icon stands where the resting label would be.
  final bool floatingLabel;

  /// Marks the field required, to a screen reader and with an asterisk on the
  /// label. Inside an `MPForm` an empty required field holds the submit back.
  final bool required;

  /// Greys the field out and stops it taking input.
  final bool disabled;

  /// Focuses the field as it is inserted, except in a compact window, where it
  /// would raise the on-screen keyboard over the screen the reader has just
  /// arrived at.
  final bool autofocus;

  /// Shows the value without allowing edits. Unlike [disabled], the text stays
  /// selectable and the field stays in the focus order, which is what a value
  /// the reader may need to copy wants.
  final bool readOnly;

  /// Takes the Enter key away from whatever would otherwise have it.
  ///
  /// With [rows] that is the newline, which is the usual reason to reach for
  /// this: a multiline field wired to [onSubmit] where Enter should send rather
  /// than wrap. On a single-line field it is the `MPForm` the field is in,
  /// which Enter would otherwise submit.
  final bool disableEnterKey;

  /// The message under the field. Its presence is also what puts the field
  /// into its error state, so there is no way to show an error with no
  /// explanation.
  final String? errorMessage;

  /// Makes the field multiline, this many rows tall.
  final int? rows;

  /// Caps the number of characters the field will take.
  final int? maxLength;

  /// Content placed before the text, usually an icon. It takes
  /// `onSurfaceVariant` and the rung's glyph size from the field.
  final Widget? startIcon;

  /// Which language the reveal toggle's name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Overrides the two words the reveal toggle is announced by:
  /// `showPassword` and `hidePassword`.
  final Map<String, String>? passwordLabels;

  /// Called when Enter is pressed.
  ///
  /// On a single-line field the key is then taken, so an `MPForm` round the
  /// field is not also submitted. **Passing this is what makes the field take
  /// the key**: without it, Enter on a single-line field inside an `MPForm`
  /// submits the form, and anywhere else is left to the platform.
  ///
  /// On a multiline field the key is not taken, and both things happen: this
  /// runs *and* a newline is inserted. [disableEnterKey] makes Enter a
  /// submission there and nothing else.
  ///
  /// Never called for the Enter that commits an input method's composition:
  /// that keystroke belongs to the input method, not to the form. An
  /// [onKeyEvent] of yours runs first and can take the key.
  final VoidCallback? onSubmit;

  /// Called before every change, ahead of [onChanged]: for clearing a
  /// form-level error that a further edit has made stale.
  final VoidCallback? onFormReset;

  /// Hears every key pressed in the field before the field does anything with
  /// it. Returning [KeyEventResult.handled] takes the key: no submission is
  /// reported and the field does nothing further with it. The React build's
  /// `onKeyDown` and `onKeyUp`.
  ///
  /// It hears the Enter that commits a composition too, which is the caller's
  /// to interpret; the field still does not turn it into a submission.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called with `true` when the field takes the focus and `false` when it
  /// loses it. The control's own focus only: the reveal toggle taking the
  /// focus is not the field taking it. The React build's `onFocus` and
  /// `onBlur`.
  final ValueChanged<bool>? onFocusChange;

  /// Which rung of the size ladder. [MPSize.md], 56px and Material's own size,
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given rather than taking about twenty characters'
  /// worth.
  final bool fullWidth;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  @override
  State<MPTextField> createState() => _MPTextFieldState();
}

class _MPTextFieldState extends State<MPTextField> {
  late final MPFieldText _text = MPFieldText(value: widget.value, onCommit: _onCommit);
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();
  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => widget.value,
    validate: () {
      if (widget.readOnly || !widget.required || widget.value.isNotEmpty) {
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
  bool _focused = false;
  bool _showPassword = false;

  /// Whether a composition has just ended and the editor has not reported it
  /// as a change, which it does only when the commit changed the text.
  bool _committing = false;

  /// Whether the field took the focus as it arrived, decided once.
  bool? _autofocus;

  FocusNode get _focusNode => widget.focusNode ?? (_ownedFocus ??= FocusNode());

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _multiline => widget.rows != null;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocus);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Read once: `autofocus` describes how the field arrives, not something to
    // apply again whenever the window changes size.
    if (_autofocus == null) {
      final double width = MediaQuery.maybeSizeOf(context)?.width ?? 0;
      final bool compact =
          width > 0 && MPConfigProvider.of(context).windowClassOf(width) == MPWindowClass.compact;

      _autofocus = widget.autofocus && !compact;
    }
  }

  @override
  void didUpdateWidget(MPTextField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownedFocus)?.removeListener(_onFocus);
      _focusNode.addListener(_onFocus);
    }

    // Outside a composition the field is controlled, so a value the parent
    // changed on its own (a reset, a value from a server) is shown at once.
    // During one it is held until the composition ends.
    _text.value = widget.value;
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
    final bool focused = _focusNode.hasFocus;

    if (focused == _focused) {
      return;
    }

    _focused = focused;
    widget.onFocusChange?.call(focused);

    if (!focused) {
      _form.blurred();
    }
  }

  /// The editor changed its text, at the reader's hand.
  void _report(String text) {
    _committing = false;
    widget.onFormReset?.call();
    _form.changed();
    widget.onChanged?.call(text);
    // Shown as the parent answers, so a change it turned down does not stay on
    // screen. Held while a composition runs.
    _text.answered(() => widget.value);
  }

  /// A composition ended.
  ///
  /// The commit is a change like any other, but the editor reports it only
  /// when it changed the text, and a syllable often commits as exactly what was
  /// last composed. So it is reported here unless the editor reported it,
  /// which it does in the same turn, after this has been called and before the
  /// microtask runs. A parent that turned the composing text down, or replaced
  /// it while the composition ran, hears the committed text either way.
  void _onCommit() {
    _committing = true;
    mpAfterEdit(() => mounted, () {
      if (_committing) {
        _report(_text.controller.text);
      }
    });
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    // Theirs first, and theirs wins: a caller who answered this key (a
    // Ctrl+Enter that sends, an Escape that closes something) has said so.
    final KeyEventResult theirs = widget.onKeyEvent?.call(node, event) ?? KeyEventResult.ignored;

    if (theirs != KeyEventResult.ignored || !mpIsEnterDown(event)) {
      return theirs;
    }

    // Left alone while an input method composes: it is using Enter to commit
    // the syllable, and taking the key would take the commit away from it.
    if (_text.composing) {
      return KeyEventResult.ignored;
    }

    widget.onSubmit?.call();

    if (widget.disableEnterKey) {
      return KeyEventResult.handled;
    }

    // On a multiline field the answer is a newline, which only
    // `disableEnterKey` takes away.
    if (_multiline) {
      return KeyEventResult.ignored;
    }

    if (widget.onSubmit != null) {
      return KeyEventResult.handled;
    }

    // With no `onSubmit` the key is the form's, as Enter in an `<input>`
    // submits the `<form>` it is in.
    if (_form.inForm) {
      _form.submitForm();

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  /// The keyboard's action key, which on a touch screen is Enter.
  void _onSubmitted(String text) {
    if (widget.onSubmit != null) {
      widget.onSubmit!();
    } else if (!_multiline && !widget.disableEnterKey && _form.inForm) {
      _form.submitForm();
    }
  }

  /// Whether the field answers the action key itself, in which case it keeps
  /// the focus as a web field keeps it after Enter. Otherwise the platform's
  /// own answer stands: the keyboard goes away.
  bool get _answersAction => widget.onSubmit != null || widget.disableEnterKey || _form.inForm;

  TextInputType get _keyboard {
    if (_multiline) {
      return TextInputType.multiline;
    }

    switch (widget.type) {
      case MPTextFieldType.email:
        return TextInputType.emailAddress;
      case MPTextFieldType.password:
        return TextInputType.visiblePassword;
      case MPTextFieldType.text:
      case MPTextFieldType.search:
        return TextInputType.text;
    }
  }

  TextInputAction get _action {
    if (_multiline) {
      return widget.disableEnterKey ? TextInputAction.done : TextInputAction.newline;
    }

    return widget.type == MPTextFieldType.search ? TextInputAction.search : TextInputAction.done;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = _size;
    final MPFieldMetrics metrics = MPFieldMetrics.of(size);
    final bool disabled = _disabled;
    final bool multiline = _multiline;
    final bool password = widget.type == MPTextFieldType.password && !multiline;

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? own = widget.errorMessage == null || widget.errorMessage!.isEmpty
        ? null
        : widget.errorMessage;
    final String? error = own ?? _form.error;
    final bool invalid = error != null;
    final Map<String, String> words = mpMessagesOf(
      context,
      mpTextFieldMessages,
      locale: widget.locale,
      overrides: widget.passwordLabels,
    );

    final Widget shell = ValueListenableBuilder<TextEditingValue>(
      valueListenable: _text.controller,
      builder: (BuildContext context, TextEditingValue value, Widget? child) {
        return MPFieldShell(
          size: size,
          // A `semanticLabel` is the name in the label's place, so the drawn
          // words are not read after it.
          label: widget.label == null
              ? null
              : ExcludeSemantics(excluding: widget.semanticLabel != null, child: widget.label!),
          required: widget.required,
          floating: widget.floatingLabel,
          filled: value.text.isNotEmpty,
          pinned: widget.startIcon != null,
          invalid: invalid,
          disabled: disabled,
          multiline: multiline,
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.text,
          onTap: disabled ? null : () => mpTapEditor(_editor),
          builder: (BuildContext context, MPFieldStatus status) {
            return _row(
              theme,
              metrics,
              status: status,
              empty: value.text.isEmpty,
              disabled: disabled,
              password: password,
              words: words,
            );
          },
        );
      },
    );

    final Widget field = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        shell,
        MPSupportingText(
          errorMessage: error == null ? null : Text(error),
          disabled: disabled,
          padding: EdgeInsetsDirectional.only(start: metrics.padX, end: metrics.padX, top: 4),
        ),
      ],
    );

    // One node for the whole field. The editor's own says it is a text field,
    // whether it is read-only, what it holds and what can be done to it, and
    // merges into this one, which adds the name; the label and the message
    // merge in as well. Saying `textField` here too would split the field into
    // a named node that never takes the focus over one that holds the text.
    return Semantics(
      container: true,
      enabled: !disabled,
      label: widget.semanticLabel ?? (widget.label == null ? widget.placeholder : null),
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      // A screen reader's tap and focus, which the editor answers neither of on
      // its own. A read-only field takes the focus and no tap, as a Material
      // `TextField` does, and a disabled one takes neither.
      onTap: disabled || widget.readOnly ? null : () => mpTapEditor(_editor),
      onFocus: disabled ? null : () => mpFocusEditor(_editor),
      child: widget.fullWidth ? field : IntrinsicWidth(child: field),
    );
  }

  Widget _row(
    MPThemeData theme,
    MPFieldMetrics metrics, {
    required MPFieldStatus status,
    required bool empty,
    required bool disabled,
    required bool password,
    required Map<String, String> words,
  }) {
    final MPColorScheme colors = theme.colors;
    final bool multiline = _multiline;
    final TextStyle style = metrics
        .text(theme.typescale)
        .style(MPFieldPaint.value(colors, disabled: disabled));

    Widget control = MPTextSelectionArea(
      editableKey: _editor,
      enabled: !disabled,
      builder: (BuildContext context, MPTextSelection selection) => EditableText(
        key: _editor,
        controller: _text.controller,
        focusNode: _focusNode,
        // The caller's alone. A disabled field is still a text field to a screen
        // reader, as the React `<input disabled>` is; it takes no text because it
        // cannot take the focus, and the ways in that need none are shut below.
        readOnly: widget.readOnly,
        autofocus: _autofocus ?? false,
        obscureText: password && !_showPassword,
        autocorrect: widget.type == MPTextFieldType.text || widget.type == MPTextFieldType.search,
        enableSuggestions: widget.type != MPTextFieldType.password,
        keyboardType: _keyboard,
        textInputAction: _action,
        inputFormatters: <TextInputFormatter>[
          if (widget.maxLength != null) LengthLimitingTextInputFormatter(widget.maxLength),
        ],
        maxLines: multiline ? widget.rows : 1,
        minLines: multiline ? widget.rows : null,
        onChanged: _report,
        onSubmitted: _onSubmitted,
        onEditingComplete: _answersAction ? () {} : null,
        style: style,
        cursorColor: MPFieldPaint.caret(colors),
        backgroundCursorColor: colors.onSurfaceVariant,
        selectionColor: MPFieldPaint.selection(colors),
        // `EditableText` rather than a `TextField`, which is Material, so the
        // handles under a selection and the menu above it come from
        // `MPTextSelectionArea` instead.
        selectionControls: selection.controls,
        contextMenuBuilder: selection.contextMenuBuilder,
        showSelectionHandles: selection.showHandles,
        onSelectionChanged: selection.onSelectionChanged,
        rendererIgnoresPointer: selection.rendererIgnoresPointer,
        enableInteractiveSelection: !disabled,
        // A pen on an iPad and autofill both write into a field that does not
        // have the focus, so a disabled field opts out of both.
        stylusHandwritingEnabled: !disabled,
        autofillHints: disabled ? null : (widget.autofillHints ?? const <String>[]),
        cursorOpacityAnimates: true,
      ),
    );

    // A disabled field leaves the focus order. In the tree either way, so
    // turning `disabled` off does not build the editor again.
    control = ExcludeFocus(excluding: disabled, child: control);

    control = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onKeyEvent: _onKey,
      child: control,
    );

    if (widget.placeholder != null) {
      // Drawn under the text rather than by the editor, which has no notion of
      // one, and kept off the semantics tree: where it names the field, it does
      // so as the field's label, which stays once something is typed.
      control = Stack(
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
                    style: style.copyWith(color: MPFieldPaint.muted(colors, disabled: disabled)),
                    maxLines: multiline ? widget.rows : 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
          ),
          control,
        ],
      );
    }

    // A press on the text asks for the keyboard, as a press round it does;
    // the arrows leave the field under directional navigation.
    control = MPEditorPress(
      onPress: disabled ? null : () => mpTapEditor(_editor),
      child: MPEditorArrows(editor: _editor, child: control),
    );

    control = widget.fullWidth
        ? Expanded(child: control)
        : SizedBox(width: metrics.controlWidth, child: control);

    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: metrics.padX,
        // The toggle carries its own padding, so it stands a little into the
        // field's: React's `-me-1`.
        end: password ? metrics.padX - MPFieldMetrics.labelPad : metrics.padX,
        top: multiline ? MPFieldMetrics.multilinePadY : 0,
        bottom: multiline ? MPFieldMetrics.multilinePadY : 0,
      ),
      child: Row(
        mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
        spacing: MPFieldMetrics.gap,
        children: <Widget>[
          if (widget.startIcon != null)
            MPFieldAdornment(size: metrics.size, disabled: disabled, child: widget.startIcon!),
          control,
          if (password)
            MPFieldIconButton(
              icon: _VisibilityGlyph(crossed: !_showPassword),
              iconSize: metrics.icon,
              semanticLabel: _showPassword ? words['hidePassword']! : words['showPassword']!,
              onPressed: () => setState(() => _showPassword = !_showPassword),
              extent: metrics.icon + MPFieldMetrics.labelPad * 2,
              wash: false,
              disabled: disabled,
            ),
        ],
      ),
    );
  }
}

/// The reveal toggle's eye, open while the password shows and struck through
/// while it is hidden, as Material's `visibility` and `visibility_off` are.
///
/// Drawn here rather than in the library's glyph set because nothing else
/// draws an eye.
class _VisibilityGlyph extends StatelessWidget {
  const _VisibilityGlyph({required this.crossed});

  final bool crossed;

  @override
  Widget build(BuildContext context) {
    final IconThemeData icon = IconTheme.of(context);
    final double size = icon.size ?? 20;

    return CustomPaint(
      size: Size.square(size),
      painter: _VisibilityPainter(crossed: crossed, color: icon.color ?? const Color(0xFF000000)),
    );
  }
}

class _VisibilityPainter extends CustomPainter {
  const _VisibilityPainter({required this.crossed, required this.color});

  final bool crossed;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    // Drawn on a 16-unit square, the grid the library's own glyphs use.
    final double unit = size.width / 16;

    canvas.scale(unit);

    final Paint line = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;

    canvas
      ..drawPath(
        Path()
          ..moveTo(1.25, 8)
          ..quadraticBezierTo(8, -0.5, 14.75, 8)
          ..quadraticBezierTo(8, 16.5, 1.25, 8)
          ..close(),
        line,
      )
      ..drawCircle(const Offset(8, 8), 2.4, line);

    if (crossed) {
      canvas.drawLine(const Offset(2.5, 2.5), const Offset(13.5, 13.5), line);
    }
  }

  @override
  bool shouldRepaint(_VisibilityPainter oldDelegate) {
    return oldDelegate.crossed != crossed || oldDelegate.color != color;
  }
}
