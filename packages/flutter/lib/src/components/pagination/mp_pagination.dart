/// A row of pages, one of which is the one being read.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A cell's inline padding: what it grows by once a page number is wider than
/// the cell is tall.
const Map<MPSize, double> _cellPadX = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 10,
  MPSize.lg: 12,
  MPSize.xl: 14,
};

/// Between the cells. Tighter than a button group's: this is one control.
const Map<MPSize, double> _rowGap = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 4,
  MPSize.md: 4,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// One place in the row: a page, or a gap.
///
/// `null` is a gap. Which end of the row a gap folds is not needed here: the
/// React build's two flavours are for a caller reading the range back, and
/// nothing outside reads it.
List<int?> _paginationRange(int count, int page, int siblingCount, int boundaryCount) {
  List<int> range(int start, int end) {
    return <int>[for (int index = start; index <= end; index += 1) index];
  }

  final List<int> startPages = range(1, math.min(boundaryCount, count));
  final List<int> endPages = range(math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  final int siblingsStart = math.max(
    math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  final int siblingsEnd = math.min(
    math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.isNotEmpty ? endPages.first - 2 : count - 1,
  );

  return <int?>[
    ...startPages,
    // A gap when more than one page is hidden, the page itself when exactly
    // one is, and nothing when none is: `1 … 3 … 9` hides one number behind a
    // symbol wider than the number it replaced.
    if (siblingsStart > boundaryCount + 2)
      null
    else if (boundaryCount + 1 < count - boundaryCount)
      boundaryCount + 1,
    ...range(siblingsStart, siblingsEnd),
    if (siblingsEnd < count - boundaryCount - 1)
      null
    else if (count - boundaryCount > boundaryCount)
      count - boundaryCount,
    ...endPages,
  ];
}

/// A row of pages, one of which is the one being read.
///
/// ```dart
/// MPPagination(
///   count: 20,
///   page: page,
///   onChanged: (int next) => setState(() => page = next),
/// )
/// ```
///
/// Material has no pagination component, so what is Material here is
/// everything round the decision: the cells are pills at the library's own
/// control heights, the current one is filled with the accent under its own
/// ink, the rest are the quiet `text` treatment, and every one carries the
/// state layer.
///
/// The row keeps a constant number of places whatever page it is on: the
/// window slides towards whichever end it is near instead of being cut off by
/// it, so stepping from page 1 to page 2 does not move every cell out from
/// under the pointer that pressed one. Fewer than two pages and the whole
/// control draws nothing.
///
/// Controlled with [page] and [onChanged], or left to hold its own page from
/// [initialPage]. Pages are counted from 1.
class MPPagination extends StatefulWidget {
  /// Creates a row of [count] pages.
  const MPPagination({
    required this.count,
    this.page,
    this.initialPage = 1,
    this.onChanged,
    this.siblingCount = 1,
    this.boundaryCount = 1,
    this.showEdges = false,
    this.showArrows = true,
    this.size,
    this.color,
    this.fullWidth = false,
    this.disabled = false,
    this.locale,
    this.labels,
    super.key,
  });

  /// How many pages there are.
  final int count;

  /// The current page, from 1. Given, the row is controlled.
  final int? page;

  /// Which page starts current, for a row that holds its own.
  final int initialPage;

  /// Called with the page that was chosen.
  final ValueChanged<int>? onChanged;

  /// How many pages are always shown on either side of the current one.
  final int siblingCount;

  /// How many pages are always shown at each end. `0` drops the first and last
  /// page from the row, leaving only the window.
  final int boundaryCount;

  /// Shows the two steppers that jump to the first and last page.
  final bool showEdges;

  /// Shows the two steppers that move by one page.
  final bool showArrows;

  /// Which rung: the cells are the control heights.
  final MPSize? size;

  /// Which accent family the current page is filled with.
  final MPColor? color;

  /// Centres the row in the width it is given.
  final bool fullWidth;

  /// Unavailable. Every cell stops answering.
  final bool disabled;

  /// Which language the row names itself and its pages in. Nothing here is
  /// drawn in words, so without it a Korean screen reads its pages out in
  /// English.
  final String? locale;

  /// Overrides for the words themselves (`label`, `page`, `status`,
  /// `previous`, `next`, `first`, `last`). They win over the translation.
  final Map<String, String>? labels;

  @override
  State<MPPagination> createState() => _MPPaginationState();
}

class _MPPaginationState extends State<MPPagination> {
  late int _own = widget.initialPage;

  int get _current {
    return (widget.page ?? _own).clamp(1, math.max(widget.count, 1));
  }

  void _go(int next) {
    final int clamped = next.clamp(1, math.max(widget.count, 1));

    if (clamped == _current) {
      return;
    }

    if (widget.page == null) {
      setState(() => _own = clamped);
    }

    widget.onChanged?.call(clamped);
  }

  @override
  Widget build(BuildContext context) {
    // One page is not a set of pages, and a row holding a lone "1" is a
    // control advertising that it has nothing to do.
    if (widget.count < 2) {
      return const SizedBox.shrink();
    }

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(widget.color ?? config?.color ?? MPColor.primary);
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpPaginationMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );
    final bool disabled = widget.disabled || MPFieldsetScope.disabledOf(context);
    final int current = _current;
    final int count = widget.count;
    final bool atStart = current <= 1;
    final bool atEnd = current >= count;
    final double icon = mpControlIcon[size]!;
    final bool rtl = Directionality.maybeOf(context) == TextDirection.rtl;

    // The steppers point against and along the reading direction, so under
    // right-to-left "previous" points right: mirrored rather than swapped.
    Widget chevron({required bool back}) {
      return MPGlyph(MPGlyphShape.chevron, size: icon, quarterTurns: back != rtl ? 1 : -1);
    }

    Widget doubleChevron({required bool back}) {
      return MPGlyph(MPGlyphShape.doubleChevron, size: icon, quarterTurns: back != rtl ? 2 : 0);
    }

    Widget cell({
      required int to,
      required bool unavailable,
      required String name,
      required Widget body,
      bool chosen = false,
    }) {
      return _Cell(
        size: size,
        accent: accent,
        chosen: chosen,
        unavailable: unavailable,
        name: name,
        onPressed: () => _go(to),
        child: body,
      );
    }

    final List<Widget> cells = <Widget>[
      if (widget.showEdges)
        cell(
          to: 1,
          unavailable: disabled || atStart,
          name: messages['first']!,
          body: doubleChevron(back: true),
        ),
      if (widget.showArrows)
        cell(
          to: current - 1,
          unavailable: disabled || atStart,
          name: messages['previous']!,
          body: chevron(back: true),
        ),
      // In place, by slot rather than by page number: the window recentres on
      // the page just chosen, so almost every number moves one place along,
      // and a cell that followed its number would be a different cell under
      // the pointer that pressed it.
      for (final int? slot in _paginationRange(
        count,
        current,
        widget.siblingCount,
        widget.boundaryCount,
      ))
        if (slot == null)
          // Punctuation rather than a disabled button, and not read out:
          // "horizontal ellipsis" between two numbers is noise.
          ExcludeSemantics(
            child: ConstrainedBox(
              constraints: BoxConstraints.tightFor(
                height: mpControlHeight[size],
              ).copyWith(minWidth: mpControlHeight[size]),
              child: Center(
                child: Text(
                  '…',
                  style: mpControlText(theme.typescale, size).style(colors.onSurfaceVariant),
                ),
              ),
            ),
          )
        else
          cell(
            to: slot,
            unavailable: disabled,
            chosen: slot == current,
            name: mpFillMessage(messages['page']!, <String, String>{'page': '$slot'}),
            body: Text('$slot'),
          ),
      if (widget.showArrows)
        cell(
          to: current + 1,
          unavailable: disabled || atEnd,
          name: messages['next']!,
          body: chevron(back: false),
        ),
      if (widget.showEdges)
        cell(
          to: count,
          unavailable: disabled || atEnd,
          name: messages['last']!,
          body: doubleChevron(back: false),
        ),
    ];

    final Widget row = Row(
      mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      spacing: _rowGap[size]!,
      children: cells,
    );

    // A named region a screen reader can skip, which says where the reader is
    // as a sentence: the filled cell says which page is chosen, the sentence
    // says how many there are, which the row no longer does once a gap is in
    // it. Said again whenever the page changes.
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: messages['label'],
      value: mpFillMessage(messages['status']!, <String, String>{
        'page': '$current',
        'total': '$count',
      }),
      liveRegion: true,
      child: row,
    );
  }
}

