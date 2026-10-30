/// A value chosen from a tree rather than from a list.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/search.dart';
import 'package:material_plus_ui/src/internal/select_trigger.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The popup's room, one track tighter than a control's: `p-1.5` to `p-3.5`.
const Map<MPSize, double> _popupPad = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// The popup's content: `w-64`, and no taller than `max-h-80`.
const double _popupWidth = 256;
const double _popupMaxHeight = 320;

/// A tree row's height: the heights a file tree is read at, rather than a
/// control's. `md` at 40 is under the 48dp touch target, so a tree meant for a
/// thumb wants `lg`.
const Map<MPSize, double> _rowHeight = <MPSize, double>{
  MPSize.xs: 28,
  MPSize.sm: 32,
  MPSize.md: 40,
  MPSize.lg: 48,
  MPSize.xl: 56,
};

/// How far one level is set in from the one above it.
const Map<MPSize, double> _indent = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 28,
};

/// A row's inline padding: `px-1.5` to `px-3.5`.
const Map<MPSize, double> _rowPadX = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// One node of the tree the reader is choosing from.
@immutable
class MPTreeSelectItem {
  /// Creates a node worth [value].
  const MPTreeSelectItem({
    required this.value,
    required this.label,
    this.searchLabel,
    this.startIcon,
    this.disabled = false,
    this.selectable,
    this.children,
  });

  /// What is stored when this node is chosen: a [String] or a [num], unique
  /// across the whole tree.
  final Object value;

  /// What the row says, usually a [Text].
  final Widget label;

  /// What a search matches against. Falls back to the words of [label] when
  /// it is a [Text], then to the value.
  final String? searchLabel;

  /// Content before the label: a folder, a flag.
  final Widget? startIcon;

  /// Unavailable: greyed out, and it can be neither chosen nor opened.
  final bool disabled;

  /// Whether this node may itself be chosen.
  ///
  /// `false` makes it a heading with children under it, a "Europe" that
  /// groups countries without being one. Left out, a leaf may be chosen and a
  /// node with children follows `selectableBranches`.
  final bool? selectable;

  /// The nodes under this one.
  final List<MPTreeSelectItem>? children;

  bool get _parent => children != null && children!.isNotEmpty;
}

