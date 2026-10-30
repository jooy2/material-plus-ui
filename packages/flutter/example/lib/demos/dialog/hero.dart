import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The sections are parameters rather than sub-widgets: the arrangement of a
/// dialog is fixed, and what a caller wants to decide is what goes in each
/// slot.
///
/// `MPDialogClose` is what lets a dialog that keeps its own state have a
/// Cancel button, since there is no setter for it to call.
class DialogHero extends StatelessWidget {
  const DialogHero({super.key});

  @override
  Widget build(BuildContext context) {
    return MPDialog(
      trigger: (BuildContext context, VoidCallback open) =>
          MPButton(variant: MPVariant.tonal, onPressed: open, child: const Text('Delete project')),
      title: const Text('Delete “Aurora”?'),
      description: const Text(
        'Everything in it goes too — issues, branches and the deploy history.',
      ),
      actions: <Widget>[
        MPDialogClose(
          builder: (BuildContext context, VoidCallback close) =>
              MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
        ),
        MPDialogClose(
          builder: (BuildContext context, VoidCallback close) =>
              MPButton(color: MPColor.error, onPressed: close, child: const Text('Delete')),
        ),
      ],
    );
  }
}
