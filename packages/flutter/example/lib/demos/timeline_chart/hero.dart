import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

DateTime _day(int n) => DateTime(2026, 3, n);

final List<MPTimelineSeries> _release = <MPTimelineSeries>[
  MPTimelineSeries(
    name: 'Design',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: _day(2), end: _day(6), label: 'Wireframes'),
      MPTimelineSpan(start: _day(9), end: _day(11), label: 'Review'),
    ],
  ),
  MPTimelineSeries(
    name: 'Build',
    data: <MPTimelineSpan>[MPTimelineSpan(start: _day(5), end: _day(16), label: 'Implementation')],
  ),
  MPTimelineSeries(
    name: 'Test',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: _day(13), end: _day(18), label: 'QA'),
      MPTimelineSpan(start: _day(20), end: _day(22), label: 'Regression', color: MPColor.tertiary),
    ],
  ),
  MPTimelineSeries(
    name: 'Ship',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: _day(23), end: _day(24), label: 'Release', color: MPColor.error),
    ],
  ),
];

/// A single day, where the axis has to step in hours instead.
final List<MPTimelineSeries> _run = <MPTimelineSeries>[
  MPTimelineSeries(
    name: 'checkout',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: DateTime(2026, 3, 2, 9, 12), end: DateTime(2026, 3, 2, 11, 40)),
    ],
  ),
  MPTimelineSeries(
    name: 'build',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: DateTime(2026, 3, 2, 11, 40), end: DateTime(2026, 3, 2, 15, 5)),
    ],
  ),
  MPTimelineSeries(
    name: 'deploy',
    data: <MPTimelineSpan>[
      MPTimelineSpan(start: DateTime(2026, 3, 2, 15, 20), end: DateTime(2026, 3, 2, 16, 30)),
    ],
  ),
];

class TimelineChartHero extends StatelessWidget {
  const TimelineChartHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        MPBox(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              const MPTypography('Release plan', level: MPTypographyLevel.h6),
              MPTimelineChart(label: 'Release plan, March', series: _release, height: 220),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            const MPTypography(
              'One day, where the same axis steps in hours instead.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPTimelineChart(
                label: 'Pipeline for one run',
                series: _run,
                size: MPSize.sm,
                height: 160,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
