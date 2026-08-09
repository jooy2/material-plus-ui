import { MPIcon, ICONS } from 'material-plus-ui';

export default function IconColors() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* A colour named outright. Any CSS colour works — including one of the
          library's own role tokens, which is what keeps it right in both
          schemes without the demo knowing which one it is in. */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <MPIcon icon={ICONS.info} size={24} color="var(--color-mp-primary)" label="Info" />
        <MPIcon icon={ICONS.error} size={24} color="var(--color-mp-error)" label="Failed" />
        <MPIcon
          icon={ICONS.warning}
          size={24}
          color="var(--color-mp-on-surface-variant)"
          label="Careful"
        />
        <MPIcon icon={ICONS.success} size={24} color="#2e7d32" label="Done" />
      </div>

      {/* No colour at all. The icon takes whatever the surrounding text is,
          which is why both of these come out right without being told. */}
      <div style={{ display: 'grid', gap: 12 }}>
        <p className="text-mp-body-small text-mp-error" style={{ display: 'flex', gap: 8 }}>
          <MPIcon icon={ICONS.warning} size="1.2em" />
          This certificate expires in three days.
        </p>
        <p
          className="text-mp-body-small text-mp-on-surface-variant"
          style={{ display: 'flex', gap: 8 }}
        >
          <MPIcon icon={ICONS.info} size="1.2em" />
          Renewal is automatic.
        </p>
      </div>
    </div>
  );
}
