/// A field you can type into and also choose from.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/chip/mp_chip.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/list_reveal.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/search.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/select_trigger.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/internal/text_selection.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// What a combobox's value may be: a [String] or a [num], the same two an
/// `MPSelect` submits, and for the same reason.
///
/// A value the list does not contain arrives as a [String]: it is what the
/// reader typed. [Object] because Dart has no union type; values are compared
/// with `==`.
typedef MPComboboxValue = Object;

/// Which options survive a query: `true` keeps [option].
typedef MPComboboxFilter = bool Function(MPComboboxOption option, String query);

/// Marks a single value that was left out, which is what makes a combobox
/// hold its own. A value of its own rather than `null`, which a parent can
/// hold: nothing chosen.
const Object _unset = _Unset();

class _Unset {
  const _Unset();
}

/// The field's end padding, smaller than its start: the chevron brings its own
/// round hit area, and the field's padding on top of it would leave the glyph
/// floating in a gap. `pe-1` to `pe-2.5`.
const Map<MPSize, double> _endPad = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 8,
  MPSize.xl: 10,
};

/// The block padding round a row of chips, which holds a one-row field at the
/// height of the field beside it: `py-1`, `py-1.5`, `py-3`.
const Map<MPSize, double> _chipsInset = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 12,
  MPSize.lg: 12,
  MPSize.xl: 12,
};

/// The chips sit a rung below the field's own size.
const Map<MPSize, MPSize> _chipSize = <MPSize, MPSize>{
  MPSize.xs: MPSize.xs,
  MPSize.sm: MPSize.xs,
  MPSize.md: MPSize.sm,
  MPSize.lg: MPSize.md,
  MPSize.xl: MPSize.md,
};

/// Between two chips: `gap-1`.
const double _chipGap = 4;

/// Between the last chip and where typing starts: `ms-1.5`. The gap between
/// two chips is right between two things of the same kind and too little
/// between a chip and a caret, where the query would read as another chip's
/// label.
const double _afterChips = 6;

/// The least room typing keeps beside the chips before it goes to a line of
/// its own: `min-w-16`.
const double _queryMinWidth = 64;

/// One choice in an [MPCombobox].
///
/// The same description an `MPSelectOption` is, with one difference: the
/// label is a [String], because the filter matches against it and it is
/// written into the text field, and neither can be done to a widget. [content]
/// is how a row draws as something richer.
@immutable
class MPComboboxOption {
  /// Creates an option worth [value].
  const MPComboboxOption({required this.value, this.label, this.content, this.disabled = false});

  /// Submitted, and what `value` and `onChanged` speak in.
  final MPComboboxValue value;

  /// Shown in the list, in the field and on the chip, and what the filter
  /// matches against. The value itself, written out, if it is left out.
  final String? label;

  /// What the row in the popup draws, when that is more than the label: a
  /// thumbnail beside the title, a glyph, a second line.
  ///
  /// It replaces the label **in the popup only**. The field still receives
  /// [label] when the row is chosen, the chip still shows it, and the filter
  /// still matches against it.
  final Widget? content;

  /// Unavailable, but still listed: the option exists, it just cannot be
  /// picked.
  final bool disabled;
}

