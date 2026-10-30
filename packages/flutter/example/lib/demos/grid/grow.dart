import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A thumbnail and the words beside it, which is the layout `MPGridSpan.grow`
/// is for.
///
/// The picture is three columns because that is what it is; the body is
/// everything left over, and stays right when the picture's column count
/// changes. Written as two numbers, three and nine, it would be right until
/// somebody edited one of them.
class GridGrow extends StatelessWidget {
  const GridGrow({super.key});

  static const List<(String, String)> _archive = <(String, String)>[
    ('Sonic the Hedgehog', '1998 · Flash · 2.1 MB'),
    ('A Duck Has an Adventure', '2012 · Flash · 4.8 MB'),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPGrid(
        spacing: const MPResponsive<double>(4),
        children: <Widget>[
          for (final (String title, String meta) in _archive)
            MPGridItem(
              span: const MPResponsive<MPGridSpan>(MPGridSpan(12)),
              child: MPBox(
                child: MPGrid(
                  spacing: const MPResponsive<double>(4),
                  alignItems: MPGridAlign.center,
                  children: <Widget>[
                    const MPGridItem(
                      span: MPResponsive<MPGridSpan>(MPGridSpan(3)),
                      child: MPBox(
                        variant: MPVariant.tonal,
                        child: AspectRatio(
                          aspectRatio: 4 / 3,
                          child: Center(
                            child: MPTypography('Thumbnail', level: MPTypographyLevel.caption),
                          ),
                        ),
                      ),
                    ),
                    MPGridItem(
                      span: const MPResponsive<MPGridSpan>(MPGridSpan.grow),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          MPTypography(title, level: MPTypographyLevel.h6, gutter: true),
                          MPTypography(meta, level: MPTypographyLevel.caption),
                        ],
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
