import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A taxonomy three levels deep, which is the shape a flat list flattens away:
/// "Seoul" and "Kyoto" mean different things under different parents.
const List<MPTreeSelectItem> _regions = <MPTreeSelectItem>[
  MPTreeSelectItem(
    value: 'europe',
    label: Text('Europe'),
    children: <MPTreeSelectItem>[
      MPTreeSelectItem(
        value: 'france',
        label: Text('France'),
        children: <MPTreeSelectItem>[
          MPTreeSelectItem(value: 'paris', label: Text('Paris')),
          MPTreeSelectItem(value: 'lyon', label: Text('Lyon')),
        ],
      ),
      MPTreeSelectItem(value: 'spain', label: Text('Spain')),
      MPTreeSelectItem(value: 'portugal', label: Text('Portugal')),
    ],
  ),
  MPTreeSelectItem(
    value: 'asia',
    label: Text('Asia'),
    children: <MPTreeSelectItem>[
      MPTreeSelectItem(
        value: 'korea',
        label: Text('Korea'),
        children: <MPTreeSelectItem>[
          MPTreeSelectItem(value: 'seoul', label: Text('Seoul')),
          MPTreeSelectItem(value: 'busan', label: Text('Busan')),
        ],
      ),
      MPTreeSelectItem(
        value: 'japan',
        label: Text('Japan'),
        children: <MPTreeSelectItem>[
          MPTreeSelectItem(value: 'tokyo', label: Text('Tokyo')),
          MPTreeSelectItem(value: 'kyoto', label: Text('Kyoto')),
        ],
      ),
    ],
  ),
  MPTreeSelectItem(
    value: 'americas',
    label: Text('Americas'),
    children: <MPTreeSelectItem>[
      MPTreeSelectItem(value: 'canada', label: Text('Canada')),
      MPTreeSelectItem(value: 'brazil', label: Text('Brazil'), disabled: true),
    ],
  ),
];

/// The same tree twice: one answer out of the leaves, and several out of
/// anywhere.
class TreeSelectHero extends StatefulWidget {
  const TreeSelectHero({super.key});

  @override
  State<TreeSelectHero> createState() => _TreeSelectHeroState();
}

class _TreeSelectHeroState extends State<TreeSelectHero> {
  List<Object> _one = <Object>['seoul'];
  List<Object> _many = <Object>['europe', 'tokyo'];

  @override
  Widget build(BuildContext context) {
    // A row from the medium window up, a column below it.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final bool wide = constraints.maxWidth >= 600;
        final List<Widget> pickers = <Widget>[
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: <Widget>[
              const MPTypography('searchable', level: MPTypographyLevel.caption),
              MPTreeSelect(
                label: const Text('Region'),
                items: _regions,
                searchable: true,
                clearable: true,
                fullWidth: true,
                value: _one,
                onChanged: (List<Object> next) => setState(() => _one = next),
                description: const Text(
                  'The branches are the taxonomy; the leaves are the answers.',
                ),
              ),
            ],
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: <Widget>[
              const MPTypography('multiple, selectableBranches', level: MPTypographyLevel.caption),
              MPTreeSelect(
                label: const Text('Covers'),
                items: _regions,
                multiple: true,
                selectableBranches: true,
                clearable: true,
                fullWidth: true,
                value: _many,
                onChanged: (List<Object> next) => setState(() => _many = next),
                format: (List<MPTreeSelectItem> chosen) =>
                    '${chosen.length} region${chosen.length == 1 ? '' : 's'}',
                description: const Text(
                  'A whole continent counts, so the trigger says how many rather than which.',
                ),
              ),
            ],
          ),
        ];

        if (!wide) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 24,
            children: pickers,
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 24,
          children: <Widget>[for (final Widget picker in pickers) Expanded(child: picker)],
        );
      },
    );
  }
}
