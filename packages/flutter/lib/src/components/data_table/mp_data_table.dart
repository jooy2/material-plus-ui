/// A grid of data that sorts, searches, pages and lets rows be chosen.
library;

import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/checkbox/mp_checkbox.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/pagination/mp_pagination.dart';
import 'package:material_plus_ui/src/components/select/mp_select.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/table.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which way a column is sorted.
enum MPSortDirection {
  /// Smallest first.
  asc,

  /// Largest first.
  desc,
}

/// One key of a table's sort: a column and a direction.
@immutable
class MPDataTableSort {
  /// Sorts by the column [key] in [direction].
  const MPDataTableSort({required this.key, required this.direction});

  /// The column's key.
  final String key;

  /// Which way.
  final MPSortDirection direction;

  @override
  bool operator ==(Object other) {
    return other is MPDataTableSort && other.key == key && other.direction == direction;
  }

  @override
  int get hashCode => Object.hash(key, direction);

  @override
  String toString() => 'MPDataTableSort($key, ${direction.name})';
}

/// How many rows may be chosen at once.
enum MPDataTableSelectionMode {
  /// None: rows are not chosen.
  none,

  /// One at a time; pressing the chosen row again lets it go.
  single,

  /// Any number, with Shift extending from the last press.
  multiple,
}

/// Whether more than one column sorts at a time.
enum MPDataTableSortMode {
  /// One column: a press replaces the sort.
  single,

  /// Several: a Shift-press adds a column to the sort, and each sorted heading
  /// carries its place in the order.
  multiple,
}

/// A column of an [MPDataTable]: its heading, its width, how to get a value
/// out of a row and how to draw it.
///
/// The split between [value] and [render] is the whole shape of this type:
/// [render] decides what a reader sees, [value] what the sort and the search
/// see. A column that draws a chip needs both the moment it is sortable,
/// because a widget has no order.
@immutable
class MPDataTableColumn<T> {
  /// Creates a column.
  const MPDataTableColumn({
    required this.key,
    this.label,
    this.width,
    this.minWidth = 48,
    this.align = MPAlign.start,
    this.sortable,
    this.resizable,
    this.searchable = true,
    this.value,
    this.compare,
    this.render,
    this.exportValue,
    this.exportable = true,
  });

  /// Identifies the column to the sort and to the widths, and, unless
  /// [value] or [render] says otherwise, names the entry read off a map row.
  final String key;

  /// The heading. Defaults to the [key].
  final Widget? label;

  /// How wide, in logical pixels. Columns that do not say are measured from
  /// their content, or 160 in a resizable table.
  final double? width;

  /// How narrow a drag may make it.
  final double minWidth;

  /// Which edge the cells line up against.
  final MPAlign align;

  /// Whether this column sorts. Defaults to the table's `sortable`.
  final bool? sortable;

  /// Whether this column can be dragged wider. Defaults to the table's
  /// `resizable`.
  final bool? resizable;

  /// Whether the search looks in this column.
  final bool searchable;

  /// The value behind the cell: what is sorted and searched. Defaults to
  /// `row[key]` for a map row.
  final Object? Function(T row)? value;

  /// Orders two rows by this column, for a value the default comparison
  /// cannot rank. Always written ascending; the table reverses it.
  final int Function(T a, T b)? compare;

  /// Draws the cell. `index` is the row's place in the sorted, searched order
  /// across every page, so `(row, index) => Text('${index + 1}')` is a running
  /// row number.
  final Widget Function(T row, int index)? render;

  /// What an export writes for this cell. Defaults to [value].
  final Object? Function(T row)? exportValue;

  /// Whether an export includes this column.
  final bool exportable;
}

/// The tick column's width at each rung, wide enough that the box's focus
/// ring is not clipped.
const Map<MPSize, double> _tickWidth = <MPSize, double>{
  MPSize.xs: 36,
  MPSize.sm: 40,
  MPSize.md: 48,
  MPSize.lg: 52,
  MPSize.xl: 60,
};

/// What a column that has not said how wide it is takes in a resizable
/// table.
const double _defaultWidth = 160;

/// The floor no drag goes under.
const double _minWidth = 48;

