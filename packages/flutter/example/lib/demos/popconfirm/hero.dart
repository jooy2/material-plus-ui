import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// A row of delete buttons is the case this exists for.
///
/// A modal would cover the table and take away the row the reader was pointing
/// at, and having to find it again afterwards is how the wrong row gets
/// deleted. The question stays where the control is, and the page behind it
/// stays put.
///
/// Escape and a press outside both count as *no*.
class PopconfirmHero extends StatefulWidget {
  const PopconfirmHero({super.key});

  @override
  State<PopconfirmHero> createState() => _PopconfirmHeroState();
}

class _PopconfirmHeroState extends State<PopconfirmHero> {
  final List<String> _rows = <String>['Quarterly report', 'Design review', 'Onboarding notes'];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: <Widget>[
          if (_rows.isEmpty)
            const MPTypography('All gone.', level: MPTypographyLevel.caption)
          else
            for (final String row in _rows)
              Row(
                key: ValueKey<String>(row),
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                spacing: 12,
                children: <Widget>[
                  Flexible(child: MPTypography(row)),
                  MPPopconfirm(
                    trigger: (BuildContext context, VoidCallback toggle) => MPIconButton(
                      icon: const MPIcon(icon: TrashGlyph()),
                      label: 'Delete $row',
                      color: MPColor.error,
                      onPressed: toggle,
                    ),
                    title: const Text('Delete this row?'),
                    description: const Text('It cannot be undone.'),
                    confirmLabel: const Text('Delete'),
                    color: MPColor.error,
                    onConfirm: () => setState(() => _rows.remove(row)),
                  ),
                ],
              ),
        ],
      ),
    );
  }
}
