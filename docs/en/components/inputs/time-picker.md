---
title: MPTimePicker
order: 4
---

# MPTimePicker

<p class="mp-lede">A time of day, chosen from columns. The bounds are checked at the granularity of the column being drawn, which is the detail that separates a working time picker from a frustrating one.</p>

<Demo src="time-picker/hero" :minHeight="96" />

::: fw react

```tsx
import { MPTimePicker } from 'material-plus-ui';

const [startsAt, setStartsAt] = useState(null);

<MPTimePicker label="Starts at" minuteStep={5} value={startsAt} onValueChange={setStartsAt} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTimePicker(
  label: const Text('Starts at'),
  minuteStep: 5,
  value: startsAt,
  onChanged: (DateTime? next) => setState(() => startsAt = next),
);
```

:::

## Props

<PropsTable name="MPTimePicker" />

## Why this is not MD3's dial

The specification's time picker is a clock face. This is not one, and it is the largest deliberate departure in this library — so the reason is worth stating plainly.

A dial is a **pointer control**. Reading it takes a glance at an analogue clock; setting it takes a drag. It has no keyboard path and no screen-reader path, which is exactly why MD3 also ships a separate _time input_ mode — two text fields — for those readers. That leaves a component with two implementations of the same question, of which the accessible one is the one nobody sees, and the two are reached by a toggle most applications never wire up.

Columns answer both readers with one control. "Half past nine" is two glances; "any time at all, on the hour" is a column you never touch. Every row is a real option that the arrow keys already reach, and the library's own size ladder, corners and state layers do the rest of the work of looking like Material.

## The bounds, at column granularity

<Demo src="time-picker/bounds" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/time-picker/bounds.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/time_picker/bounds.dart

:::

</Demo>

This is the detail. With a `minTime` of 09:30:

- The hour `9` **stays available**. The hour covers 09:00:00–09:59:59, which overlaps what is allowed — the hour _contains_ allowed minutes.
- The minute column is where `00` through `25` grey out.

The naive check compares the whole candidate instant, hides the 9 entirely, and makes half past nine unreachable. Each row is therefore checked against the **span of the day it stands for**, not against one instant inside it.

`shouldDisableTime` is handed the same pair — the instant that row would produce, and which column it is in — so a rule may be as coarse as "no afternoons" or as fine as one minute.

## Why the value is a `Date`

Rather than a string, or a number of minutes since midnight. In Flutter it is a `DateTime`, for the same reasons.

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

::: fw react

A hidden input in the shape `<input type="time">` submits — `HH:MM`, or `HH:MM:SS` when the seconds are shown. Local, not UTC.

:::

::: fw flutter

Files the value with the [MPForm](./form) around the picker in the shape `<input type="time">` submits: `HH:MM`, or `HH:MM:SS` when the seconds are shown. Local, not UTC.

:::

## Accessibility

::: fw react

- Each column is a `role="listbox"` with a name, because three unlabelled lists of numbers say nothing to a reader who is not looking at them.

:::

::: fw flutter

- Each column is a group with a name, and each row is named by its number and its column (`09 Hour`), because three unlabelled lists of numbers say nothing to a reader who is not looking at them. A column is one stop for `Tab`, and the arrow keys, `PageUp`/`PageDown` and `Home`/`End` move inside it.

:::

- Under them is a live region that reads the whole time back as one sentence — "9:30 AM" — which is the thing the three columns actually add up to.
- The chosen row in each column is scrolled into view once, on open. A column of sixty minutes that opened at `00` while the value was `45` would have hidden its own answer.
- A blocked row keeps its place and is announced as unavailable rather than removed, so the column does not renumber itself as the bounds change.

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange`, `defaultValue`, `defaultOpen` | `onChanged`, `initialValue`, `initialOpen` | Flutter's names. |
| `format` (`Intl.DateTimeFormatOptions`) | `format` (`String Function(DateTime)`) | There is no `Intl` to hand options to. |
| `hourStep`, `minuteStep`, `secondStep` as numbers | `int` | A step is a count of rows; it is held between 1 and the column's span in both. |
| `locale` deciding the dial through `Intl` | `locale` deciding it through the package's own tables, and `names` | `en` reads a 12-hour dial and `de` a 24-hour one in both. See [localisation on MPDatePicker](./date-picker#localisation). |
| the hidden input under `name` | `name` filing the value with an `MPForm` | Flutter has no native form; the string is the same. |
| `listbox` and `option` roles | a named group of buttons, each announced as selected or not | Flutter's semantics have no listbox role. |
| the raw DOM events, `id`, `className`, `style` | `onKeyEvent`, `onFocusChange`, `semanticLabel`, `focusNode`, `autofocus` | As on [MPDatePicker](./date-picker#differences-from-the-react-build). |

The rest is matched deliberately: the columns rather than a dial, the bounds at column granularity, the held reference day, the Done button and the reveal on open.

:::

## See also

- [MPDateTimePicker](./date-time-picker) — this clock beside a calendar, in one popup.
- [MPDatePicker](./date-picker) — the day on its own.
- [Localisation](../../design/localization) — what decides the dial and the column names.
