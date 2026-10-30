import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A twelve-column row, divided.
///
/// Every cell is a width and nothing else: the sheet inside each one is an
/// MPBox, because wrapping something in a layout must not change how it looks.
class GridHero extends StatelessWidget {
  const GridHero({super.key});

  static Widget _cell(String label) {
    return MPBox(
      variant: MPVariant.filled,
      size: MPSize.sm,
      child: MPTypography(label, level: MPTypographyLevel.caption, align: TextAlign.center),
    );
  }

  static MPResponsive<MPGridSpan> _span(int columns) {
    return MPResponsive<MPGridSpan>(MPGridSpan(columns));
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPGrid(
        children: <Widget>[
          MPGridItem(span: _span(12), child: _cell('span 12')),
          MPGridItem(span: _span(6), child: _cell('span 6')),
          MPGridItem(span: _span(6), child: _cell('span 6')),
          MPGridItem(span: _span(4), child: _cell('span 4')),
          MPGridItem(span: _span(4), child: _cell('span 4')),
          MPGridItem(span: _span(4), child: _cell('span 4')),
          MPGridItem(
            span: _span(4),
            offset: const MPResponsive<int>(4),
            child: _cell('span 4, offset 4'),
          ),
        ],
      ),
    );
  }
}
