import { MPProgressCircular } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * Every rung sits inside the control height of the same name, so a spinner
 * dropped into a button, a field or a table row never makes the row taller than
 * it was. `md` is MD3's own 48dp.
 */
export default function ProgressCircularSizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <MPProgressCircular key={size} size={size} value={70} />
      ))}
    </div>
  );
}
