import { useState } from 'react';
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

export default function RadioGroupHero() {
  const [delivery, setDelivery] = useState('standard');

  return (
    <MPRadioGroup label="Delivery" value={delivery} onValueChange={setDelivery}>
      <MPRadio value="standard" label="Standard" description="Arrives in 3–5 days. Free." />
      <MPRadio value="express" label="Express" description="Next day, £4.99." />
      <MPRadio value="pickup" label="Collect in store" description="Ready in an hour." />
    </MPRadioGroup>
  );
}
