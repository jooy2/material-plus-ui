import { useState } from 'react';
import { MPDatePicker } from 'material-plus-ui';

/**
 * The three ways a day can be unavailable, and one thing they have in common:
 * every blocked day is still *drawn*.
 *
 * A grid with holes in it is a grid a reader arrowing across a month falls into,
 * and "this day does not exist" and "this day is not for you" are different
 * claims. So a blocked cell keeps its place, keeps its name, and loses only the
 * ability to be chosen.
 */
const today = new Date();
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function DatePickerBounds() {
  const [soon, setSoon] = useState<Date | null>(null);
  const [weekday, setWeekday] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 300 }}>
      <MPDatePicker
        label="Within the next fortnight"
        description="minDate and maxDate, day-granular."
        minDate={startOfDay(today)}
        maxDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)}
        value={soon}
        onValueChange={setSoon}
        fullWidth
      />
      <MPDatePicker
        label="A working day"
        errorMessage={weekday ? undefined : 'Pick a weekday to continue.'}
        shouldDisableDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        value={weekday}
        onValueChange={setWeekday}
        required
        fullWidth
      />
    </div>
  );
}
