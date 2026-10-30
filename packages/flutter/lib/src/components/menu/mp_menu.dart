/// A list of actions that appears when something is pressed.
library;

import 'dart:async';

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/menu_bar.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/* ---------------------------------------------------------------------------
 * The rows
 *
 * **Descriptions rather than composed widgets**, which is where this package
 * and the React one part ways on a menu's shape. The React build composes
 * because Base UI reads the DOM the rows are written into: it finds them,
 * counts them, walks a highlight through them and matches typeahead against
 * them without anyone handing it a list. A widget tree offers nothing to walk
 * before it is built, and a menu's rows are not built until it opens, so the
 * menu has to be told what it holds.
 *
 * The names, the fields and the defaults are React's. The one thing that has
 * to change is the label, which is a `String`: it is drawn, announced and
 * matched by typeahead, and only a string can be all three.
 * ------------------------------------------------------------------------ */

/// One entry in a menu: a row, a group of rows, a set of choices, a
/// separator or a submenu.
///
/// Sealed, so a menu's switch over its entries is checked, and a row can be a
/// different kind of thing rather than one class with a discriminator on it.
sealed class MPMenuEntry {
  /// Creates an entry.
  const MPMenuEntry();
}

/// One row of a menu.
final class MPMenuItem extends MPMenuEntry {
  /// Creates a row.
  const MPMenuItem({
    required this.label,
    this.onPressed,
    this.startIcon,
    this.endIcon,
    this.shortcut,
    this.description,
    this.color,
    this.closeOnPress = true,
    this.disabled = false,
  });

  /// The label: what the row says, what a screen reader announces and what
  /// typeahead matches against.
  final String label;

  /// What the row does, by pointer, by keyboard or from a screen reader.
  /// Left out, the row is a label rather than an action.
  ///
  /// There is no `href`. Where a row goes belongs to the app's router, and
  /// this is where the router is called.
  final VoidCallback? onPressed;

  /// Content before the label: an icon, a swatch, an avatar. Drawn in
  /// `onSurfaceVariant` at the size ladder's icon size unless it says
  /// otherwise.
  final Widget? startIcon;

  /// Content after the label, before any [shortcut].
  final Widget? endIcon;

  /// The keystroke that does the same thing, set at the end of the row and
  /// muted. Text only: the row does not bind it, the app does.
  final String? shortcut;

  /// A second line under the label, one step down the type scale and muted.
  final String? description;

  /// Re-points the row's family, [MPColor.error] for the one that deletes.
  /// Defaults to the menu's own.
  final MPColor? color;

  /// Whether picking the row closes the menu.
  final bool closeOnPress;

  /// Unavailable. Still listed, and still reached by the arrow keys and by
  /// typeahead, but picking it does nothing.
  final bool disabled;
}

/// A row that ticks. The tick lands in the column a `startIcon` would.
final class MPMenuCheckboxItem extends MPMenuEntry {
  /// Creates a ticking row: controlled when [checked] is given, keeping its
  /// own tick from [initialChecked] otherwise.
  const MPMenuCheckboxItem({
    required this.label,
    this.checked,
    this.initialChecked = false,
    this.onChanged,
    this.endIcon,
    this.shortcut,
    this.description,
    this.color,
    this.closeOnPress = false,
    this.disabled = false,
  });

  /// The label. See [MPMenuItem.label].
  final String label;

  /// Whether the row is ticked. Left `null`, the menu keeps the tick itself.
  final bool? checked;

  /// The tick an uncontrolled row starts with.
  final bool initialChecked;

  /// Called with what the tick has become.
  final ValueChanged<bool>? onChanged;

  /// Content after the label, before any [shortcut].
  final Widget? endIcon;

  /// The keystroke that does the same thing. See [MPMenuItem.shortcut].
  final String? shortcut;

  /// A second line under the label.
  final String? description;

  /// Re-points the row's family, and the tick's with it.
  final MPColor? color;

  /// Whether ticking the row closes the menu. `false` here, against the
  /// `true` a plain row takes: a list of things to tick is a list you tick
  /// more than one of.
  final bool closeOnPress;

  /// Unavailable. Still listed.
  final bool disabled;
}

/// One choice out of a set. Holds the rows that make up the set.
///
/// Controlled when [value] is given, keeping its own choice from
/// [initialValue] otherwise. `T` is whatever the choices are: a `String`, an
/// `int`, an enum.
final class MPMenuRadioGroup<T> extends MPMenuEntry {
  /// Creates a set of choices.
  const MPMenuRadioGroup({
    required this.items,
    this.value,
    this.initialValue,
    this.onChanged,
    this.disabled = false,
  });

  /// The rows.
  final List<MPMenuRadioItem<T>> items;

  /// Which row is chosen, by its [MPMenuRadioItem.value]. Left `null`, the
  /// menu keeps the choice itself.
  final T? value;

  /// The choice an uncontrolled set starts with.
  final T? initialValue;

  /// Called with the value of the row that was chosen.
  final ValueChanged<T>? onChanged;

  /// Makes every row in the set unavailable.
  final bool disabled;

  /// Reports [choice], inside the class, where `T` is the caller's type and
  /// not the menu's `Object?`.
  void _report(Object? choice) => onChanged?.call(choice as T);
}

/// A row inside an [MPMenuRadioGroup].
///
/// Marked with a filled dot rather than a tick, which is the distinction
/// `MPCheckbox` and `MPRadioGroup` make everywhere else: a tick says "and", a
/// dot says "instead of".
final class MPMenuRadioItem<T> extends MPMenuEntry {
  /// Creates one choice.
  const MPMenuRadioItem({
    required this.value,
    required this.label,
    this.endIcon,
    this.shortcut,
    this.description,
    this.color,
    this.closeOnPress = false,
    this.disabled = false,
  });

  /// What choosing this row sets the set to.
  final T value;

  /// The label. See [MPMenuItem.label].
  final String label;

  /// Content after the label, before any [shortcut].
  final Widget? endIcon;

  /// The keystroke that does the same thing. See [MPMenuItem.shortcut].
  final String? shortcut;

  /// A second line under the label.
  final String? description;

