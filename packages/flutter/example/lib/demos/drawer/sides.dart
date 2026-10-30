import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DrawerSides extends StatefulWidget {
  const DrawerSides({super.key});

  @override
  State<DrawerSides> createState() => _DrawerSidesState();
}

class _DrawerSidesState extends State<DrawerSides> {
  MPSide? _side;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: <Widget>[
        for (final MPSide edge in <MPSide>[MPSide.left, MPSide.right, MPSide.top, MPSide.bottom])
          MPButton(
            variant: MPVariant.outlined,
            onPressed: () => setState(() => _side = edge),
            child: Text(edge.name),
          ),
        MPDrawer(
          side: _side ?? MPSide.left,
          open: _side != null,
          onOpenChange: (bool next) {
            if (!next) {
              setState(() => _side = null);
            }
          },
          title: Text('Attached to the ${(_side ?? MPSide.left).name}'),
          actions: <Widget>[
            MPButton(onPressed: () => setState(() => _side = null), child: const Text('Done')),
          ],
          child: const Text(
            'A side panel takes a width; a top or bottom one is as tall as what is in it.',
          ),
        ),
      ],
    );
  }
}
