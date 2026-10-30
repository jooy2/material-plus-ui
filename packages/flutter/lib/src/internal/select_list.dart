/// The floating list a select, a combobox and a tree select drop out of their
/// field, and the row each option in it is.
///
/// The React package draws the same sheet and the same row three times, once
/// per component, out of `bg-mp-surface-container`, `shadow-mp-2`, the
/// `secondary-container` fill of a chosen row, the state layer of a
/// highlighted one and the tick column `internal/mark.ts` times. A select and
/// a combobox side by side in one form have to open the same list, so here it
/// is written once.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How tall the list may get before it scrolls: `max-h-[min(20rem,…)]`.
const double mpSelectListMaxHeight = 320;

/// The room the sheet keeps round its rows: `p-2`.
const double mpSelectListPad = 8;

/// How far the list stands off the field: Base UI's `sideOffset={4}`.
const double mpSelectListOffset = 4;

/// The column the mark stands in at the start of every row: `size-5`.
const double _markBox = 20;

/// The tick and the plus drawn in that column.
const double _markGlyph = 18;

/// How long a burst of typed characters counts as one search: Base UI's
/// typeahead window.
const Duration _typeaheadWindow = Duration(milliseconds: 750);

/// What stands in a row's mark column.
enum MPSelectMark {
  /// A tick while the row is chosen, and an empty column otherwise.
  check,

  /// A plus, always: the row that offers what was typed as a new value.
  plus,

  /// Nothing, and no column.
  none,
}

/// The sheet a list of options is drawn on.
///
/// `surfaceContainer` at elevation 2, on the extra-small corner: the one
/// surface in the library that genuinely floats, and the only one that carries
/// a shadow by default. As wide as its widest row, which the portal holds to at
/// least the field's width, and no taller than [mpSelectListMaxHeight].
class MPSelectSheet extends StatelessWidget {
  /// Draws [children] on the sheet.
  const MPSelectSheet({
    required this.children,
    this.controller,
    this.header,
    this.width,
    super.key,
  });

  /// The rows.
  final List<Widget> children;

  /// The list's scroll position, for keeping a row the keys moved to in view.
  final ScrollController? controller;

  /// Something above the rows that does not scroll with them: a search field.
  final Widget? header;

  /// A fixed width, for a sheet whose content is not a column of rows that can
  /// say how wide it wants to be. Left out, the widest row decides.
  final double? width;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    Widget list = SingleChildScrollView(
      controller: controller,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: children,
      ),
    );

    if (header != null) {
      list = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: mpSelectListPad,
        children: <Widget>[
          header!,
          Flexible(child: list),
        ],
      );
    }

    Widget sheet = Container(
      width: width,
      constraints: const BoxConstraints(maxHeight: mpSelectListMaxHeight),
      padding: const EdgeInsets.all(mpSelectListPad),
      decoration: BoxDecoration(
        color: theme.colors.surfaceContainer,
        borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
        boxShadow: MPShadows.of(2),
      ),
      clipBehavior: Clip.antiAlias,
      child: list,
    );

    if (width == null) {
      // A scroll view fills whatever width it is offered, which here is the
      // screen; the rows are what should decide.
      sheet = IntrinsicWidth(child: sheet);
    }

    // A press anywhere on the sheet is the sheet's, including one on its
    // padding, which would otherwise fall through to the press outside that
    // closes it.
    return Listener(
      behavior: HitTestBehavior.opaque,
      child: Semantics(container: true, explicitChildNodes: true, child: sheet),
    );
  }
}

/// One option in a list: the fill of a chosen row, the wash of a highlighted
/// one, the mark column and the label.
///
/// A chosen row is marked with a tick as well as a fill, because a highlight
/// is also what the keyboard's cursor looks like, and a list where "chosen"
/// and "where the arrow keys are" are the same colour is a list nobody can
/// read. The highlight is a state layer over the row rather than a fill of its
/// own, so it composites onto a chosen row's fill instead of replacing it, and
/// eases rather than flashing at the arrow keys.
///
/// Both the pointer and the keys move [lit]: a list keeps one highlighted row,
/// and this reports the pointer's arrival through [onHover] for the list to
/// move it there.
class MPSelectRow extends StatelessWidget {
  /// Creates a row of a list of [size].
  const MPSelectRow({
    required this.size,
    required this.child,
    required this.onPressed,
    this.onHover,
    this.lit = false,
    this.selected = false,
    this.disabled = false,
    this.mark = MPSelectMark.check,
    this.exclusive = true,
    this.truncate = true,
    this.semanticLabel,
    super.key,
  });

