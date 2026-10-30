import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `layoutBuilder` puts the stagger on a real grid, so the cells stay the
/// grid's own children rather than being wrapped one layer deeper.
///
/// `MPAnimateTrigger.visible` with `once: false` replays the whole set every
/// time it comes back into view, which is what makes it worth scrolling past
/// twice.
class AnimateAppearGrid extends StatelessWidget {
  const AnimateAppearGrid({super.key});

  static const List<String> _tiles = <String>[
    'Overview',
    'Traffic',
    'Revenue',
    'Retention',
    'Latency',
    'Errors',
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: MPAnimateAppear(
        trigger: MPAnimateTrigger.visible,
        once: false,
        threshold: 0.3,
        stagger: const Duration(milliseconds: 60),
        from: MPSide.bottom,
        // Three columns 12 apart, the grid the React demo draws with CSS.
        layoutBuilder: (BuildContext context, List<Widget> children) {
          return LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              final double width = (constraints.maxWidth - 24) / 3;

              return Wrap(
                spacing: 12,
                runSpacing: 12,
                children: <Widget>[
                  for (final Widget child in children) SizedBox(width: width, child: child),
                ],
              );
            },
          );
        },
        children: <Widget>[
          for (final String tile in _tiles)
            MPBox(
              size: MPSize.sm,
              child: MPTypography(tile, level: MPTypographyLevel.caption),
            ),
        ],
      ),
    );
  }
}