/// A field you can type into and also choose from.
///
/// ```dart
/// MPCombobox(
///   label: const Text('Fruit'),
///   items: const <MPComboboxOption>[
///     MPComboboxOption(value: 'apple', label: 'Apple'),
///     MPComboboxOption(value: 'banana', label: 'Banana'),
///   ],
///   value: fruit,
///   onChanged: (MPComboboxValue? next) => setState(() => fruit = next),
/// )
/// ```
///
/// The shell is `MPTextField`'s wearing a chevron, exactly as an `MPSelect`'s
/// trigger is: the three have to be indistinguishable in a form, or the form
/// looks assembled rather than designed. What is different is what the text
/// does: it filters the list, and, unless [allowCustom] is off, it can become
/// the value itself, offered as the last row rather than committed silently
/// when the focus leaves.
///
/// [MPCombobox.multiple] is the other half: the chosen values become
/// `MPChip`s inside the field and the text goes on filtering after each one,
/// so a set of tags is built without the list ever closing.
///
/// The first match lights up as the reader types, so Enter takes it without an
/// arrow key first; the arrow keys walk the list, Escape closes it, and with
/// [MPCombobox.multiple] the arrow back from the start of the text walks the
/// chips, where Backspace or Delete takes one off.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPCombobox extends StatefulWidget {
  /// Creates a combobox holding one value.
  ///
  /// Controlled when [value] is given, `null` included, which is nothing
  /// chosen; left out, it keeps its own, starting at [initialValue].
  const MPCombobox({
    required this.items,
    this.value = _unset,
    this.initialValue,
    this.onChanged,
    this.onInputValueChange,
    this.allowCustom = true,
    this.customLabel,
    this.clearable = false,
    this.emptyMessage,
    this.limit = -1,
    this.filter,
    this.chipVariant,
    this.chipColor,
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
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.clearLabel,
    this.openLabel,
    this.removeLabel,
    this.locale,
    this.onKeyEvent,
    this.onFocusChange,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  }) : multiple = false,
       values = null,
       initialValues = const <MPComboboxValue>[],
       onValuesChanged = null;

  /// Creates a combobox holding a set of values, drawn as chips in the field.
  ///
  /// Controlled when [value] is given; left out, it keeps its own set,
  /// starting at [initialValue].
  const MPCombobox.multiple({
    required this.items,
    List<MPComboboxValue>? value,
    List<MPComboboxValue> initialValue = const <MPComboboxValue>[],
    ValueChanged<List<MPComboboxValue>>? onChanged,
    this.onInputValueChange,
    this.allowCustom = true,
    this.customLabel,
    this.clearable = false,
    this.emptyMessage,
    this.limit = -1,
    this.filter,
    this.chipVariant,
    this.chipColor,
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
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.clearLabel,
    this.openLabel,
    this.removeLabel,
    this.locale,
    this.onKeyEvent,
    this.onFocusChange,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  }) : multiple = true,
       value = _unset,
       initialValue = null,
       onChanged = null,
       values = value,
       initialValues = initialValue,
       onValuesChanged = onChanged;

  /// Keeps every option, whatever was typed: the filter for a list a server
  /// has already searched, which may have matched an option on a spelling its
  /// label does not have. The React build's `filter={null}`.
  static bool noFilter(MPComboboxOption option, String query) => true;

  /// The options, as data.
  ///
  /// Every row is built, and there is no windowing. [limit] is the lighter
  /// tool: it caps what the popup draws while leaving the filter to search
  /// everything.
  final List<MPComboboxOption> items;

  /// Whether this is the [MPCombobox.multiple] form. Set by the constructor.
  final bool multiple;

  /// The chosen value of a single combobox, or the marker that says it was
  /// left out.
  ///
  /// **Nothing chosen is `null`.** A value with no matching entry in [items]
  /// is drawn as itself, which here is not a fallback but the point: a value
  /// the list never held is one a reader typed.
  final MPComboboxValue? value;

  /// The value a single combobox that keeps its own starts at. The React
  /// build's `defaultValue`.
  final MPComboboxValue? initialValue;

  /// Called with the value a single combobox now holds. The React build's
  /// `onValueChange`.
  final ValueChanged<MPComboboxValue?>? onChanged;

  /// The chosen values of an [MPCombobox.multiple], or `null` for one that
  /// keeps its own. Passed as `value`.
  final List<MPComboboxValue>? values;

  /// The values an [MPCombobox.multiple] that keeps its own starts with.
  /// Passed as `initialValue`.
  final List<MPComboboxValue> initialValues;

  /// Called with the set an [MPCombobox.multiple] now holds. Passed as
  /// `onChanged`.
  final ValueChanged<List<MPComboboxValue>>? onValuesChanged;

  /// Called as the text in the field changes: the filter query, not the
  /// value. Every change is reported, the ones the field makes itself (a
  /// chosen label written in, the text emptied after a pick) included.
  final ValueChanged<String>? onInputValueChange;

  /// Whether a value the list does not contain may be committed.
  ///
  /// On by default, and it is what separates this from a searchable select:
  /// the typed text is offered as its own row at the end of the list, so
  /// committing it is a choice the reader makes rather than something that
  /// happens to them when the focus leaves. Turn it off for a field whose
  /// values are a closed set.
  final bool allowCustom;

  /// What that row says. Receives the trimmed query. Left out, it is the
  /// wording in [locale] with the query set into it.
  final Widget Function(String query)? customLabel;

  /// Shows a × that empties the field. Off by default: a field that can be
  /// cleared in one press is a field that can be emptied by accident.
  final bool clearable;

  /// Shown in the popup when nothing matches and no value may be added.
  /// Defaults to the wording in [locale].
  final Widget? emptyMessage;

  /// The most rows the list shows at once. `-1` is all of them.
  final int limit;

  /// Which rows survive the query, replacing the matching this does on its
  /// own.
  ///
  /// Left out, an option stays while its label contains the query, with case
  /// set aside. [MPCombobox.noFilter] turns the filtering off, which is the
  /// value for rows that already arrived filtered. The row that offers what
  /// was typed is never asked about: its label *is* the query.
  final MPComboboxFilter? filter;

  /// How the chips of an [MPCombobox.multiple] are painted. [MPVariant.tonal],
  /// or [MPVariant.outlined] while the field is in its error state.
  final MPVariant? chipVariant;

  /// Which accent family those chips read. [MPColor.primary], or
  /// [MPColor.error] while the field is in its error state.
  final MPColor? chipColor;

  /// Shown in the field while nothing is typed. With a floating label it is
  /// held back until the label has risen out of its way.
  final String? placeholder;

  /// The label, drawn in the outline's notch and, while nothing is chosen or
  /// typed, the field is unfocused and there is no [startIcon], resting on the
  /// field's own line. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the field's line while there is nothing to
  /// make room for, and rises on focus, on the first character or on the
  /// first chip. `false` pins it in the notch.
  final bool floatingLabel;

  /// The line under the field. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the field. Its presence is also what puts the
  /// combobox into its error state.
  final Widget? errorMessage;

  /// Content placed before the text, usually an icon.
  final Widget? startIcon;

  /// Which rung of the size ladder. With [MPCombobox.multiple] it is a
  /// minimum height rather than a height, because chips wrap. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given rather than taking about twenty characters'
  /// worth.
  final bool fullWidth;

  /// Marks the combobox required, to a screen reader and with an asterisk on
  /// the label. Inside an `MPForm`, an empty required combobox holds the
  /// submit back.
  final bool required;

  /// Greys the field out and stops it taking input.
  final bool disabled;

  /// Shows the value without allowing it to be changed, and stays focusable.
  /// The list still opens, to be looked through, and taking a row from it
  /// changes nothing.
  final bool readOnly;

  /// The name an `MPForm` files the value under, and finds the field's errors
  /// by. An [MPCombobox.multiple] files a list.
  final String? name;

  /// Whether the popup is open. Given, the popup is controlled: the combobox
  /// asks for changes through [onOpenChange] and shows what it is given.
  final bool? open;

  /// Whether the popup starts open, for one that is not controlled. The React
  /// build's `defaultOpen`.
  final bool initialOpen;

  /// Called when the combobox wants the popup open or shut.
  final ValueChanged<bool>? onOpenChange;

  /// The clear ×'s name for a screen reader. Defaults to the word for
  /// "clear" in [locale].
  final String? clearLabel;

  /// The chevron's name for a screen reader, **for a combobox with no
  /// [label]**: with one, the chevron is named after the field, which says
  /// which field it opens. Defaults to the word for "open" in [locale].
  final String? openLabel;

  /// The name of a chip's remove button, given the chip's label. Left out, it
  /// is "Remove Seoul" in [locale]'s own word order, rather than one of five
  /// buttons all called "Remove".
  final String Function(String label)? removeLabel;

  /// Which language the field's own words are in: the adornments' names, the
  /// empty line, the row that offers a new value. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Hears every key pressed in the text before the combobox does anything
  /// with it. Returning [KeyEventResult.handled] takes the key. The React
  /// build's `onKeyDown` and `onKeyUp`.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called with `true` when the text takes the focus and `false` when it
  /// loses it. The React build's `onFocus` and `onBlur`.
  final ValueChanged<bool>? onFocusChange;

  /// The field's name for a screen reader, for a combobox with no visible
  /// [label]. The React build's `aria-label`.
  final String? semanticLabel;

  /// Drives the text's focus from outside. The React build's `inputRef`.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPCombobox> createState() => _MPComboboxState();
}

/// One row of the list: an option, or the offer to make one of the query.
@immutable
class _Row {
  const _Row.option(MPComboboxOption this.option) : query = null;

  const _Row.custom(String this.query) : option = null;

  final MPComboboxOption? option;
  final String? query;

  bool get custom => option == null;

