import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// A hero icon centres the header, which is MD3's own rule, and it is a real
/// distinction rather than a decoration: a dialog with an icon is *announcing*
/// something, and a dialog without one is *asking* something.
class DialogIcon extends StatelessWidget {
  const DialogIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: <Widget>[
        MPDialog(
          trigger: (BuildContext context, VoidCallback open) => MPButton(
            variant: MPVariant.outlined,
            onPressed: open,
            child: const Text('Announcing'),
          ),
          icon: const MPIcon(icon: SuccessGlyph(), size: 24),
          title: const Text('Your export is ready'),
          description: const Text(
            'We have emailed a link to the address on your account. It expires in seven days.',
          ),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Got it')),
            ),
          ],
          size: MPSize.sm,
        ),
        MPDialog(
          trigger: (BuildContext context, VoidCallback open) =>
              MPButton(variant: MPVariant.outlined, onPressed: open, child: const Text('Asking')),
          title: const Text('Leave without saving?'),
          description: const Text('Your last three changes have not been written yet.'),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Stay')),
            ),
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(color: MPColor.error, onPressed: close, child: const Text('Leave')),
            ),
          ],
          size: MPSize.sm,
        ),
      ],
    );
  }
}
