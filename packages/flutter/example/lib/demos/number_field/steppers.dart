import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Three arrangements, and no fourth.
///
/// There is deliberately no stacked pair of half-height chevrons, the shape a
/// native number input grows. At `xs` each arrow would be under three pixels
/// tall, and a target that small is a target nobody hits.
const List<(MPNumberFieldSteppers, String)> _layouts = <(MPNumberFieldSteppers, String)>[
  (MPNumberFieldSteppers.end, 'both at the trailing edge — the default'),
  (MPNumberFieldSteppers.split, 'one either side, for a quantity that is nudged'),
  (MPNumberFieldSteppers.none, 'no buttons; the arrow keys and clamping stay'),
];

class NumberFieldSteppers extends StatefulWidget {
  const NumberFieldSteppers({super.key});

  @override
  State<NumberFieldSteppers> createState() => _NumberFieldSteppersState();
}

class _NumberFieldSteppersState extends State<NumberFieldSteppers> {
  final Map<MPNumberFieldSteppers, double?> _values = <MPNumberFieldSteppers, double?>{};

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          for (final (MPNumberFieldSteppers steppers, String note) in _layouts)
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 6,
              children: <Widget>[
                MPTypography(
                  'steppers: MPNumberFieldSteppers.${steppers.name} — $note',
                  level: MPTypographyLevel.caption,
                ),
                MPNumberField(
                  label: const Text('Quantity'),
                  steppers: steppers,
                  min: 0,
                  max: 99,
                  value: _values.containsKey(steppers) ? _values[steppers] : 1,
                  onChanged: (double? next) => setState(() => _values[steppers] = next),
                  fullWidth: true,
                ),
              ],
            ),
        ],
      ),
    );
  }
}
