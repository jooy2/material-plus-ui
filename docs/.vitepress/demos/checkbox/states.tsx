import { useState } from 'react';
import { MPCheckbox } from 'material-plus-ui';

export default function CheckboxStates() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <MPCheckbox
        label="I accept the terms"
        checked={agreed}
        onCheckedChange={setAgreed}
        errorMessage={agreed ? undefined : 'You have to accept these to continue.'}
        required
      />
      <MPCheckbox label="Read-only, and still reachable" defaultChecked readOnly />
      <MPCheckbox label="Disabled" defaultChecked disabled />
      <MPCheckbox label="Disabled and empty" disabled />
    </div>
  );
}
