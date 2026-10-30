import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A score out of five.
///
/// The row is one focus stop, the arrow keys move the score within it, and
/// every score a reader can choose is a radio of its own to a screen reader.
class RatingHero extends StatefulWidget {
  const RatingHero({super.key});

  @override
  State<RatingHero> createState() => _RatingHeroState();
}

class _RatingHeroState extends State<RatingHero> {
  double _score = 4;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        MPRating(
          value: _score,
          onChanged: (double next) => setState(() => _score = next),
          size: MPSize.lg,
        ),
        MPTypography(
          _score == 0
              ? 'Nothing chosen — press a star.'
              : 'You gave it ${_score.round()} out of 5.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
