/// The strip of words at the top of an app.
library;

import 'dart:math' as math;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/menu/mp_menu.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/menu_bar.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// One menu on the bar: the word, and the rows behind it.
///
/// It has no `size` and no `color` of its own: both belong to the bar, which
/// is the only place they can be set once and hold for every menu on it. The
/// rows are the same [MPMenuEntry]s an [MPMenu] takes, because it *is* the
/// same menu.
@immutable
class MPMenubarMenu {
  /// Creates one menu on a bar.
  const MPMenubarMenu({
    required this.label,
    required this.items,
    this.startIcon,
    this.disabled = false,
  });

  /// The word on the bar.
  final String label;

  /// The rows, written exactly as they are inside an [MPMenu].
  final List<MPMenuEntry> items;

  /// A glyph before the label, in the word's ink.
  final Widget? startIcon;

  /// Unavailable. The word stays on the bar and opens nothing.
  final bool disabled;
}

/// A menu bar's own height, a rung below the control ladder at every step.
///
/// A menu bar is not a row of buttons. It is a strip of words, usually inside
/// something that already has a height of its own: a header, a toolbar, a
/// title bar. Drawn at control height, `File Edit View` would be three buttons
/// in a row, and the strip would be taller than what it sits on.
const Map<MPSize, double> _wordHeight = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 28,
  MPSize.md: 32,
  MPSize.lg: 40,
  MPSize.xl: 48,
};

