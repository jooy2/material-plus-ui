/// Material's layout grid: a row divided into columns, and items that take
/// some of them.
library;

import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/internal/grid.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/types.dart';

/// How a row divides the width its items did not take.
///
/// CSS's own words, because this is CSS's own question: inventing a second
/// spelling for `space-between` would only make a reader translate what they
/// already know. [start] and [end] are logical and flip under right-to-left
/// text.
enum MPGridJustify {
  /// Packed against the leading edge.
  start,

  /// Packed in the middle.
  center,

  /// Packed against the trailing edge.
  end,

  /// The leftover width divided between the items, none at the ends.
  spaceBetween,

  /// Half a share at each end.
  spaceAround,

  /// An equal share at the ends and between.
  spaceEvenly,
}

/// How items sit against each other across a row.
enum MPGridAlign {
  /// Against the top of the row.
  start,

  /// In the middle of the row.
  center,

  /// Against the bottom of the row.
  end,

  /// Every item as tall as the row, which is what makes a row of cards the same
  /// height without anybody asking.
  stretch,

  /// Every item's first line of text on one line.
  baseline,
}

/// The same, for one item overriding the row it is in.
enum MPGridAlignSelf {
  /// Whatever the grid's `alignItems` says.
  auto,

  /// Against the top of the row.
  start,

  /// In the middle of the row.
  center,

  /// Against the bottom of the row.
  end,

  /// As tall as the row.
  stretch,

  /// On the row's baseline.
  baseline,
}

/// Where the rows sit when the grid is given more height than they need.
enum MPGridAlignContent {
  /// Packed against the top.
  start,

  /// Packed in the middle.
  center,

  /// Packed against the bottom.
  end,

  /// The leftover height divided between the rows, none at the ends.
  spaceBetween,

  /// Half a share above the first row and below the last.
  spaceAround,

  /// An equal share above, between and below.
  spaceEvenly,

  /// The leftover height shared out among the rows, so each is taller.
  stretch,
}

/// How wide one item is: a number of the grid's columns, [grow] or [auto].
///
/// ```dart
/// const MPGridSpan(6)
/// MPGridSpan.grow
/// MPGridSpan.auto
/// ```
///
/// Neither word is a measurement, and they are the two ends of the question a
/// column count cannot answer. [grow] is "whatever the row has left after
/// everybody else has taken theirs": the width a thumbnail's neighbour wants,
/// and one the arithmetic cannot reach because the remainder is only known once
/// the other items in *that* row have been laid out. [auto] is "exactly what is
/// inside me", which the arithmetic cannot reach either, because what is inside
/// an item is measured rather than written down.
///
/// They pair. A control bar whose start is a set of transport buttons and whose
/// end is however many icon buttons the page turned out to need is [grow] and
/// [auto], with no number on either side, which matters because the number would
/// be wrong the day a button is added.
///
/// Two growing items in a row split the remainder equally rather than by their
/// contents, which is the useful half of what makes it predictable.
@immutable
class MPGridSpan {
  /// A share of [columns] of the grid's columns, at least one.
  const MPGridSpan(int this.columns) : _kind = _SpanKind.columns;

  const MPGridSpan._(this._kind) : columns = null;

  /// The width the row has left.
  static const MPGridSpan grow = MPGridSpan._(_SpanKind.grow);

  /// Exactly the width of what is inside the item.
  static const MPGridSpan auto = MPGridSpan._(_SpanKind.auto);

  /// The column count, or `null` for [grow] and [auto].
  final int? columns;

  final _SpanKind _kind;

  /// Whether this is [grow].
  bool get isGrow => _kind == _SpanKind.grow;

  /// Whether this is [auto].
  bool get isAuto => _kind == _SpanKind.auto;

  @override
  bool operator ==(Object other) {
    return other is MPGridSpan && other._kind == _kind && other.columns == columns;
  }

  @override
  int get hashCode => Object.hash(_kind, columns);

