import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_data.dart';

class TreeViewHero extends StatefulWidget {
  const TreeViewHero({super.key});

  @override
  State<TreeViewHero> createState() => _TreeViewHeroState();
}

class _TreeViewHeroState extends State<TreeViewHero> {
  List<Object> _selected = <Object>['button'];

  static const Widget _folder = MPIcon(icon: ChevronEndGlyph(), size: 16);

  @override
  Widget build(BuildContext context) {
    final List<Widget> trees = <Widget>[
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: <Widget>[
          const MPTypography('lines="folder"', level: MPTypographyLevel.caption),
          MPTreeView(
            label: 'Files',
            lines: MPTreeViewLines.folder,
            initialExpanded: const <Object>['src', 'components'],
            selected: _selected,
            onSelectedChange: (List<Object> selected) => setState(() => _selected = selected),
            children: const <MPTreeItem>[
              MPTreeItem(
                value: 'src',
                label: Text('src'),
                children: <MPTreeItem>[
                  MPTreeItem(
                    value: 'components',
                    label: Text('components'),
                    children: <MPTreeItem>[
                      MPTreeItem(value: 'button', label: Text('Button.tsx')),
                      MPTreeItem(value: 'card', label: Text('Card.tsx')),
                    ],
                  ),
                  MPTreeItem(value: 'index', label: Text('index.ts')),
                ],
              ),
              MPTreeItem(
                value: 'docs',
                label: Text('docs'),
                children: <MPTreeItem>[MPTreeItem(value: 'guide', label: Text('guide.md'))],
              ),
              MPTreeItem(value: 'readme', label: Text('README.md')),
            ],
          ),
        ],
      ),
      const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: <Widget>[
          MPTypography('lines="none", variant="text"', level: MPTypographyLevel.caption),
          MPTreeView(
            label: 'Sections',
            lines: MPTreeViewLines.none,
            variant: MPVariant.text,
            initialExpanded: <Object>['design'],
            children: <MPTreeItem>[
              MPTreeItem(value: 'guide', label: Text('Guide'), startIcon: _folder),
              MPTreeItem(
                value: 'design',
                label: Text('Design'),
                startIcon: _folder,
                children: <MPTreeItem>[
                  MPTreeItem(value: 'colour', label: Text('Colour')),
                  MPTreeItem(value: 'motion', label: Text('Motion')),
                ],
              ),
              MPTreeItem(
                value: 'components',
                label: Text('Components'),
                startIcon: _folder,
                expandable: true,
              ),
            ],
          ),
        ],
      ),
    ];

    // A column on a compact window and a row from medium up, as the React
    // demo's `direction={{ compact: 'column', medium: 'row' }}`.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        if (constraints.maxWidth < 600) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            spacing: 24,
            children: trees,
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 24,
          children: <Widget>[for (final Widget tree in trees) Expanded(child: tree)],
        );
      },
    );
  }
}
