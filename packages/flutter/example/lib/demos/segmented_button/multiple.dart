import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

/// The same control, counting differently.
///
/// `multiple` is a flag rather than a second component, and the value stays a
/// list in both modes, which is why turning it on does not change anything a
/// caller has to narrow before reading.
class SegmentedButtonMultiple extends StatefulWidget {
  const SegmentedButtonMultiple({super.key});

  @override
  State<SegmentedButtonMultiple> createState() => _SegmentedButtonMultipleState();
}

class _SegmentedButtonMultipleState extends State<SegmentedButtonMultiple> {
  List<String> _days = <String>['mon', 'wed'];
  List<String> _sort = <String>['asc'];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: <Widget>[
        MPSegmentedButton(
          semanticLabel: 'Repeat on',
          multiple: true,
          value: _days,
          onChanged: (List<String> next) => setState(() => _days = next),
          items: const <MPSegment>[
            MPSegment(value: 'mon', label: Text('Mon')),
            MPSegment(value: 'tue', label: Text('Tue')),
            MPSegment(value: 'wed', label: Text('Wed')),
            MPSegment(value: 'thu', label: Text('Thu')),
            MPSegment(value: 'fri', label: Text('Fri')),
          ],
        ),
        MPSegmentedButton(
          semanticLabel: 'Sort order',
          showCheck: false,
          value: _sort,
          onChanged: (List<String> next) => setState(() => _sort = next),
          items: const <MPSegment>[
            MPSegment(
              value: 'asc',
              label: Text('Ascending'),
              icon: MPIcon(icon: ChevronUpGlyph(), size: 20),
            ),
            MPSegment(
              value: 'desc',
              label: Text('Descending'),
              icon: MPIcon(icon: ChevronDownGlyph(), size: 20),
            ),
          ],
        ),
        Text(
          'Repeating on ${_days.isEmpty ? 'nothing' : _days.join(', ')}.',
          style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
        ),
      ],
    );
  }
}
