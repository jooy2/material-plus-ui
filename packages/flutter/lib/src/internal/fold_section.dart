/// The header and the panel a section that folds is made of, shared by
/// `MPCollapsible` and `MPAccordionItem`.
///
/// The two components differ in who owns the open state (the section itself,
/// or the stack it is in) and in nothing about how a fold looks or moves, so
/// the drawing lives here once. A collapsible a pixel off the accordion beside
/// it is the drift a shared file exists to prevent.
library;

import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The trigger row of a fold: the start icon, the title and subtitle, and the
/// chevron, under MD3's state layer, with [action] beside it rather than in it.
///
/// [action] sits outside the trigger on purpose. A header that both folds and
/// holds a switch has two things to press, and one inside the other would make
/// the switch's press fold the section as well.
class MPFoldHeader extends StatelessWidget {
  /// Creates a fold's header.
  const MPFoldHeader({
    required this.open,
    required this.onToggle,
    required this.size,
    required this.padX,
    required this.padY,
    this.title,
    this.subtitle,
    this.startIcon,
    this.action,
    this.indicator = true,
    this.disabled = false,
    this.borderRadius = BorderRadius.zero,
    this.headingLevel,
    this.focusNode,
    super.key,
  });

  /// Whether the panel is showing, which turns the chevron.
  final bool open;

  /// Called when the trigger is pressed.
  final VoidCallback onToggle;

  /// The rung the title and the chevron are drawn at.
  final MPSize size;

  /// The trigger's inline padding, which [action] is spaced by too.
  final double padX;

  /// The trigger's block padding.
  final double padY;

  /// The heading on the trigger.
  final Widget? title;

  /// The muted second line under it.
  final Widget? subtitle;

  /// Content before the title.
  final Widget? startIcon;

  /// A control at the end of the header, outside the trigger.
  final Widget? action;

  /// Whether the chevron is drawn.
  final bool indicator;

  /// Whether the trigger stops answering.
  final bool disabled;

  /// The trigger's corner, which the state layer follows: square inside a
  /// sheet that clips, one step under the sheet's own for a tile.
  final BorderRadius borderRadius;

  /// When set, the header is announced as a heading at this level, which is
  /// what an accordion's `<h3>` round its trigger is on the web.
  final int? headingLevel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final Color muted = colors.onSurfaceVariant;
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;
    final double icon = mpControlIcon[size]!;

    final Widget trigger = MPInteractive(
      onTap: onToggle,
      enabled: !disabled,
      interactive: !disabled,
      focusNode: focusNode,
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        final Widget row = Padding(
          padding: EdgeInsets.symmetric(horizontal: padX, vertical: padY),
          child: Row(
            spacing: mpControlGap[size]!,
            children: <Widget>[
              if (startIcon != null)
                IconTheme.merge(
                  data: IconThemeData(color: muted, size: icon),
                  child: DefaultTextStyle.merge(
                    style: TextStyle(color: muted),
                    child: startIcon!,
                  ),
                ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    if (title != null)
                      DefaultTextStyle.merge(
                        style: mpSheetTitle(theme.typescale, size).style(ink),
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        child: title!,
                      ),
                    if (subtitle != null)
                      DefaultTextStyle.merge(
                        style: theme.typescale.bodySmall.style(muted),
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        child: subtitle!,
                      ),
                  ],
                ),
              ),
              // Turned, not moved. The chevron is a glyph, so rotating it
              // resamples nothing, and it is the only part of the header that
              // reports the state by moving.
              if (indicator)
                AnimatedRotation(
                  turns: open ? 0.5 : 0,
                  duration: duration,
                  curve: MPMotion.standard,
                  child: MPGlyph(MPGlyphShape.chevron, size: icon, color: muted),
                ),
            ],
          ),
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          // On the button's own node: a heading round it would be a node of
          // its own with nothing in it but the button, where the web's `<h3>`
          // round a `<button>` reads as one heading that can be pressed.
          header: headingLevel != null ? true : null,
          headingLevel: headingLevel,
          enabled: !disabled,
          expanded: open,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: disabled ? null : onToggle,
          child: CustomPaint(
            // Inset rather than offset: the sheet clips so its panels can be
            // windows, and a ring drawn outside a trigger that fills the top of
            // the sheet would be shaved off on three sides.
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(
                    color: colors.secondary,
                    borderRadius: borderRadius,
                    offset: -focusRingWidth,
                  )
                : null,
            child: MPStateLayer(
              color: colors.onSurface,
              opacity: mpStateLayerOpacity(state, enabled: !disabled),
              borderRadius: borderRadius,
              child: row,
            ),
          ),
        );
      },
    );

    if (action == null) {
      return trigger;
    }

    return Row(
      children: <Widget>[
        Expanded(child: trigger),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: padX),
          child: action,
        ),
      ],
    );
  }
}

