import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The ring, for where there is no room for a bar. The value and the label sit
/// *beside* it rather than inside: a number in the middle of the dial only
/// works at two of the five sizes.
class ProgressCircularHero extends StatefulWidget {
  const ProgressCircularHero({super.key});

  @override
  State<ProgressCircularHero> createState() => _ProgressCircularHeroState();
}

class _ProgressCircularHeroState extends State<ProgressCircularHero> {
  double _value = 35;
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 400), (_) {
      setState(() => _value = _value >= 100 ? 0 : _value + 5);
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 32,
      runSpacing: 32,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPProgressCircular(value: _value, showValue: true),
        const MPProgressCircular(label: Text('Syncing')),
      ],
    );
  }
}
