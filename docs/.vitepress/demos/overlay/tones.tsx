import { useState } from 'react';
import { MPButton, MPOverlay, MPTypography } from 'material-plus-ui';
import type { MPOverlayTone } from 'material-plus-ui';

const TONES: MPOverlayTone[] = ['scrim', 'blur', 'solid', 'clear'];

/**
 * One axis, four steps: how legible is what is behind. `clear` draws nothing
 * at all and still catches every click, which is the whole reason to reach for
 * it.
 *
 * These are dismissible so that the page comes back — a real overlay usually is
 * not.
 */
export default function OverlayTones() {
  const [tone, setTone] = useState<MPOverlayTone | null>(null);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {TONES.map((name) => (
          <MPButton key={name} variant="outlined" size="sm" onClick={() => setTone(name)}>
            {name}
          </MPButton>
        ))}
      </div>

      <MPOverlay
        open={tone !== null}
        onOpenChange={(next) => !next && setTone(null)}
        tone={tone ?? 'scrim'}
        label={`${tone} overlay`}
        dismissible
      >
        <MPTypography level="lead">Click anywhere to close.</MPTypography>
      </MPOverlay>
    </>
  );
}
