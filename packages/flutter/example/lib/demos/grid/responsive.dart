import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Material's own layout grid: four columns in a compact window, twelve from
/// medium up, with the gutter widening from 16dp to 24dp at the same moment.
///
/// Narrow the window and the cards go from four a row to two and then to one.
/// The window size class is read off the window, so the grid changes shape at
/// the same widths as everything else on the screen.
class GridResponsive extends StatelessWidget {
  const GridResponsive({super.key});

  static const List<(String, String)> _articles = <(String, String)>[
    ('Window size classes', 'compact · medium · expanded'),
    ('Columns', '4 · 12 · 12'),
    ('Gutters', '16dp · 24dp · 24dp'),
    ('Margins', '16dp · 24dp · 24dp'),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPGrid(
        columns: const MPResponsive<int>(4, medium: 12),
        spacing: const MPResponsive<double>(4, medium: 6),
        children: <Widget>[
          for (final (String title, String meta) in _articles)
            MPGridItem(
              span: const MPResponsive<MPGridSpan>(
                MPGridSpan(4),
                medium: MPGridSpan(6),
                expanded: MPGridSpan(3),
              ),
              child: MPBox(
                variant: MPVariant.elevated,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    MPTypography(title, level: MPTypographyLevel.h6, gutter: true),
                    MPTypography(meta, level: MPTypographyLevel.caption),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