/// A grid of data with the four things a reader does to one: put it in order,
/// cut it down, step through it and take some of it away.
///
/// ```dart
/// MPDataTable<Map<String, Object?>>(
///   headers: columns,
///   items: rows,
///   sortable: true,
///   searchable: true,
///   paged: true,
/// )
/// ```
///
/// Search, then [filter], then the sort, then the page: the only order in
/// which each step means what it says. A cell's `index` counts along the
/// sorted, searched order across every page.
///
/// ## Who holds the keyboard
///
/// A row that answers a press answers a keyboard too, and two hundred rows that
/// each did would be two hundred stops. So there is one route into a row, and
/// [checkboxes] picks it: with ticks, the tick is the control and the row is
/// not a stop; without them, the row is. [onRowPressed] alone always makes the
/// row a stop, because then there is nothing else to press.
///
/// ## The export hands you text
///
/// The React table writes a CSV file in the browser. A widgets-only package
/// cannot write a file, so the export button builds the same CSV, every row
/// the reader is looking at, sorted and searched but not paged, and hands it
/// to [onExport] to save, share or post.
class MPDataTable<T> extends StatefulWidget {
  /// Creates a data table of [items] under [headers].
  const MPDataTable({
    required this.headers,
    required this.items,
    this.getRowKey,
    this.caption,
    this.empty,
    this.locale,
    this.sortable = false,
    this.sortMode = MPDataTableSortMode.single,
    this.sort,
    this.initialSort,
    this.onSortChange,
    this.searchable = false,
    this.search,
    this.initialSearch,
    this.onSearchChange,
    this.searchLabel,
    this.filter,
    this.toolbar,
    this.paged = false,
    this.page,
    this.initialPage = 1,
    this.onPageChange,
    this.pageSize,
    this.initialPageSize = 25,
    this.onPageSizeChange,
    this.pageSizeOptions = const <int>[10, 25, 50, 100],
    this.resizable = false,
    this.columnWidths,
    this.initialColumnWidths,
    this.onColumnWidthsChange,
    this.selectionMode = MPDataTableSelectionMode.none,
    this.selected,
    this.initialSelected,
    this.onSelectedChange,
    this.checkboxes = false,
    this.onRowPressed,
    this.exportable = false,
    this.exportEscapeFormulas = true,
    this.onExport,
    this.striped = false,
    this.hoverable = false,
    this.stickyHeader = false,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.color,
    this.density,
    this.semanticLabel,
    super.key,
  });

  /// The columns, in the order they appear.
  final List<MPDataTableColumn<T>> headers;

  /// The rows.
  final List<T> items;

  /// A stable identity per row, and what [selected] is a list of.
  ///
  /// Defaults to the row's index in [items], enough for a table that only
  /// displays. Once rows can be chosen, sorted or searched it is needed in
  /// practice: an index names a position, and every one of those moves rows.
  final Object Function(T row, int index)? getRowKey;

  /// Shown above the table, and read out as its name when it is plain text
  /// and no [semanticLabel] is given.
  final Widget? caption;

  /// What to show instead of rows when nothing is left.
  final Widget? empty;

  /// Which language the table's own words are in: the ticks' names, the count,
  /// the export button.
  final String? locale;

  /// Makes every column sortable. A column overrides it with its own
  /// `sortable`.
  final bool sortable;

  /// Whether more than one column sorts at a time.
  final MPDataTableSortMode sortMode;

  /// The sort. Set it, with [onSortChange], for a controlled one.
  final List<MPDataTableSort>? sort;

  /// What an uncontrolled sort starts as. React's `defaultSort`.
  final List<MPDataTableSort>? initialSort;

  /// Called with the new sort.
  final ValueChanged<List<MPDataTableSort>>? onSortChange;

  /// Draws a field above the table that filters the rows.
  final bool searchable;

  /// The query. Set it, with [onSearchChange], for a controlled field.
  final String? search;

  /// What an uncontrolled query starts as. React's `defaultSearch`.
  final String? initialSearch;

  /// Called with the new query.
  final ValueChanged<String>? onSearchChange;

  /// The word on the field, which is also its name. A label rather than a
  /// placeholder, because a placeholder is gone the moment somebody types.
  final String? searchLabel;

  /// A filter of your own, applied after the search. `index` is the row's
  /// place in [items].
  final bool Function(T row, int index)? filter;

  /// Content at the end of the bar the search field sits in.
  final Widget? toolbar;

  /// Hands the rows out a page at a time, with the pages in the footer.
  final bool paged;

  /// The current page, 1-based. Set it, with [onPageChange], for a controlled
  /// one.
  final int? page;

  /// The page an uncontrolled table opens on. React's `defaultPage`.
  final int initialPage;

  /// Called with the new page.
  final ValueChanged<int>? onPageChange;

  /// How many rows a page holds. Set it, with [onPageSizeChange], for a
  /// controlled one.
  final int? pageSize;

  /// What an uncontrolled page size starts as. React's `defaultPageSize`.
  final int initialPageSize;

  /// Called with the new page size.
  final ValueChanged<int>? onPageSizeChange;

  /// What the footer's page-size control offers. An empty list drops it.
  final List<int> pageSizeOptions;

  /// Lets a heading be dragged wider or narrower, with a handle the keyboard
  /// reaches as well. It also fixes the layout: `width` becomes exact, and a
  /// column that has not said takes 160.
  final bool resizable;

  /// The widths, by column key. Set it, with [onColumnWidthsChange], for
  /// controlled widths.
  final Map<String, double>? columnWidths;

  /// What uncontrolled widths start as. React's `defaultColumnWidths`.
  final Map<String, double>? initialColumnWidths;

