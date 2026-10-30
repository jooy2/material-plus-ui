/// A site's navigation: a row of destinations.
library;

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// One row inside a panel: where it goes, what it is called, and a line saying
/// what is there.
@immutable
class MPNavigationMenuLink {
  /// Creates a row in a panel.
  const MPNavigationMenuLink({
    required this.title,
    this.onPressed,
    this.description,
    this.startIcon,
  });

  /// The row's name.
  final String title;

  /// Goes where the row says.
  ///
  /// There is no `href` here and no router in this package: where a
  /// destination *is* belongs to the app's own navigation, and this is where
  /// it is called. The panel closes first.
  final VoidCallback? onPressed;

  /// A second line under it, one step down the type scale and muted.
  final String? description;

  /// A glyph before the title, centred on its first line.
  final Widget? startIcon;
}

/// One word in the row, and what opens under it.
///
/// With [links] it is a trigger and a panel; with an [onPressed] and no links
/// it is a destination. The difference is not cosmetic: the second is
/// announced as a link and the first as something that expands.
@immutable
class MPNavigationMenuItem {
  /// Creates an item.
  const MPNavigationMenuItem({
    required this.label,
    this.onPressed,
    this.startIcon,
    this.value,
    this.disabled = false,
    this.columns = 1,
    this.links = const <MPNavigationMenuLink>[],
  });

  /// The word in the row.
  final String label;

  /// Makes the item a destination rather than something that opens a panel,
  /// the part React's `href` plays. Ignored on an item with [links].
  final VoidCallback? onPressed;

  /// A glyph before the label.
  final Widget? startIcon;

  /// Identifies the item in [MPNavigationMenu.onChanged]. Left out, the
  /// label does.
  final String? value;

  /// Unavailable. The word stays in the row and opens nothing.
  final bool disabled;

  /// How many columns the panel lays its links out in. Rounded down to a
  /// whole number of at least one.
  final int columns;

  /// The panel's contents.
  final List<MPNavigationMenuLink> links;

  /// What identifies the item.
  String get _key => value ?? label;

  /// Whether it opens a panel at all.
  bool get _opens => links.isNotEmpty;
}

/// The room the panel keeps round its links.
const Map<MPSize, double> _panelPad = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// Between two links in a panel, either way.
const double _panelGap = 4;

/// A site's navigation: a row of destinations, some of which open a panel of
/// more of them.
///
/// ```dart
/// MPNavigationMenu(
///   semanticLabel: 'Main',
///   items: <MPNavigationMenuItem>[
///     MPNavigationMenuItem(
///       label: 'Product',
///       links: <MPNavigationMenuLink>[
///         MPNavigationMenuLink(title: 'Overview', onPressed: openOverview),
///       ],
///     ),
///     MPNavigationMenuItem(label: 'Pricing', onPressed: openPricing),
///   ],
/// )
/// ```
///
/// ## Why this is not an MPMenu
///
/// Because of what the rows **are**. An `MPMenu` holds actions, so its rows
/// are menu items and the whole thing takes the arrow keys. This holds
/// destinations, so it is a navigation region full of links. Reach for a menu
/// when the row **does** something, and for this when the row **goes**
/// somewhere.
///
/// The row carries no surface at rest. The panel is MD3's menu surface:
/// `surfaceContainer` at elevation 2 under the `extraSmall` corner, the same
/// three decisions an `MPMenu` makes.
class MPNavigationMenu extends StatefulWidget {
  /// Creates a navigation row.
  const MPNavigationMenu({
    required this.items,
    this.orientation = MPOrientation.horizontal,
    this.initialValue,
    this.onChanged,
    this.delay = const Duration(milliseconds: 50),
    this.closeDelay = const Duration(milliseconds: 50),
    this.sideOffset = 8,
    this.size,
    this.color,
    this.semanticLabel,
    super.key,
  });

  /// The items.
  final List<MPNavigationMenuItem> items;

  /// Which way the row runs. [MPOrientation.vertical] is a rail whose panels
  /// open beside it rather than under it; the arrow keys follow either way.
  final MPOrientation orientation;

  /// Which item's panel starts open, by its [MPNavigationMenuItem.value].
  /// `null` is closed, which is what a navigation almost always wants.
  ///
  /// There is no controlled `value`. Which panel is open is the pointer's and
  /// the keyboard's state rather than the app's, and `String?` cannot tell
  /// "not controlled" from "controlled and closed", so a controlled mode would
  /// be one that could never be closed from outside.
  final String? initialValue;

