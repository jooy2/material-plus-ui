import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TypographyHero extends StatelessWidget {
  const TypographyHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 560),
      child: DefaultTextStyle.merge(
        style: TextStyle(color: theme.colors.onSurface),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography('Release notes', level: MPTypographyLevel.overline),
            MPTypography('Material Plus 1.0', level: MPTypographyLevel.h2),
            MPTypography(
              'Written from the Material Design 3 specification, and extended past where it '
              'stops.',
              level: MPTypographyLevel.lead,
            ),
            MPTypography(
              'Every level below is one of MD3’s own type roles, at the specification’s size, '
              'leading, tracking and weight.',
            ),
            MPTypography('Published 9 August 2026', level: MPTypographyLevel.caption),
          ],
        ),
      ),
    );
  }
}
