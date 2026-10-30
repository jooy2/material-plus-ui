import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Five rungs, and the halo grows with the box rather than staying at 40dp.
///
/// What the ladder keeps is the *relationship* between the two: the pressable
/// area is always wider than the tick it is drawn round, which is what keeps an
/// `xs` checkbox hittable. The label moves down the body scale with it.
class CheckboxSizes extends StatelessWidget {
  const CheckboxSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        for (final MPSize size in MPSize.values)
          MPCheckbox(
            size: size,
            initialChecked: true,
            label: Text(
              size == MPSize.md ? 'size: MPSize.md, the default' : 'size: MPSize.${size.name}',
            ),
          ),
      ],
    );
  }
}
