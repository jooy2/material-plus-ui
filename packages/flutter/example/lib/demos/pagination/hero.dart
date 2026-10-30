import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Twenty pages, ten of them showing.
///
/// Step through it: the number of slots never changes, the window slides
/// towards whichever end it is near, and the cell under the pointer stays
/// where it is.
class PaginationHero extends StatefulWidget {
  const PaginationHero({super.key});

  @override
  State<PaginationHero> createState() => _PaginationHeroState();
}

class _PaginationHeroState extends State<PaginationHero> {
  int _page = 1;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        MPPagination(
          count: 20,
          page: _page,
          onChanged: (int next) => setState(() => _page = next),
          size: MPSize.sm,
          showEdges: true,
        ),
        MPTypography('Showing results for page $_page.', level: MPTypographyLevel.caption),
      ],
    );
  }
}
