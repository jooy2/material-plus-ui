import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

class IconSizes extends StatelessWidget {
  const IconSizes({super.key});

  static const List<double> _sizes = <double>[14, 16, 20, 24, 32];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return IconTheme.merge(
      data: IconThemeData(color: theme.colors.onSurface),
      child: Wrap(
        spacing: 32,
        runSpacing: 24,
        crossAxisAlignment: WrapCrossAlignment.end,
        children: <Widget>[
          for (final double size in _sizes)
            Column(
              mainAxisSize: MainAxisSize.min,
              spacing: 8,
              children: <Widget>[
                MPIcon(icon: const InfoGlyph(), size: size, label: 'Info, ${size.round()}px'),
                Text(
                  '${size.round()}',
                  style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
