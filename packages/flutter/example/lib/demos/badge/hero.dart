import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

class BadgeHero extends StatelessWidget {
  const BadgeHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 28,
      runSpacing: 28,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPBadge(
          content: 3,
          label: '3 unread messages',
          overlap: MPBadgeOverlap.circle,
          child: MPButton(
            variant: MPVariant.text,
            semanticLabel: 'Inbox',
            onPressed: () {},
            startIcon: const MPIcon(icon: InfoGlyph(), size: 24),
          ),
        ),
        MPBadge(
          content: 128,
          label: '128 notifications',
          child: MPButton(
            variant: MPVariant.tonal,
            size: MPSize.sm,
            onPressed: () {},
            child: const Text('Notifications'),
          ),
        ),
        const MPBadge(
          dot: true,
          color: MPColor.tertiary,
          overlap: MPBadgeOverlap.circle,
          placement: MPCorner.bottomEnd,
          label: 'Online',
          child: MPAvatar(image: NetworkImage('/samples/people/sam-arden.webp'), name: 'Sam Arden'),
        ),
        const MPBadge(content: 'NEW', variant: MPVariant.tonal, color: MPColor.primary),
      ],
    );
  }
}
