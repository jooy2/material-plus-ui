import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// There is no `range` parameter.
///
/// Two entries in `value` are what make it a range slider, because the shape
/// of the value already says which one this is, and a flag that had to agree
/// with the value's shape would be one more thing to get wrong.
class SliderRange extends StatefulWidget {
  const SliderRange({super.key});

  @override
  State<SliderRange> createState() => _SliderRangeState();
}

class _SliderRangeState extends State<SliderRange> {
  List<double> _price = <double>[20, 80];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 28,
        children: <Widget>[
          MPSlider(
            label: const Text('Price'),
            showValue: true,
            format: (double value) => '£${value.round()}',
            value: _price,
            onChanged: (List<double> next) => setState(() => _price = next),
          ),
          const MPSlider(
            label: Text('Brightness'),
            description: Text('Applies to the preview only.'),
            color: MPColor.tertiary,
            initialValue: <double>[65],
            step: 5,
          ),
          const MPSlider(label: Text('Locked'), initialValue: <double>[30], disabled: true),
        ],
      ),
    );
  }
}
