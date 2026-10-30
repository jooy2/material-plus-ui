import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_data.dart';

class ListHero extends StatefulWidget {
  const ListHero({super.key});

  @override
  State<ListHero> createState() => _ListHeroState();
}

class _ListHeroState extends State<ListHero> {
  /// The third has no picture, which is the row a real directory always has.
  static const List<(String, String, String?)> _people = <(String, String, String?)>[
    ('Anya Sol', 'Design', '/samples/people/anya-sol.webp'),
    ('Joon Mercer', 'Engineering', '/samples/people/joon-mercer.webp'),
    ('홍길동', 'Research', null),
  ];

  String _open = 'Anya Sol';
  bool _notify = true;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          MPList(
            children: <Widget>[
              for (final (String name, String role, String? src) in _people)
                MPListItem(
                  description: Text(role),
                  selected: _open == name,
                  startIcon: MPAvatar(
                    size: MPSize.xs,
                    name: name,
                    image: src == null ? null : NetworkImage(src),
                  ),
                  endIcon: const MPIcon(icon: ChevronEndGlyph(), size: 18),
                  onPressed: () => setState(() => _open = name),
                  child: Text(name),
                ),
            ],
          ),
          MPList(
            dividers: true,
            variant: MPVariant.tonal,
            size: MPSize.sm,
            children: <Widget>[
              MPListItem(
                description: const Text('Every reply, in real time'),
                action: MPSwitch(
                  size: MPSize.xs,
                  checked: _notify,
                  onChanged: (bool value) => setState(() => _notify = value),
                  semanticLabel: 'Notifications',
                ),
                child: const Text('Notifications'),
              ),
              const MPListItem(
                description: Text('Signed in on 2 devices'),
                child: Text('Security'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
