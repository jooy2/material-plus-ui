/// A Material Design switch.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which side of the track the label sits on.
enum MPSwitchLabelPlacement {
  /// Before the track, for a settings list: the labels form a column and every
  /// track lines up at the far edge.
  start,

  /// After the track, where the label reads as the control's caption.
  end,
}

/// One rung of the switch: the track, the thumb at rest and once on, and the
/// glyph inside the thumb.
class _Track {
  const _Track({
    required this.width,
    required this.height,
    required this.offThumb,
    required this.onThumb,
    required this.onStart,
    required this.glyph,
  });

  final double width;
  final double height;
  final double offThumb;
  final double onThumb;

  /// Where the thumb starts once it is on. At rest it is centred vertically,
  /// so its inset is `(height - thumb) / 2` on both axes.
  final double onStart;
  final double glyph;
}

/// MD3's own switch is a 52×32 track holding a 16dp thumb that grows to 24dp
/// once it is on, and that growth is the whole trick: the control says "off"
/// with a small dot adrift in a wide groove and "on" with a large one filling
/// the end of it, so the state survives being read at a glance, in greyscale.
const Map<MPSize, _Track> _tracks = <MPSize, _Track>{
  MPSize.xs: _Track(width: 32, height: 20, offThumb: 10, onThumb: 14, onStart: 15, glyph: 8),
  MPSize.sm: _Track(width: 40, height: 24, offThumb: 12, onThumb: 18, onStart: 19, glyph: 10),
  MPSize.md: _Track(width: 52, height: 32, offThumb: 16, onThumb: 24, onStart: 24, glyph: 14),
  MPSize.lg: _Track(width: 60, height: 36, offThumb: 18, onThumb: 28, onStart: 28, glyph: 16),
  MPSize.xl: _Track(width: 68, height: 40, offThumb: 20, onThumb: 30, onStart: 33, glyph: 18),
};

/// The groove's edge while the switch is off.
const double _ring = 2;

