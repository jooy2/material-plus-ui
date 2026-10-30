import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SwitchHero extends StatefulWidget {
  const SwitchHero({super.key});

  @override
  State<SwitchHero> createState() => _SwitchHeroState();
}

class _SwitchHeroState extends State<SwitchHero> {
  bool _on = true;

  @override
  Widget build(BuildContext context) {
    return MPSwitch(
      label: const Text('Wi-Fi'),
      description: const Text('Connect automatically to known networks.'),
      checked: _on,
      onChanged: (bool next) => setState(() => _on = next),
    );
  }
}
