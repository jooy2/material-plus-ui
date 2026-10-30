/// A hierarchy of rows that open and shut.
library;

import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/fold_section.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How the hierarchy is drawn between the rows.
enum MPTreeViewLines {
  /// Indentation only. The quietest, and usually right for a navigation
  /// sidebar two levels deep.
  none,

  /// One hairline rail per level, the full height of the group.
  simple,

  /// The rail plus an elbow into every row, with the rail under a last child
  /// stopping at that row. The file-manager drawing, for a deep tree.
  folder,
}

/// A row's height at each rung, before density.
const Map<MPSize, double> _rowHeight = <MPSize, double>{
  MPSize.xs: 28,
  MPSize.sm: 32,
  MPSize.md: 40,
  MPSize.lg: 48,
  MPSize.xl: 56,
};

/// How far each level is set in.
const Map<MPSize, double> _indent = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 28,
};

/// A row's inline padding.
const Map<MPSize, double> _rowPadX = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// A row's height with density taken out, 4px a step, never under 24.
double _rowHeightOf(MPSize size, MPDensity density) {
  return math.max(24, _rowHeight[size]! + mpClampDensity(density) * 4);
}

/// A hierarchy of rows that open and shut: a file tree, a table of contents,
/// a sidebar's sections.
///
/// ```dart
/// MPTreeView(
///   label: 'Files',
///   initialExpanded: const <Object>['src'],
///   children: const <MPTreeItem>[
///     MPTreeItem(value: 'src', label: Text('src'), children: <MPTreeItem>[
///       MPTreeItem(value: 'main', label: Text('main.dart')),
///     ]),
///     MPTreeItem(value: 'readme', label: Text('README.md')),
///   ],
/// )
/// ```
///
/// A tree is one widget with one focus stop. Which branch is open, which row
/// is chosen and which row the stop sits on belong to the tree, not to any
/// row, which is what lets the arrow keys walk it: Up and Down move through
/// the rows that are showing, Right opens a branch and then steps into it,
/// Left shuts one and then steps out to its parent, Home and End go to the
/// ends, Enter and Space press the row. Right and Left follow the writing
/// direction.
///
/// Pressing a row chooses it and, if it is a branch, opens or shuts it as
/// well. Pressing the arrow only opens or shuts: walking a tree is not picking
/// things out of it.
class MPTreeView extends StatefulWidget {
  /// Creates a tree of [children].
  const MPTreeView({
    required this.children,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.lines = MPTreeViewLines.simple,
    this.expanded,
    this.initialExpanded,
    this.onExpandedChange,
    this.selected,
    this.initialSelected,
    this.onSelectedChange,
    this.multiple = false,
    this.disabled = false,
    this.label,
    super.key,
  });

  /// The top-level rows.
  ///
  /// [MPTreeItem]s rather than any widget, because the tree walks them to
  /// know which rows are showing and in what order the arrow keys reach them.
  final List<MPTreeItem> children;

  /// How much surface the sheet paints. [MPVariant.outlined] by default;
  /// [MPVariant.text] in a sidebar, which is already a surface.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`.
  final MPElevation? elevation;

  /// The row height and the type the labels are set in.
  final MPSize? size;

  /// Takes room out of the row height, 4px a step.
  final MPDensity? density;

  /// How the hierarchy is drawn between the rows. [MPTreeViewLines.simple] by
  /// default.
  final MPTreeViewLines lines;

  /// Which branches are open, by value. Set it, with [onExpandedChange], for a
  /// controlled tree.
  final List<Object>? expanded;

  /// Which branches start open in an uncontrolled tree. React's
  /// `defaultExpanded`.
  final List<Object>? initialExpanded;

  /// Called with the whole set of open branches whenever one opens or shuts.
  final ValueChanged<List<Object>>? onExpandedChange;

  /// Which rows are chosen, by value: a list even when only one may be, so
  /// turning [multiple] on does not change the type.
  final List<Object>? selected;

  /// Which rows start chosen in an uncontrolled tree. React's
  /// `defaultSelected`.
  final List<Object>? initialSelected;

