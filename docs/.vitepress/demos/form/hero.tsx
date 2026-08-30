import { MPButton, MPForm, MPTextField, MPTypography } from 'material-plus-ui';
import { useState } from 'react';

/**
 * A submit collects every field's validity at once, and focus lands on the first
 * one that failed — which is the part that has to be owned above the fields.
 *
 * `validationMode` is `onSubmit` by default, and on every change afterwards.
 * That is the only mode that does not tell somebody their email address is wrong
 * while they are still typing it.
 */
export default function FormHero() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <MPForm onSubmit={(values) => setSaved(String(values.email ?? ''))}>
        <MPTextField name="name" label="Name" required value={name} onChange={setName} fullWidth />
        <MPTextField
          name="email"
          type="email"
          label="Email"
          required
          value={email}
          onChange={setEmail}
          fullWidth
        />
        <MPButton type="submit" fullWidth>
          Save
        </MPButton>
      </MPForm>

      {saved ? (
        <MPTypography level="caption" style={{ marginTop: 12 }}>
          Submitted {saved}.
        </MPTypography>
      ) : null}
    </div>
  );
}
