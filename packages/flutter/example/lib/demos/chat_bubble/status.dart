import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ChatBubbleStatus extends StatelessWidget {
  const ChatBubbleStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 10,
        children: <Widget>[
          for (final MPChatBubbleStatus status in MPChatBubbleStatus.values)
            MPChatBubble(
              side: MPChatBubbleSide.end,
              variant: MPVariant.filled,
              status: status,
              child: Text(status.name),
            ),
        ],
      ),
    );
  }
}