  /// Called with the whole set of chosen rows whenever it changes.
  final ValueChanged<List<Object>>? onSelectedChange;

  /// Whether more than one row may be chosen. With it, pressing a chosen row
  /// lets it go; without it, pressing a row chooses it and only it.
  final bool multiple;

  /// Stops every row answering.
  final bool disabled;

  /// The tree's name for a screen reader.
  final String? label;

  @override
  State<MPTreeView> createState() => _MPTreeViewState();
}

/// One row as the tree walks it.
class _Visible {
  const _Visible({
    required this.key,
    required this.item,
    required this.parent,
    required this.branch,
    required this.open,
  });

  final Object key;
  final MPTreeItem item;
  final Object? parent;
  final bool branch;
  final bool open;
}

class _MPTreeViewState extends State<MPTreeView> {
  late List<Object> _uncontrolledExpanded = List<Object>.of(
    widget.initialExpanded ?? const <Object>[],
  );
  late List<Object> _uncontrolledSelected = List<Object>.of(
    widget.initialSelected ?? const <Object>[],
  );

  /// The row that holds the tree's one focus stop.
  Object? _active;

  final Map<Object, FocusNode> _nodes = <Object, FocusNode>{};

  List<Object> get _expanded => widget.expanded ?? _uncontrolledExpanded;
  List<Object> get _selected => widget.selected ?? _uncontrolledSelected;

  @override
  void dispose() {
    for (final FocusNode node in _nodes.values) {
      node.dispose();
    }

    super.dispose();
  }

  FocusNode _nodeFor(Object key) {
    return _nodes.putIfAbsent(key, () => FocusNode(debugLabel: 'MPTreeView $key'));
  }

  /// The identity of [item] at [path]: its value, or where it sits.
  static Object _keyOf(MPTreeItem item, String path) => item.value ?? path;

  /// The rows that are showing, in the order the arrow keys walk them.
  List<_Visible> _visible() {
    final List<_Visible> rows = <_Visible>[];

    void walk(List<MPTreeItem> items, String path, Object? parent) {
      for (int index = 0; index < items.length; index += 1) {
        final MPTreeItem item = items[index];
        final Object key = _keyOf(item, '$path$index');
        final bool branch = item.expandable ?? item.children.isNotEmpty;
        final bool open = branch && _expanded.contains(key);

        rows.add(_Visible(key: key, item: item, parent: parent, branch: branch, open: open));

        if (open) {
          walk(item.children, '$path$index.', key);
        }
      }
    }

    walk(widget.children, '', null);

    return rows;
  }

  void _toggle(Object key) {
    final List<Object> current = _expanded;
    final List<Object> next = current.contains(key)
        ? <Object>[
            for (final Object entry in current)
              if (entry != key) entry,
          ]
        : <Object>[...current, key];

    if (widget.expanded == null) {
      setState(() => _uncontrolledExpanded = next);
    }

    widget.onExpandedChange?.call(next);
  }

  void _select(Object key) {
    final List<Object> current = _selected;
    final List<Object> next;

    if (widget.multiple) {
      next = current.contains(key)
          ? <Object>[
              for (final Object entry in current)
                if (entry != key) entry,
            ]
          : <Object>[...current, key];
    } else {
      // A single tree keeps its row chosen: there is nothing to go back to
      // that pressing the same row again could mean.
      next = <Object>[key];
    }

    if (widget.selected == null) {
      setState(() => _uncontrolledSelected = next);
    }

    widget.onSelectedChange?.call(next);
  }

  void _focus(Object key) {
    setState(() => _active = key);
    _nodeFor(key).requestFocus();
  }

