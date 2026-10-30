import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Material's five, in the order they get quieter.
///
/// They are not five shades of one thing. Each is a different answer to "how
/// does this action separate itself from the page": `filled` paints the accent,
/// `tonal` dilutes it, `elevated` uses a shadow instead of colour, `outlined` a
/// hairline, `text` nothing at all.
class ButtonVariants extends StatelessWidget {
  const ButtonVariants({super.key});

  static const List<(MPVariant, String)> _variants = <(MPVariant, String)>[
    (MPVariant.filled, 'the one thing this screen is for'),
    (MPVariant.tonal, 'the second-most-important action'),
    (MPVariant.elevated, 'over a busy or coloured background'),
    (MPVariant.outlined, 'an alternative to the filled one'),
    (MPVariant.text, 'the least of them, a link that acts'),
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        for (final (MPVariant variant, String note) in _variants)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: <Widget>[
                MPButton(variant: variant, onPressed: () {}, child: const Text('Continue')),
                const SizedBox(width: 16),
                Flexible(
                  child: Text(
                    '${variant.name}: $note',
                    style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
