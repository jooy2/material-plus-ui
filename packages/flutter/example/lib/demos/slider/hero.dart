import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SliderHero extends StatefulWidget {
  const SliderHero({super.key});

  @override
  State<SliderHero> createState() => _SliderHeroState();
}

class _SliderHeroState extends State<SliderHero> {
  List<double> _volume = <double>[40];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: MPSlider(
        label: const Text('Volume'),
        showValue: true,
        value: _volume,
        onChanged: (List<double> next) => setState(() => _volume = next),
      ),
    );
  }
}