  /// Called with the item whose panel opened, or `null` as it closes.
  final ValueChanged<String?>? onChanged;

  /// How long the pointer rests on an item before its panel opens. Crossing
  /// from one open panel to the next is immediate.
  final Duration delay;

  /// How long a panel the pointer opened stays after the pointer leaves.
  final Duration closeDelay;

  /// How far the panel stands off the row, in logical pixels.
  final double sideOffset;

  /// The row's height and type scale. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family an open item's label reads. The panel itself stays
  /// neutral, as MD3's menu surface does.
  final MPColor? color;

  /// The name the navigation region is announced by.
  ///
  /// No default, for the reason React gives none: a screen reader already
  /// calls an unnamed region "navigation", and a name earns its place only by
  /// telling this region from another. Which is exactly when it becomes
  /// necessary, and Flutter refuses two unnamed navigation regions on one
  /// screen outright.
  final String? semanticLabel;

  @override
  State<MPNavigationMenu> createState() => _MPNavigationMenuState();
}

class _MPNavigationMenuState extends State<MPNavigationMenu> {
  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  late String? _value = widget.initialValue;

  /// Whether the pointer resting on an item opened the panel, and nothing has
  /// pressed it since. Only such a panel closes as the pointer leaves.
  bool _hoverOpened = false;

  Timer? _openTimer;
  Timer? _closeTimer;

  /// One node per item, which the arrow keys hand the focus between.
  final List<FocusNode> _items = <FocusNode>[];

  /// The nodes the open panel's links take, as many as the longest panel
  /// opened so far has needed.
  ///
  /// Grown and never shrunk while the menu is up: a panel fading out may still
  /// hold one of them, and a node has to outlive every widget holding it.
  final List<FocusNode> _links = <FocusNode>[];

  /// The open panel's nodes, one per link.
  List<FocusNode> get _openLinks {
    final int open = _openIndex;

    return open < 0 ? const <FocusNode>[] : _links.sublist(0, widget.items[open].links.length);
  }

  @override
  void initState() {
    super.initState();
    _fit(_items, widget.items.length, 'item');
  }

  @override
  void didUpdateWidget(MPNavigationMenu oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fit(_items, widget.items.length, 'item');
  }

  @override
  void dispose() {
    _openTimer?.cancel();
    _closeTimer?.cancel();

    for (final FocusNode node in <FocusNode>[..._items, ..._links]) {
      node.dispose();
    }

    super.dispose();
  }

  void _fit(List<FocusNode> nodes, int count, String name, {bool shrink = true}) {
    while (nodes.length < count) {
      nodes.add(FocusNode(debugLabel: 'MPNavigationMenu $name ${nodes.length}'));
    }

    while (shrink && nodes.length > count) {
      nodes.removeLast().dispose();
    }
  }

  int get _openIndex {
    for (int index = 0; index < widget.items.length; index += 1) {
      if (widget.items[index]._opens && widget.items[index]._key == _value) {
        return index;
      }
    }

    return -1;
  }

  void _set(String? next, {bool hover = false}) {
    _openTimer?.cancel();
    _closeTimer?.cancel();

    if (_value == next) {
      if (!hover && _hoverOpened) {
        setState(() => _hoverOpened = false);
      }

      return;
    }

    setState(() {
      _value = next;
      _hoverOpened = next != null && hover;
    });
    widget.onChanged?.call(next);
  }

  /// The pointer arriving on an item.
  ///
  /// Crossing from one open panel to the next is immediate: the reader has
  /// already asked for a panel, and a delay there reads as the row lagging.
  /// Opening the first one waits, so a pointer passing the row on its way
  /// somewhere else does not drop a panel over the screen.
  void _hover(MPNavigationMenuItem item) {
    _closeTimer?.cancel();

    if (!item._opens || item.disabled) {
      return;
    }

    if (_value != null) {
      _set(item._key, hover: _hoverOpened);
      return;
    }

    _openTimer?.cancel();
    _openTimer = Timer(widget.delay, () {
      if (mounted) {
        _set(item._key, hover: true);
      }
    });
  }

  void _leave() {
    _openTimer?.cancel();

    if (!_hoverOpened) {
      return;
    }

    _closeTimer?.cancel();
    _closeTimer = Timer(widget.closeDelay, () {
      if (mounted && _hoverOpened) {
        _set(null);
      }
    });
  }

