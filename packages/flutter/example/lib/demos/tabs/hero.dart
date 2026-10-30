import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_navigation_layout.dart';

/// MD3's primary tabs: the top level of a screen.
///
/// The glyph sits above the label, the indicator is a rounded 3dp bar under the
/// label rather than under the whole tab, and the chosen label takes the accent.
/// All three are what tell a primary tab bar from a secondary one.
class TabsHero extends StatefulWidget {
  const TabsHero({super.key});

  @override
  State<TabsHero> createState() => _TabsHeroState();
}

class _TabsHeroState extends State<TabsHero> {
  String _section = 'flights';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: MPTabs<String>(
        semanticLabel: 'Trip',
        value: _section,
        onChanged: (String next) => setState(() => _section = next),
        children: const <Widget>[
          MPTab<String>(
            value: 'flights',
            icon: MPIcon(icon: ArrowUpGlyph(), size: 24),
            child: Text('Flights'),
          ),
          MPTab<String>(
            value: 'stays',
            icon: MPIcon(icon: CalendarGlyph(), size: 24),
            child: Text('Stays'),
          ),
          MPTab<String>(
            value: 'cars',
            icon: MPIcon(icon: ArrowRightGlyph(), size: 24),
            child: Text('Cars'),
          ),
          MPTabPanel<String>(
            value: 'flights',
            child: MPTypography('Two seats, Seoul to Osaka, Friday.'),
          ),
          MPTabPanel<String>(value: 'stays', child: MPTypography('Three nights near the station.')),
          MPTabPanel<String>(value: 'cars', child: MPTypography('Nothing booked yet.')),
        ],
      ),
    );
  }
}