  /// Re-points the row's family, and the dot's with it.
  final MPColor? color;

  /// Whether choosing the row closes the menu. `false`, as on a ticking row.
  final bool closeOnPress;

  /// Unavailable. Still listed.
  final bool disabled;
}

/// A named run of rows. The label is a heading, not a row: it cannot be
/// picked, and neither the arrow keys nor typeahead land on it.
final class MPMenuGroup extends MPMenuEntry {
  /// Creates a group.
  const MPMenuGroup({required this.items, this.label});

  /// The rows in it.
  final List<MPMenuEntry> items;

  /// The heading over them.
  final String? label;
}

/// The hairline between two runs of rows, in `outlineVariant` as MD3 draws
/// it.
final class MPMenuSeparator extends MPMenuEntry {
  /// Creates a rule.
  const MPMenuSeparator();
}

/// A menu inside a menu.
///
/// The row that opens it is the same row every other item is, wearing a
/// chevron. It opens on hover, on <kbd>Enter</kbd> and on the arrow key that
/// points at it. Nesting is unlimited: a submenu holds entries, and one of
/// them can be a submenu.
final class MPMenuSubmenu extends MPMenuEntry {
  /// Creates a submenu.
  const MPMenuSubmenu({
    required this.label,
    required this.items,
    this.startIcon,
    this.disabled = false,
    this.side,
    this.sideOffset = 0,
  });

  /// The label on the row that opens it.
  final String label;

  /// The nested rows.
  final List<MPMenuEntry> items;

  /// Content before the label.
  final Widget? startIcon;

  /// Unavailable. The row stops opening anything.
  final bool disabled;

  /// Which edge of the parent row it opens against. Left `null`, the end of
  /// the line: the right, and the left under RTL, where the arrow key that
  /// opens it points too.
  final MPSide? side;

  /// How far it stands off the parent menu, in logical pixels.
  final double sideOffset;
}

/* ---------------------------------------------------------------------------
 * The ladders
 * ------------------------------------------------------------------------ */

/// How tall the popup gets before it scrolls: React's `24rem`.
const double _maxPopupHeight = 384;

/// MD3's narrowest menu.
const double _minPopupWidth = 112;

/// MD3's widest menu. A longer label is cut short rather than widening it.
const double _maxPopupWidth = 280;

/// The room above the first row and under the last.
const double _popupPadY = 8;

/// How long a typeahead run stays open before the next key starts a new one.
const Duration _typeaheadWindow = Duration(milliseconds: 750);

/// How long the pointer rests on a hover trigger before its menu opens.
const Duration _hoverOpenDelay = Duration(milliseconds: 100);

/// How long a hover-opened menu waits for the pointer to come back before it
/// closes: long enough to cross the gap between the trigger and the popup.
const Duration _hoverCloseDelay = Duration(milliseconds: 120);

/// A row's least height, and MD3's own 48 at [MPSize.md]. A least height
/// rather than a height, because a row with a description is two lines tall.
const Map<MPSize, double> _rowHeight = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 40,
  MPSize.md: 48,
  MPSize.lg: 56,
  MPSize.xl: 64,
};

/// MD3 insets a menu row by 12 at [MPSize.md]. Its own ladder, not the
/// control one: a row is as wide as the popup, so a button's 24 would put a
/// five-row menu at the width of a dialog.
const Map<MPSize, double> _rowPadX = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

/// Between the parts of a row.
const Map<MPSize, double> _rowGap = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// `labelLarge` at [MPSize.md], MD3's own menu-item role, and one step either
/// side of it at the ends of the ladder.
MPTypeRole _rowText(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.labelMedium;
    case MPSize.sm:
    case MPSize.md:
      return scale.labelLarge;
    case MPSize.lg:
    case MPSize.xl:
      return scale.titleMedium;
  }
}

/* ---------------------------------------------------------------------------
 * The menu
 * ------------------------------------------------------------------------ */

/// Builds what opens a menu, handed the callback that opens it and whether it
/// is open.
typedef MPMenuTriggerBuilder =
    Widget Function(BuildContext context, VoidCallback open, bool isOpen);

/// A list of actions that appears when something is pressed.
///
/// ```dart
/// MPMenu(
///   trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
///       MPButton(onPressed: open, child: const Text('Actions')),
///   items: <MPMenuEntry>[
///     MPMenuItem(label: 'Copy', shortcut: '⌘C', onPressed: copy),
///     const MPMenuSeparator(),
///     MPMenuItem(label: 'Delete', color: MPColor.error, onPressed: remove),
///   ],
/// )
/// ```
///
/// The popup is `surfaceContainer` at elevation 2 under the `extraSmall`
/// corner, MD3's own three choices and the same three a select's list takes:
/// a select is a menu that remembers what you picked, and two floating lists
/// of rows that do not match are two lists the eye has to learn separately.
///
/// There is no `variant`, because a popup that has taken the pointer has
/// already answered how much of a surface it paints, and no `elevation`,
/// because MD3 puts a menu at level 2 and nowhere else.
///
/// ## The keyboard
///
/// The focus stays round the trigger while the popup is up, on a node of the
/// menu's own. The rows are painted in an overlay, and a focus scope lifted
/// with them would take the keyboard away from the widget that knows what to
/// do with it. The arrow keys, <kbd>Home</kbd>, <kbd>End</kbd>, typeahead,
/// <kbd>Enter</kbd>, <kbd>Space</kbd> and <kbd>Escape</kbd> are all answered
/// there, and the focus goes back to the trigger as the menu closes.
class MPMenu extends StatefulWidget {
  /// Creates a menu.
  const MPMenu({
    required this.items,
    this.trigger,
    this.size,
    this.color,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.side = MPSide.bottom,
    this.align = MPAlign.start,
    this.sideOffset = 4,
    this.openOnHover = false,
    this.loopFocus = true,
    this.disabled = false,
    this.semanticLabel,
    super.key,
  });

  /// The rows.
  final List<MPMenuEntry> items;