  /// Closes the open panel and puts the focus back on its item.
  void _closeToItem(int index) {
    _set(null);

    if (index >= 0 && index < _items.length) {
      _items[index].requestFocus();
    }
  }

  /// Opens the panel at [index] from the keyboard, and puts the focus on its
  /// first link.
  void _openInto(int index) {
    _set(widget.items[index]._key);

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      final List<FocusNode> links = _openLinks;

      if (mounted && _openIndex == index && links.isNotEmpty) {
        links.first.requestFocus();
      }
    });
  }

  int _next(int from, int by) {
    final int count = widget.items.length;
    final bool wraps = !mpArrowsMoveFocus(context);

    for (int step = 1; step < count; step += 1) {
      final int next = from + by * step;

      if (!wraps && (next < 0 || next >= count)) {
        return -1;
      }

      if (!widget.items[next % count].disabled) {
        return next % count;
      }
    }

    return -1;
  }

  /// The keys the row answers while the focus is on one of its items.
  KeyEventResult _onRowKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final int current = _items.indexWhere((FocusNode item) => item.hasPrimaryFocus);

    if (current < 0) {
      return KeyEventResult.ignored;
    }

    final bool vertical = widget.orientation == MPOrientation.vertical;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey toEnd = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey forward = vertical ? LogicalKeyboardKey.arrowDown : toEnd;
    final LogicalKeyboardKey back = vertical
        ? LogicalKeyboardKey.arrowUp
        : (rtl ? LogicalKeyboardKey.arrowRight : LogicalKeyboardKey.arrowLeft);
    final LogicalKeyboardKey into = vertical ? toEnd : LogicalKeyboardKey.arrowDown;
    final LogicalKeyboardKey key = event.logicalKey;
    final MPNavigationMenuItem item = widget.items[current];

    if (key == forward || key == back) {
      final int next = _next(current, key == forward ? 1 : -1);

      if (next >= 0) {
        if (_value != null) {
          _set(null);
        }

        _items[next].requestFocus();
      }

      return mpArrowResult(context, moved: next >= 0);
    }

    // The arrow that points at where a panel opens opens it and goes in.
    if (key == into && item._opens && !item.disabled) {
      _openInto(current);
      return KeyEventResult.handled;
    }

    // Tab from an item whose panel is open goes into the panel rather than on
    // to the next item, which is where the panel is read.
    if (key == LogicalKeyboardKey.tab &&
        !HardwareKeyboard.instance.isShiftPressed &&
        _openIndex == current &&
        _openLinks.isNotEmpty) {
      _openLinks.first.requestFocus();
      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.escape && _value != null) {
      _set(null);
      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.home || key == LogicalKeyboardKey.end) {
      final int edge = key == LogicalKeyboardKey.home
          ? _next(-1, 1)
          : _next(widget.items.length, -1);

      if (edge >= 0) {
        _items[edge].requestFocus();
      }

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  /// The keys a panel answers while the focus is on one of its links.
  KeyEventResult _onPanelKey(int index, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final List<FocusNode> links = _openLinks;
    final int current = links.indexWhere((FocusNode link) => link.hasPrimaryFocus);

    if (current < 0) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;
    final bool shift = HardwareKeyboard.instance.isShiftPressed;

    if (key == LogicalKeyboardKey.escape) {
      _closeToItem(index);
      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.arrowUp) {
      final int next = current + (key == LogicalKeyboardKey.arrowDown ? 1 : -1);

      if (next >= 0 && next < links.length) {
        links[next].requestFocus();
      }

      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.tab) {
      if (shift && current == 0) {
        // Back out of the panel to the item it hangs off, leaving it open.
        _items[index].requestFocus();
        return KeyEventResult.handled;
      }

      if (!shift && current == links.length - 1) {
        // Out of the end of the panel and on to the next item along, which
        // closes the panel behind it.
        final int next = _next(index, 1);
        _set(null);

        if (next > index) {
          _items[next].requestFocus();
        } else {
          _items[index].requestFocus();
        }

        return KeyEventResult.handled;
      }

      links[current + (shift ? -1 : 1)].requestFocus();
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final bool vertical = widget.orientation == MPOrientation.vertical;
    final int open = _openIndex;
    final double gap = mpControlGap[_size]!;

    _fit(_links, open < 0 ? 0 : widget.items[open].links.length, 'link', shrink: false);

    final List<Widget> row = <Widget>[
      for (int index = 0; index < widget.items.length; index += 1) _item(index, open: open),
    ];

    final Widget band = vertical
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: gap,
            children: row,
          )
        : Row(mainAxisSize: MainAxisSize.min, spacing: gap, children: row);

    return Semantics(
      container: true,
      role: SemanticsRole.navigation,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onKeyEvent: _onRowKey,
        child: MouseRegion(onExit: (PointerExitEvent event) => _leave(), child: band),
      ),
    );
  }

  Widget _item(int index, {required int open}) {
    final MPNavigationMenuItem item = widget.items[index];
    final bool isOpen = index == open;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    final Widget trigger = _Trigger(
      item: item,
      open: isOpen,
      size: _size,
      color: _color,
      focusNode: _items[index],
      onHover: () => _hover(item),
      onPressed: item.disabled
          ? null
          : item._opens
          ? () => _set(isOpen && !_hoverOpened ? null : item._key)
          : item.onPressed,
    );

    if (!item._opens) {
      return trigger;
    }

    return MPAnchoredPortal(
      open: isOpen,
      // A rail's panel opens beside it, at the end of the line: `MPSide` names
      // an edge of the screen, so a rail on an Arabic page would otherwise open
      // off it.
      side: widget.orientation == MPOrientation.vertical
          ? (rtl ? MPSide.left : MPSide.right)
          : MPSide.bottom,
      align: MPAlign.start,
      offset: widget.sideOffset,
      // It flips and never slides, so a panel wider than the room on its side
      // would run off the screen.
      fitWidth: true,
      onDismiss: () => _set(null),
      onEscape: () => _closeToItem(index),
      // While the pointer resting on it holds the panel open, a press on the
      // item reaches it and keeps the panel open.
      anchorInside: isOpen && _hoverOpened,
      popup: _Panel(
        item: item,
        size: _size,
        nodes: isOpen ? _openLinks : const <FocusNode>[],
        onKey: (KeyEvent event) => _onPanelKey(index, event),
        onEnter: () => _closeTimer?.cancel(),
        onExit: _leave,
        onChosen: () => _closeToItem(index),
      ),
      child: trigger,
    );
  }
}

