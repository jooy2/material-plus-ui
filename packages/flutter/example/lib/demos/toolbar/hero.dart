import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// The same three slots as a page header and as an editor's action row.
class ToolbarHero extends StatefulWidget {
  const ToolbarHero({super.key});

  @override
  State<ToolbarHero> createState() => _ToolbarHeroState();
}

class _ToolbarHeroState extends State<ToolbarHero> {
  String _filter = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 24,
      children: <Widget>[
        MPToolbar(
          variant: MPVariant.filled,
          divider: true,
          start: const MPAppLogo(
            name: 'Voltage',
            image: NetworkImage('/samples/marks/magnet-lightning.webp'),
            size: MPSize.sm,
          ),
          end: Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 4,
            children: <Widget>[
              MPIconButton(
                variant: MPVariant.text,
                size: MPSize.sm,
                label: 'Search',
                icon: const MPIcon(icon: SearchGlyph()),
                onPressed: () {},
              ),
              MPButton(
                variant: MPVariant.filled,
                size: MPSize.sm,
                onPressed: () {},
                child: const Text('Deploy'),
              ),
            ],
          ),
          child: const MPTypography('Voltage', level: MPTypographyLevel.h6),
        ),
        MPToolbar(
          size: MPSize.sm,
          density: -1,
          end: MPButton(
            variant: MPVariant.text,
            size: MPSize.sm,
            onPressed: () {},
            child: const Text('Clear'),
          ),
          child: MPTextField(
            size: MPSize.sm,
            placeholder: 'Filter rows',
            value: _filter,
            onChanged: (String next) => setState(() => _filter = next),
            fullWidth: true,
          ),
        ),
      ],
    );
  }
}
