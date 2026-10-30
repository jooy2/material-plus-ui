import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ShortcutPlatforms extends StatelessWidget {
  const ShortcutPlatforms({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle code = TextStyle(
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.colors.onSurface.withValues(alpha: 0.7),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        for (final MPShortcutOS os in MPShortcutOS.values)
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 14,
            children: <Widget>[
              SizedBox(width: 72, child: Text(os.name, style: code)),
              MPShortcut(keys: 'Mod+Shift+P', os: os, size: MPSize.sm),
            ],
          ),
      ],
    );
  }
}
