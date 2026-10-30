/// Everything an app can do, behind one field.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/shortcut/mp_shortcut.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
// The same vocabulary `MPShortcut` draws, read rather than written.
import 'package:material_plus_ui/src/internal/keys.dart';
import 'package:material_plus_ui/src/internal/list_reveal.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/search.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/text_selection.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// One thing the palette can do.
@immutable
class MPCommand {
  /// Creates a command.
  const MPCommand({
    required this.value,
    required this.label,
    this.description,
    this.icon,
    this.shortcut,
    this.group,
    this.keywords = const <String>[],
    this.disabled = false,
    this.onSelect,
  });

  /// What identifies the command.
  final String value;

  /// What the row says, and what the query is matched against.
  final String label;

  /// A second line under it: where the command goes, or what it changes.
  final String? description;

  /// A glyph before the label.
  final Widget? icon;

  /// The keystroke that does the same thing, set at the end of the row.
  ///
  /// Written the way `MPShortcut` writes them, so `Mod` resolves per
  /// platform. The palette **does not bind it**: the app does, and this is
  /// the label for the binding it already has.
  final String? shortcut;

  /// The heading this command sits under.
  ///
  /// Commands are drawn in the order they are given and a heading appears
  /// each time the group changes, so a group's commands have to be listed
  /// together.
  final String? group;

  /// Extra words the query is matched against but that are never drawn: the
  /// name another product gives the same command, an abbreviation, the word
  /// the reader would have searched for.
  final List<String> keywords;

  /// In the list but not runnable.
  final bool disabled;

  /// What running it does.
  final VoidCallback? onSelect;
}

/// How wide the sheet gets when nothing says: React's `max-w-sm` to
/// `max-w-3xl`.
const Map<MPSize, double> _maxWidth = <MPSize, double>{
  MPSize.xs: 384,
  MPSize.sm: 448,
  MPSize.md: 576,
  MPSize.lg: 672,
  MPSize.xl: 768,
};

/// The field, which is taller than a row because it is the thing being typed
/// in.
const Map<MPSize, double> _inputHeight = <MPSize, double>{
  MPSize.xs: 40,
  MPSize.sm: 48,
  MPSize.md: 56,
  MPSize.lg: 64,
  MPSize.xl: 72,
};

/// MD3's own menu-row inset, which is what a row of commands is.
const Map<MPSize, double> _insetX = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

const Map<MPSize, double> _rowPadY = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// The scale the sheet grows from as it arrives.
const double _growFrom = 0.95;

/// The scrim's blur, the dialog's own: enough to take the edge off the text
/// under the sheet without turning the page into a smear.
const double _scrimBlur = 2;

/// Everything an application can do, behind one field.
///
/// ```dart
/// MPCommandPalette(
///   open: open,
///   onOpenChange: (bool next) => setState(() => open = next),
///   items: const <MPCommand>[
///     MPCommand(value: 'new', label: 'New document', group: 'File'),
///   ],
/// )
/// ```
///
/// The shape a keyboard-first product takes once it has more actions than a
/// menu bar can hold: the reader types what they want instead of remembering
/// where it was put. It is not an `MPMenu`, a short list in one place whose
/// every row is visible before you look for it, and not a combobox either:
/// what comes back is not a value but *something happening*. The row is the
/// action, `onSelect` runs it, and the sheet closes because there is nothing
/// left to decide.
///
/// The surface is MD3's search view, `surfaceContainerHigh` under the
/// `extraLarge` corner at elevation 3, which are the dialog's own three
/// decisions: a sheet that has taken the page over a scrim is one object in
/// this system, whether it asks a question or takes a search. It is pinned a
/// little way down the screen rather than centred, so the field arrives under
/// the reader's hands.
class MPCommandPalette extends StatefulWidget {
  /// Creates a palette.
  const MPCommandPalette({
    required this.items,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.onSelect,
    this.shortcut = 'Mod+K',
    this.width,
    this.maxHeight = 320,
    this.size,
    this.color,
    this.locale,
    this.placeholder,
    this.emptyMessage,
    this.semanticLabel,
    super.key,
  });

  /// Everything the palette can do.
  final List<MPCommand> items;

