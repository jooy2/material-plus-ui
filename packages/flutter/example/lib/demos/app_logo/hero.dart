import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

class AppLogoHero extends StatelessWidget {
  const AppLogoHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    Widget section(String caption, List<Widget> logos) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: <Widget>[
          MPTypography(caption, level: MPTypographyLevel.caption),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: logos,
          ),
        ],
      );
    }

    return DefaultTextStyle.merge(
      style: TextStyle(color: theme.colors.onSurface),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: <Widget>[
          section('Nothing but a name', const <Widget>[
            MPAppLogo(name: 'Voltage'),
            MPAppLogo(name: 'Voltage', shape: MPAppLogoShape.app),
            MPAppLogo(
              name: 'Voltage',
              shape: MPAppLogoShape.circle,
              variant: MPVariant.tonal,
              color: MPColor.tertiary,
            ),
          ]),
          section('A glyph, framed three ways', <Widget>[
            MPAppLogo(
              name: 'Voltage',
              shape: MPAppLogoShape.app,
              href: '#',
              onPressed: () {},
              showName: true,
              child: const FilledBoltGlyph(),
            ),
            const MPAppLogo(
              name: 'Voltage',
              shape: MPAppLogoShape.circle,
              variant: MPVariant.tonal,
              color: MPColor.secondary,
              child: FilledBoltGlyph(),
            ),
            const MPAppLogo(
              name: 'Voltage',
              shape: MPAppLogoShape.app,
              variant: MPVariant.outlined,
              size: MPSize.sm,
              child: FilledBoltGlyph(),
            ),
          ]),
          section('A file, which brings its own colour', <Widget>[
            MPAppLogo(
              name: 'Voltage',
              image: const NetworkImage('/samples/marks/magnet-lightning.webp'),
              href: '#',
              onPressed: () {},
              showName: true,
            ),
            const MPAppLogo(
              name: 'Truenorth',
              image: NetworkImage('/samples/marks/compass-navigation.webp'),
            ),
            const MPAppLogo(
              name: 'Lanternpeak',
              image: NetworkImage('/samples/marks/lantern-mountain.webp'),
              shape: MPAppLogoShape.circle,
              variant: MPVariant.tonal,
              color: MPColor.tertiary,
            ),
            const MPAppLogo(
              name: 'Solarfield',
              image: NetworkImage('/samples/marks/solar-panel-sun.webp'),
              size: MPSize.sm,
            ),
          ]),
        ],
      ),
    );
  }
}
