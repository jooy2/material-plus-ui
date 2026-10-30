import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_feedback.dart';

/// Four families, not a severity ladder.
///
/// There is no `success` or `warning` here, because the specification's colour
/// system has no way to derive them: offering them would promise roles the
/// theme cannot produce. What you get instead is `error`, which Material does
/// name, and an emphasis choice for everything else.
///
/// A message that means something the palette has no word for says so with a
/// glyph of its own rather than by borrowing a colour, which is what the last
/// two rows do.
class AlertColors extends StatelessWidget {
  const AlertColors({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: <Widget>[
        MPAlert(
          color: MPColor.primary,
          child: Text('A notice: the default, and the informational one.'),
        ),
        MPAlert(
          color: MPColor.error,
          child: Text('Something failed. This is the one family the specification names.'),
        ),
        MPAlert(
          color: MPColor.tertiary,
          icon: MPIcon(icon: DoneGlyph(), size: 20),
          child: Text('“It worked” — a family for emphasis, and a glyph for the meaning.'),
        ),
        MPAlert(
          color: MPColor.secondary,
          icon: MPIcon(icon: CautionGlyph(), size: 20),
          child: Text('“Proceed carefully” — the same trade, one step quieter.'),
        ),
      ],
    );
  }
}
