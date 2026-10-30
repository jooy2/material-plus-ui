import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The cover is a blur rather than a hidden box, and that is the whole point: a
/// reader can see that there is something there and roughly how much of it,
/// without being able to read it by accident.
///
/// While it is covered the content is out of reach: not in the focus order,
/// not read by a screen reader, not pressable.
class SpoilerHero extends StatelessWidget {
  const SpoilerHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          MPSpoiler(
            reversible: true,
            child: MPTypography(
              'She was his sister the whole time, and the letter in the drawer was written by '
              'their mother the night before she left.',
              level: MPTypographyLevel.body,
            ),
          ),
          MPSpoiler(
            variant: MPVariant.text,
            description: Text('Salary range'),
            child: MPTypography('₩72,000,000 – ₩96,000,000', level: MPTypographyLevel.h5),
          ),
        ],
      ),
    );
  }
}
