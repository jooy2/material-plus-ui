import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class ChatBubbleSlots extends StatelessWidget {
  const ChatBubbleSlots({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 10,
        children: <Widget>[
          MPChatBubble(
            avatar: const MPAvatar(
              size: MPSize.sm,
              image: NetworkImage('/samples/people/theo-quinn.webp'),
              name: 'Theo Quinn',
            ),
            name: const Text('Theo'),
            time: const Text('09:12'),
            actions: MPIconButton(
              size: MPSize.xs,
              icon: const MPIcon(icon: MoreGlyph()),
              label: 'Message menu',
              onPressed: () {},
            ),
            media: const SizedBox(
              height: 120,
              child: Image(
                image: NetworkImage('/samples/photos/thumbs/rainy-city-crosswalk-reflections.webp'),
                semanticLabel: 'A city crossing in the rain, the lights running down the wet road',
                fit: BoxFit.cover,
              ),
            ),
            child: const Text('The view from the office this morning.'),
          ),
          MPChatBubble(
            side: MPChatBubbleSide.end,
            variant: MPVariant.filled,
            status: MPChatBubbleStatus.delivered,
            preview: MPChatBubblePreview(
              onPressed: () {},
              site: const Text('m3.material.io'),
              title: const Text('Cards — Material Design 3'),
              description: const Text(
                'Cards contain content and actions about a single subject, and come in three '
                'variants.',
              ),
              image: const NetworkImage(
                '/samples/illustrations/thumbs/layered-mountains-rising-sun.webp',
              ),
            ),
            child: const Text('This is the page I meant.'),
          ),
        ],
      ),
    );
  }
}
