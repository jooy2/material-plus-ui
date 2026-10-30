/// The grid two tables draw, and the reason it is written once.
///
/// [MPTable] draws a grid it is given; `MPDataTable` sorts, filters and pages
/// its own rows and then draws one. Everything below the columns is the same in
/// both — the measured column widths, the hover band, the one focus stop per
/// row, the rule between rows and the header pinned over the scroll — and two
/// copies of that is how the rows under a sorted table end up a shade off the
/// rows under a plain one.
///
/// What the two do differently is above it: what a column *is*, where the rows
/// came from, and what else the sheet holds. So this takes a column list that
/// has already forgotten the row type, and asks the caller what colour each row
/// should be rather than deciding it here.
library;

import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/keyboard_scroll.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A cell's inline padding at each rung, the sheet's own track: `md` is the
/// 16px a card is padded by.
const Map<MPSize, double> _cellPadX = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 12,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// A row's block padding at each rung. Material's data table row is 52dp, and
/// `bodyMedium` is a 20px line box, so 20 plus 16 either side is 52 at `md`.
const Map<MPSize, double> _cellPadY = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 10,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// A cell's inline padding at [size], two pixels a face off per density step,
/// down to 6px, where two numbers in neighbouring columns start touching.
double mpCellPadX(MPSize size, MPDensity density) {
  return math.max(6, _cellPadX[size]! + mpClampDensity(density) * 2);
}

/// A cell's block padding at [size], two pixels a face off per density step,
/// down to 4px, which keeps the shortest row on the 24px floor.
double mpCellPadY(MPSize size, MPDensity density) {
  return math.max(4, _cellPadY[size]! + mpClampDensity(density) * 2);
}

/// What a cell is set in: Material's data table puts its cells in Body 2,
/// which MD3 calls `bodyMedium`, stepping down and up the scale at the ends.
MPTypeRole mpCellText(MPTypescale scale, MPSize size) {
  return switch (size) {
    MPSize.xs || MPSize.sm => scale.bodySmall,
    MPSize.md || MPSize.lg => scale.bodyMedium,
    MPSize.xl => scale.bodyLarge,
  };
}

/// What a column heading is set in: Subtitle 2, MD3's `titleSmall`, the cell's
/// size one weight up, so a heading reads as a heading without changing the
/// column's measure.
MPTypeRole mpHeadText(MPTypescale scale, MPSize size) {
  return switch (size) {
    MPSize.xs || MPSize.sm => scale.labelMedium,
    MPSize.md || MPSize.lg => scale.titleSmall,
    MPSize.xl => scale.titleMedium,
  };
}

/// A cell's raw value as a widget, if it is something a cell can draw, and
/// nothing if it is not.
///
/// Without a `render`, a cell is `row[key]`, and the row is the caller's own
/// type, so that value is genuinely anything. Text, numbers and booleans are
/// drawn as text and a widget as itself; a date, a nested map or a list draws
/// an empty cell rather than a string nobody asked for. The column has
/// `render` for the case where it is something else.
Widget? mpDrawableCell(Object? value) {
  if (value == null) {
    return null;
  }

  if (value is Widget) {
    return value;
  }

  if (value is String || value is num || value is bool || value is BigInt) {
    return Text(value.toString());
  }

  return null;
}

/// `row[key]`, when the row is a map that can be read that way.
Object? mpCellValue(Object? row, String key) {
  return row is Map ? row[key] : null;
}

/// The room the "nothing here" line keeps above and below itself.
///
/// Deliberately much more than a row's padding: an empty table is a shape with
/// a hole in it, and a hole one line tall reads as a row that failed to render
/// rather than as an answer.
const double mpTableEmptyPaddingY = 32;

/// One column of the grid, with the row type already closed over.
@immutable
class MPGridColumn {
  /// Creates a column.
  const MPGridColumn({
    required this.cell,
    this.id,
    this.header,
    this.width,
    this.flex = 1,
    this.align = MPAlign.start,
    this.headerEdge,
  });

  /// Builds the cell for the row at [index].
  final Widget Function(int index) cell;

  /// What the column is known by from one build to the next, so what its cells
  /// hold stays with it as a column is put in front of it or taken away.
  ///
  /// Left out, a column is known by its place among the columns that have no
  /// id either.
  final Object? id;

  /// The heading, already wearing whatever the caller wanted it to wear.
  final Widget? header;

  /// A fixed width, in logical pixels.
  final double? width;

  /// How much of the leftover width this column takes, once every column has
  /// room for its content.
  ///
  /// `null` keeps the column out of the share-out entirely: it is as wide as
  /// its widest cell and no wider, which is what a column holding a control
  /// rather than data wants.
  final double? flex;

  /// Which edge the cell's content lines up against.
  final MPAlign align;

  /// Drawn along the header cell's end edge, the cell's full height and
  /// outside its padding: a data table's resize handle.
  final Widget? headerEdge;
}