  /// Called with the new widths.
  final ValueChanged<Map<String, double>>? onColumnWidthsChange;

  /// How many rows may be chosen.
  final MPDataTableSelectionMode selectionMode;

  /// The chosen rows, as their keys. Set it, with [onSelectedChange], for a
  /// controlled selection.
  final List<Object>? selected;

  /// Which rows start chosen. React's `defaultSelected`.
  final List<Object>? initialSelected;

  /// Called with the chosen keys and the rows behind them, including rows the
  /// search has hidden and rows on other pages, which are still chosen.
  final void Function(List<Object> selected, List<T> rows)? onSelectedChange;

  /// Adds a column of ticks, and one in the heading that takes the page.
  final bool checkboxes;

  /// Called on every press of a row, before the selection changes.
  final void Function(T row, int index)? onRowPressed;

  /// Adds a button that builds the rows as CSV and hands the text to
  /// [onExport].
  final bool exportable;

  /// Puts an apostrophe in front of a cell a spreadsheet would run as a
  /// formula, one beginning `=`, `+`, `-` or `@`. A number keeps its sign.
  ///
  /// On by default: the rows were filled in by other people and the file is
  /// going to be opened in a spreadsheet. Turn it off for text going to a
  /// parser rather than to a person.
  final bool exportEscapeFormulas;

  /// Takes the CSV: every row the reader is looking at, sorted and searched
  /// but not paged, with a byte-order mark so a spreadsheet reads it as UTF-8.
  final ValueChanged<String>? onExport;

  /// Tints every other row.
  final bool striped;

  /// Lights the row under the pointer.
  final bool hoverable;

  /// Pins the heading while the body scrolls, when something constrains the
  /// table's height.
  final bool stickyHeader;

  /// How much surface the sheet paints. [MPVariant.outlined] by default.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`.
  final MPElevation? elevation;

  /// The type scale and the cell padding.
  final MPSize? size;

  /// Which accent family the sort arrows, the ticks, the export button and the
  /// pages read. The cells stay neutral, and a chosen row is
  /// `secondaryContainer`, as a chosen option is everywhere in the library.
  final MPColor? color;

  /// Takes room out of every cell without changing what it is set in.
  final MPDensity? density;

  /// The table's name for a screen reader.
  final String? semanticLabel;

  @override
  State<MPDataTable<T>> createState() => _MPDataTableState<T>();
}

/// One row of [MPDataTable.items], with what the table needs to talk about it.
class _Entry<T> {
  const _Entry(this.row, this.key, this.origin);

  final T row;
  final Object key;
  final int origin;
}

class _MPDataTableState<T> extends State<MPDataTable<T>> {
  late List<MPDataTableSort> _uncontrolledSort = List<MPDataTableSort>.of(
    widget.initialSort ?? const <MPDataTableSort>[],
  );
  late String _uncontrolledSearch = widget.initialSearch ?? '';
  late int _uncontrolledPage = widget.initialPage;
  late int _uncontrolledPageSize = widget.initialPageSize;
  late Map<String, double> _uncontrolledWidths = Map<String, double>.of(
    widget.initialColumnWidths ?? const <String, double>{},
  );
  late List<Object> _uncontrolledSelected = List<Object>.of(
    widget.initialSelected ?? const <Object>[],
  );

  /// Where the last plain press landed, which a Shift-press measures from.
  Object? _anchor;

  List<MPDataTableSort> get _sort => widget.sort ?? _uncontrolledSort;
  String get _search => widget.search ?? _uncontrolledSearch;
  int get _page => widget.page ?? _uncontrolledPage;
  int get _pageSize => widget.pageSize ?? _uncontrolledPageSize;
  Map<String, double> get _widths => widget.columnWidths ?? _uncontrolledWidths;
  List<Object> get _selected => widget.selected ?? _uncontrolledSelected;

  Object? _valueOf(MPDataTableColumn<T> column, T row) {
    return column.value != null ? column.value!(row) : mpCellValue(row, column.key);
  }

  List<_Entry<T>> get _entries {
    return <_Entry<T>>[
      for (int index = 0; index < widget.items.length; index += 1)
        _Entry<T>(
          widget.items[index],
          widget.getRowKey?.call(widget.items[index], index) ?? index,
          index,
        ),
    ];
  }

  /// What a value reads as to the search: nothing for anything that is not a
  /// plain value, so a nested map does not match its own braces.
  static String _searchText(Object? value) {
    if (value == null || value is Map || value is Iterable || value is Widget) {
      return '';
    }

    return value.toString().toLowerCase();
  }

