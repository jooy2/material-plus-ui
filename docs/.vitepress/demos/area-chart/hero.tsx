import * as React from 'react';
import { MPAreaChart, MPBox, MPFlex, MPTypography } from 'material-plus-ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/** Three parts of one total, which is what a stack is for. */
const STORAGE = [
  { name: 'Databases', data: [180, 196, 214, 241, 268, 284, 311, 342] },
  { name: 'Object store', data: [120, 128, 141, 152, 174, 191, 205, 228] },
  { name: 'Backups', data: [64, 68, 71, 79, 88, 94, 103, 118] }
];

/** One quantity, read against the axis rather than as a composition. */
const SESSIONS = [
  { name: 'Concurrent sessions', data: [820, 910, 870, 1040, 1180, 1120, 1290, 1410] }
];

export default function AreaChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Storage in use</MPTypography>
        <MPAreaChart
          label="Storage in use by kind, January to August"
          categories={MONTHS}
          series={STORAGE}
          stacked
          curve="smooth"
          yAxis={{ label: 'GB' }}
        />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          One series, unstacked, with the last value written on.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPAreaChart
            label="Concurrent sessions, January to August"
            categories={MONTHS}
            series={SESSIONS}
            valueLabels="last"
            size="sm"
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
