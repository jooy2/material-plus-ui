import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _quarters = <String>['Q1', 'Q2', 'Q3', 'Q4'];

/// Two series worth comparing with each other, which is what grouping is for.
const List<MPChartSeries> _revenue = <MPChartSeries>[
  MPChartSeries(name: 'New', data: <num>[182, 214, 241, 288]),
  MPChartSeries(name: 'Renewal', data: <num>[241, 268, 274, 311]),
];

/// Long names, which is the case `horizontal` exists for.
const List<String> _sources = <String>[
  'Organic search',
  'Direct',
  'Paid social',
  'Referral',
  'Email campaign',
];

const List<MPChartSeries> _sessions = <MPChartSeries>[
  MPChartSeries(name: 'Sessions', data: <num>[4820, 3110, 1940, 1210, 860]),
];

class BarChartHero extends StatelessWidget {
  const BarChartHero({super.key});

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
              MPTypography('Revenue by quarter', level: MPTypographyLevel.h6),
              MPBarChart(
                label: 'Revenue by quarter, new against renewal',
                categories: _quarters,
                series: _revenue,
                yAxis: MPChartAxis(label: 'Thousands'),
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
              'The same two series stacked, where the total is the point rather than the parts.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPBarChart(
                label: 'Revenue by quarter, stacked',
                categories: _quarters,
                series: _revenue,
                stacked: MPChartStack.stacked,
                size: MPSize.sm,
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'And normalised, where the mix is the point and the totals are not.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPBarChart(
                label: 'Revenue by quarter, as a mix',
                categories: _quarters,
                series: _revenue,
                stacked: MPChartStack.percent,
                size: MPSize.sm,
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'The same five names upright, turned rather than cut to the width of one bar.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPBarChart(
                label: 'Sessions by source, upright',
                categories: _sources,
                series: _sessions,
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'Turned sideways, which is what a set of long names wants.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPBarChart(
                label: 'Sessions by source',
                categories: _sources,
                series: _sessions,
                horizontal: true,
                valueLabels: MPChartValueLabels.all,
                size: MPSize.sm,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
