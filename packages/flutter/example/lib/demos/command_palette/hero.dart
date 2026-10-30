import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_display.dart';
import 'package:material_plus_ui_example/demos/glyphs_navigation.dart';
import 'package:material_plus_ui_example/demos/glyphs_navigation_bars.dart';

/// Everything an application can do, behind one field.
///
/// `Mod+K` opens it, Command on a Mac and Control everywhere else, and the row
/// shortcuts are drawn in the same vocabulary. The palette does not bind those:
/// they are labels for bindings the application already has.
class CommandPaletteHero extends StatefulWidget {
  const CommandPaletteHero({super.key});

  @override
  State<CommandPaletteHero> createState() => _CommandPaletteHeroState();
}

class _CommandPaletteHeroState extends State<CommandPaletteHero> {
  bool _open = false;
  String? _ran;

  static const List<MPCommand> _commands = <MPCommand>[
    MPCommand(
      value: 'new',
      label: 'New document',
      group: 'File',
      shortcut: 'Mod+N',
      icon: MPIcon(icon: PlusGlyph(), size: 18),
    ),
    MPCommand(
      value: 'open',
      label: 'Open…',
      group: 'File',
      keywords: <String>['load', 'import'],
      icon: MPIcon(icon: UploadGlyph(), size: 18),
    ),
    MPCommand(
      value: 'copy',
      label: 'Copy link',
      group: 'Share',
      description: 'Anyone with the link can read',
      shortcut: 'Mod+Shift+C',
      icon: MPIcon(icon: CopyGlyph(), size: 18),
    ),
    MPCommand(
      value: 'publish',
      label: 'Publish',
      group: 'Share',
      description: 'Not while the draft is empty',
      disabled: true,
      icon: MPIcon(icon: SuccessGlyph(), size: 18),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final String? ran = _ran;

    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        MPButton(
          variant: MPVariant.outlined,
          onPressed: () => setState(() => _open = true),
          child: const Text('Open the palette'),
        ),
        const Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 6,
          children: <Widget>[
            MPTypography('Or press', level: MPTypographyLevel.caption),
            MPShortcut(keys: 'Mod+K', size: MPSize.xs),
          ],
        ),
        if (ran != null) MPTypography('Ran: $ran', level: MPTypographyLevel.caption),
        MPCommandPalette(
          items: _commands,
          open: _open,
          onOpenChange: (bool next) => setState(() => _open = next),
          onSelect: (MPCommand item) => setState(() => _ran = item.label),
        ),
      ],
    );
  }
}
