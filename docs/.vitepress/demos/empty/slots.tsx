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

      {/* Only an `svg` in this slot is scaled to the type around it, so a
          drawing comes through at whatever size it is given. */}
      <MPEmpty
        variant="outlined"
        title="Nothing filed yet"
        icon={
          <img
            src="/samples/illustrations/thumbs/fox-reading-under-tree.webp"
            alt=""
            width={132}
            height={132}
            style={{ borderRadius: 16 }}
          />
        }
      >
        The first thing you file shows up here.
      </MPEmpty>
    </div>
  );
}