  @override
  String toString() {
    return switch (_kind) {
      _SpanKind.columns => 'MPGridSpan($columns)',
      _SpanKind.grow => 'MPGridSpan.grow',
      _SpanKind.auto => 'MPGridSpan.auto',
    };
  }
}

enum _SpanKind { columns, grow, auto }

/// Material's layout grid: a row divided into columns, and items that take
/// some of them.
///
/// ```dart
/// MPGrid(
///   columns: const MPResponsive<int>(4, medium: 12),
///   spacing: const MPResponsive<double>(4, medium: 6),
///   children: <Widget>[
///     MPGridItem(
///       span: const MPResponsive<MPGridSpan>(MPGridSpan(4), medium: MPGridSpan(8)),
///       child: main,
///     ),
///     MPGridItem(
///       span: const MPResponsive<MPGridSpan>(MPGridSpan(4), medium: MPGridSpan(4)),
///       child: aside,
///     ),
///   ],
/// )
/// ```
///
/// MD3 describes a page as a number of columns with a gutter between them, and
/// describes how that number changes with the **window size class**: four
/// columns in a compact window, twelve from medium up. That is what this is,
/// and it is why every responsive parameter here is an [MPResponsive] keyed by
/// [MPWindowClass]. The class is the window's, read through [MediaQuery], so a
/// grid nested three cards deep changes shape at the same width as everything
/// else on the screen.
///
/// ## Why a grid paints nothing
///
/// No `variant`, no `color`, no padding. A grid is not a surface but the
/// arrangement of the surfaces inside it, and the moment it drew a sheet of its
/// own it would stop being usable as the outermost thing on a page. Put it in
/// an `MPBox` or an `MPCard` when the sheet is wanted, and in an `MPContainer`
/// when what is wanted is the page margin.
///
/// Nesting is an [MPGrid] inside an [MPGridItem]: the inner grid declares its
/// own column count for its subtree while the item around it keeps the width
/// the outer grid gave it.
class MPGrid extends StatelessWidget {
  /// Creates a grid of [children], usually [MPGridItem]s.
  const MPGrid({
    required this.children,
    this.columns,
    this.spacing,
    this.rowSpacing,
    this.columnSpacing,
    this.justifyContent,
    this.alignItems = MPGridAlign.stretch,
    this.alignContent,
    this.wrap = true,
    super.key,
  });

  /// The items. An [MPGridItem] says how many columns it takes; anything else
  /// fills the row.
  ///
  /// An [MPGridItem] has to be a child of the grid itself, as an `Expanded`
  /// has to be a child of its `Row`, with nothing that draws in between.
  final List<Widget> children;

  /// How many columns a row is divided into. Every span and every offset inside
  /// is read against this number, so 24 makes a span of 12 a half rather than a
  /// full width.
  ///
  /// Twelve when nobody says. MD3's own layout grid is
  /// `MPResponsive<int>(4, medium: 12)`, and it is not the default because a
  /// divisor that changed at 600dp on its own would silently change what a span
  /// of six means on a phone.
  final MPResponsive<int>? columns;

  /// The gutter between items, on Tailwind's spacing scale: `4` is 16, the same
  /// length the React package's `gap-4` is. Fractions are allowed, so `1.5` is
  /// 6.
  ///
  /// Four when nobody says. MD3's own gutter is
  /// `MPResponsive<double>(4, medium: 6)`, 16dp on a phone and 24dp from a
  /// medium window up.
  final MPResponsive<double>? spacing;

  /// The gutter between rows only. Falls back to [spacing].
  final MPResponsive<double>? rowSpacing;

  /// The gutter between columns only. Falls back to [spacing].
  final MPResponsive<double>? columnSpacing;

  /// How a row distributes the width its items did not use. Packed at the
  /// start when nobody says. A row holding a [MPGridSpan.grow] item has no
  /// width left over to distribute.
  final MPGridJustify? justifyContent;

