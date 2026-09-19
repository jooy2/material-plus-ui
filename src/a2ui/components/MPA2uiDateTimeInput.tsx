/**
 * `DateTimeInput` — a date, a time, or both, through the matching picker.
 *
 * The protocol has one component with two switches where this library has three
 * controls, so the switches choose between them: both is `MPDateTimePicker`, time
 * alone is `MPTimePicker`, and a date is what is left. Both switches default to
 * `false` in the schema, which describes a control that offers nothing; an agent
 * that set neither wanted a day, so that is what it gets.
 *
 * Every picker here works in `Date` and the payload carries ISO 8601 strings, so
 * this is also where that conversion lives — see `internal/common.ts` for why it
 * is done by hand rather than by `new Date(value)`. The value is written back at
 * the precision that was asked for: a date picker stores `2026-03-01` and never a
 * midnight that a time zone can move to the day before.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DateTimeInputApi } from '@a2ui/web_core/v0_9';
import { MPDatePicker } from '../../components/date-picker/MPDatePicker';
import { MPDateTimePicker } from '../../components/date-time-picker/MPDateTimePicker';
import { MPTimePicker } from '../../components/time-picker/MPTimePicker';
import { formatIsoValue, parseIsoValue, weightStyle } from '../internal/common';

export const MPA2uiDateTimeInput = createComponentImplementation(DateTimeInputApi, ({ props }) => {
  const withTime = props.enableTime === true;
  /* A day unless a time was the only thing asked for. */
  const withDate = props.enableDate === true || !withTime;

  const value = parseIsoValue(typeof props.value === 'string' ? props.value : undefined);
  const min = parseIsoValue(typeof props.min === 'string' ? props.min : undefined);
  const max = parseIsoValue(typeof props.max === 'string' ? props.max : undefined);

  const shared = {
    label: props.label,
    errorMessage: props.validationErrors?.[0],
    style: weightStyle(props.weight)
  };
  const commit = (next: Date | null) =>
    props.setValue(formatIsoValue(next, { withDate, withTime }));

  if (withDate && withTime) {
    return (
      <MPDateTimePicker
        value={value}
        onValueChange={commit}
        minDate={min}
        maxDate={max}
        {...shared}
      />
    );
  }

  if (withTime) {
    return (
      <MPTimePicker value={value} onValueChange={commit} minTime={min} maxTime={max} {...shared} />
    );
  }

  return (
    <MPDatePicker value={value} onValueChange={commit} minDate={min} maxDate={max} {...shared} />
  );
});
