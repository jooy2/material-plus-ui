import { MPEmpty } from 'material-plus-ui';

export default function EmptySlots() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 480 }}>
      <MPEmpty variant="outlined" />

      <MPEmpty variant="outlined" icon={false} size="sm" title="Inbox zero">
        Nobody has written to you.
      </MPEmpty>

      <MPEmpty variant="outlined" icon={<span style={{ fontSize: '1em' }}>🗂</span>} title={false}>
        This folder is empty.
      </MPEmpty>
    </div>
  );
}
