import { useState } from 'react';
import { MPButton } from 'material-plus-ui';

/**
 * `loading` is not `disabled`, and the difference is the point.
 *
 * Press Save: the button stops firing and grows a spinner, but it keeps its
 * place in the tab order. A button that leaves the tab order the moment it is
 * pressed takes the keyboard focus with it, and returns the reader to the top of
 * the document while the request they just made is still in flight.
 *
 * Tab away and back while it is working — the focus is still there.
 */
export default function ButtonStates() {
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <MPButton
        loading={saving}
        loadingLabel="Saving"
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 2000);
        }}
      >
        Save
      </MPButton>
      <MPButton variant="tonal" disabled>
        Disabled
      </MPButton>
      <MPButton variant="outlined" disabled>
        Disabled
      </MPButton>
      <MPButton color="error">Delete</MPButton>
    </div>
  );
}
