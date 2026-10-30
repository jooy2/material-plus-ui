/// A stack of rows on a sheet.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A stack of rows.
///
/// ```dart
/// MPList(
///   children: <Widget>[
///     MPListItem(onPressed: openInbox, description: const Text('3 unread'), child: const Text('Inbox')),
///     MPListItem(onPressed: openSent, child: const Text('Sent')),
///   ],
/// )
/// ```
///
/// The list is a sheet and the rows are what is on it, which is why the two
/// are separate widgets: [size], [color], [density] and [dividers] belong to
/// the stack, not to any one line in it, and an inherited scope carries them
/// down to every [MPListItem] however the rows were built.
///
/// A list is not a composite widget. It has no roving focus, no selection
/// model and no keyboard contract of its own: each pressable row is one focus
/// stop reached with Tab, and that is all a plain list of actions needs.
class MPList extends StatelessWidget {
  /// Creates a list of [children], usually [MPListItem]s.
  const MPList({
    required this.children,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.color,
    this.density,
    this.dividers = false,
    super.key,
  });

  /// The rows, usually [MPListItem]s.
  final List<Widget> children;

  /// How much surface the sheet paints behind the rows. [MPVariant.outlined]
  /// by default; [MPVariant.text] inside a card, where a second bordered
  /// rectangle is a second rectangle.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`. A level moves the
  /// tone with the shadow; given one, [variant] keeps only its hairline.
  final MPElevation? elevation;

  /// The row height and type scale. A one-line row lands on exactly the
  /// control height of the same rung, so a row and the button beside it line
  /// up without either knowing about the other.
  final MPSize? size;

  /// Which accent family a selected row reads. The sheet stays neutral, and
  /// so does the hover: the state layer is the row's own ink.
  final MPColor? color;

  /// Takes room out of every row without changing what it is set in, keeping
  /// each row exactly one rung down the control ladder per step.
  final MPDensity? density;

  /// Separates the rows with a hairline instead of with space.
  ///
  /// With dividers the rules have to reach both edges of the sheet, so the
  /// list gives up its inner padding and the rows give up their rounded
  /// corners. A row cannot be a floating tile and a ruled line at once.
  final bool dividers;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final MPContainerPaint paint = mpContainerPaint(colors, variant, elevation: elevation);
    final double hairline = paint.border?.width ?? 0;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);

    Widget rows = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (int index = 0; index < children.length; index += 1)
          dividers && index > 0
              ? DecoratedBox(
                  decoration: BoxDecoration(border: Border(top: rule)),
                  child: children[index],
                )
              : children[index],
      ],
    );

    // Without dividers the rows are tiles and the sheet keeps a hair of
    // padding so a hovered row does not run into the edge. With them the rules
    // have to reach the edge, so the padding goes and the sheet clips.
    rows = dividers
        ? ClipRRect(borderRadius: radius - BorderRadius.circular(hairline), child: rows)
        : Padding(padding: const EdgeInsets.all(4), child: rows);

    return _MPListScope(
      size: size ?? config?.size ?? MPSize.md,
      color: color ?? config?.color ?? MPColor.primary,
      density: density ?? config?.density ?? 0,
      dividers: dividers,
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        child: DecoratedBox(
          decoration: paint.decoration(radius),
          child: Padding(
            padding: EdgeInsets.all(hairline),
            child: DefaultTextStyle.merge(
              style: TextStyle(color: colors.onSurface),
              child: rows,
            ),
          ),
        ),
      ),
    );
  }
}

/// What a row inherits from the list around it.
class _MPListScope extends InheritedWidget {
  const _MPListScope({
    required this.size,
    required this.color,
    required this.density,
    required this.dividers,
    required super.child,
  });

  final MPSize size;
  final MPColor color;
  final MPDensity density;
  final bool dividers;

  static _MPListScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_MPListScope>();
  }

  @override
  bool updateShouldNotify(_MPListScope oldWidget) {
    return size != oldWidget.size ||
        color != oldWidget.color ||
        density != oldWidget.density ||
        dividers != oldWidget.dividers;
  }
}

/// A row's block padding at each rung: the rung's control height less the
/// prose line, so a one-line `md` row is 24 + 16 + 16 = 56, MD3's one-line list
/// item and the `md` control to the pixel.
const Map<MPSize, double> _padY = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 10,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// The same at each density step, 2px a face, which keeps every row on the
/// rung the control ladder gives for the same pair.
const Map<MPSize, List<double>> _padYDense = <MPSize, List<double>>{
  MPSize.xs: <double>[4, 2, 2],
  MPSize.sm: <double>[8, 6, 4],
  MPSize.md: <double>[14, 12, 10],
  MPSize.lg: <double>[18, 16, 14],
  MPSize.xl: <double>[22, 20, 18],
};

double _rowPadY(MPSize size, MPDensity density) {
  final MPDensity step = mpClampDensity(density);

  return step == 0 ? _padY[size]! : _padYDense[size]![-step - 1];
}

