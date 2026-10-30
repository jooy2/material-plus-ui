import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Five rungs off the library's control ladder.
///
/// The first three are MD3's own extra-small, small and medium button heights;
/// `lg` and `xl` are this library's, because the specification's are 96 and 136
/// and a 96px button beside a 64px field is not a row.
class ButtonSizes extends StatelessWidget {
  const ButtonSizes({super.key});

  static const List<(MPSize, String)> _sizes = <(MPSize, String)>[
    (MPSize.xs, '32px, MD3’s extra-small'),
    (MPSize.sm, '40px, MD3’s small'),
    (MPSize.md, '56px, MD3’s medium, and the default'),
    (MPSize.lg, '64px'),
    (MPSize.xl, '72px'),
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        for (final (MPSize size, String note) in _sizes)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: <Widget>[
                MPButton(size: size, onPressed: () {}, child: const Text('Save')),
                const SizedBox(width: 16),
                Flexible(
                  child: Text(
                    'MPSize.${size.name}: $note',
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
