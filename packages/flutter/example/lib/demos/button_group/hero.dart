import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

class ButtonGroupHero extends StatelessWidget {
  const ButtonGroupHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 20,
      children: <Widget>[
        MPButtonGroup(
          variant: MPVariant.outlined,
          children: <Widget>[
            MPButton(
              startIcon: const MPIcon(icon: ChevronStartGlyph(), size: 20),
              onPressed: () {},
              child: const Text('Previous'),
            ),
            MPButton(
              endIcon: const MPIcon(icon: ChevronEndGlyph(), size: 20),
              onPressed: () {},
              child: const Text('Next'),
            ),
          ],
        ),
        MPButtonGroup(
          variant: MPVariant.tonal,
          size: MPSize.sm,
          children: <Widget>[
            MPButton(onPressed: () {}, child: const Text('Copy')),
            MPButton(onPressed: () {}, child: const Text('Duplicate')),
            MPButton(onPressed: () {}, child: const Text('Share')),
          ],
        ),
      ],
    );
  }
}