/// One word in the row.
class _Trigger extends StatelessWidget {
  const _Trigger({
    required this.item,
    required this.open,
    required this.size,
    required this.color,
    required this.focusNode,
    required this.onHover,
    required this.onPressed,
  });

  final MPNavigationMenuItem item;
  final bool open;
  final MPSize size;
  final MPColor color;
  final FocusNode focusNode;
  final VoidCallback onHover;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double height = mpControlHeight[size]!;
    final BorderRadius radius = MPShapes.circular(theme.shapes.full, height: height);
    final double icon = mpControlIcon[size]!;

    // The open item takes the accent, which is the only place a family reaches
    // this component: the panel under it stays neutral, as MD3's menu does.
    final Color ink = item.disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : open
        ? colors.accent(color).color
        : colors.onSurface;

    return MouseRegion(
      onEnter: (PointerEnterEvent event) => onHover(),
      child: MPInteractive(
        enabled: !item.disabled,
        interactive: !item.disabled,
        focusNode: focusNode,
        onTap: onPressed,
        cursor: item.disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        builder: (BuildContext context, MPInteraction state) {
          final double layer = item.disabled
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
                  if (item.startIcon != null)
                    IconTheme.merge(
                      data: IconThemeData(color: value, size: icon),
                      child: item.startIcon!,
                    ),
                  // Cut short on a rail narrower than the word, rather than
                  // running out of the item.
                  Flexible(
                    child: Text(
                      item.label,
                      maxLines: 1,
                      softWrap: false,
                      overflow: TextOverflow.ellipsis,
                      style: mpControlText(theme.typescale, size).style(value),
                    ),
                  ),
                  if (item._opens)
                    // Drawn pointing down and turned when the panel is open.
                    // A glyph turning is not a control moving.
                    AnimatedRotation(
                      turns: open ? 0.5 : 0,
                      duration: duration,
                      curve: MPMotion.standard,
                      child: MPGlyph(MPGlyphShape.chevron, size: icon, color: value),
                    ),
                ],
              );
            },
          );

          Widget trigger = MPStateLayer(
            color: ink,
            opacity: layer,
            borderRadius: radius,
            child: SizedBox(
              height: height,
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: mpControlPadX[size]!),
                child: Center(widthFactor: 1, child: content),
              ),
            ),
          );

          trigger = CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                : null,
            child: trigger,
          );

          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          // What the word is and what pressing it does: a button that opens a
          // panel, or a link that goes somewhere.
          return Semantics(
            container: true,
            button: item._opens,
            link: !item._opens,
            expanded: item._opens ? open : null,
            enabled: !item.disabled,
            label: item.label,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: onPressed,
            child: ExcludeSemantics(child: trigger),
          );
        },
      ),
    );
  }
}

