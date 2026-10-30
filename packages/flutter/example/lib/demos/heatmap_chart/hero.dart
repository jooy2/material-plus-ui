import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _days = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/// A working week by hour, with the quiet corners and one gap.
const List<MPChartSeries> _hours = <MPChartSeries>[
  MPChartSeries(name: '08:00', data: <num>[12, 14, 11, 15, 9, 2, 1]),
  MPChartSeries(name: '10:00', data: <num>[48, 52, 46, 55, 38, 6, 3]),
  MPChartSeries(name: '12:00', data: <num>[61, 68, 64, 71, 52, 11, 5]),
  MPChartSeries(name: '14:00', data: <num?>[57, 63, 59, null, 49, 9, 4]),
  MPChartSeries(name: '16:00', data: <num>[44, 49, 47, 51, 33, 7, 3]),
  MPChartSeries(name: '18:00', data: <num>[18, 21, 19, 24, 14, 4, 2]),
];

class HeatmapChartHero extends StatelessWidget {
  const HeatmapChartHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        MPBox(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPTypography('Requests by hour', level: MPTypographyLevel.h6),
              MPHeatmapChart(
                label: 'Requests by hour and day of week',
                categories: _days,
                series: _hours,
                height: 260,
                valueLabels: true,
              ),
            ],
          ),
        ),
        SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'The same grid with the scale pinned to a whole week’s range, which is what makes '
              'two of them comparable.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPHeatmapChart(
                label: 'Requests by hour, on a pinned scale',
                categories: _days,
                series: _hours,
                min: 0,
                max: 200,
                size: MPSize.sm,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
