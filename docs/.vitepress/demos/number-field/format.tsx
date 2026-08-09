import { useState } from 'react';
import { MPNumberField } from 'material-plus-ui';

/**
 * The field shows a written number; the value stays a plain one.
 *
 * `format` goes to `Intl.NumberFormat`, so the box says `$1,240.00` while
 * `onValueChange` still hands over `1240` — which is the whole reason this is a
 * prop rather than something a caller does to `value` on the way in. Type into
 * it: the separators and the symbol come back on their own.
 */
export default function NumberFieldFormat() {
  const [price, setPrice] = useState<number | null>(1240);
  const [share, setShare] = useState<number | null>(0.15);

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 300 }}>
      <MPNumberField
        label="Price"
        value={price}
        onValueChange={setPrice}
        format={{ style: 'currency', currency: 'USD' }}
        step={10}
        min={0}
        fullWidth
      />
      <MPNumberField
        label="Commission"
        value={share}
        onValueChange={setShare}
        format={{ style: 'percent', maximumFractionDigits: 1 }}
        step={0.01}
        min={0}
        max={1}
        fullWidth
      />
      <small className="text-mp-on-surface-variant">
        The values behind those are <code>{String(price)}</code> and <code>{String(share)}</code>.
      </small>
    </div>
  );
}