/// What opens under a word.
class _Panel extends StatelessWidget {
  const _Panel({
    required this.item,
    required this.size,
    required this.nodes,
    required this.onKey,
    required this.onEnter,
    required this.onExit,
    required this.onChosen,
  });

  final MPNavigationMenuItem item;
  final MPSize size;

  /// One node per link while the panel is open, and none while it fades out.
  final List<FocusNode> nodes;
  final KeyEventResult Function(KeyEvent event) onKey;
  final VoidCallback onEnter;
  final VoidCallback onExit;
  final VoidCallback onChosen;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final int columns = math.max(1, item.columns);

    final List<Widget> links = <Widget>[
      for (int index = 0; index < item.links.length; index += 1)
        _Link(
          link: item.links[index],
          size: size,
          focusNode: index < nodes.length ? nodes[index] : null,
          onChosen: onChosen,
        ),
    ];

    // One column is a column. More than one is a grid of equal columns whose
    // rows are as tall as their tallest link, as a CSS grid lays it out.
    final Widget body = columns == 1
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: _panelGap,
            children: links,
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: _panelGap,
            children: <Widget>[
              for (int start = 0; start < links.length; start += columns)
                IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: _panelGap,
                    children: <Widget>[
                      for (int column = 0; column < columns; column += 1)
                        Expanded(
                          child: start + column < links.length
                              ? links[start + column]
                              : const SizedBox.shrink(),
                        ),
                    ],
                  ),
                ),
            ],
          );

    return MouseRegion(
      onEnter: (PointerEnterEvent event) => onEnter(),
      onExit: (PointerExitEvent event) => onExit(),
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onKeyEvent: (FocusNode node, KeyEvent event) => onKey(event),
        // As wide as its links, up to the room on its side of the item.
        child: IntrinsicWidth(
          child: Container(
            decoration: BoxDecoration(
              color: theme.colors.surfaceContainer,
              borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
              boxShadow: MPShadows.of(2),
            ),
            clipBehavior: Clip.antiAlias,
            padding: EdgeInsets.all(_panelPad[size]!),
            child: Semantics(container: true, explicitChildNodes: true, child: body),
          ),
        ),
      ),
    );
  }
}

/// One row in a panel.
class _Link extends StatelessWidget {
  const _Link({
    required this.link,
    required this.size,
    required this.focusNode,
    required this.onChosen,
  });

  final MPNavigationMenuLink link;
  final MPSize size;
  final FocusNode? focusNode;
  final VoidCallback onChosen;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);
    final TextStyle title = mpControlText(
      theme.typescale,
      size,
    ).style(colors.onSurface).copyWith(fontWeight: FontWeight.w500);
    final double line = (title.fontSize ?? 16) * (title.height ?? 1.2);

    final VoidCallback? choose = link.onPressed == null
        ? null
        : () {
            onChosen();
            link.onPressed!();
          };

    return MPInteractive(
      onTap: choose,
      focusNode: focusNode,
      enabled: focusNode != null,
      builder: (BuildContext context, MPInteraction state) {
        Widget row = Padding(
          padding: EdgeInsets.symmetric(horizontal: mpControlPadX[size]!, vertical: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: mpControlGap[size]!,
            children: <Widget>[
              if (link.startIcon != null)
                SizedBox(
                  height: line,
                  child: Center(
                    child: IconTheme.merge(
                      data: IconThemeData(color: colors.onSurface, size: mpControlIcon[size]),
                      child: link.startIcon!,
                    ),
                  ),
                ),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  spacing: 2,
                  children: <Widget>[
                    Text(link.title, style: title),
                    if (link.description != null)
                      Text(
                        link.description!,
                        style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );

        // No ring: the panel clips, so a ring round a link would lose its
        // edges to the sheet's, and React's link draws none. The wash is the
        // indicator, a tenth of the ink for the keyboard as for a press.
        row = MPStateLayer(
          color: colors.onSurface,
          opacity: mpStateLayerOpacity(state),
          borderRadius: radius,
          child: Align(alignment: AlignmentDirectional.topStart, child: row),
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          link: true,
          label: link.title,
          hint: link.description,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: choose,
          child: ExcludeSemantics(child: row),
        );
      },
    );
  }
}
