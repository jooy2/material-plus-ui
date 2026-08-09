import { MPDivider } from 'material-plus-ui';

export default function DividerHero() {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 420 }}>
      <MPDivider />

      <MPDivider>OR</MPDivider>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 32 }}>
        <span>Draft</span>
        <MPDivider orientation="vertical" />
        <span>Edited 2h ago</span>
        <MPDivider orientation="vertical" />
        <span>3 comments</span>
      </div>
    </div>
  );
}