/// The grid itself: the header row, the rows, and everything that happens to a
/// row when a pointer or a keyboard reaches it.
///
/// Laid out by Flutter's own [Table], which is also where the table, row, cell
/// and column-header semantics come from. Every column is measured from the
/// content in it, exactly as a browser's automatic table layout is, so the same
/// data comes out the same shape in both packages.
class MPTableGrid extends StatefulWidget {
  /// Creates a grid.
  const MPTableGrid({
    required this.columns,
    required this.rowCount,
    required this.size,
    required this.density,
    this.rowKey,
    this.rowTint,
    this.empty,
    this.hoverable = false,
    this.onRowPressed,
    this.stickyHeader = false,
    this.maxHeight,
    this.semanticLabel,
    this.rowStops = true,
    super.key,
  });

  /// The columns, in the order they appear.
  final List<MPGridColumn> columns;

  /// How many rows there are.
  final int rowCount;

  /// Type scale and cell padding, already resolved against the theme.
  final MPSize size;

  /// How tightly the rows pack.
  final MPDensity density;

  /// A stable key per row.
  final LocalKey Function(int index)? rowKey;

  /// What colour a row rests at — striping, selection, anything the caller
  /// wants to say about a row. The hover band wins over whatever it returns,
  /// because a reader pointing at a row is asking about *that* row.
  final Color? Function(int index)? rowTint;

  /// What is shown instead of rows when there are none.
  final Widget? empty;

  /// Lights the row under the pointer.
  final bool hoverable;

  /// Makes rows activatable, and turns on the hover treatment with them.
  final void Function(int index)? onRowPressed;

  /// Pins the column names to the top of the grid while the rows scroll under
  /// them.
  ///
  /// A pinned header means two grids, and two grids each measured from their
  /// own content cannot agree on a column width — so what is drawn is **not**
  /// a second grid. There is one [Table] with its header row in it, and the
  /// pinned band is a copy of that row laid over the top of the scroll, each of
  /// its cells given the width the real header cell beside it was laid out at.
  /// One grid still decides every column; the band only repeats what it decided.
  final bool stickyHeader;

  /// A hard cap on the grid's height, in logical pixels.
  final double? maxHeight;

  /// Whether a pressable row is also a focus stop.
  ///
  /// A data table with a column of ticks keeps its rows pressable by a pointer
  /// and gives the keyboard the tick instead, so a table of two hundred rows is
  /// not four hundred stops.
  final bool rowStops;

  /// The name a screen reader gives the table, and the stop its rows scroll
  /// from the keyboard at.
  final String? semanticLabel;

  @override
  State<MPTableGrid> createState() => _MPTableGridState();
}

class _MPTableGridState extends State<MPTableGrid> {
  /// Which row the pointer is over, and which one the keyboard is on.
  ///
  /// Two values rather than one interaction state, because a table's row is not
  /// a widget: the cells inside it are what the pointer and the focus actually
  /// reach, so the row state has to live above them. And held in notifiers
  /// rather than in this state, because a [Table] that is built again lays every
  /// row out again, measuring each column from all of its cells. The bands are
  /// painted behind the grid by [_RowBands], which listens and repaints; the
  /// grid is left alone.
  final ValueNotifier<int?> _hovered = ValueNotifier<int?>(null);
  final ValueNotifier<int?> _focused = ValueNotifier<int?>(null);

  /// The grid, so the bands can be told where its rows were laid out.
  final GlobalKey _gridKey = GlobalKey();

  /// One key per column, on the real header's cells, so the pinned band can be
  /// given the widths the grid actually laid out. Held by the column's identity
  /// and kept in the columns' order.
  Map<Object, GlobalKey> _headerKeys = <Object, GlobalKey>{};

  /// One key per cell, by its row's identity and its column's.
  Map<(Object, Object), GlobalKey> _cellKeys = <(Object, Object), GlobalKey>{};

  /// Those widths, once they have been read.
  List<double>? _columnWidths;

  /// Whether a measurement is waiting for the end of the frame, so that it is
  /// taken once however many headings were laid out at a new width.
  bool _measuring = false;

  /// The view the rows scroll in, which the keyboard moves as well.
  final ScrollController _scroll = ScrollController();

  /// The view the grid scrolls sideways in once its columns need more room
  /// than the sheet has, which the keyboard moves as well.
  final ScrollController _sideways = ScrollController();

  /// How wide the sheet is, handed across the sideways view to the grid.
  final _SheetWidth _sheet = _SheetWidth();

  /// Which row the pointer is over, whether or not the grid lights it.
  ///
  /// Followed all the time, so a grid that starts lighting rows lights the one
  /// the pointer is already resting on, and handed to [_hovered] only while the
  /// grid lights rows, so a grid that does not is never painted again for it.
  int? _pointerRow;

  bool get _interactive => widget.onRowPressed != null;

  /// Whether the pointer lights a row at all.
  bool get _lit => widget.hoverable || _interactive;

