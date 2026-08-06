import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { MPTextField, MPIcon, ICONS } from 'material-plus-ui';

export default function TextFieldHero() {
  const [email, setEmail] = useState('');

  return (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MPTextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        startIcon={<MPIcon icon={ICONS.search} size={18} />}
        fullWidth
      />
    </Stack>
  );
}
