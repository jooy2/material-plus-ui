import { useState } from 'react';
import { MPIcon, MPTextField, ICONS } from 'material-plus-ui';

export default function TextFieldFloatingLabel() {
  const [floating, setFloating] = useState('');
  const [pinned, setPinned] = useState('');
  const [adorned, setAdorned] = useState('');

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 360 }}>
      <MPTextField label="Email" value={floating} onChange={setFloating} fullWidth />
      <MPTextField
        label="Email"
        value={pinned}
        onChange={setPinned}
        floatingLabel={false}
        fullWidth
      />
      <MPTextField
        label="Search"
        value={adorned}
        onChange={setAdorned}
        startIcon={<MPIcon icon={ICONS.search} size={20} />}
        fullWidth
      />
    </div>
  );
}
