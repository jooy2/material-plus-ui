import * as React from 'react';
import { MPBox, MPGrid, MPStatistic } from 'material-plus-ui';

/** Four tiles, and two of them are better when they fall. */
export default function StatisticHero() {
  return (
    <MPGrid columns={{ compact: 1, medium: 2, expanded: 4 }} spacing={16}>
      <MPBox variant="outlined" padded>
        <MPStatistic
          label="Active installs"
          value={128400}
          previousValue={119200}
          period="vs last month"
        />
      </MPBox>

      <MPBox variant="outlined" padded>
        <MPStatistic
          label="Revenue"
          value={4234900}
          previousValue={4610000}
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
          compact={false}
          delta="percent"
          period="vs last month"
        />
      </MPBox>

      <MPBox variant="outlined" padded>
        <MPStatistic
          label="Median response"
          value={182}
          previousValue={247}
          unit="ms"
          betterWhen="down"
          delta="both"
          period="vs last month"
        />
      </MPBox>

      <MPBox variant="outlined" padded>
        <MPStatistic
          label="Open incidents"
          value={3}
          previousValue={3}
          betterWhen="down"
          caption="Two waiting on a release."
        />
      </MPBox>
    </MPGrid>
  );
}
