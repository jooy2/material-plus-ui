import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// What `siblingCount` and `boundaryCount` actually control.
///
/// `siblingCount` is how many pages stay either side of the current one;
/// `boundaryCount` is how many stay pinned at each end whatever page you are
/// on. Drag either and step through the pages: what changes is which slots are
/// numbers and which are gaps, never how many slots there are.
class PaginationWindow extends StatefulWidget {
  const PaginationWindow({super.key});

  @override
  State<PaginationWindow> createState() => _PaginationWindowState();
}

class _PaginationWindowState extends State<PaginationWindow> {
  int _page = 10;
  List<double> _siblings = <double>[1];
  List<double> _boundaries = <double>[1];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          MPSlider(
            label: const Text('siblingCount'),
            showValue: true,
            min: 0,
            max: 3,
            value: _siblings,
            onChanged: (List<double> next) => setState(() => _siblings = next),
          ),
          MPSlider(
            label: const Text('boundaryCount'),
            showValue: true,
            min: 0,
            max: 3,
            value: _boundaries,
            onChanged: (List<double> next) => setState(() => _boundaries = next),
          ),
          MPPagination(
            count: 20,
            page: _page,
            onChanged: (int next) => setState(() => _page = next),
            siblingCount: _siblings.first.round(),
            boundaryCount: _boundaries.first.round(),
            size: MPSize.xs,
          ),
          const MPTypography(
            'A gap of exactly one page is filled with that page — an ellipsis is wider than the '
            'number it would have replaced.',
            level: MPTypographyLevel.caption,
          ),
        ],
      ),
    );
  }
}
