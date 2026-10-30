import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPSelectOption> _plans = <MPSelectOption>[
  MPSelectOption(value: 'free', label: Text('Free')),
  MPSelectOption(value: 'pro', label: Text('Pro')),
  MPSelectOption(value: 'team', label: Text('Team')),
];

/// The same five rungs a text field is drawn at.
///
/// A select and a field at the same `size` line up to the pixel, which is the
/// whole reason the shell is shared: put one of each in a filter bar and the
/// row is a row rather than two controls that nearly agree.
const List<(MPSize, String)> _sizes = <(MPSize, String)>[
  (MPSize.xs, '32px'),
  (MPSize.sm, '40px'),
  (MPSize.md, '56px — the default'),
  (MPSize.lg, '64px'),
  (MPSize.xl, '72px'),
];

class SelectSizes extends StatelessWidget {
  const SelectSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          for (final (MPSize size, String note) in _sizes)
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 6,
              children: <Widget>[
                MPTypography('size: MPSize.${size.name} — $note', level: MPTypographyLevel.caption),
                MPSelect(
                  items: _plans,
                  label: const Text('Plan'),
                  size: size,
                  initialValue: 'pro',
                  fullWidth: true,
                ),
              ],
            ),
        ],
      ),
    );
  }
}
