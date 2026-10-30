import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Down the side of a page the panels open beside the rail rather than under it,
/// and the arrow keys follow.
///
/// Nothing else changes: the rows are the same destinations and the same
/// triggers, which is what makes a sidebar full of navigation and a header full
/// of it the same component.
class NavigationMenuVertical extends StatelessWidget {
  const NavigationMenuVertical({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: MPNavigationMenu(
        semanticLabel: 'Sections',
        orientation: MPOrientation.vertical,
        size: MPSize.sm,
        items: <MPNavigationMenuItem>[
          MPNavigationMenuItem(label: 'Overview', onPressed: () {}),
          MPNavigationMenuItem(
            value: 'reports',
            label: 'Reports',
            links: <MPNavigationMenuLink>[
              MPNavigationMenuLink(title: 'Weekly', onPressed: () {}),
              MPNavigationMenuLink(title: 'Monthly', onPressed: () {}),
            ],
          ),
          MPNavigationMenuItem(label: 'Settings', onPressed: () {}),
        ],
      ),
    );
  }
}
