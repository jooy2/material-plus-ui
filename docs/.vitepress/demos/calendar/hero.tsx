import { useState } from 'react';
import { MPCalendar } from 'material-plus-ui';

/**
 * The grid `MPDatePicker` opens, with nothing in front of it.
 *
 * Press the month name or the year: any month of the year on screen is two
 * clicks and any year at all is three. The arrow keys move a cell at a time and
 * step the month when they run off an edge, and `Tab` leaves the grid rather
 * than walking forty-two cells.
 */
export default function CalendarHero() {
  const [day, setDay] = useState<Date | null>(new Date());

  return <MPCalendar value={day} onValueChange={setDay} />;
}