  /// The list's rung, which decides the type the label is set in.
  final MPSize size;

  /// The label, usually a [Text].
  final Widget child;

  /// Takes the row, by pointer or from a screen reader. A disabled row still
  /// swallows the press, so it does not reach what is under the popup.
  final VoidCallback onPressed;

  /// The pointer moved over the row.
  final VoidCallback? onHover;

  /// Whether the row is the highlighted one.
  final bool lit;

  /// Whether the row is chosen: the fill, the tick, and `selected` for a
  /// screen reader.
  final bool selected;

  /// Unavailable, but still listed.
  final bool disabled;

  /// What stands in the mark column.
  final MPSelectMark mark;

  /// Whether the row is one of a set only one of which can be chosen, which a
  /// screen reader says of a single-value list and not of a multiple one.
  final bool exclusive;

  /// Whether the label is one line, cut short with an ellipsis. Off for a
  /// row whose label is a layout of its own, a thumbnail and two lines, which
  /// an ellipsis would clip rather than shorten.
  final bool truncate;

  /// The row's name for a screen reader, where the label's own words would not
  /// do.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : selected
        ? colors.onSecondaryContainer
        : colors.onSurface;

    Widget label = DefaultTextStyle.merge(
      style: mpProseText(theme.typescale, size).style(),
      maxLines: truncate ? 1 : null,
      softWrap: !truncate,
      overflow: truncate ? TextOverflow.ellipsis : TextOverflow.clip,
      child: child,
    );

    label = TweenAnimationBuilder<Color?>(
      tween: ColorTween(end: ink),
      duration: duration,
      curve: MPMotion.standard,
      child: label,
      builder: (BuildContext context, Color? color, Widget? child) {
        return DefaultTextStyle.merge(
          style: TextStyle(color: color),
          child: IconTheme.merge(
            data: IconThemeData(color: color),
            child: child!,
          ),
        );
      },
    );

    final Widget? markColumn = switch (mark) {
      MPSelectMark.none => null,
      MPSelectMark.plus => SizedBox.square(
        dimension: _markBox,
        child: Center(
          child: MPGlyph(MPGlyphShape.plus, size: _markGlyph, color: ink),
        ),
      ),
      // The column is always there and only the tick comes and goes: a mark
      // that took its column with it would shift every label in the list
      // sideways as the selection moved down it.
      MPSelectMark.check => SizedBox.square(
        dimension: _markBox,
        child: Center(
          child: MPSelectTick(
            shown: selected,
            child: MPGlyph(MPGlyphShape.check, size: _markGlyph, color: ink),
          ),
        ),
      ),
    };

    Widget row = Padding(
      padding: const EdgeInsetsDirectional.only(start: 8, end: 12, top: 8, bottom: 8),
      child: Row(
        spacing: 12,
        children: <Widget>[
          ?markColumn,
          Expanded(child: label),
        ],
      ),
    );

    row = MPStateLayer(
      color: ink,
      // `data-highlighted:opacity-8`, and nothing on a disabled row, which the
      // keys pass over and the pointer cannot take.
      opacity: lit && !disabled ? MPStateOpacity.hover : 0,
      borderRadius: radius,
      child: row,
    );

    row = AnimatedContainer(
      duration: duration,
      curve: MPMotion.standard,
      decoration: BoxDecoration(
        color: selected
            ? colors.secondaryContainer
            : colors.secondaryContainer.withValues(alpha: 0),
        borderRadius: radius,
      ),
      child: row,
    );

    return Semantics(
      container: true,
      selected: selected,
      inMutuallyExclusiveGroup: exclusive ? true : null,
      enabled: !disabled,
      label: semanticLabel,
      // The gesture below keeps itself off the semantics tree, so the action
      // a screen reader fires is declared here, and none on a disabled row.
      onTap: disabled ? null : onPressed,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        // Only a pointer that moves lights a row, as Base UI lights one on a
        // pointer move: a list that opens under a resting pointer, or a row the
        // keys scroll under one, would otherwise have the light taken from
        // where the keys put it.
        onHover: onHover == null ? null : (PointerHoverEvent event) => onHover!(),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTap: disabled ? () {} : onPressed,
          child: ExcludeSemantics(excluding: semanticLabel != null, child: row),
        ),
      ),
    );
  }
}

/// A tick that grows into its row as the row is chosen and plays back out as
/// it is let go of.
///
/// The timing every mark in the library shares, `internal/mark.ts`'s: 200ms
/// on the standard curve, from 60% of its size, where a stroke is already
/// legible as a tick rather than a smudge.
class MPSelectTick extends StatelessWidget {
  /// Shows [child] while [shown].
  const MPSelectTick({required this.shown, required this.child, super.key});

