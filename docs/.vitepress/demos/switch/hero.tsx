import { useState } from 'react';
import { MPSwitch } from 'material-plus-ui';

export default function SwitchHero() {
  const [on, setOn] = useState(true);

  return (
    <MPSwitch
      label="Wi-Fi"
      description="Connect automatically to known networks."
      checked={on}
      onCheckedChange={setOn}
    />
  );
}
