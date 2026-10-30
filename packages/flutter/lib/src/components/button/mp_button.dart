/// A Material Design button.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/button_group.dart';
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

/// A Material Design button.
///
/// Five variants, four accent families and the library's size ladder, drawn
/// from MD3's own component tokens: the container and label colours per
/// variant, the state layer, the specification's disabled opacities, and the
/// shape, `full`, because a Material button has been a pill since 2021.
///
/// ```dart
/// MPButton(onPressed: save, child: const Text('Save'))
/// ```
///
/// [onPressed] left `null` disables the button, which is Flutter's own
/// convention; [disabled] says the same thing outright for a button whose
/// callback is always there.
///
/// ## Two things this does not have
///
/// **No `href`.** A button that navigates is a link, and a link is announced
/// as one. Put the button's look on a link with the router's own widget, or
/// use `MPTextLink`.
///
/// **No ripple.** MD3's pressed state is a ripple; this draws the state layer
/// flat and all at once instead, which says the same thing without an
/// animation that has to finish before the screen it triggered may change.
class MPButton extends StatefulWidget {
  /// Creates a button that runs [onPressed].
  const MPButton({
    required this.onPressed,
    this.child,
    this.variant,
    this.size,
    this.color,
    this.startIcon,
    this.endIcon,
    this.loading = false,
    this.loadingLabel,
    this.locale,
    this.fullWidth = false,
    this.disabled,
    this.onLongPress,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    super.key,
  });

  /// Runs when the button is pressed, by pointer or by keyboard. `null`
  /// disables the button.
  final VoidCallback? onPressed;

  /// Runs on a long press, the touch equivalent of a context menu.
  final VoidCallback? onLongPress;

  /// The label, usually a [Text]. Left out, the button is an icon button: a
  /// square the size of its own height.
  final Widget? child;

  /// How much surface the button paints. [MPVariant.filled] unless a group
  /// says otherwise.
  ///
  /// - [MPVariant.filled] paints the accent and puts its own ink on top. One
  ///   per screen.
  /// - [MPVariant.tonal] uses the family's container tone, for the
  ///   second-most-important action.
  /// - [MPVariant.elevated] is a neutral surface that separates itself with a
  ///   shadow instead of colour, for a button over a busy background.
  /// - [MPVariant.outlined] is a hairline and nothing else.
  /// - [MPVariant.text] is a label.
  final MPVariant? variant;

  /// Which rung of the size ladder. [MPSize.md], 56px, unless a group or an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family it reads. Not an arbitrary colour: to change what
  /// `primary` *is*, set the theme's source colour.
  final MPColor? color;

  /// Placed before the label.
  final Widget? startIcon;

  /// Placed after the label.
  final Widget? endIcon;

  /// Swaps [startIcon] for a spinner and stops the button firing, while
  /// leaving it focusable and otherwise unchanged.
  ///
  /// Deliberately not [disabled]. A button that leaves the focus order the
  /// moment it is pressed takes the keyboard focus with it, and the reader is
  /// returned to the top of the screen while the request they just made is
  /// still in flight.
  final bool loading;

  /// The spinner's name for a screen reader while [loading]. Defaults to the
  /// word for "loading" in [locale].
  final String? loadingLabel;

  /// Which language the spinner's default name is in. Falls back to the
  /// nearest `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Fills the width it is given rather than hugging its label.
  final bool fullWidth;

  /// Disables the button even though [onPressed] is set.
  final bool? disabled;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// The button's name for a screen reader, in place of what it shows. The
  /// one an icon button needs.
  final String? semanticLabel;

  @override
  State<MPButton> createState() => _MPButtonState();
}

class _MPButtonState extends State<MPButton> {
  MPButtonGroupScope? get _group => MPButtonGroupScope.maybeOf(context);

  MPVariant get _variant => widget.variant ?? _group?.variant ?? MPVariant.filled;

  MPSize get _size =>
      widget.size ?? _group?.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color =>
      widget.color ?? _group?.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  bool get _disabled =>
      (widget.disabled ?? _group?.disabled ?? false) ||
      widget.onPressed == null ||
      MPFieldsetScope.disabledOf(context);

  bool get _interactive => !_disabled && !widget.loading;

