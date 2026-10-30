import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The strip of words at the top of an application, each of which opens a menu.
///
/// What makes it a bar rather than a row of separate menus is what happens once
/// one is open: crossing the strip walks through the others instead of closing
/// the one you left, and the arrow keys move between the menus as well as inside
/// them.
class MenubarHero extends StatefulWidget {
  const MenubarHero({super.key});

  @override
  State<MenubarHero> createState() => _MenubarHeroState();
}

class _MenubarHeroState extends State<MenubarHero> {
  bool _rulers = true;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.colors.surfaceContainer,
        borderRadius: BorderRadius.circular(theme.shapes.small),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: MPMenubar(
          size: MPSize.sm,
          menus: <MPMenubarMenu>[
            MPMenubarMenu(
              label: 'File',
              items: <MPMenuEntry>[
                MPMenuItem(label: 'New', shortcut: 'Mod+N', onPressed: () {}),
                MPMenuItem(label: 'Open…', shortcut: 'Mod+O', onPressed: () {}),
                const MPMenuSeparator(),
                MPMenuItem(label: 'Save', shortcut: 'Mod+S', onPressed: () {}),
              ],
            ),
            MPMenubarMenu(
              label: 'Edit',
              items: <MPMenuEntry>[
                MPMenuItem(label: 'Undo', shortcut: 'Mod+Z', onPressed: () {}),
                MPMenuItem(
                  label: 'Redo',
                  shortcut: 'Mod+Shift+Z',
                  disabled: true,
                  onPressed: () {},
                ),
              ],
            ),
            MPMenubarMenu(
              label: 'View',
              items: <MPMenuEntry>[
                MPMenuCheckboxItem(
                  label: 'Rulers',
                  checked: _rulers,
                  onChanged: (bool next) => setState(() => _rulers = next),
                ),
                MPMenuItem(label: 'Zoom in', onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
