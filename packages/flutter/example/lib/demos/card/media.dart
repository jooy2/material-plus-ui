import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CardMedia extends StatelessWidget {
  const CardMedia({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: MPCard(
        variant: MPVariant.filled,
        title: const Text('Sunrise over the terraces'),
        subtitle: const Text('05:41, from the top of the ridge'),
        media: const MPImage(
          image: NetworkImage('/samples/photos/thumbs/misty-tea-terraces-sunrise.webp'),
          semanticLabel: 'Rows of tea terraces in low mist, with the sun just over the hills',
          ratio: 16 / 9,
        ),
        footer: MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Open')),
        child: const Text(
          'The picture reaches all four edges of the top. Nothing above it is padded.',
        ),
      ),
    );
  }
}
