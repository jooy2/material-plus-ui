import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { MPTextField } from 'material-plus';

export default function TextFieldMultiline() {
  const [bio, setBio] = useState('');
  const [note, setNote] = useState('');

  return (
    <Stack spacing={3} sx={{ maxWidth: 420 }}>
      <MPTextField label="Bio" value={bio} onChange={setBio} rows={3} maxLength={200} fullWidth />
      {/* Draggable, and only downwards — a field that can be widened breaks the
          column of the form it is in. */}
      <MPTextField label="Notes" value={note} onChange={setNote} rows={2} resizable fullWidth />
    </Stack>
  );
}
