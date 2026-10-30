import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// The button's five surfaces, on a disc.
///
/// Nothing here is a second table: the shape falls out of `MPButton` already
/// being a pill and already going square with no label, so an icon button is a
/// circle without this component deciding anything about corners.
///
/// `text` is the default, MD3's *standard* icon button, because an icon button
/// is usually one of several in a toolbar, and five filled discs in a row is a
/// row with no emphasis left in it.
class IconButtonVariants extends StatelessWidget {
  const IconButtonVariants({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.text,
    MPVariant.tonal,
    MPVariant.filled,
    MPVariant.outlined,
    MPVariant.elevated,
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            for (final MPVariant variant in _variants)
              MPIconButton(
                variant: variant,
                icon: const MPIcon(icon: PlusGlyph()),
                label: 'Add (${variant.name})',
                onPressed: () {},
              ),
          ],
        ),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            for (final MPSize size in MPSize.values)
              MPIconButton(
                size: size,
                variant: MPVariant.tonal,
                icon: const MPIcon(icon: CheckGlyph()),
                label: 'Confirm (${size.name})',
                onPressed: () {},
              ),
          ],
        ),
      ],
    );
  }
}
