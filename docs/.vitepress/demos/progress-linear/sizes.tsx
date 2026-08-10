import { MPProgressLinear } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * `size` is the thickness of the groove and nothing else — `md` is MD3's own
 * 4dp. A bar has no label inside it to scale.
 */
export default function ProgressLinearSizes() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 420 }}>
      {SIZES.map((size) => (
        <MPProgressLinear key={size} size={size} value={62} label={size} />
      ))}
    </div>
  );
}
