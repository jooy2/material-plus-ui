import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

/// One conversation, and a field to answer it from.
class ThreadScreen extends StatefulWidget {
  /// Creates the screen.
  const ThreadScreen({required this.conversation, super.key});

  /// What is shown.
  final Conversation conversation;

  @override
  State<ThreadScreen> createState() => _ThreadScreenState();
}

class _ThreadScreenState extends State<ThreadScreen> {
  late final List<Message> _messages = List<Message>.of(widget.conversation.messages);
  final ScrollController _scroll = ScrollController();
  String _draft = '';

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final String text = _draft.trim();

    if (text.isEmpty) {
      return;
    }

    setState(() {
      _messages.add(Message(text, time: 'Now', mine: true));
      _draft = '';
    });

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.maxScrollExtent);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final Person person = widget.conversation.person;
    final EdgeInsets safe = MediaQuery.paddingOf(context);

    return PushedScreen(
      title: person.name,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Expanded(
            child: ListView(
              controller: _scroll,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              children: <Widget>[
                MPTypography(widget.conversation.subject, level: MPTypographyLevel.h6),
                const SizedBox(height: 12),
                for (final Message message in _messages)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: MPChatBubble(
                      side: message.mine ? MPChatBubbleSide.end : MPChatBubbleSide.start,
                      variant: message.mine ? MPVariant.filled : MPVariant.tonal,
                      avatar: message.mine
                          ? null
                          : MPAvatar(size: MPSize.sm, name: person.name, image: person.image),
                      time: Text(message.time),
                      status: message.mine ? MPChatBubbleStatus.delivered : null,
                      child: Text(message.text),
                    ),
                  ),
              ],
            ),
          ),
          MPDivider(),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 8, safe.bottom + 8),
            child: Row(
              spacing: 8,
              children: <Widget>[
                Expanded(
                  child: MPTextField(
                    value: _draft,
                    onChanged: (String next) => setState(() => _draft = next),
                    onSubmit: _send,
                    semanticLabel: 'Reply',
                    placeholder: 'Write a reply',
                    fullWidth: true,
                  ),
                ),
                MPIconButton(
                  label: 'Send',
                  variant: MPVariant.filled,
                  disabled: _draft.trim().isEmpty,
                  onPressed: _send,
                  icon: const Directional(child: MPIcon(icon: ChevronEndGlyph())),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