  bool get disabled => option?.disabled ?? false;
}

class _MPComboboxState extends State<MPCombobox> {
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();
  final ScrollController _scroll = ScrollController();
  final MPRowReveal _reveal = MPRowReveal();
  late final TextEditingController _text = TextEditingController(text: _labelOfValue());
  FocusNode? _ownFocus;

  late MPComboboxValue? _ownValue = widget.initialValue;
  late List<MPComboboxValue> _ownValues = List<MPComboboxValue>.of(widget.initialValues);
  late bool _ownOpen = widget.initialOpen;

  bool _focused = false;

  /// Which row the keys and the pointer are on. `-1` is none.
  int _highlighted = -1;

  /// Whether the reader has typed a query since the list last opened.
  ///
  /// Until they do, the text of a single combobox is the chosen row's label,
  /// which is not a query: the list shows every row, as Base UI's does until
  /// its `queryChangedAfterOpen`.
  bool _queryEdited = false;

  /// Whether a query was typed into a list with no rows to light, so the first
  /// of the rows that arrive for it is lit as they do: a list a server fills
  /// after the reader stopped typing.
  bool _lightArrivals = false;

  /// The rows, and the text they were worked out for, kept between the
  /// combobox's own rebuilds so every arrow key does not filter the whole list
  /// again. A rebuild from the parent throws them away.
  List<_Row>? _rowsCache;
  String? _rowsQuery;

  /// The rows the list showed as it closed, which it goes on showing while it
  /// fades out, rather than jumping to every row as the text is put back.
  List<_Row>? _closing;

  /// The label each chosen value was last listed with, so a chip whose option
  /// a server's latest answer no longer holds is still called by its name.
  final Map<MPComboboxValue, String> _held = <MPComboboxValue, String>{};

  /// One node per chip, out of the Tab order and reached from the text with
  /// the arrow keys, as Base UI's chips are.
  final Map<Object, FocusNode> _chipNodes = <Object, FocusNode>{};

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => widget.multiple ? List<MPComboboxValue>.of(_chosen) : _single,
    validate: () {
      if (widget.readOnly || !widget.required || _chosen.isNotEmpty) {
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

  FocusNode get _focusNode =>
      widget.focusNode ?? (_ownFocus ??= FocusNode(debugLabel: 'MPCombobox'));

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _usable => !_disabled && !widget.readOnly;

  /// Whether the list opens: to be picked from, or while read-only to be
  /// looked through, as Base UI opens a read-only combobox.
  bool get _openable => !_disabled;

  bool get _open => widget.open ?? _ownOpen;

  MPComboboxValue? get _single {
    if (widget.multiple) {
      return null;
    }

    return identical(widget.value, _unset) ? _ownValue : widget.value;
  }

  List<MPComboboxValue> get _chosen {
    if (widget.multiple) {
      return widget.values ?? _ownValues;
    }

    final MPComboboxValue? single = _single;

    return single == null ? const <MPComboboxValue>[] : <MPComboboxValue>[single];
  }

  String _labelOfOption(MPComboboxOption option) => option.label ?? '${option.value}';

  /// What a value is called, on a chip and in the field: its option's label,
  /// the label it was last listed with, or the value itself.
  String _labelOf(MPComboboxValue value) {
    for (final MPComboboxOption option in widget.items) {
      if (option.value == value) {
        return _labelOfOption(option);
      }
    }

    return _held[value] ?? '$value';
  }

  /// What the text of a single combobox says for the value it holds.
  String _labelOfValue() {
    final MPComboboxValue? single = _single;

    return single == null ? '' : _labelOf(single);
  }

  /// Brings [_held] up to date: the label of every chosen value an option
  /// lists now, and nothing for a value no longer chosen.
  void _remember() {
    final List<MPComboboxValue> chosen = _chosen;

    for (final MPComboboxOption option in widget.items) {
      if (chosen.contains(option.value)) {
        _held[option.value] = _labelOfOption(option);
      }
    }

    _held.removeWhere((MPComboboxValue value, String _) => !chosen.contains(value));
  }

  @override
  void initState() {
    super.initState();
    _remember();
    _focusNode.addListener(_onFocusChanged);
  }

  /// Whether the highlight has been placed for a popup that starts open,
  /// which needs the inherited widgets `initState` cannot read yet.
  bool _placed = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!_placed) {
      _placed = true;

      if (_open) {
        _highlighted = _start();
      }
    }
  }

  @override
  void didUpdateWidget(MPCombobox oldWidget) {
    super.didUpdateWidget(oldWidget);

    _rowsCache = null;

    if (widget.focusNode != oldWidget.focusNode) {
      (oldWidget.focusNode ?? _ownFocus)?.removeListener(_onFocusChanged);
      _focusNode.addListener(_onFocusChanged);
    }

    // A popup the parent opened or shut.
    final bool wasOpen = oldWidget.open ?? _ownOpen;

    if (widget.open != null && widget.open != wasOpen) {
      widget.open! ? _opened() : _closed();
    }

    if (_lightArrivals && _open && _rows.isNotEmpty) {
      _highlighted = _next(-1, 1);
      _lightArrivals = false;
    }

    final String before = _labelHeldBefore(oldWidget);

    _remember();

    if (widget.multiple) {
      return;
    }

    // In single mode the text is the chosen option's label, so a value or a
    // label handed in from outside has to reach the field, except over a
    // query the reader has typed into the open list: that is theirs until the
    // list closes, and the list closing puts the label in.
    final String label = _labelOfValue();

    if (label != before && !_queryEdited) {
      _write(label, later: true);
    }
  }

  /// What the text said for the value [old] held, read before [_held] moves
  /// on.
  String _labelHeldBefore(MPCombobox old) {
    if (old.multiple) {
      return '';
    }

    final MPComboboxValue? single = identical(old.value, _unset) ? _ownValue : old.value;

    if (single == null) {
      return '';
    }

    for (final MPComboboxOption option in old.items) {
      if (option.value == single) {
        return _labelOfOption(option);
      }
    }

    return _held[single] ?? '$single';
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChanged);

    for (final FocusNode node in _chipNodes.values) {
      node.dispose();
    }

