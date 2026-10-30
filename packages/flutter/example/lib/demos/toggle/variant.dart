import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The five weights, off and on.
///
/// `variant` describes the toggle while it is **off**. On is always the accent
/// asserting itself: `filled` takes the accent and its own ink, the middle
/// three light the container tone, and `text`, which has no container to
/// light, puts the accent into the ink, which is MD3's standard toggle icon
/// button exactly.
class ToggleVariant extends StatelessWidget {
  const ToggleVariant({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.text,
    MPVariant.outlined,
    MPVariant.tonal,
    MPVariant.filled,
    MPVariant.elevated,
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        for (final MPVariant variant in _variants)
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 12,
            children: <Widget>[
              MPToggle(variant: variant, size: MPSize.sm, child: const Text('Off')),
              MPToggle(
                variant: variant,
                size: MPSize.sm,
                initialPressed: true,
                child: const Text('On'),
              ),
              Text(
                variant.name,
                style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
              ),
            ],
          ),
      ],
    );
  }
}
