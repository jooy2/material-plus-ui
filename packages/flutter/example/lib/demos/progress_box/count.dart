import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `count` is the number of steps the thing being waited on actually has. The
/// leading segment fills partially, so four segments are not limited to 0, 25,
/// 50, 75 and 100.
class ProgressBoxCount extends StatelessWidget {
  const ProgressBoxCount({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 20,
      children: <Widget>[
        MPProgressBox(count: 3, value: 30, label: Text('Three steps'), showValue: true),
        MPProgressBox(count: 4, value: 30, label: Text('Four steps'), showValue: true),
        MPProgressBox(
          count: 8,
          value: 30,
          label: Text('Eight steps'),
          showValue: true,
          color: MPColor.tertiary,
        ),
      ],
    );
  }
}
