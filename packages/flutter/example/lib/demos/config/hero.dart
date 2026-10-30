import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// One provider, and every control under it moves.
///
/// Nothing in the form below names a `size` or a `color`: they are reading the
/// two the provider set. Change either and the whole form follows, which is the
/// decision this widget exists to make once instead of at every call site.
class ConfigHero extends StatefulWidget {
  const ConfigHero({super.key});

  @override
  State<ConfigHero> createState() => _ConfigHeroState();
}

class _ConfigHeroState extends State<ConfigHero> {
  MPSize _size = MPSize.md;
  MPColor _color = MPColor.primary;
  String _name = '';
  bool _on = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const MPTypography('The provider', level: MPTypographyLevel.overline),
        const SizedBox(height: 8),
        MPSegmentedButton(
          items: <MPSegment>[
            for (final MPSize size in MPSize.values)
              MPSegment(value: size.name, label: Text(size.name)),
          ],
          value: <String>[_size.name],
          onChanged: (List<String> next) {
            if (next.isNotEmpty) {
              setState(() => _size = MPSize.values.byName(next.first));
            }
          },
        ),
        const SizedBox(height: 8),
        MPSegmentedButton(
          items: <MPSegment>[
            for (final MPColor color in MPColor.values)
              MPSegment(value: color.name, label: Text(color.name)),
          ],
          value: <String>[_color.name],
          onChanged: (List<String> next) {
            if (next.isNotEmpty) {
              setState(() => _color = MPColor.values.byName(next.first));
            }
          },
        ),
        const SizedBox(height: 20),
        MPConfigProvider(
          size: _size,
          color: _color,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              MPTextField(
                label: const Text('Full name'),
                value: _name,
                onChanged: (String next) => setState(() => _name = next),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: <Widget>[
                  MPButton(onPressed: () {}, child: const Text('Save')),
                  const MPChip(child: Text('Draft')),
                  MPSwitch(
                    checked: _on,
                    onChanged: (bool next) => setState(() => _on = next),
                    label: const Text('Notify me'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
