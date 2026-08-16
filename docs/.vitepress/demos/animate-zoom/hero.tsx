import { useState } from 'react';
import { MPAnimateZoom, MPButton, MPCard, MPTypography } from 'material-plus-ui';

/**
 * A zoom is for the one thing on a screen that is meant to interrupt — a
 * confirmation, a result, a number that has just landed.
 *
 * Use it once. An interruption that happens three times on one screen is a
 * layout, and the effect that belongs to a *set* of things is `MPAnimateAppear`.
 */
export default function AnimateZoomHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <MPAnimateZoom trigger="manual" play={play}>
        <MPCard title="Payment received" subtitle="₩42,000 · just now">
          <MPTypography level="h4">Done</MPTypography>
        </MPCard>
      </MPAnimateZoom>

      <MPButton
        variant="tonal"
        onClick={() => {
          setPlay(false);
          requestAnimationFrame(() => setPlay(true));
        }}
      >
        Play again
      </MPButton>
    </div>
  );
}
