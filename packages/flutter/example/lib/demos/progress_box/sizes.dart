import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The size of one segment, on a ladder of its own.
///
/// An indicator is not a control, so it is not on the control heights: 8, 10,
/// 12, 16 and 20px tiles, with the gap between them and the corner cut off each
/// one following the same rung.
class ProgressBoxSizes extends StatelessWidget {
  const ProgressBoxSizes({super.key});

  static const List<(MPSize, String)> _sizes = <(MPSize, String)>[
    (MPSize.xs, '8px'),
    (MPSize.sm, '10px'),
    (MPSize.md, '12px — the default'),
    (MPSize.lg, '16px'),
    (MPSize.xl, '20px'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 20,
      children: <Widget>[
        for (final (MPSize size, String note) in _sizes)
          MPProgressBox(size: size, value: 60, label: Text('${size.name} — $note')),
      ],
    );
  }
}
