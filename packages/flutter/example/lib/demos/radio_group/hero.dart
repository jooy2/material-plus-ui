import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class RadioGroupHero extends StatefulWidget {
  const RadioGroupHero({super.key});

  @override
  State<RadioGroupHero> createState() => _RadioGroupHeroState();
}

class _RadioGroupHeroState extends State<RadioGroupHero> {
  String _delivery = 'standard';

  @override
  Widget build(BuildContext context) {
    return MPRadioGroup(
      label: const Text('Delivery'),
      value: _delivery,
      onChanged: (String next) => setState(() => _delivery = next),
      children: const <Widget>[
        MPRadio(
          value: 'standard',
          label: Text('Standard'),
          description: Text('Arrives in 3–5 days. Free.'),
        ),
        MPRadio(value: 'express', label: Text('Express'), description: Text('Next day, £4.99.')),
        MPRadio(
          value: 'pickup',
          label: Text('Collect in store'),
          description: Text('Ready in an hour.'),
        ),
      ],
    );
  }
}
