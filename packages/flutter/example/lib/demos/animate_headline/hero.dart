import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Every line sits in the same place, so the box is as large as the largest of
/// them from the first frame and never resizes as the reel turns.
///
/// `interval` is counted from the moment a line arrives rather than from the
/// start of the cycle, so it is reading time — a longer `duration` does not
/// quietly eat it.
class AnimateHeadlineHero extends StatelessWidget {
  const AnimateHeadlineHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPTypography('Material Plus is', level: MPTypographyLevel.h4),
        MPAnimateHeadline(
          interval: Duration(milliseconds: 2200),
          children: <Widget>[
            MPTypography(
              'a component library',
              level: MPTypographyLevel.h4,
              color: MPColor.primary,
            ),
            MPTypography(
              'Material Design 3',
              level: MPTypographyLevel.h4,
              color: MPColor.secondary,
            ),
            MPTypography(
              'for React and Flutter',
              level: MPTypographyLevel.h4,
              color: MPColor.tertiary,
            ),
          ],
        ),
      ],
    );
  }
}
