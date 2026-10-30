import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same picture in the same box, fitted five ways.
///
/// `fit` is the one convenience the widget adds on top of the proportion: the
/// media is fitted to the box rather than laid out at whatever size it arrived
/// at.
///
/// A portrait photo in a landscape box, so the fits are actually different.
/// `scaleDown` matches `contain` here, because the file is larger than the box.
class AspectRatioFit extends StatelessWidget {
  const AspectRatioFit({super.key});

  static const String _photo = '/samples/photos/thumbs/red-umbrella-autumn-path.webp';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return SizedBox(
      width: double.infinity,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: <Widget>[
          for (final MPAspectFit fit in MPAspectFit.values)
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
                      ratio: 4 / 3,
                      fit: fit,
                      rounded: true,
                      child: const Image(image: NetworkImage(_photo), excludeFromSemantics: true),
                    ),
                  ),
                  Text(
                    fit.name,
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
