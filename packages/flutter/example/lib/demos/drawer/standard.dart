import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DrawerStandard extends StatefulWidget {
  const DrawerStandard({super.key});

  @override
  State<DrawerStandard> createState() => _DrawerStandardState();
}

class _DrawerStandardState extends State<DrawerStandard> {
  bool _open = true;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: <Widget>[
          MPDrawer(
            mode: MPDrawerMode.standard,
            open: _open,
            size: MPSize.xs,
            title: const Text('Sections'),
            child: MPList(
              variant: MPVariant.text,
              size: MPSize.sm,
              children: <Widget>[
                MPListItem(selected: true, onPressed: () {}, child: const Text('Overview')),
                MPListItem(onPressed: () {}, child: const Text('Schedule')),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 12,
              children: <Widget>[
                MPButton(
                  variant: MPVariant.outlined,
                  onPressed: () => setState(() => _open = !_open),
                  child: Text(_open ? 'Collapse the sidebar' : 'Show the sidebar'),
                ),
                const MPTypography('The page is laid out around the panel rather than under it.'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
