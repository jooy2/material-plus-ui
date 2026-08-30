import { MPButton, MPForm, MPTextField } from 'material-plus-ui';
import { useState } from 'react';

/**
 * `errors` is the seam a server's answer comes back through.
 *
 * It is keyed by the `name` of the field each message belongs to, so the message
 * lands on the field rather than in a banner at the top of the page — and it is
 * cleared the moment that field changes, because an error about a value nobody
 * has any more is an error about nothing.
 *
 * This is also the whole of the integration: a project keeps whatever schema or
 * resolver it already has and hands the result here.
 */
export default function FormErrors() {
  const [handle, setHandle] = useState('ada');
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <MPForm
        errors={errors}
        onSubmit={(values) =>
          setErrors(values.handle === 'ada' ? { handle: 'That handle is already taken' } : {})
        }
      >
        <MPTextField
          name="handle"
          label="Handle"
          required
          value={handle}
          onChange={setHandle}
          fullWidth
        />
        <MPButton type="submit" fullWidth>
          Claim it
        </MPButton>
      </MPForm>
    </div>
  );
}
