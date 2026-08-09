import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

export default function TimelineHorizontal() {
  return (
    <div style={{ width: '100%' }}>
      <MPTimeline orientation="horizontal" size="sm" active={1}>
        <MPTimelineItem title="Cart" bullet="1" />
        <MPTimelineItem title="Address" bullet="2" />
        <MPTimelineItem title="Payment" bullet="3" />
      </MPTimeline>
    </div>
  );
}