  /// Whether the palette is open. Given, the palette is controlled and
  /// reports through [onOpenChange]; left `null`, it keeps its own.
  final bool? open;

  /// Whether an uncontrolled palette starts open.
  final bool initialOpen;

  /// Told whenever the palette asks to open or close: from [shortcut], a
  /// command that ran, <kbd>Escape</kbd>, the system back or a press on the
  /// scrim.
  final ValueChanged<bool>? onOpenChange;

  /// Called when a command is run, after its own [MPCommand.onSelect]. The
  /// palette closes either way.
  final ValueChanged<MPCommand>? onSelect;

  /// The keystroke that opens the palette, heard anywhere in the app.
  ///
  /// Written the way `MPShortcut` writes them, so `Mod` is Command on a Mac
  /// and Control everywhere else: a shortcut a component draws and one it
  /// binds have to be spelled the same way, or the cap on the screen is a
  /// claim nobody checked. `null` binds nothing.
  final String? shortcut;

  /// How wide the sheet may get. `null` is the width [size] implies.
  final double? width;

  /// How tall the list may get before it scrolls.
  final double maxHeight;

  /// The row height, the type scale and how wide the sheet gets. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the caret reads. The highlighted row is lit in the
  /// row's own ink, as a menu's is.
  final MPColor? color;

  /// Which language the placeholder, the empty line and the sheet's own name
  /// are in. Falls back to the nearest `MPLocaleProvider`, then to the app's
  /// locale, then to English.
  final String? locale;

  /// The placeholder in the field, and the field's name for a screen reader.
  /// Defaults to the wording in [locale].
  final String? placeholder;

  /// The line where the rows would be, when nothing matched. Defaults to the
  /// wording in [locale].
  final String? emptyMessage;

  /// The name a screen reader gives the sheet, which has no visible title.
  /// React's `label`. Defaults to the wording in [locale].
  final String? semanticLabel;

  @override
  State<MPCommandPalette> createState() => _MPCommandPaletteState();
}

class _MPCommandPaletteState extends State<MPCommandPalette> with SingleTickerProviderStateMixin {
  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  late bool _ownOpen = widget.initialOpen;

  bool get _open => widget.open ?? _ownOpen;

  final TextEditingController _query = TextEditingController();
  final FocusNode _field = FocusNode(debugLabel: 'MPCommandPalette');

  /// The field's editor, which a screen reader's tap and focus are handed to.
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();
  final ScrollController _scroll = ScrollController();
  final MPRowReveal _reveal = MPRowReveal();

  /// Which of the filtered commands is lit, or -1. Nothing is lit until an
  /// arrow key or the pointer lights a row, as React's list leaves it.
  int _highlighted = -1;

  /// What each command is searched by, folded once per list rather than on
  /// every key. The keystroke is left with a `contains`.
  List<MPCommand>? _searchedItems;
  List<String> _haystacks = const <String>[];

  /// The sheet's own arrival on top of the layer's fade: the grow, and the
  /// faster fade out the dialog leaves on.
  late final AnimationController _grow = AnimationController(vsync: this);

  late final CurvedAnimation _growCurve = CurvedAnimation(
    parent: _grow,
    curve: MPMotion.emphasizedDecelerate,
    reverseCurve: MPMotion.emphasizedAccelerate,
  );

  late final Animation<double> _scale = Tween<double>(begin: _growFrom, end: 1).animate(_growCurve);

