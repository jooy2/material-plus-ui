import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `format` decides which notation comes back out, and `swatches` puts the
/// handful of colours a product actually uses one press away. An empty list
/// draws none.
class ColorPickerFormat extends StatelessWidget {
  const ColorPickerFormat({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 20,
      children: <Widget>[
        MPColorPicker(label: Text('Hex'), initialValue: '#7c3aed', format: MPColorFormat.hex),
        MPColorPicker(
          label: Text('RGB'),
          initialValue: '#7c3aed',
          format: MPColorFormat.rgb,
          alpha: true,
        ),
        MPColorPicker(
          label: Text('Brand only'),
          initialValue: '#0f766e',
          format: MPColorFormat.hsl,
          swatches: <String>['#0f766e', '#7c3aed', '#b91c1c', '#a16207'],
          editable: false,
        ),
      ],
    );
  }
}
