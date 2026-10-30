import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// The specification's own default floating button, `tonal` on `primary`,
/// which is `primaryContainer` under `onPrimaryContainer`, beside the extended
/// one.
///
/// `floating: false` here, because a floating button in a documentation page
/// would float over the documentation. In an application it floats, and that
/// is the right default.
class FloatingActionButtonHero extends StatelessWidget {
  const FloatingActionButtonHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPFloatingActionButton(
          floating: false,
          icon: const MPIcon(icon: PlusGlyph()),
          label: 'Compose',
          onPressed: () {},
        ),
        MPFloatingActionButton(
          floating: false,
          extended: true,
          icon: const MPIcon(icon: PlusGlyph()),
          label: 'Compose',
          onPressed: () {},
        ),
        const MPTypography(
          'Both are 56dp tall — Material’s own size.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