/// A value chosen from a tree rather than from a list.
///
/// ```dart
/// MPTreeSelect(
///   label: const Text('Category'),
///   items: categories,
///   searchable: true,
///   value: chosen,
///   onChanged: (List<Object> next) => setState(() => chosen = next),
/// )
/// ```
///
/// The gap between `MPSelect` and a tree view: the first is a flat list behind
/// a field, the second is a hierarchy that shows what it holds but has no
/// field. A category, a folder, an org-chart node and a region are all chosen
/// from a shape a flat list flattens away.
///
/// **Branches are not answers by default.** [selectableBranches] is off,
/// because that is the shape most of these trees have: the branches are the
/// taxonomy and the leaves are the answers. A branch that cannot be chosen
/// still opens and shuts, and still looks like every other row: it is not the
/// answer, which is not the same as being unavailable.
///
/// **A search keeps the ancestors.** Filtered to bare matches, a tree is a
/// list, and a list of leaves is exactly what a tree was chosen over. So a
/// match brings its parents with it, and every branch the search kept is
/// opened.
///
/// The value is always a list, one entry long unless [multiple]. The focus
/// goes into the popup as it opens: the search field, or the tree, whose rows
/// the arrow keys walk.
class MPTreeSelect extends StatefulWidget {
  /// Creates a tree select over [items].
  const MPTreeSelect({
    this.items = const <MPTreeSelectItem>[],
    this.value,
    this.initialValue = const <Object>[],
    this.onChanged,
    this.multiple = false,
    this.selectableBranches = false,
    this.expanded,
    this.initialExpanded = const <Object>[],
    this.onExpandedChange,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.placeholder,
    this.clearable = false,
    this.closeOnSelect,
    this.searchable = false,
    this.searchPlaceholder,
    this.locale,
    this.format,
    this.labels,
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

  /// The tree, as nested items.
  final List<MPTreeSelectItem> items;

  /// The chosen values. Given, the select is controlled; left out, it keeps
  /// its own, starting at [initialValue].
  final List<Object>? value;

  /// The values a select that keeps its own starts with. The React build's
  /// `defaultValue`.
  final List<Object> initialValue;

  /// Called with the values now held: a list, one entry long unless
  /// [multiple]. The React build's `onValueChange`.
  final ValueChanged<List<Object>>? onChanged;

  /// Whether more than one node may be held.
  final bool multiple;

  /// Whether a node that has children may itself be chosen. An item's own
  /// `selectable` overrides it either way.
  final bool selectableBranches;

  /// Which branches stand open. Given, they are controlled.
  final List<Object>? expanded;

  /// Which branches start open. The React build's `defaultExpanded`.
  final List<Object> initialExpanded;

  /// Called with the branches that stand open, as the reader opens and shuts
  /// them. Not while a search is on, which opens what it keeps itself.
  final ValueChanged<List<Object>>? onExpandedChange;

  /// Whether the popup is open. Given, the popup is controlled.
  final bool? open;

  /// Whether the popup starts open. The React build's `defaultOpen`.
  final bool initialOpen;

  /// Called when the select wants the popup open or shut.
  final ValueChanged<bool>? onOpenChange;

  /// Shown in the trigger while nothing is chosen.
  final Widget? placeholder;

  /// Offers the × that empties the control.
  final bool clearable;

  /// Whether the popup closes as soon as a node is chosen. Left out, it does
  /// unless [multiple].
  final bool? closeOnSelect;

  /// Offers a field above the tree that filters it.
  final bool searchable;

  /// The search field's placeholder and name. Defaults to the word for
  /// "search" in [locale].
  final String? searchPlaceholder;

  /// Which language the select's own words are in: the search field, the line
  /// an empty search shows, the ×. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// How the trigger writes what is held. Left out, the labels, joined with
  /// commas.
  final String Function(List<MPTreeSelectItem> chosen)? format;

  /// Overrides for the select's own words, by key: `clear`.
  final Map<String, String>? labels;

  /// The label in the outline's notch. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the trigger's line while nothing is chosen.
  /// `false` pins it in the notch; a [startIcon] holds it up regardless.
  final bool floatingLabel;

  /// The line under the trigger. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the trigger. Its presence is also what puts the select
  /// into its error state.
  final Widget? errorMessage;

  /// Content placed before the value.
  final Widget? startIcon;

  /// Which rung: the trigger's height and the tree's rows. [MPSize.md] unless
  /// an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given.
  final bool fullWidth;

  /// Marks the select required. Inside an `MPForm`, a required select holding
  /// nothing holds the submit back.
  final bool required;

  /// Greys the select out and stops it opening.
  final bool disabled;

  /// Shows what is held and stays focusable, without opening.
  final bool readOnly;

  /// The name an `MPForm` files the list of values under.
  final String? name;

  /// Hears every key pressed on the trigger first. The React build's
  /// `onKeyDown` and `onKeyUp`.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called with `true` when the trigger takes the focus and `false` when it
  /// loses it.
  final ValueChanged<bool>? onFocusChange;

  /// The select's name for a screen reader, for one with no visible [label].
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPTreeSelect> createState() => _MPTreeSelectState();
}

class _MPTreeSelectState extends State<MPTreeSelect> {
  late List<Object> _ownValue = List<Object>.of(widget.initialValue);
  late List<Object> _ownExpanded = List<Object>.of(widget.initialExpanded);
  late bool _ownOpen = widget.initialOpen;
  final TextEditingController _query = TextEditingController();
  final FocusNode _searchFocus = FocusNode(debugLabel: 'MPTreeSelect search');
  final FocusNode _treeFocus = FocusNode(debugLabel: 'MPTreeSelect tree');
  FocusNode? _ownFocus;
  bool _popupHasFocus = false;

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => List<Object>.of(_held),
    validate: () {
      if (widget.readOnly || !widget.required || _held.isNotEmpty) {
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
      widget.focusNode ?? (_ownFocus ??= FocusNode(debugLabel: 'MPTreeSelect'));

  List<Object> get _held => widget.value ?? _ownValue;

  bool get _open => widget.open ?? _ownOpen;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _inert => _disabled || widget.readOnly;

  @override
  void dispose() {
    _query.dispose();
    _searchFocus.dispose();
    _treeFocus.dispose();
    _ownFocus?.dispose();
    _form.dispose();
    super.dispose();
  }

  bool _isSelectable(MPTreeSelectItem item) {
    return item.selectable ?? (item._parent ? widget.selectableBranches : true);
  }

  void _commit(List<Object> next) {
    if (widget.value == null) {
      setState(() => _ownValue = next);
    }

    _form.changed();
    widget.onChanged?.call(next);
  }

  void _request(bool next) {
    // A read-only select does not open: what it holds is something to read.
    if (next == _open || (next && _inert)) {
      return;
    }

    if (widget.open == null) {
      setState(() => _ownOpen = next);
    }

    if (!next) {
      _query.clear();
    }

    widget.onOpenChange?.call(next);

    if (next) {
      // The popup is what the reader came for, so the focus goes into it as it
      // opens, once it has been built, a frame after it is asked for.
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        WidgetsBinding.instance.addPostFrameCallback((Duration _) {
          if (mounted && _open) {
            (widget.searchable ? _searchFocus : _treeFocus).requestFocus();
          }
        });
      });
    }
  }

  /// Closes the popup, and hands the focus back to the trigger if it was in
  /// the popup, which is going away.
  void _close() {
    final bool inside = _popupHasFocus;

    _request(false);

    if (inside) {
      _focusNode.requestFocus();
    }
  }

  void _onPopupFocus(bool has) {
    _popupHasFocus = has;

    if (has) {
      return;
    }

    // Out of the popup, and not back to the trigger: the popup closes, as a
    // popover's does when Tab leaves it.
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _open && !_popupHasFocus && !_focusNode.hasFocus) {
        _request(false);
      }
    });
  }

  void _setExpanded(List<Object> next, {required bool searching}) {
    // While a search is on, what stands open is the search's answer rather
    // than the reader's, so there is nothing to record.
    if (searching) {
      return;
    }

    if (widget.expanded == null) {
      setState(() => _ownExpanded = next);
    }

    widget.onExpandedChange?.call(next);
  }

  /// A press on a row: a heading opens and shuts, and nothing else; a node
  /// that may be chosen is chosen, and a branch among them opens or shuts as
  /// well, as a tree view's row does.
  void _press(MPTreeSelectItem item, List<Object> expanded, {required bool searching}) {
    if (item.disabled || _inert) {
      return;
    }

    if (item._parent) {
      _setExpanded(
        expanded.contains(item.value)
            ? <Object>[
                for (final Object open in expanded)
                  if (open != item.value) open,
              ]
            : <Object>[...expanded, item.value],
        searching: searching,
      );
    }

    if (!_isSelectable(item)) {
      return;
    }

    final List<Object> held = _held;

    if (widget.multiple) {
      _commit(
        held.contains(item.value)
            ? <Object>[
                for (final Object value in held)
                  if (value != item.value) value,
              ]
            : <Object>[...held, item.value],
      );
    } else {
      _commit(<Object>[item.value]);
    }

    if (widget.closeOnSelect ?? !widget.multiple) {
      _close();
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = _size;
    final bool disabled = _disabled;
    final Map<String, String> common = mpMessagesOf(
      context,
      mpCommonMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final Map<Object, MPTreeSelectItem> byValue = _flatten(widget.items);
    final List<MPTreeSelectItem> chosen = <MPTreeSelectItem>[
      for (final Object value in _held)
        if (byValue[value] case final MPTreeSelectItem item) item,
    ];
    final String written = widget.format != null
        ? widget.format!(chosen)
        : chosen.map(_textOf).join(', ');

    return MPSelectTrigger(
      size: size,
      open: _open && !_inert,
      onPressed: () => _open ? _close() : _request(true),
      onDismiss: _close,
      anchorWidth: MPAnchorWidth.free,
      // The trigger closes its popup itself, and the × in it clears the value
      // while the popup is up.
      anchorInside: true,
      popup: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onFocusChange: _onPopupFocus,
        child: ValueListenableBuilder<TextEditingValue>(
          valueListenable: _query,
          builder: (BuildContext context, TextEditingValue query, Widget? child) {
            return _popup(size, byValue);
          },
        ),
      ),
      display: chosen.isEmpty ? null : Text(written),
      placeholder: widget.placeholder,
      label: widget.label,
      floatingLabel: widget.floatingLabel,
      description: widget.description,
      errorMessage: error,
      startIcon: widget.startIcon,
      onClear: widget.clearable ? () => _commit(const <Object>[]) : null,
      clearLabel: common['clear'],
      required: widget.required,
      disabled: disabled,
      readOnly: widget.readOnly,
      fullWidth: widget.fullWidth,
      onKeyEvent: widget.onKeyEvent,
      onFocusChange: (bool focused) {
        widget.onFocusChange?.call(focused);

        if (!focused && !_open) {
          _form.blurred();
        }
      },
      semanticLabel: widget.semanticLabel,
      semanticValue: chosen.isEmpty ? null : written,
      focusNode: _focusNode,
      autofocus: widget.autofocus,
    );
  }

  Widget _popup(MPSize size, Map<Object, MPTreeSelectItem> byValue) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Map<String, String> combobox = mpMessagesOf(
      context,
      mpComboboxMessages,
      locale: widget.locale,
    );
    // The word on a field somebody types a filter into is already written
    // down once, for `MPTransfer`, which has the same field for the same job.
    final Map<String, String> transfer = mpMessagesOf(
      context,
      mpTransferMessages,
      locale: widget.locale,
    );
    final String needle = searchText(_query.text.trim());
    final bool searching = needle.isNotEmpty;
    final List<MPTreeSelectItem> shown = searching ? _filter(widget.items, needle) : widget.items;
    // A search opens every branch it kept: a match folded inside a shut parent
    // is a match the reader was not shown.
    final List<Object> expanded = searching ? _branches(shown) : (widget.expanded ?? _ownExpanded);
    final String placeholder = widget.searchPlaceholder ?? transfer['search']!;

    return Container(
      padding: EdgeInsets.all(_popupPad[size]!),
      decoration: BoxDecoration(
        color: colors.surfaceContainer,
        borderRadius: BorderRadius.circular(theme.shapes.medium),
        boxShadow: MPShadows.of(2),
      ),
      child: DefaultTextStyle.merge(
        style: mpProseText(theme.typescale, size).style(colors.onSurface),
        child: SizedBox(
          width: _popupWidth,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: _popupMaxHeight),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                if (widget.searchable)
                  _SearchField(
                    controller: _query,
                    focusNode: _searchFocus,
                    placeholder: placeholder,
                    size: size,
                    onDown: () => _treeFocus.requestFocus(),
                  ),
                Flexible(
                  child: shown.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                          child: Text(
                            combobox['empty']!,
                            style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                          ),
                        )
                      : _Tree(
                          items: shown,
                          expanded: expanded,
                          held: _held,
                          multiple: widget.multiple,
                          size: size,
                          focusNode: _treeFocus,
                          isSelectable: _isSelectable,
                          onPress: (MPTreeSelectItem item) =>
                              _press(item, expanded, searching: searching),
                          onToggle: (MPTreeSelectItem item) => _setExpanded(
                            expanded.contains(item.value)
                                ? <Object>[
                                    for (final Object open in expanded)
                                      if (open != item.value) open,
                                  ]
                                : <Object>[...expanded, item.value],
                            searching: searching,
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// What a node is matched against and written as: [MPTreeSelectItem.searchLabel],
/// or the words of its label, or its value.
String _textOf(MPTreeSelectItem item) {
  final String words = mpTextWithin(item.label);

  return item.searchLabel ?? (words.isEmpty ? '${item.value}' : words);
}

/// Every node, flattened, so a value can be looked up without walking twice.
Map<Object, MPTreeSelectItem> _flatten(
  List<MPTreeSelectItem> items, [
  Map<Object, MPTreeSelectItem>? into,
]) {
  final Map<Object, MPTreeSelectItem> map = into ?? <Object, MPTreeSelectItem>{};

  for (final MPTreeSelectItem item in items) {
    map[item.value] = item;

    if (item.children != null) {
      _flatten(item.children!, map);
    }
  }

  return map;
}

/// Keeps the nodes that match, and every ancestor of one. A node that matches
/// keeps all of its own children: having found the branch the reader was
/// looking for, hiding what is inside it would be the opposite of helpful.
List<MPTreeSelectItem> _filter(List<MPTreeSelectItem> items, String needle) {
  final List<MPTreeSelectItem> kept = <MPTreeSelectItem>[];

  for (final MPTreeSelectItem item in items) {
    final List<MPTreeSelectItem>? children = item.children == null
        ? null
        : _filter(item.children!, needle);
    final bool hit = searchText(_textOf(item)).contains(needle);

    if (hit) {
      kept.add(item);
    } else if (children != null && children.isNotEmpty) {
      kept.add(
        MPTreeSelectItem(
          value: item.value,
          label: item.label,
          searchLabel: item.searchLabel,
          startIcon: item.startIcon,
          disabled: item.disabled,
          selectable: item.selectable,
          children: children,
        ),
      );
    }
  }

  return kept;
}

/// Every branch value in a tree: what a search opens so its matches show.
List<Object> _branches(List<MPTreeSelectItem> items, [List<Object>? into]) {
  final List<Object> values = into ?? <Object>[];

  for (final MPTreeSelectItem item in items) {
    if (item._parent) {
      values.add(item.value);
      _branches(item.children!, values);
    }
  }

  return values;
}

/// The field above the tree that filters it: no outline, only the words, as
/// a filter inside a sheet that already has an edge.
class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.controller,
    required this.focusNode,
    required this.placeholder,
    required this.size,
    required this.onDown,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final String placeholder;
  final MPSize size;
  final VoidCallback onDown;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final GlobalKey<EditableTextState> editor = GlobalObjectKey<EditableTextState>(controller);
    final TextStyle style = mpProseText(theme.typescale, size).style(colors.onSurface);

    return Semantics(
      container: true,
      label: placeholder,
      onTap: () => mpTapEditor(editor),
      onFocus: () => mpFocusEditor(editor),
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Focus(
          canRequestFocus: false,
          skipTraversal: true,
          includeSemantics: false,
          // Down from the filter goes into the tree it filters.
          onKeyEvent: (FocusNode node, KeyEvent event) {
            if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.arrowDown) {
              onDown();

              return KeyEventResult.handled;
            }

            return KeyEventResult.ignored;
          },
          child: Stack(
            children: <Widget>[
              Positioned.fill(
                child: IgnorePointer(
                  child: ExcludeSemantics(
                    child: ValueListenableBuilder<TextEditingValue>(
                      valueListenable: controller,
                      builder: (BuildContext context, TextEditingValue value, Widget? child) {
                        return Visibility(
                          visible: value.text.isEmpty,
                          maintainSize: true,
                          maintainAnimation: true,
                          maintainState: true,
                          child: Text(
                            placeholder,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: style.copyWith(color: colors.onSurfaceVariant),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
              MPEditorPress(
                onPress: () => mpTapEditor(editor),
                child: EditableText(
                  key: editor,
                  controller: controller,
                  focusNode: focusNode,
                  maxLines: 1,
                  style: style,
                  cursorColor: MPFieldPaint.caret(colors),
                  backgroundCursorColor: colors.onSurfaceVariant,
                  selectionColor: MPFieldPaint.selection(colors),
                  showSelectionHandles: false,
                  autofillHints: const <String>[],
                  onEditingComplete: () {},
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A visible row of the tree, in the order the arrow keys walk them.
class _Visible {
  const _Visible(this.item, this.parent);

  final MPTreeSelectItem item;
  final MPTreeSelectItem? parent;
}

/// The tree in the popup: one focus stop, whose rows the arrow keys walk.
///
/// Up and down move between the rows that show, right opens a branch and then
/// steps into it, left shuts it and then steps out to its parent, Home and End
/// go to the ends, and Enter or Space presses the row.
class _Tree extends StatefulWidget {
  const _Tree({
    required this.items,
    required this.expanded,
    required this.held,
    required this.multiple,
    required this.size,
    required this.focusNode,
    required this.isSelectable,
    required this.onPress,
    required this.onToggle,
  });

  final List<MPTreeSelectItem> items;
  final List<Object> expanded;
  final List<Object> held;
  final bool multiple;
  final MPSize size;
  final FocusNode focusNode;
  final bool Function(MPTreeSelectItem item) isSelectable;
  final ValueChanged<MPTreeSelectItem> onPress;
  final ValueChanged<MPTreeSelectItem> onToggle;

  @override
  State<_Tree> createState() => _TreeState();
}

class _TreeState extends State<_Tree> {
  /// The row the keys are on, by value.
  Object? _active;
  bool _focused = false;
  final Map<Object, GlobalKey> _rowKeys = <Object, GlobalKey>{};

  List<_Visible> _visible() {
    final List<_Visible> rows = <_Visible>[];

    void walk(List<MPTreeSelectItem> items, MPTreeSelectItem? parent) {
      for (final MPTreeSelectItem item in items) {
        rows.add(_Visible(item, parent));

        if (item._parent && widget.expanded.contains(item.value)) {
          walk(item.children!, item);
        }
      }
    }

    walk(widget.items, null);

    return rows;
  }

  /// The row the keys start on: the first held one that shows, or the first.
  Object? _start(List<_Visible> rows) {
    for (final _Visible row in rows) {
      if (widget.held.contains(row.item.value)) {
        return row.item.value;
      }
    }

    return rows.isEmpty ? null : rows.first.item.value;
  }

  void _moveTo(Object value) {
    setState(() => _active = value);

    final BuildContext? row = _rowKeys[value]?.currentContext;

    if (row != null) {
      Scrollable.ensureVisible(
        row,
        alignmentPolicy: ScrollPositionAlignmentPolicy.keepVisibleAtEnd,
      );
      Scrollable.ensureVisible(
        row,
        alignmentPolicy: ScrollPositionAlignmentPolicy.keepVisibleAtStart,
      );
    }
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final List<_Visible> rows = _visible();

    if (rows.isEmpty) {
      return KeyEventResult.ignored;
    }

    int at = rows.indexWhere((_Visible row) => row.item.value == _active);

    if (at < 0) {
      final Object? start = _start(rows);

      at = rows.indexWhere((_Visible row) => row.item.value == start);
    }

    final _Visible current = rows[at];
    final MPTreeSelectItem item = current.item;
    final LogicalKeyboardKey key = event.logicalKey;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey inward = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey outward = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;

    if (key == LogicalKeyboardKey.arrowDown) {
      _moveTo(rows[(at + 1).clamp(0, rows.length - 1)].item.value);
    } else if (key == LogicalKeyboardKey.arrowUp) {
      _moveTo(rows[(at - 1).clamp(0, rows.length - 1)].item.value);
    } else if (key == LogicalKeyboardKey.home) {
      _moveTo(rows.first.item.value);
    } else if (key == LogicalKeyboardKey.end) {
      _moveTo(rows.last.item.value);
    } else if (key == inward) {
      if (item._parent && !item.disabled) {
        if (widget.expanded.contains(item.value)) {
          _moveTo(item.children!.first.value);
        } else {
          widget.onToggle(item);
        }
      }
    } else if (key == outward) {
      if (item._parent && widget.expanded.contains(item.value)) {
        widget.onToggle(item);
      } else if (current.parent != null) {
        _moveTo(current.parent!.value);
      }
    } else if (mpIsPressKey(event)) {
      setState(() => _active = item.value);
      widget.onPress(item);
    } else {
      return KeyEventResult.ignored;
    }

    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final bool ringed =
        _focused && FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    final Object? active = _active ?? _start(_visible());

    return Focus(
      focusNode: widget.focusNode,
      includeSemantics: false,
      onFocusChange: (bool focused) => setState(() => _focused = focused),
      onKeyEvent: _onKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(4),
        child: Semantics(
          container: true,
          explicitChildNodes: true,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: _branch(widget.items, active: active, ringed: ringed),
          ),
        ),
      ),
    );
  }

  List<Widget> _branch(
    List<MPTreeSelectItem> items, {
    required Object? active,
    required bool ringed,
  }) {
    return <Widget>[
      for (final MPTreeSelectItem item in items) ...<Widget>[
        _TreeRow(
          key: _rowKeys.putIfAbsent(item.value, GlobalKey.new),
          item: item,
          size: widget.size,
          selected: widget.held.contains(item.value),
          expanded: widget.expanded.contains(item.value),
          active: ringed && item.value == active,
          onPress: () {
            widget.focusNode.requestFocus();
            setState(() => _active = item.value);
            widget.onPress(item);
          },
          onToggle: () {
            widget.focusNode.requestFocus();
            setState(() => _active = item.value);
            widget.onToggle(item);
          },
        ),
        if (item._parent)
          _Fold(
            open: widget.expanded.contains(item.value),
            child: Padding(
              padding: EdgeInsetsDirectional.only(start: _indent[widget.size]!),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: _branch(item.children!, active: active, ringed: ringed),
              ),
            ),
          ),
      ],
    ];
  }
}

/// A branch's children, opening and shutting on `short4` rather than
/// appearing, and not built at all once it has shut.
class _Fold extends StatelessWidget {
  const _Fold({required this.open, required this.child});

  final bool open;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(end: open ? 1 : 0),
      duration: reduceMotion ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      child: child,
      builder: (BuildContext context, double t, Widget? child) {
        if (t == 0 && !open) {
          return const SizedBox.shrink();
        }

        return ClipRect(
          child: Align(alignment: AlignmentDirectional.topStart, heightFactor: t, child: child),
        );
      },
    );
  }
}

/// One row: the arrow, the icon, the label, and the tint of a chosen row on
/// a full corner, MD3's navigation item.
class _TreeRow extends StatefulWidget {
  const _TreeRow({
    required this.item,
    required this.size,
    required this.selected,
    required this.expanded,
    required this.active,
    required this.onPress,
    required this.onToggle,
    super.key,
  });

  final MPTreeSelectItem item;
  final MPSize size;
  final bool selected;
  final bool expanded;

  /// Whether the keys are on this row, which draws the ring.
  final bool active;
  final VoidCallback onPress;
  final VoidCallback onToggle;

  @override
  State<_TreeRow> createState() => _TreeRowState();
}

class _TreeRowState extends State<_TreeRow> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTreeSelectItem item = widget.item;
    final MPSize size = widget.size;
    final bool disabled = item.disabled;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double height = _rowHeight[size]!;
    final BorderRadius radius = BorderRadius.circular(height / 2);
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : widget.selected
        ? colors.onSecondaryContainer
        : colors.onSurface;
    final TextStyle text = mpProseText(theme.typescale, size).style(ink);
    final double arrowWidth = (text.fontSize ?? 16) * 1.15;
    final double layer = disabled
        ? 0
        : _pressed
        ? MPStateOpacity.press
        : _hovered
        ? MPStateOpacity.hover
        : 0;

    // A leaf draws the arrow's box too, so every label in a branch starts on
    // the same column.
    Widget arrow = SizedBox(
      width: arrowWidth,
      child: item._parent
          ? AnimatedRotation(
              turns: widget.expanded ? 0 : (rtl ? 0.25 : -0.25),
              duration: duration,
              curve: MPMotion.standard,
              child: MPGlyph(
                MPGlyphShape.chevron,
                size: mpControlIcon[size]! - 6,
                color: disabled ? ink : colors.onSurfaceVariant,
              ),
            )
          : null,
    );

    if (item._parent && !disabled) {
      // The arrow opens the branch and nothing else: it does not choose the
      // row, which is the difference between pointing at a folder and opening
      // one.
      arrow = GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: widget.onToggle,
        child: arrow,
      );
    }

    Widget row = Container(
      height: height,
      padding: EdgeInsets.symmetric(horizontal: _rowPadX[size]!),
      child: Row(
        spacing: mpControlGap[size]!,
        children: <Widget>[
          arrow,
          if (item.startIcon != null)
            IconTheme.merge(
              data: IconThemeData(
                color: disabled ? ink : colors.onSurfaceVariant,
                size: mpControlIcon[size],
              ),
              child: item.startIcon!,
            ),
          Expanded(
            child: DefaultTextStyle.merge(
              style: text,
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              child: item.label,
            ),
          ),
        ],
      ),
    );

    row = MPStateLayer(color: ink, opacity: layer, borderRadius: radius, child: row);

    row = AnimatedContainer(
      duration: duration,
      curve: MPMotion.standard,
      decoration: BoxDecoration(
        color: widget.selected && !disabled
            ? colors.secondaryContainer
            : colors.secondaryContainer.withValues(alpha: 0),
        borderRadius: radius,
      ),
      child: row,
    );

    row = CustomPaint(
      // Drawn inside the row, as the React row's `-outline-offset-2` is: the
      // row sits flush against its neighbours.
      foregroundPainter: widget.active
          ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius, offset: -2)
          : null,
      child: row,
    );

    return Semantics(
      container: true,
      selected: widget.selected,
      expanded: item._parent ? widget.expanded : null,
      enabled: !disabled,
      onTap: disabled ? null : widget.onPress,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (PointerEnterEvent event) => setState(() => _hovered = true),
        onExit: (PointerExitEvent event) => setState(() {
          _hovered = false;
          _pressed = false;
        }),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTap: disabled ? () {} : widget.onPress,
          onTapDown: disabled ? null : (TapDownDetails details) => setState(() => _pressed = true),
          onTapUp: disabled ? null : (TapUpDetails details) => setState(() => _pressed = false),
          onTapCancel: disabled ? null : () => setState(() => _pressed = false),
          child: row,
        ),
      ),
    );
  }
}
