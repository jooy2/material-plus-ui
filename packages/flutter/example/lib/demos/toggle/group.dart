import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `multiple` is the difference between a toolbar and a one-of-a-set.
///
/// Off, turning one on turns the last one off, and that is worth a second
/// thought. If what is being chosen is a *value* rather than a state, the
/// component that says so properly is `MPSegmentedButton` or `MPRadioGroup`.
class ToggleGroupDemo extends StatefulWidget {
  const ToggleGroupDemo({super.key});

  @override
  State<ToggleGroupDemo> createState() => _ToggleGroupDemoState();
}

class _ToggleGroupDemoState extends State<ToggleGroupDemo> {
  List<String> _view = <String>['day'];

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPToggleGroup(
          size: MPSize.sm,
          value: _view,
          onChanged: (List<String> next) => setState(() => _view = next),
          children: const <Widget>[
            MPToggle(value: 'day', child: Text('Day')),
            MPToggle(value: 'week', child: Text('Week')),
            MPToggle(value: 'month', child: Text('Month')),
          ],
        ),
        const MPToggleGroup(
          size: MPSize.sm,
          orientation: MPOrientation.vertical,
          variant: MPVariant.text,
          multiple: true,
          children: <Widget>[
            MPToggle(value: 'grid', child: Text('Grid')),
            MPToggle(value: 'snap', child: Text('Snap')),
            MPToggle(value: 'rulers', child: Text('Rulers')),
          ],
        ),
      ],
    );
  }
}