  @override
  void dispose() {
    _hovered.dispose();
    _focused.dispose();
    _scroll.dispose();
    _sideways.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(MPTableGrid oldWidget) {
    super.didUpdateWidget(oldWidget);

    final bool pinning = widget.stickyHeader && !oldWidget.stickyHeader;

    // The columns changed under the measurement, so it is worth nothing. Nor is
    // one taken before the band was last turned off, since nothing was measured
    // while the rows, the headings or the text changed.
    if (widget.columns.length != oldWidget.columns.length || pinning) {
      _columnWidths = null;
    }

    // A heading laid out at a new width asks for a measurement of its own. A
    // column that goes, or changes places with another, can leave every
    // heading at the width it had, so the columns are checked here as well.
    if (widget.stickyHeader &&
        (pinning || !listEquals(_columnIdsOf(widget.columns), _columnIdsOf(oldWidget.columns)))) {
      _scheduleMeasure();
    }

    // The row under the pointer lights up or goes out as the grid starts or
    // stops lighting rows, and a ring goes with the rows' focus stops.
    _hovered.value = _lit ? _pointerRow : null;

    if (!_interactive) {
      _focused.value = null;
    }
  }

  /// What each column is known by: the id it was given, or its place among the
  /// columns given none, told apart from any column before it that was given
  /// the same.
  List<Object> _columnIdsOf(List<MPGridColumn> columns) {
    final seen = <Object?, int>{};

    return <Object>[
      for (final column in columns)
        (column.id, seen.update(column.id, (int count) => count + 1, ifAbsent: () => 0)),
    ];
  }

  /// Reads the widths once the frame that laid them out is over, while there
  /// is a band to hand them to.
  ///
  /// After the frame, because the answer rebuilds the grid that is being laid
  /// out, and at most once a frame. The band it rebuilds lies over the grid
  /// rather than in it, so nothing it does lays a heading out again, and the
  /// measurement asks for no other.
  void _scheduleMeasure() {
    if (_measuring || !widget.stickyHeader) {
      return;
    }

    _measuring = true;
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      _measuring = false;
      _measure();
    });
  }

  /// Reads how wide the grid actually laid each column out.
  ///
  /// Measured rather than computed, which is the whole of why a pinned header
  /// is possible at all: the widths belong to the one [Table] that owns every
  /// row, and a band that asks it for them cannot disagree with it.
  void _measure() {
    if (!mounted || !widget.stickyHeader) {
      return;
    }

    final next = <double>[];

    for (final key in _headerKeys.values) {
      final box = key.currentContext?.findRenderObject() as RenderBox?;

      if (box == null || !box.hasSize) {
        return;
      }

      next.add(box.size.width);
    }

    if (_columnWidths == null || !listEquals(_columnWidths, next)) {
      setState(() => _columnWidths = next);
    }
  }

  void _press(int index) {
    widget.onRowPressed?.call(index);
  }

  void _hover(int index, {required bool over}) {
    if (over) {
      _pointerRow = index;
    } else if (_pointerRow == index) {
      _pointerRow = null;
    }

    _hovered.value = _lit ? _pointerRow : null;
  }

  void _focus(int index, {required bool visible}) {
    // A row that cannot be pressed is no stop, so what has the focus is a
    // control inside its first cell, which draws its own ring.
    if (visible && _interactive) {
      _focused.value = index;
    } else if (_focused.value == index) {
      _focused.value = null;
    }
  }

  /// A cell's own box: the padding, the alignment and — for a row that answers
  /// a press — the pointer and the keyboard.
  ///
  /// The gesture and the mouse region are outside the padding on purpose. A row
  /// is pressed anywhere on it, including the space between the text and the
  /// rule under it, and a hit region that stopped at the glyphs would be a row
  /// that ignores most of itself.
  ///
  /// The same widgets above the content of a row's cell whether the row can be
  /// pressed, is lit by the pointer, or neither, with the difference in their
  /// flags. A cell wrapped only while its row could be pressed or lit was built
  /// again from scratch as `onRowPressed` or `hoverable` came or went, and a
  /// field in it lost what was typed into it. A row that cannot be pressed
  /// claims no tap, keeps the cursor of whatever is under it, and is no stop.
  ///
  /// [key] goes on the part of a row's cell that is the same in every column,
  /// inside the stop the first one has, so that a cell moving into the first
  /// column or out of it takes its element along.
  Widget _cell(
    Widget content, {
    required MPAlign align,
    required EdgeInsets padding,
    int? row,
    bool first = false,
    Key? key,
  }) {
    Widget cell = Padding(
      padding: padding,
      child: Align(
        alignment: switch (align) {
          MPAlign.start => AlignmentDirectional.centerStart,
          MPAlign.center => Alignment.center,
          MPAlign.end => AlignmentDirectional.centerEnd,
        },
        child: content,
      ),
    );

    if (row == null) {
      return cell;
    }

    final bool interactive = _interactive;

    cell = MouseRegion(
      key: key,
      cursor: interactive ? SystemMouseCursors.click : MouseCursor.defer,
      onEnter: (_) => _hover(row, over: true),
      onExit: (_) => _hover(row, over: false),
      child: GestureDetector(
        // `null` is the detector's own default, which claims nothing its
        // content does not.
        behavior: interactive ? HitTestBehavior.opaque : null,
        onTap: interactive ? () => _press(row) : null,
        child: cell,
      ),
    );

    if (!first) {
      return cell;
    }

    // One focus stop per row, and it lives in the row's first cell — the only
    // place it can, since the row itself is not a widget. What it lights is the
    // whole row, because the ring is painted round the row behind the grid.
    return _RowStop(
      pressable: interactive && widget.rowStops,
      onPressed: () => _press(row),
      onFocusVisible: (bool visible) => _focus(row, visible: visible),
      child: cell,
    );
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size;
    final double padX = mpCellPadX(size, widget.density);
    final EdgeInsets padding = EdgeInsets.symmetric(
      horizontal: padX,
      vertical: mpCellPadY(size, widget.density),
    );

    // One rule, above every row: `outlineVariant`, the quieter of MD3's two
    // outlines and the one a divider takes. The header is told apart by its
    // neutral band rather than by a firmer line.
    final BorderSide rowRule = BorderSide(color: colors.outlineVariant);
    // The header takes a neutral surface rather than a tint: a coloured band
    // behind a row of column names is the fastest way to make data look like
    // chrome.
    final Color headFill = colors.surfaceContainer;

    /// One header cell's content, built the same way for the grid and for the
    /// band pinned over it — the band is a *copy* of the header, so anything
    /// written twice here is somewhere the two could come out different.
    Widget headerCell(MPGridColumn column) {
      final Widget cell = _cell(
        DefaultTextStyle.merge(
          style: mpHeadText(theme.typescale, size).style(colors.onSurfaceVariant),
          maxLines: 1,
          softWrap: false,
          overflow: TextOverflow.ellipsis,
          // A heading is announced with every cell under it, which is most of
          // what makes a grid of numbers readable without eyes.
          child: Semantics(
            container: true,
            role: SemanticsRole.columnHeader,
            child: column.header ?? const SizedBox.shrink(),
          ),
        ),
        align: column.align,
        padding: padding,
      );

      if (column.headerEdge == null) {
        return cell;
      }

      return Stack(
        children: <Widget>[
          cell,
          PositionedDirectional(top: 0, bottom: 0, end: 0, child: column.headerEdge!),
        ],
      );
    }

    // Every cell is keyed by its column, so what it holds stays with its column
    // as a column is put in front of it or taken away, a data table's ticks
    // above all. Matched by place, each cell took over the element of the one
    // that was there before: one of another kind was built from scratch, and
    // one of the same kind was handed its neighbour's state.
    //
    // Global keys, for two reasons. A [Table] wants every cell's key different
    // from every other cell's, across rows as well, so a key is the row's and
    // the column's together. And the first cell of a row is inside the row's
    // focus stop, so the column that stops being first, or starts, moves in or
    // out of the stop, and only a global key takes its element with it.
    final List<Object> columnIds = _columnIdsOf(widget.columns);
    final headerKeys = <Object, GlobalKey>{
      for (final id in columnIds) id: _headerKeys[id] ?? GlobalKey(),
    };
    final cellKeys = <(Object, Object), GlobalKey>{};

    GlobalKey cellKey(Object row, Object column) {
      return cellKeys[(row, column)] = _cellKeys[(row, column)] ?? GlobalKey();
    }

    TableRow dataRow(int index) {
      final LocalKey? key = widget.rowKey?.call(index);
      // A row with no key is matched by its place, and so are its cells.
      final Object rowId = key ?? index;

      return TableRow(
        key: key,
        children: <Widget>[
          for (var column = 0; column < widget.columns.length; column += 1)
            _cell(
              widget.columns[column].cell(index),
              align: widget.columns[column].align,
              padding: padding,
              row: index,
              first: column == 0,
              key: cellKey(rowId, columnIds[column]),
            ),
        ],
      );
    }

    final grid = Table(
      key: _gridKey,
      columnWidths: <int, TableColumnWidth>{
        for (var index = 0; index < widget.columns.length; index += 1)
          index: switch (widget.columns[index].width) {
            final double width => FixedColumnWidth(width),
            // Measured from the content, exactly as a browser's automatic table
            // layout measures it, and then handed a share of whatever the sheet
            // has left over.
            null => IntrinsicColumnWidth(flex: widget.columns[index].flex),
          },
      },
      // Every cell is as tall as the tallest one in its row, so a row that
      // answers a press answers on all of itself rather than only on the line
      // of text that happens to be longest.
      defaultVerticalAlignment: TableCellVerticalAlignment.intrinsicHeight,
      children: <TableRow>[
        TableRow(
          decoration: BoxDecoration(color: headFill),
          children: <Widget>[
            for (var index = 0; index < widget.columns.length; index += 1)
              // Keyed by the column, as every cell is, and read as well: the
              // pinned band is told how wide the grid laid this column out.
              // Every column's width is its heading's, so a heading laid out
              // at a new width is the one thing that moves the band: a longer
              // cell, a new heading, a new text scale, a new width for the
              // grid.
              KeyedSubtree(
                key: headerKeys[columnIds[index]],
                child: _WidthReport(
                  onChanged: _scheduleMeasure,
                  child: headerCell(widget.columns[index]),
                ),
              ),
          ],
        ),
        for (var index = 0; index < widget.rowCount; index += 1) dataRow(index),
      ],
    );

    // Only the keys of what is drawn now, so a row that has gone does not keep
    // its keys for ever.
    _headerKeys = headerKeys;
    _cellKeys = cellKeys;

    final bool lit = widget.hoverable || _interactive;
    final Color? Function(int index)? tint = widget.rowTint;

    // Everything the rows scroll past, and nothing a title should scroll with.
    Widget scrolling = SingleChildScrollView(
      controller: _scroll,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          CustomPaint(
            painter: _RowBands(
              grid: _gridKey,
              rowCount: widget.rowCount,
              hovered: _hovered,
              focused: _focused,
              lit: lit,
              tint: tint,
              // The hover is the same neutral surface as the header, one step
              // above the stripe, rather than a tint: a table that lights its
              // rows in blue has coloured the data under the pointer.
              hover: colors.surfaceContainer,
              ring: colors.secondary,
              rule: rowRule,
            ),
            child: grid,
          ),
          if (widget.rowCount == 0)
            DecoratedBox(
              decoration: BoxDecoration(border: Border(top: rowRule)),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: padX, vertical: mpTableEmptyPaddingY),
                child: DefaultTextStyle.merge(
                  style: TextStyle(color: colors.onSurfaceVariant),
                  textAlign: TextAlign.center,
                  child: Center(child: widget.empty ?? const Text('No data')),
                ),
              ),
            ),
        ],
      ),
    );

    // The cap and the band round the rows are there whether or not they are
    // asked for, and only what they do changes. A wrapper that came and went
    // with `maxHeight` or `stickyHeader` would build every cell again from
    // scratch, and a field in one would lose what was typed into it. Unasked
    // for, the cap is no cap, the stack hands its one child the constraints it
    // was given, and nothing is measured.
    scrolling = ConstrainedBox(
      constraints: BoxConstraints(maxHeight: widget.maxHeight ?? double.infinity),
      child: scrolling,
    );

    scrolling = Stack(
      fit: widget.stickyHeader ? StackFit.loose : StackFit.passthrough,
      children: <Widget>[
        scrolling,
        if (widget.stickyHeader && _columnWidths != null)
          PositionedDirectional(
            top: 0,
            start: 0,
            end: 0,
            child: _PinnedHeader(
              // Opaque, and it has to be: rows pass directly underneath, and a
              // translucent band would let them through. `surfaceContainer` is
              // opaque already, which is the header's own fill.
              fill: headFill,
              widths: _columnWidths!,
              cells: <Widget>[for (final column in widget.columns) headerCell(column)],
            ),
          ),
      ],
    );

    // As wide as the sheet, or as wide as the columns at their narrowest when
    // that is wider, and then the grid scrolls sideways, as the React sheet
    // does with `overflow-x: auto`: a browser's table shrinks its columns to
    // their content's narrowest before it overflows. The pinned header is in
    // what scrolls, so it moves with the columns it names. There whether or
    // not there is anything to scroll, so nothing is built again as the sheet
    // narrows or widens.
    scrolling = _SheetBox(
      sheet: _sheet,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        controller: _sideways,
        child: _GridWidth(sheet: _sheet, child: scrolling),
      ),
    );

    // A grid held by `maxHeight`, by a box too small for it, or by a sheet too
    // narrow for its columns is a tab stop while it scrolls, so rows and
    // columns past the edge are in reach of a keyboard in a table where no
    // cell takes the focus. Round the pinned header as well as the rows, so
    // the ring is drawn over the band rather than under it, and inside the
    // box, because the sheet clips at its rounded corner.
    //
    // The table's name is on the stop, which holds the table: a stop is
    // announced by its name. The table hands down its `semanticLabel`, or the
    // words of a caption that is only words. The stop's own focus merges into
    // this node, which is the point; the scroll view under it is a node of its
    // own, so nothing else does.
    scrolling = Semantics(
      container: true,
      label: widget.semanticLabel,
      child: MPKeyboardScroll(
        vertical: _scroll,
        horizontal: _sideways,
        borderRadius: BorderRadius.circular(theme.shapes.medium),
        ringOffset: -focusRingWidth,
        child: scrolling,
      ),
    );

    return DefaultTextStyle.merge(
      style: mpCellText(theme.typescale, size).style(colors.onSurface),
      child: scrolling,
    );
  }
}

