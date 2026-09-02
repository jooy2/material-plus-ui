import { useState } from 'react';
import { MPAnimateScramble, MPButton, MPTypography } from 'material-plus-ui';

/**
 * The heading and the line under it, to show the thing the component is for:
 * neither moves while the top one settles, because the box was its finished
 * length from the first frame.
 */
export default function AnimateScrambleHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', width: '100%' }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MPAnimateScramble
          trigger="manual"
          play={play}
          duration={1400}
          style={{ fontSize: 24, fontWeight: 500 }}
        >
          ACCESS GRANTED
        </MPAnimateScramble>
        <MPTypography level="caption">Nothing under it moved.</MPTypography>
      </div>

      <MPButton
        variant="tonal"
        onClick={() => {
          setPlay(false);
          requestAnimationFrame(() => setPlay(true));
        }}
      >
        Resolve again
      </MPButton>
    </div>
  );
}
