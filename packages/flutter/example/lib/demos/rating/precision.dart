import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `precision` bounds what can be *chosen*, and nothing else.
///
/// The read-only row at the bottom is an average of 4.3, and it is drawn as
/// four stars and a third at every precision, because an average is not a
/// choice, and rounding it to the nearest half would be reporting a different
/// number from the one the component was handed.
class RatingPrecision extends StatefulWidget {
  const RatingPrecision({super.key});

  @override
  State<RatingPrecision> createState() => _RatingPrecisionState();
}

class _RatingPrecisionState extends State<RatingPrecision> {
  double _half = 3.5;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 20,
      children: <Widget>[
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: <Widget>[
            const MPTypography('precision: 0.5 — half stars', level: MPTypographyLevel.caption),
            MPRating(
              precision: 0.5,
              value: _half,
              onChanged: (double next) => setState(() => _half = next),
            ),
          ],
        ),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: <Widget>[
            MPTypography('readOnly — an average of 4.3', level: MPTypographyLevel.caption),
            MPRating(value: 4.3, readOnly: true),
          ],
        ),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: <Widget>[
            MPTypography(
              'color: MPColor.tertiary, if gold is what you want',
              level: MPTypographyLevel.caption,
            ),
            MPRating(value: 4, readOnly: true, color: MPColor.tertiary),
          ],
        ),
      ],
    );
  }
}
