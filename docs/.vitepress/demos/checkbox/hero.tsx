import { useState } from 'react';
import { MPCheckbox } from 'material-plus-ui';

export default function CheckboxHero() {
  const [agreed, setAgreed] = useState(true);

  return (
    <MPCheckbox
      label="Email me about new releases"
      description="About once a month. Unsubscribe at any time."
      checked={agreed}
      onCheckedChange={setAgreed}
    />
  );
}
