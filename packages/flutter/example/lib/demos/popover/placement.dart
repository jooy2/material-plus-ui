import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `side` and `align`, and the one thing neither of them promises.
///
/// The popup flips to the opposite edge when there is no room for it: scroll
/// the frame until one of these runs out of space and watch it move. That is
/// the right behaviour, and it is why `side` is a preference rather than an
/// instruction.
class PopoverPlacement extends StatelessWidget {
  const PopoverPlacement({super.key});

  static const List<MPSide> _sides = <MPSide>[MPSide.top, MPSide.right, MPSide.bottom, MPSide.left];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: <Widget>[
        for (final MPSide side in _sides)
          MPPopover(
            key: ValueKey<MPSide>(side),
            side: side,
            arrow: true,
            size: MPSize.xs,
            trigger: (BuildContext context, VoidCallback toggle) =>
                MPButton(variant: MPVariant.outlined, onPressed: toggle, child: Text(side.name)),
            child: Text('Anchored to the ${side.name} edge.'),
          ),
      ],
    );
  }
}
