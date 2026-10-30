import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CollapsibleHero extends StatelessWidget {
  const CollapsibleHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPCollapsible(
            title: Text('Delivery options'),
            subtitle: Text('Standard, chosen'),
            initialOpen: true,
            child: Text(
              'Standard delivery arrives in three to five working days and is included in the '
              'price. Express arrives the next working day.',
            ),
          ),
          MPCollapsible(
            title: Text('Returns'),
            child: Text('Anything unopened can go back within thirty days. We pay the postage.'),
          ),
        ],
      ),
    );
  }
}