  void _press(Object key, MPTreeItem item, {required bool branch}) {
    _focus(key);
    item.onPressed?.call();

    if (branch) {
      _toggle(key);
    }

    _select(key);
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final List<_Visible> rows = _visible();
    final int index = rows.indexWhere((_Visible row) => _nodes[row.key]?.hasPrimaryFocus ?? false);

    if (index == -1) {
      return KeyEventResult.ignored;
    }

    final _Visible row = rows[index];
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey key = event.logicalKey;
    final LogicalKeyboardKey forward = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey back = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;
    final bool usable = !widget.disabled && !row.item.disabled;

    KeyEventResult move(int to) {
      if (to < 0 || to >= rows.length) {
        return mpArrowResult(context, moved: false);
      }

      _focus(rows[to].key);

      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.arrowDown) {
      return move(index + 1);
    }

    if (key == LogicalKeyboardKey.arrowUp) {
      return move(index - 1);
    }

    if (key == LogicalKeyboardKey.home) {
      return move(0);
    }

    if (key == LogicalKeyboardKey.end) {
      return move(rows.length - 1);
    }

    if (key == forward) {
      if (row.branch && !row.open) {
        if (usable) {
          _toggle(row.key);
        }

        return KeyEventResult.handled;
      }

      if (row.open) {
        return move(index + 1);
      }

      return mpArrowResult(context, moved: false);
    }

    if (key == back) {
      if (row.open) {
        if (usable) {
          _toggle(row.key);
        }

        return KeyEventResult.handled;
      }

      if (row.parent != null) {
        return move(rows.indexWhere((_Visible candidate) => candidate.key == row.parent));
      }

      return mpArrowResult(context, moved: false);
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPDensity density = widget.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(
      colors,
      widget.variant,
      elevation: widget.elevation,
    );
    final double hairline = paint.border?.width ?? 0;
    final List<_Visible> rows = _visible();

    // The stop stays on a row that is showing: the first one, until a row is
    // reached, and again whenever the row holding it is shut away.
    final Object? active = rows.any((_Visible row) => row.key == _active)
        ? _active
        : (rows.isEmpty ? null : rows.first.key);

    // Only the row holding the stop is in the tab order; the arrow keys reach
    // the rest. Rows no longer in the tree let their nodes go.
    final Set<Object> live = <Object>{};

    void mark(List<MPTreeItem> items, String path) {
      for (int index = 0; index < items.length; index += 1) {
        final Object key = _keyOf(items[index], '$path$index');

        live.add(key);
        _nodeFor(key).skipTraversal = key != active;
        mark(items[index].children, '$path$index.');
      }
    }

    mark(widget.children, '');
    _nodes.removeWhere((Object key, FocusNode node) {
      if (live.contains(key)) {
        return false;
      }

      node.dispose();

      return true;
    });

    final _TreeScope scope = _TreeScope(
      size: size,
      rowHeight: _rowHeightOf(size, density),
      indent: _indent[size]!,
      lines: widget.lines,
      disabled: widget.disabled,
      expanded: _expanded,
      selected: _selected,
      nodeFor: _nodeFor,
      press: _press,
      toggle: _toggle,
      focus: _focus,
    );

    return Semantics(
      container: true,
      label: widget.label,
      explicitChildNodes: true,
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onKeyEvent: _onKey,
        child: DecoratedBox(
          decoration: paint.decoration(radius),
          child: Padding(
            padding: EdgeInsets.all(hairline + 4),
            child: DefaultTextStyle.merge(
              style: TextStyle(color: colors.onSurface),
              child: _Group(scope: scope, items: widget.children, path: '', nested: false),
            ),
          ),
        ),
      ),
    );
  }
}

/// What every row needs from the tree, handed down the recursion.
class _TreeScope {
  const _TreeScope({
    required this.size,
    required this.rowHeight,
    required this.indent,
    required this.lines,
    required this.disabled,
    required this.expanded,
    required this.selected,
    required this.nodeFor,
    required this.press,
    required this.toggle,
    required this.focus,
  });

  final MPSize size;
  final double rowHeight;
  final double indent;
  final MPTreeViewLines lines;
  final bool disabled;
  final List<Object> expanded;
  final List<Object> selected;
  final FocusNode Function(Object key) nodeFor;
  final void Function(Object key, MPTreeItem item, {required bool branch}) press;
  final ValueChanged<Object> toggle;
  final ValueChanged<Object> focus;
}

