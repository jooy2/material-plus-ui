import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class ChipHero extends StatefulWidget {
  const ChipHero({super.key});

  @override
  State<ChipHero> createState() => _ChipHeroState();
}

class _ChipHeroState extends State<ChipHero> {
  static const List<String> _filters = <String>['Open', 'Assigned to me', 'Has failures'];

  final Set<String> _on = <String>{'Open'};
  final List<String> _tags = <String>['design', 'a11y', 'md3'];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 18,
        children: <Widget>[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              for (final String filter in _filters)
                MPChip(
                  selected: _on.contains(filter),
                  startIcon: _on.contains(filter)
                      ? const MPIcon(icon: CheckGlyph(), size: 18)
                      : null,
                  onPressed: () => setState(() {
                    if (!_on.remove(filter)) {
                      _on.add(filter);
                    }
                  }),
                  child: Text(filter),
                ),
            ],
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              for (final String tag in _tags)
                MPChip(
                  key: ValueKey<String>(tag),
                  variant: MPVariant.tonal,
                  onDelete: () => setState(() => _tags.remove(tag)),
                  child: Text(tag),
                ),
              const MPChip(
                variant: MPVariant.text,
                count: 12,
                color: MPColor.error,
                child: Text('Errors'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
