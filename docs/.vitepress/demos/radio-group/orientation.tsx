import { useState } from 'react';
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

/**
 * A row, and why it is not the default.
 *
 * A column is scannable at any length. A row silently stops being readable the
 * moment one label is longer than expected — so it is worth having, and worth
 * asking for rather than getting by accident.
 */
export default function RadioGroupOrientation() {
  const [size, setSize] = useState('m');

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <MPRadioGroup label="Size" orientation="horizontal" value={size} onValueChange={setSize}>
        <MPRadio value="s" label="Small" />
        <MPRadio value="m" label="Medium" />
        <MPRadio value="l" label="Large" />
        <MPRadio value="xl" label="Out of stock" disabled />
      </MPRadioGroup>

      <MPRadioGroup
        label="Billing"
        orientation="horizontal"
        defaultValue="monthly"
        errorMessage="Choose one before continuing."
      >
        <MPRadio value="monthly" label="Monthly" />
        <MPRadio value="yearly" label="Yearly" />
      </MPRadioGroup>
    </div>
  );
}
