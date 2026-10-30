import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// MD3's navigation bar: three to five destinations, with the one the reader is
/// on marked by a 64×32dp `secondaryContainer` pill behind its glyph.
///
/// Rounded and held to 420 wide here, because a bar against the bottom of a
/// documentation page would be held against the bottom of the documentation.
/// In an application it is the last thing in the screen's `Column`.
class BottomNavigationHero extends StatefulWidget {
  const BottomNavigationHero({super.key});

  @override
  State<BottomNavigationHero> createState() => _BottomNavigationHeroState();
}

class _BottomNavigationHeroState extends State<BottomNavigationHero> {
  Object _page = 'home';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(theme.shapes.large),
        child: MPBottomNavigation(
          label: 'Main',
          value: _page,
          onChanged: (Object next) => setState(() => _page = next),
          children: const <Widget>[
            MPBottomNavigationItem(
              value: 'home',
              label: 'Home',
              icon: MPIcon(icon: InfoGlyph()),
            ),
            MPBottomNavigationItem(
              value: 'search',
              label: 'Search',
              icon: MPIcon(icon: SearchGlyph()),
            ),
            MPBottomNavigationItem(
              value: 'saved',
              label: 'Saved',
              icon: MPIcon(icon: CheckGlyph()),
            ),
            MPBottomNavigationItem(
              value: 'account',
              label: 'Account',
              icon: MPIcon(icon: MoreGlyph()),
            ),
          ],
        ),
      ),
    );
  }
}
