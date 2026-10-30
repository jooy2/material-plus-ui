import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The three shapes people mean by "an alert", which are one component with
/// different slots filled: a bare line, a line with a glyph, and a glyph with a
/// headline and the detail under it.
class AlertHero extends StatelessWidget {
  const AlertHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: <Widget>[
        const MPAlert(child: Text('Your changes have been saved.')),
        MPAlert(
          color: MPColor.error,
          title: const Text('We could not charge your card'),
          action: MPButton(variant: MPVariant.text, onPressed: () {}, child: const Text('Retry')),
          onClose: () {},
          child: const Text('The bank declined the payment. Nothing has been billed.'),
        ),
      ],
    );
  }
}
