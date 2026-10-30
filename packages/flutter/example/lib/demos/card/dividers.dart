import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CardDividers extends StatelessWidget {
  const CardDividers({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: <Widget>[
          MPCard(
            title: const Text('Separated by space'),
            footer: MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Act')),
            child: const Text('The default.'),
          ),
          MPCard(
            dividers: true,
            title: const Text('Separated by rules'),
            footer: MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Act')),
            child: const Text(
              'The rules reach both edges, because the padding moved off the sheet and onto '
              'each section.',
            ),
          ),
        ],
      ),
    );
  }
}
