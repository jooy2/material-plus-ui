import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Every rung is the control height of the same name, so a code sits at the
/// same height as the fields above and below it in a form.
///
/// The width is not: a slot holds one character, so it is drawn narrower than
/// it is tall, which is what makes a row of them read as places for one
/// character each rather than as a row of tiny fields.
const List<(MPSize, String)> _sizes = <(MPSize, String)>[
  (MPSize.xs, '32 tall, 28 wide'),
  (MPSize.sm, '40 tall, 36 wide'),
  (MPSize.md, '56 tall, 48 wide — the default'),
  (MPSize.lg, '64 tall, 56 wide'),
  (MPSize.xl, '72 tall, 64 wide'),
];

class OtpFieldSizes extends StatelessWidget {
  const OtpFieldSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 20,
      children: <Widget>[
        for (final (MPSize size, String note) in _sizes)
          MPOtpField(
            size: size,
            length: 4,
            initialValue: '4821',
            label: Text('size: MPSize.${size.name} — $note'),
          ),
      ],
    );
  }
}
