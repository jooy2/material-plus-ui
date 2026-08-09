import { MPButton, MPIcon, ICONS } from 'material-plus-ui';

export default function ButtonHero() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <MPButton startIcon={<MPIcon icon={ICONS.check} size={20} />}>Save</MPButton>
      <MPButton variant="tonal">Preview</MPButton>
      <MPButton variant="outlined">Cancel</MPButton>
      <MPButton variant="text">Learn more</MPButton>
    </div>
  );
}
