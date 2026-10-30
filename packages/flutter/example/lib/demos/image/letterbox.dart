import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ImageLetterbox extends StatelessWidget {
  const ImageLetterbox({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final List<(String, MPImageLetterbox?)> letterboxes = <(String, MPImageLetterbox?)>[
      ('none', null),
      (
        'surfaceContainerHighest',
        MPImageLetterbox(BoxDecoration(color: theme.colors.surfaceContainerHighest)),
      ),
      ('blur', MPImageLetterbox.blur),
    ];

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: <Widget>[
        for (final (String name, MPImageLetterbox? letterbox) in letterboxes)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                MPImage(
                  image: const NetworkImage('/samples/photos/thumbs/red-umbrella-autumn-path.webp'),
                  semanticLabel:
                      'A red umbrella lying closed on a wet stone path among autumn leaves',
                  ratio: 4 / 3,
                  fit: MPImageFit.contain,
                  letterbox: letterbox,
                ),
                Text(
                  name,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: theme.colors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