/// The panel under a fold's header: a window whose height eases open onto
/// content that never moves relative to it.
///
/// Nothing is transformed and no text is resampled; the height travels and
/// the clip does the rest, for `short4` on the `standard` curve, the pair the
/// React panel transitions with. A closed panel leaves the tree once it has
/// finished closing, unless [keepMounted] keeps it, and while closed it takes
/// no focus and says nothing to a screen reader either way.
class MPFoldPanel extends StatefulWidget {
  /// Creates a panel that is showing while [open].
  const MPFoldPanel({
    required this.open,
    required this.padding,
    required this.textStyle,
    this.keepMounted = false,
    this.child,
    super.key,
  });

  /// Whether the panel is showing.
  final bool open;

  /// The room round the body.
  final EdgeInsetsGeometry padding;

  /// What the body is set in.
  final TextStyle textStyle;

  /// Keeps a closed panel built, for content that is expensive to build or
  /// holds state that should survive being folded away.
  final bool keepMounted;

  /// The body.
  final Widget? child;

  @override
  State<MPFoldPanel> createState() => _MPFoldPanelState();
}

class _MPFoldPanelState extends State<MPFoldPanel> with SingleTickerProviderStateMixin {
  late final AnimationController _fold = AnimationController(
    vsync: this,
    duration: MPMotion.short4,
    value: widget.open ? 1 : 0,
  );

  late final CurvedAnimation _factor = CurvedAnimation(
    parent: _fold,
    curve: MPMotion.standard,
    reverseCurve: MPMotion.standard.flipped,
  );

  @override
  void initState() {
    super.initState();
    _fold.addStatusListener(_onStatus);
  }

  void _onStatus(AnimationStatus status) {
    // Rebuilt once the panel has finished closing, which is when a panel that
    // is not kept mounted can leave the tree.
    if (status == AnimationStatus.dismissed && mounted) {
      setState(() {});
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fold.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;
  }

  @override
  void didUpdateWidget(MPFoldPanel oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.open != oldWidget.open) {
      widget.open ? _fold.forward() : _fold.reverse();
    }
  }

  @override
  void dispose() {
    _fold.removeStatusListener(_onStatus);
    _factor.dispose();
    _fold.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool showing = widget.open || _fold.value > 0;
    final bool built = widget.keepMounted || showing;

    Widget panel = built && widget.child != null
        ? DefaultTextStyle.merge(
            style: widget.textStyle,
            child: Padding(padding: widget.padding, child: widget.child),
          )
        : const SizedBox(width: double.infinity);

    panel = ExcludeSemantics(
      excluding: !widget.open,
      child: ExcludeFocus(
        excluding: !widget.open,
        child: TickerMode(enabled: showing, child: panel),
      ),
    );

    return AnimatedBuilder(
      animation: _factor,
      child: panel,
      builder: (BuildContext context, Widget? panel) {
        final double factor = math.max(_factor.value, 0);

        // The clip is only on while the height is moving. An open panel that
        // kept clipping would shave the focus ring off the first control
        // inside it, which is the React panel's `PANEL_SETTLED` said here.
        return ClipRect(
          clipBehavior: factor >= 1 ? Clip.none : Clip.hardEdge,
          child: Align(alignment: Alignment.topCenter, heightFactor: factor, child: panel),
        );
      },
    );
  }
}
