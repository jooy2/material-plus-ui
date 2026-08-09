import { MPShortcut } from 'material-plus-ui';

export default function ShortcutHero() {
  return (
    <div style={{ display: 'grid', gap: 14, width: '100%', maxWidth: 380 }}>
      <Row label="Command palette">
        <MPShortcut keys="Mod+K" size="sm" />
      </Row>
      <Row label="Save">
        <MPShortcut keys="Mod+S" size="sm" />
      </Row>
      <Row label="Go to line">
        <MPShortcut keys="Mod+Shift+G" size="sm" />
      </Row>
      <Row label="Close">
        <MPShortcut keys="Escape" size="sm" />
      </Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
    >
      <span>{label}</span>
      {children}
    </div>
  );
}
