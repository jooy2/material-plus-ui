import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MPTextField } from 'material-plus';

/**
 * The parent that breaks a naively controlled input: it upper-cases everything
 * it is handed, so every keystroke comes back as a different string from the
 * one the browser is holding.
 *
 * Type a Korean word here. The syllable being composed stays intact, and only
 * once it is committed does the parent's rule apply.
 */
export default function TextFieldComposition() {
  const [value, setValue] = useState('');

  return (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MPTextField
        label="이름 / Name"
        value={value}
        onChange={(next) => setValue(next.toUpperCase())}
        placeholder="한글을 입력해 보세요"
        fullWidth
      />
      <Typography variant="caption" color="text.secondary">
        Parent state: <code>{value || '(empty)'}</code>
      </Typography>
    </Stack>
  );
}
