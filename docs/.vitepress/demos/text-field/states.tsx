import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { MPTextField } from 'material-plus-ui';

export default function TextFieldStates() {
  const [email, setEmail] = useState('not-an-address');

  const invalid = email.length > 0 && !email.includes('@');

  return (
    <Stack spacing={3} sx={{ maxWidth: 360 }}>
      <MPTextField
        label="Email"
        value={email}
        onChange={setEmail}
        errorMessage={invalid ? 'Enter a valid email address.' : ''}
        fullWidth
      />
      <MPTextField label="Account ID" value="acc_8f21c4" readOnly fullWidth />
      <MPTextField label="Plan" value="Enterprise" disabled fullWidth />
      <MPTextField label="Full name" value="" required placeholder="Required" fullWidth />
    </Stack>
  );
}