  /// What opens the menu, built with the callback that opens it and whether
  /// it is open.
  ///
  /// A builder rather than a widget, because the trigger has to call the menu
  /// and usually wants to know whether it is open: a button that stays lit
  /// while its menu is up is the difference between a menu bar and four
  /// buttons. Optional: a controlled menu opened from elsewhere needs none,
  /// and hangs off the place it was written.
  ///
  /// A Material Plus control used as the trigger says it holds the focus while
  /// the menu does, and whether the menu is open, as React's trigger says
  /// with `aria-expanded`.
  final MPMenuTriggerBuilder? trigger;

  /// The row height and type scale. [MPSize.md] unless an [MPConfigProvider]
  /// says otherwise.
  final MPSize? size;

  /// Which accent family a ticked or chosen row reads. The popup itself stays
  /// neutral, as MD3's does.
  final MPColor? color;

  /// Whether the menu is open. Given, the menu is controlled and reports
  /// through [onOpenChange]; left `null`, it keeps its own.
  final bool? open;

  /// Whether an uncontrolled menu starts open.
  final bool initialOpen;

  /// Told whenever the menu asks to open or close: from the trigger, a row,
  /// <kbd>Escape</kbd>, the system back or a press outside.
  final ValueChanged<bool>? onOpenChange;

  /// Which edge of the trigger it hangs off. It goes to the opposite one when
  /// there is no room.
  final MPSide side;

  /// Where it sits along that edge.
  final MPAlign align;

  /// How far it stands off the trigger, in logical pixels.
  final double sideOffset;

  /// Opens on hover as well as on a press. A press on the trigger of a menu
  /// that hover opened keeps it open once the pointer leaves.
  final bool openOnHover;

  /// Whether the arrow keys wrap from the last row back to the first.
  final bool loopFocus;

  /// Unavailable. The trigger stops opening anything.
  final bool disabled;

  /// The name a screen reader gives the popup.
  final String? semanticLabel;

  @override
  State<MPMenu> createState() => _MPMenuState();
}

/// One row of a menu as the menu walks it: the entry, where it sits, and the
/// set it belongs to when it is a choice.
class _Row {
  const _Row(this.entry, this.key, {this.group, this.groupKey});

  /// An [MPMenuItem], an [MPMenuCheckboxItem], an [MPMenuRadioItem] or an
  /// [MPMenuSubmenu].
  final MPMenuEntry entry;

  /// Where the row sits in the menu, as a path of positions. What an
  /// uncontrolled tick is kept under.
  final String key;

  /// The set a choice belongs to.
  final MPMenuRadioGroup<Object?>? group;

  /// Where that set sits, which is what its uncontrolled choice is kept under.
  final String? groupKey;
}

/// Which row an opening menu lights.
enum _Light { none, first, last }

class _MPMenuState extends State<MPMenu> {
  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  /// Where the keys go while the popup is up.
  ///
  /// Out of the traversal order, because it is not a stop: it wraps the
  /// trigger, and a stop of its own would put a second stop in front of the
  /// trigger with nothing drawn on it. It only ever takes the focus by being
  /// asked to, when the menu opens.
  final FocusNode _focusNode = FocusNode(debugLabel: 'MPMenu', skipTraversal: true);

  /// Whether [_focusNode] holds the primary focus, which the trigger inside it
  /// says is its own.
  bool _holding = false;

  late bool _ownOpen = widget.initialOpen;

  bool get _open => widget.open ?? _ownOpen;

  /// The node that held the focus when the menu opened, and takes it back
  /// when it closes.
  FocusNode? _returnTo;

  /// Whether the menu takes the focus as it opens, and gives it back as it
  /// closes. A menu the pointer opened by resting on its trigger leaves the
  /// focus where it was, and so has nothing to give back.
  bool _tookFocus = true;

  /// Which row the next opening lights.
  _Light _nextLight = _Light.none;

  /// The row opened on each level that has a submenu open beside it.
  final List<int> _path = <int>[];

  /// The level the keyboard is on, from 0 up to `_path.length`.
  int _level = 0;

  /// Which row of [_level] is lit, or -1.
  int _highlighted = -1;

  /// The ticks of uncontrolled ticking rows, by where they sit.
  final Map<String, bool> _checks = <String, bool>{};

  /// The choices of uncontrolled sets, by where they sit.
  final Map<String, Object?> _choices = <String, Object?>{};

  String _typed = '';
  DateTime _typedAt = DateTime.fromMillisecondsSinceEpoch(0);

