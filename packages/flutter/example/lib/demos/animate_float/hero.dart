import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Three shapes on one stagger rather than three separate floats, which is the
/// one arrangement where more than one of these is right: they read as a set
/// drifting together instead of as three things each doing their own thing.
class AnimateFloatHero extends StatelessWidget {
  const AnimateFloatHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: <Widget>[
        MPAnimateFloat(
          stagger: const Duration(milliseconds: 900),
          tilt: 2,
          layoutBuilder: (BuildContext context, List<Widget> children) {
            return Row(mainAxisSize: MainAxisSize.min, spacing: 16, children: children);
          },
          children: const <Widget>[
            // Each box as wide as its word, as a box in a flex row is.
            IntrinsicWidth(
              child: MPBox(size: MPSize.sm, child: MPTypography('Above')),
            ),
            IntrinsicWidth(
              child: MPBox(size: MPSize.sm, child: MPTypography('the')),
            ),
            IntrinsicWidth(
              child: MPBox(size: MPSize.sm, child: MPTypography('sheet')),
            ),
          ],
        ),
        const MPTypography(
          'Half a centimetre of unhurried travel, and nothing here can be pressed.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
