import { useState } from 'react';
import { MPAnimateGrow, MPButton, MPCard, MPTypography } from 'material-plus-ui';

/**
 * A grow starts close to its final size, so the content inside is legible for
 * most of the animation — which is what makes it the effect for something
 * opening out of the place it belongs to.
 */
export default function AnimateGrowHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <MPAnimateGrow trigger="manual" play={play} origin="top">
        <MPCard title="Out of the toolbar" subtitle="400ms on medium4, anchored to its top edge">
          <MPTypography level="body">
            `origin` is what anchors the unfold to a place — a panel out of a toolbar, a sheet out
            of the button that summoned it.
          </MPTypography>
        </MPCard>
      </MPAnimateGrow>

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