/// A focus node that can be told to refuse the focus outright.
///
/// A row's [FocusableActionDetector] lets its node take the focus: it is always
/// enabled, and even a disabled one does in [NavigationMode.directional]. A row
/// that cannot be pressed is not a control to find, so this node overrules the
/// detector while it is [inert], without the detector being handed a different
/// node.
class _RowFocusNode extends FocusNode {
  bool _inert = false;

  /// Whether the node refuses the focus, whatever the detector says.
  set inert(bool value) {
    if (value == _inert) {
      return;
    }

    _inert = value;

    // Only when the row itself holds the focus. A field in the first cell is
    // inside this node too, and it keeps the focus as the row stops being
    // pressable, as it keeps what was typed into it.
    if (value && hasPrimaryFocus) {
      unfocus(disposition: UnfocusDisposition.previouslyFocusedChild);
    }
  }

  @override
  bool get canRequestFocus => !_inert && super.canRequestFocus;
}

/// The focus stop of one row, in its first cell, which Enter and Space press.
///
/// Built for every row whether it can be pressed or not, with [pressable]
/// deciding what it does, so the cell under it keeps its place in the tree. A
/// row that cannot be pressed has no shortcuts, no actions and a node that
/// refuses the focus. The detector stays enabled either way, so the node alone
/// answers whether the row takes the focus, the same answer in both navigation
/// modes, and the shortcuts and actions a disabled detector would drop are
/// left out here instead.
///
/// What the stop tells a screen reader is said here rather than by the
/// detector's [Focus], which says it whether there is a stop or not: a row with
/// none would still be a node the size of its first cell, where the words in
/// that cell were a node the size of the words.
class _RowStop extends StatefulWidget {
  const _RowStop({
    required this.pressable,
    required this.onPressed,
    required this.onFocusVisible,
    required this.child,
  });

