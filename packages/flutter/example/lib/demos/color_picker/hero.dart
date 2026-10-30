import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A saturation square with a hue rail beside it: the arrangement that puts
/// every colour of a hue within one movement of the pointer.
class ColorPickerHero extends StatefulWidget {
  const ColorPickerHero({super.key});

  @override
  State<ColorPickerHero> createState() => _ColorPickerHeroState();
}

class _ColorPickerHeroState extends State<ColorPickerHero> {
  String _color = '#00639b';

  /// The colour as a box can paint it, or nothing for no colour at all.
  Color get _paint {
    final String hex = _color.replaceFirst('#', '');

    if (hex.length != 6 && hex.length != 8) {
      return const Color(0x00000000);
    }

    final int value = int.parse(
      hex.length == 6 ? 'ff$hex' : hex.substring(6) + hex.substring(0, 6),
      radix: 16,
    );

    return Color(value);
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPColorPicker(
          label: const Text('Tag colour'),
          value: _color,
          onChanged: (String next) => setState(() => _color = next),
          clearable: true,
        ),
        ExcludeSemantics(
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: _paint,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: MPTheme.of(context).colors.outlineVariant),
            ),
          ),
        ),
      ],
    );
  }
}
