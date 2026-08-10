import { useEffect, useState } from 'react';
import { MPProgressBox } from 'material-plus-ui';

/**
 * A row of segments, for work that genuinely has steps. A bar says "this much
 * is done" — a quantity a reader measures; four segments say "this is step
 * three" — a quantity they count, which is faster for any number small enough
 * to count.
 */
export default function ProgressBoxHero() {
  const [value, setValue] = useState(25);

  useEffect(() => {
    const timer = window.setInterval(() => setValue((now) => (now >= 100 ? 0 : now + 25)), 900);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
      <MPProgressBox label="Deploying" value={value} showValue />
      <MPProgressBox />
    </div>
  );
}
