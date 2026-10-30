import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The two things a reader wants to know more about without leaving the sentence.
class HoverCardHero extends StatelessWidget {
  const HoverCardHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 24,
        children: <Widget>[
          MPTypography.rich(
            TextSpan(
              children: <InlineSpan>[
                const TextSpan(text: 'The change was reviewed by '),
                WidgetSpan(
                  alignment: PlaceholderAlignment.baseline,
                  baseline: TextBaseline.alphabetic,
                  child: MPHoverCard(
                    trigger: MPTextLink(
                      href: '#farah',
                      onPressed: () {},
                      child: const Text('Farah Wells'),
                    ),
                    title: const Text('Farah Wells'),
                    description: const Text('Platform team'),
                    child: const Row(
                      spacing: 12,
                      children: <Widget>[
                        MPAvatar(
                          image: NetworkImage('/samples/people/farah-wells.webp'),
                          name: 'Farah Wells',
                        ),
                        Expanded(
                          child: MPTypography(
                            'Joined 2023. Owns the deployment pipeline and the release notes '
                            'nobody reads.',
                            level: MPTypographyLevel.caption,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const TextSpan(text: ' and merged the same afternoon.'),
              ],
            ),
          ),
          const Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 12,
            children: <Widget>[
              MPHoverCard(
                trigger: MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: MPAvatar(
                    image: NetworkImage('/samples/people/victor-saye.webp'),
                    name: 'Victor Saye',
                  ),
                ),
                title: Text('Victor Saye'),
                description: Text('Design systems'),
                side: MPSide.right,
                arrow: true,
                child: Text('Three time zones away and somehow always the first to reply.'),
              ),
              MPTypography('Hover the avatar', level: MPTypographyLevel.caption),
            ],
          ),
        ],
      ),
    );
  }
}
