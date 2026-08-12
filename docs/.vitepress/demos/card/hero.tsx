import { ICONS, MPButton, MPCard, MPChip, MPIcon, MPIconButton } from 'material-plus-ui';

/**
 * MD3's card anatomy, with each part in a slot of its own: a headline, a
 * subhead, supporting text and a row of actions.
 *
 * The slots are props rather than compound sub-components because the
 * arrangement is fixed — what a caller wants to decide is what goes in each one,
 * not what order they come in.
 */
export default function CardHero() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      <MPCard
        variant="elevated"
        title="Weekly digest"
        subtitle="Sent every Monday at 09:00"
        headerAction={<MPIconButton icon={<MPIcon icon={ICONS.more} />} label="More" size="xs" />}
        footer={
          <>
            <MPButton variant="text">Preview</MPButton>
            <MPButton>Send now</MPButton>
          </>
        }
      >
        Forty-two people opened the last one, which is eleven more than the week before.
      </MPCard>

      <MPCard title="Filters" footer={<MPChip>Unread</MPChip>}>
        A card is a box with sections on it. Nothing else about it is special.
      </MPCard>
    </div>
  );
}