  /// How items sit against each other across a row.
  final MPGridAlign alignItems;

  /// Where the rows sit when the grid is given more height than they need.
  /// Only ever visible on a grid with a height of its own, which is why leaving
  /// it out also leaves the grid as tall as its rows.
  final MPGridAlignContent? alignContent;

  /// Whether a row that runs out of columns continues on the next one.
  ///
  /// Turned off, the grid is one row that **scrolls sideways**. The React
  /// grid's row simply overflows and leaves the scrolling to the page, which a
  /// Flutter screen does not do: an overflowing row is a row nobody can reach.
  /// The widths are still worked out against the visible box.
  final bool wrap;

  /// The column count when nobody says.
  static const int _defaultColumns = 12;

  /// The gutter when nobody says, on the spacing scale.
  static const double _defaultSpacing = 4;

  @override
  Widget build(BuildContext context) {
    final MPWindowClass windowClass = mpWindowClassOf(context);
    final int count = columnCount(
      columns?.resolve(windowClass, _defaultColumns) ?? _defaultColumns,
    );
    final double gapX = spacingValue(
      (columnSpacing ?? spacing)?.resolve(windowClass, _defaultSpacing) ?? _defaultSpacing,
    );
    final double gapY = spacingValue(
      (rowSpacing ?? spacing)?.resolve(windowClass, _defaultSpacing) ?? _defaultSpacing,
    );
    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;

    _GridLayout layout({double? referenceWidth}) {
      return _GridLayout(
        columns: count,
        gapX: gapX,
        gapY: gapY,
        justify: justifyContent ?? MPGridJustify.start,
        alignItems: alignItems,
        alignContent: alignContent,
        wrap: wrap,
        textDirection: direction,
        referenceWidth: referenceWidth,
        children: children,
      );
    }

    if (wrap) {
      return _GridScope(active: true, child: layout());
    }

    // One row, and it may be wider than the box. The width the spans are read
    // against is measured here, outside the scroller, which hands what is in it
    // no width limit at all.
    return _GridScope(
      active: true,
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: layout(referenceWidth: constraints.maxWidth),
          );
        },
      ),
    );
  }
}

/// One cell of an [MPGrid].
///
/// A width and nothing else: no surface, no padding, no typography. What goes
/// inside brings its own, which is the whole reason a cell and an `MPBox` are
/// two widgets: wrapping something in a layout must not change how it looks,
/// and a cell that drew a sheet would make [span] a visual decision.
///
/// Outside an [MPGrid] it is [child] and nothing more.
class MPGridItem extends StatelessWidget {
  /// Creates a cell holding [child].
  const MPGridItem({required this.child, this.span, this.offset, this.alignSelf, super.key});

  /// What the cell holds, laid out to the width the span works out to.
  final Widget child;

  /// How many of the grid's columns the item takes, read against the grid's
  /// `columns`, so `MPGridSpan(6)` is half of the default twelve and a quarter
  /// of 24.
  ///
  /// Responsive, so twelve columns at compact, six from medium and four from
  /// expanded is full width on a phone, half from 600dp and a third from
  /// 840dp:
  ///
  /// ```dart
  /// span: const MPResponsive<MPGridSpan>(
  ///   MPGridSpan(12),
  ///   medium: MPGridSpan(6),
  ///   expanded: MPGridSpan(4),
  /// )
  /// ```
  ///
  /// A span wider than the row is clamped to the row.
  ///
  /// [MPGridSpan.grow] takes the width the row has left, and [MPGridSpan.auto]
  /// exactly the width of what is inside it; see [MPGridSpan]. An `auto` item
  /// does not shrink, so contents wider than the row are laid out at the row's
  /// width rather than squeezing what is beside them.
  ///
  /// Left out, the item fills the row.
  final MPResponsive<MPGridSpan>? span;

