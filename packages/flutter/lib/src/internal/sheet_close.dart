/// The round × in the corner of a sheet.
///
/// A popover's, a dialog's, a drawer's, a snackbar's and a tour card's. In the
/// React build each of them spells it out: a transparent circle with the state
/// layer in it and the close icon in the middle, in the sheet's quieter ink,
/// and a `secondary` focus ring two pixels outside. The circle and the icon
/// differ in size from one sheet to the next and nothing else does, so the
/// drawing is here once and the sizes come from the caller.
///
/// Not `MPDismissButton`, which is the smaller × on a chip or a field, drawn at
/// the size of the text beside it with no circle round it.
///
/// None of this is exported from `material_plus_ui.dart`. It is the library
/// talking to itself.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/surface.dart';

/// A sheet's close button.
class MPSheetCloseButton extends StatelessWidget {
  /// Creates a close button.
  const MPSheetCloseButton({
    required this.label,
    required this.onPressed,
    required this.color,
    required this.ring,
    this.diameter = 32,
    this.iconSize = 18,
    this.focusNode,
    super.key,
  });

  /// The name a screen reader gives it. Never drawn.
  final String label;

  /// Called when it is pressed, by pointer or by keyboard. `null` leaves it in
  /// place and inert.
  final VoidCallback? onPressed;

  /// The ink: the × and the state layer, which is made of the same colour.
  /// Usually the sheet's `onSurfaceVariant`.
  final Color color;

  /// The focus ring's colour, which is `secondary` on every sheet.
  final Color ring;

  /// The circle the × sits in. React's `size-8`, 32, unless the sheet says
  /// otherwise.
  final double diameter;

  /// The × itself.
  final double iconSize;

  /// Drives the focus from outside, for a sheet that puts its first focus here.
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    final BorderRadius round = BorderRadius.circular(diameter / 2);

    return MPInteractive(
      onTap: onPressed,
      enabled: onPressed != null,
      interactive: onPressed != null,
      focusNode: focusNode,
      cursor: onPressed != null ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          // A node of its own: a close button folded into the sheet's title
          // would be a close button a screen reader cannot reach on its own.
          container: true,
          button: true,
          label: label,
          enabled: onPressed != null,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: ring, borderRadius: round)
                : null,
            child: MPStateLayer(
              color: color,
              opacity: mpStateLayerOpacity(state, enabled: onPressed != null),
              borderRadius: round,
              child: SizedBox.square(
                dimension: diameter,
                child: Center(
                  child: MPGlyph(MPGlyphShape.close, size: iconSize, color: color),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
