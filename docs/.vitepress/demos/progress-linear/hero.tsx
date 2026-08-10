import { useEffect, useState } from 'react';
import { MPProgressLinear } from 'material-plus-ui';

/**
 * The bar that fills, and the only one of the three that shows *how much* is
 * left at a glance — length is the one quantity a reader compares without
 * counting.
 */
export default function ProgressLinearHero() {
  const [value, setValue] = useState(12);

  useEffect(() => {
    const timer = window.setInterval(() => setValue((now) => (now >= 100 ? 0 : now + 4)), 320);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 420 }}>
      <MPProgressLinear label="Uploading" value={value} showValue />
      <MPProgressLinear label="Working" />
    </div>
  );
}
