/// A floating lozenge holding a small amount of live information.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/ease.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/fold.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The air either side of the middle, and what makes this read as a lozenge
/// rather than as a wide chip: roughly double the sheet's inline padding, so
/// the column a pill is *about* gets noticeably more room than the furniture
/// on either side of it.
const Map<MPSize, double> _centrePad = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 20,
  MPSize.md: 24,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// The room above and below the row, which costs nothing on one line and keeps
/// two lines off the edges.
const double _rowPadY = 4;

/// The room under the details.
const double _detailsPadBottom = 8;

/// How much of the title's ink the description keeps. Taken from the ink that
/// is already there rather than pointed at a grey, so it reads as one step
/// quieter on the accent's own fill as well as on a neutral surface.
const double _descriptionInk = 0.72;

/// A floating lozenge holding a small amount of live information: a call in
/// progress, an upload still going, a recording, a train two minutes away.
///
/// ```dart
/// MPPill(
///   title: const Text('On a call'),
///   description: const Text('04:12'),
///   onPressed: () => setState(() => open = !open),
///   expanded: open,
///   details: const Text('Ada, Grace and two others.'),
/// )
/// ```
///
/// MD3 does not describe this shape; the library ships it because the
/// specification's own parts can draw it and no other component does.
///
/// A collapsed pill is a stadium, a corner every other sheet in the library is
/// held back from: it is an object hovering over the page rather than a sheet
/// lying on it. Opening [details] moves the corner to `extraLarge`, eased,
/// because a stadium corner on a box six lines tall eats the first words of
/// every line.
///
/// Where it sits is the layout's decision: put it in a `Stack` with a
/// `Positioned`, or in an `Overlay`, to float it over the page.
class MPPill extends StatefulWidget {
  /// Creates a pill.
  const MPPill({
    this.title,
    this.description,
    this.startIcon,
    this.endIcon,
    this.details,
    this.expanded = false,
    this.onPressed,
    this.variant = MPVariant.filled,
    this.size,
    this.color = MPColor.secondary,
    this.focusNode,
    this.autofocus = false,
    this.child,
    super.key,
  });

  /// The headline in the middle: what the pill is currently about. Cut short
  /// with an ellipsis rather than wrapped.
  final Widget? title;

  /// The second line, under the title, one step down and quieter.
  final Widget? description;

  /// The leading slot: a glyph, an avatar, a status dot, a photograph. Given a
  /// square box the size of a glyph beside a label, clipped to a circle.
  final Widget? startIcon;

  /// The trailing slot. Outside the pressable area, so it can be a control of
  /// its own.
  final Widget? endIcon;

  /// The second half, revealed when [expanded]. The pill grows downward into
  /// it rather than swapping to another shape: one object saying more.
  final Widget? details;

  /// Whether [details] is showing.
  final bool expanded;

  /// Runs when the middle is pressed. Passing it makes the middle a button,
  /// which says whether [details] are showing.
  final VoidCallback? onPressed;

  /// How much surface the lozenge paints, said the way a control says it: a
  /// pill is the thing being coloured, so [MPVariant.filled] takes the accent.
  /// Every variant carries a shadow, because a lozenge floating flat on the
  /// content it floats over reads as a mistake.
  final MPVariant variant;

  /// The row's minimum height and the type scale in it: the control heights, so
  /// a collapsed pill lines up with a button of the same size beside it.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family it reads.
  final MPColor color;

  /// Drives the pressable middle's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// Anything the middle needs that [title] and [description] cannot say: a
  /// pair of readouts, a live counter, a progress indicator. Under them, in the
  /// same centred column.
  final Widget? child;

  @override
  State<MPPill> createState() => _MPPillState();
}

