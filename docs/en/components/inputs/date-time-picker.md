---
title: MPDateTimePicker
order: 5
---

# MPDateTimePicker

<p class="mp-lede">A day and a time, in one popup. Not a date picker that grew a clock — the two panels sit side by side at exactly the same height, so the popup is one rectangle rather than two of different sizes pushed together.</p>

<Demo src="date-time-picker/hero" :minHeight="120" />

```tsx
import { MPDateTimePicker } from 'material-plus-ui';

const [starts, setStarts] = useState(null);

<MPDateTimePicker
  label="Starts"
  minDate={new Date()}
  minuteStep={15}
  value={starts}
  onValueChange={setStarts}
/>;
```

## Props

<PropsTable name="MPDateTimePicker" />

## Why the two panels are the same height

Because the calendar's grid and the clock's columns share one ladder.

A day cell is 40px at `md`, the day view is seven rows counting its header, and each clock column is drawn `7 × cell` tall against the same number. Nothing here measures anything at runtime: both read the same `--_mp-cell` length, so a popup holding both is a rectangle.

That is worth the coordination. Two panels of different heights pushed together is the single most common way a combined picker looks assembled.

## The bounds do more work here

This is the one real difference from [`MPDatePicker`](./date-picker), and it is a difference in the props' _meaning_ rather than in their names.

`minDate` and `maxDate` are read at **full precision**. A minimum of 09:30 on the 15th:

- leaves the 15th **selectable** in the calendar, because part of that day is allowed;
- **greys out the morning** in the clock, hour by hour and then minute by minute.

A day-granular check cannot express that — it would have to either block the whole 15th or allow all of it. This is what a "not before now" rule actually needs, and it is why the two components read the same props differently rather than sharing one behaviour that would be wrong for one of them.

`shouldDisableDate` and `shouldDisableTime` are both available, and each is handed exactly what it needs: a day, or an instant and the column it came from.

## The order does not matter

Choosing a day changes the day. Choosing an hour changes the hour. Neither resets the other.

A picker that reset the time to midnight every time the date was corrected would make choosing a moment an **ordered task**, and nobody reads a popup in the order it was written. With no day chosen yet the clock writes onto today, and picking a day afterwards keeps whatever time was already set.

That is also why `closeOnSelect` is `false` here and `true` on the date picker: a moment is a day _and_ a time, and closing on the first of the two would leave the second unanswered. There is a **Done** button instead.

## Examples

### The trigger wears one glyph

The calendar, not both. A control cannot say two things at once, and the date is the part a reader scans for.

### format

Defaults to `{ dateStyle: 'medium', timeStyle: 'short' }` with `hour12` folded in, so the trigger agrees with the dial the columns are drawn on. Anything `Intl` accepts works:

```tsx
<MPDateTimePicker format={{ dateStyle: 'full', timeStyle: 'medium' }} />
```

### name

A hidden input in the shape `<input type="datetime-local">` submits:

```html
<input type="hidden" name="starts" value="2026-07-15T09:05" />
```

Local, not UTC. `toISOString()` on a `Date` standing for 15 July 09:05 in Seoul gives `2026-07-15T00:05:00Z` — the right instant, written in a way a form's reader will get wrong.

## Accessibility

Everything the two halves have on their own, unchanged: the calendar's roving tab stop and full keyboard vocabulary, the clock's named listboxes and its live region reading the time back as one sentence. The divider between them is decorative and hidden.

## See also

- [MPDatePicker](./date-picker) — the calendar half, and the shared behaviour in full.
- [MPTimePicker](./time-picker) — the clock half, and why it is columns rather than a dial.
- [Localisation](../../design/localization) — what `locale` decides here.
