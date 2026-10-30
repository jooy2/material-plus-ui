import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `maxHeight` clamps the **covered** box only.
///
/// Set it for something long enough that a page of blurred content would be a
/// page of nothing. Revealing releases the clamp and the content takes whatever
/// height it needs: revealing something and leaving it in a box with a
/// scrollbar is answering the wrong question.
///
/// `padded: false` is for content that should reach the edges. The sheet's own
/// corners still crop it.
class SpoilerClamped extends StatelessWidget {
  const SpoilerClamped({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          MPSpoiler(
            maxHeight: 96,
            blur: 6,
            reversible: true,
            label: Text('Read the ending'),
            child: MPTypography(
              'The train was late, which is how she came to be standing on the platform when the '
              'letter arrived. It had been posted four years earlier, from an address that no '
              'longer existed, by a man who had signed it with her own surname. She read it twice '
              'on the platform and a third time on the train, and by the time she reached the '
              'coast she had decided what to do about it.',
              level: MPTypographyLevel.body,
            ),
          ),
          MPSpoiler(
            padded: false,
            description: Text('Contains flashing images'),
            child: Image(
              image: NetworkImage('/samples/photos/thumbs/rainy-city-crosswalk-reflections.webp'),
              width: double.infinity,
              height: 120,
              fit: BoxFit.cover,
              semanticLabel: 'A city crossing at night, headlights running down the wet road',
            ),
          ),
        ],
      ),
    );
  }
}
