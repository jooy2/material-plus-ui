import { useEffect, useState } from 'react';
import { MPProgressCircular } from 'material-plus-ui';

/**
 * The ring, for where there is no room for a bar. The value and the label sit
 * *beside* it rather than inside: a number in the middle of the dial only works
 * at two of the five sizes.
 */
export default function ProgressCircularHero() {
  const [value, setValue] = useState(35);

  useEffect(() => {
    const timer = window.setInterval(() => setValue((now) => (now >= 100 ? 0 : now + 5)), 400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
      <MPProgressCircular value={value} showValue />
      <MPProgressCircular label="Syncing" />
    </div>
  );
}
