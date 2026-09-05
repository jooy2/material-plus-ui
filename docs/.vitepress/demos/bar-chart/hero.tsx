import * as React from 'react';
import { MPBarChart, MPBox, MPFlex, MPTypography } from 'material-plus-ui';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/** Two series worth comparing with each other, which is what grouping is for. */
const REVENUE = [
  { name: 'New', data: [182, 214, 241, 288] },
  { name: 'Renewal', data: [241, 268, 274, 311] }
];

/** Long names, which is the case horizontal exists for. */
const SOURCES = ['Organic search', 'Direct', 'Paid social', 'Referral', 'Email campaign'];

export default function BarChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPBox variant="outlined" padded>
        <MPTypography level="h6">Revenue by quarter</MPTypography>
        <MPBarChart
          label="Revenue by quarter, new against renewal"
          categories={QUARTERS}
          series={REVENUE}
          yAxis={{ label: 'Thousands' }}
        />
      </MPBox>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          The same two series stacked, where the total is the point rather than the parts.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPBarChart
            label="Revenue by quarter, stacked"
            categories={QUARTERS}
            series={REVENUE}
            stacked
            size="sm"
          />
        </MPBox>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          Turned sideways, which is what a set of long names wants.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPBarChart
            label="Sessions by source"
            categories={SOURCES}
            series={[{ name: 'Sessions', data: [4820, 3110, 1940, 1210, 860] }]}
            horizontal
            valueLabels="all"
            size="sm"
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
