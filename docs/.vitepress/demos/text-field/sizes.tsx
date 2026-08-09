import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

/**
 * The two heights, and the reason there are two.
 *
 * Material specifies one size for a text field: the 56px one, which is what
 * `large` draws. The 40px default is a concession to dense forms — a settings
 * page or a filter bar where a column of 56px controls is taller than the
 * content it collects — and it is the default here because that is the shape
 * most of these fields turn out to be.
 */
export default function TextFieldSizes() {
  const [compact, setCompact] = useState('');
  const [full, setFull] = useState('');

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 360 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <small className="text-mp-on-surface-variant">default — 40px</small>
        <MPTextField label="Search" value={compact} onChange={setCompact} fullWidth />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <small className="text-mp-on-surface-variant">large — 56px, Material’s own size</small>
        <MPTextField label="Search" value={full} onChange={setFull} large fullWidth />
      </div>
    </div>
  );
}
