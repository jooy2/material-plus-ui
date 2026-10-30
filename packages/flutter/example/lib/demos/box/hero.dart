import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The plainest surface in the library: it groups things, and that is all.
///
/// Everything structural (a heading, a footer, dividers, a picture across the
/// top) belongs to Card, which is this box with those sections laid out on it.
class BoxHero extends StatelessWidget {
  const BoxHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          MPBox(
            child: MPTypography(
              'A sheet with content on it. No heading, no footer, no rule about what goes inside.',
            ),
          ),
          MPBox(
            variant: MPVariant.elevated,
            child: MPTypography(
              'The same box, separated from the page by a shadow instead of a hairline.',
            ),
          ),
        ],
      ),
    );
  }
}
