import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class EmptySlots extends StatelessWidget {
  const EmptySlots({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          const MPEmpty(variant: MPVariant.outlined),

          const MPEmpty(
            variant: MPVariant.outlined,
            showIcon: false,
            size: MPSize.sm,
            title: Text('Inbox zero'),
            child: Text('Nobody has written to you.'),
          ),

          // A character takes the glyph's size from the state, as an icon does.
          MPEmpty(
            variant: MPVariant.outlined,
            icon: Builder(
              builder: (BuildContext context) {
                return Text('🗂', style: TextStyle(fontSize: IconTheme.of(context).size));
              },
            ),
            showTitle: false,
            child: const Text('This folder is empty.'),
          ),

          // A picture comes through at whatever size it is given.
          MPEmpty(
            variant: MPVariant.outlined,
            title: const Text('Nothing filed yet'),
            icon: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: const Image(
                image: NetworkImage('/samples/illustrations/thumbs/fox-reading-under-tree.webp'),
                width: 132,
                height: 132,
                fit: BoxFit.cover,
                excludeFromSemantics: true,
              ),
            ),
            child: const Text('The first thing you file shows up here.'),
          ),
        ],
      ),
    );
  }
}
