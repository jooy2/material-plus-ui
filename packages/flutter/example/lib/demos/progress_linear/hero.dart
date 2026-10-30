import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The bar that fills, and the only one of the three that shows *how much* is
/// left at a glance: length is the one quantity a reader compares without
/// counting.
class ProgressLinearHero extends StatefulWidget {
  const ProgressLinearHero({super.key});

  @override
  State<ProgressLinearHero> createState() => _ProgressLinearHeroState();
}

class _ProgressLinearHeroState extends State<ProgressLinearHero> {
  double _value = 12;
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 320), (_) {
      setState(() => _value = _value >= 100 ? 0 : _value + 4);
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: <Widget>[
          MPProgressLinear(label: const Text('Uploading'), value: _value, showValue: true),
          const MPProgressLinear(label: Text('Working')),
        ],
      ),
    );
  }
}
