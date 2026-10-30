import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CheckboxHero extends StatefulWidget {
  const CheckboxHero({super.key});

  @override
  State<CheckboxHero> createState() => _CheckboxHeroState();
}

class _CheckboxHeroState extends State<CheckboxHero> {
  bool _agreed = true;

  @override
  Widget build(BuildContext context) {
    return MPCheckbox(
      label: const Text('Email me about new releases'),
      description: const Text('About once a month. Unsubscribe at any time.'),
      checked: _agreed,
      onChanged: (bool next) => setState(() => _agreed = next),
    );
  }
}
