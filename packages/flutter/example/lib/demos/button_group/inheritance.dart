import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The half of a group that is not visual.
///
/// `variant`, `size`, `color` and `disabled` are set once for the set. A
/// button's own parameter still wins, because a row of secondary actions with
/// one destructive button in it is a real thing, and that is exactly what the
/// third button here is.
class ButtonGroupInheritance extends StatelessWidget {
  const ButtonGroupInheritance({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 20,
      children: <Widget>[
        MPButtonGroup(
          variant: MPVariant.outlined,
          size: MPSize.sm,
          children: <Widget>[
            MPButton(onPressed: () {}, child: const Text('Approve')),
            MPButton(onPressed: () {}, child: const Text('Defer')),
            MPButton(color: MPColor.error, onPressed: () {}, child: const Text('Reject')),
          ],
        ),
        MPButtonGroup(
          orientation: MPOrientation.vertical,
          variant: MPVariant.tonal,
          size: MPSize.sm,
          children: <Widget>[
            MPButton(onPressed: () {}, child: const Text('Top')),
            MPButton(onPressed: () {}, child: const Text('Middle')),
            MPButton(onPressed: () {}, child: const Text('Bottom')),
          ],
        ),
      ],
    );
  }
}
