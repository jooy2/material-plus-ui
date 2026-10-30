/// One section that folds, standing on its own.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fold_section.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// Builds a trigger of the caller's own for an [MPCollapsible]: [open] says
/// whether the panel is showing, and [toggle] folds or unfolds it.
typedef MPCollapsibleTriggerBuilder =
    Widget Function(BuildContext context, bool open, VoidCallback toggle);

/// One section that folds, standing on its own.
///
/// ```dart
/// MPCollapsible(
///   title: const Text('Delivery options'),
///   subtitle: const Text('Standard, chosen'),
///   initialOpen: true,
///   child: const Text('Standard delivery arrives in three to five days.'),
/// )
/// ```
///
/// An `MPAccordion` is a set of these and owns which one is open; this is the
/// same fold with nothing beside it, so it has an [open] of its own rather than
/// a place in somebody's list. Reach for it for a "Show more" on a form, an
/// optional block of settings, the detail under a row.
///
/// Uncontrolled by default: it starts at [initialOpen] and keeps its own
/// state, telling [onOpenChange] about every change. Give it [open] as well
/// and it stays where the caller puts it.
///
/// ## Why there is no `color`
///
/// Nothing would read it. The sheet stays neutral, because dyeing a box dyes
/// its content's background, and the focus ring is `secondary` on every
/// control in the library.
class MPCollapsible extends StatefulWidget {
  /// Creates a collapsible section.
  const MPCollapsible({
    this.child,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.title,
    this.subtitle,
    this.startIcon,
    this.action,
    this.triggerBuilder,
    this.indicator = true,
    this.disabled = false,
    this.padded = true,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.keepMounted = false,
    this.focusNode,
    super.key,
  });

  /// The body.
  final Widget? child;

  /// Whether the panel is showing. Set it, with [onOpenChange], for a
  /// controlled collapsible; leave it `null` and the widget keeps its own.
  final bool? open;

  /// Whether an uncontrolled collapsible starts open. React's `defaultOpen`.
  final bool initialOpen;

  /// Called with the new state whenever the trigger asks for a change.
  final ValueChanged<bool>? onOpenChange;

  /// The heading on the trigger, in the sheet's title role, on one line.
  final Widget? title;

  /// A second line under it, `bodySmall` in `onSurfaceVariant`.
  final Widget? subtitle;

  /// Content before the title: a glyph, a status dot, a count.
  final Widget? startIcon;

  /// A control pinned to the end of the header, **outside** the trigger, so
  /// pressing it does not fold the section it sits on.
  final Widget? action;

  /// Replaces the header with a trigger of your own: an `MPButton`, an
  /// `MPChip`, a line of text you made pressable.
  ///
  /// Handed whether the panel is open and a callback that toggles it. The
  /// React prop is an element Base UI wires up for you; a Flutter widget has
  /// nothing to wire into, so the wiring comes as arguments. Announce the
  /// state on your own trigger with `Semantics(expanded: open)`.
  final MPCollapsibleTriggerBuilder? triggerBuilder;

  /// Draws the chevron at the end of the header, turned to report the state.
  final bool indicator;

  /// Stops the trigger answering. The panel stays as it is.
  final bool disabled;

  /// Pads the panel's content. Turn it off for something that should reach
  /// the edges: a table, a picture, a list of its own.
  final bool padded;

  /// How much surface the sheet paints. [MPVariant.outlined] by default, and
  /// [MPVariant.text] for a bare "Show more" line that owes the page no
  /// rectangle of its own.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`. A level moves the
  /// tone with the shadow; given one, [variant] keeps only its hairline.
  final MPElevation? elevation;

  /// The room inside, and the type scale of the header and the body.
  final MPSize? size;

  /// Keeps a closed panel built, for content that is expensive to build or
  /// holds form state that should survive being folded away.
  final bool keepMounted;

  /// Drives the default trigger's focus from outside.
  final FocusNode? focusNode;

  @override
  State<MPCollapsible> createState() => _MPCollapsibleState();
}

class _MPCollapsibleState extends State<MPCollapsible> {
  late bool _uncontrolled = widget.initialOpen;

  bool get _open => widget.open ?? _uncontrolled;

  void _toggle() {
    if (widget.disabled) {
      return;
    }

    final bool next = !_open;

    if (widget.open == null) {
      setState(() => _uncontrolled = next);
    }

    widget.onOpenChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double pad = mpSheetPad[size]!;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(
      colors,
      widget.variant,
      elevation: widget.elevation,
    );
    final bool open = _open;

    final Widget header = widget.triggerBuilder != null
        ? widget.triggerBuilder!(context, open, _toggle)
        : MPFoldHeader(
            open: open,
            onToggle: _toggle,
            size: size,
            padX: pad,
            padY: pad,
            title: widget.title,
            subtitle: widget.subtitle,
            startIcon: widget.startIcon,
            action: widget.action,
            indicator: widget.indicator,
            disabled: widget.disabled,
            focusNode: widget.focusNode,
          );

    // The default header has already paid for the space above the body, so
    // the body owes only the space below it; a trigger of the caller's own has
    // paid for nothing, so there the panel owes both.
    final EdgeInsetsGeometry padding = widget.padded
        ? EdgeInsetsDirectional.only(
            start: pad,
            end: pad,
            top: widget.triggerBuilder != null ? pad : 0,
            bottom: pad,
          )
        : EdgeInsets.zero;

    final double hairline = paint.border?.width ?? 0;

    return DecoratedBox(
      decoration: paint.decoration(radius),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        // The sheet clips, which is what makes the panel a window rather than
        // something that spills past the sheet's own corners while it moves.
        child: ClipRRect(
          borderRadius: radius - BorderRadius.circular(hairline),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              header,
              MPFoldPanel(
                open: open,
                keepMounted: widget.keepMounted,
                padding: padding,
                textStyle: mpProseText(theme.typescale, size).style(colors.onSurfaceVariant),
                child: widget.child,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
