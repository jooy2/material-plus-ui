import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The three layout widgets, doing the three separate jobs they exist to do.
///
/// The container holds the page off the edge of the window and caps the
/// measure. The grid divides what is inside it into columns. The boxes are the
/// surfaces: neither of the other two paints anything, which is what lets them
/// wrap somebody else's content without changing how it looks.
class ContainerPage extends StatelessWidget {
  const ContainerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: double.infinity,
      child: MPContainer(
        maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            MPTypography('Quarterly summary', level: MPTypographyLevel.h5, gutter: true),
            MPGrid(
              columns: MPResponsive<int>(4, medium: 12),
              spacing: MPResponsive<double>(4, medium: 6),
              children: <Widget>[
                MPGridItem(
                  span: MPResponsive<MPGridSpan>(MPGridSpan(4), medium: MPGridSpan(8)),
                  child: MPBox(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        MPTypography('Revenue', level: MPTypographyLevel.h6, gutter: true),
                        MPTypography('Eight of twelve columns from 600dp up.'),
                      ],
                    ),
                  ),
                ),
                MPGridItem(
                  span: MPResponsive<MPGridSpan>(MPGridSpan(4), medium: MPGridSpan(4)),
                  child: MPBox(
                    variant: MPVariant.filled,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        MPTypography('Churn', level: MPTypographyLevel.h6, gutter: true),
                        MPTypography('The remaining four.', level: MPTypographyLevel.caption),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
