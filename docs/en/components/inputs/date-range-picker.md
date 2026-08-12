---
title: MPDateRangePicker
order: 3
---

# MPDateRangePicker

<p class="mp-lede">A span between two days. Two months side by side, because a range that crosses a month boundary is the ordinary case and a one-month picker makes it a navigation problem.</p>

<Demo src="date-range-picker/hero" :minHeight="120" />

```tsx
import { MPDateRangePicker } from 'material-plus-ui';

const [stay, setStay] = useState({ start: null, end: null });

<MPDateRangePicker
  label="Stay"
  startPlaceholder="Check in"
  endPlaceholder="Check out"
  value={stay}
  onValueChange={setStay}
/>;
```

## Props

<PropsTable name="MPDateRangePicker" />

## Why the value is an object

`{ start, end }`, rather than a `[Date, Date]` tuple and rather than two props.

A range is **one value**. It is chosen in one gesture, cleared in one gesture and validated as a whole, and the two names are what stop a caller writing the end into the start — a tuple's two slots are told apart only by an index.

Half a range is a real state: it is what the picker holds between the first click and the second. That is why `onValueChange` is always called with an object and never with `null`. A cleared range is `{ start: null, end: null }`, so a caller never has to test two different shapes for "empty".

The half-chosen state does _not_ reach a controlled parent, though. The first click is held inside the component, and the parent is handed `{ start, end: null }` — a form's business is a range, and an abandoned half-selection does not survive the popup closing.

## The preview is the affordance

Click once and move the pointer: the band is drawn between the anchor and whatever the pointer is over, before the second click lands.

Without it the first click has no visible consequence at all, and the control looks broken for the second or so between the two. It is the single most important thing a range picker draws.

Clicking backwards is not a mistake to be rejected. It is the same range typed in the other order, and it is normalised.

## The two panels are one calendar

The left one has no forward stepper, the right one has no back stepper, and either header's month and year buttons move **both**. A missing stepper leaves a hole the size of the button that is not there, so the two headings stay on the same centre line.

The panels also draw no leading or trailing days, which is the one place a range picker differs from a single one. With both showing six full weeks, the 1st of August would be a trailing day of the July panel _and_ the first day of the August one — two cells with the same name in one popup, ambiguous to a pointer and outright broken to a screen reader.

## How the band is coloured

The two ends are the accent proper; the days between them are the accent's **container** tone under its own ink.

That is the same pair MD3 uses for a selected range, and it is what keeps the ends distinguishable from the middle: a band drawn in the accent would make a nine-day range look like nine separately chosen days. The band is square through the middle of a run and rounded only where the run stops, so a week of banded days reads as one shape rather than as seven tokens.

## Examples

### presets

Shortcuts beside the calendars — the thing an analytics filter is actually asked for:

```tsx
presets={[
  { label: 'Last 7 days', value: () => ({ start: daysAgo(6), end: today() }) },
  { label: 'This month', value: () => ({ start: startOfMonth(), end: today() }) }
]}
```

Pass a **function** whenever the range depends on today, which is almost always. "The last 7 days" computed once at module scope is a range that would be wrong for anyone who left the tab open overnight.

### monthCount

`2` by default. Drop to `1` for a narrow layout or for a range that is nearly always inside one month:

```tsx
<MPDateRangePicker monthCount={1} />
```

With one panel the right-hand stepper comes back, because there is no second panel for it to conflict with.

### The trigger's two halves

Neither half is `flex-1`. Two equal halves would size the trigger to twice the _shorter_ of the two, which truncates a date next to a word like "Check out"; letting each take its own width sizes the control to what it actually has to say. Each half is separately held open at the width of the longest date it could show, so neither end jumps as the range is filled in.

### name

Two hidden inputs of the same name, so the two ends arrive together:

```js
const [start, end] = formData.getAll('stay');
```

Both are local `YYYY-MM-DD`, for the reason [`MPDatePicker`](./date-picker) gives.

## Accessibility

- Both calendars are grids with their own roving tab stop, and the whole keyboard vocabulary of the single picker works in each.
- The footer says which end the next click will fill. The trigger says the same thing with its two halves, but the trigger is _behind the popup_ while the popup is up — so the footer is the only place that can say it where it will be read.
- The band is not carried by colour alone: the two ends are `aria-selected`, and every cell is named as a whole date.

## See also

- [MPDatePicker](./date-picker) — one day, and the shared calendar behaviour in full.
- [Localisation](../../design/localization) — what `locale` reaches.
