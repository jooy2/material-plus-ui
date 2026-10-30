import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ImagePosition extends StatelessWidget {
  const ImagePosition({super.key});

  static const List<(String, Alignment)> _positions = <(String, Alignment)>[
    ('top', Alignment.topCenter),
    ('center', Alignment.center),
    ('bottom', Alignment.bottomCenter),
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: <Widget>[
        for (final (String name, Alignment position) in _positions)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                MPImage(
                  image: const NetworkImage('/samples/photos/thumbs/red-umbrella-autumn-path.webp'),
                  semanticLabel:
                      'A red umbrella lying closed on a wet stone path among autumn leaves',
                  height: 140,
                  position: position,
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
