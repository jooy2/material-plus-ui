import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TooltipSides extends StatelessWidget {
  const TooltipSides({super.key});

  @override
  Widget build(BuildContext context) {
    return MPTooltipProvider(
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        alignment: WrapAlignment.center,
        children: <Widget>[
          for (final MPSide side in <MPSide>[MPSide.top, MPSide.right, MPSide.bottom, MPSide.left])
            MPTooltip(
              content: Text('Opens on the ${side.name}'),
              side: side,
              child: MPButton(
                variant: MPVariant.outlined,
                size: MPSize.sm,
                onPressed: () {},
                child: Text(side.name),
              ),
            ),
        ],
      ),
    );
  }
}