  void _activate() {
    if (_interactive) {
      widget.onPressed?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(_color);
    final MPSize size = _size;
    final MPVariant variant = _variant;
    final bool disabled = _disabled;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    final double height = mpControlHeight[size]!;
    final double icon = mpControlIcon[size]!;
    final bool leading = widget.loading || widget.startIcon != null;
    // Square when the button holds exactly one thing: a button with a start
    // icon and an end icon and no label has two glyphs to lay out, and is not
    // an icon button.
    final bool iconOnly = widget.child == null && !(leading && widget.endIcon != null);

    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;
    final BorderRadius radius =
        _group?.corners(
          theme.shapes.full.isInfinite ? height / 2 : theme.shapes.full,
          direction,
          inner: theme.shapes.small,
        ) ??
        MPShapes.circular(theme.shapes.full, height: height);

    final _ButtonPaint paint = _paintFor(colors, accent, variant, disabled: disabled);
    final String loadingLabel =
        widget.loadingLabel ??
        mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['loading']!;

    return MPInteractive(
      onTap: _activate,
      onLongPress: _interactive ? widget.onLongPress : null,
      enabled: !disabled,
      interactive: _interactive,
      focusNode: widget.focusNode,
      autofocus: widget.autofocus,
      cursor: disabled
          ? SystemMouseCursors.basic
          : widget.loading
          ? SystemMouseCursors.progress
          : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        final bool lifted = variant == MPVariant.elevated && !disabled && state.hovered;

        final Widget content = ExcludeSemantics(
          excluding: widget.semanticLabel != null,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: iconOnly ? 0 : mpControlPadX[size]!),
            child: DefaultTextStyle.merge(
              style: mpControlText(theme.typescale, size).style(),
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              child: IconTheme.merge(
                data: IconThemeData(size: icon, color: paint.ink),
                child: _Ink(
                  color: paint.ink,
                  duration: duration,
                  child: Row(
                    mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: _slots(size: size, icon: icon, label: loadingLabel),
                  ),
                ),
              ),
            ),
          ),
        );

        Widget surface = MPStateLayer(
          color: paint.ink,
          opacity: mpStateLayerOpacity(state, enabled: _interactive),
          borderRadius: radius,
          child: Center(widthFactor: widget.fullWidth ? null : 1, child: content),
        );

        surface = AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          width: widget.fullWidth ? double.infinity : null,
          decoration: BoxDecoration(
            color: paint.fill,
            borderRadius: radius,
            border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
            boxShadow: lifted ? MPShadows.of(2) : paint.shadows,
          ),
          clipBehavior: Clip.antiAlias,
          child: surface,
        );

        // The box is sized outside the animation: the colours and the shadow
        // ease, the height does not, so a button given a new size takes it at
        // once rather than growing into it.
        surface = ConstrainedBox(
          constraints: BoxConstraints(
            minHeight: height,
            maxHeight: height,
            minWidth: iconOnly ? height : 0,
            maxWidth: iconOnly ? height : double.infinity,
          ),
          child: surface,
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          enabled: !disabled,
          label: widget.semanticLabel,
          focused: focus.focused,
          onFocus: focus.onFocus,
          expanded: focus.expanded,
          onTap: _interactive ? _activate : null,
          child: CustomPaint(
            // The focus indicator is `secondary` and sits outside the button:
            // a ring drawn inside a filled button is a ring drawn on top of the
            // fill it is meant to be distinguishable from.
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                : null,
            child: surface,
          ),
        );
      },
    );
  }

  List<Widget> _slots({required MPSize size, required double icon, required String label}) {
    final Widget? leading = widget.loading
        ? Semantics(
            label: label,
            child: MPSpinner(size: icon),
          )
        : widget.startIcon;

    final List<Widget> parts = <Widget>[
      ?leading,
      if (widget.child != null) Flexible(child: widget.child!),
      ?widget.endIcon,
    ];

    if (parts.length < 2) {
      return parts;
    }

    final double gap = mpControlGap[size]!;
    final List<Widget> spaced = <Widget>[parts.first];

    for (final Widget part in parts.skip(1)) {
      spaced
        ..add(SizedBox(width: gap))
        ..add(part);
    }

    return spaced;
  }
}

/// What a button paints in one state.
class _ButtonPaint {
  const _ButtonPaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

const Color _clear = Color(0x00000000);

/// The surface for [variant], resting or disabled.
///
/// The disabled treatment is the specification's: content at 38% and a
/// container at 12%, both of `onSurface`. The accent goes entirely, so a
/// disabled button does not look like a quieter version of an available one.
_ButtonPaint _paintFor(
  MPColorScheme colors,
  MPAccent accent,
  MPVariant variant, {
  required bool disabled,
}) {
  if (disabled) {
    final Color ink = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color container = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);

    switch (variant) {
      case MPVariant.filled:
      case MPVariant.tonal:
      case MPVariant.elevated:
        return _ButtonPaint(fill: container, ink: ink);
      case MPVariant.outlined:
        return _ButtonPaint(
          fill: _clear,
          ink: ink,
          border: BorderSide(color: container),
        );
      case MPVariant.text:
        return _ButtonPaint(fill: _clear, ink: ink);
    }
  }

  switch (variant) {
    case MPVariant.filled:
      return _ButtonPaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _ButtonPaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _ButtonPaint(
        fill: colors.surfaceContainerLow,
        ink: accent.color,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _ButtonPaint(
        fill: _clear,
        ink: accent.color,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _ButtonPaint(fill: _clear, ink: accent.color);
  }
}

/// The label's colour, eased with the fill rather than jumping to it.
class _Ink extends StatelessWidget {
  const _Ink({required this.color, required this.duration, required this.child});

  final Color color;
  final Duration duration;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<Color?>(
      tween: ColorTween(end: color),
      duration: duration,
      curve: MPMotion.standard,
      builder: (BuildContext context, Color? value, Widget? child) {
        return DefaultTextStyle.merge(
          style: TextStyle(color: value),
          child: IconTheme.merge(
            data: IconThemeData(color: value),
            child: child!,
          ),
        );
      },
      child: child,
    );
  }
}
