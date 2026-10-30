import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPComboboxOption> _languages = <MPComboboxOption>[
  MPComboboxOption(value: 'ts', label: 'TypeScript'),
  MPComboboxOption(value: 'js', label: 'JavaScript'),
  MPComboboxOption(value: 'rs', label: 'Rust'),
  MPComboboxOption(value: 'go', label: 'Go'),
  MPComboboxOption(value: 'py', label: 'Python'),
  MPComboboxOption(value: 'ex', label: 'Elixir'),
];

/// Type to filter, and, unless `allowCustom` is off, the typed text is offered
/// as the last row rather than committed silently when the focus leaves.
class ComboboxHero extends StatefulWidget {
  const ComboboxHero({super.key});

  @override
  State<ComboboxHero> createState() => _ComboboxHeroState();
}

class _ComboboxHeroState extends State<ComboboxHero> {
  MPComboboxValue? _value;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: MPCombobox(
        items: _languages,
        label: const Text('Language'),
        placeholder: 'Search or add',
        value: _value,
        onChanged: (MPComboboxValue? next) => setState(() => _value = next),
        fullWidth: true,
      ),
    );
  }
}
