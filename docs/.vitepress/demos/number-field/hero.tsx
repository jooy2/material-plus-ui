import { useState } from 'react';
import { MPNumberField } from 'material-plus-ui';

export default function NumberFieldHero() {
  const [quantity, setQuantity] = useState<number | null>(1);

  return (
    <div style={{ width: '100%', maxWidth: 260 }}>
      <MPNumberField
        label="Quantity"
        value={quantity}
        onValueChange={setQuantity}
        min={1}
        max={20}
        fullWidth
      />
    </div>
  );
}
