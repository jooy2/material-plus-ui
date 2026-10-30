import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A row of thumbnails is a row of one shape, whatever the pictures in it are.
///
/// The box reserves the space before the media has arrived, which is what stops
/// a card whose image loads late from reflowing the page around it. All three
/// pictures below are different proportions; the boxes are not.
class AspectRatioHero extends StatelessWidget {
  const AspectRatioHero({super.key});

  static const List<(double, String, String, String)> _thumbnails =
      <(double, String, String, String)>[
        (
          1,
          '1 / 1',
          '/samples/photos/thumbs/misty-tea-terraces-sunrise.webp',
          'Tea terraces under a low sun',
        ),
        (
          4 / 3,
          '4 / 3',
          '/samples/photos/thumbs/red-umbrella-autumn-path.webp',
          'A red umbrella left open on a wet path of autumn leaves',
        ),
        (
          16 / 9,
          '16 / 9',
          '/samples/photos/thumbs/snowy-cabin-frozen-stream.webp',
          'A cabin in snow beside a frozen stream',
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return SizedBox(
      width: double.infinity,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: <Widget>[
          for (final (double ratio, String label, String src, String alt) in _thumbnails)
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 8,
                children: <Widget>[
                  DecoratedBox(
                    decoration: BoxDecoration(
                      color: theme.colors.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(theme.shapes.medium),
                    ),
                    child: MPAspectRatio(
                      ratio: ratio,
                      fit: MPAspectFit.cover,
                      rounded: true,
                      child: Image(image: NetworkImage(src), semanticLabel: alt),
                    ),
                  ),
                  Text(
                    label,
                    style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
