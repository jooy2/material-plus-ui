import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class NumberFieldHero extends StatefulWidget {
  const NumberFieldHero({super.key});

  @override
  State<NumberFieldHero> createState() => _NumberFieldHeroState();
}

class _NumberFieldHeroState extends State<NumberFieldHero> {
  double? _quantity = 1;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 260),
      child: MPNumberField(
        label: const Text('Quantity'),
        value: _quantity,
        onChanged: (double? next) => setState(() => _quantity = next),
        min: 1,
        max: 20,
        fullWidth: true,
      ),
    );
  }
}
