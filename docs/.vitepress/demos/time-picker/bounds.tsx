import { useState } from 'react';
import { MPTimePicker } from 'material-plus-ui';

/**
 * The detail that separates a working time picker from a frustrating one.
 *
 * With a minimum of 09:30, the hour `9` stays available — the hour *contains*
 * allowed minutes — and it is the minute column that greys out `00` through
 * `25`. The naive check compares the whole candidate instant, hides the 9
 * entirely, and makes half past nine unreachable.
 *
 * Open it and look at the two columns together.
 */
const at = (hours: number, minutes: number) => {
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date;
};

export default function TimePickerBounds() {
  const [value, setValue] = useState<Date | null>(at(9, 0));

  return (
    <div style={{ width: '100%', maxWidth: 280 }}>
      <MPTimePicker
        label="Appointment"
        description="Between 09:30 and 17:00."
        minTime={at(9, 30)}
        maxTime={at(17, 0)}
        value={value}
        onValueChange={setValue}
        defaultOpen
        fullWidth
      />
    </div>
  );
}
