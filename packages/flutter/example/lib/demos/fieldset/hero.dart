import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A group of controls that answer one question together, with a name on it.
///
/// The legend is read before every control inside, so it has to be a phrase
/// that still reads correctly in front of each of them: "Billing address", not
/// "Where should we send it?".
class FieldsetHero extends StatefulWidget {
  const FieldsetHero({super.key});

  @override
  State<FieldsetHero> createState() => _FieldsetHeroState();
}

class _FieldsetHeroState extends State<FieldsetHero> {
  String _street = '';
  String _city = '';
  String _postcode = '';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: MPFieldset(
        legend: const Text('Billing address'),
        description: const Text('Where the invoice goes'),
        children: <Widget>[
          MPTextField(
            name: 'street',
            label: const Text('Street'),
            value: _street,
            onChanged: (String next) => setState(() => _street = next),
            fullWidth: true,
          ),
          MPTextField(
            name: 'city',
            label: const Text('City'),
            value: _city,
            onChanged: (String next) => setState(() => _city = next),
            fullWidth: true,
          ),
          MPTextField(
            name: 'postcode',
            label: const Text('Postcode'),
            value: _postcode,
            onChanged: (String next) => setState(() => _postcode = next),
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
