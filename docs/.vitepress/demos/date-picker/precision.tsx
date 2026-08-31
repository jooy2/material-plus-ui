import { useState } from 'react';
import { MPDatePicker } from 'material-plus-ui';

/**
 * The same control asking for three different units.
 *
 * `precision` does not hide the finer views so much as leave them out: the month
 * picker opens on the twelve months and has no day grid to reach through, and
 * the year picker opens on the years. What follows it is everything downstream —
 * how the trigger writes the value, what a form submits, and whether the
 * footer's shortcut says *Today*, *This month* or *This year*.
 */
export default function DatePickerPrecision() {
  const [day, setDay] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [year, setYear] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 300 }}>
      <MPDatePicker
        label="Due date"
        description="precision='day' — the default."
        value={day}
        onValueChange={setDay}
        fullWidth
      />
      <MPDatePicker
        label="Billing month"
        description="precision='month' — answers with the 1st."
        precision="month"
        value={month}
        onValueChange={setMonth}
        fullWidth
      />
      <MPDatePicker
        label="Fiscal year"
        description="precision='year' — answers with 1 January."
        precision="year"
        value={year}
        onValueChange={setYear}
        fullWidth
      />
    </div>
  );
}