  /// Whether the pointer resting on the trigger opened the menu, and nothing
  /// has pressed it since.
  bool _hoverOpened = false;
  bool _overTrigger = false;
  int _overPopups = 0;
  Timer? _hoverTimer;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_handleFocus);

    if (_open) {
      _opened();
    }
  }

  @override
  void didUpdateWidget(MPMenu oldWidget) {
    super.didUpdateWidget(oldWidget);

    final bool was = oldWidget.open ?? _ownOpen;

    if (was != _open) {
      _open ? _opened() : _closed();
    }
  }

  @override
  void dispose() {
    _hoverTimer?.cancel();
    _focusNode.removeListener(_handleFocus);
    _focusNode.dispose();
    super.dispose();
  }

  void _handleFocus() {
    if (_focusNode.hasPrimaryFocus != _holding) {
      setState(() => _holding = _focusNode.hasPrimaryFocus);
    }
  }

  /* -------------------------------------------------------------------------
   * Opening and closing
   * ----------------------------------------------------------------------- */

  /// Asks for the menu to be [next]: kept here for an uncontrolled menu, and
  /// reported either way.
  void _request(bool next, {_Light light = _Light.none, bool takeFocus = true}) {
    if (next == _open || (next && widget.disabled)) {
      return;
    }

    if (next) {
      _nextLight = light;
      _tookFocus = takeFocus;
    }

    if (widget.open == null) {
      setState(() => _ownOpen = next);
      next ? _opened() : _closed();
    }

    widget.onOpenChange?.call(next);
  }

  /// What the trigger is handed.
  void _openFromTrigger() {
    if (_open) {
      // A press on a trigger whose menu the pointer opened by resting on it
      // keeps the menu open, and gives it the keys.
      if (_hoverOpened) {
        setState(() => _hoverOpened = false);
        _tookFocus = true;
        _takeFocus();
      }

      return;
    }

    // A trigger that held the focus as it was activated was reached by the
    // keyboard, and a menu opened from the keyboard lights its first row, as
    // React's does. A pointer press does not move the focus onto a trigger.
    _request(true, light: _focusInside ? _Light.first : _Light.none);
  }

  /// Whether the primary focus is on the trigger or inside it.
  bool get _focusInside {
    final FocusNode? primary = FocusManager.instance.primaryFocus;

    return primary != null && (primary == _focusNode || primary.ancestors.contains(_focusNode));
  }

  /// Runs once the menu has become open, however it got there.
  void _opened() {
    _path.clear();
    _level = 0;
    _highlighted = -1;
    _typed = '';

    final MPMenuBarScope? bar = MPMenuBarScope.maybeOf(context);
    final _Light light = bar != null && bar.lightOnOpen ? _Light.first : _nextLight;
    _nextLight = _Light.none;

    if (light != _Light.none) {
      _highlighted = _edgeOf(_rowsAt(0), toEnd: light == _Light.last);
    }

    if (_tookFocus) {
      final FocusNode? primary = FocusManager.instance.primaryFocus;
      _returnTo = primary == _focusNode ? null : primary;
      _takeFocus();
    }
  }

  void _takeFocus() {
    // After the frame, because a menu opened during a build cannot move the
    // focus until it is over, and a menu built open is not in the tree yet.
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _open) {
        _focusNode.requestFocus();
      }
    });
  }

  /// Runs once the menu has become closed, however it got there.
  void _closed() {
    _path.clear();
    _level = 0;
    _highlighted = -1;
    _hoverOpened = false;
    _hoverTimer?.cancel();

    if (_tookFocus) {
      _giveBack();
    }

    _tookFocus = true;
  }

  /// Hands the focus back to the trigger once the menu has closed, which is
  /// where React's menu puts it.
  ///
  /// Left on the menu's own node, which draws no ring, a trigger opened from
  /// the keyboard would lose its ring and the reader their place. It goes to
  /// the node that held the focus as the menu opened when that is inside the
  /// trigger, and otherwise to the trigger's own node; a menu with no trigger
  /// gives it back to whatever held it.
  ///
  /// Checked once the frame is over and the focus changes it asked for have
  /// been made, because a row's own handler runs before the menu closes and
  /// may have sent the focus somewhere of its own, and a menu bar may have
  /// opened the next menu in the same frame. A request made at once would win
  /// over either.
  void _giveBack() {
    final FocusNode? held = _returnTo;
    _returnTo = null;

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      scheduleMicrotask(() {
        if (!mounted || !_focusNode.hasPrimaryFocus) {
          return;
        }

        final bool inside = held != null && held.ancestors.contains(_focusNode);
        final FocusNode? node = inside ? held : (_triggerNode ?? held);

        if (node != null && node.context != null && node.canRequestFocus) {
          node.requestFocus();
        }
      });
    });
  }

  /// The outermost node inside the trigger that can take the focus, or `null`
  /// for a trigger that has none.
  FocusNode? get _triggerNode {
    Iterable<FocusNode> level = _focusNode.children;

    while (level.isNotEmpty) {
      for (final FocusNode node in level) {
        if (node.canRequestFocus) {
          return node;
        }
      }

      level = level.expand((FocusNode node) => node.children);
    }

    return null;
  }

  /* -------------------------------------------------------------------------
   * Hover
   * ----------------------------------------------------------------------- */

  void _enterTrigger() {
    _overTrigger = true;
    _hoverTimer?.cancel();

    if (_open || widget.disabled) {
      return;
    }

    _hoverTimer = Timer(_hoverOpenDelay, () {
      if (mounted && _overTrigger && !_open && !widget.disabled) {
        _hoverOpened = true;
        _request(true, takeFocus: false);
      }
    });
  }

  void _exitTrigger() {
    _overTrigger = false;
    _hoverTimer?.cancel();
    _closeIfLeft();
  }

  void _enterPopup() {
    _overPopups += 1;
    _hoverTimer?.cancel();
  }

  void _exitPopup() {
    _overPopups = _overPopups > 0 ? _overPopups - 1 : 0;
    _closeIfLeft();
  }

  /// Closes a menu the pointer opened once the pointer has left both the
  /// trigger and every popup, and has not come back in time.
  void _closeIfLeft() {
    if (!_hoverOpened || _overTrigger || _overPopups > 0) {
      return;
    }

    _hoverTimer?.cancel();
    _hoverTimer = Timer(_hoverCloseDelay, () {
      if (mounted && _hoverOpened && !_overTrigger && _overPopups == 0) {
        _request(false);
      }
    });
  }

  /* -------------------------------------------------------------------------
   * The rows
   * ----------------------------------------------------------------------- */

  /// The rows of [items], flattened out of their groups and sets, each with
  /// the key it is kept under.
  static List<_Row> _flatten(List<MPMenuEntry> items, String prefix) {
    final List<_Row> rows = <_Row>[];

    for (int index = 0; index < items.length; index += 1) {
      final MPMenuEntry entry = items[index];
      final String key = '$prefix.$index';

      switch (entry) {
        case MPMenuGroup(items: final List<MPMenuEntry> inner):
          rows.addAll(_flatten(inner, key));
        case MPMenuRadioGroup<Object?>():
          for (int choice = 0; choice < entry.items.length; choice += 1) {
            rows.add(_Row(entry.items[choice], '$key.$choice', group: entry, groupKey: key));
          }
        case MPMenuSeparator():
          break;
        case MPMenuItem() || MPMenuCheckboxItem() || MPMenuRadioItem<Object?>() || MPMenuSubmenu():
          rows.add(_Row(entry, key));
      }
    }

    return rows;
  }

  /// The entries on [level], with the key their positions start from.
  (List<MPMenuEntry>, String) _entriesAt(int level) {
    List<MPMenuEntry> items = widget.items;
    String prefix = '';

    for (int depth = 0; depth < level && depth < _path.length; depth += 1) {
      final List<_Row> rows = _flatten(items, prefix);

      if (_path[depth] >= rows.length) {
        return (const <MPMenuEntry>[], prefix);
      }

      final _Row row = rows[_path[depth]];
      final MPMenuEntry entry = row.entry;

      items = entry is MPMenuSubmenu ? entry.items : const <MPMenuEntry>[];
      prefix = row.key;
    }

    return (items, prefix);
  }

  List<_Row> _rowsAt(int level) {
    final (List<MPMenuEntry> items, String prefix) = _entriesAt(level);

    return _flatten(items, prefix);
  }

  bool _disabled(_Row row) {
    final bool off = switch (row.entry) {
      MPMenuItem(:final bool disabled) => disabled,
      MPMenuCheckboxItem(:final bool disabled) => disabled,
      MPMenuRadioItem<Object?>(:final bool disabled) => disabled,
      MPMenuSubmenu(:final bool disabled) => disabled,
      MPMenuGroup() || MPMenuRadioGroup<Object?>() || MPMenuSeparator() => false,
    };

    return off || (row.group?.disabled ?? false);
  }

  static String _labelOf(MPMenuEntry entry) {
    return switch (entry) {
      MPMenuItem(:final String label) => label,
      MPMenuCheckboxItem(:final String label) => label,
      MPMenuRadioItem<Object?>(:final String label) => label,
      MPMenuSubmenu(:final String label) => label,
      MPMenuGroup() || MPMenuRadioGroup<Object?>() || MPMenuSeparator() => '',
    };
  }

  /// Whether a ticking row is ticked, or a choice chosen.
  bool _marked(_Row row) {
    final MPMenuEntry entry = row.entry;

    if (entry is MPMenuCheckboxItem) {
      return entry.checked ?? _checks[row.key] ?? entry.initialChecked;
    }

    if (entry is MPMenuRadioItem<Object?>) {
      final MPMenuRadioGroup<Object?> group = row.group!;
      final Object? chosen =
          group.value ??
          (_choices.containsKey(row.groupKey) ? _choices[row.groupKey] : group.initialValue);

      return chosen != null && chosen == entry.value;
    }

    return false;
  }

  /// The first row of [rows], or the last, or -1 when there are none.
  ///
  /// An unavailable row counts, as it does for React's menu: it is reached and
  /// announced, and picking it does nothing.
  static int _edgeOf(List<_Row> rows, {required bool toEnd}) {
    if (rows.isEmpty) {
      return -1;
    }

    return toEnd ? rows.length - 1 : 0;
  }

  /* -------------------------------------------------------------------------
   * The keyboard
   * ----------------------------------------------------------------------- */

  void _move(int by) {
    final List<_Row> rows = _rowsAt(_level);

    if (rows.isEmpty) {
      return;
    }

    int next;

    if (_highlighted < 0) {
      next = by > 0 ? 0 : rows.length - 1;
    } else {
      next = _highlighted + by;

      if (next < 0 || next >= rows.length) {
        if (!widget.loopFocus) {
          return;
        }

        next = next < 0 ? rows.length - 1 : 0;
      }
    }

    setState(() {
      // Walking away from a row that has a submenu open beside it closes that
      // submenu, as the pointer leaving the row does.
      _path.length = _level;
      _highlighted = next;
    });
  }

  void _edge({required bool toEnd}) {
    final List<_Row> rows = _rowsAt(_level);

    setState(() {
      _path.length = _level;
      _highlighted = _edgeOf(rows, toEnd: toEnd);
    });
  }

  /// Opens the submenu the highlight is on and lights its first row. Says
  /// whether there was one to open.
  bool _descend() {
    final List<_Row> rows = _rowsAt(_level);

    if (_highlighted < 0 || _highlighted >= rows.length) {
      return false;
    }

    final _Row row = rows[_highlighted];

    if (row.entry is! MPMenuSubmenu || _disabled(row)) {
      return false;
    }

    setState(() {
      _path
        ..length = _level
        ..add(_highlighted);
      _level += 1;
      _highlighted = _edgeOf(_rowsAt(_level), toEnd: false);
    });

    return true;
  }

  /// Closes the deepest submenu and lights the row that opened it. Says
  /// whether there was one to close.
  bool _ascend() {
    if (_level == 0) {
      return false;
    }

    setState(() {
      _level -= 1;
      _highlighted = _path[_level];
      _path.length = _level;
    });

    return true;
  }

  /// Lights a row the pointer has come onto, closing whatever was open below
  /// the level it is on, and opening the submenu it holds.
  ///
  /// The pointer moves the same highlight the arrow keys do, so the mouse and
  /// the keyboard light one row rather than two.
  void _light(int index, int level) {
    if (!_open) {
      return;
    }

    final List<_Row> rows = _rowsAt(level);

    if (index >= rows.length) {
      return;
    }

    final _Row row = rows[index];
    final bool opens = row.entry is MPMenuSubmenu && !_disabled(row);

    if (_level == level && _highlighted == index && (_path.length == level + (opens ? 1 : 0))) {
      return;
    }

    setState(() {
      _level = level;
      _highlighted = index;
      _path.length = level;

      if (opens) {
        _path.add(index);
      }
    });
  }

  void _activate() {
    final List<_Row> rows = _rowsAt(_level);

    if (_highlighted < 0 || _highlighted >= rows.length) {
      return;
    }

    final _Row row = rows[_highlighted];

    if (row.entry is MPMenuSubmenu) {
      _descend();
      return;
    }

    _press(row, _highlighted, _level);
  }

  void _press(_Row row, int index, int level) {
    if (_disabled(row)) {
      return;
    }

    switch (row.entry) {
      case final MPMenuItem item:
        item.onPressed?.call();

        if (item.closeOnPress) {
          _request(false);
        }
      case final MPMenuCheckboxItem item:
        final bool next = !_marked(row);

        if (item.checked == null) {
          setState(() => _checks[row.key] = next);
        }

        item.onChanged?.call(next);

        if (item.closeOnPress) {
          _request(false);
        }
      case final MPMenuRadioItem<Object?> item:
        final MPMenuRadioGroup<Object?> group = row.group!;

        if (!_marked(row)) {
          if (group.value == null) {
            setState(() => _choices[row.groupKey!] = item.value);
          }

          group._report(item.value);
        }

        if (item.closeOnPress) {
          _request(false);
        }
      case MPMenuSubmenu():
        setState(() {
          _level = level;
          _highlighted = index;
          _path
            ..length = level
            ..add(index);
        });
      case MPMenuGroup() || MPMenuRadioGroup<Object?>() || MPMenuSeparator():
        break;
    }
  }

  /// Jumps the highlight to the next row starting with what was typed.
  ///
  /// The same key pressed again moves on to the next row starting with it,
  /// which is how a reader walks a menu of "Copy", "Copy link", "Cut".
  void _typeahead(String character) {
    final DateTime now = DateTime.now();
    final bool fresh = now.difference(_typedAt) > _typeaheadWindow;
    _typed = fresh ? character : _typed + character;
    _typedAt = now;

    final String lowered = _typed.toLowerCase();
    final bool repeated = lowered.split('').toSet().length == 1;
    final String needle = repeated ? lowered[0] : lowered;
    final List<_Row> rows = _rowsAt(_level);

    // A run that is still being typed starts from the row it has reached, so
    // "co" stays on "Copy" rather than leaving it for "Copy link".
    final int from = repeated || _highlighted < 0 ? _highlighted + 1 : _highlighted;

    for (int step = 0; step < rows.length; step += 1) {
      final int index = (from + step) % rows.length;

      if (_labelOf(rows[index].entry).toLowerCase().startsWith(needle)) {
        if (index != _highlighted) {
          setState(() {
            _path.length = _level;
            _highlighted = index;
          });
        }

        return;
      }
    }
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is KeyUpEvent) {
      return KeyEventResult.ignored;
    }

    final MPMenuBarScope? bar = MPMenuBarScope.maybeOf(context);
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey key = event.logicalKey;
    final LogicalKeyboardKey toEnd = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey toStart = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;

    if (!_open) {
      // A shut menu opens on the arrow that points at where it opens. On a
      // column of menus the arrows along it walk the words instead, so there
      // it is the one that points across.
      if (widget.disabled || event is! KeyDownEvent) {
        return KeyEventResult.ignored;
      }

      if (bar?.orientation == MPOrientation.vertical) {
        if (key == toEnd) {
          _request(true, light: _Light.first);
          return KeyEventResult.handled;
        }

        return KeyEventResult.ignored;
      }

      if (key == LogicalKeyboardKey.arrowDown) {
        _request(true, light: _Light.first);
        return KeyEventResult.handled;
      }

      if (key == LogicalKeyboardKey.arrowUp) {
        _request(true, light: _Light.last);
        return KeyEventResult.handled;
      }

      return KeyEventResult.ignored;
    }

    if (key == LogicalKeyboardKey.arrowDown) {
      _move(1);
    } else if (key == LogicalKeyboardKey.arrowUp) {
      _move(-1);
    } else if (key == toEnd) {
      // An arrow towards the end opens a submenu, and on a row of menus that
      // has none to open it walks to the next menu along.
      if (!_descend() && bar != null && bar.orientation == MPOrientation.horizontal) {
        bar.onCross(1);
      }
    } else if (key == toStart) {
      if (!_ascend() && bar != null) {
        // On a column of menus a menu opens towards the end of the line, so
        // the arrow back towards the column closes it.
        bar.orientation == MPOrientation.horizontal ? bar.onCross(-1) : _request(false);
      }
    } else if (key == LogicalKeyboardKey.home) {
      _edge(toEnd: false);
    } else if (key == LogicalKeyboardKey.end) {
      _edge(toEnd: true);
    } else if (key == LogicalKeyboardKey.escape) {
      _request(false);
    } else if (key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter ||
        key == LogicalKeyboardKey.space) {
      _activate();
    } else if (key == LogicalKeyboardKey.tab) {
      // Tab leaves the menu, as it leaves React's: the menu closes and the
      // focus moves on from the trigger, as though the trigger had held it.
      //
      // The trigger takes the focus first and the move waits until it has:
      // a move is made from whatever holds the focus, which until then is the
      // menu's own node, and the next stop after that is the trigger.
      final FocusNode? from = _triggerNode;
      final bool back = HardwareKeyboard.instance.isShiftPressed;
      _request(false);

      if (from != null) {
        from.requestFocus();
        scheduleMicrotask(() {
          if (from.hasPrimaryFocus) {
            back ? from.previousFocus() : from.nextFocus();
          }
        });
      }
    } else {
      final String? character = event.character;

      if (character != null && character.trim().isNotEmpty && character.runes.length == 1) {
        _typeahead(character);
        return KeyEventResult.handled;
      }

      return KeyEventResult.ignored;
    }

    return KeyEventResult.handled;
  }

  /* -------------------------------------------------------------------------
   * Building
   * ----------------------------------------------------------------------- */

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPMenuTriggerBuilder? trigger = widget.trigger;

    // The keys are taken on the menu's own node round the trigger, which says
    // nothing to a screen reader: it has no name and is not a stop. The
    // trigger inside it says it holds the focus while the node does, and
    // whether the menu is open.
    final Widget anchor = Focus(
      focusNode: _focusNode,
      onKeyEvent: _onKey,
      includeSemantics: false,
      child: MPFocusHolder(
        node: _focusNode,
        holding: _holding,
        open: _open,
        child: trigger == null
            ? const SizedBox.shrink()
            : Builder(builder: (BuildContext context) => trigger(context, _openFromTrigger, _open)),
      ),
    );

    final Widget portal = MPAnchoredPortal(
      open: _open,
      side: widget.side,
      align: widget.align,
      offset: widget.sideOffset,
      onDismiss: () => _request(false),
      // While the pointer resting on it holds the menu open, a press on the
      // trigger reaches it, and keeps the menu open rather than closing it.
      anchorInside: _hoverOpened,
      popup: _popup(theme, level: 0),
      child: anchor,
    );

    if (!widget.openOnHover) {
      return portal;
    }

    // Round the portal rather than inside it, where the trigger is shielded
    // from the pointer while its menu is open.
    return MouseRegion(
      onEnter: (PointerEnterEvent event) => _enterTrigger(),
      onExit: (PointerExitEvent event) => _exitTrigger(),
      child: portal,
    );
  }

  /// One popup: the surface, its rows, and the submenu hanging off whichever
  /// row opened one.
  Widget _popup(MPThemeData theme, {required int level, String? label}) {
    final MPColorScheme colors = theme.colors;
    final (List<MPMenuEntry> items, String prefix) = _entriesAt(level);
    final List<_Row> rows = _flatten(items, prefix);

    Widget sheet = Container(
      constraints: const BoxConstraints(
        minWidth: _minPopupWidth,
        maxWidth: _maxPopupWidth,
        maxHeight: _maxPopupHeight,
      ),
      decoration: BoxDecoration(
        color: colors.surfaceContainer,
        borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
        boxShadow: MPShadows.of(2),
      ),
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: _popupPadY),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: _entries(theme, items, prefix, rows, level: level),
        ),
      ),
    );

    // As wide as its longest row, between MD3's narrowest and widest menu.
    sheet = IntrinsicWidth(child: sheet);

    sheet = Semantics(
      container: true,
      explicitChildNodes: true,
      // A menu with no rows is not announced as one: Flutter refuses an empty
      // menu outright.
      role: rows.isEmpty ? null : SemanticsRole.menu,
      label: level == 0 ? widget.semanticLabel : label,
      child: sheet,
    );

    // A press anywhere on the sheet is the sheet's, including one on a heading
    // or a rule, which would otherwise fall through to the outer menu's press
    // outside and close everything.
    sheet = Listener(behavior: HitTestBehavior.opaque, child: sheet);

    if (widget.openOnHover) {
      sheet = MouseRegion(
        onEnter: (PointerEnterEvent event) => _enterPopup(),
        onExit: (PointerExitEvent event) => _exitPopup(),
        child: sheet,
      );
    }

    return sheet;
  }

  /// The entries of one popup, with headings and rules put back between the
  /// rows.
  List<Widget> _entries(
    MPThemeData theme,
    List<MPMenuEntry> items,
    String prefix,
    List<_Row> rows, {
    required int level,
  }) {
    final List<Widget> built = <Widget>[];
    final MPSize size = _size;
    int index = 0;

    void walk(List<MPMenuEntry> entries) {
      for (final MPMenuEntry entry in entries) {
        switch (entry) {
          case MPMenuGroup(:final String? label, items: final List<MPMenuEntry> inner):
            if (label != null) {
              built.add(_heading(theme, label, size));
            }

            walk(inner);
          case MPMenuRadioGroup<Object?>(items: final List<MPMenuRadioItem<Object?>> choices):
            for (int choice = 0; choice < choices.length; choice += 1) {
              built.add(_row(theme, rows[index], index, level: level));
              index += 1;
            }
          case MPMenuSeparator():
            built.add(_rule(theme));
          case MPMenuItem() ||
              MPMenuCheckboxItem() ||
              MPMenuRadioItem<Object?>() ||
              MPMenuSubmenu():
            built.add(_row(theme, rows[index], index, level: level));
            index += 1;
        }
      }
    }

    walk(items);

    return built;
  }

  Widget _heading(MPThemeData theme, String label, MPSize size) {
    return Padding(
      padding: EdgeInsets.fromLTRB(_rowPadX[size]!, 8, _rowPadX[size]!, 4),
      child: Semantics(
        header: true,
        child: Text(label, style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant)),
      ),
    );
  }

  Widget _rule(MPThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SizedBox(height: 1, child: ColoredBox(color: theme.colors.outlineVariant)),
    );
  }

  Widget _row(MPThemeData theme, _Row row, int index, {required int level}) {
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final MPMenuEntry entry = row.entry;
    final bool disabled = _disabled(row);
    final bool lit = level == _level && index == _highlighted;
    final bool opened = level < _path.length && _path[level] == index;

    final MPColor? own = switch (entry) {
      MPMenuItem(:final MPColor? color) => color,
      MPMenuCheckboxItem(:final MPColor? color) => color,
      MPMenuRadioItem<Object?>(:final MPColor? color) => color,
      _ => null,
    };

    // A row that names its own family reads it, and so does whatever it marks
    // itself with; the rest of the menu reads the menu's.
    final MPAccent accent = colors.accent(own ?? _color);
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : own != null
        ? accent.color
        : colors.onSurface;

    final double icon = mpControlIcon[size]!;
    final Color muted = colors.onSurfaceVariant;

    Widget slot(Widget child, Color colour, {double? width}) {
      return SizedBox(
        width: width,
        child: IconTheme.merge(
          data: IconThemeData(color: colour, size: icon),
          child: Center(widthFactor: width == null ? 1 : null, heightFactor: 1, child: child),
        ),
      );
    }

    final bool marked = _marked(row);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    // The column is always there and only the mark comes and goes: a mark
    // that took its column with it would shift every label in the menu as
    // rows were ticked. It grows in on the timing `MPCheckbox` gives its own
    // tick, from 60% for a tick and from nothing for a dot.
    final Widget? leading = switch (entry) {
      MPMenuCheckboxItem() => slot(
        _Mark(
          shown: marked,
          from: 0.6,
          duration: duration,
          child: MPGlyph(MPGlyphShape.check, size: icon, color: accent.color),
        ),
        accent.color,
        width: icon,
      ),
      MPMenuRadioItem<Object?>() => slot(
        _Mark(
          shown: marked,
          from: 0,
          duration: duration,
          child: SizedBox.square(
            dimension: 10,
            child: DecoratedBox(
              decoration: BoxDecoration(color: accent.color, shape: BoxShape.circle),
            ),
          ),
        ),
        accent.color,
        width: icon,
      ),
      MPMenuItem(:final Widget? startIcon) when startIcon != null => slot(startIcon, muted),
      MPMenuSubmenu(:final Widget? startIcon) when startIcon != null => slot(startIcon, muted),
      _ => null,
    };

    final Widget? trailing = switch (entry) {
      MPMenuItem(:final Widget? endIcon) => endIcon,
      MPMenuCheckboxItem(:final Widget? endIcon) => endIcon,
      MPMenuRadioItem<Object?>(:final Widget? endIcon) => endIcon,
      _ => null,
    };

    final String? shortcut = switch (entry) {
      MPMenuItem(:final String? shortcut) => shortcut,
      MPMenuCheckboxItem(:final String? shortcut) => shortcut,
      MPMenuRadioItem<Object?>(:final String? shortcut) => shortcut,
      _ => null,
    };

    final String? description = switch (entry) {
      MPMenuItem(:final String? description) => description,
      MPMenuCheckboxItem(:final String? description) => description,
      MPMenuRadioItem<Object?>(:final String? description) => description,
      _ => null,
    };

    final TextStyle text = _rowText(theme.typescale, size).style(ink);
    final TextStyle meta = theme.typescale.bodySmall.style(muted);
    final String label = _labelOf(entry);

    final Widget body = description == null
        ? Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: text)
        : Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: text),
                Text(description, maxLines: 1, overflow: TextOverflow.ellipsis, style: meta),
              ],
            ),
          );

    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    final Widget content = Row(
      spacing: _rowGap[size]!,
      children: <Widget>[
        ?leading,
        Expanded(child: body),
        if (trailing != null) slot(trailing, muted),
        if (shortcut != null)
          Padding(
            padding: const EdgeInsetsDirectional.only(start: 8),
            child: Text(shortcut, maxLines: 1, style: meta),
          ),
        if (entry is MPMenuSubmenu)
          // Pointing at the end of the line rather than at the right, so it
          // turns round with the popup under RTL.
          slot(MPGlyph(MPGlyphShape.chevron, size: icon, quarterTurns: rtl ? 1 : -1), muted),
      ],
    );

    Widget built = _MenuRow(
      lit: lit || opened,
      disabled: disabled,
      ink: ink,
      minHeight: _rowHeight[size]!,
      padX: _rowPadX[size]!,
      onEnter: () => _light(index, level),
      onPressed: () => _press(row, index, level),
      semantics: (Widget child) => Semantics(
        container: true,
        role: switch (entry) {
          MPMenuCheckboxItem() => SemanticsRole.menuItemCheckbox,
          MPMenuRadioItem<Object?>() => SemanticsRole.menuItemRadio,
          _ => SemanticsRole.menuItem,
        },
        button: entry is MPMenuItem || entry is MPMenuSubmenu,
        checked: entry is MPMenuCheckboxItem || entry is MPMenuRadioItem<Object?> ? marked : null,
        inMutuallyExclusiveGroup: entry is MPMenuRadioItem<Object?> ? true : null,
        expanded: entry is MPMenuSubmenu ? opened : null,
        enabled: !disabled,
        label: label,
        hint: description,
        // The row keeps its own gesture off the semantics tree, so the action
        // a screen reader fires is declared on this node.
        onTap: disabled ? null : () => _press(row, index, level),
        child: ExcludeSemantics(child: child),
      ),
      child: content,
    );

    if (entry is MPMenuSubmenu) {
      built = MPAnchoredPortal(
        open: opened && _open,
        side: entry.side ?? (rtl ? MPSide.left : MPSide.right),
        align: MPAlign.start,
        offset: entry.sideOffset,
        // Built only while it is open, and that is not an optimisation: a
        // popup argument is evaluated whether or not the portal shows it, so a
        // submenu that built its own submenus unconditionally would recurse to
        // the bottom of the stack.
        popup: opened
            ? _popup(theme, level: level + 1, label: entry.label)
            : const SizedBox.shrink(),
        child: built,
      );
    }

    return built;
  }
}

