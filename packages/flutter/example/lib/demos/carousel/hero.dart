import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CarouselHero extends StatelessWidget {
  const CarouselHero({super.key});

  static const List<(String, String)> _slides = <(String, String)>[
    (
      '/samples/photos/thumbs/forest-trail-sunbeams.webp',
      'A path through tall trees with sunbeams coming down between them',
    ),
    (
      '/samples/photos/thumbs/lakeside-observatory-blue-hour.webp',
      'A small observatory beside a lake at dusk',
    ),
    (
      '/samples/photos/thumbs/snowy-cabin-frozen-stream.webp',
      'A cabin in snow beside a frozen stream',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: MPCarousel(
        label: 'Trails',
        children: <Widget>[
          for (final (String src, String alt) in _slides)
            SizedBox(
              height: 180,
              child: Image(image: NetworkImage(src), semanticLabel: alt, fit: BoxFit.cover),
            ),
        ],
      ),
    );
  }
}
