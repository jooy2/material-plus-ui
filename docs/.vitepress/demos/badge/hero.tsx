import { ICONS, MPAvatar, MPBadge, MPButton, MPIcon } from 'material-plus-ui';

export default function BadgeHero() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28 }}>
      <MPBadge content={3} label="3 unread messages" overlap="circle">
        <MPButton variant="text" aria-label="Inbox">
          <MPIcon icon={ICONS.info} size={24} />
        </MPButton>
      </MPBadge>

      <MPBadge content={128} label="128 notifications">
        <MPButton variant="tonal" size="sm">
          Notifications
        </MPButton>
      </MPBadge>

      <MPBadge dot color="tertiary" overlap="circle" placement="bottom-end" label="Online">
        <MPAvatar name="Jane Doe" />
      </MPBadge>

      <MPBadge content="NEW" variant="tonal" color="primary" />
    </div>
  );
}
