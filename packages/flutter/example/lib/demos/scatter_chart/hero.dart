import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Two cohorts, so the shapes have work to do as well as the colours.
const List<MPChartSeries> _cohorts = <MPChartSeries>[
  MPChartSeries(
    name: 'Free',
    data: <MPChartDatum>[
      MPChartPoint(x: 4, y: 210),
      MPChartPoint(x: 7, y: 240),
      MPChartPoint(x: 9, y: 198),
      MPChartPoint(x: 12, y: 286),
      MPChartPoint(x: 14, y: 264),
      MPChartPoint(x: 18, y: 331),
      MPChartPoint(x: 21, y: 302),
      MPChartPoint(x: 26, y: 378),
    ],
  ),
  MPChartSeries(
    name: 'Paid',
    data: <MPChartDatum>[
      MPChartPoint(x: 6, y: 412),
      MPChartPoint(x: 10, y: 468),
      MPChartPoint(x: 13, y: 441),
      MPChartPoint(x: 17, y: 520),
      MPChartPoint(x: 22, y: 574),
      MPChartPoint(x: 28, y: 611),
    ],
  ),
];

/// A third number, carried by the area of the mark.
const List<MPChartSeries> _regions = <MPChartSeries>[
  MPChartSeries(
    name: 'Region',
    data: <MPChartDatum>[
      MPChartPoint(x: 41, y: 62, z: 1200),
      MPChartPoint(x: 55, y: 71, z: 3400),
      MPChartPoint(x: 68, y: 58, z: 800),
      MPChartPoint(x: 72, y: 84, z: 5600),
      MPChartPoint(x: 88, y: 79, z: 2100),
    ],
  ),
];

class ScatterChartHero extends StatelessWidget {
  const ScatterChartHero({super.key});

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
              MPTypography('Sessions against days active', level: MPTypographyLevel.h6),
              MPScatterChart(
                label: 'Sessions against days active, by cohort',
                series: _cohorts,
                xAxis: MPChartAxis(label: 'Days active'),
                yAxis: MPChartAxis(label: 'Sessions'),
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
              'A third number as a bubble, sized by area rather than by radius.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPScatterChart(
                label: 'Retention against satisfaction, sized by accounts',
                series: _regions,
                bubble: true,
                size: MPSize.sm,
                xAxis: MPChartAxis(label: 'Satisfaction'),
                yAxis: MPChartAxis(label: 'Retention'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