  /// Columns left empty *before* the item: space pushed in ahead of it, not an
  /// absolute position in the row. First in a twelve-column row, an offset of 4
  /// with a span of 4 is the middle third; after an item that already took four
  /// columns, the same offset skips four more and lands on the last third.
  final MPResponsive<int>? offset;

  /// Overrides the grid's `alignItems` for this item alone.
  final MPGridAlignSelf? alignSelf;

  @override
  Widget build(BuildContext context) {
    // Inside a cell's own content the scope says "not a grid child", so an item
    // nested somewhere it has no grid to talk to lays out as its child.
    if (!_GridScope.activeOf(context)) {
      return child;
    }

    final MPWindowClass windowClass = mpWindowClassOf(context);

    return _GridSlot(
      span: span?.at(windowClass),
      offset: offset?.resolve(windowClass, 0) ?? 0,
      alignSelf: alignSelf ?? MPGridAlignSelf.auto,
      child: _GridScope(active: false, child: child),
    );
  }
}

/// Whether the [MPGridItem] being built is a grid's own child.
class _GridScope extends InheritedWidget {
  const _GridScope({required this.active, required super.child});

  final bool active;

  static bool activeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_GridScope>()?.active ?? false;
  }

  @override
  bool updateShouldNotify(_GridScope oldWidget) => active != oldWidget.active;
}

/* ---------------------------------------------------------------------------
 * The layout
 * ------------------------------------------------------------------------- */

class _GridParentData extends ContainerBoxParentData<RenderBox> {
  /// `null` fills the row.
  MPGridSpan? span;
  int skip = 0;
  MPGridAlignSelf alignSelf = MPGridAlignSelf.auto;
}

class _GridSlot extends ParentDataWidget<_GridParentData> {
  const _GridSlot({
    required this.span,
    required this.offset,
    required this.alignSelf,
    required super.child,
  });

  final MPGridSpan? span;
  final int offset;
  final MPGridAlignSelf alignSelf;

  @override
  void applyParentData(RenderObject renderObject) {
    final _GridParentData data = renderObject.parentData! as _GridParentData;

    if (data.span == span && data.skip == offset && data.alignSelf == alignSelf) {
      return;
    }

    data
      ..span = span
      ..skip = offset
      ..alignSelf = alignSelf;
    renderObject.parent?.markNeedsLayout();
  }

  @override
  Type get debugTypicalAncestorWidgetClass => MPGrid;
}

class _GridLayout extends MultiChildRenderObjectWidget {
  const _GridLayout({
    required this.columns,
    required this.gapX,
    required this.gapY,
    required this.justify,
    required this.alignItems,
    required this.alignContent,
    required this.wrap,
    required this.textDirection,
    required this.referenceWidth,
    required super.children,
  });

  final int columns;
  final double gapX;
  final double gapY;
  final MPGridJustify justify;
  final MPGridAlign alignItems;
  final MPGridAlignContent? alignContent;
  final bool wrap;
  final TextDirection textDirection;
  final double? referenceWidth;

  @override
  _RenderGrid createRenderObject(BuildContext context) {
    return _RenderGrid()..configure(this);
  }

  @override
  void updateRenderObject(BuildContext context, _RenderGrid renderObject) {
    renderObject.configure(this);
  }
}

/// One child as it is placed in a row.
class _Placed {
  _Placed(this.child, {required this.offset, required this.width, required this.grows});

  final RenderBox child;

  /// The empty columns before it, in logical pixels.
  final double offset;

  /// Its width; for a growing item, nought until the row's remainder is known.
  double width;

  final bool grows;
}

