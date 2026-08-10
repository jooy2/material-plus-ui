import { MPButton } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * Five rungs off the library's control ladder.
 *
 * The first three are MD3's own extra-small, small and medium button heights;
 * `lg` and `xl` are this library's, because the spec's are 96 and 136 and a 96px
 * button beside a 64px field is not a row. The label's type scale and the
 * padding around it come off the same rung, which is why a taller button is not
 * just a taller pill.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '32px — MD3’s extra-small' },
  { size: 'sm', note: '40px — MD3’s small' },
  { size: 'md', note: '56px — MD3’s medium, and the default' },
  { size: 'lg', note: '64px' },
  { size: 'xl', note: '72px' }
];

export default function ButtonSizes() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map(({ size, note }) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MPButton size={size}>Save</MPButton>
          <small className="text-mp-on-surface-variant">
            <code>size=&quot;{size}&quot;</code> — {note}
          </small>
        </div>
      ))}
    </div>
  );
}
