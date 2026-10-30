import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class CardHero extends StatelessWidget {
  const CardHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPCard(
            variant: MPVariant.elevated,
            title: const Text('Weekly digest'),
            subtitle: const Text('Sent every Monday at 09:00'),
            headerAction: MPIconButton(
              icon: const MPIcon(icon: MoreGlyph()),
              label: 'More',
              size: MPSize.xs,
              onPressed: () {},
            ),
            footer: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Preview')),
                MPButton(onPressed: () {}, child: const Text('Send now')),
              ],
            ),
            child: const Text(
              'Forty-two people opened the last one, which is eleven more than the week before.',
            ),
          ),
          const MPCard(
            title: Text('Filters'),
            footer: MPChip(child: Text('Unread')),
            child: Text('A card is a box with sections on it. Nothing else about it is special.'),
          ),
        ],
      ),
    );
  }
}