  @override
  void initState() {
    super.initState();
    HardwareKeyboard.instance.addHandler(_onKey);

    if (_open) {
      _focusField();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();

    if (_open && _grow.isDismissed) {
      _grow.forward();
    }
  }

  @override
  void didUpdateWidget(MPCommandPalette oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A parent that rebuilt may have changed its commands in place, so the
    // folded list is only trusted between rebuilds of the palette's own.
    _searchedItems = null;

    final bool was = oldWidget.open ?? _ownOpen;

    if (was != _open) {
      _moved(_open);
    }
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_onKey);
    _growCurve.dispose();
    _grow.dispose();
    _query.dispose();
    _field.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _syncMotion() {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    _grow
      ..duration = reduceMotion ? Duration.zero : MPMotion.medium4
      ..reverseDuration = reduceMotion ? Duration.zero : MPMotion.short4;
  }

  /// Runs once the palette has become open or closed, however it got there.
  void _moved(bool open) {
    _syncMotion();

    if (open) {
      _highlighted = -1;
      _grow.forward();
      _focusField();
    } else {
      // The query is dropped on the way *out* rather than on the way in, so
      // the sheet never flashes the last search as it fades away.
      _query.clear();
      _grow.reverse();
    }
  }

  /// Every way in and out goes through here: a command that ran, the key, an
  /// Escape, a press on the scrim and a `false` from the caller all have to
  /// leave the palette in the same state.
  void _setOpen(bool next) {
    if (next == _open) {
      return;
    }

    if (widget.open == null) {
      setState(() => _ownOpen = next);
      _moved(next);
    }

    widget.onOpenChange?.call(next);
  }

  /// Puts the focus in the field once the sheet is in the tree, as React's
  /// input does with `autoFocus`.
  ///
  /// The layer lifts the sheet after this frame and asks its own scope for the
  /// focus the frame after that; a scope hands it to the child that last asked
  /// for it, so the field asks first.
  void _focusField() {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _open) {
        _field.requestFocus();
      }
    });
  }

  /// Everything the palette listens to, in one place.
  ///
  /// Read off the keyboard before the focus system sees it, for a reason only
  /// this component has: the field holds the focus, and an [EditableText]
  /// consumes the arrows and Enter itself. Reading them here is how the field
  /// keeps every character while the list keeps its own keys.
  bool _onKey(KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return false;
    }

    if (!_open) {
      final String? shortcut = widget.shortcut;

      if (shortcut == null || event is! KeyDownEvent || !mpMatchesHotKey(shortcut, event)) {
        return false;
      }

      _setOpen(true);

      return true;
    }

    // Only while the field holds the focus: a palette left open behind a
    // focus moved elsewhere does not take that place's keys.
    if (!_field.hasFocus) {
      return false;
    }

    final LogicalKeyboardKey key = event.logicalKey;
    final List<MPCommand> rows = _filtered;

    if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.arrowUp) {
      _move(key == LogicalKeyboardKey.arrowDown ? 1 : -1, rows);
      return true;
    }

    if (key == LogicalKeyboardKey.enter || key == LogicalKeyboardKey.numpadEnter) {
      if (_highlighted >= 0 && _highlighted < rows.length) {
        _run(rows[_highlighted]);
      }

      return true;
    }

    if (key == LogicalKeyboardKey.escape) {
      _setOpen(false);
      return true;
    }

    return false;
  }

  List<MPCommand> get _filtered {
    final String needle = searchText(_query.text);
    final List<MPCommand> items = widget.items;

    if (needle.isEmpty) {
      return items;
    }

    if (!identical(items, _searchedItems)) {
      _searchedItems = items;
      // Folded with a seam no keyboard types between the parts, so a query
      // cannot match across it: "copy link" does not find a command called
      // Copy that happens to be tagged "link".
      _haystacks = <String>[
        for (final MPCommand item in items)
          searchHaystack(<String?>[item.label, item.group, ...item.keywords]),
      ];
    }

    return <MPCommand>[
      for (int index = 0; index < items.length; index += 1)
        if (_haystacks[index].contains(needle)) items[index],
    ];
  }

  void _run(MPCommand item) {
    if (item.disabled) {
      return;
    }

    item.onSelect?.call();
    widget.onSelect?.call(item);
    _setOpen(false);
  }

  /// Moves the highlight to the next command that can run, stopping at either
  /// end.
  void _move(int by, List<MPCommand> rows) {
    int next = _highlighted < 0 && by < 0 ? rows.length : _highlighted;

    for (int step = 0; step < rows.length; step += 1) {
      next += by;

      if (next < 0 || next >= rows.length) {
        return;
      }

      if (!rows[next].disabled) {
        setState(() => _highlighted = next);
        _reveal.reveal(_scroll, next, rows.length);
        return;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final Map<String, String> words = mpMessagesOf(
      context,
      mpCommandMessages,
      locale: widget.locale,
    );
    final List<MPCommand> rows = _filtered;
    final MPSize size = _size;
    final EdgeInsets clear =
        const EdgeInsets.all(16) +
        MediaQuery.paddingOf(context) +
        EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom);

    Widget sheet = Builder(builder: (BuildContext context) => _sheet(context, theme, words, rows));

    sheet = ScaleTransition(scale: _scale, child: sheet);
    sheet = FadeTransition(opacity: _growCurve, child: sheet);

    return MPPortal(
      open: _open,
      label: widget.semanticLabel ?? words['label'],
      role: SemanticsRole.dialog,
      barrierColor: mpScrimColor(theme.colors),
      barrierBlur: _scrimBlur,
      onDismiss: () => _setOpen(false),
      // Pinned near the top rather than centred. A palette is opened by
      // somebody about to type, and a field that arrives under the reader's
      // hands is one they do not have to look for.
      child: Padding(
        padding: clear + EdgeInsets.only(top: MediaQuery.sizeOf(context).height * 0.12),
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: widget.width ?? _maxWidth[size]!),
            child: sheet,
          ),
        ),
      ),
    );
  }

  Widget _sheet(
    BuildContext context,
    MPThemeData theme,
    Map<String, String> words,
    List<MPCommand> rows,
  ) {
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final double inset = _insetX[size]!;
    final TextStyle text = mpProseText(theme.typescale, size).style(colors.onSurface);
    final String placeholder = widget.placeholder ?? words['search']!;
    final Color caret = colors.accent(_color).color;

    final Widget field = SizedBox(
      height: _inputHeight[size],
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: inset),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          // The placeholder's words name the editor's own node, as React's
          // input takes its name from its placeholder, and the name stays once
          // something is typed and the placeholder is gone.
          child: Semantics(
            label: placeholder,
            textField: true,
            onTap: () => mpTapEditor(_editor),
            onFocus: () => mpFocusEditor(_editor),
            child: MPEditorPress(
              onPress: () => mpTapEditor(_editor),
              child: MPEditorArrows(
                editor: _editor,
                vertical: false,
                child: MPTextSelectionArea(
                  editableKey: _editor,
                  builder: (BuildContext context, MPTextSelection selection) => EditableText(
                    key: _editor,
                    controller: _query,
                    focusNode: _field,
                    onChanged: (String _) {
                      setState(() => _highlighted = -1);

                      if (_scroll.hasClients) {
                        _scroll.jumpTo(0);
                      }
                    },
                    style: text,
                    cursorColor: caret,
                    backgroundCursorColor: colors.onSurfaceVariant,
                    selectionColor: caret.withValues(alpha: 0.3),
                    selectionControls: selection.controls,
                    contextMenuBuilder: selection.contextMenuBuilder,
                    showSelectionHandles: selection.showHandles,
                    onSelectionChanged: selection.onSelectionChanged,
                    rendererIgnoresPointer: selection.rendererIgnoresPointer,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    // Off the semantics tree, since the field already carries the words as its
    // name, and a node of its own beside it would read them twice.
    final Widget hint = ExcludeSemantics(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: inset),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: Text(
            placeholder,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: text.copyWith(color: colors.onSurfaceVariant),
          ),
        ),
      ),
    );

    return Container(
      decoration: BoxDecoration(
        color: colors.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(theme.shapes.extraLarge),
        boxShadow: MPShadows.of(3),
      ),
      clipBehavior: Clip.antiAlias,
      child: DefaultTextStyle(
        style: text,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            DecoratedBox(
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: colors.outlineVariant)),
              ),
              child: Stack(
                children: <Widget>[
                  Positioned.fill(
                    child: ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _query,
                      builder: (BuildContext context, TextEditingValue value, Widget? child) =>
                          value.text.isEmpty ? hint : const SizedBox.shrink(),
                    ),
                  ),
                  field,
                ],
              ),
            ),
            if (rows.isEmpty)
              Padding(
                padding: EdgeInsets.symmetric(horizontal: inset, vertical: 24),
                child: Text(
                  widget.emptyMessage ?? words['empty']!,
                  textAlign: TextAlign.center,
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                ),
              )
            else
              Flexible(child: _list(theme, rows)),
          ],
        ),
      ),
    );
  }

  Widget _list(MPThemeData theme, List<MPCommand> rows) {
    final MPSize size = _size;
    final double inset = _insetX[size]!;

    final List<({String? heading, int row})> entries = <({String? heading, int row})>[
      for (int index = 0; index < rows.length; index += 1) ...<({String? heading, int row})>[
        if (rows[index].group != null && (index == 0 || rows[index - 1].group != rows[index].group))
          (heading: rows[index].group, row: index),
        (heading: null, row: index),
      ],
    ];

    Widget entry(int at) {
      final ({String? heading, int row}) one = entries[at];
      final String? heading = one.heading;

      if (heading != null) {
        return Padding(
          padding: EdgeInsets.fromLTRB(inset, 8, inset, 4),
          child: Text(
            heading,
            style: theme.typescale.bodySmall
                .style(theme.colors.onSurfaceVariant)
                .copyWith(fontWeight: FontWeight.w500),
          ),
        );
      }

      final int index = one.row;

      // Every row is marked, lit or not, so a row keeps its place in the tree
      // as the highlight moves.
      return _reveal.mark(
        index: index,
        marked: index == _highlighted,
        child: _Row(
          item: rows[index],
          highlighted: index == _highlighted,
          size: size,
          onHover: () {
            if (_highlighted != index && !rows[index].disabled) {
              setState(() => _highlighted = index);
            }
          },
          onRun: () => _run(rows[index]),
        ),
      );
    }

    // Built as it scrolls, so a palette of thousands of commands builds the
    // few on screen rather than all of them on every key.
    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: widget.maxHeight),
      child: ListView.builder(
        controller: _scroll,
        shrinkWrap: true,
        padding: const EdgeInsets.all(4),
        itemCount: entries.length,
        itemBuilder: (BuildContext context, int at) => entry(at),
      ),
    );
  }
}

