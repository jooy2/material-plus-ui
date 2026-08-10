import { useState } from 'react';
import { MPOtpField, MPTypography } from 'material-plus-ui';

/**
 * One hidden value behind six inputs. Paste spreads across the slots, backspace
 * steps back a box, and a phone can offer the code straight from the message —
 * all of which is Base UI's.
 */
export default function OtpFieldHero() {
  const [code, setCode] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <MPOtpField
        label="Verification code"
        description="We texted a six-digit code to your phone."
        value={code}
        onValueChange={(next) => {
          setCode(next);
          setDone(false);
        }}
        onComplete={() => setDone(true)}
      />
      {done ? <MPTypography level="caption">Checking “{code}”…</MPTypography> : null}
    </div>
  );
}
