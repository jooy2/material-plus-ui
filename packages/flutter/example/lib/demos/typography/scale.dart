import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TypographyScale extends StatelessWidget {
  const TypographyScale({super.key});

  static const List<(MPTypographyLevel, String)> _roles = <(MPTypographyLevel, String)>[
    (MPTypographyLevel.h1, 'display-small'),
    (MPTypographyLevel.h2, 'headline-large'),
    (MPTypographyLevel.h3, 'headline-medium'),
    (MPTypographyLevel.h4, 'headline-small'),
    (MPTypographyLevel.h5, 'title-large'),
    (MPTypographyLevel.h6, 'title-medium'),
    (MPTypographyLevel.lead, 'title-large'),
    (MPTypographyLevel.body, 'body-large'),
    (MPTypographyLevel.caption, 'body-small'),
    (MPTypographyLevel.overline, 'label-small'),
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle code = TextStyle(
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.colors.onSurface.withValues(alpha: 0.7),
    );

    return DefaultTextStyle.merge(
      style: TextStyle(color: theme.colors.onSurface),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          for (final (MPTypographyLevel level, String role) in _roles)
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              spacing: 16,
              children: <Widget>[
                SizedBox(width: 72, child: Text(level.name, style: code)),
                Flexible(child: MPTypography(role, level: level, lines: 1)),
              ],
            ),
        ],
      ),
    );
  }
}
