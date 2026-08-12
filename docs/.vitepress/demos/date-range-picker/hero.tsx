import { useState } from 'react';
import { MPDateRangePicker } from 'material-plus-ui';
import type { MPDateRange } from 'material-plus-ui';

/**
 * Two months side by side, because a range that crosses a month boundary is the
 * ordinary case rather than the exception.
 *
 * Click once and move the pointer: the band is drawn before the second click
 * lands. Without that preview the first click has no visible consequence, and
 * the control looks broken for the second or so between the two.
 */
const day = (offset: number) => {
  const date = new Date();

  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);

  return date;
};

export default function DateRangePickerHero() {
  const [stay, setStay] = useState<MPDateRange>({ start: null, end: null });

  return (
    <div style={{ width: '100%', maxWidth: 340 }}>
      <MPDateRangePicker
        label="Stay"
        startPlaceholder="Check in"
        endPlaceholder="Check out"
        value={stay}
        onValueChange={setStay}
        presets={[
          { label: 'This week', value: () => ({ start: day(0), end: day(6) }) },
          { label: 'Next 14 days', value: () => ({ start: day(0), end: day(13) }) },
          { label: 'Next 30 days', value: () => ({ start: day(0), end: day(29) }) }
        ]}
        clearable
        fullWidth
      />
    </div>
  );
}
