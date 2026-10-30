import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `inline` draws the panel in the page with no trigger at all, for a sidebar
/// or a settings pane, where the picker is the content rather than a field in
/// a form.
class ColorPickerInline extends StatefulWidget {
  const ColorPickerInline({super.key});

  @override
  State<ColorPickerInline> createState() => _ColorPickerInlineState();
}

class _ColorPickerInlineState extends State<ColorPickerInline> {
  String _color = 'rgba(0, 99, 155, 0.75)';

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        MPColorPicker(
          label: const Text('Brand'),
          inline: true,
          alpha: true,
          format: MPColorFormat.rgb,
          value: _color,
          onChanged: (String next) => setState(() => _color = next),
        ),
        MPTypography(_color, level: MPTypographyLevel.caption),
      ],
    );
  }
}