  /// The rows the reader is looking at, searched, filtered and sorted.
  List<_Entry<T>> _ordered(List<_Entry<T>> entries) {
    final String needle = _search.trim().toLowerCase();
    final List<MPDataTableColumn<T>> searched = widget.headers
        .where((MPDataTableColumn<T> column) => column.searchable)
        .toList();

    List<_Entry<T>> found = needle.isEmpty
        ? entries
        : entries
              .where(
                (_Entry<T> entry) => searched.any(
                  (MPDataTableColumn<T> column) =>
                      _searchText(_valueOf(column, entry.row)).contains(needle),
                ),
              )
              .toList();

    if (widget.filter != null) {
      found = found.where((_Entry<T> entry) => widget.filter!(entry.row, entry.origin)).toList();
    }

    final List<int Function(_Entry<T>, _Entry<T>)> steps = <int Function(_Entry<T>, _Entry<T>)>[];

    for (final MPDataTableSort entry in _sort) {
      final MPDataTableColumn<T>? column = widget.headers
          .where((MPDataTableColumn<T> candidate) => candidate.key == entry.key)
          .firstOrNull;

      if (column == null) {
        continue;
      }

      final int sign = entry.direction == MPSortDirection.desc ? -1 : 1;

      if (column.compare != null) {
        steps.add((_Entry<T> a, _Entry<T> b) => sign * column.compare!(a.row, b.row));
      } else {
        steps.add(
          (_Entry<T> a, _Entry<T> b) =>
              _compare(_valueOf(column, a.row), _valueOf(column, b.row), sign),
        );
      }
    }

    if (steps.isEmpty) {
      return found;
    }

    // A stable sort: rows that tie keep the order they arrived in, which is
    // what a reader sorting by a second column expects of the first.
    final List<(int, _Entry<T>)> indexed = <(int, _Entry<T>)>[
      for (int index = 0; index < found.length; index += 1) (index, found[index]),
    ];

    indexed.sort(((int, _Entry<T>) a, (int, _Entry<T>) b) {
      for (final int Function(_Entry<T>, _Entry<T>) step in steps) {
        final int result = step(a.$2, b.$2);

        if (result != 0) {
          return result;
        }
      }

      return a.$1.compareTo(b.$1);
    });

    return <_Entry<T>>[for (final (int, _Entry<T>) pair in indexed) pair.$2];
  }

  /// Orders two values. A missing one goes last whichever way the column is
  /// sorted, because an empty cell is not the smallest value there is.
  static int _compare(Object? a, Object? b, int sign) {
    final bool aEmpty = a == null || a == '';
    final bool bEmpty = b == null || b == '';

    if (aEmpty || bEmpty) {
      return aEmpty && bEmpty
          ? 0
          : aEmpty
          ? 1
          : -1;
    }

    if (a is num && b is num) {
      return sign * a.compareTo(b);
    }

    if (a is bool && b is bool) {
      return sign * ((a ? 1 : 0) - (b ? 1 : 0));
    }

    if (a is DateTime && b is DateTime) {
      return sign * a.compareTo(b);
    }

    return sign * _naturalCompare(a.toString(), b.toString());
  }

  /// Text compared case-insensitively with runs of digits by their value, so
  /// `item 2` comes before `item 10`, as the React table's numeric collator
  /// orders them.
  static int _naturalCompare(String a, String b) {
    final RegExp chunk = RegExp(r'\d+|\D+');
    final List<String> left = chunk.allMatches(a.toLowerCase()).map((Match m) => m[0]!).toList();
    final List<String> right = chunk.allMatches(b.toLowerCase()).map((Match m) => m[0]!).toList();

    for (int index = 0; index < math.min(left.length, right.length); index += 1) {
      final int? x = int.tryParse(left[index]);
      final int? y = int.tryParse(right[index]);
      final int result = x != null && y != null
          ? x.compareTo(y)
          : left[index].compareTo(right[index]);

      if (result != 0) {
        return result;
      }
    }

    return left.length.compareTo(right.length);
  }

  /// The next sort after a press on [key]: ascending, then descending, then
  /// off. [additive] keeps the other keys, as a Shift-press does in multiple
  /// mode.
  static List<MPDataTableSort> _nextSort(
    List<MPDataTableSort> current,
    String key, {
    required bool additive,
  }) {
    final MPDataTableSort? existing = current
        .where((MPDataTableSort entry) => entry.key == key)
        .firstOrNull;
    final MPSortDirection? direction = existing == null
        ? MPSortDirection.asc
        : existing.direction == MPSortDirection.asc
        ? MPSortDirection.desc
        : null;

    if (!additive) {
      return direction == null
          ? <MPDataTableSort>[]
          : <MPDataTableSort>[MPDataTableSort(key: key, direction: direction)];
    }

    if (direction == null) {
      return current.where((MPDataTableSort entry) => entry.key != key).toList();
    }

    if (existing == null) {
      return <MPDataTableSort>[...current, MPDataTableSort(key: key, direction: direction)];
    }

    return <MPDataTableSort>[
      for (final MPDataTableSort entry in current)
        entry.key == key ? MPDataTableSort(key: key, direction: direction) : entry,
    ];
  }

  // Committing. Each one sets the uncontrolled value and tells the caller.