    _scroll.dispose();
    _text.dispose();
    _ownFocus?.dispose();
    _form.dispose();
    super.dispose();
  }

  /* -------------------------------------------------------------------------
   * The value
   * ----------------------------------------------------------------------- */

  void _commit(List<MPComboboxValue> next) {
    _form.changed();

    if (widget.multiple) {
      if (widget.values == null) {
        setState(() => _ownValues = next);
      }

      widget.onValuesChanged?.call(next);

      return;
    }

    final MPComboboxValue? value = next.isEmpty ? null : next.first;

    if (identical(widget.value, _unset)) {
      setState(() => _ownValue = value);
    }

    widget.onChanged?.call(value);
  }

  /* -------------------------------------------------------------------------
   * The text
   * ----------------------------------------------------------------------- */

  /// Writes [text] into the field and reports it, as Base UI reports every
  /// change to its input's text, so a caller following the query is not left
  /// with one the field no longer shows. A write made while the combobox is
  /// being built, [later], is reported once the frame is over.
  void _write(String text, {bool later = false}) {
    if (_text.text == text) {
      return;
    }

    _text.value = TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );

    if (!later) {
      widget.onInputValueChange?.call(text);

      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _text.text == text) {
        widget.onInputValueChange?.call(text);
      }
    });
  }

  /// Puts the text back to what the field holds. An abandoned query does not
  /// survive the list closing or the field losing the focus: nothing is
  /// committed on the way out, which is the whole point of the offered value
  /// being a row the reader takes.
  void _putTextBack() {
    _queryEdited = false;
    _rowsCache = null;
    _write(_labelOfValue());
  }

  void _onQueryChanged(String query) {
    widget.onInputValueChange?.call(query);

    // Emptying the text of a single combobox empties the field, as Base UI's
    // does: the label is what says the value is there.
    if (!widget.multiple && query.isEmpty && _single != null && _usable) {
      _commit(const <MPComboboxValue>[]);
    }

    final bool typed = query.trim().isNotEmpty;

    if (typed && !_open && _usable) {
      _request(true);
    }

    setState(() {
      _queryEdited = _queryEdited || typed;
      _rowsCache = null;

      if (!_open) {
        return;
      }

      final List<_Row> rows = _rows;

      _lightArrivals = typed && rows.isEmpty;

      if (typed) {
        // The first match lights up as the query changes, so Enter takes it
        // without an arrow key first, which is also what makes the offered
        // value reachable from the keyboard at all: a value the list does not
        // have is the only match there is.
        _highlighted = _next(-1, 1);
      } else if (widget.multiple && _chosen.isNotEmpty) {
        _highlighted = _start();
      } else if (_highlighted >= rows.length) {
        _highlighted = -1;
      }
    });
    _reveal.reveal(_scroll, _active, _rows.length);
  }

  /* -------------------------------------------------------------------------
   * The rows
   * ----------------------------------------------------------------------- */

  List<_Row> get _rows {
    final String text = _text.text;

    if (_rowsCache != null && _rowsQuery == text) {
      return _rowsCache!;
    }

    _rowsQuery = text;

    return _rowsCache = _filterRows();
  }

  /// The rows as they are drawn: the ones the text lists while the list is
  /// up, and the ones it closed on while it fades out.
  List<_Row> get _shown => _open ? _rows : _closing ?? _rows;

  List<_Row> _filterRows() {
    final String query = _text.text.trim();
    final String folded = searchText(query);

    // The chosen row's label, standing in the field as the list opens,
    // filters nothing.
    final bool unfiltered =
        query.isEmpty ||
        (!widget.multiple && !_queryEdited && folded == searchText(_labelOfValue().trim()));
    final MPComboboxFilter keeps =
        widget.filter ??
        (MPComboboxOption option, String query) =>
            searchText(_labelOfOption(option)).contains(folded);

    final List<_Row> matched = <_Row>[
      for (final MPComboboxOption option in widget.items)
        if (unfiltered || keeps(option, query)) _Row.option(option),
    ];

    final List<_Row> capped = widget.limit >= 0 && matched.length > widget.limit
        ? matched.sublist(0, widget.limit)
        : matched;

    if (!widget.allowCustom || !_usable || query.isEmpty) {
      return capped;
    }

    // Nothing to offer when the query already names something: an option, or
    // a value already chosen.
    final bool known =
        widget.items.any(
          (MPComboboxOption option) =>
              searchText(_labelOfOption(option)) == folded ||
              searchText('${option.value}') == folded,
        ) ||
        _chosen.any(
          (MPComboboxValue value) =>
              searchText('$value') == folded || searchText(_held[value]) == folded,
        );

    return known ? capped : <_Row>[...capped, _Row.custom(query)];
  }

  /// The row that is lit, as it is drawn and as Enter takes it.
  int get _active => _highlighted < _shown.length ? _highlighted : -1;

  /// The next row in [by]'s direction that can be taken, going round.
  int _next(int from, int by) {
    final List<_Row> rows = _rows;
    final int count = rows.length;

    for (int step = 1; step <= count; step += 1) {
      final int index = ((from + by * step) % count + count) % count;

      if (!rows[index].disabled) {
        return index;
      }
    }

    return -1;
  }

  /// Where the highlight starts as the list opens: on the first chosen row
  /// down it, or with none chosen, on the first row for the down arrow, the
  /// last for the up arrow, and nowhere for a press: a list opened to be
  /// looked through does not already point at a row the reader never went to.
  int _start({int? by}) {
    final List<_Row> rows = _rows;
    final List<MPComboboxValue> chosen = _chosen;

    for (int index = 0; index < rows.length; index += 1) {
      final MPComboboxOption? option = rows[index].option;

      if (option != null && chosen.contains(option.value)) {
        return index;
      }
    }

    if (by == null) {
      return -1;
    }

    return by > 0 ? _next(-1, 1) : _next(0, -1);
  }

  int _indexOf(MPComboboxValue value) {
    final List<_Row> rows = _rows;

    for (int index = 0; index < rows.length; index += 1) {
      if (rows[index].option?.value == value) {
        return index;
      }
    }

    return -1;
  }

  /* -------------------------------------------------------------------------
   * Opening and closing
   * ----------------------------------------------------------------------- */

  /// Asks for the popup open or shut: decided here when it is the combobox's
  /// own, reported either way.
  void _request(bool next, {int? by}) {
    if (next == _open || (next && !_openable)) {
      return;
    }

    if (widget.open == null) {
      setState(() {
        _ownOpen = next;
        next ? _opened(by: by) : _closed();
      });
    }

    widget.onOpenChange?.call(next);
  }

  void _opened({int? by}) {
    _queryEdited = false;
    _rowsCache = null;
    _closing = null;
    _lightArrivals = false;
    _highlighted = _start(by: by);
    _reveal.reveal(_scroll, _highlighted, _rows.length);
  }

  void _closed() {
    _closing = _rows;
    _lightArrivals = false;
    _highlighted = -1;
  }

  void _show({int? by}) {
    if (!_openable || _open) {
      return;
    }

    _focusNode.requestFocus();
    _request(true, by: by);
  }

  /// Closes the list without taking a row, and puts the text back.
  void _close() {
    if (_open) {
      _request(false);
    }

    _putTextBack();
  }

  /// A press on the field: the text takes the focus and asks for the
  /// keyboard, and the list opens.
  void _pressField() {
    mpTapEditor(_editor);
    _show();
  }

  void _onFocusChanged() {
    final bool has = _focusNode.hasFocus;

    if (has == _focused) {
      return;
    }

    setState(() => _focused = has);
    widget.onFocusChange?.call(has);

    if (!has) {
      if (_open) {
        _request(false);
      }

      _putTextBack();
      _form.blurred();
    }
  }

  /* -------------------------------------------------------------------------
   * Taking a row
   * ----------------------------------------------------------------------- */

  void _take(int index) {
    final List<_Row> rows = _shown;

    // A read-only list is there to be looked through.
    if (!_usable || index < 0 || index >= rows.length || rows[index].disabled) {
      return;
    }

    final _Row row = rows[index];
    final MPComboboxValue value = row.custom ? row.query! : row.option!.value;
    final String label = row.custom ? row.query! : _labelOfOption(row.option!);

    // Read off the row now, while the options list it.
    _held[value] = label;

    if (widget.multiple) {
      // A chosen row taken again is taken back out, as Base UI takes it.
      final List<MPComboboxValue> chosen = _chosen;
      final bool had = chosen.contains(value);

      _commit(<MPComboboxValue>[
        for (final MPComboboxValue each in chosen)
          if (each != value) each,
        if (!had) value,
      ]);
      // The query is spent and the text goes on filtering from empty, which
      // is what lets a set of tags be built without the list ever closing.
      _queryEdited = false;
      _write('');

      final int taken = _indexOf(value);

      setState(() {
        _rowsCache = null;
        _highlighted = taken >= 0 ? taken : _start();
      });
      _reveal.reveal(_scroll, _active, _rows.length);

      return;
    }

    _commit(<MPComboboxValue>[value]);
    _request(false);
    _queryEdited = false;
    _write(label);

    // Once the parent has built again, the text is what it holds: a parent
    // that refused the row still holds the value it had, and its label goes
    // back in.
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && !_open) {
        _putTextBack();
      }
    });
  }

  /// Takes [value] off from its chip.
  void _remove(MPComboboxValue value, {bool focusText = true}) {
    final List<_Row> rows = _rows;

    // Left lit, Enter would put the chip straight back.
    if (_highlighted >= 0 &&
        _highlighted < rows.length &&
        rows[_highlighted].option?.value == value) {
      setState(() => _highlighted = -1);
    }

    _commit(<MPComboboxValue>[
      for (final MPComboboxValue held in _chosen)
        if (held != value) held,
    ]);

    if (focusText) {
      _focusNode.requestFocus();
    }
  }

  void _clear() {
    _commit(const <MPComboboxValue>[]);
    _queryEdited = false;
    _write('');
    _focusNode.requestFocus();
  }

  /* -------------------------------------------------------------------------
   * Keys
   * ----------------------------------------------------------------------- */

  bool get _composing {
    final TextRange range = _text.value.composing;

    return range.isValid && !range.isCollapsed;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    final KeyEventResult theirs = widget.onKeyEvent?.call(node, event) ?? KeyEventResult.ignored;

    if (theirs != KeyEventResult.ignored) {
      return theirs;
    }

    // An input method composing owns every key it is sent.
    if ((event is! KeyDownEvent && event is! KeyRepeatEvent) || _composing) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;

    if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.arrowUp) {
      final int by = key == LogicalKeyboardKey.arrowDown ? 1 : -1;

      if (!_open) {
        // Under directional navigation the arrows are how a remote leaves the
        // field, and the text under the focus would otherwise keep them.
        if (mpArrowsMoveFocus(context)) {
          return _focusNode.focusInDirection(
                by > 0 ? TraversalDirection.down : TraversalDirection.up,
              )
              ? KeyEventResult.handled
              : KeyEventResult.ignored;
        }

        _show(by: by);

        return KeyEventResult.handled;
      }

      final int count = _rows.length;

      if (count > 0) {
        final int from = _active;
        final int next = from < 0 ? (by > 0 ? _next(-1, 1) : _next(0, -1)) : _next(from, by);

        if (next != from) {
          setState(() => _highlighted = next);
          _reveal.reveal(_scroll, next, count);
        }
      }

      return KeyEventResult.handled;
    }

    if (mpIsEnterDown(event)) {
      return _submit() ? KeyEventResult.handled : KeyEventResult.ignored;
    }

    if (!widget.multiple || _chosen.isEmpty) {
      return KeyEventResult.ignored;
    }

    // The keys of the text that reach the chips: the arrow back through the
    // text with the caret at its start goes to the last chip, and Backspace
    // in an empty field takes the last chip off.
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey back = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;
    final TextSelection selection = _text.selection;

    if (key == back &&
        (!selection.isValid || (selection.isCollapsed && selection.baseOffset == 0))) {
      _focusChip(_chosen.length - 1);

      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.backspace && _text.text.isEmpty && _usable) {
      _remove(_chosen.last, focusText: false);

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  /// Enter, from the keyboard or the on-screen keyboard's action key: takes
  /// the lit row of an open list, or closes one with no row lit. Says whether
  /// it did anything.
  bool _submit() {
    if (!_open) {
      // Under directional navigation Enter is what opens a closed list.
      if (mpArrowsMoveFocus(context)) {
        _show();

        return true;
      }

      return false;
    }

    final int active = _active;

    if (active >= 0) {
      _take(active);
    } else if (_rows.isNotEmpty) {
      _close();
    }

    return true;
  }

  Object _chipId(int index) {
    final List<MPComboboxValue> chosen = _chosen;

    return chosen.toSet().length < chosen.length ? index : chosen[index];
  }

  FocusNode _chipNode(int index) {
    return _chipNodes.putIfAbsent(
      _chipId(index),
      () => FocusNode(debugLabel: 'MPCombobox chip', skipTraversal: true),
    );
  }

  /// Lets go of the nodes of chips that have gone, once the frame that took
  /// their widgets away is over.
  void _pruneChipNodes() {
    final Set<Object> live = <Object>{
      for (int index = 0; index < _chosen.length; index += 1) _chipId(index),
    };
    final List<FocusNode> gone = <FocusNode>[];

    _chipNodes.removeWhere((Object id, FocusNode node) {
      final bool dead = !live.contains(id);

      if (dead) {
        gone.add(node);
      }

      return dead;
    });

    if (gone.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        for (final FocusNode node in gone) {
          node.dispose();
        }
      });
    }
  }

  void _focusChip(int? index) {
    if (index == null || index < 0 || index >= _chosen.length) {
      _focusNode.requestFocus();
    } else {
      _chipNode(index).requestFocus();
    }
  }

  /// The keys of the chip at [index], as Base UI's chip answers them: the
  /// arrows along the row move between the chips and back to the text,
  /// Backspace and Delete take the chip off, and anything else goes back to
  /// the text.
  KeyEventResult _onChipKey(int index, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey previous = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;
    final LogicalKeyboardKey next = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey key = event.logicalKey;
    final int count = _chosen.length;

    if (key == previous) {
      _focusChip(index > 0 ? index - 1 : index);
    } else if (key == next) {
      _focusChip(index < count - 1 ? index + 1 : null);
    } else if (key == LogicalKeyboardKey.backspace || key == LogicalKeyboardKey.delete) {
      if (!_usable) {
        return KeyEventResult.handled;
      }

      // The chip that takes the place of the one taken off, or the one before
      // the last, as Base UI's `getIndexAfterChipRemoval` puts it.
      final int after = index >= count - 1 ? count - 2 : index;

      _remove(_chosen[index], focusText: false);
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        if (mounted) {
          _focusChip(after >= 0 ? after : null);
        }
      });
    } else if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.arrowUp) {
      _focusChip(null);
      _show();
    } else if (key == LogicalKeyboardKey.escape || key == LogicalKeyboardKey.tab) {
      return KeyEventResult.ignored;
    } else {
      _focusChip(null);
    }

    return KeyEventResult.handled;
  }

  /* -------------------------------------------------------------------------
   * Building
   * ----------------------------------------------------------------------- */

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = _size;
    final MPFieldMetrics metrics = MPFieldMetrics.of(size);
    final bool disabled = _disabled;

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final bool invalid = error != null;
    final Map<String, String> common = mpMessagesOf(
      context,
      mpCommonMessages,
      locale: widget.locale,
    );
    final Map<String, String> words = mpMessagesOf(
      context,
      mpComboboxMessages,
      locale: widget.locale,
    );

    if (widget.multiple) {
      _pruneChipNodes();
    }

    final Widget shell = ValueListenableBuilder<TextEditingValue>(
      valueListenable: _text,
      builder: (BuildContext context, TextEditingValue value, Widget? child) {
        return MPFieldShell(
          size: size,
          label: widget.label == null
              ? null
              : ExcludeSemantics(excluding: widget.semanticLabel != null, child: widget.label!),
          required: widget.required,
          floating: widget.floatingLabel,
          // Typed text counts as content as much as a chosen row does: the
          // label cannot sit on top of what is being typed under it.
          filled: _chosen.isNotEmpty || value.text.isNotEmpty,
          pinned: widget.startIcon != null,
          invalid: invalid,
          disabled: disabled,
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.text,
          onTap: disabled ? null : _pressField,
          builder: (BuildContext context, MPFieldStatus status) {
            return _row(
              theme,
              metrics,
              status: status,
              empty: value.text.isEmpty,
              invalid: invalid,
              common: common,
            );
          },
        );
      },
    );

    final Widget anchored = MPAnchoredPortal(
      open: _open,
      side: MPSide.bottom,
      align: MPAlign.start,
      offset: mpSelectListOffset,
      anchorWidth: MPAnchorWidth.exact,
      onDismiss: _close,
      // The field goes on being used while the list is up, as Base UI leaves
      // the input group out of the outside press: a press on the text moves
      // the caret, a chip's × takes the chip off, the chevron closes the list.
      anchorInside: true,
      // The list counts as the text's own, so a press on a row does not take
      // the focus out of the text, which would close a multiple list after
      // every row.
      popup: TextFieldTapRegion(child: _list(size, words)),
      child: shell,
    );

    final Widget field = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        anchored,
        MPSupportingText(
          description: widget.description,
          errorMessage: error,
          disabled: disabled,
          padding: EdgeInsetsDirectional.symmetric(horizontal: metrics.padX),
        ),
      ],
    );

    // One node for the whole field: the editor's own says it is a text field,
    // what it holds and what can be done to it, and merges into this one,
    // which adds the name, the state of the list and the tap.
    return Semantics(
      container: true,
      enabled: !disabled,
      expanded: _open,
      label: widget.semanticLabel ?? (widget.label == null ? widget.placeholder : null),
      isRequired: widget.required ? true : null,
      validationResult: invalid
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      onTap: disabled ? null : _pressField,
      onFocus: disabled ? null : () => mpFocusEditor(_editor),
      child: widget.fullWidth ? field : IntrinsicWidth(child: field),
    );
  }

  Widget _row(
    MPThemeData theme,
    MPFieldMetrics metrics, {
    required MPFieldStatus status,
    required bool empty,
    required bool invalid,
    required Map<String, String> common,
  }) {
    final MPColorScheme colors = theme.colors;
    final bool disabled = _disabled;
    final MPSize size = metrics.size;
    final TextStyle style = metrics
        .text(theme.typescale)
        .style(MPFieldPaint.value(colors, disabled: disabled));

    Widget editor = MPTextSelectionArea(
      editableKey: _editor,
      enabled: !disabled,
      builder: (BuildContext context, MPTextSelection selection) => EditableText(
        key: _editor,
        controller: _text,
        focusNode: _focusNode,
        readOnly: widget.readOnly,
        autofocus: widget.autofocus,
        maxLines: 1,
        onChanged: _onQueryChanged,
        // Enter takes the lit row and nothing else. Left to itself the editor
        // also gives the focus up, which would end a multiple set of picks at
        // the first one.
        onEditingComplete: () {},
        // The on-screen keyboard's action key, which sends no key event.
        onSubmitted: (String text) => _submit(),
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
        cursorOpacityAnimates: true,
      ),
    );

    editor = ExcludeFocus(excluding: disabled, child: editor);

    if (widget.placeholder != null) {
      // Drawn under the text rather than by the editor, which has no notion of
      // one, and kept off the semantics tree: where it names the field, it does
      // so as the field's label.
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

    editor = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onKeyEvent: _onKey,
      child: editor,
    );

    // A press on the text opens the list once the editor has put the caret
    // down; left and right leave the field at either end of the text under
    // directional navigation, and up and down are the list's.
    editor = MPEditorPress(
      onPress: disabled ? null : _pressField,
      child: MPEditorArrows(editor: _editor, vertical: false, child: editor),
    );

    final Widget control;

    if (widget.multiple) {
      final List<MPComboboxValue> chosen = _chosen;
      final bool repeats = chosen.toSet().length < chosen.length;

      control = Padding(
        padding: EdgeInsets.symmetric(vertical: _chipsInset[size]!),
        child: _ChipRun(
          textDirection: Directionality.of(context),
          children: <Widget>[
            for (int index = 0; index < chosen.length; index += 1)
              _ChipStop(
                key: repeats ? null : ValueKey<Object>(chosen[index]),
                node: _chipNode(index),
                onKey: (KeyEvent event) => _onChipKey(index, event),
                disabled: disabled,
                child: _chip(chosen[index], size: size, invalid: invalid, common: common),
              ),
            KeyedSubtree(key: const ValueKey<String>('query'), child: editor),
          ],
        ),
      );
    } else {
      control = editor;
    }

    final bool showClear =
        widget.clearable && !widget.readOnly && !disabled && (_chosen.isNotEmpty || !empty);
    final String? labelText = mpTextOf(widget.label);

    return Padding(
      padding: EdgeInsetsDirectional.only(start: metrics.padX, end: _endPad[size]!),
      child: Row(
        mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
        spacing: MPFieldMetrics.gap,
        children: <Widget>[
          if (widget.startIcon != null)
            MPFieldAdornment(size: size, disabled: disabled, child: widget.startIcon!),
          if (widget.fullWidth)
            Expanded(child: control)
          else if (widget.multiple)
            // As wide as the chips and the text on one line, as a `w-fit` row
            // of chips is, and wrapping only once the room round the field
            // runs out.
            Flexible(
              child: ConstrainedBox(
                constraints: BoxConstraints(minWidth: metrics.controlWidth),
                child: control,
              ),
            )
          else
            SizedBox(width: metrics.controlWidth, child: control),
          if (showClear)
            MPFieldIconButton(
              icon: const MPGlyph(MPGlyphShape.close),
              iconSize: metrics.icon,
              semanticLabel: widget.clearLabel ?? common['clear']!,
              onPressed: _clear,
              extent: 32,
              focusable: false,
            ),
          MPFieldIconButton(
            icon: MPSelectChevron(size: size, open: _open),
            // Named after the field where it has a label, which says which
            // field it opens; the fallback is for the unlabelled case.
            semanticLabel: labelText ?? widget.openLabel ?? common['open']!,
            onPressed: _openable
                ? () {
                    if (_open) {
                      _close();
                    } else {
                      _focusNode.requestFocus();
                      _show();
                    }
                  }
                : null,
            extent: 32,
            focusable: false,
            disabled: disabled,
          ),
        ],
      ),
    );
  }

  Widget _chip(
    MPComboboxValue value, {
    required MPSize size,
    required bool invalid,
    required Map<String, String> common,
  }) {
    final String label = _labelOf(value);
    final bool removable = _usable;

    return MPChip(
      variant: widget.chipVariant ?? (invalid ? MPVariant.outlined : MPVariant.tonal),
      color: widget.chipColor ?? (invalid ? MPColor.error : MPColor.primary),
      size: _chipSize[size],
      disabled: _disabled,
      // Named for the chip it removes rather than one of five buttons all
      // called "Remove", which is a row a screen reader cannot tell apart.
      deleteLabel: removable
          ? (widget.removeLabel?.call(label) ??
                mpFillMessage(common['removeNamed']!, <String, String>{'label': label}))
          : null,
      onDelete: removable ? () => _remove(value) : null,
      locale: widget.locale,
      child: Text(label),
    );
  }

  Widget _list(MPSize size, Map<String, String> words) {
    final List<_Row> rows = _shown;
    final int active = _active;
    final List<MPComboboxValue> chosen = _chosen;

    if (rows.isEmpty) {
      return MPSelectSheet(
        children: <Widget>[
          MPSelectEmpty(size: size, child: widget.emptyMessage ?? Text(words['empty']!)),
        ],
      );
    }

    return MPSelectSheet(
      controller: _scroll,
      children: <Widget>[
        for (int index = 0; index < rows.length; index += 1)
          _reveal.mark(
            index: index,
            marked: index == active,
            child: MPSelectRow(
              size: size,
              lit: index == active,
              selected: !rows[index].custom && chosen.contains(rows[index].option!.value),
              disabled: rows[index].disabled,
              mark: rows[index].custom ? MPSelectMark.plus : MPSelectMark.check,
              exclusive: !widget.multiple && !rows[index].custom,
              truncate: rows[index].option?.content == null,
              onPressed: () => _take(index),
              onHover: rows[index].disabled
                  ? null
                  : () {
                      if (_highlighted != index) {
                        setState(() => _highlighted = index);
                      }
                    },
              child: rows[index].custom
                  ? widget.customLabel?.call(rows[index].query!) ??
                        Text(
                          mpFillMessage(words['add']!, <String, String>{
                            'label': rows[index].query!,
                          }),
                        )
                  : rows[index].option!.content ?? Text(_labelOfOption(rows[index].option!)),
            ),
          ),
      ],
    );
  }
}

