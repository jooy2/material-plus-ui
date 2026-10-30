import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Three dials, and they are the whole of the look.
///
/// `arc` is how much of the outline is lit at once — small is a travelling
/// spark, large is a sweep. `blur` is how soft the light is; at `0` it is a
/// hard-edged wedge, which reads as a graphic rather than as light. `spread` is
/// how far past the content it reaches.
class AnimateLightingShape extends StatelessWidget {
  const AnimateLightingShape({super.key});

  static const List<(String, double, double, double, MPColor)> _looks =
      <(String, double, double, double, MPColor)>[
        ('A spark', 18, 6, 3, MPColor.primary),
        ('A sweep', 140, 10, 5, MPColor.tertiary),
        ('A wedge', 60, 0, 2, MPColor.secondary),
        ('A halo', 200, 14, 8, MPColor.error),
      ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          // Two columns 20 apart, the grid the React demo draws with CSS.
          final double width = (constraints.maxWidth - 20) / 2;

          return Wrap(
            spacing: 20,
            runSpacing: 20,
            children: <Widget>[
              for (final (String label, double arc, double blur, double spread, MPColor color)
                  in _looks)
                SizedBox(
                  width: width,
                  child: MPAnimateLighting(
                    size: MPSize.sm,
                    color: color,
                    arc: arc,
                    blur: blur,
                    spread: spread,
                    duration: const Duration(milliseconds: 4000),
                    child: MPBox(
                      size: MPSize.sm,
                      variant: MPVariant.filled,
                      child: MPTypography(label, level: MPTypographyLevel.caption),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
