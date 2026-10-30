/// The × that takes something away.
///
/// A chip's remove, an alert's close, a modal's, a toast's, a file's. One
/// drawing at one weight, kept quiet until it is wanted, in one file — because
/// two copies of a dismissal drift by half a point of opacity, and then a page
/// has two kinds of "close" on it.
///
/// None of this is exported from `material_plus_ui.dart` — it is the library talking to
/// itself.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/target.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// How visible the × is before the pointer or the keyboard reaches it.
///
/// Not invisible: a dismissal you cannot see until you hover it is a dismissal
/// a touch screen never announces. Quiet is the most it may be.
const double _rest = 0.7;

/// How large it is drawn, against the line of text it sits on.
const double dismissScale = 1.15;

/// The ×.
///
/// Drawn at the size of the text beside it, and pressed from a 24px square: it
/// is a [MPTarget], so whatever holds it puts a [MPTargetScope] round the
/// surface the × sits on.
class MPDismissButton extends StatelessWidget {
  /// Creates a dismiss button.
  const MPDismissButton({
    required this.label,
    required this.onPressed,
    required this.size,
    required this.ring,
    this.color,
    super.key,
  });

  /// The name a screen reader gives it. Never drawn.
  final String label;

  /// Called when it is pressed. `null` leaves the button in place and inert.
  final VoidCallback? onPressed;

  /// The box the × is drawn in.
  final double size;

  /// The ink, which is whatever the surface it sits on is written in, or
  /// `null` for the ambient [IconTheme]'s, which is how a × on a control
  /// follows the control's ink as it eases.
  final Color? color;

  /// The focus ring's colour.
  final Color ring;

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return MPInteractive(
      onTap: onPressed,
      interactive: onPressed != null,
      enabled: onPressed != null,
      cursor: onPressed != null ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      builder: (BuildContext context, MPInteraction state) {
        final lit = state.hovered || state.focusVisible;

        final Widget mark = CustomPaint(
          foregroundPainter: state.focusVisible
              ? MPFocusRingPainter(color: ring, borderRadius: BorderRadius.circular(size))
              : null,
          child: AnimatedOpacity(
            opacity: lit ? 1 : _rest,
            duration: reduceMotion ? Duration.zero : MPMotion.short4,
            curve: MPMotion.standard,
            child: SizedBox.square(
              dimension: size,
              child: MPGlyph(MPGlyphShape.close, size: size, color: color),
            ),
          ),
        );

        // Said on the button's own node, which is in here, and nothing while
        // it has nothing to do, which is when it takes no focus.
        final focus = mpFocusSemanticsOf(context);

        return MPTarget(
          child: Semantics(
            // A node of its own, and not an annotation folded into whatever it
            // sits inside: a dismissal that merges into its alert is a
            // dismissal a screen reader cannot reach separately from the
            // message.
            container: true,
            button: true,
            label: label,
            enabled: onPressed != null,
            focused: focus.focused,
            onFocus: focus.onFocus,
            expanded: focus.expanded,
            onTap: onPressed,
            child: mark,
          ),
        );
      },
    );
  }
}
