import {
  MPButton,
  MPCard,
  MPFlex,
  MPList,
  MPListItem,
  MPMockup,
  MPTypography
} from 'material-plus-ui';

const ROWS = ['Inbox', 'Starred', 'Snoozed', 'Sent', 'Drafts', 'Spam'];

/** A real page inside each frame, laid out against the device's own resolution. */
function Screen() {
  return (
    <MPFlex direction="column" gap={16} style={{ padding: 16 }}>
      <MPTypography level="h4">Today</MPTypography>
      <MPCard
        title="Deploy"
        media={
          <img
            src="/samples/photos/thumbs/lakeside-observatory-blue-hour.webp"
            alt="A small observatory beside a lake at dusk"
            style={{ display: 'block', width: '100%', height: 72, objectFit: 'cover' }}
          />
        }
        footer={<MPButton variant="filled">Run</MPButton>}
      >
        <MPTypography level="caption">Six commits since the last release.</MPTypography>
      </MPCard>
      <MPList dividers>
        {ROWS.map((row) => (
          <MPListItem key={row}>{row}</MPListItem>
        ))}
      </MPList>
    </MPFlex>
  );
}

export default function MockupHero() {
  return (
    <MPFlex gap={24} align="end" wrap>
      <MPMockup device="mobile" width={200}>
        <Screen />
      </MPMockup>

      <MPMockup device="tablet" width={260} finish="silver">
        <Screen />
      </MPMockup>

      <MPMockup device="desktop" hardware="laptop" width={380} finish="white">
        <Screen />
      </MPMockup>
    </MPFlex>
  );
}
