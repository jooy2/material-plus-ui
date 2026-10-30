import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The five surfaces, in the order they get quieter.
///
/// An alert takes the accent onto its *own* surface rather than staying neutral,
/// which is the whole difference between it and a card: a card is a box holding
/// somebody else's content, and an alert is the message.
///
/// `tonal` is the default here rather than `filled`: a container tone separates
/// itself from the page without competing with the primary action usually
/// sitting beside it.
class AlertVariants extends StatelessWidget {
  const AlertVariants({super.key});

  static const List<(MPVariant, String)> _variants = <(MPVariant, String)>[
    (MPVariant.filled, 'the loudest — one per screen at most'),
    (MPVariant.tonal, 'the default: MD3’s answer for a message in a page'),
    (MPVariant.elevated, 'neutral, separated by a shadow instead of colour'),
    (MPVariant.outlined, 'a hairline and the accent on the glyph'),
    (MPVariant.text, 'no surface at all — for a form that is already busy'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: <Widget>[
        for (final (MPVariant variant, String note) in _variants)
          MPAlert(variant: variant, title: Text(variant.name), child: Text(note)),
      ],
    );
  }
}
