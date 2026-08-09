import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

export default function TextFieldMultiline() {
  const [bio, setBio] = useState('');
  const [note, setNote] = useState('');

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 420 }}>
      <MPTextField label="Bio" value={bio} onChange={setBio} rows={3} maxLength={200} fullWidth />
      {/* Draggable, and only downwards — a field that can be widened breaks the
          column of the form it is in. */}
      <MPTextField label="Notes" value={note} onChange={setNote} rows={2} resizable fullWidth />
    </div>
  );
}
