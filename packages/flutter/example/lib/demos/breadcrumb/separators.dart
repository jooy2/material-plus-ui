import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class BreadcrumbSeparators extends StatelessWidget {
  const BreadcrumbSeparators({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        for (final MPBreadcrumbSeparator mark in MPBreadcrumbSeparator.values)
          MPBreadcrumb(
            separator: mark,
            size: MPSize.sm,
            children: <Widget>[
              MPBreadcrumbItem(onPressed: () {}, child: const Text('Home')),
              MPBreadcrumbItem(onPressed: () {}, child: const Text('Docs')),
              MPBreadcrumbItem(child: Text(mark.name)),
            ],
          ),
      ],
    );
  }
}
