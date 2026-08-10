import { useState } from 'react';
import { MPButton, MPOverlay, MPProgressCircular, MPTypography } from 'material-plus-ui';

/**
 * The scrim on its own, with whatever the caller puts on top of it.
 *
 * It is not dismissible, which is the one prop worth reading twice: an overlay
 * is not asking anything, it is saying *wait*. This one closes itself after two
 * seconds, the way a real save would.
 */
export default function OverlayHero() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MPButton
        onClick={() => {
          setOpen(true);
          window.setTimeout(() => setOpen(false), 2000);
        }}
      >
        Publish
      </MPButton>

      <MPOverlay open={open} label="Publishing" onOpenChange={setOpen}>
        <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
          <MPProgressCircular size="lg" />
          <MPTypography level="body">Publishing your changes…</MPTypography>
        </div>
      </MPOverlay>
    </>
  );
}
