import { MPFieldset, MPTextField } from 'material-plus-ui';
import { useState } from 'react';

/**
 * A group of controls that answer one question together, with a name on it.
 *
 * The legend becomes part of the accessible name of every control inside, so it
 * has to be a phrase that still reads correctly in front of each of them —
 * "Billing address", not "Where should we send it?".
 */
export default function FieldsetHero() {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <MPFieldset legend="Billing address" description="Where the invoice goes">
        <MPTextField name="street" label="Street" value={street} onChange={setStreet} fullWidth />
        <MPTextField name="city" label="City" value={city} onChange={setCity} fullWidth />
        <MPTextField
          name="postcode"
          label="Postcode"
          value={postcode}
          onChange={setPostcode}
          fullWidth
        />
      </MPFieldset>
    </div>
  );
}
