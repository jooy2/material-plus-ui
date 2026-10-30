import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The four edges, and a short travel rather than the default.
///
/// `distance` is what turns a slide from an entrance out of frame into a
/// settling in place. Short is the right choice for something that is already
/// roughly where it belongs — a shared-axis step between two views, rather than
/// a panel arriving from off screen.
class AnimateSlideAxis extends StatelessWidget {
  const AnimateSlideAxis({super.key});

  static const List<MPSide> _sides = <MPSide>[MPSide.top, MPSide.right, MPSide.bottom, MPSide.left];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          // Two columns 12 apart, the grid the React demo draws with CSS.
          final double width = (constraints.maxWidth - 12) / 2;

          return Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              for (final MPSide side in _sides)
                SizedBox(
                  width: width,
                  child: MPAnimateSlide(
                    from: side,
                    distance: 24,
                    repeat: null,
                    alternate: true,
                    duration: const Duration(milliseconds: 1400),
                    child: MPBox(
                      size: MPSize.sm,
                      child: MPTypography(
                        'from: MPSide.${side.name}',
                        level: MPTypographyLevel.caption,
                      ),
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
