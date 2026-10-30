import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

/// A toolbar of toggles: each one is a state of the thing beside it, and the
/// set owns the value.
///
/// Off is neutral in every weight, because the axis a reader can judge in
/// isolation is hue rather than saturation: a set where off is a paler accent
/// and on is a stronger one is a set nobody can read without comparing two of
/// them.
class ToggleHero extends StatefulWidget {
  const ToggleHero({super.key});

  @override
  State<ToggleHero> createState() => _ToggleHeroState();
}

class _ToggleHeroState extends State<ToggleHero> {
  List<String> _marks = <String>['bold'];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPToggleGroup(
          multiple: true,
          value: _marks,
          onChanged: (List<String> next) => setState(() => _marks = next),
          children: const <Widget>[
            MPToggle(
              value: 'bold',
              semanticLabel: 'Bold',
              startIcon: MPIcon(icon: BoldGlyph(), size: 20),
            ),
            MPToggle(
              value: 'italic',
              semanticLabel: 'Italic',
              startIcon: MPIcon(icon: ItalicGlyph(), size: 20),
            ),
            MPToggle(
              value: 'underline',
              semanticLabel: 'Underline',
              startIcon: MPIcon(icon: UnderlineGlyph(), size: 20),
            ),
          ],
        ),
        Text(
          '${_marks.isNotEmpty ? _marks.join(', ') : 'nothing'} is on.',
          style: theme.typescale.bodyMedium.style(theme.colors.onSurfaceVariant),
        ),
      ],
    );
  }
}
