import * as React from 'react';
import { MPBox, MPFlex, MPHeatmapChart, MPTypography } from 'material-plus-ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** A working week by hour, with the quiet corners and one gap. */
const HOURS = [
  { name: '08:00', data: [12, 14, 11, 15, 9, 2, 1] },
  { name: '10:00', data: [48, 52, 46, 55, 38, 6, 3] },
  { name: '12:00', data: [61, 68, 64, 71, 52, 11, 5] },
  { name: '14:00', data: [57, 63, 59, null, 49, 9, 4] },
  { name: '16:00', data: [44, 49, 47, 51, 33, 7, 3] },
  { name: '18:00', data: [18, 21, 19, 24, 14, 4, 2] }
];

export default function HeatmapChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Requests by hour</MPTypography>
        <MPHeatmapChart
          label="Requests by hour and day of week"
          categories={DAYS}
          series={HOURS}
          height={260}
          valueLabels
        />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          The same grid with the scale pinned to a whole week&rsquo;s range, which is what makes two
          of them comparable.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPHeatmapChart
            label="Requests by hour, on a pinned scale"
            categories={DAYS}
            series={HOURS}
            min={0}
            max={200}
            size="sm"
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
