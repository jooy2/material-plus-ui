import { useState } from 'react';
import { MPSegmentedButton, MPIcon, ICONS } from 'material-plus-ui';

/**
 * The same control, counting differently.
 *
 * `multiple` is a boolean rather than a second component, and the value stays an
 * array in both modes — which is why turning it on does not change anything a
 * caller has to narrow before reading.
 */
export default function SegmentedButtonMultiple() {
  const [days, setDays] = useState<string[]>(['mon', 'wed']);
  const [sort, setSort] = useState<string[]>(['asc']);

  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <MPSegmentedButton
        aria-label="Repeat on"
        multiple
        size="sm"
        value={days}
        onValueChange={setDays}
        items={[
          { value: 'mon', label: 'Mon' },
          { value: 'tue', label: 'Tue' },
          { value: 'wed', label: 'Wed' },
          { value: 'thu', label: 'Thu' },
          { value: 'fri', label: 'Fri' }
        ]}
      />

      <MPSegmentedButton
        aria-label="Sort order"
        showCheck={false}
        value={sort}
        onValueChange={setSort}
        items={[
          {
            value: 'asc',
            label: 'Ascending',
            icon: <MPIcon icon={ICONS['chevron-up']} size={20} />
          },
          {
            value: 'desc',
            label: 'Descending',
            icon: <MPIcon icon={ICONS['chevron-down']} size={20} />
          }
        ]}
      />

      <small className="text-mp-on-surface-variant">
        Repeating on <code>{days.join(', ') || 'nothing'}</code>.
      </small>
    </div>
  );
}
