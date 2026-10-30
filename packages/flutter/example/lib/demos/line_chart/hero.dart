import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _months = <String>['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/// Two series that cross, so the legend and the crosshair both have work to do.
const List<MPChartSeries> _traffic = <MPChartSeries>[
  MPChartSeries(name: 'Organic', data: <num>[4200, 4610, 4380, 5120, 5640, 5410, 6180, 6720]),
  MPChartSeries(name: 'Referral', data: <num>[3100, 3450, 3980, 4260, 4110, 4880, 5240, 5910]),
];

/// A quantity that never goes near zero, and a month nothing was measured in.
const List<MPChartSeries> _latency = <MPChartSeries>[
  MPChartSeries(name: 'p95', data: <num?>[318, 324, 311, null, 296, 288, 301, 279]),
];

String _milliseconds(double value) => '${value.round()} ms';

class LineChartHero extends StatelessWidget {
  const LineChartHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const MPBox(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPTypography('Sessions by source', level: MPTypographyLevel.h6),
              MPLineChart(
                label: 'Sessions by source, January to August',
                categories: _months,
                series: _traffic,
                curve: MPChartCurve.smooth,
                yAxis: MPChartAxis(label: 'Sessions'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'A gap the line refuses to draw through, with the last value written on.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPLineChart(
                label: 'Response time at the 95th percentile',
                categories: _months,
                series: _latency,
                valueLabels: MPChartValueLabels.last,
                size: MPSize.sm,
                format: _milliseconds,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'The same month joined instead, with the joining run drawn as the guess it is.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPLineChart(
                label: 'Response time at the 95th percentile, with the gap joined',
                categories: _months,
                series: _latency,
                gaps: MPChartGaps.connect,
                size: MPSize.sm,
                format: _milliseconds,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'A service level to keep under and a band to stay inside, neither of them data.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPLineChart(
                label: 'Response time against its service level',
                categories: _months,
                series: _latency,
                size: MPSize.sm,
                format: _milliseconds,
                yAxis: MPChartAxis(
                  references: <MPChartReference>[
                    MPChartReference(value: 350, label: 'SLO', color: MPColor.error),
                    MPChartReference(value: 280, to: 320, label: 'Target'),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            const MPTypography(
              'Ninety days, with a week of them one drag away. Drag across the plot.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPLineChart(
                label: 'Signups a day, over a quarter',
                categories: List<String>.generate(90, (int at) => 'D${at + 1}'),
                series: <MPChartSeries>[
                  MPChartSeries(
                    name: 'Signups',
                    data: List<num>.generate(
                      90,
                      (int at) => 100 + (40 * math.sin(at / 5) + at / 2).round(),
                    ),
                  ),
                ],
                zoom: const MPChartZoom(),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
