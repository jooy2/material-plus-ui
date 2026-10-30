import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class BreadcrumbHero extends StatelessWidget {
  const BreadcrumbHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 18,
      children: <Widget>[
        MPBreadcrumb(
          children: <Widget>[
            MPBreadcrumbItem(onPressed: () {}, child: const Text('Home')),
            MPBreadcrumbItem(onPressed: () {}, child: const Text('Components')),
            MPBreadcrumbItem(onPressed: () {}, child: const Text('Navigation')),
            const MPBreadcrumbItem(child: Text('Breadcrumb')),
          ],
        ),
        MPBreadcrumb(
          separator: MPBreadcrumbSeparator.slash,
          size: MPSize.sm,
          maxItems: 3,
          children: <Widget>[
            MPBreadcrumbItem(onPressed: () {}, child: const Text('jooy2')),
            MPBreadcrumbItem(onPressed: () {}, child: const Text('material-plus')),
            MPBreadcrumbItem(onPressed: () {}, child: const Text('src')),
            MPBreadcrumbItem(onPressed: () {}, child: const Text('components')),
            const MPBreadcrumbItem(child: Text('breadcrumb')),
          ],
        ),
      ],
    );
  }
}
