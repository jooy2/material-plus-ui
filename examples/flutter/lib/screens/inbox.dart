import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_showcase/screens/thread.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';

const List<MPSegment> _boxes = <MPSegment>[
  MPSegment(value: 'all', label: Text('All')),
  MPSegment(value: 'unread', label: Text('Unread')),
];

/// The conversations, a search over them, and the way into each one.
class InboxScreen extends StatefulWidget {
  /// Creates the screen.
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  String _query = '';
  String _box = 'all';

  bool _matches(Conversation one) {
    final String query = _query.trim().toLowerCase();

    if (_box == 'unread' && one.unread == 0) {
      return false;
    }

    return query.isEmpty ||
        one.person.name.toLowerCase().contains(query) ||
        one.subject.toLowerCase().contains(query) ||
        one.preview.toLowerCase().contains(query);
  }

  @override
  Widget build(BuildContext context) {
    final List<Conversation> found = conversations.where(_matches).toList();

    return ScreenScroll(
      title: 'Inbox',
      subtitle: '${conversations.length} conversations',
      children: <Widget>[
        MPTextField(
          type: MPTextFieldType.search,
          value: _query,
          onChanged: (String next) => setState(() => _query = next),
          label: const Text('Search'),
          placeholder: 'Name, subject or message',
          startIcon: const MPIcon(icon: SearchGlyph()),
          fullWidth: true,
        ),
        MPSegmentedButton(
          items: _boxes,
          value: <String>[_box],
          semanticLabel: 'Which conversations',
          onChanged: (List<String> next) => setState(() => _box = next.first),
        ),
        if (found.isEmpty)
          MPEmpty(
            variant: MPVariant.outlined,
            title: const Text('Nothing found'),
            action: MPButton(
              variant: MPVariant.tonal,
              size: MPSize.sm,
              onPressed: () => setState(() {
                _query = '';
                _box = 'all';
              }),
              child: const Text('Clear the search'),
            ),
          )
        else
          MPList(
            dividers: true,
            children: <Widget>[
              for (final Conversation one in found)
                MPListItem(
                  startIcon: MPAvatar(name: one.person.name, image: one.person.image),
                  description: Text(one.subject, maxLines: 1, overflow: TextOverflow.ellipsis),
                  endIcon: one.unread == 0
                      ? Text(one.time)
                      : MPBadge(content: one.unread, label: '${one.unread} unread'),
                  onPressed: () => pushScreen(context, ThreadScreen(conversation: one)),
                  child: Text(one.person.name),
                ),
            ],
          ),
      ],
    );
  }
}
