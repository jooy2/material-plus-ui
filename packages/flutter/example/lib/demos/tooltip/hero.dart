import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_tooltip.dart';

class TooltipHero extends StatelessWidget {
  const TooltipHero({super.key});

  @override
  Widget build(BuildContext context) {
    return MPTooltipProvider(
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: <Widget>[
          MPTooltip(
            content: const Text('Copy to clipboard'),
            child: MPButton(
              variant: MPVariant.tonal,
              size: MPSize.sm,
              semanticLabel: 'Copy',
              startIcon: const MPIcon(icon: CopyGlyph(), size: 20),
              onPressed: () {},
            ),
          ),
          MPTooltip(
            content: const Text('Search everything'),
            side: MPSide.bottom,
            child: MPButton(
              variant: MPVariant.tonal,
              size: MPSize.sm,
              semanticLabel: 'Search',
              startIcon: const MPIcon(icon: SearchGlyph(), size: 20),
              onPressed: () {},
            ),
          ),
          MPTooltip(
            content: const Text('This cannot be undone'),
            color: MPColor.error,
            side: MPSide.right,
            child: MPButton(
              variant: MPVariant.outlined,
              size: MPSize.sm,
              color: MPColor.error,
              onPressed: () {},
              child: const Text('Delete'),
            ),
          ),
        ],
      ),
    );
  }
}
