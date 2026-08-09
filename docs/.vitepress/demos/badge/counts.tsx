import { useState } from 'react';
import { MPBadge, MPButton } from 'material-plus-ui';

export default function BadgeCounts() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
      <MPBadge content={count} label={`${count} unread`}>
        <MPButton variant="outlined" size="sm">
          Inbox
        </MPButton>
      </MPBadge>

      <MPButton size="sm" variant="text" onClick={() => setCount((value) => value + 1)}>
        One more
      </MPButton>
      <MPButton size="sm" variant="text" onClick={() => setCount(0)}>
        Mark all read
      </MPButton>
    </div>
  );
}
