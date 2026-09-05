import * as React from 'react';
import { MPBox, MPFlex, MPGaugeChart, MPTypography } from 'material-plus-ui';

export default function GaugeChartHero() {
  return (
    <MPFlex direction="column" gap={24}>
      <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPGaugeChart
            value={72}
            label="CPU"
            size="sm"
            bands
            thresholds={[
              { from: 70, color: 'tertiary' },
              { from: 90, color: 'error' }
            ]}
          />
        </MPBox>

        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPGaugeChart
            value={94}
            label="Memory"
            size="sm"
            bands
            thresholds={[
              { from: 70, color: 'tertiary' },
              { from: 90, color: 'error' }
            ]}
          />
        </MPBox>

        <MPBox variant="outlined" padded style={{ flex: 1, minWidth: 0 }}>
          <MPGaugeChart value={41} label="Disk" size="sm" />
        </MPBox>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">
          A half dial, standing on its base, with the reading written its own way.
        </MPTypography>

        <MPBox variant="outlined" padded>
          <MPGaugeChart
            value={0.883}
            min={0}
            max={1}
            sweep={180}
            label="Uptime this quarter"
            format={{ style: 'percent', maximumFractionDigits: 1 }}
            thresholds={[{ from: 0.95, color: 'tertiary' }]}
          />
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
