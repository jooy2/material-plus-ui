/// A Material Design select: one value chosen from a list.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/list_reveal.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/select_trigger.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/types.dart';

/// What a select's value may be: a [String] or a [num].
///
/// Deliberately not generic over arbitrary objects. A select is a form
/// control, its value is what a form submits, and every escape from that
/// (object values, a custom equality, a stringifier for the trigger) buys
/// flexibility by making the common case harder to write. Keep the identifier
/// here and look the object up on the other side.
///
/// [Object] because Dart has no union type. Values are compared with `==`.
typedef MPSelectValue = Object;

/// Marks a value that was left out, which is what makes a select hold its own.
///
/// A value of its own rather than `null`, because `null` is a value a parent
/// can hold: nothing chosen.
const Object _unset = _Unset();

class _Unset {
  const _Unset();
}

/// One choice in an [MPSelect].
///
/// A description rather than a widget: the trigger has to say what is chosen
/// before the popup has ever been opened, so the select is told what it holds.
@immutable
class MPSelectOption {
  /// Creates an option worth [value].
  const MPSelectOption({required this.value, this.label, this.disabled = false});

  /// Submitted, and what `value` and `onChanged` speak in.
  final MPSelectValue value;

  /// Shown in the list and in the trigger, usually a [Text]. The value itself,
  /// written out, if it is left out.
  final Widget? label;

  /// Unavailable, but still listed: the option exists, it just cannot be
  /// taken.
  final bool disabled;
}

