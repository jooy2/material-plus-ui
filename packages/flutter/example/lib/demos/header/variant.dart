import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The container ladder, said the way a bar says it.
///
/// `tonal`, the default, is MD3's scrolled top app bar: `surface-container`
/// against the page's `surface`. `outlined` is the flat one, which is the
/// page's own surface with a hairline where it ends, and it is the only weight
/// that draws a rule at all. There is no `divider` parameter, because that rule
/// is what `outlined` means here.
class HeaderVariant extends StatelessWidget {
  const HeaderVariant({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.text,
    MPVariant.outlined,
    MPVariant.tonal,
    MPVariant.filled,
    MPVariant.elevated,
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          for (final MPVariant variant in _variants)
            MPHeader(size: MPSize.sm, variant: variant, brand: <Widget>[Text(variant.name)]),
        ],
      ),
    );
  }
}
