import { useState } from 'react';
import { MPAnimateReveal, MPButton, MPDivider, MPTypography } from 'material-plus-ui';

/**
 * The claim, drawn: the heading and the rule are where they will be from the
 * first frame, at the ink they will end at, and only their extent changes.
 *
 * A `stagger` on the pair rather than two components with a `delay`, so the
 * heading and its rule are one gesture — which is what they are.
 */
export default function AnimateRevealHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', width: '100%' }}>
      <MPAnimateReveal trigger="manual" play={play} stagger={140} style={{ width: '100%' }}>
        <MPTypography level="h3">What we shipped this quarter</MPTypography>
        <MPDivider />
        <MPTypography level="body">
          Nothing moved and no colour changed. The title is at its final position on the first
          frame, which is the whole reason to reach for this one over a slide.
        </MPTypography>
      </MPAnimateReveal>

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