/// A Material Design select.
///
/// ```dart
/// MPSelect(
///   label: const Text('City'),
///   items: const <MPSelectOption>[
///     MPSelectOption(value: 'kr-11', label: Text('Seoul')),
///     MPSelectOption(value: 'jp-13', label: Text('Tokyo')),
///   ],
///   value: city,
///   onChanged: (MPSelectValue? next) => setState(() => city = next),
/// )
/// ```
///
/// The trigger is `MPTextField`'s shell wearing a chevron, and that is the
/// point: a form where the dropdown is a different height, radius or outline
/// weight from the fields around it is a form that looks assembled rather than
/// designed. The notched outline, the label in the notch and the supporting
/// text are the same widgets the field uses.
///
/// The popup is `surfaceContainer` at elevation 2. A chosen row is marked
/// with a tick as well as a fill, because a highlight is also what the
/// keyboard's cursor looks like, and a list where "chosen" and "where the
/// arrow keys are" are the same colour is a list nobody can read.
///
/// The focus stays on the trigger while the list is open. The arrow keys open
/// it and walk it, Home and End jump to its ends, Enter or Space takes the
/// highlighted row, typing jumps to the row a label starts with, and Escape,
/// Tab or a press outside closes it.
///
/// Controlled when [value] is given, `null` included, which is nothing chosen;
/// left out, the select keeps its own choice, starting at [initialValue].
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPSelect extends StatefulWidget {
  /// Creates a select over [items].
  const MPSelect({
    required this.items,
    this.value = _unset,
    this.initialValue,
    this.onChanged,
    this.placeholder,
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.startIcon,
    this.size,
    this.fullWidth = false,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.name,
    this.onKeyEvent,
    this.onFocusChange,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The options, as data.
  ///
  /// Every row is built, and there is no windowing. A few hundred rows is
  /// nothing; a few thousand is a visible pause when the list opens, and past
  /// that the answer is a narrower list rather than a faster one. Where it
  /// genuinely is that long, window it yourself and pass the slice.
  final List<MPSelectOption> items;

  /// The chosen value. Given, the select is controlled.
  ///
  /// **Nothing chosen is `null`.** A value with no matching entry in [items]
  /// has no label to show, so the trigger draws the value itself: a form
  /// holding `0` for "not picked yet" sits there reading `0`. That is the
  /// right answer for a value that is real and whose row has not arrived yet,
  /// and not the answer anybody wants for a sentinel.
  ///
  /// Left out, it defaults to a marker that is not a value, and the select
  /// keeps its own, starting at [initialValue].
  final MPSelectValue? value;

  /// The value chosen at the start, for a select that keeps its own. `null` is
  /// none. The React build's `defaultValue`.
  final MPSelectValue? initialValue;

  /// Called with the newly chosen value: a value, not an event. The React
  /// build's `onValueChange`.
  final ValueChanged<MPSelectValue?>? onChanged;

  /// Shown in the trigger while nothing is chosen, usually a [Text].
  ///
  /// With a floating label it is held back until the label has risen out of
  /// its way, which is the moment the select is focused or opened.
  final Widget? placeholder;

  /// The label, drawn in the outline's notch and, while nothing is chosen, the
  /// list is shut and there is no [startIcon], resting on the trigger's own
  /// line. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the trigger's line while there is nothing to
  /// make room for, and rises into the notch on focus or on the first choice.
  ///
  /// `false` pins it in the notch. A [startIcon] holds it up regardless: the
  /// icon is already standing where the resting label would be.
  final bool floatingLabel;

  /// The line under the select. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the select. Its presence is also what puts the select
  /// into its error state.
  final Widget? errorMessage;

  /// Content placed before the value, usually an icon. It takes
  /// `onSurfaceVariant` and the rung's glyph size from the field.
  final Widget? startIcon;

  /// Which rung of the size ladder, the same five a text field is drawn at.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given rather than holding the width of its widest
  /// option.
  final bool fullWidth;

  /// Marks the select required, to a screen reader and with an asterisk on the
  /// label. Inside an `MPForm`, a required select with nothing chosen holds the
  /// submit back.
  final bool required;

  /// Greys the select out and stops it opening.
  final bool disabled;

  /// Shows the value without allowing it to be changed, and stays focusable.
  final bool readOnly;

  /// The name an `MPForm` files the value under, and finds the select's errors
  /// by.
  final String? name;

  /// Hears every key pressed on the trigger before the select does anything
  /// with it. Returning [KeyEventResult.handled] takes the key. The React
  /// build's `onKeyDown` and `onKeyUp`.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called with `true` when the trigger takes the focus and `false` when it
  /// loses it. The React build's `onFocus` and `onBlur`.
  final ValueChanged<bool>? onFocusChange;

  /// The select's name for a screen reader, for a select with no visible
  /// [label]. The React build's `aria-label`.
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPSelect> createState() => _MPSelectState();
}

class _MPSelectState extends State<MPSelect> {
  late MPSelectValue? _own = widget.initialValue;
  final ScrollController _scroll = ScrollController();
  final MPRowReveal _reveal = MPRowReveal();
  final MPTypeahead _typeahead = MPTypeahead();
  FocusNode? _ownFocus;
  bool _open = false;

  /// Which row the keys and the pointer are on. `-1` is none.
  int _highlighted = -1;

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => _value,
    validate: () {
      if (widget.readOnly || !widget.required || _value != null) {
        return null;
      }

      return mpMessagesOf(context, mpCommonMessages)['required'];
    },
    focus: () => _focusNode.requestFocus(),
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  FocusNode get _focusNode => widget.focusNode ?? (_ownFocus ??= FocusNode(debugLabel: 'MPSelect'));

  bool get _controlled => !identical(widget.value, _unset);

  MPSelectValue? get _value => _controlled ? widget.value : _own;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _usable => !_disabled && !widget.readOnly;

  int get _chosen {
    final MPSelectValue? value = _value;

    return value == null
        ? -1
        : widget.items.indexWhere((MPSelectOption option) => option.value == value);
  }

  @override
  void dispose() {
    _scroll.dispose();
    _ownFocus?.dispose();
    _form.dispose();
    super.dispose();
  }

  /// What an option is called, as a screen reader and the typeahead read it.
  String _spoken(MPSelectOption option) {
    return option.label == null ? '${option.value}' : mpTextWithin(option.label);
  }

  Widget _labelOf(MPSelectOption option) => option.label ?? Text('${option.value}');

  /// The next row in [by]'s direction that can be taken, going round.
  int _next(int from, int by) {
    final int count = widget.items.length;

    for (int step = 1; step <= count; step += 1) {
      final int index = ((from + by * step) % count + count) % count;

      if (!widget.items[index].disabled) {
        return index;
      }
    }

    return -1;
  }

  void _show() {
    if (!_usable || _open) {
      return;
    }

    // The list's keys are the trigger's, so an open list nothing is focused on
    // is a list the arrow keys cannot reach.
    _focusNode.requestFocus();

    final int chosen = _chosen;

    setState(() {
      _open = true;
      // Opens on the chosen row, or on the first one that can be taken.
      _highlighted = chosen >= 0 && !widget.items[chosen].disabled ? chosen : _next(-1, 1);
    });
    _reveal.reveal(_scroll, _highlighted, widget.items.length);
  }

  void _close() {
    if (_open) {
      setState(() => _open = false);
    }
  }

  /// Moves the highlight to [index]. Only a key asks for the row to be
  /// scrolled into view: a row the pointer lit is already under the pointer.
  void _light(int index, {bool reveal = true}) {
    if (index == _highlighted) {
      return;
    }

    setState(() => _highlighted = index);

    if (reveal) {
      _reveal.reveal(_scroll, index, widget.items.length);
    }
  }

  void _take(int index) {
    if (index < 0 || index >= widget.items.length || widget.items[index].disabled) {
      return;
    }

    _choose(widget.items[index].value);
    _close();
  }

  void _choose(MPSelectValue value) {
    if (value == _value) {
      return;
    }

    if (!_controlled) {
      setState(() => _own = value);
    }

    _form.changed();
    widget.onChanged?.call(value);
  }

  void _onFocusChange(bool focused) {
    widget.onFocusChange?.call(focused);

    if (!focused) {
      _close();
      _form.blurred();
    }
  }

  KeyEventResult _onKey(KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;

    if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.arrowUp) {
      if (!_open) {
        // Under directional navigation the arrows are how a remote leaves the
        // control, so a closed select opens with Select or Enter instead, as
        // any button there does.
        if (!_usable || mpArrowsMoveFocus(context)) {
          return mpArrowResult(context, moved: false);
        }

        _show();

        return KeyEventResult.handled;
      }

      _light(_next(_highlighted, key == LogicalKeyboardKey.arrowDown ? 1 : -1));

      return KeyEventResult.handled;
    }

    if (_open && (key == LogicalKeyboardKey.home || key == LogicalKeyboardKey.end)) {
      _light(key == LogicalKeyboardKey.home ? _next(-1, 1) : _next(widget.items.length, -1));

      return KeyEventResult.handled;
    }

    if (_open && mpIsPressKey(event)) {
      _highlighted >= 0 ? _take(_highlighted) : _close();

      return KeyEventResult.handled;
    }

    final String? character = event.character;

    if (character != null &&
        character.trim().isNotEmpty &&
        character.runes.length == 1 &&
        _usable &&
        !HardwareKeyboard.instance.isControlPressed &&
        !HardwareKeyboard.instance.isMetaPressed) {
      _search(character);

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  /// Typing on the select jumps to the row a label starts with: the highlight
  /// on an open list, the value itself on a closed one, as a native `<select>`
  /// does.
  void _search(String character) {
    final String run = _typeahead.add(character);
    final List<String> labels = widget.items.map(_spoken).toList();
    final int from = _open ? _highlighted : _chosen;
    final int found = MPTypeahead.find(
      labels,
      run,
      from: from,
      skip: (int index) => widget.items[index].disabled,
    );

    if (found < 0) {
      return;
    }

    if (_open) {
      _light(found);
    } else {
      _choose(widget.items[found].value);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = _size;
    final bool disabled = _disabled;
    final bool open = _open && _usable;

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final MPSelectValue? value = _value;
    final int chosen = _chosen;

    // A value the list does not hold is drawn as itself.
    final Widget? display = value == null
        ? null
        : chosen >= 0
        ? _labelOf(widget.items[chosen])
        : Text('$value');
    final String? spoken = value == null
        ? null
        : chosen >= 0
        ? _spoken(widget.items[chosen])
        : '$value';

    return MPSelectTrigger(
      size: size,
      open: open,
      onPressed: () => open ? _close() : _show(),
      onDismiss: _close,
      popup: _list(size, chosen),
      display: display,
      placeholder: widget.placeholder,
      samples: widget.fullWidth ? const <String>[] : _samples(),
      label: widget.label,
      floatingLabel: widget.floatingLabel,
      description: widget.description,
      errorMessage: error,
      startIcon: widget.startIcon,
      endIcon: MPSelectChevron(size: size, open: open),
      required: widget.required,
      disabled: disabled,
      readOnly: widget.readOnly,
      fullWidth: widget.fullWidth,
      onKey: _onKey,
      onKeyEvent: widget.onKeyEvent,
      onFocusChange: _onFocusChange,
      semanticLabel: widget.semanticLabel,
      semanticValue: spoken == null || spoken.isEmpty ? null : spoken,
      focusNode: _focusNode,
      autofocus: widget.autofocus,
    );
  }

  /// Every string the trigger could say, which it holds the width of.
  ///
  /// The floating label is one of them: it rests where the value is written,
  /// at the value's size, and a trigger only as wide as its longest option
  /// would cut its own name short the moment the name came down.
  List<String> _samples() {
    return <String>[
      for (final MPSelectOption option in widget.items) _spoken(option),
      mpTextWithin(widget.placeholder),
      if (widget.floatingLabel) mpTextWithin(widget.label),
    ].where((String sample) => sample.isNotEmpty).toList();
  }

  Widget _list(MPSize size, int chosen) {
    return MPSelectSheet(
      controller: _scroll,
      children: <Widget>[
        for (int index = 0; index < widget.items.length; index += 1)
          _reveal.mark(
            index: index,
            marked: index == _highlighted,
            child: MPSelectRow(
              size: size,
              lit: index == _highlighted,
              selected: index == chosen,
              disabled: widget.items[index].disabled,
              onPressed: () => _take(index),
              onHover: widget.items[index].disabled ? null : () => _light(index, reveal: false),
              child: _labelOf(widget.items[index]),
            ),
          ),
      ],
    );
  }
}
