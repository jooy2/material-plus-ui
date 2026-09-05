import * as React from 'react';
import { MPBox, MPFlex, MPTimelineChart, MPTypography } from 'material-plus-ui';

const day = (n: number) => new Date(2026, 2, n);

const RELEASE = [
  {
    name: 'Design',
    data: [
      { start: day(2), end: day(6), label: 'Wireframes' },
      { start: day(9), end: day(11), label: 'Review' }
    ]
  },
  { name: 'Build', data: [{ start: day(5), end: day(16), label: 'Implementation' }] },
  {
    name: 'Test',
    data: [
      { start: day(13), end: day(18), label: 'QA' },
      { start: day(20), end: day(22), label: 'Regression', color: 'tertiary' }
    ]
  },
  { name: 'Ship', data: [{ start: day(23), end: day(24), label: 'Release', color: 'error' }] }
];

/** A single day, where the axis has to step in hours instead. */
const RUN = [
  {
    name: 'checkout',
    data: [{ start: new Date(2026, 2, 2, 9, 12), end: new Date(2026, 2, 2, 11, 40) }]
  },
  {
    name: 'build',
    data: [{ start: new Date(2026, 2, 2, 11, 40), end: new Date(2026, 2, 2, 15, 5) }]
  },
  {
    name: 'deploy',
    data: [{ start: new Date(2026, 2, 2, 15, 20), end: new Date(2026, 2, 2, 16, 30) }]
  }
];

export default function TimelineChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Release plan</MPTypography>
        <MPTimelineChart label="Release plan, March" series={RELEASE} height={220} />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          One day, where the same axis steps in hours instead.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPTimelineChart label="Pipeline for one run" series={RUN} size="sm" height={160} />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
