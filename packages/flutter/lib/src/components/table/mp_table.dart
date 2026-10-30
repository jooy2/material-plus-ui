/// A grid of data.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/table.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A column of an [MPTable]: its heading, its width, and how to get a cell out
/// of a row.
///
/// This is the whole reason the table takes data rather than widgets per row.
/// A cell written out per row can silently disagree with the heading above it
/// about how many there are or what order they come in; a column list cannot.
@immutable
class MPTableColumn<T> {
  /// Creates a column.
  const MPTableColumn({
    required this.key,
    this.label,
    this.width,
    this.align = MPAlign.start,
    this.render,
  });

  /// Identifies the column, and, unless [render] says otherwise, names the
  /// entry to read off each row when the rows are maps.
  final String key;

  /// The heading. Defaults to the [key], which is usually not what you want.
  final Widget? label;

  /// The column's width in logical pixels.
  ///
  /// Left out, the column is measured from its content and handed a share of
  /// whatever the sheet has left over, as a browser's automatic table layout
  /// does.
  final double? width;

  /// Which edge the text lines up against. Numbers usually want
  /// [MPAlign.end] so their digits line up in a column.
  final MPAlign align;

  /// Draws the cell. Without it the cell is `row[key]` for a map row, drawn as
  /// text when it is text, a number or a boolean. Reach for this the moment a
  /// column holds anything else, or the rows are objects of your own.
  final Widget Function(T row, int index)? render;
}

/// A grid of data.
///
/// ```dart
/// MPTable<Build>(
///   headers: <MPTableColumn<Build>>[
///     const MPTableColumn<Build>(key: 'id', label: Text('#'), width: 72),
///     MPTableColumn<Build>(key: 'branch', label: const Text('Branch'),
///         render: (Build row, int index) => Text(row.branch)),
///   ],
///   items: builds,
/// )
/// ```
///
/// The sheet takes the same `variant`, `size` and `density` as everything it
/// might sit next to. What the table adds is the part that is genuinely
/// tabular: the columns, the rows, and the fact that the two cannot drift
/// apart.
///
/// Every row is built, and there is no windowing. A few hundred rows is
/// nothing; a list somebody has to scroll ten thousand rows of is a list that
/// wanted a filter.
class MPTable<T> extends StatelessWidget {
  /// Creates a table of [items] under [headers].
  const MPTable({
    required this.headers,
    required this.items,
    this.getRowKey,
    this.caption,
    this.empty,
    this.locale,
    this.striped = false,
    this.hoverable = false,
    this.stickyHeader = false,
    this.onRowPressed,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.semanticLabel,
    super.key,
  });

  /// The columns, in the order they appear.
  final List<MPTableColumn<T>> headers;

  /// The rows.
  final List<T> items;

  /// A stable key per row. Defaults to the row's index, which is fine for a
  /// static table and wrong for one whose rows move.
  final Object Function(T row, int index)? getRowKey;

  /// Shown above the table, and read out as its name when it is plain text
  /// and no [semanticLabel] is given.
  final Widget? caption;

  /// What to show instead of rows when [items] is empty. Defaults to the
  /// wording in [locale].
  final Widget? empty;

  /// Which language the empty line is written in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Tints every other row in `surfaceContainerLow`. Useful for a wide table
  /// where the eye has to track across; noise on a narrow one.
  final bool striped;

  /// Lights the row under the pointer in `surfaceContainer`.
  final bool hoverable;

  /// Pins the header while the body scrolls. Only does anything when
  /// something around the table constrains its height.
  final bool stickyHeader;

  /// Makes rows pressable, and turns on the hover treatment with them.
  ///
  /// A row that answers a press answers a keyboard too, so each one becomes a
  /// focus stop that takes <kbd>Enter</kbd> and <kbd>Space</kbd>. That is also
  /// its cost: two hundred rows are two hundred stops. React's `onRowClick`.
  final void Function(T row, int index)? onRowPressed;

  /// How much surface the sheet around the table paints.
  /// [MPVariant.outlined] by default.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`. A level moves the
  /// tone with the shadow; given one, [variant] keeps only its hairline.
  final MPElevation? elevation;

  /// The type scale and the cell padding.
  final MPSize? size;

  /// Takes room out of every cell, MD3's 4px off the row a step, and none out
  /// of the text: `md` goes 52, 48, 44, 40.
  final MPDensity? density;

  /// The table's name for a screen reader.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(colors, variant, elevation: elevation);
    final double hairline = paint.border?.width ?? 0;
    final String emptyText = mpMessagesOf(context, mpTableMessages, locale: locale)['empty']!;
    // A caption of plain words names the table when nothing else does, as a
    // `<caption>` names the React one, and is then left out of the tree where
    // it is drawn: read once, as the name, and not again as a line.
    final String? captionName = semanticLabel == null ? mpTextOf(caption) : null;

    final Widget grid = MPTableGrid(
      columns: <MPGridColumn>[
        for (final MPTableColumn<T> column in headers)
          MPGridColumn(
            id: column.key,
            cell: (int index) {
              final T row = items[index];

              return column.render?.call(row, index) ??
                  mpDrawableCell(mpCellValue(row, column.key)) ??
                  const SizedBox.shrink();
            },
            header: column.label ?? Text(column.key),
            width: column.width,
            align: column.align,
          ),
      ],
      rowCount: items.length,
      size: size,
      density: density,
      rowKey: getRowKey == null
          ? null
          : (int index) => ValueKey<Object>(getRowKey!(items[index], index)),
      // The stripe and the hover are the same neutral surface one step apart
      // rather than a tint: a table that alternates white and pale blue has
      // coloured half its data.
      rowTint: striped ? (int index) => index.isOdd ? colors.surfaceContainerLow : null : null,
      empty: empty ?? Text(emptyText),
      hoverable: hoverable,
      onRowPressed: onRowPressed == null ? null : (int index) => onRowPressed!(items[index], index),
      stickyHeader: stickyHeader,
      semanticLabel: semanticLabel ?? captionName,
    );

    return DecoratedBox(
      decoration: paint.decoration(radius),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        // The sheet clips at its corner: the header's band and a striped row
        // run to the edge, and would otherwise square off the rounded sheet.
        child: ClipRRect(
          borderRadius: radius - BorderRadius.circular(hairline),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (caption != null)
                ExcludeSemantics(
                  excluding: captionName != null,
                  child: MPTableBand(
                    size: size,
                    density: density,
                    child: DefaultTextStyle.merge(
                      style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                      child: caption!,
                    ),
                  ),
                ),
              // Gives way when there is a height to give way to, so a table in
              // a box smaller than its rows scrolls rather than overflowing it.
              Flexible(child: grid),
            ],
          ),
        ),
      ),
    );
  }
}
