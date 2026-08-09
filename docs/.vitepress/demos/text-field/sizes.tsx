import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * The five rungs, and the one that is the specification's.
 *
 * Material defines a single size for a text field — the 56px `md` — so that is
 * what you get by saying nothing. The other four are this library's, for the
 * places a design system does not plan for: a filter bar, a table's inline
 * editor, a dense settings page.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '32px' },
  { size: 'sm', note: '40px' },
  { size: 'md', note: '56px — Material’s own size, and the default' },
  { size: 'lg', note: '64px' },
  { size: 'xl', note: '72px' }
];

export default function TextFieldSizes() {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 380 }}>
      {SIZES.map(({ size, note }) => (
        <div key={size} style={{ display: 'grid', gap: 6 }}>
          <small className="text-mp-on-surface-variant">
            <code>size=&quot;{size}&quot;</code> — {note}
          </small>
          <MPTextField
            label="Search"
            size={size}
            value={values[size] ?? ''}
            onChange={(next) => setValues((all) => ({ ...all, [size]: next }))}
            fullWidth
          />
        </div>
      ))}
    </div>
  );
}