  void _commitSort(String key) {
    final bool additive =
        widget.sortMode == MPDataTableSortMode.multiple && HardwareKeyboard.instance.isShiftPressed;
    final List<MPDataTableSort> next = _nextSort(_sort, key, additive: additive);

    if (widget.sort == null) {
      setState(() => _uncontrolledSort = next);
    }

    widget.onSortChange?.call(next);
  }

  void _commitPage(int next) {
    if (widget.page == null) {
      setState(() => _uncontrolledPage = next);
    }

    widget.onPageChange?.call(next);
  }

  void _commitSearch(String next) {
    if (widget.search == null) {
      setState(() => _uncontrolledSearch = next);
    }

    // A search that cut the list shorter than the page the reader is on would
    // leave them looking at an empty page and reading it as "no matches".
    _commitPage(1);
    widget.onSearchChange?.call(next);
  }

  void _commitPageSize(int next) {
    if (widget.pageSize == null) {
      setState(() => _uncontrolledPageSize = next);
    }

    // No page under the new size starts where the reader was, so the top is
    // the one honest place to go.
    _commitPage(1);
    widget.onPageSizeChange?.call(next);
  }

  void _commitWidths(Map<String, double> next) {
    if (widget.columnWidths == null) {
      setState(() => _uncontrolledWidths = next);
    }

    widget.onColumnWidthsChange?.call(next);
  }

  /// What is now held, in the order of [MPDataTable.items] rather than the
  /// order of the presses, which drops a key whose row has gone as well.
  void _commitSelection(Set<Object> keys, List<_Entry<T>> entries) {
    final List<Object> identities = <Object>[];
    final List<T> rows = <T>[];

    for (final _Entry<T> entry in entries) {
      if (keys.contains(entry.key)) {
        identities.add(entry.key);
        rows.add(entry.row);
      }
    }

    if (widget.selected == null) {
      setState(() => _uncontrolledSelected = identities);
    }

    widget.onSelectedChange?.call(identities, rows);
  }

  void _pressRow(_Entry<T> entry, int at, List<_Entry<T>> shown, List<_Entry<T>> entries) {
    widget.onRowPressed?.call(entry.row, at);

    if (widget.selectionMode == MPDataTableSelectionMode.none) {
      return;
    }

    final Set<Object> held = _selected.toSet();

    if (widget.selectionMode == MPDataTableSelectionMode.single) {
      // Single select toggles: a row that could be chosen but never let go
      // would leave no way back to "no rows chosen".
      _anchor = entry.key;
      _commitSelection(held.contains(entry.key) ? <Object>{} : <Object>{entry.key}, entries);

      return;
    }

    if (HardwareKeyboard.instance.isShiftPressed && _anchor != null) {
      final List<Object> order = <Object>[for (final _Entry<T> row in shown) row.key];
      final int from = order.indexOf(_anchor!);
      final int to = order.indexOf(entry.key);

      if (from != -1 && to != -1) {
        // Added to what is held: a Shift-press extends a selection.
        _commitSelection(<Object>{
          ...held,
          ...order.sublist(math.min(from, to), math.max(from, to) + 1),
        }, entries);

        return;
      }
    }

    _anchor = entry.key;
    _commitSelection(
      held.contains(entry.key) ? (held..remove(entry.key)) : (held..add(entry.key)),
      entries,
    );
  }

  double _widthOf(MPDataTableColumn<T> column) {
    return _widths[column.key] ?? column.width ?? _defaultWidth;
  }

  void _resize(MPDataTableColumn<T> column, double width) {
    final double floor = math.max(_minWidth, column.minWidth);

    _commitWidths(<String, double>{..._widths, column.key: math.max(floor, width).roundToDouble()});
  }

  void _resetWidth(MPDataTableColumn<T> column) {
    _commitWidths(<String, double>{..._widths}..remove(column.key));
  }

  /// Every row the reader is looking at as CSV, sorted and searched but not
  /// paged: a file of page three is not a file anybody asked for.
  void _export(List<_Entry<T>> ordered) {
    final List<MPDataTableColumn<T>> columns = widget.headers
        .where((MPDataTableColumn<T> column) => column.exportable)
        .toList();
    final List<List<Object?>> rows = <List<Object?>>[
      <Object?>[
        for (final MPDataTableColumn<T> column in columns) mpTextOf(column.label) ?? column.key,
      ],
      for (final _Entry<T> entry in ordered)
        <Object?>[
          for (final MPDataTableColumn<T> column in columns)
            column.exportValue != null
                ? column.exportValue!(entry.row)
                : _valueOf(column, entry.row),
        ],
    ];

    widget.onExport?.call(_toCsv(rows, escapeFormulas: widget.exportEscapeFormulas));
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPDensity density = widget.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpDataTableMessages,
      locale: widget.locale,
    );
    final String emptyText = mpMessagesOf(
      context,
      mpTableMessages,
      locale: widget.locale,
    )['empty']!;
    final String searchWord =
        widget.searchLabel ??
        mpMessagesOf(context, mpTransferMessages, locale: widget.locale)['search']!;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(
      colors,
      widget.variant,
      elevation: widget.elevation,
    );
    final double hairline = paint.border?.width ?? 0;

