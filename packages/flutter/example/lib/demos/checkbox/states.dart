import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CheckboxStates extends StatefulWidget {
  const CheckboxStates({super.key});

  @override
  State<CheckboxStates> createState() => _CheckboxStatesState();
}

class _CheckboxStatesState extends State<CheckboxStates> {
  bool _agreed = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPCheckbox(
          label: const Text('I accept the terms'),
          checked: _agreed,
          onChanged: (bool next) => setState(() => _agreed = next),
          errorMessage: _agreed ? null : const Text('You have to accept these to continue.'),
          required: true,
        ),
        const MPCheckbox(
          label: Text('Read-only, and still reachable'),
          initialChecked: true,
          readOnly: true,
        ),
        const MPCheckbox(label: Text('Disabled'), initialChecked: true, disabled: true),
        const MPCheckbox(label: Text('Disabled and empty'), disabled: true),
      ],
    );
  }
}
