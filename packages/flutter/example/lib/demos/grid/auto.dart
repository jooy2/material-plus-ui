import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_layout.dart';

/// A player's control bar, which is the layout `MPGridSpan.auto` is for.
///
/// How many buttons are on the end is a runtime question (a fullscreen button
/// only where fullscreen is possible, a debug button only for staff), so the
/// group cannot name a share of twelve columns. It names `auto` and is the
/// width of whatever it turned out to hold; the transport controls take the
/// rest with `grow`. Add and remove buttons below and neither side is ever
/// wrong.
class GridAuto extends StatefulWidget {
  const GridAuto({super.key});

  @override
  State<GridAuto> createState() => _GridAutoState();
}

class _GridAutoState extends State<GridAuto> {
  static const List<(Widget, String)> _tools = <(Widget, String)>[
    (MoreGlyph(), 'Settings'),
    (PlusGlyph(), 'Fullscreen'),
    (CodeGlyph(), 'Captions'),
    (InfoGlyph(), 'Debug'),
  ];

  int _shown = 2;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: <Widget>[
          MPBox(
            child: MPGrid(
              spacing: const MPResponsive<double>(2),
              alignItems: MPGridAlign.center,
              children: <Widget>[
                const MPGridItem(
                  span: MPResponsive<MPGridSpan>(MPGridSpan.grow),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      MPTypography('A Duck Has an Adventure'),
                      MPTypography('0:42 / 3:15', level: MPTypographyLevel.caption),
                    ],
                  ),
                ),
                MPGridItem(
                  span: const MPResponsive<MPGridSpan>(MPGridSpan.auto),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    spacing: 4,
                    children: <Widget>[
                      for (final (Widget icon, String label) in _tools.take(_shown))
                        MPIconButton(
                          key: ValueKey<String>(label),
                          icon: MPIcon(icon: icon),
                          label: label,
                          size: MPSize.sm,
                          onPressed: () {},
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Row(
            spacing: 8,
            children: <Widget>[
              MPButton(
                variant: MPVariant.outlined,
                size: MPSize.sm,
                disabled: _shown == 1,
                onPressed: () => setState(() => _shown -= 1),
                child: const Text('One fewer'),
              ),
              MPButton(
                variant: MPVariant.outlined,
                size: MPSize.sm,
                disabled: _shown == _tools.length,
                onPressed: () => setState(() => _shown += 1),
                child: const Text('One more'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
