import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// The five weights, said the way a control says them: a pill is the thing
/// being coloured, so `filled` takes the accent under its own ink.
///
/// Every one of them carries a shadow. A lozenge floating flat on the content
/// it is floating over reads as a mistake, so height is part of what this
/// shape is, and what `elevated` adds is the neutral surface.
class PillVariants extends StatelessWidget {
  const PillVariants({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.filled,
    MPVariant.tonal,
    MPVariant.elevated,
    MPVariant.outlined,
    MPVariant.text,
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: <Widget>[
        for (final MPVariant variant in _variants)
          MPPill(
            variant: variant,
            size: MPSize.sm,
            title: Text(variant.name),
            startIcon: const MPIcon(icon: InfoGlyph()),
          ),
      ],
    );
  }
}
