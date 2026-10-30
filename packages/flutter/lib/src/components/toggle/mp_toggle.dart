/// A button that stays down.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/button_group.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/toggle_group.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A button that stays down.
///
/// ```dart
/// MPToggle(
///   pressed: grid,
///   onChanged: (bool next) => setState(() => grid = next),
///   child: const Text('Grid'),
/// )
/// ```
///
/// The difference from an `MPSwitch` is what the press *is*: a switch changes
/// a setting, and the change is the point. A toggle changes the state of the
/// thing beside it, bold on the selected words, the grid on the canvas, and the
/// thing beside it is what the reader is looking at. The difference from an
/// `MPCheckbox` is that this is a control rather than an answer, so it never
/// goes in a form.
///
/// ## Why off is neutral and on is the accent
///
/// The ink is `onSurfaceVariant` on every variant while the toggle is off, and
/// the containers are the neutral surface roles. A toggle has to be readable
/// at a glance in a row of eight of them, and the axis a reader can judge in
/// isolation is hue rather than saturation. Accent ink on an unpressed toggle
/// would say it was on.
///
/// With no [child] the toggle goes square around its glyph, which for a pill
/// is a circle: MD3's toggle icon button. Give it a [semanticLabel] then.
///
/// Controlled with [pressed] and [onChanged], or left to hold its own state
/// from [initialPressed]. Inside an `MPToggleGroup` the set holds the state,
/// and the toggle is found in it by its [value].
class MPToggle extends StatefulWidget {
  /// Creates a toggle.
  const MPToggle({
    this.child,
    this.pressed,
    this.initialPressed = false,
    this.onChanged,
    this.value,
    this.variant,
    this.size,
    this.color,
    this.startIcon,
    this.endIcon,
    this.fullWidth = false,
    this.disabled,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The label. Left out, the toggle goes square around [startIcon].
  final Widget? child;

  /// Whether it is on. Given, the toggle is controlled.
  final bool? pressed;

  /// Whether it starts on, for one that holds its own state.
  final bool initialPressed;

  /// Called with the new state.
  final ValueChanged<bool>? onChanged;

  /// Identifies the toggle inside an `MPToggleGroup`.
  final String? value;

  /// How much surface the toggle paints while it is **off**. On is always the
  /// accent asserting itself, whichever weight was asked for.
  /// [MPVariant.outlined] unless a group says otherwise.
  final MPVariant? variant;

  /// Which rung of the size ladder.
  final MPSize? size;

  /// Which accent family it turns on in.
  final MPColor? color;

  /// A glyph before the label.
  final Widget? startIcon;

  /// A glyph after it.
  final Widget? endIcon;

  /// Fills the width it is given rather than hugging its label.
  final bool fullWidth;

  /// Greys the toggle out and stops it answering.
  final bool? disabled;

  /// The toggle's name for a screen reader, in place of what it shows. The
  /// one an icon-only toggle needs.
  final String? semanticLabel;

  /// Drives the focus from outside. Inside a group the set's own focus stop
  /// takes its place.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPToggle> createState() => _MPToggleState();
}

class _MPToggleState extends State<MPToggle> {
  late bool _own = widget.initialPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPButtonGroupScope? group = MPButtonGroupScope.maybeOf(context);
    final MPToggleGroupScope? set = MPToggleGroupScope.maybeOf(context);
    final int? slot = MPToggleGroupSlot.indexOf(context);

    // An `MPToggleGroup` and an `MPButtonGroup` provide the same scope, so a
    // toggle picks up the set it is in either way. Its own parameter still
    // wins.
    final MPVariant variant = widget.variant ?? group?.variant ?? MPVariant.outlined;
    final MPSize size = widget.size ?? group?.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? group?.color ?? config?.color ?? MPColor.primary;
    final bool disabled =
        (widget.disabled ?? group?.disabled ?? false) || MPFieldsetScope.disabledOf(context);

    final String? value = widget.value;
    final bool inSet = set != null && value != null;
    final bool on = inSet ? set.value.contains(value) : widget.pressed ?? _own;
    final bool roving = inSet && set.stopIndex != null && slot != null;
    final bool stop = roving && slot == set.stopIndex;

    void activate() {
      if (disabled) {
        return;
      }

      final bool next = !on;

      if (inSet) {
        if (slot != null) {
          set.onActivate?.call(slot);
        }

        set.onToggle(value);
      } else if (widget.pressed == null) {
        setState(() => _own = next);
      }

      widget.onChanged?.call(next);
    }

    final MPAccent accent = colors.accent(color);
    final _TogglePaint paint = _paintFor(colors, accent, variant, on: on, disabled: disabled);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double height = mpControlHeight[size]!;
    final bool iconOnly = widget.child == null;
    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;
    final BorderRadius radius =
        group?.corners(
          theme.shapes.full.isInfinite ? height / 2 : theme.shapes.full,
          direction,
          inner: theme.shapes.small,
        ) ??
        MPShapes.circular(theme.shapes.full, height: height);

    Widget shell(MPInteraction state) {
      Widget content = Padding(
        padding: EdgeInsets.symmetric(horizontal: iconOnly ? 0 : mpControlPadX[size]!),
        child: DefaultTextStyle.merge(
          style: mpControlText(theme.typescale, size).style(),
          maxLines: 1,
          softWrap: false,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          child: IconTheme.merge(
            data: IconThemeData(size: mpControlIcon[size]),
            child: _Ink(
              color: paint.ink,
              duration: duration,
              child: Row(
                mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                spacing: mpControlGap[size]!,
                children: <Widget>[
                  ?widget.startIcon,
                  if (widget.child != null) Flexible(child: widget.child!),
                  ?widget.endIcon,
                ],
              ),
            ),
          ),
        ),
      );

      content = ExcludeSemantics(excluding: widget.semanticLabel != null, child: content);

      Widget surface = MPStateLayer(
        color: paint.ink,
        opacity: mpStateLayerOpacity(state, enabled: !disabled),
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
          boxShadow: paint.shadows,
        ),
        clipBehavior: Clip.antiAlias,
        child: surface,
      );

      surface = ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: height,
          maxHeight: height,
          minWidth: iconOnly ? height : 0,
          maxWidth: iconOnly ? height : double.infinity,
        ),
        child: surface,
      );

