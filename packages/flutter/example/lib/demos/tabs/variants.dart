import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The two kinds of tab, one above the other.
///
/// They are not two levels of emphasis, they are two depths: primary tabs are
/// the top level of a screen, and secondary tabs divide the content inside one
/// of them. Which is why the pair below is how they are meant to be used: the
/// secondary bar lives inside the primary bar's panel.
class TabsVariants extends StatelessWidget {
  const TabsVariants({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: const MPTabs<String>(
        semanticLabel: 'Library',
        initialValue: 'albums',
        children: <Widget>[
          MPTab<String>(value: 'albums', child: Text('Albums')),
          MPTab<String>(value: 'artists', child: Text('Artists')),
          MPTabPanel<String>(
            value: 'albums',
            child: MPTabs<String>(
              semanticLabel: 'Sort albums',
              variant: MPTabsVariant.secondary,
              initialValue: 'recent',
              children: <Widget>[
                MPTab<String>(value: 'recent', child: Text('Recently added')),
                MPTab<String>(value: 'az', child: Text('A–Z')),
                MPTab<String>(value: 'year', child: Text('By year')),
                MPTabPanel<String>(
                  value: 'recent',
                  child: MPTypography('Four albums added this week.'),
                ),
                MPTabPanel<String>(value: 'az', child: MPTypography('Everything, alphabetically.')),
                MPTabPanel<String>(value: 'year', child: MPTypography('Oldest first.')),
              ],
            ),
          ),
          MPTabPanel<String>(value: 'artists', child: MPTypography('Twelve artists.')),
        ],
      ),
    );
  }
}
