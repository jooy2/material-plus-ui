import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SegmentedButtonHero extends StatefulWidget {
  const SegmentedButtonHero({super.key});

  @override
  State<SegmentedButtonHero> createState() => _SegmentedButtonHeroState();
}

class _SegmentedButtonHeroState extends State<SegmentedButtonHero> {
  static const List<MPSegment> _views = <MPSegment>[
    MPSegment(value: 'day', label: Text('Day')),
    MPSegment(value: 'week', label: Text('Week')),
    MPSegment(value: 'month', label: Text('Month')),
  ];

  List<String> _view = <String>['week'];

  @override
  Widget build(BuildContext context) {
    return MPSegmentedButton(
      items: _views,
      value: _view,
      onChanged: (List<String> next) => setState(() => _view = next),
      semanticLabel: 'Calendar view',
    );
  }
}
