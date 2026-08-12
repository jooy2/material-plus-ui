import { useState } from 'react';
import { MPTimePicker } from 'material-plus-ui';

/**
 * Columns you scroll rather than a dial you drag.
 *
 * "Half past nine" is two glances, and every row is a real option in a real
 * listbox that the arrow keys already reach — which is what a clock face cannot
 * offer without a second, hidden implementation beside it.
 *
 * The popup does not close on the first column, because a time is two answers.
 */
export default function TimePickerHero() {
  const [startsAt, setStartsAt] = useState<Date | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 260 }}>
      <MPTimePicker
        label="Starts at"
        placeholder="Pick a time"
        minuteStep={5}
        value={startsAt}
        onValueChange={setStartsAt}
        clearable
        fullWidth
      />
    </div>
  );
}
