import { MPButton, MPButtonGroup, MPIcon, ICONS } from 'material-plus-ui';

export default function ButtonGroupHero() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <MPButtonGroup variant="outlined">
        <MPButton startIcon={<MPIcon icon={ICONS['chevron-left']} size={20} />}>Previous</MPButton>
        <MPButton endIcon={<MPIcon icon={ICONS['chevron-right']} size={20} />}>Next</MPButton>
      </MPButtonGroup>

      <MPButtonGroup variant="tonal" size="sm">
        <MPButton>Copy</MPButton>
        <MPButton>Duplicate</MPButton>
        <MPButton>Share</MPButton>
      </MPButtonGroup>
    </div>
  );
}
