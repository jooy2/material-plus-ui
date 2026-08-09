import { MPIcon, ICONS } from 'material-plus-ui';

export default function IconHero() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <MPIcon icon={ICONS.success} size={28} color="#2e7d32" label="Deployed" />
      <span className="text-mp-body-large text-mp-on-surface">
        Deploys finish in <MPIcon icon={ICONS.check} size="1em" /> under a minute.
      </span>
    </div>
  );
}
