import { useState } from 'react';
import { MPButton, MPDrawer, MPList, MPListItem, MPTypography } from 'material-plus-ui';

/**
 * `mode="standard"`: the same panel, in the layout rather than over it.
 *
 * No scrim, no portal, no focus trap and nothing to dismiss — the page is laid
 * out around it. "Closed" for a panel in the flow is "not in the layout", so it
 * renders nothing at all; what moves is the page, and moving the page is not
 * this component's to do.
 *
 * Both modes are one component precisely so that a sidebar becoming a hamburger
 * at a breakpoint is one prop rather than a swap.
 */
export default function DrawerStandard() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ display: 'flex', height: 220, width: '100%', gap: 16 }}>
      <MPDrawer mode="standard" open={open} size="xs" title="Sections">
        <MPList variant="text" size="sm">
          <MPListItem selected onClick={() => {}}>
            Overview
          </MPListItem>
          <MPListItem onClick={() => {}}>Schedule</MPListItem>
        </MPList>
      </MPDrawer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 0 }}>
        <MPButton variant="outlined" onClick={() => setOpen((current) => !current)}>
          {open ? 'Collapse the sidebar' : 'Show the sidebar'}
        </MPButton>
        <MPTypography level="body">
          The page is laid out around the panel rather than under it.
        </MPTypography>
      </div>
    </div>
  );
}
