import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

export default function TextFieldPassword() {
  const [password, setPassword] = useState('correct horse battery staple');

  return (
    <div style={{ maxWidth: 360 }}>
      <MPTextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        fullWidth
      />
    </div>
  );
}
