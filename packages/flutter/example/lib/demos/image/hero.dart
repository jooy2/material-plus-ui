import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ImageHero extends StatelessWidget {
  const ImageHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle.merge(
      style: TextStyle(color: theme.colors.onSurface),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 24,
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                MPTypography('loaded — and previewable', level: MPTypographyLevel.overline),
                MPImage(
                  image: NetworkImage('/samples/photos/thumbs/alpine-lake-dawn.webp'),
                  previewImage: NetworkImage('/samples/photos/alpine-lake-dawn.webp'),
                  semanticLabel: 'A still lake below a low sun, with snow on the peaks behind it',
                  ratio: 16 / 9,
                  preview: true,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                MPTypography('failed', level: MPTypographyLevel.overline),
                MPImage(
                  image: NetworkImage('/this-file-does-not-exist.png'),
                  semanticLabel: 'A photo that never arrived',
                  ratio: 16 / 9,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