/// And its inline padding, which is a word's rather than a control's.
const Map<MPSize, double> _wordPadX = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// `labelLarge` at [MPSize.md], MD3's own menu-item role and the one an
/// [MPMenu]'s rows take. The word on the bar and the rows behind it are one
/// object, and a control's `titleMedium` would make the strip read as a row of
/// buttons that happen to open lists.
MPTypeRole _wordText(MPTypescale scale, MPSize size) {
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

/// The strip of words at the top of an application, File, Edit, View, each of
/// which opens a menu.
///
/// ```dart
/// MPMenubar(
///   menus: <MPMenubarMenu>[
///     MPMenubarMenu(
///       label: 'File',
///       items: <MPMenuEntry>[MPMenuItem(label: 'New', onPressed: newFile)],
///     ),
///   ],
/// )
/// ```
///
/// What makes it a bar rather than a row of separate menus is what happens
/// once one of them is open: moving the pointer along the strip walks through
/// the others rather than closing the one you left, and the arrow keys move
/// between the menus as well as inside them. It is one thing to a screen
/// reader, a menu bar whose words are menu items, and one stop for Tab.
///
/// It draws **no surface of its own**. A menu bar sits on something, a header,
/// a title bar, a toolbar, and a sheet under a strip that is already on a sheet
/// is two sheets.
class MPMenubar extends StatefulWidget {
  /// Creates a menu bar.
  const MPMenubar({
    required this.menus,
    this.orientation = MPOrientation.horizontal,
    this.loopFocus = true,
    this.disabled = false,
    this.size,
    this.color,
    this.semanticLabel,
    super.key,
  });

  /// The menus, in order along the bar.
  final List<MPMenubarMenu> menus;

  /// Which way the bar runs. [MPOrientation.vertical] is the shape a side rail
  /// of menus takes, and its menus open beside it; the arrow keys follow it
  /// either way.
  final MPOrientation orientation;

  /// Whether the arrow keys wrap round at the ends of the bar.
  final bool loopFocus;

  /// Disables every menu on the bar at once.
  final bool disabled;

  /// The strip's height and type scale, passed on to every menu on it.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family an open menu's word reads, and which a chosen row
  /// inside it reads.
  final MPColor? color;

  /// The name a screen reader gives the bar.
  final String? semanticLabel;

  @override
  State<MPMenubar> createState() => _MPMenubarState();
}

class _MPMenubarState extends State<MPMenubar> {
  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  /// The bar's own node, where its keys are answered. It never takes focus.
  final FocusNode _bar = FocusNode(
    debugLabel: 'MPMenubar',
    canRequestFocus: false,
    skipTraversal: true,
  );

  /// One node per word, which the arrow keys hand the focus between.
  final List<FocusNode> _words = <FocusNode>[];

  /// The word that holds the bar's one tab stop.
  ///
  /// It follows the focus rather than leading it, so tabbing back onto the bar
  /// returns to the word the reader left.
  int _stop = 0;

  /// Which menu is open, or `null`. Only ever one.
  int? _open;

  /// Whether the open menu was opened from the keyboard by the bar, and so
  /// lights its first row.
  bool _lightOnOpen = false;

  @override
  void initState() {
    super.initState();
    _fitWords();
  }

  @override
  void didUpdateWidget(MPMenubar oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fitWords();

    final int? open = _open;

    if (open != null && (open >= widget.menus.length || !_enabled(open))) {
      _open = null;
    }
  }

  @override
  void dispose() {
    for (final FocusNode node in _words) {
      node.dispose();
    }

    _bar.dispose();
    super.dispose();
  }

  /// Keeps a node for every menu on the bar, and no more.
  void _fitWords() {
    while (_words.length < widget.menus.length) {
      _words.add(FocusNode(debugLabel: 'MPMenubar ${_words.length}'));
    }

    while (_words.length > widget.menus.length) {
      _words.removeLast().dispose();
    }
  }

  bool _enabled(int index) => !widget.disabled && !widget.menus[index].disabled;

  /// The word the tab stop is on: the one last focused, or the first that can
  /// take the focus when that one has gone or been disabled. -1 when none can.
  int get _resolvedStop {
    if (_stop < widget.menus.length && _enabled(_stop)) {
      return _stop;
    }

    for (int index = 0; index < widget.menus.length; index += 1) {
      if (_enabled(index)) {
        return index;
      }
    }

    return -1;
  }

  /// Whether the focus is on the menu wrapped round the word at [index].
  ///
  /// An open menu takes the keys on a node of its own, between the word and
  /// the bar. Bounded by the bar's own node, so a scope above the bar, which is
  /// an ancestor of every word too, never counts.
  bool _onMenuOf(int index) {
    final FocusNode? primary = FocusManager.instance.primaryFocus;

    return primary != null &&
        _words[index].ancestors.contains(primary) &&
        primary.ancestors.contains(_bar);
  }

  /// The word the keyboard is on, or -1 when the focus is not on the bar.
  int get _current {
    for (int index = 0; index < _words.length; index += 1) {
      if (_words[index].hasPrimaryFocus || _onMenuOf(index)) {
        return index;
      }
    }

    return -1;
  }

  /// The next word from [from] that can take the focus, [by] steps at a time,
  /// or -1. Wraps at either end when [MPMenubar.loopFocus] says so, and halts
  /// there under directional navigation, where the arrows are also the only
  /// way off the bar.
  int _next(int from, int by) {
    final int count = widget.menus.length;
    final bool wraps = widget.loopFocus && !mpArrowsMoveFocus(context);

    for (int step = 1; step < count; step += 1) {
      final int next = from + by * step;

      if (!wraps && (next < 0 || next >= count)) {
        return -1;
      }

      if (_enabled(next % count)) {
        return next % count;
      }
    }

    return -1;
  }

  void _focus(int index) {
    setState(() => _stop = index);
    _words[index].requestFocus();
  }

  /// The first word that can take the focus, or the last.
  void _edge({required bool toEnd}) {
    final int count = widget.menus.length;

    for (int step = 0; step < count; step += 1) {
      final int index = toEnd ? count - 1 - step : step;

      if (_enabled(index)) {
        _focus(index);
        return;
      }
    }
  }

  /// An open menu's arrow towards the end of the bar, or its start, which it
  /// had no submenu to spend on: the next menu along opens in its place, with
  /// its first row lit.
  void _cross(int from, int by) {
    final int next = _next(from, by);

    if (next < 0) {
      return;
    }

    setState(() {
      _stop = next;
      _open = next;
      _lightOnOpen = true;
    });
  }

  /// The pointer coming onto a word. Once a menu is open, it walks the strip:
  /// the word under the pointer opens its menu in place of the one that was.
  void _hover(int index) {
    if (_open == null || _open == index || !_enabled(index)) {
      return;
    }

    setState(() {
      _open = index;
      _lightOnOpen = false;
    });
  }

  void _openChanged(int index, bool open) {
    setState(() {
      if (open) {
        _open = index;
        _stop = index;
        _lightOnOpen = false;
      } else if (_open == index) {
        _open = null;
      }
    });
  }

  /// The keys a bar with every menu shut answers.
  ///
  /// An open menu is below this in the focus tree and answers its own arrows,
  /// <kbd>Home</kbd> and <kbd>End</kbd> first, so everything here only ever
  /// reaches a word whose menu is shut.
  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final int current = _current;

    if (current < 0) {
      return KeyEventResult.ignored;
    }

    // A row runs the way the text does, so under RTL the next word is the one
    // to the left. A column runs down in every direction.
    final bool vertical = widget.orientation == MPOrientation.vertical;
    final bool rtl = !vertical && Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey forward = vertical
        ? LogicalKeyboardKey.arrowDown
        : (rtl ? LogicalKeyboardKey.arrowLeft : LogicalKeyboardKey.arrowRight);
    final LogicalKeyboardKey back = vertical
        ? LogicalKeyboardKey.arrowUp
        : (rtl ? LogicalKeyboardKey.arrowRight : LogicalKeyboardKey.arrowLeft);

    if (event.logicalKey == forward || event.logicalKey == back) {
      final int next = _next(current, event.logicalKey == forward ? 1 : -1);

      if (next >= 0) {
        _focus(next);
      }

      // An arrow that moved nothing, past an end or with no other word to go
      // to, goes on to the focus system under directional navigation.
      return mpArrowResult(context, moved: next >= 0);
    }

    if (event.logicalKey == LogicalKeyboardKey.home) {
      _edge(toEnd: false);
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.end) {
      _edge(toEnd: true);
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final bool vertical = widget.orientation == MPOrientation.vertical;
    final int stop = _resolvedStop;
    final double gap = mpControlGap[_size]!;

    final List<Widget> words = <Widget>[
      for (int index = 0; index < widget.menus.length; index += 1) _menu(index, stop: stop),
    ];

    final Widget bar = vertical
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: gap,
            children: words,
          )
        : Row(mainAxisSize: MainAxisSize.min, spacing: gap, children: words);

    return Focus(
      focusNode: _bar,
      onKeyEvent: _onKey,
      includeSemantics: false,
      child: Semantics(
        container: true,
        // Flutter refuses an empty menu bar outright.
        role: widget.menus.isEmpty ? null : SemanticsRole.menuBar,
        explicitChildNodes: true,
        label: widget.semanticLabel,
        child: bar,
      ),
    );
  }

  Widget _menu(int index, {required int stop}) {
    final MPMenubarMenu menu = widget.menus[index];
    final bool disabled = !_enabled(index);
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final bool vertical = widget.orientation == MPOrientation.vertical;

    // One stop for the whole bar: every other word stays in the focus tree, so
    // the arrow keys can reach it, and out of the order Tab walks.
    _words[index].skipTraversal = index != stop;

    return MouseRegion(
      // Round the menu rather than inside it, where an open menu shields its
      // own trigger from the pointer.
      onEnter: (PointerEnterEvent event) => _hover(index),
      child: MPMenuBarScope(
        orientation: widget.orientation,
        lightOnOpen: _lightOnOpen && _open == index,
        onCross: (int by) => _cross(index, by),
        child: MPMenu(
          items: menu.items,
          size: _size,
          color: _color,
          disabled: disabled,
          open: _open == index,
          onOpenChange: (bool open) => _openChanged(index, open),
          // A column's menus open beside it, at the end of the line.
          side: vertical ? (rtl ? MPSide.left : MPSide.right) : MPSide.bottom,
          semanticLabel: menu.label,
          trigger: (BuildContext context, VoidCallback open, bool isOpen) => _Word(
            menu: menu,
            open: isOpen,
            disabled: disabled,
            size: _size,
            color: _color,
            focusNode: _words[index],
            onFocusChange: (bool focused) {
              if (focused && _stop != index) {
                setState(() => _stop = index);
              }
            },
            onPressed: open,
          ),
        ),
      ),
    );
  }
}

