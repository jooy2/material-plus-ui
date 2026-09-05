import * as React from 'react';
import { MPBox, MPFlex, MPPieChart, MPStatistic, MPTypography } from 'material-plus-ui';

const SOURCES = ['Search', 'Direct', 'Social', 'Referral', 'Email'];
const SESSIONS = [5240, 2810, 1470, 890, 610];

export default function PieChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPTypography level="h6">Sessions by source</MPTypography>
          <MPPieChart
            label="Sessions by source"
            categories={SOURCES}
            data={SESSIONS}
            valueLabels="all"
          />
        </MPBox>

        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPTypography level="h6">The same, as a ring</MPTypography>
          <MPPieChart
            label="Sessions by source, as a ring"
            categories={SOURCES}
            data={SESSIONS}
            shape="donut"
            center={
              <MPStatistic
                align="center"
                size="sm"
                label="Sessions"
                value={11020}
                compact={false}
              />
            }
          />
        </MPBox>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">Half a ring, for a tile wider than it is tall.</MPTypography>

        <MPBox variant="outlined" padded>
          <MPPieChart
            label="Storage by kind"
            categories={['Databases', 'Object store', 'Backups']}
            data={[342, 228, 118]}
            shape="semi"
            size="sm"
            center={<MPTypography level="h4">688 GB</MPTypography>}
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
