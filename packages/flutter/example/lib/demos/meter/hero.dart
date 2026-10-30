import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Three readings, each with bands in its own units, which is the thing to
/// notice: `from` is a value on the meter's own scale, not a percentage.
class MeterHero extends StatelessWidget {
  const MeterHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPMeter(
            value: 2.1,
            max: 5,
            label: const Text('Storage used'),
            showValue: true,
            formatValue: (double value) => '${value.toStringAsFixed(1)} GB',
            thresholds: const <MPThreshold>[
              MPThreshold(from: 3, color: MPColor.tertiary),
              MPThreshold(from: 4.5, color: MPColor.error),
            ],
          ),
          MPMeter(
            value: 41,
            max: 60,
            label: const Text('Seats taken'),
            showValue: true,
            formatValue: (double value) => value.round().toString(),
            thresholds: const <MPThreshold>[
              MPThreshold(from: 36, color: MPColor.tertiary),
              MPThreshold(from: 54, color: MPColor.error),
            ],
          ),
          const MPMeter(
            value: 94,
            label: Text('Quota spent'),
            showValue: true,
            thresholds: <MPThreshold>[
              MPThreshold(from: 60, color: MPColor.tertiary),
              MPThreshold(from: 85, color: MPColor.error),
            ],
          ),
        ],
      ),
    );
  }
}
