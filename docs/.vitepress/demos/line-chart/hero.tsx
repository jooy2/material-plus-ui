import * as React from 'react';
import { MPBox, MPFlex, MPLineChart, MPTypography } from 'material-plus-ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/** Two series that cross, so the legend and the crosshair both have work to do. */
const TRAFFIC = [
  { name: 'Organic', data: [4200, 4610, 4380, 5120, 5640, 5410, 6180, 6720] },
  { name: 'Referral', data: [3100, 3450, 3980, 4260, 4110, 4880, 5240, 5910] }
];

/** A quantity that never goes near zero, and a month nothing was measured in. */
const LATENCY = [{ name: 'p95', data: [318, 324, 311, null, 296, 288, 301, 279] }];

export default function LineChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Sessions by source</MPTypography>
        <MPLineChart
          label="Sessions by source, January to August"
          categories={MONTHS}
          series={TRAFFIC}
          curve="smooth"
          yAxis={{ label: 'Sessions' }}
        />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          A gap the line refuses to draw through, with the last value written on.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPLineChart
            label="Response time at the 95th percentile"
            categories={MONTHS}
            series={LATENCY}
            valueLabels="last"
            size="sm"
            format={{ style: 'unit', unit: 'millisecond' }}
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
