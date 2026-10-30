import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _months = <String>['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/// Three parts of one total, which is what a stack is for.
const List<MPChartSeries> _storage = <MPChartSeries>[
  MPChartSeries(name: 'Databases', data: <num>[180, 196, 214, 241, 268, 284, 311, 342]),
  MPChartSeries(name: 'Object store', data: <num>[120, 128, 141, 152, 174, 191, 205, 228]),
  MPChartSeries(name: 'Backups', data: <num>[64, 68, 71, 79, 88, 94, 103, 118]),
];

/// One quantity, read against the axis rather than as a composition.
const List<MPChartSeries> _sessions = <MPChartSeries>[
  MPChartSeries(
    name: 'Concurrent sessions',
    data: <num>[820, 910, 870, 1040, 1180, 1120, 1290, 1410],
  ),
];

class AreaChartHero extends StatelessWidget {
  const AreaChartHero({super.key});

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
              MPTypography('Storage in use', level: MPTypographyLevel.h6),
              MPAreaChart(
                label: 'Storage in use by kind, January to August',
                categories: _months,
                series: _storage,
                stacked: MPChartStack.stacked,
                curve: MPChartCurve.smooth,
                yAxis: MPChartAxis(label: 'GB'),
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
              'One series, unstacked, with the last value written on.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPAreaChart(
                label: 'Concurrent sessions, January to August',
                categories: _months,
                series: _sessions,
                valueLabels: MPChartValueLabels.last,
                size: MPSize.sm,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
