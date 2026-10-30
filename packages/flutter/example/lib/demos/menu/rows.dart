import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Every shape a row takes. A tick says "and", a dot says "instead of", the
/// same distinction `MPCheckbox` and `MPRadioGroup` make everywhere else, and
/// both kinds keep the menu open, because a list you tick is a list you tick
/// more than one of.
class MenuRows extends StatefulWidget {
  const MenuRows({super.key});

  @override
  State<MenuRows> createState() => _MenuRowsState();
}

class _MenuRowsState extends State<MenuRows> {
  bool _grid = true;
  String _density = 'comfortable';

  @override
  Widget build(BuildContext context) {
    return MPMenu(
      trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
          MPButton(variant: MPVariant.outlined, onPressed: open, child: const Text('View')),
      items: <MPMenuEntry>[
        MPMenuGroup(
          label: 'Show',
          items: <MPMenuEntry>[
            MPMenuCheckboxItem(
              label: 'Grid lines',
              checked: _grid,
              onChanged: (bool next) => setState(() => _grid = next),
            ),
            const MPMenuCheckboxItem(label: 'Rulers', initialChecked: true),
          ],
        ),
        const MPMenuSeparator(),
        MPMenuGroup(
          label: 'Density',
          items: <MPMenuEntry>[
            MPMenuRadioGroup<String>(
              value: _density,
              onChanged: (String next) => setState(() => _density = next),
              items: const <MPMenuRadioItem<String>>[
                MPMenuRadioItem<String>(value: 'comfortable', label: 'Comfortable'),
                MPMenuRadioItem<String>(value: 'compact', label: 'Compact'),
              ],
            ),
          ],
        ),
        const MPMenuSeparator(),
        MPMenuSubmenu(
          label: 'Open in',
          items: <MPMenuEntry>[
            // Where React's row is a link with `href`, a Flutter row calls the
            // app's router from `onPressed`.
            MPMenuItem(label: 'New tab', onPressed: () {}),
            MPMenuItem(
              label: 'Split view',
              description: 'Side by side with this one',
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }
}