  /// Whether the row answers a press.
  final bool pressable;

  /// Presses the row.
  final VoidCallback onPressed;

  /// Called as the keyboard ring should be drawn round the row or taken away.
  final ValueChanged<bool> onFocusVisible;

  /// The cell.
  final Widget child;

  @override
  State<_RowStop> createState() => _RowStopState();
}

class _RowStopState extends State<_RowStop> {
  /// Made here, with the row's cell, so that the stop moves with a keyed row
  /// rather than staying with whichever row is drawn in its place.
  final _RowFocusNode _node = _RowFocusNode();

  /// Whether the stop can take the focus, and whether it has it, as last told
  /// to a screen reader. Read from the node as [Focus] reads them.
  bool _focusable = false;
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _node.inert = !widget.pressable;
    _node.addListener(_onFocusChanged);
    _focusable = _node.canRequestFocus;
    _focused = _node.hasPrimaryFocus;
  }

  @override
  void didUpdateWidget(_RowStop oldWidget) {
    super.didUpdateWidget(oldWidget);
    _node.inert = !widget.pressable;
    _focusable = _node.canRequestFocus;
  }

  @override
  void dispose() {
    _node.removeListener(_onFocusChanged);
    _node.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    final bool focusable = _node.canRequestFocus;
    final bool focused = _node.hasPrimaryFocus;

    if (focusable != _focusable || focused != _focused) {
      setState(() {
        _focusable = focusable;
        _focused = focused;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool pressable = widget.pressable;

    return FocusableActionDetector(
      focusNode: _node,
      includeFocusSemantics: false,
      shortcuts: pressable ? MPInteractive.defaultShortcuts : null,
      actions: pressable
          ? <Type, Action<Intent>>{
              ActivateIntent: CallbackAction<ActivateIntent>(
                onInvoke: (ActivateIntent _) {
                  widget.onPressed();

                  return null;
                },
              ),
            }
          : null,
      onShowFocusHighlight: widget.onFocusVisible,
      // What [Focus] says for a node that can take the focus, and nothing at
      // all for one that cannot.
      child: Semantics(
        onFocus: _focusable && defaultTargetPlatform != TargetPlatform.iOS
            ? _node.requestFocus
            : null,
        focusable: _focusable ? true : null,
        focused: _focusable ? _focused : null,
        child: widget.child,
      ),
    );
  }
}

/// The band behind each row, the rule above it, and the ring round the focused
/// one, painted behind the grid.
///
/// Behind the [Table] rather than as each [TableRow]'s decoration, because a
/// row's decoration can only change by building the table again, and a table
/// built again lays out every row again. This listens to the pointer and the
/// focus and repaints, with each row's box read off the grid as it was laid
/// out. One rectangle a row rather than a piece a cell, too, since pieces that
/// meet at a fractional pixel can leave a seam.
class _RowBands extends CustomPainter {
  _RowBands({
    required this.grid,
    required this.rowCount,
    required this.hovered,
    required this.focused,
    required this.lit,
    required this.tint,
    required this.hover,
    required this.ring,
    required this.rule,
  }) : super(repaint: Listenable.merge(<Listenable>[hovered, focused]));

  final GlobalKey grid;
  final int rowCount;
  final ValueListenable<int?> hovered;
  final ValueListenable<int?> focused;

  /// Whether the pointer lights a row at all.
  final bool lit;

  /// What colour a row rests at.
  final Color? Function(int index)? tint;

  /// What colour the pointer lights a row in.
  final Color hover;

  final Color ring;

  /// The rule above every row but the first.
  final BorderSide rule;

  /// What the row at [index] paints behind itself.
  ///
  /// A focused row trades the rule for the ring, which is drawn as the row's
  /// own edge rather than as an outline around it: the sheet clips at its
  /// rounded corner, and a ring outside the first or last row would come back
  /// with its top or bottom sliced off.
  BoxDecoration decorationOf(int index) {
    // The pointer wins over whatever the caller said the row rests at: a reader
    // pointing at a row is asking about that row, not about the set it is in.
    final Color? fill = lit && hovered.value == index ? hover : tint?.call(index);

    if (focused.value == index) {
      return BoxDecoration(
        color: fill,
        border: Border.all(color: ring, width: focusRingWidth),
      );
    }

    return BoxDecoration(
      color: fill,
      // Every row, the first included: the header is a band rather than a
      // line, so the first row's rule is what ends it.
      border: Border(top: rule),
    );
  }

  @override
  void paint(Canvas canvas, Size size) {
    final RenderObject? table = grid.currentContext?.findRenderObject();

    if (table is! RenderTable || !table.hasSize || table.rows != rowCount + 1) {
      return;
    }

    for (var index = 0; index < rowCount; index += 1) {
      // The header is the grid's row `0`.
      final Rect box = table.getRowBox(index + 1);
      final BoxDecoration decoration = decorationOf(index);

      if (decoration.color == null && decoration.border == null) {
        continue;
      }

      final BoxPainter painter = decoration.createBoxPainter();

      painter.paint(canvas, box.topLeft, ImageConfiguration(size: box.size));
      painter.dispose();
    }
  }

  @override
  bool shouldRepaint(_RowBands old) {
    return old.rowCount != rowCount ||
        old.lit != lit ||
        old.tint != tint ||
        old.hover != hover ||
        old.ring != ring ||
        old.rule != rule ||
        old.hovered != hovered ||
        old.focused != focused;
  }
}

/// Tells [onChanged] when the heading under it is laid out at a new width,
/// the first time included.
///
/// A column's width is decided by every cell in it, and a heading laid out
/// again is the one place all of them show up at once. What it reports is
/// only that something moved; the grid reads the widths together once the
/// frame is over.
class _WidthReport extends SingleChildRenderObjectWidget {
  const _WidthReport({required this.onChanged, required super.child});

  final VoidCallback onChanged;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderWidthReport(onChanged);

  @override
  void updateRenderObject(BuildContext context, _RenderWidthReport renderObject) {
    renderObject.onChanged = onChanged;
  }
}

class _RenderWidthReport extends RenderProxyBox {
  _RenderWidthReport(this.onChanged);

  VoidCallback onChanged;

  double? _reported;

  @override
  void performLayout() {
    super.performLayout();

    if (size.width == _reported) {
      return;
    }

    _reported = size.width;
    onChanged();
  }
}

/// How wide the sheet is, handed from the box round the sideways view to the
/// grid inside it.
///
/// A view that scrolls sideways lays out what it holds with no width to go by,
/// and the grid needs one: its columns share out what the sheet has left over,
/// and shrink until they reach their content's narrowest before the grid is
/// any wider than the sheet. Read in layout rather than through a
/// `LayoutBuilder`, which answers no question about its size before it has
/// been laid out, and a popup that measures a table in it asks one.
class _SheetWidth {
  /// How wide the box round the view was laid out, or `null` before it was.
  double? width;

  /// The grid inside the view, while it is in the tree.
  _RenderGridWidth? grid;
}

/// The box round the sideways view, which reads how wide the sheet is.
class _SheetBox extends SingleChildRenderObjectWidget {
  const _SheetBox({required this.sheet, required super.child});

  final _SheetWidth sheet;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderSheetBox(sheet);

  @override
  void updateRenderObject(BuildContext context, _RenderSheetBox renderObject) {
    renderObject.sheet = sheet;
  }
}

class _RenderSheetBox extends RenderProxyBox {
  _RenderSheetBox(this.sheet);

  _SheetWidth sheet;

  @override
  void performLayout() {
    final double width = constraints.maxWidth;

    // The grid is laid out inside the view with the same constraints however
    // wide the sheet is, so it is told to lay itself out again when the sheet
    // changes width, from the one place that knows. A layout callback is
    // where a box may change what is under it while it is being laid out.
    if (width != sheet.width) {
      sheet.width = width;
      invokeLayoutCallback<BoxConstraints>((BoxConstraints _) => sheet.grid?.markNeedsLayout());
    }

    super.performLayout();
  }
}

/// The grid inside the sideways view, laid out as wide as the sheet, or as
/// wide as its columns at their narrowest when that is wider.
class _GridWidth extends SingleChildRenderObjectWidget {
  const _GridWidth({required this.sheet, required super.child});

  final _SheetWidth sheet;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderGridWidth(sheet);

  @override
  void updateRenderObject(BuildContext context, _RenderGridWidth renderObject) {
    renderObject.sheet = sheet;
  }
}

class _RenderGridWidth extends RenderProxyBox {
  _RenderGridWidth(this._sheet);

  _SheetWidth _sheet;

  set sheet(_SheetWidth value) {
    if (identical(value, _sheet)) {
      return;
    }

    if (attached && identical(_sheet.grid, this)) {
      _sheet.grid = null;
    }

    _sheet = value;

    if (attached) {
      _sheet.grid = this;
    }

    markNeedsLayout();
  }

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);
    _sheet.grid = this;
  }

  @override
  void detach() {
    if (identical(_sheet.grid, this)) {
      _sheet.grid = null;
    }

    super.detach();
  }

  /// The width to lay the grid out at under [constraints].
  ///
  /// A sheet with no width of its own, one inside something that scrolls
  /// sideways itself, leaves the grid as wide as its content wants to be.
  double _widthFor(RenderBox child, BoxConstraints constraints) {
    final double? sheet = _sheet.width;

    final double width = sheet != null && sheet.isFinite
        ? math.max(sheet, child.getMinIntrinsicWidth(double.infinity))
        : child.getMaxIntrinsicWidth(double.infinity);

    return constraints.constrainWidth(width);
  }

  BoxConstraints _childConstraints(RenderBox child, BoxConstraints constraints) {
    final double width = _widthFor(child, constraints);

    return constraints.copyWith(minWidth: width, maxWidth: width);
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final RenderBox? child = this.child;

    if (child == null) {
      return constraints.smallest;
    }

    return constraints.constrain(child.getDryLayout(_childConstraints(child, constraints)));
  }

  @override
  void performLayout() {
    final RenderBox? child = this.child;

    if (child == null) {
      size = constraints.smallest;

      return;
    }

    child.layout(_childConstraints(child, constraints), parentUsesSize: true);
    size = constraints.constrain(child.size);
  }
}

