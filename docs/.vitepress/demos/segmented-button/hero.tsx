import { useState } from 'react';
import { MPSegmentedButton } from 'material-plus-ui';

const VIEWS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

export default function SegmentedButtonHero() {
  const [view, setView] = useState<string[]>(['week']);

  return (
    <MPSegmentedButton
      items={VIEWS}
      value={view}
      onValueChange={setView}
      aria-label="Calendar view"
    />
  );
}
