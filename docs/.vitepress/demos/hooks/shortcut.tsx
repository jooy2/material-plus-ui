import { useState } from 'react';
import { MPShortcut, MPTypography, useMPShortcut } from 'material-plus-ui';

/**
 * One spelling, drawn and bound.
 *
 * `<MPShortcut keys="Mod+K" />` prints the key cap and `useMPShortcut('Mod+K', …)`
 * listens for it, and both go through the same matcher — so the page cannot end
 * up showing ⌘K while waiting for Ctrl+K, which is the bug the shared vocabulary
 * exists to make impossible.
 *
 * Press it anywhere on this page.
 */
export default function ShortcutDemo() {
  const [count, setCount] = useState(0);

  useMPShortcut('Mod+K', () => setCount((n) => n + 1));

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MPTypography level="body">Press</MPTypography>
        <MPShortcut keys="Mod+K" />
      </div>
      <MPTypography level="caption">
        {count === 0 ? 'Not yet pressed.' : `Fired ${count} time${count === 1 ? '' : 's'}.`}
      </MPTypography>
    </div>
  );
}
