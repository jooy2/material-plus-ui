import { useState } from 'react';
import { MPCombobox, MPIcon, ICONS } from 'material-plus-ui';
import type { MPComboboxValue } from 'material-plus-ui';

const CITIES = [
  { value: 'kr-11', label: 'Seoul' },
  { value: 'jp-13', label: 'Tokyo' },
  { value: 'fr-75', label: 'Paris' },
  { value: 'br-sp', label: 'São Paulo', disabled: true }
];

/**
 * There is no `error` boolean: a message is what puts the control into its
 * error state, so there is no way to render a combobox that is visibly wrong
 * with no explanation of why. Pick a city to see the first one recover.
 */
export default function ComboboxStates() {
  const [city, setCity] = useState<MPComboboxValue | null>(null);

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 300 }}>
      <MPCombobox
        items={CITIES}
        label="City"
        value={city}
        onValueChange={setCity}
        errorMessage={city ? undefined : 'Pick a city to continue.'}
        allowCustom={false}
        required
        fullWidth
      />
      <MPCombobox
        items={CITIES}
        label="City"
        defaultValue="jp-13"
        startIcon={<MPIcon icon={ICONS.search} size={20} />}
        description="Type to filter the list."
        fullWidth
      />
      <MPCombobox items={CITIES} label="City" defaultValue="fr-75" disabled fullWidth />
    </div>
  );
}
