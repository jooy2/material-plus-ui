import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// One axis rather than two: `size` sets the type scale *and* how wide the
/// sheet is allowed to get. `md` is MD3's own 560dp maximum.
///
/// `width` is the escape hatch for the dialog whose content decides its width,
/// the last trigger here, and it overrides whatever cap the rung implies.
const List<({MPSize size, String note})> _sizes = <({MPSize size, String note})>[
  (size: MPSize.xs, note: '320px'),
  (size: MPSize.sm, note: '400px'),
  (size: MPSize.md, note: '560px — MD3’s own maximum, and the default'),
  (size: MPSize.lg, note: '720px'),
  (size: MPSize.xl, note: '960px'),
];

class DialogSizes extends StatelessWidget {
  const DialogSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: <Widget>[
        for (final (:MPSize size, :String note) in _sizes)
          MPDialog(
            size: size,
            trigger: (BuildContext context, VoidCallback open) => MPButton(
              variant: MPVariant.outlined,
              size: MPSize.sm,
              onPressed: open,
              child: Text('size: MPSize.${size.name}'),
            ),
            title: Text('The ${size.name} rung'),
            description: Text(
              'The sheet is drawn at the ${size.name} type scale and gets no wider than $note.',
            ),
            actions: <Widget>[
              MPDialogClose(
                builder: (BuildContext context, VoidCallback close) =>
                    MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Close')),
              ),
            ],
          ),
        MPDialog(
          width: 880,
          trigger: (BuildContext context, VoidCallback open) => MPButton(
            variant: MPVariant.tonal,
            size: MPSize.sm,
            onPressed: open,
            child: const Text('width: 880'),
          ),
          title: const Text('A dialog its content sized'),
          description: const Text(
            'A hard cap in pixels, for the sheet holding a wide table — it overrides the one the '
            'rung implies.',
          ),
          actions: <Widget>[
            MPDialogClose(
              builder: (BuildContext context, VoidCallback close) =>
                  MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Close')),
            ),
          ],
        ),
      ],
    );
  }
}
