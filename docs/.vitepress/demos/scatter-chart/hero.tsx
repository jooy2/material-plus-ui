import * as React from 'react';
import { MPBox, MPFlex, MPScatterChart, MPTypography } from 'material-plus-ui';

/** Two cohorts, so the shapes have work to do as well as the colours. */
const COHORTS = [
  {
    name: 'Free',
    data: [
      { x: 4, y: 210 },
      { x: 7, y: 240 },
      { x: 9, y: 198 },
      { x: 12, y: 286 },
      { x: 14, y: 264 },
      { x: 18, y: 331 },
      { x: 21, y: 302 },
      { x: 26, y: 378 }
    ]
  },
  {
    name: 'Paid',
    data: [
      { x: 6, y: 412 },
      { x: 10, y: 468 },
      { x: 13, y: 441 },
      { x: 17, y: 520 },
      { x: 22, y: 574 },
      { x: 28, y: 611 }
    ]
  }
];

/** A third number, carried by the area of the mark. */
const REGIONS = [
  {
    name: 'Region',
    data: [
      { x: 41, y: 62, z: 1200 },
      { x: 55, y: 71, z: 3400 },
      { x: 68, y: 58, z: 800 },
      { x: 72, y: 84, z: 5600 },
      { x: 88, y: 79, z: 2100 }
    ]
  }
];

export default function ScatterChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Sessions against days active</MPTypography>
        <MPScatterChart
          label="Sessions against days active, by cohort"
          series={COHORTS}
          xAxis={{ label: 'Days active' }}
          yAxis={{ label: 'Sessions' }}
        />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          A third number as a bubble, sized by area rather than by radius.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPScatterChart
            label="Retention against satisfaction, sized by accounts"
            series={REGIONS}
            bubble
            size="sm"
            xAxis={{ label: 'Satisfaction' }}
            yAxis={{ label: 'Retention' }}
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
