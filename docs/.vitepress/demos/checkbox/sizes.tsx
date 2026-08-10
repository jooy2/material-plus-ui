import { MPCheckbox } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * Five rungs, and the halo grows with the box rather than staying at 40dp.
 *
 * What the ladder keeps is the *relationship* between the two — the pressable
 * area is always wider than the tick it is drawn around, which is what makes an
 * `xs` checkbox still hittable. The label moves down the body scale with it.
 */
const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export default function CheckboxSizes() {
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {SIZES.map((size) => (
        <MPCheckbox
          key={size}
          size={size}
          defaultChecked
          label={size === 'md' ? 'size="md" — the default' : `size="${size}"`}
        />
      ))}
    </div>
  );
}
