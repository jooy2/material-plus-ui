import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';
import 'package:material_plus_ui_example/demos/glyphs_navigation.dart';
import 'package:material_plus_ui_example/demos/glyphs_navigation_bars.dart';

/// The rows are descriptions handed to the menu, and each one carries its own
/// handler: a menu's rows are code, not a list of values.
class MenuHero extends StatelessWidget {
  const MenuHero({super.key});

  @override
  Widget build(BuildContext context) {
    return MPMenu(
      trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
          MPButton(variant: MPVariant.tonal, onPressed: open, child: const Text('Actions')),
      items: <MPMenuEntry>[
        MPMenuItem(
          label: 'Copy',
          startIcon: const MPIcon(icon: CopyGlyph(), size: 20),
          shortcut: '⌘C',
          onPressed: () {},
        ),
        MPMenuItem(
          label: 'Copy link',
          startIcon: const MPIcon(icon: LinkGlyph(), size: 20),
          shortcut: '⌘L',
          onPressed: () {},
        ),
        MPMenuItem(
          label: 'Export…',
          startIcon: const MPIcon(icon: UploadGlyph(), size: 20),
          onPressed: () {},
        ),
        const MPMenuSeparator(),
        MPMenuItem(
          label: 'Delete',
          color: MPColor.error,
          startIcon: const MPIcon(icon: CloseGlyph(), size: 20),
          onPressed: () {},
        ),
      ],
    );
  }
}
