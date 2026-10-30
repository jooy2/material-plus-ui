import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Only the body scrolls; the header and the actions stay put. `dividers` is
/// what says so: the moment a body scrolls, space alone stops explaining why
/// the heading did not move with it.
class DialogScrolling extends StatelessWidget {
  const DialogScrolling({super.key});

  @override
  Widget build(BuildContext context) {
    return MPDialog(
      trigger: (BuildContext context, VoidCallback open) => MPButton(
        variant: MPVariant.outlined,
        onPressed: open,
        child: const Text('Read the terms'),
      ),
      title: const Text('Terms of service'),
      description: const Text('Last updated 10 August 2026.'),
      dividers: true,
      showClose: true,
      actions: <Widget>[
        MPDialogClose(
          builder: (BuildContext context, VoidCallback close) =>
              MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Decline')),
        ),
        MPDialogClose(
          builder: (BuildContext context, VoidCallback close) =>
              MPButton(onPressed: close, child: const Text('Accept')),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: <Widget>[
          for (int clause = 1; clause <= 12; clause += 1)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                MPTypography('Clause $clause', level: MPTypographyLevel.h6),
                const MPTypography(
                  'Nothing in this clause limits any right you already had, and nothing in it '
                  'grants one you did not.',
                ),
              ],
            ),
        ],
      ),
    );
  }
}