/// One chip in the field: a stop of its own, out of the Tab order and reached
/// with the arrow keys from the text or the chips beside it, as Base UI's chip
/// is `tabIndex: -1`. Its × is out of the focus order too; a pointer and a
/// screen reader still press it, and Backspace or Delete on the chip takes it
/// off.
class _ChipStop extends StatefulWidget {
  const _ChipStop({
    required this.node,
    required this.onKey,
    required this.disabled,
    required this.child,
    super.key,
  });

  final FocusNode node;
  final KeyEventResult Function(KeyEvent event) onKey;
  final bool disabled;
  final Widget child;

  @override
  State<_ChipStop> createState() => _ChipStopState();
}

class _ChipStopState extends State<_ChipStop> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    // A ring only for a focus the keyboard brought, as `:focus-visible` has it.
    final bool ringed =
        _focused && FocusManager.instance.highlightMode == FocusHighlightMode.traditional;

    return Focus(
      focusNode: widget.node,
      canRequestFocus: !widget.disabled,
      includeSemantics: false,
      onFocusChange: (bool focused) => setState(() => _focused = focused),
      onKeyEvent: (FocusNode node, KeyEvent event) => widget.onKey(event),
      child: Semantics(
        container: true,
        focused: widget.disabled ? null : _focused,
        onFocus: widget.disabled ? null : widget.node.requestFocus,
        child: CustomPaint(
          foregroundPainter: ringed
              ? MPFocusRingPainter(
                  color: theme.colors.secondary,
                  borderRadius: BorderRadius.circular(theme.shapes.small),
                )
              : null,
          child: ExcludeFocus(child: widget.child),
        ),
      ),
    );
  }
}

