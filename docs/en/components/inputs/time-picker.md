---
title: MPTimePicker
order: 4
---

# MPTimePicker

<p class="mp-lede">A time of day, chosen from columns. The bounds are checked at the granularity of the column being drawn, which is the detail that separates a working time picker from a frustrating one.</p>

<Demo src="time-picker/hero" :minHeight="96" />

```tsx
import { MPTimePicker } from 'material-plus-ui';

const [startsAt, setStartsAt] = useState(null);

<MPTimePicker label="Starts at" minuteStep={5} value={startsAt} onValueChange={setStartsAt} />;
```

## Props

<PropsTable name="MPTimePicker" />

## Why this is not MD3's dial

The specification's time picker is a clock face. This is not one, and it is the largest deliberate departure in this library — so the reason is worth stating plainly.

A dial is a **pointer control**. Reading it takes a glance at an analogue clock; setting it takes a drag. It has no keyboard path and no screen-reader path, which is exactly why MD3 also ships a separate _time input_ mode — two text fields — for those readers. That leaves a component with two implementations of the same question, of which the accessible one is the one nobody sees, and the two are reached by a toggle most applications never wire up.

Columns answer both readers with one control. "Half past nine" is two glances; "any time at all, on the hour" is a column you never touch. Every row is a real option in a real listbox that the arrow keys already reach, and the library's own size ladder, corners and state layers do the rest of the work of looking like Material.

## The bounds, at column granularity

<Demo src="time-picker/bounds" :minHeight="420">

<<< @/.vitepress/demos/time-picker/bounds.tsx

</Demo>

This is the detail. With a `minTime` of 09:30:

- The hour `9` **stays available**. The hour covers 09:00:00–09:59:59, which overlaps what is allowed — the hour _contains_ allowed minutes.
- The minute column is where `00` through `25` grey out.

The naive check compares the whole candidate instant, hides the 9 entirely, and makes half past nine unreachable. Each row is therefore checked against the **span of the day it stands for**, not against one instant inside it.

`shouldDisableTime` is handed the same pair — the instant that row would produce, and which column it is in — so a rule may be as coarse as "no afternoons" or as fine as one minute.

## Why the value is a `Date`

Rather than a string, or a number of minutes since midnight.

Everything else in this library that carries a moment is a `Date`, and a bare time has nowhere to record which day it is on — which is what decides whether it crossed a daylight-saving boundary. `referenceDate` is the day a chosen time is written onto while there is no value yet.

That reference day is **held still** for as long as the picker is mounted. A popup left open across midnight should not quietly move the value it is writing onto a new day.

## `closeOnSelect` is `false` here

Unlike [`MPDatePicker`](./date-picker), which closes as soon as a day is chosen.

A time is two answers. Closing after the first would make choosing 9:30 a matter of opening the popup twice. So the popup stays up, and there is a **Done** button — because a popup that stays open needs something to press that means "that is the one".

## Examples

### hour12

Defaults to whatever the locale does: `en-US` gets a 12-hour dial with an AM/PM column, `de-DE` gets a 24-hour one with no such column.

Setting it reaches the **trigger** as well as the columns. A picker whose dial is 24-hour and whose trigger still says "9:05 AM" is a control disagreeing with itself, and the caller who set `hour12` has already said which they meant. An explicit `format` still wins over both.

### The step props

`hourStep`, `minuteStep` and `secondStep` decide how far apart the rows of each column are. `minuteStep={5}` is the common one — a column of sixty minutes is a column nobody scrolls to the bottom of.

### showSeconds

Adds the seconds column, and adds the seconds to what the trigger writes and what the form submits.

### name

A hidden input in the shape `<input type="time">` submits — `HH:MM`, or `HH:MM:SS` when the seconds are shown. Local, not UTC.

## Accessibility

- Each column is a `role="listbox"` with a name, because three unlabelled lists of numbers say nothing to a reader who is not looking at them.
- Under them is a live region that reads the whole time back as one sentence — "9:30 AM" — which is the thing the three columns actually add up to.
- The chosen row in each column is scrolled into view once, on open. A column of sixty minutes that opened at `00` while the value was `45` would have hidden its own answer.
- A blocked row keeps its place and is marked `aria-disabled` rather than removed, so the column does not renumber itself as the bounds change.

## See also

- [MPDateTimePicker](./date-time-picker) — this clock beside a calendar, in one popup.
- [MPDatePicker](./date-picker) — the day on its own.
- [Localisation](../../design/localization) — what decides the dial and the column names.