    final List<_Entry<T>> entries = _entries;
    final List<_Entry<T>> ordered = _ordered(entries);
    final int pageSize = math.max(1, _pageSize);
    final int pages = math.max(1, (ordered.length / pageSize).ceil());
    final int page = _page.clamp(1, pages);
    final int start = widget.paged ? (page - 1) * pageSize : 0;
    final List<_Entry<T>> shown = widget.paged
        ? ordered.sublist(start, math.min(start + pageSize, ordered.length))
        : ordered;

    final bool selectable = widget.selectionMode != MPDataTableSelectionMode.none;
    final bool multiple = widget.selectionMode == MPDataTableSelectionMode.multiple;
    final bool ticks = widget.checkboxes && selectable;
    final bool rowStops = widget.onRowPressed != null || (selectable && !ticks);
    final bool pressable = selectable || widget.onRowPressed != null;
    final Set<Object> held = _selected.toSet();
    final List<Object> pageKeys = <Object>[for (final _Entry<T> entry in shown) entry.key];
    final int chosenHere = pageKeys.where(held.contains).length;
    final bool allHere = pageKeys.isNotEmpty && chosenHere == pageKeys.length;
    final String? captionName = widget.semanticLabel == null ? mpTextOf(widget.caption) : null;

    void toggleAll() {
      // The page rather than the whole set: the tick sits over what is on
      // screen, and a control that took four hundred unseen rows did
      // something else.
      final Set<Object> onPage = pageKeys.toSet();

      _commitSelection(allHere ? held.difference(onPage) : <Object>{...held, ...onPage}, entries);
    }

    final List<MPGridColumn> columns = <MPGridColumn>[
      if (ticks)
        MPGridColumn(
          id: '__mp_ticks',
          width: _tickWidth[size],
          flex: null,
          header: MPCheckbox(
            size: size,
            color: color,
            checked: allHere,
            indeterminate: chosenHere > 0 && !allHere,
            onChanged: (bool _) => toggleAll(),
            disabled: !multiple || pageKeys.isEmpty,
            semanticLabel: messages['selectAll'],
          ),
          cell: (int index) => MPCheckbox(
            size: size,
            color: color,
            checked: held.contains(shown[index].key),
            onChanged: (bool _) => _pressRow(shown[index], start + index, shown, entries),
            semanticLabel: messages['selectRow'],
          ),
        ),
      for (final MPDataTableColumn<T> column in widget.headers)
        MPGridColumn(
          id: column.key,
          width: widget.resizable || _widths.containsKey(column.key) || column.width != null
              ? _widthOf(column)
              : null,
          align: column.align,
          header: (column.sortable ?? widget.sortable)
              ? _SortHeading(
                  label: column.label ?? Text(column.key),
                  sort: _sort,
                  columnKey: column.key,
                  align: column.align,
                  accent: colors.accent(color).color,
                  onPressed: () => _commitSort(column.key),
                  size: size,
                )
              : (column.label ?? Text(column.key)),
          headerEdge: (column.resizable ?? widget.resizable)
              ? _ResizeHandle(
                  label: messages['resize']!,
                  accent: colors.accent(color).color,
                  onDrag: (double delta) => _resize(column, _widthOf(column) + delta),
                  onNudge: (double by) => _resize(column, _widthOf(column) + by),
                  onReset: () => _resetWidth(column),
                )
              : null,
          cell: (int index) {
            final T row = shown[index].row;

            return column.render?.call(row, start + index) ??
                mpDrawableCell(_valueOf(column, row)) ??
                const SizedBox.shrink();
          },
        ),
    ];

    final Widget grid = MPTableGrid(
      columns: columns,
      rowCount: shown.length,
      size: size,
      density: density,
      rowKey: (int index) => ValueKey<Object>(shown[index].key),
      // A chosen row is `secondaryContainer` whatever `color` says, the lowest
      // container tint there is, since a filled row would take the cells' own
      // contrast with it. The stripe is the neutral step under the hover.
      rowTint: (int index) {
        if (held.contains(shown[index].key)) {
          return colors.secondaryContainer;
        }

        return widget.striped && (start + index).isOdd ? colors.surfaceContainerLow : null;
      },
      empty: widget.empty ?? Text(emptyText),
      hoverable: widget.hoverable || pressable,
      onRowPressed: pressable
          ? (int index) => _pressRow(shown[index], start + index, shown, entries)
          : null,
      rowStops: rowStops,
      stickyHeader: widget.stickyHeader,
      semanticLabel: widget.semanticLabel ?? captionName,
    );

    final bool hasToolbar = widget.searchable || widget.exportable || widget.toolbar != null;
    final bool hasFooter = widget.paged || selectable;
    final TextStyle meta = theme.typescale.bodySmall.style(colors.onSurfaceVariant);

