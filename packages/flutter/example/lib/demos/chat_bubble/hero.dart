import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ChatBubbleHero extends StatelessWidget {
  const ChatBubbleHero({super.key});

  /// One picture, shared by the two rows the same person sent.
  static const Widget _nadia = MPAvatar(
    size: MPSize.sm,
    image: NetworkImage('/samples/people/nadia-rowan.webp'),
    name: 'Nadia Rowan',
  );

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 10,
        children: <Widget>[
          MPChatBubble(
            avatar: _nadia,
            name: Text('Nadia'),
            time: Text('18:01'),
            child: Text('Are we still on for six?'),
          ),
          MPChatBubble(
            side: MPChatBubbleSide.end,
            variant: MPVariant.filled,
            time: Text('18:02'),
            status: MPChatBubbleStatus.read,
            child: Text('Yes — I booked the corner table.'),
          ),
          MPChatBubble(avatar: _nadia, typing: true),
        ],
      ),
    );
  }
}
