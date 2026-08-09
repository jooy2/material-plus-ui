import { useState } from 'react';
import { MPSlider } from 'material-plus-ui';

/**
 * There is no `range` prop.
 *
 * An array in `value` is what makes it a range slider, because the shape of the
 * value already says which one this is — and a boolean that had to agree with
 * the value's shape would be one more thing to get wrong.
 */
export default function SliderRange() {
  const [price, setPrice] = useState<number | number[]>([20, 80]);

  return (
    <div style={{ display: 'grid', gap: 28, width: '100%', maxWidth: 320 }}>
      <MPSlider
        label="Price"
        showValue
        format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
        value={price}
        onValueChange={setPrice}
      />
      <MPSlider
        label="Brightness"
        description="Applies to the preview only."
        color="tertiary"
        defaultValue={65}
        step={5}
      />
      <MPSlider label="Locked" defaultValue={30} disabled />
    </div>
  );
}