    return DecoratedBox(
      decoration: paint.decoration(radius),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        child: ClipRRect(
          borderRadius: radius - BorderRadius.circular(hairline),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (hasToolbar)
                MPTableBand(
                  size: size,
                  density: density,
                  child: Row(
                    spacing: 8,
                    children: <Widget>[
                      Expanded(
                        child: widget.searchable
                            ? MPTextField(
                                size: size,
                                value: _search,
                                onChanged: _commitSearch,
                                label: Text(searchWord),
                                fullWidth: true,
                                startIcon: _SearchGlyph(size: mpControlIcon[size]!),
                              )
                            : const SizedBox.shrink(),
                      ),
                      ?widget.toolbar,
                      if (widget.exportable)
                        MPButton(
                          size: size,
                          variant: MPVariant.text,
                          color: color,
                          onPressed: widget.onExport == null ? null : () => _export(ordered),
                          startIcon: MPGlyph(
                            MPGlyphShape.arrowRight,
                            size: mpControlIcon[size],
                            quarterTurns: 1,
                          ),
                          child: Text(messages['download']!),
                        ),
                    ],
                  ),
                ),
              if (widget.caption != null)
                ExcludeSemantics(
                  excluding: captionName != null,
                  child: MPTableBand(
                    size: size,
                    density: density,
                    child: DefaultTextStyle.merge(style: meta, child: widget.caption!),
                  ),
                ),
              Flexible(child: grid),
              if (hasFooter)
                MPTableBand(
                  size: size,
                  density: density,
                  ruleAbove: true,
                  child: DefaultTextStyle.merge(
                    style: meta,
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 8,
                      alignment: WrapAlignment.spaceBetween,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: <Widget>[
                        Wrap(
                          spacing: 12,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: <Widget>[
                            Text(
                              mpFillMessage(messages['total']!, <String, String>{
                                'total': '${ordered.length}',
                              }),
                            ),
                            if (held.isNotEmpty)
                              Text(
                                mpFillMessage(messages['selected']!, <String, String>{
                                  'count': '${held.length}',
                                }),
                                style: TextStyle(color: colors.primary),
                              ),
                          ],
                        ),
                        if (widget.paged)
                          Wrap(
                            spacing: 12,
                            runSpacing: 8,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: <Widget>[
                              if (widget.pageSizeOptions.isNotEmpty)
                                // Room for its own name: the words sit in the
                                // field, and a select as wide as two digits
                                // would have a name three lines tall.
                                SizedBox(
                                  width: 152,
                                  child: MPSelect(
                                    size: MPSize.xs,
                                    label: Text(messages['perPage']!),
                                    floatingLabel: false,
                                    fullWidth: true,
                                    value: pageSize,
                                    onChanged: (Object? next) {
                                      if (next is int) {
                                        _commitPageSize(next);
                                      }
                                    },
                                    items: <MPSelectOption>[
                                      for (final int option in widget.pageSizeOptions)
                                        MPSelectOption(value: option, label: Text('$option')),
                                    ],
                                  ),
                                ),
                              MPPagination(
                                size: MPSize.xs,
                                color: color,
                                count: pages,
                                page: page,
                                onChanged: _commitPage,
                                locale: widget.locale,
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A heading that sorts its column: a button with the label and an arrow
/// that turns, rather than swaps, with the direction.
class _SortHeading extends StatelessWidget {
  const _SortHeading({
    required this.label,
    required this.sort,
    required this.columnKey,
    required this.align,
    required this.accent,
    required this.onPressed,
    required this.size,
  });

  final Widget label;
  final List<MPDataTableSort> sort;
  final String columnKey;
  final MPAlign align;
  final Color accent;
  final VoidCallback onPressed;
  final MPSize size;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final int place = sort.indexWhere((MPDataTableSort entry) => entry.key == columnKey);
    final MPDataTableSort? entry = place == -1 ? null : sort[place];
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );
        final double arrowOpacity = entry != null
            ? 1
            : state.hovered
            ? MPStateOpacity.disabledContent
            : 0;

        return Semantics(
          container: true,
          button: true,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius, offset: 1)
                : null,
            child: DefaultTextStyle.merge(
              style: TextStyle(color: state.hovered ? colors.onSurface : null),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                spacing: 4,
                children: <Widget>[
                  Flexible(child: label),
                  // Turned, not swapped: one glyph rotated is what a reader
                  // watching the column flip actually sees happen.
                  AnimatedOpacity(
                    opacity: arrowOpacity,
                    duration: duration,
                    child: AnimatedRotation(
                      turns: entry?.direction == MPSortDirection.desc ? 0.5 : 0,
                      duration: duration,
                      curve: MPMotion.standard,
                      child: MPGlyph(
                        MPGlyphShape.arrowRight,
                        size: mpControlIcon[size]! - 6,
                        color: entry != null ? accent : null,
                        quarterTurns: -1,
                      ),
                    ),
                  ),
                  // Which key of the sort this is, only worth saying when there
                  // is more than one.
                  if (sort.length > 1 && place != -1)
                    Text('${place + 1}', style: TextStyle(color: colors.primary)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// The handle between two headings: dragged with a pointer, nudged with the
/// arrow keys (Shift for a bigger step), reset with Home or a double press.
class _ResizeHandle extends StatefulWidget {
  const _ResizeHandle({
    required this.label,
    required this.accent,
    required this.onDrag,
    required this.onNudge,
    required this.onReset,
  });

  final String label;
  final Color accent;
  final ValueChanged<double> onDrag;
  final ValueChanged<double> onNudge;
  final VoidCallback onReset;

  @override
  State<_ResizeHandle> createState() => _ResizeHandleState();
}

class _ResizeHandleState extends State<_ResizeHandle> {
  bool _dragging = false;

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final double step = HardwareKeyboard.instance.isShiftPressed ? 32 : 8;
    // Positive is always wider, so the arrow pointing away from the column
    // widens it in either writing direction.
    final double sign = Directionality.of(context) == TextDirection.rtl ? -1 : 1;

    if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
      widget.onNudge(step * sign);

      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
      widget.onNudge(-step * sign);

      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.home) {
      widget.onReset();

      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final double sign = Directionality.of(context) == TextDirection.rtl ? -1 : 1;

    // The keys are heard round the handle, where the focused node's events
    // bubble up to, rather than inside it.
    return Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onKeyEvent: _onKey,
      child: MPInteractive(
        onTap: () {},
        shortcuts: const <ShortcutActivator, Intent>{},
        cursor: SystemMouseCursors.resizeColumn,
        builder: (BuildContext context, MPInteraction state) {
          final bool lit = state.hovered || _dragging || state.focusVisible;

          return Semantics(
            container: true,
            label: widget.label,
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onDoubleTap: widget.onReset,
              onHorizontalDragStart: (_) => setState(() => _dragging = true),
              onHorizontalDragUpdate: (DragUpdateDetails details) =>
                  widget.onDrag(details.primaryDelta! * sign),
              onHorizontalDragEnd: (_) => setState(() => _dragging = false),
              child: CustomPaint(
                foregroundPainter: state.focusVisible
                    ? MPFocusRingPainter(color: colors.secondary, borderRadius: BorderRadius.zero)
                    : null,
                // Eight pixels of target for a one-pixel line: a handle that has
                // to be hit exactly is why people give up resizing columns.
                child: SizedBox(
                  width: 8,
                  child: Center(
                    child: Container(
                      width: 1,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: lit ? widget.accent : const Color(0x00000000),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// A magnifier for the search field, drawn here so the field needs no icon set.
class _SearchGlyph extends StatelessWidget {
  const _SearchGlyph({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    final Color color = IconTheme.of(context).color ?? const Color(0xFF000000);

    return ExcludeSemantics(
      child: CustomPaint(size: Size.square(size), painter: _SearchPainter(color)),
    );
  }
}

class _SearchPainter extends CustomPainter {
  const _SearchPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final double unit = size.shortestSide / 24;
    final Paint stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2 * unit
      ..strokeCap = StrokeCap.round
      ..color = color;

    canvas
      ..drawCircle(Offset(11 * unit, 11 * unit), 7 * unit, stroke)
      ..drawLine(Offset(16 * unit, 16 * unit), Offset(21 * unit, 21 * unit), stroke);
  }

  @override
  bool shouldRepaint(_SearchPainter oldDelegate) => oldDelegate.color != color;
}

/// One CSV field: quoted when it holds the separator, a quote or a line break,
/// and, with [escapeFormulas], given an apostrophe when a spreadsheet would
/// run it as a formula. A number keeps its sign.
String _csvField(Object? value, {required bool escapeFormulas}) {
  if (value == null) {
    return '';
  }

  final String raw = value is DateTime ? value.toUtc().toIso8601String() : value.toString();
  final bool formula =
      RegExp(r'^[=+\-@\t\r]').hasMatch(raw) &&
      !RegExp(r'^[+-]?[\d.,   ]*\d[\d.,   ]*$').hasMatch(raw) &&
      num.tryParse(raw) == null;
  final String text = escapeFormulas && formula ? "'$raw" : raw;

  return RegExp('["\r\n,]').hasMatch(text) ? '"${text.replaceAll('"', '""')}"' : text;
}

/// [rows] as CSV, CRLF between lines and a byte-order mark in front, which is
/// what makes a spreadsheet read the text as UTF-8.
String _toCsv(List<List<Object?>> rows, {bool escapeFormulas = true}) {
  final String body = rows
      .map(
        (List<Object?> row) =>
            row.map((Object? field) => _csvField(field, escapeFormulas: escapeFormulas)).join(','),
      )
      .join('\r\n');

  return '﻿$body';
}
