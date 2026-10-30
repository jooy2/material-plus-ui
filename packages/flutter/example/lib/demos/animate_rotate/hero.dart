import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import '../glyphs_transitions.dart';

/// Two angles rather than one, which is what lets this be both effects a
/// rotation is ever used for.
///
/// `from` alone is an arrival — something swinging into place and stopping.
/// `from` and `to` together with an endless repeat and a linear curve is a spin
/// that never lands.
class AnimateRotateHero extends StatelessWidget {
  const AnimateRotateHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Row(
        spacing: 12,
        children: <Widget>[
          Expanded(
            child: MPBox(
              size: MPSize.sm,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 8,
                children: <Widget>[
                  MPAnimateRotate(
                    repeat: null,
                    alternate: true,
                    duration: Duration(milliseconds: 1800),
                    child: MPIcon(icon: ChevronDownGlyph(), size: 28),
                  ),
                  MPTypography('An arrival', level: MPTypographyLevel.caption),
                ],
              ),
            ),
          ),
          Expanded(
            child: MPBox(
              size: MPSize.sm,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 8,
                children: <Widget>[
                  MPAnimateRotate(
                    from: 0,
                    to: 360,
                    repeat: null,
                    easing: MPEasing.linear,
                    fade: false,
                    duration: Duration(milliseconds: 2400),
                    child: MPIcon(icon: SpinnerGlyph(), size: 28),
                  ),
                  MPTypography('A spin', level: MPTypographyLevel.caption),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
