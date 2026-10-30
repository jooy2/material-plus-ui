import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class ChipVariants extends StatelessWidget {
  const ChipVariants({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.outlined,
    MPVariant.elevated,
    MPVariant.tonal,
    MPVariant.filled,
    MPVariant.text,
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 14,
      children: <Widget>[
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: <Widget>[
            for (final MPVariant variant in _variants)
              MPChip(variant: variant, child: Text(variant.name)),
          ],
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: <Widget>[
            for (final MPVariant variant in _variants)
              MPChip(variant: variant, selected: true, child: Text(variant.name)),
          ],
        ),
      ],
    );
  }
}