/// One row: the wash under it, the pointer on it, and what it is to a screen
/// reader.
class _MenuRow extends StatefulWidget {
  const _MenuRow({
    required this.lit,
    required this.disabled,
    required this.ink,
    required this.minHeight,
    required this.padX,
    required this.onEnter,
    required this.onPressed,
    required this.semantics,
    required this.child,
  });

  /// Whether the highlight is on the row, or its submenu is open.
  final bool lit;
  final bool disabled;

  /// The row's ink, which its wash is made of.
  final Color ink;
  final double minHeight;
  final double padX;
  final VoidCallback onEnter;
  final VoidCallback onPressed;
  final Widget Function(Widget child) semantics;
  final Widget child;

  @override
  State<_MenuRow> createState() => _MenuRowState();
}

class _MenuRowState extends State<_MenuRow> {
  bool _pressed = false;

  void _setPressed(bool pressed) {
    if (_pressed != pressed) {
      setState(() => _pressed = pressed);
    }
  }

  @override
  Widget build(BuildContext context) {
    // The wash is the indicator for the pointer and the keyboard alike: the
    // highlight is what both move. There is no focus ring on a row, which
    // would draw a rectangle inside the popup on every arrow press.
    final double opacity = widget.disabled
        ? 0
        : _pressed
        ? MPStateOpacity.press
        : widget.lit
        ? MPStateOpacity.hover
        : 0;

    final Widget row = MPStateLayer(
      color: widget.ink,
      opacity: opacity,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: widget.minHeight),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: widget.padX),
          child: Align(alignment: AlignmentDirectional.centerStart, child: widget.child),
        ),
      ),
    );

    return widget.semantics(
      MouseRegion(
        cursor: widget.disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (PointerEnterEvent event) => widget.onEnter(),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          // Present on an unavailable row too, where it does nothing: the
          // recogniser is what keeps the press from going on to whatever is
          // under the popup.
          onTap: widget.onPressed,
          onTapDown: (TapDownDetails details) => _setPressed(true),
          onTapUp: (TapUpDetails details) => _setPressed(false),
          onTapCancel: () => _setPressed(false),
          child: row,
        ),
      ),
    );
  }
}

/// A tick or a dot that grows in as its row is marked and plays back out as
/// it is cleared.
class _Mark extends StatelessWidget {
  const _Mark({
    required this.shown,
    required this.from,
    required this.duration,
    required this.child,
  });

  final bool shown;

  /// The scale it grows from and shrinks back to.
  final double from;
  final Duration duration;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: shown ? 1 : 0,
      duration: duration,
      curve: MPMotion.standard,
      child: AnimatedScale(
        scale: shown ? 1 : from,
        duration: duration,
        curve: MPMotion.standard,
        child: child,
      ),
    );
  }
}
