---
title: MPDatePicker
order: 2
---

# MPDatePicker

<p class="mp-lede">One day, chosen from a calendar. The trigger is a text field's shell wearing a calendar glyph, so a date field in a form is the same object as the fields around it.</p>

<Demo src="date-picker/hero" :minHeight="96" />

```tsx
import { MPDatePicker } from 'material-plus-ui';

const [due, setDue] = useState(null);

<MPDatePicker label="Due date" value={due} onValueChange={setDue} />;
```

## Props

<PropsTable name="MPDatePicker" />

## What the calendar is actually for

Its header.

A picker that only steps a month at a time puts a birthday thirty years back a hundred and eighty clicks away. So the month name and the year are each a **button** that opens a grid of its own — twelve months, then twelve years at a time. Any month of the year on screen is two clicks; any year at all is three.

The three views are deliberately the same width _and_ the same height. The day view is seven rows counting its header, and the other two stretch four rows and three rows across that same height, so switching view never resizes the popup under the pointer that opened it.

## No date library, and no typing

Two decisions that are really one.

**There is no date library under this.** The whole of the arithmetic is `Date`, and every name a picker draws comes from `Intl`. A component library that quietly added `date-fns` — or worse, picked a side in the dayjs/luxon/Temporal argument on its consumer's behalf — would have made a decision that was not its to make. This package still has one runtime dependency and it is an icon set.

**And you cannot type into the trigger.** Parsing a date out of free text is locale-dependent in a way that cannot be done honestly without one: `27/7/26` is three different days depending on who is reading it. A field that understands it in one browser and not the next is worse than one that never claimed to. So the trigger is a button, exactly as a [select](./select)'s is, and the calendar is where the answer comes from.

## Localisation

Everything that moves comes from the platform.

<Demo src="date-picker/locale" :minHeight="480">

<<< @/.vitepress/demos/date-picker/locale.tsx

</Demo>

`Intl` supplies the month names, the weekday initials, which day the week starts on (Sunday in the US and Korea, Monday across most of Europe), the order of the header's two buttons — `July 2026` against `2026년 7월` — and how the trigger writes the date. Getting that order wrong is subtle and reads as broken to exactly the readers it is wrong for, so it is asked for rather than guessed at.

The only strings this library supplies are the ones `Intl` has no opinion about: "Previous month", "Today", "Clear". Those are translated for eighteen languages, fall back to English for anything else, and are overridable one at a time with `labels`. The whole of it is on the [Localisation](../../design/localization) page.

## Bounds

<Demo src="date-picker/bounds" :minHeight="300">

<<< @/.vitepress/demos/date-picker/bounds.tsx

</Demo>

`minDate` and `maxDate` are **day-granular** here: a maximum of 27 July at 09:00 still leaves the 27th pickable, because the bound is about which days exist and the time of day is a clock's problem. [`MPDateTimePicker`](./date-time-picker) reads the same props at full precision, which is the one real difference between the two.

`shouldDisableDate` blocks whatever a rule says — weekends, holidays, a room already booked.

Every blocked day is still **drawn**, and none of them is a `disabled` button. A grid with holes in it is a grid a reader arrowing across a month falls into, and "this day does not exist" and "this day is not for you" are different claims.

## Examples

### The time of day survives a change of date

Choosing a day changes the day and nothing else. A picker bound to a field that also carries a time should not silently reset it to midnight every time the date is corrected:

```tsx
// value is 10 July at 14:30; choosing the 15th gives 15 July at 14:30.
<MPDatePicker value={value} onValueChange={setValue} />
```

### clearable

Offers the × in the trigger, and the word in the footer. It does not appear while the picker is empty, read only or disabled — there is nothing to clear.

### readOnly

Shows the value, stays in the tab order, and **does not open**. What a read-only picker holds is something to read, and a calendar whose every cell was inert would be a menu of nothing.

### name

Adds a hidden input, so the whole thing submits with a form:

```html
<input type="hidden" name="due" value="2026-07-15" />
```

Local, not UTC, and that is the whole point: `toISOString()` on a `Date` standing for 15 July in Seoul gives `2026-07-14T15:00:00Z`, and a form field that quietly reports the day before the one on screen is the single most expensive bug a date picker can ship. The shape is the one `<input type="date">` submits, so a server that already parses those needs no new code.

## Accessibility

- The trigger is a button named by the label in the notch, wired by `id`.
- The grid is `role="grid"` with one **roving tab stop**, which is the ARIA date-picker practice: `Tab` leaves the calendar instead of walking forty-two cells.
- Arrow keys move by a day, `Home`/`End` to the ends of the week, `PageUp`/`PageDown` by a month — with Shift, by a year. Running off an edge steps the calendar rather than stopping.
- Every cell is named as a whole date rather than as a bare number, so a reader hears "Wednesday, July 15, 2026" and not "15".
- Today is marked with an **outlined** circle rather than only with a fill, and the outline is a border so it can coexist with the focus ring.

## See also

- [MPDateRangePicker](./date-range-picker) — two days, and everything between them.
- [MPDateTimePicker](./date-time-picker) — a day and a time, in one popup.
- [MPTimePicker](./time-picker) — a time of day on its own.
- [Localisation](../../design/localization) — what `locale` reaches, and what it does not.
