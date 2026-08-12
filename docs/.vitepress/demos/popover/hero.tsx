import { MPButton, MPPopover, MPPopoverClose, MPTextField } from 'material-plus-ui';
import { useState } from 'react';

/**
 * A sheet that opens beside the thing that opened it — and, unlike a tooltip,
 * one you can reach: it stays up until it is dismissed, and what is inside it
 * can be clicked and typed into.
 */
export default function PopoverHero() {
  const [name, setName] = useState('');

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <MPPopover
        trigger={<MPButton variant="outlined">Rename</MPButton>}
        title="Rename this view"
        description="Only you will see it"
        showClose
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <MPTextField label="Name" value={name} onChange={setName} fullWidth />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <MPPopoverClose render={<MPButton variant="text">Cancel</MPButton>} />
            <MPPopoverClose render={<MPButton>Save</MPButton>} />
          </div>
        </div>
      </MPPopover>

      <MPPopover
        trigger={<MPButton variant="text">What is this?</MPButton>}
        side="right"
        arrow
        size="sm"
      >
        A popover can hold a paragraph too. The difference from a tooltip is that this one can be
        reached with the keyboard.
      </MPPopover>
    </div>
  );
}
