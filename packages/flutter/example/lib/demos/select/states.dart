import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

const List<MPSelectOption> _plans = <MPSelectOption>[
  MPSelectOption(value: 'free', label: Text('Free')),
  MPSelectOption(value: 'pro', label: Text('Pro')),
  MPSelectOption(value: 'team', label: Text('Team')),
];

/// The three things a select can be, and the one it cannot.
///
/// There is no `error` flag: a message is what puts the control into its error
/// state, so there is no way to draw a select that is visibly wrong with no
/// explanation of why. Choose a plan in the first one to see it recover.
class SelectStates extends StatefulWidget {
  const SelectStates({super.key});

  @override
  State<SelectStates> createState() => _SelectStatesState();
}

class _SelectStatesState extends State<SelectStates> {
  MPSelectValue? _plan;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPSelect(
            items: _plans,
            label: const Text('Plan'),
            placeholder: const Text('Choose a plan'),
            value: _plan,
            onChanged: (MPSelectValue? next) => setState(() => _plan = next),
            errorMessage: _plan == null ? const Text('Pick a plan to continue.') : null,
            required: true,
            fullWidth: true,
          ),
          const MPSelect(
            items: _plans,
            label: Text('Plan'),
            initialValue: 'pro',
            description: Text('You can change this at any time.'),
            startIcon: MPIcon(icon: InfoGlyph(), size: 20),
            fullWidth: true,
          ),
          const MPSelect(
            items: _plans,
            label: Text('Plan'),
            initialValue: 'team',
            disabled: true,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
