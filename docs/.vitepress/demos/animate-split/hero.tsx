import { useState } from 'react';
import { MPAnimateSplit, MPButton, MPTypography } from 'material-plus-ui';

/**
 * Both cuts side by side, because the difference is the whole decision: words
 * are a heading arriving, characters are a heading being performed.
 */
export default function AnimateSplitHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', width: '100%' }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MPAnimateSplit
          trigger="manual"
          play={play}
          stagger={60}
          style={{ fontSize: 24, fontWeight: 500 }}
        >
          What we shipped this quarter
        </MPAnimateSplit>
        <MPTypography level="caption">by=&quot;word&quot;, 60ms apart</MPTypography>
      </div>

      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MPAnimateSplit
          trigger="manual"
          play={play}
          by="character"
          stagger={18}
          style={{ fontSize: 24, fontWeight: 500 }}
        >
          Character by character
        </MPAnimateSplit>
        <MPTypography level="caption">by=&quot;character&quot;, 18ms apart</MPTypography>
      </div>

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
