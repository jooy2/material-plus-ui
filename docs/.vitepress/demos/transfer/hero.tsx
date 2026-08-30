import { MPTransfer, MPTypography } from 'material-plus-ui';
import { useState } from 'react';

const COLUMNS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'team', label: 'Team' },
  { value: 'joined', label: 'Joined' },
  { value: 'last-seen', label: 'Last seen' },
  { value: 'id', label: 'Internal ID', disabled: true }
];

/**
 * Ticking is not choosing.
 *
 * `value` is which side a row is on; a tick is a mark saying it should move next
 * time an arrow is pressed. So `onValueChange` fires on the arrow and never on a
 * tick, and what a caller stores is the answer rather than the working.
 */
export default function TransferHero() {
  const [chosen, setChosen] = useState<string[]>(['name', 'email']);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <MPTransfer
        size="sm"
        height={180}
        items={COLUMNS}
        value={chosen}
        onValueChange={setChosen}
        sourceLabel="All columns"
        targetLabel="In the report"
      />

      <MPTypography level="caption">
        The report shows: {chosen.length > 0 ? chosen.join(', ') : 'nothing yet'}.
      </MPTypography>
    </div>
  );
}