/// One word on the strip.
class _Word extends StatelessWidget {
  const _Word({
    required this.menu,
    required this.open,
    required this.disabled,
    required this.size,
    required this.color,
    required this.focusNode,
    required this.onFocusChange,
    required this.onPressed,
  });

  final MPMenubarMenu menu;
  final bool open;
  final bool disabled;
  final MPSize size;
  final MPColor color;
  final FocusNode focusNode;
  final ValueChanged<bool> onFocusChange;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    // The one thing a menu bar has to make legible from across the strip is
    // which word is open, and it is still colour and nothing else: the word
    // does not move and the strip does not change height.
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : open
        ? colors.accent(color).color
        : colors.onSurface;

    return MPInteractive(
      enabled: !disabled,
      interactive: !disabled,
      focusNode: focusNode,
      onFocusChange: onFocusChange,
      onTap: onPressed,
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        // The open word keeps a hover's wash for as long as its menu is up, so
        // the strip still says which one it is once the pointer is in the menu.
        final double layer = disabled
            ? 0
            : math.max(mpStateLayerOpacity(state), open ? MPStateOpacity.hover : 0);

        final Widget content = TweenAnimationBuilder<Color?>(
          tween: ColorTween(end: ink),
          duration: duration,
          curve: MPMotion.standard,
          builder: (BuildContext context, Color? value, Widget? child) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              spacing: mpControlGap[size]!,
              children: <Widget>[
                if (menu.startIcon != null)
                  IconTheme.merge(
                    data: IconThemeData(color: value, size: mpControlIcon[size]),
                    child: menu.startIcon!,
                  ),
                Flexible(
                  child: Text(
                    menu.label,
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.ellipsis,
                    style: _wordText(theme.typescale, size).style(value),
                  ),
                ),
              ],
            );
          },
        );

        Widget word = MPStateLayer(
          color: ink,
          opacity: layer,
          borderRadius: radius,
          child: SizedBox(
            height: _wordHeight[size],
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: _wordPadX[size]!),
              child: Center(widthFactor: 1, child: content),
            ),
          ),
        );

        word = CustomPaint(
          // Drawn inside the word rather than round it, the one place the
          // library turns a ring inward: a strip of words has no gaps to draw
          // one in, so a ring outside would be painted under the next word.
          foregroundPainter: state.focusVisible
              ? MPFocusRingPainter(
                  color: colors.secondary,
                  borderRadius: radius,
                  offset: -focusRingWidth,
                )
              : null,
          child: word,
        );

        // Said on the word's own node, which is in here. A word that is not
        // the bar's stop is skipped by Tab but still takes the focus from the
        // arrow keys, so it says it can.
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          role: SemanticsRole.menuItem,
          button: true,
          enabled: !disabled,
          expanded: open,
          label: menu.label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: disabled ? null : onPressed,
          // The label is said once, by the node; the word under it would
          // otherwise arrive as a second copy of itself.
          child: ExcludeSemantics(child: word),
        );
      },
    );
  }
}
