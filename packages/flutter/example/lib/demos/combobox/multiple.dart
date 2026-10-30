import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPComboboxOption> _options = <MPComboboxOption>[
  MPComboboxOption(value: 'design', label: 'design'),
  MPComboboxOption(value: 'infra', label: 'infra'),
  MPComboboxOption(value: 'docs', label: 'docs'),
  MPComboboxOption(value: 'a11y', label: 'a11y'),
];

/// The chosen values become chips inside the field and the text goes on
/// filtering after each one, so a set of tags is built without the field ever
/// closing.
class ComboboxMultiple extends StatefulWidget {
  const ComboboxMultiple({super.key});

  @override
  State<ComboboxMultiple> createState() => _ComboboxMultipleState();
}

class _ComboboxMultipleState extends State<ComboboxMultiple> {
  List<MPComboboxValue> _tags = <MPComboboxValue>['design'];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: MPCombobox.multiple(
        items: _options,
        label: const Text('Tags'),
        clearable: true,
        placeholder: 'Add a tag',
        customLabel: (String query) => Text('Create “$query”'),
        value: _tags,
        onChanged: (List<MPComboboxValue> next) => setState(() => _tags = next),
        description: const Text('Type a name that is not in the list to create it.'),
        fullWidth: true,
      ),
    );
  }
}