/// One level of the tree: its rows, each with its own branch under it, and
/// the rails between them when the level is nested.
class _Group extends StatelessWidget {
  const _Group({
    required this.scope,
    required this.items,
    required this.path,
    required this.nested,
  });

  final _TreeScope scope;
  final List<MPTreeItem> items;
  final String path;
  final bool nested;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (int index = 0; index < items.length; index += 1)
          _railed(
            colors,
            rtl: rtl,
            last: index == items.length - 1,
            child: _Item(
              scope: scope,
              item: items[index],
              itemKey: _MPTreeViewState._keyOf(items[index], '$path$index'),
              path: '$path$index.',
            ),
          ),
      ],
    );
  }

  Widget _railed(
    MPColorScheme colors, {
    required bool rtl,
    required bool last,
    required Widget child,
  }) {
    if (!nested || scope.lines == MPTreeViewLines.none) {
      return child;
    }

    return CustomPaint(
      painter: _Rail(
        color: colors.outlineVariant,
        indent: scope.indent,
        rowHeight: scope.rowHeight,
        folder: scope.lines == MPTreeViewLines.folder,
        last: last,
        rtl: rtl,
      ),
      child: child,
    );
  }
}

/// The rail to the start of a nested row: half an indent back, the row's full
/// height, or down to its middle for a folder's last child, with an elbow
/// into the row when the drawing is a folder's.
class _Rail extends CustomPainter {
  const _Rail({
    required this.color,
    required this.indent,
    required this.rowHeight,
    required this.folder,
    required this.last,
    required this.rtl,
  });

  final Color color;
  final double indent;
  final double rowHeight;
  final bool folder;
  final bool last;
  final bool rtl;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;
    // Half an indent back from the row's start, which is the column the
    // parent's arrow sits over.
    final double x = rtl ? size.width + indent / 2 : -indent / 2;
    final double bottom = folder && last ? rowHeight / 2 : size.height;

    canvas.drawRect(Rect.fromLTWH(rtl ? x - 1 : x, 0, 1, bottom), paint);

    if (folder) {
      final double reach = indent / 2 - 2;

      canvas.drawRect(Rect.fromLTWH(rtl ? x - reach : x, rowHeight / 2, reach, 1), paint);
    }
  }

  @override
  bool shouldRepaint(_Rail oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.indent != indent ||
        oldDelegate.rowHeight != rowHeight ||
        oldDelegate.folder != folder ||
        oldDelegate.last != last ||
        oldDelegate.rtl != rtl;
  }
}

/// One row and, under it, its branch.
class _Item extends StatelessWidget {
  const _Item({required this.scope, required this.item, required this.itemKey, required this.path});

  final _TreeScope scope;
  final MPTreeItem item;
  final Object itemKey;
  final String path;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = scope.size;
    final bool branch = item.expandable ?? item.children.isNotEmpty;
    final bool open = branch && scope.expanded.contains(itemKey);
    final bool chosen = scope.selected.contains(itemKey);
    final bool disabled = item.disabled || scope.disabled;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final TextStyle prose = mpProseText(theme.typescale, size).style();
    final double em = prose.fontSize!;
    final BorderRadius radius = BorderRadius.circular(scope.rowHeight / 2);
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : chosen
        ? colors.onSecondaryContainer
        : colors.onSurface;
    final Color muted = disabled ? ink : colors.onSurfaceVariant;

