import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_drawer.dart';

class DrawerHero extends StatelessWidget {
  const DrawerHero({super.key});

  @override
  Widget build(BuildContext context) {
    return MPDrawer(
      trigger: (BuildContext context, VoidCallback open) => MPButton(
        startIcon: const MPIcon(icon: MoreGlyph()),
        onPressed: open,
        child: const Text('Open the menu'),
      ),
      title: const Text('Material Plus'),
      description: const Text('Every component, grouped'),
      actions: <Widget>[
        MPDrawerClose(
          builder: (BuildContext context, VoidCallback close) =>
              MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Close')),
        ),
      ],
      child: MPList(
        variant: MPVariant.text,
        size: MPSize.sm,
        children: <Widget>[
          MPListItem(
            selected: true,
            startIcon: const MPIcon(icon: SearchGlyph(), size: 18),
            onPressed: () {},
            child: const Text('Overview'),
          ),
          MPListItem(
            startIcon: const MPIcon(icon: CalendarGlyph(), size: 18),
            onPressed: () {},
            child: const Text('Schedule'),
          ),
          MPListItem(
            startIcon: const MPIcon(icon: UploadGlyph(), size: 18),
            onPressed: () {},
            child: const Text('Uploads'),
          ),
        ],
      ),
    );
  }
}
