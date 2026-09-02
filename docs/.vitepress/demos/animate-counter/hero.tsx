import { useState } from 'react';
import { MPAnimateCounter, MPBox, MPButton, MPTypography } from 'material-plus-ui';

/**
 * Three tiles, which is what a counter is nearly always for — and three
 * formats, because the pieces of a number are not in the same order everywhere
 * and `Intl` is the only thing that knows.
 */
export default function AnimateCounterHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <MPBox size="sm">
          <MPTypography level="caption">Downloads</MPTypography>
          <MPTypography level="h3">
            <MPAnimateCounter trigger="manual" play={play} value={128400} duration={1200} />
          </MPTypography>
        </MPBox>

        <MPBox size="sm">
          <MPTypography level="caption">Revenue</MPTypography>
          <MPTypography level="h3">
            <MPAnimateCounter
              trigger="manual"
              play={play}
              value={48250.5}
              duration={1200}
              locale="de-DE"
              options={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
            />
          </MPTypography>
        </MPBox>

        <MPBox size="sm">
          <MPTypography level="caption">Uptime</MPTypography>
          <MPTypography level="h3">
            <MPAnimateCounter
              trigger="manual"
              play={play}
              value={0.9992}
              duration={1200}
              options={{ style: 'percent', minimumFractionDigits: 2 }}
            />
          </MPTypography>
        </MPBox>
      </div>

      <MPButton
        variant="tonal"
        onClick={() => {
          setPlay(false);
          requestAnimationFrame(() => setPlay(true));
        }}
      >
        Count again
      </MPButton>
    </div>
  );
}
