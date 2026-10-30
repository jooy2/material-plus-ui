import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A failed step keeps its place.
///
/// `error` swaps the accent family rather than adding a fourth state: where a
/// step is in the sequence and what happened to it are two different
/// questions, and a sequence with a hole in it is one the reader cannot count.
///
/// The vertical form is the one that takes a description per step without the
/// rail becoming a row of columns.
class StepperStates extends StatelessWidget {
  const StepperStates({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 28,
      children: <Widget>[
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: 8,
          children: <Widget>[
            MPTypography('horizontal, the default', level: MPTypographyLevel.overline),
            MPStepper(
              active: 2,
              children: <Widget>[
                MPStep(label: Text('Uploaded')),
                MPStep(label: Text('Scanned'), error: true, description: Text('Two files failed')),
                MPStep(label: Text('Published'), optional: Text('Optional')),
              ],
            ),
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: 8,
          children: <Widget>[
            MPTypography('vertical', level: MPTypographyLevel.overline),
            MPStepper(
              active: 1,
              orientation: MPOrientation.vertical,
              size: MPSize.sm,
              children: <Widget>[
                MPStep(label: Text('Order placed'), description: Text('14 March, 09:12')),
                MPStep(label: Text('In transit'), description: Text('Left the depot this morning')),
                MPStep(label: Text('Delivered')),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
