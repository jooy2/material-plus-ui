import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A row, and why it is not the default.
///
/// A column is scannable at any length. A row silently stops being readable
/// the moment one label is longer than expected, so it is worth having, and
/// worth asking for rather than getting by accident.
class RadioGroupOrientation extends StatefulWidget {
  const RadioGroupOrientation({super.key});

  @override
  State<RadioGroupOrientation> createState() => _RadioGroupOrientationState();
}

class _RadioGroupOrientationState extends State<RadioGroupOrientation> {
  String _size = 'm';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: <Widget>[
        MPRadioGroup(
          label: const Text('Size'),
          orientation: MPOrientation.horizontal,
          value: _size,
          onChanged: (String next) => setState(() => _size = next),
          children: const <Widget>[
            MPRadio(value: 's', label: Text('Small')),
            MPRadio(value: 'm', label: Text('Medium')),
            MPRadio(value: 'l', label: Text('Large')),
            MPRadio(value: 'xl', label: Text('Out of stock'), disabled: true),
          ],
        ),
        const MPRadioGroup(
          label: Text('Billing'),
          orientation: MPOrientation.horizontal,
          initialValue: 'monthly',
          errorMessage: Text('Choose one before continuing.'),
          children: <Widget>[
            MPRadio(value: 'monthly', label: Text('Monthly')),
            MPRadio(value: 'yearly', label: Text('Yearly')),
          ],
        ),
      ],
    );
  }
}