    final Widget row = MPInteractive(
      onTap: () => scope.press(itemKey, item, branch: branch),
      enabled: true,
      interactive: !disabled,
      focusNode: scope.nodeFor(itemKey),
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      onFocusChange: (bool focused) {
        if (focused) {
          scope.focus(itemKey);
        }
      },
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        final Widget arrow = GestureDetector(
          behavior: HitTestBehavior.opaque,
          // The arrow opens and shuts without choosing the row.
          onTap: disabled || !branch
              ? null
              : () {
                  scope.focus(itemKey);
                  scope.toggle(itemKey);
                },
          // A leaf keeps the box, so every label in a branch starts on the same
          // column.
          child: SizedBox(
            width: em * 1.15,
            child: branch
                ? AnimatedRotation(
                    turns: open ? 0 : (rtl ? 0.25 : -0.25),
                    duration: duration,
                    curve: MPMotion.standard,
                    child: MPGlyph(
                      MPGlyphShape.chevron,
                      size: mpControlIcon[size]! - 6,
                      color: muted,
                    ),
                  )
                : null,
          ),
        );

        return Semantics(
          container: true,
          selected: chosen,
          expanded: branch ? open : null,
          enabled: !disabled,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: disabled ? null : () => scope.press(itemKey, item, branch: branch),
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(
                    color: colors.secondary,
                    borderRadius: radius,
                    offset: -focusRingWidth,
                  )
                : null,
            // Sized outside the animation: the fill eases, the height does not.
            child: SizedBox(
              height: scope.rowHeight,
              child: AnimatedContainer(
                duration: duration,
                curve: MPMotion.standard,
                decoration: BoxDecoration(
                  color: chosen && !disabled ? colors.secondaryContainer : const Color(0x00000000),
                  borderRadius: radius,
                ),
                child: MPStateLayer(
                  color: ink,
                  opacity: mpStateLayerOpacity(state, enabled: !disabled),
                  borderRadius: radius,
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: _rowPadX[size]!),
                    child: DefaultTextStyle.merge(
                      style: prose.copyWith(color: ink),
                      maxLines: 1,
                      softWrap: false,
                      overflow: TextOverflow.ellipsis,
                      child: IconTheme.merge(
                        data: IconThemeData(color: muted),
                        child: Row(
                          spacing: mpControlGap[size]!,
                          children: <Widget>[
                            arrow,
                            ?item.startIcon,
                            Expanded(child: item.label ?? const SizedBox.shrink()),
                            ?item.endIcon,
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );

    final Widget header = item.action == null
        ? row
        : Row(
            children: <Widget>[
              Expanded(child: row),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: _rowPadX[size]!),
                child: item.action,
              ),
            ],
          );

    if (!branch || item.children.isEmpty) {
      return header;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        header,
        MPFoldPanel(
          open: open,
          padding: EdgeInsetsDirectional.only(start: scope.indent),
          textStyle: const TextStyle(),
          child: _Group(scope: scope, items: item.children, path: path, nested: true),
        ),
      ],
    );
  }
}

/// One row of an [MPTreeView], and the rows under it.
///
/// The tree walks these to know which rows are showing, so a branch's rows are
/// [children] here rather than widgets of any kind.
class MPTreeItem extends StatelessWidget {
  /// Creates a row.
  const MPTreeItem({
    this.value,
    this.label,
    this.startIcon,
    this.endIcon,
    this.action,
    this.onPressed,
    this.expandable,
    this.disabled = false,
    this.children = const <MPTreeItem>[],
    super.key,
  });

  /// Identifies the row to [MPTreeView.expanded] and [MPTreeView.selected].
  /// Left out, the row is known by where it sits, which is enough for a tree
  /// whose shape does not change and nobody drives from code.
  final Object? value;

  /// The row's label, on one line.
  final Widget? label;

  /// Content before the label, in `onSurfaceVariant`: a folder, a file type.
  final Widget? startIcon;

  /// Content after the label.
  final Widget? endIcon;

  /// A control at the end of the row, outside the pressable area.
  final Widget? action;

  /// Called on every press of the row, before it opens and is chosen. A row
  /// that navigates calls the router from here. React's `onClick`.
  final VoidCallback? onPressed;

  /// Draws the arrow on a branch that has no rows yet, for a tree that loads
  /// its rows when a branch is opened. Defaults to whether there are
  /// [children].
  final bool? expandable;

  /// Stops this row answering, and leaves its branch as it is.
  final bool disabled;

  /// The rows in this branch.
  final List<MPTreeItem> children;

  @override
  Widget build(BuildContext context) {
    // Built on its own, a row is a tree of one.
    return MPTreeView(children: <MPTreeItem>[this]);
  }
}