      return CustomPaint(
        foregroundPainter: state.focusVisible
            ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
            : null,
        child: surface,
      );
    }

    return MergeSemantics(
      child: Semantics(
        button: true,
        // Announced as pressed or not, which is what `aria-pressed` says on
        // the web: a toggle is a button with a state, not a checkbox.
        toggled: on,
        enabled: !disabled,
        label: widget.semanticLabel,
        onTap: disabled ? null : activate,
        // In a set, exactly one member is in the focus order and the arrows
        // move the stop. Every member still answers the pointer.
        child: ExcludeFocus(
          excluding: roving && !stop,
          child: MPInteractive(
            onTap: activate,
            enabled: !disabled,
            interactive: !disabled,
            focusNode: roving ? (stop ? set.stop : null) : widget.focusNode,
            autofocus: widget.autofocus,
            focusSemantics: true,
            cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
            builder: (BuildContext context, MPInteraction state) => shell(state),
          ),
        ),
      ),
    );
  }
}

/// What a toggle paints in one state.
class _TogglePaint {
  const _TogglePaint({
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

/// The surface for [variant], off, on or disabled.
///
/// On is the same two answers the chosen segment of a segmented button gives,
/// because it is the same claim: `filled` takes the accent and its own ink,
/// the middle three light the container tone, and `text` has no container to
/// light, so the accent goes into the ink. What does not change is the
/// **depth**: `elevated` keeps its level-1 shadow in both states, so the only
/// thing that moves is colour.
_TogglePaint _paintFor(
  MPColorScheme colors,
  MPAccent accent,
  MPVariant variant, {
  required bool on,
  required bool disabled,
}) {
  if (disabled) {
    final Color ink = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color container = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);

    return switch (variant) {
      MPVariant.filled ||
      MPVariant.tonal ||
      MPVariant.elevated => _TogglePaint(fill: container, ink: ink),
      MPVariant.outlined => _TogglePaint(
        fill: _clear,
        ink: ink,
        border: BorderSide(color: container),
      ),
      MPVariant.text => _TogglePaint(fill: _clear, ink: ink),
    };
  }

  if (on) {
    return switch (variant) {
      MPVariant.filled => _TogglePaint(fill: accent.color, ink: accent.onColor),
      MPVariant.tonal => _TogglePaint(fill: accent.container, ink: accent.onContainer),
      MPVariant.elevated => _TogglePaint(
        fill: accent.container,
        ink: accent.onContainer,
        shadows: MPShadows.of(1),
      ),
      MPVariant.outlined => _TogglePaint(
        fill: accent.container,
        ink: accent.onContainer,
        border: BorderSide(color: accent.color),
      ),
      MPVariant.text => _TogglePaint(fill: _clear, ink: accent.color),
    };
  }

  final Color ink = colors.onSurfaceVariant;

  return switch (variant) {
    MPVariant.filled => _TogglePaint(fill: colors.surfaceContainerHighest, ink: ink),
    MPVariant.tonal => _TogglePaint(fill: colors.surfaceContainer, ink: ink),
    MPVariant.elevated => _TogglePaint(
      fill: colors.surfaceContainerLow,
      ink: ink,
      shadows: MPShadows.of(1),
    ),
    MPVariant.outlined => _TogglePaint(
      fill: _clear,
      ink: ink,
      border: BorderSide(color: colors.outline),
    ),
    MPVariant.text => _TogglePaint(fill: _clear, ink: ink),
  };
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
