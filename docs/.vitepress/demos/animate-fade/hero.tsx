import { useState } from 'react';
import { MPAnimateFade, MPButton, MPCard, MPTypography } from 'material-plus-ui';

/**
 * The plainest effect in the set, and the one to reach for first: nothing
 * moves, so nothing reflows and nothing is resampled.
 *
 * `trigger="manual"` with a `play` you own is what makes a preview like this
 * replayable — and a `false` → `true` rewinds the animation without unmounting
 * anything inside it, so nothing in the card loses its state.
 */
export default function AnimateFadeHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <MPAnimateFade trigger="manual" play={play}>
        <MPCard title="Ready when you are" subtitle="300ms on medium2, decelerating into place">
          <MPTypography level="body">
            Nothing moves and nothing is resampled, which is what makes a fade the one entrance that
            is safe on a block of text at any size.
          </MPTypography>
        </MPCard>
      </MPAnimateFade>

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
