import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class ButtonHero extends StatelessWidget {
  const ButtonHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPButton(
          startIcon: const MPIcon(icon: CheckGlyph(), size: 20),
          onPressed: () {},
          child: const Text('Save'),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: () {}, child: const Text('Preview')),
        MPButton(variant: MPVariant.outlined, onPressed: () {}, child: const Text('Cancel')),
        MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Learn more')),
      ],
    );
  }
}
