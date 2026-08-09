import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

export default function TimelineHero() {
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <MPTimeline active={2}>
        <MPTimelineItem title="Ordered" meta="9 Aug, 09:14" bullet="1">
          Payment authorised.
        </MPTimelineItem>
        <MPTimelineItem title="Packed" meta="9 Aug, 15:02" bullet="2">
          Left the warehouse in Incheon.
        </MPTimelineItem>
        <MPTimelineItem title="In transit" meta="Now" bullet="3">
          Out for delivery, arriving today.
        </MPTimelineItem>
        <MPTimelineItem title="Delivered" bullet="4" connector="dashed" />
      </MPTimeline>
    </div>
  );
}