class _MPPillState extends State<MPPill> with SingleTickerProviderStateMixin {
  late final AnimationController _open = AnimationController(
    vsync: this,
    value: widget.expanded ? 1 : 0,
  );
  late final CurvedAnimation _reveal = CurvedAnimation(parent: _open, curve: Curves.linear);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
  }

  @override
  void didUpdateWidget(MPPill oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.expanded != oldWidget.expanded) {
      _syncMotion();
      widget.expanded ? _open.forward() : _open.reverse();
    }
  }

  @override
  void dispose() {
    _reveal.dispose();
    _open.dispose();
    super.dispose();
  }

  void _syncMotion() {
    _open.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;
    easeBothWays(_reveal, MPMotion.standard);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final _PillPaint paint = _paintFor(colors, colors.accent(widget.color), widget.variant);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final bool interactive = widget.onPressed != null;
    final double rowMin = mpControlHeight[size]!;
    final double padX = mpSheetPad[size]!;
    final double icon = mpControlIcon[size]!;

    // A stadium for the one-line row, and `extraLarge` once the details are
    // open. Both are numbers, so the corner eases from one to the other.
    final BorderRadius corner = BorderRadius.circular(
      widget.expanded ? theme.shapes.extraLarge : rowMin / 2,
    );

    final bool hasMiddle =
        widget.title != null || widget.description != null || widget.child != null;

    final Widget middle = Row(
      mainAxisSize: MainAxisSize.min,
      spacing: mpControlGap[size]!,
      children: <Widget>[
        if (widget.startIcon != null)
          ClipOval(
            child: SizedBox.square(
              dimension: icon,
              child: IconTheme.merge(
                data: IconThemeData(color: paint.ink, size: icon),
                child: Center(child: widget.startIcon),
              ),
            ),
          ),
        if (hasMiddle) Flexible(child: _centre(theme, size, paint)),
      ],
    );

    Widget row;

    if (interactive) {
      // A press on the middle, with the trailing slot outside it: the same
      // shape `MPChip` takes, so a control in `endIcon` is a stop of its own.
      row = MPInteractive(
        onTap: widget.onPressed,
        focusNode: widget.focusNode,
        autofocus: widget.autofocus,
        builder: (BuildContext context, MPInteraction state) {
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            container: true,
            button: true,
            enabled: true,
            focused: focus.focused,
            onFocus: focus.onFocus,
            // Only where there is something to expand: a control that changes
            // what is on screen without saying so leaves a screen reader to
            // find out by accident.
            expanded: widget.details != null ? widget.expanded : focus.expanded,
            onTap: widget.onPressed,
            child: CustomPaint(
              // Inside the edge rather than outside it, so the ring traces the
              // lozenge's own corners on the part of it that is pressable.
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(
                      color: colors.secondary,
                      borderRadius: corner,
                      offset: -focusRingWidth,
                    )
                  : null,
              child: MPStateLayer(
                color: paint.ink,
                opacity: mpStateLayerOpacity(state),
                borderRadius: corner,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: rowMin),
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: padX, vertical: _rowPadY),
                    child: Center(widthFactor: 1, child: middle),
                  ),
                ),
              ),
            ),
          );
        },
      );
    } else {
      row = ConstrainedBox(
        constraints: BoxConstraints(minHeight: rowMin),
        child: Padding(
          padding: EdgeInsetsDirectional.only(
            start: padX,
            end: widget.endIcon == null ? padX : 0,
            top: _rowPadY,
            bottom: _rowPadY,
          ),
          child: Center(widthFactor: 1, child: middle),
        ),
      );
    }

    row = Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Flexible(child: row),
        if (widget.endIcon != null)
          Padding(padding: const EdgeInsetsDirectional.only(end: 4), child: widget.endIcon),
      ],
    );

    Widget pill = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        row,
        if (widget.details != null)
          MPFold(
            factor: _reveal,
            // Out of the focus order and the semantics tree while folded away:
            // a zero-height panel's content is otherwise still perfectly
            // reachable, and a reader would tab into something they cannot see.
            child: ExcludeFocus(
              excluding: !widget.expanded,
              child: ExcludeSemantics(
                excluding: !widget.expanded,
                child: Padding(
                  padding: EdgeInsetsDirectional.only(
                    start: padX,
                    end: padX,
                    bottom: _detailsPadBottom,
                  ),
                  child: DefaultTextStyle.merge(
                    style: mpProseText(theme.typescale, size).style(paint.ink),
                    child: widget.details!,
                  ),
                ),
              ),
            ),
          ),
      ],
    );

    // As wide as the wider of the row and the details set on one line, and no
    // wider than it is given, which is what the React pill's shrink-to-fit
    // box comes to.
    pill = DefaultTextStyle.merge(
      style: mpControlText(theme.typescale, size).style(paint.ink),
      child: IntrinsicWidth(child: pill),
    );

    return AnimatedContainer(
      duration: reduceMotion ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      decoration: BoxDecoration(
        color: paint.fill,
        borderRadius: corner,
        border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
        boxShadow: paint.shadows,
      ),
      clipBehavior: Clip.antiAlias,
      child: pill,
    );
  }

  /// The middle, centred in a column of its own and padded well clear of both
  /// neighbours: the pill is a frame, and this is what is in it.
  Widget _centre(MPThemeData theme, MPSize size, _PillPaint paint) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: _centrePad[size]!),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (widget.title != null)
            DefaultTextStyle.merge(
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              child: widget.title!,
            ),
          if (widget.description != null)
            DefaultTextStyle.merge(
              style: theme.typescale.bodySmall.style(
                paint.ink.withValues(alpha: paint.ink.a * _descriptionInk),
              ),
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              child: widget.description!,
            ),
          ?widget.child,
        ],
      ),
    );
  }
}

/// What a pill paints.
class _PillPaint {
  const _PillPaint({required this.fill, required this.ink, required this.shadows, this.border});

  final Color fill;
  final Color ink;
  final List<BoxShadow> shadows;
  final BorderSide? border;
}

/// The five weights, said the way a control says them. `elevated` is the one
/// nearly redundant here, since every pill already carries a shadow; what it
/// adds is the neutral surface rather than the height.
_PillPaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _PillPaint(fill: accent.color, ink: accent.onColor, shadows: MPShadows.of(2));
    case MPVariant.tonal:
      return _PillPaint(fill: accent.container, ink: accent.onContainer, shadows: MPShadows.of(2));
    case MPVariant.elevated:
      return _PillPaint(
        fill: colors.surfaceContainerLow,
        ink: accent.color,
        shadows: MPShadows.of(2),
      );
    case MPVariant.outlined:
      return _PillPaint(
        fill: colors.surfaceContainer,
        ink: colors.onSurface,
        shadows: MPShadows.of(1),
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _PillPaint(
        fill: colors.surfaceContainer,
        ink: colors.onSurface,
        shadows: MPShadows.of(1),
      );
  }
}