/// One command.
class _Row extends StatelessWidget {
  const _Row({
    required this.item,
    required this.highlighted,
    required this.size,
    required this.onHover,
    required this.onRun,
  });

  final MPCommand item;
  final bool highlighted;
  final MPSize size;
  final VoidCallback onHover;
  final VoidCallback onRun;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final TextStyle text = mpProseText(theme.typescale, size).style();
    final Color ink = item.disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;
    final double line = (text.fontSize ?? 16) * (text.height ?? 1.2);

    Widget row = Padding(
      padding: EdgeInsets.symmetric(horizontal: _insetX[size]!, vertical: _rowPadY[size]!),
      child: Row(
        spacing: 12,
        children: <Widget>[
          if (item.icon != null)
            SizedBox(
              height: line,
              child: IconTheme.merge(
                data: IconThemeData(color: ink, size: mpControlIcon[size]),
                child: Center(widthFactor: 1, child: item.icon),
              ),
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: text.copyWith(color: ink),
                ),
                if (item.description != null)
                  Text(
                    item.description!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                  ),
              ],
            ),
          ),
          if (item.shortcut != null) MPShortcut(keys: item.shortcut!, size: MPSize.xs),
        ],
      ),
    );

    // The row's own ink at 8% under the highlight, which the pointer and the
    // arrow keys share, so a reader never has to work out which of two marks
    // Enter would run.
    row = MPStateLayer(
      color: ink,
      opacity: highlighted && !item.disabled ? MPStateOpacity.hover : 0,
      borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
      child: row,
    );

    // One node, named by what the row draws: the label, the description and
    // the shortcut's keys, as React's option takes its name from its text.
    return MergeSemantics(
      child: MouseRegion(
        cursor: item.disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        // Only a pointer that moves lights a row. A list the keys scroll under
        // a resting pointer, or a palette that opens under one, is entered all
        // the same, and an enter would take the light from where it was put.
        onHover: (PointerHoverEvent event) => onHover(),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTap: onRun,
          child: Semantics(
            button: true,
            enabled: !item.disabled,
            selected: highlighted,
            onTap: item.disabled ? null : onRun,
            child: row,
          ),
        ),
      ),
    );
  }
}
