import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The effect belongs to the **set** rather than to any one item, which is what
/// walks a reader's eye down the list in the order it should be read.
///
/// `layoutBuilder` hands the items to a real `MPList`, so they stay its own
/// items and nothing about the layout changes because the list is being
/// animated.
class AnimateAppearHero extends StatefulWidget {
  const AnimateAppearHero({super.key});

  @override
  State<AnimateAppearHero> createState() => _AnimateAppearHeroState();
}

class _AnimateAppearHeroState extends State<AnimateAppearHero> {
  static const List<(String, String)> _people = <(String, String)>[
    ('Ada Lovelace', 'Engineering'),
    ('Grace Hopper', 'Engineering'),
    ('Jane Doe', 'Design'),
    ('Alan Turing', 'Research'),
  ];

  bool _play = true;

  void _replay() {
    setState(() => _play = false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _play = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 380),
          child: MPAnimateAppear(
            trigger: MPAnimateTrigger.manual,
            play: _play,
            layoutBuilder: (BuildContext context, List<Widget> children) {
              return MPList(dividers: true, children: children);
            },
            children: <Widget>[
              for (final (String name, String role) in _people)
                MPListItem(description: Text(role), child: Text(name)),
            ],
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
