import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_navigation_bars.dart';

/// The bar inside a box of its own rather than against the window: the bottom
/// of a `Stack` over the content it floats above, which is what a screen, a
/// card or a preview wants.
class FloatingBottomNavigationHero extends StatefulWidget {
  const FloatingBottomNavigationHero({super.key});

  @override
  State<FloatingBottomNavigationHero> createState() => _FloatingBottomNavigationHeroState();
}

class _FloatingBottomNavigationHeroState extends State<FloatingBottomNavigationHero> {
  String _value = 'map';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.large);

    return Container(
      height: 280,
      decoration: BoxDecoration(
        color: theme.colors.surfaceContainerLow,
        border: Border.all(color: theme.colors.outlineVariant),
        borderRadius: corner,
      ),
      child: ClipRRect(
        borderRadius: corner,
        child: Stack(
          children: <Widget>[
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: 12,
              separatorBuilder: (BuildContext context, int index) => const SizedBox(height: 8),
              itemBuilder: (BuildContext context, int index) => const MPTypography(
                'The content keeps going underneath, which is the whole reason the bar floats.',
                level: MPTypographyLevel.caption,
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: MPFloatingBottomNavigation(
                label: 'Main',
                value: _value,
                onChanged: (Object next) => setState(() => _value = '$next'),
                children: const <Widget>[
                  MPBottomNavigationItem(
                    value: 'map',
                    label: 'Explore',
                    icon: MPIcon(icon: SearchGlyph()),
                  ),
                  MPBottomNavigationItem(
                    value: 'saved',
                    label: 'Saved',
                    icon: MPIcon(icon: StarGlyph()),
                  ),
                  MPBottomNavigationItem(
                    value: 'upload',
                    label: 'Upload',
                    icon: MPIcon(icon: UploadGlyph()),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
