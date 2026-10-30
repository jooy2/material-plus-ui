/// A list of things and what they are called.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// The gap between the label column and the values at each rung.
const Map<MPSize, double> _columnGap = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 32,
};

/// The gap between one pair and the next at each rung.
const Map<MPSize, double> _rowGap = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// A gap with the density steps taken out of it, MD3's 4dp a step, down to
/// the width it stops meaning at: four pixels between rows is the last that
/// reads as a break rather than a line wrap, eight between columns the last
/// that reads as two columns rather than a word space.
double _tighten(double base, MPDensity density, double floor) {
  return math.max(floor, base + mpClampDensity(density) * 4);
}

/// A list of things and what they are called: a details panel, the summary of
/// a record, the metadata under a heading.
///
/// ```dart
/// const MPDataList(
///   children: <MPDataListItem>[
///     MPDataListItem(label: Text('Status'), child: Text('Active')),
///     MPDataListItem(label: Text('Owner'), child: Text('Priya Raman')),
///   ],
/// )
/// ```
///
/// ## Why not a two-column table
///
/// Because they are read differently. A table is a grid of rows of the same
/// shape, walked cell by cell under column headers. This is a set of pairs,
/// each read as a label and then its value, which is what a details panel is.
///
/// ## It draws no surface
///
/// No sheet, no padding, no corner. Put it in an `MPCard` when one is wanted,
/// which is what makes the same list work inside a card, inside a popover and
/// loose under a heading.
class MPDataList extends StatelessWidget {
  /// Creates a list of label and value pairs.
  const MPDataList({
    required this.children,
    this.orientation = MPOrientation.horizontal,
    this.labelWidth,
    this.dividers = false,
    this.size,
    this.density,
    super.key,
  });

  /// The pairs.
  ///
  /// [MPDataListItem]s rather than any widget, because the list lays a pair's
  /// two halves out itself: horizontally, every label lines up against every
  /// other in one column, which no widget built per pair could arrange. The
  /// React pair is a fragment for the same reason.
  final List<MPDataListItem> children;

  /// Where the label sits.
  ///
  /// - [MPOrientation.horizontal], beside the value in a column of its own.
  ///   The default, and the shape a details panel takes.
  /// - [MPOrientation.vertical], above it. For a narrow column, and for values
  ///   long enough that a label beside them would leave most of the row empty.
  final MPOrientation orientation;

  /// How wide the label column is when horizontal, in logical pixels.
  ///
  /// Left out it is as wide as the widest label, which keeps every value in
  /// the list starting at the same place without anybody measuring anything.
  final double? labelWidth;

  /// Draws a hairline between the pairs.
  ///
  /// Horizontally the line reaches across both halves of a pair, which share
  /// a row. Vertically it sits above the label only, because a line between a
  /// label and its own value would divide the one place with nothing to
  /// divide.
  final bool dividers;

  /// The type scale of the values.
  final MPSize? size;

  /// Tightens the gaps between rows and columns, and nothing else. The type
  /// scale does not move.
  final MPDensity? density;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final double columnGap = _tighten(_columnGap[size]!, density, 8);
    final double rowGap = _tighten(_rowGap[size]!, density, 4);
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final TextStyle labelStyle = theme.typescale.bodySmall.style(colors.onSurfaceVariant);
    final TextStyle valueStyle = mpProseText(theme.typescale, size).style(colors.onSurface);

    Widget label(MPDataListItem item) {
      return DefaultTextStyle.merge(style: labelStyle, child: item.label);
    }

    Widget value(MPDataListItem item) {
      return DefaultTextStyle.merge(
        style: valueStyle,
        child: item.child ?? const SizedBox.shrink(),
      );
    }

    if (orientation == MPOrientation.vertical) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          for (int index = 0; index < children.length; index += 1)
            MergeSemantics(
              child: Padding(
                // The gap between one pair and the next goes above the label,
                // so a label is never left floating halfway between two values.
                padding: EdgeInsets.only(top: index == 0 ? 0 : rowGap),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    DecoratedBox(
                      decoration: BoxDecoration(
                        border: dividers && index > 0 ? Border(top: rule) : null,
                      ),
                      child: Padding(
                        padding: EdgeInsets.only(top: dividers && index > 0 ? rowGap : 0),
                        child: SizedBox(width: double.infinity, child: label(children[index])),
                      ),
                    ),
                    value(children[index]),
                  ],
                ),
              ),
            ),
        ],
      );
    }

    final int last = children.length - 1;

    return Table(
      columnWidths: <int, TableColumnWidth>{
        // `max-content`, as the React grid's first track: the widest label
        // decides, plus the gap that belongs to the label's side.
        0: labelWidth == null
            ? const IntrinsicColumnWidth()
            : FixedColumnWidth(labelWidth! + columnGap),
        1: const FlexColumnWidth(),
      },
      // Label and value on one baseline, as the React grid's `items-baseline`
      // lines a small label up with a larger value.
      defaultVerticalAlignment: TableCellVerticalAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: <TableRow>[
        for (int index = 0; index < children.length; index += 1)
          TableRow(
            decoration: BoxDecoration(border: dividers && index > 0 ? Border(top: rule) : null),
            children: <Widget>[
              for (final bool isLabel in <bool>[true, false])
                Padding(
                  // Ruled, a row is spaced on both sides of its line; unruled,
                  // the gap is above every row but the first.
                  padding: EdgeInsetsDirectional.only(
                    end: isLabel ? columnGap : 0,
                    top: index == 0 ? 0 : rowGap,
                    bottom: dividers && index < last ? rowGap : 0,
                  ),
                  child: isLabel ? label(children[index]) : value(children[index]),
                ),
            ],
          ),
      ],
    );
  }
}

/// One pair in an [MPDataList]: what it is called, and what it is.
///
/// The list lays the two halves out, so a pair has no `size` or `density` of
/// its own: a details panel with one row set tighter than its neighbours is
/// not a thing anybody wants. Built on its own, outside a list, it draws its
/// label over its value.
class MPDataListItem extends StatelessWidget {
  /// Creates a pair.
  const MPDataListItem({required this.label, this.child, super.key});

  /// What the value is called, `bodySmall` in `onSurfaceVariant`.
  final Widget label;

  /// The value. A widget, so a chip, a link or a piece of code all fit. Left
  /// out, the pair keeps its row with an empty value rather than collapsing.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return MPDataList(orientation: MPOrientation.vertical, children: <MPDataListItem>[this]);
  }
}