/// A grid as a flex-wrap row, which is what the React grid is in a browser.
///
/// One render object rather than a column of rows, because two of the spans
/// cannot be worked out from the outside: an `auto` item has to be measured
/// before the row it goes in is known, and a `grow` item's width is whatever
/// that row left over. Laying the rows out here also lets every item take its
/// own alignment, a baseline included, which a [Row] per run could not: a row
/// is aligned on one baseline or on none.
class _RenderGrid extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _GridParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _GridParentData> {
  int _columns = 12;
  double _gapX = 0;
  double _gapY = 0;
  MPGridJustify _justify = MPGridJustify.start;
  MPGridAlign _alignItems = MPGridAlign.stretch;
  MPGridAlignContent? _alignContent;
  bool _wrap = true;
  TextDirection _textDirection = TextDirection.ltr;
  double? _referenceWidth;

  /// How far a row may run over before it wraps, so that spans adding up to
  /// the column count are not pushed onto a second row by a rounding error.
  static const double _tolerance = 0.01;

  void configure(_GridLayout widget) {
    final bool changed =
        widget.columns != _columns ||
        widget.gapX != _gapX ||
        widget.gapY != _gapY ||
        widget.justify != _justify ||
        widget.alignItems != _alignItems ||
        widget.alignContent != _alignContent ||
        widget.wrap != _wrap ||
        widget.textDirection != _textDirection ||
        widget.referenceWidth != _referenceWidth;

    _columns = widget.columns;
    _gapX = widget.gapX;
    _gapY = widget.gapY;
    _justify = widget.justify;
    _alignItems = widget.alignItems;
    _alignContent = widget.alignContent;
    _wrap = widget.wrap;
    _textDirection = widget.textDirection;
    _referenceWidth = widget.referenceWidth;

    if (changed) {
      markNeedsLayout();
    }
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _GridParentData) {
      child.parentData = _GridParentData();
    }
  }

  /// The width the spans are read against.
  double _widthFor(BoxConstraints constraints) => _referenceWidth ?? constraints.maxWidth;

  /// Packs the children into rows and settles every width.
  ///
  /// [natural] is how an `auto` item is measured: a real layout during
  /// layout, an intrinsic width when the grid is only being asked about.
  List<List<_Placed>> _plan(double width, double Function(RenderBox child, double max) natural) {
    final bool bounded = width.isFinite;
    final double track = bounded ? trackWidth(width: width, gap: _gapX, columns: _columns) : 0;
    final List<List<_Placed>> runs = <List<_Placed>>[];
    List<_Placed> run = <_Placed>[];
    double used = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      final _GridParentData data = child.parentData! as _GridParentData;
      final MPGridSpan? span = data.span;
      final double offset = bounded ? track * columnUnits(data.skip, min: 0, columns: _columns) : 0;

      // With no width to divide there are no columns, so every item is as wide
      // as what is inside it, which is what a block does in a shrink-wrapping
      // parent.
      final bool grows = bounded && span != null && span.isGrow;
      final bool measured = !bounded || (span != null && span.isAuto);
      final double basis;

      if (grows) {
        basis = 0;
      } else if (measured) {
        basis = natural(child, width);
      } else {
        final int columns = span?.columns ?? _columns;

        basis = math.max(0, track * columnUnits(columns, min: 1, columns: _columns) - _gapX);
      }

      final double need = (run.isEmpty ? 0 : _gapX) + offset + basis;

      if (_wrap && bounded && run.isNotEmpty && used + need > width + _tolerance) {
        runs.add(run);
        run = <_Placed>[];
        used = 0;
      }

      used += (run.isEmpty ? 0 : _gapX) + offset + basis;
      run.add(_Placed(child, offset: offset, width: basis, grows: grows));
    }

    if (run.isNotEmpty) {
      runs.add(run);
    }

    // A growing item takes an equal share of what its row left over.
    for (final List<_Placed> row in runs) {
      final Iterable<_Placed> growing = row.where((_Placed placed) => placed.grows);

      if (growing.isEmpty) {
        continue;
      }

      final double share = math.max(0, _leftover(row, width)) / growing.length;

      for (final _Placed placed in growing) {
        placed.width = share;
      }
    }

    return runs;
  }

  /// The width [row] leaves unused in a grid [width] wide.
  double _leftover(List<_Placed> row, double width) {
    if (!width.isFinite) {
      return 0;
    }

    double used = _gapX * math.max(0, row.length - 1);

    for (final _Placed placed in row) {
      used += placed.offset + placed.width;
    }

    return width - used;
  }

  MPGridAlignSelf _alignOf(RenderBox child) {
    final MPGridAlignSelf own = (child.parentData! as _GridParentData).alignSelf;

    if (own != MPGridAlignSelf.auto) {
      return own;
    }

    return switch (_alignItems) {
      MPGridAlign.start => MPGridAlignSelf.start,
      MPGridAlign.center => MPGridAlignSelf.center,
      MPGridAlign.end => MPGridAlignSelf.end,
      MPGridAlign.stretch => MPGridAlignSelf.stretch,
      MPGridAlign.baseline => MPGridAlignSelf.baseline,
    };
  }

  @override
  void performLayout() {
    final double width = _widthFor(constraints);

    final List<List<_Placed>> runs = _plan(width, (RenderBox child, double max) {
      child.layout(BoxConstraints(maxWidth: max), parentUsesSize: true);

      return child.size.width;
    });

    // Every child at its settled width and its own height first. A stretched
    // one is laid out again below, at the height of its row, once that is
    // known.
    final List<double> heights = <double>[];
    final List<double> baselines = <double>[];

    for (final List<_Placed> row in runs) {
      double above = 0;
      double below = 0;
      double tallest = 0;

      for (final _Placed placed in row) {
        placed.child.layout(BoxConstraints.tightFor(width: placed.width), parentUsesSize: true);

        final double height = placed.child.size.height;

        if (_alignOf(placed.child) == MPGridAlignSelf.baseline) {
          final double baseline =
              placed.child.getDistanceToBaseline(TextBaseline.alphabetic, onlyReal: true) ?? height;

          above = math.max(above, baseline);
          below = math.max(below, height - baseline);
        } else {
          tallest = math.max(tallest, height);
        }
      }

      heights.add(math.max(tallest, above + below));
      baselines.add(above);
    }

    final double content =
        heights.fold<double>(0, (double sum, double height) => sum + height) +
        _gapY * math.max(0, runs.length - 1);

    final bool fills = _alignContent != null && constraints.hasBoundedHeight;
    final double height = fills ? constraints.maxHeight : constraints.constrainHeight(content);
    final double spare = math.max(0, height - content);

    // Where the rows sit, and how much taller each one gets under `stretch`.
    double lead = 0;
    double between = _gapY;

    if (fills && runs.isNotEmpty) {
      final int count = runs.length;

      switch (_alignContent!) {
        case MPGridAlignContent.start:
          break;
        case MPGridAlignContent.center:
          lead = spare / 2;
        case MPGridAlignContent.end:
          lead = spare;
        case MPGridAlignContent.spaceBetween:
          between = count > 1 ? _gapY + spare / (count - 1) : _gapY;
        case MPGridAlignContent.spaceAround:
          lead = spare / count / 2;
          between = _gapY + spare / count;
        case MPGridAlignContent.spaceEvenly:
          lead = spare / (count + 1);
          between = _gapY + spare / (count + 1);
        case MPGridAlignContent.stretch:
          for (int index = 0; index < count; index += 1) {
            heights[index] += spare / count;
          }
      }
    }

    // As wide as the width the spans were read against, or as wide as the
    // longest row where that is wider: a row that does not wrap, or a grid
    // with no width to divide, which is one row as wide as its items.
    double longest = 0;

    for (final List<_Placed> row in runs) {
      longest = math.max(longest, _rowsExtent(row));
    }

    final double gridWidth = width.isFinite ? math.max(width, longest) : longest;

    size = constraints.constrain(Size(gridWidth, height));

    double top = lead;

    for (int index = 0; index < runs.length; index += 1) {
      final List<_Placed> row = runs[index];
      final double rowHeight = heights[index];
      final double leftover = math.max(0, size.width - _rowsExtent(row));
      final int count = row.length;

      final (double start, double gap) = switch (_justify) {
        MPGridJustify.start => (0.0, _gapX),
        MPGridJustify.center => (leftover / 2, _gapX),
        MPGridJustify.end => (leftover, _gapX),
        MPGridJustify.spaceBetween =>
          count > 1 ? (0.0, _gapX + leftover / (count - 1)) : (0.0, _gapX),
        MPGridJustify.spaceAround => (leftover / count / 2, _gapX + leftover / count),
        MPGridJustify.spaceEvenly => (leftover / (count + 1), _gapX + leftover / (count + 1)),
      };

      double cursor = start;

      for (final _Placed placed in row) {
        final RenderBox child = placed.child;
        final MPGridAlignSelf align = _alignOf(child);

        // Only an item that is not already the height of its row is laid out
        // again, so a row of equal cards costs one pass.
        if (align == MPGridAlignSelf.stretch && child.size.height != rowHeight) {
          child.layout(
            BoxConstraints.tightFor(width: placed.width, height: rowHeight),
            parentUsesSize: true,
          );
        }

        final double dy = switch (align) {
          MPGridAlignSelf.center => (rowHeight - child.size.height) / 2,
          MPGridAlignSelf.end => rowHeight - child.size.height,
          MPGridAlignSelf.baseline =>
            baselines[index] -
                (child.getDistanceToBaseline(TextBaseline.alphabetic, onlyReal: true) ??
                    child.size.height),
          _ => 0,
        };

        cursor += placed.offset;

        // Mirrored here rather than in `paint`, because a hit test and a
        // semantics rectangle read the offsets too.
        final double dx = _textDirection == TextDirection.rtl
            ? size.width - cursor - child.size.width
            : cursor;

        (child.parentData! as _GridParentData).offset = Offset(dx, top + dy);
        cursor += child.size.width + gap;
      }

      top += rowHeight + between;
    }
  }

  /// How wide [row] is laid end to end, gutters and offsets included.
  double _rowsExtent(List<_Placed> row) {
    double extent = _gapX * math.max(0, row.length - 1);

    for (final _Placed placed in row) {
      extent += placed.offset + placed.width;
    }

    return extent;
  }

  /* -------------------------------------------------------------------------
   * Intrinsics, for a grid inside something that asks before it lays out
   * ----------------------------------------------------------------------- */

  @override
  double computeMinIntrinsicWidth(double height) {
    double widest = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      widest = math.max(widest, child.getMinIntrinsicWidth(double.infinity));
    }

    return widest;
  }

  @override
  double computeMaxIntrinsicWidth(double height) {
    double total = 0;
    int count = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      total += child.getMaxIntrinsicWidth(double.infinity);
      count += 1;
    }

    return total + _gapX * math.max(0, count - 1);
  }

  double _intrinsicHeight(double width) {
    final List<List<_Placed>> runs = _plan(
      _referenceWidth ?? width,
      (RenderBox child, double max) => math.min(child.getMaxIntrinsicWidth(double.infinity), max),
    );

    double total = _gapY * math.max(0, runs.length - 1);

    for (final List<_Placed> row in runs) {
      double tallest = 0;

      for (final _Placed placed in row) {
        tallest = math.max(tallest, placed.child.getMaxIntrinsicHeight(placed.width));
      }

      total += tallest;
    }

    return total;
  }

  @override
  double computeMinIntrinsicHeight(double width) => _intrinsicHeight(width);

  @override
  double computeMaxIntrinsicHeight(double width) => _intrinsicHeight(width);

  @override
  double? computeDistanceToActualBaseline(TextBaseline baseline) {
    return defaultComputeDistanceToFirstActualBaseline(baseline);
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    return defaultHitTestChildren(result, position: position);
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    defaultPaint(context, offset);
  }
}
