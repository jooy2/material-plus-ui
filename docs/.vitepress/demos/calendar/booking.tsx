import { useState } from 'react';
import { MPCalendar, MPTypography } from 'material-plus-ui';

/**
 * The shape the component exists for: a page that shows the month it is talking
 * about instead of asking the reader to open something to see it.
 *
 * `minDate` closes the past and `shouldDisableDate` closes the Sundays. Both are
 * *marked* rather than removed — a grid with holes in it is a grid a reader
 * arrowing across a month falls into.
 */
export default function CalendarBooking() {
  const [day, setDay] = useState<Date | null>(null);

  const closed = (date: Date) => date.getDay() === 0;

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <MPCalendar
        variant="outlined"
        value={day}
        onValueChange={setDay}
        minDate={new Date()}
        shouldDisableDate={closed}
      />
      <MPTypography level="caption">
        {day ? `Booked for ${day.toLocaleDateString()}` : 'Closed on Sundays. Pick a day.'}
      </MPTypography>
    </div>
  );
}
