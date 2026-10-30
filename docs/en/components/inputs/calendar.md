---
title: MPCalendar
order: 1
---

# MPCalendar

<p class="mp-lede">A month on the page, rather than in a popup. The same grid <code>MPDatePicker</code> opens, with nothing in front of it.</p>

<Demo src="calendar/hero" :minHeight="360" />

::: fw react

```tsx
import { MPCalendar } from 'material-plus-ui';

const [day, setDay] = useState(new Date());

<MPCalendar value={day} onValueChange={setDay} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCalendar(
  value: day,
  onChanged: (DateTime next) => setState(() => day = next),
);
```

:::

## Props

<PropsTable name="MPCalendar" />

## Why it is its own component

The calendar was always the larger half of `MPDatePicker`: three views on one footprint, a roving tab stop, arrow keys that step the month when they run off an edge, and a header where the month name and the year are each a button into a grid of their own. What it did not have was a way to be used **without a trigger in front of it**.

Which is a real shape. A booking page shows the month it is talking about rather than asking the reader to open something to see it. A dashboard puts the calendar beside the list it filters. A form with room for it has no reason to hide it behind a field. In every one of those the popup is the part that is in the way.

Everything the picker's calendar does, this one does — see [MPDatePicker](./date-picker.md#what-the-calendar-is-actually-for) for the header, the page-turn and the keyboard, which are written up there and not repeated here.

## It paints nothing by default

`variant` is `'text'`, which paints no surface at all.

<Demo src="calendar/surface" :minHeight="380">

::: fw react

<<< @/.vitepress/demos/calendar/surface.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/calendar/surface.dart

:::

</Demo>

That is the default because a standalone calendar almost always lands somewhere that is **already a surface** — an `MPCard`, a panel, a popover of your own. A default that painted a second one would be a box inside a box in the common case, and the only way back out of a painted surface is an override.

The room follows the surface: a `text` calendar has no padding either, because a bare grid has to line up with whatever it was dropped beside. The other four take the same padding ladder the picker's popup takes, so a calendar standing on its own and the identical calendar inside a picker are not one track apart.

## The month on screen is its own state

And it stays where the reader left it.

`MPDatePicker` puts the calendar back on the chosen day every time its popup opens, because opening is an event that says _start again_. A calendar that is always on screen has no such moment, and one that snapped back to July while somebody was reading September would be undoing a navigation they meant.

`month` and `onMonthChange` are there for the cases that do want to drive it — two calendars kept a month apart, a "jump to December" button of your own:

::: fw react

```tsx
const [month, setMonth] = useState(new Date());

<MPCalendar month={month} onMonthChange={setMonth} />;
```

:::

::: fw flutter

```dart
MPCalendar(
  month: month,
  onMonthChange: (DateTime next) => setState(() => month = next),
);
```

:::

## Choosing never clears

::: fw react

`onValueChange` hands over a `Date` and never `null`, which is the one place its signature differs from `MPDatePicker`'s.

:::

::: fw flutter

`onChanged` hands over a `DateTime` and never `null`, which is the one place its signature differs from `MPDatePicker`'s.

:::

There is no × on a calendar, and pressing the chosen day a second time does not unchoose it. A control that emptied itself on a second press would lose a value to a double-click — and unlike a picker, whose trigger has somewhere to put a clear affordance, a calendar that wanted to offer one would have to grow a footer.

To clear it, set `value` to `null` from outside.

## Bounds are marked, not removed

`minDate`, `maxDate` and `shouldDisableDate` grey a day out and leave it in the grid.

<Demo src="calendar/booking" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/calendar/booking.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/calendar/booking.dart

:::

</Demo>

A grid with holes in it is a grid a reader arrowing across a month falls into, so a blocked cell keeps its place and its name and simply refuses. `shouldDisableDate` is asked about **days and only days**: a calendar whose `precision` is a month or a year never calls it, because a rule written about weekends has no answer for "is July available", and inventing one out of the 1st would block whichever months happened to start on a Sunday.

## A day, a month, or a year

`precision` decides which of the three views the calendar stops at, exactly as it does on the picker:

::: fw react

```tsx
<MPCalendar precision="month" onValueChange={setBillingMonth} />
```

:::

::: fw flutter

```dart
MPCalendar(
  precision: MPDatePrecision.month,
  onChanged: (DateTime next) => setState(() => billingMonth = next),
)
```

:::

A `month` calendar opens on the twelve months and has no day grid to reach through; a `year` calendar opens on the years. The answer is trimmed to the unit that was asked for — the 1st of the month, or 1 January — so a value that says _July 2026_ is not secretly the 31st.

## In a form

::: fw react

`name` renders a hidden input carrying the **local** day as `YYYY-MM-DD`, following `precision` down to `YYYY-MM` or `YYYY`:

```tsx
<form action="/book">
  <MPCalendar name="day" defaultValue={new Date()} />
</form>
```

:::

::: fw flutter

`name` files the **local** day with the [MPForm](./form) around the calendar as `YYYY-MM-DD`, following `precision` down to `YYYY-MM` or `YYYY`:

```dart
MPForm(
  onSubmit: (Map<String, Object?> values) => book(values['day']),
  children: <Widget>[MPCalendar(name: 'day', initialValue: DateTime.now())],
)
```

:::

Local rather than UTC, for the reason the whole library treats a calendar day as local: 15 July in Seoul is the 14th in `toISOString()`, and a form that submitted the day before the one on screen would be wrong in exactly half the world. Without a `name` the calendar is not part of the form at all.

## Sharp edges

- **It does not take the focus on mount**, and `autoFocus` (`autofocus` in Flutter) is `false` — the opposite of the calendar inside a picker. One that grabbed the focus would move the caret out of whatever was being typed above it.
- **It is not a range calendar.** Two ends is [MPDateRangePicker](./date-range-picker.md)'s question: the band drawn between them needs a preview of the half-chosen range that a single value has no room for.
- **It is not an event calendar.** There is no per-cell rendering hook, because a cell that could hold arbitrary content stops being a 40dp target and starts being a layout.
- **The grid has one tab stop.** `Tab` leaves the calendar rather than walking forty-two cells; the arrow keys are how you move inside it.

::: fw react

- **On a server-rendered page, today is marked after hydration.** The server's clock is not the reader's, and for some hours around every midnight the two are on different days, so the markup marks no day and the reader's own today is marked once the page has hydrated. The month it opens on still comes from the clock where it renders; near the end of a month, pass `defaultMonth` from the request so the server and the browser open on the same one.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onMonthChange` keeps its name. |
| `defaultValue` | `initialValue` | Flutter's name. A `value` the parent changes, `null` included, replaces whatever the calendar held; left out, the calendar keeps its own. |
| `autoFocus` | `autofocus` | Flutter's name. |
| `locale` reaching `Intl` | `locale` reaching the package's own tables, and `names` | The framework has no `Intl`. See [localisation on MPDatePicker](./date-picker#localisation). |
| `weekStartsOn: 0`–`6` | `weekStartsOn: MPWeekday` | Dart's own numbering. |
| the hidden input under `name` | `name` filing the value with an `MPForm` | Flutter has no native form; the string is the same. |
| `id`, `className`, `style` | — | There is nothing to pass them through to. |
| today marked after hydration | today read from the device's clock on every build | A Flutter app has no server render to disagree with. |

The rest is matched deliberately: the three views, the page turn, the roving tab stop, the precision rules, the bounds, and the surface ladder.

:::

## Next

- [MPDatePicker](./date-picker.md) — the same calendar behind a field.
- [Localisation](../../design/localization.md) — where the month names come from.
