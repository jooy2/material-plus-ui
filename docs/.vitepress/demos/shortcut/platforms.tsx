import { MPShortcut } from 'material-plus-ui';
import type { MPShortcutOS } from 'material-plus-ui';

const PLATFORMS: MPShortcutOS[] = ['auto', 'mac', 'windows', 'linux'];

export default function ShortcutPlatforms() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {PLATFORMS.map((os) => (
        <div key={os} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <code style={{ width: 72, flexShrink: 0, fontSize: 12, opacity: 0.7 }}>{os}</code>
          <MPShortcut keys="Mod+Shift+P" os={os} size="sm" />
        </div>
      ))}
    </div>
  );
}
