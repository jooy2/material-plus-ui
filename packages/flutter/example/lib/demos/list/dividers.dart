import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ListDividers extends StatelessWidget {
  const ListDividers({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          MPList(
            size: MPSize.sm,
            children: <Widget>[
              MPListItem(onPressed: () {}, child: const Text('Tiles, with space between them')),
              MPListItem(onPressed: () {}, child: const Text('Rounded, and inset from the edge')),
            ],
          ),
          MPList(
            size: MPSize.sm,
            dividers: true,
            children: <Widget>[
              MPListItem(onPressed: () {}, child: const Text('Ruled lines, edge to edge')),
              MPListItem(
                onPressed: () {},
                child: const Text('Square, because a line is not a tile'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
