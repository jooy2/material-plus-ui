/// A Material Design checkbox.
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

/// The box: 14, 16, 18, 20, 22. MD3's own 18dp at `md`.
const Map<MPSize, double> _box = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 18,
  MPSize.lg: 20,
  MPSize.xl: 22,
};

/// The mark inside it, smaller than the box so the tick never touches the
/// corners, which at a 2px radius it otherwise would.
const Map<MPSize, double> _glyph = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 18,
  MPSize.xl: 20,
};

/// The box's edge, inside it rather than added round it.
const double _edge = 2;

/// A Material Design checkbox.
///
/// ```dart
/// MPCheckbox(
///   checked: agreed,
///   onChanged: (bool next) => setState(() => agreed = next),
///   label: const Text('Email me about new releases'),
/// )
/// ```
///
/// The box is `onSurfaceVariant` at rest and fills with the accent family when
/// it is ticked, which is the one place this library says a state by swapping
/// the whole surface rather than washing it: "on" and "off" are not two
/// strengths of the same thing.
///
/// [label], [description] and [errorMessage] are parameters rather than
/// children for the reason they are on a text field: the arrangement is fixed,
/// and what a caller decides is what goes in each slot.
///
/// Controlled with [checked] and [onChanged], or left to hold its own state
/// from [initialChecked]. A missing [onChanged] does not disable it, because a
/// box that keeps its own state has something to do without one; [disabled]
/// is what does.
class MPCheckbox extends StatefulWidget {
  /// Creates a checkbox.
  const MPCheckbox({
    this.checked,
    this.initialChecked = false,
    this.onChanged,
    this.indeterminate = false,
    this.label,
    this.description,
    this.errorMessage,
    this.size,
    this.color,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// Whether the box is ticked. Given, the box is controlled and shows this
  /// until the parent changes it.
  final bool? checked;

  /// Whether the box starts ticked, for one that holds its own state.
  final bool initialChecked;

  /// Called with the new state, by pointer or by keyboard.
  final ValueChanged<bool>? onChanged;

  /// Neither ticked nor empty: what a parent box shows when some of its
  /// children are ticked. Drawn as a dash, and it is a *display* state:
  /// pressing a half-ticked box ticks it.
  final bool indeterminate;

  /// The text beside the tick. Pressing it ticks the box.
  final Widget? label;

  /// The line under the label. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the label. Its presence is also what turns the
  /// checkbox over into its error state, so there is no way to show one with
  /// no explanation.
  final Widget? errorMessage;

  /// The tick's size and the label's type role. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the ticked box is filled with.
  final MPColor? color;

  /// Marks the checkbox required, to a screen reader and with an asterisk on
  /// the label.
  final bool required;

  /// Greys the checkbox out and stops it taking input.
  final bool disabled;

  /// Shows the state without allowing changes. Unlike [disabled] the box stays
  /// in the focus order, which is what a value the reader still has to be able
  /// to find needs.
  final bool readOnly;

  /// The checkbox's name for a screen reader, for one with no visible [label].
  /// Given beside a [label], it is the name in the label's place.
  final String? semanticLabel;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPCheckbox> createState() => _MPCheckboxState();
}

class _MPCheckboxState extends State<MPCheckbox> {
  late bool _own = widget.initialChecked;

  /// Whether a mouse is over the box itself. The halo follows the box's own
  /// hover, not the row's: lit from the label, it would light from the
  /// description too.
  bool _boxHovered = false;

  /// The last mark drawn, which stays while the mark shrinks away: a box that
  /// is cleared from half-ticked shrinks the dash, not a tick.
  MPSelectionMarkShape _shape = MPSelectionMarkShape.check;

  bool get _checked => widget.checked ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _interactive => !_disabled && !widget.readOnly;

  void _toggle() {
    if (!_interactive) {
      return;
    }

    // A half-ticked box ticks, rather than flipping whatever `checked` says
    // underneath the dash: a press that lands back where it started is a
    // press the reader cannot see the effect of.
    final bool next = widget.indeterminate || !_checked;

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
    // Invalid re-points the accent family at `error`, so the box, its halo and
    // the message all turn over together rather than the message being the
    // only clue.
    final MPAccent accent = colors.accent(
      invalid ? MPColor.error : widget.color ?? config?.color ?? MPColor.primary,
    );
    final bool disabled = _disabled;
    final bool interactive = _interactive;
    final bool checked = _checked;
    final bool marked = checked || widget.indeterminate;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    if (marked) {
      _shape = widget.indeterminate ? MPSelectionMarkShape.dash : MPSelectionMarkShape.check;
    }

    final double box = _box[size]!;
    // Half `extraSmall`, which is the 2dp the specification asks for and,
    // unlike a literal, follows the theme: a tick that stayed square inside a
    // rounded theme would be the one square object on the page.
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall / 2);

    final Color clear = accent.color.withValues(alpha: 0);
    final Color fill;
    final Color edge;
    final Color ink;

    if (disabled) {
      final Color drained = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
      fill = marked ? drained : clear;
      edge = marked ? clear : drained;
      ink = colors.surface;
    } else {
      fill = marked ? accent.color : clear;
      edge = marked ? clear : (invalid ? colors.error : colors.onSurfaceVariant);
      ink = accent.onColor;
    }

    Widget tick(MPInteraction state) {
      final Widget square = Stack(
        alignment: Alignment.center,
        children: <Widget>[
          // Sized outside the animation: the colours ease, the box does not,
          // so a checkbox given a new size takes it at once.
          SizedBox.square(
            dimension: box,
            child: AnimatedContainer(
              duration: duration,
              curve: MPMotion.standard,
              decoration: BoxDecoration(
                color: fill,
                borderRadius: radius,
                border: Border.all(color: edge, width: _edge),
              ),
            ),
          ),
          // Over the box rather than inside its border, so the mark keeps the
          // size it is drawn at: a 16px tick in an 18px box with a 2px edge
          // reaches into the edge, as the React mark overflows its padding box.
          SizedBox.square(
            dimension: _glyph[size]!,
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(end: marked ? 1 : 0),
              duration: duration,
              curve: MPMotion.standard,
              builder: (BuildContext context, double shown, Widget? child) {
                return CustomPaint(
                  painter: MPSelectionMarkPainter(shape: _shape, color: ink, shown: shown),
                );
              },
            ),
          ),
        ],
      );

      return MouseRegion(
        onEnter: (_) => setState(() => _boxHovered = true),
        onExit: (_) => setState(() => _boxHovered = false),
        child: MPSelectionHalo(
          diameter: mpSelectionHalo[size]!,
          // `onSurface` while empty and the accent once ticked, never the
          // ink, which by then is the colour of the tick.
          color: marked ? accent.color : colors.onSurface,
          opacity: disabled
              ? 0
              : mpStateLayerOpacity(
                  MPInteraction(
                    hovered: _boxHovered && interactive,
                    pressed: state.pressed,
                    focusVisible: state.focusVisible,
                  ),
                ),
          child: square,
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
      // Folded into the merged node round the row, so the checkbox says it can
      // take the focus.
      focusSemantics: true,
      cursor: interactive ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        return MPSelectionRow(
          line: MPSelectionText.lineOf(theme, size),
          extent: box,
          control: tick(state),
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
        // `mixed` is set only when it is true: handing Flutter both a `checked`
        // and a `mixed` is two claims about one state.
        checked: widget.indeterminate ? null : checked,
        mixed: widget.indeterminate ? true : null,
        // Read-only is not disabled: the box keeps its place in the focus
        // order, so it says it is available and cannot be changed, and only
        // the tap action goes.
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