  /// Whether the tick is in.
  final bool shown;

  /// The tick.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    return AnimatedOpacity(
      opacity: shown ? 1 : 0,
      duration: duration,
      curve: MPMotion.standard,
      child: AnimatedScale(
        scale: shown ? 1 : 0.6,
        duration: duration,
        curve: MPMotion.standard,
        child: child,
      ),
    );
  }
}

/// The line a list shows where its rows would be when there are none:
/// `px-3 py-2`, muted.
class MPSelectEmpty extends StatelessWidget {
  /// Shows [child] as the empty line of a list of [size].
  const MPSelectEmpty({required this.size, required this.child, super.key});

  /// The list's rung.
  final MPSize size;

  /// What it says.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: DefaultTextStyle.merge(
        style: mpProseText(theme.typescale, size).style(theme.colors.onSurfaceVariant),
        child: child,
      ),
    );
  }
}

/// The run of characters a list is being searched by from the keyboard, as a
/// native `<select>` and Base UI's both search: each character within
/// three-quarters of a second of the last extends the run, and a pause starts a
/// new one.
class MPTypeahead {
  String _run = '';
  DateTime _last = DateTime.fromMillisecondsSinceEpoch(0);

  /// Adds [character] and returns the run to match, lower-cased.
  ///
  /// The same character pressed again and again cycles through the options
  /// that start with it rather than searching for `ss`, as both do.
  String add(String character) {
    final DateTime now = DateTime.now();
    final String folded = character.toLowerCase();

    _run = now.difference(_last) > _typeaheadWindow ? folded : '$_run$folded';
    _last = now;

    if (_run.length > 1 && _run.split('').every((String letter) => letter == folded)) {
      return folded;
    }

    return _run;
  }

  /// The index of the first of [labels] after [from] that starts with [run],
  /// going round, and skipping any [skip] says no to. `-1` for none.
  ///
  /// A run of one character starts after [from], so pressing it again moves
  /// on; a longer run starts at [from], so typing more of the word the
  /// highlight is already on keeps it there.
  static int find(
    List<String> labels,
    String run, {
    required int from,
    bool Function(int index)? skip,
  }) {
    final int count = labels.length;

    if (count == 0 || run.isEmpty) {
      return -1;
    }

    final int start = run.length == 1 ? from + 1 : from;

    for (int step = 0; step < count; step += 1) {
      final int index = ((start + step) % count + count) % count;

      if ((skip == null || !skip(index)) && labels[index].toLowerCase().startsWith(run)) {
        return index;
      }
    }

    return -1;
  }
}

/// A row that has just arrived in a list, settling into place: up from 4px
/// below where it lands, out of nothing, on `short4` with the emphasised
/// entrance. React's `mp-row-arrive`.
///
/// Only a row that [arriving] says is new moves; the rows already there stay
/// still, so the eye goes to the one that changed. Nothing moves under reduced
/// motion.
class MPArrivingRow extends StatefulWidget {
  /// Settles [child] in when [arriving].
  const MPArrivingRow({required this.arriving, required this.child, super.key});

  /// Whether the row is new as it is first built. Read once.
  final bool arriving;

  /// The row.
  final Widget child;

  @override
  State<MPArrivingRow> createState() => _MPArrivingRowState();
}

class _MPArrivingRowState extends State<MPArrivingRow> with SingleTickerProviderStateMixin {
  late final AnimationController _arrive = AnimationController(
    vsync: this,
    duration: MPMotion.short4,
    value: 1,
  );
  late final CurvedAnimation _eased = CurvedAnimation(
    parent: _arrive,
    curve: MPMotion.emphasizedDecelerate,
  );
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Read here rather than in `initState`, where the media query cannot be.
    if (!_started) {
      _started = true;

      if (widget.arriving && !(MediaQuery.maybeDisableAnimationsOf(context) ?? false)) {
        _arrive.forward(from: 0);
      }
    }
  }

  @override
  void dispose() {
    _eased.dispose();
    _arrive.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _eased,
      child: widget.child,
      builder: (BuildContext context, Widget? child) {
        final double t = _eased.value;

        // The same two widgets at rest as on the way in, so a row that has
        // settled is not built again from scratch, losing the focus on its ×.
        return Opacity(
          opacity: t,
          child: Transform.translate(offset: Offset(0, 4 * (1 - t)), child: child),
        );
      },
    );
  }
}
