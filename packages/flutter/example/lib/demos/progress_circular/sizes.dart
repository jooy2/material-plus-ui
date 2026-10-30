import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Every rung sits inside the control height of the same name, so a spinner
/// dropped into a button, a field or a table row never makes the row taller
/// than it was. `md` is MD3's own 48dp.
class ProgressCircularSizes extends StatelessWidget {
  const ProgressCircularSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 24,
      runSpacing: 24,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        for (final MPSize size in MPSize.values) MPProgressCircular(size: size, value: 70),
      ],
    );
  }
}
