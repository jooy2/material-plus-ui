import { useState } from 'react';
import { MPDatePicker } from 'material-plus-ui';

/**
 * The trigger is a text field's shell wearing a calendar glyph, so a date field
 * in a form is the same object as the fields around it.
 *
 * Open it and press the month name, then the year: any month of the year on
 * screen is two clicks and any year at all is three. A picker that only stepped
 * a month at a time would put a birthday thirty years back a hundred and eighty
 * clicks away.
 */
export default function DatePickerHero() {
  const [due, setDue] = useState<Date | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 280 }}>
      <MPDatePicker
        label="Due date"
        placeholder="Pick a day"
        value={due}
        onValueChange={setDue}
        clearable
        fullWidth
      />
    </div>
  );
}
