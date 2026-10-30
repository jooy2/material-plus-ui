import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The two shapes a strip takes: a row of chips with the buttons beside it, and
/// a shelf of cards two rows deep with the buttons over it.
class ScrollZoneHero extends StatelessWidget {
  const ScrollZoneHero({super.key});

  static const List<String> _categories = <String>[
    'Espresso',
    'Filter',
    'Cold brew',
    'Decaf',
    'Single origin',
    'Blends',
    'Green tea',
    'Black tea',
    'Herbal',
    'Chocolate',
    'Equipment',
    'Gifts',
  ];

  static const List<String> _shelf = <String>[
    'Kenya AA',
    'Ethiopia Guji',
    'Colombia Huila',
    'Brazil Cerrado',
    'Guatemala Antigua',
    'Rwanda Nyamasheke',
    'Peru Cajamarca',
    'Honduras Marcala',
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: <Widget>[
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: <Widget>[
              const MPTypography(
                'One line, buttons beside the strip',
                level: MPTypographyLevel.caption,
              ),
              MPScrollZone(
                label: 'Categories',
                size: MPSize.sm,
                children: <Widget>[
                  for (final String category in _categories) MPChip(child: Text(category)),
                ],
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: <Widget>[
              const MPTypography('Two lines, buttons over it', level: MPTypographyLevel.caption),
              MPScrollZone(
                label: 'Origins',
                lines: 2,
                buttonPlacement: MPScrollZoneButtonPlacement.overlay,
                snap: true,
                gap: 12,
                children: <Widget>[
                  for (final String origin in _shelf)
                    SizedBox(
                      width: 180,
                      child: MPCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            MPTypography(origin, level: MPTypographyLevel.h6),
                            const MPTypography(
                              'Roasted last week',
                              level: MPTypographyLevel.caption,
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
