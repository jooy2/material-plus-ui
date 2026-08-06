import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { MPTextField } from 'material-plus-ui';

/**
 * Beside the `@mui/material` field it extends, at both sizes — the point being
 * that they line up. `MPTextField` draws MUI's own `OutlinedInput`, so a form
 * mixing the two has one baseline rather than two.
 */
export default function TextFieldSizes() {
  const [small, setSmall] = useState('');
  const [large, setLarge] = useState('');

  return (
    <Stack spacing={3} sx={{ maxWidth: 420 }}>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          default — MUI’s small
        </Typography>
        <Stack direction="row" spacing={2}>
          <MPTextField label="MPTextField" value={small} onChange={setSmall} fullWidth />
          <TextField
            label="TextField"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          large — MUI’s medium
        </Typography>
        <Stack direction="row" spacing={2}>
          <MPTextField label="MPTextField" value={large} onChange={setLarge} large fullWidth />
          <TextField
            label="TextField"
            size="medium"
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
