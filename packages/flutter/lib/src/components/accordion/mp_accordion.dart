/// A stack of sections, one of which is open.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fold_section.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A stack of sections, one of which is open.
///
/// ```dart
/// MPAccordion(
///   initialValue: const <Object>['delivery'],
///   children: const <Widget>[
///     MPAccordionItem(value: 'delivery', title: Text('Delivery'), child: Text('…')),
///     MPAccordionItem(value: 'returns', title: Text('Returns'), child: Text('…')),
///   ],
/// )
/// ```
///
/// ## Why this is not a stack of collapsibles
///
/// Because of [multiple]. An `MPCollapsible` has an `open` of its own and
/// answers to nobody; an accordion owns the set, and closing the last section
/// as the next one opens is the whole reason the component exists. It keeps
/// the page from growing under the reader.
///
/// ## The surface stays neutral
///
/// Even on [MPVariant.filled], which is `surfaceContainerHighest` (MD3's
/// filled card) rather than the accent. An accordion holds somebody else's
/// content, and dyeing the box dyes their content's background. That is also
/// why there is no `color`: nothing would read it.
class MPAccordion extends StatefulWidget {
  /// Creates an accordion of [children], usually [MPAccordionItem]s.
  const MPAccordion({
    required this.children,
    this.multiple = false,
    this.value,
    this.initialValue,
    this.onChanged,
    this.dividers = true,
    this.disabled = false,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.keepMounted = false,
    this.headingLevel = 3,
    super.key,
  }) : assert(headingLevel >= 1 && headingLevel <= 6, 'headingLevel must be between 1 and 6');

  /// The sections, usually [MPAccordionItem]s.
  final List<Widget> children;

  /// Whether more than one section may be open at once. `false` by default:
  /// opening one closes the last.
  final bool multiple;

  /// Which sections are open, by their [MPAccordionItem.value]. Set it, with
  /// [onChanged], for a controlled accordion.
  final List<Object>? value;

  /// Which sections start open in an uncontrolled accordion. React's
  /// `defaultValue`.
  final List<Object>? initialValue;

  /// Called with the whole open set, not the section that moved, which makes
  /// "close everything but this one" a single assignment rather than a diff.
  final ValueChanged<List<Object>>? onChanged;

  /// Separates the sections with a hairline rather than with space.
  ///
  /// On by default, the other way round from a list: an accordion of tiles is
  /// a stack of cards that happen to fold, and the rule is what says the
  /// sections are parts of one thing. Off, each section is a tile one corner
  /// step under the sheet's own, and the sheet keeps 4px of padding so a
  /// hovered header does not run into its edge.
  final bool dividers;

  /// Stops every section answering.
  final bool disabled;

  /// How much surface the sheet paints. [MPVariant.outlined] by default.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`. A level moves the
  /// tone with the shadow; given one, [variant] keeps only its hairline.
  final MPElevation? elevation;

  /// The room inside every section, and the type scale of its header and
  /// body.
  final MPSize? size;

  /// Takes room out of every section's header and body, 2px a face per step.
  final MPDensity? density;

  /// Keeps closed panels built, for content that is expensive to build or
  /// holds form state that should survive being folded away.
  final bool keepMounted;

  /// The heading level each section's title is announced at, `3` by default.
  ///
  /// The level is the screen's to decide: an accordion of questions under a
  /// level-2 heading is a run of level-3 ones. A level that skips one breaks
  /// the outline a screen reader navigates by.
  final int headingLevel;

  @override
  State<MPAccordion> createState() => _MPAccordionState();
}

class _MPAccordionState extends State<MPAccordion> {
  late List<Object> _uncontrolled = List<Object>.of(widget.initialValue ?? const <Object>[]);

  List<Object> get _open => widget.value ?? _uncontrolled;

  void _toggle(Object value) {
    final List<Object> open = _open;
    final List<Object> next;

    if (open.contains(value)) {
      next = <Object>[
        for (final Object entry in open)
          if (entry != value) entry,
      ];
    } else {
      next = widget.multiple ? <Object>[...open, value] : <Object>[value];
    }

    if (widget.value == null) {
      setState(() => _uncontrolled = next);
    }

    widget.onChanged?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPDensity density = widget.density ?? config?.density ?? 0;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(
      colors,
      widget.variant,
      elevation: widget.elevation,
    );
    final double hairline = paint.border?.width ?? 0;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);

    Widget stack = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (int index = 0; index < widget.children.length; index += 1)
          // A rule between two sections, written on the stack rather than on
          // each item so it holds however the caller built the items.
          widget.dividers && index > 0
              ? DecoratedBox(
                  decoration: BoxDecoration(border: Border(top: rule)),
                  child: widget.children[index],
                )
              : widget.children[index],
      ],
    );

    // Without dividers the sections are tiles and the sheet keeps a hair of
    // padding. With them the rules have to reach the edge, so the padding goes,
    // the sheet clips, and the tiles square off.
    stack = widget.dividers
        ? ClipRRect(borderRadius: radius - BorderRadius.circular(hairline), child: stack)
        : Padding(padding: const EdgeInsets.all(4), child: stack);

    return _MPAccordionScope(
      open: _open,
      toggle: _toggle,
      size: size,
      density: density,
      dividers: widget.dividers,
      disabled: widget.disabled,
      keepMounted: widget.keepMounted,
      headingLevel: widget.headingLevel,
      child: DecoratedBox(
        decoration: paint.decoration(radius),
        child: Padding(
          padding: EdgeInsets.all(hairline),
          child: DefaultTextStyle.merge(
            style: TextStyle(color: colors.onSurface),
            child: stack,
          ),
        ),
      ),
    );
  }
}

