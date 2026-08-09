import { useState } from 'react';
import { MPNumberField } from 'material-plus-ui';
import type { MPNumberFieldSteppers } from 'material-plus-ui';

/**
 * Three arrangements, and no fourth.
 *
 * There is deliberately no stacked pair of half-height chevrons — the shape a
 * native `<input type="number">` grows. At `xs` each arrow would be under three
 * pixels tall, and a target that small is a target nobody hits.
 */
const LAYOUTS: { steppers: MPNumberFieldSteppers; note: string }[] = [
  { steppers: 'end', note: 'both at the trailing edge — the default' },
  { steppers: 'split', note: 'one either side, for a quantity that is nudged' },
  { steppers: 'none', note: 'no buttons; the arrow keys and clamping stay' }
];

export default function NumberFieldSteppers() {
  const [values, setValues] = useState<Record<string, number | null>>({});

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 300 }}>
      {LAYOUTS.map(({ steppers, note }) => (
        <div key={steppers} style={{ display: 'grid', gap: 6 }}>
          <small className="text-mp-on-surface-variant">
            <code>steppers=&quot;{steppers}&quot;</code> — {note}
          </small>
          <MPNumberField
            label="Quantity"
            steppers={steppers}
            min={0}
            max={99}
            value={values[steppers] ?? 1}
            onValueChange={(next) => setValues((all) => ({ ...all, [steppers]: next }))}
            fullWidth
          />
        </div>
      ))}
    </div>
  );
}
