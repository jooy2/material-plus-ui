import { useState } from 'react';
import { MPButton, MPSegmentedButton, MPSnackbarProvider, useMPSnackbar } from 'material-plus-ui';
import type { MPSnackbarPosition } from 'material-plus-ui';

const POSITIONS: MPSnackbarPosition[] = ['bottom-start', 'bottom-center', 'top-end'];

function Raise() {
  const snackbar = useMPSnackbar();

  return (
    <MPButton size="sm" onClick={() => snackbar.add({ message: 'Draft saved' })}>
      Raise one
    </MPButton>
  );
}

/**
 * `bottom-start` is MD3's own placement. The stack is remounted here as the
 * position changes, which is what a real application never does — it picks one.
 */
export default function SnackbarPosition() {
  const [position, setPosition] = useState<string[]>(['bottom-start']);
  const current = (position[0] ?? 'bottom-start') as MPSnackbarPosition;

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <MPSegmentedButton
        aria-label="Position"
        size="sm"
        value={position}
        onValueChange={setPosition}
        items={POSITIONS.map((name) => ({ value: name, label: name }))}
      />
      <MPSnackbarProvider key={current} position={current} timeout={2500}>
        <Raise />
      </MPSnackbarProvider>
    </div>
  );
}
