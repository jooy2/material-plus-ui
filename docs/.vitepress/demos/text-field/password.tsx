import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { MPTextField } from 'material-plus';

export default function TextFieldPassword() {
  const [password, setPassword] = useState('correct horse battery staple');

  return (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MPTextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        fullWidth
      />
    </Stack>
  );
}
