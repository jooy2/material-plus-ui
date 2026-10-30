import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class EmptyHero extends StatelessWidget {
  const EmptyHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: MPEmpty(
        variant: MPVariant.outlined,
        title: const Text('No results for “oklch”'),
        action: Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 8,
          children: <Widget>[
            MPButton(
              size: MPSize.sm,
              variant: MPVariant.tonal,
              onPressed: () {},
              child: const Text('Clear filters'),
            ),
            MPButton(
              size: MPSize.sm,
              variant: MPVariant.text,
              onPressed: () {},
              child: const Text('Search everywhere'),
            ),
          ],
        ),
        child: const Text(
          'Nothing in this repository matches that. Try a shorter term, or widen the date range.',
        ),
      ),
    );
  }
}
