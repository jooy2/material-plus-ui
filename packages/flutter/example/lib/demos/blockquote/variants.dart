import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class BlockquoteVariants extends StatelessWidget {
  const BlockquoteVariants({super.key});

  static const List<MPVariant> _variants = <MPVariant>[
    MPVariant.text,
    MPVariant.outlined,
    MPVariant.elevated,
    MPVariant.tonal,
    MPVariant.filled,
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          for (final MPVariant variant in _variants)
            MPBlockquote(variant: variant, size: MPSize.sm, icon: false, child: Text(variant.name)),
        ],
      ),
    );
  }
}
