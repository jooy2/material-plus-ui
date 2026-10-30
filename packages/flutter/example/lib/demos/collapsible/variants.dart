import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class CollapsibleVariants extends StatelessWidget {
  const CollapsibleVariants({super.key});

  static const List<(MPVariant, String)> _variants = <(MPVariant, String)>[
    (MPVariant.filled, 'surface-container-highest — the loudest a container gets'),
    (MPVariant.tonal, 'one step quieter, for a fold inside a plain page'),
    (MPVariant.elevated, 'separated by a shadow instead of a fill'),
    (MPVariant.outlined, 'the default: a hairline in outline-variant'),
    (MPVariant.text, 'no rectangle at all'),
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          for (final (MPVariant variant, String note) in _variants)
            MPCollapsible(variant: variant, title: Text(variant.name), child: Text(note)),
        ],
      ),
    );
  }
}
