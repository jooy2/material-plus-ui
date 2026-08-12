import { useState } from 'react';
import { MPDateTimePicker } from 'material-plus-ui';

/**
 * A calendar and a clock in one popup, at exactly the same height.
 *
 * They share the `--_mp-cell` ladder — seven rows of cells each — so the popup
 * is one rectangle rather than two of different sizes pushed together.
 *
 * `minDate` is read at full precision here, unlike on `MPDatePicker`: nothing
 * before this moment can be chosen, which leaves today selectable in the
 * calendar and greys out the hours that have already gone.
 */
export default function DateTimePickerHero() {
  const [starts, setStarts] = useState<Date | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <MPDateTimePicker
        label="Starts"
        placeholder="Pick a moment"
        minDate={new Date()}
        minuteStep={15}
        value={starts}
        onValueChange={setStarts}
        clearable
        fullWidth
      />
    </div>
  );
}
