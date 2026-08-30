import { MPCheckbox, MPFieldset, MPSwitch, MPTextField } from 'material-plus-ui';
import { useState } from 'react';

/**
 * The one thing only a real `<fieldset>` can do.
 *
 * `disabled` reaches every control inside it — including ones a component three
 * levels down rendered and never heard of it. That is not something a React
 * context could promise, and it is the reason this component exists rather than
 * a `<div>` with a heading.
 */
export default function FieldsetDisabled() {
  const [inherit, setInherit] = useState(true);
  const [street, setStreet] = useState('221B Baker Street');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 360 }}>
      <MPSwitch label="Same as delivery address" checked={inherit} onCheckedChange={setInherit} />

      <MPFieldset legend="Billing address" disabled={inherit}>
        <MPTextField name="street" label="Street" value={street} onChange={setStreet} fullWidth />
        <MPCheckbox label="This is a business address" />
      </MPFieldset>
    </div>
  );
}
