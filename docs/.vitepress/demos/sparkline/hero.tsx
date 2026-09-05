import * as React from 'react';
import { MPBox, MPFlex, MPSparkline, MPStatistic, MPTypography } from 'material-plus-ui';

/** A week of something, with a dip in the middle and a gap where nothing ran. */
const WEEK = [1240, 1310, 1180, 1420, 1390, 1610, 1880];
const GAPPY = [40, 44, 39, null, null, 51, 58, 62];

export default function SparklineHero() {
  return (
    <MPFlex direction="column" gap={20}>
      <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPStatistic
            label="Weekly signups"
            value={1880}
            previousValue={1240}
            period="vs last week"
            trend={<MPSparkline data={WEEK} shape="area" curve="smooth" />}
          />
        </MPBox>

        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPStatistic
            label="Build minutes"
            value={62}
            previousValue={40}
            betterWhen="down"
            period="vs last week"
            trend={<MPSparkline data={GAPPY} shape="bar" color="tertiary" />}
          />
        </MPBox>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          The three shapes, and a gap the line refuses to draw through.
        </MPTypography>

        <MPFlex gap={24} align="center" wrap>
          <MPSparkline data={WEEK} width={140} />
          <MPSparkline data={WEEK} shape="area" curve="smooth" width={140} color="secondary" />
          <MPSparkline data={GAPPY} width={140} color="tertiary" />
        </MPFlex>
      </MPFlex>
    </MPFlex>
  );
}
