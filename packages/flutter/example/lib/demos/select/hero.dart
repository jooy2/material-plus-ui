import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPSelectOption> _cities = <MPSelectOption>[
  MPSelectOption(value: 'kr-11', label: Text('Seoul')),
  MPSelectOption(value: 'jp-13', label: Text('Tokyo')),
  MPSelectOption(value: 'fr-75', label: Text('Paris')),
  MPSelectOption(value: 'us-nyc', label: Text('New York')),
  MPSelectOption(value: 'br-sp', label: Text('São Paulo'), disabled: true),
];

class SelectHero extends StatefulWidget {
  const SelectHero({super.key});

  @override
  State<SelectHero> createState() => _SelectHeroState();
}

class _SelectHeroState extends State<SelectHero> {
  MPSelectValue? _city;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280),
      child: MPSelect(
        items: _cities,
        label: const Text('City'),
        placeholder: const Text('Pick one'),
        value: _city,
        onChanged: (MPSelectValue? next) => setState(() => _city = next),
        fullWidth: true,
      ),
    );
  }
}
