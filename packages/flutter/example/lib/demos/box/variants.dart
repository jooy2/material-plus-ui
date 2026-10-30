import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The five weights, none of which dye the sheet.
///
/// Each box holds the same link and the same button: content that arrived with
/// its own colours. That is the whole argument for a container's ladder running
/// up the *neutral* surface roles: on an accent fill every one of those would
/// need an on-accent treatment of its own.
class BoxVariants extends StatelessWidget {
  const BoxVariants({super.key});

  static const List<(MPVariant, String)> _variants = <(MPVariant, String)>[
    (MPVariant.filled, "surface-container-highest, MD3's own filled card"),
    (MPVariant.tonal, 'surface-container, one step quieter'),
    (MPVariant.elevated, 'surface-container-low under a level-1 shadow'),
    (MPVariant.outlined, 'the default: a hairline in outline-variant'),
    (MPVariant.text, 'grouping only, no surface at all'),
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          for (final (MPVariant variant, String note) in _variants)
            MPBox(
              variant: variant,
              child: Row(
                spacing: 12,
                children: <Widget>[
                  Expanded(
                    child: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: <Widget>[
                        Text('${variant.name}: $note. '),
                        MPTextLink(onPressed: () {}, child: const Text('A link')),
                      ],
                    ),
                  ),
                  MPButton(
                    size: MPSize.xs,
                    variant: MPVariant.text,
                    onPressed: () {},
                    child: const Text('Act'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
