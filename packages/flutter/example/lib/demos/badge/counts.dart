import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class BadgeCounts extends StatefulWidget {
  const BadgeCounts({super.key});

  @override
  State<BadgeCounts> createState() => _BadgeCountsState();
}

class _BadgeCountsState extends State<BadgeCounts> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 20,
      runSpacing: 20,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPBadge(
          content: _count,
          label: '$_count unread',
          child: MPButton(
            variant: MPVariant.outlined,
            size: MPSize.sm,
            onPressed: () {},
            child: const Text('Inbox'),
          ),
        ),
        MPButton(
          size: MPSize.sm,
          variant: MPVariant.text,
          onPressed: () => setState(() => _count += 1),
          child: const Text('One more'),
        ),
        MPButton(
          size: MPSize.sm,
          variant: MPVariant.text,
          onPressed: () => setState(() => _count = 0),
          child: const Text('Mark all read'),
        ),
      ],
    );
  }
}
