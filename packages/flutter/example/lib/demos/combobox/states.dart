import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

const List<MPComboboxOption> _cities = <MPComboboxOption>[
  MPComboboxOption(value: 'kr-11', label: 'Seoul'),
  MPComboboxOption(value: 'jp-13', label: 'Tokyo'),
  MPComboboxOption(value: 'fr-75', label: 'Paris'),
  MPComboboxOption(value: 'br-sp', label: 'São Paulo', disabled: true),
];

/// There is no `error` flag: a message is what puts the control into its
/// error state, so there is no way to draw a combobox that is visibly wrong
/// with no explanation of why. Pick a city to see the first one recover.
class ComboboxStates extends StatefulWidget {
  const ComboboxStates({super.key});

  @override
  State<ComboboxStates> createState() => _ComboboxStatesState();
}

class _ComboboxStatesState extends State<ComboboxStates> {
  MPComboboxValue? _city;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPCombobox(
            items: _cities,
            label: const Text('City'),
            value: _city,
            onChanged: (MPComboboxValue? next) => setState(() => _city = next),
            errorMessage: _city == null ? const Text('Pick a city to continue.') : null,
            allowCustom: false,
            required: true,
            fullWidth: true,
          ),
          const MPCombobox(
            items: _cities,
            label: Text('City'),
            initialValue: 'jp-13',
            startIcon: MPIcon(icon: SearchGlyph(), size: 20),
            description: Text('Type to filter the list.'),
            fullWidth: true,
          ),
          const MPCombobox(
            items: _cities,
            label: Text('City'),
            initialValue: 'fr-75',
            disabled: true,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
