import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// A row of destinations, some of which open a panel of more of them.
///
/// Every row here is announced as what it is: a destination as a link, and an
/// item with a panel as something that expands. Where React's rows carry an
/// `href`, a Flutter row calls the app's router from `onPressed`.
class NavigationMenuHero extends StatelessWidget {
  const NavigationMenuHero({super.key});

  @override
  Widget build(BuildContext context) {
    return MPNavigationMenu(
      semanticLabel: 'Main',
      items: <MPNavigationMenuItem>[
        MPNavigationMenuItem(
          value: 'product',
          label: 'Product',
          columns: 2,
          links: <MPNavigationMenuLink>[
            MPNavigationMenuLink(
              title: 'Overview',
              description: 'What the thing is, in one screen',
              startIcon: const MPIcon(icon: InfoGlyph(), size: 18),
              onPressed: () {},
            ),
            MPNavigationMenuLink(
              title: 'Pricing',
              description: 'Per seat, per month',
              startIcon: const MPIcon(icon: CheckGlyph(), size: 18),
              onPressed: () {},
            ),
            MPNavigationMenuLink(
              title: 'Changelog',
              description: 'Everything that shipped',
              startIcon: const MPIcon(icon: ClockGlyph(), size: 18),
              onPressed: () {},
            ),
            MPNavigationMenuLink(
              title: 'Status',
              description: 'Whether it is up',
              startIcon: const MPIcon(icon: SuccessGlyph(), size: 18),
              onPressed: () {},
            ),
          ],
        ),
        MPNavigationMenuItem(
          value: 'developers',
          label: 'Developers',
          links: <MPNavigationMenuLink>[
            MPNavigationMenuLink(title: 'Documentation', onPressed: () {}),
            MPNavigationMenuLink(title: 'API reference', onPressed: () {}),
            MPNavigationMenuLink(title: 'SDKs', onPressed: () {}),
          ],
        ),
        MPNavigationMenuItem(label: 'Pricing', onPressed: () {}),
      ],
    );
  }
}