/// One cell: a page or a stepper.
///
/// It builds its own cells rather than using a button, because a page cell is
/// square until its number needs more and grows only by its padding, which is
/// not a shape a button has. The heights, the type and the state layer are the
/// shared ones, so a `sm` pagination still lines up with a `sm` button beside
/// it.
class _Cell extends StatelessWidget {
  const _Cell({
    required this.size,
    required this.accent,
    required this.chosen,
    required this.unavailable,
    required this.name,
    required this.onPressed,
    required this.child,
  });

  final MPSize size;
  final MPAccent accent;
  final bool chosen;
  final bool unavailable;
  final String name;
  final VoidCallback onPressed;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double height = mpControlHeight[size]!;
    final BorderRadius radius = MPShapes.circular(theme.shapes.full, height: height);
    final Color ink = unavailable
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : chosen
        ? accent.onColor
        : colors.onSurface;
    final Color fill = !unavailable && chosen ? accent.color : accent.color.withValues(alpha: 0);

    // The page being read is not somewhere to go, so it answers nothing, but
    // it stays a stop: it is where the reader is.
    final bool answers = !unavailable && !chosen;

    return Semantics(
      container: true,
      button: true,
      enabled: !unavailable,
      // The nearest Flutter has to `aria-current="page"`.
      selected: chosen,
      label: name,
      onTap: answers ? onPressed : null,
      child: MPInteractive(
        onTap: answers ? onPressed : null,
        enabled: !unavailable,
        interactive: !unavailable,
        focusSemantics: true,
        cursor: unavailable ? SystemMouseCursors.basic : SystemMouseCursors.click,
        builder: (BuildContext context, MPInteraction state) {
          Widget surface = Padding(
            padding: EdgeInsets.symmetric(horizontal: _cellPadX[size]!),
            child: Center(
              widthFactor: 1,
              child: DefaultTextStyle.merge(
                style: mpControlText(theme.typescale, size)
                    .style(ink)
                    .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
                maxLines: 1,
                softWrap: false,
                child: IconTheme.merge(
                  data: IconThemeData(color: ink),
                  child: ExcludeSemantics(child: child),
                ),
              ),
            ),
          );

          surface = MPStateLayer(
            color: ink,
            opacity: mpStateLayerOpacity(state, enabled: !unavailable),
            borderRadius: radius,
            child: surface,
          );

          surface = AnimatedContainer(
            duration: duration,
            curve: MPMotion.standard,
            decoration: BoxDecoration(color: fill, borderRadius: radius),
            clipBehavior: Clip.antiAlias,
            child: surface,
          );

          surface = ConstrainedBox(
            // `minWidth` rather than a fixed width: a page number is one to
            // four digits, and a cell exactly as wide as it is tall would clip
            // `1024`.
            constraints: BoxConstraints(minHeight: height, maxHeight: height, minWidth: height),
            child: surface,
          );

          return CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                : null,
            child: surface,
          );
        },
      ),
    );
  }
}
