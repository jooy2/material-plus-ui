import { useState } from 'react';
import { MPSelect } from 'material-plus-ui';
import type { MPSelectValue } from 'material-plus-ui';

const CITIES = [
  { value: 'kr-11', label: 'Seoul' },
  { value: 'jp-13', label: 'Tokyo' },
  { value: 'fr-75', label: 'Paris' },
  { value: 'us-nyc', label: 'New York' },
  { value: 'br-sp', label: 'São Paulo', disabled: true }
];

export default function SelectHero() {
  const [city, setCity] = useState<MPSelectValue | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 280 }}>
      <MPSelect
        items={CITIES}
        label="City"
        placeholder="Pick one"
        value={city}
        onValueChange={setCity}
        fullWidth
      />
    </div>
  );
}
