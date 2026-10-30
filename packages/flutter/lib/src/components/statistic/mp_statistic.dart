/// One figure, said once and read from across a desk.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/statistic/number.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How the move from `previousValue` is written.
enum MPStatisticDeltaFormat {
  /// As a share of where it was: `+7.7%`. When there is no share to give,
  /// because the figure was zero, the absolute move instead.
  percent,

  /// In the figure's own units: `+9,200`.
  absolute,

  /// Both, the absolute first: `+9,200 · +7.7%`.
  both,

  /// Not at all.
  none,
}

/// Which way a figure has to move to be good news.
enum MPStatisticBetterWhen {
  /// Up: revenue, sign-ups, uptime.
  up,

  /// Down: churn, latency, cost, an error rate.
  down,
}

/// What the figure is set in: MD3's title, headline and display roles,
/// because this is the one number on the tile.
MPTypeRole _valueRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.titleMedium;
    case MPSize.sm:
      return scale.titleLarge;
    case MPSize.md:
      return scale.headlineSmall;
    case MPSize.lg:
      return scale.headlineMedium;
    case MPSize.xl:
      return scale.displaySmall;
  }
}

/// The label above the figure, and the unit beside it.
MPTypeRole _labelRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.labelSmall;
    case MPSize.sm:
      return scale.labelMedium;
    case MPSize.md:
      return scale.labelLarge;
    case MPSize.lg:
      return scale.titleSmall;
    case MPSize.xl:
      return scale.titleMedium;
  }
}

/// One figure, said once and read from across a desk.
///
/// ```dart
/// MPStatistic(label: const Text('Active installs'), value: 128400, previousValue: 119200)
/// ```
///
/// It is the chart you draw when there is nothing to plot. A single number
/// has no shape, no order and no second dimension, and putting it on a pair
/// of axes to make it look like data is the most common way a dashboard
/// wastes a panel. What a reader wants from one figure is the figure, what it
/// is, and whether it is going the right way.
///
/// ## The direction is the caller's to say
///
/// [betterWhen] exists because half the figures on any dashboard are the
/// other way round: churn, latency, cost and error rate are all better when
/// they fall. A component that painted every fall red would be wrong about
/// four tiles in eight. Flat is a third state rather than a quiet "up": it
/// takes the muted ink and a dash.
///
/// ## The figure does not wear the direction's colour
///
/// Only the move does. The number itself is `onSurface` at every size, in
/// every state: a reported value that changes colour with its own trend is a
/// value the reader has to decode before they can read it.
///
/// It draws no surface. A figure sits in a card, or in a row of them.
class MPStatistic extends StatelessWidget {
  /// Creates a statistic.
  const MPStatistic({
    required this.value,
    this.label,
    this.formatValue,
    this.compact = true,
    this.prefix,
    this.unit,
    this.previousValue,
    this.delta = MPStatisticDeltaFormat.percent,
    this.betterWhen = MPStatisticBetterWhen.up,
    this.period,
    this.caption,
    this.trend,
    this.align = MPAlign.start,
    this.size,
    super.key,
  }) : assert(
         value is num || value is String || value is Widget,
         'value is a num, a String or a Widget',
       );

  /// The figure.
  ///
  /// A [num] is written by [formatValue], or grouped and compacted when there
  /// is none. A [String] is drawn as it is, for a value that is already
  /// written, `2h 14m` or `A+`, and a [Widget] is drawn as it is too.
  final Object value;

  /// What the figure is. Sentence case, and no trailing colon.
  final Widget? label;

  /// How a numeric [value] is written, and the move with it.
  ///
  /// Giving one turns [compact] off: a caller who has written a currency has
  /// said what they want. A callback where React takes `Intl.NumberFormat`
  /// options. The move is written as this function writes the size of the
  /// move, with the sign put in front, so a currency formatter writes `-$375`
  /// for a fall.
  final String Function(num value)? formatValue;

  /// Shortens a number of five digits or more: `12.9K`, `4.2M`.
  ///
  /// Four digits stay: `1,284` is a figure anybody takes in at a glance, and
  /// `1.3K` has thrown away two of them to save two characters.
  final bool compact;

  /// Placed before the figure, on the same line: a currency mark, an icon.
  final Widget? prefix;

  /// Placed after it, one step smaller: a unit, a denominator.
  final Widget? unit;

  /// What the figure was, so the move from it can be drawn. Only read when
  /// [value] is a number.
  final num? previousValue;

  /// How that move is written.
  final MPStatisticDeltaFormat delta;

  /// Which direction is the good one.
  final MPStatisticBetterWhen betterWhen;

  /// What the move is measured against: "vs last week". Read out with it.
  final Widget? period;

  /// A line under the figure, for the thing that does not fit anywhere else.
  final Widget? caption;

  /// Room under the figure for a picture of it: a sparkline, usually.
  ///
  /// A slot rather than a chart of its own: a statistic that owned a
  /// sparkline would be a statistic with opinions about a second component's
  /// data, and the two are separable.
  final Widget? trend;

