import { MPSelect } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' }
];

/**
 * The same five rungs a text field is drawn at.
 *
 * A select and a field at the same `size` line up to the pixel, which is the
 * whole reason the shell is shared — put one of each in a filter bar and the row
 * is a row rather than two controls that nearly agree.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '32px' },
  { size: 'sm', note: '40px' },
  { size: 'md', note: '56px — the default' },
  { size: 'lg', note: '64px' },
  { size: 'xl', note: '72px' }
];

export default function SelectSizes() {
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 320 }}>
      {SIZES.map(({ size, note }) => (
        <div key={size} style={{ display: 'grid', gap: 6 }}>
          <small className="text-mp-on-surface-variant">
            <code>size=&quot;{size}&quot;</code> — {note}
          </small>
          <MPSelect items={PLANS} label="Plan" size={size} defaultValue="pro" fullWidth />
        </div>
      ))}
    </div>
  );
}