/// A Material Design switch.
///
/// ```dart
/// MPSwitch(
///   checked: wifi,
///   onChanged: (bool next) => setState(() => wifi = next),
///   label: const Text('Wi-Fi'),
/// )
/// ```
///
/// The difference from a checkbox is not visual, it is temporal: a checkbox is
/// a value that gets submitted with a form, a switch takes effect the moment
/// it moves. If there is a Save button underneath, it should have been a
/// checkbox.
///
/// The thumb is the one thing in this library that actually travels, so it
/// reads MD3's `standard` easing: quick to leave, slow to arrive. It travels
/// the way the text does, so under right-to-left it rests against the
/// right-hand end of the groove and travels leftwards to say "on".
///
/// Controlled with [checked] and [onChanged], or left to hold its own state
/// from [initialChecked].
class MPSwitch extends StatefulWidget {
  /// Creates a switch.
  const MPSwitch({
    this.checked,
    this.initialChecked = false,
    this.onChanged,
    this.label,
    this.description,
    this.errorMessage,
    this.icons = false,
    this.labelPlacement = MPSwitchLabelPlacement.end,
    this.size,
    this.color,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// Whether the switch is on. Given, the switch is controlled.
  final bool? checked;

  /// Whether it starts on, for one that holds its own state.
  final bool initialChecked;

  /// Called with the new state.
  final ValueChanged<bool>? onChanged;

  /// The text beside the track. Pressing it flips the switch.
  final Widget? label;

  /// The line under the label. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the label, which also turns the switch over.
  final Widget? errorMessage;

  /// Draws a tick in the thumb when it is on and a cross when it is off.
  ///
  /// Off by default, and worth turning on wherever the two states are not
  /// obviously different in context: the thumb's position and the track's
  /// colour are otherwise the only signals, and one of those is a hue.
  final bool icons;

  /// Which side the label sits on.
  final MPSwitchLabelPlacement labelPlacement;

  /// The track's size and the label's type role. [MPSize.md], MD3's 52×32,
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the track takes when it is on.
  final MPColor? color;

  /// Marks the switch required.
  final bool required;

  /// Greys the switch out and stops it taking input.
  final bool disabled;

  /// Shows the state without allowing it to be changed, keeping the switch in
  /// the focus order.
  final bool readOnly;

  /// Stretches the row, so a `start` label takes the slack and the track sits
  /// against the far edge. This is what makes a column of settings line up.
  final bool fullWidth;

  /// The switch's name for a screen reader, for one with no visible [label].
  final String? semanticLabel;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPSwitch> createState() => _MPSwitchState();
}

class _MPSwitchState extends State<MPSwitch> {
  late bool _own = widget.initialChecked;

  /// Whether a mouse is over the track. The halo follows the track's own
  /// hover rather than the label's.
  bool _trackHovered = false;

  bool get _checked => widget.checked ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _interactive => !_disabled && !widget.readOnly;

  void _toggle() {
    if (!_interactive) {
      return;
    }

    final bool next = !_checked;

    if (widget.checked == null) {
      setState(() => _own = next);
    }

    widget.onChanged?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final bool invalid = widget.errorMessage != null;
    final MPAccent accent = colors.accent(
      invalid ? MPColor.error : widget.color ?? config?.color ?? MPColor.primary,
    );
    final bool disabled = _disabled;
    final bool interactive = _interactive;
    final bool checked = _checked;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final _Track scale = _tracks[size]!;

    final Color clear = colors.outline.withValues(alpha: 0);
    final Color groove;
    final Color edge;
    final Color thumb;
    final Color tickInk;

    if (disabled) {
      groove = checked
          ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer)
          : colors.surfaceContainerHighest;
      edge = checked ? clear : colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);
      thumb = checked
          ? colors.surfaceContainerHighest
          : colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
      tickInk = colors.surfaceContainerHighest;
    } else {
      // Off: a filled groove with a visible edge, which is what stops an
      // unchecked switch reading as an empty outline, and a thumb in the edge's
      // colour, so it reads as part of the groove. On: the accent, with a thumb
      // in the accent's own ink.
      groove = checked ? accent.color : colors.surfaceContainerHighest;
      edge = checked ? clear : (invalid ? colors.error : colors.outline);
      thumb = checked ? accent.onColor : (invalid ? colors.error : colors.outline);
      tickInk = accent.color;
    }

    final double diameter = checked ? scale.onThumb : scale.offThumb;
    final double restInset = (scale.height - scale.offThumb) / 2;

    Widget track(MPInteraction state) {
      Widget knob = AnimatedContainer(
        duration: duration,
        curve: MPMotion.standard,
        decoration: BoxDecoration(shape: BoxShape.circle, color: thumb),
      );

      if (widget.icons) {
        // Both glyphs are drawn and one of them is transparent, so the swap is
        // a cross-fade on the thumb's own 200ms rather than a cut in the middle
        // of its travel. Stacked, so for the length of the fade both sit in
        // the same place.
        knob = Stack(
          fit: StackFit.expand,
          children: <Widget>[
            knob,
            Center(
              child: SizedBox.square(
                dimension: scale.glyph,
                child: Stack(
                  fit: StackFit.expand,
                  children: <Widget>[
                    _Glyph(
                      shape: MPSelectionMarkShape.check,
                      color: tickInk,
                      shown: checked,
                      duration: duration,
                    ),
                    _Glyph(
                      shape: MPSelectionMarkShape.cross,
                      color: colors.surfaceContainerHighest,
                      shown: !checked,
                      duration: duration,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }

      // Inside the thumb rather than on the track, so the halo travels with
      // the thing being pressed instead of hanging over the groove.
      knob = MPSelectionHalo(
        diameter: mpSelectionHalo[size]!,
        color: checked ? accent.color : colors.onSurface,
        opacity: disabled
            ? 0
            : mpStateLayerOpacity(
                MPInteraction(
                  hovered: _trackHovered && interactive,
                  pressed: state.pressed,
                  focusVisible: state.focusVisible,
                ),
              ),
        child: knob,
      );

      return MouseRegion(
        onEnter: (_) => setState(() => _trackHovered = true),
        onExit: (_) => setState(() => _trackHovered = false),
        child: SizedBox(
          width: scale.width,
          height: scale.height,
          child: Stack(
            clipBehavior: Clip.none,
            children: <Widget>[
              // A pill, and one of the few places in this library where that
              // is right: a switch is a groove something runs along, and a
              // groove with corners is one the thumb would have to climb out of.
              //
              // The edge is a layer of its own rather than the groove's border,
              // so it comes and goes without changing the box the thumb is
              // placed in: the thumb would otherwise jump two pixels at the
              // moment it is already moving.
              Positioned.fill(
                child: AnimatedContainer(
                  duration: duration,
                  curve: MPMotion.standard,
                  decoration: BoxDecoration(
                    color: groove,
                    borderRadius: BorderRadius.circular(scale.height / 2),
                    border: Border.all(color: edge, width: _ring),
                  ),
                ),
              ),
              // `start` rather than `left`, so the thumb travels the way the
              // language does.
              AnimatedPositionedDirectional(
                duration: duration,
                curve: MPMotion.standard,
                start: checked ? scale.onStart : restInset,
                top: (scale.height - diameter) / 2,
                width: diameter,
                height: diameter,
                child: knob,
              ),
            ],
          ),
        ),
      );
    }

    final bool hasText = MPSelectionText.hasContent(
      label: widget.label,
      description: widget.description,
      errorMessage: widget.errorMessage,
    );

    final Widget field = MPInteractive(
      onTap: _toggle,
      enabled: !disabled,
      interactive: interactive,
      focusNode: widget.focusNode,
      autofocus: widget.autofocus,
      focusSemantics: true,
      cursor: interactive ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        return MPSelectionRow(
          line: MPSelectionText.lineOf(theme, size),
          extent: scale.height,
          control: track(state),
          textFirst: widget.labelPlacement == MPSwitchLabelPlacement.start,
          fill: widget.fullWidth,
          text: hasText
              ? MPSelectionText(
                  size: size,
                  disabled: disabled,
                  label: widget.label,
                  description: widget.description,
                  errorMessage: widget.errorMessage,
                  required: widget.required,
                  excludeLabelSemantics: widget.semanticLabel != null,
                )
              : null,
        );
      },
    );

    return MergeSemantics(
      child: Semantics(
        container: true,
        toggled: checked,
        enabled: !disabled,
        readOnly: widget.readOnly,
        isRequired: widget.required ? true : null,
        validationResult: invalid
            ? SemanticsValidationResult.invalid
            : SemanticsValidationResult.none,
        label: widget.semanticLabel,
        onTap: interactive ? _toggle : null,
        child: field,
      ),
    );
  }
}

/// One of the thumb's two glyphs, fading in or out with the state.
class _Glyph extends StatelessWidget {
  const _Glyph({
    required this.shape,
    required this.color,
    required this.shown,
    required this.duration,
  });

  final MPSelectionMarkShape shape;
  final Color color;
  final bool shown;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(end: shown ? 1 : 0),
      duration: duration,
      curve: MPMotion.standard,
      builder: (BuildContext context, double value, Widget? child) {
        return CustomPaint(
          painter: MPSelectionMarkPainter(shape: shape, color: color, shown: value, from: 1),
        );
      },
    );
  }
}