/// One row of an [MPList].
///
/// A plain run of content, or, given [onPressed], one pressable surface
/// covering the label and both icons, with [action] outside it as a control of
/// its own. A row that both navigates and holds a toggle has two things to
/// press, and one inside the other would fire both.
class MPListItem extends StatelessWidget {
  /// Creates a row.
  const MPListItem({
    this.child,
    this.onPressed,
    this.startIcon,
    this.endIcon,
    this.description,
    this.action,
    this.selected = false,
    this.disabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    super.key,
  });

  /// The label, on one line.
  final Widget? child;

  /// Makes the row pressable: one focus stop, activated by pointer,
  /// <kbd>Enter</kbd> or <kbd>Space</kbd>. A row that navigates calls the
  /// router from here.
  final VoidCallback? onPressed;

  /// Content before the label: an icon, an avatar, a status dot.
  final Widget? startIcon;

  /// Content after the label, inside the pressable area.
  final Widget? endIcon;

  /// A second line under the label, MD3's supporting text, one step down the
  /// type scale in `onSurfaceVariant`.
  final Widget? description;

  /// A control pinned to the end of the row, outside the pressable area: a
  /// switch, a menu button.
  final Widget? action;

  /// Marks the row as the chosen one: the open page, the current filter. MD3's
  /// selected list item is the family's container tone under its own ink, not
  /// a second colour and not a bolder weight.
  final bool selected;

  /// Unavailable. Drops the accent family and the press.
  final bool disabled;

  /// Drives the row's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as the row is inserted.
  final bool autofocus;

  /// The row's name for a screen reader, in place of what it shows.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final _MPListScope? scope = _MPListScope.maybeOf(context);
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = scope?.size ?? config?.size ?? MPSize.md;
    final MPDensity density = scope?.density ?? config?.density ?? 0;
    final MPColor color = scope?.color ?? config?.color ?? MPColor.primary;
    final bool dividers = scope?.dividers ?? false;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);
    final bool interactive = onPressed != null && !disabled;
    final bool chosen = selected && !disabled;
    final double padX = mpSheetPadOf(size, density);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    // One step down the corner ladder from the sheet: a tile cut out of a sheet
    // cannot share its corner, or the two curves fight along the edge.
    final double corner = switch (size) {
      MPSize.xs || MPSize.sm => theme.shapes.extraSmall,
      MPSize.md || MPSize.lg => theme.shapes.small,
      MPSize.xl => theme.shapes.medium,
    };
    final BorderRadius radius = dividers ? BorderRadius.zero : BorderRadius.circular(corner);

    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : chosen
        ? accent.onContainer
        : colors.onSurface;
    // On a selected row the supporting line stays in the container's ink at
    // reduced strength rather than switching role, or it would be the one word
    // on the row painted for a different surface.
    final Color supporting = disabled
        ? ink
        : chosen
        ? accent.onContainer.withValues(alpha: 0.8)
        : colors.onSurfaceVariant;
    final MPTypeRole support = size == MPSize.xs || size == MPSize.sm
        ? theme.typescale.bodySmall
        : theme.typescale.bodyMedium;

    final Widget content = Padding(
      padding: EdgeInsets.symmetric(horizontal: padX, vertical: _rowPadY(size, density)),
      child: DefaultTextStyle.merge(
        style: mpProseText(theme.typescale, size).style(ink),
        child: IconTheme.merge(
          data: IconThemeData(color: ink),
          child: Row(
            spacing: mpControlGap[size]!,
            children: <Widget>[
              ?startIcon,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    if (child != null)
                      DefaultTextStyle.merge(
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        child: child!,
                      ),
                    if (description != null)
                      DefaultTextStyle.merge(
                        style: support.style(supporting),
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        child: description!,
                      ),
                  ],
                ),
              ),
              ?endIcon,
            ],
          ),
        ),
      ),
    );

    // The same widgets above the content whether the row can be pressed or
    // not, with the difference in their flags, so a row handed `onPressed`
    // later keeps whatever its content was holding.
    final Widget body = MPInteractive(
      onTap: onPressed,
      enabled: interactive,
      interactive: interactive,
      pressable: onPressed != null,
      cursor: interactive ? SystemMouseCursors.click : MouseCursor.defer,
      focusNode: focusNode,
      autofocus: autofocus,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: onPressed != null ? true : null,
          enabled: onPressed != null ? interactive : null,
          selected: chosen ? true : null,
          label: semanticLabel,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: interactive ? onPressed : null,
          child: ExcludeSemantics(
            excluding: semanticLabel != null,
            child: CustomPaint(
              // Inset rather than offset: a ruled list clips at its padding
              // box, and a ring outside the row would be shaved off.
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(
                      color: colors.secondary,
                      borderRadius: radius,
                      offset: -focusRingWidth,
                    )
                  : null,
              child: AnimatedContainer(
                duration: duration,
                curve: MPMotion.standard,
                decoration: BoxDecoration(
                  color: chosen ? accent.container : const Color(0x00000000),
                  borderRadius: radius,
                ),
                child: MPStateLayer(
                  color: ink,
                  opacity: mpStateLayerOpacity(state, enabled: interactive),
                  borderRadius: radius,
                  child: content,
                ),
              ),
            ),
          ),
        );
      },
    );

    if (action == null) {
      return body;
    }

    return Row(
      children: <Widget>[
        Expanded(child: body),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: padX),
          child: action,
        ),
      ],
    );
  }
}
