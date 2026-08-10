import { MPProgressBox } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * The size of one segment, on a ladder of its own.
 *
 * An indicator is not a control, so it is not on the control heights — 8, 10,
 * 12, 16 and 20px tiles, with the gap between them and the corner cut off each
 * one following the same rung.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '8px' },
  { size: 'sm', note: '10px' },
  { size: 'md', note: '12px — the default' },
  { size: 'lg', note: '16px' },
  { size: 'xl', note: '20px' }
];

export default function ProgressBoxSizes() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      {SIZES.map(({ size, note }) => (
        <MPProgressBox key={size} size={size} value={60} label={`${size} — ${note}`} />
      ))}
    </div>
  );
}