/// The column names, held at the top of the grid while the rows go under them.
///
/// A copy of the header row rather than a grid of its own: every cell is put in
/// a box of the width the one [Table] laid the real header cell out at, so the
/// band cannot disagree with the data beneath it about where a column starts.
/// The real header is still down there, directly under this one at the top of
/// the scroll and hidden behind it everywhere else.
///
/// Silent, because the row it copies is not: the names are already announced as
/// column headers by the grid, and a second set would be every column named
/// twice.
class _PinnedHeader extends StatelessWidget {
  const _PinnedHeader({required this.fill, required this.widths, required this.cells});

  /// An opaque colour. Rows pass under the band, and a translucent one is a
  /// band they show through.
  final Color fill;

  /// How wide the grid laid each column out.
  final List<double> widths;

  /// The names, built the same way the grid built them.
  final List<Widget> cells;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: DecoratedBox(
        decoration: BoxDecoration(color: fill),
        child: Builder(
          // At the widths it was handed even where they add up to more than the
          // band, rather than failing to fit it. They are read after the frame
          // that laid the grid out, so in the frame where the rows narrow the
          // columns, a filter or a page, the band still holds the wider ones
          // for that one frame. What runs past the end of the band runs past
          // the end of the grid, where the sideways view clips it.
          builder: (BuildContext context) => OverflowBox(
            alignment: AlignmentDirectional.topStart,
            minWidth: 0,
            maxWidth: double.infinity,
            fit: OverflowBoxFit.deferToChild,
            child: IntrinsicHeight(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  for (var index = 0; index < cells.length; index += 1)
                    SizedBox(
                      width: index < widths.length ? widths[index] : null,
                      child: cells[index],
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The band a caption, a toolbar or a footer sits in, above or below the grid,
/// inside the sheet and outside what scrolls, padded as a cell is.
///
/// A title that slid away above the rows would take the table's name off the
/// screen with it, which is the whole reason this is not part of the grid.
class MPTableBand extends StatelessWidget {
  /// Creates a band.
  const MPTableBand({
    required this.child,
    required this.size,
    required this.density,
    this.ruleAbove = false,
    super.key,
  });

  /// What the band holds.
  final Widget child;

  /// The scale its padding is taken from.
  final MPSize size;

  /// How tightly it packs.
  final MPDensity density;

  /// Draws the `outlineVariant` rule along the band's top, as a footer has.
  /// A caption and a toolbar have none: the header's band below them is the
  /// break.
  final bool ruleAbove;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: ruleAbove ? Border(top: BorderSide(color: colors.outlineVariant)) : null,
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: mpCellPadX(size, density),
          vertical: mpCellPadY(size, density),
        ),
        child: child,
      ),
    );
  }
}
