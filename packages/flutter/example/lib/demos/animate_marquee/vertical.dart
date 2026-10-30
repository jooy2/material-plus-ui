import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Vertical, reversed, and slower.
///
/// `speed` is pixels per second rather than a duration, so these two strips
/// move at the same pace even though one holds twice as much as the other —
/// which is exactly what a duration could not do.
class AnimateMarqueeVertical extends StatelessWidget {
  const AnimateMarqueeVertical({super.key});

  static const List<String> _left = <String>['Seoul', 'Tokyo', 'Taipei', 'Osaka'];

  static const List<String> _right = <String>[
    'Paris',
    'Lisbon',
    'Madrid',
    'Berlin',
    'Vienna',
    'Oslo',
    'Dublin',
    'Prague',
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Row(
        spacing: 12,
        children: <Widget>[
          for (final (int index, List<String> cities) in <List<String>>[_left, _right].indexed)
            Expanded(
              child: SizedBox(
                height: 160,
                child: MPAnimateMarquee(
                  orientation: MPOrientation.vertical,
                  reverse: index == 1,
                  speed: 30,
                  gap: 8,
                  children: <Widget>[
                    for (final String city in cities)
                      SizedBox(
                        width: double.infinity,
                        child: MPBox(
                          size: MPSize.sm,
                          child: MPTypography(city, level: MPTypographyLevel.caption),
                        ),
                      ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