/// What a section inherits from the accordion around it: the rung, whether
/// the sections are ruled, the heading level, and the open set.
///
/// An inherited widget rather than parameters on every item, because a
/// section is a section *of* something. Passed per item, they would be several
/// chances per item to get one wrong, and an accordion whose fourth section is
/// a size bigger than the three above it fails silently.
class _MPAccordionScope extends InheritedWidget {
  const _MPAccordionScope({
    required this.open,
    required this.toggle,
    required this.size,
    required this.density,
    required this.dividers,
    required this.disabled,
    required this.keepMounted,
    required this.headingLevel,
    required super.child,
  });

  final List<Object> open;
  final ValueChanged<Object> toggle;
  final MPSize size;
  final MPDensity density;
  final bool dividers;
  final bool disabled;
  final bool keepMounted;
  final int headingLevel;

  static _MPAccordionScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPAccordionScope>();
  }

  @override
  bool updateShouldNotify(_MPAccordionScope oldWidget) {
    return !_sameSet(open, oldWidget.open) ||
        size != oldWidget.size ||
        density != oldWidget.density ||
        dividers != oldWidget.dividers ||
        disabled != oldWidget.disabled ||
        keepMounted != oldWidget.keepMounted ||
        headingLevel != oldWidget.headingLevel;
  }

  static bool _sameSet(List<Object> a, List<Object> b) {
    return a.length == b.length && a.every(b.contains);
  }
}

/// One section of an [MPAccordion].
///
/// The header is a real button covering the title and the chevron, announced
/// as a heading at the accordion's level, with [action] outside that button as
/// a control of its own.
class MPAccordionItem extends StatefulWidget {
  /// Creates a section.
  const MPAccordionItem({
    this.child,
    this.value,
    this.title,
    this.subtitle,
    this.startIcon,
    this.action,
    this.disabled = false,
    this.focusNode,
    super.key,
  });

  /// The body.
  final Widget? child;

  /// Identifies the section to [MPAccordion.value] and
  /// [MPAccordion.initialValue]. Left out, the section is identified by
  /// itself, which is enough for an accordion nobody drives from code.
  final Object? value;

  /// The heading on the fold, in the sheet's title role, on one line.
  final Widget? title;

  /// A second line under it, `bodySmall` in `onSurfaceVariant`.
  final Widget? subtitle;

  /// Content before the title: a glyph, a status dot, a count.
  final Widget? startIcon;

  /// A control pinned to the end of the header, **outside** the trigger, so
  /// pressing it does not fold the section.
  final Widget? action;

  /// Stops this section folding; the rest keep working.
  final bool disabled;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  @override
  State<MPAccordionItem> createState() => _MPAccordionItemState();
}

class _MPAccordionItemState extends State<MPAccordionItem> {
  /// The section's identity when it was given no [MPAccordionItem.value].
  final Object _self = Object();

  Object get _value => widget.value ?? _self;

  @override
  Widget build(BuildContext context) {
    final _MPAccordionScope? scope = _MPAccordionScope.maybeOf(context);
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = scope?.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPDensity density = scope?.density ?? 0;
    final double pad = mpSheetPadOf(size, density);
    final bool open = scope?.open.contains(_value) ?? false;
    final bool disabled = widget.disabled || (scope?.disabled ?? false) || scope == null;
    final bool dividers = scope?.dividers ?? true;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPFoldHeader(
          open: open,
          onToggle: () => scope?.toggle(_value),
          size: size,
          padX: pad,
          padY: pad,
          title: widget.title,
          subtitle: widget.subtitle,
          startIcon: widget.startIcon,
          action: widget.action,
          disabled: disabled,
          // One corner step under the sheet's own when the sections are
          // tiles, so a tile reads as being in the sheet rather than lying on
          // top of it.
          borderRadius: dividers ? BorderRadius.zero : BorderRadius.circular(theme.shapes.small),
          headingLevel: scope?.headingLevel ?? 3,
          focusNode: widget.focusNode,
        ),
        MPFoldPanel(
          open: open,
          keepMounted: scope?.keepMounted ?? false,
          // The header already paid for the space above, so the body owes only
          // the space below it, or every closed section would look padded
          // along its bottom edge.
          padding: EdgeInsetsDirectional.only(start: pad, end: pad, bottom: pad),
          textStyle: mpProseText(theme.typescale, size).style(colors.onSurfaceVariant),
          child: widget.child,
        ),
      ],
    );
  }
}
