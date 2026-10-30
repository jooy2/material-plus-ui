import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A row of segments, for work that genuinely has steps. A bar says "this much
/// is done", a quantity a reader measures; four segments say "this is step
/// three", a quantity they count, which is faster for any number small enough
/// to count.
class ProgressBoxHero extends StatefulWidget {
  const ProgressBoxHero({super.key});

  @override
  State<ProgressBoxHero> createState() => _ProgressBoxHeroState();
}

class _ProgressBoxHeroState extends State<ProgressBoxHero> {
  double _value = 25;
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 900), (_) {
      setState(() => _value = _value >= 100 ? 0 : _value + 25);
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
        MPProgressBox(label: const Text('Deploying'), value: _value, showValue: true),
        const MPProgressBox(),
      ],
    );
  }
}