/// Lays chips out in lines, as `flex-wrap` does, with the last child, the
/// text, taking whatever is left of the last line: on a line of its own when
/// what is left is narrower than [_queryMinWidth], as `flex-1 min-w-16` puts
/// it.
class _ChipRun extends MultiChildRenderObjectWidget {
  const _ChipRun({required this.textDirection, required super.children});

  final TextDirection textDirection;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderChipRun(textDirection);

  @override
  void updateRenderObject(BuildContext context, _RenderChipRun renderObject) {
    renderObject.textDirection = textDirection;
  }
}

class _ChipRunParentData extends ContainerBoxParentData<RenderBox> {}

/// Where one child of a [_ChipRun] goes: its line, its start along the line,
/// and its size.
class _Placement {
  _Placement(this.line, this.x, this.size);

  final int line;
  final double x;
  final Size size;
}

class _RenderChipRun extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _ChipRunParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _ChipRunParentData> {
  _RenderChipRun(this._textDirection);

  TextDirection _textDirection;

  set textDirection(TextDirection value) {
    if (value != _textDirection) {
      _textDirection = value;
      markNeedsLayout();
    }
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _ChipRunParentData) {
      child.parentData = _ChipRunParentData();
    }
  }

  /// Runs the children into lines [width] wide. [measure] sizes a child given
  /// the widest it may be, and for the last child the exact width it is
  /// given.
  ({List<_Placement> placements, List<double> lines}) _run(
    double width,
    Size Function(RenderBox child, double maxWidth, {required bool exact}) measure,
  ) {
    final List<_Placement> placements = <_Placement>[];
    final List<double> lines = <double>[0];
    double x = 0;
    RenderBox? child = firstChild;

    while (child != null) {
      final RenderBox? next = childAfter(child);

      if (next == null) {
        // The text, after any chips on its line.
        final double lead = x > 0 ? _afterChips : 0;
        double room = width - x - lead;

        // Let off by a hair, so a run laid out at exactly its own intrinsic
        // width keeps the text on the line that width was measured for.
        if (x > 0 && room < _queryMinWidth - 0.01) {
          lines.add(0);
          x = 0;
          room = width;
        }

        final Size size = measure(child, room, exact: true);
        final double start = x > 0 ? x + lead : 0;

        placements.add(_Placement(lines.length - 1, start, size));
        lines[lines.length - 1] = lines.last > size.height ? lines.last : size.height;
      } else {
        final Size size = measure(child, width, exact: false);

        if (x > 0 && x + size.width > width) {
          lines.add(0);
          x = 0;
        }

        placements.add(_Placement(lines.length - 1, x, size));
        lines[lines.length - 1] = lines.last > size.height ? lines.last : size.height;
        x += size.width + _chipGap;
      }

      child = next;
    }

    return (placements: placements, lines: lines);
  }

  double _height(List<double> lines) {
    return lines.fold<double>(0, (double sum, double line) => sum + line) +
        _chipGap * (lines.length - 1);
  }

  @override
  void performLayout() {
    final double width = constraints.maxWidth.isFinite
        ? constraints.maxWidth
        : computeMaxIntrinsicWidth(double.infinity);
    final (:List<_Placement> placements, :List<double> lines) = _run(width, (
      RenderBox child,
      double maxWidth, {
      required bool exact,
    }) {
      child.layout(
        exact ? BoxConstraints.tightFor(width: maxWidth) : BoxConstraints(maxWidth: maxWidth),
        parentUsesSize: true,
      );

      return child.size;
    });

    final List<double> tops = <double>[];
    double top = 0;

    for (final double line in lines) {
      tops.add(top);
      top += line + _chipGap;
    }

    RenderBox? child = firstChild;
    int index = 0;

    while (child != null) {
      final _Placement placement = placements[index];
      final double line = lines[placement.line];
      final double dx = _textDirection == TextDirection.rtl
          ? width - placement.x - placement.size.width
          : placement.x;

      (child.parentData! as _ChipRunParentData).offset = Offset(
        dx,
        tops[placement.line] + (line - placement.size.height) / 2,
      );

      child = childAfter(child);
      index += 1;
    }

    size = constraints.constrain(Size(width, _height(lines)));
  }

  Size _dry(double width) {
    final (placements: _, :List<double> lines) = _run(width, (
      RenderBox child,
      double maxWidth, {
      required bool exact,
    }) {
      return child.getDryLayout(
        exact ? BoxConstraints.tightFor(width: maxWidth) : BoxConstraints(maxWidth: maxWidth),
      );
    });

    return Size(width, _height(lines));
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final double width = constraints.maxWidth.isFinite
        ? constraints.maxWidth
        : computeMaxIntrinsicWidth(double.infinity);

    return constraints.constrain(_dry(width));
  }

  @override
  double computeMinIntrinsicWidth(double height) {
    double widest = _queryMinWidth;
    RenderBox? child = firstChild;

    while (child != null && childAfter(child) != null) {
      final double width = child.getMinIntrinsicWidth(height);
      widest = width > widest ? width : widest;
      child = childAfter(child);
    }

    return widest;
  }

  @override
  double computeMaxIntrinsicWidth(double height) {
    double total = 0;
    RenderBox? child = firstChild;

    while (child != null) {
      final RenderBox? next = childAfter(child);

      if (next == null) {
        final double text = child.getMaxIntrinsicWidth(height);

        total += (total > 0 ? _afterChips : 0) + (text > _queryMinWidth ? text : _queryMinWidth);
      } else {
        total += child.getMaxIntrinsicWidth(height) + _chipGap;
      }

      child = next;
    }

    return total;
  }

  @override
  double computeMinIntrinsicHeight(double width) => _dry(width).height;

  @override
  double computeMaxIntrinsicHeight(double width) => _dry(width).height;

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    return defaultHitTestChildren(result, position: position);
  }

  @override
  void paint(PaintingContext context, Offset offset) => defaultPaint(context, offset);
}
