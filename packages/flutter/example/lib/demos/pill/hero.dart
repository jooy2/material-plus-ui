import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// A lozenge holding a small amount of live information: the state a page has
/// that is not about any one control.
///
/// Press the middle to open its details. The pill grows downward into them
/// rather than swapping to another shape, and the corner moves from a stadium
/// to `extraLarge` on the way.
class PillHero extends StatefulWidget {
  const PillHero({super.key});

  @override
  State<PillHero> createState() => _PillHeroState();
}

class _PillHeroState extends State<PillHero> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: <Widget>[
        MPPill(
          title: const Text('On a call'),
          description: const Text('04:12'),
          startIcon: const MPIcon(icon: ClockGlyph()),
          endIcon: MPIconButton(
            size: MPSize.xs,
            variant: MPVariant.text,
            icon: const MPIcon(icon: CloseGlyph()),
            label: 'Hang up',
            onPressed: () {},
          ),
          expanded: _expanded,
          onPressed: () => setState(() => _expanded = !_expanded),
          details: const Text('Ada, Grace and two others. Muted for the last minute.'),
        ),
        const MPPill(
          variant: MPVariant.tonal,
          color: MPColor.primary,
          title: Text('Uploading'),
          description: Text('3 of 8'),
          startIcon: MPProgressCircular(size: MPSize.xs),
        ),
      ],
    );
  }
}