  /// Where the lines sit across the tile.
  final MPAlign align;

  /// The type scale of the figure and the words around it.
  final MPSize? size;

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTypeRole labelRole = _labelRole(theme.typescale, size);
    final TextStyle meta = theme.typescale.bodySmall.style();

    final (CrossAxisAlignment cross, TextAlign textAlign) = switch (align) {
      MPAlign.start => (CrossAxisAlignment.start, TextAlign.start),
      MPAlign.center => (CrossAxisAlignment.center, TextAlign.center),
      MPAlign.end => (CrossAxisAlignment.end, TextAlign.end),
    };

    final Object value = this.value;
    final Widget figure = switch (value) {
      final num number => Text(
        formatValue != null ? formatValue!(number) : writeFigure(number, compact: compact),
      ),
      final String text => Text(text),
      _ => value as Widget,
    };

    final Widget? move = _move(meta, colors);

    final List<Widget> lines = <Widget>[
      if (label != null)
        DefaultTextStyle.merge(style: labelRole.style(colors.onSurfaceVariant), child: label!),
      // No tabular figures, deliberately. They give every digit the width of
      // a zero, which lines a column of figures up and makes a single large
      // one look loose, and this is the single large one.
      DefaultTextStyle.merge(
        style: _valueRole(
          theme.typescale,
          size,
        ).style(colors.onSurface).copyWith(fontWeight: FontWeight.w500),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: <Widget>[
            if (prefix != null) ...<Widget>[prefix!, const SizedBox(width: 4)],
            Flexible(
              child: DefaultTextStyle.merge(
                maxLines: 1,
                softWrap: false,
                overflow: TextOverflow.ellipsis,
                child: figure,
              ),
            ),
            if (unit != null) ...<Widget>[
              const SizedBox(width: 4),
              DefaultTextStyle.merge(style: labelRole.style(colors.onSurfaceVariant), child: unit!),
            ],
          ],
        ),
      ),
      ?move,
      if (caption != null)
        DefaultTextStyle.merge(
          style: meta.copyWith(color: colors.onSurfaceVariant),
          child: caption!,
        ),
      if (trend != null) SizedBox(width: double.infinity, child: trend),
    ];

    return DefaultTextStyle.merge(
      textAlign: textAlign,
      child: Column(
        crossAxisAlignment: cross,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          for (int index = 0; index < lines.length; index += 1) ...<Widget>[
            if (index > 0) const SizedBox(height: 4),
            lines[index],
          ],
        ],
      ),
    );
  }

  /// The move from [previousValue], or `null` when there is nothing to say.
  Widget? _move(TextStyle meta, MPColorScheme colors) {
    final Object value = this.value;
    final num? previous = previousValue;

    if (value is! num || previous == null || delta == MPStatisticDeltaFormat.none) {
      return null;
    }

    final num change = value - previous;
    final int direction = change > 0
        ? 1
        : change < 0
        ? -1
        : 0;
    // Good news rather than a positive number. The two are the same thing for
    // revenue and the opposite for churn, and flat is neither.
    final bool good =
        direction != 0 && (betterWhen == MPStatisticBetterWhen.up ? direction > 0 : direction < 0);

    final String? percent = previous == 0 ? null : writePercent(change / previous.abs() * 100);
    final String absolute = writeMove(
      change,
      // Compacted on its own size, not the figure's: a move of 9,200 on a
      // figure of 128,400 is written in full.
      compact: formatValue == null && compact,
      format: formatValue,
    );

    // A figure that was zero has not grown by an amount, it has started, and
    // every percentage that could be printed there is one a reader would take
    // at face value, so `percent` falls back to the absolute move.
    final String written = switch (delta) {
      MPStatisticDeltaFormat.absolute => absolute,
      MPStatisticDeltaFormat.both => <String>[absolute, ?percent].join(' · '),
      _ => percent ?? absolute,
    };

    final Color ink = direction == 0
        ? colors.onSurfaceVariant
        : good
        ? colors.tertiary
        : colors.error;

    return DefaultTextStyle.merge(
      style: meta.copyWith(color: ink),
      child: Row(
        key: ValueKey<String>(
          direction == 0
              ? 'flat'
              : direction > 0
              ? 'up'
              : 'down',
        ),
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // The glyph is the second channel for a reader who can see it, and
          // why the colour is allowed to carry meaning at all: up, down and
          // flat are three shapes as well as three colours. It says nothing to
          // a screen reader, because the number beside it already carries its
          // sign.
          MPGlyph(
            direction == 0 ? MPGlyphShape.minus : MPGlyphShape.arrowRight,
            size: 14,
            color: ink,
            quarterTurns: direction == 0
                ? 0
                : direction > 0
                ? -1
                : 1,
          ),
          const SizedBox(width: 2),
          Flexible(child: Text(written)),
          if (period != null) ...<Widget>[
            const SizedBox(width: 2),
            Flexible(
              child: DefaultTextStyle.merge(
                style: TextStyle(color: colors.onSurfaceVariant),
                child: period!,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
