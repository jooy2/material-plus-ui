import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_display.dart';

/// The three label behaviours, and what each of them costs.
///
/// Switch between them: the bar keeps its height in all three, and every
/// destination keeps its name on the semantics tree in all three. What changes
/// is only how much of the row is words.
class BottomNavigationLabels extends StatefulWidget {
  const BottomNavigationLabels({super.key});

  @override
  State<BottomNavigationLabels> createState() => _BottomNavigationLabelsState();
}

class _BottomNavigationLabelsState extends State<BottomNavigationLabels> {
  List<String> _labels = <String>['all'];
  Object _page = 'home';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPBottomNavigationLabels labels = MPBottomNavigationLabels.values.byName(
      _labels.isEmpty ? 'all' : _labels.first,
    );

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          MPSegmentedButton(
            semanticLabel: 'Label behaviour',
            value: _labels,
            onChanged: (List<String> next) => setState(() => _labels = next),
            items: const <MPSegment>[
              MPSegment(value: 'all', label: Text('all')),
              MPSegment(value: 'selected', label: Text('selected')),
              MPSegment(value: 'none', label: Text('none')),
            ],
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(theme.shapes.large),
            child: MPBottomNavigation(
              label: 'Main',
              labels: labels,
              value: _page,
              onChanged: (Object next) => setState(() => _page = next),
              children: const <Widget>[
                MPBottomNavigationItem(
                  value: 'home',
                  label: 'Home',
                  icon: MPIcon(icon: InfoGlyph()),
                ),
                MPBottomNavigationItem(
                  value: 'search',
                  label: 'Search',
                  icon: MPIcon(icon: SearchGlyph()),
                ),
                MPBottomNavigationItem(
                  value: 'saved',
                  label: 'Saved',
                  icon: MPIcon(icon: CheckGlyph()),
                ),
              ],
            ),
          ),
          const MPTypography(
            'A screen reader hears all three names whichever is chosen.',
            level: MPTypographyLevel.caption,
          ),
        ],
      ),
    );
  }
}
