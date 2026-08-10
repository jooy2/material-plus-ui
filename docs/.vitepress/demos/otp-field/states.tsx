import { useState } from 'react';
import { MPOtpField } from 'material-plus-ui';

/**
 * There is no `error` boolean: the message is what puts the field into its
 * error state. Type `000000` to see it.
 */
export default function OtpFieldStates() {
  const [code, setCode] = useState('000000');

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <MPOtpField
        label="Verification code"
        value={code}
        onValueChange={setCode}
        errorMessage={code === '000000' ? 'That code has expired.' : undefined}
      />
      <MPOtpField label="Verification code" defaultValue="4821" length={4} disabled />
      <MPOtpField label="Recovery code" defaultValue="931204" readOnly />
    </div>
  );
}
