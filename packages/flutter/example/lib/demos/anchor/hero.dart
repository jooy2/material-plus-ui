import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A page in a box, with its own table of contents beside it.
///
/// The box is the scroll view the list follows. It finds it on its own, from
/// the headings it points at, so nothing has to be handed over.
class AnchorHero extends StatefulWidget {
  const AnchorHero({super.key});

  @override
  State<AnchorHero> createState() => _AnchorHeroState();
}

class _AnchorHeroState extends State<AnchorHero> {
  static const List<(String, int)> _sections = <(String, int)>[
    ('Install', 0),
    ('Peer dependencies', 1),
    ('Usage', 0),
    ('Theming', 0),
    ('Colour roles', 1),
    ('Density', 1),
  ];

  final List<GlobalKey> _headings = <GlobalKey>[
    for (int index = 0; index < _sections.length; index += 1) GlobalKey(),
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 24,
      children: <Widget>[
        IntrinsicWidth(
          child: MPAnchor(
            size: MPSize.sm,
            items: <MPAnchorItem>[
              for (int index = 0; index < _sections.length; index += 1)
                MPAnchorItem(
                  target: _headings[index],
                  label: Text(_sections[index].$1),
                  depth: _sections[index].$2,
                ),
            ],
          ),
        ),
        Expanded(
          child: Container(
            height: 260,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              border: Border.all(color: theme.colors.outlineVariant),
              borderRadius: BorderRadius.circular(theme.shapes.medium),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  for (int index = 0; index < _sections.length; index += 1)
                    Padding(
                      key: _headings[index],
                      padding: const EdgeInsets.only(bottom: 120),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          MPTypography(
                            _sections[index].$1,
                            level: MPTypographyLevel.h4,
                            gutter: true,
                          ),
                          const MPTypography(
                            'Scroll the panel and the row beside it lights up. The rail is a '
                            'border on the row rather than a marker that travels between rows, '
                            'so nothing moves under a reader who is already moving.',
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
