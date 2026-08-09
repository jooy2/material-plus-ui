import { MPDivider } from 'material-plus-ui';

export default function DividerLabels() {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 420 }}>
      <MPDivider textAlign="start">Recent</MPDivider>
      <MPDivider>OR</MPDivider>
      <MPDivider textAlign="end">Archived</MPDivider>
    </div>
  );
}
